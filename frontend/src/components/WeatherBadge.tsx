import { useState, useEffect } from 'react';

// OpenWeatherMap free tier: 1000 calls/day
const OWM_KEY = ''; // User adds their free key in .env as VITE_OPENWEATHER_KEY

interface WeatherData {
  temp: number;
  icon: string;
  description: string;
}

interface WeatherBadgeProps {
  latitude: number;
  longitude: number;
  className?: string;
}

const WEATHER_ICONS: Record<string, string> = {
  '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
  '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

export function WeatherBadge({ latitude, longitude, className = '' }: WeatherBadgeProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const key = import.meta.env.VITE_OPENWEATHER_KEY;
    if (!key || !latitude || !longitude) return;

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=es&appid=${key}`)
      .then(r => r.json())
      .then(data => {
        if (data.main) {
          setWeather({
            temp: Math.round(data.main.temp),
            icon: data.weather?.[0]?.icon || '01d',
            description: data.weather?.[0]?.description || '',
          });
        }
      })
      .catch(() => {});
  }, [latitude, longitude]);

  if (!weather) return null;

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] text-text-secondary ${className}`}>
      <span>{WEATHER_ICONS[weather.icon] || '🌡️'}</span>
      <span className="font-medium">{weather.temp}°</span>
    </span>
  );
}
