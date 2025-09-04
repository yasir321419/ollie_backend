const prisma = require("../../config/prismaConfig");
const checkAndDeductUserCredit = require("../../utils/checkConnects");
const checkUserSubscription = require("../../utils/checkSubscription");

async function createUserPost(userId, postData) {
  try {
    const { postTitle, postContent } = postData;
    
    // Check user subscription and credits
    await checkUserSubscription(parseInt(userId), "Your package has expired. Upgrade your plan to create posts.");
    await checkAndDeductUserCredit(parseInt(userId), "You have no credits left to create posts.");

    const newPost = await prisma.userPost.create({
      data: {
        title: postTitle,
        content: postContent,
        image: null, // AI posts don't require images
        userId: parseInt(userId)
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return {
      message: "Post created successfully",
      post: {
        id: newPost.id,
        title: newPost.title,
        content: newPost.content,
        createdAt: newPost.createdAt,
        user: newPost.user
      }
    };
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error(error.message || 'Failed to create post');
  }
}

async function getUserPosts(userId, options = {}) {
  try {
    const { limit = 10, offset = 0 } = options;
    
    const posts = await prisma.userPost.findMany({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: { 
            userpostlikes: true, 
            userpostcomments: true 
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    });

    if (posts.length === 0) {
      return { message: "No posts found", posts: [] };
    }

    return { 
      message: `Found ${posts.length} posts`, 
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        image: post.image,
        views: post.views,
        createdAt: post.createdAt,
        user: post.user,
        likesCount: post._count.userpostlikes,
        commentsCount: post._count.userpostcomments
      }))
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }
}

module.exports = {
  createUserPost,
  getUserPosts
};