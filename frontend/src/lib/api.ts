/**
 * Weather AI — API Client
 * Handles all communication with the backend API and Open-Meteo directly.
 * For Phase 1, we call Open-Meteo directly from the frontend for speed.
 * Backend endpoints are available for server-side caching later.
 */

const OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_HISTORICAL = "https://archive-api.open-meteo.com/v1/archive";
const OPEN_METEO_AIR_QUALITY = "https://air-quality-api.open-meteo.com/v1/air-quality";
const OPEN_METEO_GEOCODING = "https://geocoding-api.open-meteo.com/v1/search";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country?: string;
  country_code?: string;
  timezone?: string;
  admin1?: string;
  population?: number;
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  rain: number;
  weather_code: number;
  cloud_cover: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

export interface HourlyData {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: (number | null)[];
  precipitation: number[];
  rain: number[];
  weather_code: number[];
  surface_pressure: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  wind_gusts_10m: (number | null)[];
  visibility: (number | null)[];
  uv_index: (number | null)[];
  cloud_cover: number[];
  is_day: (number | null)[];
}

export interface DailyData {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: (number | null)[];
  precipitation_sum: number[];
  rain_sum: number[];
  precipitation_probability_max: (number | null)[];
  wind_speed_10m_max: number[];
  wind_direction_10m_dominant: number[];
  precipitation_hours: (number | null)[];
}

export interface AirQualityHourly {
  time: string[];
  us_aqi: (number | null)[];
  pm2_5: (number | null)[];
  pm10: (number | null)[];
  carbon_monoxide: (number | null)[];
  nitrogen_dioxide: (number | null)[];
  sulphur_dioxide: (number | null)[];
  ozone: (number | null)[];
  uv_index: (number | null)[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation?: number;
  current?: CurrentWeather;
  hourly?: HourlyData;
  daily?: DailyData;
}

export interface AirQualityData {
  latitude: number;
  longitude: number;
  hourly: AirQualityHourly;
}

// ─── API Functions ──────────────────────────────────────────────────────────

const CURRENT_PARAMS = [
  "temperature_2m", "relative_humidity_2m", "apparent_temperature",
  "is_day", "precipitation", "rain", "weather_code",
  "cloud_cover", "surface_pressure", "wind_speed_10m",
  "wind_direction_10m", "wind_gusts_10m",
].join(",");

const HOURLY_PARAMS = [
  "temperature_2m", "relative_humidity_2m", "apparent_temperature",
  "precipitation_probability", "precipitation", "rain",
  "weather_code", "surface_pressure", "wind_speed_10m",
  "wind_direction_10m", "wind_gusts_10m", "visibility",
  "uv_index", "cloud_cover", "is_day",
].join(",");

const DAILY_PARAMS = [
  "weather_code", "temperature_2m_max", "temperature_2m_min",
  "apparent_temperature_max", "apparent_temperature_min",
  "sunrise", "sunset", "uv_index_max",
  "precipitation_sum", "rain_sum", "precipitation_probability_max",
  "wind_speed_10m_max", "wind_direction_10m_dominant",
  "precipitation_hours",
].join(",");

const AQ_PARAMS = [
  "us_aqi", "pm2_5", "pm10", "carbon_monoxide",
  "nitrogen_dioxide", "sulphur_dioxide", "ozone", "uv_index",
].join(",");


/**
 * Fetch complete weather data (current + hourly + daily).
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  timezone: string = "auto",
  forecastDays: number = 16,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone,
    forecast_days: Math.min(forecastDays, 16).toString(),
    current: CURRENT_PARAMS,
    hourly: HOURLY_PARAMS,
    daily: DAILY_PARAMS,
  });

  const res = await fetch(`${OPEN_METEO_FORECAST}?${params}`);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  return res.json();
}


/**
 * Fetch air quality data.
 */
export async function fetchAirQuality(
  latitude: number,
  longitude: number,
  timezone: string = "auto",
): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone,
    hourly: AQ_PARAMS,
    forecast_days: "3",
  });

  const res = await fetch(`${OPEN_METEO_AIR_QUALITY}?${params}`);
  if (!res.ok) throw new Error(`Air Quality API error: ${res.status}`);
  return res.json();
}


/**
 * Search for cities by name.
 */
export async function searchCities(
  query: string,
  count: number = 8,
  language: string = "en",
): Promise<GeoLocation[]> {
  if (query.length < 2) return [];

  const params = new URLSearchParams({
    name: query,
    count: count.toString(),
    language,
    format: "json",
  });

  const res = await fetch(`${OPEN_METEO_GEOCODING}?${params}`);
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);
  const data = await res.json();
  return data.results || [];
}


/**
 * Fetch historical weather data.
 */
export async function fetchHistorical(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
  timezone: string = "auto",
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone,
    start_date: startDate,
    end_date: endDate,
    daily: DAILY_PARAMS,
  });

  const res = await fetch(`${OPEN_METEO_HISTORICAL}?${params}`);
  if (!res.ok) throw new Error(`Historical API error: ${res.status}`);
  return res.json();
}

/**
 * Internal Next.js API Routes for AI Services (Vercel Ready)
 */
const BACKEND_URL = "/api";

export type AIProvider = "groq" | "openai" | "gemini" | "openrouter";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function fetchAIInsights(
  weatherData: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    description: string;
    uv: number;
    aqi: number | null;
  },
  provider: AIProvider = "groq"
): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/ai/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...weatherData, provider }),
  });
  
  if (!res.ok) throw new Error("Failed to fetch AI insights");
  const data = await res.json();
  return data.insights;
}

export async function chatWithAI(
  messages: ChatMessage[],
  context: Record<string, any>,
  provider: AIProvider = "groq"
): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context, provider }),
  });
  
  if (!res.ok) throw new Error("Failed to communicate with AI Chatbot");
  const data = await res.json();
  return data.response;
}

