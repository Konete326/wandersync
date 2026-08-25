export const WORLD_COUNTRIES = [
  {
    name: 'Pakistan',
    code: 'PAK',
    continent: 'Asia',
    currency: 'PKR (Rs)',
    language: 'Urdu / English',
    timezone: 'UTC+5 (PKT)',
    description: 'Pakistan is an extraordinary travel destination blessed with majestic Himalayan, Karakoram, and Hindu Kush peaks, ancient Indus Valley ruins, vibrant Mughal heritage, and warm hospitality.',
    popularCities: [
      { name: 'Islamabad', description: 'Serene green capital nestled at the foothills of Margalla Hills' },
      { name: 'Lahore', description: 'Cultural heartland with historic Mughal fort, badshahi mosque, and culinary streets' },
      { name: 'Hunza Valley', description: 'Pristine mountain kingdom with turquoise Attabad Lake and ancient forts' },
      { name: 'Karachi', description: 'Bustling Arabian Sea coastal metropolis and commercial hub' }
    ]
  },
  {
    name: 'Japan',
    code: 'JPN',
    continent: 'Asia',
    currency: 'JPY (¥)',
    language: 'Japanese',
    timezone: 'UTC+9 (JST)',
    description: 'Japan seamlessly blends ancient traditions with hyper-modern innovation, boasting historic Shinto shrines, tranquil Zen gardens, cherry blossoms, Mount Fuji, and world-renowned culinary artistry.',
    popularCities: [
      { name: 'Tokyo', description: 'Electric neon megalopolis featuring world-class dining, fashion, and tech' },
      { name: 'Kyoto', description: 'Imperial jewel with over a thousand wooden temples, bamboo groves, and geishas' },
      { name: 'Osaka', description: 'Gourmet street food capital, lively nightlife, and historic castle' },
      { name: 'Sapporo', description: 'Snow festival haven and gateway to Hokkaido alpine wilderness' }
    ]
  },
  {
    name: 'United Arab Emirates',
    code: 'ARE',
    continent: 'Asia',
    currency: 'AED (د.إ)',
    language: 'Arabic / English',
    timezone: 'UTC+4 (GST)',
    description: 'The UAE is a global oasis of futuristic skyscrapers, ultra-luxury resorts, pristine Arabian Gulf beaches, and authentic desert safari adventures.',
    popularCities: [
      { name: 'Dubai', description: 'Home to Burj Khalifa, Palm Jumeirah, and futuristic world attractions' },
      { name: 'Abu Dhabi', description: 'Capital city with Sheikh Zayed Grand Mosque and Louvre cultural district' },
      { name: 'Sharjah', description: 'UNESCO cultural and literary capital of the Arab world' },
      { name: 'Ras Al Khaimah', description: 'Adventure hub featuring the world longest zipline on Jebel Jais' }
    ]
  },
  {
    name: 'Switzerland',
    code: 'CHE',
    continent: 'Europe',
    currency: 'CHF (Fr.)',
    language: 'German / French / Italian',
    timezone: 'UTC+1 (CET)',
    description: 'Switzerland offers postcard-perfect alpine panoramas, crystal-clear glacial lakes, world-class ski slopes, panoramic scenic trains, and luxury Swiss craftsmanship.',
    popularCities: [
      { name: 'Zurich', description: 'Cosmopolitan banking and art hub on the shores of Lake Zurich' },
      { name: 'Geneva', description: 'Global diplomatic capital with iconic Jet dEau and Lake Geneva views' },
      { name: 'Lucerne', description: 'Medieval bridge city surrounded by dramatic Swiss Alps' },
      { name: 'Zermatt', description: 'Car-free alpine village nestled at the foot of the iconic Matterhorn' }
    ]
  },
  {
    name: 'Turkey',
    code: 'TUR',
    continent: 'Europe',
    currency: 'TRY (₺)',
    language: 'Turkish',
    timezone: 'UTC+3 (TRT)',
    description: 'Turkey bridges East and West with rich Byzantine and Ottoman history, hot air balloon flights over Cappadocia, turquoise Mediterranean coastlines, and bustling spice bazaars.',
    popularCities: [
      { name: 'Istanbul', description: 'Historic transcontinental city of Hagia Sophia and Bosphorus strait' },
      { name: 'Cappadocia', description: 'Fairy-tale landscape of cave dwellings and morning hot air balloons' },
      { name: 'Antalya', description: 'Turquoise Coast resort haven with ancient Greco-Roman ruins' },
      { name: 'Bodrum', description: 'Chic Aegean coastal town with luxury marinas and castle' }
    ]
  },
  {
    name: 'Saudi Arabia',
    code: 'SAU',
    continent: 'Asia',
    currency: 'SAR (﷼)',
    language: 'Arabic',
    timezone: 'UTC+3 (AST)',
    description: 'Saudi Arabia features spiritual sanctuaries, ancient UNESCO tombs in AlUla, Red Sea coral reefs, and futuristic mega-developments.',
    popularCities: [
      { name: 'Riyadh', description: 'Dynamic capital city blending historic Diriyah with modern skyline' },
      { name: 'Jeddah', description: 'Coastal Red Sea gateway with historic Al-Balad coral architecture' },
      { name: 'AlUla', description: 'Breathtaking ancient Nabataean rock tombs and desert sandstone formations' },
      { name: 'Medina', description: 'Sacred spiritual sanctuary of deep historical significance' }
    ]
  },
  {
    name: 'United Kingdom',
    code: 'GBR',
    continent: 'Europe',
    currency: 'GBP (£)',
    language: 'English',
    timezone: 'UTC+0 (GMT)',
    description: 'The United Kingdom offers iconic royal landmarks, rolling green countryside, historic castles, world-leading West End theater, and quintessential British charm.',
    popularCities: [
      { name: 'London', description: 'World capital featuring Big Ben, Tower Bridge, and West End' },
      { name: 'Edinburgh', description: 'Scottish capital dominated by historic castle and Royal Mile' },
      { name: 'Manchester', description: 'Dynamic northern hub renowned for football, music, and industrial heritage' }
    ]
  },
  {
    name: 'United States',
    code: 'USA',
    continent: 'North America',
    currency: 'USD ($)',
    language: 'English',
    timezone: 'UTC-5 (EST)',
    description: 'The United States spans iconic national parks, legendary metropolitan skylines, coastal highways, and diverse entertainment capitals.',
    popularCities: [
      { name: 'New York City', description: 'Global metropolis of Times Square, Central Park, and Broadway' },
      { name: 'Los Angeles', description: 'Entertainment capital of Hollywood, beaches, and year-round sunshine' },
      { name: 'San Francisco', description: 'Bay Area jewel featuring Golden Gate Bridge and historic cable cars' },
      { name: 'Miami', description: 'Tropical coastal haven known for Art Deco architecture and vibrant culture' }
    ]
  },
  {
    name: 'France',
    code: 'FRA',
    continent: 'Europe',
    currency: 'EUR (€)',
    language: 'French',
    timezone: 'UTC+1 (CET)',
    description: 'France captivates travelers with romantic Parisian boulevards, world-class gastronomy, sun-drenched French Riviera beaches, and historic Loire Valley chateaux.',
    popularCities: [
      { name: 'Paris', description: 'City of Light with the Eiffel Tower, Louvre, and haute cuisine' },
      { name: 'Nice', description: 'Cote dAzur Mediterranean gem with the Promenade des Anglais' },
      { name: 'Lyon', description: 'World gastronomic capital with historic Roman amphitheaters' }
    ]
  },
  {
    name: 'Italy',
    code: 'ITA',
    continent: 'Europe',
    currency: 'EUR (€)',
    language: 'Italian',
    timezone: 'UTC+1 (CET)',
    description: 'Italy is an open-air museum of ancient Roman ruins, Renaissance masterpieces, romantic Venetian canals, scenic Amalfi Coast cliffs, and authentic cuisine.',
    popularCities: [
      { name: 'Rome', description: 'Eternal City with the Colosseum, Vatican City, and Trevi Fountain' },
      { name: 'Florence', description: 'Renaissance capital of the Uffizi Gallery and Brunelleschi Duomo' },
      { name: 'Venice', description: 'Floating city of romantic gondola canals and St. Marks Square' },
      { name: 'Milan', description: 'Global fashion and design capital crowned by the Gothic Duomo' }
    ]
  },
  {
    name: 'Spain',
    code: 'ESP',
    continent: 'Europe',
    currency: 'EUR (€)',
    language: 'Spanish',
    timezone: 'UTC+1 (CET)',
    description: 'Spain boasts Antoni Gaudi architecture, sunny Mediterranean shores, passionate flamenco performances, and historic Andalusian Moorish palaces.',
    popularCities: [
      { name: 'Barcelona', description: 'Catalan capital famous for Sagrada Familia and beachfront promenade' },
      { name: 'Madrid', description: 'Stately capital with Prado Museum, royal palaces, and vibrant plazas' },
      { name: 'Seville', description: 'Heart of Andalusia with the Alcazar Palace and flamenco tablaos' }
    ]
  },
  {
    name: 'Germany',
    code: 'DEU',
    continent: 'Europe',
    currency: 'EUR (€)',
    language: 'German',
    timezone: 'UTC+1 (CET)',
    description: 'Germany combines fairy-tale Bavarian castles, dense Black Forest wilderness, historic Berlin landmarks, and world-class precision engineering.',
    popularCities: [
      { name: 'Berlin', description: 'Vibrant cultural and historic capital with Brandenburg Gate' },
      { name: 'Munich', description: 'Bavarian gateway with Marienplatz and access to Neuschwanstein Castle' },
      { name: 'Frankfurt', description: 'Financial capital of futuristic skylines and historic Romer square' }
    ]
  },
  {
    name: 'Australia',
    code: 'AUS',
    continent: 'Oceania',
    currency: 'AUD ($)',
    language: 'English',
    timezone: 'UTC+10 (AEST)',
    description: 'Australia features the iconic Great Barrier Reef, dramatic Outback red sands, Sydney Harbour Opera House, and unique wildlife.',
    popularCities: [
      { name: 'Sydney', description: 'Harbour city with Opera House, Harbour Bridge, and Bondi Beach' },
      { name: 'Melbourne', description: 'Cultural, coffee, and arts capital with laneway cafes' },
      { name: 'Brisbane', description: 'Subtropical river city close to Gold Coast surf beaches' }
    ]
  },
  {
    name: 'Thailand',
    code: 'THA',
    continent: 'Asia',
    currency: 'THB (฿)',
    language: 'Thai',
    timezone: 'UTC+7 (ICT)',
    description: 'Thailand enchants visitors with ornate golden temples, tropical Andaman island paradises, lush northern jungle sanctuaries, and vibrant night markets.',
    popularCities: [
      { name: 'Bangkok', description: 'Dynamic metropolis of Grand Palace, street markets, and floating bazaars' },
      { name: 'Phuket', description: 'Premier island destination with white sand beaches and luxury resorts' },
      { name: 'Chiang Mai', description: 'Northern mountain haven with misty peaks and elephant sanctuaries' }
    ]
  },
  {
    name: 'Malaysia',
    code: 'MYS',
    continent: 'Asia',
    currency: 'MYR (RM)',
    language: 'Malay / English',
    timezone: 'UTC+8 (MYT)',
    description: 'Malaysia offers dramatic Petronas Twin Towers, ancient rainforests in Borneo, UNESCO heritage towns, and diverse multicultural cuisines.',
    popularCities: [
      { name: 'Kuala Lumpur', description: 'Skyline capital dominated by the iconic Petronas Twin Towers' },
      { name: 'Penang', description: 'UNESCO world heritage island renowned for street art and gastronomy' },
      { name: 'Langkawi', description: 'Duty-free archipelago with turquoise waters and lush rainforests' }
    ]
  },
  {
    name: 'Singapore',
    code: 'SGP',
    continent: 'Asia',
    currency: 'SGD ($)',
    language: 'English / Mandarin / Malay',
    timezone: 'UTC+8 (SGT)',
    description: 'Singapore is a garden city state famous for futuristic Supertree Groves at Gardens by the Bay, Marina Bay Sands, and Michelin hawker food stalls.',
    popularCities: [
      { name: 'Singapore City', description: 'Modern island metropolis featuring Jewel Changi and Marina Bay' }
    ]
  },
  {
    name: 'Indonesia',
    code: 'IDN',
    continent: 'Asia',
    currency: 'IDR (Rp)',
    language: 'Indonesian',
    timezone: 'UTC+8 (WITA)',
    description: 'Indonesia is the worlds largest archipelago featuring Balis spiritual temples, volcanic landscapes in Java, and Komodo dragon reserves.',
    popularCities: [
      { name: 'Bali', description: 'Island of the Gods with rice terraces, spiritual retreats, and beach breaks' },
      { name: 'Jakarta', description: 'Vibrant capital metropolis of diverse Indonesian traditions' },
      { name: 'Yogyakarta', description: 'Cultural soul of Java home to ancient Borobudur and Prambanan temples' }
    ]
  },
  {
    name: 'Maldives',
    code: 'MDV',
    continent: 'Asia',
    currency: 'MVR (Rf)',
    language: 'Dhivehi / English',
    timezone: 'UTC+5 (MVT)',
    description: 'The Maldives is the ultimate tropical paradise of overwater luxury villas, crystalline turquoise lagoons, and vibrant marine life.',
    popularCities: [
      { name: 'Male', description: 'Compact island capital and hub for seaplane and speedboat transfers' }
    ]
  },
  {
    name: 'Egypt',
    code: 'EGY',
    continent: 'Africa',
    currency: 'EGP (E£)',
    language: 'Arabic',
    timezone: 'UTC+2 (EET)',
    description: 'Egypt is the cradle of ancient civilization featuring the legendary Great Pyramids of Giza, the Nile River cruises, and Red Sea coral reefs.',
    popularCities: [
      { name: 'Cairo', description: 'Home to the Giza Pyramids, Sphinx, and Grand Egyptian Museum' },
      { name: 'Luxor', description: 'Worlds greatest open-air museum with the Valley of the Kings' },
      { name: 'Sharm El Sheikh', description: 'Red Sea resort destination for diving and desert safari' }
    ]
  },
  {
    name: 'Qatar',
    code: 'QAT',
    continent: 'Asia',
    currency: 'QAR (QR)',
    language: 'Arabic / English',
    timezone: 'UTC+3 (AST)',
    description: 'Qatar combines state-of-the-art architectural wonders, the Museum of Islamic Art, Souq Waqif heritage markets, and desert inland sea adventures.',
    popularCities: [
      { name: 'Doha', description: 'Futuristic waterfront capital with Corniche promenade and luxury malls' }
    ]
  }
];

export const findCountryPreset = (searchQuery) => {
  if (!searchQuery || !searchQuery.trim()) return null;
  const q = searchQuery.trim().toLowerCase();
  return (
    WORLD_COUNTRIES.find((c) => c.name.toLowerCase() === q || c.code.toLowerCase() === q) ||
    WORLD_COUNTRIES.find((c) => c.name.toLowerCase().startsWith(q) || c.code.toLowerCase().startsWith(q)) ||
    WORLD_COUNTRIES.find((c) => c.name.toLowerCase().includes(q))
  );
};
