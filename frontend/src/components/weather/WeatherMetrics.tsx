"use client";

/**
 * Weather AI — Weather Metrics Grid
 * Grid of metric cards showing humidity, pressure, wind, UV, AQI, visibility, etc.
 */

import { motion } from "framer-motion";
import {
  Droplets, Wind, Eye, Gauge, Sun, CloudRain,
  Thermometer, Shield, Activity, Compass,
} from "lucide-react";
import { useWeather } from "@/hooks/useWeatherContext";
import {
  getWindDirection, getWindDescription, getUVLevel, getAQILevel,
  formatVisibility, getVisibilityDescription, getComfortLevel,
  calculateHeatIndex, celsiusToFahrenheit,
} from "@/lib/weather-utils";

interface MetricCard {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  progress?: number; // 0-100 for circular gauge
}

export default function WeatherMetrics() {
  const { weather, airQuality, loading, unit } = useWeather();

  if (loading || !weather?.current) {
    return <MetricsSkeleton />;
  }

  const current = weather.current;
  const hourly = weather.hourly;
  const unitSymbol = unit === "celsius" ? "°C" : "°F";

  // Get current hour index for hourly data lookups
  const currentHour = new Date().getHours();

  // UV and visibility come from hourly data, not current
  const currentUV = hourly?.uv_index?.[currentHour] ?? 0;
  const currentVisibility = hourly?.visibility?.[currentHour] ?? 10000;

  const aqi = airQuality?.hourly?.us_aqi?.[currentHour] ?? null;
  const aqiInfo = aqi !== null ? getAQILevel(aqi) : null;
  const uvInfo = getUVLevel(currentUV);
  const comfort = getComfortLevel(current.temperature_2m, current.relative_humidity_2m);
  const heatIndex = calculateHeatIndex(current.temperature_2m, current.relative_humidity_2m);
  const heatIndexDisplay = unit === "celsius" ? Math.round(heatIndex) : Math.round(celsiusToFahrenheit(heatIndex));

  const metrics: MetricCard[] = [
    {
      id: "humidity",
      icon: <Droplets size={20} />,
      label: "Humidity",
      value: `${current.relative_humidity_2m}%`,
      subValue: current.relative_humidity_2m > 70 ? "High" : current.relative_humidity_2m > 40 ? "Moderate" : "Low",
      color: "#3B82F6",
      progress: current.relative_humidity_2m,
    },
    {
      id: "wind",
      icon: <Wind size={20} />,
      label: "Wind Speed",
      value: `${Math.round(current.wind_speed_10m)} km/h`,
      subValue: `${getWindDirection(current.wind_direction_10m)} • ${getWindDescription(current.wind_speed_10m)}`,
      color: "#06B6D4",
      progress: Math.min((current.wind_speed_10m / 100) * 100, 100),
    },
    {
      id: "pressure",
      icon: <Gauge size={20} />,
      label: "Pressure",
      value: `${Math.round(current.surface_pressure)} hPa`,
      subValue: current.surface_pressure > 1013 ? "High" : current.surface_pressure < 1013 ? "Low" : "Normal",
      color: "#8B5CF6",
      progress: Math.min(((current.surface_pressure - 950) / 100) * 100, 100),
    },
    {
      id: "uv",
      icon: <Sun size={20} />,
      label: "UV Index",
      value: `${currentUV.toFixed(1)}`,
      subValue: uvInfo.label,
      color: uvInfo.color,
      progress: Math.min((currentUV / 12) * 100, 100),
    },
    {
      id: "visibility",
      icon: <Eye size={20} />,
      label: "Visibility",
      value: formatVisibility(currentVisibility),
      subValue: getVisibilityDescription(currentVisibility),
      color: "#22C55E",
      progress: Math.min((currentVisibility / 20000) * 100, 100),
    },
    {
      id: "cloud-cover",
      icon: <CloudRain size={20} />,
      label: "Cloud Cover",
      value: `${current.cloud_cover}%`,
      subValue: current.cloud_cover > 80 ? "Overcast" : current.cloud_cover > 50 ? "Mostly Cloudy" : current.cloud_cover > 20 ? "Partly Cloudy" : "Clear",
      color: "#94A3B8",
      progress: current.cloud_cover,
    },
    {
      id: "heat-index",
      icon: <Thermometer size={20} />,
      label: "Heat Index",
      value: `${heatIndexDisplay}${unitSymbol}`,
      subValue: comfort.label,
      color: comfort.color,
      progress: Math.min(((heatIndex + 10) / 60) * 100, 100),
    },
    {
      id: "wind-direction",
      icon: <Compass size={20} />,
      label: "Wind Direction",
      value: getWindDirection(current.wind_direction_10m),
      subValue: `${current.wind_direction_10m}°`,
      color: "#F59E0B",
      progress: (current.wind_direction_10m / 360) * 100,
    },
    {
      id: "precipitation",
      icon: <CloudRain size={20} />,
      label: "Precipitation",
      value: `${current.precipitation} mm`,
      subValue: current.precipitation > 0 ? "Active" : "None",
      color: "#3B82F6",
      progress: Math.min((current.precipitation / 10) * 100, 100),
    },
    {
      id: "wind-gusts",
      icon: <Activity size={20} />,
      label: "Wind Gusts",
      value: `${Math.round(current.wind_gusts_10m ?? 0)} km/h`,
      subValue: (current.wind_gusts_10m ?? 0) > 50 ? "Strong" : "Normal",
      color: "#EF4444",
      progress: Math.min(((current.wind_gusts_10m ?? 0) / 120) * 100, 100),
    },
  ];

  // Add AQI card if data available
  if (aqi !== null && aqiInfo) {
    metrics.splice(5, 0, {
      id: "aqi",
      icon: <Shield size={20} />,
      label: "Air Quality",
      value: `${aqi} AQI`,
      subValue: aqiInfo.label,
      color: aqiInfo.color,
      progress: Math.min((aqi / 300) * 100, 100),
    });
  }

  return (
    <div className="dashboard-grid" id="weather-metrics">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="glass-card"
          style={{ padding: "1.25rem" }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: `${metric.color}20`, color: metric.color }}
            >
              {metric.icon}
            </div>
            {/* Mini circular gauge */}
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke="var(--border)"
                strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke={metric.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(metric.progress || 0) * 0.942} 100`}
                transform="rotate(-90 18 18)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
          </div>

          <div className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
            {metric.label}
          </div>
          <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {metric.value}
          </div>
          {metric.subValue && (
            <div className="text-xs mt-0.5" style={{ color: metric.color }}>
              {metric.subValue}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="dashboard-grid">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 120 }} />
      ))}
    </div>
  );
}
