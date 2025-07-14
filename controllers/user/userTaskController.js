const prisma = require("../../config/prismaConfig");
const { ValidationError, NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const checkAndDeductUserCredit = require("../../utils/checkConnects");
const checkUserSubscription = require("../../utils/checkSubscription");
const sendNotification = require("../../utils/notification");

const createUserTask = async (req, res, next) => {
  try {
    const { taskName, taskDescription, dateAndTime } = req.body;
    const { id, deviceToken, firstName } = req.user;

    await checkUserSubscription(id, "your package has expired Upgrade your plan to create the task");
    await checkAndDeductUserCredit(id, "you have no credits left to create the task");

    const createtask = await prisma.task.create({
      data: {
        taskName: taskName,
        taskDescription: taskDescription,
        scheduledAt: dateAndTime,
        userId: id
      }
    });

    if (!createtask) {
      throw new ValidationError("user task not create")
    }


    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have created a task titled "${taskName}".`
    // );

    handlerOk(res, 200, createtask, 'user task created successfully')

  } catch (error) {
    next(error)
  }
}

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

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have marked the task titled "${findtask.taskName}" as completed.`
    // );

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
        where: { userId: id, scheduledAt: { gte: startDate, lte: endDate } },
        orderBy: { scheduledAt: "asc" },
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