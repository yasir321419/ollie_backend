const prisma = require("../../config/prismaConfig");
const { NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const sendNotification = require("../../utils/notification");

const showLatestEvent = async (req, res, next) => {
  try {
    const { city, country, states, id } = req.user;

    console.log(city, country, states);

    // Find the latest event based on the location and check participation
    const findlatestevent = await prisma.event.findFirst({
      where: {
        eventCountry: country,
        eventStates: states,
        eventCity: city,
      },
      include: {
        eventParticipants: {
          where: {
            userId: id,  // Filter by the user's ID
            isMark: true      // Ensure the user is marked as participating
          },
          select: {
            isMark: true      // Only include the `isMark` field for the current user
          }
        }
      },
      orderBy: {
        createdAt: "desc"  // Order by the most recent event
      }
    });

    // If no event is found or the user is not marked as participating, return an error
    if (!findlatestevent) {
      throw new NotFoundError("Latest event not found or user is not marked as participating");
    }

    // We now have the event data and the participation status (isMark)
    const eventData = {
      ...findlatestevent,
      // isMark: findlatestevent.eventParticipants[0].isMark  // Set the `isMark` flag from the first participant

      isMark: findlatestevent.eventParticipants[0] ? findlatestevent.eventParticipants[0].isMark : false
    };

    handlerOk(res, 200, eventData, 'Latest event found successfully');
  } catch (error) {
    next(error);  // Pass the error to the next middleware
  }
};





const showAllEventNearBy = async (req, res, next) => {
  try {
    const { city, country, states, id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find all events near the user based on location
    const findalleventnearbyme = await prisma.event.findMany({
      where: {
        eventCountry: country,
        eventStates: states,
        eventCity: city,
      },
      include: {
        eventParticipants: {
          where: {
            userId: id,  // Filter by the user's ID
            isMark: true  // Ensure the user is marked as participating
          },
          select: {
            isMark: true  // Only include the `isMark` field for the current user
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"  // Order by the most recent event
      }
    });

    if (findalleventnearbyme.length === 0) {
      throw new NotFoundError("Events not found");
    }

    // Map through the events and add `isMark` status for each event
    const eventData = findalleventnearbyme.map(event => ({
      ...event,
      isMark: event.eventParticipants.length > 0 ? event.eventParticipants[0].isMark : false  // Check if the user is marked as participating
    }));

    handlerOk(
      res,
      200,
      eventData,
      'Events nearby found successfully'
    );
  } catch (error) {
    next(error);
  }
};


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
        eventId: findevent.id,
        isMark: true
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