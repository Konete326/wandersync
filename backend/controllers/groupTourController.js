import GroupTour from '../models/GroupTour.js';
import TourBooking from '../models/TourBooking.js';
import { uploadImageBuffer, deleteImage } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getGroupTours = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const filter = {};
    if (req.query.search) {
      filter.$or = [{ title: new RegExp(req.query.search, 'i') }, { city: new RegExp(req.query.search, 'i') }, { country: new RegExp(req.query.search, 'i') }];
    }
    if (req.query.country && req.query.country !== 'All') filter.country = new RegExp(`^${req.query.country}$`, 'i');
    if (req.query.status && req.query.status !== 'All') filter.status = req.query.status;
    const total = await GroupTour.countDocuments(filter);
    const tours = await GroupTour.find(filter).sort({ startDate: 1 }).skip((page - 1) * limit).limit(limit);
    return sendSuccess(res, 'Group tours retrieved', { tours, total, page, pages: Math.ceil(total / limit) || 1, limit });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getGroupTourById = async (req, res) => {
  try {
    const tour = await GroupTour.findById(req.params.id);
    if (!tour) return sendError(res, 'Group tour not found', 404);
    return sendSuccess(res, 'Group tour details', tour);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createGroupTour = async (req, res) => {
  try {
    const { title, tagline, category, country, city, startDate, endDate, durationDays, totalCapacity, pricePerPerson, tourGuideName, tourGuidePhone, status, featured } = req.body;
    if (!title || !country || !city || !startDate || !endDate || !pricePerPerson) {
      return sendError(res, 'Tour title, destination, dates, and seat pricing are required', 400);
    }
    let coverImage = req.body.coverImage || '';
    let publicId = '';
    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/tours');
      coverImage = uploadResult.url;
      publicId = uploadResult.publicId;
    }
    if (!coverImage) return sendError(res, 'Please provide a group tour cover photo', 400);
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : (val || []));
    const tour = await GroupTour.create({
      title: title.trim(), tagline: tagline ? tagline.trim() : 'All-inclusive guided group expedition',
      category: category || 'Cultural & Adventure', country: country.trim(), city: city.trim(),
      startDate: new Date(startDate), endDate: new Date(endDate), durationDays: Number(durationDays) || 7,
      totalCapacity: Number(totalCapacity) || 20, bookedSeats: 0, pricePerPerson: Number(pricePerPerson),
      inclusions: parseField(req.body.inclusions), tourGuideName: tourGuideName || 'Senior Tour Maestro',
      tourGuidePhone: tourGuidePhone || '+1 (800) 555-TOUR', coverImage, publicId,
      images: parseField(req.body.images), status: status || 'Open',
      featured: featured === 'true' || featured === true
    });
    return sendSuccess(res, 'Group tour published successfully', tour, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateGroupTour = async (req, res) => {
  try {
    const tour = await GroupTour.findById(req.params.id);
    if (!tour) return sendError(res, 'Group tour not found', 404);
    let coverImage = tour.coverImage;
    let publicId = tour.publicId;
    if (req.file) {
      if (publicId) await deleteImage(publicId);
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/tours');
      coverImage = uploadResult.url;
      publicId = uploadResult.publicId;
    }
    const parseField = (val) => (typeof val === 'string' ? JSON.parse(val) : (val || []));
    const fields = ['title', 'tagline', 'category', 'country', 'city', 'durationDays', 'totalCapacity', 'pricePerPerson', 'tourGuideName', 'tourGuidePhone', 'status'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) tour[f] = req.body[f];
    });
    if (req.body.startDate) tour.startDate = new Date(req.body.startDate);
    if (req.body.endDate) tour.endDate = new Date(req.body.endDate);
    if (req.body.inclusions !== undefined) tour.inclusions = parseField(req.body.inclusions);
    if (req.body.images !== undefined) tour.images = parseField(req.body.images);
    if (req.body.featured !== undefined) tour.featured = req.body.featured === 'true' || req.body.featured === true;
    tour.coverImage = coverImage;
    tour.publicId = publicId;
    await tour.save();
    return sendSuccess(res, 'Group tour updated successfully', tour);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteGroupTour = async (req, res) => {
  try {
    const tour = await GroupTour.findById(req.params.id);
    if (!tour) return sendError(res, 'Group tour not found', 404);
    if (tour.publicId) await deleteImage(tour.publicId);
    await TourBooking.deleteMany({ tour: tour._id });
    await tour.deleteOne();
    return sendSuccess(res, 'Group tour package deleted');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createPOSBooking = async (req, res) => {
  try {
    const { tourId, customerName, customerEmail, customerPhone, passengersCount, discountAmount, paymentMethod, paymentStatus, specialRequests } = req.body;
    if (!tourId || !customerName || !customerEmail || !passengersCount) {
      return sendError(res, 'Tour selection, customer details, and seat count are required', 400);
    }
    const tour = await GroupTour.findById(tourId);
    if (!tour) return sendError(res, 'Tour package not found', 404);
    const count = Number(passengersCount) || 1;
    const availableSeats = tour.totalCapacity - tour.bookedSeats;
    if (availableSeats < count) return sendError(res, `Only ${availableSeats} seat(s) remaining in this tour`, 400);
    const unitPrice = tour.pricePerPerson;
    const discount = Number(discountAmount) || 0;
    const totalPaid = Math.max(0, (unitPrice * count) - discount);
    const bookingCode = `WS-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const booking = await TourBooking.create({
      bookingCode, tour: tour._id, customerName: customerName.trim(), customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone ? customerPhone.trim() : '+1-555-0199', passengersCount: count, unitPrice,
      discountAmount: discount, totalPaid, paymentMethod: paymentMethod || 'POS Terminal', paymentStatus: paymentStatus || 'Paid',
      specialRequests: specialRequests || '', bookedBy: req.user._id
    });
    tour.bookedSeats += count;
    if (tour.bookedSeats >= tour.totalCapacity) tour.status = 'Sold Out';
    else if (tour.bookedSeats >= tour.totalCapacity * 0.75) tour.status = 'Filling Fast';
    await tour.save();
    const populated = await TourBooking.findById(booking._id).populate('tour');
    return sendSuccess(res, 'Tour booking & POS ticket issued successfully', populated, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getTourBookings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = {};
    if (req.query.tourId) filter.tour = req.query.tourId;
    const bookings = await TourBooking.find(filter).populate('tour').sort({ createdAt: -1 }).limit(limit);
    return sendSuccess(res, 'Tour bookings retrieved', bookings);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
