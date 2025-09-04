const prisma = require("../../config/prismaConfig");
const { userConstants } = require("../../constants/constant");
const { ConflictError, NotFoundError, BadRequestError, ValidationError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const { genToken } = require("../../utils/generateToken");
const { hashPassword, comparePassword } = require("../../utils/passwordHashed");
const fs = require('fs');
const uploadFileWithFolder = require("../../utils/s3Upload");
const { v4: uuidv4 } = require('uuid');
const path = require("path");

const adminLogin = async (req, res, next) => {
  try {
    const { email, password, deviceToken } = req.body;

    const findadmin = await prisma.admin.findUnique({
      where: {
        email: email
      }
    });

    if (!findadmin) {
      throw new NotFoundError("admin not found");

    }

    const comparedPassword = await comparePassword(password, findadmin.password);

    if (!comparedPassword) {
      throw new BadRequestError("password not correct")
    }

    const token = await genToken({
      id: findadmin.id,
      userType: userConstants.ADMIN
    });

    const response = {
      adminToken: token
    }

    if (deviceToken) {
      response.deviceToken = deviceToken;

      await prisma.admin.update({
        where: {
          id: findadmin.id
        },
        data: {
          deviceToken: deviceToken
        }
      })
    }


    handlerOk(res, 200, { ...findadmin, ...response }, "admin login successfully")

  } catch (error) {
    next(error)
  }
}


const editImage = async (req, res, next) => {
  try {
    const file = req.file; // Get the uploaded file
    const { id } = req.user;

    // Check if the file is available in the request
    if (!file || !file.buffer) {
      throw new ValidationError("No file uploaded.");
    }

    const folder = 'uploads'; // S3 folder where you want to store the image

    // Generate a unique filename using original name and uuid
    const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    const contentType = file.mimetype; // The MIME type of the file

    // Use the buffer directly from req.file.buffer (no need to use file.path)
    const fileBuffer = file.buffer;

    // Upload file to S3
    const s3ImageUrl = await uploadFileWithFolder(fileBuffer, filename, contentType, folder);

    // Update admin with the new image URL
    const updateAdmin = await prisma.admin.update({
      where: {
        id,
      },
      data: {
        image: s3ImageUrl,
      },
    });

    if (!updateAdmin) {
      throw new ValidationError("Admin could not upload the image.");
    }

    // Send success response
    handlerOk(res, 200, updateAdmin, "Admin image uploaded successfully.");
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentpassword, newpassword } = req.body;
    const { id, password } = req.user;

    const comparePass = await comparePassword(currentpassword, password);

    if (!comparePass) {
      throw new BadRequestError("current password not correct")
    }

    const hashpass = await hashPassword(newpassword);

    const changePass = await prisma.admin.update({
      where: {
        id: id
      },
      data: {
        password: hashpass
      }
    });

    if (!changePass) {
      throw new ValidationError("password not change")
    }

    handlerOk(res, 200, changePass, "password changed successfully");

  } catch (error) {
    next(error)
  }
}




module.exports = {
  adminLogin,
  editImage,
  changePassword
}