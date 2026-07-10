"use client";

/**
 * Weather AI — Hourly Forecast Component
 * Horizontally scrollable carousel showing 24-hour forecast.
 */

import { motion } from "framer-motion";
import { useWeather } from "@/hooks/useWeatherContext";
import WeatherIcon from "./WeatherIcon";
import {
  formatHour,
  getTemperatureColor,
  celsiusToFahrenheit,
} from "@/lib/weather-utils";

export default function HourlyForecast() {
  const { weather, loading, unit } = useWeather();

  if (loading || !weather?.hourly) {
    return <HourlySkeleton />;
  }

  const hourly = weather.hourly;
  const now = new Date();
  const currentHourIndex = hourly.time.findIndex((t) => new Date(t) >= now);
  const startIndex = Math.max(0, currentHourIndex);
  const hours = Array.from({ length: 24 }, (_, i) => startIndex + i).filter(
    (i) => i < hourly.time.length
  );

  // Calculate min/max for sparkline
  const temps = hours.map((i) => hourly.temperature_2m[i]);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      id="hourly-forecast"
    >
      <h3
        className="text-lg font-bold mb-3 flex items-center gap-2"
        style={{ color: "var(--text-primary)" }}
      >
        <span className="text-xl">🕐</span> Hourly Forecast
      </h3>

      <div className="horizontal-scroll">
        {hours.map((i, idx) => {
          const temp = unit === "celsius"
            ? hourly.temperature_2m[i]
            : celsiusToFahrenheit(hourly.temperature_2m[i]);
          const unitSymbol = unit === "celsius" ? "°" : "°F";
          const isDay = hourly.is_day?.[i] === 1;
          const rainProb = hourly.precipitation_probability?.[i] ?? 0;
          // Bar height for temperature visualization (20-80px range)
          const barHeight = 20 + ((hourly.temperature_2m[i] - minTemp) / tempRange) * 60;

          return (
            <motion.div
              key={hourly.time[i]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="glass-card flex flex-col items-center gap-1.5"
              style={{
                padding: "0.75rem 1rem",
                minWidth: 80,
              }}
            >
              {/* Time */}
              <div
                className="text-xs font-medium"
                style={{
                  color: idx === 0 ? "var(--primary)" : "var(--text-muted)",
                }}
              >
                {formatHour(hourly.time[i])}
              </div>

              {/* Weather Icon */}
              <WeatherIcon code={hourly.weather_code[i]} isDay={isDay} size={32} />

              {/* Temperature */}
              <div
                className="text-sm font-bold"
                style={{ color: getTemperatureColor(hourly.temperature_2m[i]) }}
              >
                {Math.round(temp)}{unitSymbol}
              </div>

              {/* Temperature bar */}
              <div
                className="w-1.5 rounded-full"
                style={{
                  height: barHeight,
                  background: `linear-gradient(to top, ${getTemperatureColor(minTemp)}, ${getTemperatureColor(hourly.temperature_2m[i])})`,
                  opacity: 0.6,
                  transition: "height 0.5s ease",
                }}
              />

              {/* Rain probability */}
              {(rainProb ?? 0) > 0 && (
                <div className="flex items-center gap-0.5 text-xs" style={{ color: "var(--rain)" }}>
                  💧 {rainProb}%
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function HourlySkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ width: 200, height: 24, marginBottom: 12 }} />
      <div className="horizontal-scroll">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: 80, height: 160, flexShrink: 0 }} />
        ))}
      </div>
    </div>
  );
}
