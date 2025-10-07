import { Box, Container, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Pdls from './pages/Pdls';
import PdlDetail from './pages/PdlDetail';
import AprendizadosCompromissos from './pages/AprendizadosCompromissos';
import AcoesRealizadas from './pages/AcoesRealizadas';

export default function App() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const location = useLocation();
  const isLogin = location.pathname === '/' || location.pathname.startsWith('/login');
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Container component="main" sx={{ py: isLogin ? 0 : (isDesktop ? 4 : 2), flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pdls" element={<Pdls />} />
          <Route path="/home" element={<Home />} />
          <Route path="/empresa/:companySlug/pdl/:pdlSlug" element={<PdlDetail />} />
          <Route path="/aprendizados-compromissos" element={<AprendizadosCompromissos />} />
          <Route path="/acoes-realizadas" element={<AcoesRealizadas />} />
        </Routes>
      </Container>
    </Box>
  );
}


