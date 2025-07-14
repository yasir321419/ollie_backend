const Joi = require("joi");

const adminCreateCreditSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    credit: Joi.string().required(),
    amount: Joi.number().required().precision(2)
  }),
});



const adminUpdateCreditSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    creditId: Joi.string().required()
  }),
  body: Joi.object({
    credit: Joi.string().required(),
    amount: Joi.number().required().precision(2)
  }),
});


const adminDeleteCreditSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    creditId: Joi.string().required()

  }),
  body: Joi.object({
  }),
});

module.exports = {
  adminCreateCreditSchema,
  adminUpdateCreditSchema,
  adminDeleteCreditSchema,
}
