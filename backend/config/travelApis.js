import dotenv from 'dotenv';

dotenv.config();

export const TRAVEL_CONFIG = {
  rapidApiKey: process.env.RAPIDAPI_KEY || '',
  geoapifyApiKey: process.env.GEOAPIFY_API_KEY || '',
  ticketmasterApiKey: process.env.TICKETMASTER_API_KEY || '',
  amadeusClientId: process.env.AMADEUS_CLIENT_ID || '',
  amadeusClientSecret: process.env.AMADEUS_CLIENT_SECRET || '',
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || ''
};

export const hasRapidApi = () => Boolean(TRAVEL_CONFIG.rapidApiKey && TRAVEL_CONFIG.rapidApiKey.trim().length > 8);
export const hasGeoapify = () => Boolean(TRAVEL_CONFIG.geoapifyApiKey && TRAVEL_CONFIG.geoapifyApiKey.trim().length > 8);
export const hasTicketmaster = () => Boolean(TRAVEL_CONFIG.ticketmasterApiKey && TRAVEL_CONFIG.ticketmasterApiKey.trim().length > 8);
export const hasAmadeus = () => Boolean(TRAVEL_CONFIG.amadeusClientId && TRAVEL_CONFIG.amadeusClientSecret);
export const hasGooglePlaces = () => Boolean(TRAVEL_CONFIG.googlePlacesApiKey && TRAVEL_CONFIG.googlePlacesApiKey.trim().length > 8);

export const getActiveProviders = () => ({
  places: hasGeoapify() ? 'Geoapify Places API' : (hasGooglePlaces() ? 'Google Places API' : (hasRapidApi() ? 'RapidAPI TripAdvisor' : 'AI Hybrid Synthesizer')),
  hotels: hasRapidApi() ? 'Booking.com (RapidAPI)' : (hasAmadeus() ? 'Amadeus Hospitality' : 'AI Hybrid Synthesizer'),
  transport: hasAmadeus() ? 'Amadeus Global Aviation' : (hasRapidApi() ? 'RapidAPI Flight Hub' : 'AI Hybrid Synthesizer'),
  events: hasTicketmaster() ? 'Ticketmaster Discovery' : 'AI Hybrid Synthesizer',
  weather: 'Open-Meteo Global Satellite'
});
