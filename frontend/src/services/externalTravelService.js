import api from './api';

export const fetchPlaces = async (city, country = '') => {
  const response = await api.get('/external-travel/places', {
    params: { city, country }
  });
  return response.data;
};

export const fetchHotels = async (city, country = '') => {
  const response = await api.get('/external-travel/hotels', {
    params: { city, country }
  });
  return response.data;
};

export const fetchTransport = async (origin, destination) => {
  const response = await api.get('/external-travel/transport', {
    params: { origin, destination }
  });
  return response.data;
};

export const fetchEvents = async (city) => {
  const response = await api.get('/external-travel/events', {
    params: { city }
  });
  return response.data;
};

export const fetchIntegrationStatus = async () => {
  const response = await api.get('/external-travel/status');
  return response.data;
};
