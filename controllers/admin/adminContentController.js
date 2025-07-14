const prisma = require("../../config/prismaConfig");
const { NotFoundError, ConflictError, ValidationError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");

const showAllUsers = async (req, res, next) => {
  try {
    const { id } = req.user;
    const findusers = await prisma.user.findMany({
      where: {
        id: {
          not: id,
        }
      }
    });

    if (findusers.length === 0) {
      throw new NotFoundError("no user found");
    }

    handlerOk(res, 200, findusers, 'users found successfully');
  } catch (error) {
    next(error)
  }
}

const countUsers = async (req, res, next) => {
  try {
    const { id } = req.user;

    const countusers = await prisma.user.count({
      where: {
        id: {
          not: id
        }
      }
    });

    if (countusers.length === 0) {
      throw new NotFoundError("no user found");
    }
    handlerOk(res, 200, countusers, 'users count successfully');
  } catch (error) {
    next(error)
  }
}

const androidUsers = async (req, res, next) => {
  try {
    const findandriodusers = await prisma.user.count({
      where: {
        "deviceType": "ANDROID"
      }
    });

    if (findandriodusers.length === 0) {
      throw new NotFoundError("no android user found");

    }
    handlerOk(res, 200, findandriodusers, 'android users found successfully');

  } catch (error) {
    next(error)
  }
}

const iosUsers = async (req, res, next) => {
  try {
    const findiosusers = await prisma.user.count({
      where: {
        "deviceType": "IOS"
      }
    });

    if (findiosusers.length === 0) {
      throw new NotFoundError("no ios users found");
    }

    handlerOk(res, 200, findiosusers, 'ios users found successfully')
  } catch (error) {
    next(error)
  }
}

const createPrivacyPolicy = async (req, res, next) => {
  try {
    const { privacypolicy } = req.body;
    const { id } = req.user
    const findprivacy = await prisma.privacyPolicy.findFirst({
      where: {
        createdById: id
      }
    });

    if (findprivacy) {
      throw new ConflictError("privacy create only once");
    }

    const createprivacy = await prisma.privacyPolicy.create({
      data: {
        privacyPolicy: privacypolicy,
        createdById: id
      }
    });

    if (!createprivacy) {
      throw new ValidationError("privacy not create");

    }

    handlerOk(res, 200, createprivacy, 'privacy created successfully');

  } catch (error) {
    next(error)
  }
}

const showPrivacyPolicy = async (req, res, next) => {
  try {
    const { id } = req.user;
    const findprivacy = await prisma.privacyPolicy.findFirst({
      where: {
        createdById: id
      }
    });

    if (!findprivacy) {
      throw new NotFoundError("privacy policy not found");
    }

    handlerOk(res, 200, findprivacy, 'privacy policy found successfully')

  } catch (error) {
    next(error)
  }
}

const updatePrivacyPolicy = async (req, res, next) => {
  try {
    const { privacyId } = req.params;

    const { privacypolicy } = req.body;

    const findprivacy = await prisma.privacyPolicy.findFirst({
      where: {
        id: privacyId
      }
    });

    if (!findprivacy) {
      throw new NotFoundError("privacy policy not found");
    }

    const updateprivacy = await prisma.privacyPolicy.update({
      where: {
        id: findprivacy.id
      },
      data: {
        privacyPolicy: privacypolicy
      }
    });

    if (!updateprivacy) {
      throw new ValidationError("privacy policy not update");
    }

    handlerOk(res, 200, updateprivacy, "privacy policy updated successfully");

  } catch (error) {
    next(error)
  }
}

const createTermsAndCondition = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { termscondition } = req.body;

    const findterms = await prisma.termsCondition.findFirst({
      where: {
        createdById: id
      }
    });

    if (findterms) {
      throw new ConflictError("terms and condition create once only");
    }

    const createterms = await prisma.termsCondition.create({
      data: {
        createdById: id,
        TermsCondition: termscondition
      }
    });

    if (!createterms) {
      throw new ValidationError("terms and condition not created");
    }

    handlerOk(res, 201, createterms, "terms and condition created successfully");

  } catch (error) {
    next(error)
  }
}

const showTermsAndCondition = async (req, res, next) => {
  try {
    const { id } = req.user;
    const findterms = await prisma.termsCondition.findFirst({
      where: {
        createdById: id
      }
    });

    if (!findterms) {
      throw new NotFoundError("terms condtion not found");
    }

    handlerOk(res, 200, findterms, 'terms condtion found successfully')
  } catch (error) {
    next(error)
  }
}

const updateTermsAndCondition = async (req, res, next) => {
  try {
    const { termsId } = req.params;

    const { termscondition } = req.body;

    const findterms = await prisma.termsCondition.findFirst({
      where: {
        id: termsId
      }
    });

    if (!findterms) {
      throw new NotFoundError("terms condition not found");
    }

    const updateterms = await prisma.termsCondition.update({
      where: {
        id: findterms.id
      },
      data: {
        TermsCondition: termscondition
      }
    });

    if (!updateterms) {
      throw new ValidationError("terms condition not update");
    }

    handlerOk(res, 200, updateterms, "terms condition updated successfully");
  } catch (error) {
    next(error)
  }
}

const createFaqs = async (req, res, next) => {
  try {
    const { question, options } = req.body;
    const { id } = req.user;

    const createdQuestion = await prisma.question.create({
      data: {
        question,
        isActive: true,
        createdById: id,
        Option: {
          create: options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect || false,
          }))
        }
      },
      include: {
        Option: true
      }
    });

    if (!createdQuestion) {
      throw new ValidationError("question not created");
    }

    handlerOk(res, 200, createdQuestion, "question created succesfully")



  } catch (error) {
    next(error)
  }
}

const showFaqs = async (req, res, next) => {
  try {
    const { id } = req.user;
    const showquestion = await prisma.question.findMany({
      where: {
        createdById: id
      },
      include: {
        Option: true
      }
    });

    if (showquestion.length === 0) {
      throw new NotFoundError("questions not found")
    }

    handlerOk(res, 200, showquestion, 'question found successfully')
  } catch (error) {
    next(error)
  }
}

const updateFaqs = async (req, res, next) => {
  try {
    const { faqId } = req.params;
    const { question, options } = req.body;
    const findquestion = await prisma.question.findFirst({
      where: {
        id: faqId
      },
    });

    if (!findquestion) {
      throw new NotFoundError("question not found")
    }

    await prisma.option.deleteMany({
      where: {
        questionId: faqId
      }
    })
    const updatedQuestion = await prisma.question.update({
      where: {
        id: findquestion.id
      },
      data: {
        question,
        isActive: true,
        Option: {
          create: options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect || false,
          }))
        }
      },
      include: {
        Option: true
      }
    });


    if (!updatedQuestion) {
      throw new ValidationError("question not update");
    }

    handlerOk(res, 200, updatedQuestion, 'question updated successfully')

  } catch (error) {
    next(error)
  }
}

const deleteFaqs = async (req, res, next) => {
  try {
    const { faqId } = req.params;

    const findquestion = await prisma.question.findFirst({
      where: {
        id: faqId
      },
    });

    if (!findquestion) {
      throw new NotFoundError("question not found")
    }

    await prisma.option.deleteMany({
      where: {
        questionId: findquestion.id
      }
    });


    await prisma.question.delete({
      where: {
        id: findquestion.id
      }
    });



    handlerOk(res, 200, null, 'faqs deleted successfully')

  } catch (error) {
    next(error)
  }
}

module.exports = {
  showAllUsers,
  countUsers,
  androidUsers,
  iosUsers,
  createPrivacyPolicy,
  showPrivacyPolicy,
  updatePrivacyPolicy,
  createTermsAndCondition,
  showTermsAndCondition,
  updateTermsAndCondition,
  createFaqs,
  showFaqs,
  updateFaqs,
  deleteFaqs
}