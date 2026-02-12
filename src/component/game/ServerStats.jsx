import React, { useState, useEffect } from 'react';
import { Users, Layers } from 'lucide-react';
import { onlineUsersSocket } from '../../engine/socket';
import './ServerStats.scss';

const ServerStats = () => {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [joinedTables, setJoinedTables] = useState([]);

    useEffect(() => {
        if (!onlineUsersSocket) return;

        const handleOnlineUsersUpdate = (users) => {
            setOnlineUsers(users || []);
        };

        const handleJoinedTablesUpdate = (tables) => {
            setJoinedTables(tables || []);
        };

        onlineUsersSocket.on('online-users:list', handleOnlineUsersUpdate);
        onlineUsersSocket.on('joined-tables:list', handleJoinedTablesUpdate);

        // Demander les données initiales
        onlineUsersSocket.emit('online-users:get');
        onlineUsersSocket.emit('joined-tables:get');

        return () => {
            onlineUsersSocket.off('online-users:list', handleOnlineUsersUpdate);
            onlineUsersSocket.off('joined-tables:list', handleJoinedTablesUpdate);
        };
    }, []);

    return (
        <div className="game-server-stats">
            <div className="stat-item">
                <Users size={16} />
                <span className="stat-value">{onlineUsers.length}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
                <Layers size={16} />
                <span className="stat-value">{joinedTables.length}</span>
            </div>
        </div>
    );
};

export default ServerStats;