const limiter = require("../../middleware/limiter");
const userCreditRouter = require("express").Router();
const userCreditController = require("../../controllers/user/userCreditController");
const { verifyUserToken } = require("../../middleware/auth");
const validateRequest = require("../../middleware/validateRequest");
const { userBuyCreditSchema, userCheckWalletSchema, userUpgradeSubscriptionSchema, userdonateNowSchema, userShowDonationHistorySchema } = require("../../schema/user/credit");


userCreditRouter.get(
  "/showUserCredit",
  limiter,
  verifyUserToken,
  userCreditController.showUserCredit
);

userCreditRouter.post(
  "/buyCredit/:creditId",
  limiter,
  verifyUserToken,
  validateRequest(userBuyCreditSchema),
  userCreditController.buyCredit
);

userCreditRouter.get(
  "/checkWalletAmountForCredit/:creditId",
  limiter,
  verifyUserToken,
  validateRequest(userCheckWalletSchema),
  userCreditController.checkWalletAmountForCredit
);

userCreditRouter.put(
  "/upgradeSubscription/:subscriptionId",
  limiter,
  verifyUserToken,
  validateRequest(userUpgradeSubscriptionSchema),
  userCreditController.upgradeSubscription
);

userCreditRouter.post(
  "/donateNow",
  limiter,
  verifyUserToken,
  validateRequest(userdonateNowSchema),
  userCreditController.donateNow
);

userCreditRouter.get(
  "/showDonationHistory",
  limiter,
  verifyUserToken,
  validateRequest(userShowDonationHistorySchema),
  userCreditController.showDonationHistory
);

module.exports = userCreditRouter;