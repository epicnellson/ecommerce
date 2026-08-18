import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://ecommerce-backend-8nj2.onrender.com';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
