import openai, { OPENAI_MODEL, isOpenAiConfigured } from '../config/openai.js';
import { buildItineraryPrompt, buildChatRefinePrompt } from '../utils/promptTemplates.js';

export const generateOpenAiItinerary = async (tripParams) => {
  if (!isOpenAiConfigured()) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = buildItineraryPrompt(tripParams);
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'You are WanderSync Travel Maestro. You generate rich structured travel itineraries.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7
  });

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content);
};

export const refineOpenAiItinerary = async (currentItinerary, userMessage) => {
  if (!isOpenAiConfigured()) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = buildChatRefinePrompt(currentItinerary, userMessage);
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'You are WanderSync AI Travel Concierge. Always return strict JSON.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7
  });

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content);
};

export const chatWithOpenAi = async (message, history = [], tripContext = null, isAdmin = false) => {
  if (!isOpenAiConfigured()) {
    throw new Error('OpenAI API key is not configured');
  }

  const systemInstruction = isAdmin
    ? 'You are WanderSync AI Operations Copilot & Agency Commander. Return JSON: {"reply":"...", "generatedItinerary": null}'
    : `You are WanderSync AI Travel Concierge, an expert global travel companion and itinerary planner.
If the user asks to generate a full travel plan, create an itinerary, or says things like "pura plan bana kar do", "make a 5-day itinerary for Tokyo", etc., return a JSON object with:
1. "reply": A warm, encouraging, conversational response summarizing the trip highlights.
2. "generatedItinerary": A complete valid Trip object (title, destination: {city, country, coordinates: {lat, lng}}, overview, highlights: [3-5 strings], budgetLevel, estimatedTotalCost: Number, currency: "USD", days: [{dayNumber: 1, title, theme, activities: [{timeSlot: "Morning"|"Afternoon"|"Evening"|"Night", title, description, locationName, coordinates: {lat, lng}, durationHours: Number, estimatedCost: Number, category: "Sightseeing"|"Food"|"Culture"|"Adventure"|"Relaxation"|"Transit", bookingLink: ""}]}], travelTips: {packing: [], localEtiquette: [], transitAdvice: []}).
If the user is only chatting or asking general questions, set "generatedItinerary": null and provide your answer in "reply".
Always output valid JSON in this exact structure: {"reply": "...", "generatedItinerary": null | {...}}`;

  const messages = [{ role: 'system', content: systemInstruction }];

  if (tripContext) {
    messages.push({
      role: 'system',
      content: `Current Itinerary Context: ${typeof tripContext === 'string' ? tripContext : JSON.stringify(tripContext)}`
    });
  }

  if (history && history.length > 0) {
    history.slice(-6).forEach((h) => {
      messages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text
      });
    });
  }

  messages.push({ role: 'user', content: message });

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.7
  });

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content);
};
