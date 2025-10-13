import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0E2A4A' },
    secondary: { main: '#25A2A2' },
    background: { default: '#f7f9fb', paper: '#ffffff' },
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
  components: {
    MuiContainer: {
      defaultProps: { maxWidth: 'lg' },
    },
  },
});
theme = responsiveFontSizes(theme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        'input:-webkit-autofill, textarea:-webkit-autofill, select:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0px 1000px #fff inset',
          WebkitTextFillColor: '#0E2A4A',
          transition: 'background-color 5000s ease-in-out 0s',
        },
        'label.Mui-focused': {
          color: '#0E2A4A',
        },
        // Estilos para melhorar comportamento com zoom
        'html, body': {
          overflowX: 'hidden',
          minHeight: '100dvh', // Dynamic viewport height para mobile
        },
        '#root': {
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
        },
        // Previne quebra de layout com zoom
        '.MuiContainer-root': {
          position: 'relative',
        },
        // Melhora responsividade dos formulários
        '.MuiTextField-root': {
          minWidth: 0, // Previne overflow
        },
        // Ajusta tamanhos de fonte para zoom
        '@media (max-width: 600px)': {
          '.MuiTypography-h4, .MuiTypography-h5': {
            fontSize: '1.5rem !important',
          },
        },
      }} />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);


