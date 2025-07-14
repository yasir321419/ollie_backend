const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware//validateRequest");


const adminEventRouter = require("express").Router();
const adminEventController = require("../../controllers/admin/admineventController");
const { verifyAdminToken } = require("../../middleware/auth");
const handleMultiPartData = require("../../middleware/multiPartData");
const { adminCreateEventSchema, adminUpdateEventSchema, adminDeleteEventSchema } = require("../../schema/admin/event");

adminEventRouter.post("/createEvent",
  limiter,
  verifyAdminToken,
  validateRequest(adminCreateEventSchema),
  handleMultiPartData.single("image"),
  adminEventController.createEvent
);

adminEventRouter.get("/showAllEvents",
  limiter,
  verifyAdminToken,
  adminEventController.showAllEvents
);

adminEventRouter.put("/updateEvent/:eventId",
  limiter,
  verifyAdminToken,
  validateRequest(adminUpdateEventSchema),
  handleMultiPartData.single("image"),
  adminEventController.updateEvent
);

adminEventRouter.delete("/deleteEvent/:eventId",
  limiter,
  verifyAdminToken,
  validateRequest(adminDeleteEventSchema),
  adminEventController.deleteEvent
);

module.exports = adminEventRouter;