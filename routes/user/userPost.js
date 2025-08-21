const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const userPostRouter = require("express").Router();
const userPostController = require("../../controllers/user/userPostController");
const { verifyUserToken } = require("../../middleware/auth");
const { userCreatePostSchema, userShowSinglePostSchema, userCommentPostSchema, userLikeAndReplyCommentPostSchema, userUpdatePostSchema, userAllPostSchema } = require("../../schema/user/post");
const handleMultiPartData = require("../../middleware/multiPartData");


userPostRouter.post(
  "/createUserPost/:categoryId",
  limiter,
  verifyUserToken,
  validateRequest(userCreatePostSchema),
  handleMultiPartData.single("image"),
  userPostController.createUserPost
);

userPostRouter.get(
  "/showUserAllPost",
  limiter,
  verifyUserToken,
  validateRequest(userAllPostSchema),
  userPostController.showUserAllPost
);

userPostRouter.get(
  "/showSingleUserPost/:postId",
  limiter,
  verifyUserToken,
  validateRequest(userShowSinglePostSchema),
  userPostController.showSingleUserPost
);

userPostRouter.put(
  "/updateUserPost/:postId",
  limiter,
  verifyUserToken,
  validateRequest(userUpdatePostSchema),
  handleMultiPartData.single("image"),
  userPostController.updateUserPost
);

userPostRouter.delete(
  "/deleteUserPost/:postId",
  limiter,
  verifyUserToken,
  validateRequest(userShowSinglePostSchema),
  userPostController.deleteUserPost
);

userPostRouter.post(
  "/likeAndUnlikeUserPost/:postId",
  limiter,
  verifyUserToken,
  validateRequest(userShowSinglePostSchema),
  userPostController.likeAndUnlikeUserPost
);

userPostRouter.post(
  "/commentUserPost/:postId",
  limiter,
  verifyUserToken,
  validateRequest(userCommentPostSchema),
  userPostController.commentUserPost
);

userPostRouter.post(
  "/likeAndReplyOnUserPostComment/:commentId",
  limiter,
  verifyUserToken,
  validateRequest(userLikeAndReplyCommentPostSchema),
  userPostController.likeAndReplyOnUserPostComment
);

userPostRouter.get(
  "/showUserPostCommentLikeReply",
  limiter,
  verifyUserToken,
  userPostController.showUserPostCommentLikeReply
);




module.exports = userPostRouter;