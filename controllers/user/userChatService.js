const prisma = require("../../config/prismaConfig");






// const sendMessage = async (io, socket, data) => {
//   const { chatroom, message } = data;
//   const userId = socket.userId;
//   const userType = socket.userType; // 'USER' or 'ADMIN'

//   const chatRoomData = await prisma.chatRoom.findFirst({
//     where: { id: chatroom },
//     include: {
//       chatRoomParticipants: {
//         select: {
//           userId: true,
//           adminId: true
//         }
//       }
//     }
//   });

//   if (!chatRoomData) {
//     return io.to(userId).emit("message", {
//       status: "error",
//       message: "Chat room not found",
//     });
//   }

//   const isParticipant = chatRoomData.chatRoomParticipants.some(
//     p => p.userId === userId || p.adminId === userId
//   );

//   if (!isParticipant) {
//     return io.to(userId).emit("message", {
//       status: "error",
//       message: "User is not part of this chat room",
//     });
//   }

//   const messageData = {
//     content: message || null,
//     attachmentUrl: null,
//     attachmentType: null,
//     chatRoomId: chatroom,
//     ...(userType === "USER" && { senderId: userId }),
//     ...(userType === "ADMIN" && { adminSenderId: userId }),
//   };

//   const newMessage = await prisma.message.create({
//     data: messageData,
//     include: {
//       sender: {
//         select: {
//           id: true,
//           firstName: true,
//           lastName: true,
//           image: true
//         }
//       },
//       adminSender: {
//         select: {
//           id: true,
//           name: true,
//           email: true
//         }
//       }
//     }
//   });

//   chatRoomData.chatRoomParticipants.forEach((p) => {
//     const recipientId = p.userId || p.adminId;
//     if (recipientId) {
//       io.to(recipientId).emit("message", {
//         status: "success",
//         data: newMessage,
//         message: "Message sent successfully",
//       });
//     }
//   });
// };


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
        select: {
          userId: true,
          adminId: true
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
    (p) => p.userId === userId || p.adminId === userId
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

  // Emit the message to all participants
  // chatRoomData.chatRoomParticipants.forEach((p) => {
  //   const recipientId = p.userId || p.adminId;
  //   if (recipientId.toString()) {
  //     console.log("Emitting message to recipient:", recipientId);
  //     io.to(recipientId).emit("message", {
  //       status: "success",
  //       data: newMessage,
  //       message: "Message sent successfully",
  //     });
  //   }
  // });

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

    // if (!chatroomId) {
    //   console.log("Invalid chatroom ID:", data.chatroom);
    //   return socket.emit("getRoom", {
    //     status: "error",
    //     message: "Invalid chat room ID"
    //   });
    // }

    // const chatRoomData = await prisma.chatRoom.findFirst({
    //   where: { id: chatroomId },
    //   include: {
    //     chatRoomParticipants: {
    //       include: {
    //         user: {
    //           select: {
    //             id: true,
    //             firstName: true,
    //             lastName: true,
    //             image: true
    //           }
    //         },
    //         admin: {
    //           select: {
    //             id: true,
    //             name: true,
    //             email: true,
    //           }
    //         }
    //       }
    //     },
    //     messages: {
    //       orderBy: { createdAt: "desc" },
    //       take: 10,
    //       include: {
    //         sender: {
    //           select: {
    //             id: true,
    //             firstName: true,
    //             lastName: true,
    //             image: true
    //           }
    //         }
    //       }
    //     }
    //   }
    // });

    const chatRoomData = await prisma.chatRoom.findFirst({
      where: { id: chatroomId },
      include: {
        chatRoomParticipants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true,
              }
            },
            admin: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },  // Sorting by `createdAt`
          take: 10,
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

    const isParticipant = chatRoomData.chatRoomParticipants.some(
      (participant) =>
        participant.userId === userId || participant.adminId === userId
    );

    if (!isParticipant) {
      return socket.emit("getRoom", {
        status: "error",
        message: "You are not a participant in this chat room"
      });
    }

    return socket.emit("getRoom", {
      status: "success",
      data: chatRoomData
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