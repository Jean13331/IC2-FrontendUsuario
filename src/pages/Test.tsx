import React from 'react';

export default function Test() {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#0E2A4A', fontSize: '2rem', marginBottom: '20px' }}>
        🎉 Fábrica de Líderes - App Funcionando!
      </h1>
      <p style={{ color: '#666', fontSize: '1.2rem' }}>
        Se você está vendo isso, o React está renderizando corretamente.
      </p>
      <div style={{ marginTop: '30px' }}>
        <a href="/login-simple" style={{ 
          display: 'inline-block', 
          padding: '10px 20px', 
          backgroundColor: '#0E2A4A', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '5px',
          margin: '0 10px'
        }}>
          Login Simples
        </a>
        <a href="/login" style={{ 
          display: 'inline-block', 
          padding: '10px 20px', 
          backgroundColor: '#25A2A2', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '5px',
          margin: '0 10px'
        }}>
          Login Completo
        </a>
      </div>
    </div>
  );
}
