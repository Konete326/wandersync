import { getGeminiModel, AVAILABLE_MODELS, isGeminiConfigured } from '../config/gemini.js';
import openai, { isOpenAiConfigured, OPENAI_MODEL } from '../config/openai.js';
import { generateSmartEntityData } from '../utils/smartEntityGenerator.js';
import { resolveEntityImages, resolveCityImage } from '../utils/realImageTelemetry.js';

const cleanJsonResponse = (text) => {
  if (!text) throw new Error('Empty response');
  const cleaned = text.trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  return JSON.parse(cleaned);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateWithOpenAi = async (prompt) => {
  if (!isOpenAiConfigured()) throw new Error('OpenAI not configured');
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'You are WanderSync AI Travel Master Generator. Generate rich, authentic JSON only.' },
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

const attachRealImages = (type, query, data) => {
  if (!data || typeof data !== 'object') return data;
  const name = data.name || data.title || query || '';
  const country = data.country || data.destinationCountry || '';
  const city = data.city || data.destinationCity || '';

  const { coverImage, images } = resolveEntityImages(type, name, country, city);
  if (!data.coverImage) data.coverImage = coverImage;
  if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
    data.images = images;
  }

  if (Array.isArray(data.popularCities)) {
    data.popularCities = data.popularCities.map((c) => {
      const cityImg = resolveCityImage(c.name, country || name);
      return {
        ...c,
        images: c.images?.length ? c.images : [cityImg]
      };
    });
  }
  return data;
};

export const autofillEntityData = async (type, query) => {
  const schemas = {
    country: `{"name":"Country Name","code":"3-Letter ISO","continent":"Asia|Europe|North America|South America|Africa|Oceania","currency":"Currency Name & Symbol","language":"Official Languages","timezone":"Timezone UTC","description":"Rich 2-3 paragraph captivating overview","popularCities":[{"name":"City Name","description":"Rich detailed city highlight and key sights"}]}`,
    spot: `{"title":"Attraction Name","country":"Country","city":"City","category":"Landmark|Nature|Historical|Cultural|Adventure|Beach|Mountain","description":"Rich 2-3 paragraph landmark narrative","bestTimeToVisit":"Specific Season / Time Window","entryFee":"Exact price or Free","idealDuration":"2-3 Hours","address":"Precise address / landmark vicinity","highlights":["Highlight 1","Highlight 2","Highlight 3","Highlight 4"]}`,
    vehicle: `{"name":"Vehicle Model","vehicleType":"Luxury Sedan|SUV|Van & Minibus|4x4 Off-Road|Convertible|Electric","type":"Luxury Sedan|SUV|Van & Minibus|4x4 Off-Road|Convertible|Electric","capacity":5,"luggageCapacity":3,"transmission":"Automatic|Manual","fuelType":"Petrol|Diesel|Hybrid|Electric","pricePerDay":150,"description":"Accurate vehicle model condition and road comfort overview","features":["Dual-Zone Climate Control","Apple CarPlay & Android Auto","360 Parking Cameras","Adaptive Cruise Control"]}`,
    flight: `{"airline":"Airline Name","flightNumber":"FL-101","departureAirport":"Airport Name & Code","arrivalAirport":"Airport Name & Code","departureCity":"City","arrivalCity":"City","departureCountry":"Country","arrivalCountry":"Country","price":680,"cabinClass":"Economy|Business|First","duration":"8h 30m","baggageAllowance":"2x 23kg Check-in + 8kg Hand Carry"}`,
    groupTour: `{"title":"Tour Package Title","destinationCountry":"Country","destinationCity":"City","durationDays":7,"maxGroupSize":16,"price":890,"discountPrice":750,"category":"Adventure|Cultural|Luxury","description":"Rich comprehensive 7-day tour narrative","included":["4-Star Hotels","Daily Gourmet Breakfast","AC Transport","Certified Guide","All Entry Tickets"],"excluded":["International Flights","Personal Expenses"],"itineraryDays":[{"day":1,"title":"Day 1 Theme","description":"Detailed day description."},{"day":2,"title":"Day 2 Theme","description":"Detailed day description."},{"day":3,"title":"Day 3 Theme","description":"Detailed day description."}]}`
  };

  const prompt = `Generate authentic, real-world travel metadata for "${type}" matching query "${query}".
For vehicles, accurately classify the vehicleType (e.g. Mercedes-Benz S-Class/E-Class/C-Class/BMW 7 is "Luxury Sedan", Land Cruiser/Prado/Range Rover is "4x4 Off-Road", HiAce/Sprinter is "Van & Minibus", Tesla is "Electric", and NEVER call a sedan an SUV).
Return ONLY valid JSON matching this schema:
${schemas[type] || schemas.country}`;

  if (isOpenAiConfigured()) {
    try {
      const data = await generateWithOpenAi(prompt);
      if (data && typeof data === 'object' && Object.keys(data).length > 2) {
        return attachRealImages(type, query, data);
      }
    } catch {}
  }

  if (isGeminiConfigured()) {
    try {
      const data = await generateWithGemini(prompt);
      if (data && typeof data === 'object' && Object.keys(data).length > 2) {
        return attachRealImages(type, query, data);
      }
    } catch {}
  }

  const fallback = generateSmartEntityData(type, query);
  return attachRealImages(type, query, fallback);
};
