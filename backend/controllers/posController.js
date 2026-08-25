import GroupTour from '../models/GroupTour.js';
import TourBooking from '../models/TourBooking.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

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
