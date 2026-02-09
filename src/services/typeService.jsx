import { toast } from "react-toastify";
import api from "./api";
import apiAdmin from "./apiAdmin";
const API_URL = `/api/type-crypto-money`;


export const getType = async (setType) => {    
  try {
    const response = await api.get(API_URL+"/actif");
    if(response.data){
        setType(response.data);
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const createType = async (data) => {    
  try {
    const response = await apiAdmin.post(API_URL,data);
    if(response.data){
        toast.success('Type crypto money inserer !');
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const getTypeForAdmin = async (setType) => {    
  try {
    const response = await apiAdmin.get(API_URL);
    if(response.data){
        setType(response.data);
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const updateType = async (id,type) => {    
  try {
    const response = await apiAdmin.put(API_URL+"/"+id, {type});
    if(response.data){
        toast.success(response.data);
    }
  } catch (error) {
    throw new Error(error);
  }
};

export default {getType,createType,getTypeForAdmin,updateType};
