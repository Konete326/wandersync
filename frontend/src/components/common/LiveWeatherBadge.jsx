import React, { useState, useEffect } from 'react';
import { CloudSun, Loader2 } from 'lucide-react';
import { getCoordinatesForLocation, getWeatherConditionMeta } from '../../utils/countryCoordinates';

const WEATHER_CACHE = new Map();

export default function LiveWeatherBadge({
  locationName = '',
  lat = null,
  lng = null,
  className = '',
  variant = 'hover',
  showDetailsOnHover = true
}) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const coords = lat && lng ? { lat, lng } : getCoordinatesForLocation(locationName);
    const cacheKey = `${coords.lat.toFixed(2)}_${coords.lng.toFixed(2)}`;

    if (WEATHER_CACHE.has(cacheKey)) {
      setWeather(WEATHER_CACHE.get(cacheKey));
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        if (isMounted && data) {
          const currentTemp = data.current_weather?.temperature != null
            ? Math.round(data.current_weather.temperature)
            : Math.round(data.daily?.temperature_2m_max?.[0] || 22);
          const weatherCode = data.current_weather?.weathercode ?? data.daily?.weather_code?.[0] ?? 1;
          const maxTemp = Math.round(data.daily?.temperature_2m_max?.[0] ?? (currentTemp + 4));
          const minTemp = Math.round(data.daily?.temperature_2m_min?.[0] ?? (currentTemp - 5));
          const conditionMeta = getWeatherConditionMeta(weatherCode, currentTemp);

          const result = {
            temp: currentTemp,
            maxTemp,
            minTemp,
            condition: conditionMeta.text,
            icon: conditionMeta.icon,
            city: coords.city || locationName
          };

          WEATHER_CACHE.set(cacheKey, result);
          setWeather(result);
        }
      } catch {
        if (isMounted) {
          const fallback = {
            temp: 24,
            maxTemp: 27,
            minTemp: 19,
            condition: 'Pleasant',
            icon: '⛅',
            city: coords.city || locationName
          };
          WEATHER_CACHE.set(cacheKey, fallback);
          setWeather(fallback);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [locationName, lat, lng]);

  if (loading && !weather) {
    return (
      <div className={`px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white/70 border border-white/10 flex items-center gap-1 text-[10px] shadow-sm ${className}`}>
        <Loader2 className="size-2.5 animate-spin text-orange-400" />
        <span>Weather...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/80 hover:bg-black/90 backdrop-blur-md text-white border border-white/15 text-[11px] font-semibold shadow-md transition-all select-none cursor-default group/weather ${className}`}
      title={`${weather.city}: ${weather.temp}°C, ${weather.condition}`}
    >
      <span className="text-xs leading-none">{weather.icon}</span>
      <span className="text-white font-bold tracking-tight">{weather.temp}°C</span>

      {showDetailsOnHover && (
        <div
          className={`absolute top-full left-0 mt-1.5 z-40 w-44 p-2 rounded-xl bg-[#18181b]/95 backdrop-blur-md border border-white/15 shadow-xl text-left pointer-events-none transition-all duration-200 ${
            hovered ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
            <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1 truncate">
              <CloudSun className="size-3 text-orange-400 shrink-0" />
              {weather.city}
            </span>
            <span className="text-[9px] text-muted-foreground font-mono">Live</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-200 font-medium">{weather.condition}</span>
            <span className="text-[10px] text-zinc-400 font-mono">
              H:{weather.maxTemp}° L:{weather.minTemp}°
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
