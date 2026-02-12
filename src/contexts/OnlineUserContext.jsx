// // import { useEffect, createContext, useState } from "react";
// // import { onlineUsersSocket as socket } from "../engine/socket";

// // export const OnlineUserContext = createContext();

// // export const OnlineUserProvider = ({ children }) => {
// //   const [onlineUsers, setOnlineUsers] = useState([]);
// //   const userId = sessionStorage.getItem('userId');

// //   useEffect(() => {
// //     const onConnect = () => {
// //       console.log('Connected to online users socket!');
// //       // Émettre la connexion de l'utilisateur
// //       if (userId) {
// //         socket.emit('user-connected', { userId: parseInt(userId) });
// //         // Demander la liste des utilisateurs en ligne
// //         socket.emit('get-online-users');
// //       }
// //     };

// //     // Gérer la connexion initiale
// //     socket.on('connect', onConnect);

// //     // Si déjà connecté, émettre immédiatement
// //     if (socket.connected && userId) {
// //       socket.emit('user-connected', { userId: parseInt(userId) });
// //       socket.emit('get-online-users');
// //     }

// //     // Écouter les mises à jour des utilisateurs en ligne
// //     socket.on('online-users-update', (users) => {
// //       console.log('📡 Online users update:', users);
// //       setOnlineUsers(users || []);
// //     });

// //     // Support de votre ancienne logique (si elle existe encore côté serveur)
// //     socket.on('online-users:update', (uids) => {
// //       console.log('📡 Online users update (old format):', uids);
// //       setOnlineUsers(uids || []);
// //     });

// //     // Nettoyer à la déconnexion du composant
// //     return () => {
// //       socket.off('connect', onConnect);
// //       socket.off('online-users-update');
// //       socket.off('online-users:update');
// //     };
// //   }, [userId]); // Dépendance sur userId

// //   return (
// //     <OnlineUserContext.Provider value={{ onlineUsers, setOnlineUsers }}>
// //       {children}
// //     </OnlineUserContext.Provider>
// //   );
// // };
// import { useEffect, createContext, useState } from "react";
// import { onlineUsersSocket as socket } from "../engine/socket";

// export const OnlineUserContext = createContext();

// export const OnlineUserProvider = ({ children }) => {
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   useEffect(() => {
//     console.log('🚀 [CONTEXT] OnlineUserProvider monté');
    
//     const userId = sessionStorage.getItem('userId');
//     console.log('👤 [CONTEXT] userId:', userId, 'Type:', typeof userId);
    
//     if (!userId) {
//       console.error('❌ [CONTEXT] PAS DE USERID DANS SESSIONSTORAGE !');
//       return;
//     }

//     // Handler de connexion
//     const handleConnect = () => {
//       console.log('✅ [CONTEXT] Socket connectée, envoi user-connected...');
//       console.log('📤 [CONTEXT] Émission user-connected avec:', { userId: parseInt(userId) });
      
//       socket.emit('user-connected', { userId: parseInt(userId) });
      
//       // Attendre un peu puis demander la liste
//       setTimeout(() => {
//         console.log('📤 [CONTEXT] Demande get-online-users');
//         socket.emit('get-online-users');
//       }, 1000);
//     };

//     // Handler pour recevoir la liste
//     const handleOnlineUsersUpdate = (users) => {
//       console.log('📥 [CONTEXT] Reçu online-users-update:', users);
//       console.log('📊 [CONTEXT] Nombre d\'utilisateurs:', users?.length || 0);
//       setOnlineUsers(users || []);
//     };

//     // Écouter les événements
//     socket.on('connect', handleConnect);
//     socket.on('online-users-update', handleOnlineUsersUpdate);
//     socket.on('online-users:update', handleOnlineUsersUpdate); // Ancien format

//     // Si déjà connecté, exécuter immédiatement
//     if (socket.connected) {
//       console.log('🔌 [CONTEXT] Socket déjà connectée au montage');
//       handleConnect();
//     } else {
//       console.log('⏳ [CONTEXT] Socket pas encore connectée, attente...');
//     }

//     // Cleanup
//     return () => {
//       console.log('🧹 [CONTEXT] Cleanup');
//       socket.off('connect', handleConnect);
//       socket.off('online-users-update', handleOnlineUsersUpdate);
//       socket.off('online-users:update', handleOnlineUsersUpdate);
//     };
//   }, []);

//   console.log('🎨 [CONTEXT] Rendu avec', onlineUsers.length, 'utilisateurs');

//   return (
//     <OnlineUserContext.Provider value={{ onlineUsers, setOnlineUsers }}>
//       {children}
//     </OnlineUserContext.Provider>
//   );
// };

import { useEffect, createContext, useState } from "react";
import { onlineUsersSocket as socket } from "../engine/socket";

export const OnlineUserContext = createContext();

export const OnlineUserProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    console.log('🚀 [CONTEXT] OnlineUserProvider monté');

    // Handler de connexion
    const handleConnect = () => {
      const userId = sessionStorage.getItem('userId');
      console.log('✅ [CONTEXT] Socket connectée');
      console.log('👤 [CONTEXT] userId:', userId);
      
      if (userId) {
        console.log('📤 [CONTEXT] Émission user-connected avec userId:', userId);
        socket.emit('user-connected', { userId: parseInt(userId) });
        
        setTimeout(() => {
          console.log('📤 [CONTEXT] Demande get-online-users');
          socket.emit('get-online-users');
        }, 500);
      } else {
        console.log('⚠️ [CONTEXT] Pas encore de userId, attente connexion utilisateur');
      }
    };

    // Handler pour recevoir la liste
    const handleOnlineUsersUpdate = (users) => {
      console.log('📥 [CONTEXT] Reçu online-users-update:', users);
      console.log('📊 [CONTEXT] Nombre d\'utilisateurs:', users?.length || 0);
      setOnlineUsers(users || []);
    };

    // Écouter les événements
    socket.on('connect', handleConnect);
    socket.on('online-users-update', handleOnlineUsersUpdate);
    socket.on('online-users:update', handleOnlineUsersUpdate);

    // Si déjà connecté, exécuter immédiatement
    if (socket.connected) {
      console.log('🔌 [CONTEXT] Socket déjà connectée au montage');
      handleConnect();
    }

    // ✨ NOUVEAU : Écouter les changements de sessionStorage
    const handleStorageChange = (e) => {
      if (e.key === 'userId' && e.newValue) {
        console.log('🔄 [CONTEXT] userId ajouté dans sessionStorage:', e.newValue);
        if (socket.connected) {
          socket.emit('user-connected', { userId: parseInt(e.newValue) });
          socket.emit('get-online-users');
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // ✨ NOUVEAU : Event custom pour notifier le changement de userId
    const handleUserLogin = (event) => {
      const userId = event.detail.userId;
      console.log('🔑 [CONTEXT] Event userLogin reçu, userId:', userId);
      if (socket.connected && userId) {
        socket.emit('user-connected', { userId: parseInt(userId) });
        socket.emit('get-online-users');
      }
    };
    window.addEventListener('userLogin', handleUserLogin);

    // Cleanup
    return () => {
      console.log('🧹 [CONTEXT] Cleanup');
      socket.off('connect', handleConnect);
      socket.off('online-users-update', handleOnlineUsersUpdate);
      socket.off('online-users:update', handleOnlineUsersUpdate);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, []); // Pas de dépendance, écoute les events

  console.log('🎨 [CONTEXT] Rendu avec', onlineUsers.length, 'utilisateurs');

  return (
    <OnlineUserContext.Provider value={{ onlineUsers, setOnlineUsers }}>
      {children}
    </OnlineUserContext.Provider>
  );
};