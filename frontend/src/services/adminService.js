import api from './api';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminRecentTrips = async () => {
  const response = await api.get('/admin/trips');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getAdminActivity = async () => {
  const response = await api.get('/admin/activity');
  return response.data;
};

export const getAdminNotifications = async () => {
  const response = await api.get('/admin/notifications');
  return response.data;
};
