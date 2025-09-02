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
const uploadFileWithFolder = require("../../utils/s3Upload");
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require("path");


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
        const expiretime = generateOtpExpiry(2);
        console.log(expiretime);

        console.log(otp, 'otp');
        console.log(expiretime, 'expiretime');

        const saveotp = await prisma.otp.create({
            data: {
                email: userEmail,
                otp: otp,
                // userId: null,
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

const createProfile = async (req, res, next) => {
    try {
        const { email } = req.user;
        const { id } = req.user;
        const {
            userPhoneNumber,
            userFirstName,
            userLastName,
            userDateOfBirth,
            userGender,
            interest, // Array of interests selected by the user
            userDeviceToken,
            userDeviceType,
            emergencyContactNumber,
            wantDailyActivities,
            wantDailySupplement,
            userCity,
            userStates,
            userCountry,
        } = req.body;



        const existprofile = await prisma.user.findFirst({
            where: {
                id,
                isCreatedProfile: true
            }
        });

        if (existprofile) {
            throw new ConflictError("user profile exist already exist")
        }

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

        const dob = new Date(userDateOfBirth);

        // ✅ Create the user
        const saveuser = await prisma.user.update({
            where: {
                email
            },
            data: {
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
                isCreatedProfile: true,
                interests: {
                    connect: validInterestIds.map(id => ({ id }))
                }
            },
            include: {
                interests: true
            }
        });

        // ✅ Mark OTP as used
        const otpRecord = await prisma.otp.findFirst({
            where: {
                email: email
            }
        });

        if (!otpRecord) {
            throw new NotFoundError("OTP not found");
        }

        await prisma.otp.update({
            where: {
                id: otpRecord.id,  // Use the id of the found OTP record
            },
            data: {
                otpUsed: true,
            },
        });

        // Create Wallet with 0 balance
        await prisma.wallet.create({
            data: {
                userId: saveuser.id,
                balance: 0.0
            }
        });

        // Give 50 initial connects
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

        return handlerOk(res, 201, { ...saveuser, userToken: token }, "Profile Created successfully");

    } catch (error) {
        next(error)
    }
}

const resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Find existing OTP record by email (not user)
        const existingOtp = await prisma.otp.findFirst({
            where: {
                email,
                otpUsed: false,
            },
        });

        if (!existingOtp) {
            throw new NotFoundError("OTP Record Not Found");
        }

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        await prisma.otp.update({
            where: { id: existingOtp.id },
            data: {
                otp,
                otpUsed: false,
                expiresAt,
            },
        });

        const emailData = {
            subject: "Ollie - Account Verification",
            html: emailTemplates.resendOTP(otp),
        };

        await sendEmails(email, emailData.subject, emailData.html);

        handlerOk(res, 201, otp, "OTP sent successfully. Now verify your OTP.");
    } catch (error) {
        next(error);
    }
};

const userVerifyOtp = async (req, res, next) => {
    try {
        const {
            userEmail,
            // userPhoneNumber,
            // userFirstName,
            // userLastName,
            // userDateOfBirth,
            // userGender,
            // interest, // Array of interests selected by the user
            otp,
            userPassword,
            // userDeviceToken,
            // userDeviceType,
            // emergencyContactNumber,
            // wantDailyActivities,
            // wantDailySupplement,
            // userCity,
            // userStates,
            // userCountry,
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

            // const dob = new Date(userDateOfBirth);

            // ✅ Validate interests exist
            // const validInterestRecords = await prisma.interest.findMany({
            //     where: {
            //         id: { in: interest }
            //     },
            //     select: { id: true }
            // });

            // const validInterestIds = validInterestRecords.map(i => i.id);
            // const missingIds = interest.filter(id => !validInterestIds.includes(id));

            // if (missingIds.length > 0) {
            //     throw new NotFoundError(`Invalid interest IDs: ${missingIds.join(', ')}`);
            // }

            // ✅ Create the user
            const saveuser = await prisma.user.create({
                data: {
                    email: userEmail,
                    password: hashedPassword,
                    // phoneNumber: userPhoneNumber,
                    // firstName: userFirstName,
                    // lastName: userLastName,
                    // dateOfBirth: dob,
                    // deviceToken: userDeviceToken,
                    // deviceType: userDeviceType,
                    // gender: userGender,
                    userType: userConstants.USER
                    // emergencyContactNumber,
                    // wantDailyActivities,
                    // wantDailySupplement,
                    // city: userCity,
                    // states: userStates,
                    // country: userCountry,
                    // interests: {
                    //     connect: validInterestIds.map(id => ({ id }))
                    // }
                },
                // include: {
                //     interests: true
                // }
            });

            // ✅ Mark OTP as used
            await prisma.otp.update({
                where: {
                    id: findotp.id,
                },
                data: {
                    otpUsed: true,
                    // userId: saveuser.id,
                },
            });

            // // Create Wallet with 0 balance

            // await prisma.wallet.create({
            //     data: {
            //         userId: saveuser.id,
            //         balance: 0.0
            //     }
            // })

            // // Give 10 initial connects

            // await prisma.connectPurchase.create({
            //     data: {
            //         userId: saveuser.id,
            //         quantity: 50
            //     }
            // });

            // // ✅ Assign Free subscription plan
            // let freePlan = await prisma.subscriptionPlan.findUnique({
            //     where: { name: 'Free' }
            // });

            // // Auto-create Free plan if not exists
            // if (!freePlan) {
            //     freePlan = await prisma.subscriptionPlan.create({
            //         data: {
            //             name: 'Free',
            //             price: 0.0,
            //             duration: 1 // month
            //         }
            //     });
            // }

            // const now = new Date();
            // const expiry = new Date();
            // expiry.setMonth(expiry.getMonth() + 1); // Set expiry to 1 month later


            // await prisma.userSubscription.create({
            //     data: {
            //         userId: saveuser.id,
            //         subscriptionPlanId: freePlan.id,
            //         startDate: now,
            //         endDate: expiry,
            //         isActive: true
            //     }
            // });

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
                    // userId: finduser.id,
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
        const expiretime = generateOtpExpiry(2);


        const saveotp = await prisma.otp.create({
            data: {
                email: userEmail,
                otp: otp,
                // userId: finduser.id,
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
                UserSubscription: true,
                interests: true
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

        const currentProfile = await prisma.user.findUnique({
            where: { id: id }
        });

        if (!currentProfile) {
            throw new NotFoundError("User not found");
        }

        const updateObj = {};

        if (file) {
            // Check if the file exists before attempting to use it
            const fileBuffer = file.buffer;
            const folder = 'uploads';
            const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
            const contentType = file.mimetype;

            const s3ImageUrl = await uploadFileWithFolder(fileBuffer, filename, contentType, folder);
            updateObj.image = s3ImageUrl; // Add the image URL to the update object
        }

        // Update other fields if provided
        if (userFirstName) {
            updateObj.firstName = userFirstName;
        }

        if (userLastName) {
            updateObj.lastName = userLastName;
        }

        if (userEmail) {
            updateObj.email = userEmail;
        }

        if (userPhoneNumber) {
            updateObj.phoneNumber = userPhoneNumber;
        }

        if (userDateOfBirth) {
            const isValidDate = /^\d{2}-\d{2}-\d{4}$/.test(userDateOfBirth);
            if (!isValidDate) {
                throw new BadRequestError('Please provide date in day-month-year format');
            }
            const [day, month, year] = userDateOfBirth.split("-");
            const dob = new Date(`${year}-${month}-${day}`);
            updateObj.dateOfBirth = dob;
        }

        if (userGender) {
            updateObj.gender = userGender;
        }

        const updateUser = await prisma.user.update({
            where: { id: id },
            data: updateObj
        });

        if (!updateUser) {
            throw new ValidationError("User not updated");
        }

        handlerOk(res, 200, updateUser, 'User updated successfully');

    } catch (error) {
        next(error);
    }
};


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



// const userDeleteAccount = async (req, res, next) => {
//     try {
//         const { id } = req.user;

//         const result = await prisma.$transaction(async (tx) => {
//             // 1) Chat rooms created by this user (blocks via creatorId)
//             const rooms = await tx.chatRoom.findMany({
//                 where: { creatorId: id },
//                 select: { id: true },
//             });
//             const roomIds = rooms.map(r => r.id);

//             if (roomIds.length) {
//                 // Messages reference chatRoom WITHOUT onDelete cascade → delete first
//                 await tx.message.deleteMany({ where: { chatRoomId: { in: roomIds } } });
//                 // Participants have onDelete: Cascade, but deleteMany is harmless/explicit
//                 await tx.chatRoomParticipant.deleteMany({ where: { chatRoomId: { in: roomIds } } });
//                 // Now remove the rooms
//                 await tx.chatRoom.deleteMany({ where: { id: { in: roomIds } } });
//             }

//             // 2) Messages sent by this user in any room (senderId → User.id). Keep messages, null sender.
//             await tx.message.updateMany({
//                 where: { senderId: id },
//                 data: { senderId: null },
//             });

//             // 3) Wallet & transactions (delete tx first to avoid FK on walletId)
//             await tx.walletTransaction.deleteMany({ where: { wallet: { userId: id } } });
//             await tx.wallet.deleteMany({ where: { userId: id } });

//             // 4) Purchases / subscriptions / posts by user
//             await tx.connectPurchase.deleteMany({ where: { userId: id } });
//             await tx.userSubscription.deleteMany({ where: { userId: id } });
//             await tx.userPost.deleteMany({ where: { userId: id } });

//             // 5) Event participation & volunteering (these relations default to RESTRICT)
//             await tx.eventParticipant.deleteMany({ where: { userId: id } });
//             await tx.volunteerRequest.deleteMany({ where: { volunteerId: id } });

//             // 6) Credits referencing user (nullable → set null)
//             await tx.credit.updateMany({ where: { userId: id }, data: { userId: null } });

//             // 7) Misc direct user FKs (RESTRICT by default unless you set Cascade)
//             await tx.notification.deleteMany({ where: { userId: id } });
//             await tx.donation.deleteMany({ where: { userId: id } });

//             // (Likes/comments/saves/tasks etc. are already modeled with onDelete: Cascade to User)

//             // 8) Finally: delete the user
//             const deletedUser = await tx.user.delete({ where: { id } });
//             return { deletedUser };
//         });

//         handlerOk(res, 200, result, 'User account deleted successfully');
//     } catch (error) {
//         next(error);
//     }
// };

const userDeleteAccount = async (req, res, next) => {
    try {
        const { id } = req.user;

        const result = await prisma.$transaction(async (tx) => {
            // --- 0) (Optional) resolve walletTx via walletIds to avoid relational filter quirks
            const wallets = await tx.wallet.findMany({ where: { userId: id }, select: { id: true } });
            const walletIds = wallets.map(w => w.id);

            // --- 1) Chat rooms created by this user (creatorId -> User)
            const rooms = await tx.chatRoom.findMany({
                where: { creatorId: id },
                select: { id: true },
            });
            const roomIds = rooms.map(r => r.id);

            if (roomIds.length) {
                await tx.message.deleteMany({ where: { chatRoomId: { in: roomIds } } });
                await tx.chatRoomParticipant.deleteMany({ where: { chatRoomId: { in: roomIds } } });
                await tx.chatRoom.deleteMany({ where: { id: { in: roomIds } } });
            }

            // --- 2) Messages sent by this user anywhere → keep messages, orphan sender
            await tx.message.updateMany({ where: { senderId: id }, data: { senderId: null } });

            // --- 3) Wallet & transactions
            if (walletIds.length) await tx.walletTransaction.deleteMany({ where: { walletId: { in: walletIds } } });
            await tx.wallet.deleteMany({ where: { userId: id } });

            // --- 4) Purchases / subscriptions / user posts
            await tx.connectPurchase.deleteMany({ where: { userId: id } });
            await tx.userSubscription.deleteMany({ where: { userId: id } });
            await tx.userPost.deleteMany({ where: { userId: id } });

            // --- 5) Event participation / volunteering
            await tx.eventParticipant.deleteMany({ where: { userId: id } });
            await tx.volunteerRequest.deleteMany({ where: { volunteerId: id } });

            // --- 6) Credits (nullable -> set null)
            await tx.credit.updateMany({ where: { userId: id }, data: { userId: null } });

            // --- 7) Notifications, donations
            await tx.notification.deleteMany({ where: { userId: id } });
            await tx.donation.deleteMany({ where: { userId: id } });

            // --- 8) Saves / likes / comments / topics / tasks (defensive even if cascaded)
            await tx.savedBlog.deleteMany({ where: { userId: id } });
            await tx.savedTopic.deleteMany({ where: { userId: id } });
            await tx.task.deleteMany({ where: { userId: id } });

            await tx.like.deleteMany({ where: { userId: id } });
            await tx.postLike.deleteMany({ where: { userId: id } });
            await tx.userPostLike.deleteMany({ where: { userId: id } });

            await tx.commentLike.deleteMany({ where: { userId: id } });
            await tx.userPostCommentLike.deleteMany({ where: { userId: id } });
            await tx.postCommentLike.deleteMany({ where: { userId: id } });

            await tx.comment.deleteMany({ where: { userId: id } });
            await tx.userPostComment.deleteMany({ where: { userId: id } });
            await tx.postComment.deleteMany({ where: { userId: id } });

            // --- 9) PostRequests (LIKELY CULPRIT: userId has no onDelete)
            await tx.postRequest.deleteMany({ where: { userId: id } });

            // --- 10) Finally delete the user
            const deletedUser = await tx.user.delete({ where: { id } });
            return { deletedUser };
        });

        handlerOk(res, 200, null, 'User account deleted successfully');
    } catch (error) {
        // Log the exact FK to know what else to clear (Prisma exposes meta.field_name)
        console.error('Delete failed', error.code, error.meta);
        next(error);
    }
};



const getMe = async (req, res, next) => {
    try {
        const { id } = req.user;

        const finduser = await prisma.user.findUnique({
            where: {
                id
            },
            include: {
                Wallet: true,
                ConnectPurchase: true,
                UserSubscription: true,
                interests: true
            }
        });

        const token = genToken({
            id: finduser.id,
            userType: userConstants.USER
        });

        const response = {
            userToken: token
        }

        handlerOk(res, 200, { ...finduser, ...response }, 'user found successfully')
    } catch (error) {
        next(error)
    }
}


module.exports = {
    userRegister,
    getInterest,
    userLogin,
    userForgetPassword,
    userVerifyOtp,
    userResetPassword,
    userEditProfile,
    userLogOut,
    userDeleteAccount,
    resendOtp,
    createProfile,
    getMe

}