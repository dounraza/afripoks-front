import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const accessToken = sessionStorage.getItem("accessToken");

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        const newAccessToken = response.data.accessToken;
        sessionStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        sessionStorage.removeItem("accessToken");
        window.location.href = "/acceuil"; // Rediriger vers l'accueil au lieu du login
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// 🔗 Fonction pour récupérer les utilisateurs connectés
export const getConnectedUsers = async () => {
  try {
    const response = await api.get('/api/userConnected');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 🔗 Notifier le backend que l'utilisateur est connecté
export const notifyUserConnected = async (userId, username) => {
  try {
    const token = sessionStorage.getItem('accessToken');
    console.log('📡 [API] Notification de connexion au backend');
    console.log('📡 [API] URL:', BASE_URL + '/api/user-connected');
    console.log('📡 [API] Données:', { userId, username });
    console.log('📡 [API] Token:', token ? 'OUI (longueur: ' + token.length + ')' : 'NON');
    
    const response = await api.post('/api/user-connected', {
      userId, 
      username,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Response du backend:', response.data);
    console.log('✅ Statut:', response.status);
    console.log('✅ Backend notifié de la connexion');
    return response.data;
  } catch (error) {
    console.error('❌ [API] Erreur notification connexion');
    console.error('❌ [API] Statut:', error.response?.status);
    console.error('❌ [API] Response:', error.response?.data);
    console.error('❌ [API] Message:', error.message);
    console.error('❌ [API] Config:', error.config?.url);
    // Ne pas jeter l'erreur, c'est juste une notification
    return null;
  }
};

// 🔗 Récupérer l'avatar d'un utilisateur
export const getUserAvatar = async (userId) => {
  try {
    console.log(`📡 [API] Récupération de l'avatar pour l'userId: ${userId}`);
    const response = await api.get(`/api/users/avatar/${userId}`);
    console.log(`✅ [API] Réponse avatar pour ${userId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ [API] Erreur lors de la récupération de l'avatar pour l'utilisateur ${userId}:`, error);
    return { success: true, avatar_url: '/avatars/0.png' };
  }
};

// 🔗 Formater l'URL complète de l'avatar
export const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return '/avatars/0.png';
  if (avatarPath.startsWith('http') || avatarPath.startsWith('blob:')) return avatarPath;
  
  const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
  
  // Si l'avatar commence par /uploads ou uploads
  if (avatarPath.startsWith('/uploads')) return `${baseUrl}${avatarPath}`;
  if (avatarPath.startsWith('uploads/')) return `${baseUrl}/${avatarPath}`;
  
  // Si c'est un avatar par défaut (/avatars/...)
  if (avatarPath.startsWith('/avatars/')) return avatarPath;
  if (avatarPath.startsWith('avatars/')) return `/${avatarPath}`;
  
  return `/avatars/${avatarPath}`;
};

export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
