const prisma = require("../../config/prismaConfig");
const { ConflictError, NotFoundError, ValidationError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const uploadFileWithFolder = require("../../utils/s3Upload");
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require("path");





const createOneToOneChatRoom = async (req, res, next) => {
  try {
    const { id, userType } = req.user;     // creator
    const { userId: peerId } = req.body;   // the other user

    if (!peerId) return handlerOk(res, 400, { error: "userId is required" }, "Bad request");
    if (id === peerId) throw new ConflictError("Cannot start a chat with yourself");

    // Stable unique key for 1:1 rooms
    const idsSorted = [id, peerId].sort();
    const oneToOneKey = idsSorted.join("_");

    // If oneToOneKey is unique in schema, use findUnique; otherwise findFirst is fine
    const existingRoom = await prisma.chatRoom.findFirst({ where: { oneToOneKey } });
    if (existingRoom) {
      return handlerOk(res, 200, { chatRoom: existingRoom.id }, "Chat room already exists");
    }

    // Create room + single participant row with both users
    const chatRoom = await prisma.chatRoom.create({
      data: {
        type: "ONE_TO_ONE",
        oneToOneKey,
        creatorId: id,
        creatorType: userType || "USER",
        chatRoomParticipants: {
          create: {
            userIds: idsSorted,  // ✅ JSON array
            adminIds: [],        // ✅ required JSON field
          },
        },
      },
      include: {
        creator: true,
        chatRoomParticipants: true, // ❗ no user/admin includes here (no relations on JSON arrays)
      },
    });

    return handlerOk(res, 200, chatRoom, "Chat room created successfully");
  } catch (error) {
    next(error);
  }
};




const createGroupChatRoom = async (req, res, next) => {
  try {
    const { id, userType } = req.user; // "USER" or "ADMIN"
    let { name, description } = req.body;
    let image;

    // optional file upload
    if (req.file) {
      const basePath = `http://${req.get("host")}/public/uploads/`;
      image = `${basePath}${req.file.filename}`;
    }

    if (!name) return handlerOk(res, 400, { error: "name is required" }, "Bad request");

    // seed participant arrays with the creator
    const isUserCreator = userType === "USER";
    const userIds = isUserCreator ? [id] : [];
    const adminIds = isUserCreator ? [] : [id];

    const chatRoom = await prisma.chatRoom.create({
      data: {
        type: "GROUP",
        creatorId: id,
        creatorType: userType,
        name,
        description,
        image,
        chatRoomParticipants: {
          // ✅ ONE row per room, with JSON arrays present for both fields
          create: { userIds, adminIds },
        },
      },
      include: {
        creator: true,
        chatRoomParticipants: true, // (no user/admin relations on JSON arrays)
      },
    });

    return handlerOk(res, 200, chatRoom, "Chat room created successfully");
  } catch (error) {
    next(error);
  }
};




const getOneToOneChatRooms = async (req, res, next) => {
  try {
    const { id } = req.user;

    const rooms = await prisma.chatRoom.findMany({
      where: {
        type: "ONE_TO_ONE",
        chatRoomParticipants: {
          some: {
            OR: [
              { userIds: { array_contains: id } },
              { adminIds: { array_contains: id } },
            ],
          },
        },
      },
      include: {
        chatRoomParticipants: {
          select: {
            userIds: true,
            adminIds: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // last message only; remove if you want them all
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true, image: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!rooms.length) {
      throw new NotFoundError("No one-to-one chat rooms found");
    }

    // OPTIONAL: hydrate participants with user/admin profiles
    // Collect all userIds from the JSON arrays
    const allUserIds = Array.from(new Set(
      rooms.flatMap(r =>
        r.chatRoomParticipants.flatMap(p => Array.isArray(p.userIds) ? p.userIds : [])
      )
    ));

    // Fetch user profiles in one shot (skip if you don't need them)
    const users = await prisma.user.findMany({
      where: { id: { in: allUserIds } },
      select: { id: true, firstName: true, lastName: true, image: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // Attach hydrated participant data
    const result = rooms.map(r => ({
      ...r,
      participants: {
        users: r.chatRoomParticipants.flatMap(p =>
          (Array.isArray(p.userIds) ? p.userIds : []).map(uid => userMap.get(uid)).filter(Boolean)
        ),
        adminIds: r.chatRoomParticipants.flatMap(p => p.adminIds || []), // hydrate admins similarly if you have an Admin table
      },
    }));

    handlerOk(res, 200, result, "One-to-one chat rooms found successfully");
  } catch (error) {
    next(error);
  }
};


const getGroupChatRooms = async (req, res, next) => {
  try {
    const { id } = req.user;

    const rooms = await prisma.chatRoom.findMany({
      where: {
        type: "GROUP",
        chatRoomParticipants: {
          some: {
            OR: [
              { userIds: { array_contains: id } },
              { adminIds: { array_contains: id } },
            ],
          },
        },
      },
      include: {
        chatRoomParticipants: { select: { userIds: true, adminIds: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // last message only (adjust as needed)
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, image: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!rooms.length) throw new NotFoundError("Group chat rooms not found");

    // hydrate user profiles (optional—remove if you don't need names/images)
    const allUserIds = Array.from(new Set(
      rooms.flatMap(r =>
        r.chatRoomParticipants.flatMap(p => Array.isArray(p.userIds) ? p.userIds : [])
      )
    ));

    const users = allUserIds.length
      ? await prisma.user.findMany({
        where: { id: { in: allUserIds } },
        select: { id: true, firstName: true, lastName: true, image: true },
      })
      : [];

    const userMap = new Map(users.map(u => [u.id, u]));

    const result = rooms.map(r => {
      const pRows = r.chatRoomParticipants;
      const userIds = Array.from(new Set(pRows.flatMap(p => Array.isArray(p.userIds) ? p.userIds : [])));
      const adminIds = Array.from(new Set(pRows.flatMap(p => Array.isArray(p.adminIds) ? p.adminIds : [])));

      return {
        id: r.id,
        type: r.type,
        name: r.name,
        description: r.description,
        image: r.image,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        lastMessage: r.messages?.[0] ?? null,
        memberCount: userIds.length + adminIds.length, // one participant row per room → compute from arrays
        participants: {
          users: userIds.map(uid => userMap.get(uid) ?? { id: uid }), // hydrate if available
          adminIds,
        },
      };
    });

    handlerOk(res, 200, result, "Group chat rooms found successfully");
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

    const filePath = file.path; // Full file path of the uploaded file
    const folder = 'uploads'; // Or any folder you want to store the image in
    const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    const contentType = file.mimetype; // The MIME type of the file

    const fileBuffer = fs.readFileSync(filePath);

    const s3ImageUrl = await uploadFileWithFolder(fileBuffer, filename, contentType, folder);

    const findChatRoom = await prisma.chatRoom.findFirst({
      where: {
        id: chatRoomId
      },
      include: {
        chatRoomParticipants: {
          // select: {
          //   userId: true
          // }
        }
      }
    });

    if (!findChatRoom) {
      throw new NotFoundError("Chat room not found");
    }

    let attachmentUrl = '';
    if (file) {
      // const filePath = file.filename;
      // const basePath = `http://${req.get("host")}/public/uploads/`;
      attachmentUrl = s3ImageUrl;
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
    findChatRoom.chatRoomParticipants.forEach((p) => {
      io.to(p.toString()).emit("message", {
        status: "success",
        data: newMessage,
      });
    });

    handlerOk(res, 200, 'Attachment sent successfully', newMessage);

  } catch (error) {
    next(error);
  }
};

const addparticipantInChatRoom = async (req, res, next) => {
  try {
    const { id: requesterId, userType } = req.user;
    const { chatRoomId } = req.params;

    if (!requesterId || !chatRoomId) {
      return handlerOk(res, 400, "Missing userId or chatRoomId", null);
    }

    // Ensure room exists
    const room = await prisma.chatRoom.findUnique({ where: { id: chatRoomId } });
    if (!room) throw new NotFoundError("chat room not found");

    // Fetch (or create) the single participants row for this room
    let row = await prisma.chatRoomParticipant.findFirst({ where: { chatRoomId } });

    // Normalize arrays
    const asArray = (v) => (Array.isArray(v) ? v : []);
    if (!row) {
      // ✅ both JSON fields required on create
      const initialUserIds = userType === "USER" ? [requesterId] : [];
      const initialAdminIds = userType === "ADMIN" ? [requesterId] : [];
      row = await prisma.chatRoomParticipant.create({
        data: { chatRoomId, userIds: initialUserIds, adminIds: initialAdminIds },
      });
      return handlerOk(res, 201, "chatroom updated successfully", row);
    }

    const currentUsers = asArray(row.userIds);
    const currentAdmins = asArray(row.adminIds);

    // Decide which list to add to based on requester type (adjust if you want to add others)
    let nextUsers = currentUsers;
    let nextAdmins = currentAdmins;

    if (userType === "USER") {
      if (currentUsers.includes(requesterId)) {
        return handlerOk(res, 200, "already a participant", row);
      }
      nextUsers = Array.from(new Set([...currentUsers, requesterId]));
    } else if (userType === "ADMIN") {
      if (currentAdmins.includes(requesterId)) {
        return handlerOk(res, 200, "already a participant", row);
      }
      nextAdmins = Array.from(new Set([...currentAdmins, requesterId]));
    } else {
      // Fallback: treat as user
      if (!currentUsers.includes(requesterId)) {
        nextUsers = Array.from(new Set([...currentUsers, requesterId]));
      } else {
        return handlerOk(res, 200, "already a participant", row);
      }
    }

    const updated = await prisma.chatRoomParticipant.update({
      where: { id: row.id },              // update by PK
      data: { userIds: nextUsers, adminIds: nextAdmins },
    });

    handlerOk(res, 200, "chatroom updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

const getFeatureGroups = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    console.log(userId);


    // 1) Pull groups that were **not** created by this user
    const groups = await prisma.chatRoom.findMany({
      where: {
        type: "GROUP",
        creatorId: { not: userId }, // Exclude groups created by the logged-in user
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, image: true } },
        chatRoomParticipants: { select: { userIds: true, adminIds: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, image: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!groups.length) throw new NotFoundError("No featured groups found");

    // 2) Collect all user/admin IDs to hydrate profiles
    const userIdSet = new Set();
    const adminIdSet = new Set();

    for (const g of groups) {
      for (const p of g.chatRoomParticipants) {
        (Array.isArray(p.userIds) ? p.userIds : []).forEach(uid => userIdSet.add(uid));
        (Array.isArray(p.adminIds) ? p.adminIds : []).forEach(aid => adminIdSet.add(aid));
      }
    }

    const [userProfiles, adminProfiles] = await Promise.all([
      userIdSet.size
        ? prisma.user.findMany({
          where: { id: { in: Array.from(userIdSet) } },
          select: { id: true, firstName: true, lastName: true, image: true },
        })
        : Promise.resolve([]),
      adminIdSet.size
        ? prisma.admin.findMany({
          where: { id: { in: Array.from(adminIdSet) } },
          select: { id: true, name: true, email: true, image: true },
        })
        : Promise.resolve([]),
    ]);

    const userMap = new Map(userProfiles.map(u => [u.id, u]));
    const adminMap = new Map(adminProfiles.map(a => [a.id, a]));

    // 3) Shape the response
    const result = groups.map(g => {
      const userIds = Array.from(
        new Set(g.chatRoomParticipants.flatMap(p => (Array.isArray(p.userIds) ? p.userIds : [])))
      );
      const adminIds = Array.from(
        new Set(g.chatRoomParticipants.flatMap(p => (Array.isArray(p.adminIds) ? p.adminIds : [])))
      );

      // const isRequesterInGroup = userIds.includes(userId) || adminIds.includes(userId);

      return {
        id: g.id,
        type: g.type,
        name: g.name,
        description: g.description,
        image: g.image,
        creator: g.creator,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
        lastMessage: g.messages?.[0] ?? null,
        memberCount: userIds.length + adminIds.length,
        participants: {
          users: userIds.map(uid => userMap.get(uid) || { id: uid }),
          admins: adminIds.map(aid => adminMap.get(aid) || { id: aid }),
        },
      };
    });

    handlerOk(res, 200, result, "Featured groups fetched successfully");
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
  uploadAttachment,
  addparticipantInChatRoom
}