import TourBooking from '../models/TourBooking.js';
import GroupTour from '../models/GroupTour.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAdminCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { customerName: new RegExp(req.query.search, 'i') },
        { customerEmail: new RegExp(req.query.search, 'i') },
        { customerPhone: new RegExp(req.query.search, 'i') },
        { bookingCode: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.paymentStatus && req.query.paymentStatus !== 'All') filter.paymentStatus = req.query.paymentStatus;
    const total = await TourBooking.countDocuments(filter);
    const bookings = await TourBooking.find(filter)
      .populate('tour', 'title city country startDate endDate pricePerPerson coverImage')
      .populate('bookedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return sendSuccess(res, 'Active service customers retrieved', {
      customers: bookings,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createAdminCustomer = async (req, res) => {
  try {
    const { tourId, customerName, customerEmail, customerPhone, passengersCount, totalPaid, paymentMethod, paymentStatus, specialRequests } = req.body;
    if (!customerName || !customerEmail || !tourId) return sendError(res, 'Customer name, email, and tour package are required', 400);
    const tour = await GroupTour.findById(tourId);
    if (!tour) return sendError(res, 'Tour package not found', 404);
    const count = Number(passengersCount) || 1;
    const bookingCode = `WS-CUST-${Date.now().toString(36).toUpperCase()}`;
    const booking = await TourBooking.create({
      bookingCode, tour: tour._id, customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(), customerPhone: customerPhone ? customerPhone.trim() : '+1-555-0100',
      passengersCount: count, unitPrice: tour.pricePerPerson, totalPaid: Number(totalPaid) || (tour.pricePerPerson * count),
      paymentMethod: paymentMethod || 'Cash', paymentStatus: paymentStatus || 'Paid',
      specialRequests: specialRequests || '', bookedBy: req.user._id
    });
    tour.bookedSeats += count;
    await tour.save();
    const populated = await TourBooking.findById(booking._id).populate('tour');
    return sendSuccess(res, 'Customer service booking created', populated, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateAdminCustomer = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, paymentStatus, paymentMethod, specialRequests } = req.body;
    const booking = await TourBooking.findById(req.params.id);
    if (!booking) return sendError(res, 'Customer booking record not found', 404);
    if (customerName) booking.customerName = customerName.trim();
    if (customerEmail) booking.customerEmail = customerEmail.trim().toLowerCase();
    if (customerPhone) booking.customerPhone = customerPhone.trim();
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (paymentMethod) booking.paymentMethod = paymentMethod;
    if (specialRequests !== undefined) booking.specialRequests = specialRequests;
    await booking.save();
    const populated = await TourBooking.findById(booking._id).populate('tour');
    return sendSuccess(res, 'Customer booking record updated', populated);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteAdminCustomer = async (req, res) => {
  try {
    const booking = await TourBooking.findById(req.params.id);
    if (!booking) return sendError(res, 'Customer booking not found', 404);
    const tour = await GroupTour.findById(booking.tour);
    if (tour) {
      tour.bookedSeats = Math.max(0, tour.bookedSeats - booking.passengersCount);
      if (tour.status === 'Sold Out' && tour.bookedSeats < tour.totalCapacity) tour.status = 'Open';
      await tour.save();
    }
    await booking.deleteOne();
    return sendSuccess(res, 'Customer record and seat allocation removed');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
