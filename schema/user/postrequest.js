const Joi = require("joi");

const userCreatePostRequestSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
  }),
  body: Joi.object({
    dateAndTime: Joi.date().iso().required(), // 👈 enforce ISO 8601 format
    postdescription: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    postRequestCategory: Joi.array().items(Joi.number()).optional(),

  }),
});

const userShowPostRequestSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
  params: Joi.object({
  }),
  body: Joi.object({


  }),
});

const userSendVolunteerRequestSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    postId: Joi.string().required()
  }),
  body: Joi.object({
  }),
});

const userAcceptVolunteerRequestSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    requestId: Joi.string().required()
  }),
  body: Joi.object({
  }),
});



module.exports = {
  userCreatePostRequestSchema,
  userSendVolunteerRequestSchema,
  userAcceptVolunteerRequestSchema,
  userShowPostRequestSchema
};