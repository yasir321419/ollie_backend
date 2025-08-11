const { PostRequestStatus } = require("@prisma/client");
const prisma = require("../../config/prismaConfig");
const { NotFoundError, ValidationError, BadRequestError, ForbiddenError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const checkAndDeductUserCredit = require("../../utils/checkConnects");
const checkUserSubscription = require("../../utils/checkSubscription");
const sendNotification = require("../../utils/notification");
const { PostRequestStatusConstants, VolunteerRequestStatusConstants } = require("../../constants/constant");

const getPostRequestCaterogy = async (req, res, next) => {
  try {
    const findpostrequestcateogy = await prisma.postRequestCategory.findMany({});

    if (findpostrequestcateogy.length === 0) {
      throw new NotFoundError("post request category not found")
    }

    handlerOk(res, 200, findpostrequestcateogy, 'post request category found successfully')
  } catch (error) {
    next(error)
  }
}

const createPostRequest = async (req, res, next) => {
  try {
    const { dateAndTime, postdescription, latitude, longitude, postRequestCategory } = req.body;
    const { id, deviceToken, firstName } = req.user;

    await checkUserSubscription(id, "your package has expired Upgrade your plan to create the post request");
    await checkAndDeductUserCredit(id, "you have no credits left to  create the post request");


    // Ensure it's an array (even if one item)

    const categoryIds = Array.isArray(postRequestCategory)
      ? postRequestCategory
      : [postRequestCategory];

    const existingCategories = await prisma.postRequestCategory.findMany({
      where: {
        id: { in: categoryIds }
      }
    });

    if (existingCategories.length !== categoryIds.length) {
      throw new NotFoundError("One or more post request categories not found")
    }

    const createpostrequest = await prisma.postRequest.create({
      data: {
        scheduledAt: dateAndTime,
        description: postdescription,
        latitude: latitude,
        longitude: longitude,
        userId: id,
        categories: {
          connect: categoryIds.map((catId) => ({ id: catId }))
        }
      },

      include: {
        categories: true,
        user: true
      }

    });

    if (!createpostrequest) {
      throw new ValidationError("post request not create")
    }

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have successfully created a post request.`
    // );

    handlerOk(res, 200, createpostrequest, 'post request created successfully');

  } catch (error) {
    next(error)
  }
}

const getUserPostRequest = async (req, res, next) => {
  try {
    const { id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const finduserpostrequest = await Promise.all([

      prisma.postRequest.findMany({
        where: {
          userId: id
        },
        include: {
          user: true
        },
        skip,
        take: limit
      })
    ])


    if (finduserpostrequest.length === 0) {
      throw new NotFoundError("user post request not found")
    }


    handlerOk(res, 200,

      ...finduserpostrequest

      , 'user post request found successfully');

    // handlerOk(res, 200, finduserpostrequest, "user post request found successfully")
  } catch (error) {
    next(error)
  }
}

const getAllPostRequest = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const { id: userId } = req.user;

    // 1️⃣ Check if the user has any post requests
    const userRequestCount = await prisma.postRequest.count({
      where: { userId }
    });

    console.log(`User has ${userRequestCount} post requests`);

    let whereClause = {};
    if (userRequestCount > 0) {
      // If the user has requests, fetch only their own requests
      whereClause = { userId };
    } else {
      // If the user has no requests, show posts from other users with the given status
      whereClause = {
        status: {
          in: [
            PostRequestStatusConstants.ReachOut, // Use enum values here
            PostRequestStatusConstants.VolunteerRequestSent,
            PostRequestStatusConstants.MarkAsCompleted,
            PostRequestStatusConstants.TaskCompleted

          ]
        }
      };
    }

    console.log(`Where Clause: `, whereClause);

    // 2️⃣ Fetch data
    const postRequests = await prisma.postRequest.findMany({
      where: whereClause,
      include: {
        user: true,
        categories: true
      },
      orderBy: { scheduledAt: "desc" },
      skip,
      take: limit
    });

    console.log(`Post Requests: `, postRequests); // Check the fetched data

    // 3️⃣ If no posts at all, we should check and decide on the next fallback
    if (postRequests.length === 0 && userRequestCount === 0) {
      throw new NotFoundError("No post requests found for the user and no default requests available");
    }

    // 4️⃣ Update status to "NoRequest" for other users' requests if the user has no requests
    if (userRequestCount === 0) {
      postRequests.forEach(post => {
        post.status = PostRequestStatus.NoRequest; // Override status for requests from other users
      });
    }

    console.log(`Post Requests with updated status: `, postRequests);

    // 5️⃣ Send response
    handlerOk(res, 200, postRequests, "Post requests found successfully");

  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
};


const sendVolunteerRequest = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { id, deviceToken, firstName } = req.user;

    await checkUserSubscription(id, "your package has expired Upgrade your plan to send the volunteer request");
    await checkAndDeductUserCredit(id, "you have no credits left to send the volunteer request");


    const findpost = await prisma.postRequest.findUnique({
      where: {
        id: postId
      },
      include: {
        user: true,
      }

    });

    if (!findpost) {
      throw new NotFoundError("post not found")
    }

    if (findpost.userId === id) {
      throw new ForbiddenError("you can't send volunteer request to your own post")
    }

    if (findpost.status === "TaskCompleted") {
      throw new ForbiddenError("You cannot send a volunteer request to a completed post.");

    }
    // Check if the volunteer has already applied
    const existingRequest = await prisma.volunteerRequest.findUnique({
      where: {
        postId_volunteerId: {
          postId: postId,
          volunteerId: id
        }
      }
    });

    if (existingRequest) {
      throw new BadRequestError("You have already sent a request for this post.");
    }

    const createrequest = await prisma.volunteerRequest.create({
      data: {
        postId: findpost.id,
        volunteerId: id,
        status: "VolunteerRequestSent"
      }
    });

    if (!createrequest) {
      throw new ValidationError("Volunteer request not create")
    }


    const updatedPostRequest = await prisma.postRequest.update({
      where: {
        id: findpost.id
      },
      data: {
        status: "VolunteerRequestSent"
      },
      include: {
        user: true
      }

    })

    if (!updatedPostRequest) {
      throw new ValidationError("post request not create")
    }

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have successfully sent a volunteer request.`
    // );

    // await sendNotification(
    //   findpost.userId, // post owner's user ID
    //   findpost.user.deviceToken, // assuming you have access to this
    //   `Hi ${findpost.user.firstName}, you received a new volunteer request for your post.`
    // );


    handlerOk(res, 200, { ...updatedPostRequest, createrequest }, 'Volunteer request sent successfully')

  } catch (error) {
    next(error)
  }
}

const getAllVolunteerRequest = async (req, res, next) => {
  try {
    const { id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const findAllVolunteerRequests = await Promise.all([
      prisma.volunteerRequest.findMany({
        where: {
          status: {
            in: ["VolunteerRequestSent", "ReachOut"] // Use enum values or strings if enums are set up correctly
          }, post: {
            userId: id // Only requests for posts owned by the user
          }
        },
        include: {
          post: true,        // Include post details
          volunteer: true    // Include volunteer user info
        },
        skip,
        take: limit
      })
    ]);


    if (findAllVolunteerRequests.length === 0) {
      throw new NotFoundError("volunteer request not found")
    }



    handlerOk(res, 200, ...findAllVolunteerRequests, 'volunteer request found succesfully')
  } catch (error) {
    next(error)
  }
}

const acceptVolunteer = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { id, deviceToken, firstName } = req.user; // action can be 'accept' or 'reject'
    const { action } = req.body;
    console.log(action);

    const findrequest = await prisma.volunteerRequest.findUnique({
      where: {
        id: requestId
      },
      include: {
        post: true,
        volunteer: true
      }
    });

    if (!findrequest) {
      throw new NotFoundError("Volunteer request not found");
    }

    if (findrequest.post.userId !== id) {
      throw new ForbiddenError("You are not authorized to accept or reject this request");
    }

    let updatedVolunteerRequest, updatedPostRequest;

    if (action === 'accept') {
      // Accepting the request
      updatedVolunteerRequest = await prisma.volunteerRequest.update({
        where: {
          id: findrequest.id
        },
        data: {
          status: VolunteerRequestStatusConstants.ReachOut // Use the correct enum value here
        }
      });

      updatedPostRequest = await prisma.postRequest.update({
        where: {
          id: findrequest.postId
        },
        data: {
          status: VolunteerRequestStatusConstants.ReachOut // Use the correct enum value here
        }
      });

    } else if (action === 'reject') {
      // Rejecting the request
      updatedVolunteerRequest = await prisma.volunteerRequest.update({
        where: {
          id: findrequest.id
        },
        data: {
          status: VolunteerRequestStatusConstants.NoRequest // Use the correct enum value here
        }
      });

      updatedPostRequest = await prisma.postRequest.update({
        where: {
          id: findrequest.postId
        },
        data: {
          status: VolunteerRequestStatusConstants.NoRequest // Use the correct enum value here
        }
      });

    } else {
      throw new ValidationError("Invalid action. Use 'accept' or 'reject'.");
    }

    if (!updatedVolunteerRequest || !updatedPostRequest) {
      throw new ValidationError("Error updating volunteer request or post request.");
    }

    // Optionally send notifications if needed
    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have successfully ${action}ed a volunteer request.`
    // );

    // await sendNotification(
    //   findrequest.volunteerId,
    //   findrequest.volunteer.deviceToken,
    //   `Hi ${findrequest.volunteer.firstName}, your volunteer request has been ${action}ed!`
    // );

    handlerOk(res, 200, { updatedVolunteerRequest, updatedPostRequest }, `Volunteer request ${action}ed successfully`);

  } catch (error) {
    next(error);
  }
};

const markAsCompletedByVolunteer = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { id, firstName, deviceToken } = req.user;

    const findrequest = await prisma.volunteerRequest.findUnique({
      where: {
        id: requestId
      }
    });

    if (!findrequest) {
      throw new NotFoundError("volunteer request not found")
    }

    if (findrequest.volunteerId !== id) {
      throw new ForbiddenError("You are not authorized to mark this request as completed");
    }
    const updatedVolunteerRequest = await prisma.volunteerRequest.update({
      where: {
        id: findrequest.id
      },
      data: {
        status: "MarkAsCompleted"
      }
    });

    if (!updatedVolunteerRequest) {
      throw new ValidationError("volunteer request not updated")
    }

    const updatedrequest = await prisma.postRequest.update({
      where: {
        id: findrequest.postId,
      },
      data: {
        status: "MarkAsCompleted"
      },
      include: {
        user: true
      }
    });

    if (!updatedrequest) {
      throw new ValidationError("post request not updated")
    }

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have successfully marked the request as completed as a volunteer.`

    // );

    handlerOk(res, 200, { ...updatedrequest, updatedVolunteerRequest }, 'Post marked as completed by volunteer successfully');
  } catch (error) {
    next(error)
  }
}

const confirmTaskCompletedByOwner = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { id, deviceToken, firstName } = req.user;

    const findrequest = await prisma.volunteerRequest.findUnique({
      where: {
        id: requestId
      },
      include: {
        post: true
      }
    });

    if (!findrequest) {
      throw new NotFoundError("volunteer request not found")
    }

    if (findrequest.post.userId !== id) {
      throw new ForbiddenError("You are not authorized to complete this task");
    }

    const updatedVolunteerRequest = await prisma.volunteerRequest.update({
      where: {
        id: findrequest.id
      },
      data: {
        status: "TaskCompleted"
      }
    });

    if (!updatedVolunteerRequest) {
      throw new ValidationError("volunteer request not updated")
    }

    const updatedPostRequest = await prisma.postRequest.update({
      where: {
        id: findrequest.postId
      },
      data: {
        status: "TaskCompleted"
      },
      include: {
        user: true
      }
    });

    if (!updatedPostRequest) {
      throw new ValidationError("post request not updated")
    }

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have successfully marked the request as completed as a owner.`

    // );

    handlerOk(res, 200, { ...updatedPostRequest, updatedVolunteerRequest }, 'post request updated successfully');

  } catch (error) {
    next(error)
  }
}

const getAllVolenteerCompletedPost = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { id } = req.user;

    const findallvalunteercompletedpost = await prisma.postRequest.findFirst({
      where: {
        id: requestId,
        status: "TaskCompleted"
      },
      include: {
        volunteerRequests: {
          include: {
            volunteer: true // assuming this refers to the User model
          }
        }
      }
    });

    if (!findallvalunteercompletedpost) {
      throw new NotFoundError("volunteer for completed post not found");
    }

    handlerOk(res, 200, findallvalunteercompletedpost, 'Volunteers for completed posts retrieved successfully')
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getPostRequestCaterogy,
  createPostRequest,
  getUserPostRequest,
  getAllPostRequest,
  sendVolunteerRequest,
  getAllVolunteerRequest,
  acceptVolunteer,
  markAsCompletedByVolunteer,
  confirmTaskCompletedByOwner,
  getAllVolenteerCompletedPost
}