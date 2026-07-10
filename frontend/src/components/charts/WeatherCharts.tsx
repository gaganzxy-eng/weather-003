"use client";

/**
 * Weather AI — Interactive Weather Charts
 * Tabbed chart panel with ECharts for temperature, humidity, wind, pressure, rain, UV, and AQI.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useWeather } from "@/hooks/useWeatherContext";
import { formatHour, celsiusToFahrenheit } from "@/lib/weather-utils";

// Dynamically import ECharts to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type ChartTab = "temperature" | "humidity" | "wind" | "pressure" | "rain" | "uv" | "aqi";

const TABS: { key: ChartTab; label: string; emoji: string }[] = [
  { key: "temperature", label: "Temperature", emoji: "🌡️" },
  { key: "humidity", label: "Humidity", emoji: "💧" },
  { key: "wind", label: "Wind", emoji: "💨" },
  { key: "pressure", label: "Pressure", emoji: "📊" },
  { key: "rain", label: "Rain", emoji: "🌧️" },
  { key: "uv", label: "UV Index", emoji: "☀️" },
  { key: "aqi", label: "Air Quality", emoji: "🏭" },
];

export default function WeatherCharts() {
  const [activeTab, setActiveTab] = useState<ChartTab>("temperature");
  const { weather, airQuality, loading, unit } = useWeather();

  if (loading || !weather?.hourly) {
    return <ChartSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card"
      style={{ padding: "1.5rem" }}
      id="weather-charts"
    >
      <h3
        className="text-lg font-bold mb-4 flex items-center gap-2"
        style={{ color: "var(--text-primary)" }}
      >
        <span className="text-xl">📈</span> Interactive Charts
      </h3>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.key ? "var(--primary)" : "transparent",
              color: activeTab === tab.key ? "#fff" : "var(--text-secondary)",
              border: `1px solid ${activeTab === tab.key ? "var(--primary)" : "var(--border)"}`,
            }}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <ChartRenderer
            tab={activeTab}
            weather={weather}
            airQuality={airQuality}
            unit={unit}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

interface ChartRendererProps {
  tab: ChartTab;
  weather: NonNullable<ReturnType<typeof useWeather>["weather"]>;
  airQuality: ReturnType<typeof useWeather>["airQuality"];
  unit: "celsius" | "fahrenheit";
}

function ChartRenderer({ tab, weather, airQuality, unit }: ChartRendererProps) {
  const hourly = weather.hourly!;
  // Use first 72 hours (3 days) for readability
  const limit = Math.min(72, hourly.time.length);
  const times = hourly.time.slice(0, limit).map((t) => {
    const d = new Date(t);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
  });

  const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");
  const textColor = isDark ? "#94A3B8" : "#64748B";
  const gridColor = isDark ? "rgba(71,85,105,0.2)" : "rgba(148,163,184,0.15)";

  const baseOptions = {
    backgroundColor: "transparent",
    grid: { top: 40, right: 20, bottom: 60, left: 60, containLabel: true },
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      borderColor: isDark ? "#334155" : "#E2E8F0",
      textStyle: { color: isDark ? "#F1F5F9" : "#0F172A", fontSize: 12 },
    },
    dataZoom: [
      { type: "inside" as const, start: 0, end: 50 },
      {
        type: "slider" as const,
        start: 0,
        end: 50,
        height: 20,
        bottom: 10,
        borderColor: gridColor,
        fillerColor: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)",
        handleStyle: { color: "#3B82F6" },
        textStyle: { color: textColor },
      },
    ],
    xAxis: {
      type: "category" as const,
      data: times,
      axisLine: { lineStyle: { color: gridColor } },
      axisLabel: { color: textColor, fontSize: 10, rotate: 45 },
      splitLine: { show: false },
    },
  };

  const options = useMemo(() => {
    switch (tab) {
      case "temperature": {
        const temps = hourly.temperature_2m.slice(0, limit).map((t) =>
          unit === "celsius" ? Math.round(t * 10) / 10 : Math.round(celsiusToFahrenheit(t) * 10) / 10
        );
        const feelsLike = hourly.apparent_temperature.slice(0, limit).map((t) =>
          unit === "celsius" ? Math.round(t * 10) / 10 : Math.round(celsiusToFahrenheit(t) * 10) / 10
        );
        return {
          ...baseOptions,
          yAxis: {
            type: "value" as const,
            name: unit === "celsius" ? "°C" : "°F",
            axisLine: { lineStyle: { color: gridColor } },
            axisLabel: { color: textColor },
            splitLine: { lineStyle: { color: gridColor } },
          },
          series: [
            {
              name: "Temperature",
              type: "line" as const,
              data: temps,
              smooth: true,
              lineStyle: { width: 3, color: "#F59E0B" },
              itemStyle: { color: "#F59E0B" },
              areaStyle: {
                color: {
                  type: "linear" as const,
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(245,158,11,0.3)" },
                    { offset: 1, color: "rgba(245,158,11,0.02)" },
                  ],
                },
              },
            },
            {
              name: "Feels Like",
              type: "line" as const,
              data: feelsLike,
              smooth: true,
              lineStyle: { width: 2, type: "dashed" as const, color: "#EF4444" },
              itemStyle: { color: "#EF4444" },
            },
          ],
          legend: {
            top: 0,
            textStyle: { color: textColor },
          },
        };
      }

      case "humidity":
        return {
          ...baseOptions,
          yAxis: {
            type: "value" as const,
            name: "%",
            max: 100,
            axisLine: { lineStyle: { color: gridColor } },
            axisLabel: { color: textColor },
            splitLine: { lineStyle: { color: gridColor } },
          },
          series: [{
            name: "Humidity",
            type: "line" as const,
            data: hourly.relative_humidity_2m.slice(0, limit),
            smooth: true,
            lineStyle: { width: 3, color: "#3B82F6" },
            itemStyle: { color: "#3B82F6" },
            areaStyle: {
              color: {
                type: "linear" as const,
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(59,130,246,0.3)" },
                  { offset: 1, color: "rgba(59,130,246,0.02)" },
                ],
              },
            },
          }],
        };

      case "wind":
        return {
          ...baseOptions,
          yAxis: {
            type: "value" as const,
            name: "km/h",
            axisLine: { lineStyle: { color: gridColor } },
            axisLabel: { color: textColor },
            splitLine: { lineStyle: { color: gridColor } },
          },
          series: [
            {
              name: "Wind Speed",
              type: "line" as const,
              data: hourly.wind_speed_10m.slice(0, limit).map((v) => Math.round(v * 10) / 10),
              smooth: true,
              lineStyle: { width: 3, color: "#06B6D4" },
              itemStyle: { color: "#06B6D4" },
              areaStyle: {
                color: {
                  type: "linear" as const,
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(6,182,212,0.25)" },
                    { offset: 1, color: "rgba(6,182,212,0.02)" },
                  ],
                },
              },
            },
            {
              name: "Gusts",
              type: "bar" as const,
              data: hourly.wind_gusts_10m.slice(0, limit).map((v) => Math.round((v ?? 0) * 10) / 10),
              itemStyle: { color: "rgba(239,68,68,0.3)", borderRadius: [2, 2, 0, 0] },
            },
          ],
          legend: { top: 0, textStyle: { color: textColor } },
        };

      case "pressure":
        return {
          ...baseOptions,
          yAxis: {
            type: "value" as const,
            name: "hPa",
            scale: true,
            axisLine: { lineStyle: { color: gridColor } },
            axisLabel: { color: textColor },
            splitLine: { lineStyle: { color: gridColor } },
          },
          series: [{
            name: "Pressure",
            type: "line" as const,
            data: hourly.surface_pressure.slice(0, limit).map((v) => Math.round(v * 10) / 10),
            smooth: true,
            lineStyle: { width: 3, color: "#8B5CF6" },
            itemStyle: { color: "#8B5CF6" },
            areaStyle: {
              color: {
                type: "linear" as const,
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(139,92,246,0.2)" },
                  { offset: 1, color: "rgba(139,92,246,0.02)" },
                ],
              },
            },
          }],
        };

      case "rain":
        return {
          ...baseOptions,
          yAxis: [
            {
              type: "value" as const,
              name: "mm",
              axisLine: { lineStyle: { color: gridColor } },
              axisLabel: { color: textColor },
              splitLine: { lineStyle: { color: gridColor } },
            },
            {
              type: "value" as const,
              name: "%",
              max: 100,
              axisLine: { lineStyle: { color: gridColor } },
              axisLabel: { color: textColor },
              splitLine: { show: false },
            },
          ],
          series: [
            {
              name: "Precipitation",
              type: "bar" as const,
              data: hourly.precipitation.slice(0, limit).map((v) => Math.round(v * 100) / 100),
              itemStyle: { color: "#3B82F6", borderRadius: [3, 3, 0, 0] },
              yAxisIndex: 0,
            },
            {
              name: "Probability",
              type: "line" as const,
              data: hourly.precipitation_probability.slice(0, limit),
              smooth: true,
              lineStyle: { width: 2, type: "dashed" as const, color: "#22C55E" },
              itemStyle: { color: "#22C55E" },
              yAxisIndex: 1,
            },
          ],
          legend: { top: 0, textStyle: { color: textColor } },
        };

      case "uv":
        return {
          ...baseOptions,
          yAxis: {
            type: "value" as const,
            name: "UV",
            max: 12,
            axisLine: { lineStyle: { color: gridColor } },
            axisLabel: { color: textColor },
            splitLine: { lineStyle: { color: gridColor } },
          },
          visualMap: {
            show: false,
            pieces: [
              { lte: 2, color: "#22C55E" },
              { gt: 2, lte: 5, color: "#EAB308" },
              { gt: 5, lte: 7, color: "#F97316" },
              { gt: 7, lte: 10, color: "#EF4444" },
              { gt: 10, color: "#A855F7" },
            ],
          },
          series: [{
            name: "UV Index",
            type: "bar" as const,
            data: hourly.uv_index.slice(0, limit).map((v) => Math.round((v ?? 0) * 10) / 10),
            itemStyle: { borderRadius: [3, 3, 0, 0] },
          }],
        };

      case "aqi": {
        const aqHourly = airQuality?.hourly;
        if (!aqHourly) {
          return {
            ...baseOptions,
            yAxis: { type: "value" as const },
            series: [],
            graphic: {
              type: "text" as const,
              left: "center",
              top: "center",
              style: { text: "No AQI data available", fontSize: 14, fill: textColor },
            },
          };
        }
        const aqLimit = Math.min(72, aqHourly.time.length);
        const aqTimes = aqHourly.time.slice(0, aqLimit).map((t) => {
          const d = new Date(t);
          return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
        });
        return {
          ...baseOptions,
          xAxis: { ...baseOptions.xAxis, data: aqTimes },
          yAxis: {
            type: "value" as const,
            name: "AQI",
            axisLine: { lineStyle: { color: gridColor } },
            axisLabel: { color: textColor },
            splitLine: { lineStyle: { color: gridColor } },
          },
          visualMap: {
            show: false,
            pieces: [
              { lte: 50, color: "#22C55E" },
              { gt: 50, lte: 100, color: "#EAB308" },
              { gt: 100, lte: 150, color: "#F97316" },
              { gt: 150, lte: 200, color: "#EF4444" },
              { gt: 200, color: "#7C3AED" },
            ],
          },
          series: [{
            name: "US AQI",
            type: "bar" as const,
            data: aqHourly.us_aqi.slice(0, aqLimit),
            itemStyle: { borderRadius: [3, 3, 0, 0] },
          }],
        };
      }

      default:
        return baseOptions;
    }
  }, [tab, hourly, airQuality, unit, times, limit, baseOptions, gridColor, textColor]);

  return (
    <div className="chart-container">
      <ReactECharts
        option={options}
        style={{ height: 360 }}
        opts={{ renderer: "svg" }}
        notMerge
      />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
      <div className="skeleton" style={{ width: 200, height: 24, marginBottom: 16 }} />
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: 80, height: 28, borderRadius: 999 }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: 360 }} />
    </div>
  );
}
