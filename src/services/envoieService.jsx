import { toast } from "react-toastify";
import api from "./api";
import apiAdmin from "./apiAdmin";
const API_URL = `/api/compte`;


export const getEnvoie = async (setCompteEnvoie) => {    
  try {
    const response = await api.get(API_URL);
    if(response.data){
        console.log(response.data);
        setCompteEnvoie(response.data);
    }
  } catch (error) {
    throw new Error(error);
  }
};


export const getCompte = async (setCompte) => {    
  try {
    const response = await apiAdmin.get(API_URL+"/All");
    if(response.data){
        console.log(response.data);
        setCompte(response.data);
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const removeCompte = async (id) => {
  try {
    const response = await apiAdmin.delete(API_URL+"/remove/"+id);
    if (response.data) {
      toast.success(response.data);
    }
  } catch (error) {
    throw new Error(error);
  }
}

export const updateCompte = async (id,type) => {    
  try {
    const response = await apiAdmin.put(API_URL+"/"+id, {type});
    if(response.data){
        toast.success(response.data);
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const createCompte = async (data) => {    
  try {
    const response = await apiAdmin.post(API_URL, data);
    if(response.data){
        toast.success(response.data);
    }
  } catch (error) {
    throw new Error(error);
  }
};

export default {getEnvoie,getCompte,updateCompte,createCompte, removeCompte};