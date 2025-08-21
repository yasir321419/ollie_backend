const prisma = require("../../config/prismaConfig");
const { ValidationError, NotFoundError, BadRequestError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const checkAndDeductUserCredit = require("../../utils/checkConnects");
const checkUserSubscription = require("../../utils/checkSubscription");
const sendNotification = require("../../utils/notification");

const createUserPost = async (req, res, next) => {
  try {
    const { postTitle, postContent } = req.body;
    const { categoryId } = req.params;

    const { id, firstName, deviceToken } = req.user;

    await checkUserSubscription(id, "your package has expired Upgrade your plan to create the post");
    await checkAndDeductUserCredit(id, "you have no credits left to create the post");

    const findcategory = await prisma.interest.findUnique({ where: { id: categoryId } })


    if (!findcategory) {
      throw new NotFoundError("blog category not found")
    }

    const file = req.file;
    if (!file) {
      throw new BadRequestError("please provide blog image");
    }

    const filePath = file.filename; // use filename instead of path
    const basePath = `http://${req.get("host")}/public/uploads/`;
    const postImage = `${basePath}${filePath}`;


    const createPost = await prisma.userPost.create({
      data: {
        title: postTitle,
        content: postContent,
        image: postImage,
        userId: id,
        categoryId: findcategory.id
      },
      include: {
        user: true,
        category: true
      }
    });

    if (!createPost) {
      throw new ValidationError("user post not create")
    }

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have created a post titled "${createPost.title}".`
    // );

    handlerOk(res, 200, createPost, 'user post created successfully')


  } catch (error) {
    next(error)
  }
}

const showUserAllPost = async (req, res, next) => {
  try {
    const { id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const showuserposts = await Promise.all([
      prisma.userPost.findMany({
        where: {
          userId: id
        },
        include: {
          user: true,
          _count: {
            select: { userpostlikes: true, userpostcomments: true }
          }
        },
        skip,
        take: limit
      })
    ])

    if (showuserposts.length === 0) {
      throw new NotFoundError("user posts not found")
    }

    handlerOk(res, 200,

      showuserposts

      , 'user posts found successfully');

    // handlerOk(res, 200, showuserposts, 'user posts found successfully')
  } catch (error) {
    next(error)
  }
}

const showSingleUserPost = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { postId } = req.params;


    const showuserpost = await prisma.userPost.update({
      where: {
        id: postId,
        userId: id
      },
      data: {
        views: {
          increment: 1
        }
      },
      include: {
        user: true,
        _count: {
          select: { userpostlikes: true, userpostcomments: true }
        }
      }
    });

    if (!showuserpost) {
      throw new NotFoundError("user post not found")
    }

    handlerOk(res, 200, showuserpost, 'user post found successfully')
  } catch (error) {
    next(error)
  }
}

const updateUserPost = async (req, res, next) => {
  try {
    const { id, deviceToken, firstName } = req.user;
    const { postId } = req.params;
    const { postTitle, postContent } = req.body;
    const file = req.file;

    const updatedObj = {};

    if (postTitle) {
      updatedObj.title = postTitle;
    }

    if (postContent) {
      updatedObj.content = postContent;
    }

    if (file) {

      const filePath = file.filename; // use filename instead of path
      const basePath = `http://${req.get("host")}/public/uploads/`;
      const postImage = `${basePath}${filePath}`;
      updatedObj.image = postImage;
    }


    const updateuserpost = await prisma.userPost.update({
      where: {
        id: postId,
        userId: id
      },
      data: updatedObj
    });

    if (!updateuserpost) {
      throw new ValidationError("user post not update")
    }

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have updated a post titled "${updateuserpost.title}".`
    // );

    handlerOk(res, 200, updateuserpost, 'user post updated succeessfully')
  } catch (error) {
    next(error)
  }
}

const deleteUserPost = async (req, res, next) => {
  try {
    const { id, deviceToken, firstName } = req.user;

    const { postId } = req.params;

    const findpost = await prisma.userPost.findUnique({ where: { id: postId } });

    if (!findpost) {
      throw new NotFoundError("post not found")
    }
    const deleteuserpost = await prisma.userPost.delete({
      where: {
        id: findpost.id,
        userId: id
      }
    });

    if (!deleteuserpost) {
      throw new ValidationError("user post not delete")
    }

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have deleted a post titled "${findpost.title}".`
    // );


    handlerOk(res, 200, null, 'user post deleted succesfully');

  } catch (error) {
    next(error)
  }
}


const likeAndUnlikeUserPost = async (req, res, next) => {
  try {
    const { id, deviceToken, firstName } = req.user;

    const { postId } = req.params;
    let action = '';

    const findPost = await prisma.userPost.findUnique({
      where: {
        id: postId
      }
    });

    if (!findPost) {
      throw new NotFoundError("user post not found")
    }

    const existingLike = await prisma.userPostLike.findUnique({
      where: {
        userId_postId: {
          userId: id,
          postId: postId
        }
      }
    });

    if (existingLike) {
      await prisma.userPostLike.delete({
        where: {
          userId_postId: {
            userId: id,
            postId: postId
          }
        }
      })

      action = 'unlike'

    } else {
      await prisma.userPostLike.create({
        data: {
          userId: id,
          postId: postId
        }
      })
      action = 'liked'
    }

    const likeCount = await prisma.userPostLike.count({
      where: {
        postId: postId
      }
    });

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have ${action} the blog titled "${findPost.title}".`
    // );

    handlerOk(res, 200, { findPost, likeCount, action }, `Post ${action} succesfully`)
  } catch (error) {
    next(error)
  }
}

const commentUserPost = async (req, res, next) => {
  try {
    const { id, firstName, deviceToken } = req.user;

    const { postId } = req.params;

    const { comment } = req.body;

    const findblog = await prisma.userPost.findUnique({
      where: {
        id: postId
      }
    });

    if (!findblog) {
      throw new NotFoundError("Post not found")
    }

    const createComment = await prisma.userPostComment.create({
      data: {
        userId: id,
        postId: postId,
        comment: comment
      },
      include: {
        user: true,
        userpost: true
      }
    });

    if (!createComment) {
      throw new ValidationError("Failed to create comment")
    }

    const countComment = await prisma.userPostComment.count({
      where: {
        postId: parseInt(postId)
      }
    });


    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you commented on the blog titled "${findblog.title}".`
    // );

    handlerOk(res, 200, { createComment, countComment }, 'comment on post successfully')
  } catch (error) {
    next(error)
  }
}

const likeAndReplyOnUserPostComment = async (req, res, next) => {
  try {
    const { id, firstName, deviceToken } = req.user;
    const { commentId } = req.params;
    const { like, reply } = req.body;

    const findcomment = await prisma.userPostComment.findUnique({
      where: {
        id: commentId
      }
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


      const existingLike = await prisma.userPostCommentLike.findUnique({
        where: {
          commentId_userId: {
            commentId: commentId,
            userId: id
          }
        }
      })

      if (like && !existingLike) {
        liked = await prisma.userPostCommentLike.create({
          data: {
            commentId: commentId,
            userId: id
          }
        })
        actions.push("liked");
        message += "Liked"
      }
      else if (!like && existingLike) {
        await prisma.userPostCommentLike.delete({
          where: {
            commentId_userId: {
              commentId: commentId,
              userId: id
            }
          }
        });
        unliked = true;
        message += "UnLike"
        actions.push("unliked");

      }
    }

    if (reply) {
      replied = await prisma.userPostComment.create({
        data: {
          userId: id,
          postId: findcomment.postId,
          comment: reply,
          parentId: commentId
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

    const likeCount = await prisma.userPostCommentLike.count({
      where: {
        commentId: commentId
      }
    });

    const commentCount = await prisma.userPostComment.count({
      where: {
        parentId: commentId
      }
    });

    // const truncatedComment = findcomment.comment.length > 30
    //   ? findcomment.comment.substring(0, 30) + "..."
    //   : findcomment.comment;

    // const notificationMessage = `Hi ${firstName}, you have ${actions.join(" and ")} on the comment: "${truncatedComment}"`;

    // await sendNotification(id, deviceToken, notificationMessage);

    handlerOk(res, 200, { liked, replied, unliked, likeCount, commentCount }, message)



  } catch (error) {
    next(error)
  }
}

const showUserPostCommentLikeReply = async (req, res, next) => {
  try {
    const comment = await prisma.userPostComment.findMany({
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
        const likeCount = await prisma.userPostCommentLike.count({
          where: { commentId: comment.id }
        });

        comment.likeCount = likeCount;

        if (comment.replies && comment.replies.length > 0) {
          comment.replies = await addLikeCounts(comment.replies);
        }

        return comment;
      }));
    };

    const commentsWithCounts = await addLikeCounts(comment);

    handlerOk(res, 200, commentsWithCounts, "All comments with nested replies and like counts retrieved successfully");

  } catch (error) {
    next(error)
  }
}



module.exports = {
  createUserPost,
  showUserAllPost,
  likeAndUnlikeUserPost,
  commentUserPost,
  likeAndReplyOnUserPostComment,
  showUserPostCommentLikeReply,
  showSingleUserPost,
  updateUserPost,
  deleteUserPost
}