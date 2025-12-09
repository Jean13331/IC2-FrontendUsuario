import { Box, Container } from '@mui/material';
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Pdls from './pages/Pdls';
import Home from './pages/Home';
import PdlDetail from './pages/PdlDetail';
import AprendizadosCompromissos from './pages/AprendizadosCompromissos';
import AcoesRealizadas from './pages/AcoesRealizadas';
import AcoesResultados from './pages/AcoesResultados';
import Relatorio from './pages/Relatorio';

function AppContent() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Container component="main" sx={{ py: 0, flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pdls" element={<Pdls />} />
          <Route path="/home" element={<Home />} />
          <Route path="/empresa/:companySlug/pdl/:pdlSlug" element={<PdlDetail />} />
          <Route path="/aprendizados-compromissos" element={<AprendizadosCompromissos />} />
          <Route path="/acoes-realizadas" element={<AcoesRealizadas />} />
          <Route path="/acoes-resultados" element={<AcoesResultados />} />
          <Route path="/relatorio" element={<Relatorio />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}


