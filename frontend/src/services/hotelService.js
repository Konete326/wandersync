import api from './api';

export const fetchHotels = async (page = 1, limit = 6, country = '', city = '', priceRange = '', search = '') => {
  let url = `/hotels?page=${page}&limit=${limit}`;
  if (country && country !== 'All') url += `&country=${encodeURIComponent(country)}`;
  if (city && city !== 'All') url += `&city=${encodeURIComponent(city)}`;
  if (priceRange && priceRange !== 'All') url += `&priceRange=${encodeURIComponent(priceRange)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const response = await api.get(url);
  return response.data;
};

export const fetchHotelById = async (id) => {
  const response = await api.get(`/hotels/${id}`);
  return response.data;
};

export const createHotel = async (formData) => {
  const response = await api.post('/hotels', formData);
  return response.data;
};

export const updateHotel = async (id, formData) => {
  const response = await api.put(`/hotels/${id}`, formData);
  return response.data;
};

export const deleteHotel = async (id) => {
  const response = await api.delete(`/hotels/${id}`);
  return response.data;
};
