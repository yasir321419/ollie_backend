const Joi = require("joi");

const userBuyCreditSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    creditId: Joi.string().required()
  }),
  body: Joi.object({
  }),
});


const userCheckWalletSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    creditId: Joi.string().required()
  }),
  body: Joi.object({
  }),
});

const userUpgradeSubscriptionSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    subscriptionId: Joi.string().required()
  }),
  body: Joi.object({
    plan: Joi.string().required(),
    price: Joi.number().required()
  }),
});

const userdonateNowSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
  }),
  body: Joi.object({
    amount: Joi.number().required()
  }),
});

const userShowDonationHistorySchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
  params: Joi.object({
  }),
  body: Joi.object({
  }),
});

module.exports = {
  userBuyCreditSchema,
  userCheckWalletSchema,
  userUpgradeSubscriptionSchema,
  userdonateNowSchema,
  userShowDonationHistorySchema
}