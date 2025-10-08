import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

async function testAcoesAPI() {
  try {
    console.log('🔍 Testando API de Ações Realizadas...');
    
    // 1. Primeiro, fazer login para obter um token
    console.log('\n1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'jeanortegajunior@gmail.com',
      senha: '123456',
      empresa_id: 8
    });
    
    console.log('✅ Login realizado:', loginResponse.data.success);
    console.log('👤 User ID:', loginResponse.data.data?.user?.id);
    console.log('🏢 Company ID:', loginResponse.data.data?.company?.id);
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.data?.user?.id;
    
    if (!token || !userId) {
      console.error('❌ Token ou UserId não encontrados na resposta do login');
      return;
    }
    
    // 2. Testar a API de resultados
    console.log(`\n2. Testando API /api/pdl-evaluation/resultados/${userId}...`);
    
    const resultadosResponse = await axios.get(`${API_BASE_URL}/api/pdl-evaluation/resultados/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Resposta da API de resultados:');
    console.log('📊 Total de resultados:', resultadosResponse.data.length);
    console.log('📋 Dados:', JSON.stringify(resultadosResponse.data, null, 2));
    
    // 3. Testar a API de avaliações do usuário (alternativa)
    console.log(`\n3. Testando API alternativa /api/pdl-evaluation/user/${userId}...`);
    
    const avaliacoesResponse = await axios.get(`${API_BASE_URL}/api/pdl-evaluation/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Resposta da API de avaliações:');
    console.log('📊 Total de avaliações:', avaliacoesResponse.data.avaliacoes?.length || 0);
    console.log('📋 Dados:', JSON.stringify(avaliacoesResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Dados do erro:', error.response.data);
    }
  }
}

testAcoesAPI();

