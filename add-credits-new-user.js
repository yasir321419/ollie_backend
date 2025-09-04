const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCreditsToNewUser() {
  try {
    console.log('🔄 Adding connect credits to new test user account...');
    
    // New test user ID (from our recent login)
    const testUserId = 'ca156534-8226-4b1f-b81e-bb00e963f310';
    const testEmail = 'test@example.com';
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: testUserId }
    });
    
    if (!user) {
      console.log('❌ Test user not found! Let me search by email...');
      
      const userByEmail = await prisma.user.findUnique({
        where: { email: testEmail }
      });
      
      if (userByEmail) {
        console.log('✅ Found user by email:', userByEmail.email, 'ID:', userByEmail.id);
        
        // Add connects for this user
        await addConnectsToUser(userByEmail.id);
      } else {
        console.log('❌ User not found by email either');
        return;
      }
    } else {
      console.log('✅ Found test user:', user.email);
      await addConnectsToUser(user.id);
    }
    
  } catch (error) {
    console.error('❌ Error adding credits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function addConnectsToUser(userId) {
  try {
    // Check existing connects
    const existingConnect = await prisma.connectPurchase.findFirst({
      where: { userId: userId }
    });
    
    if (existingConnect) {
      // Update existing connect purchase with more credits
      await prisma.connectPurchase.update({
        where: { id: existingConnect.id },
        data: { quantity: 100 } // Give 100 connects for extensive testing
      });
      console.log('✅ Updated existing connects to 100');
    } else {
      // Create new connect purchase
      await prisma.connectPurchase.create({
        data: {
          userId: userId,
          quantity: 100 // 100 connects for testing
        }
      });
      console.log('✅ Added 100 new connects');
    }

    // Also add subscription for the user
    let subscriptionPlan = await prisma.subscriptionPlan.findFirst();
    if (!subscriptionPlan) {
      subscriptionPlan = await prisma.subscriptionPlan.create({
        data: {
          name: 'Premium Test Plan',
          price: 9.99,
          duration: 30
        }
      });
      console.log('✅ Created subscription plan');
    }

    const existingSubscription = await prisma.userSubscription.findFirst({
      where: { 
        userId: userId,
        isActive: true
      }
    });
    
    if (!existingSubscription) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
      
      await prisma.userSubscription.create({
        data: {
          userId: userId,
          subscriptionPlanId: subscriptionPlan.id,
          startDate: new Date(),
          endDate: futureDate,
          isActive: true
        }
      });
      console.log('✅ Added active subscription for test user');
    }

    console.log('\n🎉 Credits added successfully!');
    console.log('💳 Connect Credits: 100');
    console.log('📅 Active Subscription: Yes (30 days)');
    console.log('🧪 You can now test all premium AI endpoints!');
  } catch (error) {
    console.error('❌ Error in addConnectsToUser:', error);
  }
}

addCreditsToNewUser();
