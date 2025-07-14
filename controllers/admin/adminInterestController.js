const prisma = require("../../config/prismaConfig");
const { ValidationError, ConflictError, NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");

const createUserInterest = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { userInterest } = req.body;
    console.log(id, 'id');


    const checkInterest = await prisma.interest.findFirst({
      where: {
        name: userInterest
      }
    });

    if (checkInterest) {
      throw new ConflictError("interest already exist");
    }

    const createInterest = await prisma.interest.create({
      data: {
        name: userInterest,
        adminId: id
      }
    });

    if (!createInterest) {
      throw new ValidationError("interest not create")
    }

    handlerOk(res, 201, createInterest, 'user interest created successfully')


  } catch (error) {
    next(error)
  }
}

const getUserInterest = async (req, res, next) => {
  try {
    const { id } = req.user;

    const finduserinterest = await prisma.interest.findMany({
      where: {
        adminId: id
      }
    });

    if (!finduserinterest) {
      throw new NotFoundError("user interest not found");
    }

    return handlerOk(res, 200, finduserinterest, 'user interest found succussfully')

  } catch (error) {
    next(error)
  }
}

const updateUserInterest = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { interestId } = req.params;
    const { userInterest } = req.body;

    console.log(interestId);
    console.log(userInterest);

    const findinterest = await prisma.interest.findUnique({
      where: {
        id: interestId
      }
    });

    if (!findinterest) {
      throw new NotFoundError("interest not found");
    }

    const updateinterest = await prisma.interest.update({
      where: {
        id: interestId,
        adminId: id
      },
      data: {
        name: userInterest
      }
    });

    if (!updateinterest) {
      throw new ValidationError("interest not update");
    }


    handlerOk(res, 200, updateinterest, 'interest update successfully')
  } catch (error) {
    next(error)
  }
}

const deleteUserInterest = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { interestId } = req.params;

    const findinterest = await prisma.interest.findFirst({
      where: {
        id: interestId,
        adminId: id
      }
    });

    if (!findinterest) {
      throw new NotFoundError("interest not found");
    }

    await prisma.interest.delete({
      where: {
        id: findinterest.id,
        adminId: id
      }
    });

    handlerOk(res, 200, null, "interest deleted successfully")

  } catch (error) {
    next(error)
  }
}

module.exports = {
  createUserInterest,
  getUserInterest,
  updateUserInterest,
  deleteUserInterest
}