import Vehicle from '../models/Vehicle.js';
import { uploadImageBuffer, deleteImage } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { vehicleType: new RegExp(req.query.search, 'i') },
        { city: new RegExp(req.query.search, 'i') },
        { country: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.vehicleType && req.query.vehicleType !== 'All') filter.vehicleType = new RegExp(`^${req.query.vehicleType}$`, 'i');
    if (req.query.country && req.query.country !== 'All') filter.country = new RegExp(`^${req.query.country}$`, 'i');
    if (req.query.city && req.query.city !== 'All') filter.city = new RegExp(`^${req.query.city}$`, 'i');
    if (req.query.status && req.query.status !== 'All') filter.status = req.query.status;
    const total = await Vehicle.countDocuments(filter);
    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    return sendSuccess(res, 'Vehicles fetched successfully', {
      vehicles, total, page, pages: Math.ceil(total / limit) || 1, limit
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).lean();
    if (!vehicle) return sendError(res, 'Vehicle not found', 404);
    return sendSuccess(res, 'Vehicle details fetched', vehicle);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { name, vehicleType, capacity, transmission, fuelType, pricePerDay, pricePerHour, driverIncluded, country, city, status, featured } = req.body;
    if (!name || !country || !city) return sendError(res, 'Name, country, and city are required', 400);
    let coverImage = req.body.coverImage || '';
    let publicId = '';
    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/vehicles');
      coverImage = uploadResult.url;
      publicId = uploadResult.publicId;
    }
    if (!coverImage) {
      coverImage = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80';
    }
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : (val || []));
    const vehicle = await Vehicle.create({
      name: name.trim(), vehicleType: vehicleType || 'SUV', capacity: capacity || '5 Passengers',
      transmission: transmission || 'Automatic', fuelType: fuelType || 'Petrol',
      pricePerDay: pricePerDay || '$95/day', pricePerHour: pricePerHour || '$20/hr',
      driverIncluded: driverIncluded === 'true' || driverIncluded === true,
      country: country.trim(), city: city.trim(), status: status || 'Available',
      coverImage, publicId, features: parseField(req.body.features), images: parseField(req.body.images),
      featured: featured === 'true' || featured === true, createdBy: req.user ? req.user._id : null
    });
    return sendSuccess(res, 'Vehicle added to fleet successfully', vehicle, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return sendError(res, 'Vehicle not found', 404);
    const fields = ['name', 'vehicleType', 'capacity', 'transmission', 'fuelType', 'pricePerDay', 'pricePerHour', 'country', 'city', 'status'];
    fields.forEach((f) => { if (req.body[f] !== undefined) vehicle[f] = req.body[f]; });
    if (req.body.driverIncluded !== undefined) vehicle.driverIncluded = req.body.driverIncluded === 'true' || req.body.driverIncluded === true;
    if (req.body.featured !== undefined) vehicle.featured = req.body.featured === 'true' || req.body.featured === true;
    if (req.file) {
      if (vehicle.publicId) await deleteImage(vehicle.publicId).catch(() => {});
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/vehicles');
      vehicle.coverImage = uploadResult.url;
      vehicle.publicId = uploadResult.publicId;
    } else if (req.body.coverImage) {
      vehicle.coverImage = req.body.coverImage;
    }
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : val);
    if (req.body.features) vehicle.features = parseField(req.body.features);
    if (req.body.images) vehicle.images = parseField(req.body.images);
    await vehicle.save();
    return sendSuccess(res, 'Vehicle updated successfully', vehicle);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return sendError(res, 'Vehicle not found', 404);
    if (vehicle.publicId) await deleteImage(vehicle.publicId).catch(() => {});
    await vehicle.deleteOne();
    return sendSuccess(res, 'Vehicle removed from fleet');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
