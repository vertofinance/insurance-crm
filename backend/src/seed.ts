import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test agency
  const agency = await prisma.agency.upsert({
    where: { code: 'TEST001' },
    update: {},
    create: {
      name: 'Test Insurance Agency',
      code: 'TEST001',
      address: '123 Test Street, Test City',
      phone: '+1234567890',
      email: 'contact@testagency.com',
      website: 'https://testagency.com',
      isActive: true
    }
  });

  console.log('✅ Agency created:', agency.name);

  // Create a test admin user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@insurance.com' },
    update: {},
    create: {
      email: 'admin@insurance.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      role: 'AGENCY_MANAGER',
      agencyId: agency.id,
      isActive: true
    }
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create a test sales agent
  const salesAgent = await prisma.user.upsert({
    where: { email: 'agent@insurance.com' },
    update: {},
    create: {
      email: 'agent@insurance.com',
      password: hashedPassword,
      firstName: 'Sales',
      lastName: 'Agent',
      phone: '+1234567891',
      role: 'SALES_AGENT',
      agencyId: agency.id,
      isActive: true
    }
  });

  console.log('✅ Sales agent created:', salesAgent.email);

  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin: admin@insurance.com / password123');
  console.log('Agent: agent@insurance.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 