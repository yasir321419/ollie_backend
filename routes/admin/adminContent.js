const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware//validateRequest");


const adminContentRouter = require("express").Router();
const adminContentController = require("../../controllers/admin/adminContentController");
const { verifyAdminToken } = require("../../middleware/auth");
const { adminCreatePrivacyPolicySchema, adminUpdatePrivacyPolicySchema, adminCreateTermsConditionSchema, adminUpdateTermsConditionSchema, adminCreateFaqsSchema, adminUpdateFaqsSchema, adminDeleteFaqsSchema } = require("../../schema/admin/content");

adminContentRouter.get("/showAllUsers",
  // limiter,
  verifyAdminToken,
  adminContentController.showAllUsers
);

adminContentRouter.get("/countUsers",
  // limiter,
  verifyAdminToken,
  adminContentController.countUsers
);

adminContentRouter.get("/androidUsers",
  // limiter,
  verifyAdminToken,
  adminContentController.androidUsers
);

adminContentRouter.get("/iosUsers",
  // limiter,
  verifyAdminToken,
  adminContentController.iosUsers
);


adminContentRouter.post("/createPrivacyPolicy",
  limiter,
  verifyAdminToken,
  validateRequest(adminCreatePrivacyPolicySchema),
  adminContentController.createPrivacyPolicy
);

adminContentRouter.get("/showPrivacyPolicy",
  limiter,
  verifyAdminToken,
  adminContentController.showPrivacyPolicy
);

adminContentRouter.put("/updatePrivacyPolicy/:privacyId",
  limiter,
  verifyAdminToken,
  validateRequest(adminUpdatePrivacyPolicySchema),
  adminContentController.updatePrivacyPolicy
);

adminContentRouter.post("/createTermsAndCondition",
  limiter,
  verifyAdminToken,
  validateRequest(adminCreateTermsConditionSchema),
  adminContentController.createTermsAndCondition
);

adminContentRouter.get("/showTermsAndCondition",
  limiter,
  verifyAdminToken,
  adminContentController.showTermsAndCondition
);

adminContentRouter.put("/updateTermsAndCondition/:termsId",
  limiter,
  verifyAdminToken,
  validateRequest(adminUpdateTermsConditionSchema),
  adminContentController.updateTermsAndCondition
);


adminContentRouter.post("/createFaqs",
  limiter,
  verifyAdminToken,
  validateRequest(adminCreateFaqsSchema),
  adminContentController.createFaqs
);

adminContentRouter.get("/showFaqs",
  limiter,
  verifyAdminToken,
  adminContentController.showFaqs
);

adminContentRouter.put("/updateFaqs/:faqId",
  limiter,
  verifyAdminToken,
  validateRequest(adminUpdateFaqsSchema),
  adminContentController.updateFaqs
);


adminContentRouter.delete("/deleteFaqs/:faqId",
  limiter,
  verifyAdminToken,
  validateRequest(adminDeleteFaqsSchema),
  adminContentController.deleteFaqs
);



module.exports = adminContentRouter;