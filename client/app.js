import React, {useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const UserContext = React.createContext(null);

const App = () => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  const contextValue = useMemo(() => {
    user, socket
  }, [user, socket]);

  useEffect(() => {
    axios
      .post('http://localhost:5000/auth/login', {user: 'david'})
      .then(function (response) {
        const socket = io.connect('http://localhost:5000');

        socket.on('connect', () => {
          socket.emit('authenticate', {token: response.data}); 
          console.log('connected to socket io server, waiting for authentication.');
        })

        socket.on('message', (user, message) => {
          console.log(user, 'says', message);
        })

        socket.on('authenticated', () => {
          setUser({token: response.data});
          setSocket(socket);
          console.log('user authenticated');
          socket.emit('message', {token: response.data, message: "helloworld!"});
          setInterval(() => {
            socket.emit('verify', {token: response.data});
          }, 5000)
        });

        socket.on('unauthorized', (error, callback) => {
          console.log(error);
          console.log(error.data);
          if (
            error.data.type == 'UnauthorizedError' ||
            error.data.code == 'invalid_token'
          ) {
            console.log('User not authorized:', error.data.message);
          }
        });
        console.log(socket);
      });
  }, []);

  return (
    <UserContext.Provider value={contextValue}>
      <div>Hello from React! I have connect GitHub!</div>
    </UserContext.Provider>
  );
};

export default App;
