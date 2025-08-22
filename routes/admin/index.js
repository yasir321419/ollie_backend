const adminRouter = require("express").Router();
const adminAuthRouter = require("./adminAuth");
const adminInterestRouter = require("./adminInterest");
// const adminBlogCategoryRouter = require("./adminPostCategory")
const adminBlogRouter = require("./adminBlog")
const adminBlogRequestCategoryRouter = require("./adminPostRequestCategory")
const adminEventRouter = require("./adminEvent");
const adminContentRouter = require("./adminContent");
const adminCreditRouter = require("./adminCredit");
const adminPostRouter = require("./adminPost");


adminRouter.use("/auth", adminAuthRouter);
adminRouter.use("/interest", adminInterestRouter);
// adminRouter.use("/blogCategory", adminBlogCategoryRouter);
adminRouter.use("/blog", adminBlogRouter);
adminRouter.use("/blogRequestCategory", adminBlogRequestCategoryRouter);
adminRouter.use("/event", adminEventRouter);
adminRouter.use("/content", adminContentRouter);
adminRouter.use("/credit", adminCreditRouter);
adminRouter.use("/post", adminPostRouter);








module.exports = adminRouter;