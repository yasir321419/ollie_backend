const prisma = require("../../config/prismaConfig");
const { ConflictError, NotFoundError, ValidationError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");



const createOneToOneChatRoom = async (req, res, next) => {
  try {
    const { id, userType } = req.user; // Creator's ID (user making the request)

    // One-to-One Chat Room Creation
    const oneToOneKey = id + "_creator"; // Using the creator's ID for now

    // Create the chat room with the creator as the first participant
    const chatRoom = await prisma.chatRoom.create({
      data: {
        type: "ONE_TO_ONE", // Set type to "ONE_TO_ONE"
        oneToOneKey,
        creatorId: id,  // The creator of the chat room
        creatorType: userType,
        // Add creator as the first participant
        chatRoomParticipants: {
          create: [
            {
              userId: userType === "USER" ? id : null, // Only add userId if the creator is a user
              adminId: userType === "ADMIN" ? id : null, // Only add adminId if the creator is an admin
            },
          ],
        },
      },
      include: {
        creator: true, // Include creator data (user or admin)
        chatRoomParticipants: true, // Include the participants
      },
    });

    return handlerOk(res, 200, chatRoom, 'Chat room created successfully');
  } catch (error) {
    next(error);
  }
};


const createGroupChatRoom = async (req, res, next) => {
  try {
    const { id, userType } = req.user; // Creator's ID (user making the request)
    let { name, description, image } = req.body;

    const file = req.file; // For file/image upload

    // Handle file upload if present
    if (file) {
      const filePath = file.filename;
      const basePath = `http://${req.get("host")}/public/uploads/`;
      image = `${basePath}${filePath}`;
    }

    const chatRoom = await prisma.chatRoom.create({
      data: {
        type: "GROUP",
        creatorId: id,  // The creator of the chat room
        creatorType: userType,
        name,
        description,
        image,
        chatRoomParticipants: {
          create: [
            {
              userId: userType === "USER" ? id : null, // Only add userId if the creator is a user
              adminId: userType === "ADMIN" ? id : null, // Only add adminId if the creator is an admin
            },
          ],
        },
      },
      include: {
        creator: true, // Include creator data (user or admin)
        chatRoomParticipants: true, // Include the participants
      },
    });

    return handlerOk(res, 200, chatRoom, 'Chat room created successfully');
  } catch (error) {
    next(error);
  }
};



const getOneToOneChatRooms = async (req, res, next) => {
  try {
    const { id, userType } = req.user;  // The user making the request (creator or participant)

    // Fetch one-to-one chat rooms where the user (or admin) is a participant
    const rooms = await prisma.chatRoom.findMany({
      where: {
        type: "ONE_TO_ONE", // Ensure it's a one-to-one chat room
        // chatRoomParticipants: {
        //   some: {
        //     OR: [
        //       { userId: id },   // Check for user participation
        //       { adminId: id }    // Check for admin participation
        //     ]
        //   }
        // }
        creatorId: id
      },
      include: {
        // Include chat room participants' information
        chatRoomParticipants: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true
              }
            },
            adminId: true,
            admin: {
              select: {
                id: true,
                name: true,  // Admin name
                email: true  // Optional admin email
              }
            }
          }
        },
        // Include messages, ordered by createdAt (descending)
        messages: {
          orderBy: { createdAt: "desc" },
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
      },
      orderBy: {
        updatedAt: "desc"  // Order chat rooms by last updated time (descending)
      }
    });

    // If no chat rooms are found, return a 404 error
    if (!rooms.length) {
      throw new NotFoundError("No one-to-one chat rooms found");
    }

    // Send the response with the list of chat rooms
    handlerOk(res, 200, rooms, 'One-to-one chat rooms found successfully');
  } catch (error) {
    next(error);
  }
};



const getGroupChatRooms = async (req, res, next) => {
  try {
    const { id } = req.user;

    const findgroupchatroom = await prisma.chatRoom.findMany({
      where: {
        type: "GROUP",
        creatorId: id
      },
      include: {
        // Include chat room participants' information
        chatRoomParticipants: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true
              }
            },
            adminId: true,
            admin: {
              select: {
                id: true,
                name: true,  // Admin name
                email: true  // Optional admin email
              }
            }
          }
        },
        // Include messages, ordered by createdAt (descending)
        messages: {
          orderBy: { createdAt: "desc" },
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
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    // If no chat rooms are found, throw an error
    if (!findgroupchatroom.length) {
      throw new NotFoundError("Group chat rooms not found");
    }

    const result = findgroupchatroom.map((room) => ({
      ...room,
      memberCount: room.chatRoomParticipants.length,
      participants: room.chatRoomParticipants.map(p => p.userId || p.adminId)
    }));

    handlerOk(res, 200, result, 'Group chat rooms found successfully');
  } catch (error) {
    next(error);
  }
};



const getFeatureGroups = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const otherGroups = await prisma.chatRoom.findMany({
      where: {
        type: "GROUP",
        creatorId: {
          not: userId
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true
          }
        },
        chatRoomParticipants: {  // Corrected: Use chatRoomParticipants instead of participants
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    if (!otherGroups || otherGroups.length === 0) {
      throw new NotFoundError("No featured groups found");
    }

    const result = otherGroups.map((room) => {
      const isUserInGroup = room.chatRoomParticipants.some(p => p.user.id === userId);

      return {
        ...room,
        messages: isUserInGroup ? room.messages : [],
        memberCount: room.chatRoomParticipants.length,  // Use chatRoomParticipants here
        participants: room.chatRoomParticipants.map(p => p.user)  // Same here
      };
    });

    handlerOk(res, 200, result, 'Featured groups fetched successfully');
  } catch (error) {
    next(error);
  }
};



const uploadAttachment = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { chatRoomId } = req.params;
    const { attachmentType } = req.body;
    const file = req.file;

    const findChatRoom = await prisma.chatRoom.findFirst({
      where: {
        id: chatRoomId
      },
      include: {
        participants: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!findChatRoom) {
      throw new NotFoundError("Chat room not found");
    }

    let attachmentUrl = '';
    if (file) {
      const filePath = file.filename;
      const basePath = `http://${req.get("host")}/public/uploads/`;
      attachmentUrl = `${basePath}${filePath}`;
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId: id,
        chatRoomId: chatRoomId,
        content: null,
        attachmentUrl,
        attachmentType: attachmentType || null,
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
    });

    // ✅ Emit message to chat participants via socket
    const io = req.app.get('io'); // You need to expose `io` in your app
    findChatRoom.participants.forEach((p) => {
      io.to(p.userId.toString()).emit("message", {
        status: "success",
        data: newMessage,
      });
    });

    handlerOk(res, 200, 'Attachment sent successfully', newMessage);

  } catch (error) {
    next(error);
  }
};



module.exports = {
  createOneToOneChatRoom,
  createGroupChatRoom,
  getOneToOneChatRooms,
  getGroupChatRooms,
  getFeatureGroups,
  uploadAttachment
}