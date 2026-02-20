// src/components/SocketClient.js
import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const smileySocket = io(process.env.REACT_APP_SMILEY_BASE_URL);
export const onlineUsersSocket = io(process.env.REACT_APP_ONLINE_USERS_BASE_URL);
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const SocketClient = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Connexion au serveur socket.io
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      console.log('Connecté au serveur socket:', socketRef.current.id);
    });

    socketRef.current.on('win', (data) => {
      console.log('Partie gagnée :', data);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Socket.IO React Client</h2>
    </div>
  );
};

export default SocketClient;
