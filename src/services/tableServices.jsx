import api from "./api";
const API_URL = `/api/tables`;


export const getAll = async (setter, setSitCounts) => {    
  try {
    const response = await api.get(API_URL);
    if(response && response.data){
        const tablesData = response.data.data || [];
        const occupiedSeatsData = response.data.occupiedSeats || {};
        
        setter(Array.isArray(tablesData) ? tablesData : []);
        setSitCounts(new Map(Object.entries(occupiedSeatsData))); 
    }
  } catch (error) {
    console.error("Error in getAll tables:", error);
    setter([]);
    setSitCounts(new Map());
    // Ne pas throw pour éviter de casser le flux si possible, 
    // ou throw un message simple
    throw error;
  }
};

export const getTablesInfos = async () => {
  try {
    const response = await api.get(API_URL);
    alert(JSON.stringify(response.data.occupiedSeats));
    const data = await response.json();
    
    alert(JSON.stringify(data));
  } catch (error) {}
}

export const getById = async (id) => {    
  try {
    const response = await api.get(API_URL+`/${id}`);
    return response.data?.data?.cave ?? null;
  } catch (error) {
    throw new Error(error);
  }
};

export const isUserInTable = async (userId) => {
  try { 
    const response = await api.get(API_URL+`/in-table/${userId}`);
    
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}

export const getLastHistory = async (tableName) => {
  try {
    const response = await api.get(`/api/table/${tableName}/last`);
    return response.data;
  } catch (error) {
    console.error('Error fetching last history:', error);
    throw new Error(error);
  }
}

export default {getAll, getTablesInfos, getById, isUserInTable, getLastHistory};