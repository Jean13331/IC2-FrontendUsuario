import api from './api';

export async function login(email: string, password: string, companyId?: number) {
  const payload = { username: email, password, company_id: companyId };
  const { data } = await api.post('/api/auth/login', payload);
  return data;
}

export async function verify() {
  const { data } = await api.get('/api/auth/verify');
  return data;
}



