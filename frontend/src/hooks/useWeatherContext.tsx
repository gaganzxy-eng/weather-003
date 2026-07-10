"use client";

/**
 * Weather AI — Weather Context & Provider
 * Global state management for weather data, selected city, and preferences.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { fetchWeather, fetchAirQuality, type WeatherData, type AirQualityData, type GeoLocation } from "@/lib/api";

interface WeatherContextType {
  // Data
  weather: WeatherData | null;
  airQuality: AirQualityData | null;
  location: GeoLocation | null;

  // State
  loading: boolean;
  error: string | null;
  unit: "celsius" | "fahrenheit";

  // Actions
  setLocation: (location: GeoLocation) => void;
  setUnit: (unit: "celsius" | "fahrenheit") => void;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

// Default location: Hyderabad, India
const DEFAULT_LOCATION: GeoLocation = {
  id: 1269843,
  name: "Hyderabad",
  latitude: 17.3850,
  longitude: 78.4867,
  country: "India",
  country_code: "IN",
  timezone: "Asia/Kolkata",
  admin1: "Telangana",
};

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [location, setLocationState] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"celsius" | "fahrenheit">("celsius");

  const loadWeatherData = useCallback(async (loc: GeoLocation) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch weather and air quality in parallel
      const [weatherData, aqData] = await Promise.all([
        fetchWeather(loc.latitude, loc.longitude, loc.timezone || "auto"),
        fetchAirQuality(loc.latitude, loc.longitude, loc.timezone || "auto"),
      ]);

      setWeather(weatherData);
      setAirQuality(aqData);
    } catch (err) {
      console.error("Failed to load weather data:", err);
      setError(err instanceof Error ? err.message : "Failed to load weather data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load weather on mount and when location changes
  useEffect(() => {
    loadWeatherData(location);
  }, [location, loadWeatherData]);

  // Try to get user's location via GPS on first load
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // We got GPS coords — reverse geocode via Open-Meteo is not supported,
          // so we just use the coords directly with a generic label
          const gpsLocation: GeoLocation = {
            id: 0,
            name: "Current Location",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
          setLocationState(gpsLocation);
        },
        () => {
          // GPS denied — use default location
          console.log("GPS denied, using default location");
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const setLocation = useCallback((loc: GeoLocation) => {
    setLocationState(loc);
  }, []);

  const refreshWeather = useCallback(async () => {
    await loadWeatherData(location);
  }, [location, loadWeatherData]);

  return (
    <WeatherContext.Provider
      value={{
        weather,
        airQuality,
        location,
        loading,
        error,
        unit,
        setLocation,
        setUnit,
        refreshWeather,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
}
