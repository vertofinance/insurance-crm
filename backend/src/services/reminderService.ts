import cron from 'node-cron';
import { prisma } from './database';
import { sendEmail } from './emailService';

export const initializeReminders = async () => {
  // Schedule daily reminder check at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily policy expiry reminder check...');
    await checkPolicyExpiryReminders();
  });

  // Schedule weekly reminder check on Mondays at 8 AM
  cron.schedule('0 8 * * 1', async () => {
    console.log('Running weekly policy expiry reminder check...');
    await checkPolicyExpiryReminders();
  });

  console.log('✅ Reminder service initialized');
};

export const checkPolicyExpiryReminders = async () => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Find policies expiring in 30 days that don't have reminders sent
    const expiringPolicies = await prisma.policy.findMany({
      where: {
        endDate: {
          lte: thirtyDaysFromNow,
          gte: new Date() // Not already expired
        },
        status: 'ACTIVE',
        reminders: {
          none: {
            isSent: true
          }
        }
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        salesAgent: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        product: {
          select: {
            name: true
          }
        },
        agency: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`Found ${expiringPolicies.length} policies expiring soon`);

    for (const policy of expiringPolicies) {
      await sendPolicyExpiryReminder(policy);
    }
  } catch (error) {
    console.error('Error checking policy expiry reminders:', error);
  }
};

export const sendPolicyExpiryReminder = async (policy: any) => {
  try {
    const reminderDate = new Date();
    reminderDate.setDate(policy.endDate.getDate() - 30);

    // Create reminder record
    const reminder = await prisma.policyReminder.create({
      data: {
        policyId: policy.id,
        reminderDate,
        isSent: false
      }
    });

    // Send email to customer
    if (policy.customer.email) {
      await sendEmail({
        to: policy.customer.email,
        subject: `Policy Expiry Reminder - ${policy.product.name}`,
        template: 'policy-expiry-reminder',
        data: {
          customerName: `${policy.customer.firstName} ${policy.customer.lastName}`,
          policyNumber: policy.policyNumber,
          productName: policy.product.name,
          expiryDate: policy.endDate.toLocaleDateString(),
          agencyName: policy.agency.name,
          salesAgentName: `${policy.salesAgent.firstName} ${policy.salesAgent.lastName}`,
          salesAgentEmail: policy.salesAgent.email,
          salesAgentPhone: policy.salesAgent.phone
        }
      });
    }

    // Send notification to sales agent
    if (policy.salesAgent.email) {
      await sendEmail({
        to: policy.salesAgent.email,
        subject: `Customer Policy Expiring Soon - ${policy.customer.firstName} ${policy.customer.lastName}`,
        template: 'agent-policy-expiry-notification',
        data: {
          customerName: `${policy.customer.firstName} ${policy.customer.lastName}`,
          customerEmail: policy.customer.email,
          customerPhone: policy.customer.phone,
          policyNumber: policy.policyNumber,
          productName: policy.product.name,
          expiryDate: policy.endDate.toLocaleDateString(),
          daysUntilExpiry: Math.ceil((policy.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        }
      });
    }

    // Mark reminder as sent
    await prisma.policyReminder.update({
      where: { id: reminder.id },
      data: { 
        isSent: true,
        sentAt: new Date()
      }
    });

    console.log(`Reminder sent for policy ${policy.policyNumber}`);
  } catch (error) {
    console.error(`Error sending reminder for policy ${policy.policyNumber}:`, error);
  }
};

export const createManualReminder = async (policyId: string, reminderDate: Date) => {
  try {
    const reminder = await prisma.policyReminder.create({
      data: {
        policyId,
        reminderDate,
        isSent: false
      }
    });

    return reminder;
  } catch (error) {
    console.error('Error creating manual reminder:', error);
    throw error;
  }
};

export const getPolicyReminders = async (policyId: string) => {
  try {
    const reminders = await prisma.policyReminder.findMany({
      where: { policyId },
      orderBy: { reminderDate: 'desc' }
    });

    return reminders;
  } catch (error) {
    console.error('Error getting policy reminders:', error);
    throw error;
  }
}; 