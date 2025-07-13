import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  'policy-expiry-reminder': (data: any) => ({
    subject: `Policy Expiry Reminder - ${data.productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Policy Expiry Reminder</h2>
        <p>Dear ${data.customerName},</p>
        <p>This is a friendly reminder that your insurance policy is expiring soon.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #e74c3c; margin-top: 0;">Policy Details</h3>
          <p><strong>Policy Number:</strong> ${data.policyNumber}</p>
          <p><strong>Product:</strong> ${data.productName}</p>
          <p><strong>Expiry Date:</strong> ${data.expiryDate}</p>
          <p><strong>Agency:</strong> ${data.agencyName}</p>
        </div>
        
        <p>Please contact your sales agent to renew your policy:</p>
        <p><strong>${data.salesAgentName}</strong><br>
        Email: ${data.salesAgentEmail}<br>
        Phone: ${data.salesAgentPhone}</p>
        
        <p>Thank you for choosing ${data.agencyName}.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #7f8c8d;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  'agent-policy-expiry-notification': (data: any) => ({
    subject: `Customer Policy Expiring Soon - ${data.customerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Policy Expiry Notification</h2>
        <p>Hello,</p>
        <p>One of your customer's policies is expiring soon and requires attention.</p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">Customer & Policy Details</h3>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Email:</strong> ${data.customerEmail}</p>
          <p><strong>Phone:</strong> ${data.customerPhone}</p>
          <p><strong>Policy Number:</strong> ${data.policyNumber}</p>
          <p><strong>Product:</strong> ${data.productName}</p>
          <p><strong>Expiry Date:</strong> ${data.expiryDate}</p>
          <p><strong>Days Until Expiry:</strong> ${data.daysUntilExpiry}</p>
        </div>
        
        <p>Please contact the customer to discuss renewal options.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #7f8c8d;">
          This is an automated notification from the Insurance CRM system.
        </p>
      </div>
    `
  }),

  'welcome-email': (data: any) => ({
    subject: `Welcome to ${data.agencyName} - Insurance CRM`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to ${data.agencyName}</h2>
        <p>Hello ${data.userName},</p>
        <p>Welcome to our Insurance CRM system! Your account has been successfully created.</p>
        
        <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #155724; margin-top: 0;">Account Details</h3>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Role:</strong> ${data.role}</p>
          <p><strong>Agency:</strong> ${data.agencyName}</p>
        </div>
        
        <p>You can now log in to the system and start managing your insurance operations.</p>
        
        <p>If you have any questions, please contact your system administrator.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #7f8c8d;">
          This is an automated welcome message from the Insurance CRM system.
        </p>
      </div>
    `
  }),

  'password-reset': (data: any) => ({
    subject: 'Password Reset Request - Insurance CRM',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>Hello ${data.userName},</p>
        <p>We received a request to reset your password for the Insurance CRM system.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p>Click the button below to reset your password:</p>
          <a href="${data.resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #7f8c8d;">
          This is an automated message from the Insurance CRM system.
        </p>
      </div>
    `
  })
};

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const template = emailTemplates[emailData.template as keyof typeof emailTemplates];
    
    if (!template) {
      throw new Error(`Email template '${emailData.template}' not found`);
    }

    const emailContent = template(emailData.data);

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: emailData.to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendBulkEmail = async (emails: EmailData[]): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const email of emails) {
    const result = await sendEmail(email);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
};

export const testEmailConnection = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email service connection verified');
    return true;
  } catch (error) {
    console.error('Email service connection failed:', error);
    return false;
  }
}; 