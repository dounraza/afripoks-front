import { io } from 'socket.io-client';

const SOCKET_URL = window.location.hostname === 'localhost' 
    ? (process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000')
    : 'https://afripoks-backend.onrender.com';

export const socket = io(SOCKET_URL, {
    autoConnect: false, // ✅ Ne pas connecter automatiquement
    reconnection: false, // ✅ Pas de reconnexion automatique
    transports: ["websocket", "polling"],
});

export const onlineUsersSocket = socket;
export const smileySocket = process.env.REACT_APP_SMILEY_BASE_URL
    ? io(process.env.REACT_APP_SMILEY_BASE_URL)
    : socket;
