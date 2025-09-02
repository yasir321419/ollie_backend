const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const userPostRouter = require("express").Router();
const userPostController = require("../../controllers/user/userPostController");
const { verifyUserToken } = require("../../middleware/auth");
const { userCreatePostSchema, userShowSinglePostSchema, userCommentPostSchema, userLikeAndReplyCommentPostSchema, userUpdatePostSchema, userAllPostSchema, userShowPostByInterestSchema, userLikeAndUnlikePostSchema, userLikeAndReplyPostCommentSchema, userReportPostSchema } = require("../../schema/user/post");
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
  "/likeAndUnlikePost", // No need for dynamic route parameters here
  limiter,
  verifyUserToken,
  validateRequest(userLikeAndUnlikePostSchema),
  userPostController.likeAndUnlikePost
);

userPostRouter.post(
  "/comment", // Route without :type or :postId in the URL
  limiter,
  verifyUserToken,
  validateRequest(userCommentPostSchema),
  userPostController.commentPost
);

userPostRouter.post(
  "/likeAndReplyOnComment", // No more commentId in URL; it's passed in the body
  limiter,
  verifyUserToken,
  validateRequest(userLikeAndReplyPostCommentSchema),
  userPostController.likeAndReplyOnComment
);

userPostRouter.post(
  "/showPostCommentLikeReply",  // Route without type and postId in the URL
  userPostController.showPostCommentLikeReply
);


userPostRouter.get(
  "/showAllPostByInterest/:topicsId",
  limiter,
  verifyUserToken,
  validateRequest(userShowPostByInterestSchema),
  userPostController.showAllPostByInterest
);

userPostRouter.get(
  "/showAllPostByUserSelectedInterest",
  limiter,
  verifyUserToken,
  userPostController.showAllPostByUserSelectedInterest
);


userPostRouter.put(
  "/userReportPost/:postId",
  limiter,
  verifyUserToken,
  validateRequest(userReportPostSchema),
  userPostController.userReportPost
);



module.exports = userPostRouter;