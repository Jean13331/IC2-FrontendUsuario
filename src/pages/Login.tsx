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
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/auth';
import { listCompanies, Company } from '../services/companies';

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
      try {
        localStorage.setItem('ic2.session', JSON.stringify({
          email: formEmail,
          companyId: selectedCompany?.id,
          companyName: selectedCompany?.name,
          loggedAt: new Date().toISOString(),
        }));
      } catch {}
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
        height: '100vh',
        background: 'linear-gradient(180deg, #f9fbfd 0%, #f1f5f9 100%)',
      }}
    >
      <Stack spacing={3} sx={{ width: '100%' }}>
        <Box sx={{ textAlign: 'center', mt: { xs: 2, sm: 4 } }}>
          <Typography
            component="div"
            color="primary"
            sx={{
              fontWeight: 900,
              lineHeight: 1,
              fontSize: { xs: 72, sm: 96, md: 128 },
              textShadow: '0 3px 10px rgba(14,42,74,0.35)'
            }}
          >
            IC
          </Typography>
          <Typography
            component="div"
            color="secondary"
            sx={{
              letterSpacing: { xs: 8, sm: 10, md: 12 },
              mt: 1,
              fontWeight: 800,
              fontSize: { xs: 24, sm: 32, md: 40 },
              textShadow: '0 2px 8px rgba(37,162,162,0.35)'
            }}
          >
            EVOLUTIVA
          </Typography>
          <Divider sx={{ mt: 1.5, mx: 'auto', width: { xs: 100, sm: 120 }, borderColor: 'secondary.main', opacity: 0.6 }} />
        </Box>
        <Paper elevation={6} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3, boxShadow: (theme) => theme.shadows[8] }}>
          <Typography variant="h5" component="h1" color="primary" sx={{ mb: 2, textAlign: 'center' }}>
            Entrar
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <Button variant="outlined" onClick={() => setCompanyDrawerOpen(true)}>
                {selectedCompany ? `Empresa: ${selectedCompany.name}` : 'Selecionar empresa'}
              </Button>
              <TextField name="email" label="E-mail" type="email" autoComplete="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField
                name="password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControlLabel control={<Checkbox name="remember" color="primary" checked={rememberMe} onChange={(e) => { const v = e.target.checked; setRememberMe(v); if (!v) clearRemember(); }} />} label="Lembrar de mim" />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                Entrar
              </Button>
              <Button href="/register" variant="outlined" size="large">
                Registrar
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link href="#" variant="body2">
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


