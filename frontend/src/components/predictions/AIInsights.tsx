"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain } from "lucide-react";
import Tilt from "react-parallax-tilt";
import { useWeather } from "@/hooks/useWeatherContext";
import { fetchAIInsights } from "@/lib/api";
import { getWeatherDescription } from "@/lib/weather-utils";

export default function AIInsights() {
  const { weather, airQuality, loading } = useWeather();
  const [insight, setInsight] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    async function getInsight() {
      if (!weather?.current || loading) return;
      
      setIsFetching(true);
      try {
        const current = weather.current;
        const currentHour = new Date().getHours();
        const aqi = airQuality?.hourly?.us_aqi?.[currentHour] ?? null;

        const data = {
          temperature: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          wind_speed: current.wind_speed_10m,
          description: getWeatherDescription(current.weather_code),
          uv: weather.hourly?.uv_index?.[currentHour] ?? 0,
          aqi: aqi
        };

        const result = await fetchAIInsights(data);
        setInsight(result);
      } catch (error) {
        console.error("Failed to fetch AI insight:", error);
        setInsight("Unable to generate AI insights at the moment.");
      } finally {
        setIsFetching(false);
      }
    }

    getInsight();
  }, [weather, loading, airQuality]);

  if (loading) return null;

  return (
    <Tilt 
      tiltMaxAngleX={5} 
      tiltMaxAngleY={5} 
      perspective={1000} 
      scale={1.02} 
      transitionSpeed={1500}
      className="parallax-effect"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="glass-card overflow-hidden relative"
        style={{ padding: "1.5rem" }}
      >
        {/* Animated background gradient */}
        <div 
          className="absolute inset-0 opacity-20 -z-10"
          style={{
            background: "linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899)",
            backgroundSize: "200% 200%",
            animation: "gradientFlow 8s ease infinite"
          }}
        />

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Brain size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-gradient">
            AI Weather Insights
            <Sparkles size={16} className="text-yellow-400" />
          </h3>
        </div>

        <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {isFetching ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton" style={{ height: 20, width: "100%" }} />
              <div className="skeleton" style={{ height: 20, width: "80%" }} />
            </div>
          ) : (
            <p>{insight}</p>
          )}
        </div>
      </motion.div>
    </Tilt>
  );
}
