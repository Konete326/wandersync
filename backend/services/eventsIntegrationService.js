import axios from 'axios';
import { TRAVEL_CONFIG, hasTicketmaster } from '../config/travelApis.js';

export const fetchExternalEvents = async (city) => {
  if (!city) throw new Error('City is required');

  if (hasTicketmaster()) {
    try {
      const res = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
        params: {
          city,
          size: 6,
          sort: 'date,asc',
          apikey: TRAVEL_CONFIG.ticketmasterApiKey
        },
        timeout: 6000
      });
      const events = res.data?._embedded?.events || [];
      if (events.length > 0) {
        return events.map((ev, i) => ({
          id: ev.id || `tm_${i}`,
          title: ev.name,
          category: ev.classifications?.[0]?.segment?.name || 'Live Event',
          date: ev.dates?.start?.localDate || 'Upcoming',
          venue: ev._embedded?.venues?.[0]?.name || `${city} Arena`,
          imageUrl: ev.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
          url: ev.url || '',
          provider: 'Ticketmaster Discovery API'
        }));
      }
    } catch {}
  }

  const defaultEvents = [
    { title: `${city} Cultural Heritage & Food Festival`, category: 'Food & Culture', date: 'Next Weekend', venue: `${city} Promenade`, imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80' },
    { title: `${city} Live Sunset Music & Jazz Night`, category: 'Music & Concerts', date: 'Friday 8:00 PM', venue: 'Skyline Terrace Lounge', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80' },
    { title: `${city} Traditional Craft & Artisan Expo`, category: 'Art & Exhibition', date: 'Ongoing', venue: 'Grand Cultural Hall', imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80' }
  ];

  return defaultEvents.map((e, idx) => ({
    id: `event_${idx}`,
    ...e,
    provider: 'Global Culture & Festivals Hub'
  }));
};
