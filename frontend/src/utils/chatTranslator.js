import api from '../services/api';

// In-memory cache for ultra-fast instant lookups
const memoryCache = new Map();
const inFlightRequests = new Map();

// LocalStorage Persistent Cache Helper
const STORAGE_KEY = 'wandersync_chat_translations_v2';
const loadStorageCache = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveToStorageCache = (key, value) => {
  try {
    const current = loadStorageCache();
    current[key] = value;
    // Keep cache under reasonable size (max 500 entries)
    const keys = Object.keys(current);
    if (keys.length > 500) {
      delete current[keys[0]];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage quota errors
  }
};

// High-frequency travel & conversational phrases dictionary for 0ms instant translation
const PHRASE_MAP = {
  // English to Roman Urdu
  en_to_ur: [
    { en: /\b(hello|hi|hey)\b/gi, ur: 'Assalam o Alaikum / Hello' },
    { en: /\bhow are you\b/gi, ur: 'Aap kaise hain' },
    { en: /\bwhat is the best time to visit\b/gi, ur: 'Yahan ghoomne ka sabse behtareen waqt konsa hai' },
    { en: /\bwhat are the best places to visit\b/gi, ur: 'Yahan ghoomne ke liye behtareen jaghein konsi hain' },
    { en: /\bcan anyone recommend good hotels\b/gi, ur: 'Kya koi ache hotels recommend kar sakta hai' },
    { en: /\bis this place safe for tourists\b/gi, ur: 'Kya yeh jagah tourists ke liye safe aur mehfooz hai' },
    { en: /\bfood is amazing\b/gi, ur: 'Khana bohat zabardast hai' },
    { en: /\bdefinitely visit\b/gi, ur: 'Zaroor visit karein' },
    { en: /\bweather is beautiful\b/gi, ur: 'Mausam bohat pyara aur shandaar hai' },
    { en: /\bhow much does it cost\b/gi, ur: 'Is ka kitna kharcha / cost hoga' },
    { en: /\bhave a safe journey\b/gi, ur: 'Aapka safar asaan aur kamyab ho' },
    { en: /\bthank you very much\b/gi, ur: 'Aapka bohat bohat shukriya' },
    { en: /\bthank you|thanks\b/gi, ur: 'Shukriya' },
    { en: /\bgreat itinerary\b/gi, ur: 'Bohat shandaar travel itinerary hai' },
    { en: /\bsee you there\b/gi, ur: 'Wahan mulaqat hoti hai' },
    { en: /\bwelcome to\b/gi, ur: 'Khush Amdeed' },
    { en: /\bi am planning a trip\b/gi, ur: 'Main trip plan kar raha hoon' },
    { en: /\bany local tips\b/gi, ur: 'Koi local advice ya tips hain' },
    { en: /\bgood morning\b/gi, ur: 'Subah bakhair' },
    { en: /\bgood night\b/gi, ur: 'Shab bakhair' },
    { en: /\bwhere to stay\b/gi, ur: 'Kahan thehra jaye' },
    { en: /\bvery beautiful\b/gi, ur: 'Bohat khubsurat' }
  ],

  // Roman Urdu to English
  ur_to_en: [
    { ur: /\b(bohat achi jagah hai|bohat pyari jagah hai|bohat achha hai)\b/gi, en: 'It is a wonderful and beautiful place' },
    { ur: /\b(zaroor visit karein|zaroor jayein|zarur jao)\b/gi, en: 'Definitely visit this place' },
    { ur: /\b(khana bohat zabardast hai|khana lazeez hai|khana bohot acha hai)\b/gi, en: 'The food is absolutely amazing and delicious' },
    { ur: /\bshaam ke waqt\b/gi, en: 'in the evening' },
    { ur: /\bsubah ke waqt\b/gi, en: 'in the morning' },
    { ur: /\bmausam kaisa hai\b/gi, en: 'How is the weather there?' },
    { ur: /\bmausam bohat acha hai\b/gi, en: 'The weather is very pleasant and pleasant' },
    { ur: /\b(kisi ko achi hotel pata hai|koi acha hotel batao)\b/gi, en: 'Does anyone know good hotels around here?' },
    { ur: /\bbohat shukriya\b/gi, en: 'Thank you very much' },
    { ur: /\bshukriya\b/gi, en: 'Thank you' },
    { ur: /\baap kaise hain|kese ho\b/gi, en: 'How are you?' },
    { ur: /\bkhush amdeed\b/gi, en: 'Welcome' },
    { ur: /\bmain yahan rehta hoon\b/gi, en: 'I am a local resident here' },
    { ur: /\bmeri trip bani hoi hai\b/gi, en: 'I have a trip planned for this destination' },
    { ur: /\bkya haal hai\b/gi, en: 'How are things going?' },
    { ur: /\btheek hai|thik hai\b/gi, en: 'All good / Okay' },
    { ur: /\bkitna kharcha hoga\b/gi, en: 'How much will it cost?' },
    { ur: /\bkab jana chahiye\b/gi, en: 'When is the best time to visit?' }
  ]
};

const ROMAN_URDU_KEYWORDS = [
  'karein', 'kare', 'karna', 'karta', 'karti', 'karte', 'hain', 'hai', 'hon', 'hoon', 'mein', 'me', 
  'bohat', 'bahut', 'bohot', 'shukriya', 'zaroor', 'zarur', 'kese', 'kaise', 'kaisi', 'kaisa', 
  'yahan', 'wahan', 'bhi', 'kuch', 'hoga', 'hogi', 'hoge', 'hona', 'mera', 'meri', 'mere', 'khana', 
  'gaye', 'gayi', 'gaya', 'jana', 'jane', 'jao', 'jaenge', 'chahiye', 'chahiyein', 'bhai', 'bhaiya', 
  'apka', 'aapka', 'apki', 'aapki', 'apke', 'aapke', 'accha', 'achha', 'achi', 'achhi', 'ache', 'achhe', 
  'pyara', 'pyari', 'zabardast', 'theek', 'thik', 'kya', 'kia', 'kyun', 'kyu', 'kab', 'kahan', 'kidhar', 
  'kitna', 'kitni', 'kitne', 'sath', 'saath', 'wala', 'wali', 'wale', 'hum', 'tum', 'aap', 'woh', 'yeh', 
  'ye', 'raha', 'rahi', 'rahe', 'baat', 'waqt', 'shandar', 'shandaar', 'behtareen', 'lazeez', 'mausam', 
  'safari', 'jagah', 'jageh', 'gari', 'gaari', 'hotel', 'subah', 'shaam', 'raat', 'din', 'pata', 'batao', 
  'bataen', 'bataiye', 'dekho', 'dekhein', 'kren', 'krna', 'kr', 'krte', 'krty', 'btao', 'sb', 'sab', 
  'koi', 'kisi', 'kesi', 'lag', 'laga', 'rahe', 'pe', 'par', 'ko', 'se', 'ki', 'ka', 'ke', 
  'tha', 'thi', 'the', 'sakte', 'sakti', 'sakta', 'banao', 'bana', 'bani', 'diya', 'diye', 'dekh'
];

// Fast detection of Roman Urdu / Urdu script vs Standard English
export const detectMessageLanguage = (text) => {
  if (!text) return 'en';
  const clean = text.toLowerCase().trim();
  
  // 1. Check for Arabic/Urdu unicode characters
  if (/[\u0600-\u06FF]/.test(clean)) return 'ur';

  // 2. Check Roman Urdu token overlap
  const words = clean.split(/[\s,?.!/\\;:"'()\[\]{}#@&*+_-]+/);
  for (const w of words) {
    const stripped = w.replace(/[^a-z]/g, '');
    if (!stripped) continue;
    if (ROMAN_URDU_KEYWORDS.includes(stripped)) {
      return 'ur';
    }
  }

  // 3. Check for typical Roman Urdu suffix/grammatical patterns
  if (/\b\w+(?:unga|ungi|ainge|enge|aonga|aongi|kren|krte|krty|wala|wali|wale|chahiye)\b/i.test(clean)) {
    return 'ur';
  }

  return 'en';
};

export const cleanTranslationOutput = (raw, fallback = '') => {
  if (!raw || typeof raw !== 'string') return fallback || '';
  let cleaned = raw.trim();

  // Strip markdown code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Parse JSON if returned as object/JSON string
  if (cleaned.startsWith('{') && (cleaned.includes('translation') || cleaned.includes(':'))) {
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.translation) cleaned = String(parsed.translation).trim();
      else if (parsed.translatedText) cleaned = String(parsed.translatedText).trim();
      else if (parsed.text) cleaned = String(parsed.text).trim();
      else {
        const firstVal = Object.values(parsed)[0];
        if (firstVal && typeof firstVal === 'string') cleaned = firstVal.trim();
      }
    } catch {
      const match = cleaned.match(/["']?(?:translation|translatedText|text)["']?\s*:\s*["']?([^"'}]+)/i);
      if (match && match[1]) cleaned = match[1].trim();
    }
  }

  // Strip all JSON artifacts, prefixes, brackets, quotes
  cleaned = cleaned.replace(/^\{?\s*["']?(?:translation|translatedText|text)?["']?\s*:\s*["']?/i, '');
  cleaned = cleaned.replace(/^(?:Translation|Translated Text|Urdu|English):\s*/i, '');
  cleaned = cleaned.replace(/^["'`{\[\s\\]+/g, '');
  cleaned = cleaned.replace(/["'`}\]\s\\]+$/g, '').trim();

  return cleaned || fallback || '';
};

// Queue system for concurrency control (max 3 parallel network calls)
class AsyncQueue {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  push(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  process() {
    if (this.running >= this.concurrency || this.queue.length === 0) return;
    const { task, resolve, reject } = this.queue.shift();
    this.running++;
    task()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.running--;
        this.process();
      });
  }
}

const translationQueue = new AsyncQueue(3);

// Translate function calling backend AI with instant caching & fallback
export const translateMessageContent = async (text, userPreferredLang = 'en') => {
  if (!text || !text.trim()) return text;
  const trimmed = text.trim();
  const targetLang = (userPreferredLang || 'en').toLowerCase().trim();
  const detectedLang = detectMessageLanguage(trimmed);

  // If text is detected as pure standard English and target is English, return immediately
  if (targetLang === 'en' && detectedLang === 'en') {
    return trimmed;
  }
  // If target is Urdu and detected as pure Urdu script without English tokens
  if ((targetLang === 'ur' || targetLang === 'pk') && detectedLang === 'ur' && !/[a-zA-Z]{4,}/.test(trimmed)) {
    return trimmed;
  }

  const cacheKey = `${targetLang}_${trimmed}`;

  // 1. Instant Memory Cache (0 ms)
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  // 2. Instant LocalStorage Cache (0 ms)
  const diskCache = loadStorageCache();
  if (diskCache[cacheKey]) {
    memoryCache.set(cacheKey, diskCache[cacheKey]);
    return diskCache[cacheKey];
  }

  // 3. Fast Phrase Substitution Dictionary (0 ms) for Urdu <-> English fast path
  let quickTranslation = trimmed;
  let phraseMatched = false;
  if (targetLang === 'ur' || targetLang === 'pk') {
    PHRASE_MAP.en_to_ur.forEach(({ en, ur }) => {
      if (en.test(quickTranslation)) {
        quickTranslation = quickTranslation.replace(en, ur);
        phraseMatched = true;
      }
    });
  } else if (targetLang === 'en') {
    PHRASE_MAP.ur_to_en.forEach(({ ur, en }) => {
      if (ur.test(quickTranslation)) {
        quickTranslation = quickTranslation.replace(ur, en);
        phraseMatched = true;
      }
    });
  }

  if (phraseMatched && (targetLang !== 'en' || detectMessageLanguage(quickTranslation) === 'en')) {
    const cleanedPhrase = cleanTranslationOutput(quickTranslation, trimmed);
    memoryCache.set(cacheKey, cleanedPhrase);
    saveToStorageCache(cacheKey, cleanedPhrase);
    return cleanedPhrase;
  }

  // 4. In-flight request deduplication
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const taskPromise = translationQueue.push(async () => {
    try {
      const res = await api.post(
        '/ai/translate-message',
        {
          text: trimmed,
          targetLang,
          sourceLang: detectedLang
        },
        { timeout: 4500 }
      );

      if (res.data?.data?.translatedText) {
        const finalResult = cleanTranslationOutput(res.data.data.translatedText, quickTranslation);
        if (finalResult && finalResult.trim().toLowerCase() !== trimmed.toLowerCase()) {
          memoryCache.set(cacheKey, finalResult);
          saveToStorageCache(cacheKey, finalResult);
          return finalResult;
        }
      }
    } catch {
      // Return fast heuristic fallback on timeout or error
    }

    const fallbackResult = cleanTranslationOutput(quickTranslation, trimmed);
    memoryCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  });

  inFlightRequests.set(cacheKey, taskPromise);
  taskPromise.finally(() => {
    inFlightRequests.delete(cacheKey);
  });

  return taskPromise;
};
