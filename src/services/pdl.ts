import api from './api';

export type Pdl = {
  id_pdl: number;
  pdl_nome: string;
  pdl_ativo: boolean;
  finalizado_em: string | null;
  pdl_criado_em?: string;
};

export async function listCompanyPdls(companyId: number): Promise<Pdl[]> {
  const { data } = await api.get(`/api/pdl/company/${companyId}`);
  return data?.data || data || [];
}


