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
    const total = await Trip.countDocuments(filter);
    const trips = await Trip.find(filter)
      .populate('user', 'name email avatar')
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

export const toggleTripFeaturedAdmin = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return sendError(res, 'Trip not found', 404);
    trip.featured = !trip.featured;
    await trip.save();
    return sendSuccess(res, `Trip ${trip.featured ? 'featured on homepage' : 'unfeatured'}`, trip);
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
    return sendSuccess(res, 'Trip itinerary removed from platform');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
