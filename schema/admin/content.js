const Joi = require("joi");

const adminCreatePrivacyPolicySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    privacypolicy: Joi.string().required(),
  }),
});

const adminUpdatePrivacyPolicySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    privacyId: Joi.string().required()
  }),
  body: Joi.object({
    privacypolicy: Joi.string().required(),
  }),
});

const adminCreateTermsConditionSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
  }),
  body: Joi.object({
    termscondition: Joi.string().required(),
  }),
});

const adminUpdateTermsConditionSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    termsId: Joi.string().required()
  }),
  body: Joi.object({
    termscondition: Joi.string().required(),
  }),
});

const adminCreateFaqsSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
  }),
  body: Joi.object({
    question: Joi.string().required(),
    options: Joi.array()
      .items(
        Joi.object({
          text: Joi.string().required(),
          isCorrect: Joi.boolean().required()
        })
      )
      .min(2)
      .required()
  })
});

const adminUpdateFaqsSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    faqId: Joi.string().required()
  }),
  body: Joi.object({
    question: Joi.string().required(),
    options: Joi.array()
      .items(
        Joi.object({
          text: Joi.string().required(),
          isCorrect: Joi.boolean().required()
        })
      )
      .min(2)
      .required()
  })
});

const adminDeleteFaqsSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    faqId: Joi.string().required()
  }),
  body: Joi.object({
  })
});

module.exports = {
  adminCreatePrivacyPolicySchema,
  adminUpdatePrivacyPolicySchema,
  adminCreateTermsConditionSchema,
  adminUpdateTermsConditionSchema,
  adminCreateFaqsSchema,
  adminUpdateFaqsSchema,
  adminDeleteFaqsSchema
}