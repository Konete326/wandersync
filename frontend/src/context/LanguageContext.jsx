import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' }
];

const translations = {
  en: {
    profileTitle: 'Traveler Profile',
    profileSubtitle: 'Manage your account credentials, language and travel preferences',
    displayName: 'Display Name',
    travelStyle: 'Default Travel Style',
    currency: 'Preferred Currency',
    language: 'Preferred Language',
    homeLocation: 'Home City & Country (Resident Location)',
    homeLocationPlaceholder: 'e.g. Lahore, Pakistan or Tokyo, Japan',
    savePreferences: 'Save Preferences',
    savingChanges: 'Saving Changes...',
    communityHub: 'WanderSync Community & Friend Groups',
    publicLounges: 'Public Lounges',
    tripCircles: 'Destination & Trip Circles',
    friendsGroups: 'Friends & Groups',
    findFriends: 'Find Friends',
    publicTrips: 'Public Trips',
    residentBadge: 'Local Resident',
    travelerBadge: 'Active Journey Explorer',
    creatorBadge: 'Trip Creator',
    restrictedRoom: 'Restricted Community Circle',
    restrictedNotice: 'Only verified local residents living in this destination or travelers with a planned journey here can post messages.',
    updateProfileBtn: 'Update Resident Location in Profile',
    planTripBtn: 'Plan a Journey to Destination',
    typeMessage: 'Write your message or travel question...',
    postMessage: 'Send Message'
  },
  ur: {
    profileTitle: 'مسافر کا پروفائل',
    profileSubtitle: 'اپنی زبان، رہائشی مقام اور سفری ترجیحات کو ترتیب دیں',
    displayName: 'ڈسپلے کا نام',
    travelStyle: 'سفری انداز',
    currency: 'پسندیدہ کرنسی',
    language: 'پسندیدہ زبان',
    homeLocation: 'رہائشی شہر و ملک (جہاں آپ رہتے ہیں)',
    homeLocationPlaceholder: 'مثلاً لاہور، پاکستان یا ٹوکیو، جاپان',
    savePreferences: 'ترجیحات محفوظ کریں',
    savingChanges: 'محفوظ ہو رہا ہے...',
    communityHub: 'وانڈر سنک کمیونٹی اور ٹریول فورم',
    publicLounges: 'پبلک لاؤنجز',
    tripCircles: 'مقام کی کمیونٹی چیٹ و فورم',
    friendsGroups: 'دوست اور گروپس',
    findFriends: 'دوست تلاش کریں',
    publicTrips: 'پبلک ٹرپس',
    residentBadge: 'مقام کا رہائشی',
    travelerBadge: 'تصدیق شدہ مسافر',
    creatorBadge: 'ٹریپ بنانے والا',
    restrictedRoom: 'محدود کمیونٹی فورم',
    restrictedNotice: 'یہاں صرف وہی لوگ میسج کر سکتے ہیں جو اس مقام پر رہتے ہیں یا جن کا اس مقام کا سفر طے ہے۔',
    updateProfileBtn: 'پروفائل میں اپنا رہائشی مقام درج کریں',
    planTripBtn: 'اس مقام کیلئے سفر کا پلان بنائیں',
    typeMessage: 'اپنا پیغام یا سفری سوال لکھیں...',
    postMessage: 'پیغام بھیجیں'
  },
  ar: {
    profileTitle: 'الملف الشخصي للمسافر',
    profileSubtitle: 'إدارة تفضيلات الحساب واللغة وموقع الإقامة',
    displayName: 'اسم العرض',
    travelStyle: 'أسلوب السفر المفضل',
    currency: 'العملة المفضلة',
    language: 'اللغة المفضلة',
    homeLocation: 'مدينة ودولة الإقامة (محل السكن)',
    homeLocationPlaceholder: 'مثال: الرياض، السعودية أو دبي، الإمارات',
    savePreferences: 'حفظ التفضيلات',
    savingChanges: 'جاري الحفظ...',
    communityHub: 'مجتمع واندر سينك ومجموعات السفر',
    publicLounges: 'الصالات العامة',
    tripCircles: 'دوائر الرحلات والمناطق',
    friendsGroups: 'الأصدقاء والمجموعات',
    findFriends: 'البحث عن أصدقاء',
    publicTrips: 'الرحلات العامة',
    residentBadge: 'مقيم محلي',
    travelerBadge: 'مسافر نشط ومؤكد',
    creatorBadge: 'منشئ الرحلة',
    restrictedRoom: 'غرفة مناقشة مقيدة',
    restrictedNotice: 'يمكن فقط للمقيمين في هذه الوجهة أو المسافرين الذين لديهم خطة سفر نشطة إرسال الرسائل.',
    updateProfileBtn: 'تحديث موقع الإقامة في الملف',
    planTripBtn: 'تخطيط رحلة إلى هذه الوجهة',
    typeMessage: 'اكتب رسالتك أو استفسارك...',
    postMessage: 'إرسال الرسالة'
  },
  hi: {
    profileTitle: 'यात्री प्रोफ़ाइल',
    profileSubtitle: 'अपनी भाषा, निवास स्थान और यात्रा प्राथमिकताओं को प्रबंधित करें',
    displayName: 'प्रदर्शन नाम',
    travelStyle: 'डिफ़ॉल्ट यात्रा शैली',
    currency: 'पसंदीदा मुद्रा',
    language: 'पसंदीदा भाषा',
    homeLocation: 'निवास का शहर और देश',
    homeLocationPlaceholder: 'जैसे दिल्ली, भारत या टोक्यो, जापान',
    savePreferences: 'प्राथमिकताएं सहेजें',
    savingChanges: 'सहेजा जा रहा है...',
    communityHub: 'वांडरसिंक कम्युनिटी और यात्रा समूह',
    publicLounges: 'सार्वजनिक लाउंज',
    tripCircles: 'गंतव्य और ट्रिप चर्चा',
    friendsGroups: 'मित्र और समूह',
    findFriends: 'मित्र खोजें',
    publicTrips: 'सार्वजनिक यात्राएं',
    residentBadge: 'स्थानीय निवासी',
    travelerBadge: 'सक्रिय यात्री',
    creatorBadge: 'ट्रिप निर्माता',
    restrictedRoom: 'प्रतिबंधित कम्युनिटी रूम',
    restrictedNotice: 'केवल इस स्थान के स्थानीय निवासी या वे यात्री जिनकी यहां यात्रा नियोजित है, संदेश भेज सकते हैं।',
    updateProfileBtn: 'प्रोफ़ाइल में निवास स्थान अपडेट करें',
    planTripBtn: 'इस गंतव्य के लिए यात्रा बनाएं',
    typeMessage: 'अपना संदेश या प्रश्न लिखें...',
    postMessage: 'संदेश भेजें'
  },
  es: {
    profileTitle: 'Perfil del Viajero',
    profileSubtitle: 'Administra tus credenciales, idioma y preferencias de viaje',
    displayName: 'Nombre para Mostrar',
    travelStyle: 'Estilo de Viaje',
    currency: 'Moneda Preferida',
    language: 'Idioma Preferido',
    homeLocation: 'Ciudad y País de Residencia',
    homeLocationPlaceholder: 'ej. Madrid, España o Ciudad de México',
    savePreferences: 'Guardar Preferencias',
    savingChanges: 'Guardando Cambios...',
    communityHub: 'Comunidad WanderSync y Grupos de Viaje',
    publicLounges: 'Salones Públicos',
    tripCircles: 'Círculos de Destinos y Viajes',
    friendsGroups: 'Amigos y Grupos',
    findFriends: 'Buscar Amigos',
    publicTrips: 'Viajes Públicos',
    residentBadge: 'Residente Local',
    travelerBadge: 'Explorador Activo',
    creatorBadge: 'Creador del Viaje',
    restrictedRoom: 'Círculo Comunitario Restringido',
    restrictedNotice: 'Solo los residentes locales o viajeros con un itinerario planificado aquí pueden enviar mensajes.',
    updateProfileBtn: 'Actualizar Ubicación en Perfil',
    planTripBtn: 'Planear Viaje al Destino',
    typeMessage: 'Escribe tu mensaje...',
    postMessage: 'Enviar Mensaje'
  },
  fr: {
    profileTitle: 'Profil du Voyageur',
    profileSubtitle: 'Gérez vos identifiants, votre langue et vos préférences de voyage',
    displayName: 'Nom d\'affichage',
    travelStyle: 'Style de Voyage',
    currency: 'Devise Préférée',
    language: 'Langue Préférée',
    homeLocation: 'Ville et Pays de Résidence',
    homeLocationPlaceholder: 'ex. Paris, France ou Montréal, Canada',
    savePreferences: 'Enregistrer les Préférences',
    savingChanges: 'Enregistrement...',
    communityHub: 'Communauté WanderSync & Groupes d\'Amis',
    publicLounges: 'Salons Publics',
    tripCircles: 'Cercles de Destinations & Voyages',
    friendsGroups: 'Amis & Groupes',
    findFriends: 'Trouver des Amis',
    publicTrips: 'Voyages Publics',
    residentBadge: 'Résident Local',
    travelerBadge: 'Explorateur Confirmé',
    creatorBadge: 'Créateur du Voyage',
    restrictedRoom: 'Cercle Communautaire Restreint',
    restrictedNotice: 'Seuls les résidents locaux ou les voyageurs ayant un itinéraire ici peuvent envoyer des messages.',
    updateProfileBtn: 'Mettre à jour la Résidence',
    planTripBtn: 'Planifier un Voyage vers cette Destination',
    typeMessage: 'Écrivez votre message...',
    postMessage: 'Envoyer le Message'
  },
  de: {
    profileTitle: 'Reiseprofil',
    profileSubtitle: 'Verwalten Sie Sprache, Wohnort und Reiseeinstellungen',
    displayName: 'Anzeigename',
    travelStyle: 'Reisestil',
    currency: 'Bevorzugte Währung',
    language: 'Bevorzugte Sprache',
    homeLocation: 'Wohnort & Land (Wohnsitz)',
    homeLocationPlaceholder: 'z.B. Berlin, Deutschland oder Wien, Österreich',
    savePreferences: 'Einstellungen speichern',
    savingChanges: 'Speichern...',
    communityHub: 'WanderSync Community & Reisegruppen',
    publicLounges: 'Öffentliche Lounges',
    tripCircles: 'Reise- & Zielort-Foren',
    friendsGroups: 'Freunde & Gruppen',
    findFriends: 'Freunde finden',
    publicTrips: 'Öffentliche Reisen',
    residentBadge: 'Einheimischer',
    travelerBadge: 'Aktiver Reisender',
    creatorBadge: 'Reise-Ersteller',
    restrictedRoom: 'Eingeschränktes Community-Forum',
    restrictedNotice: 'Nur Anwohner oder Reisende mit geplanter Reiseroute können hier Nachrichten senden.',
    updateProfileBtn: 'Wohnort im Profil anpassen',
    planTripBtn: 'Reise zu diesem Ziel planen',
    typeMessage: 'Schreiben Sie eine Nachricht...',
    postMessage: 'Nachricht senden'
  },
  tr: {
    profileTitle: 'Gezgin Profili',
    profileSubtitle: 'Dil, ikamet konumu ve seyahat tercihlerinizi yönetin',
    displayName: 'Görünen İsim',
    travelStyle: 'Seyahat Tarzı',
    currency: 'Tercih Edilen Para Birimi',
    language: 'Tercih Edilen Dil',
    homeLocation: 'İkamet Şehri ve Ülkesi',
    homeLocationPlaceholder: 'Örn: İstanbul, Türkiye veya Ankara',
    savePreferences: 'Tercihleri Kaydet',
    savingChanges: 'Kaydediliyor...',
    communityHub: 'WanderSync Topluluğu ve Gruplar',
    publicLounges: 'Genel Salonlar',
    tripCircles: 'Destinasyon & Gezi Çevreleri',
    friendsGroups: 'Arkadaşlar & Gruplar',
    findFriends: 'Arkadaş Bul',
    publicTrips: 'Herkese Açık Geziler',
    residentBadge: 'Yerel Sakin',
    travelerBadge: 'Aktif Gezgin',
    creatorBadge: 'Gezi Sahibi',
    restrictedRoom: 'Kısıtlı Topluluk Odası',
    restrictedNotice: 'Burada sadece yerel sakinler ve planlanmış gezisi olan doğrulanmış gezginler mesaj yazabilir.',
    updateProfileBtn: 'Profilden İkametgahı Güncelle',
    planTripBtn: 'Bu Destinasyona Gezi Planla',
    typeMessage: 'Mesajınızı yazın...',
    postMessage: 'Mesaj Gönder'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('wandersync_lang') || user?.preferences?.language || 'en';
  });

  useEffect(() => {
    if (user?.preferences?.language) {
      setCurrentLang(user.preferences.language);
      localStorage.setItem('wandersync_lang', user.preferences.language);
    }
  }, [user?._id, user?.preferences?.language]);

  const changeLanguage = (langCode) => {
    if (!langCode) return;
    setCurrentLang(langCode);
    localStorage.setItem('wandersync_lang', langCode);
  };

  const t = (key) => {
    const langDict = translations[currentLang] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage: changeLanguage, t, currentLangMeta, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
