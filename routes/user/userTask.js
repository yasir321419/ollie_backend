const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const userTaskRouter = require("express").Router();
const userTaskController = require("../../controllers/user/userTaskController");
const { verifyUserToken } = require("../../middleware/auth");
const { userCreateTaskSchema, userMarkAsCompletedTaskSchema, userGetTaskByDateSchema, userShowTaskSchema } = require("../../schema/user/task");


userTaskRouter.post(
  "/createUserTask",
  limiter,
  verifyUserToken,
  validateRequest(userCreateTaskSchema),
  userTaskController.createUserTask
);


userTaskRouter.get(
  "/getAllUserTask",
  limiter,
  verifyUserToken,
  validateRequest(userShowTaskSchema),
  userTaskController.getUserTask
);

userTaskRouter.put(
  "/markAsCompletedTask/:taskId",
  limiter,
  verifyUserToken,
  validateRequest(userMarkAsCompletedTaskSchema),
  userTaskController.markAsCompletedTask
);


userTaskRouter.get(
  "/getTaskByDate",
  limiter,
  verifyUserToken,
  validateRequest(userGetTaskByDateSchema),
  userTaskController.getTaskByDate
);

module.exports = userTaskRouter;