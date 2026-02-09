import axios from 'axios';
import { onlineUsersSocket } from '../engine/socket';

const API_URL = `${process.env.REACT_APP_BASE_URL}/api/auth/login`; 

export const login = async (email, password) => {
  try {
    const data= { email: email, password: password }
    const response = await axios.post(API_URL, data);
    
    const { accessToken, name, id } = response.data;
    
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('userId', id);

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
}

