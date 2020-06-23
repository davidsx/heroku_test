const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const cookie = require('cookie');
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
io.on('connection', (socket) => {
  const user = socket.user;
  console.log(`${user} is connected to server. authentication start.`);

  const authentication = (next) => {
    var token = cookie.parse(socket.request.headers.cookie).token;
    if (!token) token = cookie.parse(socket.handshake.headers.cookie).token;
    if (!token) socket.emit('unauthorized', 'Token not found');
    jwt.verify(token, SECRET, function (error, decoded) {
      if (error) {
        socket.emit('unauthorized', 'Token invalid');
      } else {
        next();
      }
    });
  };

  setTimeout(() => authentication(() => socket.emit('authenticated')), 1000);
  setInterval(() => authentication(() => socket.emit('authorized')), 5000);

  socket.use((packet, next) => {
    const [event, args, callback] = packet;
    authentication(next);
  });

  socket.on('message', (message, callback) => {
    socket.emit('message', {user, message, timestamp: Date.now()});
    console.log(`${user} says: ${message}`);
    callback();
  });

  socket.on('verify', () => {
    console.log(`${user} is verified at ${Date.now()}`);
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
