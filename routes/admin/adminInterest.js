const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware//validateRequest");


const adminInterestRouter = require("express").Router();
const adminInterestController = require("../../controllers/admin/adminInterestController");
const { adminCreateUserInterestSchema, adminUpdateUserInterestSchema, adminDeleteUserInterestSchema } = require("../../schema/admin/interest");
const { verifyAdminToken } = require("../../middleware/auth");



adminInterestRouter.post(
  "/createUserInterest",
  limiter,
  verifyAdminToken,
  validateRequest(adminCreateUserInterestSchema),
  adminInterestController.createUserInterest
);

adminInterestRouter.get(
  "/getUserInterest",
  limiter,
  verifyAdminToken,
  adminInterestController.getUserInterest
);

adminInterestRouter.put(
  "/updateUserInterest/:interestId",
  limiter,
  verifyAdminToken,
  validateRequest(adminUpdateUserInterestSchema),
  adminInterestController.updateUserInterest
);

adminInterestRouter.delete(
  "/deleteUserInterest/:interestId",
  limiter,
  verifyAdminToken,
  validateRequest(adminDeleteUserInterestSchema),
  adminInterestController.deleteUserInterest
);


module.exports = adminInterestRouter;
