import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('🚀 Iniciando aplicação...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ Aplicação renderizada!');


