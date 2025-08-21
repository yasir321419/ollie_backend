const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");


const userChatRouter = require("express").Router();
const userChatController = require("../../controllers/user/userChatController");
const { userSentAttachmentSchema, userCreateOneToOneChatRoomSchema, userCreateGroupChatRoomSchema, userAddInChatRoomSchema } = require("../../schema/user/chat");
const { verifyUserToken } = require("../../middleware/auth");
const handleMultiPartData = require("../../middleware/multiPartData");


userChatRouter.post(
  "/createOneToOneChatRoom",
  limiter,
  verifyUserToken,
  validateRequest(userCreateOneToOneChatRoomSchema),
  userChatController.createOneToOneChatRoom
);

userChatRouter.post(
  "/createGroupChatRoom",
  limiter,
  verifyUserToken,
  handleMultiPartData.single("image"),
  validateRequest(userCreateGroupChatRoomSchema),
  userChatController.createGroupChatRoom
);


userChatRouter.get(
  "/getOneToOneChatRooms",
  limiter,
  verifyUserToken,
  userChatController.getOneToOneChatRooms
);

userChatRouter.get(
  "/getGroupChatRooms",
  limiter,
  verifyUserToken,
  userChatController.getGroupChatRooms
);

userChatRouter.get(
  "/getFeatureGroups",
  limiter,
  verifyUserToken,
  userChatController.getFeatureGroups
);

userChatRouter.post(
  "/uplaodAttachment/:chatRoomId",
  limiter,
  verifyUserToken,
  handleMultiPartData.single("image"),
  validateRequest(userSentAttachmentSchema),
  userChatController.uploadAttachment
);


userChatRouter.post(
  "/addparticipantInChatRoom/:chatRoomId",
  limiter,
  verifyUserToken,
  validateRequest(userAddInChatRoomSchema),
  userChatController.addparticipantInChatRoom
);



module.exports = userChatRouter;