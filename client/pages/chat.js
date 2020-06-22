import React, {useState, useEffect, useContext} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client';
import axios from 'axios';

import UserContext from '../providers/context';
import '../styles/chat.scss';

const Chat = () => {
  const {socket, user, userCount, setUserCount} = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user === null) {
      window.location = window.location.origin;
    }

    // axios.get(GetUserCountUrl).then((response) => {
    //   if (response.status === 200) {
    //     setUserCount(response.data.userCount);
    //   }
    // });

    socket.on('userEnter', () => setUserCount((userCount) => userCount + 1));
    socket.on('userLeave', () => setUserCount((userCount) => userCount - 1));

    // return () => {
    //   socket.emit('disconnect');
    //   socket.off();
    // };
  }, [user]);

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
        {
          token: response.data,
          message: 'helloworld!',
        },
        () => setMessage('')
      );
    }
  }

  return (
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
                  message.name == user
                    ? 'message-sent'
                    : 'message-received'
                }`}
              >
                <span className="sender">{message.name}</span>
                <span className="message">{message.text}</span>
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
