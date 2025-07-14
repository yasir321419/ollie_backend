const Joi = require("joi");

const userBlogByCategorySchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
  params: Joi.object({
    topicsId: Joi.string().required()
  }),
  body: Joi.object({
  }),
});

const userShowLatestBlogSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
  params: Joi.object({
  }),
  body: Joi.object({
  }),
});

const userSingleBlogSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    blogId: Joi.string().required()
  }),
  body: Joi.object({
  }),
});

const useLikeAndUnlikeBlogSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    blogId: Joi.string().required()
  }),
  body: Joi.object({
  }),
});

const userSaveBlogSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    blogId: Joi.string().required()
  }),
  body: Joi.object({
  }),
});


const userCommentBlogSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    blogId: Joi.string().required()
  }),
  body: Joi.object({
    comment: Joi.string().required()
  }),
});

const userLikeAndReplyCommentBlogSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    commentId: Joi.string().required()
  }),
  body: Joi.object({
    like: Joi.boolean().optional(),
    reply: Joi.string().optional()
  }),
});

const getBlogByTypeSchema = Joi.object({
  query: Joi.object({
    type: Joi.string().valid("popular", "trending", "recent").required(),


  }),
  params: Joi.object({
  }),
  body: Joi.object({

  }),
});


const getFilterBlogSchema = Joi.object({
  query: Joi.object({
    type: Joi.string().valid("trending", "most recent", "most viewed", "least viewed").required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
  params: Joi.object({
  }),
  body: Joi.object({

  }),
});


const userSaveFavouriteTopicSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    topicId: Joi.string().required()
  }),
  body: Joi.object({})
})

module.exports = {
  userBlogByCategorySchema,
  userSingleBlogSchema,
  useLikeAndUnlikeBlogSchema,
  userSaveBlogSchema,
  userCommentBlogSchema,
  userLikeAndReplyCommentBlogSchema,
  getBlogByTypeSchema,
  getFilterBlogSchema,
  userSaveFavouriteTopicSchema,
  userShowLatestBlogSchema
}