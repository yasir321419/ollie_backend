const rateLimit = require("express-rate-limit");

// Standard rate limiter for regular endpoints
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 10 * 60 * 1000, // 10 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // Limit each IP
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: false,
  // Skip failed requests  
  skipFailedRequests: false,
  // Custom key generator for better IP detection
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

// AI-specific rate limiter (more restrictive)
const aiLimiter = rateLimit({
  windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW) || 30 * 1000, // 30 seconds  
  max: parseInt(process.env.AI_RATE_LIMIT_MAX) || 15, // Allow more for AI
  message: {
    success: false,
    message: "Too many AI requests from this IP, please try again after 30 seconds.",
    retryAfter: 30
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Skip rate limiting for authenticated requests with valid premium subscriptions
  skip: (req) => {
    // Could add logic here to skip rate limiting for premium users
    return false;
  }
});

// Strict limiter for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Very restrictive
  message: {
    success: false,
    message: "Too many sensitive requests from this IP, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// For backward compatibility - existing routes expect default export
module.exports = limiter;
// Named exports for AI routes
module.exports.limiter = limiter;
module.exports.aiLimiter = aiLimiter;
module.exports.strictLimiter = strictLimiter;
