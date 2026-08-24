import api from './api';

export const fetchFlights = async (page = 1, limit = 6, search = '', destinationCountry = '', destinationCity = '', cabinClass = '') => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (destinationCountry && destinationCountry !== 'All') params.append('destinationCountry', destinationCountry);
  if (destinationCity && destinationCity !== 'All') params.append('destinationCity', destinationCity);
  if (cabinClass && cabinClass !== 'All') params.append('cabinClass', cabinClass);

  const response = await api.get(`/flights?${params.toString()}`);
  return response.data;
};

export const fetchFlightById = async (id) => {
  const response = await api.get(`/flights/${id}`);
  return response.data;
};

export const createFlight = async (formData) => {
  const response = await api.post('/flights', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateFlight = async (id, formData) => {
  const response = await api.put(`/flights/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteFlight = async (id) => {
  const response = await api.delete(`/flights/${id}`);
  return response.data;
};
