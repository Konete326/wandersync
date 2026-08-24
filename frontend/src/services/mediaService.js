import api from './api';

export const uploadImage = async (file, folder = 'wandersync') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const response = await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteImage = async (publicId) => {
  const response = await api.delete(`/media/${publicId}`);
  return response.data;
};
