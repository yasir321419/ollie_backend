const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware//validateRequest");


const adminPostRouter = require("express").Router();
const adminPostController = require("../../controllers/admin/adminBlogController");
const { adminCreatePostSchema, adminUpdatePostSchema, adminDeletePostSchema } = require("../../schema/admin/post");
const handleMultiPartData = require("../../middleware/multiPartData");
const { verifyAdminToken } = require("../../middleware/auth");

adminPostRouter.post(
  "/createPost/:categoryId",
  limiter,
  verifyAdminToken,
  validateRequest(adminCreatePostSchema),
  handleMultiPartData.single("image"),
  adminPostController.createPost
);


adminPostRouter.get(
  "/getAllPosts",
  limiter,
  verifyAdminToken,
  adminPostController.getAllPosts
);

adminPostRouter.put(
  "/updatePost/:postId",
  limiter,
  verifyAdminToken,
  validateRequest(adminUpdatePostSchema),
  handleMultiPartData.single("image"),
  adminPostController.updatePost
);

adminPostRouter.delete(
  "/deletePost/:postId",
  limiter,
  verifyAdminToken,
  validateRequest(adminDeletePostSchema),
  adminPostController.deletePost
);


module.exports = adminPostRouter;