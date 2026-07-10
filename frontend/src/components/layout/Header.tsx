"use client";

/**
 * Weather AI — Header / Navigation Bar
 * Top bar with logo, theme toggle, and unit toggle.
 */

import { motion } from "framer-motion";
import { Moon, Sun, RefreshCw, MapPin, Thermometer } from "lucide-react";
import { useTheme } from "next-themes";
import { useWeather } from "@/hooks/useWeatherContext";
import { useState, useEffect } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { unit, setUnit, refreshWeather, loading } = useWeather();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card flex items-center justify-between"
      style={{
        padding: "0.75rem 1.5rem",
        marginBottom: "1.5rem",
        position: "sticky",
        top: "0.75rem",
        zIndex: 40,
      }}
      id="main-header"
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div
          className="p-1.5 rounded-lg"
          style={{
            background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
          }}
        >
          <span className="text-lg">🌦️</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-gradient">
            Weather AI
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: -2 }}>
            AI-Powered Forecasting
          </p>
        </div>
      </div>

      {/* Controls & User Profile */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* User Profile */}
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-sm font-semibold">R.Gagan Surya Teja</span>
          <span className="text-xs text-blue-400">Pro Member</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Unit Toggle */}
          <button
            onClick={() => setUnit(unit === "celsius" ? "fahrenheit" : "celsius")}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
          title="Toggle temperature unit"
        >
          <Thermometer size={12} />
          {unit === "celsius" ? "°C" : "°F"}
        </button>

        {/* Refresh */}
        <button
          onClick={refreshWeather}
          className="p-2 rounded-full transition-all"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
          title="Refresh weather data"
          disabled={loading}
        >
          <RefreshCw
            size={14}
            className={loading ? "animate-spin" : ""}
          />
        </button>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full transition-all"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        )}
        </div>
      </div>
    </motion.header>
  );
}
