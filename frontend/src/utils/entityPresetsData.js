export const SPOT_PRESETS = [
  {
    name: 'Faisal Mosque',
    country: 'Pakistan',
    city: 'Islamabad',
    category: 'Landmark',
    ticketPrice: 'Free',
    duration: '1-2 hours',
    bestTimeToVisit: 'Sunset / Evening',
    address: 'Shah Faisal Ave, E-8, Islamabad',
    description: 'Iconic national mosque of Pakistan designed by Turkish architect Vedat Dalokay, set against the scenic Margalla Hills.'
  },
  {
    name: 'Burj Khalifa',
    country: 'United Arab Emirates',
    city: 'Dubai',
    category: 'Landmark',
    ticketPrice: '$45',
    duration: '2-3 hours',
    bestTimeToVisit: 'Sunset / Night',
    address: '1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
    description: 'The worlds tallest architectural marvel soaring 828 meters with 360-degree observation decks and dancing fountain views.'
  },
  {
    name: 'Mount Fuji & Chureito Pagoda',
    country: 'Japan',
    city: 'Fujiyoshida',
    category: 'Nature & Park',
    ticketPrice: 'Free',
    duration: '3-4 hours',
    bestTimeToVisit: 'Early Morning / Spring',
    address: 'Arakura, Fujiyoshida, Yamanashi',
    description: 'Japan most famous postcard panorama overlooking the sacred snow-capped volcano through cherry blossoms and traditional pagoda.'
  },
  {
    name: 'Badshahi Mosque & Lahore Fort',
    country: 'Pakistan',
    city: 'Lahore',
    category: 'Historical Site',
    ticketPrice: '$3',
    duration: '2-3 hours',
    bestTimeToVisit: 'Afternoon / Golden Hour',
    address: 'Walled City of Lahore, Punjab',
    description: 'Magnificent 17th-century Mughal monument constructed in red sandstone with monumental marble domes and royal courtyards.'
  },
  {
    name: 'Eiffel Tower & Champ de Mars',
    country: 'France',
    city: 'Paris',
    category: 'Landmark',
    ticketPrice: '$30',
    duration: '2-3 hours',
    bestTimeToVisit: 'Evening / Golden Hour',
    address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
    description: 'The romantic symbol of France offering sparkling night illuminations and panoramic sweeping views across the Seine river.'
  },
  {
    name: 'Colosseum & Roman Forum',
    country: 'Italy',
    city: 'Rome',
    category: 'Historical Site',
    ticketPrice: '$20',
    duration: '3-4 hours',
    bestTimeToVisit: 'Morning',
    address: 'Piazza del Colosseo, 1, 00184 Roma',
    description: 'Ancient gladiatorial amphitheater constructed in 70 AD, standing as the crowning engineering triumph of the Roman Empire.'
  },
  {
    name: 'Cappadocia Hot Air Balloon Valley',
    country: 'Turkey',
    city: 'Goreme',
    category: 'Viewpoint',
    ticketPrice: '$160',
    duration: '3-4 hours',
    bestTimeToVisit: 'Sunrise',
    address: 'Goreme Historical National Park, Nevsehir',
    description: 'Spectacular fairy chimneys and cave valleys with hundreds of colorful hot air balloons ascending at sunrise.'
  },
  {
    name: 'Matterhorn & Gornergrat Ridge',
    country: 'Switzerland',
    city: 'Zermatt',
    category: 'Nature & Park',
    ticketPrice: '$95',
    duration: '4-5 hours',
    bestTimeToVisit: 'Morning / Summer',
    address: 'Gornergrat Bahn, 3920 Zermatt',
    description: 'Pyramid-shaped alpine peak surrounded by 29 glacial giants accessible via historic cogwheel railway.'
  }
];

export const HOTEL_PRESETS = [
  {
    name: 'Burj Al Arab Jumeirah',
    country: 'United Arab Emirates',
    city: 'Dubai',
    address: 'Umm Suqeim 3, Jumeirah Beach Road, Dubai',
    rating: 5,
    pricePerNight: 1200,
    priceRange: '$$$$',
    description: 'The world only 7-star luxury sail hotel offering private butler suites, helicopter transfers, and undersea fine dining.',
    amenities: ['Infinity Pool', 'Private Beach', 'Helipad', 'Luxury Spa', 'Free High-Speed WiFi', '24/7 Butler Service', 'Airport Chauffeur']
  },
  {
    name: 'Serena Hotel Islamabad',
    country: 'Pakistan',
    city: 'Islamabad',
    address: 'Khayaban-e-Suhrawardy, Sector G-5/1, Islamabad',
    rating: 5,
    pricePerNight: 220,
    priceRange: '$$$',
    description: 'Premier 5-star heritage hotel blending Islamic architecture with lush gardens, exquisite dining, and views of Margalla hills.',
    amenities: ['Swimming Pool', 'Luxury Spa', 'Free High-Speed WiFi', 'Fitness Centre', 'Complimentary Breakfast', 'Airport Shuttle']
  },
  {
    name: 'The Ritz-Carlton Tokyo',
    country: 'Japan',
    city: 'Tokyo',
    address: 'Tokyo Midtown, 9-7-1 Akasaka, Minato-ku, Tokyo',
    rating: 5,
    pricePerNight: 650,
    priceRange: '$$$$',
    description: 'Perched in the top floors of Midtown Tower offering panoramic Mount Fuji and Tokyo Tower vistas with Michelin gastronomy.',
    amenities: ['Indoor Swimming Pool', 'Spa & Wellness', 'Free High-Speed WiFi', 'Michelin Dining', 'Concierge Service', 'Fitness Center']
  },
  {
    name: 'Badrutts Palace Hotel',
    country: 'Switzerland',
    city: 'St. Moritz',
    address: 'Via Serlas 27, 7500 St. Moritz',
    rating: 5,
    pricePerNight: 850,
    priceRange: '$$$$',
    description: 'Historic luxury palace resort overlooking Lake St. Moritz and snow-clad Swiss Alps with world-class winter sports amenities.',
    amenities: ['Ski-In/Ski-Out', 'Indoor & Outdoor Pool', 'Luxury Spa', 'Rolls-Royce Transfers', 'Fine Dining', 'Free High-Speed WiFi']
  },
  {
    name: 'Four Seasons Hotel Istanbul at the Bosphorus',
    country: 'Turkey',
    city: 'Istanbul',
    address: 'Ciragan Cad. No: 28, Besiktas, Istanbul',
    rating: 5,
    pricePerNight: 480,
    priceRange: '$$$$',
    description: 'Converted 19th-century Ottoman palace positioned right on the scenic Bosphorus waterfront with outdoor heated pool.',
    amenities: ['Waterfront Terrace', 'Heated Pool', 'Turkish Hammam Spa', 'Free High-Speed WiFi', 'Private Yacht Dock', 'Valet Parking']
  }
];

export const VEHICLE_PRESETS = [
  {
    name: 'Toyota Land Cruiser V8 4x4',
    vehicleType: 'SUV',
    capacity: '7 Passengers',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    pricePerDay: 140,
    driverIncluded: true,
    description: 'Heavy-duty luxury 4WD built for northern mountain expeditions, off-road rocky terrain, and comfortable long-distance family travel.',
    features: ['All-Wheel Drive (AWD)', 'Air Conditioning', 'GPS Navigation System', 'Luggage Roof Rack', 'Bluetooth & USB Charging', 'Comprehensive Insurance']
  },
  {
    name: 'Mercedes-Benz S-Class S500',
    vehicleType: 'Luxury Sedan',
    capacity: '4 Passengers',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    pricePerDay: 220,
    driverIncluded: true,
    description: 'Flagship executive limousine offering leather massage seats, ambient lighting, and whisper-quiet chauffeur touring.',
    features: ['Air Conditioning', 'GPS Navigation System', 'Bluetooth & USB Charging', 'Tinted Windows', 'Comprehensive Insurance', 'Child Safety Seat']
  },
  {
    name: 'Toyota HiAce Grand Cabin Minibus',
    vehicleType: 'Van & Minibus',
    capacity: '14 Passengers',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    pricePerDay: 160,
    driverIncluded: true,
    description: 'Spacious high-roof touring minibus equipped with reclining passenger seats, ample luggage space, and dual climate control.',
    features: ['Air Conditioning', 'Luggage Roof Rack', 'Bluetooth & USB Charging', 'Tinted Windows', 'Comprehensive Insurance']
  },
  {
    name: 'Tesla Model X Plaid All-Electric',
    vehicleType: 'Electric',
    capacity: '6 Passengers',
    transmission: 'Automatic',
    fuelType: 'Electric',
    pricePerDay: 190,
    driverIncluded: false,
    description: 'Ultra-futuristic electric SUV featuring iconic falcon-wing doors, panoramic windshield, and instant zero-emission acceleration.',
    features: ['All-Wheel Drive (AWD)', 'GPS Navigation System', 'Bluetooth & USB Charging', 'Air Conditioning', 'Comprehensive Insurance']
  }
];

export const FLIGHT_PRESETS = [
  {
    airline: 'Emirates',
    flightNumber: 'EK-502',
    aircraft: 'Airbus A380-800',
    originCountry: 'United Arab Emirates',
    originCity: 'Dubai',
    originAirport: 'DXB - Dubai International',
    destinationCountry: 'United States',
    destinationCity: 'New York',
    destinationAirport: 'JFK - John F. Kennedy',
    cabinClass: 'Business Class',
    departureTime: '08:30 AM',
    arrivalTime: '02:45 PM',
    duration: '14h 15m',
    price: 1850,
    baggage: '40 kg Check-in + 10 kg Hand Carry',
    status: 'Scheduled'
  },
  {
    airline: 'Pakistan International Airlines',
    flightNumber: 'PK-301',
    aircraft: 'Boeing 777-300ER',
    originCountry: 'Pakistan',
    originCity: 'Islamabad',
    originAirport: 'ISB - Islamabad International',
    destinationCountry: 'Pakistan',
    destinationCity: 'Karachi',
    destinationAirport: 'KHI - Jinnah International',
    cabinClass: 'Economy',
    departureTime: '10:00 AM',
    arrivalTime: '11:55 AM',
    duration: '1h 55m',
    price: 110,
    baggage: '20 kg Check-in + 7 kg Hand Carry',
    status: 'Scheduled'
  },
  {
    airline: 'Qatar Airways',
    flightNumber: 'QR-117',
    aircraft: 'Boeing 787 Dreamliner',
    originCountry: 'Qatar',
    originCity: 'Doha',
    originAirport: 'DOH - Hamad International',
    destinationCountry: 'United Kingdom',
    destinationCity: 'London',
    destinationAirport: 'LHR - London Heathrow',
    cabinClass: 'Economy',
    departureTime: '01:15 PM',
    arrivalTime: '06:05 PM',
    duration: '6h 50m',
    price: 490,
    baggage: '30 kg Check-in + 7 kg Hand Carry',
    status: 'Scheduled'
  },
  {
    airline: 'Japan Airlines',
    flightNumber: 'JL-006',
    aircraft: 'Boeing 777-300ER',
    originCountry: 'Japan',
    originCity: 'Tokyo',
    originAirport: 'HND - Tokyo Haneda',
    destinationCountry: 'United States',
    destinationCity: 'Los Angeles',
    destinationAirport: 'LAX - Los Angeles International',
    cabinClass: 'Premium Economy',
    departureTime: '05:00 PM',
    arrivalTime: '11:00 AM',
    duration: '10h 00m',
    price: 920,
    baggage: '2 x 23 kg Check-in + 10 kg Hand Carry',
    status: 'Scheduled'
  }
];

export const GROUP_TOUR_PRESETS = [
  {
    title: 'Hunza Valley & Fairy Meadows Autumn Expedition',
    tagline: '7-Day majestic northern mountain and glacier expedition',
    category: 'Cultural & Adventure',
    country: 'Pakistan',
    city: 'Gilgit-Baltistan',
    durationDays: 7,
    totalCapacity: 16,
    pricePerPerson: 750,
    tourGuideName: 'Senior Mountaineer Guide',
    tourGuidePhone: '+92 300 5558687',
    inclusions: ['Luxury Hotel Stays', 'Daily Buffet Breakfast & Dinners', 'AC Tourist Bus', 'Licensed Guide', 'Monument Tickets', 'Jeep Safari to Fairy Meadows']
  },
  {
    title: 'Japan Golden Route & Cherry Blossom Odyssey',
    tagline: '8-Day imperial Tokyo, Kyoto & Osaka cultural journey',
    category: 'Cultural & Adventure',
    country: 'Japan',
    city: 'Tokyo',
    durationDays: 8,
    totalCapacity: 18,
    pricePerPerson: 1850,
    tourGuideName: 'Certified Japanese Tour Maestro',
    tourGuidePhone: '+81 3 5550 8899',
    inclusions: ['4-Star City Hotels', 'Shinkansen Bullet Train Passes', 'Daily Breakfast & Dinners', 'English Speaking Guide', 'All Temple Entrance Tickets']
  },
  {
    title: 'Swiss Alps & Glacial Wonders Grand Tour',
    tagline: '6-Day scenic panoramic trains and alpine summits',
    category: 'Cultural & Adventure',
    country: 'Switzerland',
    city: 'Zurich',
    durationDays: 6,
    totalCapacity: 14,
    pricePerPerson: 2100,
    tourGuideName: 'Swiss Alpine Expedition Leader',
    tourGuidePhone: '+41 22 555 1234',
    inclusions: ['4-Star Mountain Chalet Stays', 'Swiss Travel Pass 1st Class', 'Daily Breakfast', 'Gornergrat & Jungfrau Tickets', 'Luggage Courier Service']
  }
];
