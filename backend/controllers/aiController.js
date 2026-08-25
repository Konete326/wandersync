import { generateAiItinerary, refineAiItinerary, chatWithGemini, autofillDestinationData } from '../services/geminiService.js';
import { autofillEntityData } from '../services/geminiEntityService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const generateItinerary = async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      durationDays,
      budgetLevel,
      travelStyle,
      companions,
      interests,
      currency
    } = req.body;

    if (!destination || !durationDays) {
      return sendError(res, 'Destination and duration are required', 400);
    }

    const itinerary = await generateAiItinerary({
      destination,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + durationDays * 86400000).toISOString().split('T')[0],
      durationDays: Number(durationDays) || 3,
      budgetLevel: budgetLevel || 'Moderate',
      travelStyle: travelStyle || 'moderate',
      companions: companions || 'Solo',
      interests: interests || 'Sightseeing, Culture, Food',
      currency: currency || 'USD'
    });

    return sendSuccess(res, 'AI Itinerary generated successfully', itinerary);
  } catch (error) {
    return sendError(res, error.message || 'Failed to generate itinerary with AI', 500);
  }
};

export const refineItinerary = async (req, res) => {
  try {
    const { currentItinerary, message } = req.body;
    if (!currentItinerary || !message) {
      return sendError(res, 'Itinerary context and user message are required', 400);
    }

    const refinement = await refineAiItinerary(currentItinerary, message);
    return sendSuccess(res, 'AI refinement processed', refinement);
  } catch (error) {
    return sendError(res, error.message || 'Failed to refine itinerary', 500);
  }
};

export const chatAssistant = async (req, res) => {
  try {
    const { message, history, tripContext, isAdmin } = req.body;
    if (!message) {
      return sendError(res, 'Message is required', 400);
    }

    const isUserAdmin = req.user?.role === 'admin' || Boolean(isAdmin);
    const reply = await chatWithGemini(message, history || [], tripContext || null, isUserAdmin);
    return sendSuccess(res, 'Assistant response generated', { reply });
  } catch (error) {
    return sendError(res, error.message || 'Failed to chat with AI assistant', 500);
  }
};

export const autofillDestination = async (req, res) => {
  try {
    const { country, city } = req.body;
    if (!country || !city) {
      return sendError(res, 'Country and City are required for AI autofill', 400);
    }

    const data = await autofillDestinationData(country, city);
    return sendSuccess(res, 'Destination AI telemetry retrieved', data);
  } catch (error) {
    return sendError(res, error.message || 'Failed to autofill destination', 500);
  }
};

export const autofillEntity = async (req, res) => {
  try {
    const { type, query } = req.body;
    if (!type || !query) {
      return sendError(res, 'Entity type and search query are required for AI autofill', 400);
    }

    const data = await autofillEntityData(type, query);
    return sendSuccess(res, `AI generated ${type} metadata successfully`, data);
  } catch (error) {
    return sendError(res, error.message || 'Failed to generate entity with AI', 500);
  }
};
