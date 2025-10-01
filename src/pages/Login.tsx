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

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [companyDrawerOpen, setCompanyDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Bloqueia scroll enquanto a tela de login está ativa
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') || '');
    const password = String(data.get('password') || '');
    setError(null);
    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    // TODO: Integrar com API
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
                {selectedCompany ? `Empresa: ${selectedCompany}` : 'Selecionar empresa'}
              </Button>
              <TextField name="email" label="E-mail" type="email" autoComplete="email" fullWidth required />
              <TextField
                name="password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                fullWidth
                required
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
              <FormControlLabel control={<Checkbox name="remember" color="primary" />} label="Lembrar de mim" />
              <Button type="submit" variant="contained" size="large">
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
          <List>
            <ListItem disablePadding>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => { setSelectedCompany('Empresa Teste'); setCompanyDrawerOpen(false); }}
              >
                Empresa Teste
              </Button>
            </ListItem>
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


