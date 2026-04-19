import { useEffect, createContext, useState, useRef } from "react";
import { socket } from "../engine/socket";

export const OnlineUserContext = createContext();

export const OnlineUserProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const emittedRef = useRef(false);

  useEffect(() => {
    const emitUserConnected = () => {
      const userId = sessionStorage.getItem('userId');
      const username = sessionStorage.getItem('userName');
      if (!userId || emittedRef.current) return;

      emittedRef.current = true;
      console.log('📤 Émission user_connected, userId:', userId);
      socket.emit('user_connected', {
        userId: parseInt(userId),
        username,
      });
    };

    const handleConnect = () => {
      console.log('✅ Socket connectée:', socket.id);
      emittedRef.current = false;
      emitUserConnected();
    };

    const handleUsersUpdate = (data) => {
      console.log('📥 users_count_update:', data);
      if (data && data.users) {
        setOnlineUsers(data.users);
      } else if (Array.isArray(data)) {
        setOnlineUsers(data);
      } else {
        setOnlineUsers([]);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('users_count_update', handleUsersUpdate);

    // ✅ Connecter uniquement si userId existe (user déjà connecté)
    const userId = sessionStorage.getItem('userId');
    if (userId && !socket.connected) {
      socket.connect();
    }

    // ✅ Après login → connecter le socket
    const handleUserLogin = (event) => {
      console.log('🔑 userLogin event reçu');
      emittedRef.current = false;
      if (!socket.connected) {
        socket.connect();
      } else {
        emitUserConnected();
      }
    };

    window.addEventListener('userLogin', handleUserLogin);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('users_count_update', handleUsersUpdate);
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, []);

  return (
    <OnlineUserContext.Provider value={{ onlineUsers, setOnlineUsers }}>
      {children}
    </OnlineUserContext.Provider>
  );
};