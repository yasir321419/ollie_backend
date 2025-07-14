const Joi = require("joi");


const adminCreateRequestPostCategorySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    postRequestCategory: Joi.string().required(),
  }),
});

const adminUpdateRequestPostCategorySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    requestCategoryId: Joi.string().required(),
  }),
  body: Joi.object({
    postRequestCategory: Joi.string().required(),
  }),
});

const adminDeleteRequestPostCategorySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    requestCategoryId: Joi.string().required(),
  }),
  body: Joi.object({}),
});

module.exports = {
  adminCreateRequestPostCategorySchema,
  adminUpdateRequestPostCategorySchema,
  adminDeleteRequestPostCategorySchema

}