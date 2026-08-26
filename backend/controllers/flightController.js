import Flight from '../models/Flight.js';
import { uploadImageBuffer, deleteImage } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getFlights = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const filter = {};
    if (req.query.search) {
      filter.$or = [{ airline: new RegExp(req.query.search, 'i') }, { flightNumber: new RegExp(req.query.search, 'i') }, { destinationCity: new RegExp(req.query.search, 'i') }, { destinationCountry: new RegExp(req.query.search, 'i') }, { originCity: new RegExp(req.query.search, 'i') }];
    }
    if (req.query.destinationCountry && req.query.destinationCountry !== 'All') filter.destinationCountry = new RegExp(req.query.destinationCountry.trim(), 'i');
    if (req.query.destinationCity && req.query.destinationCity !== 'All') filter.destinationCity = new RegExp(req.query.destinationCity.trim(), 'i');
    if (req.query.cabinClass && req.query.cabinClass !== 'All') filter.cabinClass = req.query.cabinClass;
    const total = await Flight.countDocuments(filter);
    const flights = await Flight.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    return sendSuccess(res, 'Flights fetched successfully', { flights, total, page, pages: Math.ceil(total / limit) || 1, limit });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id).lean();
    if (!flight) return sendError(res, 'Flight not found', 404);
    return sendSuccess(res, 'Flight details fetched', flight);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createFlight = async (req, res) => {
  try {
    const { airline, flightNumber, aircraft, originCountry, originCity, originAirport, destinationCountry, destinationCity, destinationAirport, departureTime, arrivalTime, duration, cabinClass, price, baggage, status, bookingUrl, featured } = req.body;
    if (!airline || !flightNumber || !destinationCountry || !destinationCity || !price) {
      return sendError(res, 'Airline, flight code, destination, and ticket price are required', 400);
    }
    let coverImage = req.body.coverImage || '';
    let publicId = '';
    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/flights');
      coverImage = uploadResult.url;
      publicId = uploadResult.publicId;
    }
    if (!coverImage) {
      coverImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&auto=format&fit=crop&q=80';
    }
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : (val || []));
    const flight = await Flight.create({
      airline: airline.trim(), flightNumber: flightNumber.trim().toUpperCase(),
      aircraft: aircraft ? aircraft.trim() : 'Boeing 787 Dreamliner',
      originCountry: originCountry ? originCountry.trim() : 'United Arab Emirates',
      originCity: originCity ? originCity.trim() : 'Dubai',
      originAirport: originAirport ? originAirport.trim().toUpperCase() : 'DXB',
      destinationCountry: destinationCountry.trim(), destinationCity: destinationCity.trim(),
      destinationAirport: destinationAirport ? destinationAirport.trim().toUpperCase() : 'HND',
      departureTime: departureTime || '10:30 AM', arrivalTime: arrivalTime || '06:45 PM',
      duration: duration || '7h 15m (Non-Stop)', cabinClass: cabinClass || 'Economy',
      price: price.trim(), baggage: baggage || '30 kg Check-in + 7 kg Cabin',
      status: status || 'Available', coverImage, publicId,
      images: parseField(req.body.images), bookingUrl: bookingUrl || '',
      featured: featured === 'true' || featured === true
    });
    return sendSuccess(res, 'Flight scheduled successfully', flight, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return sendError(res, 'Flight not found', 404);
    let coverImage = flight.coverImage;
    let publicId = flight.publicId;
    if (req.file) {
      if (publicId) await deleteImage(publicId);
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/flights');
      coverImage = uploadResult.url;
      publicId = uploadResult.publicId;
    }
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : (val || []));
    const fields = ['airline', 'flightNumber', 'aircraft', 'originCountry', 'originCity', 'originAirport', 'destinationCountry', 'destinationCity', 'destinationAirport', 'departureTime', 'arrivalTime', 'duration', 'cabinClass', 'price', 'baggage', 'status', 'bookingUrl'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) flight[f] = req.body[f];
    });
    if (req.body.images !== undefined) flight.images = parseField(req.body.images);
    if (req.body.featured !== undefined) flight.featured = req.body.featured === 'true' || req.body.featured === true;
    flight.coverImage = coverImage;
    flight.publicId = publicId;
    await flight.save();
    return sendSuccess(res, 'Flight updated successfully', flight);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return sendError(res, 'Flight not found', 404);
    if (flight.publicId) await deleteImage(flight.publicId);
    await flight.deleteOne();
    return sendSuccess(res, 'Flight removed from schedule');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
