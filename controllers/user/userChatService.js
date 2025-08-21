const prisma = require("../../config/prismaConfig");




const sendMessage = async (io, socket, data) => {
  const { chatroom, message } = data;
  const userId = socket.userId;
  const userType = socket.userType; // 'USER' or 'ADMIN'
  console.log("Received message data:", data);
  console.log(chatroom, 'chatroomid');

  // Fetch chat room data from the database
  const chatRoomData = await prisma.chatRoom.findFirst({
    where: { id: chatroom },
    include: {
      chatRoomParticipants: {
        // Accessing the userIds and adminIds
        select: {
          userIds: true, // Now using userIds
          adminIds: true // Now using adminIds
        }
      }
    }
  });

  if (!chatRoomData) {
    console.log("Chat room not found for ID:", chatroom);
    return io.to(userId).emit("message", {
      status: "error",
      message: "Chat room not found",
    });
  }

  // Check if user is a participant of the chat room
  const isParticipant = chatRoomData.chatRoomParticipants.some(
    (p) =>
      p.userIds.includes(userId) || p.adminIds.includes(userId) // Checking userIds and adminIds arrays
  );

  if (!isParticipant) {
    console.log("User is not part of this chat room:", userId);
    return io.to(userId).emit("message", {
      status: "error",
      message: "User is not part of this chat room",
    });
  }

  // Create message data
  const messageData = {
    content: message || null,
    attachmentUrl: null,
    attachmentType: null,
    senderId: userId,
    chatRoomId: chatroom,
    ...(userType === "USER" && { senderId: userId }),
    ...(userType === "ADMIN" && { adminSenderId: userId }),
  };

  console.log("Message data being saved:", messageData);

  // Save the new message to the database
  const newMessage = await prisma.message.create({
    data: messageData,
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          image: true
        }
      },
      adminSender: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  console.log("New message saved:", newMessage);

  // Emit the message to the chatroom and all participants
  // chatRoomData.chatRoomParticipants.forEach((p) => {
  //   // Loop through userIds and adminIds and emit the message to them
  //   const allParticipants = [...p.userIds, ...p.adminIds];

  //   allParticipants.forEach((recipientId) => {
  //     if (recipientId) {
  //       console.log("Emitting message to recipient:", recipientId);
  //       io.to(recipientId).emit("message", {
  //         status: "success",
  //         data: newMessage,
  //         message: "Message sent successfully",
  //       });
  //     }
  //   });
  // });

  // Optionally, emit the success message to the sender
  return socket.emit("message", {
    status: "success",
    data: newMessage,
    message: "Message sent successfully",
  });
};


const getChatRoomData = async (socket, data) => {
  try {
    const userId = socket.userId;                  // ✅ From token
    const chatroomId = data.chatroom;    // 🟢 Passed from client

    const chatRoomData = await prisma.chatRoom.findFirst({
      where: { id: chatroomId },
      include: {
        chatRoomParticipants: {
          // No need to include userIds and adminIds here
        },
        messages: {
          orderBy: {
            // createdAt: "desc"
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!chatRoomData) {
      console.log("Chat room not found for ID:", chatroomId);
      return socket.emit("getRoom", {
        status: "error",
        message: "Chat room not found"
      });
    }

    // Get the participants (users and admins)
    const userIds = chatRoomData.chatRoomParticipants.flatMap(p => p.userIds);
    const adminIds = chatRoomData.chatRoomParticipants.flatMap(p => p.adminIds);

    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        image: true
      }
    });

    const admins = await prisma.admin.findMany({
      where: {
        id: { in: adminIds }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Now attach the user and admin data to the chatRoomData
    const updatedChatRoomData = {
      ...chatRoomData,
      participants: {
        users,
        admins
      }
    };

    return socket.emit("getRoom", {
      status: "success",
      data: updatedChatRoomData
    });

  } catch (err) {
    console.error("Error in getChatRoomData:", err);
    return socket.emit("getRoom", {
      status: "error",
      message: "Something went wrong"
    });
  }
};








module.exports = {
  sendMessage,
  getChatRoomData,

}