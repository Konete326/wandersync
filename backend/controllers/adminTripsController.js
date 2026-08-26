import Trip from '../models/Trip.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAdminAllTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { 'destination.city': new RegExp(req.query.search, 'i') },
        { 'destination.country': new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.visibility === 'public') filter.isPublic = true;
    if (req.query.visibility === 'private') filter.isPublic = false;
    if (req.query.featured === 'true') filter.featured = true;
    if (req.query.country && req.query.country !== 'All') {
      filter['destination.country'] = new RegExp(`^${req.query.country}$`, 'i');
    }
    if (req.query.bookingStatus && req.query.bookingStatus !== 'all') {
      if (req.query.bookingStatus === 'cancellation_requested') {
        filter['bookingRequest.cancellationRequest.isPending'] = true;
      } else if (req.query.bookingStatus === 'pending') {
        filter.$or = [
          { 'bookingRequest.status': 'pending' },
          { 'bookingRequest.flightStatus': 'pending' },
          { 'bookingRequest.hotelStatus': 'pending' },
          { 'bookingRequest.vehicleStatus': 'pending' }
        ];
      } else {
        filter['bookingRequest.status'] = req.query.bookingStatus;
      }
    }
    const total = await Trip.countDocuments(filter);
    const trips = await Trip.find(filter)
      .populate('user', 'name email avatar')
      .populate('selectedFlight')
      .populate('selectedHotel')
      .populate('selectedVehicle')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return sendSuccess(res, 'Admin trips fetched', {
      trips,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateTripBookingStatusAdmin = async (req, res) => {
  try {
    const { status, itemType, itemStatus, adminNotes } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return sendError(res, 'Trip not found', 404);
    trip.bookingRequest = trip.bookingRequest || {};

    if (itemType && ['flight', 'hotel', 'vehicle'].includes(itemType)) {
      if (itemType === 'flight') trip.bookingRequest.flightStatus = itemStatus;
      if (itemType === 'hotel') trip.bookingRequest.hotelStatus = itemStatus;
      if (itemType === 'vehicle') trip.bookingRequest.vehicleStatus = itemStatus;
      const sArr = [
        trip.selectedFlight ? (trip.bookingRequest.flightStatus || 'pending') : null,
        trip.selectedHotel ? (trip.bookingRequest.hotelStatus || 'pending') : null,
        (trip.selectedVehicle || trip.selectedCabService?.pickupLocation) ? (trip.bookingRequest.vehicleStatus || 'pending') : null
      ].filter(Boolean);
      if (sArr.length > 0 && sArr.every(s => s === 'confirmed')) trip.bookingRequest.status = 'confirmed';
      else if (sArr.length > 0 && sArr.every(s => s === 'rejected')) trip.bookingRequest.status = 'rejected';
      else if (sArr.some(s => s === 'pending')) trip.bookingRequest.status = 'pending';
      else if (sArr.some(s => s === 'confirmed')) trip.bookingRequest.status = 'partially_confirmed';
      else trip.bookingRequest.status = 'none';
    } else if (status === 'approve_cancellation') {
      const itc = trip.bookingRequest.cancellationRequest?.itemType || 'all';
      if (itc === 'flight') { trip.selectedFlight = null; trip.bookingRequest.flightStatus = 'none'; }
      if (itc === 'hotel') { trip.selectedHotel = null; trip.bookingRequest.hotelStatus = 'none'; }
      if (itc === 'vehicle' || itc === 'cab') {
        trip.selectedVehicle = null;
        trip.selectedCabService = { pickupLocation: '', dropoffLocation: '', cabType: 'Standard Sedan', estimatedFare: 0, bookedAt: null };
        trip.bookingRequest.vehicleStatus = 'none';
      }
      if (itc === 'all') {
        trip.selectedFlight = null; trip.selectedHotel = null; trip.selectedVehicle = null;
        trip.selectedCabService = { pickupLocation: '', dropoffLocation: '', cabType: 'Standard Sedan', estimatedFare: 0, bookedAt: null };
        trip.bookingRequest.status = 'none';
        trip.bookingRequest.flightStatus = 'none';
        trip.bookingRequest.hotelStatus = 'none';
        trip.bookingRequest.vehicleStatus = 'none';
      }
      trip.bookingRequest.cancellationRequest = { isPending: false, itemType: '', reason: '', requestedAt: null };
      trip.bookingRequest.adminNotes = adminNotes || 'Cancellation approved by admin.';
    } else if (status === 'reject_cancellation') {
      trip.bookingRequest.cancellationRequest = { isPending: false, itemType: '', reason: '', requestedAt: null };
      trip.bookingRequest.adminNotes = adminNotes || 'Cancellation declined by admin.';
    } else if (status === 'confirmed') {
      trip.bookingRequest.status = 'confirmed';
      if (trip.selectedFlight) trip.bookingRequest.flightStatus = 'confirmed';
      if (trip.selectedHotel) trip.bookingRequest.hotelStatus = 'confirmed';
      if (trip.selectedVehicle || trip.selectedCabService?.pickupLocation) trip.bookingRequest.vehicleStatus = 'confirmed';
      trip.bookingRequest.confirmedAt = new Date();
    } else if (status === 'rejected') {
      trip.bookingRequest.status = 'rejected';
      if (trip.selectedFlight) trip.bookingRequest.flightStatus = 'rejected';
      if (trip.selectedHotel) trip.bookingRequest.hotelStatus = 'rejected';
      if (trip.selectedVehicle || trip.selectedCabService?.pickupLocation) trip.bookingRequest.vehicleStatus = 'rejected';
    }

    if (adminNotes) trip.bookingRequest.adminNotes = adminNotes;
    await trip.save();
    const populated = await Trip.findById(trip._id)
      .populate('user', 'name email avatar')
      .populate('selectedFlight')
      .populate('selectedHotel')
      .populate('selectedVehicle');
    return sendSuccess(res, `Booking updated`, populated);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const toggleTripFeaturedAdmin = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return sendError(res, 'Trip not found', 404);
    trip.featured = !trip.featured;
    await trip.save();
    return sendSuccess(res, `Trip ${trip.featured ? 'featured' : 'unfeatured'}`, trip);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const toggleTripVisibilityAdmin = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return sendError(res, 'Trip not found', 404);
    trip.isPublic = !trip.isPublic;
    if (trip.isPublic && !trip.shareSlug) {
      trip.shareSlug = `${trip.destination.city.toLowerCase()}-${Date.now().toString(36)}`;
    }
    await trip.save();
    return sendSuccess(res, `Trip is now ${trip.isPublic ? 'Public' : 'Private'}`, trip);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteTripAdmin = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return sendError(res, 'Trip not found', 404);
    await trip.deleteOne();
    return sendSuccess(res, 'Trip deleted');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
