const express = require("express");
const router = express.Router();
const { verifyUserToken } = require("../../middleware/auth");
const { aiLimiter, limiter } = require("../../middleware/limiter");
const aiToolController = require("../controllers/userInfoController");
const validateRequest = require("../../middleware/validateRequest");
// const {
//   aiCreatePostSchema,
//   aiUpdateContextSchema,
//   aiCreateTaskSchema,
//   aiCreateHelpRequestSchema
// } = require("../../schema/ai/aiTools");

// Get user information for AI context
router.get(
  "/getUserInfo",
  aiLimiter,
  verifyUserToken,
  aiToolController.getUserInfo
);

// Get user tasks (with optional filter)
router.get(
  "/getUserTasks",
  aiLimiter,
  verifyUserToken,
  aiToolController.getUserTasks
);

// Create a new task for user
router.post(
  "/createTask",
  aiLimiter,
  verifyUserToken,
  // validateRequest(aiCreateTaskSchema),
  aiToolController.createUserTask
);

// Mark task as complete
router.put(
  "/completeTask/:taskId",
  aiLimiter,
  verifyUserToken,
  aiToolController.markTaskComplete
);

// Get blog titles (free - no subscription/credit check)
router.get(
  "/getBlogTitles",
  aiLimiter,
  verifyUserToken,
  aiToolController.getBlogTitles
);

// Get specific blog content (requires subscription/credits)
router.get(
  "/getBlogContent/:blogId",
  aiLimiter,
  verifyUserToken,
  aiToolController.getBlogContent
);

// Get latest blogs (requires subscription/credits)
router.get(
  "/getLatestBlogs",
  aiLimiter,
  verifyUserToken,
  aiToolController.getLatestBlogs
);

// Get latest events
router.get(
  "/getLatestEvents",
  aiLimiter,
  verifyUserToken,
  aiToolController.getLatestEvents
);

// Get user social media activity information
router.get(
  "/getUserSocialInfo",
  aiLimiter,
  verifyUserToken,
  aiToolController.getUserSocialInfo
);

// Get user request information for AI analysis (volunteer activities only)
router.get(
  "/getUserRequestInfo",
  aiLimiter,
  verifyUserToken,
  aiToolController.getUserRequestInfo
);

// Get user financial information
router.get(
  "/getUserFinancialInfo",
  limiter,
  verifyUserToken,
  aiToolController.getUserFinancialInfo
);

// Get user chat rooms with recent messages
router.get(
  "/getUserChatRooms",
  limiter,
  verifyUserToken,
  aiToolController.getUserChatRooms
);

// Get specific chat room details and messages
router.get(
  "/getChatRoomDetails/:chatRoomId",
  limiter,
  verifyUserToken,
  aiToolController.getChatRoomDetails
);

// Create a new post for user
router.post(
  "/createPost",
  aiLimiter,
  verifyUserToken,
  // validateRequest(aiCreatePostSchema),
  aiToolController.createUserPost
);

// Create a help request for volunteers
router.post(
  "/createHelpRequest",
  limiter,
  verifyUserToken,
  // validateRequest(aiCreateHelpRequestSchema),
  aiToolController.createHelpRequest
);

// Update user's additional context
router.post(
  "/updateContext",
  aiLimiter,
  verifyUserToken,
  // validateRequest(aiUpdateContextSchema),
  aiToolController.updateUserContext
);

// Health check endpoint for AI services
router.get(
  "/health",
  (req, res) => {
    res.json({
      success: true,
      message: "AI services are healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  }
);

module.exports = router;