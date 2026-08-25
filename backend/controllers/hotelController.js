import Hotel from '../models/Hotel.js';
import { uploadImageBuffer, deleteImage } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getHotels = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { city: new RegExp(req.query.search, 'i') },
        { country: new RegExp(req.query.search, 'i') },
        { area: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.country && req.query.country !== 'All') filter.country = new RegExp(`^${req.query.country}$`, 'i');
    if (req.query.city && req.query.city !== 'All') filter.city = new RegExp(`^${req.query.city}$`, 'i');
    if (req.query.priceRange && req.query.priceRange !== 'All') filter.priceRange = req.query.priceRange;
    const total = await Hotel.countDocuments(filter);
    const hotels = await Hotel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    return sendSuccess(res, 'Hotels fetched successfully', {
      hotels,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return sendError(res, 'Hotel not found', 404);
    return sendSuccess(res, 'Hotel details fetched', hotel);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createHotel = async (req, res) => {
  try {
    const { name, country, city, area, rating, priceRange, pricePerNight, address, bookingUrl, contactPhone, contactEmail, featured } = req.body;
    if (!name || !country || !city) return sendError(res, 'Name, country, and city are required', 400);
    let coverImage = req.body.coverImage || '';
    let publicId = '';
    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/hotels');
      coverImage = uploadResult.url;
      publicId = uploadResult.publicId;
    }
    if (!coverImage) {
      coverImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80';
    }
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : (val || []));
    const hotel = await Hotel.create({
      name: name.trim(),
      country: country.trim(),
      city: city.trim(),
      area: area ? area.trim() : '',
      rating: Number(rating) || 4.8,
      priceRange: priceRange || '$$$',
      pricePerNight: pricePerNight || '$180/night',
      address: address || '',
      bookingUrl: bookingUrl || '',
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      coverImage,
      publicId,
      amenities: parseField(req.body.amenities),
      images: parseField(req.body.images),
      featured: featured === 'true' || featured === true,
      createdBy: req.user ? req.user._id : null
    });
    return sendSuccess(res, 'Hotel created successfully', hotel, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return sendError(res, 'Hotel not found', 404);
    const fields = ['name', 'country', 'city', 'area', 'rating', 'priceRange', 'pricePerNight', 'address', 'bookingUrl', 'contactPhone', 'contactEmail'];
    fields.forEach((f) => { if (req.body[f] !== undefined) hotel[f] = req.body[f]; });
    if (req.body.featured !== undefined) hotel.featured = req.body.featured === 'true' || req.body.featured === true;
    if (req.file) {
      if (hotel.publicId) await deleteImage(hotel.publicId).catch(() => {});
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/hotels');
      hotel.coverImage = uploadResult.url;
      hotel.publicId = uploadResult.publicId;
    } else if (req.body.coverImage) {
      hotel.coverImage = req.body.coverImage;
    }
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : val);
    if (req.body.amenities) hotel.amenities = parseField(req.body.amenities);
    if (req.body.images) hotel.images = parseField(req.body.images);
    await hotel.save();
    return sendSuccess(res, 'Hotel updated successfully', hotel);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return sendError(res, 'Hotel not found', 404);
    if (hotel.publicId) await deleteImage(hotel.publicId).catch(() => {});
    await hotel.deleteOne();
    return sendSuccess(res, 'Hotel deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
