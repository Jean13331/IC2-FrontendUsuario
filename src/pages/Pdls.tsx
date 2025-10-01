import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Chip, Container, Divider, Stack, Typography } from '@mui/material';
import { Pdl, listCompanyPdls } from '../services/pdl';

export default function Pdls() {
  const [pdls, setPdls] = useState<Pdl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('ic2.session');
    const session = raw ? JSON.parse(raw) as { companyId?: number; companyName?: string } : {};
    const companyId = session.companyId;
    if (!companyId) {
      setError('Empresa não definida. Volte ao login.');
      return;
    }
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

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>PDLs da Empresa</Typography>
      {loading && <Typography>Carregando...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <Stack spacing={2}>
        {pdls.map((p) => (
          <Card key={p.id_pdl} variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">{p.pdl_nome}</Typography>
                <Chip label={p.finalizado_em ? 'Finalizado' : 'Ativo'} color={p.finalizado_em ? 'default' : 'primary'} size="small" />
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                ID: {p.id_pdl}
              </Typography>
            </CardContent>
          </Card>
        ))}
        {!loading && !error && pdls.length === 0 && (
          <Box>
            <Typography variant="body2">Nenhum PDL disponível para esta empresa.</Typography>
          </Box>
        )}
      </Stack>
    </Container>
  );
}


