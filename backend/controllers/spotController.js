import Spot from '../models/Spot.js';
import { uploadImageBuffer, deleteImage } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getSpots = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { city: new RegExp(req.query.search, 'i') },
        { country: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.country && req.query.country !== 'All') filter.country = new RegExp(`^${req.query.country}$`, 'i');
    if (req.query.city && req.query.city !== 'All') filter.city = new RegExp(`^${req.query.city}$`, 'i');
    if (req.query.category && req.query.category !== 'All') filter.category = new RegExp(`^${req.query.category}$`, 'i');
    const total = await Spot.countDocuments(filter);
    const spots = await Spot.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    return sendSuccess(res, 'Spots fetched successfully', {
      spots,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getSpotById = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) return sendError(res, 'Tourist spot not found', 404);
    return sendSuccess(res, 'Spot details fetched', spot);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createSpot = async (req, res) => {
  try {
    const { name, country, city, category, description, ticketPrice, duration, bestTimeToVisit, address, featured } = req.body;
    if (!name || !country || !city) return sendError(res, 'Name, country, and city are required', 400);
    let coverImage = req.body.coverImage || '';
    let publicId = '';
    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/spots');
      coverImage = uploadResult.url;
      publicId = uploadResult.publicId;
    }
    if (!coverImage) return sendError(res, 'Please provide a spot cover image', 400);
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : (val || []));
    const spot = await Spot.create({
      name: name.trim(),
      country: country.trim(),
      city: city.trim(),
      category: category || 'Landmark',
      description: description || '',
      ticketPrice: ticketPrice || 'Free',
      duration: duration || '2-3 hours',
      bestTimeToVisit: bestTimeToVisit || 'Morning',
      address: address || '',
      coverImage,
      publicId,
      images: parseField(req.body.images),
      featured: featured === 'true' || featured === true,
      createdBy: req.user ? req.user._id : null
    });
    return sendSuccess(res, 'Tourist spot created successfully', spot, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateSpot = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) return sendError(res, 'Spot not found', 404);
    const fields = ['name', 'country', 'city', 'category', 'description', 'ticketPrice', 'duration', 'bestTimeToVisit', 'address'];
    fields.forEach((f) => { if (req.body[f] !== undefined) spot[f] = req.body[f]; });
    if (req.body.featured !== undefined) spot.featured = req.body.featured === 'true' || req.body.featured === true;
    if (req.file) {
      if (spot.publicId) await deleteImage(spot.publicId).catch(() => {});
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/spots');
      spot.coverImage = uploadResult.url;
      spot.publicId = uploadResult.publicId;
    } else if (req.body.coverImage) {
      spot.coverImage = req.body.coverImage;
    }
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : val);
    if (req.body.images) spot.images = parseField(req.body.images);
    await spot.save();
    return sendSuccess(res, 'Spot updated successfully', spot);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteSpot = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) return sendError(res, 'Spot not found', 404);
    if (spot.publicId) await deleteImage(spot.publicId).catch(() => {});
    await spot.deleteOne();
    return sendSuccess(res, 'Tourist spot deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
