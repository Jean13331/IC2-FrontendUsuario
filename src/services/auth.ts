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

export async function register(userData: {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cidade: string;
  estado: string;
  empresa_id: number;
}) {
  const { data } = await api.post('/api/auth/register', userData);
  return data;
}

// Recuperação de senha
export async function forgotPassword(email: string) {
  const { data } = await api.post('/api/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token: string, email: string, newPassword: string) {
  const { data } = await api.post('/api/auth/reset-password', {
    token,
    email,
    newPassword
  });
  return data;
}

export async function verifyResetToken(token: string, email: string) {
  const { data } = await api.get('/api/auth/verify-reset-token', {
    params: { token, email }
  });
  return data;
}


