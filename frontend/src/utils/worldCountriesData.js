export const WORLD_COUNTRIES = [
  {
    name: 'Pakistan',
    code: 'PAK',
    continent: 'Asia',
    currency: 'PKR (Rs)',
    language: 'Urdu / English',
    timezone: 'UTC+5 (PKT)',
    coverImage: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=1200&auto=format&fit=crop&q=80',
    description: 'Pakistan is an extraordinary travel destination blessed with majestic Himalayan, Karakoram, and Hindu Kush peaks, ancient Indus Valley ruins, vibrant Mughal heritage, and warm hospitality.',
    popularCities: [
      { name: 'Islamabad', description: 'Serene green capital nestled at the foothills of Margalla Hills', images: ['https://images.unsplash.com/photo-1627993077395-538a7c2b3e40?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Lahore', description: 'Cultural heartland with historic Mughal fort, badshahi mosque, and culinary streets', images: ['https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Hunza Valley', description: 'Pristine mountain kingdom with turquoise Attabad Lake and ancient forts', images: ['https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Karachi', description: 'Bustling Arabian Sea coastal metropolis and commercial hub', images: ['https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=800&auto=format&fit=crop&q=80'] }
    ]
  },
  {
    name: 'Japan',
    code: 'JPN',
    continent: 'Asia',
    currency: 'JPY (¥)',
    language: 'Japanese',
    timezone: 'UTC+9 (JST)',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
    description: 'Japan seamlessly blends ancient traditions with hyper-modern innovation, boasting historic Shinto shrines, tranquil Zen gardens, cherry blossoms, Mount Fuji, and world-renowned culinary artistry.',
    popularCities: [
      { name: 'Tokyo', description: 'Electric neon megalopolis featuring world-class dining, fashion, and tech', images: ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Kyoto', description: 'Imperial jewel with over a thousand wooden temples, bamboo groves, and geishas', images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Osaka', description: 'Gourmet street food capital, lively nightlife, and historic castle', images: ['https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Sapporo', description: 'Snow festival haven and gateway to Hokkaido alpine wilderness', images: ['https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80'] }
    ]
  },
  {
    name: 'United Arab Emirates',
    code: 'ARE',
    continent: 'Asia',
    currency: 'AED (د.إ)',
    language: 'Arabic / English',
    timezone: 'UTC+4 (GST)',
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&auto=format&fit=crop&q=80',
    description: 'The UAE is a global oasis of futuristic skyscrapers, ultra-luxury resorts, pristine Arabian Gulf beaches, and authentic desert safari adventures.',
    popularCities: [
      { name: 'Dubai', description: 'Home to Burj Khalifa, Palm Jumeirah, and futuristic world attractions', images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Abu Dhabi', description: 'Capital city with Sheikh Zayed Grand Mosque and Louvre cultural district', images: ['https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Sharjah', description: 'UNESCO cultural and literary capital of the Arab world', images: ['https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&auto=format&fit=crop&q=80'] }
    ]
  },
  {
    name: 'Switzerland',
    code: 'CHE',
    continent: 'Europe',
    currency: 'CHF (Fr.)',
    language: 'German / French / Italian',
    timezone: 'UTC+1 (CET)',
    coverImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&auto=format&fit=crop&q=80',
    description: 'Switzerland offers postcard-perfect alpine panoramas, crystal-clear glacial lakes, world-class ski slopes, panoramic scenic trains, and luxury Swiss craftsmanship.',
    popularCities: [
      { name: 'Zurich', description: 'Cosmopolitan banking and art hub on the shores of Lake Zurich', images: ['https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Geneva', description: 'Global diplomatic capital with iconic Jet dEau and Lake Geneva views', images: ['https://images.unsplash.com/photo-1573155993874-d5d48af862ba?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Lucerne', description: 'Medieval bridge city surrounded by dramatic Swiss Alps', images: ['https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80'] }
    ]
  },
  {
    name: 'Turkey',
    code: 'TUR',
    continent: 'Europe',
    currency: 'TRY (₺)',
    language: 'Turkish',
    timezone: 'UTC+3 (TRT)',
    coverImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&auto=format&fit=crop&q=80',
    description: 'Turkey bridges East and West with rich Byzantine and Ottoman history, hot air balloon flights over Cappadocia, turquoise Mediterranean coastlines, and bustling spice bazaars.',
    popularCities: [
      { name: 'Istanbul', description: 'Historic transcontinental city of Hagia Sophia and Bosphorus strait', images: ['https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Cappadocia', description: 'Fairy-tale landscape of cave dwellings and morning hot air balloons', images: ['https://images.unsplash.com/photo-1609137144822-26155998a44c?w=800&auto=format&fit=crop&q=80'] }
    ]
  },
  {
    name: 'Saudi Arabia',
    code: 'SAU',
    continent: 'Asia',
    currency: 'SAR (﷼)',
    language: 'Arabic',
    timezone: 'UTC+3 (AST)',
    coverImage: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200&auto=format&fit=crop&q=80',
    description: 'Saudi Arabia features spiritual sanctuaries, ancient UNESCO tombs in AlUla, Red Sea coral reefs, and futuristic mega-developments.',
    popularCities: [
      { name: 'Riyadh', description: 'Dynamic capital city blending historic Diriyah with modern skyline', images: ['https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Jeddah', description: 'Coastal Red Sea gateway with historic Al-Balad coral architecture', images: ['https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&auto=format&fit=crop&q=80'] }
    ]
  },
  {
    name: 'United Kingdom',
    code: 'GBR',
    continent: 'Europe',
    currency: 'GBP (£)',
    language: 'English',
    timezone: 'UTC+0 (GMT)',
    coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&auto=format&fit=crop&q=80',
    description: 'The United Kingdom offers iconic royal landmarks, rolling green countryside, historic castles, world-leading West End theater, and quintessential British charm.',
    popularCities: [
      { name: 'London', description: 'World capital featuring Big Ben, Tower Bridge, and West End', images: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Edinburgh', description: 'Scottish capital dominated by historic castle and Royal Mile', images: ['https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop&q=80'] }
    ]
  },
  {
    name: 'United States',
    code: 'USA',
    continent: 'North America',
    currency: 'USD ($)',
    language: 'English',
    timezone: 'UTC-5 (EST)',
    coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&auto=format&fit=crop&q=80',
    description: 'The United States spans iconic national parks, legendary metropolitan skylines, coastal highways, and diverse entertainment capitals.',
    popularCities: [
      { name: 'New York City', description: 'Global metropolis of Times Square, Central Park, and Broadway', images: ['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Los Angeles', description: 'Entertainment capital of Hollywood, beaches, and year-round sunshine', images: ['https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800&auto=format&fit=crop&q=80'] }
    ]
  },
  {
    name: 'France',
    code: 'FRA',
    continent: 'Europe',
    currency: 'EUR (€)',
    language: 'French',
    timezone: 'UTC+1 (CET)',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80',
    description: 'France captivates travelers with romantic Parisian boulevards, world-class gastronomy, sun-drenched French Riviera beaches, and historic Loire Valley chateaux.',
    popularCities: [
      { name: 'Paris', description: 'City of Light with the Eiffel Tower, Louvre, and haute cuisine', images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80'] }
    ]
  },
  {
    name: 'Italy',
    code: 'ITA',
    continent: 'Europe',
    currency: 'EUR (€)',
    language: 'Italian',
    timezone: 'UTC+1 (CET)',
    coverImage: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&auto=format&fit=crop&q=80',
    description: 'Italy is an open-air museum of ancient Roman ruins, Renaissance masterpieces, romantic Venetian canals, scenic Amalfi Coast cliffs, and authentic cuisine.',
    popularCities: [
      { name: 'Rome', description: 'Eternal City with the Colosseum, Vatican City, and Trevi Fountain', images: ['https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Florence', description: 'Renaissance capital of the Uffizi Gallery and Brunelleschi Duomo', images: ['https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=800&auto=format&fit=crop&q=80'] }
    ]
  },
  {
    name: 'Spain',
    code: 'ESP',
    continent: 'Europe',
    currency: 'EUR (€)',
    language: 'Spanish',
    timezone: 'UTC+1 (CET)',
    coverImage: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200&auto=format&fit=crop&q=80',
    description: 'Spain boasts Antoni Gaudi architecture, sunny Mediterranean shores, passionate flamenco performances, and historic Andalusian Moorish palaces.',
    popularCities: [
      { name: 'Barcelona', description: 'Catalan capital famous for Sagrada Familia and beachfront promenade', images: ['https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80'] },
      { name: 'Madrid', description: 'Stately capital with Prado Museum, royal palaces, and vibrant plazas', images: ['https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&auto=format&fit=crop&q=80'] }
    ]
  }
];

export const GLOBAL_COUNTRY_DICTIONARY = [
  { name: 'Pakistan', code: 'PK', continent: 'Asia', currency: 'PKR (Rs)', language: 'Urdu / English', timezone: 'UTC+5 (PKT)', aliases: ['pakistan', 'pak', 'pk'] },
  { name: 'Japan', code: 'JP', continent: 'Asia', currency: 'JPY (¥)', language: 'Japanese', timezone: 'UTC+9 (JST)', aliases: ['japan', 'jpn', 'jp', 'tokyo'] },
  { name: 'United Arab Emirates', code: 'AE', continent: 'Asia', currency: 'AED (د.إ)', language: 'Arabic / English', timezone: 'UTC+4 (GST)', aliases: ['united arab emirates', 'uae', 'emirates', 'dubai', 'abu dhabi', 'are', 'ae'] },
  { name: 'Saudi Arabia', code: 'SA', continent: 'Asia', currency: 'SAR (﷼)', language: 'Arabic', timezone: 'UTC+3 (AST)', aliases: ['saudi arabia', 'saudi', 'ksa', 'sau', 'sa', 'riyadh', 'jeddah'] },
  { name: 'United States', code: 'US', continent: 'North America', currency: 'USD ($)', language: 'English', timezone: 'UTC-5 (EST)', aliases: ['united states', 'usa', 'united states of america', 'us', 'america'] },
  { name: 'United Kingdom', code: 'GB', continent: 'Europe', currency: 'GBP (£)', language: 'English', timezone: 'UTC+0 (GMT)', aliases: ['united kingdom', 'uk', 'great britain', 'britain', 'england', 'gbr', 'gb'] },
  { name: 'Switzerland', code: 'CH', continent: 'Europe', currency: 'CHF (Fr.)', language: 'German / French / Italian', timezone: 'UTC+1 (CET)', aliases: ['switzerland', 'swiss', 'che', 'ch', 'zurich'] },
  { name: 'Turkey', code: 'TR', continent: 'Europe', currency: 'TRY (₺)', language: 'Turkish', timezone: 'UTC+3 (TRT)', aliases: ['turkey', 'turkiye', 'türkiye', 'tur', 'tr', 'istanbul'] },
  { name: 'France', code: 'FR', continent: 'Europe', currency: 'EUR (€)', language: 'French', timezone: 'UTC+1 (CET)', aliases: ['france', 'fra', 'fr', 'paris'] },
  { name: 'Germany', code: 'DE', continent: 'Europe', currency: 'EUR (€)', language: 'German', timezone: 'UTC+1 (CET)', aliases: ['germany', 'deutschland', 'deu', 'de', 'berlin', 'munich'] },
  { name: 'Italy', code: 'IT', continent: 'Europe', currency: 'EUR (€)', language: 'Italian', timezone: 'UTC+1 (CET)', aliases: ['italy', 'italia', 'ita', 'it', 'rome', 'florence'] },
  { name: 'Spain', code: 'ES', continent: 'Europe', currency: 'EUR (€)', language: 'Spanish', timezone: 'UTC+1 (CET)', aliases: ['spain', 'espana', 'españa', 'esp', 'es', 'barcelona', 'madrid'] },
  { name: 'Canada', code: 'CA', continent: 'North America', currency: 'CAD ($)', language: 'English / French', timezone: 'UTC-5 (EST)', aliases: ['canada', 'can', 'ca', 'toronto', 'vancouver'] },
  { name: 'Australia', code: 'AU', continent: 'Oceania', currency: 'AUD ($)', language: 'English', timezone: 'UTC+10 (AEST)', aliases: ['australia', 'aus', 'au', 'sydney', 'melbourne'] },
  { name: 'China', code: 'CN', continent: 'Asia', currency: 'CNY (¥)', language: 'Mandarin', timezone: 'UTC+8 (CST)', aliases: ['china', 'chn', 'cn', 'beijing', 'shanghai'] },
  { name: 'India', code: 'IN', continent: 'Asia', currency: 'INR (₹)', language: 'Hindi / English', timezone: 'UTC+5:30 (IST)', aliases: ['india', 'ind', 'in', 'delhi', 'mumbai'] },
  { name: 'Singapore', code: 'SG', continent: 'Asia', currency: 'SGD ($)', language: 'English / Malay / Mandarin', timezone: 'UTC+8 (SGT)', aliases: ['singapore', 'sgp', 'sg'] },
  { name: 'Malaysia', code: 'MY', continent: 'Asia', currency: 'MYR (RM)', language: 'Malay / English', timezone: 'UTC+8 (MYT)', aliases: ['malaysia', 'mys', 'my', 'kuala lumpur'] },
  { name: 'Thailand', code: 'TH', continent: 'Asia', currency: 'THB (฿)', language: 'Thai', timezone: 'UTC+7 (ICT)', aliases: ['thailand', 'tha', 'th', 'bangkok', 'phuket'] },
  { name: 'Indonesia', code: 'ID', continent: 'Asia', currency: 'IDR (Rp)', language: 'Indonesian', timezone: 'UTC+7 (WIB)', aliases: ['indonesia', 'idn', 'id', 'bali', 'jakarta'] },
  { name: 'Qatar', code: 'QA', continent: 'Asia', currency: 'QAR (QR)', language: 'Arabic / English', timezone: 'UTC+3 (AST)', aliases: ['qatar', 'qat', 'qa', 'doha'] },
  { name: 'Oman', code: 'OM', continent: 'Asia', currency: 'OMR (RO)', language: 'Arabic / English', timezone: 'UTC+4 (GST)', aliases: ['oman', 'omn', 'om', 'muscat'] },
  { name: 'Kuwait', code: 'KW', continent: 'Asia', currency: 'KWD (KD)', language: 'Arabic / English', timezone: 'UTC+3 (AST)', aliases: ['kuwait', 'kwt', 'kw'] },
  { name: 'Bahrain', code: 'BH', continent: 'Asia', currency: 'BHD (BD)', language: 'Arabic / English', timezone: 'UTC+3 (AST)', aliases: ['bahrain', 'bhr', 'bh', 'manama'] },
  { name: 'Egypt', code: 'EG', continent: 'Africa', currency: 'EGP (E£)', language: 'Arabic', timezone: 'UTC+2 (EET)', aliases: ['egypt', 'egy', 'eg', 'cairo'] },
  { name: 'Morocco', code: 'MA', continent: 'Africa', currency: 'MAD (DH)', language: 'Arabic / French', timezone: 'UTC+1 (CET)', aliases: ['morocco', 'mar', 'ma', 'marrakech', 'casablanca'] },
  { name: 'South Africa', code: 'ZA', continent: 'Africa', currency: 'ZAR (R)', language: 'English / Afrikaans', timezone: 'UTC+2 (SAST)', aliases: ['south africa', 'zaf', 'za', 'cape town'] },
  { name: 'New Zealand', code: 'NZ', continent: 'Oceania', currency: 'NZD ($)', language: 'English', timezone: 'UTC+12 (NZST)', aliases: ['new zealand', 'nzl', 'nz', 'auckland'] },
  { name: 'Netherlands', code: 'NL', continent: 'Europe', currency: 'EUR (€)', language: 'Dutch / English', timezone: 'UTC+1 (CET)', aliases: ['netherlands', 'holland', 'nld', 'nl', 'amsterdam'] },
  { name: 'Greece', code: 'GR', continent: 'Europe', currency: 'EUR (€)', language: 'Greek', timezone: 'UTC+2 (EET)', aliases: ['greece', 'grc', 'gr', 'athens', 'santorini'] },
  { name: 'Portugal', code: 'PT', continent: 'Europe', currency: 'EUR (€)', language: 'Portuguese', timezone: 'UTC+0 (WET)', aliases: ['portugal', 'prt', 'pt', 'lisbon', 'porto'] },
  { name: 'Austria', code: 'AT', continent: 'Europe', currency: 'EUR (€)', language: 'German', timezone: 'UTC+1 (CET)', aliases: ['austria', 'aut', 'at', 'vienna'] },
  { name: 'Norway', code: 'NO', continent: 'Europe', currency: 'NOK (kr)', language: 'Norwegian', timezone: 'UTC+1 (CET)', aliases: ['norway', 'nor', 'no', 'oslo'] },
  { name: 'Sweden', code: 'SE', continent: 'Europe', currency: 'SEK (kr)', language: 'Swedish', timezone: 'UTC+1 (CET)', aliases: ['sweden', 'swe', 'se', 'stockholm'] },
  { name: 'Denmark', code: 'DK', continent: 'Europe', currency: 'DKK (kr)', language: 'Danish', timezone: 'UTC+1 (CET)', aliases: ['denmark', 'dnk', 'dk', 'copenhagen'] },
  { name: 'Finland', code: 'FI', continent: 'Europe', currency: 'EUR (€)', language: 'Finnish / English', timezone: 'UTC+2 (EET)', aliases: ['finland', 'fin', 'fi', 'helsinki'] },
  { name: 'Brazil', code: 'BR', continent: 'South America', currency: 'BRL (R$)', language: 'Portuguese', timezone: 'UTC-3 (BRT)', aliases: ['brazil', 'brasil', 'bra', 'br', 'rio de janeiro'] },
  { name: 'Mexico', code: 'MX', continent: 'North America', currency: 'MXN ($)', language: 'Spanish', timezone: 'UTC-6 (CST)', aliases: ['mexico', 'mex', 'mx', 'cancun'] },
  { name: 'Argentina', code: 'AR', continent: 'South America', currency: 'ARS ($)', language: 'Spanish', timezone: 'UTC-3 (ART)', aliases: ['argentina', 'arg', 'ar', 'buenos aires'] },
  { name: 'Maldives', code: 'MV', continent: 'Asia', currency: 'MVR (Rf)', language: 'Dhivehi / English', timezone: 'UTC+5 (MVT)', aliases: ['maldives', 'mdv', 'mv', 'male'] },
  { name: 'Sri Lanka', code: 'LK', continent: 'Asia', currency: 'LKR (Rs)', language: 'Sinhala / Tamil / English', timezone: 'UTC+5:30 (SLST)', aliases: ['sri lanka', 'lka', 'lk', 'colombo'] },
  { name: 'Nepal', code: 'NP', continent: 'Asia', currency: 'NPR (Rs)', language: 'Nepali / English', timezone: 'UTC+5:45 (NPT)', aliases: ['nepal', 'npl', 'np', 'kathmandu'] },
  { name: 'Vietnam', code: 'VN', continent: 'Asia', currency: 'VND (₫)', language: 'Vietnamese', timezone: 'UTC+7 (ICT)', aliases: ['vietnam', 'vnm', 'vn', 'hanoi', 'da nang'] },
  { name: 'South Korea', code: 'KR', continent: 'Asia', currency: 'KRW (₩)', language: 'Korean', timezone: 'UTC+9 (KST)', aliases: ['south korea', 'korea', 'kor', 'kr', 'seoul'] },
  { name: 'Azerbaijan', code: 'AZ', continent: 'Asia', currency: 'AZN (₼)', language: 'Azerbaijani', timezone: 'UTC+4 (AZT)', aliases: ['azerbaijan', 'aze', 'az', 'baku'] },
  { name: 'Georgia', code: 'GE', continent: 'Europe', currency: 'GEL (₾)', language: 'Georgian', timezone: 'UTC+4 (GET)', aliases: ['georgia', 'geo', 'ge', 'tbilisi'] },
  { name: 'Jordan', code: 'JO', continent: 'Asia', currency: 'JOD (JD)', language: 'Arabic', timezone: 'UTC+3 (AST)', aliases: ['jordan', 'jor', 'jo', 'amman', 'petra'] },
  { name: 'Lebanon', code: 'LB', continent: 'Asia', currency: 'LBP (LL)', language: 'Arabic / French', timezone: 'UTC+2 (EET)', aliases: ['lebanon', 'lbn', 'lb', 'beirut'] },
  { name: 'Kenya', code: 'KE', continent: 'Africa', currency: 'KES (KSh)', language: 'Swahili / English', timezone: 'UTC+3 (EAT)', aliases: ['kenya', 'ken', 'ke', 'nairobi'] }
];

export const detectCountryTelemetry = (input) => {
  if (!input || typeof input !== 'string' || !input.trim()) return null;
  const q = input.trim().toLowerCase();

  const exactMatch = GLOBAL_COUNTRY_DICTIONARY.find(
    (c) => c.name.toLowerCase() === q || c.code.toLowerCase() === q || c.aliases.includes(q)
  );
  if (exactMatch) return exactMatch;

  const startsMatch = GLOBAL_COUNTRY_DICTIONARY.find(
    (c) => c.name.toLowerCase().startsWith(q) || c.aliases.some((a) => a.startsWith(q))
  );
  if (startsMatch) return startsMatch;

  const includesMatch = GLOBAL_COUNTRY_DICTIONARY.find(
    (c) => c.name.toLowerCase().includes(q) || c.aliases.some((a) => a.includes(q))
  );
  if (includesMatch) return includesMatch;

  return null;
};

export const findCountryPreset = (searchQuery) => {
  if (!searchQuery || !searchQuery.trim()) return null;
  const q = searchQuery.trim().toLowerCase();
  return (
    WORLD_COUNTRIES.find((c) => c.name.toLowerCase() === q || c.code.toLowerCase() === q) ||
    WORLD_COUNTRIES.find((c) => c.name.toLowerCase().startsWith(q) || c.code.toLowerCase().startsWith(q)) ||
    WORLD_COUNTRIES.find((c) => c.name.toLowerCase().includes(q))
  );
};

export const getCountryFlag = (countryInput = '') => {
  if (!countryInput || typeof countryInput !== 'string') return '🌍';
  const detected = detectCountryTelemetry(countryInput);
  let code = detected?.code || countryInput.trim().toUpperCase().slice(0, 2);
  if (code.length === 3) {
    const iso2Map = { PAK: 'PK', JPN: 'JP', ARE: 'AE', SAU: 'SA', CHE: 'CH', TUR: 'TR', USA: 'US', GBR: 'GB', FRA: 'FR', ITA: 'IT', ESP: 'ES', DEU: 'DE', CAN: 'CA', AUS: 'AU', CHN: 'CN', IND: 'IN', SGP: 'SG', MYS: 'MY', THA: 'TH', IDN: 'ID', QAT: 'QA', OMN: 'OM', KWT: 'KW', BHR: 'BH', EGY: 'EG', MAR: 'MA', ZAF: 'ZA', NZL: 'NZ', NLD: 'NL', GRC: 'GR', PRT: 'PT', AUT: 'AT', NOR: 'NO', SWE: 'SE', DNK: 'DK', FIN: 'FI', BRA: 'BR', MEX: 'MX', ARG: 'AR', MDV: 'MV', LKA: 'LK', NPL: 'NP', VNM: 'VN', KOR: 'KR', AZE: 'AZ', GEO: 'GE', JOR: 'JO', LBN: 'LB', KEN: 'KE' };
    code = iso2Map[code] || code.slice(0, 2);
  }
  if (code && code.length === 2 && /^[A-Z]{2}$/.test(code)) {
    return String.fromCodePoint(127397 + code.charCodeAt(0), 127397 + code.charCodeAt(1));
  }
  return '🌍';
};
