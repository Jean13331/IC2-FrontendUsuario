import api from './api';

export async function getStates() {
  const { data } = await api.get('/api/locations/states');
  return data;
}

export async function getCitiesByState(uf: string) {
  const { data } = await api.get(`/api/locations/cities/${uf}`);
  return data;
}

export async function searchCities(q: string) {
  const { data } = await api.get('/api/locations/search/cities', { params: { q } });
  return data;
}


