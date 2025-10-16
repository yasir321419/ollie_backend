const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX;  // Prefix for all routes
const rootRouter = require("./routes/index");
const globalErrorMiddleware = require("./middleware/globalMiddleware");
const dbConnect = require('./db/connectivity');
const socketIo = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const rateLimit = require('express-rate-limit');
const { WebSocketServer } = require('ws');
const normalizeOrigins = (origins) => {
  if (!origins) {
    return ['*'];
  }
  if (Array.isArray(origins)) {
    return origins;
  }
  const parsed = origins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return parsed.length === 0 ? ['*'] : parsed;
};
const allowedOrigins = normalizeOrigins(process.env.CORS_ORIGIN);
const socketOrigins = allowedOrigins.includes('*') ? '*' : allowedOrigins;
// Compression defaults to off because upstream proxies can corrupt FIN/RSV bits.
// Set SOCKET_COMPRESSION=true explicitly if the deployment path safely preserves WebSocket frames.
const isCompressionEnabled = (process.env.SOCKET_COMPRESSION ?? '').toLowerCase() === 'true';
const perMessageDeflateOptions = isCompressionEnabled ? {
  threshold: 4096,
  serverNoContextTakeover: true,
  clientNoContextTakeover: true
} : false;
const httpCompressionOptions = isCompressionEnabled ? {
  threshold: 4096
} : false;
const io = socketIo(server, {
  cors: {
    origin: socketOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false
  },
  // Compression breaks when nginx strips FIN/RSV bits in production, so allow opt-in via env var.
  perMessageDeflate: perMessageDeflateOptions,
  httpCompression: httpCompressionOptions,
  allowEIO3: true
});
const ChatRoomController = require("./controllers/user/userChatService");
const jwt = require('jsonwebtoken');
const adminSeed = require('./seeder/adminseed');
const morgan = require('morgan');
require("dotenv").config();

console.log(API_PREFIX, 'API_PREFIX');

app.use(morgan('dev'));


// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global rate limiting for all endpoints
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5000 : 10000, // Limit each IP
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// CORS configuration
const corsOptions = {
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: false
};
app.use(cors(corsOptions));

// Body parsing with size limits
app.use('/public', express.static('public'));
app.use(bodyParser.json({
  limit: '200mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    req.rawBody = buf;
  }
}));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Security: Remove X-Powered-By header
app.disable('x-powered-by');

// AI request logging (only in development or when specifically enabled)
if (process.env.NODE_ENV === 'development' || process.env.AI_DEBUG_LOGGING === 'true') {
  app.use((req, res, next) => {
    if (req.path.startsWith(API_PREFIX + '/ai/')) {
      console.log(`🤖 AI API Call: ${req.method} ${req.path}`);
      if (process.env.AI_FULL_LOGGING === 'true') {
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        console.log('Body:', JSON.stringify(req.body, null, 2));
      }
    }
    next();
  });
}

app.set('io', io);
// Prefix all routes with /api/v1
app.use(API_PREFIX, rootRouter);

// app.use(rootRouter);


// Global error handling
app.use(globalErrorMiddleware);

app.get("/health", (req, res) => {
  console.log("Health check triggered");
  res.status(200).send("OK");
});

app.get(`${API_PREFIX}/user`, (req, res) => {
  res.send("welcome to user");
});

app.get("/api/v1/home", (req, res) => {
  res.send("welcome to home");
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

// Create AI WebSocket Server
// const aiWss = new WebSocketServer({
//   server: server,
//   path: '/ai',
//   perMessageDeflate: perMessageDeflateOptions || false,
//   maxPayload: 10 * 1024 * 1024 // 10MB safeguard against giant frames
// });

// aiWss.on('connection', async (ws, req) => {
//   console.log('AI WebSocket client connected');

//   const url = new URL(req.url, `http://${req.headers.host}`);
//   const mode = url.searchParams.get('mode') || 'chat-to-chat';

//   let userId = null;
//   let cleanup = () => { };

//   // Handle authentication
//   const authHandler = (data) => {
//     try {
//       const message = JSON.parse(data.toString());
//       if (message.type === 'auth') {
//         try {
//           const decoded = jwt.verify(message.token, process.env.SECRET_KEY);
//           userId = decoded.id;
//           console.log(`AI User ${userId} authenticated with mode: ${mode}`);

//           // Set up appropriate handler based on mode
//           setupAIHandler(ws, userId, mode).then(cleanupFn => {
//             cleanup = cleanupFn;

//             // Send ready message
//             ws.send(JSON.stringify({
//               type: 'session.ready',
//               message: `Connected to Ollie AI in ${mode} mode`,
//               mode: mode
//             }));

//             // Send initial welcome message from Ollie
//             setTimeout(async () => {
//               const welcomeMessage = `Hey there! 👋 I'm Ollie, your friendly assistant here to help you make the most of the app.

// I can set reminders, manage your profile, help you write posts, guide you through blogs, chat with your friends, and even handle payments or events!

// If you're ever stuck, just ask. 😊
// Want a quick overview of what I can do?`;

//               ws.send(JSON.stringify({
//                 type: 'response.text.complete',
//                 content: welcomeMessage
//               }));

//               // Generate TTS audio for chat-to-speech mode
//               if (mode === 'chat-to-speech') {
//                 try {
//                   const { openaiService } = require('./AI/services/openai-service');
//                   const audioBuffer = await openaiService.generateSpeech(welcomeMessage, 'alloy', 'DEFAULT');
//                   const audioBase64 = audioBuffer.toString('base64');

//                   ws.send(JSON.stringify({
//                     type: 'response.audio.complete',
//                     audio: audioBase64,
//                     format: 'mp3'
//                   }));
//                 } catch (error) {
//                   console.error('Error generating welcome message audio:', error);
//                 }
//               }
//             }, 500);
//           }).catch(error => {
//             console.error(`Error setting up ${mode} mode:`, error);
//             ws.send(JSON.stringify({
//               type: 'error',
//               message: `Failed to setup ${mode} mode`
//             }));
//           });

//           // Remove auth handler after successful authentication
//           ws.off('message', authHandler);
//         } catch (error) {
//           console.error('AI WebSocket authentication error:', error);
//           ws.send(JSON.stringify({
//             type: 'error',
//             message: 'Authentication failed'
//           }));
//           ws.close();
//         }
//       }
//     } catch (error) {
//       console.error('Error parsing auth message:', error);
//     }
//   };

//   // Wait for authentication
//   ws.on('message', authHandler);

//   ws.on('close', () => {
//     console.log(`AI User ${userId} disconnected from ${mode} mode`);
//     cleanup();
//   });

//   ws.on('error', (error) => {
//     console.error(`AI WebSocket error for user ${userId}:`, error);
//     cleanup();
//   });
// });



server.listen(port, '0.0.0.0', () => {
  console.log(`server is run at ${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });



