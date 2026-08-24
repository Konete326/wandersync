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
