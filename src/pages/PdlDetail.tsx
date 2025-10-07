import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Stack, 
  Divider,
  Button,
  Alert,
  CardActionArea
} from '@mui/material';
import { 
  ArrowBack, 
  School, 
  Assignment, 
  Assessment,
  ArrowForward,
  Business,
  LocationOn
} from '@mui/icons-material';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import { Pdl, listCompanyPdls } from '../services/pdl';
import { getPdlAvaliacoesByPdl, calcularEstatisticasAvaliacao, EstatisticasAvaliacao } from '../services/pdlEvaluation';

interface PdlInfo {
  id: number;
  name: string;
  companyName: string;
  selectedAt: string;
}

export default function PdlDetail() {
  const { companySlug, pdlSlug } = useParams<{ companySlug: string; pdlSlug: string }>();
  const navigate = useNavigate();
  const [pdlInfo, setPdlInfo] = useState<PdlInfo | null>(null);
  const [pdlData, setPdlData] = useState<Pdl | null>(null);
  const [estatisticas, setEstatisticas] = useState<EstatisticasAvaliacao>({ total: 0, pendentes: 0, concluidas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPdlData = async () => {
      try {
        // Carregar informações do PDL do localStorage
        const raw = localStorage.getItem('ic2.selectedPdl');
        if (raw) {
          const info = JSON.parse(raw) as PdlInfo;
          setPdlInfo(info);
          
          // Buscar dados completos do PDL do banco
          const session = JSON.parse(localStorage.getItem('ic2.session') || '{}');
          const companyId = session.companyId;
          
          if (companyId) {
            const pdls = await listCompanyPdls(companyId);
            const currentPdl = pdls.find(p => p.id_pdl === info.id);
            if (currentPdl) {
              setPdlData(currentPdl);
              
              // Buscar avaliações do PDL para calcular estatísticas (apenas PDLs ativos)
              try {
                if (currentPdl && !currentPdl.finalizado_em) { // PDL ativo (não finalizado)
                  console.log(`🔍 Buscando avaliações para PDL ID: ${info.id}`);
                  const avaliacoes = await getPdlAvaliacoesByPdl(info.id);
                  console.log(`📊 Avaliações encontradas para PDL ${info.id}:`, avaliacoes.length);
                  console.log('📋 Dados das avaliações:', avaliacoes);
                  
                  const stats = calcularEstatisticasAvaliacao(avaliacoes);
                  setEstatisticas(stats);
                  console.log('📈 Estatísticas calculadas para PDL ativo:', stats);
                } else {
                  // PDL finalizado - zerar estatísticas
                  setEstatisticas({ total: 0, pendentes: 0, concluidas: 0 });
                  console.log('PDL finalizado - estatísticas zeradas');
                }
              } catch (error) {
                console.error('Erro ao buscar avaliações:', error);
                // Manter estatísticas zeradas em caso de erro
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do PDL:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPdlData();
  }, []);

  const handleBack = () => {
    navigate('/pdls');
  };

  const handleFunctionalityClick = (functionality: string) => {
    if (functionality === 'Aprendizados e Compromissos') {
      navigate('/aprendizados-compromissos');
    } else if (functionality === 'Ações Realizadas') {
      navigate('/acoes-realizadas');
    } else {
      // Aqui você pode implementar a navegação para outras funcionalidades
      console.log(`Clicou em: ${functionality}`);
      alert(`Funcionalidade "${functionality}" será implementada em breve!`);
    }
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

  if (!pdlInfo) {
    return (
      <Box>
        <ResponsiveAppBar />
        <Container sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            PDL não encontrado. Retorne à lista de PDLs.
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            Voltar para PDLs
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <ResponsiveAppBar />
      <Container sx={{ py: 4 }}>
        <Stack spacing={2} sx={{ mb: 3 }}>
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
          
          {/* Título e informações */}
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                mb: 1,
                wordBreak: 'break-word'
              }}
            >
              {pdlInfo.name}
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              spacing={{ xs: 1, sm: 2 }}
              sx={{ flexWrap: 'wrap' }}
            >
              <Chip 
                label={pdlData ? (pdlData.finalizado_em ? 'Finalizado' : 'Ativo') : 'Carregando...'} 
                color={pdlData ? (pdlData.finalizado_em ? 'default' : 'primary') : 'default'} 
                size="small"
                sx={{ fontSize: '0.75rem', height: 24 }}
              />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '0.875rem',
                  wordBreak: 'break-word'
                }}
              >
                Criado em: {pdlData ? formatDate(pdlData.pdl_criado_em) : 'Carregando...'}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Business sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    Empresa
                  </Typography>
                </Stack>
                
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(25, 118, 210, 0.04)',
                    border: '1px solid rgba(25, 118, 210, 0.12)',
                    borderRadius: 2
                  }}
                >
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    alignItems={{ xs: 'flex-start', sm: 'flex-start' }} 
                    spacing={2}
                  >
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 48,
                      height: 48,
                      alignSelf: { xs: 'flex-start', sm: 'flex-start' }
                    }}>
                      <Business sx={{ fontSize: 24 }} />
                    </Box>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 0.5, 
                          color: 'primary.main',
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          wordBreak: 'break-word'
                        }}
                      >
                        {pdlInfo.companyName}
                      </Typography>
                      
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        spacing={1} 
                        sx={{ mt: 1, flexWrap: 'wrap' }}
                      >
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ wordBreak: 'break-word' }}
                        >
                          Quirinópolis - GO
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Card>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Funcionalidades
                </Typography>
                <Stack spacing={2}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      '&:hover': { 
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                        borderColor: 'primary.main'
                      },
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleFunctionalityClick('Aprendizados e Compromissos')}
                  >
                    <CardActionArea sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        alignItems={{ xs: 'flex-start', sm: 'center' }} 
                        spacing={{ xs: 1.5, sm: 2 }}
                      >
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          alignSelf: { xs: 'flex-start', sm: 'center' },
                          minWidth: 48,
                          height: 48
                        }}>
                          <School sx={{ fontSize: 24 }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              mb: 0.5, 
                              color: 'primary.main', 
                              fontWeight: 'bold',
                              fontSize: { xs: '1rem', sm: '1.25rem' },
                              wordBreak: 'break-word'
                            }}
                          >
                            Aprendizados e Compromissos
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ wordBreak: 'break-word' }}
                          >
                            Avaliar treinamentos e resultados
                          </Typography>
                        </Box>
                        <ArrowForward 
                          sx={{ 
                            color: 'text.secondary',
                            alignSelf: { xs: 'flex-end', sm: 'center' },
                            flexShrink: 0
                          }} 
                        />
                      </Stack>
                    </CardActionArea>
                  </Card>
                  
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      '&:hover': { 
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                        borderColor: 'primary.main'
                      },
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleFunctionalityClick('Ações Realizadas')}
                  >
                    <CardActionArea sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        alignItems={{ xs: 'flex-start', sm: 'center' }} 
                        spacing={{ xs: 1.5, sm: 2 }}
                      >
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          bgcolor: 'success.main', 
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          alignSelf: { xs: 'flex-start', sm: 'center' },
                          minWidth: 48,
                          height: 48
                        }}>
                          <Assignment sx={{ fontSize: 24 }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              mb: 0.5, 
                              color: 'primary.main', 
                              fontWeight: 'bold',
                              fontSize: { xs: '1rem', sm: '1.25rem' },
                              wordBreak: 'break-word'
                            }}
                          >
                            Ações Realizadas
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ wordBreak: 'break-word' }}
                          >
                            Preencher resultados das avaliações PDL
                          </Typography>
                        </Box>
                        <ArrowForward 
                          sx={{ 
                            color: 'text.secondary',
                            alignSelf: { xs: 'flex-end', sm: 'center' },
                            flexShrink: 0
                          }} 
                        />
                      </Stack>
                    </CardActionArea>
                  </Card>
                  
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      '&:hover': { 
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                        borderColor: 'primary.main'
                      },
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleFunctionalityClick('Relatório')}
                  >
                    <CardActionArea sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        alignItems={{ xs: 'flex-start', sm: 'center' }} 
                        spacing={{ xs: 1.5, sm: 2 }}
                      >
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          bgcolor: 'warning.main', 
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          alignSelf: { xs: 'flex-start', sm: 'center' },
                          minWidth: 48,
                          height: 48
                        }}>
                          <Assessment sx={{ fontSize: 24 }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              mb: 0.5, 
                              color: 'primary.main', 
                              fontWeight: 'bold',
                              fontSize: { xs: '1rem', sm: '1.25rem' },
                              wordBreak: 'break-word'
                            }}
                          >
                            Relatório
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ wordBreak: 'break-word' }}
                          >
                            Visualizar estatísticas e métricas
                          </Typography>
                        </Box>
                        <ArrowForward 
                          sx={{ 
                            color: 'text.secondary',
                            alignSelf: { xs: 'flex-end', sm: 'center' },
                            flexShrink: 0
                          }} 
                        />
                      </Stack>
                    </CardActionArea>
                  </Card>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Estatísticas Rápidas
                </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  sx={{ 
                    flexWrap: 'wrap', 
                    gap: 2,
                    '& > *': { 
                      flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)', md: '1 1 120px' }
                    }
                  }}
                >
                  <Card sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    minWidth: { xs: '100%', sm: 120 }, 
                    textAlign: 'center', 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: { xs: 80, sm: 100 }
                  }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '2rem', sm: '2.125rem' }
                      }}
                    >
                      {estatisticas.total}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        wordBreak: 'break-word'
                      }}
                    >
                      Total de Avaliações
                    </Typography>
                  </Card>
                  
                  <Card sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    minWidth: { xs: '100%', sm: 120 }, 
                    textAlign: 'center', 
                    bgcolor: 'warning.main', 
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: { xs: 80, sm: 100 }
                  }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '2rem', sm: '2.125rem' }
                      }}
                    >
                      {estatisticas.pendentes}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        wordBreak: 'break-word'
                      }}
                    >
                      Pendentes
                    </Typography>
                  </Card>
                  
                  <Card sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    minWidth: { xs: '100%', sm: 120 }, 
                    textAlign: 'center', 
                    bgcolor: 'success.main', 
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: { xs: 80, sm: 100 }
                  }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '2rem', sm: '2.125rem' }
                      }}
                    >
                      {estatisticas.concluidas}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        wordBreak: 'break-word'
                      }}
                    >
                      Concluídas
                    </Typography>
                  </Card>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
