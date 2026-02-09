import api from './api';
import apiAdmin from './apiAdmin';
import { toast } from 'react-toastify';

const API_URL = `/api/depot`;

export const depot = async (data) => {    
  try {
    const response = await api.post(API_URL+'/mobile-money', data);
    if(response.data){
        toast.success(response.data);
    }
  } catch (error) {
    const Error = error.response && error.response.data
    throw Error;
  }
};
export const findAll = async (pseudo) => {    
  try {
    const response = await api.get(API_URL+'/mobile-money/'+pseudo);
    if(response.data){
        return response.data;
    }
  } catch (error) {
    throw new Error(error);
  }
};
export const findAllDesc = async () => {    
  try {
    const response = await apiAdmin.get(API_URL+'/mobile-money/desc');
    if(response.data){
        return response.data;
    }
  } catch (error) {
    throw new Error(error);
  }
};
export const findTransaction = async () => {    
  try {
    const response = await apiAdmin.get(API_URL+'/mobile-money');
    if(response.data){
        return response.data;
    }
  } catch (error) {
    throw new Error(error);
  }
};
export const transaction = async (data,id) => {    
  try {
    const response = await apiAdmin.post(API_URL+'/mobile-money/transaction/'+id, {etat : data});
    if(response.data){
        toast.success(response.data);
    }
  } catch (error) {
    throw new Error(error);
  }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {depot,findAll,findTransaction,transaction,findAllDesc};
