const Joi = require("joi");

const userCreateTaskSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    taskName: Joi.string().required(),
    taskDescription: Joi.string().required(),
    date: Joi.date().required(),
    time: Joi.string().required(),

  }),
});

const userShowTaskSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
  params: Joi.object({

  }),
  body: Joi.object({

  }),
});


const userMarkAsCompletedTaskSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    taskId: Joi.string().required(),
  }),
  body: Joi.object({
  }),
});

const userGetTaskByDateSchema = Joi.object({
  query: Joi.object({
    date: Joi.string()
      .pattern(/^\d{2}-\d{2}-\d{4}$/)
      .required()
      .messages({
        'string.pattern.base': 'Date must be in DD-MM-YYYY format',
        'any.required': 'Date is required',
      }),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
  params: Joi.object({
  }),
  body: Joi.object({
  }),
});


module.exports = {
  userCreateTaskSchema,
  userMarkAsCompletedTaskSchema,
  userGetTaskByDateSchema,
  userShowTaskSchema
}