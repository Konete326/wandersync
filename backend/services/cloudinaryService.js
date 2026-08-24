import cloudinary from '../config/cloudinary.js';

export const uploadImageBuffer = (buffer, folder = 'wandersync') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );
    uploadStream.end(buffer);
  });
};

export const deleteImage = async (publicId) => {
  if (!publicId) return null;
  return await cloudinary.uploader.destroy(publicId);
};
