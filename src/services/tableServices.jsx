import api from "./api";
const API_URL = `/api/tables`;


export const getAll = async (setter, setSitCounts) => {    
  try {
    const response = await api.get(API_URL);
    if(response.data){
        setter(response.data.data);
        setSitCounts(new Map(Object.entries(response.data.occupiedSeats))); 
    }
  } catch (error) {
    throw new Error(error);
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