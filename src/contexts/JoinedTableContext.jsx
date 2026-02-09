import { createContext, useEffect, useState } from "react";
import { onlineUsersSocket as socket } from "../engine/socket";

export const JoinedTableContext = createContext();
export const JoinedTableProvider = ({ children }) => {
  const [joinedTables, setJoinedTables] = useState([]);

  useEffect(() => {
    const onUpdate = (jts) => {
      setJoinedTables(jts);
      console.log("jts", jts);
    };

    socket.on('joined-tables:load', onUpdate);
    socket.on('joined-tables:update', onUpdate);

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
