"use client";

/**
 * Weather AI — Current Weather Hero Card
 * Large glassmorphism card showing current temperature, conditions, and feels-like.
 */

import { motion } from "framer-motion";
import { Droplets, Wind, Eye, Thermometer } from "lucide-react";
import { useWeather } from "@/hooks/useWeatherContext";
import WeatherIcon from "./WeatherIcon";
import {
  getWeatherDescription,
  getTemperatureColor,
  getWindDirection,
  formatVisibility,
  formatTime,
  celsiusToFahrenheit,
} from "@/lib/weather-utils";

export default function CurrentWeather() {
  const { weather, location, loading, unit } = useWeather();

  if (loading || !weather?.current) {
    return <CurrentWeatherSkeleton />;
  }

  const current = weather.current;
  const isDay = current.is_day === 1;
  const temp = unit === "celsius" ? current.temperature_2m : celsiusToFahrenheit(current.temperature_2m);
  const feelsLike = unit === "celsius" ? current.apparent_temperature : celsiusToFahrenheit(current.apparent_temperature);
  const unitSymbol = unit === "celsius" ? "°C" : "°F";
  const description = getWeatherDescription(current.weather_code);
  const sunrise = weather.daily?.sunrise?.[0] || "";
  const sunset = weather.daily?.sunset?.[0] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass-card relative overflow-hidden"
      style={{ padding: "2rem" }}
      id="current-weather-card"
    >
      {/* Decorative gradient orb */}
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl"
        style={{
          background: isDay
            ? "linear-gradient(135deg, #FBBF24, #F97316)"
            : "linear-gradient(135deg, #6366F1, #8B5CF6)",
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
        {/* Left: Icon + Temperature */}
        <div className="flex items-center gap-4">
          <WeatherIcon code={current.weather_code} isDay={isDay} size={96} />
          <div>
            <div
              className="text-7xl font-bold leading-none tracking-tight"
              style={{ color: getTemperatureColor(current.temperature_2m) }}
            >
              {Math.round(temp)}
              <span className="text-3xl font-normal" style={{ color: "var(--text-muted)" }}>
                {unitSymbol}
              </span>
            </div>
            <div className="text-xl font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
              {description}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-3 lg:ml-auto">
          {/* Location */}
          <div className="text-right">
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {location?.name || "Unknown"}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {location?.admin1 ? `${location.admin1}, ` : ""}{location?.country || ""}
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 flex-wrap justify-end">
            <QuickStat
              icon={<Thermometer size={14} />}
              label="Feels Like"
              value={`${Math.round(feelsLike)}${unitSymbol}`}
            />
            <QuickStat
              icon={<Droplets size={14} />}
              label="Humidity"
              value={`${current.relative_humidity_2m}%`}
            />
            <QuickStat
              icon={<Wind size={14} />}
              label="Wind"
              value={`${Math.round(current.wind_speed_10m)} km/h ${getWindDirection(current.wind_direction_10m)}`}
            />
            <QuickStat
              icon={<Eye size={14} />}
              label="Pressure"
              value={`${Math.round(current.surface_pressure)} hPa`}
            />
          </div>

          {/* Sunrise/Sunset */}
          {sunrise && sunset && (
            <div className="flex gap-4 justify-end text-xs" style={{ color: "var(--text-muted)" }}>
              <span>🌅 {formatTime(sunrise)}</span>
              <span>🌇 {formatTime(sunset)}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: "var(--primary)" }}>{icon}</span>
      <div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</div>
      </div>
    </div>
  );
}

function CurrentWeatherSkeleton() {
  return (
    <div className="glass-card" style={{ padding: "2rem" }}>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="skeleton" style={{ width: 96, height: 96, borderRadius: "50%" }} />
          <div>
            <div className="skeleton" style={{ width: 180, height: 56, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 120, height: 20 }} />
          </div>
        </div>
        <div className="lg:ml-auto flex flex-col gap-3 items-end">
          <div className="skeleton" style={{ width: 160, height: 28 }} />
          <div className="skeleton" style={{ width: 200, height: 16 }} />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ width: 80, height: 36 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
