import axios from 'axios';
import { TRAVEL_CONFIG, hasRapidApi } from '../config/travelApis.js';
import { autofillDestinationData } from './geminiService.js';

export const fetchExternalHotels = async (city, country = '') => {
  if (!city) throw new Error('City is required');

  if (hasRapidApi()) {
    try {
      const locRes = await axios.get('https://booking-com.p.rapidapi.com/v1/hotels/locations', {
        params: { name: city, locale: 'en-gb' },
        headers: {
          'x-rapidapi-key': TRAVEL_CONFIG.rapidApiKey,
          'x-rapidapi-host': 'booking-com.p.rapidapi.com'
        },
        timeout: 6000
      });
      const destId = locRes.data?.[0]?.dest_id;
      if (destId) {
        const checkin = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        const checkout = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
        const searchRes = await axios.get('https://booking-com.p.rapidapi.com/v1/hotels/search', {
          params: {
            dest_id: destId,
            dest_type: 'city',
            locale: 'en-gb',
            units: 'metric',
            order_by: 'popularity',
            checkin_date: checkin,
            checkout_date: checkout,
            adults_number: '2',
            room_number: '1'
          },
          headers: {
            'x-rapidapi-key': TRAVEL_CONFIG.rapidApiKey,
            'x-rapidapi-host': 'booking-com.p.rapidapi.com'
          },
          timeout: 6000
        });
        const hotels = searchRes.data?.result || [];
        if (hotels.length > 0) {
          return hotels.slice(0, 8).map((h, i) => ({
            id: String(h.hotel_id || i),
            name: h.hotel_name,
            address: h.address || `${city}, ${country}`,
            rating: Number(h.review_score) || 4.5,
            pricePerNight: h.min_total_price ? `$${Math.round(h.min_total_price / 3)}/night` : '$180/night',
            priceRange: '$$$',
            imageUrl: h.main_photo_url ? h.main_photo_url.replace('square60', 'square600') : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
            amenities: ['Free WiFi', 'Breakfast Included', 'City View', 'Air Conditioning'],
            provider: 'Booking.com API'
          }));
        }
      }
    } catch {}
  }

  const aiData = await autofillDestinationData(country || 'Global', city);
  return (aiData?.hotels || []).map((h, idx) => ({
    id: `ai_hotel_${idx}`,
    name: h.name,
    address: `${city} City Center, ${country}`,
    rating: h.rating || 4.8,
    pricePerNight: h.pricePerNight || '$220/night',
    priceRange: h.priceRange || '$$$$',
    imageUrl: h.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    amenities: h.amenities || ['Free High-Speed WiFi', 'Infinity Pool', 'Spa & Wellness', 'Valet Parking'],
    provider: 'AI Hospitality Synthesizer'
  }));
};
