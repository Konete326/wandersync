import axios from 'axios';
import { TRAVEL_CONFIG, hasGeoapify, hasGooglePlaces } from '../config/travelApis.js';
import { autofillDestinationData } from './geminiService.js';

export const fetchExternalPlaces = async (city, country = '') => {
  if (!city) throw new Error('City is required');

  if (hasGeoapify()) {
    try {
      const geoRes = await axios.get('https://api.geoapify.com/v1/geocode/search', {
        params: { text: `${city}, ${country}`, apiKey: TRAVEL_CONFIG.geoapifyApiKey, limit: 1 },
        timeout: 6000
      });
      const place = geoRes.data?.features?.[0];
      if (place) {
        const placeId = place.properties?.place_id;
        const placesRes = await axios.get('https://api.geoapify.com/v2/places', {
          params: {
            categories: 'tourism.attraction,tourism.sights,entertainment,heritage',
            filter: `place:${placeId}`,
            limit: 12,
            apiKey: TRAVEL_CONFIG.geoapifyApiKey
          },
          timeout: 6000
        });
        const items = placesRes.data?.features || [];
        if (items.length > 0) {
          return items.map((f, i) => ({
            id: f.properties?.place_id || `geo_${i}`,
            name: f.properties?.name || f.properties?.address_line1 || 'Historical Landmark',
            category: f.properties?.categories?.[0]?.replace('tourism.', '') || 'Attraction',
            address: f.properties?.formatted || `${city}, ${country}`,
            coordinates: { lat: f.geometry?.coordinates?.[1], lng: f.geometry?.coordinates?.[0] },
            imageUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 1234567) % 50000000}?w=800&auto=format&fit=crop&q=80`,
            rating: 4.8 - (i * 0.1),
            provider: 'Geoapify Places API'
          }));
        }
      }
    } catch {}
  }

  if (hasGooglePlaces()) {
    try {
      const googleRes = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: { query: `Top tourist attractions in ${city} ${country}`, key: TRAVEL_CONFIG.googlePlacesApiKey },
        timeout: 6000
      });
      const results = googleRes.data?.results || [];
      if (results.length > 0) {
        return results.slice(0, 10).map((p, i) => ({
          id: p.place_id || `goog_${i}`,
          name: p.name,
          category: p.types?.[0] || 'Landmark',
          address: p.formatted_address || city,
          coordinates: { lat: p.geometry?.location?.lat, lng: p.geometry?.location?.lng },
          imageUrl: p.photos?.[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photos[0].photo_reference}&key=${TRAVEL_CONFIG.googlePlacesApiKey}` : 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
          rating: p.rating || 4.7,
          provider: 'Google Places API'
        }));
      }
    } catch {}
  }

  const aiData = await autofillDestinationData(country || 'Global', city);
  return (aiData?.touristPlaces || []).map((t, idx) => ({
    id: `ai_place_${idx}`,
    name: t.name,
    category: 'Must-Visit Highlight',
    description: t.description,
    ticketPrice: t.ticketPrice || 'Free',
    duration: t.duration || '2-3 Hours',
    imageUrl: t.imageUrl || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    provider: 'AI Travel Synthesizer'
  }));
};
