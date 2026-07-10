"use client";

/**
 * Weather AI — City Search Component
 * Autocomplete search bar that queries Open-Meteo Geocoding API.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { searchCities, type GeoLocation } from "@/lib/api";
import { useWeather } from "@/hooks/useWeatherContext";

export default function CitySearch() {
  const { setLocation, location } = useWeather();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const cities = await searchCities(value, 8);
        setResults(cities);
        setIsOpen(cities.length > 0);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleSelect = (city: GeoLocation) => {
    setLocation(city);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto" id="city-search">
      {/* Search Input */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={`Search city... (current: ${location?.name || "Unknown"})`}
          className="search-input"
          id="city-search-input"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        )}
        {searching && (
          <Loader2
            size={16}
            className="absolute right-10 top-1/2 -translate-y-1/2 animate-spin"
            style={{ color: "var(--primary)" }}
          />
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 overflow-hidden"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {results.map((city) => (
              <button
                key={`${city.id}-${city.latitude}-${city.longitude}`}
                onClick={() => handleSelect(city)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  color: "var(--text-primary)",
                  borderBottom: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-card)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <MapPin size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <div className="min-w-0">
                  <div className="font-medium truncate">{city.name}</div>
                  <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {[city.admin1, city.country].filter(Boolean).join(", ")}
                    {city.population ? ` • Pop. ${(city.population / 1000).toFixed(0)}K` : ""}
                  </div>
                </div>
                <div className="ml-auto text-xs" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                  {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
