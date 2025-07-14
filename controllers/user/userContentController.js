const prisma = require("../../config/prismaConfig");
const { NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");

const userPrivacyPolicy = async (req, res, next) => {
  try {

    const privacypolicy = await prisma.privacyPolicy.findFirst();

    if (!privacypolicy) {
      throw new NotFoundError("privacy policy not found");
    }

    handlerOk(res, 200, privacypolicy, 'privacy policy found successfully')
  } catch (error) {
    next(error)
  }
}

const userTermsCondition = async (req, res, next) => {
  try {
    const termscondition = await prisma.termsCondition.findFirst();

    if (!termscondition) {
      throw new NotFoundError("terms condition not found");
    }

    handlerOk(res, 200, termscondition, 'terms condition found successfully')
  } catch (error) {
    next(error)
  }
}

const userFaqs = async (req, res, next) => {
  try {

    const findfaqs = await prisma.question.findMany({
      include: {
        Option: true
      }
    });

    if (findfaqs.length === 0) {
      throw new NotFoundError("faqs not found");
    }

    handlerOk(res, 200, findfaqs, 'faqs found succesfully')
  } catch (error) {
    next(error)
  }
}
module.exports = {
  userPrivacyPolicy,
  userTermsCondition,
  userFaqs
}