import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Stack, 
  Button,
  Alert,
  Divider,
  Grid,
  Paper,
  Snackbar
} from '@mui/material';
import { 
  ArrowBack, 
  ArrowForward,
  Assignment,
  CheckCircle,
  Pending,
  Event,
  School,
  Business
} from '@mui/icons-material';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import { PdlAvaliacaoCompleta, getPdlAvaliacoesByPdl } from '../services/pdlEvaluation';
import api from '../services/api';

interface PdlInfo {
  id: number;
  name: string;
  companyName: string;
  selectedAt: string;
}

export default function AcoesRealizadas() {
  const navigate = useNavigate();
  const [pdlInfo, setPdlInfo] = useState<PdlInfo | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<PdlAvaliacaoCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'warning' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar informações do PDL do localStorage
        const raw = localStorage.getItem('ic2.selectedPdl');
        if (raw) {
          const info = JSON.parse(raw) as PdlInfo;
          setPdlInfo(info);
        }

        // Buscar sessão do usuário
        const session = JSON.parse(localStorage.getItem('ic2.session') || '{}');
        const userId = session.userId;
        const token = localStorage.getItem('ic2.token');
        
        console.log('🔍 Sessão carregada:', session);
        console.log('🔍 UserId encontrado:', userId);
        console.log('🔍 Token encontrado:', token ? 'Sim' : 'Não');
        console.log('🔍 Token (primeiros 50 chars):', token ? token.substring(0, 50) + '...' : 'N/A');
        
        // Verificar se o token está presente
        if (!token) {
          console.error('❌ Token não encontrado na sessão');
          console.log('🔄 Redirecionando para login...');
          
          // Mostrar notificação para o usuário
          setSnackbar({
            open: true,
            message: 'Sessão expirada. Redirecionando para login...',
            severity: 'warning'
          });
          
          // Limpar dados inválidos
          localStorage.removeItem('ic2.session');
          localStorage.removeItem('ic2.token');
          
          // Redirecionar para login após um breve delay
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
        
        // Debug: verificar se o userId está em outros campos
        console.log('🔍 Verificando campos da sessão:');
        console.log('  - session.userId:', session.userId);
        console.log('  - session.user_id:', session.user_id);
        console.log('  - session.id:', session.id);
        console.log('  - session.user:', session.user);
        console.log('  - session.data:', session.data);

        if (userId) {
          try {
            if (pdlInfo && pdlInfo.id) {
              // Buscar avaliações apenas do PDL específico (igual à página PdlDetail)
              console.log(`🔍 Buscando avaliações do PDL específico: ${pdlInfo.id}`);
              const avaliacoes = await getPdlAvaliacoesByPdl(pdlInfo.id);
              console.log('✅ Avaliações do PDL específico:', avaliacoes);
              setAvaliacoes(avaliacoes);
            } else {
              // Se não há PDL específico, buscar todas as avaliações do usuário
              console.log('🔍 PDL específico não encontrado, buscando todas as avaliações do usuário');
              const avaliacoesResponse = await api.get(`/api/pdl-evaluation/user/${userId}`);
              console.log('✅ Resposta da API de avaliações:', avaliacoesResponse.data);
              
              if (avaliacoesResponse.data && avaliacoesResponse.data.avaliacoes) {
                setAvaliacoes(avaliacoesResponse.data.avaliacoes);
                console.log('✅ Usando dados da API de avaliações');
              } else {
                setAvaliacoes(avaliacoesResponse.data || []);
              }
            }
          } catch (error) {
            console.error('❌ Erro ao buscar avaliações:', error);
            console.error('❌ Status:', error.response?.status);
            console.error('❌ Dados do erro:', error.response?.data);
            
            // Tentar fallback com API de resultados do usuário
            try {
              console.log('🔄 Tentando fallback com API de resultados do usuário...');
              const fallbackResponse = await api.get(`/api/pdl-evaluation/resultados/${userId}`);
              console.log('✅ Fallback funcionou:', fallbackResponse.data);
              
              if (pdlInfo && pdlInfo.id) {
                // Filtrar apenas as avaliações do PDL específico
                const avaliacoesFiltradas = fallbackResponse.data.filter((av: any) => av.pdl_id === pdlInfo.id);
                console.log(`✅ Avaliações filtradas para PDL ${pdlInfo.id}:`, avaliacoesFiltradas);
                setAvaliacoes(avaliacoesFiltradas);
              } else {
                // Usar todas as avaliações se não há PDL específico
                setAvaliacoes(fallbackResponse.data || []);
              }
            } catch (fallbackError) {
              console.error('❌ Fallback também falhou:', fallbackError);
            }
          }
        } else {
          console.error('❌ UserId não encontrado na sessão');
          console.log('🔄 Redirecionando para login...');
          
          // Mostrar notificação para o usuário
          setSnackbar({
            open: true,
            message: 'Dados de sessão inválidos. Redirecionando para login...',
            severity: 'warning'
          });
          
          // Limpar dados inválidos
          localStorage.removeItem('ic2.session');
          localStorage.removeItem('ic2.token');
          
          // Redirecionar para login após um breve delay
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Data não informada';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getStatusAvaliacao = (avaliacao: PdlAvaliacaoCompleta) => {
    const camposPendentes = [
      avaliacao.feedback_acoes_realizadas,
      avaliacao.acoes_nao_realizadas,
      avaliacao.justificativa_nao_realizadas,
      avaliacao.impacto_atividade_realizada,
      avaliacao.impacto_atividade_nao_realizada
    ];
    
    const camposPreenchidos = camposPendentes.filter(campo => 
      campo && campo.trim() !== ''
    ).length;
    
    return camposPreenchidos >= 2 ? 'concluida' : 'pendente';
  };

  const getStatusColor = (status: string) => {
    return status === 'concluida' ? 'success' : 'warning';
  };

  const getStatusIcon = (status: string) => {
    return status === 'concluida' ? <CheckCircle /> : <Pending />;
  };

  const getStatusLabel = (status: string) => {
    return status === 'concluida' ? 'Concluída' : 'Pendente';
  };

  if (loading) {
    return (
      <Box>
        <ResponsiveAppBar />
        <Container sx={{ py: 4 }}>
          <Typography>Carregando...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <ResponsiveAppBar />
      <Container sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Botão voltar */}
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />}
            onClick={handleBack}
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            Voltar
          </Button>
          
          {/* Título */}
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              mb: 1
            }}
          >
            Ações Realizadas
          </Typography>


          {/* Lista de Avaliações PDL */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Ações e Resultados
              </Typography>
              
              {avaliacoes.length === 0 ? (
                <Alert severity="info">
                  Nenhuma ação realizada encontrada. Faça sua primeira avaliação na seção "Aprendizados e Compromissos" e depois preencha os resultados aqui.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {avaliacoes.map((avaliacao) => {
                    const status = getStatusAvaliacao(avaliacao);
                    return (
                      <Card 
                        key={avaliacao.id_avaliacao}
                        variant="outlined"
                        sx={{ 
                          '&:hover': { 
                            boxShadow: 2,
                            borderColor: 'primary.main'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <CardContent>
                          <Stack spacing={2}>
                            {/* Cabeçalho da avaliação */}
                            <Stack 
                              direction={{ xs: 'column', sm: 'row' }} 
                              justifyContent="space-between" 
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                              spacing={1}
                            >
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {avaliacao.tema_dia || 'Tema não informado'}
                              </Typography>
                              
                              <Chip
                                icon={getStatusIcon(status)}
                                label={getStatusLabel(status)}
                                color={getStatusColor(status)}
                                size="small"
                              />
                            </Stack>

                            {/* Informações da avaliação */}
                            <Stack direction="row" spacing={3} sx={{ color: 'text.secondary' }}>
                              <Typography variant="body2">
                                <strong>Data:</strong> {formatDate(avaliacao.data_treinamento)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>PDL:</strong> {avaliacao.pdl_nome || 'PDL não informado'}
                              </Typography>
                            </Stack>

                            <Divider />

                            {/* Aprendizados */}
                            <Card 
                              variant="outlined" 
                              sx={{ 
                                bgcolor: 'grey.50',
                                borderColor: 'grey.300',
                                '&:hover': {
                                  boxShadow: 2,
                                  borderColor: 'grey.400'
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                                  <School sx={{ color: 'text.secondary', fontSize: 20 }} />
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    Aprendizados
                                  </Typography>
                                </Stack>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    lineHeight: 1.6,
                                    color: 'text.primary'
                                  }}
                                >
                                  {avaliacao.principais_aprendizados || 'Nenhum aprendizado registrado'}
                                </Typography>
                              </CardContent>
                            </Card>

                            {/* Ações */}
                            <Card 
                              variant="outlined" 
                              sx={{ 
                                bgcolor: 'grey.50',
                                borderColor: 'grey.300',
                                '&:hover': {
                                  boxShadow: 2,
                                  borderColor: 'grey.400'
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                                  <Assignment sx={{ color: 'text.secondary', fontSize: 20 }} />
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    Ações e Compromissos
                                  </Typography>
                                </Stack>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    lineHeight: 1.6,
                                    color: 'text.primary'
                                  }}
                                >
                                  {avaliacao.compromissos || 'Nenhuma ação registrada'}
                                </Typography>
                              </CardContent>
                            </Card>

                            {/* Campos de resultado (se preenchidos) */}
                            {(avaliacao.feedback_acoes_realizadas || 
                              avaliacao.acoes_nao_realizadas || 
                              avaliacao.justificativa_nao_realizadas || 
                              avaliacao.impacto_atividade_realizada || 
                              avaliacao.impacto_atividade_nao_realizada) && (
                              <>
                                <Divider />
                                <Card 
                                  variant="outlined" 
                                  sx={{ 
                                    bgcolor: 'grey.50',
                                    borderColor: 'grey.300',
                                    '&:hover': {
                                      boxShadow: 2,
                                      borderColor: 'grey.400'
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                  }}
                                >
                                  <CardContent sx={{ p: 2 }}>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                                      <CheckCircle sx={{ color: 'text.secondary', fontSize: 20 }} />
                                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                        Resultados e Feedback
                                      </Typography>
                                    </Stack>
                                    <Stack spacing={2}>
                                      {avaliacao.feedback_acoes_realizadas && (
                                        <Box>
                                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                            Feedback das Ações Realizadas:
                                          </Typography>
                                          <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                            {avaliacao.feedback_acoes_realizadas}
                                          </Typography>
                                        </Box>
                                      )}
                                      {avaliacao.acoes_nao_realizadas && (
                                        <Box>
                                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                            Ações Não Realizadas:
                                          </Typography>
                                          <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                            {avaliacao.acoes_nao_realizadas}
                                          </Typography>
                                        </Box>
                                      )}
                                      {avaliacao.justificativa_nao_realizadas && (
                                        <Box>
                                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                            Justificativa para Ações Não Realizadas:
                                          </Typography>
                                          <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                            {avaliacao.justificativa_nao_realizadas}
                                          </Typography>
                                        </Box>
                                      )}
                                      {avaliacao.impacto_atividade_realizada && (
                                        <Box>
                                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                            Impacto das Atividades Realizadas:
                                          </Typography>
                                          <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                            {avaliacao.impacto_atividade_realizada}
                                          </Typography>
                                        </Box>
                                      )}
                                      {avaliacao.impacto_atividade_nao_realizada && (
                                        <Box>
                                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                            Impacto das Atividades Não Realizadas:
                                          </Typography>
                                          <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                            {avaliacao.impacto_atividade_nao_realizada}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Stack>
                                  </CardContent>
                                </Card>
                              </>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
      
      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
