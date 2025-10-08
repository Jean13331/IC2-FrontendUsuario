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
  TextField,
  Alert,
  Divider,
  Snackbar,
  Paper,
  Chip
} from '@mui/material';
import { 
  ArrowBack, 
  Send,
  Assignment,
  CheckCircle,
  Event,
  School,
  Business,
  Pending
} from '@mui/icons-material';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import api from '../services/api';

interface AvaliacaoInfo {
  id: number;
  pdlId: number;
  pdlName: string;
  temaDia: string;
  dataTreinamento: string;
  principaisAprendizados: string;
  compromissos: string;
  companyName: string;
  selectedAt: string;
  isEdit?: boolean;
  existingData?: {
    feedback_acoes_realizadas: string;
    acoes_nao_realizadas: string;
    justificativa_nao_realizadas: string;
    impacto_atividade_realizada: string;
    observacoes_aprendizados: string;
  };
}

export default function AcoesResultados() {
  const navigate = useNavigate();
  const [avaliacaoInfo, setAvaliacaoInfo] = useState<AvaliacaoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Campos do formulário
  const [formData, setFormData] = useState({
    feedback_acoes_realizadas: '',
    acoes_nao_realizadas: '',
    justificativa_nao_realizadas: '',
    impacto_atividade_realizada: '',
    observacoes_aprendizados: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar informações da avaliação do localStorage
        const raw = localStorage.getItem('ic2.selectedAvaliacao');
        if (raw) {
          const info = JSON.parse(raw) as AvaliacaoInfo;
          setAvaliacaoInfo(info);
          
          // Se for uma edição, carregar os dados existentes no formulário
          if (info.isEdit && info.existingData) {
            setFormData({
              feedback_acoes_realizadas: info.existingData.feedback_acoes_realizadas,
              acoes_nao_realizadas: info.existingData.acoes_nao_realizadas,
              justificativa_nao_realizadas: info.existingData.justificativa_nao_realizadas,
              impacto_atividade_realizada: info.existingData.impacto_atividade_realizada,
              observacoes_aprendizados: info.existingData.observacoes_aprendizados
            });
          }
        } else {
          // Se não há informações, redirecionar para ações realizadas
          navigate('/acoes-realizadas');
          return;
        }

        // Verificar se o token está presente
        const token = localStorage.getItem('ic2.token');
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
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar informações da avaliação.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!avaliacaoInfo) return;

    setSaving(true);
    try {
      const response = await api.put(`/api/pdl-evaluation/resultado/${avaliacaoInfo.id}`, {
        feedback_acoes_realizadas: formData.feedback_acoes_realizadas,
        acoes_nao_realizadas: formData.acoes_nao_realizadas,
        justificativa_nao_realizadas: formData.justificativa_nao_realizadas,
        impacto_atividade_realizada: formData.impacto_atividade_realizada,
        observacoes_aprendizados: formData.observacoes_aprendizados
      });

      console.log('✅ Resposta da API:', response.data);

      setSnackbar({
        open: true,
        message: avaliacaoInfo?.isEdit ? 'Ações e resultados atualizados com sucesso!' : 'Ações e resultados salvos com sucesso!',
        severity: 'success'
      });

      // Redirecionar para a tela de detalhes do PDL (com todas as funcionalidades) após sucesso
      setTimeout(() => {
        // Usar slug amigável baseado no nome do PDL
        const pdlSlug = avaliacaoInfo.pdlName 
          ? avaliacaoInfo.pdlName.toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .replace(/\s+/g, '-')
              .trim()
          : `pdl-${avaliacaoInfo.pdlId}`;
        
        const companySlug = avaliacaoInfo.companyName 
          ? avaliacaoInfo.companyName.toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .replace(/\s+/g, '-')
              .trim()
          : 'empresa';
        
        navigate(`/empresa/${companySlug}/pdl/${pdlSlug}`);
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar ações e resultados. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (!avaliacaoInfo) {
      navigate('/acoes-realizadas');
      return;
    }
    
    // Usar slug amigável baseado no nome do PDL
    const pdlSlug = avaliacaoInfo.pdlName 
      ? avaliacaoInfo.pdlName.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim()
      : `pdl-${avaliacaoInfo.pdlId}`;
    
    const companySlug = avaliacaoInfo.companyName 
      ? avaliacaoInfo.companyName.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim()
      : 'empresa';
    
    navigate(`/empresa/${companySlug}/pdl/${pdlSlug}`);
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

  const getStatusAvaliacao = () => {
    if (!avaliacaoInfo) return 'pendente';
    
    // Verificar se pelo menos 2 campos de resultado estão preenchidos
    const camposResultado = [
      formData.feedback_acoes_realizadas,
      formData.acoes_nao_realizadas,
      formData.justificativa_nao_realizadas,
      formData.impacto_atividade_realizada,
      formData.observacoes_aprendizados
    ];
    
    const camposPreenchidos = camposResultado.filter(campo => 
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

  // Atualizar status em tempo real conforme o usuário preenche os campos
  const currentStatus = getStatusAvaliacao();

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

  if (!avaliacaoInfo) {
    return (
      <Box>
        <ResponsiveAppBar />
        <Container sx={{ py: 4 }}>
          <Alert severity="error">
            Informações da avaliação não encontradas.
          </Alert>
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
            {avaliacaoInfo?.isEdit ? 'Editar Ações e Resultados' : 'Ações e Resultados'}
          </Typography>
          
          {/* Nome do PDL e Status */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                color: 'primary.main',
                fontSize: { xs: '1.2rem', sm: '1.5rem' }
              }}
            >
              {avaliacaoInfo.pdlName}
            </Typography>
            
            <Chip
              icon={getStatusIcon(currentStatus)}
              label={getStatusLabel(currentStatus)}
              color={getStatusColor(currentStatus)}
              size="medium"
              sx={{ fontWeight: 'bold' }}
            />
          </Stack>

          {/* Informações da Avaliação */}
          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" color="text.primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                📋 Informações da Avaliação
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <School sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>Tema:</strong> {avaliacaoInfo.temaDia}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Event sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>Data do Treinamento:</strong> {formatDate(avaliacaoInfo.dataTreinamento)}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Business sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>PDL:</strong> {avaliacaoInfo.pdlName}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* O que o usuário já preencheu */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="text.primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                📝 O que você já preencheu
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Principais Aprendizados:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2">
                      {avaliacaoInfo.principaisAprendizados || 'Nenhum aprendizado registrado'}
                    </Typography>
                  </Paper>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Compromissos, Objetivos e Metas:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2">
                      {avaliacaoInfo.compromissos || 'Nenhum compromisso registrado'}
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Formulário de Ações e Resultados */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="text.primary" sx={{ mb: 3, fontWeight: 'bold' }}>
                {avaliacaoInfo?.isEdit ? '✏️ Editar Ações e Resultados' : '✍️ Preencher Ações e Resultados'}
              </Typography>
              
              <Stack spacing={3}>
                <TextField
                  label="Feedback das Ações Realizadas"
                  multiline
                  rows={4}
                  value={formData.feedback_acoes_realizadas}
                  onChange={(e) => handleInputChange('feedback_acoes_realizadas', e.target.value)}
                  placeholder="Descreva o feedback das ações que foram implementadas"
                  fullWidth
                  variant="outlined"
                />

                <TextField
                  label="Ações Não Realizadas"
                  multiline
                  rows={3}
                  value={formData.acoes_nao_realizadas}
                  onChange={(e) => handleInputChange('acoes_nao_realizadas', e.target.value)}
                  placeholder="Descreva as ações que não foram implementadas"
                  fullWidth
                  variant="outlined"
                />

                <TextField
                  label="Justificativa das Ações Não Realizadas"
                  multiline
                  rows={3}
                  value={formData.justificativa_nao_realizadas}
                  onChange={(e) => handleInputChange('justificativa_nao_realizadas', e.target.value)}
                  placeholder="Justifique por que essas ações não foram implementadas"
                  fullWidth
                  variant="outlined"
                />

                <TextField
                  label="Impacto das Atividades Realizadas"
                  multiline
                  rows={3}
                  value={formData.impacto_atividade_realizada}
                  onChange={(e) => handleInputChange('impacto_atividade_realizada', e.target.value)}
                  placeholder="Descreva o impacto das atividades que foram realizadas"
                  fullWidth
                  variant="outlined"
                />

                <TextField
                  label="Observações e Aprendizados"
                  multiline
                  rows={3}
                  value={formData.observacoes_aprendizados}
                  onChange={(e) => handleInputChange('observacoes_aprendizados', e.target.value)}
                  placeholder="Adicione observações e aprendizados adicionais"
                  fullWidth
                  variant="outlined"
                />
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={saving}
                >
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleSubmit}
                  disabled={saving}
                  sx={{ minWidth: 120 }}
                >
                  {saving ? 'Salvando...' : (avaliacaoInfo?.isEdit ? 'Atualizar' : 'Salvar')}
                </Button>
              </Stack>
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
