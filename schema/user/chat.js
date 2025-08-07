const Joi = require("joi");

const userCreateChatRoomSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
  }),
});


const userSentAttachmentSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    chatRoomId: Joi.string().required(),

  }),
  body: Joi.object({
    attachmentType: Joi.string().valid('image', 'video', 'pdf').required()
  }),
});

module.exports = {
  userCreateChatRoomSchema,
  userSentAttachmentSchema
}