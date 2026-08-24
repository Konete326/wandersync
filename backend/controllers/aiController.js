import { generateAiItinerary, refineAiItinerary, chatWithGemini } from '../services/geminiService.js';
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
    const { message, history, tripContext } = req.body;
    if (!message) {
      return sendError(res, 'Message is required', 400);
    }

    const reply = await chatWithGemini(message, history || [], tripContext || null);
    return sendSuccess(res, 'Assistant response generated', { reply });
  } catch (error) {
    return sendError(res, error.message || 'Failed to chat with AI assistant', 500);
  }
};
