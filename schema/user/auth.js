const Joi = require("joi");

const userRegisterSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    userEmail: Joi.string().required(),
    // userPassword: Joi.string().required()
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

const userResendOtpSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({

    email: Joi.string().required()

  }),
});

const createProfileSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({

    userPhoneNumber: Joi.string().required(),
    userFirstName: Joi.string().required(),
    userLastName: Joi.string().required(),
    userDateOfBirth: Joi.date().required(),
    userGender: Joi.string().valid("MALE", "FEMALE").required(),
    interest: Joi.array().items(Joi.string()).required(),
    userDeviceType: Joi.valid("ANDROID", "IOS").required(),
    userDeviceToken: Joi.string().required(),
    emergencyContactNumber: Joi.string().required(),
    wantDailyActivities: Joi.boolean().required(),
    wantDailySupplement: Joi.boolean().required(),
    userCity: Joi.string().required(),
    userStates: Joi.string().required(),
    userCountry: Joi.string().required()

  }),
})

const submitFeedBackSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({

    email: Joi.string().required(),
    message: Joi.string().required(),


  }),
})

module.exports = {
  userRegisterSchema,
  userVerifyOtpSchema,
  userForgetPasswordSchema,
  userResetPasswordSchema,
  userLoginSchema,
  userEditProfileSchema,
  userResendOtpSchema,
  createProfileSchema,
  submitFeedBackSchema
}