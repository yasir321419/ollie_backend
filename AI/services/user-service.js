const prisma = require("../../config/prismaConfig");

async function getUserProfile(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        UserSubscription: true,
        ConnectPurchase: true,
        _count: {
          select: {
            tasks: true,
            UserPost: true,
            likes: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      message: "User profile retrieved successfully",
      user: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.email,
        profileImage: user.image,
        dateOfBirth: user.dateOfBirth,
        city: user.city,
        state: user.states,
        country: user.country,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        isCreatedProfile: user.isCreatedProfile,
        subscription: user.UserSubscription && user.UserSubscription.length > 0 ? {
          isActive: user.UserSubscription[0].isActive,
          expiresAt: user.UserSubscription[0].expiresAt
        } : null,
        connects: user.ConnectPurchase && user.ConnectPurchase.length > 0 ? {
          totalConnects: user.ConnectPurchase[0].totalConnects,
          usedConnects: user.ConnectPurchase[0].usedConnects,
          remainingConnects: user.ConnectPurchase[0].totalConnects - user.ConnectPurchase[0].usedConnects
        } : null,
        stats: {
          totalTasks: user._count.tasks,
          totalPosts: user._count.UserPost,
          totalLikes: user._count.likes,
          totalComments: user._count.comments
        },
        preferences: {
          notificationsEnabled: user.notificationOnAndOff,
          showAds: user.showAds,
          wantDailySupplement: user.wantDailySupplement,
          wantDailyActivities: user.wantDailyActivities
        },
        createdAt: user.createdAt
      }
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error(error.message || 'Failed to fetch user profile');
  }
}

async function getUserById(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        city: true,
        state: true,
        country: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      message: "User found",
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        profileImage: user.profileImage,
        location: [user.city, user.state, user.country].filter(Boolean).join(', '),
        isEmailVerified: user.isEmailVerified,
        memberSince: user.createdAt
      }
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new Error(error.message || 'Failed to fetch user');
  }
}

async function getUserStats(userId) {
  try {
    const stats = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        _count: {
          select: {
            tasks: true,
            UserPost: true,
            likes: true,
            comments: true,
            UserPostLike: true,
            UserPostComment: true
          }
        }
      }
    });

    if (!stats) {
      throw new Error("User not found");
    }

    // Get completed tasks count
    const completedTasks = await prisma.task.count({
      where: {
        userId: parseInt(userId),
        markAsComplete: true
      }
    });

    // Get pending tasks count
    const pendingTasks = await prisma.task.count({
      where: {
        userId: parseInt(userId),
        markAsComplete: false
      }
    });

    return {
      message: "User statistics retrieved successfully",
      stats: {
        tasks: {
          total: stats._count.tasks,
          completed: completedTasks,
          pending: pendingTasks
        },
        posts: {
          total: stats._count.UserPost,
          likes: stats._count.UserPostLike,
          comments: stats._count.UserPostComment
        },
        blogEngagement: {
          likes: stats._count.likes,
          comments: stats._count.comments
        }
      }
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw new Error(error.message || 'Failed to fetch user statistics');
  }
}

module.exports = {
  getUserProfile,
  getUserById,
  getUserStats
};