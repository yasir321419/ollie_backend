const Joi = require("joi");

const userCreatePostSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    categoryId: Joi.string().required()
  }),
  body: Joi.object({
    postTitle: Joi.string().required(),
    postContent: Joi.string().required(),
  }),
});

const userAllPostSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
  params: Joi.object({
  }),
  body: Joi.object({
  }),
});


const userShowSinglePostSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
  body: Joi.object({
  }),
});


const userUpdatePostSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
  body: Joi.object({
    postTitle: Joi.string().optional(),
    postContent: Joi.string().optional(),
  }),
});

const userCommentPostSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    postId: Joi.string().required(),
  }),
  body: Joi.object({
    comment: Joi.string().required()
  }),
});

const userLikeAndReplyCommentPostSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    commentId: Joi.string().required()
  }),
  body: Joi.object({
    like: Joi.boolean().optional(),
    reply: Joi.string().optional()
  }),
});


module.exports = {
  userCreatePostSchema,
  userShowSinglePostSchema,
  userCommentPostSchema,
  userLikeAndReplyCommentPostSchema,
  userUpdatePostSchema,
  userAllPostSchema
}