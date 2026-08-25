import Trip from '../models/Trip.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const generateSlug = () => Math.random().toString(36).substring(2, 10);

export const getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    return sendSuccess(res, 'Trips retrieved successfully', trips);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).lean();
    if (!trip) {
      return sendError(res, 'Trip not found', 404);
    }
    if (trip.user.toString() !== req.user._id.toString() && !trip.isPublic) {
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
    const tripData = {
      ...req.body,
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
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return sendError(res, 'Trip not found', 404);
    }
    if (trip.user.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to update this trip', 403);
    }

    Object.assign(trip, req.body);
    trip.updatedAt = Date.now();
    const updatedTrip = await trip.save();
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
