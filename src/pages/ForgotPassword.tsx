import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/auth';
import logoImage from '../icon/FDL_logotipo 9.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Erro ao solicitar recuperação de senha. Tente novamente.'
      );
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
              width: { xs: '420px', sm: '500px', md: '580px' },
              height: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
              mb: 3
            }}
          />
        </Box>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            boxShadow: (theme) => theme.shadows[8],
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
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
            Recuperar Senha
          </Typography>

          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Se o e-mail informado existir em nosso sistema, você receberá instruções para recuperar sua senha.
              </Alert>
              <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                Verifique sua caixa de entrada e também a pasta de <strong>spam/lixo eletrônico</strong> e siga as instruções do e-mail.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  minHeight: { xs: '48px', sm: '56px' },
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                Voltar ao Login
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
                Informe seu e-mail e enviaremos instruções para recuperar sua senha.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
                  <TextField
                    name="email"
                    label="E-mail"
                    type="email"
                    autoComplete="email"
                    fullWidth
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '16px', sm: '16px' }
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    fullWidth
                    sx={{
                      minHeight: { xs: '48px', sm: '56px' },
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    {loading ? 'Enviando...' : 'Enviar Instruções'}
                  </Button>
                  <Box sx={{ textAlign: 'center' }}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => navigate('/login')}
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, cursor: 'pointer' }}
                    >
                      Voltar ao Login
                    </Link>
                  </Box>
                </Stack>
              </Box>
            </>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
