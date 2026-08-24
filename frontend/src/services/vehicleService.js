import api from './api';

export const fetchVehicles = async (page = 1, limit = 6, vehicleType = '', country = '', city = '', status = '', search = '') => {
  let url = `/vehicles?page=${page}&limit=${limit}`;
  if (vehicleType && vehicleType !== 'All') url += `&vehicleType=${encodeURIComponent(vehicleType)}`;
  if (country && country !== 'All') url += `&country=${encodeURIComponent(country)}`;
  if (city && city !== 'All') url += `&city=${encodeURIComponent(city)}`;
  if (status && status !== 'All') url += `&status=${encodeURIComponent(status)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const response = await api.get(url);
  return response.data;
};

export const fetchVehicleById = async (id) => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (formData) => {
  const response = await api.post('/vehicles', formData);
  return response.data;
};

export const updateVehicle = async (id, formData) => {
  const response = await api.put(`/vehicles/${id}`, formData);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};
