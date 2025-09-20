import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'https://vivemas.onrender.com/api',
  // baseURL: 'http://192.168.100.59:3000/api',
});

export default api;
