import api from './api';

export async function login(email: string, password: string, company?: string) {
  const { data } = await api.post('/api/auth/login', { email, password, company });
  return data;
}

export async function verify() {
  const { data } = await api.get('/api/auth/verify');
  return data;
}


