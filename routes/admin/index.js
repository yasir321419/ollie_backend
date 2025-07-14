const adminRouter = require("express").Router();
const adminAuthRouter = require("./adminAuth");
const adminInterestRouter = require("./adminInterest");
// const adminBlogCategoryRouter = require("./adminPostCategory")
const adminPostRouter = require("./adminPost")
const adminBlogRequestCategoryRouter = require("./adminPostRequestCategory")
const adminEventRouter = require("./adminEvent");
const adminContentRouter = require("./adminContent");
const adminCreditRouter = require("./adminCredit");



adminRouter.use("/auth", adminAuthRouter);
adminRouter.use("/interest", adminInterestRouter);
// adminRouter.use("/blogCategory", adminBlogCategoryRouter);
adminRouter.use("/blog", adminPostRouter);
adminRouter.use("/blogRequestCategory", adminBlogRequestCategoryRouter);
adminRouter.use("/event", adminEventRouter);
adminRouter.use("/content", adminContentRouter);
adminRouter.use("/credit", adminCreditRouter);







module.exports = adminRouter;