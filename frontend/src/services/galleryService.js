import api from './api';

export const fetchGalleryItems = async (page = 1, limit = 8) => {
  const response = await api.get(`/gallery?page=${page}&limit=${limit}`);
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

export const deleteGalleryItem = async (id) => {
  const response = await api.delete(`/gallery/${id}`);
  return response.data;
};
