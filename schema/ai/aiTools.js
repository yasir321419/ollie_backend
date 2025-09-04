const Joi = require("joi");

// Custom validator for sanitized strings (removes HTML, scripts, etc.)
const sanitizedString = (maxLength = 1000) => {
  return Joi.string()
    .trim()
    .max(maxLength)
    .pattern(/^[^<>]*$/, 'no HTML tags allowed')
    .messages({
      'string.pattern.name': 'HTML tags are not allowed',
      'string.max': `Must be at most ${maxLength} characters long`
    });
};

const aiCreatePostSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    postTitle: sanitizedString(200).required().messages({
      'any.required': 'Post title is required',
      'string.empty': 'Post title cannot be empty'
    }),
    postContent: sanitizedString(10000).required().messages({
      'any.required': 'Post content is required',
      'string.empty': 'Post content cannot be empty'
    }),
  }),
}).options({ convert: true, stripUnknown: true });

const aiUpdateContextSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    additional_context: sanitizedString(2000).allow('').required().messages({
      'any.required': 'Additional context field is required (can be empty)'
    }),
  }),
}).options({ convert: true, stripUnknown: true });

const aiCreateTaskSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    taskName: sanitizedString(200).required().messages({
      'any.required': 'Task name is required',
      'string.empty': 'Task name cannot be empty'
    }),
    taskDescription: sanitizedString(1000).required().messages({
      'any.required': 'Task description is required',
      'string.empty': 'Task description cannot be empty'
    }),
    dateAndTime: Joi.date().iso().optional().messages({
      'date.base': 'Date and time must be a valid ISO date',
      'date.format': 'Date must be in ISO format'
    }),
  }),
}).options({ convert: true, stripUnknown: true });

const aiCreateHelpRequestSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    postdescription: sanitizedString(2000).required().messages({
      'any.required': 'Help request description is required',
      'string.empty': 'Description cannot be empty'
    }),
    dateAndTime: Joi.date().iso().optional().messages({
      'date.base': 'Date and time must be a valid ISO date'
    }),
    latitude: Joi.number().min(-90).max(90).optional().messages({
      'number.base': 'Latitude must be a valid number',
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90'
    }),
    longitude: Joi.number().min(-180).max(180).optional().messages({
      'number.base': 'Longitude must be a valid number',
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180'
    }),
    categoryIds: Joi.array().items(
      Joi.number().integer().positive()
    ).max(10).optional().messages({
      'array.max': 'Maximum 10 categories allowed',
      'number.base': 'Category IDs must be numbers',
      'number.integer': 'Category IDs must be integers',
      'number.positive': 'Category IDs must be positive numbers'
    }),
  }),
}).options({ convert: true, stripUnknown: true });

module.exports = {
  aiCreatePostSchema,
  aiUpdateContextSchema,
  aiCreateTaskSchema,
  aiCreateHelpRequestSchema
};