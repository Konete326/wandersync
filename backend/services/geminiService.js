import { getGeminiModel, AVAILABLE_MODELS } from '../config/gemini.js';
import { buildItineraryPrompt, buildChatRefinePrompt } from '../utils/promptTemplates.js';

const cleanJsonResponse = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
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
        if (attempt < 3) await sleep(attempt * 1000);
      }
    }
  }
  throw new Error(lastError?.message || 'Failed to generate content with Gemini after retries');
};

export const generateAiItinerary = async (tripParams) => {
  return await executeWithRetryAndFallback(buildItineraryPrompt(tripParams), true);
};

export const refineAiItinerary = async (currentItinerary, userMessage) => {
  return await executeWithRetryAndFallback(buildChatRefinePrompt(currentItinerary, userMessage), true);
};

export const autofillDestinationData = async (country, city) => {
  const prompt = `Return a JSON object for travel destination "${city}", "${country}".
JSON schema:
{
  "title": "Title for ${city}",
  "location": "${city}, ${country}",
  "category": "Landscape",
  "description": "2-3 sentence overview of ${city}",
  "bestTimeToVisit": "e.g. Oct - Apr",
  "idealDuration": "e.g. 5-7 Days",
  "estimatedBudget": "e.g. $140-$220/day",
  "currency": "e.g. USD / EUR / JPY",
  "language": "e.g. English / Japanese",
  "transportation": "e.g. JR Metro & Taxis",
  "travelTips": ["Tip 1", "Tip 2", "Tip 3"],
  "touristPlaces": [
    { "name": "Attraction 1", "imageUrl": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80", "description": "Highlight info", "ticketPrice": "$15", "duration": "2-3 hours" },
    { "name": "Attraction 2", "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80", "description": "Highlight info", "ticketPrice": "Free", "duration": "1-2 hours" }
  ],
  "hotels": [
    { "name": "Luxury Hotel 1", "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80", "rating": 4.9, "priceRange": "$$$$", "pricePerNight": "$280/night", "amenities": ["Free WiFi", "Infinity Pool", "Breakfast Included"] },
    { "name": "Boutique Hotel 2", "imageUrl": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80", "rating": 4.7, "priceRange": "$$$", "pricePerNight": "$165/night", "amenities": ["Free WiFi", "Central Location"] }
  ],
  "localFoods": [
    { "name": "Local Signature Dish 1", "description": "Crispy traditional specialty", "price": "$12" },
    { "name": "Popular Street Food 2", "description": "Famous regional snack", "price": "$8" }
  ]
}`;
  return await executeWithRetryAndFallback(prompt, true);
};

export const chatWithGemini = async (message, history = [], tripContext = null) => {
  let prompt = `You are WanderSync AI Travel Concierge, an expert global travel advisor.\n`;
  if (tripContext) prompt += `\nACTIVE ITINERARY CONTEXT: ${tripContext.destination || 'N/A'}, ${tripContext.durationDays || 'N/A'} Days.\n`;
  if (history && history.length > 0) prompt += `\nHISTORY:\n` + history.slice(-6).map((h) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n') + `\n`;
  prompt += `\nUser's Message: ${message}\nAssistant:`;
  return await executeWithRetryAndFallback(prompt, false);
};
