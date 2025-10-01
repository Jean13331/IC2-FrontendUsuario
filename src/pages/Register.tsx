import { useEffect, useState } from 'react';
import { Box, Button, Container, Paper, Stack, TextField, Typography, IconButton, InputAdornment, Drawer, List, ListItem, ListItemText, FormControl, InputLabel, Select, MenuItem, Autocomplete, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/auth';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { listCompanies, Company } from '../services/companies';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [companyDrawerOpen, setCompanyDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
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
        height: '100vh',
        background: 'linear-gradient(180deg, #f9fbfd 0%, #f1f5f9 100%)',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Box sx={{ textAlign: 'center', mt: { xs: 2, sm: 4 } }}>
        <Typography
          component="div"
          color="primary"
          sx={{
            fontWeight: 900,
            lineHeight: 1,
            fontSize: { xs: 56, sm: 72, md: 96 },
            textShadow: '0 3px 10px rgba(14,42,74,0.35)'
          }}
        >
          IC
        </Typography>
        <Typography
          component="div"
          color="secondary"
          sx={{
            letterSpacing: { xs: 8, sm: 10 },
            mt: 1,
            fontWeight: 800,
            fontSize: { xs: 22, sm: 28 },
            textShadow: '0 2px 8px rgba(37,162,162,0.35)'
          }}
        >
          EVOLUTIVA
        </Typography>
      </Box>
      <Paper elevation={6} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3, width: '100%' }}>
        <Typography variant="h5" component="h1" color="primary" sx={{ mb: 2, textAlign: 'center' }}>
          Criar conta
        </Typography>
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          try {
            setLoading(true);
            // Aqui normalmente faria registro; como placeholder, vamos logar direto se já tiver email/senha
            const form = new FormData(e.currentTarget as HTMLFormElement);
            const email = String(form.get('email') || '');
            const password = String(form.get('password') || '');
            if (!email || !password) {
              setError('Preencha e-mail e senha.');
              setLoading(false);
              return;
            }
            await loginApi(email, password, selectedCompany || undefined);
            navigate('/home');
          } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao registrar/logar.');
          } finally {
            setLoading(false);
          }
        }}>
          <Stack spacing={2}>
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            <Button variant="outlined" onClick={() => setCompanyDrawerOpen(true)}>
              {selectedCompany ? `Empresa: ${selectedCompany}` : 'Selecionar empresa'}
            </Button>
            <TextField name="name" label="Nome completo" fullWidth required />
            <TextField name="email" label="E-mail" type="email" fullWidth required />
            <TextField
              name="phone"
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(formatPhoneBR(e.target.value))}
              inputMode="numeric"
              fullWidth
              required
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
            <TextField
              name="confirm"
              label="Confirmar senha"
              type={showConfirm ? 'text' : 'password'}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowConfirm((v) => !v)}
                      edge="end"
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" size="large" disabled={loading}>
              Registrar
            </Button>
            <Button href="/login" variant="text">
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
                    onClick={() => { setSelectedCompany(c.name); setCompanyDrawerOpen(false); }}
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



