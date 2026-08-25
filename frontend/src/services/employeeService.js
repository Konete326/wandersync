import api from './api';

export const fetchAdminEmployees = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.department && params.department !== 'All') query.append('department', params.department);
  if (params.status && params.status !== 'All') query.append('status', params.status);

  const response = await api.get(`/admin/employees?${query.toString()}`);
  return response.data;
};

export const createAdminEmployee = async (employeeData) => {
  const response = await api.post('/admin/employees', employeeData);
  return response.data;
};

export const updateAdminEmployee = async (id, employeeData) => {
  const response = await api.put(`/admin/employees/${id}`, employeeData);
  return response.data;
};

export const deleteAdminEmployee = async (id) => {
  const response = await api.delete(`/admin/employees/${id}`);
  return response.data;
};

export const fetchAdminEmployeeTasks = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.employeeId && params.employeeId !== 'All') query.append('employeeId', params.employeeId);
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
  if (params.category && params.category !== 'All') query.append('category', params.category);

  const response = await api.get(`/admin/employees/tasks?${query.toString()}`);
  return response.data;
};

export const createAdminEmployeeTask = async (taskData) => {
  const response = await api.post('/admin/employees/tasks', taskData);
  return response.data;
};

export const updateAdminEmployeeTaskStatus = async (taskId, status) => {
  const response = await api.patch(`/admin/employees/tasks/${taskId}/status`, { status });
  return response.data;
};

export const deleteAdminEmployeeTask = async (taskId) => {
  const response = await api.delete(`/admin/employees/tasks/${taskId}`);
  return response.data;
};
