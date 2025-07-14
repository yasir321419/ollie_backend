const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware//validateRequest");


const adminBlogRequestCategoryRouter = require("express").Router();
const adminBlogRequestCategoryController = require("../../controllers/admin/adminRequestPostCategoryController");
const { verifyAdminToken } = require("../../middleware/auth");
const { adminCreateRequestPostCategorySchema, adminUpdateRequestPostCategorySchema, adminDeleteRequestPostCategorySchema } = require("../../schema/admin/postrequestcategory");

adminBlogRequestCategoryRouter.post(
  "/createRequestPostCategory",
  limiter,
  verifyAdminToken,
  validateRequest(adminCreateRequestPostCategorySchema),
  adminBlogRequestCategoryController.createRequestPostCategory
);

adminBlogRequestCategoryRouter.get(
  "/getRequestPostCategory",
  limiter,
  verifyAdminToken,
  adminBlogRequestCategoryController.getRequestPostCategory
);

adminBlogRequestCategoryRouter.put(
  "/updateRequestPostCategory/:requestCategoryId",
  limiter,
  verifyAdminToken,
  validateRequest(adminUpdateRequestPostCategorySchema),
  adminBlogRequestCategoryController.updateRequestPostCategory
);

adminBlogRequestCategoryRouter.delete(
  "/deleteRequestPostCategory/:requestCategoryId",
  limiter,
  verifyAdminToken,
  validateRequest(adminDeleteRequestPostCategorySchema),
  adminBlogRequestCategoryController.deleteRequestPostCategory
);



module.exports = adminBlogRequestCategoryRouter;