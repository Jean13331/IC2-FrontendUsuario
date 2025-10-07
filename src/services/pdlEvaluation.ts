import api from './api';

export interface PdlAvaliacao {
  pdl_id: number;
  data_treinamento: string;
  tema_dia: string;
  principais_aprendizados: string;
  compromissos: string;
  nota_recomendacao?: number; // Opcional
  feedback_geral?: string; // Opcional
}

export interface PdlAvaliacaoCompleta {
  id_avaliacao: number;
  usuario_id: number;
  pdl_id: number;
  data_treinamento: string;
  tema_dia: string;
  principais_aprendizados: string;
  compromissos: string;
  feedback_acoes_realizadas?: string;
  acoes_nao_realizadas?: string;
  justificativa_nao_realizadas?: string;
  impacto_atividade_realizada?: string;
  impacto_atividade_nao_realizada?: string;
  observacoes_aprendizados?: string;
  nota_recomendacao?: number;
  feedback_geral?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em?: string;
}

export interface EstatisticasAvaliacao {
  total: number;
  pendentes: number;
  concluidas: number;
}

export async function createPdlAvaliacao(avaliacao: PdlAvaliacao) {
  const { data } = await api.post('/api/pdl-evaluation', avaliacao);
  return data;
}

export async function getPdlAvaliacoesByUser(userId: number): Promise<PdlAvaliacaoCompleta[]> {
  const { data } = await api.get(`/api/pdl-evaluation/user/${userId}`);
  return data.avaliacoes || [];
}

export async function getPdlAvaliacoesByPdl(pdlId: number): Promise<PdlAvaliacaoCompleta[]> {
  const { data } = await api.get(`/api/pdl-evaluation/pdl/${pdlId}?limit=100&offset=0`);
  console.log(`🔍 API pdl-evaluation/pdl/${pdlId} retornou:`, data);
  return data.avaliacoes || [];
}

export function calcularEstatisticasAvaliacao(avaliacoes: PdlAvaliacaoCompleta[]): EstatisticasAvaliacao {
  console.log('🔍 Calculando estatísticas para:', avaliacoes.length, 'avaliações');
  
  const total = avaliacoes.length;
  
  let pendentes = 0;
  let concluidas = 0;
  
  avaliacoes.forEach((avaliacao, index) => {
    console.log(`📝 Processando avaliação ${index + 1}:`, {
      id: avaliacao.id_avaliacao,
      pdl_id: avaliacao.pdl_id,
      tema: avaliacao.tema_dia
    });
    
    // Campos que precisam estar vazios para ser considerado pendente
    const camposPendentes = [
      avaliacao.feedback_acoes_realizadas,
      avaliacao.acoes_nao_realizadas,
      avaliacao.justificativa_nao_realizadas,
      avaliacao.impacto_atividade_realizada,
      avaliacao.impacto_atividade_nao_realizada
    ];
    
    console.log('🔍 Campos de resultado:', {
      feedback_acoes_realizadas: avaliacao.feedback_acoes_realizadas ? 'Preenchido' : 'Vazio',
      acoes_nao_realizadas: avaliacao.acoes_nao_realizadas ? 'Preenchido' : 'Vazio',
      justificativa_nao_realizadas: avaliacao.justificativa_nao_realizadas ? 'Preenchido' : 'Vazio',
      impacto_atividade_realizada: avaliacao.impacto_atividade_realizada ? 'Preenchido' : 'Vazio',
      impacto_atividade_nao_realizada: avaliacao.impacto_atividade_nao_realizada ? 'Preenchido' : 'Vazio'
    });
    
    // Contar quantos campos estão preenchidos
    const camposPreenchidos = camposPendentes.filter(campo => 
      campo && campo.trim() !== ''
    ).length;
    
    console.log(`📊 Campos preenchidos: ${camposPreenchidos}/5`);
    
    // Se pelo menos 2 campos estão preenchidos, considera concluída
    if (camposPreenchidos >= 2) {
      concluidas++;
      console.log('✅ Avaliação CONCLUÍDA');
    } else {
      pendentes++;
      console.log('⏳ Avaliação PENDENTE');
    }
  });
  
  const resultado = {
    total,
    pendentes,
    concluidas
  };
  
  console.log('📈 Estatísticas finais:', resultado);
  return resultado;
}