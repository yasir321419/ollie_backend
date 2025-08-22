const Joi = require("joi");


const adminCreateBlogSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    categoryId: Joi.string().required(),
  }),
  body: Joi.object({
    postTitle: Joi.string().required(),
    postContent: Joi.string().required(),
  }),
});

const adminUpdateBlogSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
  body: Joi.object({
    postTitle: Joi.string().required(),
    postContent: Joi.string().required(),
  }),
});

const adminDeleteBlogSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
  body: Joi.object({}),
});

module.exports = {
  adminCreateBlogSchema,
  adminUpdateBlogSchema,
  adminDeleteBlogSchema

}