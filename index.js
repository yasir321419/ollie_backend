const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const API_PRIFEX = '/api/v1';  // Prefix for all routes
const rootRouter = require("./routes/index");
const globalErrorMiddleware = require("./middleware/globalMiddleware");
const dbConnect = require('./db/connectivity');
const socketIo = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = socketIo(server);
const ChatRoomController = require("./controllers/user/userChatService");
const jwt = require('jsonwebtoken');
const adminSeed = require('./seeder/adminseed');
require("dotenv").config();



app.use(cors({ origin: '*' }));

app.use('/public', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('io', io);
// Prefix all routes with /api/v1
app.use(API_PRIFEX, rootRouter);

// Global error handling
app.use(globalErrorMiddleware);

app.get("/health", (req, res) => {
  console.log("Health check triggered");
  res.status(200).send("OK");
});


app.get("/", (req, res) => {
  res.send("server is running.....!!!");
});

dbConnect();

adminSeed();



io.use((socket, next) => {
  // Get the token from the socket handshake headers
  const token = socket.handshake.headers["x-access-token"] || socket.handshake.headers["authorization"]?.split(" ")[1];

  if (!token) {
    console.log("Token missing in socket connection");
    return next(new Error("Authentication token missing"));
  }
  console.log(token, "token");

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // your JWT secret
    socket.userId = decoded.id;
    console.log(socket.userId, "userId");

    next();
  } catch (err) {
    console.log("Invalid token");
    return next(new Error("Invalid authentication token"));
  }
});

io.on("connection", (socket) => {
  console.log("a user is connected", socket.id);



  // socket.on("joinRoom", (data) => {
  //   console.log("data_in_joinRoom_in_backend:", data);

  //   socket.join(data.chatroom);               // Join the chatroom
  //   socket.join(socket.userId.toString());    // Personal room
  //   socket.join(socket.adminId);
  //   ChatRoomController.getChatRoomData(socket, data);
  // });

  socket.on("joinRoom", (data) => {
    console.log("data_in_joinRoom_in_backend:", data);

    // Ensure the user joins the chatroom and personal room
    socket.join(data.chatroom);               // Join the chatroom
    socket.join(socket.userId.toString());    // Personal room
    socket.join(socket.adminId);              // Admin room (if applicable)

    // Fetch and emit chatroom data (messages, participants, etc.)
    ChatRoomController.getChatRoomData(socket, data);
  });




  // Leave Chatroom
  socket.on("leaveRoom", ({ chatroom, user }) => {
    socket.leave(chatroom);
    socket.leave(user);
    console.log("Socket Disconnect From Back End");
    console.log(`user left`);
  });

  // Send Message
  socket.on("sendMessage", (data) => {
    ChatRoomController.sendMessage(io, socket, data);
  });



  socket.on("disconnect", () => {
    console.log(`user left`);
  });


})

server.listen(port, '0.0.0.0', () => {
  console.log(`server is run at ${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });
