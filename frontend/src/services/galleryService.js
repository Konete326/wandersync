import api from './api';

export const fetchGalleryItems = async (page = 1, limit = 12, country = '', category = '', search = '') => {
  let url = `/gallery?page=${page}&limit=${limit}`;
  if (country && country !== 'All') url += `&country=${encodeURIComponent(country)}`;
  if (category && category !== 'All') url += `&category=${encodeURIComponent(category)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const response = await api.get(url);
  return response.data;
};

export const uploadGalleryItem = async (formData) => {
  const response = await api.post('/gallery', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateGalleryItem = async (id, formData) => {
  const response = await api.put(`/gallery/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteGalleryItem = async (id) => {
  const response = await api.delete(`/gallery/${id}`);
  return response.data;
};

export const autofillDestinationAi = async (country, city) => {
  const response = await api.post('/ai/autofill-destination', { country, city });
  return response.data;
};
