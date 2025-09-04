const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestCreditsAndSubscription() {
  try {
    console.log('🔄 Adding test credits and subscription data...');
    
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

    // 1. Create a subscription plan if it doesn't exist
    let subscriptionPlan = await prisma.subscriptionPlan.findFirst();
    
    if (!subscriptionPlan) {
      subscriptionPlan = await prisma.subscriptionPlan.create({
        data: {
          name: 'Premium Test Plan',
          price: 9.99,
          duration: 30 // 30 days
        }
      });
      console.log('✅ Created subscription plan:', subscriptionPlan.name);
    } else {
      console.log('✅ Using existing subscription plan:', subscriptionPlan.name);
    }

    // 2. Add active subscription for test user
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: { 
        userId: testUserId,
        isActive: true
      }
    });
    
    if (!existingSubscription) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
      
      await prisma.userSubscription.create({
        data: {
          userId: testUserId,
          subscriptionPlanId: subscriptionPlan.id,
          startDate: new Date(),
          endDate: futureDate,
          isActive: true
        }
      });
      console.log('✅ Added active subscription for test user');
    } else {
      console.log('✅ User already has active subscription');
    }

    // 3. Get admin user for creating credits
    let admin = await prisma.admin.findFirst();
    
    if (!admin) {
      admin = await prisma.admin.create({
        data: {
          name: 'Test Admin',
          email: 'admin@test.com',
          password: 'hashed_password'
        }
      });
      console.log('✅ Created test admin');
    } else {
      console.log('✅ Using existing admin:', admin.name);
    }

    // 4. Add credits for test user
    const existingCredits = await prisma.credit.count({
      where: { 
        userId: testUserId,
        isClaimed: false
      }
    });
    
    if (existingCredits < 5) {
      // Add 10 unclaimed credits
      const creditsToAdd = [];
      for (let i = 0; i < 10; i++) {
        creditsToAdd.push({
          credit: `Test Credit ${i + 1}`,
          amount: 1.0, // 1 credit each
          userId: testUserId,
          createdById: admin.id,
          isClaimed: false
        });
      }
      
      await prisma.credit.createMany({
        data: creditsToAdd
      });
      console.log('✅ Added 10 test credits');
    } else {
      console.log('✅ User already has sufficient credits');
    }

    // 5. Add some dummy data for testing
    
    // Add an interest category and blog if they don't exist
    let interest = await prisma.interest.findFirst();
    if (!interest) {
      interest = await prisma.interest.create({
        data: {
          name: 'Test Interest'
        }
      });
      console.log('✅ Created test interest category');
    }
    
    // Add a blog post for content testing
    const existingBlog = await prisma.blog.findFirst();
    if (!existingBlog) {
      await prisma.blog.create({
        data: {
          title: 'Test Blog Post',
          content: 'This is a test blog post content for AI testing.',
          categoryId: interest.id,
          adminId: admin.id,
          type: 'RECENT'
        }
      });
      console.log('✅ Created test blog post');
    }
    
    // Add an event for events testing
    const existingEvent = await prisma.event.findFirst();
    if (!existingEvent) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 7); // 7 days from now
      
      await prisma.event.create({
        data: {
          eventName: 'Test Event',
          eventDescription: 'This is a test event for AI testing.',
          eventDateAndTime: eventDate,
          eventAddress: 'Test Address',
          eventCity: 'Test City',
          eventStates: 'Test State',
          eventCountry: 'Test Country',
          createdById: admin.id
        }
      });
      console.log('✅ Created test event');
    }
    
    // Add a task for user
    const existingTask = await prisma.task.findFirst({
      where: { userId: testUserId }
    });
    
    if (!existingTask) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await prisma.task.create({
        data: {
          taskName: 'Test Task',
          taskDescription: 'This is a test task created by the system.',
          userId: testUserId,
          scheduledDate: tomorrow, // DateTime object
          scheduledTime: '10:00:00', // HH:mm:ss format
          markAsComplete: false
        }
      });
      console.log('✅ Created test task');
    }

    console.log('\n🎉 Test data setup complete!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Active subscription added');
    console.log('- ✅ 10 credits available');
    console.log('- ✅ Test blog post available');
    console.log('- ✅ Test event available');
    console.log('- ✅ Test task available');
    console.log('\n🧪 You can now test premium AI endpoints!');
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestCreditsAndSubscription();