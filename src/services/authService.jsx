import axios from 'axios';
import api from './api';
import { onlineUsersSocket } from '../engine/socket';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/auth/login`; 

export const uploadAvatar = async (file) => {
    try {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.post('/api/users/upload-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.avatar_url;
    } catch (error) {
        console.error("Erreur lors de l'upload de l'avatar :", error);
        throw error;
    }
};

export const updateProfile = async (userId, name, avatar) => {
    try {
        const response = await api.put(`/api/users/${userId}`, { 
            name: name, 
            avatar: avatar 
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil :", error);
        throw error;
    }
};

export const login = async (email, password) => {
  try {
    const data= { email: email, password: password }
    const response = await axios.post(API_URL, data);
    
    const { accessToken, name, id, avatar_url } = response.data;

    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('userId', id);

    if (avatar_url) sessionStorage.setItem('avatar', avatar_url);

    onlineUsersSocket.emit('online-users:join', id);

    return true;
  } catch (error) {
    return false;
  }
};

export const isAuthenticated = () => {
  return !!sessionStorage.getItem('accessToken');
};

export const logout = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("userName");
  sessionStorage.removeItem("userId");
};
