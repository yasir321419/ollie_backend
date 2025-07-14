const Joi = require("joi");

const adminCreateEventSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    eventName: Joi.string().required(),
    eventDescription: Joi.string().required(),
    eventDateAndTime: Joi.string().required(),
    eventAddress: Joi.string().required(),
    eventStates: Joi.string().required(),
    eventCity: Joi.string().required(),
    eventCountry: Joi.string().required(),
  }),
});

const adminUpdateEventSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    eventId: Joi.string().required()
  }),
  body: Joi.object({
    eventName: Joi.string().required(),
    eventDescription: Joi.string().required(),
    eventDateAndTime: Joi.string().required(),
    eventAddress: Joi.string().required(),
    eventStates: Joi.string().required(),
    eventCity: Joi.string().required(),
    eventCountry: Joi.string().required(),
  }),
});


const adminDeleteEventSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    eventId: Joi.string().required()

  }),
  body: Joi.object({
  }),
});


module.exports = {
  adminCreateEventSchema,
  adminUpdateEventSchema,
  adminDeleteEventSchema
}