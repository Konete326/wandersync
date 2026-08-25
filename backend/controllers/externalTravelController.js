import { fetchExternalPlaces } from '../services/placesIntegrationService.js';
import { fetchExternalHotels } from '../services/hotelIntegrationService.js';
import { fetchExternalTransport } from '../services/transportIntegrationService.js';
import { fetchExternalEvents } from '../services/eventsIntegrationService.js';
import { getActiveProviders } from '../config/travelApis.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getPlaces = async (req, res) => {
  try {
    const { city, country } = req.query;
    if (!city) return sendError(res, 'City query is required', 400);
    const data = await fetchExternalPlaces(city, country);
    return sendSuccess(res, `Live places retrieved for ${city}`, data);
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch places', 500);
  }
};

export const getHotels = async (req, res) => {
  try {
    const { city, country } = req.query;
    if (!city) return sendError(res, 'City query is required', 400);
    const data = await fetchExternalHotels(city, country);
    return sendSuccess(res, `Live hotels retrieved for ${city}`, data);
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch hotels', 500);
  }
};

export const getTransport = async (req, res) => {
  try {
    const { origin, destination } = req.query;
    const data = await fetchExternalTransport(origin || 'JFK', destination || 'HND');
    return sendSuccess(res, 'Live flight & transport options retrieved', data);
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch transport', 500);
  }
};

export const getEvents = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return sendError(res, 'City query is required', 400);
    const data = await fetchExternalEvents(city);
    return sendSuccess(res, `Live events retrieved for ${city}`, data);
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch events', 500);
  }
};

export const getIntegrationStatus = async (req, res) => {
  try {
    const providers = getActiveProviders();
    return sendSuccess(res, 'External Travel API Provider Status', providers);
  } catch (error) {
    return sendError(res, 'Failed to fetch integration telemetry', 500);
  }
};
