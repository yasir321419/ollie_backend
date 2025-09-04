const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");


const adminPostRouter = require("express").Router();
const adminPostController = require("../../controllers/admin/adminPostController");
const { adminCreateBlogSchema, adminUpdateBlogSchema, adminDeleteBlogSchema } = require("../../schema/admin/blog");
const handleMultiPartData = require("../../middleware/multiPartData");
const { verifyAdminToken } = require("../../middleware/auth");

adminPostRouter.post(
  "/createPost/:categoryId",
  limiter,
  verifyAdminToken,
  validateRequest(adminCreateBlogSchema),
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
  validateRequest(adminUpdateBlogSchema),
  handleMultiPartData.single("image"),
  adminPostController.updatePost
);

adminPostRouter.delete(
  "/deletePost/:postId",
  limiter,
  verifyAdminToken,
  validateRequest(adminDeleteBlogSchema),
  adminPostController.deletePost
);

adminPostRouter.get(
  "/userFeedBack",
  limiter,
  verifyAdminToken,
  adminPostController.userFeedBack
);


module.exports = adminPostRouter;