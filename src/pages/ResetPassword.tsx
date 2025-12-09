import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { resetPassword, verifyResetToken } from '../services/auth';
import logoImage from '../icon/FDL_logotipo 9.png';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setError('Token ou e-mail não encontrado na URL.');
        setVerifying(false);
        return;
      }

      try {
        const result = await verifyResetToken(token, email);
        if (result.valid) {
          setTokenValid(true);
        } else {
          setError('Token inválido, expirado ou já utilizado.');
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Erro ao verificar token. O link pode ter expirado.'
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, email, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Erro ao redefinir senha. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
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
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            boxShadow: (theme) => theme.shadows[8],
            width: '100%',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Verificando token...
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (!tokenValid) {
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
            }}
          >
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || 'Token inválido ou expirado.'}
            </Alert>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/forgot-password')}
              sx={{
                minHeight: { xs: '48px', sm: '56px' },
                fontSize: { xs: '1rem', sm: '1.125rem' }
              }}
            >
              Solicitar Novo Link
            </Button>
          </Paper>
        </Stack>
      </Container>
    );
  }

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
            Redefinir Senha
          </Typography>

          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Senha redefinida com sucesso!
              </Alert>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  minHeight: { xs: '48px', sm: '56px' },
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                Ir para Login
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
                Informe sua nova senha abaixo.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
                  <TextField
                    name="newPassword"
                    label="Nova Senha"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    fullWidth
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '16px', sm: '16px' }
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
                    name="confirmPassword"
                    label="Confirmar Nova Senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    fullWidth
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '16px', sm: '16px' }
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                    fullWidth
                    sx={{
                      minHeight: { xs: '48px', sm: '56px' },
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    {loading ? 'Redefinindo...' : 'Redefinir Senha'}
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

