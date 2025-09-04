const prisma = require("../../config/prismaConfig");

async function getLatestBlogs(limit = 5) {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        category: true,
        admin: {
          select: {
            name: true
          }
        },
        _count: { 
          select: { 
            likes: true, 
            comments: true 
          } 
        }
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit)
    });

    if (blogs.length === 0) {
      return { message: "No blogs found", blogs: [] };
    }

    return {
      message: `Found ${blogs.length} latest blogs`,
      blogs: blogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        content: blog.content.substring(0, 200) + '...', // Truncate content for AI
        category: blog.category.userInterest,
        author: blog.admin.name,
        likes: blog._count.likes,
        comments: blog._count.comments,
        views: blog.views,
        createdAt: blog.createdAt
      }))
    };
  } catch (error) {
    console.error('Error fetching latest blogs:', error);
    throw new Error('Failed to fetch latest blogs');
  }
}

async function getBlogsByTopic(topicId, limit = 5) {
  try {
    // First verify the topic exists
    const topic = await prisma.interest.findUnique({
      where: { id: parseInt(topicId) }
    });

    if (!topic) {
      throw new Error("Topic not found");
    }

    const blogs = await prisma.blog.findMany({
      where: { categoryId: parseInt(topicId) },
      include: {
        category: true,
        admin: {
          select: {
            name: true
          }
        },
        _count: { 
          select: { 
            likes: true, 
            comments: true 
          } 
        }
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit)
    });

    if (blogs.length === 0) {
      return { 
        message: `No blogs found for topic: ${topic.userInterest}`, 
        blogs: [] 
      };
    }

    return {
      message: `Found ${blogs.length} blogs for topic: ${topic.userInterest}`,
      topic: topic.userInterest,
      blogs: blogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        content: blog.content.substring(0, 200) + '...', // Truncate content for AI
        author: blog.admin.name,
        likes: blog._count.likes,
        comments: blog._count.comments,
        views: blog.views,
        createdAt: blog.createdAt
      }))
    };
  } catch (error) {
    console.error('Error fetching blogs by topic:', error);
    throw new Error(error.message || 'Failed to fetch blogs by topic');
  }
}

async function getAllTopics() {
  try {
    const topics = await prisma.interest.findMany({
      orderBy: { userInterest: "asc" }
    });

    if (topics.length === 0) {
      return { message: "No topics found", topics: [] };
    }

    return {
      message: `Found ${topics.length} available topics`,
      topics: topics.map(topic => ({
        id: topic.id,
        name: topic.userInterest
      }))
    };
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw new Error('Failed to fetch topics');
  }
}

module.exports = {
  getLatestBlogs,
  getBlogsByTopic,
  getAllTopics
};