import api from './api';

export const fetchCommunityMessages = async (room = 'global-lounge', limit = 50, search = '') => {
  const params = new URLSearchParams({ limit });
  if (room && room !== 'all') params.append('room', room);
  if (search) params.append('search', search);

  const response = await api.get(`/community?${params.toString()}`);
  return response.data;
};

export const postCommunityMessage = async (formData) => {
  const isFormData = formData instanceof FormData;
  const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await api.post('/community', formData, { headers });
  return response.data;
};

export const toggleLikeMessage = async (id) => {
  const response = await api.patch(`/community/${id}/like`);
  return response.data;
};

export const togglePinMessage = async (id) => {
  const response = await api.patch(`/community/${id}/pin`);
  return response.data;
};

export const deleteCommunityMessage = async (id) => {
  const response = await api.delete(`/community/${id}`);
  return response.data;
};
