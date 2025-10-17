const { handlerError } = require("../resHandler/responseHandler");

const globalErrorMiddleware = (err, req, res, next) => {
  const statusCode = err.status ?? 500;
  let message = err.message ?? "Internal Server Error";

  // Log error details for debugging (never expose in production response)
  // const errorDetails = {
  //   message: err.message,
  //   stack: err.stack,
  //   url: req.url,
  //   method: req.method,
  //   ip: req.ip,
  //   userAgent: req.get('User-Agent'),
  //   timestamp: new Date().toISOString(),
  //   userId: req.user?.id || 'anonymous'
  // };

  // Log full error details for server monitoring
  // console.error('🚨 Application Error:', errorDetails);

  // In production, don't expose sensitive error details
  if (process.env.NODE_ENV === 'production') {
    // Only expose safe, user-friendly messages
    switch (statusCode) {
      case 400:
        message = err.message || "Invalid request data";
        break;
      case 401:
        message = err.message || "Authentication required";
        break;
      case 403:
        message = err.message || "Access denied";
        break;
      case 404:
        message = err.message || "Resource not found";
        break;
      case 409:
        message = err.message || "Conflict";
        break;
      case 429:
        message = err.message || "Too many requests";
        break;
      case 500:
      default:
        message = err.message || "Internal server error";
        break;
    }
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Joi validation errors
    const validationMessage = err.details ?
      err.details.map(detail => detail.message).join(', ') :
      'Validation failed';
    handlerError(res, 400, null, validationMessage);
    return;
  }

  if (err.name === 'CastError') {
    handlerError(res, 400, null, 'Invalid ID format');
    return;
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    handlerError(res, 500, null, 'Database error');
    return;
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    handlerError(res, 400, null, 'File too large');
    return;
  }

  // Handle Prisma errors
  if (err.code?.startsWith('P')) {
    let prismaMessage = 'Database operation failed';
    switch (err.code) {
      case 'P2002':
        prismaMessage = 'Duplicate entry found';
        break;
      case 'P2025':
        prismaMessage = 'Record not found';
        break;
      case 'P2003':
        prismaMessage = 'Foreign key constraint failed';
        break;
    }
    handlerError(res, 400, null, prismaMessage);
    return;
  }

  handlerError(res, statusCode, null, message);
};

module.exports = globalErrorMiddleware;
