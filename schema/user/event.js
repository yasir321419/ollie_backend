const Joi = require("joi");

const userMarkAsGoingSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    eventId: Joi.string().required()
  }),
  body: Joi.object({
  }),
});
const userShowEventNearBySchema = Joi.object({
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
  userMarkAsGoingSchema,
  userShowEventNearBySchema
}