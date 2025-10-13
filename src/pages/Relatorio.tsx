import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Stack, 
  Button,
  Alert,
  Divider,
  Snackbar,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid
} from '@mui/material';
import { 
  ArrowBack, 
  Download,
  ExpandMore,
  Assessment,
  Event,
  School,
  Business,
  CheckCircle,
  Pending
} from '@mui/icons-material';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import api from '../services/api';
import jsPDF from 'jspdf';
import logoImage from '../icon/FDL_logotipo 8.png';

interface RelatorioData {
  id: number;
  pdl: string;
  data_treinamento: string;
  tema_dia: string;
  principais_aprendizados: string;
  compromissos: string;
  feedback_acoes_realizadas: string;
  acoes_nao_realizadas: string;
  justificativa_nao_realizadas: string;
  impacto_atividade_realizada: string;
  impacto_atividade_nao_realizada: string;
  observacoes_aprendizados: string;
  nota_recomendacao: number;
  feedback_geral: string;
  criado_em: string;
}

export default function Relatorio() {
  const navigate = useNavigate();
  const [relatorios, setRelatorios] = useState<RelatorioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    const loadRelatorios = async () => {
      try {
        // Buscar sessão do usuário
        const session = JSON.parse(localStorage.getItem('ic2.session') || '{}');
        const userId = session.userId;
        const token = localStorage.getItem('ic2.token');
        
        console.log('🔍 Carregando relatórios para usuário:', userId);
        
        if (!token) {
          setSnackbar({
            open: true,
            message: 'Sessão expirada. Redirecionando para login...',
            severity: 'warning'
          });
          
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        if (userId) {
          // Buscar relatórios do usuário
          const response = await api.get(`/api/pdl-evaluation/relatorio/${userId}`);
          console.log('✅ Relatórios carregados:', response.data);
          
          if (response.data.success && response.data.relatorio) {
            setRelatorios(response.data.relatorio);
          } else {
            setRelatorios([]);
          }
        } else {
          setSnackbar({
            open: true,
            message: 'Dados de sessão inválidos. Redirecionando para login...',
            severity: 'warning'
          });
          
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar relatórios:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar relatórios. Tente novamente.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadRelatorios();
  }, [navigate]);

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

  const getStatusRelatorio = (relatorio: RelatorioData) => {
    const camposResultado = [
      relatorio.feedback_acoes_realizadas,
      relatorio.acoes_nao_realizadas,
      relatorio.justificativa_nao_realizadas,
      relatorio.impacto_atividade_realizada,
      relatorio.impacto_atividade_nao_realizada,
      relatorio.observacoes_aprendizados
    ];
    
    const camposPreenchidos = camposResultado.filter(campo => 
      campo && campo.trim() !== ''
    ).length;
    
    return camposPreenchidos >= 2 ? 'concluido' : 'pendente';
  };

  const getStatusColor = (status: string) => {
    return status === 'concluido' ? 'success' : 'warning';
  };

  const getStatusIcon = (status: string) => {
    return status === 'concluido' ? <CheckCircle /> : <Pending />;
  };

  const getStatusLabel = (status: string) => {
    return status === 'concluido' ? 'Concluído' : 'Pendente';
  };

  const handleDownload = (relatorio: RelatorioData) => {
    try {
      console.log('🔍 Iniciando geração do PDF...');
      
      // Criar novo documento PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      console.log('📄 Dimensões da página:', { pageWidth, pageHeight });

      // Cores do tema
      const primaryColor = [25, 118, 210]; // Azul Material-UI
      const secondaryColor = [158, 158, 158]; // Cinza
      const textColor = [33, 33, 33]; // Cinza escuro

      // Função para adicionar texto com quebra de linha
      const addTextWithWrap = (text: string | undefined, x: number, y: number, maxWidth: number, fontSize: number = 10, color: number[] = textColor) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text || '', maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * (fontSize * 0.4));
      };

      // Função para adicionar seção
      const addSection = (title: string | undefined, content: string | undefined, y: number) => {
        // Título da seção
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        y = addTextWithWrap(title || '', 20, y, pageWidth - 40, 14, primaryColor) + 5;

        // Conteúdo da seção
        if (content && content.trim() !== '') {
          doc.setFont('helvetica', 'normal');
          y = addTextWithWrap(content || '', 20, y, pageWidth - 40, 10, textColor) + 10;
        } else {
          doc.setFont('helvetica', 'italic');
          y = addTextWithWrap('Não informado', 20, y, pageWidth - 40, 10, secondaryColor) + 10;
        }

        return y;
      };

      // Cabeçalho com logo da empresa
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 60, 'F');

      // Logo da empresa (imagem real)
      const logoWidth = 40;
      const logoHeight = 30;
      const logoX = 20;
      const logoY = 15;
      
      // Adicionar a imagem do logo
      try {
        doc.addImage(logoImage, 'PNG', logoX, logoY, logoWidth, logoHeight);
        console.log('✅ Logo adicionado com sucesso');
      } catch (error) {
        console.warn('⚠️ Erro ao adicionar logo, usando fallback:', error);
        // Fallback: círculo com inicial se a imagem falhar
        doc.setFillColor(255, 255, 255);
        doc.circle(logoX + logoWidth/2, logoY + logoHeight/2, Math.min(logoWidth, logoHeight)/2, 'F');
        
        doc.setFontSize(16);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        const companyInitial = relatorio.pdl.charAt(0).toUpperCase();
        doc.text(companyInitial, logoX + logoWidth/2, logoY + logoHeight/2 + 2, { align: 'center' });
      }

      // Título do relatório
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE AVALIAÇÃO PDL', logoX + logoWidth + 20, 25);

      // Subtítulo
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema IC2 Evolutiva', logoX + logoWidth + 20, 35);

      // Data de geração
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 80, 50);

      yPosition = 80;

      // Informações básicas
      doc.setFillColor(248, 249, 250);
      doc.rect(20, yPosition, pageWidth - 40, 40, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMAÇÕES BÁSICAS', 25, yPosition + 10);

      doc.setFontSize(10);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(`PDL: ${relatorio.pdl}`, 25, yPosition + 20);
      doc.text(`Data do Treinamento: ${formatDate(relatorio.data_treinamento)}`, 25, yPosition + 28);
      doc.text(`Tema do Dia: ${relatorio.tema_dia}`, 25, yPosition + 36);

      yPosition += 50;

      // Seção: Aprendizados e Compromissos
      yPosition = addSection('APRENDIZADOS E COMPROMISSOS', '', yPosition);
      yPosition = addSection('Principais Aprendizados:', relatorio.principais_aprendizados, yPosition);
      yPosition = addSection('Compromissos, Objetivos e Metas:', relatorio.compromissos, yPosition);

      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      // Seção: Ações e Resultados
      yPosition = addSection('AÇÕES E RESULTADOS', '', yPosition);
      
      if (relatorio.feedback_acoes_realizadas) {
        yPosition = addSection('Feedback das Ações Realizadas:', relatorio.feedback_acoes_realizadas, yPosition);
      }
      
      if (relatorio.acoes_nao_realizadas) {
        yPosition = addSection('Ações Não Realizadas:', relatorio.acoes_nao_realizadas, yPosition);
      }
      
      if (relatorio.justificativa_nao_realizadas) {
        yPosition = addSection('Justificativa das Ações Não Realizadas:', relatorio.justificativa_nao_realizadas, yPosition);
      }
      
      if (relatorio.impacto_atividade_realizada) {
        yPosition = addSection('Impacto das Atividades Realizadas:', relatorio.impacto_atividade_realizada, yPosition);
      }
      
      if (relatorio.impacto_atividade_nao_realizada) {
        yPosition = addSection('Impacto das Atividades Não Realizadas:', relatorio.impacto_atividade_nao_realizada, yPosition);
      }
      
      if (relatorio.observacoes_aprendizados) {
        yPosition = addSection('Observações e Aprendizados:', relatorio.observacoes_aprendizados, yPosition);
      }

      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      // Seção: Avaliação
      yPosition = addSection('AVALIAÇÃO', '', yPosition);
      
      if (relatorio.nota_recomendacao) {
        doc.setFontSize(12);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('Nota de Recomendação:', 20, yPosition);
        
        doc.setFontSize(16);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`${relatorio.nota_recomendacao}/10`, 20, yPosition + 10);
        yPosition += 20;
      }
      
      if (relatorio.feedback_geral) {
        yPosition = addSection('Feedback Geral:', relatorio.feedback_geral, yPosition);
      }

      // Rodapé
      const footerY = pageHeight - 20;
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Sistema IC2 Evolutiva - Relatório de Avaliação PDL', pageWidth/2, footerY, { align: 'center' });

      console.log('✅ PDF gerado com sucesso, iniciando download...');

      // Baixar o PDF
      const fileName = `relatorio-pdl-${relatorio.pdl.toLowerCase().replace(/\s+/g, '-')}-${formatDate(relatorio.data_treinamento).replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

      console.log('✅ Download do PDF concluído:', fileName);

      setSnackbar({
        open: true,
        message: 'Relatório PDF baixado com sucesso!',
        severity: 'success'
      });

    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao gerar PDF. Tente novamente.',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box>
        <ResponsiveAppBar />
        <Container sx={{ py: 4 }}>
          <Typography>Carregando relatórios...</Typography>
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
            📊 Relatórios
          </Typography>

          {/* Resumo dos Relatórios */}
          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" color="text.primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                📈 Resumo dos Relatórios
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {relatorios.length}
                    </Typography>
                    <Typography variant="body2">
                      Total de Relatórios
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {relatorios.filter(r => getStatusRelatorio(r) === 'pendente').length}
                    </Typography>
                    <Typography variant="body2">
                      Pendentes
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {relatorios.filter(r => getStatusRelatorio(r) === 'concluido').length}
                    </Typography>
                    <Typography variant="body2">
                      Concluídos
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Lista de Relatórios */}
          {relatorios.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body1">
                <strong>Nenhum relatório encontrado.</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Faça suas primeiras avaliações para gerar relatórios aqui.
              </Typography>
            </Alert>
          ) : (
            <Stack spacing={2}>
              {relatorios.map((relatorio) => {
                const status = getStatusRelatorio(relatorio);
                return (
                  <Accordion key={relatorio.id} sx={{ borderRadius: 2 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'grey.50'
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                        <Assessment sx={{ color: 'primary.main' }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {relatorio.tema_dia}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            PDL: {relatorio.pdl} • {formatDate(relatorio.data_treinamento)}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            icon={getStatusIcon(status)}
                            label={getStatusLabel(status)}
                            color={getStatusColor(status)}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                          <Box
                            component="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(relatorio);
                            }}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              padding: '6px 12px',
                              border: '1px solid',
                              borderColor: 'primary.main',
                              borderRadius: 1,
                              backgroundColor: 'transparent',
                              color: 'primary.main',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                              textTransform: 'none',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'primary.contrastText'
                              },
                              '&:focus': {
                                outline: '2px solid',
                                outlineColor: 'primary.main',
                                outlineOffset: '2px'
                              }
                            }}
                          >
                            <Download sx={{ fontSize: 16 }} />
                            PDF
                          </Box>
                        </Stack>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={3}>
                        {/* Aprendizados e Compromissos */}
                        <Box>
                          <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                            📚 Aprendizados e Compromissos
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Principais Aprendizados:
                              </Typography>
                              <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="body2">
                                  {relatorio.principais_aprendizados || 'Não informado'}
                                </Typography>
                              </Paper>
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Compromissos, Objetivos e Metas:
                              </Typography>
                              <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="body2">
                                  {relatorio.compromissos || 'Não informado'}
                                </Typography>
                              </Paper>
                            </Box>
                          </Stack>
                        </Box>

                        <Divider />

                        {/* Ações e Resultados */}
                        <Box>
                          <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                            ✍️ Ações e Resultados
                          </Typography>
                          <Stack spacing={2}>
                            {relatorio.feedback_acoes_realizadas && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Feedback das Ações Realizadas:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                  <Typography variant="body2">
                                    {relatorio.feedback_acoes_realizadas}
                                  </Typography>
                                </Paper>
                              </Box>
                            )}
                            {relatorio.acoes_nao_realizadas && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Ações Não Realizadas:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                  <Typography variant="body2">
                                    {relatorio.acoes_nao_realizadas}
                                  </Typography>
                                </Paper>
                              </Box>
                            )}
                            {relatorio.justificativa_nao_realizadas && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Justificativa das Ações Não Realizadas:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                  <Typography variant="body2">
                                    {relatorio.justificativa_nao_realizadas}
                                  </Typography>
                                </Paper>
                              </Box>
                            )}
                            {relatorio.impacto_atividade_realizada && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Impacto das Atividades Realizadas:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                  <Typography variant="body2">
                                    {relatorio.impacto_atividade_realizada}
                                  </Typography>
                                </Paper>
                              </Box>
                            )}
                            {relatorio.impacto_atividade_nao_realizada && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Impacto das Atividades Não Realizadas:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                  <Typography variant="body2">
                                    {relatorio.impacto_atividade_nao_realizada}
                                  </Typography>
                                </Paper>
                              </Box>
                            )}
                            {relatorio.observacoes_aprendizados && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Observações e Aprendizados:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                  <Typography variant="body2">
                                    {relatorio.observacoes_aprendizados}
                                  </Typography>
                                </Paper>
                              </Box>
                            )}
                          </Stack>
                        </Box>

                        <Divider />

                        {/* Avaliação */}
                        <Box>
                          <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                            ⭐ Avaliação
                          </Typography>
                          <Stack spacing={2}>
                            {relatorio.nota_recomendacao && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Nota de Recomendação:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                    {relatorio.nota_recomendacao}/10
                                  </Typography>
                                </Paper>
                              </Box>
                            )}
                            {relatorio.feedback_geral && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Feedback Geral:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                  <Typography variant="body2">
                                    {relatorio.feedback_geral}
                                  </Typography>
                                </Paper>
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          )}
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
