"use client";

/**
 * Weather AI — Main Dashboard Page
 * The primary weather dashboard with all Phase 1 components.
 */

import { WeatherProvider } from "@/hooks/useWeatherContext";
import Header from "@/components/layout/Header";
import CitySearch from "@/components/weather/CitySearch";
import CurrentWeather from "@/components/weather/CurrentWeather";
import WeatherMetrics from "@/components/weather/WeatherMetrics";
import HourlyForecast from "@/components/weather/HourlyForecast";
import DailyForecast from "@/components/weather/DailyForecast";
import WeatherCharts from "@/components/charts/WeatherCharts";
import AIInsights from "@/components/predictions/AIInsights";
import WeatherChatbot from "@/components/chat/WeatherChatbot";

export default function DashboardPage() {
  return (
    <WeatherProvider>
      <div
        className="min-h-screen relative"
        style={{ padding: "0.75rem", maxWidth: 1400, margin: "0 auto", zIndex: 1 }}
      >
        {/* Header */}
        <Header />

        {/* City Search */}
        <div style={{ marginBottom: "1.5rem" }}>
          <CitySearch />
        </div>

        {/* Main Dashboard Grid */}
        <div className="flex flex-col gap-6">
          {/* Current Weather Hero */}
          <CurrentWeather />
          
          {/* AI Weather Insights */}
          <AIInsights />

          {/* Hourly Forecast */}
          <HourlyForecast />

          {/* Weather Metrics Grid */}
          <section>
            <h3
              className="text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <span className="text-xl">📊</span> Weather Details
            </h3>
            <WeatherMetrics />
          </section>

          {/* Interactive Charts */}
          <WeatherCharts />

          {/* 15-Day Forecast */}
          <DailyForecast />

          {/* Footer */}
          <footer
            className="text-center py-6 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <p>
              Weather AI — AI-Powered Intelligent Weather Platform
            </p>
            <p className="mt-1">
              Data provided by{" "}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--primary)" }}
              >
                Open-Meteo
              </a>{" "}
              • Built with Next.js, FastAPI & Machine Learning
            </p>
          </footer>
        </div>

        {/* Global Chatbot */}
        <WeatherChatbot />
      </div>
    </WeatherProvider>
  );
}
