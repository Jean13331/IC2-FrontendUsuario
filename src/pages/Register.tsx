import { useEffect, useState } from 'react';
import { Box, Button, Container, Paper, Stack, TextField, Typography, IconButton, InputAdornment, Drawer, List, ListItem, ListItemText, FormControl, InputLabel, Select, MenuItem, Autocomplete, Alert, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '../services/auth';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { listCompanies, Company } from '../services/companies';
import logoImage from '../icon/FDL_logotipo 9.png';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [companyDrawerOpen, setCompanyDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [states, setStates] = useState<Array<{ id: number; sigla: string; nome: string }>>([]);
  const [cities, setCities] = useState<Array<{ id: number; nome: string }>>([]);
  const [selectedUf, setSelectedUf] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then((r) => r.json())
      .then((data) => setStates(data.sort((a: any, b: any) => a.nome.localeCompare(b.nome))))
      .catch(() => setStates([]));
  }, []);

  // Lazy load cities when a state is selected
  useEffect(() => {
    if (!selectedUf) {
      setCities([]);
      setSelectedCity('');
      return;
    }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then((r) => r.json())
      .then((data) => setCities(data.sort((a: any, b: any) => a.nome.localeCompare(b.nome))))
      .catch(() => setCities([]));
  }, [selectedUf]);

  const formatPhoneBR = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  };
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [companiesQuery, setCompaniesQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setCompaniesLoading(true);
        setCompaniesError(null);
        const items = await listCompanies();
        setCompanies(items.filter((c) => c.ativo !== false));
      } catch {
        setCompaniesError('Falha ao carregar empresas.');
      } finally {
        setCompaniesLoading(false);
      }
    })();
  }, []);
  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        minHeight: '100dvh', // Dynamic viewport height para mobile
        height: 'auto',
        background: 'linear-gradient(180deg, #f9fbfd 0%, #f1f5f9 100%)',
        flexDirection: 'column',
        gap: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 4 }, // Padding vertical para espaçamento
        px: { xs: 1, sm: 2 }, // Padding horizontal para evitar overflow
      }}
    >
        <Box sx={{ textAlign: 'center', mt: { xs: 1, sm: 2 } }}>
          <Box
            component="img"
            src={logoImage}
            alt="Fábrica de Líderes"
            sx={{
              width: { xs: '320px', sm: '400px', md: '480px' },
              height: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
              mb: 3
            }}
          />
          <Divider sx={{ 
            mt: 2, 
            mx: 'auto', 
            width: { xs: 'clamp(80px, 20vw, 100px)', sm: 'clamp(100px, 25vw, 120px)' }, 
            borderColor: 'secondary.main', 
            opacity: 0.6 
          }} />
        </Box>
      <Paper elevation={6} sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        borderRadius: 3, 
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <Typography 
          variant="h5" 
          component="h1" 
          color="primary" 
          sx={{ 
            mb: 2, 
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
          }}
        >
          Criar conta
        </Typography>
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          try {
            setLoading(true);
            
            if (!selectedCompany || !selectedCompany.id) {
              setError('Selecione uma empresa válida.');
              setLoading(false);
              return;
            }
            
            const form = new FormData(e.currentTarget as HTMLFormElement);
            const nome = String(form.get('name') || '');
            const email = String(form.get('email') || '');
            const senha = String(form.get('password') || '');
            const confirmSenha = String(form.get('confirm') || '');
            const telefone = phone || '';
            
            // Validação mais flexível - apenas campos essenciais
            if (!nome || !email || !senha) {
              const missingFields = [];
              if (!nome) missingFields.push('Nome');
              if (!email) missingFields.push('E-mail');
              if (!senha) missingFields.push('Senha');
              
              setError(`Preencha os campos obrigatórios: ${missingFields.join(', ')}`);
              setLoading(false);
              return;
            }
            
            // Aviso se campos opcionais não estão preenchidos
            if (!telefone || !selectedUf || !selectedCity) {
              console.warn('⚠️ Campos opcionais não preenchidos:', {
                telefone: !telefone ? 'vazio' : 'ok',
                selectedUf: !selectedUf ? 'vazio' : 'ok',
                selectedCity: !selectedCity ? 'vazio' : 'ok'
              });
            }
            
            if (senha !== confirmSenha) {
              setError('As senhas não coincidem.');
              setLoading(false);
              return;
            }
            
            const registerData = {
              nome,
              email,
              senha,
              telefone,
              cidade: selectedCity || '',
              estado: selectedUf || '',
              empresa_id: selectedCompany.id
            };
            
            console.log('📤 Dados de registro sendo enviados:', registerData);
            console.log('🏢 Empresa selecionada:', selectedCompany);
            console.log('📋 Validação de campos:');
            console.log('- Nome:', nome);
            console.log('- Email:', email);
            console.log('- Senha:', senha ? '***' : 'VAZIO');
            console.log('- Telefone:', telefone);
            console.log('- Cidade:', selectedCity);
            console.log('- Estado:', selectedUf);
            console.log('- Empresa ID:', selectedCompany?.id);
            
            const result = await registerApi(registerData);
            
            setError(null);
            
            // Verificar se foi reativação ou novo registro
            const isReactivation = result.message?.includes('reativado');
            const redirectParam = isReactivation ? 'reactivated=true' : 'registered=true';
            
            // Redirecionar para login após registro/reativação bem-sucedido
            navigate(`/login?${redirectParam}`);
          } catch (err: any) {
            console.error('❌ Erro no registro:', err);
            console.error('❌ Erro response:', err?.response);
            console.error('❌ Erro data:', err?.response?.data);
            console.error('❌ Erro status:', err?.response?.status);
            console.error('❌ Erro config:', err?.config);
            
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'Erro ao registrar usuário.';
            setError(errorMessage);
          } finally {
            setLoading(false);
          }
        }}>
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            <Button 
              variant="outlined" 
              onClick={() => setCompanyDrawerOpen(true)}
              sx={{ 
                minHeight: { xs: '48px', sm: '56px' },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                textAlign: 'left',
                justifyContent: 'flex-start',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {selectedCompany ? `Empresa: ${selectedCompany.name}` : 'Selecionar empresa'}
            </Button>
            <TextField 
              name="name" 
              label="Nome completo" 
              fullWidth 
              required
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: { xs: '16px', sm: '16px' } // Previne zoom no iOS
                }
              }}
            />
            <TextField 
              name="email" 
              label="E-mail" 
              type="email" 
              fullWidth 
              required
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: { xs: '16px', sm: '16px' } // Previne zoom no iOS
                }
              }}
            />
            <TextField
              name="phone"
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(formatPhoneBR(e.target.value))}
              inputMode="numeric"
              fullWidth
              required
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: { xs: '16px', sm: '16px' } // Previne zoom no iOS
                }
              }}
            />
            <FormControl fullWidth required>
              <InputLabel id="uf-label">Estado</InputLabel>
              <Select
                labelId="uf-label"
                label="Estado"
                value={selectedUf}
                onChange={(e) => setSelectedUf(String(e.target.value))}
              >
                {states.map((s) => (
                  <MenuItem key={s.id} value={s.sigla}>
                    {s.nome} ({s.sigla})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Autocomplete
              options={cities}
              getOptionLabel={(option) => option.nome}
              disabled={!selectedUf}
              onChange={(_, value) => setSelectedCity(value ? value.nome : '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cidade"
                  placeholder={selectedUf ? 'Digite para buscar' : 'Escolha o estado primeiro'}
                  required
                  helperText={!selectedUf ? 'Selecione um estado para carregar as cidades' : undefined}
                />
              )}
            />
            <TextField
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: { xs: '16px', sm: '16px' } // Previne zoom no iOS
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="confirm"
              label="Confirmar senha"
              type={showConfirm ? 'text' : 'password'}
              fullWidth
              required
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: { xs: '16px', sm: '16px' } // Previne zoom no iOS
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowConfirm((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              disabled={loading}
              sx={{ 
                minHeight: { xs: '48px', sm: '56px' },
                fontSize: { xs: '1rem', sm: '1.125rem' }
              }}
            >
              Registrar
            </Button>
            <Button 
              href="/login" 
              variant="text"
              sx={{ 
                minHeight: { xs: '48px', sm: '56px' },
                fontSize: { xs: '1rem', sm: '1.125rem' }
              }}
            >
              Voltar ao login
            </Button>
          </Stack>
        </Box>
      </Paper>
      <Drawer
        anchor="right"
        open={companyDrawerOpen}
        onClose={() => setCompanyDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ width: { xs: 300, sm: 360 }, p: 2 }} role="presentation">
          <Typography variant="h6" sx={{ mb: 2 }}>
            Escolher empresa
          </Typography>
          <TextField
            size="small"
            placeholder="Buscar empresa"
            value={companiesQuery}
            onChange={(e) => setCompaniesQuery(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          {companiesLoading && (
            <Typography variant="body2" sx={{ mb: 1 }}>Carregando...</Typography>
          )}
          {companiesError && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>{companiesError}</Typography>
          )}
          <List>
            {companies
              .filter((c) =>
                companiesQuery
                  ? c.name.toLowerCase().includes(companiesQuery.toLowerCase()) ||
                    (c.cidade || '').toLowerCase().includes(companiesQuery.toLowerCase())
                  : true
              )
              .map((c) => (
                <ListItem key={c.id} disablePadding>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => { setSelectedCompany(c); setCompanyDrawerOpen(false); }}
                  >
                    {c.name}
                  </Button>
                </ListItem>
              ))}
          </List>
          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={() => setCompanyDrawerOpen(false)}>Fechar</Button>
            <Button variant="contained" disabled={!selectedCompany}>Confirmar</Button>
          </Stack>
        </Box>
      </Drawer>
    </Container>
  );
}



