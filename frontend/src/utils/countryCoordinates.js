export const COUNTRY_COORDINATES = {
  pakistan: { lat: 33.6844, lng: 73.0479, city: 'Islamabad' },
  japan: { lat: 35.6762, lng: 139.6503, city: 'Tokyo' },
  united_arab_emirates: { lat: 25.2048, lng: 55.2708, city: 'Dubai' },
  uae: { lat: 25.2048, lng: 55.2708, city: 'Dubai' },
  switzerland: { lat: 47.3769, lng: 8.5417, city: 'Zurich' },
  france: { lat: 48.8566, lng: 2.3522, city: 'Paris' },
  italy: { lat: 41.9028, lng: 12.4964, city: 'Rome' },
  turkey: { lat: 41.0082, lng: 28.9784, city: 'Istanbul' },
  saudi_arabia: { lat: 24.7136, lng: 46.6753, city: 'Riyadh' },
  saudi: { lat: 24.7136, lng: 46.6753, city: 'Riyadh' },
  united_kingdom: { lat: 51.5074, lng: -0.1278, city: 'London' },
  uk: { lat: 51.5074, lng: -0.1278, city: 'London' },
  united_states: { lat: 40.7128, lng: -74.006, city: 'New York' },
  usa: { lat: 40.7128, lng: -74.006, city: 'New York' },
  spain: { lat: 40.4168, lng: -3.7038, city: 'Madrid' },
  germany: { lat: 52.52, lng: 13.405, city: 'Berlin' },
  canada: { lat: 43.6532, lng: -79.3832, city: 'Toronto' },
  australia: { lat: -33.8688, lng: 151.2093, city: 'Sydney' },
  china: { lat: 39.9042, lng: 116.4074, city: 'Beijing' },
  india: { lat: 28.6139, lng: 77.209, city: 'New Delhi' },
  maldives: { lat: 4.1755, lng: 73.5093, city: 'Male' },
  thailand: { lat: 13.7563, lng: 100.5018, city: 'Bangkok' },
  singapore: { lat: 1.3521, lng: 103.8198, city: 'Singapore' },
  malaysia: { lat: 3.139, lng: 101.6869, city: 'Kuala Lumpur' },
  indonesia: { lat: -8.4095, lng: 115.1889, city: 'Bali' },
  qatar: { lat: 25.2854, lng: 51.531, city: 'Doha' },
  egypt: { lat: 30.0444, lng: 31.2357, city: 'Cairo' },
  greece: { lat: 37.9838, lng: 23.7275, city: 'Athens' },
  portugal: { lat: 38.7223, lng: -9.1393, city: 'Lisbon' },
  netherlands: { lat: 52.3676, lng: 4.9041, city: 'Amsterdam' },
  austria: { lat: 48.2082, lng: 16.3738, city: 'Vienna' },
  norway: { lat: 59.9139, lng: 10.7522, city: 'Oslo' },
  brazil: { lat: -22.9068, lng: -43.1729, city: 'Rio de Janeiro' }
};

export const getCoordinatesForLocation = (locationName = '') => {
  if (!locationName) return COUNTRY_COORDINATES.pakistan;
  const clean = locationName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  for (const [key, coords] of Object.entries(COUNTRY_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }
  return COUNTRY_COORDINATES.pakistan;
};

export const getWeatherConditionMeta = (wCode, temp = 22) => {
  if (wCode === 0) return { icon: '☀️', text: 'Clear' };
  if ([1, 2].includes(wCode)) return { icon: '🌤️', text: 'Partly Cloudy' };
  if (wCode === 3) return { icon: '☁️', text: 'Overcast' };
  if ([45, 48].includes(wCode)) return { icon: '🌫️', text: 'Foggy' };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(wCode)) return { icon: '🌧️', text: 'Rainy' };
  if ([71, 73, 75, 77, 85, 86].includes(wCode)) return { icon: '❄️', text: 'Snowy' };
  if ([95, 96, 99].includes(wCode)) return { icon: '⛈️', text: 'Thunderstorm' };
  return temp > 28 ? { icon: '☀️', text: 'Warm' } : { icon: '⛅', text: 'Pleasant' };
};
