// const limiter = require("../../middleware/limiter");
// const validateRequest = require("../../middleware//validateRequest");


// const adminBlogCategoryRouter = require("express").Router();
// const adminBlogCategoryController = require("../../controllers/admin/adminBlogCategoryController");
// const { verifyAdminToken } = require("../../middleware/auth");
// const { adminCreatePostCategorySchema, adminUpdatePostCategorySchema, adminDeletePostCategorySchema } = require("../../schema/admin/postcategory");

// adminBlogCategoryRouter.post(
//   "/createPostCategory",
//   limiter,
//   verifyAdminToken,
//   validateRequest(adminCreatePostCategorySchema),
//   adminBlogCategoryController.createPostCategory
// );

// adminBlogCategoryRouter.get(
//   "/getPostCategory",
//   limiter,
//   verifyAdminToken,
//   adminBlogCategoryController.getPostCategory
// );

// adminBlogCategoryRouter.put(
//   "/updatePostCategory/:categoryId",
//   limiter,
//   verifyAdminToken,
//   validateRequest(adminUpdatePostCategorySchema),
//   adminBlogCategoryController.updatePostCategory
// );

// adminBlogCategoryRouter.delete(
//   "/deletePostCategory/:categoryId",
//   limiter,
//   verifyAdminToken,
//   validateRequest(adminDeletePostCategorySchema),
//   adminBlogCategoryController.deletePostCategory
// );



// module.exports = adminBlogCategoryRouter;