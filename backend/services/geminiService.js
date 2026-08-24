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

export const autofillDestinationData = async (country, city) => {
  const prompt = `Return a JSON object for travel destination "${city}", "${country}".
JSON schema:
{
  "title": "Title for ${city}",
  "location": "${city}, ${country}",
  "category": "Landscape",
  "description": "2-sentence overview of ${city}",
  "touristPlaces": [
    { "name": "Top Landmark 1", "imageUrl": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80", "description": "Highlight description" },
    { "name": "Top Landmark 2", "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80", "description": "Highlight description" }
  ],
  "hotels": [
    { "name": "Luxury Hotel 1", "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80", "rating": 4.9, "priceRange": "$$$$" },
    { "name": "Boutique Hotel 2", "imageUrl": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80", "rating": 4.7, "priceRange": "$$$" }
  ]
}`;
  return await executeWithFallback(prompt);
};

export const chatWithGemini = async (message, history = [], tripContext = null) => {
  let prompt = `You are WanderSync AI Travel Concierge, an expert global travel advisor.\n`;
  if (tripContext) {
    prompt += `\nACTIVE ITINERARY CONTEXT: ${tripContext.destination || 'N/A'}, ${tripContext.durationDays || 'N/A'} Days.\n`;
  }
  if (history && history.length > 0) {
    prompt += `\nHISTORY:\n` + history.slice(-6).map((h) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n') + `\n`;
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
