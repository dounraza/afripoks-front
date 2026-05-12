// // src/components/SocketClient.js
// import React, { useEffect, useRef } from 'react';
// import { io } from 'socket.io-client';

// export const smileySocket = io(process.env.REACT_APP_SMILEY_BASE_URL);
// export const onlineUsersSocket = io(process.env.REACT_APP_ONLINE_USERS_BASE_URL);
// const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// const SocketClient = () => {
//   const socketRef = useRef(null);

//   useEffect(() => {
//     // Connexion au serveur socket.io
//     socketRef.current = io(SOCKET_URL, {
//       withCredentials: true,
//     });

//     socketRef.current.on('connect', () => {
//       console.log('Connecté au serveur socket:', socketRef.current.id);
//     });

//     socketRef.current.on('win', (data) => {
//       console.log('Partie gagnée :', data);
//     });

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, []);

//   return (
//     <div>
//       <h2>Socket.IO React Client</h2>
//     </div>
//   );
// };

// export default SocketClient;

// src/engine/socket.js
// import { io } from 'socket.io-client';

// const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// export const socket = io(SOCKET_URL, {
//     autoConnect: true,
//     transports: ["websocket", "polling"],
// });

// // ✅ Dès la connexion, émettre automatiquement si userId existe
// socket.on('connect', () => {
//     const userId = sessionStorage.getItem('userId');
//     const username = sessionStorage.getItem('userName');
//     console.log('🔌 [SOCKET] Connecté, userId:', userId);
//     if (userId) {
//         socket.emit('user_connected', {
//             userId: parseInt(userId),
//             username,
//         });
//     }
// });

// export const onlineUsersSocket = socket;
// export const smileySocket = process.env.REACT_APP_SMILEY_BASE_URL
//     ? io(process.env.REACT_APP_SMILEY_BASE_URL)
//     : socket;

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: false,
    transports: ["websocket"], // Force WebSocket uniquement
    upgrade: false,            // Désactive le passage par polling
});

export const onlineUsersSocket = socket;
export const smileySocket = process.env.REACT_APP_SMILEY_BASE_URL
    ? io(process.env.REACT_APP_SMILEY_BASE_URL, { transports: ["websocket"] })
    : socket;