import { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

import { Link as RouterLink } from 'react-router-dom';

export default function ResponsiveAppBar() {
  const [userInfo, setUserInfo] = useState<{
    email?: string;
    companyName?: string;
  }>({});

  useEffect(() => {
    // Carregar informações do usuário do localStorage
    const raw = localStorage.getItem('ic2.session');
    if (raw) {
      try {
        const session = JSON.parse(raw);
        setUserInfo({
          email: session.email,
          companyName: session.companyName
        });
      } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error);
      }
    }
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav" position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Lado esquerdo: Informações do usuário */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <PersonIcon sx={{ color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1.2 }}>
                {userInfo.email || 'Usuário'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.2 }}>
                {userInfo.companyName || 'Empresa'}
              </Typography>
            </Box>
          </Box>
          
          {/* Lado direito: Botão sair */}
          <Button 
            component={RouterLink} 
            to="/" 
            variant="outlined"
            size="small"
            sx={{ 
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              textTransform: 'none',
              fontWeight: 'medium',
              minWidth: 'auto',
              px: 2,
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}


