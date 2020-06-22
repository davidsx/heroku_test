import React, {useState, useEffect, useContext, useRef, useMemo} from 'react';
import {Redirect} from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

import UserContext from '../providers/context';
import '../styles/login.scss';

const Login = () => {
  // const abortController = new AbortController();
  // const signal = abortController.signal;
  const {setSocket, user, setUser} = useContext(UserContext);
  const [code, setCode] = useState([]);
  const [name, setName] = useState('');
  const [loginReady, setLoginReady] = useState(false);
  const [error, setError] = useState('');

  const onkeydown = useMemo(
    () =>
      function (e) {
        if (
          e.key === 'Backspace' ||
          e.keyCode === 8 ||
          e.key === 'Delete' ||
          e.keyCode === 46
        ) {
          if (code.length < 4) setCode(code.splice(0, code.length - 1));
          else setName(name.substring(0, name.length - 1));
        } else if (/[a-zA-Z0-9-_ ]/.test(String.fromCharCode(e.keyCode))) {
          if (code.length < 4) setCode([...code, e.key]);
          else setName((currentName) => currentName + e.key);
          setError('');
        } else if (e.key === 'Enter') {
          if (code.length < 4) return;
          else setLoginReady(true);
        }
      },
    [code, setCode, name, setName]
  );

  useEffect(() => {
    if (loginReady) {
      axios
      .post(`${window.location.href}auth/login`, {user})
      .then(function (response) {
        const token = response.data;
        const socket = io.connect(window.location.href);

        socket.on('connect', () => {
          socket.emit('authenticate', {token});
          console.log(
            'connected to socket io server, waiting for authentication.'
          );
        });

        socket.on('authenticated', () => {
          setUser({token, name});
          setSocket(socket);
          console.log('user authenticated');
          setInterval(() => {
            socket.emit('verify', {token: response.data});
          }, 5000);
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
    }
  }, [loginReady]);

  useEffect(() => {
    return () => {
      console.log('Login Completed.');
      // abortController.abort();
      document.onkeydown = null;
    };
  }, []);

  document.onkeydown = onkeydown;

  return user ? (
    <Redirect to="/chat" />
  ) : (
    <div className="login">
      <h2 className="instruction">
        Please input your secret {code.length >= 4 ? 'name' : 'passcode'}
      </h2>
      {code.length >= 4 ? (
        <div className="name">{name}</div>
      ) : (
        <div className="passcode-wrapper">
          {[0, 1, 2, 3].map((i) => {
            const id = 'passcode-' + i;
            return (
              <div key={id} id={id} className="passcode">
                {code[i] && <div className="passcode-circle"></div>}
              </div>
            );
          })}
        </div>
      )}
      <div className="error">{error}</div>
    </div>
  );
};

export default Login;
