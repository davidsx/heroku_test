const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const socketioJwt = require('socketio-jwt');
// const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 5000;
const SECRET = process.env.SECRET || 'my-testing-secret';

const api = require('./api');
const auth = require('./auth');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

// * socket io
io.on(
  'connection',
  socketioJwt.authorize({
    secret: SECRET,
  })
).on('authenticated', (socket) => {
  //this socket is authenticated, we are good to handle more events from it.
  console.log(socket.decoded_token);
  const {user} = socket.decoded_token;
  console.log(`${user} is connected to server.`);
  console.log(socket.handshake.headers.cookie);

  socket.use((packet, next) => {
    const [event, args, callback] = packet;
    console.log('event:', event);
    console.log('args:', args);
    console.log('callback:', callback);
    // console.log(packet);
    next();
  });

  socket.on('message', ({token, message}, callback) => {
    jwt.verify(token, SECRET, function (error, decoded) {
      if (error) {
        socket.emit('unauthorized', {
          data: {
            message: error.message,
            code: 'invalid_token',
            type: 'UnauthorizedError',
          },
          inner: {message: error.message},
          message: error.message,
        });
      } else {
        const {user} = decoded;
        socket.emit('message', {user, message, timestamp: Date.now()});
        console.log(`${user} says: ${message}`);
        callback();
      }
    });
  });

  socket.on('verify', ({token}, callback) => {
    jwt.verify(token, 'my-testing-secret', function (error, decoded) {
      if (error) {
        console.log(`${user} is unverified at ${Date.now()}`);
        socket.emit('unauthorized', {
          data: {
            message: error.message,
            code: 'invalid_token',
            type: 'UnauthorizedError',
          },
          inner: {message: error.message},
          message: error.message,
        });
        callback();
      } else {
        const {user} = decoded;
        console.error(`${user} is verified at ${Date.now()}`);
      }
    });
  });

  socket.on('disconnect', () => {
    io.emit('user disconnected');
  });
});

// * API
app.use('/api', api);
app.use('/auth', auth);

// * React App
if (process.env.NODE_ENV !== 'production') {
  const Bundler = require('parcel-bundler');
  const file = path.join(__dirname, '../client/index.html');
  const options = {
    outDir: './client/dist',
    cacheDir: './client/.cache',
  };
  const bundler = new Bundler(file, options);
  app.use(bundler.middleware());
} else {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}
