import React, {useState, useEffect, useContext, useRef, useMemo} from 'react';
import {Redirect} from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import {useCookies} from 'react-cookie';

import UserContext from '../providers/context';

import '../styles/login.scss';

const Login = () => {
  // const abortController = new AbortController();
  // const signal = abortController.signal;
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const {setSocket, setUser} = useContext(UserContext);
  const [code, setCode] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loginFinish, setLoginFinish] = useState(false);

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
          else {
            axios.post(`/auth/login`, {user: name}).then(function (response) {
              if (response.status === 200) {
                const socket = io.connect(window.location.href);

                socket.on('connect_error', (err) => console.log(err));
                socket.on('connect_failed', (err) => console.log(err));
                socket.on('disconnect', (err) => console.log(err));

                socket.on('error', (error) => {
                  console.log(error);
                  setError(error);
                });

                socket.on('connect', () => {
                  console.log('connected, waiting for authentication');
                  console.log(socket);
                });

                socket.on('authenticated', () => {
                  setUser(name);
                  setSocket(socket);
                  setLoginFinish(true);
                });

                socket.on('authorized', () => {
                  console.log(
                    'user authorized. next authorization will be scheduled in 5 secs'
                  );
                });

                socket.on('unauthorized', () => {
                  console.log('user not authroized!!!');
                  socket.emit('disconnect');
                  socket.off();
                  window.location.reload();
                });
              }
            });
          }
        }
      },
    [code, setCode, name, setName]
  );

  useEffect(() => {
    return () => {
      console.log('Login Completed.');
      // abortController.abort();
      document.onkeydown = null;
    };
  }, [loginFinish]);

  document.onkeydown = onkeydown;

  return loginFinish ? (
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
