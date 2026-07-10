"use client";

/**
 * Weather AI — 15-Day Daily Forecast
 * Cards showing high/low temperatures, weather conditions, and rain probability.
 */

import { motion } from "framer-motion";
import { Droplets, Wind } from "lucide-react";
import { useWeather } from "@/hooks/useWeatherContext";
import WeatherIcon from "./WeatherIcon";
import {
  formatDay,
  getWeatherDescription,
  getTemperatureColor,
  celsiusToFahrenheit,
} from "@/lib/weather-utils";

export default function DailyForecast() {
  const { weather, loading, unit } = useWeather();

  if (loading || !weather?.daily) {
    return <DailySkeleton />;
  }

  const daily = weather.daily;
  const days = daily.time.length;

  // Global min/max for temperature range bars
  const allMins = daily.temperature_2m_min;
  const allMaxs = daily.temperature_2m_max;
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const globalRange = globalMax - globalMin || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      id="daily-forecast"
    >
      <h3
        className="text-lg font-bold mb-3 flex items-center gap-2"
        style={{ color: "var(--text-primary)" }}
      >
        <span className="text-xl">📅</span> 15-Day Forecast
      </h3>

      <div className="flex flex-col gap-2">
        {Array.from({ length: days }).map((_, i) => {
          const maxTemp = unit === "celsius"
            ? daily.temperature_2m_max[i]
            : celsiusToFahrenheit(daily.temperature_2m_max[i]);
          const minTemp = unit === "celsius"
            ? daily.temperature_2m_min[i]
            : celsiusToFahrenheit(daily.temperature_2m_min[i]);
          const unitSymbol = unit === "celsius" ? "°" : "°F";
          const rainProb = daily.precipitation_probability_max?.[i] ?? 0;
          const rainSum = daily.precipitation_sum[i];

          // Temperature range bar position
          const barLeft = ((daily.temperature_2m_min[i] - globalMin) / globalRange) * 100;
          const barWidth = ((daily.temperature_2m_max[i] - daily.temperature_2m_min[i]) / globalRange) * 100;

          return (
            <motion.div
              key={daily.time[i]}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card flex items-center gap-3"
              style={{ padding: "0.875rem 1.25rem" }}
            >
              {/* Day name */}
              <div
                className="font-medium text-sm w-20 flex-shrink-0"
                style={{ color: i === 0 ? "var(--primary)" : "var(--text-primary)" }}
              >
                {formatDay(daily.time[i])}
              </div>

              {/* Weather icon + description */}
              <div className="flex items-center gap-2 w-36 flex-shrink-0">
                <WeatherIcon code={daily.weather_code[i]} size={28} />
                <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  {getWeatherDescription(daily.weather_code[i])}
                </span>
              </div>

              {/* Rain probability */}
              <div className="flex items-center gap-1 w-16 flex-shrink-0">
                {(rainProb ?? 0) > 0 ? (
                  <>
                    <Droplets size={12} style={{ color: "var(--rain)" }} />
                    <span className="text-xs" style={{ color: "var(--rain)" }}>
                      {rainProb}%
                    </span>
                  </>
                ) : (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                )}
              </div>

              {/* Min temperature */}
              <div
                className="text-sm font-medium w-12 text-right flex-shrink-0"
                style={{ color: getTemperatureColor(daily.temperature_2m_min[i]) }}
              >
                {Math.round(minTemp)}{unitSymbol}
              </div>

              {/* Temperature range bar */}
              <div className="flex-1 mx-2 h-2 rounded-full relative" style={{ background: "var(--border)" }}>
                <div
                  className="absolute h-full rounded-full"
                  style={{
                    left: `${barLeft}%`,
                    width: `${Math.max(barWidth, 4)}%`,
                    background: `linear-gradient(to right, ${getTemperatureColor(daily.temperature_2m_min[i])}, ${getTemperatureColor(daily.temperature_2m_max[i])})`,
                    transition: "all 0.5s ease",
                  }}
                />
              </div>

              {/* Max temperature */}
              <div
                className="text-sm font-bold w-12 flex-shrink-0"
                style={{ color: getTemperatureColor(daily.temperature_2m_max[i]) }}
              >
                {Math.round(maxTemp)}{unitSymbol}
              </div>

              {/* Wind */}
              <div className="hidden lg:flex items-center gap-1 w-20 flex-shrink-0">
                <Wind size={12} style={{ color: "var(--wind)" }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {Math.round(daily.wind_speed_10m_max[i])} km/h
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function DailySkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ width: 200, height: 24, marginBottom: 12 }} />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 52 }} />
        ))}
      </div>
    </div>
  );
}
