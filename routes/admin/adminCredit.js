const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware//validateRequest");


const adminCreditRouter = require("express").Router();
const adminCreditController = require("../../controllers/admin/adminCreditController");
const { verifyAdminToken } = require("../../middleware/auth");
const { adminCreatePrivacyPolicySchema, adminUpdatePrivacyPolicySchema, adminCreateTermsConditionSchema, adminUpdateTermsConditionSchema, adminCreateFaqsSchema, adminUpdateFaqsSchema, adminDeleteFaqsSchema } = require("../../schema/admin/content");
const { adminCreateCreditSchema, adminUpdateCreditSchema, adminDeleteCreditSchema } = require("../../schema/admin/credit");

adminCreditRouter.post("/createCredit",
  limiter,
  verifyAdminToken,
  validateRequest(adminCreateCreditSchema),
  adminCreditController.createCredit
);

adminCreditRouter.get("/showCredit",
  limiter,
  verifyAdminToken,
  adminCreditController.showCredit
);

adminCreditRouter.put("/updateCredit/:creditId",
  limiter,
  verifyAdminToken,
  validateRequest(adminUpdateCreditSchema),
  adminCreditController.updateCredit
);

adminCreditRouter.delete("/deleteCredit/:creditId",
  limiter,
  verifyAdminToken,
  validateRequest(adminDeleteCreditSchema),
  adminCreditController.deleteCredit
);

module.exports = adminCreditRouter;