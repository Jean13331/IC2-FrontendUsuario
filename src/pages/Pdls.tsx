import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Chip, Container, Divider, Stack, Typography, Grid, Button } from '@mui/material';
import { Pdl, listCompanyPdls } from '../services/pdl';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import { useNavigate } from 'react-router-dom';

export default function Pdls() {
  const [pdls, setPdls] = useState<Pdl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('ic2.session');
    const session = raw ? JSON.parse(raw) as { companyId?: number; companyName?: string } : {};
    const companyId = session.companyId;
    const companyName = session.companyName;
    
    if (!companyId) {
      setError('Empresa não definida. Volte ao login.');
      return;
    }
    
    setCompanyName(companyName || 'Empresa');
    
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await listCompanyPdls(companyId);
        setPdls(items);
      } catch (e: any) {
        setError('Falha ao carregar PDLs.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  const handlePdlClick = (pdlId: number, pdlName: string) => {
    // Criar slug amigável para o nome do PDL
    const pdlSlug = pdlName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
    
    // Criar slug amigável para o nome da empresa
    const companySlug = companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
    
    // Salvar informações do PDL selecionado no localStorage
    const pdlInfo = {
      id: pdlId,
      name: pdlName,
      companyName: companyName,
      selectedAt: new Date().toISOString()
    };
    localStorage.setItem('ic2.selectedPdl', JSON.stringify(pdlInfo));
    
    // Navegar para a página do PDL com URL amigável
    navigate(`/empresa/${companySlug}/pdl/${pdlSlug}`);
  };

  return (
    <Box>
      <ResponsiveAppBar />
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          PDLs da {companyName}
        </Typography>
        {loading && <Typography>Carregando...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        <Grid container spacing={2}>
          {pdls.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.id_pdl}>
              <Button
                onClick={() => handlePdlClick(p.id_pdl, p.pdl_nome)}
                sx={{
                  width: '100%',
                  height: '100%',
                  p: 0,
                  textAlign: 'left',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Card 
                  variant="outlined" 
                  sx={{ 
                    width: '100%',
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {p.pdl_nome}
                      </Typography>
                      <Chip 
                        label={p.finalizado_em ? 'Finalizado' : 'Ativo'} 
                        color={p.finalizado_em ? 'default' : 'primary'} 
                        size="small" 
                      />
                    </Stack>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Data de Início:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {formatDate(p.pdl_criado_em)}
                        </Typography>
                      </Box>
                      
                      {p.finalizado_em && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            Data de Finalização:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {formatDate(p.finalizado_em)}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Button>
            </Grid>
          ))}
        </Grid>
        {!loading && !error && pdls.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Nenhum PDL disponível para esta empresa.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}


