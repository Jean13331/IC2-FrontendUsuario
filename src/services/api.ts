import axios from 'axios';

// Base URL da API: usa .env; se não houver, faz fallback para a URL do Railway
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://ic2-backend-production.up.railway.app';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      console.error('API error:', err.response.status, err.response.data);
    } else {
      console.error('API error:', err.message);
    }
    return Promise.reject(err);
  }
);

export default api;


