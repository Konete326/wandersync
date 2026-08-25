import Country from '../models/Country.js';
import { uploadImageBuffer, deleteImage } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getCountries = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { continent: new RegExp(req.query.search, 'i') },
        { code: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.continent && req.query.continent !== 'All') {
      filter.continent = new RegExp(`^${req.query.continent}$`, 'i');
    }
    const total = await Country.countDocuments(filter);
    const countries = await Country.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit);
    return sendSuccess(res, 'Countries fetched successfully', {
      countries,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getCountryById = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return sendError(res, 'Country not found', 404);
    return sendSuccess(res, 'Country details fetched', country);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createCountry = async (req, res) => {
  try {
    const { name, code, continent, currency, language, timezone, description, featured } = req.body;
    if (!name) return sendError(res, 'Country name is required', 400);
    let coverImage = req.body.coverImage || '';
    let publicId = '';
    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/countries');
      coverImage = uploadResult.url;
      publicId = uploadResult.publicId;
    }
    if (!coverImage) {
      coverImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80';
    }
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : (val || []));
    const country = await Country.create({
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : '',
      continent: continent || 'Asia',
      currency: currency || 'USD ($)',
      language: language || 'English',
      timezone: timezone || 'UTC',
      description: description || '',
      coverImage,
      publicId,
      images: parseField(req.body.images),
      popularCities: parseField(req.body.popularCities),
      featured: featured === 'true' || featured === true,
      createdBy: req.user ? req.user._id : null
    });
    return sendSuccess(res, 'Country created successfully', country, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateCountry = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return sendError(res, 'Country not found', 404);
    const fields = ['name', 'code', 'continent', 'currency', 'language', 'timezone', 'description'];
    fields.forEach((f) => { if (req.body[f] !== undefined) country[f] = req.body[f]; });
    if (req.body.featured !== undefined) country.featured = req.body.featured === 'true' || req.body.featured === true;
    if (req.file) {
      if (country.publicId) await deleteImage(country.publicId).catch(() => {});
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/countries');
      country.coverImage = uploadResult.url;
      country.publicId = uploadResult.publicId;
    } else if (req.body.coverImage) {
      country.coverImage = req.body.coverImage;
    }
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : val);
    if (req.body.images) country.images = parseField(req.body.images);
    if (req.body.popularCities) country.popularCities = parseField(req.body.popularCities);
    await country.save();
    return sendSuccess(res, 'Country updated successfully', country);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteCountry = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return sendError(res, 'Country not found', 404);
    if (country.publicId) await deleteImage(country.publicId).catch(() => {});
    await country.deleteOne();
    return sendSuccess(res, 'Country deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
