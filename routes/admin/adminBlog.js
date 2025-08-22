const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");


const adminBlogRouter = require("express").Router();
const adminBlogController = require("../../controllers/admin/adminBlogController");
const { adminCreateBlogSchema, adminUpdateBlogSchema, adminDeleteBlogSchema } = require("../../schema/admin/blog");
const handleMultiPartData = require("../../middleware/multiPartData");
const { verifyAdminToken } = require("../../middleware/auth");

adminBlogRouter.post(
  "/createBlog/:categoryId",
  limiter,
  verifyAdminToken,
  validateRequest(adminCreateBlogSchema),
  handleMultiPartData.single("image"),
  adminBlogController.createBlog
);


adminBlogRouter.get(
  "/getAllBlogs",
  limiter,
  verifyAdminToken,
  adminBlogController.getAllBlogs
);

adminBlogRouter.put(
  "/updateBlog/:postId",
  limiter,
  verifyAdminToken,
  validateRequest(adminUpdateBlogSchema),
  handleMultiPartData.single("image"),
  adminBlogController.updateBlog
);

adminBlogRouter.delete(
  "/deleteBlog/:postId",
  limiter,
  verifyAdminToken,
  validateRequest(adminDeleteBlogSchema),
  adminBlogController.deleteBlog
);


module.exports = adminBlogRouter;