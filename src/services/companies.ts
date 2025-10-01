import api from './api';

export type Company = {
  id: number;
  name: string;
  code: string;
  cidade?: string;
  estado?: string;
  ativo?: boolean;
};

export async function listCompanies(query?: string): Promise<Company[]> {
  const { data } = await api.get('/api/companies', { params: { q: query } });
  const items: Company[] = data?.data || data || [];
  return items;
}


