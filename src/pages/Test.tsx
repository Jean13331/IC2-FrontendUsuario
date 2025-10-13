import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Test() {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" color="primary">
        Teste - App funcionando!
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Se você está vendo isso, o React está renderizando corretamente.
      </Typography>
    </Box>
  );
}
