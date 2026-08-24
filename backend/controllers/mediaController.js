import { uploadImageBuffer, deleteImage } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file uploaded', 400);
    }

    const folder = req.body.folder || 'wandersync';
    const result = await uploadImageBuffer(req.file.buffer, folder);

    return sendSuccess(res, 'Image uploaded successfully', result, 201);
  } catch (error) {
    return sendError(res, error.message || 'Image upload failed', 500);
  }
};

export const removeMedia = async (req, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return sendError(res, 'Public ID is required', 400);
    }

    await deleteImage(publicId);
    return sendSuccess(res, 'Image removed successfully');
  } catch (error) {
    return sendError(res, error.message || 'Failed to remove image', 500);
  }
};
