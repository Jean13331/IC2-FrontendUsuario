import { FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink } from 'react-router-dom';
import { requestPasswordReset } from '../services/auth';
import logoImage from '../icon/FDL_logotipo 9.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Informe um e-mail válido.');
      return;
    }

    try {
      setLoading(true);
      await requestPasswordReset(email);
      setSuccess('Enviamos um código para redefinir sua senha. Confira seu email.');
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;
      setError(apiMessage || 'Não foi possível enviar o código. Tente novamente.');
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
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #f9fbfd 0%, #f1f5f9 100%)',
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Stack spacing={3} sx={{ width: '100%' }}>
        <Box sx={{ textAlign: 'center', mt: { xs: 1, sm: 2 } }}>
          <Box
            component="img"
            src={logoImage}
            alt="Fábrica de Líderes"
            sx={{
              width: { xs: '320px', sm: '420px', md: '520px' },
              height: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
              mb: 3,
            }}
          />
        </Box>

        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            boxShadow: (theme) => theme.shadows[8],
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            color="primary"
            sx={{
              mb: 2,
              textAlign: 'center',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            }}
          >
            Recuperar senha
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Informe o e-mail utilizado no cadastro. Nós enviaremos um código para
            você redefinir sua senha.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                name="email"
                label="E-mail cadastrado"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                fullWidth
                autoFocus
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar código'}
              </Button>

              <Button
                component={RouterLink}
                to="/login"
                startIcon={<ArrowBackIcon />}
              >
                Voltar para o login
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}


