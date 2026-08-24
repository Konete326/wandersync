import api from './api';

export const fetchSpots = async (page = 1, limit = 6, country = '', city = '', category = '', search = '') => {
  let url = `/spots?page=${page}&limit=${limit}`;
  if (country && country !== 'All') url += `&country=${encodeURIComponent(country)}`;
  if (city && city !== 'All') url += `&city=${encodeURIComponent(city)}`;
  if (category && category !== 'All') url += `&category=${encodeURIComponent(category)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const response = await api.get(url);
  return response.data;
};

export const fetchSpotById = async (id) => {
  const response = await api.get(`/spots/${id}`);
  return response.data;
};

export const createSpot = async (formData) => {
  const response = await api.post('/spots', formData);
  return response.data;
};

export const updateSpot = async (id, formData) => {
  const response = await api.put(`/spots/${id}`, formData);
  return response.data;
};

export const deleteSpot = async (id) => {
  const response = await api.delete(`/spots/${id}`);
  return response.data;
};
