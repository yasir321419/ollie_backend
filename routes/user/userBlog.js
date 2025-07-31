const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const userBlogRouter = require("express").Router();
const userBlogController = require("../../controllers/user/userBlogController");
const { verifyUserToken } = require("../../middleware/auth");
const { userBlogByCategorySchema, userSingleBlogSchema, useLikeAndUnlikeBlogSchema, userSaveBlogSchema, userLikeAndReplyCommentBlogSchema, userCommentBlogSchema, getBlogByTypeSchema, getFilterBlogSchema, userSaveFavouriteTopicSchema, userShowLatestBlogSchema } = require("../../schema/user/blog");


userBlogRouter.get(
  "/getAllTopics",
  limiter,
  verifyUserToken,
  userBlogController.getAllTopics
);

userBlogRouter.get(
  "/getAllBlogByTopics/:topicsId",
  limiter,
  verifyUserToken,
  validateRequest(userBlogByCategorySchema),
  userBlogController.getAllBlogByTopics
);

userBlogRouter.get(
  "/getAllLatestBlog",
  limiter,
  verifyUserToken,
  validateRequest(userShowLatestBlogSchema),
  userBlogController.getAllLatestBlog
);

userBlogRouter.get(
  "/getSingleBlog/:blogId",
  limiter,
  verifyUserToken,
  validateRequest(userSingleBlogSchema),
  userBlogController.getSingleBlog
);

userBlogRouter.post(
  "/likeAndUnlikeBlog/:blogId",
  limiter,
  verifyUserToken,
  validateRequest(useLikeAndUnlikeBlogSchema),
  userBlogController.likeAndUnlikeBlog
);

userBlogRouter.post(
  "/saveBlog/:blogId",
  limiter,
  verifyUserToken,
  validateRequest(userSaveBlogSchema),
  userBlogController.saveBlog
);

userBlogRouter.get(
  "/showSaveBlog",
  limiter,
  verifyUserToken,
  validateRequest(userShowLatestBlogSchema),
  userBlogController.showSaveBlog
);

userBlogRouter.post(
  "/commentBlog/:blogId",
  limiter,
  verifyUserToken,
  validateRequest(userCommentBlogSchema),
  userBlogController.commentBlog
);

userBlogRouter.post(
  "/likeAndReplyOnComment/:commentId",
  limiter,
  verifyUserToken,
  validateRequest(userLikeAndReplyCommentBlogSchema),
  userBlogController.likeAndReplyOnComment
);

userBlogRouter.get(
  "/getCommentsLikeReply/:postId",
  limiter,
  verifyUserToken,
  userBlogController.getCommentsLikeReply
);

userBlogRouter.get(
  "/getBlogByType",
  limiter,
  verifyUserToken,
  validateRequest(getBlogByTypeSchema),
  userBlogController.getBlogByType
);

userBlogRouter.get(
  "/getFilterBlog",
  limiter,
  verifyUserToken,
  validateRequest(getFilterBlogSchema),
  userBlogController.getFilterBlog
);

userBlogRouter.post(
  "/saveFavouriteTopic/:topicId",
  limiter,
  verifyUserToken,
  validateRequest(userSaveFavouriteTopicSchema),
  userBlogController.saveFavoriteTopic
);

userBlogRouter.get(
  "/getFavoriteTopics",
  limiter,
  verifyUserToken,
  userBlogController.getFavoriteTopics
);




module.exports = userBlogRouter;