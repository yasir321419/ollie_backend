const prisma = require('../config/prismaConfig');
const admin = require('../config/firebase'); // path to your firebase.js

// const sendNotification = async (userId, deviceToken, title, body) => {
//   const message = {
//     notification: {
//       title,
//       body,
//     },
//     token: deviceToken,
//   };

//   try {
//     // const response = await admin.messaging().send(message);
//     // console.log('Notification sent:', response);

//     await prisma.notification.create({
//       data: {
//         userId,
//         title,
//         description: body
//       }
//     });


//     // return response;
//   } catch (error) {
//     // console.error('Error sending notification:', error);
//     // throw error;
//     if (error.code === 'messaging/registration-token-not-registered') {
//       console.warn(`Device token is not registered. Clearing it for user ${userId}`);
//     }

//     console.error('Error sending notification:', error);
//     throw error;
//   }

// }

const sendNotification = async (userId, deviceToken, title, body) => {
  console.log(body, 'body');

  const message = {
    notification: {
      title,
      body,
    },
  };

  // If deviceToken is provided, send the message to that device
  if (deviceToken) {
    message.token = deviceToken;
  } else {
    console.log(`No device token provided for user ${userId}. Skipping sending notification to device.`);
  }

  try {
    // Uncomment and use your messaging service (e.g., Firebase)
    // const response = await admin.messaging().send(message);
    // console.log('Notification sent:', response);

    // Store notification in DB regardless of the deviceToken
    await prisma.notification.create({
      data: {
        userId,
        title,
        description: body
      }
    });

    // return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};



module.exports = sendNotification;
