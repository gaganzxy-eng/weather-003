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
          const { latitude, longitude } = position.coords;
          const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          
          try {
            // Use Nominatim open geocoding for free client-side reverse lookup
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
              {
                headers: {
                  "User-Agent": "WeatherAI-Platform"
                }
              }
            );
            
            if (res.ok) {
              const data = await res.json();
              const address = data.address;
              const cityName = address.city || address.town || address.village || address.suburb || address.county || "Current Location";
              
              const gpsLocation: GeoLocation = {
                id: 0,
                name: cityName,
                latitude,
                longitude,
                timezone: localTimezone,
                country: address.country,
                country_code: address.country_code?.toUpperCase(),
              };
              setLocationState(gpsLocation);
            } else {
              throw new Error("Reverse geocode failed");
            }
          } catch (e) {
            console.error("Reverse geocoding failed, falling back to coordinates:", e);
            const gpsLocation: GeoLocation = {
              id: 0,
              name: "Current Location",
              latitude,
              longitude,
              timezone: localTimezone,
            };
            setLocationState(gpsLocation);
          }
        },
        (error) => {
          // GPS denied or failed — use default location
          console.warn("GPS lookup failed:", error.message);
        },
        { timeout: 8000, enableHighAccuracy: true }
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
