import { createContext, useEffect, useState } from "react";
import { onlineUsersSocket as socket } from "../engine/socket";

export const JoinedTableContext = createContext();
export const JoinedTableProvider = ({ children }) => {
  const [joinedTables, setJoinedTables] = useState([]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onUpdate = (jts) => {
      console.log("JoinedTableContext [onUpdate]:", jts);
      setJoinedTables(jts);
    };

    socket.on('joined-tables:load', onUpdate);
    socket.on('joined-tables:update', onUpdate);
    
    // Demander la liste actuelle à la connexion
    socket.on('connect', () => {
      console.log("JoinedTableContext [connect] socket connected:", socket.id);
      const userId = sessionStorage.getItem('userId');
      if (userId) {
        socket.emit('joined-tables:get', { uid: parseInt(userId) });
      }
    });

    // Si déjà connecté, demander aussi
    if (socket.connected) {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
          socket.emit('joined-tables:get', { uid: parseInt(userId) });
        }
    }

    return () => {
      socket.off('joined-tables:load', onUpdate);
      socket.off('joined-tables:update', onUpdate);
    }
  }, [socket])

  return (
    <JoinedTableContext.Provider value={{ joinedTables }}>
      {children}
    </JoinedTableContext.Provider>
  )
}
