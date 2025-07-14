const prisma = require("../../config/prismaConfig");
const { NotFoundError, BadRequestError, ValidationError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const sendNotification = require("../../utils/notification");

const showUserCredit = async (req, res, next) => {
  try {

    const findusercredit = await prisma.credit.findMany();

    if (findusercredit.length === 0) {
      throw new NotFoundError("user credit not found")
    }

    handlerOk(res, 200, findusercredit, 'user credit found successfully')

  } catch (error) {
    next(error)
  }
}

const buyCredit = async (req, res, next) => {
  try {
    const { id, deviceToken, firstName } = req.user;
    const { creditId } = req.params;

    const findcredit = await prisma.credit.findUnique({
      where: { id: creditId },
    });

    if (!findcredit) {
      throw new NotFoundError("Credit not found");
    }

    const creditAmount = findcredit.amount;

    const wallet = await prisma.wallet.findUnique({
      where: { userId: id },
    });

    if (!wallet) {
      throw new NotFoundError("User wallet not found");
    }

    let paymentSource = "wallet";

    if (wallet.balance < creditAmount) {
      const topUp = creditAmount - wallet.balance;

      await prisma.wallet.update({
        where: { userId: id },
        data: { balance: { increment: topUp } },
      });

      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: topUp,
          type: "CONNECT_PURCHASE",
          description: "buy external credit",
        },
      });

      paymentSource = "external";
    }

    await prisma.wallet.update({
      where: { userId: id },
      data: { balance: { decrement: creditAmount } },
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount: -creditAmount,
        type: "CONNECT_PURCHASE",
        description: "buy credit",
      },
    });

    // Mark credit as claimed
    await prisma.credit.update({
      where: { id: findcredit.id },
      data: {
        isClaimed: true,
        userId: id,
      },
    });

    // Determine connects to give
    const connectsToGive = parseInt(creditAmount);

    // Give user connects (create or update)
    await prisma.connectPurchase.upsert({
      where: { userId: id },
      update: {
        quantity: { increment: connectsToGive },
      },
      create: {
        userId: id,
        quantity: connectsToGive,
      }
    });


    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have successfully purchased credit worth ${creditAmount}!`
    // );

    handlerOk(res, 200, { connects: connectsToGive, paymentSource }, 'Credit purchased and connects assigned successfully');

  } catch (error) {
    next(error);
  }
}

const checkWalletAmountForCredit = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { creditId } = req.params;

    const findCredit = await prisma.credit.findUnique({
      where: { id: creditId },
    });

    if (!findCredit) {
      throw new NotFoundError("Credit not found");
    }

    const creditAmount = findCredit.amount;
    const wallet = await prisma.wallet.findUnique({
      where: { userId: id },
    });

    if (!wallet) {
      throw new NotFoundError("User wallet not found");
    }

    if (wallet.balance >= creditAmount) {
      handlerOk(res, 200, true, 'you have already amount in wallet for purchase credit');
    } else {
      handlerOk(res, 400, false, 'go ahead and purchase credit');
    }

  } catch (error) {
    next(error);
  }
}

const upgradeSubscription = async (req, res, next) => {
  try {
    const { id, deviceToken, firstName } = req.user; // user id from auth
    const { subscriptionId } = req.params;
    const { plan, price } = req.body;

    const now = new Date();
    const expiry = new Date();
    const normalizedPlan = plan.toLowerCase();


    const findplan = await prisma.subscriptionPlan.findUnique({
      where: { id: subscriptionId },
    });

    if (!findplan) {
      throw new NotFoundError("Subscription plan not found");
    }


    const userSub = await prisma.userSubscription.findFirst({
      where: { userId: id },
    });

    if (!userSub) {
      throw new NotFoundError("User subscription not found");
    }


    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: findplan.id },
      data: {
        name: plan,
        price: price,
      },
    });


    expiry.setDate(expiry.getDate() + updatedPlan.duration);


    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: userSub.id },
      data: {
        subscriptionPlanId: updatedPlan.id,
        startDate: now,
        endDate: expiry,
        isActive: true,
      },
    });


    let connectQuantity = 0;
    let displayads;
    if (normalizedPlan === "basic") {
      connectQuantity = 100;
      displayads = true;
    } else if (normalizedPlan === "advance") {
      connectQuantity = 200;
      displayads = false;
    } else {
      throw new BadRequestError("Invalid plan type. Must be 'basic' or 'advance'.");
    }


    await prisma.connectPurchase.upsert({
      where: { userId: id },
      update: {
        quantity: { increment: connectQuantity },
      },
      create: {
        userId: id,
        quantity: connectQuantity,
      },
    });


    await prisma.wallet.update({
      where: { userId: id },
      data: {
        balance: { increment: price },
      },
    });

    await prisma.user.update({
      where: { id: id },
      data: {
        showAds: displayads
      }
    })

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have successfully upgraded your subscription to the ${plan} plan worth $${price}!`
    // );



    handlerOk(res, 200, updatedSubscription, 'User subscription upgraded successfully');

  } catch (error) {
    next(error);
  }
}

const donateNow = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const { id, deviceToken, firstName } = req.user;

    const donate = await prisma.donation.create({
      data: {
        userId: id,
        amount: amount,
      }
    });

    if (!donate) {
      throw new ValidationError("donation not created");
    }

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, thank you for your donation of $${amount}!`
    // );

    handlerOk(res, 200, donate, 'user donate successfully');

  } catch (error) {
    next(error)
  }
}

const showDonationHistory = async (req, res, next) => {
  try {
    const { id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;



    const donationHistory = await Promise.all([
      prisma.donation.findMany({
        where: { userId: id },
        include: { user: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.donation.count({
        where: { userId: id }
      })
    ])

    if (donationHistory.length === 0) {
      throw new NotFoundError("no donation history found");
    }

    handlerOk(
      res,
      200,
      donationHistory,
      'Donation history found');

  } catch (error) {
    next(error)
  }
}


module.exports = {
  showUserCredit,
  buyCredit,
  checkWalletAmountForCredit,
  upgradeSubscription,
  donateNow,
  showDonationHistory
}