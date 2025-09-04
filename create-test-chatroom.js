const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestChatRoom() {
  try {
    console.log('🔄 Creating test chat room data...');
    
    const testUserId = 'ca156534-8226-4b1f-b81e-bb00e963f310';
    const testRoomId = 'test-room-id';
    
    // Check if chat room already exists
    const existingRoom = await prisma.chatRoom.findUnique({
      where: { id: testRoomId }
    });
    
    if (existingRoom) {
      console.log('✅ Test chat room already exists:', testRoomId);
    } else {
      // Create test chat room
      await prisma.chatRoom.create({
        data: {
          id: testRoomId,
          name: 'Test Chat Room',
          description: 'A test chat room for API testing',
          type: 'GROUP',
          creatorType: 'USER',
          creatorId: testUserId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('✅ Created test chat room:', testRoomId);
    }
    
    // Check if participant entry exists
    const existingParticipant = await prisma.chatRoomParticipant.findFirst({
      where: {
        chatRoomId: testRoomId,
        userIds: {
          array_contains: testUserId
        }
      }
    });
    
    if (existingParticipant) {
      console.log('✅ User already participant in chat room');
    } else {
      // Create participant entry
      await prisma.chatRoomParticipant.create({
        data: {
          chatRoomId: testRoomId,
          userIds: [testUserId], // JSON array of user IDs
          adminIds: [testUserId], // Make user admin too
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('✅ Added user as chat room participant');
    }
    
    // Create some test messages
    const existingMessages = await prisma.message.findMany({
      where: { chatRoomId: testRoomId }
    });
    
    if (existingMessages.length > 0) {
      console.log('✅ Test messages already exist:', existingMessages.length);
    } else {
      // Create test messages
      await prisma.message.createMany({
        data: [
          {
            id: 'msg-1',
            chatRoomId: testRoomId,
            senderId: testUserId,
            content: 'Hello! This is a test message.',
            createdAt: new Date(Date.now() - 3600000) // 1 hour ago
          },
          {
            id: 'msg-2', 
            chatRoomId: testRoomId,
            senderId: testUserId,
            content: 'This is another test message for API testing.',
            createdAt: new Date(Date.now() - 1800000) // 30 minutes ago
          },
          {
            id: 'msg-3',
            chatRoomId: testRoomId, 
            senderId: testUserId,
            content: 'Testing the chat room API endpoint!',
            createdAt: new Date() // now
          }
        ]
      });
      console.log('✅ Created 3 test messages');
    }
    
    console.log('\\n🎉 Test chat room setup complete!');
    console.log('📋 Chat Room ID:', testRoomId);
    console.log('👤 Participant:', testUserId);
    console.log('💬 Test messages: 3');
    console.log('🧪 You can now test getChatRoomDetails API!');
    
  } catch (error) {
    console.error('❌ Error creating test chat room:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestChatRoom();