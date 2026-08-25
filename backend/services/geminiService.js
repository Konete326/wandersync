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
    { "name": "Attraction 1", "imageUrl": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80", "description": "Highlight info", "ticketPrice": "$15", "duration": "2-3 hours" }
  ],
  "hotels": [
    { "name": "Luxury Hotel 1", "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80", "rating": 4.9, "priceRange": "$$$$", "pricePerNight": "$280/night", "amenities": ["Free WiFi", "Infinity Pool"] }
  ],
  "localFoods": [
    { "name": "Local Signature Dish 1", "description": "Regional specialty", "price": "$12" }
  ]
}`;
  return await executeWithRetryAndFallback(prompt, true);
};

export const chatWithGemini = async (message, history = [], tripContext = null, isAdmin = false) => {
  if (isAdmin) {
    let prompt = `You are WanderSync AI Operations Copilot & Agency Commander. Return JSON: {"reply":"...", "generatedItinerary": null}\n`;
    if (history && history.length > 0) prompt += `\nHISTORY:\n` + history.slice(-6).map((h) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n') + `\n`;
    prompt += `\nUser's Message: ${message}\nAssistant:`;
    return await executeWithRetryAndFallback(prompt, true);
  }

  let prompt = `You are WanderSync AI Travel Concierge, an expert global travel advisor.
If the user asks to generate a full travel plan, create an itinerary, or says "pura plan bana kar do", "create 5-day plan for Tokyo", etc., return a JSON object with:
1. "reply": A warm, encouraging, conversational response summarizing the trip highlights.
2. "generatedItinerary": A complete valid Trip object (title, destination: {city, country, coordinates: {lat: Number, lng: Number}}, overview, highlights: [3-5 strings], budgetLevel, estimatedTotalCost: Number, currency: "USD", days: [{dayNumber: 1, title, theme, activities: [{timeSlot: "Morning"|"Afternoon"|"Evening"|"Night", title, description, locationName, coordinates: {lat: Number, lng: Number}, durationHours: Number, estimatedCost: Number, category: "Sightseeing"|"Food"|"Culture"|"Adventure"|"Relaxation"|"Transit", bookingLink: ""}]}], travelTips: {packing: [], localEtiquette: [], transitAdvice: []}).
If the user is only chatting or asking general travel questions, set "generatedItinerary": null and provide your answer in "reply".
Always output valid JSON in this exact structure: {"reply": "...", "generatedItinerary": null | {...}}\n`;

  if (tripContext) prompt += `\nACTIVE CONTEXT: ${typeof tripContext === 'string' ? tripContext : JSON.stringify(tripContext)}\n`;
  if (history && history.length > 0) prompt += `\nHISTORY:\n` + history.slice(-6).map((h) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n') + `\n`;
  prompt += `\nUser's Message: ${message}\nAssistant:`;

  return await executeWithRetryAndFallback(prompt, true);
};
