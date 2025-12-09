import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Link,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/auth';
import { listCompanies, Company } from '../services/companies';
import logoImage from '../icon/FDL_logotipo 9.png';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [companyDrawerOpen, setCompanyDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [companiesQuery, setCompaniesQuery] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [reactivationSuccess, setReactivationSuccess] = useState(false);
  const REMEMBER_KEY = 'ic2.remember.v1';

  const encode = (text: string) => {
    try { return btoa(unescape(encodeURIComponent(text))); } catch { return ''; }
  };
  const decode = (text: string) => {
    try { return decodeURIComponent(escape(atob(text))); } catch { return ''; }
  };
  const saveRemember = (userEmail: string, company: Company | null, days = 30) => {
    try {
      const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
      const payload = {
        emailEnc: encode(userEmail),
        company: company ? { id: company.id, name: company.name } : null,
        expiresAt,
      };
      localStorage.setItem(REMEMBER_KEY, JSON.stringify(payload));
    } catch {}
  };
  const clearRemember = () => {
    try { localStorage.removeItem(REMEMBER_KEY); } catch {}
  };

  // Bloqueia scroll enquanto a tela de login está ativa
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const loadCompanies = async () => {
    try {
      setCompaniesLoading(true);
      setCompaniesError(null);
      const items = await listCompanies();
      setCompanies(items.filter((c) => c.ativo !== false));
    } catch (e: any) {
      setCompaniesError('Falha ao carregar empresas. Verifique a API.');
      setCompanies([]);
    } finally {
      setCompaniesLoading(false);
    }
  };
  useEffect(() => {
    loadCompanies();
  }, []);

  // Carrega dados salvos (lembrar de mim)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REMEMBER_KEY);
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (payload?.expiresAt && Date.now() < Number(payload.expiresAt)) {
        setRememberMe(true);
        setEmail(decode(payload.emailEnc || ''));
        if (payload.company) setSelectedCompany(payload.company as Company);
      } else {
        clearRemember();
      }
    } catch {}
  }, []);

  // Verifica se veio do registro ou reativação
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
      setRegistrationSuccess(true);
      // Remove o parâmetro da URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('reactivated') === 'true') {
      setReactivationSuccess(true);
      // Remove o parâmetro da URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const formEmail = String(data.get('email') || email);
    const formPassword = String(data.get('password') || password);
    setError(null);
    if (!selectedCompany) {
      setError('Selecione uma empresa.');
      return;
    }
    if (!formEmail || !formPassword) {
      setError('Preencha e-mail e senha.');
      return;
    }
    try {
      setLoading(true);
      const result = await loginApi(formEmail, formPassword, selectedCompany?.id);
      console.log('Resultado do login:', result);
      
      // Salvar token de autenticação
      if (result.token) {
        localStorage.setItem('ic2.token', result.token);
        console.log('Token salvo:', result.token.substring(0, 50) + '...');
      } else if (result.data?.token) {
        localStorage.setItem('ic2.token', result.data.token);
        console.log('Token (data) salvo:', result.data.token.substring(0, 50) + '...');
      } else {
        console.error('Nenhum token encontrado na resposta:', result);
        alert('Erro: Token não recebido do servidor');
        return;
      }
      
      // Salvar informações da sessão
      try {
        console.log('🔍 Resposta completa do login:', result);
        console.log('🔍 Dados do usuário:', result.data?.user);
        console.log('🔍 ID do usuário:', result.data?.user?.id);
        console.log('🔍 ID do usuário (alternativo):', result.data?.user?.id_usuario);
        
        const userId = result.data?.user?.id || result.data?.user?.id_usuario;
        console.log('🔍 UserId final para salvar:', userId);
        
        localStorage.setItem('ic2.session', JSON.stringify({
          email: formEmail,
          userId: userId,
          companyId: selectedCompany?.id,
          companyName: selectedCompany?.name,
          loggedAt: new Date().toISOString(),
        }));
        console.log('✅ Sessão salva com userId:', userId);
      } catch (error) {
        console.error('❌ Erro ao salvar sessão:', error);
      }
      
      // Persistência com expiração e email ofuscado
      if (rememberMe) saveRemember(formEmail, selectedCompany, 30);
      else clearRemember();
      navigate('/pdls');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh', // Dynamic viewport height para mobile
        height: 'auto',
        background: 'linear-gradient(180deg, #f9fbfd 0%, #f1f5f9 100%)',
        py: { xs: 2, sm: 4 }, // Padding vertical para espaçamento
        px: { xs: 1, sm: 2 }, // Padding horizontal para evitar overflow
      }}
    >
      <Stack spacing={3} sx={{ width: '100%' }}>
         <Box sx={{ textAlign: 'center', mt: { xs: 1, sm: 2 } }}>
           <Box
             component="img"
             src={logoImage}
             alt="Fábrica de Líderes"
             sx={{
               width: { xs: '420px', sm: '500px', md: '580px' },
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
          boxShadow: (theme) => theme.shadows[8],
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
            Entrar
          </Typography>
          {registrationSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Conta criada com sucesso! Agora você pode fazer login.
            </Alert>
          )}
          {reactivationSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Conta reativada com sucesso! Sua senha foi atualizada. Agora você pode fazer login.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
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
                name="email" 
                label="E-mail" 
                type="email" 
                autoComplete="email" 
                fullWidth 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    fontSize: { xs: '16px', sm: '16px' } // Previne zoom no iOS
                  }
                }}
              />
              <TextField
                name="password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <FormControlLabel 
                control={
                  <Checkbox 
                    name="remember" 
                    color="primary" 
                    checked={rememberMe} 
                    onChange={(e) => { const v = e.target.checked; setRememberMe(v); if (!v) clearRemember(); }} 
                    size="small"
                  />
                } 
                label="Lembrar de mim" 
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
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
                Entrar
              </Button>
              <Button 
                href="/register" 
                variant="outlined" 
                size="large"
                sx={{ 
                  minHeight: { xs: '48px', sm: '56px' },
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                Registrar
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/forgot-password')}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, cursor: 'pointer' }}
                >
                  Esqueci minha senha
                </Link>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Stack>
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
          <List>
            {companiesLoading && (
              <ListItem>
                <ListItemText primary="Carregando empresas..." />
              </ListItem>
            )}
            {companiesError && (
              <ListItem sx={{ display: 'block' }}>
                <ListItemText primary={companiesError} secondary={`Base URL: ${import.meta.env.VITE_API_BASE_URL || 'não definida'}`} />
                <Button size="small" onClick={loadCompanies}>Tentar novamente</Button>
              </ListItem>
            )}
            {companies.length === 0 && (
              <ListItem>
                <ListItemText primary="Nenhuma empresa disponível no momento." />
              </ListItem>
            )}
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


