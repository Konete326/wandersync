import api from './api';

export const fetchGroupTours = async (page = 1, limit = 6, search = '', country = '', status = '', category = '') => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (country && country !== 'All') params.append('country', country);
  if (status && status !== 'All') params.append('status', status);
  if (category && category !== 'All') params.append('category', category);

  const response = await api.get(`/group-tours?${params.toString()}`);
  return response.data;
};

export const fetchGroupTourById = async (id) => {
  const response = await api.get(`/group-tours/${id}`);
  return response.data;
};

export const createGroupTour = async (formData) => {
  const response = await api.post('/group-tours', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateGroupTour = async (id, formData) => {
  const response = await api.put(`/group-tours/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteGroupTour = async (id) => {
  const response = await api.delete(`/group-tours/${id}`);
  return response.data;
};

export const createPOSBooking = async (bookingData) => {
  const response = await api.post('/group-tours/pos/book', bookingData);
  return response.data;
};

export const fetchTourBookings = async (tourId = '', search = '') => {
  const params = new URLSearchParams();
  if (tourId && tourId !== 'All') params.append('tourId', tourId);
  if (search) params.append('search', search);
  const response = await api.get(`/group-tours/bookings?${params.toString()}`);
  return response.data;
};
