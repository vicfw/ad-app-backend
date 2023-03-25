const mongoose = require('mongoose');
require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app.js');

let server;
let socketIO;
let DB;

if (process.env.NODE_ENV === 'production') {
  const options = {
    key: fs.readFileSync('/etc/ssl/private/nginx-selfsigned.key'),
    cert: fs.readFileSync('/etc/ssl/certs/nginx-selfsigned.crt'),
  };
  https.createServer(app);

  socketIO = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
      origin: '*',
      credentials: true,
    },
  });
  DB = process.env.MONGODB_PROD;
} else {
  server = http.createServer(app);

  socketIO = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
      origin: '*',
      credentials: true,
    },
  });
  DB = process.env.MONGODB_PROD;
}

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'))
  .catch((e) => console.log(e));

server.listen(process.env.PORT, () => {
  console.log('Server Is Running On ' + process.env.PORT);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

// socket.io

socketIO.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    // socket.join(userData.id);
    // console.log(userData.id, 'userId');
    // socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('user joined room', room);
  });

  socket.on('new message', (newMessageReceived, cb) => {
    socketIO
      .to(newMessageReceived.chatId)
      .emit('receivedMessage', newMessageReceived);

    if (newMessageReceived.chatId) {
      return cb('got it');
    }

    cb('error');

    // if (!chat.users) return console.log('chat.users not defined');
  });

  socket.on('disconnect', () => {
    socket.disconnect();
    console.log('🔥: A user disconnected');
  });
});
