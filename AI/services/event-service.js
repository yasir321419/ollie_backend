const prisma = require("../../config/prismaConfig");

async function getLatestEvents(limit = 5) {
  try {
    const currentDate = new Date();
    
    const events = await prisma.event.findMany({
      where: {
        eventDateAndTime: {
          gte: currentDate // Only show future events
        }
      },
      include: {
        admin: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            EventParticipant: true
          }
        }
      },
      orderBy: { eventDateAndTime: "asc" }, // Nearest events first
      take: parseInt(limit)
    });

    if (events.length === 0) {
      return { message: "No upcoming events found", events: [] };
    }

    return {
      message: `Found ${events.length} upcoming events`,
      events: events.map(event => ({
        id: event.id,
        name: event.eventName,
        description: event.eventDescription?.substring(0, 200) + '...' || 'No description available',
        dateTime: event.eventDateAndTime,
        address: event.eventAddress,
        city: event.eventCity,
        state: event.eventStates,
        country: event.eventCountry,
        organizer: event.admin.name,
        participants: event._count.EventParticipant,
        createdAt: event.createdAt
      }))
    };
  } catch (error) {
    console.error('Error fetching latest events:', error);
    throw new Error('Failed to fetch latest events');
  }
}

async function getAllEvents(limit = 10) {
  try {
    const events = await prisma.event.findMany({
      include: {
        admin: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            EventParticipant: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit)
    });

    if (events.length === 0) {
      return { message: "No events found", events: [] };
    }

    return {
      message: `Found ${events.length} events`,
      events: events.map(event => ({
        id: event.id,
        name: event.eventName,
        description: event.eventDescription?.substring(0, 200) + '...' || 'No description available',
        dateTime: event.eventDateAndTime,
        address: event.eventAddress,
        city: event.eventCity,
        state: event.eventStates,
        country: event.eventCountry,
        organizer: event.admin.name,
        participants: event._count.EventParticipant,
        isUpcoming: new Date(event.eventDateAndTime) > new Date(),
        createdAt: event.createdAt
      }))
    };
  } catch (error) {
    console.error('Error fetching all events:', error);
    throw new Error('Failed to fetch events');
  }
}

async function getEventById(eventId) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        },
        EventParticipant: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      throw new Error("Event not found");
    }

    return {
      message: "Event found",
      event: {
        id: event.id,
        name: event.eventName,
        description: event.eventDescription,
        dateTime: event.eventDateAndTime,
        address: event.eventAddress,
        city: event.eventCity,
        state: event.eventStates,
        country: event.eventCountry,
        organizer: {
          name: event.admin.name,
          email: event.admin.email
        },
        participants: event.EventParticipant.map(participant => ({
          name: `${participant.user.firstName} ${participant.user.lastName}`,
          email: participant.user.email
        })),
        totalParticipants: event.EventParticipant.length,
        isUpcoming: new Date(event.eventDateAndTime) > new Date(),
        createdAt: event.createdAt
      }
    };
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw new Error(error.message || 'Failed to fetch event');
  }
}

module.exports = {
  getLatestEvents,
  getAllEvents,
  getEventById
};