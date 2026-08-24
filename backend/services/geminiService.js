import { getGeminiModel, AVAILABLE_MODELS } from '../config/gemini.js';
import { buildItineraryPrompt, buildChatRefinePrompt } from '../utils/promptTemplates.js';

const cleanJsonResponse = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return JSON.parse(cleaned.trim());
};

const executeWithFallback = async (prompt) => {
  let lastError = null;
  for (const modelName of AVAILABLE_MODELS) {
    try {
      const model = getGeminiModel(modelName);
      if (!model) {
        throw new Error('Gemini API key is not configured in backend .env');
      }
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();
      return cleanJsonResponse(rawText);
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(lastError?.message || 'Failed to generate content with available Gemini models');
};

export const generateAiItinerary = async (tripParams) => {
  const prompt = buildItineraryPrompt(tripParams);
  return await executeWithFallback(prompt);
};

export const refineAiItinerary = async (currentItinerary, userMessage) => {
  const prompt = buildChatRefinePrompt(currentItinerary, userMessage);
  return await executeWithFallback(prompt);
};

export const chatWithGemini = async (message, history = [], tripContext = null) => {
  let prompt = `You are WanderSync AI Travel Concierge, an expert global travel advisor and itinerary assistant.
You help travelers with destination recommendations, packing advice, local customs, weather insights, itinerary adjustments, and travel planning tips.
Provide friendly, concise, well-structured, and helpful advice formatted in clean markdown (bullet points, bold highlights).\n`;

  if (tripContext) {
    prompt += `\nACTIVE ITINERARY CONTEXT:
Destination: ${tripContext.destination || 'N/A'}
Duration: ${tripContext.durationDays || 'N/A'} Days
Budget: ${tripContext.budgetLevel || 'N/A'}
Travel Style: ${tripContext.travelStyle || 'N/A'}
Title: ${tripContext.title || 'N/A'}\n`;
  }

  if (history && history.length > 0) {
    prompt += `\nCONVERSATION HISTORY:\n` + history.slice(-6).map((h) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n') + `\n`;
  }

  prompt += `\nUser's Message: ${message}\nAssistant:`;

  let lastError = null;
  for (const modelName of AVAILABLE_MODELS) {
    try {
      const model = getGeminiModel(modelName, false);
      if (!model) throw new Error('Gemini API key is not configured in backend .env');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(lastError?.message || 'Failed to generate response from Gemini');
};
