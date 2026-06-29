import axios from 'axios';

const LOCAL_API = 'http://192.168.126.198:5000/api';
const PROD_API = 'https://sporthub100-1.onrender.com/api';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? LOCAL_API : PROD_API);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
