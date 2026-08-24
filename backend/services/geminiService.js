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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const executeWithRetryAndFallback = async (prompt, isJson = true) => {
  let lastError = null;

  for (const modelName of AVAILABLE_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const model = getGeminiModel(modelName, isJson);
        if (!model) throw new Error('Gemini API key is not configured in backend .env');

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        return isJson ? cleanJsonResponse(rawText) : rawText;
      } catch (error) {
        lastError = error;
        if (attempt < 3) {
          await sleep(attempt * 1000);
        }
      }
    }
  }

  throw new Error(lastError?.message || 'Failed to generate content with available Gemini models after multiple retries');
};

export const generateAiItinerary = async (tripParams) => {
  const prompt = buildItineraryPrompt(tripParams);
  return await executeWithRetryAndFallback(prompt, true);
};

export const refineAiItinerary = async (currentItinerary, userMessage) => {
  const prompt = buildChatRefinePrompt(currentItinerary, userMessage);
  return await executeWithRetryAndFallback(prompt, true);
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
    { "name": "Luxury Hotel 1", "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80", "rating": 4.9, "priceRange": "$$$$", "pricePerNight": "$280/night" },
    { "name": "Boutique Hotel 2", "imageUrl": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80", "rating": 4.7, "priceRange": "$$$", "pricePerNight": "$165/night" }
  ]
}`;
  return await executeWithRetryAndFallback(prompt, true);
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

  return await executeWithRetryAndFallback(prompt, false);
};
