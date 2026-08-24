import api from './api';

export const fetchPlatformExpenses = async (page = 1, limit = 10, category = '', status = '', search = '') => {
  let url = `/expenses/platform?page=${page}&limit=${limit}`;
  if (category && category !== 'All') url += `&category=${encodeURIComponent(category)}`;
  if (status && status !== 'All') url += `&status=${encodeURIComponent(status)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const response = await api.get(url);
  return response.data;
};

export const createPlatformExpense = async (data) => {
  const response = await api.post('/expenses/platform', data);
  return response.data;
};

export const updatePlatformExpense = async (id, data) => {
  const response = await api.put(`/expenses/platform/${id}`, data);
  return response.data;
};

export const deletePlatformExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

export const fetchTripExpenses = async (tripId) => {
  const response = await api.get(`/expenses/trip/${tripId}`);
  return response.data;
};

export const addTripExpense = async (data) => {
  const response = await api.post('/expenses', data);
  return response.data;
};
