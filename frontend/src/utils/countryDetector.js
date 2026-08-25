export const countryCallingCodes = [
  { code: '+92', country: 'PK', name: 'Pakistan', mask: '### #######' },
  { code: '+971', country: 'UAE', name: 'United Arab Emirates', mask: '## ### ####' },
  { code: '+966', country: 'KSA', name: 'Saudi Arabia', mask: '## ### ####' },
  { code: '+1', country: 'US/CA', name: 'United States / Canada', mask: '(###) ###-####' },
  { code: '+44', country: 'UK', name: 'United Kingdom', mask: '#### ######' },
  { code: '+91', country: 'IN', name: 'India', mask: '##### #####' },
  { code: '+90', country: 'TR', name: 'Turkey', mask: '### ### ####' },
  { code: '+974', country: 'QA', name: 'Qatar', mask: '#### ####' },
  { code: '+968', country: 'OM', name: 'Oman', mask: '#### ####' },
  { code: '+973', country: 'BH', name: 'Bahrain', mask: '#### ####' },
  { code: '+965', country: 'KW', name: 'Kuwait', mask: '#### ####' },
  { code: '+61', country: 'AU', name: 'Australia', mask: '### ### ###' },
  { code: '+49', country: 'DE', name: 'Germany', mask: '#### #######' },
  { code: '+33', country: 'FR', name: 'France', mask: '# ## ## ## ##' },
  { code: '+81', country: 'JP', name: 'Japan', mask: '## #### ####' },
  { code: '+86', country: 'CN', name: 'China', mask: '### #### ####' },
  { code: '+60', country: 'MY', name: 'Malaysia', mask: '## ### ####' },
  { code: '+65', country: 'SG', name: 'Singapore', mask: '#### ####' },
  { code: '+34', country: 'ES', name: 'Spain', mask: '### ### ###' },
  { code: '+39', country: 'IT', name: 'Italy', mask: '### ### ####' }
];

const TIMEZONE_TO_CODE = {
  'Asia/Karachi': '+92',
  'Asia/Dubai': '+971',
  'Asia/Riyadh': '+966',
  'Asia/Kolkata': '+91',
  'Asia/Calcutta': '+91',
  'Europe/London': '+44',
  'Europe/Berlin': '+49',
  'Europe/Paris': '+33',
  'Asia/Tokyo': '+81',
  'Asia/Shanghai': '+86',
  'Europe/Istanbul': '+90',
  'Asia/Kuala_Lumpur': '+60',
  'Asia/Singapore': '+65',
  'Asia/Qatar': '+974',
  'Asia/Muscat': '+968',
  'Asia/Bahrain': '+973',
  'Asia/Kuwait': '+965',
  'Europe/Madrid': '+34',
  'Europe/Rome': '+39'
};

const COUNTRY_ISO_TO_CODE = {
  PK: '+92',
  AE: '+971',
  SA: '+966',
  US: '+1',
  CA: '+1',
  GB: '+44',
  UK: '+44',
  IN: '+91',
  TR: '+90',
  QA: '+974',
  OM: '+968',
  BH: '+973',
  KW: '+965',
  AU: '+61',
  DE: '+49',
  FR: '+33',
  JP: '+81',
  CN: '+86',
  MY: '+60',
  SG: '+65',
  ES: '+34',
  IT: '+39'
};

export const detectLocalCallingCode = () => {
  try {
    const saved = localStorage.getItem('wandersync_default_country_code');
    if (saved && countryCallingCodes.some((c) => c.code === saved)) {
      return saved;
    }

    if (Intl && Intl.DateTimeFormat) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        if (TIMEZONE_TO_CODE[tz]) return TIMEZONE_TO_CODE[tz];
        if (tz.startsWith('America/')) return '+1';
        if (tz.startsWith('Australia/')) return '+61';
      }
    }

    const lang = navigator.language || (navigator.languages && navigator.languages[0]);
    if (lang && lang.includes('-')) {
      const region = lang.split('-')[1]?.toUpperCase();
      if (region && COUNTRY_ISO_TO_CODE[region]) {
        return COUNTRY_ISO_TO_CODE[region];
      }
    }
  } catch {
    return '+92';
  }

  return '+92';
};

export const setDefaultCallingCode = (code) => {
  try {
    localStorage.setItem('wandersync_default_country_code', code);
  } catch {}
};

export const formatPhoneNumber = (digits, mask) => {
  if (!digits || !mask) return digits || '';
  const clean = digits.replace(/\D/g, '');
  let formatted = '';
  let cleanIndex = 0;
  for (let i = 0; i < mask.length && cleanIndex < clean.length; i++) {
    if (mask[i] === '#') {
      formatted += clean[cleanIndex++];
    } else {
      formatted += mask[i];
    }
  }
  return formatted;
};
