const Joi = require("joi");


const adminCreatePostSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    categoryId: Joi.string().required(),
  }),
  body: Joi.object({
    postTitle: Joi.string().required(),
    postContent: Joi.string().required(),
  }),
});

const adminUpdatePostSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
  body: Joi.object({
    postTitle: Joi.string().required(),
    postContent: Joi.string().required(),
  }),
});

const adminDeletePostSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
  body: Joi.object({}),
});

module.exports = {
  adminCreatePostSchema,
  adminUpdatePostSchema,
  adminDeletePostSchema

}