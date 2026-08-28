import api from './api';

export const getMyTrips = async () => {
  const response = await api.get('/trips');
  return response.data;
};

export const getPublicCommunityTrips = async () => {
  const response = await api.get('/trips/public');
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

export const chatWithAiAssistant = async (message, history = [], tripContext = null) => {
  const response = await api.post('/ai/chat', { message, history, tripContext });
  return response.data;
};

export const searchCollaboratorUsers = async (query) => {
  const response = await api.get(`/trips/search-users?query=${encodeURIComponent(query)}`);
  return response.data;
};

export const getPendingTripInvites = async () => {
  const response = await api.get('/trips/invites/pending');
  return response.data;
};

export const respondToTripInvite = async (tripId, action) => {
  const response = await api.post(`/trips/${tripId}/collaborators/respond`, { action });
  return response.data;
};

export const getTripCollaborators = async (tripId) => {
  const response = await api.get(`/trips/${tripId}/collaborators`);
  return response.data;
};

export const addCollaboratorToTrip = async (tripId, email, role = 'editor', userId = null) => {
  const response = await api.post(`/trips/${tripId}/collaborators`, { email, role, userId });
  return response.data;
};

export const removeCollaboratorFromTrip = async (tripId, collaboratorId) => {
  const response = await api.delete(`/trips/${tripId}/collaborators/${collaboratorId}`);
  return response.data;
};

