import api from "./api";
import apiAdmin from "./apiAdmin";
const API_URL = `/api/solde`;

export const soldeInit = async (data) => {    
  try {
    await api.post(API_URL+"/init", data);
  } catch (error) {
    throw new Error(error);
  }
};

export const getSolde = async (userId, setSold) => {    
  try {
    if (!userId) return;
    const response = await api.get(API_URL+`/${userId}`);
    
    if(response && response.data){
        setSold(response.data.solde ?? 0); 
    }
  } catch (error) {
    console.error("Error fetching solde:", error);
    setSold(0);
    // On ne throw pas forcément pour éviter de bloquer l'affichage des tables
  }
};

export const updateSolde = async (userId, newSolde) => {
  try {
    await api.post(`${API_URL}/update/${userId}`, { newSolde });
  } catch (error) {
    throw new Error(error);
  }
};

export const getTotalSolde = async () => {
  try {
    const response = await apiAdmin.get('/api/total-solde');
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {soldeInit, getSolde, updateSolde, getTotalSolde};