import { useEffect, createContext, useState } from "react";
import { onlineUsersSocket as socket } from "../engine/socket";

export const OnlineUserContext = createContext();
export const OnlineUserProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    const onConnect = () => {
      console.log('Connected !');
    };
    socket.on('connect', onConnect);
    socket.on('online-users:update', uids => {
      setOnlineUsers(uids);
    });

    socket.emit('online-users:join', parseInt(userId));

    return () => {
      socket.off('connect', onConnect);
    }
  }, [socket]);

  return (
    <OnlineUserContext.Provider value={{ onlineUsers }}>
      {children}
    </OnlineUserContext.Provider>
  )
}