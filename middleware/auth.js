const jwt = require("jsonwebtoken");
const {
  BadRequestError,
  UnAuthorizedError,
  NotFoundError,
} = require("../resHandler/CustomError");
const prisma = require("../config/prismaConfig");
require("dotenv").config();

const verifyUserToken = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"] || req.headers["authorization"]?.split(" ")[1];

    if (!token || token === "" || token === undefined || token === false) {
      throw new BadRequestError("A token is required for authentication");
    }

    // Verify token and check expiration
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    
    // Additional security: Check if token is expired (redundant but safe)
    if (decode.exp && decode.exp < Math.floor(Date.now() / 1000)) {
      throw new UnAuthorizedError("Token has expired");
    }

    // Validate required token fields
    if (!decode.id || !decode.userType) {
      throw new UnAuthorizedError("Invalid token payload");
    }

    const userId = decode.id;
    const userType = decode.userType;

    // Only allow USER type for user endpoints
    if (userType !== "USER") {
      throw new UnAuthorizedError("Invalid user type for this endpoint");
    }

    const findUser = await prisma.user.findFirst({
      where: {
        id: userId,
        userType: userType,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        deviceToken: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!findUser) {
      throw new NotFoundError("User not found or inactive");
    }

    req.user = findUser;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnAuthorizedError("Token has expired"));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new UnAuthorizedError("Invalid token format"));
    }

    if (error.name === "NotBeforeError") {
      return next(new UnAuthorizedError("Token not yet valid"));
    }

    return next(error);
  }
};

const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"] || req.headers["authorization"]?.split(" ")[1];

    if (!token || token === "" || token === undefined || token === false) {
      throw new BadRequestError("A token is required for authentication");
    }

    // Verify token and check expiration
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    
    // Additional security: Check if token is expired (redundant but safe)
    if (decode.exp && decode.exp < Math.floor(Date.now() / 1000)) {
      throw new UnAuthorizedError("Token has expired");
    }

    // Validate required token fields
    if (!decode.id || !decode.userType) {
      throw new UnAuthorizedError("Invalid token payload");
    }

    const adminId = decode.id;
    const userType = decode.userType;

    // Only allow ADMIN type for admin endpoints
    if (userType !== "ADMIN") {
      throw new UnAuthorizedError("Invalid user type for this endpoint");
    }

    const findAdmin = await prisma.admin.findFirst({
      where: {
        id: adminId,
        userType: userType,
      },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!findAdmin) {
      throw new NotFoundError("Admin not found or inactive");
    }

    req.user = findAdmin;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnAuthorizedError("Token has expired"));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new UnAuthorizedError("Invalid token format"));
    }

    if (error.name === "NotBeforeError") {
      return next(new UnAuthorizedError("Token not yet valid"));
    }

    return next(error);
  }
};

module.exports = { verifyUserToken, verifyAdminToken };
