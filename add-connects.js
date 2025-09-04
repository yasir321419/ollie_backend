const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addConnectsForTesting() {
  try {
    console.log('🔄 Adding connect credits for testing premium endpoints...');
    
    // Test user ID (from our existing token)
    const testUserId = '9441488a-e5ef-445b-a26a-79f3e4e26940';
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: testUserId }
    });
    
    if (!user) {
      console.log('❌ Test user not found!');
      return;
    }
    
    console.log('✅ Found test user:', user.email);

    // Check existing connects
    const existingConnect = await prisma.connectPurchase.findFirst({
      where: { userId: testUserId }
    });
    
    if (existingConnect) {
      // Update existing connect purchase with more credits
      await prisma.connectPurchase.update({
        where: { id: existingConnect.id },
        data: { quantity: 50 } // Give 50 connects for testing
      });
      console.log('✅ Updated existing connects to 50');
    } else {
      // Create new connect purchase
      await prisma.connectPurchase.create({
        data: {
          userId: testUserId,
          quantity: 50 // 50 connects for testing
        }
      });
      console.log('✅ Added 50 new connects');
    }

    console.log('\n🎉 Connect credits added successfully!');
    console.log('🧪 You can now test premium AI endpoints that require credits!');
    
  } catch (error) {
    console.error('❌ Error adding connects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addConnectsForTesting();
