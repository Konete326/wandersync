import api from './api';
import { compressImage } from '../utils/imageCompressor';

export const uploadImage = async (file, folder = 'wandersync') => {
  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append('image', compressed);
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
