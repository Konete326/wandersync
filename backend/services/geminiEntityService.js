import { getGeminiModel, AVAILABLE_MODELS, isGeminiConfigured } from '../config/gemini.js';
import openai, { isOpenAiConfigured, OPENAI_MODEL } from '../config/openai.js';
import { generateSmartEntityData } from '../utils/smartEntityGenerator.js';

const cleanJsonResponse = (text) => {
  if (!text) throw new Error('Empty response');
  const cleaned = text.trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(cleaned);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateWithOpenAi = async (prompt) => {
  if (!isOpenAiConfigured()) throw new Error('OpenAI not configured');
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'You are WanderSync AI Travel Master Generator. Generate rich, detailed, comprehensive JSON only.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7
  });
  return JSON.parse(response.choices[0].message.content);
};

const generateWithGemini = async (prompt) => {
  if (!isGeminiConfigured()) throw new Error('Gemini not configured');
  let lastError = null;
  for (const modelName of AVAILABLE_MODELS) {
    try {
      const model = getGeminiModel(modelName, true);
      if (!model) continue;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return cleanJsonResponse(response.text());
    } catch (error) {
      lastError = error;
      await sleep(300);
    }
  }
  throw lastError || new Error('Gemini generation failed');
};

export const autofillEntityData = async (type, query) => {
  const schemas = {
    country: `{"name":"Country Name","code":"3-Letter ISO","continent":"Asia|Europe|North America|South America|Africa|Oceania","currency":"Currency Name & Symbol","language":"Official Languages","timezone":"Timezone UTC","description":"Rich 2-3 paragraph captivating overview","popularCities":[{"name":"City Name","description":"Rich detailed city highlight and key sights"}]}`,
    spot: `{"title":"Attraction Name","country":"Country","city":"City","category":"Landmark|Nature|Historical|Cultural|Adventure|Beach|Mountain","description":"Rich 2-3 paragraph landmark narrative","bestTimeToVisit":"Specific Season / Time Window","entryFee":"Exact price or Free","idealDuration":"2-3 Hours","address":"Precise address / landmark vicinity","highlights":["Highlight 1","Highlight 2","Highlight 3","Highlight 4"]}`,
    hotel: `{"name":"Hotel Name","country":"Country","city":"City","address":"Precise street address","rating":4.9,"pricePerNight":180,"starCategory":5,"description":"Detailed luxury resort overview","roomTypes":["Deluxe King Suite","Executive Suite","Family Villa"],"amenities":["Free High-Speed WiFi","Infinity Pool","Full Spa & Sauna","Complimentary Breakfast","Airport Shuttle","24/7 Room Service"]}`,
    vehicle: `{"name":"Vehicle Model","type":"SUV|Sedan|Luxury|Van|Minibus","capacity":7,"luggageCapacity":4,"transmission":"Automatic|Manual","fuelType":"Petrol|Diesel|Hybrid|Electric","pricePerDay":95,"description":"Detailed vehicle condition and road comfort overview","features":["AWD / 4x4","Apple CarPlay / Android Auto","360 Camera","Climate Control","Adaptive Cruise"]}`,
    flight: `{"airline":"Airline Name","flightNumber":"FL-101","departureAirport":"Airport Name & Code","arrivalAirport":"Airport Name & Code","departureCity":"City","arrivalCity":"City","departureCountry":"Country","arrivalCountry":"Country","price":680,"cabinClass":"Economy|Business|First","duration":"8h 30m","baggageAllowance":"2x 23kg Check-in + 8kg Hand Carry"}`,
    groupTour: `{"title":"Tour Package Title","destinationCountry":"Country","destinationCity":"City","durationDays":7,"maxGroupSize":16,"price":890,"discountPrice":750,"category":"Adventure|Cultural|Luxury","description":"Rich comprehensive 7-day tour narrative","included":["4-Star Hotels","Daily Gourmet Breakfast","AC Transport","Certified Guide","All Entry Tickets"],"excluded":["International Flights","Personal Expenses"],"itineraryDays":[{"day":1,"title":"Day 1 Theme","description":"Detailed day description."},{"day":2,"title":"Day 2 Theme","description":"Detailed day description."},{"day":3,"title":"Day 3 Theme","description":"Detailed day description."}]}`
  };

  const prompt = `Generate comprehensive, realistic, high-quality travel metadata for "${type}" matching search query "${query}".
Return ONLY valid JSON matching this exact structure:
${schemas[type] || schemas.country}`;

  if (isOpenAiConfigured()) {
    try {
      const data = await generateWithOpenAi(prompt);
      if (data && typeof data === 'object' && Object.keys(data).length > 2) return data;
    } catch {}
  }

  if (isGeminiConfigured()) {
    try {
      const data = await generateWithGemini(prompt);
      if (data && typeof data === 'object' && Object.keys(data).length > 2) return data;
    } catch {}
  }

  return generateSmartEntityData(type, query);
};
