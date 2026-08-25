import cloudinary from '../config/cloudinary.js';

export const uploadImageBuffer = (buffer, folder = 'wandersync') => {
  return new Promise((resolve) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return resolve({ url: '', publicId: '' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      const base64 = buffer.toString('base64');
      return resolve({
        url: `data:image/webp;base64,${base64}`,
        publicId: ''
      });
    }

    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1600, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            const base64 = buffer.toString('base64');
            return resolve({
              url: `data:image/webp;base64,${base64}`,
              publicId: ''
            });
          }
          return resolve({
            url: result.secure_url,
            publicId: result.public_id || ''
          });
        }
      );
      uploadStream.end(buffer);
    } catch {
      const base64 = buffer.toString('base64');
      return resolve({
        url: `data:image/webp;base64,${base64}`,
        publicId: ''
      });
    }
  });
};

export const deleteImage = async (publicId) => {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch {
    return null;
  }
};
