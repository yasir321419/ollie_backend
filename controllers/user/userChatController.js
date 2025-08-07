const prisma = require("../../config/prismaConfig");
const { ConflictError, NotFoundError, ValidationError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");





const createChatRoom = async (req, res, next) => {
  try {
    const { id, userType } = req.user; // Assuming user info is attached to req.user
    let {
      // users,
      name, description, image } = req.body;
    const file = req.file;

    // Parse users if it's a string
    // if (typeof users === 'string') {
    //   users = JSON.parse(users);
    // }

    // users = users.map(String); // Ensure all IDs are numbers

    // Ensure the creator's ID is not included in the users array
    // if (users.includes(id)) {
    //   throw new ConflictError("You cannot include your own ID in the users array.");
    // }

    // Combine creator ID and users to get full list of participants
    // const participantIds = [...new Set([id, ...users])];

    // Ensure exactly two participants for a one-to-one chat
    // if (participantIds.length !== 2) {
    //   throw new ConflictError("For a one-to-one chat, exactly 2 participants are required.");
    // }

    // Check if both participants exist in the database (user and admin)
    // const usersInDatabase = await prisma.user.findMany({
    //   where: {
    //     id: { in: participantIds }
    //   }
    // });

    // const adminsInDatabase = await prisma.admin.findMany({
    //   where: {
    //     id: { in: participantIds }
    //   }
    // });

    // If any user does not exist, throw an error
    // if (usersInDatabase.length + adminsInDatabase.length !== participantIds.length) {
    //   const missingIds = participantIds.filter(
    //     id => !usersInDatabase.some(user => user.id === id) && !adminsInDatabase.some(admin => admin.id === id)
    //   );
    //   throw new NotFoundError(`The following participants do not exist: ${missingIds.join(', ')}`);
    // }

    // Handle file upload if present
    if (file) {
      const filePath = file.filename;
      const basePath = `http://${req.get("host")}/public/uploads/`;
      image = `${basePath}${filePath}`;
    }

    // ONE-TO-ONE CHAT ROOM
    // if (users.length === 1) {
    //   const otherUserId = users[0];
    //   const oneToOneKey = [id, otherUserId].sort((a, b) => a - b).join('_');

    //   // Check if the one-to-one chat room already exists
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        creatorId: id,
      },
      // include: {
      //   chatRoomParticipants: {
      //     include: {
      //       user: true,
      //       admin: true
      //     }
      //   }
      // }
    });

    if (existingRoom) {
      return handlerOk(res, 200, existingRoom, 'Chat room already exists');
    }

    // Create a new one-to-one chat room and connect participants
    //   const chatRoom = await prisma.chatRoom.create({
    //     data: {
    //       type: "ONE_TO_ONE",
    //       oneToOneKey,
    //       creatorId: id,
    //       creatorType: userType,
    //       chatRoomParticipants: {
    //         create: participantIds.map(userId => ({
    //           userId: usersInDatabase.some(user => user.id === userId) ? userId : null,
    //           adminId: adminsInDatabase.some(admin => admin.id === userId) ? userId : null
    //         }))
    //       }
    //     },
    //     include: {
    //       chatRoomParticipants: {
    //         include: {
    //           user: true,
    //           admin: true
    //         }
    //       }
    //     }
    //   });

    //   return handlerOk(res, 200, chatRoom, 'Chat room created successfully');
    // }

    // GROUP CHAT ROOM (for more than 2 participants)
    const chatRoom = await prisma.chatRoom.create({
      data: {
        type: "GROUP", // Correctly set the type to "GROUP"
        name,          // Include name for GROUP chat rooms
        description,
        image,
        creatorId: id,
        creatorType: userType,
        // chatRoomParticipants: {
        //   create: participantIds.map(userId => ({
        //     userId: usersInDatabase.some(user => user.id === userId) ? userId : null,
        //     adminId: adminsInDatabase.some(admin => admin.id === userId) ? userId : null
        //   }))
        // }
      },
      // include: {
      //   chatRoomParticipants: {
      //     include: {
      //       user: true,
      //       admin: true
      //     }
      //   }
      // }
    });




    return handlerOk(res, 200, chatRoom, 'Group chat room created successfully');
  } catch (error) {
    next(error);
  }
};


const getOneToOneChatRooms = async (req, res, next) => {
  try {
    const { id, userType } = req.user;

    const rooms = await prisma.chatRoom.findMany({
      where: {
        type: "ONE_TO_ONE",
        chatRoomParticipants: {
          some: {
            OR: [
              { userId: id },
              { adminId: id }
            ]
          }
        }
      },
      include: {
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
                name: true, // Changed from firstName/lastName/image
                email: true // optional
              }
            }
          }
        },
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

    if (!rooms.length) {
      throw new NotFoundError("No one-to-one chat rooms found");
    }

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
        chatRoomParticipants: {
          some: {
            OR: [
              { userId: id },
              { adminId: id }
            ]
          }
        }
      },
      include: {
        chatRoomParticipants: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true
              }
            },
            admin: {
              select: {
                id: true,
                name: true,
                email: true
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

    if (!findgroupchatroom.length) {
      throw new NotFoundError("Group chat rooms not found");
    }

    const result = findgroupchatroom.map((room) => ({
      ...room,
      memberCount: room.chatRoomParticipants.length,
      participants: room.chatRoomParticipants.map(p => p.user || p.admin)
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
  createChatRoom,
  getOneToOneChatRooms,
  getGroupChatRooms,
  getFeatureGroups,
  uploadAttachment
}