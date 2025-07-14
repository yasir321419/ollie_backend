const prisma = require("../config/prismaConfig");
const { ForbiddenError } = require("../resHandler/CustomError");

const checkAndDeductUserCredit = async (userId, errorMessage) => {
  const userCredit = await prisma.connectPurchase.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!userCredit || userCredit.quantity <= 0) {
    throw new ForbiddenError(errorMessage);
  }

  await prisma.connectPurchase.update({
    where: {
      id: userCredit.id,
    },
    data: {
      quantity: userCredit.quantity - 1,
    },
  });
};


module.exports = checkAndDeductUserCredit