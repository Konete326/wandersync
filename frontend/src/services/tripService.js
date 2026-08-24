import api from './api';

export const getMyTrips = async () => {
  const response = await api.get('/trips');
  return response.data;
};

export const getTripDetails = async (id) => {
  const response = await api.get(`/trips/${id}`);
  return response.data;
};

export const getSharedTripDetails = async (shareSlug) => {
  const response = await api.get(`/trips/share/${shareSlug}`);
  return response.data;
};

export const saveTrip = async (tripData) => {
  const response = await api.post('/trips', tripData);
  return response.data;
};

export const updateTripData = async (id, tripData) => {
  const response = await api.put(`/trips/${id}`, tripData);
  return response.data;
};

export const deleteTripById = async (id) => {
  const response = await api.delete(`/trips/${id}`);
  return response.data;
};

export const generateItineraryWithAi = async (params) => {
  const response = await api.post('/ai/generate-itinerary', params);
  return response.data;
};

export const refineItineraryWithAi = async (currentItinerary, message) => {
  const response = await api.post('/ai/chat-refine', { currentItinerary, message });
  return response.data;
};
