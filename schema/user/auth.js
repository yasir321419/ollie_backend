const Joi = require("joi");

const userRegisterSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    userEmail: Joi.string().required()
  }),
});


const userVerifyOtpSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    userEmail: Joi.string().required(),
    userPassword: Joi.string().optional(),
    userPhoneNumber: Joi.string().optional(),
    userFirstName: Joi.string().optional(),
    userLastName: Joi.string().optional(),
    userDateOfBirth: Joi.date().optional(),
    userGender: Joi.string().valid("MALE", "FEMALE").optional(),
    interest: Joi.array().items(Joi.string()).optional(),
    otp: Joi.string().required(),
    userDeviceType: Joi.valid("ANDROID", "IOS").optional(),
    userDeviceToken: Joi.string().optional(),
    emergencyContactNumber: Joi.string().optional(),
    wantDailyActivities: Joi.boolean().optional(),
    wantDailySupplement: Joi.boolean().optional(),
    userCity: Joi.string().optional(),
    userStates: Joi.string().optional(),
    userCountry: Joi.string().optional()

  }),
});

const userForgetPasswordSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    userEmail: Joi.string().required(),
  }),
});

const userResetPasswordSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({

    userPassword: Joi.string().required(),
  }),
});


const userLoginSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    userEmail: Joi.string().required(),
    userPassword: Joi.string().required(),
  }),
});

const userEditProfileSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    userFirstName: Joi.string().optional(),
    userLastName: Joi.string().optional(),
    userEmail: Joi.string().optional(),
    userPhoneNumber: Joi.string().optional(),
    userDateOfBirth: Joi.date().optional(),
    userGender: Joi.string().valid("MALE", "FEMALE").optional(),

  }),
});

module.exports = {
  userRegisterSchema,
  userVerifyOtpSchema,
  userForgetPasswordSchema,
  userResetPasswordSchema,
  userLoginSchema,
  userEditProfileSchema
}