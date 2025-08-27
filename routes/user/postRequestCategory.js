const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");

const userPostRequestRouter = require("express").Router();
const userPostRequestController = require("../../controllers/user/userPostRequestController");
const { verifyUserToken } = require("../../middleware/auth");
const { userCreatePostRequestSchema, userSendVolunteerRequestSchema, userAcceptVolunteerRequestSchema, userShowPostRequestSchema, volunteerMarkSchema, ownerMarkSchema } = require("../../schema/user/postrequest");

userPostRequestRouter.get(
  "/getPostRequestCaterogy",
  limiter,
  verifyUserToken,
  userPostRequestController.getPostRequestCaterogy
);

userPostRequestRouter.post(
  "/createPostRequest",
  limiter,
  verifyUserToken,
  validateRequest(userCreatePostRequestSchema),
  userPostRequestController.createPostRequest
);

userPostRequestRouter.get(
  "/getUserPostRequest",
  limiter,
  verifyUserToken,
  validateRequest(userShowPostRequestSchema),
  userPostRequestController.getUserPostRequest
);

userPostRequestRouter.get(
  "/getAllPostRequest",
  limiter,
  verifyUserToken,
  validateRequest(userShowPostRequestSchema),
  userPostRequestController.getAllPostRequest
);

userPostRequestRouter.post(
  "/sendVolunteerRequest/:postId",
  limiter,
  verifyUserToken,
  validateRequest(userSendVolunteerRequestSchema),
  userPostRequestController.sendVolunteerRequest
);

userPostRequestRouter.post(
  "/acceptVolunteerRequest/:requestId",
  limiter,
  verifyUserToken,
  validateRequest(userAcceptVolunteerRequestSchema),
  userPostRequestController.acceptVolunteer
);

userPostRequestRouter.post(
  "/markAsCompletedByVolunteer/:requestId",
  limiter,
  verifyUserToken,
  validateRequest(volunteerMarkSchema),
  userPostRequestController.markAsCompletedByVolunteer
);

userPostRequestRouter.post(
  "/confirmTaskCompletedByOwner/:requestId",
  limiter,
  verifyUserToken,
  validateRequest(ownerMarkSchema),
  userPostRequestController.confirmTaskCompletedByOwner
);


userPostRequestRouter.get(
  "/getAllVolenteerCompletedPost/:requestId",
  limiter,
  verifyUserToken,
  validateRequest(userAcceptVolunteerRequestSchema),
  userPostRequestController.getAllVolenteerCompletedPost
);

userPostRequestRouter.get(
  "/getAllVolenteerRequest",
  limiter,
  verifyUserToken,
  validateRequest(userShowPostRequestSchema),
  userPostRequestController.getAllVolunteerRequest
);

module.exports = userPostRequestRouter