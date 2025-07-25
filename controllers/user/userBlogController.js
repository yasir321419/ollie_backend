const prisma = require("../../config/prismaConfig");
const { NotFoundError, ConflictError, ValidationError, BadRequestError, ForbiddenError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const checkAndDeductUserCredit = require("../../utils/checkConnects");
const checkUserSubscription = require("../../utils/checkSubscription");
const sendNotification = require("../../utils/notification");

const getAllTopics = async (req, res, next) => {
  try {
    const findalltopics = await prisma.interest.findMany();

    if (findalltopics.length === 0) {
      throw new NotFoundError("topics not found")
    }
    handlerOk(res, 200, findalltopics, 'blog topics found successfully')
  } catch (error) {
    next(error)
  }
}

const getAllBlogByTopics = async (req, res, next) => {
  try {
    const { topicsId } = req.params;
    const { id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    console.log(id);

    await checkUserSubscription(id, "your package has expired Upgrade your plan to read the blogs");
    await checkAndDeductUserCredit(id, "you have no credits left to read blogs");

    const findtopic = await prisma.interest.findUnique({
      where: {
        id: topicsId
      }
    });

    if (!findtopic) {
      throw new NotFoundError("topic not found")
    }

    const findblogbytopics = await Promise.all([
      prisma.blog.findMany({
        where: { categoryId: findtopic.id },
        include: {
          category: true,
          _count: { select: { likes: true, comments: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.blog.count({
        where: { categoryId: findtopic.id }
      }),
    ]);

    if (findblogbytopics.length === 0) {
      throw new NotFoundError("blogs not found")
    }

    handlerOk(
      res,
      200,
      findblogbytopics, // <-- array only
      "Blogs found successfully",
    );

  } catch (error) {
    next(error)
  }
}

const getAllLatestBlog = async (req, res, next) => {
  try {
    const { id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    await checkUserSubscription(id, "your package has expired Upgrade your plan to read the latest blog");
    await checkAndDeductUserCredit(id, "you have no credits left to read latest blogs");

    const findlatestblog = await Promise.all([
      prisma.blog.findMany({
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit,
        include: {
          category: true,
          _count: {
            select: { likes: true, comments: true },
          },
        },
      }),
      prisma.blog.count()
    ]);

    if (findlatestblog.length === 0) {
      throw new NotFoundError("blogs not found")
    }


    handlerOk(
      res,
      200,
      findlatestblog,
      'Latest blogs found successfully',
    );
  } catch (error) {
    next(error)
  }
}

const getSingleBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { id } = req.user;

    await checkUserSubscription(id, "your package has expired Upgrade your plan to read the blog");
    await checkAndDeductUserCredit(id, "you have no credits left to read the blog");

    const blog = await prisma.blog.update({
      where: {
        id: blogId
      },
      data: {
        views: {
          increment: 1
        }
      },
      include: {
        category: true,
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    if (!blog) {
      throw new NotFoundError("Blog not found");
    }

    handlerOk(res, 200, blog, "Blog found and view count incremented");
  } catch (error) {
    next(error);
  }
};

const saveBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { id, deviceToken, firstName } = req.user;

    const adminpost = await prisma.blog.findUnique({
      where: {
        id: blogId
      }
    });

    let userpost = null;

    if (!adminpost) {
      userpost = await prisma.userPost.findUnique({
        where: {
          id: blogId
        }
      });
      if (!userpost) {
        throw new NotFoundError("user post not found");
      }
    }

    let alreadySaved = null;
    let blogTitle = '';

    if (adminpost) {
      alreadySaved = await prisma.savedBlog.findUnique({
        where: {
          userId_adminPostId: {
            userId: id,
            adminPostId: blogId
          }
        }
      });

      if (alreadySaved) {
        throw new ConflictError("Blog already saved");
      }

      blogTitle = adminpost.title;

      await prisma.savedBlog.create({
        data: {
          userId: id,
          adminPostId: blogId,
          postType: "ADMIN"
        }
      })
    } else if (userpost) {
      alreadySaved = await prisma.savedBlog.findUnique({
        where: {
          userId_userPostId: {
            userId: id,
            userPostId: blogId,
          }
        }
      });

      if (alreadySaved) {
        throw new ConflictError("Blog already saved");
      }

      blogTitle = userpost.title;


      await prisma.savedBlog.create({
        data: {
          userId: id,
          userPostId: blogId,
          postType: "USER"
        }
      })
    }

    // Send notification with blog title included

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you saved the blog titled "${blogTitle}" in your save history!`
    // );

    handlerOk(res, 200, null, 'blog saved successfully')
  } catch (error) {
    next(error)
  }
}

const showSaveBlog = async (req, res, next) => {
  try {
    const { id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const showSavedBlog = await Promise.all([
      prisma.savedBlog.findMany({
        where: { userId: id },
        include: {
          user: true,
          userPost: true,
          adminPost: true
        },
        skip,
        take: limit,
      }),
      prisma.savedBlog.count({
        where: { userId: id }
      })
    ]);

    if (showSavedBlog.length === 0) {
      throw new NotFoundError("saved blog not found")
    }


    handlerOk(
      res,
      200,
      showSavedBlog,
      'Saved blogs found successfully'
    );

  } catch (error) {
    next(error)
  }
}

const likeAndUnlikeBlog = async (req, res, next) => {
  try {
    const { id, deviceToken, firstName } = req.user; // Assuming user is authenticated and added by middleware

    const { blogId } = req.params;

    let action = '';

    const findblog = await prisma.blog.findUnique({
      where: {
        id: blogId,
      },
    });

    if (!findblog) {
      throw new NotFoundError("Blog not found");
    }

    // Correct compound key usage
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_blogId: {
          userId: id,
          blogId: blogId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_blogId: {
            userId: id,
            blogId: blogId,
          },
        }
      });
      action = 'unliked'
    } else {

      await prisma.like.create({
        data: {
          userId: id,
          blogId: blogId,
        }
      });
      action = 'liked'
    }

    const likeCount = await prisma.like.count({
      where: {
        blogId: blogId,
      },
    });

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have ${action} the blog titled "${findblog.title}".`
    // );

    handlerOk(res, 200, { findblog, likeCount, action }, `Blog ${action} successfully`);
  } catch (error) {
    next(error);
  }
}

const commentBlog = async (req, res, next) => {
  try {
    const { id, deviceToken, firstName } = req.user;

    const { blogId } = req.params;

    const { comment } = req.body;

    const findblog = await prisma.blog.findUnique({
      where: {
        id: blogId
      }
    });

    if (!findblog) {
      throw new NotFoundError("blog not found")
    }


    const createcomment = await prisma.comment.create({
      data: {
        userId: id,
        blogId: blogId,
        comment: comment
      },
      include: {
        blog: true,
        user: true
      }
    });

    if (!createcomment) {
      throw new ValidationError("comment not post")
    }

    const countComment = await prisma.comment.count({
      where: {
        blogId: blogId
      }
    });

    if (!countComment) {
      throw new ValidationError("comment not count")
    }

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you commented on the blog titled "${findblog.title}".`
    // );


    handlerOk(res, 200, { countComment, createcomment }, "comment on post successfully")

  } catch (error) {
    next(error)
  }
}

const likeAndReplyOnComment = async (req, res, next) => {
  try {
    const { id, deviceToken, firstName } = req.user;
    const { commentId } = req.params;
    const { like, reply } = req.body;


    const findcomment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!findcomment) {
      throw new NotFoundError("comment not found");
    }

    let liked = null;
    let replied = null;
    let unliked = false;
    let message = "";
    const actions = [];


    if (like !== undefined) {
      const existingLike = await prisma.commentLike.findUnique({
        where: {
          commentId_userId: {
            commentId: commentId,
            userId: id
          }
        }
      });

      if (like && !existingLike) {
        liked = await prisma.commentLike.create({
          data: {
            commentId: commentId,
            userId: id
          }
        });
        actions.push("liked");
        message += "Liked";
      } else if (!like && existingLike) {
        await prisma.commentLike.delete({
          where: {
            commentId_userId: {
              commentId: commentId,
              userId: id
            }
          }
        });
        unliked = true;
        message += "Unliked";
        actions.push("unliked");
      }
    }

    if (reply) {
      replied = await prisma.comment.create({
        data: {
          userId: id,
          blogId: findcomment.blogId,
          comment: reply,
          parentId: commentId // 👈 This makes it a reply
        }
      });
      actions.push("replied");
      message += message ? " and replied" : "Replied";
    }

    if (!message) {
      message = "No action performed";
    } else {
      message += " successfully";
    }

    const likeCount = await prisma.commentLike.count({
      where: { commentId: commentId }
    });

    const replyCount = await prisma.comment.count({
      where: { parentId: commentId }
    });

    // const truncatedComment = findcomment.comment.length > 30
    //   ? findcomment.comment.substring(0, 30) + "..."
    //   : findcomment.comment;

    // const notificationMessage = `Hi ${firstName}, you have ${actions.join(" and ")} on the comment: "${truncatedComment}"`;

    // await sendNotification(id, deviceToken, notificationMessage);


    handlerOk(res, 200, { liked, replied, unliked, likeCount, replyCount }, message);
  } catch (error) {
    next(error);
  }
};


const getCommentsLikeReply = async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        parentId: null
      },
      include: {
        user: true,
        replies: {
          include: {
            user: true,
            replies: {
              include: {
                user: true,
                replies: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Helper to recursively add likeCount to comments and replies
    const addLikeCounts = async (comments) => {
      return Promise.all(comments.map(async (comment) => {
        const likeCount = await prisma.commentLike.count({
          where: { commentId: comment.id }
        });

        comment.likeCount = likeCount;

        if (comment.replies && comment.replies.length > 0) {
          comment.replies = await addLikeCounts(comment.replies);
        }

        return comment;
      }));
    };

    const commentsWithCounts = await addLikeCounts(comments);

    handlerOk(res, 200, commentsWithCounts, "All comments with nested replies and like counts retrieved successfully");
  } catch (error) {
    next(error);
  }
};


const getBlogByType = async (req, res, next) => {
  try {
    const { id } = req.user;


    await checkUserSubscription(id, "your package has expired Upgrade your plan to read the blog");
    await checkAndDeductUserCredit(id, "you have no credits left to show blog");

    const { type } = req.query;

    let blog;

    if (type === "popular") {
      blog = await prisma.blog.findFirst({
        orderBy: {
          likes: {
            _count: "desc"
          }
        },
        include: {
          category: true,
          admin: true,
          _count: { select: { likes: true, comments: true } },
        }
      });
    } else if (type === "trending") {
      blog = await prisma.blog.findFirst({
        orderBy: {
          comments: {
            _count: "desc"
          }
        },
        include: {
          category: true,
          admin: true,
          _count: { select: { likes: true, comments: true } },
        }
      });
    } else if (type === "recent") {
      blog = await prisma.blog.findFirst({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          category: true,
          admin: true,
          _count: { select: { likes: true, comments: true } },
        }
      });
    } else {
      throw new BadRequestError("Invalid type. Use: popular, trending, or recent");
    }

    if (!blog) {
      throw new NotFoundError("No blog found for this type");
    }

    handlerOk(res, 200, blog, `${type} blog found successfully`);
  } catch (error) {
    next(error);
  }
};


const getFilterBlog = async (req, res, next) => {
  try {

    const { type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let blogs;

    const commonInclude = {
      category: true,
      admin: true,
      _count: { select: { likes: true, comments: true } },
    };

    if (type === "trending") {

      blogs = await Promise.all([
        prisma.blog.findMany({
          where: { comments: { some: {} } },
          orderBy: { comments: { _count: "desc" } },
          include: commonInclude,
          skip,
          take: limit,
        }),
        prisma.blog.count({
          where: { comments: { some: {} } },
        }),
      ]);

    } else if (type === "most recent") {


      blogs = await Promise.all([
        prisma.blog.findMany({
          orderBy: { createdAt: "desc" },
          include: commonInclude,
          skip,
          take: limit,
        }),
        prisma.blog.count(),
      ]);

    }
    else if (type === "most viewed") {


      blogs = await Promise.all([
        prisma.blog.findMany({
          orderBy: { views: "desc" },
          include: commonInclude,
          skip,
          take: limit,
        }),
        prisma.blog.count(),
      ]);

    } else if (type === "least viewed") {


      blogs = await Promise.all([
        prisma.blog.findMany({
          orderBy: { views: "asc" },
          include: commonInclude,
          skip,
          take: limit,
        }),
        prisma.blog.count(),
      ]);
    }

    else {
      throw new BadRequestError("Invalid type. Use: trending, most recent, most viewed or least viewed");
    }

    if (!blogs) {
      throw new NotFoundError("No blog found for this type");
    }



    handlerOk(
      res,
      200,
      blogs,
      `${type} blogs found successfully`);
  } catch (error) {
    next(error)
  }
}

const saveFavoriteTopic = async (req, res, next) => {
  try {
    const { id, deviceToken, firstName } = req.user;
    const { topicId } = req.params;

    const topic = await prisma.interest.findUnique({
      where: {
        id: topicId
      }
    });

    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    const alreadySaveTopic = await prisma.savedTopic.findUnique({
      where: {
        userId_topicId: {
          userId: id,
          topicId: topicId
        }
      }
    });

    if (alreadySaveTopic) {
      throw new ConflictError("Topic is already saved");
    }

    const saveTopic = await prisma.savedTopic.create({
      data: {
        userId: id,
        topicId: topicId
      }
    });

    if (!saveTopic) {
      throw new ValidationError("Topic is not save")
    }

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you saved the topic titled "${topic.name}" in your save history!`
    // );

    handlerOk(res, 201, saveTopic, "Topic saved successfully");
  } catch (error) {
    next(error)
  }
}

const getFavoriteTopics = async (req, res, next) => {
  try {
    const { id } = req.user;

    const findfavouritetopics = await prisma.savedTopic.findMany({
      where: {
        userId: id
      },
      include: {
        user: true,
        blogcategory: true

      }

    });


    if (findfavouritetopics.length === 0) {
      throw new Error("favourite topic not found");
    }

    // const categoriesOnly = findfavouritetopics.map(item => item.blogcategory);


    // const categoriesOnly = findfavouritetopics.map(item => {
    //   const { blogs, ...categoryWithoutBlogs } = item.blogcategory;
    //   return categoryWithoutBlogs;
    // });


    handlerOk(res, 200, findfavouritetopics, 'favourite topic found succcessfully')
  } catch (error) {
    next(error)
  }
}



module.exports = {
  getAllTopics,
  getAllBlogByTopics,
  getBlogByType,
  getAllLatestBlog,
  getSingleBlog,
  getFilterBlog,
  likeAndUnlikeBlog,
  commentBlog,
  likeAndReplyOnComment,
  saveBlog,
  showSaveBlog,
  getCommentsLikeReply,
  saveFavoriteTopic,
  getFavoriteTopics,

}