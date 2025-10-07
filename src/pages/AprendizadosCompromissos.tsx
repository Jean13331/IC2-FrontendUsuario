import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Alert,
  Divider,
  Snackbar
} from '@mui/material';
import {
  ArrowBack,
  Cancel,
  Send,
  Event,
  School,
  Assignment,
  Star,
  Message
} from '@mui/icons-material';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import { createPdlAvaliacao, PdlAvaliacao } from '../services/pdlEvaluation';

interface PdlInfo {
  id: number;
  name: string;
  companyName: string;
  selectedAt: string;
}

export default function AprendizadosCompromissos() {
  const navigate = useNavigate();
  const [pdlInfo, setPdlInfo] = useState<PdlInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados do formulário
  const [dataTreinamento, setDataTreinamento] = useState('');
  const [temaTreinamento, setTemaTreinamento] = useState('');
  const [principaisAprendizados, setPrincipaisAprendizados] = useState('');
  const [compromissos, setCompromissos] = useState('');
  const [avaliacao, setAvaliacao] = useState(5);
  const [mensagemFinal, setMensagemFinal] = useState('');
  const [salvando, setSalvando] = useState(false);
  
  // Estados para notificações
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    // Carregar informações do PDL do localStorage
    const raw = localStorage.getItem('ic2.selectedPdl');
    if (raw) {
      try {
        const info = JSON.parse(raw) as PdlInfo;
        setPdlInfo(info);
      } catch (error) {
        console.error('Erro ao carregar informações do PDL:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleBack = () => {
    navigate(-1); // Volta para a página anterior
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    showNotification('Operação cancelada. As alterações não foram salvas.', 'info');
    setTimeout(() => {
      navigate(-1); // Volta para a página anterior
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!pdlInfo) {
      showNotification('Erro: PDL não encontrado', 'error');
      return;
    }

    // Validação dos campos obrigatórios (avaliação e mensagem final são opcionais)
    if (!dataTreinamento || !temaTreinamento || !principaisAprendizados || !compromissos) {
      showNotification('Por favor, preencha todos os campos obrigatórios: Data do Treinamento, Tema do Treinamento, Principais Aprendizados e Compromissos', 'warning');
      return;
    }

    setSalvando(true);
    try {
      const avaliacaoData: PdlAvaliacao = {
        pdl_id: pdlInfo.id,
        data_treinamento: dataTreinamento,
        tema_dia: temaTreinamento,
        principais_aprendizados: principaisAprendizados,
        compromissos: compromissos,
        nota_recomendacao: avaliacao > 0 ? avaliacao : undefined, // Opcional
        feedback_geral: mensagemFinal.trim() || undefined // Opcional
      };

      console.log('Enviando avaliação:', avaliacaoData);
      
      const response = await createPdlAvaliacao(avaliacaoData);
      console.log('Resposta da API:', response);
      
      showNotification('🎉 Avaliação enviada com sucesso!', 'success');
      setTimeout(() => {
        navigate(-1); // Volta para a página anterior
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error);
      
      if (error.response?.status === 400) {
        showNotification(`Erro de validação: ${error.response.data?.error || 'Dados inválidos'}`, 'error');
      } else if (error.response?.status === 401) {
        // O interceptor já redireciona para login, não precisa fazer nada aqui
        console.log('Token expirado, redirecionando para login...');
      } else {
        showNotification('Erro ao enviar a avaliação. Tente novamente.', 'error');
      }
    } finally {
      setSalvando(false);
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
            Voltar
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <ResponsiveAppBar />
      <Container sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Cabeçalho */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBack />}
              onClick={handleBack}
              size="small"
            >
              Voltar
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Avaliação do Treinamento
            </Typography>
          </Stack>

          {/* Informações do PDL */}
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {pdlInfo.name}
                </Typography>
                <Chip label="Ativo" color="primary" size="small" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {pdlInfo.companyName}
              </Typography>
            </CardContent>
          </Card>

          {/* Formulário de Avaliação */}
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={4}>
                {/* Aprendizados */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <School sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Aprendizados
                    </Typography>
                  </Stack>
                  
                  <Stack spacing={3}>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Event sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Quando foi o treinamento?
                        </Typography>
                      </Stack>
                      <TextField
                        fullWidth
                        type="date"
                        value={dataTreinamento}
                        onChange={(e) => setDataTreinamento(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Qual foi o tema do treinamento?
                      </Typography>
                      <TextField
                        fullWidth
                        value={temaTreinamento}
                        onChange={(e) => setTemaTreinamento(e.target.value)}
                        placeholder="Ex: Liderança Situacional, Gestão de Conflitos, Desenvolvimento de Equipes, Comunicação Estratégica"
                        multiline
                        rows={2}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Principais aprendizados do dia
                      </Typography>
                      <TextField
                        fullWidth
                        value={principaisAprendizados}
                        onChange={(e) => setPrincipaisAprendizados(e.target.value)}
                        placeholder="Ex: Aprendi sobre os diferentes estilos de liderança e quando aplicar cada um, técnicas de feedback construtivo, como motivar equipes em momentos difíceis"
                        multiline
                        rows={4}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                {/* Compromissos */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Assignment sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Compromissos, Objetivos e Metas
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    value={compromissos}
                    onChange={(e) => setCompromissos(e.target.value)}
                    placeholder="Ex: Vou implementar reuniões semanais de feedback com minha equipe, aplicar os princípios de liderança situacional no dia a dia"
                    multiline
                    rows={4}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>

                <Divider />

                {/* Avaliação */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Star sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Avaliação
                    </Typography>
                  </Stack>
                  <Box>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                      De 0 a 10, o quanto você indicaria para um amigo ou familiar?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      0 = Não indico | 10 = Indicaria muito
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      gap: 1,
                      mb: 3,
                      flexWrap: 'wrap'
                    }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <Box
                          key={num}
                          onClick={() => setAvaliacao(num)}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            backgroundColor: avaliacao >= num ? 'primary.main' : 'grey.300',
                            color: avaliacao >= num ? 'white' : 'text.secondary',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: 2
                            }
                          }}
                        >
                          {num}
                        </Box>
                      ))}
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        textAlign: 'center', 
                        color: 'primary.main',
                        fontWeight: 'bold'
                      }}
                    >
                      Nota: {avaliacao}/10
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Mensagem Final */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Message sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Mensagem Final
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    value={mensagemFinal}
                    onChange={(e) => setMensagemFinal(e.target.value)}
                    placeholder="Compartilhe sua experiência, sugestões de melhoria, elogios ao instrutor ou à metodologia..."
                    multiline
                    rows={4}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>

                {/* Botões de Ação */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={salvando}
                    sx={{ flex: 1 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleSubmit}
                    disabled={salvando}
                    sx={{ flex: 1 }}
                  >
                    {salvando ? 'Enviando...' : 'Enviar Avaliação'}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
      
      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
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
