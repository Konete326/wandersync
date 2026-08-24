import Gallery from '../models/Gallery.js';
import { uploadImageBuffer, deleteImage } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getGalleryItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = {};
    if (req.query.country && req.query.country !== 'All') filter.country = new RegExp(`^${req.query.country}$`, 'i');
    if (req.query.category && req.query.category !== 'All') filter.category = new RegExp(`^${req.query.category}$`, 'i');
    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { city: new RegExp(req.query.search, 'i') },
        { country: new RegExp(req.query.search, 'i') }
      ];
    }
    const total = await Gallery.countDocuments(filter);
    const items = await Gallery.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('createdBy', 'name email');
    return sendSuccess(res, 'Gallery items fetched successfully', { items, total, page, pages: Math.ceil(total / limit) || 1, limit });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getGalleryItemById = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id).populate('createdBy', 'name email');
    if (!item) return sendError(res, 'Destination not found', 404);
    return sendSuccess(res, 'Destination details fetched', item);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createGalleryItem = async (req, res) => {
  try {
    const { title, country, city, location, description, category, featured, bestTimeToVisit, idealDuration, estimatedBudget, currency, language, transportation } = req.body;
    if (!title || !country || !city) return sendError(res, 'Title, country, and city are required', 400);
    let imageUrl = req.body.imageUrl || '';
    let publicId = '';
    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/gallery');
      imageUrl = uploadResult.url;
      publicId = uploadResult.publicId;
    }
    if (!imageUrl) return sendError(res, 'Please provide a primary landmark image', 400);
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : (val || []));
    const item = await Gallery.create({
      title: title.trim(),
      country: country.trim(),
      city: city.trim(),
      location: location ? location.trim() : `${city}, ${country}`,
      description: description ? description.trim() : '',
      category: category || 'Landscape',
      imageUrl,
      publicId,
      bestTimeToVisit: bestTimeToVisit || 'Year-round',
      idealDuration: idealDuration || '5-7 Days',
      estimatedBudget: estimatedBudget || '$120-$200/day',
      currency: currency || 'USD ($)',
      language: language || 'English / Local',
      transportation: transportation || '',
      travelTips: parseField(req.body.travelTips),
      touristPlaces: parseField(req.body.touristPlaces),
      hotels: parseField(req.body.hotels),
      localFoods: parseField(req.body.localFoods),
      featured: featured === 'true' || featured === true,
      createdBy: req.user ? req.user._id : null
    });
    return sendSuccess(res, 'Destination published to gallery', item, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return sendError(res, 'Destination not found', 404);
    const fields = ['title', 'country', 'city', 'location', 'description', 'category', 'bestTimeToVisit', 'idealDuration', 'estimatedBudget', 'currency', 'language', 'transportation'];
    fields.forEach((f) => { if (req.body[f] !== undefined) item[f] = req.body[f]; });
    if (req.body.featured !== undefined) item.featured = req.body.featured === 'true' || req.body.featured === true;
    if (req.file) {
      if (item.publicId) await deleteImage(item.publicId).catch(() => {});
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/gallery');
      item.imageUrl = uploadResult.url;
      item.publicId = uploadResult.publicId;
    } else if (req.body.imageUrl) item.imageUrl = req.body.imageUrl;
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : val);
    if (req.body.touristPlaces) item.touristPlaces = parseField(req.body.touristPlaces);
    if (req.body.hotels) item.hotels = parseField(req.body.hotels);
    if (req.body.localFoods) item.localFoods = parseField(req.body.localFoods);
    if (req.body.travelTips) item.travelTips = parseField(req.body.travelTips);
    await item.save();
    return sendSuccess(res, 'Destination updated successfully', item);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return sendError(res, 'Gallery item not found', 404);
    if (item.publicId) await deleteImage(item.publicId).catch(() => {});
    await item.deleteOne();
    return sendSuccess(res, 'Gallery item deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
