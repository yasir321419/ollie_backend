const userRouter = require("express").Router();
const userAuthRouter = require("./userAuth");
const userTaskRouter = require("./userTask");
const userBlogRouter = require("./userBlog");
const userPostRequestRouter = require("./postRequestCategory");
const userChatRouter = require("./userChat");
const userPostRouter = require("./userPost");
const userEventRouter = require("./userEvent");
const userContentRouter = require("./userContent");
const userCreditRouter = require("./userCredit")
const userNotificationRouter = require("./userNotification");


userRouter.use("/auth", userAuthRouter);
userRouter.use("/task", userTaskRouter);
userRouter.use("/blog", userBlogRouter);
userRouter.use("/postrequest", userPostRequestRouter);
userRouter.use("/chat", userChatRouter);
userRouter.use("/post", userPostRouter);
userRouter.use("/event", userEventRouter);
userRouter.use("/content", userContentRouter);
userRouter.use("/credit", userCreditRouter);
userRouter.use("/notification", userNotificationRouter);










module.exports = userRouter;
