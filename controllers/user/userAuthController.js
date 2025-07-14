const prisma = require("../../config/prismaConfig");
const { otpConstants, userConstants } = require("../../constants/constant");
const { ConflictError, NotFoundError, ValidationError, BadRequestError } = require("../../resHandler/CustomError");
const { generateOtp } = require("../../utils/generateOtp");
const sendEmails = require("../../utils/sendEmail");
const { handlerOk } = require("../../resHandler/responseHandler");
const generateOtpExpiry = require("../../utils/verifyOtp");
const emailTemplates = require("../../utils/emailTemplate");
const { genToken } = require("../../utils/generateToken");
const { hashPassword, comparePassword } = require("../../utils/passwordHashed");

const userRegister = async (req, res, next) => {
    try {
        const { userEmail,
        } = req.body;

        const finduser = await prisma.user.findUnique({
            where: {
                email: userEmail
            }
        });

        if (finduser) {
            throw new ConflictError("User Already Exist");
        }

        console.log(finduser, 'finduser');


        const otp = generateOtp();
        const expiretime = generateOtpExpiry(1);
        console.log(otp, 'otp');

        const saveotp = await prisma.otp.create({
            data: {
                otp: otp,
                userId: null,
                otpReason: otpConstants.REGISTER,
                otpUsed: false,
                expiresAt: expiretime
            }
        });

        const emailData = {
            subject: "Ollie - Account Verification",
            html: emailTemplates.register(otp),
        };

        await sendEmails(userEmail, emailData.subject, emailData.html);


        handlerOk(res, 201, otp, "otp send successfully")

    } catch (error) {
        next(error)
    }
}

const getInterest = async (req, res, next) => {
    try {
        const findinterest = await prisma.interest.findMany({});
        if (!findinterest) {
            throw new NotFoundError("interests not found");
        }

        handlerOk(res, 200, findinterest, 'intrest found successfully')
    } catch (error) {
        next(error)
    }
}

const userVerifyOtp = async (req, res, next) => {
    try {
        const {
            userEmail,
            userPhoneNumber,
            userFirstName,
            userLastName,
            userDateOfBirth,
            userGender,
            interest, // Array of interests selected by the user
            otp,
            userPassword,
            userDeviceToken,
            userDeviceType,
            emergencyContactNumber,
            wantDailyActivities,
            wantDailySupplement,
            userCity,
            userStates,
            userCountry,
        } = req.body;

        // ✅ Find OTP
        const findotp = await prisma.otp.findFirst({
            where: {
                otp: otp,
            },
        });

        if (!findotp) {
            throw new NotFoundError("OTP not found");
        }

        // ✅ Check if OTP is expired
        const now = new Date();
        if (findotp.expiresAt < now) {
            throw new ConflictError("OTP has expired");
        }

        if (findotp.otpReason === "REGISTER") {
            const hashedPassword = await hashPassword(userPassword);

            if (findotp.otpUsed) {
                throw new ConflictError("OTP already used");
            }

            const dob = new Date(userDateOfBirth);

            // ✅ Validate interests exist
            const validInterestRecords = await prisma.interest.findMany({
                where: {
                    id: { in: interest }
                },
                select: { id: true }
            });

            const validInterestIds = validInterestRecords.map(i => i.id);
            const missingIds = interest.filter(id => !validInterestIds.includes(id));

            if (missingIds.length > 0) {
                throw new NotFoundError(`Invalid interest IDs: ${missingIds.join(', ')}`);
            }

            // ✅ Create the user
            const saveuser = await prisma.user.create({
                data: {
                    email: userEmail,
                    password: hashedPassword,
                    phoneNumber: userPhoneNumber,
                    firstName: userFirstName,
                    lastName: userLastName,
                    dateOfBirth: dob,
                    deviceToken: userDeviceToken,
                    deviceType: userDeviceType,
                    gender: userGender,
                    userType: userConstants.USER,
                    emergencyContactNumber,
                    wantDailyActivities,
                    wantDailySupplement,
                    city: userCity,
                    states: userStates,
                    country: userCountry,
                    interests: {
                        connect: validInterestIds.map(id => ({ id }))
                    }
                },
                include: {
                    interests: true
                }
            });

            // ✅ Mark OTP as used
            await prisma.otp.update({
                where: {
                    id: findotp.id,
                },
                data: {
                    otpUsed: true,
                    userId: saveuser.id,
                },
            });

            // Create Wallet with 0 balance

            await prisma.wallet.create({
                data: {
                    userId: saveuser.id,
                    balance: 0.0
                }
            })

            // Give 10 initial connects

            await prisma.connectPurchase.create({
                data: {
                    userId: saveuser.id,
                    quantity: 50
                }
            });

            // ✅ Assign Free subscription plan
            let freePlan = await prisma.subscriptionPlan.findUnique({
                where: { name: 'Free' }
            });

            // Auto-create Free plan if not exists
            if (!freePlan) {
                freePlan = await prisma.subscriptionPlan.create({
                    data: {
                        name: 'Free',
                        price: 0.0,
                        duration: 1 // month
                    }
                });
            }

            const now = new Date();
            const expiry = new Date();
            expiry.setMonth(expiry.getMonth() + 1); // Set expiry to 1 month later


            await prisma.userSubscription.create({
                data: {
                    userId: saveuser.id,
                    subscriptionPlanId: freePlan.id,
                    startDate: now,
                    endDate: expiry,
                    isActive: true
                }
            });

            // Generate token
            const token = genToken({
                id: saveuser.id,
                userType: userConstants.USER,
            });

            return handlerOk(res, 201, { ...saveuser, userToken: token }, "User registered successfully");
        }

        if (findotp.otpReason === "FORGETPASSWORD") {
            const finduser = await prisma.user.findUnique({
                where: {
                    email: userEmail
                }
            });

            if (!finduser) {
                throw new NotFoundError("Email not found");
            }

            if (findotp.otpUsed) {
                throw new ConflictError("OTP already used");
            }

            // ✅ Mark OTP as used
            await prisma.otp.update({
                where: {
                    id: findotp.id,
                },
                data: {
                    otpUsed: true,
                    userId: finduser.id,
                },
            });

            // ✅ Generate token
            const token = genToken({
                id: finduser.id,
                userType: userConstants.USER,
            });

            return handlerOk(res, 201, { userToken: token }, "Now set your password");
        }

    } catch (error) {
        next(error);
    }
}

const userForgetPassword = async (req, res, next) => {
    try {
        const { userEmail } = req.body;

        const finduser = await prisma.user.findUnique({
            where: {
                email: userEmail
            }
        });

        if (!finduser) {
            throw new NotFoundError("email not found");
        }

        const otp = generateOtp();
        const expiretime = generateOtpExpiry(1);


        const saveotp = await prisma.otp.create({
            data: {
                otp: otp,
                userId: finduser.id,
                otpReason: otpConstants.FORGETPASSWORD,
                otpUsed: false,
                expiresAt: expiretime
            }
        });


        const emailData = {
            subject: "Ollie - Reset Your Password",
            html: emailTemplates.forgetPassword(otp),
        };

        await sendEmails(userEmail, emailData.subject, emailData.html);


        handlerOk(res, 200, otp, 'otp send successfully')

    } catch (error) {
        next(error)
    }
}

const userResetPassword = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { userPassword } = req.body;

        const hashedPassword = await hashPassword(userPassword);

        const updatePassword = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                password: hashedPassword
            }
        });

        if (!updatePassword) {
            throw new ValidationError("password not update")
        }

        handlerOk(res, 200, null, 'password updated successfully')

    } catch (error) {
        next(error)
    }
}

const userLogin = async (req, res, next) => {
    try {
        const { userEmail, userPassword } = req.body;

        const finduser = await prisma.user.findUnique({
            where: {
                email: userEmail
            },
            include: {
                Wallet: true,
                ConnectPurchase: true,
                UserSubscription: true
                // {
                //     // include: {
                //     //     SubscriptionPlan: true
                //     // }
                // },
            }
        });

        if (!finduser) {
            throw new NotFoundError("user not found")
        }

        const comparePass = await comparePassword(userPassword, finduser.password);

        if (!comparePass) {
            throw new BadRequestError("password not correct");
        }

        const token = genToken({
            id: finduser.id,
            userType: userConstants.USER
        });

        const response = {
            userToken: token
        }

        handlerOk(res, 200, { ...finduser, ...response }, 'user login successfully')

    } catch (error) {
        next(error)
    }
}

const userEditProfile = async (req, res, next) => {
    try {
        const { userFirstName, userLastName, userEmail, userPhoneNumber, userDateOfBirth, userGender } = req.body;

        const { id } = req.user;
        const file = req.file;

        console.log(file, 'file');


        const currentPrifile = await prisma.user.findUnique({
            where: {
                id: id
            }
        });

        if (!currentPrifile) {
            throw new NotFoundError("user not found")
        }

        const updateObj = {}

        if (userFirstName) {
            updateObj.firstName = userFirstName
        }

        if (userLastName) {
            updateObj.lastName = userLastName
        }

        if (userEmail) {
            updateObj.email = userEmail
        }

        if (userPhoneNumber) {
            updateObj.phoneNumber = userPhoneNumber
        }

        if (userDateOfBirth) {
            const isValidDate = /^\d{2}-\d{2}-\d{4}$/.test(userDateOfBirth);
            if (!isValidDate) {
                throw new BadRequestError('please provide date in day-month-year format')
            }
            const [day, month, year] = userDateOfBirth.split("-");
            const dob = new Date(`${year}-${month}-${day}`);
            updateObj.dateOfBirth = dob;
        }

        if (userGender) {
            updateObj.gender = userGender
        }

        if (file) {
            const filePath = file.filename; // use filename instead of path
            const basePath = `http://${req.get("host")}/public/uploads/`;
            const image = `${basePath}${filePath}`;
            updateObj.image = image;
        }

        const updateuser = await prisma.user.update({
            where: {
                id: id
            },
            data: updateObj
        });

        if (!updateuser) {
            throw new ValidationError("user not update")
        }

        handlerOk(res, 200, updateuser, 'user updated successfully')



    } catch (error) {
        next(error)
    }
}

const userLogOut = async (req, res, next) => {
    try {
        const { id, deviceToken, firstName } = req.user;

        console.log(id);

        console.log(deviceToken, 'devicetoken');

        const logout = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                deviceToken: null
            }
        });

        if (!logout) {
            throw new ValidationError('user not logout')
        }

        handlerOk(res, 200, null, 'user logout successfully')
    } catch (error) {
        next(error)
    }
}


const userDeleteAccount = async (req, res, next) => {
    try {
        const { id } = req.user;

        await prisma.$transaction([
            prisma.wallet.deleteMany({ where: { userId: id } }),
            prisma.connectPurchase.deleteMany({ where: { userId: id } }),
            prisma.userSubscription.deleteMany({ where: { userId: id } }),
            prisma.user.delete({ where: { id: id } }),
        ]);

        handlerOk(res, 200, null, 'User account deleted successfully');
    } catch (error) {
        next(error);
    }
};


module.exports = {
    userRegister,
    getInterest,
    userLogin,
    userForgetPassword,
    userVerifyOtp,
    userResetPassword,
    userEditProfile,
    userLogOut,
    userDeleteAccount

}