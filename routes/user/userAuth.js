const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");


const userAuthRouter = require("express").Router();
const userAuthController = require("../../controllers/user/userAuthController");
const { userRegisterSchema, userVerifyOtpSchema, userForgetPasswordSchema, userResetPasswordSchema, userLoginSchema, userEditProfileSchema, userResendOtpSchema, createProfileSchema, submitFeedBackSchema } = require("../../schema/user/auth");
const { verifyUserToken } = require("../../middleware/auth");
const handleMultiPartData = require("../../middleware/multiPartData");

userAuthRouter.post(
  "/userRegister",
  validateRequest(userRegisterSchema),
  userAuthController.userRegister
);

userAuthRouter.get(
  "/getInterest",
  userAuthController.getInterest
);

userAuthRouter.post(
  "/userVerifyOtp",
  validateRequest(userVerifyOtpSchema),
  userAuthController.userVerifyOtp
);

userAuthRouter.post(
  "/userForgetPassword",
  validateRequest(userForgetPasswordSchema),
  userAuthController.userForgetPassword
);

userAuthRouter.put(
  "/userResetPassword",
  verifyUserToken,
  validateRequest(userResetPasswordSchema),
  userAuthController.userResetPassword
);

userAuthRouter.post(
  "/userLogin",
  validateRequest(userLoginSchema),
  userAuthController.userLogin
);

userAuthRouter.put(
  "/userEditProfile",
  verifyUserToken,
  validateRequest(userEditProfileSchema),
  handleMultiPartData.single("image"),
  userAuthController.userEditProfile
);

userAuthRouter.post(
  "/userLogOut",
  verifyUserToken,
  userAuthController.userLogOut
);

userAuthRouter.delete(
  "/userDeleteAcccount",
  verifyUserToken,
  userAuthController.userDeleteAccount
);

userAuthRouter.post(
  "/resendOtp",
  validateRequest(userResendOtpSchema),
  userAuthController.resendOtp
);


userAuthRouter.post(
  "/createProfile",
  verifyUserToken,
  validateRequest(createProfileSchema),
  userAuthController.createProfile
);

userAuthRouter.get(
  "/getMe",
  verifyUserToken,
  userAuthController.getMe
);

userAuthRouter.post(
  "/submitFeedBack",
  verifyUserToken,
  validateRequest(submitFeedBackSchema),
  userAuthController.submitFeedBack
)
userAuthRouter.get(
  "/getUserContext",
  verifyUserToken,
  userAuthController.getUserContext
);




module.exports = userAuthRouter;
