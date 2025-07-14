const limiter = require("../../middleware/limiter");
const userContentRouter = require("express").Router();
const userContentController = require("../../controllers/user/userContentController");
const { verifyUserToken } = require("../../middleware/auth");


userContentRouter.get(
  "/userPrivacyPolicy",
  limiter,
  verifyUserToken,
  userContentController.userPrivacyPolicy
);

userContentRouter.get(
  "/userTermsCondition",
  limiter,
  verifyUserToken,
  userContentController.userTermsCondition
);

userContentRouter.get(
  "/userFaqs",
  limiter,
  verifyUserToken,
  userContentController.userFaqs
);

module.exports = userContentRouter;