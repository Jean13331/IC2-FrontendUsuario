import React, { useState } from 'react';
import { Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';

export default function LoginSimple() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f9fbfd 0%, #f1f5f9 100%)',
      }}
    >
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3, width: '100%' }}>
        <Typography variant="h4" component="h1" color="primary" sx={{ mb: 3, textAlign: 'center' }}>
          Fábrica de Líderes
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              name="email"
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              name="password"
              label="Senha"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" size="large">
              Entrar
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
