import Trip from '../models/Trip.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const generateSlug = () => Math.random().toString(36).substring(2, 10);

export const getUserTrips = async (req, res) => {
  try {
    if (!req.user) return sendError(res, 'Not authorized, please sign in', 401);
    const userEmail = req.user.email?.toLowerCase();
    const trips = await Trip.find({
      $or: [
        { user: req.user._id },
        { 'collaborators.user': req.user._id },
        { 'collaborators.email': userEmail }
      ]
    }).sort({ createdAt: -1 }).lean();
    return sendSuccess(res, 'Trips retrieved successfully', trips);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('collaborators.user', 'name email avatar')
      .populate('selectedFlight')
      .populate('selectedHotel')
      .populate('selectedVehicle')
      .lean();
    if (!trip) {
      return sendError(res, 'Trip not found', 404);
    }
    const isOwner = req.user && trip.user.toString() === req.user._id.toString();
    const userEmail = req.user?.email?.toLowerCase();
    const isCollaborator = req.user && trip.collaborators?.some(c => 
      (c.user && c.user._id?.toString() === req.user._id.toString()) || (c.email && c.email.toLowerCase() === userEmail)
    );
    if (!isOwner && !isCollaborator && !trip.isPublic) {
      return sendError(res, 'Not authorized to view this trip', 403);
    }
    return sendSuccess(res, 'Trip fetched successfully', trip);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getPublicTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ isPublic: true }).populate('user', 'name avatar').sort({ createdAt: -1 }).limit(12).lean();
    return sendSuccess(res, 'Public community trips retrieved', trips);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getSharedTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ shareSlug: req.params.shareSlug, isPublic: true }).populate('user', 'name avatar').lean();
    if (!trip) {
      return sendError(res, 'Shared trip not found or is private', 404);
    }
    return sendSuccess(res, 'Shared trip fetched successfully', trip);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createTrip = async (req, res) => {
  try {
    if (!req.user) return sendError(res, 'Authentication required to save trip', 401);

    const durationDays = Number(req.body.durationDays) || req.body.days?.length || 3;
    const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date();
    const endDate = req.body.endDate ? new Date(req.body.endDate) : new Date(startDate.getTime() + durationDays * 86400000);

    const destination = req.body.destination || {
      city: 'Destination',
      country: 'Global',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    };

    const validTimeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
    const validCategories = ['Sightseeing', 'Food', 'Culture', 'Adventure', 'Relaxation', 'Transit', 'Travel', 'Shopping', 'Entertainment', 'Dining', 'Lodging', 'Nature', 'Nightlife', 'Other'];

    const sanitizedDays = (req.body.days || []).map((day, dIdx) => ({
      dayNumber: Number(day.dayNumber) || (dIdx + 1),
      title: day.title || `Day ${dIdx + 1}`,
      theme: day.theme || '',
      activities: (day.activities || []).map((act) => ({
        ...act,
        timeSlot: validTimeSlots.includes(act.timeSlot) ? act.timeSlot : 'Morning',
        category: validCategories.includes(act.category) ? act.category : 'Sightseeing',
        title: act.title || 'Sightseeing Activity',
        locationName: act.locationName || destination.city || 'Central Spot',
        coordinates: act.coordinates || { lat: 0, lng: 0 }
      }))
    }));

    const tripData = {
      ...req.body,
      title: req.body.title || `${durationDays}-Day Trip to ${destination.city || 'Destination'}`,
      overview: req.body.overview || `Custom travel plan for ${destination.city || 'Destination'}.`,
      destination,
      durationDays,
      startDate,
      endDate,
      days: sanitizedDays,
      user: req.user._id,
      shareSlug: generateSlug()
    };

    const trip = await Trip.create(tripData);
    return sendSuccess(res, 'Trip saved successfully', trip, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateTrip = async (req, res) => {
  try {
    if (!req.user) return sendError(res, 'Authentication required to update trip', 401);
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return sendError(res, 'Trip not found', 404);
    }
    const isOwner = trip.user.toString() === req.user._id.toString();
    const userEmail = req.user.email?.toLowerCase();
    const collaborator = trip.collaborators?.find(c => 
      (c.user && c.user.toString() === req.user._id.toString()) || (c.email && c.email.toLowerCase() === userEmail)
    );
    const canEdit = isOwner || (collaborator && collaborator.role === 'editor');
    const isConfirmed = trip.bookingRequest?.status === 'confirmed';
    const isDirectRemoval = (req.body.selectedFlight === null && trip.selectedFlight) ||
                            (req.body.selectedHotel === null && trip.selectedHotel) ||
                            (req.body.selectedVehicle === null && trip.selectedVehicle);

    if (isConfirmed && isDirectRemoval && !req.body.bookingRequest?.cancellationRequest && req.user.role !== 'admin') {
      return sendError(res, 'Confirmed bookings cannot be removed directly without Admin approval. Please submit a cancellation request.', 400);
    }

    trip.bookingRequest = trip.bookingRequest || {};
    if (req.body.selectedFlight !== undefined && String(req.body.selectedFlight) !== String(trip.selectedFlight)) {
      if (trip.bookingRequest.flightStatus !== 'confirmed') trip.bookingRequest.flightStatus = 'none';
    }
    if (req.body.selectedHotel !== undefined && String(req.body.selectedHotel) !== String(trip.selectedHotel)) {
      if (trip.bookingRequest.hotelStatus !== 'confirmed') trip.bookingRequest.hotelStatus = 'none';
    }
    if (req.body.selectedVehicle !== undefined && String(req.body.selectedVehicle) !== String(trip.selectedVehicle)) {
      if (trip.bookingRequest.vehicleStatus !== 'confirmed') trip.bookingRequest.vehicleStatus = 'none';
    }

    if (req.body.bookingRequest) {
      const incoming = req.body.bookingRequest;
      if (incoming.flightStatus !== undefined) trip.bookingRequest.flightStatus = incoming.flightStatus;
      if (incoming.hotelStatus !== undefined) trip.bookingRequest.hotelStatus = incoming.hotelStatus;
      if (incoming.vehicleStatus !== undefined) trip.bookingRequest.vehicleStatus = incoming.vehicleStatus;
      if (incoming.userNotes !== undefined) trip.bookingRequest.userNotes = incoming.userNotes;
      if (incoming.totalAmount !== undefined) trip.bookingRequest.totalAmount = incoming.totalAmount;
      if (incoming.cancellationRequest) trip.bookingRequest.cancellationRequest = incoming.cancellationRequest;

      const statuses = [
        (trip.selectedFlight || req.body.selectedFlight) ? (trip.bookingRequest.flightStatus || 'pending') : null,
        (trip.selectedHotel || req.body.selectedHotel) ? (trip.bookingRequest.hotelStatus || 'pending') : null,
        (trip.selectedVehicle || req.body.selectedVehicle || trip.selectedCabService?.pickupLocation) ? (trip.bookingRequest.vehicleStatus || 'pending') : null
      ].filter(Boolean);

      if (statuses.some(s => s === 'pending')) {
        trip.bookingRequest.status = 'pending';
        trip.bookingRequest.requestedAt = new Date();
      } else if (statuses.length > 0 && statuses.every(s => s === 'confirmed')) {
        trip.bookingRequest.status = 'confirmed';
      } else if (statuses.length > 0 && statuses.every(s => s === 'rejected')) {
        trip.bookingRequest.status = 'rejected';
      } else if (statuses.some(s => s === 'confirmed')) {
        trip.bookingRequest.status = 'partially_confirmed';
      }
    }

    Object.assign(trip, req.body);
    trip.updatedAt = Date.now();
    await trip.save();
    const updatedTrip = await Trip.findById(trip._id)
      .populate('collaborators.user', 'name email avatar')
      .populate('selectedFlight')
      .populate('selectedHotel')
      .populate('selectedVehicle')
      .lean();
    return sendSuccess(res, 'Trip updated successfully', updatedTrip);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return sendError(res, 'Trip not found', 404);
    }
    if (trip.user.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to delete this trip', 403);
    }

    await trip.deleteOne();
    return sendSuccess(res, 'Trip deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const addCollaborator = async (req, res) => {
  try {
    const { email, role = 'editor' } = req.body;
    if (!email) return sendError(res, 'Collaborator email is required', 400);

    const trip = await Trip.findById(req.params.id);
    if (!trip) return sendError(res, 'Trip not found', 404);

    if (trip.user.toString() !== req.user._id.toString()) {
      return sendError(res, 'Only the trip owner can add collaborators', 403);
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail }).select('_id email name avatar').lean();

    const alreadyAdded = trip.collaborators.some(c => c.email.toLowerCase() === cleanEmail);
    if (alreadyAdded) {
      return sendError(res, 'User is already a collaborator on this trip', 400);
    }

    trip.collaborators.push({
      user: existingUser ? existingUser._id : null,
      email: cleanEmail,
      role,
      addedAt: new Date()
    });

    await trip.save();
    const updatedTrip = await Trip.findById(trip._id).populate('collaborators.user', 'name email avatar').lean();
    return sendSuccess(res, 'Collaborator added successfully', updatedTrip.collaborators);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const removeCollaborator = async (req, res) => {
  try {
    const { collaboratorId } = req.params;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return sendError(res, 'Trip not found', 404);

    if (trip.user.toString() !== req.user._id.toString()) {
      return sendError(res, 'Only the trip owner can remove collaborators', 403);
    }

    trip.collaborators = trip.collaborators.filter(c => c._id.toString() !== collaboratorId);
    await trip.save();
    return sendSuccess(res, 'Collaborator removed successfully', trip.collaborators);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getCollaborators = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('collaborators.user', 'name email avatar').lean();
    if (!trip) return sendError(res, 'Trip not found', 404);
    return sendSuccess(res, 'Collaborators fetched', trip.collaborators || []);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

