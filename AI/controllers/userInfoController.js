const prisma = require("../../config/prismaConfig");
const { NotFoundError, ForbiddenError, ValidationError, BadRequestError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const checkAndDeductUserCredit = require("../../utils/checkConnects");
const checkUserSubscription = require("../../utils/checkSubscription");
const sendNotification = require("../../utils/notification");

const getUserInfo = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        email: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        deviceType: true,
        city: true,
        country: true,
        states: true,
        userType: true,
        notificationOnAndOff: true,
        wantDailySupplement: true,
        wantDailyActivities: true,
        emergencyContactNumber: true,
        additional_context: true,
        createdAt: true,
        savedTopics: {
          select: {
            blogcategory: {
              select: {
                name: true
              }
            }
          }
        },
        interests: {
          select: {
            name: true
          }
        },
        Notification: {
          where: {
            isRead: false
          },
          select: {
            title: true,
            description: true,
            updatedAt: true
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 5
        }
      }
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const userInfo = {
      email: user.email,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      deviceType: user.deviceType,
      city: user.city,
      country: user.country,
      states: user.states,
      userType: user.userType,
      notificationOnAndOff: user.notificationOnAndOff,
      wantDailySupplement: user.wantDailySupplement,
      wantDailyActivities: user.wantDailyActivities,
      emergencyContactNumber: user.additional_context,
      createdAt: user.createdAt,
      savedTopics: user.savedTopics.map(topic => topic.blogcategory.name),
      interests: user.interests.map(interest => interest.name),
      notifications: user.Notification
    };

    handlerOk(res, 200, userInfo, 'User information retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getUserTasks = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { completed } = req.query;

    const whereClause = { userId: id };
    if (completed !== undefined) {
      whereClause.markAsComplete = completed === 'true';
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        id: true,
        taskName: true,
        taskDescription: true,
        markAsComplete: true,
        scheduledDate: true,
        scheduledTime: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    handlerOk(res, 200, tasks, 'User tasks retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const createUserTask = async (req, res, next) => {
  try {
    const { taskName, taskDescription, dateAndTime } = req.body;
    const { id, deviceToken, firstName } = req.user;

    if (!taskName || !taskDescription) {
      throw new BadRequestError("Task name and description are required");
    }

    await checkUserSubscription(id, "Your package has expired. Upgrade your plan to create tasks.");
    await checkAndDeductUserCredit(id, "You have no credits left to create tasks.");

    const createtask = await prisma.task.create({
      data: {
        taskName: taskName,
        taskDescription: taskDescription,
        scheduledDate: dateAndTime ? new Date(dateAndTime) : new Date(),
        scheduledTime: dateAndTime ? new Date(dateAndTime).toTimeString().split(' ')[0] : new Date().toTimeString().split(' ')[0],
        userId: id
      }
    });

    if (!createtask) {
      throw new ValidationError("User task not created");
    }

    handlerOk(res, 200, createtask, 'User task created successfully');
  } catch (error) {
    next(error);
  }
};

const markTaskComplete = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { id, deviceToken, firstName } = req.user;

    const findtask = await prisma.task.findUnique({
      where: {
        id: taskId,
        userId: id
      }
    });

    if (!findtask) {
      throw new NotFoundError("Task not found");
    }

    const updateddata = await prisma.task.update({
      where: {
        id: findtask.id,
        userId: id
      },
      data: {
        markAsComplete: true
      }
    });

    handlerOk(res, 200, updateddata, 'Task is completed');
  } catch (error) {
    next(error);
  }
};

const getLatestBlogs = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { limit = 5 } = req.query;

    await checkUserSubscription(id, "Your package has expired. Upgrade your plan to read blog content.");
    await checkAndDeductUserCredit(id, "You have no credits left to read blog content.");

    const blogs = await prisma.blog.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        createdAt: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    handlerOk(res, 200, blogs, 'Latest blogs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getBlogTitles = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const blogs = await prisma.blog.findMany({
      select: {
        id: true,
        title: true,
        image: true,
        createdAt: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    handlerOk(res, 200, blogs, 'Blog titles retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getBlogContent = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { blogId } = req.params;

    if (!blogId) {
      throw new BadRequestError("Blog ID is required");
    }

    await checkUserSubscription(id, "Your package has expired. Upgrade your plan to read blog content.");
    await checkAndDeductUserCredit(id, "You have no credits left to read blog content.");

    const blog = await prisma.blog.findUnique({
      where: {
        id: blogId
      },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        createdAt: true,
        category: {
          select: {
            name: true
          }
        }
      }
    });

    if (!blog) {
      throw new NotFoundError("Blog not found");
    }

    handlerOk(res, 200, blog, 'Blog content retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getLatestEvents = async (req, res, next) => {
  try {
    const { limit = 5, type = 'future' } = req.query;

    let whereClause = {};
    let orderBy = {};

    switch (type) {
      case 'future':
        whereClause = {
          eventDateAndTime: {
            gte: new Date()
          }
        };
        orderBy = { eventDateAndTime: 'asc' };
        break;
      case 'past':
        whereClause = {
          eventDateAndTime: {
            lt: new Date()
          }
        };
        orderBy = { eventDateAndTime: 'desc' };
        break;
      case 'all':
        whereClause = {};
        orderBy = { createdAt: 'desc' };
        break;
      default:
        whereClause = {
          eventDateAndTime: {
            gte: new Date()
          }
        };
        orderBy = { eventDateAndTime: 'asc' };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      select: {
        id: true,
        eventName: true,
        eventDescription: true,
        eventDateAndTime: true,
        eventAddress: true,
        image: true,
        createdAt: true
      },
      orderBy: orderBy,
      take: parseInt(limit)
    });

    handlerOk(res, 200, events, 'Latest events retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getUserSocialInfo = async (req, res, next) => {
  try {
    const { id } = req.user;

    const userLikes = await prisma.like.findMany({
      where: { userId: id },
      include: {
        blog: {
          include: {
            category: true
          }
        }
      },
      orderBy: { id: 'desc' },
      take: 20
    });

    const userPostLikes = await prisma.userPostLike.findMany({
      where: { userId: id },
      include: {
        post: {
          include: {
            user: true
          }
        }
      },
      orderBy: { id: 'desc' },
      take: 20
    });

    const userComments = await prisma.comment.findMany({
      where: { userId: id },
      include: {
        blog: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const userPostComments = await prisma.userPostComment.findMany({
      where: { userId: id },
      include: {
        userpost: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const savedPosts = await prisma.savedBlog.findMany({
      where: { userId: id },
      include: {
        adminPost: {
          include: {
            category: true
          }
        },
        userPost: {
          include: {
            user: true
          }
        }
      },
      orderBy: { id: 'desc' },
      take: 20
    });

    const userPosts = await prisma.userPost.findMany({
      where: { userId: id },
      include: {
        userpostlikes: {
          include: {
            user: true
          }
        },
        userpostcomments: {
          include: {
            user: true
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const socialInfo = {
      blogLikes: userLikes.map(like => ({
        id: like.id,
        likedAt: like.blog.createdAt,
        blog: {
          id: like.blog.id,
          title: like.blog.title,
          category: like.blog.category.name
        }
      })),
      userPostLikes: userPostLikes.map(like => ({
        id: like.id,
        likedAt: like.post.createdAt,
        post: {
          id: like.post.id,
          title: like.post.title,
          author: `${like.post.user.firstName || ''} ${like.post.user.lastName || ''}`.trim()
        }
      })),
      blogComments: userComments.map(comment => ({
        id: comment.id,
        comment: comment.comment,
        commentedAt: comment.createdAt,
        blog: {
          id: comment.blog.id,
          title: comment.blog.title,
          category: comment.blog.category.name
        }
      })),
      userPostComments: userPostComments.map(comment => ({
        id: comment.id,
        comment: comment.comment,
        commentedAt: comment.createdAt,
        post: {
          id: comment.userpost.id,
          title: comment.userpost.title,
          author: `${comment.userpost.user.firstName || ''} ${comment.userpost.user.lastName || ''}`.trim()
        }
      })),
      savedPosts: savedPosts.map(saved => ({
        id: saved.id,
        postType: saved.postType,
        savedAt: new Date().toISOString(),
        post: saved.postType === 'ADMIN' ? {
          id: saved.adminPost?.id,
          title: saved.adminPost?.title,
          category: saved.adminPost?.category?.name,
          type: 'admin'
        } : {
          id: saved.userPost?.id,
          title: saved.userPost?.title,
          author: `${saved.userPost?.user?.firstName || ''} ${saved.userPost?.user?.lastName || ''}`.trim(),
          type: 'user'
        }
      })),
      userPosts: userPosts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
        views: post.views,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likesCount: post.userpostlikes.length,
        commentsCount: post.userpostcomments.length,
        recentComments: post.userpostcomments.map(comment => ({
          id: comment.id,
          comment: comment.comment,
          author: `${comment.user.firstName || ''} ${comment.user.lastName || ''}`.trim(),
          createdAt: comment.createdAt
        }))
      }))
    };

    handlerOk(res, 200, socialInfo, 'User social information retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getUserRequestInfo = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { limit = 20 } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        city: true,
        country: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const postRequests = await prisma.postRequest.findMany({
      where: { userId: userId },
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        },
        volunteerRequests: {
          include: {
            volunteer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                city: true,
                country: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { id: 'desc' },
      take: parseInt(limit)
    });

    const volunteerRequestsMade = await prisma.volunteerRequest.findMany({
      where: { volunteerId: userId },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                city: true,
                country: true
              }
            },
            categories: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    const requestInfo = {
      user: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        location: `${user.city || ''}, ${user.country || ''}`.trim(),
        joinedAt: user.createdAt
      },

      helpRequestsMade: postRequests.map(post => ({
        id: post.id,
        description: post.description,
        scheduledAt: post.scheduledAt,
        status: post.status,
        location: {
          latitude: post.latitude,
          longitude: post.longitude
        },
        categories: post.categories.map(cat => ({
          id: cat.id,
          name: cat.name
        })),
        volunteers: post.volunteerRequests.map(vr => ({
          id: vr.id,
          status: vr.status,
          appliedAt: vr.createdAt,
          volunteer: {
            id: vr.volunteer.id,
            name: `${vr.volunteer.firstName || ''} ${vr.volunteer.lastName || ''}`.trim(),
            email: vr.volunteer.email,
            location: `${vr.volunteer.city || ''}, ${vr.volunteer.country || ''}`.trim()
          }
        }))
      })),

      volunteerApplications: volunteerRequestsMade.map(vr => ({
        id: vr.id,
        status: vr.status,
        appliedAt: vr.createdAt,
        helpRequest: {
          id: vr.post.id,
          description: vr.post.description,
          scheduledAt: vr.post.scheduledAt,
          status: vr.post.status,
          location: {
            latitude: vr.post.latitude,
            longitude: vr.post.longitude
          },
          categories: vr.post.categories.map(cat => ({
            id: cat.id,
            name: cat.name
          })),
          requester: {
            id: vr.post.user.id,
            name: `${vr.post.user.firstName || ''} ${vr.post.user.lastName || ''}`.trim(),
            email: vr.post.user.email,
            location: `${vr.post.user.city || ''}, ${vr.post.user.country || ''}`.trim()
          }
        }
      })),

      summary: {
        totalHelpRequests: postRequests.length,
        activeHelpRequests: postRequests.filter(p => !['TaskCompleted'].includes(p.status)).length,
        completedHelpRequests: postRequests.filter(p => p.status === 'TaskCompleted').length,
        totalVolunteerApplications: volunteerRequestsMade.length,
        acceptedVolunteerApplications: volunteerRequestsMade.filter(vr => ['ReachOut', 'MarkAsCompleted', 'TaskCompleted'].includes(vr.status)).length,
        pendingVolunteerApplications: volunteerRequestsMade.filter(vr => vr.status === 'VolunteerRequestSent').length,
        completedVolunteerWork: volunteerRequestsMade.filter(vr => vr.status === 'TaskCompleted').length
      }
    };

    handlerOk(res, 200, requestInfo, 'User volunteer request information retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getUserFinancialInfo = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { includeTransactions = true, transactionLimit = 10 } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: userId },
      include: includeTransactions === 'true' ? {
        transactions: {
          select: {
            id: true,
            amount: true,
            type: true,
            description: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(transactionLimit)
        }
      } : false
    });

    const credits = await prisma.credit.findMany({
      where: { userId: userId },
      select: {
        id: true,
        credit: true,
        amount: true,
        isClaimed: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        isActive: true,
        endDate: {
          gte: new Date()
        }
      },
      include: {
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true
          }
        }
      },
      orderBy: { endDate: 'desc' }
    });

    const connectPurchase = await prisma.connectPurchase.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        quantity: true,
        createdAt: true
      }
    });

    const donations = await prisma.donation.findMany({
      where: { userId: userId },
      select: {
        id: true,
        amount: true,
        currency: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const financialInfo = {
      user: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        memberSince: user.createdAt
      },

      wallet: wallet ? {
        id: wallet.id,
        balance: wallet.balance,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
        transactions: wallet.transactions || []
      } : null,

      credits: {
        total: credits.reduce((sum, c) => sum + (c.isClaimed ? 0 : c.amount), 0),
        unclaimed: credits.filter(c => !c.isClaimed),
        claimed: credits.filter(c => c.isClaimed),
        all: credits
      },

      subscription: activeSubscription ? {
        id: activeSubscription.id,
        plan: activeSubscription.subscriptionPlan.name,
        price: activeSubscription.subscriptionPlan.price,
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate,
        isActive: activeSubscription.isActive
      } : null,

      connects: connectPurchase ? {
        quantity: connectPurchase.quantity,
        purchasedAt: connectPurchase.createdAt
      } : null,

      donations: donations,

      summary: {
        walletBalance: wallet?.balance || 0,
        totalCredits: credits.reduce((sum, c) => sum + (c.isClaimed ? 0 : c.amount), 0),
        unclaimedCredits: credits.filter(c => !c.isClaimed).length,
        hasActiveSubscription: !!activeSubscription,
        totalDonated: donations.reduce((sum, d) => sum + d.amount, 0),
        connectsAvailable: connectPurchase?.quantity || 0
      }
    };

    handlerOk(res, 200, financialInfo, 'User financial information retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getUserChatRooms = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { limit = 20, messageLimit = 5 } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get chat room participants for this user (simplified query)
    const chatRoomParticipants = await prisma.chatRoomParticipant.findMany({
      where: {
        userIds: {
          array_contains: userId
        }
      },
      include: {
        chatRoom: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: parseInt(messageLimit),
              include: {
                sender: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      },
      take: parseInt(limit)
    });

    const chatRooms = chatRoomParticipants.map(participant => {
      const room = participant.chatRoom;
      return {
        id: room.id,
        type: room.type,
        name: room.name,
        description: room.description,
        image: room.image || null,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        participants: [{
          type: 'user',
          id: userId,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
        }],
        recentMessages: room.messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          attachmentUrl: msg.attachmentUrl || null,
          attachmentType: msg.attachmentType || null,
          createdAt: msg.createdAt,
          sender: {
            type: 'user',
            id: msg.senderId,
            name: msg.sender ?
              `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() || msg.sender.email :
              'Unknown User'
          }
        })),
        messageCount: room.messages.length
      };
    });

    const chatInfo = {
      user: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email
      },
      chatRooms: chatRooms,
      summary: {
        totalChatRooms: chatRooms.length,
        oneToOneChats: chatRooms.filter(r => r.type === 'ONE_TO_ONE').length,
        groupChats: chatRooms.filter(r => r.type === 'GROUP').length
      }
    };

    handlerOk(res, 200, chatInfo, 'User chat rooms retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const createUserPost = async (req, res, next) => {
  try {
    const { postTitle, postContent } = req.body;
    const { id, firstName, deviceToken } = req.user;

    if (!postTitle || !postContent) {
      throw new BadRequestError("Post title and content are required");
    }

    await checkUserSubscription(id, "Your package has expired. Upgrade your plan to create posts.");
    await checkAndDeductUserCredit(id, "You have no credits left to create posts.");

    // Get the first available category
    const defaultCategory = await prisma.interest.findFirst();

    if (!defaultCategory) {
      throw new BadRequestError("No categories available. Please contact administrator.");
    }

    const createPost = await prisma.userPost.create({
      data: {
        title: postTitle,
        content: postContent,
        image: null,
        userId: id,
        categoryId: defaultCategory.id
      },
      include: {
        user: true,
        category: true
      }
    });

    if (!createPost) {
      throw new ValidationError("User post not created");
    }

    handlerOk(res, 200, createPost, 'User post created successfully');
  } catch (error) {
    next(error);
  }
};

const createHelpRequest = async (req, res, next) => {
  try {
    const { dateAndTime, postdescription, latitude, longitude, categoryIds } = req.body;
    const { id, deviceToken, firstName } = req.user;

    if (!postdescription) {
      throw new BadRequestError("Description is required");
    }

    await checkUserSubscription(id, "Your package has expired. Upgrade your plan to create help requests.");
    await checkAndDeductUserCredit(id, "You have no credits left to create help requests.");

    const parsedLatitude = latitude ? parseFloat(latitude) : 0.0;
    const parsedLongitude = longitude ? parseFloat(longitude) : 0.0;

    const validCategoryIds = categoryIds
      ? (Array.isArray(categoryIds) ? categoryIds : [categoryIds])
      : [];

    if (validCategoryIds && validCategoryIds.length > 0) {
      const existingCategories = await prisma.postRequestCategory.findMany({
        where: {
          id: { in: validCategoryIds }
        }
      });

      if (existingCategories.length !== validCategoryIds.length) {
        throw new NotFoundError("One or more post request categories not found");
      }
    }

    const createpostrequest = await prisma.postRequest.create({
      data: {
        scheduledAt: dateAndTime || new Date(),
        description: postdescription,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        userId: id,
        categories: validCategoryIds && validCategoryIds.length > 0 ? {
          connect: validCategoryIds.map((catId) => ({ id: catId }))
        } : undefined
      },
      include: {
        categories: true,
        user: true
      }
    });

    if (!createpostrequest) {
      throw new ValidationError("Help request not created");
    }

    handlerOk(res, 200, createpostrequest, 'Help request created successfully');
  } catch (error) {
    next(error);
  }
};

const getChatRoomDetails = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { chatRoomId } = req.params;
    const { messageLimit = 50, messageOffset = 0 } = req.query;

    const participation = await prisma.chatRoomParticipant.findFirst({
      where: {
        chatRoomId: chatRoomId,
        userIds: {
          array_contains: userId
        }
      }
    });

    if (!participation) {
      throw new ForbiddenError("You are not a participant in this chat room");
    }

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: parseInt(messageOffset),
          take: parseInt(messageLimit)
        }
      }
    });

    if (!chatRoom) {
      throw new NotFoundError("Chat room not found");
    }

    const chatRoomDetails = {
      id: chatRoom.id,
      type: chatRoom.type,
      name: chatRoom.name,
      description: chatRoom.description,
      image: chatRoom.image,
      createdAt: chatRoom.createdAt,
      updatedAt: chatRoom.updatedAt,

      participants: [{
        type: 'user',
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        image: null
      }],

      messages: chatRoom.messages.reverse().map(msg => ({
        id: msg.id,
        content: msg.content,
        attachmentUrl: msg.attachmentUrl || null,
        attachmentType: msg.attachmentType || null,
        createdAt: msg.createdAt,
        sender: {
          type: 'user',
          id: msg.senderId,
          name: msg.sender ?
            `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() || msg.sender.email :
            'Unknown User',
          image: msg.sender?.image || null
        }
      })),

      pagination: {
        offset: parseInt(messageOffset),
        limit: parseInt(messageLimit),
        hasMore: chatRoom.messages.length === parseInt(messageLimit)
      }
    };

    handlerOk(res, 200, chatRoomDetails, 'Chat room details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateUserContext = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { additional_context } = req.body;

    if (additional_context === undefined) {
      return res.status(400).json({
        success: false,
        message: "additional_context is required"
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { additional_context: additional_context },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        additional_context: true,
        updatedAt: true
      }
    });

    handlerOk(res, 200, {
      id: updatedUser.id,
      name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
      email: updatedUser.email,
      additional_context: updatedUser.additional_context,
      updatedAt: updatedUser.updatedAt
    }, 'User context updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserInfo,
  getUserTasks,
  createUserTask,
  markTaskComplete,
  getLatestBlogs,
  getBlogTitles,
  getBlogContent,
  getLatestEvents,
  getUserSocialInfo,
  getUserRequestInfo,
  getUserFinancialInfo,
  getUserChatRooms,
  getChatRoomDetails,
  createUserPost,
  createHelpRequest,
  updateUserContext
};