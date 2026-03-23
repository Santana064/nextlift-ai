const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Delete existing demo user if exists
    await prisma.user.deleteMany({
      where: { email: 'demo@nextlift.com' }
    });

    // Create new demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'demo@nextlift.com',
        password: hashedPassword,
        name: 'Demo User'
      }
    });

    console.log('✅ Demo user created successfully!');
    console.log('Email: demo@nextlift.com');
    console.log('Password: demo123');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
