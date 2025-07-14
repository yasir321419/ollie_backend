const Joi = require("joi");


const adminCreateUserInterestSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    userInterest: Joi.string().required(),
  }),
});

const adminUpdateUserInterestSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    interestId: Joi.string().required(),
  }),
  body: Joi.object({
    userInterest: Joi.string().required(),
  }),
});

const adminDeleteUserInterestSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    interestId: Joi.string().required(),
  }),
  body: Joi.object({}),
});

module.exports = {
  adminCreateUserInterestSchema,
  adminUpdateUserInterestSchema,
  adminDeleteUserInterestSchema

}