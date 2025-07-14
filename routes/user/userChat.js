const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");


const userChatRouter = require("express").Router();
const userChatController = require("../../controllers/user/userChatController");
const { userCreateChatRoomSchema, userSentAttachmentSchema } = require("../../schema/user/chat");
const { verifyUserToken } = require("../../middleware/auth");
const handleMultiPartData = require("../../middleware/multiPartData");


userChatRouter.post(
  "/userCreateChatRoom",
  limiter,
  verifyUserToken,
  handleMultiPartData.single("image"),
  validateRequest(userCreateChatRoomSchema),
  userChatController.createChatRoom
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

module.exports = userChatRouter;