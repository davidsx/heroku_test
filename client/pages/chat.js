import React, {useState, useEffect, useContext} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import {useCookies} from 'react-cookie';

import UserContext from '../providers/context';

import '../styles/chat.scss';

const Chat = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const {socket, user} = useContext(UserContext);
  const [userCount, setUserCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('user:', user);
    if (user) {
      axios.get(`/api/userCount`).then((response) => {
        if (response.status === 200) {
          setUserCount(response.data);
        }
      });
    }

    return () => {
      socket.emit('disconnect');
      socket.off();
    };
  }, []);

  useEffect(() => {
    socket.on('userEnter', () => setUserCount((userCount) => userCount + 1));
    socket.on('userLeave', () => setUserCount((userCount) => userCount - 1));
  }, [userCount]);

  useEffect(() => {
    socket.on('message', (newMessage) => {
      setMessages([...messages, newMessage]);
      var nodes = document.getElementsByClassName('message-content');
      if (nodes.length > 0) {
        nodes[nodes.length - 1].scrollIntoView();
      }
    });
  }, [messages]);

  function handleSubmit(e) {
    e.preventDefault();
    if (message) {
      socket.emit(
        'message',
        message,
        () => setMessage('')
      );
    }
  }

  return !socket || !user ? (
    <Redirect to="/" />
  ) : (
    <div className="chat">
      <div className="sidebar">
        <pre>{JSON.stringify(user)}</pre>
        <div>Online User: {userCount}</div>
      </div>
      <div className="main">
        <div className="message-wrapper">
          {messages.map((message) => {
            return (
              <div
                key={message.timestamp}
                className={`message-content ${
                  message.user == user ? 'message-sent' : 'message-received'
                }`}
              >
                <span className="sender">{message.user}</span>
                <span className="message">{message.message}</span>
              </div>
            );
          })}
        </div>
        <form className="message-box" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type a message."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit">
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
