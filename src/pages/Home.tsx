import { Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material';

export default function Home() {
  return (
    <Stack spacing={3} alignItems="center">
      <Typography variant="h4" component="h1" color="primary">
        Bem-vindo ao Portal do Usuário
      </Typography>
      <Card sx={{ maxWidth: 640, width: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Comece aqui
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Esta é a página inicial do portal do usuário construído com React, Vite e Material UI.
          </Typography>
        </CardContent>
        <CardActions>
          <Button variant="contained">Ação principal</Button>
          <Button variant="text">Saiba mais</Button>
        </CardActions>
      </Card>
    </Stack>
  );
}


