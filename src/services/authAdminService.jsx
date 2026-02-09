import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BASE_URL}/api/auth/admin/login`; 

export const loginAdmin = async (email, password) => {
  try {
    const data= { email: email, password: password }
    const response = await axios.post(API_URL, data); 
    
    const { accessToken, id } = response.data;
    
    sessionStorage.setItem('accessTokenAdmin', accessToken);
    sessionStorage.setItem('userIdAdmin', id);

    return true;
  } catch (error) {
    return false;
  }
};

export const isAuthenticated = () => {
  return !!sessionStorage.getItem('accessTokenAdmin');
};

export const logout = () => {
  sessionStorage.removeItem("accessTokenAdmin");
  sessionStorage.removeItem("userIdAdmin");
}

