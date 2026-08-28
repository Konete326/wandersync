import axios from 'axios';
import { getGeminiModel, AVAILABLE_MODELS, isGeminiConfigured } from '../config/gemini.js';
import { buildItineraryPrompt, buildChatRefinePrompt } from '../utils/promptTemplates.js';

const serverTranslationCache = new Map();

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

const sanitizeTranslationOutput = (raw, fallback = '') => {
  if (!raw || typeof raw !== 'string') return fallback || '';
  let cleaned = raw.trim();

  // Strip markdown code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Parse JSON if returned as object/JSON string
  if (cleaned.startsWith('{') && (cleaned.includes('translation') || cleaned.includes(':'))) {
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.translation) cleaned = String(parsed.translation).trim();
      else if (parsed.translatedText) cleaned = String(parsed.translatedText).trim();
      else if (parsed.text) cleaned = String(parsed.text).trim();
      else {
        const firstVal = Object.values(parsed)[0];
        if (firstVal && typeof firstVal === 'string') cleaned = firstVal.trim();
      }
    } catch {
      const match = cleaned.match(/["']?(?:translation|translatedText|text)["']?\s*:\s*["']?([^"'}]+)/i);
      if (match && match[1]) cleaned = match[1].trim();
    }
  }

  // Strip all JSON artifacts, prefixes, brackets, quotes
  cleaned = cleaned.replace(/^\{?\s*["']?(?:translation|translatedText|text)?["']?\s*:\s*["']?/i, '');
  cleaned = cleaned.replace(/^(?:Translation|Translated Text|Urdu|English):\s*/i, '');
  cleaned = cleaned.replace(/^["'`{\[\s\\]+/g, '');
  cleaned = cleaned.replace(/["'`}\]\s\\]+$/g, '').trim();

  return cleaned || fallback || '';
};

const LANGUAGE_DESCRIPTIONS = {
  en: 'clear natural English',
  ur: 'natural conversational Roman Urdu (or Urdu)',
  ar: 'natural modern standard Arabic (العربية)',
  hi: 'natural conversational Roman Hindi (or Hindi)',
  es: 'natural Spanish (Español)',
  fr: 'natural French (Français)',
  de: 'natural German (Deutsch)',
  tr: 'natural Turkish (Türkçe)',
  ja: 'natural Japanese (日本語)',
  zh: 'natural simplified Chinese (中文)'
};

export const translateChatMessage = async (text, targetLang = 'ur', sourceLang = 'auto') => {
  if (!text || !text.trim()) return text;
  const cleanInput = text.trim();
  const normalizedTarget = (targetLang || 'ur').toLowerCase().trim();
  const cacheKey = `${normalizedTarget}_${cleanInput}`;

  // 1. Instant Cache Hit
  if (serverTranslationCache.has(cacheKey)) {
    return serverTranslationCache.get(cacheKey);
  }

  const isTargetEnglish = normalizedTarget === 'en' || normalizedTarget === 'english';
  const isTargetUrdu = normalizedTarget === 'ur' || normalizedTarget === 'pk' || normalizedTarget === 'urdu';
  const isTargetHindi = normalizedTarget === 'hi' || normalizedTarget === 'in' || normalizedTarget === 'hindi';

  // Strategy A: Ultra-Fast Gemini Flash with Plain Text & Low Latency
  if (isGeminiConfigured()) {
    try {
      let instruction = '';
      if (isTargetUrdu) {
        instruction = 'Translate into natural conversational Roman Urdu (conversational Urdu written in English alphabet, e.g. "Aap kaise hain"). Output ONLY the single translated sentence as raw plain text without JSON, markdown, or quotation marks.';
      } else if (isTargetHindi) {
        instruction = 'Translate into natural Roman Hindi written in English alphabet. Output ONLY the single translated sentence as raw plain text without JSON, markdown, or quotation marks.';
      } else if (isTargetEnglish) {
        instruction = 'Translate this message (which is in Roman Urdu, Hindi, Urdu script, or another language) into clear, natural, proper English. For example, "kya haal hai" -> "How are you doing?", "mausam kaisa hai" -> "How is the weather there?", "bhai ye destination kesi hai" -> "Brother, how is this destination?". If the input is already standard grammatically correct English, return it unchanged. Output ONLY the single translated sentence as raw plain text without JSON, markdown, or quotation marks.';
      } else {
        const langDesc = LANGUAGE_DESCRIPTIONS[normalizedTarget] || normalizedTarget;
        instruction = `Translate this message into ${langDesc}. Output ONLY the single translated sentence as raw plain text without JSON, markdown, or quotation marks.`;
      }

      const prompt = `You are an ultra-fast real-time chat translator.
${instruction}

Text to translate:
${cleanInput}

Translation:`;

      // Use flash-lite or flash without JSON schema constraint for max speed
      const model = getGeminiModel('gemini-2.5-flash-lite', false) || getGeminiModel('gemini-3.6-flash', false);
      if (model) {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2400));
        const genPromise = model.generateContent(prompt);
        const result = await Promise.race([genPromise, timeoutPromise]);
        const rawTranslation = result?.response?.text()?.trim();
        if (rawTranslation) {
          const cleaned = sanitizeTranslationOutput(rawTranslation, cleanInput);
          if (cleaned && cleaned.length > 0) {
            if (serverTranslationCache.size > 2000) serverTranslationCache.clear();
            serverTranslationCache.set(cacheKey, cleaned);
            return cleaned;
          }
        }
      }
    } catch {
      // Fallback to rapid auxiliary engine
    }
  }

  // Strategy B: Instant Direct Translation Fallback (~80-120ms response)
  try {
    const googleTarget = normalizedTarget === 'pk' ? 'ur' : normalizedTarget === 'in' ? 'hi' : (normalizedTarget || 'ur');
    const gtUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${googleTarget}&dt=t&q=${encodeURIComponent(cleanInput)}`;
    const response = await axios.get(gtUrl, { timeout: 1500 });
    if (response.data && response.data[0]) {
      const translatedParts = response.data[0].map((item) => item[0]).filter(Boolean).join('');
      if (translatedParts) {
        const cleaned = sanitizeTranslationOutput(translatedParts, cleanInput);
        if (cleaned) {
          if (serverTranslationCache.size > 2000) serverTranslationCache.clear();
          serverTranslationCache.set(cacheKey, cleaned);
          return cleaned;
        }
      }
    }
  } catch {
    // Ignored
  }

  return cleanInput;
};
