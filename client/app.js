import React, {useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';

import Chat from './pages/chat';
import Login from './pages/login';
import UserContext from './providers/context';

const App = () => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      socket,
      setSocket,
    }),
    [user, setUser, socket, setSocket]
  );

  return (
    <Router>
      <UserContext.Provider value={contextValue}>
        <Route path="/" exact component={Login} />
        <Route path="/chat" component={Chat} />
      </UserContext.Provider>
    </Router>
  );
};

export default App;
