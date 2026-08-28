import api from '../services/api';

const translationCache = new Map();

// High frequency common conversational & travel phrases dictionary for instant fallback
const PHRASE_MAP = {
  // English to Roman Urdu
  en_to_ur: [
    { en: /hello|hi|hey/gi, ur: 'Assalam o Alaikum / Hello' },
    { en: /how are you/gi, ur: 'Aap kaise hain' },
    { en: /what is the best time to visit/gi, ur: 'Yahan ghoomne ka sabse behtareen waqt konsa hai' },
    { en: /what are the best places to visit/gi, ur: 'Yahan ghoomne ke liye behtareen jaghein konsi hain' },
    { en: /can anyone recommend good hotels/gi, ur: 'Kya koi ache hotels recommend kar sakta hai' },
    { en: /is this place safe for tourists/gi, ur: 'Kya yeh jagah tourists ke liye safe aur mehfooz hai' },
    { en: /food is amazing/gi, ur: 'Khana bohat zabardast hai' },
    { en: /definitely visit/gi, ur: 'Zaroor visit karein' },
    { en: /weather is beautiful/gi, ur: 'Mausam bohat pyara aur shandaar hai' },
    { en: /how much does it cost/gi, ur: 'Is ka kitna kharcha / cost hoga' },
    { en: /have a safe journey/gi, ur: 'Aapka safar asaan aur kamyab ho' },
    { en: /thank you very much/gi, ur: 'Aapka bohat bohat shukriya' },
    { en: /thanks/gi, ur: 'Shukriya' },
    { en: /great itinerary/gi, ur: 'Bohat shandaar travel itinerary hai' },
    { en: /see you there/gi, ur: 'Wahan mulaqat hoti hai' },
    { en: /welcome to/gi, ur: 'Khush Amdeed' },
    { en: /i am planning a trip/gi, ur: 'Main trip plan kar raha hoon' },
    { en: /any local tips/gi, ur: 'Koi local advice ya tips hain' }
  ],

  // Roman Urdu to English
  ur_to_en: [
    { ur: /bohat achi jagah hai|bohat pyari jagah hai/gi, en: 'It is a wonderful and beautiful place' },
    { ur: /zaroor visit karein|zaroor jayein/gi, en: 'Definitely visit this place' },
    { ur: /khana bohat zabardast hai|khana lazeez hai/gi, en: 'The food is absolutely amazing and delicious' },
    { ur: /shaam ke waqt/gi, en: 'in the evening' },
    { ur: /subah ke waqt/gi, en: 'in the morning' },
    { ur: /mausam kaisa hai/gi, en: 'How is the weather there?' },
    { ur: /mausam bohat acha hai/gi, en: 'The weather is very pleasant' },
    { ur: /kisi ko achi hotel pata hai/gi, en: 'Does anyone know good hotels around here?' },
    { ur: /shukriya/gi, en: 'Thank you' },
    { ur: /bohat shukriya/gi, en: 'Thank you very much' },
    { ur: /aap kaise hain/gi, en: 'How are you?' },
    { ur: /khush amdeed/gi, en: 'Welcome' },
    { ur: /main yahan rehta hoon/gi, en: 'I am a local resident here' },
    { ur: /meri trip bani hoi hai/gi, en: 'I have a trip planned for this destination' }
  ]
};

// Check if a text appears to be in Roman Urdu / Hindi vs Standard English
export const detectMessageLanguage = (text) => {
  if (!text) return 'en';
  const clean = text.toLowerCase();
  const romanUrduKeywords = ['karein', 'kare', 'hain', 'hai', 'mein', 'bohat', 'shukriya', 'zaroor', 'kese', 'kaise', 'yahan', 'wahan', 'bhi', 'kuch', 'hoga', 'mera', 'meri', 'khana', 'gaye', 'jana', 'chahiye', 'bhai', 'apka', 'aapka', 'accha', 'achha', 'pyara', 'zabardast'];
  const matches = romanUrduKeywords.filter((kw) => clean.includes(kw));
  return matches.length >= 1 ? 'ur' : 'en';
};

// Translate function calling backend AI with fallback
export const translateMessageContent = async (text, userPreferredLang = 'en') => {
  if (!text || !text.trim()) return text;
  const trimmed = text.trim();
  const detectedLang = detectMessageLanguage(trimmed);

  // If user wants Urdu/Hindi and message is in English -> translate to Roman Urdu
  // If user wants English and message is in Roman Urdu/Urdu -> translate to English
  const targetLang = (userPreferredLang === 'ur' || userPreferredLang === 'hi' || userPreferredLang === 'pk') ? 'ur' : 'en';

  // If target matches source language, return original
  if (targetLang === detectedLang && userPreferredLang === 'en' && detectedLang === 'en') {
    return trimmed;
  }

  const cacheKey = `${targetLang}_${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // Fast phrase substitution fallback
  let quickTranslation = trimmed;
  if (targetLang === 'ur') {
    PHRASE_MAP.en_to_ur.forEach(({ en, ur }) => {
      quickTranslation = quickTranslation.replace(en, ur);
    });
  } else {
    PHRASE_MAP.ur_to_en.forEach(({ ur, en }) => {
      quickTranslation = quickTranslation.replace(ur, en);
    });
  }

  // Try API for high-fidelity contextual translation
  try {
    const res = await api.post('/ai/translate-message', {
      text: trimmed,
      targetLang,
      sourceLang: detectedLang
    });

    if (res.data?.data?.translatedText) {
      const finalResult = res.data.data.translatedText;
      translationCache.set(cacheKey, finalResult);
      return finalResult;
    }
  } catch {
    // Return quick translation if API fails
  }

  translationCache.set(cacheKey, quickTranslation);
  return quickTranslation;
};
