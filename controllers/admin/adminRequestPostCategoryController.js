const prisma = require("../../config/prismaConfig");
const { ConflictError, ValidationError, NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");

const createRequestPostCategory = async (req, res, next) => {
  try {
    const { postRequestCategory } = req.body;
    const { id } = req.user;

    const findpostrequestcategory = await prisma.postRequestCategory.findFirst({
      where: {
        name: postRequestCategory,
        adminId: id
      }
    });

    if (findpostrequestcategory) {
      throw new ConflictError("post request category already exist");
    }

    const createrequestpostcategory = await prisma.postRequestCategory.create({
      data: {
        name: postRequestCategory,
        adminId: id
      }
    });

    if (!createrequestpostcategory) {
      throw new ValidationError("post request category not create")
    }

    handlerOk(res, 200, createrequestpostcategory, 'post request category created successfully')

  } catch (error) {
    next(error)
  }
}

const getRequestPostCategory = async (req, res, next) => {
  try {
    const { id } = req.user;

    const findrequestpostcategory = await prisma.postRequestCategory.findMany({
      where: {
        adminId: id
      }
    });

    if (findrequestpostcategory.length === 0) {
      throw new NotFoundError("request post  category not found");

    }
    handlerOk(res, 200, findrequestpostcategory, 'request post category found successfully')


  } catch (error) {
    next(error)
  }
}

const updateRequestPostCategory = async (req, res, next) => {
  try {
    const { requestCategoryId } = req.params;
    const { postRequestCategory } = req.body;
    const { id } = req.user;

    const findrequestpostcategory = await prisma.postRequestCategory.findFirst({
      where: {
        id: requestCategoryId,
        adminId: id
      }
    });

    if (!findrequestpostcategory) {
      throw new NotFoundError("request post category not found")
    }

    const updaterequestpostcategory = await prisma.postRequestCategory.update({
      where: {
        id: requestCategoryId,
        adminId: id
      },

      data: {
        name: postRequestCategory
      }
    });

    if (!updaterequestpostcategory) {
      throw new ValidationError("request post category not update")
    }

    handlerOk(res, 200, updaterequestpostcategory, 'request post category updated successfully')
  } catch (error) {
    next(error)
  }
}

const deleteRequestPostCategory = async (req, res, next) => {
  try {
    const { requestCategoryId } = req.params;
    const { id } = req.user;

    const findrequestpostcategory = await prisma.postRequestCategory.findFirst({
      where: {
        id: requestCategoryId,
        adminId: id
      }
    });

    if (!findrequestpostcategory) {
      throw new NotFoundError("request post category not found")
    }

    const updaterequestpostcategory = await prisma.postRequestCategory.delete({
      where: {
        id: requestCategoryId,
        adminId: id
      }
    });

    if (!updaterequestpostcategory) {
      throw new ValidationError("request post category not delete")
    }

    handlerOk(res, 200, null, 'request post category deleted successfully')
  } catch (error) {
    next(error)
  }
}




module.exports = {
  createRequestPostCategory,
  getRequestPostCategory,
  updateRequestPostCategory,
  deleteRequestPostCategory,
}