const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const socketioJwt = require('socketio-jwt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000;

const api = require('./api');
const auth = require('./auth');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

server.listen(port, () => console.log(`Server listening on ${port}`));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// * socket io
io.on(
  'connection',
  socketioJwt.authorize({
    secret: 'my-testing-secret',
  })
).on('authenticated', (socket) => {
  //this socket is authenticated, we are good to handle more events from it.
  const {user} = socket.decoded_token;
  console.log(`${user} is connected to server.`);

  socket.on('message', ({token, message}) => {
    jwt.verify(token, 'my-testing-secret', function (error, decoded) {
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
        socket.emit('message', user, message);
      }
    });
  });

  socket.on('verify', ({token}) => {
    jwt.verify(token, 'my-testing-secret', function (error, decoded) {
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
        socket.emit('message', user, "verify");
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
