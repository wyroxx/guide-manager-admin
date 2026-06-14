// api.ts
// Axios instance and API calls for the backend.
import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string;
  name: string;
  telegram: string;
  excursionsDone: number;
}

export interface Excursion {
  id: string;
  assignedTo: string;
  date: string;
  lunch: boolean;
  masterClass: boolean;
  meetingPlace: string;
  people: number;
  route: string;
  time: string;
  type: string;
}
export interface Customer{
    id:string;
    name: string;
    telegram: string;
    banList: Array<User>;
}

export interface CreateUserData {
  name: string;
  telegram: string;
  excursionsDone?: number;
}

export interface CreateCustomerData{
  name: string;
  telegram: string;
  banList: Array<User>;
}

export interface CreateExcursionData {
  assignedTo: string;
  date: string;
  lunch: boolean;
  masterClass: boolean;
  meetingPlace: string;
  people: number;
  route: string;
  time: string;
  type: string;
}

//Customers
export const fetchCustomers = async(): Promise<Customer[]> =>{
  const response = await api.get('/customers');
  return response.data;
};

export const createCustomer = async (customerData: CreateCustomerData): Promise<Customer> => {
  const response = await api.post('/customers', customerData);
  return response.data;
};

export const fetchCustomer = async(id: string): Promise<Customer> =>{
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

// Users
export const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Excursions
export const fetchExcursions = async (): Promise<Excursion[]> => {
  const response = await api.get('/excursions');
  return response.data;
};

export const fetchExcursion = async (id: string): Promise<Excursion> => {
  const response = await api.get(`/excursions/${id}`);
  return response.data;
};

export const createExcursion = async (excursionData: CreateExcursionData): Promise<Excursion> => {
  const response = await api.post('/excursions', excursionData);
  return response.data;
};

export const updateExcursion = async (id: string, excursionData: CreateExcursionData): Promise<Excursion> => {
  const response = await api.put(`/excursions/${id}`, excursionData);
  return response.data;
};

export const deleteExcursion = async (id: string): Promise<void> => {
  await api.delete(`/excursions/${id}`);
};

export default api;
