// Teste simples para verificar se a API está funcionando
// Execute este script no console do navegador na página de Ações Realizadas

console.log('🔍 Testando API diretamente...');

// 1. Verificar dados do localStorage
const session = JSON.parse(localStorage.getItem('ic2.session') || '{}');
const token = localStorage.getItem('ic2.token');

console.log('📋 Sessão:', session);
console.log('🔑 Token:', token ? 'Presente' : 'Ausente');
console.log('👤 UserId:', session.userId);

if (!session.userId) {
  console.error('❌ UserId não encontrado na sessão!');
} else if (!token) {
  console.error('❌ Token não encontrado!');
} else {
  // 2. Testar requisição manual
  const testAPI = async () => {
    try {
      console.log('🚀 Fazendo requisição...');
      
      const response = await fetch('https://ic2-backend-production.up.railway.app/api/pdl-evaluation/user/' + session.userId, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Status da resposta:', response.status);
      console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dados recebidos:', data);
        console.log('📊 Total de avaliações:', data.avaliacoes?.length || 0);
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
    }
  };
  
  testAPI();
}

