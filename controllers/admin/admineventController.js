const prisma = require("../../config/prismaConfig");
const { ValidationError, NotFoundError } = require("../../resHandler/CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const uploadFileWithFolder = require("../../utils/s3Upload");
const fs = require('fs');

const createEvent = async (req, res, next) => {
  try {
    const { eventName, eventDescription, eventDateAndTime, eventAddress, eventStates, eventCity, eventCountry } = req.body;
    const { id } = req.user;
    const file = req.file;


    // const filePath = file.filename; // use filename instead of path
    // const basePath = `http://${req.get("host")}/public/uploads/`;
    // const eventImage = `${basePath}${filePath}`;


    // const filePath = file.path; // Full file path of the uploaded file
    const folder = 'uploads'; // Or any folder you want to store the image in
    const filename = file.filename; // The filename of the uploaded file
    const contentType = file.mimetype; // The MIME type of the file

    const fileBuffer = file.buffer;

    const s3ImageUrl = await uploadFileWithFolder(fileBuffer, filename, contentType, folder);

    const event = await prisma.event.create({
      data: {
        eventName,
        eventDescription,
        eventDateAndTime,
        eventAddress,
        eventStates,
        eventCity,
        eventCountry,
        image: s3ImageUrl,
        createdById: id
      }
    });

    if (!event) {
      throw new ValidationError("event not create")
    }

    handlerOk(res, 200, event, 'event created successfully');

  } catch (error) {
    next(error)
  }
}

const showAllEvents = async (req, res, next) => {
  try {
    const { id } = req.user;

    const showallevents = await prisma.event.findMany({
      where: {
        createdById: id
      }
    });

    if (showallevents.length === 0) {
      throw new NotFoundError("events not found")
    }

    handlerOk(res, 200, showallevents, 'events found successfully')
  } catch (error) {
    next(error)
  }
}


const updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { eventName, eventDescription, eventDateAndTime, eventAddress, eventStates, eventCity, eventCountry } = req.body;
    const { id } = req.user;
    const findevent = await prisma.event.findUnique({
      where: {
        id: eventId
      }
    });

    if (!findevent) {
      throw new NotFoundError("event not found");
    }

    let updatedObj = {}

    if (eventName) {
      updatedObj.eventName = eventName
    }

    if (eventDescription) {
      updatedObj.eventDescription = eventDescription
    }

    if (eventDateAndTime) {
      updatedObj.eventDateAndTime = eventDateAndTime
    }

    if (eventAddress) {
      updatedObj.eventAddress = eventAddress
    }

    if (eventStates) {
      updatedObj.eventStates = eventStates
    }

    if (eventCity) {
      updatedObj.eventCity = eventCity
    }

    if (eventCountry) {
      updatedObj.eventCountry = eventCountry
    }

    const updatedUser = await prisma.event.update({
      where: {
        id: findevent.id,
        createdById: id
      },
      data: updatedObj
    });

    if (!updatedUser) {
      throw new ValidationError("event not update")
    }

    handlerOk(res, 200, updatedUser, 'event updated successfully')
  } catch (error) {
    next(error)
  }
}

const deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const findevent = await prisma.event.findUnique({
      where: {
        id: eventId
      }
    });

    if (!findevent) {
      throw new NotFoundError("event not found");
    }

    await prisma.event.delete({
      where: {
        id: findevent.id
      }
    });

    handlerOk(res, 200, null, 'event deleted succesfully')

  } catch (error) {
    next(error)
  }
}

module.exports = {
  createEvent,
  showAllEvents,
  updateEvent,
  deleteEvent
}