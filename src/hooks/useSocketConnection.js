// src/hooks/useSocketConnection.js
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import api from '../services/api';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useSocketConnection = (onUsersCountUpdate, onTableUsersUpdate) => {
  const socketRef = useRef(null);
  const socketConnectedRef = useRef(false);
  const apiIntervalRef = useRef(null);
  
  // ✅ STOCKER LES CALLBACKS DANS UN REF POUR ÉVITER LA BOUCLE
  const callbacksRef = useRef({
    onUsersCountUpdate,
    onTableUsersUpdate
  });

  // ✅ METTRE À JOUR LES CALLBACKS SANS REDÉCLENCHER LE useEffect
  useEffect(() => {
    callbacksRef.current = {
      onUsersCountUpdate,
      onTableUsersUpdate
    };
  }, [onUsersCountUpdate, onTableUsersUpdate]);

  // ✅ FALLBACK API - Récupérer le nombre d'utilisateurs si socket n'envoie pas
  const fetchConnectedUsersFromAPI = async () => {
    try {
      console.log('📡 [API] Appel à /api/userConnected...');
      const response = await api.get('/api/userConnected');
      console.log('📡 [API] Réponse reçue:', response.data);
      const totalConnected = response.data.totalConnected || 0;
      console.log('📡 [API FALLBACK] Utilisateurs connectés:', totalConnected);
      if (callbacksRef.current.onUsersCountUpdate) {
        callbacksRef.current.onUsersCountUpdate(totalConnected);
      }
    } catch (error) {
      console.error('⚠️ [API FALLBACK] Erreur complète:', error);
      console.error('⚠️ [API FALLBACK] Statut:', error.response?.status);
      console.error('⚠️ [API FALLBACK] Message:', error.response?.data?.message || error.message);
      if (error.response?.status === 404) {
        console.error('⚠️ [API FALLBACK] Endpoint /api/userConnected N\'EXISTE PAS sur le backend!');
      }
    }
  };

  // ✅ SE CONNECTER UNE SEULE FOIS (tableau de dépendances vide)
  useEffect(() => {
    console.log('🔌 Initialisation du socket (UNE SEULE FOIS)');
    console.log('🔌 URL du socket:', SOCKET_URL);
    
    const token = sessionStorage.getItem('token') || 
                  localStorage.getItem('token') || 
                  sessionStorage.getItem('authToken');
    
    console.log('🔑 Token disponible:', token ? 'Oui (longueur: ' + token?.length + ')' : 'Non');
    console.log('🔑 Token valeur:', token ? token.substring(0, 50) + '...' : 'AUCUN');
    
    // ✅ ESSAI SANS TOKEN D'ABORD
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      // auth: {
      //   token: token
      // },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const userId = sessionStorage.getItem('userId');
    const username = sessionStorage.getItem('userName'); // ✅ FIX: 'userName' pas 'username'

    console.log('👤 Données utilisateur:', { userId, username });

    socket.on('connect', () => {
      console.log('✅ Socket CONNECTÉ ! ID:', socket.id);
      socketConnectedRef.current = true;
      socket.emit('user_connected', { userId, username });
      console.log('📤 user_connected émis');
      
      // Demander la liste des utilisateurs après la connexion
      setTimeout(() => {
        fetchConnectedUsersFromAPI();
      }, 500);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erreur connexion socket:', error);
      console.error('❌ Message erreur:', error?.message);
      console.error('❌ Type erreur:', error?.type);
      socketConnectedRef.current = false;
      // Fallback à l'API en cas d'erreur socket
      fetchConnectedUsersFromAPI();
    });

    socket.on('error', (error) => {
      console.error('❌ ERREUR SOCKET:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnecté après', attemptNumber, 'tentatives');
      socketConnectedRef.current = true;
    });

    socket.on('disconnect', (reason) => {
      console.warn('⚠️ Déconnecté:', reason);
      socketConnectedRef.current = false;
    });

    // ✅ ÉCOUTER les événements socket
    socket.on('users_count_update', (data) => {
      console.log('📊 [SOCKET] Count reçu:', data.total || data);
      const count = data.total || data;
      if (callbacksRef.current.onUsersCountUpdate) {
        callbacksRef.current.onUsersCountUpdate(count);
      }
    });

    socket.on('table_users_update', (data) => {
      console.log('🎲 [SOCKET] Table update:', data);
      if (callbacksRef.current.onTableUsersUpdate) {
        callbacksRef.current.onTableUsersUpdate(data);
      }
    });

    // ✅ FALLBACK : Récupérer via API si socket déconnecté ou toutes les 30 secondes en backup
    apiIntervalRef.current = setInterval(() => {
      if (!socketConnectedRef.current) {
        console.log('🔄 [API FALLBACK] Socket déconnecté, tentative via API...');
        fetchConnectedUsersFromAPI();
      } else {
        // En mode connecté, on ne fait un appel que toutes les 30s en sécurité
        if (Math.random() < 0.1) { // 10% de chance toutes les 5s = environ 1 fois par minute
           fetchConnectedUsersFromAPI();
        }
      }
    }, 5000);

    // ✅ CLEANUP : SE DÉCONNECTE SEULEMENT QUAND LE COMPOSANT SE DÉMONTE
    return () => {
      console.log('🔌 Fermeture socket (composant démonté)');
      socket.disconnect();
      if (apiIntervalRef.current) {
        clearInterval(apiIntervalRef.current);
      }
    };
  }, []); // ✅ TABLEAU VIDE = UNE SEULE EXÉCUTION

  return socketRef.current;
};