import api from './api';

export const generateEntityWithAi = async (type, query) => {
  const response = await api.post('/ai/autofill-entity', { type, query });
  return response.data;
};

export const autofillDestinationAi = async (country, city) => {
  const response = await api.post('/ai/autofill-destination', { country, city });
  return response.data;
};

export const generateAiItinerary = async (tripParams) => {
  const response = await api.post('/ai/generate-itinerary', tripParams);
  return response.data;
};

export const chatWithAiAssistant = async (message, history = [], tripContext = null, isAdmin = false) => {
  const response = await api.post('/ai/chat', { message, history, tripContext, isAdmin });
  return response.data;
};
