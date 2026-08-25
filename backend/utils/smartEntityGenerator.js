export const generateSmartEntityData = (type, query) => {
  const q = (query || 'Destination').trim();
  const titleCase = q.charAt(0).toUpperCase() + q.slice(1);
  const qLower = q.toLowerCase();

  if (type === 'country') {
    return {
      name: titleCase,
      code: q.slice(0, 3).toUpperCase(),
      continent: qLower.includes('pakistan') || qLower.includes('japan') || qLower.includes('uae') || qLower.includes('saudi') ? 'Asia' : 'Europe',
      currency: qLower.includes('pakistan') ? 'PKR (Rs)' : qLower.includes('japan') ? 'JPY (¥)' : qLower.includes('uae') ? 'AED (د.إ)' : qLower.includes('saudi') ? 'SAR (﷼)' : 'USD ($)',
      language: qLower.includes('pakistan') ? 'Urdu / English' : qLower.includes('japan') ? 'Japanese' : qLower.includes('saudi') || qLower.includes('uae') ? 'Arabic' : 'English',
      timezone: qLower.includes('pakistan') ? 'UTC+5' : qLower.includes('japan') ? 'UTC+9' : 'UTC+3',
      description: `${titleCase} is a world-renowned travel destination offering breathtaking landscapes, rich cultural heritage, and warm hospitality.`,
      popularCities: [
        { name: `${titleCase} Capital`, description: 'Historic urban center featuring national monuments and culture.' },
        { name: `${titleCase} Coastal City`, description: 'Scenic beachfront resort with seaside promenades.' },
        { name: `${titleCase} Valley`, description: 'Alpine wonderland with hiking trails and pristine nature.' }
      ]
    };
  }

  if (type === 'spot') {
    return {
      title: titleCase,
      country: 'Global',
      city: 'Central District',
      category: 'Landmark',
      description: `${titleCase} is an iconic landmark famed for picturesque photo vantage points and historic significance.`,
      bestTimeToVisit: 'Morning / Golden Hour (08:00 AM - 11:30 AM)',
      entryFee: 'Free / $15',
      idealDuration: '2-3 Hours',
      address: `Main Tourism Boulevard, near ${titleCase}`,
      highlights: ['Panoramic viewing terrace', 'Guided historical walking tour', 'Architectural photography']
    };
  }

  if (type === 'hotel') {
    return {
      name: titleCase.toLowerCase().includes('hotel') ? titleCase : `${titleCase} Grand Hotel & Spa`,
      country: 'Global',
      city: 'Metropolitan District',
      address: `100 Royal Palm Boulevard, ${titleCase}`,
      rating: 4.9,
      pricePerNight: 195,
      starCategory: 5,
      description: `Experience bespoke luxury and tranquil comfort at ${titleCase}.`,
      roomTypes: ['Deluxe King Suite', 'Executive Ocean View Room', 'Presidential Penthouse'],
      amenities: ['Free High-Speed Wi-Fi', 'Infinity Pool', 'Wellness Spa', 'Gourmet Breakfast', '24/7 Concierge'],
      checkInTime: '14:00',
      checkOutTime: '12:00'
    };
  }

  if (type === 'vehicle') {
    const isSedan = qLower.includes('mercedes') || qLower.includes('sedan') || qLower.includes('s-class') || qLower.includes('e-class') || qLower.includes('c-class') || qLower.includes('bmw 7') || qLower.includes('bmw 5') || qLower.includes('audi a6') || qLower.includes('audi a8') || qLower.includes('camry') || qLower.includes('civic') || qLower.includes('rolls royce') || qLower.includes('bentley') || qLower.includes('lexus es') || qLower.includes('lexus ls');
    const is4x4 = qLower.includes('land cruiser') || qLower.includes('prado') || qLower.includes('range rover') || qLower.includes('g-wagon') || qLower.includes('g-class') || qLower.includes('defender') || qLower.includes('4x4') || qLower.includes('off-road') || qLower.includes('fortuner') || qLower.includes('jeep');
    const isVan = qLower.includes('hiace') || qLower.includes('van') || qLower.includes('minibus') || qLower.includes('sprinter') || qLower.includes('alphard') || qLower.includes('vellfire') || qLower.includes('v-class');
    const isElectric = qLower.includes('tesla') || qLower.includes('electric') || qLower.includes('taycan') || qLower.includes('ev') || qLower.includes('lucid') || qLower.includes('eqs');
    const isConvertible = qLower.includes('convertible') || qLower.includes('cabriolet') || qLower.includes('spider') || qLower.includes('ferrari') || qLower.includes('lamborghini');

    const vType = isSedan ? 'Luxury Sedan' : is4x4 ? '4x4 Off-Road' : isVan ? 'Van & Minibus' : isElectric ? 'Electric' : isConvertible ? 'Convertible' : 'SUV';
    const capacity = isVan ? 12 : (is4x4 || vType === 'SUV') ? 7 : (isConvertible ? 2 : 5);
    const price = isSedan ? 180 : is4x4 ? 160 : isVan ? 150 : isElectric ? 140 : isConvertible ? 250 : 95;

    return {
      name: titleCase,
      type: vType,
      vehicleType: vType,
      capacity,
      luggageCapacity: isVan ? 8 : (is4x4 || vType === 'SUV') ? 4 : 3,
      transmission: 'Automatic',
      fuelType: isElectric ? 'Electric' : is4x4 || isVan ? 'Diesel' : isSedan ? 'Petrol / Hybrid' : 'Hybrid',
      pricePerDay: price,
      description: `Executive ${titleCase} (${vType}) engineered for supreme road comfort, luxury interior styling, and dynamic handling.`,
      features: ['Dual-Zone Climate Control', 'Apple CarPlay & Android Auto', '360 Parking Cameras', 'Adaptive Cruise Control', 'Plush Leather Interior']
    };
  }

  if (type === 'flight') {
    return {
      airline: titleCase.toLowerCase().includes('air') ? titleCase : `${titleCase} Airways`,
      flightNumber: 'WS-742',
      departureAirport: 'JFK - John F. Kennedy International',
      arrivalAirport: 'DXB - Dubai International Airport',
      departureCity: 'New York',
      arrivalCity: 'Dubai',
      departureCountry: 'United States',
      arrivalCountry: 'United Arab Emirates',
      price: 680,
      cabinClass: 'Economy',
      duration: '12h 40m',
      baggageAllowance: '2x 23kg Checked Bags + 8kg Cabin Baggage'
    };
  }

  return {
    title: titleCase.includes('Tour') ? titleCase : `${titleCase} 7-Day Guided Discovery Tour`,
    destinationCountry: 'Global',
    destinationCity: titleCase,
    durationDays: 7,
    maxGroupSize: 14,
    price: 890,
    discountPrice: 750,
    category: 'Adventure',
    description: `Join an unforgettable 7-day guided expedition exploring the iconic highlights of ${titleCase}.`,
    included: ['6 Nights in 4-Star / 5-Star Hotels', 'Daily Breakfast & Select Dinners', 'Private AC Transport', 'Certified Tour Leader', 'All Entry Passes'],
    excluded: ['International Airfare', 'Personal Souvenirs', 'Travel Insurance'],
    itineraryDays: [
      { day: 1, title: 'Arrival & Welcome Dinner', description: 'Airport transfer, check-in, and evening briefing.' },
      { day: 2, title: 'Historic Landmarks & Heritage Walk', description: 'Guided exploration of palaces and old town.' },
      { day: 3, title: 'Scenic Countryside Excursion', description: 'Excursion to mountain viewpoints and lakes.' },
      { day: 4, title: 'Local Gastronomy Workshop', description: 'Interactive culinary masterclass and sunset cruise.' },
      { day: 5, title: 'Adventure Safari', description: 'Outdoor nature trail and wildlife sanctuary tour.' },
      { day: 6, title: 'Leisure Day & Shopping', description: 'Free morning for shopping and gala dinner.' },
      { day: 7, title: 'Farewell & Departure', description: 'Breakfast and private transfer to airport.' }
    ]
  };
};
