import Gallery from '../models/Gallery.js';
import { uploadImageBuffer, deleteImage } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getGalleryItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const skip = (page - 1) * limit;

    const total = await Gallery.countDocuments();
    const items = await Gallery.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    return sendSuccess(res, 'Gallery items fetched successfully', {
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createGalleryItem = async (req, res) => {
  try {
    const { title, location, description, category, featured } = req.body;
    if (!title || !location) {
      return sendError(res, 'Title and location are required', 400);
    }

    let imageUrl = req.body.imageUrl || '';
    let publicId = '';

    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/gallery');
      imageUrl = uploadResult.url;
      publicId = uploadResult.publicId;
    }

    if (!imageUrl) {
      return sendError(res, 'Please provide an image file or URL', 400);
    }

    const item = await Gallery.create({
      title,
      location,
      description: description || '',
      category: category || 'Landscape',
      imageUrl,
      publicId,
      featured: featured === 'true' || featured === true,
      createdBy: req.user ? req.user._id : null
    });

    return sendSuccess(res, 'Gallery photo published successfully', item, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return sendError(res, 'Gallery item not found', 404);
    }

    if (item.publicId) {
      await deleteImage(item.publicId);
    }

    await item.deleteOne();
    return sendSuccess(res, 'Gallery item deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
