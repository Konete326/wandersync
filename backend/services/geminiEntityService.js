import { getGeminiModel, AVAILABLE_MODELS } from '../config/gemini.js';

const cleanJsonResponse = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  return JSON.parse(cleaned.trim());
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const executePrompt = async (prompt) => {
  let lastError = null;
  for (const modelName of AVAILABLE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = getGeminiModel(modelName, true);
        if (!model) throw new Error('Gemini API key is not configured');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return cleanJsonResponse(response.text());
      } catch (error) {
        lastError = error;
        if (attempt < 2) await sleep(attempt * 800);
      }
    }
  }
  throw new Error(lastError?.message || 'AI Generation failed');
};

export const autofillEntityData = async (type, query) => {
  const schemas = {
    country: `{"name":"Country Name","code":"3-Letter Code (e.g. JPN, PAK, UAE, FRA)","continent":"One of: Asia, Europe, North America, South America, Africa, Oceania","currency":"e.g. JPY (¥) or USD ($)","language":"Official Language","timezone":"e.g. UTC+9","description":"2-3 paragraph captivating overview of country for tourists","popularCities":[{"name":"City 1","description":"1-2 sentence highlight"},{"name":"City 2","description":"1-2 sentence highlight"},{"name":"City 3","description":"1-2 sentence highlight"}]}`,
    spot: `{"title":"Spot Name","country":"Country Name","city":"City Name","category":"One of: Historical, Nature, Cultural, Adventure, Urban, Beach, Mountain, Other","description":"Detailed attractive description of spot","bestTimeToVisit":"e.g. Oct - Apr","entryFee":"e.g. $15 or Free","idealDuration":"e.g. 2-3 Hours","address":"Full street / area address","latitude":35.6586,"longitude":139.7454,"highlights":["Key highlight 1","Key highlight 2","Key highlight 3"]}`,
    hotel: `{"name":"Hotel Name","country":"Country Name","city":"City Name","address":"Accurate location address","rating":4.8,"pricePerNight":180,"starCategory":5,"description":"Luxury property overview","roomTypes":["Deluxe Room","Executive Suite","Family Villa"],"amenities":["Free High-Speed WiFi","Swimming Pool","Spa & Wellness","Complimentary Breakfast","Airport Shuttle","24/7 Room Service"],"checkInTime":"14:00","checkOutTime":"12:00"}`,
    vehicle: `{"name":"Vehicle Model Name","type":"One of: SUV, Sedan, Luxury, Van, Minibus, Motorcycle","capacity":7,"luggageCapacity":4,"transmission":"One of: Automatic, Manual","fuelType":"One of: Petrol, Diesel, Hybrid, Electric","pricePerDay":90,"description":"Vehicle overview and condition","features":["4WD / AWD","Air Conditioning","GPS Navigation","Bluetooth Audio","Reverse Camera","Leather Seats"]}`,
    flight: `{"airline":"Airline Name","flightNumber":"e.g. EK-502","departureAirport":"Airport Code & Name","arrivalAirport":"Airport Code & Name","departureCity":"City","arrivalCity":"City","departureCountry":"Country","arrivalCountry":"Country","price":650,"cabinClass":"One of: Economy, Premium Economy, Business, First","duration":"8h 30m","baggageAllowance":"30 kg Check-in + 7 kg Hand Carry"}`,
    groupTour: `{"title":"Tour Package Title","destinationCountry":"Country","destinationCity":"City / Region","durationDays":7,"maxGroupSize":16,"price":850,"discountPrice":720,"category":"One of: Adventure, Cultural, Luxury, Wildlife, Trekking","description":"Full tour overview narrative","included":["4-Star Hotels","Daily Breakfast & Dinner","AC Transport","Certified Guide","All Entry Passes"],"excluded":["International Flights","Personal Expenses","Travel Insurance"],"itineraryDays":[{"day":1,"title":"Arrival & Welcome","description":"Airport reception and hotel checkin."},{"day":2,"title":"City Exploration","description":"Guided full day landmarks tour."},{"day":3,"title":"Scenic Excursion","description":"Day trip to surrounding natural wonders."}]}`
  };

  const selectedSchema = schemas[type] || schemas.country;
  const prompt = `Generate realistic, accurate travel JSON metadata for entity "${type}" based on user query "${query}".
Return ONLY valid JSON matching this schema:
${selectedSchema}`;

  return await executePrompt(prompt);
};
