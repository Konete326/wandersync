export const generateSmartEntityData = (type, query) => {
  const q = (query || 'Destination').trim();
  const titleCase = q.charAt(0).toUpperCase() + q.slice(1);

  if (type === 'country') {
    return {
      name: titleCase,
      code: q.slice(0, 3).toUpperCase(),
      continent: q.toLowerCase().includes('pakistan') || q.toLowerCase().includes('japan') || q.toLowerCase().includes('uae') || q.toLowerCase().includes('dubai') ? 'Asia' : 'Europe',
      currency: q.toLowerCase().includes('pakistan') ? 'PKR (Rs)' : q.toLowerCase().includes('japan') ? 'JPY (¥)' : q.toLowerCase().includes('uae') ? 'AED (د.إ)' : 'USD ($)',
      language: q.toLowerCase().includes('pakistan') ? 'Urdu / English' : q.toLowerCase().includes('japan') ? 'Japanese' : q.toLowerCase().includes('france') ? 'French' : 'English',
      timezone: q.toLowerCase().includes('pakistan') ? 'UTC+5 (PKT)' : q.toLowerCase().includes('japan') ? 'UTC+9 (JST)' : 'UTC+1 (CET)',
      description: `${titleCase} is a world-renowned destination renowned for its breathtaking landscapes, vibrant cultural heritage, and world-class hospitality. Travelers can explore ancient landmarks, scenic mountain ridges, modern city skylines, and world-class culinary wonders.`,
      popularCities: [
        { name: `${titleCase} Capital City`, description: 'Historic center featuring national museums, vibrant bazaars, and iconic architecture.' },
        { name: `${titleCase} Coastline Haven`, description: 'Scenic beachfront resort city with seaside dining and water excursions.' },
        { name: `${titleCase} Mountain Valley`, description: 'Alpine wonderland offering hiking trails, pristine lakes, and panoramic viewpoints.' }
      ]
    };
  }

  if (type === 'spot') {
    return {
      title: titleCase,
      country: 'Global',
      city: 'Central District',
      category: 'Landmark',
      description: `${titleCase} is an iconic landmark and must-visit travel destination. Famed for extraordinary views and historical significance, it draws visitors from across the globe seeking memorable cultural experiences and picturesque photo vantage points.`,
      bestTimeToVisit: 'Morning / Golden Hour (08:00 AM - 11:30 AM)',
      entryFee: 'Free / $15 (~1,200 JPY / 3,500 PKR)',
      idealDuration: '2-3 Hours',
      address: `Main Tourism Boulevard, near ${titleCase}`,
      highlights: [
        'Panoramic elevated viewing terrace',
        'Guided historical and cultural walking tour',
        'Architectural photography and souvenir pavilion',
        'Family-friendly accessibility with on-site audio guides'
      ]
    };
  }

  if (type === 'hotel') {
    return {
      name: titleCase.toLowerCase().includes('hotel') || titleCase.toLowerCase().includes('resort') ? titleCase : `${titleCase} Grand Luxury Hotel & Spa`,
      country: 'Global',
      city: 'Metropolitan District',
      address: `100 Royal Palm Boulevard, ${titleCase}`,
      rating: 4.9,
      pricePerNight: 195,
      starCategory: 5,
      description: `Experience bespoke hospitality at ${titleCase}. Features lavish rooms, tranquil spa treatments, panoramic rooftop infinity pools, and Michelin-inspired culinary dining.`,
      roomTypes: ['Deluxe King Suite', 'Executive Ocean View Room', 'Presidential Penthouse', 'Family Garden Villa'],
      amenities: [
        'Free High-Speed Wi-Fi (1Gbps)',
        'Rooftop Infinity Swimming Pool',
        'Full-Service Wellness Spa & Sauna',
        'Complimentary Gourmet Buffet Breakfast',
        '24/7 Concierge & Chauffeur Airport Shuttle',
        'State-of-the-art Fitness Center',
        'Smart In-Room Automation & 4K Entertainment'
      ],
      checkInTime: '14:00',
      checkOutTime: '12:00'
    };
  }

  if (type === 'vehicle') {
    return {
      name: titleCase,
      type: 'SUV',
      capacity: 7,
      luggageCapacity: 4,
      transmission: 'Automatic',
      fuelType: 'Hybrid',
      pricePerDay: 95,
      description: `Premium ${titleCase} built for superior comfort, long-distance touring, and off-road stability. Equipped with modern driver assist technologies, plush leather interiors, and fuel-efficient performance.`,
      features: [
        'All-Wheel Drive (AWD / 4x4)',
        'Apple CarPlay & Android Auto Integration',
        '360-Degree Surround View Parking Cameras',
        'Dual-Zone Automatic Climate Control',
        'Adaptive Cruise Control & Lane Keep Assist',
        'Spacious Foldable Rear Luggage Compartment'
      ]
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
    description: `Join an unforgettable 7-day guided expedition exploring the iconic highlights, hidden gems, local traditions, and gourmet flavors of ${titleCase}.`,
    included: [
      '6 Nights in Premium 4-Star & 5-Star Boutique Hotels',
      'Daily Gourmet Breakfast & Select Traditional Dinners',
      'All Ground Transfers in Private Air-Conditioned Coach',
      'Certified English-Speaking Tour Leader & Local Guides',
      'All National Park & Historic Monument Entry Passes'
    ],
    excluded: [
      'International Airfare',
      'Personal Souvenirs & Discretionary Expenses',
      'Comprehensive Travel & Medical Insurance'
    ],
    itineraryDays: [
      { day: 1, title: 'Arrival & Welcome Dinner', description: 'VIP Airport transfer, hotel check-in, and evening rooftop briefing with local appetizers.' },
      { day: 2, title: 'Historic Landmarks & Heritage Walk', description: 'Comprehensive guided exploration of architectural marvels, royal palaces, and traditional old town markets.' },
      { day: 3, title: 'Scenic Countryside & Nature Excursion', description: 'Full-day scenic excursion to majestic mountain viewpoints, cascading waterfalls, and local artisan villages.' },
      { day: 4, title: 'Local Gastronomy & Culinary Workshop', description: 'Interactive cooking masterclass with master chefs followed by private sunset river cruise.' },
      { day: 5, title: 'Adventure & Outdoor Safari', description: 'Exciting outdoor adventure, nature trail hikes, and wildlife conservation sanctuary tour.' },
      { day: 6, title: 'Leisure Day & Souvenir Shopping', description: 'Free morning for shopping and spa treatments, followed by traditional music gala dinner.' },
      { day: 7, title: 'Farewell & Airport Departure', description: 'Breakfast at hotel, final photo memories, and private chauffeur transfer to airport.' }
    ]
  };
};
