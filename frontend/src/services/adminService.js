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

export const getAdminAllTrips = async (page = 1, limit = 8, search = '', visibility = 'all', country = 'All', featured = '', bookingStatus = 'all') => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (visibility && visibility !== 'all') params.append('visibility', visibility);
  if (country && country !== 'All') params.append('country', country);
  if (featured) params.append('featured', featured);
  if (bookingStatus && bookingStatus !== 'all') params.append('bookingStatus', bookingStatus);

  const response = await api.get(`/admin/trips/all?${params.toString()}`);
  return response.data;
};

export const updateTripBookingStatusAdmin = async (id, status, adminNotes = '', itemType = null, itemStatus = null) => {
  const response = await api.patch(`/admin/trips/${id}/booking-status`, { status, adminNotes, itemType, itemStatus });
  return response.data;
};

export const toggleTripFeatured = async (id) => {
  const response = await api.patch(`/admin/trips/${id}/feature`);
  return response.data;
};

export const toggleTripVisibility = async (id) => {
  const response = await api.patch(`/admin/trips/${id}/visibility`);
  return response.data;
};

export const deleteTripAdmin = async (id) => {
  const response = await api.delete(`/admin/trips/${id}`);
  return response.data;
};

export const getAdminAllUsers = async (page = 1, limit = 10, search = '', role = 'All', status = 'All') => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (role && role !== 'All') params.append('role', role);
  if (status && status !== 'All') params.append('status', status);

  const response = await api.get(`/admin/users/all?${params.toString()}`);
  return response.data;
};

export const createAdminUser = async (userData) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

export const updateAdminUserDetails = async (id, userData) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.patch(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const toggleUserStatus = async (id, status) => {
  const response = await api.patch(`/admin/users/${id}/status`, { status });
  return response.data;
};

export const deleteUserAdmin = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const getAdminCustomers = async (page = 1, limit = 10, search = '', paymentStatus = 'All') => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (paymentStatus && paymentStatus !== 'All') params.append('paymentStatus', paymentStatus);

  const response = await api.get(`/admin/customers?${params.toString()}`);
  return response.data;
};

export const createAdminCustomer = async (customerData) => {
  const response = await api.post('/admin/customers', customerData);
  return response.data;
};

export const updateAdminCustomer = async (id, customerData) => {
  const response = await api.put(`/admin/customers/${id}`, customerData);
  return response.data;
};

export const deleteAdminCustomer = async (id) => {
  const response = await api.delete(`/admin/customers/${id}`);
  return response.data;
};
