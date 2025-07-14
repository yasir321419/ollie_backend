const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");


const userEventRouter = require("express").Router();
const userEventController = require("../../controllers/user/userEventController");
const { verifyUserToken } = require("../../middleware/auth");
const { userMarkAsGoingSchema, userShowEventNearBySchema } = require("../../schema/user/event");


userEventRouter.get(
  "/showLatestEvent",
  limiter,
  verifyUserToken,
  userEventController.showLatestEvent
);

userEventRouter.get(
  "/showAllEventNearBy",
  limiter,
  verifyUserToken,
  validateRequest(userShowEventNearBySchema),
  userEventController.showAllEventNearBy
);

userEventRouter.put(
  "/markAsGoing/:eventId",
  limiter,
  verifyUserToken,
  validateRequest(userMarkAsGoingSchema),
  userEventController.markAsGoing
);

userEventRouter.get(
  "/showMarkAsGoingEvents",
  limiter,
  verifyUserToken,
  validateRequest(userShowEventNearBySchema),
  userEventController.showMarkAsGoingEvents
);

module.exports = userEventRouter;