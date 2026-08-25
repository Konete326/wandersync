import { useState, useId } from 'react';
import { validateField } from '@/utils/validationRules';
import { AlertCircle } from 'lucide-react';

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  const trimmed = str.trim().replace(/\s+/g, ' ');
  if (
    trimmed.includes('@') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    /^\$?\d+/.test(trimmed)
  ) {
    return trimmed;
  }
  return trimmed
    .split(' ')
    .map((word) => {
      if (word.length <= 4 && word === word.toUpperCase() && /^[A-Z0-9]+$/.test(word)) {
        return word;
      }
      if (word.includes('-')) {
        return word
          .split('-')
          .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ''))
          .join('-');
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export default function ValidatedInput({
  type = 'text',
  validationType = '',
  value = '',
  onChange,
  onBlur,
  placeholder = '',
  required = false,
  autoCapitalize = true,
  className = '',
  containerClassName = '',
  label = '',
  error: customError = '',
  disabled = false,
  list = '',
  min,
  max,
  step,
  ...props
}) {
  const [touched, setTouched] = useState(false);
  const autoId = useId();
  const inputId = props.id || autoId;

  const currentVal = value !== undefined && value !== null ? String(value) : '';
  const validationResult = validationType && (touched || currentVal.length > 0)
    ? validateField(validationType, currentVal)
    : { isValid: true, error: '' };

  const hasError = Boolean(customError || (!validationResult.isValid && (touched || currentVal.length > 0)));
  const errorMessage = customError || validationResult.error;

  const handleBlur = (e) => {
    setTouched(true);

    if (
      autoCapitalize &&
      type === 'text' &&
      typeof value === 'string' &&
      value.trim().length > 0 &&
      validationType !== 'email' &&
      validationType !== 'password' &&
      validationType !== 'url'
    ) {
      const formatted = toTitleCase(value);
      if (formatted !== value && onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: formatted },
          currentTarget: { ...e.currentTarget, value: formatted }
        };
        onChange(syntheticEvent);
      }
    }

    if (onBlur) onBlur(e);
  };

  return (
    <div className={`space-y-1 w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
          <span>{label}</span>
          {required && <span className="text-[10px] text-orange-400 font-normal">* required</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          list={list}
          min={min}
          max={max}
          step={step}
          className={`w-full px-3.5 py-2 min-h-[38px] rounded-xl bg-secondary/60 text-xs sm:text-sm text-foreground placeholder-muted-foreground/50 transition-colors focus:outline-none ${
            hasError
              ? 'border border-rose-500/80 focus:ring-1 focus:ring-rose-500/60 bg-rose-950/10'
              : 'border border-border focus:ring-1 focus:ring-orange-500/50'
          } ${className}`}
          {...props}
        />
      </div>

      {hasError && errorMessage && (
        <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5 animate-in fade-in duration-100">
          <AlertCircle className="size-2.5 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}
    </div>
  );
}
