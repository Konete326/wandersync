export const countryCallingCodes = [
  { code: '+92', country: 'PK', name: 'Pakistan', mask: '### #######', sample: '300 1234567' },
  { code: '+971', country: 'UAE', name: 'United Arab Emirates', mask: '## ### ####', sample: '50 123 4567' },
  { code: '+966', country: 'KSA', name: 'Saudi Arabia', mask: '## ### ####', sample: '50 123 4567' },
  { code: '+1', country: 'US/CA', name: 'United States / Canada', mask: '(###) ###-####', sample: '(555) 000-0000' },
  { code: '+44', country: 'UK', name: 'United Kingdom', mask: '#### ######', sample: '7911 123456' },
  { code: '+91', country: 'IN', name: 'India', mask: '##### #####', sample: '98765 43210' },
  { code: '+90', country: 'TR', name: 'Turkey', mask: '### ### ####', sample: '532 123 4567' },
  { code: '+974', country: 'QA', name: 'Qatar', mask: '#### ####', sample: '3312 3456' },
  { code: '+968', country: 'OM', name: 'Oman', mask: '#### ####', sample: '9123 4567' },
  { code: '+973', country: 'BH', name: 'Bahrain', mask: '#### ####', sample: '3600 1234' },
  { code: '+965', country: 'KW', name: 'Kuwait', mask: '#### ####', sample: '9001 2345' },
  { code: '+61', country: 'AU', name: 'Australia', mask: '### ### ###', sample: '412 345 678' },
  { code: '+49', country: 'DE', name: 'Germany', mask: '#### #######', sample: '1511 2345678' },
  { code: '+33', country: 'FR', name: 'France', mask: '# ## ## ## ##', sample: '6 12 34 56 78' },
  { code: '+81', country: 'JP', name: 'Japan', mask: '## #### ####', sample: '90 1234 5678' },
  { code: '+86', country: 'CN', name: 'China', mask: '### #### ####', sample: '138 0013 8000' },
  { code: '+60', country: 'MY', name: 'Malaysia', mask: '## ### ####', sample: '12 345 6789' },
  { code: '+65', country: 'SG', name: 'Singapore', mask: '#### ####', sample: '8123 4567' },
  { code: '+34', country: 'ES', name: 'Spain', mask: '### ### ###', sample: '612 345 678' },
  { code: '+39', country: 'IT', name: 'Italy', mask: '### ### ####', sample: '312 345 6789' }
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
  if (!digits) return '';
  const clean = String(digits).replace(/\D/g, '');
  if (!clean) return '';
  if (!mask) return clean;

  let formatted = '';
  let cleanIndex = 0;
  for (let i = 0; i < mask.length && cleanIndex < clean.length; i++) {
    if (mask[i] === '#') {
      formatted += clean[cleanIndex++];
    } else {
      formatted += mask[i];
    }
  }
  if (cleanIndex < clean.length) {
    formatted += (formatted.length > 0 ? ' ' : '') + clean.slice(cleanIndex);
  }
  return formatted;
};
