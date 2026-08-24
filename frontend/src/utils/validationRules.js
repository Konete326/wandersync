export const REGEX_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^.{6,}$/,
  countryCode: /^[A-Z]{2,3}$/,
  priceAmount: /^\$?\d+(\.\d{1,2})?(\/(night|day|hr|mo|yr))?$/i,
  numericOnly: /^\d+$/,
  decimalNumber: /^\d+(\.\d+)?$/,
  rating: /^(?:[1-4](?:\.\d)?|5(?:\.0)?)$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i,
  phone: /^\+?[0-9\s\-()]{7,20}$/,
  safeText: /^[a-zA-Z0-9\s.,'’&()\-–—/:?#+]{2,200}$/,
  cityName: /^[a-zA-Z\s.,'’\-]{2,60}$/,
  timezone: /^(UTC|GMT)?[+-]?\d{1,2}(:\d{2})?$/i
};

export const validateField = (type, value) => {
  if (value === undefined || value === null) return { isValid: true, error: '' };
  const str = String(value).trim();
  if (!str) return { isValid: true, error: '' };

  switch (type) {
    case 'email':
      return {
        isValid: REGEX_PATTERNS.email.test(str),
        error: REGEX_PATTERNS.email.test(str) ? '' : 'Please enter a valid email address (e.g. user@example.com)'
      };

    case 'password':
      return {
        isValid: REGEX_PATTERNS.password.test(str),
        error: REGEX_PATTERNS.password.test(str) ? '' : 'Password must be at least 6 characters'
      };

    case 'countryCode':
      return {
        isValid: REGEX_PATTERNS.countryCode.test(str.toUpperCase()),
        error: REGEX_PATTERNS.countryCode.test(str.toUpperCase()) ? '' : '2 or 3 letter uppercase code (e.g. JP, USA)'
      };

    case 'price':
      return {
        isValid: REGEX_PATTERNS.priceAmount.test(str) || /^\d+(\.\d{1,2})?$/.test(str),
        error: (REGEX_PATTERNS.priceAmount.test(str) || /^\d+(\.\d{1,2})?$/.test(str)) ? '' : 'Valid price format required (e.g. $180/night or 45.00)'
      };

    case 'rating': {
      const num = parseFloat(str);
      const valid = !isNaN(num) && num >= 1 && num <= 5;
      return {
        isValid: valid,
        error: valid ? '' : 'Rating must be between 1.0 and 5.0'
      };
    }

    case 'url':
      return {
        isValid: REGEX_PATTERNS.url.test(str),
        error: REGEX_PATTERNS.url.test(str) ? '' : 'Valid URL required (e.g. https://example.com)'
      };

    case 'phone':
      return {
        isValid: REGEX_PATTERNS.phone.test(str),
        error: REGEX_PATTERNS.phone.test(str) ? '' : 'Valid phone number required'
      };

    case 'name':
    case 'text':
      return {
        isValid: str.length >= 2,
        error: str.length >= 2 ? '' : 'Must be at least 2 characters'
      };

    default:
      return { isValid: true, error: '' };
  }
};
