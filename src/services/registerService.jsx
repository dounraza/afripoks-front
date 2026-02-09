import api from './api';
import { toast } from 'react-toastify';
import { soldeInit as solde } from "./soldeService";

const API_URL = `/api/auth/register`;

export const register = async (data) => {    
  try {
    const response = await api.post(API_URL, data);

    if (response.data.success) {
      const formData = {
        montant: 0,
        userId: response.data.id
      };
      await solde(formData);
      return { success: true, data: response.data };
    } else {
      toast.error(response.data.message || "Erreur lors de l'inscription");
      return { success: false, error: response.data.message };
    }

  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Erreur de connexion au serveur";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export default register;