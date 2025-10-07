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

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ic2.token');
    console.log('Token encontrado:', token ? 'Sim' : 'Não');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Header Authorization adicionado:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('Nenhum token encontrado para a requisição:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      console.error('API error:', err.response.status, err.response.data);
      
      // Se for erro 401, limpar token e redirecionar para login
      if (err.response.status === 401) {
        localStorage.removeItem('ic2.token');
        localStorage.removeItem('ic2.session');
        window.location.href = '/login';
      }
    } else {
      console.error('API error:', err.message);
    }
    return Promise.reject(err);
  }
);

export default api;


