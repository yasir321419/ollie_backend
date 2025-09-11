const prisma = require("../../config/prismaConfig");
const { ValidationError, NotFoundError, BadRequestError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const checkAndDeductUserCredit = require("../../utils/checkConnects");
const checkUserSubscription = require("../../utils/checkSubscription");
const sendNotification = require("../../utils/notification");
const uploadFileWithFolder = require("../../utils/s3Upload");
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require("path");

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


    // const filePath = file.path; // Full file path of the uploaded file
    const folder = 'uploads'; // Or any folder you want to store the image in
    const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    const contentType = file.mimetype; // The MIME type of the file

    const fileBuffer = file.buffer;

    const s3ImageUrl = await uploadFileWithFolder(fileBuffer, filename, contentType, folder);

    // const filePath = file.filename; // use filename instead of path
    // const basePath = `http://${req.get("host")}/public/uploads/`;
    const postImage = s3ImageUrl;


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

      ...showuserposts

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

    // const filePath = file.path; // Full file path of the uploaded file
    const folder = 'uploads'; // Or any folder you want to store the image in
    const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    const contentType = file.mimetype; // The MIME type of the file

    const fileBuffer = file.buffer;

    const s3ImageUrl = await uploadFileWithFolder(fileBuffer, filename, contentType, folder);

    const updatedObj = {};

    if (postTitle) {
      updatedObj.title = postTitle;
    }

    if (postContent) {
      updatedObj.content = postContent;
    }

    if (file) {

      // const filePath = file.filename; // use filename instead of path
      // const basePath = `http://${req.get("host")}/public/uploads/`;
      // const postImage = `${basePath}${filePath}`;
      updatedObj.image = s3ImageUrl;
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

const likeAndUnlikePost = async (req, res, next) => {
  try {
    const { id, deviceToken, firstName } = req.user;
    const { type, postId } = req.body;  // Get both type and postId from the body

    console.log('Type:', type);  // Debugging line to check if type is passed correctly
    console.log('Post ID:', postId);  // Debugging line to check if postId is passed correctly

    // Check if it's a UserPost or Post type
    const isUserPost = type === 'user-posts';

    // Find the correct post (UserPost or Post)
    const post = isUserPost
      ? await prisma.userPost.findUnique({ where: { id: postId } })
      : await prisma.post.findUnique({ where: { id: postId } });

    // If no post is found, throw an error
    if (!post) {
      throw new NotFoundError(`${isUserPost ? 'UserPost' : 'Post'} not found`);
    }

    // Determine the like model to use based on type
    const likeModel = isUserPost ? prisma.userPostLike : prisma.postLike;
    const likeCountModel = likeModel; // Use same model for counting likes

    // Check if the user already liked the post
    const existing = await likeModel.findUnique({
      where: { userId_postId: { userId: id, postId } },
    });

    let action; // Declare action without TypeScript type annotation

    // Use transaction for atomic operation
    await prisma.$transaction(async (tx) => {
      if (existing) {
        // If already liked, unlike it
        await tx[isUserPost ? 'userPostLike' : 'postLike'].delete({
          where: { userId_postId: { userId: id, postId } },
        });
        action = 'unliked';
      } else {
        // If not liked, like it
        await tx[isUserPost ? 'userPostLike' : 'postLike'].create({
          data: { userId: id, postId },
        });
        action = 'liked';
      }
    });

    // Get the like count for the post
    const likeCount = await likeCountModel.count({ where: { postId } });

    // Return the result with action, like count, and post
    return handlerOk(
      res,
      200,
      { post, likeCount, action, type: isUserPost ? 'user-post' : 'post' },
      `Post ${action} successfully`
    );
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    next(err);
  }
};


const commentPost = async (req, res, next) => {
  try {
    const { id, firstName, deviceToken } = req.user;
    const { type, postId, comment } = req.body;  // Get type, postId, and comment from the body

    console.log('Type:', type);  // Debugging line to check if type is passed correctly
    console.log('Post ID:', postId);  // Debugging line to check if postId is passed correctly
    console.log('Comment:', comment);  // Debugging line to check if comment is passed correctly

    // Check if it's a UserPost or Post type
    const isUserPost = type === 'user-posts';

    // Find the correct post (UserPost or Post)
    const post = isUserPost
      ? await prisma.userPost.findUnique({ where: { id: postId } })
      : await prisma.post.findUnique({ where: { id: postId } });

    // If no post is found, throw an error
    if (!post) {
      throw new NotFoundError(`${isUserPost ? 'UserPost' : 'Post'} not found`);
    }

    // Create a comment on the found post (UserPost or Post)
    let createComment;
    if (isUserPost) {
      // For UserPost, create a comment in the UserPostComment model
      createComment = await prisma.userPostComment.create({
        data: {
          userId: id,
          postId: postId,
          comment: comment,
        },
        include: {
          user: true,
          userpost: true,
        },
      });
    } else {
      // For regular Post, create a comment in the PostComment model
      createComment = await prisma.postComment.create({
        data: {
          userId: id,
          postId: postId,
          comment: comment,
        },
        include: {
          user: true,
          userpost: true,  // Adjust according to your relationship (if necessary)
        },
      });
    }

    // If the comment creation failed, throw an error
    if (!createComment) {
      throw new ValidationError("Failed to create comment");
    }

    // Get the updated comment count for the post
    const countComment = await (isUserPost
      ? prisma.userPostComment.count({
        where: { postId: postId },
      })
      : prisma.postComment.count({
        where: { postId: postId },
      }));

    // Optional: Send a notification (if necessary)
    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you commented on the blog titled "${findblog.title}".`
    // );

    // Return the result with action, like count, and post
    return handlerOk(
      res,
      200,
      { createComment, countComment },
      "Comment on post successfully"
    );
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    next(error);
  }
};


const likeAndReplyOnComment = async (req, res, next) => {
  try {
    const { id, firstName, deviceToken } = req.user;
    const { commentId, like, reply } = req.body;  // Get commentId, like, and reply from the body

    let findcomment;
    let isUserPost;

    // Check if it's a UserPostComment or PostComment based on the commentId
    findcomment = await prisma.userPostComment.findUnique({
      where: {
        id: commentId,
      },
    });

    // If the comment doesn't belong to a UserPost, check PostComment
    if (!findcomment) {
      findcomment = await prisma.postComment.findUnique({
        where: {
          id: commentId,
        },
      });
      isUserPost = false;  // Indicating this is a regular PostComment
    } else {
      isUserPost = true;  // This is a UserPostComment
    }

    if (!findcomment) {
      throw new NotFoundError("Comment not found");
    }

    let liked = null;
    let replied = null;
    let unliked = false;
    let message = "";
    const actions = [];

    // Handle like/unlike logic
    if (like !== undefined) {
      const existingLike = isUserPost
        ? await prisma.userPostCommentLike.findUnique({
          where: {
            commentId_userId: {
              commentId: commentId,
              userId: id,
            },
          },
        })
        : await prisma.postCommentLike.findUnique({
          where: {
            commentId_userId: {
              commentId: commentId,
              userId: id,
            },
          },
        });

      if (like && !existingLike) {
        liked = isUserPost
          ? await prisma.userPostCommentLike.create({
            data: {
              commentId: commentId,
              userId: id,
            },
          })
          : await prisma.postCommentLike.create({
            data: {
              commentId: commentId,
              userId: id,
            },
          });
        actions.push("liked");
        message += "Liked";
      } else if (!like && existingLike) {
        await (isUserPost
          ? prisma.userPostCommentLike.delete({
            where: {
              commentId_userId: {
                commentId: commentId,
                userId: id,
              },
            },
          })
          : prisma.postCommentLike.delete({
            where: {
              commentId_userId: {
                commentId: commentId,
                userId: id,
              },
            },
          }));
        unliked = true;
        message += "UnLiked";
        actions.push("unliked");
      }
    }

    // Handle reply logic
    if (reply) {
      replied = isUserPost
        ? await prisma.userPostComment.create({
          data: {
            userId: id,
            postId: findcomment.postId,
            comment: reply,
            parentId: commentId,
          },
        })
        : await prisma.postComment.create({
          data: {
            userId: id,
            postId: findcomment.postId,
            comment: reply,
            parentId: commentId,
          },
        });
      actions.push("replied");
      message += message ? " and replied" : "Replied";
    }

    if (!message) {
      message = "No action performed";
    } else {
      message += " successfully";
    }

    // Get the like count for the comment
    const likeCount = isUserPost
      ? await prisma.userPostCommentLike.count({
        where: {
          commentId: commentId,
        },
      })
      : await prisma.postCommentLike.count({
        where: {
          commentId: commentId,
        },
      });

    // Get the comment count (replies) for the comment
    const commentCount = isUserPost
      ? await prisma.userPostComment.count({
        where: {
          parentId: commentId,
        },
      })
      : await prisma.postComment.count({
        where: {
          parentId: commentId,
        },
      });

    // Return the result
    handlerOk(res, 200, { liked, replied, unliked, likeCount, commentCount }, message);
  } catch (error) {
    next(error);
  }
};




const showPostCommentLikeReply = async (req, res, next) => {
  try {
    const { type, postId } = req.body;  // Get type and postId from request body
    if (!type || !postId) {
      return res.status(400).json({ message: "Type and postId are required." });
    }

    const isUserPost = type === 'user-posts'; // Check if it's user-posts
    const commentModel = isUserPost ? prisma.userPostComment : prisma.postComment; // Select the correct model

    // Get top-level comments based on postId
    const comments = await commentModel.findMany({
      where: {
        postId: postId, // Filter comments based on postId
        parentId: null // Get top-level comments (parentId: null)
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

    // Helper function to add like counts recursively
    const addLikeCounts = async (comments) => {
      return Promise.all(comments.map(async (comment) => {
        const likeCount = await prisma[isUserPost ? 'userPostCommentLike' : 'postCommentLike'].count({
          where: { commentId: comment.id }
        });

        comment.likeCount = likeCount;

        if (comment.replies && comment.replies.length > 0) {
          comment.replies = await addLikeCounts(comment.replies); // Recursive call to count likes for replies
        }

        return comment;
      }));
    };

    const commentsWithCounts = await addLikeCounts(comments); // Add like counts to comments and replies

    handlerOk(res, 200, commentsWithCounts, "All comments with nested replies and like counts retrieved successfully");

  } catch (error) {
    next(error);
  }
};




const showAllPostByInterest = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { topicsId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log(id, 'id');

    // Log for debugging
    console.log('topicsId:', topicsId);
    console.log('page:', page, 'limit:', limit);

    // Find the selected topic
    const findtopic = await prisma.interest.findUnique({
      where: { id: topicsId }
    });

    if (!findtopic) {
      throw new NotFoundError("Topic not found");
    }

    // Log the found topic
    console.log('Found Topic:', findtopic);

    // Fetch posts related to the selected topic
    // const posts = await prisma.post.findMany({
    //   where: { categoryId: findtopic.id },
    //   include: {
    //     category: true,
    //     admin: true,
    //     _count: { select: { PostLike: true, postcomments: true } },
    //     savedByUsers: { where: { userId: id }, select: { id: true } },
    //     PostLike: { where: { userId: id }, select: { id: true } }
    //   },
    //   skip,
    //   take: limit,
    //   orderBy: { createdAt: 'desc' },
    // });

    const posts = await prisma.post.findMany({
      where: { categoryId: findtopic.id },
      include: {
        category: true,
        admin: true,
        _count: { select: { PostLike: true, postcomments: true } },
        savedByUsers: { where: { userId: id }, select: { id: true } },
        PostLike: { where: { userId: id }, select: { id: true } }
      },
      skip: skip,   // Check this value to ensure it's correct
      take: limit,  // This defines the maximum number of posts to fetch
      orderBy: { createdAt: 'desc' },
    });


    // Count the total number of posts related to the selected topic
    const totalPostCount = await prisma.post.count({
      where: { categoryId: findtopic.id }
    });

    const totalUserPostCount = await prisma.userPost.count({
      where: { categoryId: findtopic.id }
    });

    // Fetch user posts with categoryId filter

    const userPosts = await prisma.userPost.findMany({
      where: { categoryId: findtopic.id }, // Filter by userId and categoryId
      include: {
        user: true,
        category: true,
        _count: { select: { userpostlikes: true, userpostcomments: true } },
        savedByUsers: { where: { userId: id }, select: { id: true } },
        userpostlikes: { where: { userId: id }, select: { id: true } }
      },
      skip: skip,
      take: limit,
    });


    // Log for debugging
    console.log('posts:', posts);
    console.log('userPosts:', userPosts);

    // Add `isSavePost`, `isLikePost`, and `source` flags to posts
    posts.forEach(post => {
      post.isSavePost = post.savedByUsers.length > 0;
      post.isLikePost = post.PostLike.length > 0;
      post.source = 'admin'; // Identifying admin posts
    });

    userPosts.forEach(userpost => {
      userpost.isSavePost = userpost.savedByUsers.length > 0;
      userpost.isLikePost = userpost.userpostlikes.length > 0;
      userpost.source = 'user'; // Identifying user posts
    });

    // Combine both posts
    const allPosts = [...posts, ...userPosts];

    if (allPosts.length === 0) {
      // throw new NotFoundError("No posts found");
      return res.status(404).json({
        success: false,
        message: "No posts found",
      });
    }

    // Return paginated response with total count
    return res.status(200).json({
      success: true,
      message: "Posts found successfully",
      data: allPosts,
      totalPostCount,
      totalUserPostCount
    });

  } catch (error) {
    next(error);
  }
};


const showAllPostByUserSelectedInterest = async (req, res, next) => {
  try {
    const { id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user interests
    const finduserinterest = await prisma.user.findUnique({
      where: { id },
      include: { interests: true },
    });

    console.log(finduserinterest, 'finduserinterest');

    // Get the list of interests (interest IDs)
    const interestIds = finduserinterest?.interests.map(i => i.id);

    // If user has no interests, throw error
    if (!interestIds || interestIds.length === 0) {
      throw new NotFoundError("User has no selected interests");
    }

    // Fetch posts related to those interests
    const findpostbyinterest = await Promise.all([
      prisma.post.findMany({
        where: {
          categoryId: { in: interestIds }
        },
        include: {
          category: true,
          _count: { select: { PostLike: true, postcomments: true } },
          savedByUsers: {
            where: {
              userId: id
            },
            select: {
              id: true
            }
          },
          PostLike: { // Correct relation from Post model, not UserPost
            where: {
              userId: id
            },
            select: {
              id: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count({
        where: {
          categoryId: { in: interestIds }
        },
      }),
      // Fetch user’s posts
      prisma.userPost.findMany({
        where: {
          categoryId: { in: interestIds }
        },
        include: {
          user: true,
          category: true,
          _count: { select: { userpostlikes: true, userpostcomments: true } },
          savedByUsers: {
            where: {
              userId: id
            },
            select: {
              id: true
            }
          },
          userpostlikes: { // Correct relation to userpostlikes
            where: {
              userId: id
            },
            select: {
              id: true
            }
          }
        },
        skip,
        take: limit,
      })
    ]);

    // Destructure the results
    const posts = findpostbyinterest[0];
    const totalCount = findpostbyinterest[1];
    const userPosts = findpostbyinterest[2];

    // Add `isSavePost` and `isLikePost` flag to each post from the topic
    posts.forEach(post => {
      post.isSavePost = post.savedByUsers.length > 0;
      post.isLikePost = post.PostLike.length > 0;
    });

    // Add `isSavePost` and `isLikePost` flag to each user post
    userPosts.forEach(userpost => {
      userpost.isSavePost = userpost.savedByUsers.length > 0;
      userpost.isLikePost = userpost.userpostlikes.length > 0; // Correct check
    });

    // Combine posts from interests and user posts
    const allPosts = [...posts, ...userPosts];

    // If no posts found
    if (allPosts.length === 0) {
      throw new NotFoundError("No posts found");
    }

    // Return the combined posts with total count
    return res.status(200).json({
      success: true,
      message: "Posts found successfully",
      data: allPosts,
      totalCount,
    });

  } catch (error) {
    next(error);
  }
};

// const userReportPost = async (req, res, next) => {
//   try {
//     const { postId } = req.params;
//     const { id } = req.user;
//     const findpost = await prisma.post.findUnique({
//       where: {
//         id: postId,

//       }
//     });

//     const finduserpost = await prisma.userPost.findUnique({
//       where: {
//         id: postId,

//       }
//     });

//     if (findpost) {

//       const reportpost = await prisma.post.update({
//         where: {
//           id: findpost.id
//         },
//         data: {
//           isReport: true
//         }
//       });

//       handlerOk(res, 200, reportpost, 'user report against the post is successfully',)

//     }

//     if (finduserpost) {
//       const reportpost = await prisma.userPost.update({
//         where: {
//           id: findpost.id,
//           userId: {
//             not: {
//               id
//             }
//           }
//         },
//         data: {
//           isReport: true
//         }
//       });

//       handlerOk(res, 200, reportpost, 'user report against the post is successfully',)
//     }

//     throw new NotFoundError("post not found")

//   } catch (error) {
//     next(error)
//   }
// }

const userReportPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { id: userId } = req.user;

    // 1) Try ADMIN-authored Post
    const adminPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, adminId: true }
    });

    if (adminPost) {
      if (adminPost.adminId === userId) {
        throw new ValidationError("You can't report your own post.");
      }
      const updated = await prisma.post.update({
        where: { id: adminPost.id },
        data: { isReport: true }
      });
      return handlerOk(res, 200, updated, 'Reported admin post successfully');
    }

    // 2) Try USER-authored UserPost
    const userPost = await prisma.userPost.findUnique({
      where: { id: postId },
      select: { id: true, userId: true }
    });

    if (userPost) {
      if (userPost.userId === userId) {
        throw new ValidationError("You can't report your own post.");
      }
      const updated = await prisma.userPost.update({
        where: { id: userPost.id },
        data: { isReport: true }
      });
      return handlerOk(res, 200, updated, 'Reported user post successfully');
    }

    throw new NotFoundError('post not found');
  } catch (error) {
    next(error);
  }
};








module.exports = {
  createUserPost,
  showUserAllPost,
  likeAndUnlikePost,
  commentPost,
  likeAndReplyOnComment,
  showPostCommentLikeReply,
  showSingleUserPost,
  updateUserPost,
  deleteUserPost,
  showAllPostByInterest,
  showAllPostByUserSelectedInterest,
  userReportPost
}