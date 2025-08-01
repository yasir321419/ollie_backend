const prisma = require("../../config/prismaConfig");
const { NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const sendNotification = require("../../utils/notification");

const showLatestEvent = async (req, res, next) => {
  try {
    const { city, country, states } = req.user;

    console.log(city, country, states);

    const findlatestevent = await prisma.event.findFirst({
      where: {
        eventCountry: country,
        eventStates: states,
        eventCity: city,
      },
      // include: {
      //   eventParticipants: true
      // },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!findlatestevent) {
      throw new NotFoundError("latest event not found")
    }


    handlerOk(res, 200, findlatestevent, 'latest event found successfully');
  } catch (error) {
    next(error)
  }
}

const showAllEventNearBy = async (req, res, next) => {
  try {
    const { city, country, states } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const findalleventnearbyme = await Promise.all([
      prisma.event.findMany({
        where: {
          eventCountry: country,
          eventStates: states,
          eventCity: city
        },
        // include: {
        //   eventParticipants: {
        //     some: {
        //       userId: id,
        //       isMark: true
        //     }
        //   }
        // },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        }
      })
    ])

    if (findalleventnearbyme.length === 0) {
      throw new NotFoundError("events not found")
    }

    handlerOk(
      res,
      200,
      findalleventnearbyme,
      'events near by found successfully'
    );
  } catch (error) {
    next(error)
  }
}

const markAsGoing = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { id, deviceToken, firstName } = req.user;
    const findevent = await prisma.event.findUnique({
      where: {
        id: eventId
      }
    });

    if (!findevent) {
      throw new NotFoundError("event not found")
    }

    // Check if user already marked as going

    const existing = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: id,
          eventId: findevent.id
        }
      }
    });

    if (existing) {
      return handlerOk(res, 200, null, "You have already marked this event as going.");
    }

    await prisma.eventParticipant.create({
      data: {
        userId: id,
        eventId: findevent.id
      }
    });

    await prisma.event.update({
      where: {
        id: findevent.id
      },
      data: {
        eventParticipant: {
          increment: 1
        },
        isMark: true
      }
    });

    // await sendNotification(
    //   id,
    //   deviceToken,
    //   `Hi ${firstName}, you have marked yourself as going to the event titled "${findevent.eventName}".`
    // );

    handlerOk(res, 200, null, "Marked as going successfully");

  } catch (error) {
    next(error)
  }
}

const showMarkAsGoingEvents = async (req, res, next) => {
  try {
    const { id } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const findmarkasgoingevent = await Promise.all([
      prisma.eventParticipant.findMany({
        where: { userId: id },
        skip,
        take: limit,
        include: {
          user: true,
          event: true
        }
      })
    ])


    if (findmarkasgoingevent.length === 0) {
      throw new NotFoundError("no event found mark as going");
    }


    handlerOk(
      res,
      200,
      findmarkasgoingevent,
      'event founds mark as going');

  } catch (error) {
    next(error)
  }
}

module.exports = {
  showLatestEvent,
  showAllEventNearBy,
  markAsGoing,
  showMarkAsGoingEvents
}