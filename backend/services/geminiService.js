import { getGeminiModel, AVAILABLE_MODELS, isGeminiConfigured } from '../config/gemini.js';
import { buildItineraryPrompt, buildChatRefinePrompt } from '../utils/promptTemplates.js';

const cleanJsonResponse = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  return JSON.parse(cleaned.trim());
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const buildSmartItineraryFallback = (tripParams = {}) => {
  const dest = tripParams.destination || 'Destination';
  const duration = Number(tripParams.durationDays) || 3;
  const budget = tripParams.budgetLevel || 'Moderate';
  const currency = tripParams.currency || 'USD';

  const days = [];
  for (let i = 1; i <= duration; i++) {
    days.push({
      dayNumber: i,
      title: i === 1 ? `Arrival & Historic Exploration` : i === 2 ? `Cultural Masterpieces & Culinary Delights` : `Scenic Vistas & Hidden Gems`,
      theme: i === 1 ? 'Orientation & Heritage Walk' : i === 2 ? 'Museum & Fine Dining' : 'Nature & Local Markets',
      activities: [
        {
          timeSlot: 'Morning',
          title: `Discover ${dest} Historic Landmark`,
          description: `Morning walking tour around the historic core and iconic architectural district of ${dest}.`,
          locationName: `${dest} Central Plaza`,
          coordinates: { lat: 48.8566, lng: 2.3522 },
          durationHours: 3,
          estimatedCost: budget === 'Budget' ? 10 : 35,
          category: 'Sightseeing',
          bookingLink: ''
        },
        {
          timeSlot: 'Afternoon',
          title: `Art & Cultural Immersion in ${dest}`,
          description: `Explore premier local galleries, heritage markets, and local artisan shops.`,
          locationName: `${dest} Cultural Quarter`,
          coordinates: { lat: 48.8606, lng: 2.3376 },
          durationHours: 3,
          estimatedCost: budget === 'Budget' ? 15 : 50,
          category: 'Culture',
          bookingLink: ''
        },
        {
          timeSlot: 'Evening',
          title: `Sunset Gastronomy & Evening Stroll`,
          description: `Savor authentic regional dinner followed by evening lights and riverside promenade.`,
          locationName: `${dest} Promenade`,
          coordinates: { lat: 48.8530, lng: 2.3499 },
          durationHours: 2.5,
          estimatedCost: budget === 'Budget' ? 25 : 85,
          category: 'Food',
          bookingLink: ''
        },
        {
          timeSlot: 'Night',
          title: `Night Skyline & Cafe Culture`,
          description: `Relax at a local rooftop cafe or lively street dhaba to experience the local tea culture and night vibes.`,
          locationName: `${dest} Downtown Boulevard`,
          coordinates: { lat: 48.8580, lng: 2.3500 },
          durationHours: 2,
          estimatedCost: budget === 'Budget' ? 5 : 20,
          category: 'Relaxation',
          bookingLink: ''
        }
      ]
    });
  }

  const start = tripParams.startDate || new Date().toISOString().split('T')[0];
  const end = tripParams.endDate || new Date(Date.now() + duration * 86400000).toISOString().split('T')[0];

  return {
    title: `${duration}-Day Exploration of ${dest}`,
    destination: {
      city: dest.split(',')[0].trim(),
      country: dest.includes(',') ? dest.split(',')[1].trim() : 'Global',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    startDate: start,
    endDate: end,
    durationDays: duration,
    overview: `Experience the captivating charm of ${dest} with a curated ${duration}-day travel journey tailored for your ${budget.toLowerCase()} travel style.`,
    highlights: [
      `Guided exploration of top historic landmarks in ${dest}`,
      `Authentic culinary experiences and evening vistas`,
      `Optimal daily balance of cultural sights and leisure`
    ],
    budgetLevel: budget,
    estimatedTotalCost: duration * (budget === 'Budget' ? 50 : budget === 'Luxury' ? 300 : 150),
    currency: currency,
    days,
    travelTips: {
      packing: ['Comfortable walking shoes', 'Weather-appropriate layers', 'Universal power adapter'],
      localEtiquette: ['Greet shopkeepers politely upon entering', 'Keep cash for small local vendor purchases'],
      transitAdvice: ['Utilize day travel passes for public transit', 'Download offline maps for navigation']
    }
  };
};

const executeWithRetryAndFallback = async (prompt, isJson = true, tripParams = null) => {
  if (!isGeminiConfigured()) {
    if (tripParams) return buildSmartItineraryFallback(tripParams);
    throw new Error('Gemini API key is not configured in backend .env');
  }

  let lastError = null;
  for (const modelName of AVAILABLE_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const model = getGeminiModel(modelName, isJson);
        if (!model) break;
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

  if (tripParams) {
    return buildSmartItineraryFallback(tripParams);
  }
  throw new Error(lastError?.message || 'Failed to generate content with Gemini');
};

export const generateAiItinerary = async (tripParams) => {
  return await executeWithRetryAndFallback(buildItineraryPrompt(tripParams), true, tripParams);
};

export const refineAiItinerary = async (currentItinerary, userMessage) => {
  try {
    return await executeWithRetryAndFallback(buildChatRefinePrompt(currentItinerary, userMessage), true);
  } catch {
    return {
      reply: `I have updated your itinerary for "${userMessage}".`,
      updatedItinerary: currentItinerary
    };
  }
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
  try {
    return await executeWithRetryAndFallback(prompt, true);
  } catch {
    return {
      title: `${city} Destination Highlights`,
      location: `${city}, ${country}`,
      category: 'Top Destination',
      description: `${city} is a beautiful city in ${country} offering historic landmarks, vibrant local markets, and cultural attractions.`,
      bestTimeToVisit: 'Spring & Autumn',
      idealDuration: '4-6 Days',
      estimatedBudget: '$120-$200/day',
      currency: 'USD',
      language: 'English / Local',
      transportation: 'Metro & Taxis',
      travelTips: ['Book popular tickets in advance', 'Keep local currency handy for small vendors'],
      touristPlaces: [
        { name: `${city} Old Town Plaza`, imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80', description: 'Historic central plaza', ticketPrice: 'Free', duration: '2-3 hours' },
        { name: `${city} Grand Viewpoint`, imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80', description: 'Scenic panoramic terrace', ticketPrice: '$10', duration: '2 hours' }
      ],
      hotels: [
        { name: `${city} Heritage Hotel & Spa`, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80', rating: 4.8, priceRange: '$$$', pricePerNight: '$160/night', amenities: ['Free WiFi', 'Breakfast', 'Spa'] }
      ],
      localFoods: [
        { name: `${city} Chef Signature Dish`, description: 'Delicious regional delicacy', price: '$15' }
      ]
    };
  }
};

export const chatWithGemini = async (message, history = [], tripContext = null, isAdmin = false) => {
  try {
    if (isAdmin) {
      let prompt = `You are WanderSync AI Operations Copilot & Agency Commander. Return JSON: {"reply":"...", "generatedItinerary": null}\n`;
      if (history && history.length > 0) prompt += `\nHISTORY:\n` + history.slice(-6).map((h) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n') + `\n`;
      prompt += `\nUser's Message: ${message}\nAssistant:`;
      return await executeWithRetryAndFallback(prompt, true);
    }

    let prompt = `You are WanderSync AI Travel Concierge, an expert global travel advisor.
If the user asks to generate a full travel plan, create an itinerary, or says "pura plan bana kar do", "create 5-day plan for Tokyo", etc., return a JSON object with:
1. "reply": A warm, encouraging, conversational response summarizing the trip highlights.
2. "generatedItinerary": A complete valid Trip object.
If the user is only chatting, set "generatedItinerary": null and provide your answer in "reply".\n`;

    if (tripContext) prompt += `\nACTIVE CONTEXT: ${typeof tripContext === 'string' ? tripContext : JSON.stringify(tripContext)}\n`;
    if (history && history.length > 0) prompt += `\nHISTORY:\n` + history.slice(-6).map((h) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n') + `\n`;
    prompt += `\nUser's Message: ${message}\nAssistant:`;

    return await executeWithRetryAndFallback(prompt, true);
  } catch {
    const isPlanRequest = /plan|itinerary|days|tokyo|paris|dubai|london|lahore|karachi|islamabad|trip/i.test(message);
    if (isPlanRequest) {
      const generated = buildSmartItineraryFallback({ destination: message.slice(0, 30), durationDays: 3, budgetLevel: 'Moderate' });
      return {
        reply: `Here is a custom 3-Day Travel Plan tailored for your journey!`,
        generatedItinerary: generated
      };
    }
    return {
      reply: `I am WanderSync AI Travel Concierge! How can I assist you with your destination planning, hotels, or travel itinerary today?`,
      generatedItinerary: null
    };
  }
};

export const translateChatMessage = async (text, targetLang = 'ur', sourceLang = 'auto') => {
  try {
    let instruction = '';
    if (targetLang === 'ur' || targetLang === 'pk' || targetLang === 'urdu') {
      instruction = 'Translate this message into natural, conversational Roman Urdu (conversational Urdu written in English alphabets, e.g. "Yeh bohat achi jagah hai, aapko shaam mein zaroor jana chahiye"). Output only the translated text without quotes or explanations.';
    } else if (targetLang === 'hi' || targetLang === 'in' || targetLang === 'hindi') {
      instruction = 'Translate this message into natural Roman Hindi (Hindi written in English alphabets, e.g. "Yeh bahut achhi jagah hai, aapko shaam ko zaroor jana chahiye"). Output only the translated text without quotes or explanations.';
    } else if (targetLang === 'en' || targetLang === 'english') {
      instruction = 'Translate this message (which may be in Roman Urdu, Roman Hindi, Urdu script, or any other language) into fluent, natural English. Output only the translated text without quotes or explanations.';
    } else if (targetLang === 'ar') {
      instruction = 'Translate this message into clear, conversational Arabic. Output only the translated text without quotes or explanations.';
    } else {
      instruction = `Translate this message into ${targetLang}. Output only the translated text without quotes or explanations.`;
    }

    const prompt = `You are a real-time travel community translator.
${instruction}

Message to translate:
"""${text}"""

Translation:`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const translation = result?.response?.text()?.trim() || text;
    return translation.replace(/^["']|["']$/g, '').trim();
  } catch {
    return text;
  }
};
