const prisma = require("../config/prismaConfig");
const { ForbiddenError } = require("../resHandler/CustomError");

const checkUserSubscription = async (userId, errorMessage) => {
  const activeSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      isActive: true,
      endDate: {
        gte: new Date(),
      },
    },
  });

  if (!activeSubscription) {
    throw new ForbiddenError(errorMessage);
  }
};

module.exports = checkUserSubscription
