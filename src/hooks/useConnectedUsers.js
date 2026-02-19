import { useEffect, useState, useRef } from 'react';
import { getConnectedUsers } from '../services/api';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useConnectedUsers = () => {
  const [connectedCount, setConnectedCount] = useState(0);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // 🔄 Rafraîchir via l'API REST
  const fetchUsersFromAPI = async () => {
    try {
      setLoading(true);
      console.log('📡 [useConnectedUsers] Appel à getConnectedUsers()...');
      const data = await getConnectedUsers();
      console.log('📡 [useConnectedUsers] Réponse complète:', JSON.stringify(data, null, 2));
      
      const count = data.totalConnected || 0;
      console.log(`✅ Utilisateurs en ligne (API) : ${count}`);
      console.log('✅ Données utilisateurs:', data.connectedUsersList);
      
      setConnectedCount(count);
      setUsersList(data.connectedUsersList || []);
      setError(null);
    } catch (err) {
      console.error('❌ [useConnectedUsers] Erreur API');
      console.error('❌ Statut:', err.response?.status);
      console.error('❌ Data:', err.response?.data);
      console.error('❌ Message:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1️⃣ Socket.io - Écouter les mises à jour en temps réel
    if (!socketRef.current) {
      const token = sessionStorage.getItem('token') || 
                    localStorage.getItem('token') || 
                    sessionStorage.getItem('authToken');

      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('🔌 Socket connecté (useConnectedUsers)');
        
        // Émettre user_connected
        const userId = sessionStorage.getItem('userId');
        const username = sessionStorage.getItem('userName'); // ✅ FIX: 'userName' pas 'username'
        socket.emit('user_connected', { userId, username });
        console.log('📤 user_connected émis au socket');
      });

      // 2️⃣ Écouter les mises à jour utilisateurs via Socket
      socket.on('users_count_update', (data) => {
        console.log('📊 Mise à jour temps réel (Socket):', data);
        setConnectedCount(data.total || 0);
        setUsersList(data.users || []);
      });

      socket.on('disconnect', (reason) => {
        console.warn('⚠️ Socket déconnecté:', reason);
      });
    }

    // ❌ SUPPRIMÉ: Ne pas faire de GET /api/userConnected qui retourne toujours 0
    // Utiliser SEULEMENT le socket qui fonctionne correctement!

    return () => {
      // ✅ IMPORTANT: Fermer la socket quand le composant se démonte
      // sinon des sockets s'accumulent et l'utilisateur est compté plusieurs fois!
      if (socketRef.current) {
        console.log('🔌 [CLEANUP] Fermeture socket (composant démonté)');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    connectedCount,
    usersList,
    loading,
    error,
    refetch: fetchUsersFromAPI
  };
};
