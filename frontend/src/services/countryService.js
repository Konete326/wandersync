import api from './api';

export const fetchCountries = async (page = 1, limit = 6, continent = '', search = '') => {
  let url = `/countries?page=${page}&limit=${limit}`;
  if (continent && continent !== 'All') url += `&continent=${encodeURIComponent(continent)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const response = await api.get(url);
  return response.data;
};

export const fetchCountryById = async (id) => {
  const response = await api.get(`/countries/${id}`);
  return response.data;
};

export const createCountry = async (formData) => {
  const response = await api.post('/countries', formData);
  return response.data;
};

export const updateCountry = async (id, formData) => {
  const response = await api.put(`/countries/${id}`, formData);
  return response.data;
};

export const deleteCountry = async (id) => {
  const response = await api.delete(`/countries/${id}`);
  return response.data;
};
