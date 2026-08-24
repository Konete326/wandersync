import { getGeminiModel } from '../config/gemini.js';
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

export const generateAiItinerary = async (tripParams) => {
  const model = getGeminiModel('gemini-1.5-flash');
  if (!model) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to backend .env');
  }

  const prompt = buildItineraryPrompt(tripParams);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();
  return cleanJsonResponse(rawText);
};

export const refineAiItinerary = async (currentItinerary, userMessage) => {
  const model = getGeminiModel('gemini-1.5-flash');
  if (!model) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to backend .env');
  }

  const prompt = buildChatRefinePrompt(currentItinerary, userMessage);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();
  return cleanJsonResponse(rawText);
};
