import axios from 'axios';

// Replace with your local machine's IP address if testing on a physical device, 
// or 10.0.2.2 for Android Emulator, or localhost for iOS simulator.
// Or use your specific local network IP like http://192.168.126.198:5000/api
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.126.198:5000/api';

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
