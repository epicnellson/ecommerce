import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL && import.meta.env.PROD) {
  console.error(
    '[API] VITE_API_URL is not set. API calls will fail in production. ' +
    'Set VITE_API_URL in your Vercel environment variables.'
  );
}

const api = axios.create({
  baseURL: baseURL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
