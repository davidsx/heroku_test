import React, {useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import {CookiesProvider} from 'react-cookie';

import Chat from './pages/chat';
import Login from './pages/login';
import UserContext from './providers/context';

import './app.scss';

axios.defaults.withCredentials = true;

let dummySocket = {
  on: (event, value) => {},
  emit: (event, value, callback) => {},
  off: () => {},
};

const App = () => {
  const [user, setUser] = useState('');
  const [token, setToken] = useState('');
  const [socket, setSocket] = useState(dummySocket);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      socket,
      setSocket,
      token,
      setToken,
    }),
    [user, setUser, socket, setSocket, token, setToken]
  );

  return (
    <CookiesProvider>
      <Router>
        <UserContext.Provider value={contextValue}>
          <Route path="/" exact component={Login} />
          <Route path="/chat" component={Chat} />
        </UserContext.Provider>
      </Router>
    </CookiesProvider>
  );
};

export default App;
