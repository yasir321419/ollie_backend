const prisma = require("../../config/prismaConfig");
const checkAndDeductUserCredit = require("../../utils/checkConnects");
const checkUserSubscription = require("../../utils/checkSubscription");

async function getTasksByUserId(userId, completed = null) {
  try {
    const whereClause = { userId: parseInt(userId) };
    
    // If completed status is specified, filter by it
    if (completed !== null) {
      whereClause.markAsComplete = completed;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 20 // Limit to 20 tasks to avoid overwhelming the AI
    });

    if (tasks.length === 0) {
      return { message: "No tasks found", tasks: [] };
    }

    return { 
      message: `Found ${tasks.length} tasks`, 
      tasks: tasks.map(task => ({
        id: task.id,
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        scheduledAt: task.scheduledAt,
        completed: task.markAsComplete,
        createdAt: task.createdAt
      }))
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to fetch tasks');
  }
}

async function createUserTask(userId, taskData) {
  try {
    const { taskName, taskDescription, scheduledAt } = taskData;
    
    // Check user subscription and credits
    await checkUserSubscription(parseInt(userId), "Your package has expired. Upgrade your plan to create tasks.");
    await checkAndDeductUserCredit(parseInt(userId), "You have no credits left to create tasks.");

    const newTask = await prisma.task.create({
      data: {
        taskName: taskName,
        taskDescription: taskDescription,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        userId: parseInt(userId)
      }
    });

    return {
      message: "Task created successfully",
      task: {
        id: newTask.id,
        taskName: newTask.taskName,
        taskDescription: newTask.taskDescription,
        scheduledAt: newTask.scheduledAt,
        completed: newTask.markAsComplete
      }
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error(error.message || 'Failed to create task');
  }
}

async function markTaskComplete(userId, taskId) {
  try {
    // First check if the task exists and belongs to the user
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        userId: parseInt(userId)
      }
    });

    if (!task) {
      throw new Error("Task not found or you don't have permission to modify it");
    }

    if (task.markAsComplete) {
      return {
        message: "Task is already completed",
        task: {
          id: task.id,
          taskName: task.taskName,
          completed: true
        }
      };
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: parseInt(taskId)
      },
      data: {
        markAsComplete: true
      }
    });

    return {
      message: "Task marked as completed successfully",
      task: {
        id: updatedTask.id,
        taskName: updatedTask.taskName,
        completed: updatedTask.markAsComplete
      }
    };
  } catch (error) {
    console.error('Error completing task:', error);
    throw new Error(error.message || 'Failed to complete task');
  }
}

module.exports = {
  getTasksByUserId,
  createUserTask,
  markTaskComplete
};