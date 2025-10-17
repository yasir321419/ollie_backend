const prisma = require("../../config/prismaConfig");




const sendMessage = async (io, socket, data = {}) => {
  const chatroomId = data.chatroom ?? data.chatRoom;
  const { message } = data;
  if (!chatroomId) {
    console.warn("sendMessage called without chatroom id", data);
    return;
  }

  const userId = socket.userId;
  const userType = socket.userType; // 'USER' or 'ADMIN'
  console.log("Received message data:", data);
  console.log(chatroomId, 'chatroomid');

  // Fetch chat room data from the database
  const chatRoomData = await prisma.chatRoom.findFirst({
    where: { id: chatroomId },
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
    console.log("Chat room not found for ID:", chatroomId);
    return io.to(userId).emit("message", {
      status: "error",
      message: "Chat room not found",
    });
  }

  // Check if user is a participant of the chat room
  const isParticipant = chatRoomData.chatRoomParticipants.some(
    (p) => {
      const normalize = (value) =>
        Array.isArray(value) ? value.map((id) => id != null ? id.toString() : null).filter(Boolean) : [];
      const userIds = normalize(p.userIds);
      const adminIds = normalize(p.adminIds);
      const targetId = userId != null ? userId.toString() : "";
      return userIds.includes(targetId) || adminIds.includes(targetId);
    }
  );

  if (!isParticipant) {
    console.log("User is not part of this chat room:", userId);
    return io.to(userId).emit("message", {
      status: "error",
      message: "User is not part of this chat room",
    });
  }

  // Make sure the sending socket is currently joined to the chatroom rooms.
  const chatroomRoom = `chat:${chatroomId}`;
  const legacyRoom = chatroomId.toString();

  const ensureRoomJoin = async (roomName) => {
    if (!roomName) return;
    if (!socket.rooms.has(roomName)) {
      console.log(`sendMessage: auto-joining socket ${socket.id} to room ${roomName}`);
      await socket.join(roomName);
    }
  };

  await ensureRoomJoin(chatroomRoom);
  await ensureRoomJoin(legacyRoom);

  socket.data.activeChatRoom = chatroomRoom;

  // Create message data
  const messageData = {
    content: message || null,
    attachmentUrl: null,
    attachmentType: null,
    senderId: userType === "ADMIN" ? null : userId,
    chatRoomId: chatroomId,
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

  const outboundPayload = {
    status: "success",
    data: newMessage,
    message: "Message sent successfully",
  };

  const roomMembers = io.sockets.adapter.rooms.get(chatroomRoom);
  const legacyMembers = io.sockets.adapter.rooms.get(chatroomId.toString());

  console.log(
    "Broadcasting message to chatroom:",
    chatroomRoom,
    "memberCount:",
    roomMembers ? roomMembers.size : 0,
    "legacyCount:",
    legacyMembers ? legacyMembers.size : 0
  );

  return io.to(chatroomRoom).emit("message", outboundPayload);

};


const getChatRoomData = async (socket, data) => {
  try {
    const userId = socket.userId;
    console.log(data, 'data')// ✅ From token
    const chatroomId = data.chatRoom;    // 🟢 Passed from client

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
    const normalizeIds = (value) =>
      Array.isArray(value) ? value.map((id) => (id != null ? id.toString() : null)).filter(Boolean) : [];

    const userIds = chatRoomData.chatRoomParticipants.flatMap((p) => normalizeIds(p.userIds));
    const adminIds = chatRoomData.chatRoomParticipants.flatMap((p) => normalizeIds(p.adminIds));

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
