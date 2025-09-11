const prisma = require("../../config/prismaConfig");
const { ValidationError, NotFoundError, BadRequestError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const checkAndDeductUserCredit = require("../../utils/checkConnects");
const checkUserSubscription = require("../../utils/checkSubscription");
const sendNotification = require("../../utils/notification");

const createUserTask = async (req, res, next) => {
  try {
    const { taskName, taskDescription, date, time } = req.body; // Date and Time as separate fields
    const { id, deviceToken, firstName } = req.user;

    // Validate if the date and time are provided
    if (!date || !time) {
      throw new BadRequestError("Date and Time are required.");
    }

    // Convert date to DateTime format (e.g., "2025-05-12")
    const scheduledDate = new Date(date);  // Assuming date is in 'YYYY-MM-DD' format

    // Validate time format (accept HH:mm:ss format)
    const timeFormat = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    if (!timeFormat.test(time)) {
      throw new BadRequestError("Invalid time format. Use 'HH:mm:ss' format.");
    }

    // Combine date and time into a valid DateTime object
    const scheduledTime = `${scheduledDate.toISOString().split('T')[0]}T${time}:00.000Z`;

    // Check the user's subscription status and credits
    await checkUserSubscription(id, "Your package has expired. Upgrade your plan to create the task.");
    await checkAndDeductUserCredit(id, "You have no credits left to create the task.");

    // Create the task with separate date and time
    const createtask = await prisma.task.create({
      data: {
        taskName: taskName,
        taskDescription: taskDescription,
        scheduledDate: scheduledDate,  // Store Date separately
        scheduledTime: time,           // Store Time separately
        userId: id,
      }
    });

    // Check if the task creation was successful
    if (!createtask) {
      throw new ValidationError("User task not created");
    }

    await sendNotification(
      id,
      deviceToken,
      `Hi ${firstName}`, `you have created the task titled "${createtask.taskName}"`
    );

    // Send response to frontend
    handlerOk(res, 200, createtask, "User task created successfully");
  } catch (error) {
    next(error);
  }
};




const getUserTask = async (req, res, next) => {
  try {
    const { id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const gettask = await Promise.all([
      prisma.task.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      })
    ])

    if (gettask.length === 0) {
      throw new NotFoundError("user task not found")
    }

    handlerOk(res, 200, gettask, 'user task found successfully')


  } catch (error) {
    next(error)
  }
}

const markAsCompletedTask = async (req, res, next) => {
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
      throw new NotFoundError("task not found");
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

    await sendNotification(
      id,
      deviceToken,
      `Hi ${firstName}`, `you have marked the task titled "${findtask.taskName}" as completed.`
    );

    handlerOk(res, 200, updateddata, 'task is completed')

  } catch (error) {
    next(error)
  }
}

const getTaskByDate = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { date } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    // Validate format first: DD-MM-YYYY
    const isValidDate = /^\d{2}-\d{2}-\d{4}$/.test(date);
    if (!isValidDate) {
      throw new BadRequestError('Please provide date in DD-MM-YYYY format');
    }

    // Parse DD-MM-YYYY into proper Date object
    const [day, month, year] = date.split('-');
    const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestError('Invalid date provided');
    }


    const tasks = await Promise.all([
      prisma.task.findMany({
        where: { userId: id, scheduledDate: { gte: startDate, lte: endDate } },
        orderBy: { scheduledDate: "asc" },
        skip,
        take: limit,
      })
    ])

    if (tasks.length === 0) {
      throw new NotFoundError("tasks not found");
    }

    handlerOk(res, 200, tasks, 'task found successfully');


  } catch (error) {
    next(error);
  }
}



module.exports = {
  createUserTask,
  getUserTask,
  markAsCompletedTask,
  getTaskByDate
}