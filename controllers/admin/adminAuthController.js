const prisma = require("../../config/prismaConfig");
const { userConstants } = require("../../constants/constant");
const { ConflictError, NotFoundError, BadRequestError, ValidationError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const { genToken } = require("../../utils/generateToken");
const { hashPassword, comparePassword } = require("../../utils/passwordHashed");
const fs = require('fs');
const uploadFileWithFolder = require("../../utils/s3Upload");



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
    const file = req.file;
    const { id } = req.user;

    // const filePath = file.filename; // use filename instead of path
    // const basePath = `http://${req.get("host")}/public/uploads/`;
    // const image = `${basePath}${filePath}`;

    const filePath = file.path; // Full file path of the uploaded file
    const folder = 'uploads'; // Or any folder you want to store the image in
    const filename = file.filename; // The filename of the uploaded file
    const contentType = file.mimetype; // The MIME type of the file

    const fileBuffer = fs.readFileSync(filePath);

    const s3ImageUrl = await uploadFileWithFolder(fileBuffer, filename, contentType, folder);


    const updateadmin = await prisma.admin.update({
      where: {
        id
      },
      data: {
        image: s3ImageUrl
      }
    });

    if (!updateadmin) {
      throw new ValidationError("admin not upload image")
    }

    handlerOk(res, 200, updateadmin, "admin upload image successfully")
  } catch (error) {
    next(error)
  }
}

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