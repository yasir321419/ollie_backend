const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔄 Creating test user with simple password...');
    
    const email = 'test@example.com';
    const password = 'password123';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (existingUser) {
      console.log('✅ Test user already exists:', email);
      
      // Update password to our known password
      const hashedPassword = bcrypt.hashSync(password, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Updated password for test user');
      
    } else {
      console.log('❌ Test user does not exist. Creating new user...');
      
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
          userType: 'USER'
        }
      });
      console.log('✅ Created new test user:', newUser.email);
    }
    
    console.log('\n🎉 Test user ready!');
    console.log('📧 Email:', email);
    console.log('🔒 Password:', password);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
