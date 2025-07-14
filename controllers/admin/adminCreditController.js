const prisma = require("../../config/prismaConfig");
const { ValidationError, NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");

const createCredit = async (req, res, next) => {
  try {
    const { credit, amount } = req.body;
    const { id } = req.user;

    const createcredit = await prisma.credit.create({
      data: {
        credit,
        amount,
        createdBy: { connect: { id: id } },
      }
    });

    if (!createcredit) {
      throw new ValidationError("credit not create")
    }

    handlerOk(res, 200, createcredit, 'credit created successfully')
  } catch (error) {
    next(error)
  }
}

const showCredit = async (req, res, next) => {

  try {
    const { id } = req.user;
    const showcredit = await prisma.credit.findMany({
      where: {
        createdById: id
      }
    });

    if (showcredit.length === 0) {
      throw new NotFoundError("credit not found")
    }

    handlerOk(res, 200, showcredit, 'credit found successfully')
  } catch (error) {
    next(error)
  }
}

const updateCredit = async (req, res, next) => {
  try {
    const { id } = req.user;

    const { credit, amount } = req.body;
    const { creditId } = req.params;

    const findcredit = await prisma.credit.findUnique({
      where: {
        id: creditId,
        createdById: id
      }
    });

    if (!findcredit) {
      throw new NotFoundError("credit not found")
    }

    const updatecredit = await prisma.credit.update({
      where: {
        id: findcredit.id
      },
      data: {
        credit,
        amount
      }
    });

    console.log(updatecredit);


    if (!updatecredit) {
      throw new ValidationError("credit not update")
    }

    handlerOk(res, 200, updatecredit, 'credit updated successfully')

  } catch (error) {
    next(error)
  }
}

const deleteCredit = async (req, res, next) => {
  try {
    const { creditId } = req.params;

    const deletecredit = await prisma.credit.delete({
      where: {
        id: creditId
      }
    });

    if (!deletecredit) {
      throw new ValidationError("credit not delete")
    }

    handlerOk(res, 200, null, 'credit deleted successfully')
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createCredit,
  showCredit,
  updateCredit,
  deleteCredit
}