/**
 * Weather AI — Utility Functions
 * Weather code mappings, unit conversions, color scales, and comfort calculations.
 */

// ─── WMO Weather Code → Description + Icon ─────────────────────────────────

export interface WeatherInfo {
  description: string;
  icon: string;         // Lucide icon name
  iconDay: string;
  iconNight: string;
  bgClass: string;      // CSS class for background
}

const WEATHER_CODES: Record<number, WeatherInfo> = {
  0:  { description: "Clear Sky",           icon: "sun",              iconDay: "sun",           iconNight: "moon",          bgClass: "bg-weather-clear-day" },
  1:  { description: "Mainly Clear",        icon: "sun",              iconDay: "sun",           iconNight: "moon",          bgClass: "bg-weather-clear-day" },
  2:  { description: "Partly Cloudy",       icon: "cloud-sun",       iconDay: "cloud-sun",     iconNight: "cloud-moon",    bgClass: "bg-weather-cloudy" },
  3:  { description: "Overcast",            icon: "cloud",            iconDay: "cloud",         iconNight: "cloud",         bgClass: "bg-weather-cloudy" },
  45: { description: "Foggy",               icon: "cloud-fog",       iconDay: "cloud-fog",     iconNight: "cloud-fog",     bgClass: "bg-weather-cloudy" },
  48: { description: "Depositing Rime Fog", icon: "cloud-fog",       iconDay: "cloud-fog",     iconNight: "cloud-fog",     bgClass: "bg-weather-cloudy" },
  51: { description: "Light Drizzle",       icon: "cloud-drizzle",   iconDay: "cloud-drizzle", iconNight: "cloud-drizzle", bgClass: "bg-weather-rainy" },
  53: { description: "Moderate Drizzle",    icon: "cloud-drizzle",   iconDay: "cloud-drizzle", iconNight: "cloud-drizzle", bgClass: "bg-weather-rainy" },
  55: { description: "Dense Drizzle",       icon: "cloud-drizzle",   iconDay: "cloud-drizzle", iconNight: "cloud-drizzle", bgClass: "bg-weather-rainy" },
  56: { description: "Freezing Drizzle",    icon: "cloud-drizzle",   iconDay: "cloud-drizzle", iconNight: "cloud-drizzle", bgClass: "bg-weather-rainy" },
  57: { description: "Heavy Freezing Drizzle", icon: "cloud-drizzle", iconDay: "cloud-drizzle", iconNight: "cloud-drizzle", bgClass: "bg-weather-rainy" },
  61: { description: "Slight Rain",         icon: "cloud-rain",      iconDay: "cloud-rain",    iconNight: "cloud-rain",    bgClass: "bg-weather-rainy" },
  63: { description: "Moderate Rain",       icon: "cloud-rain",      iconDay: "cloud-rain",    iconNight: "cloud-rain",    bgClass: "bg-weather-rainy" },
  65: { description: "Heavy Rain",          icon: "cloud-rain",      iconDay: "cloud-rain",    iconNight: "cloud-rain",    bgClass: "bg-weather-rainy" },
  66: { description: "Freezing Rain",       icon: "cloud-rain",      iconDay: "cloud-rain",    iconNight: "cloud-rain",    bgClass: "bg-weather-rainy" },
  67: { description: "Heavy Freezing Rain", icon: "cloud-rain",      iconDay: "cloud-rain",    iconNight: "cloud-rain",    bgClass: "bg-weather-rainy" },
  71: { description: "Slight Snowfall",     icon: "snowflake",       iconDay: "snowflake",     iconNight: "snowflake",     bgClass: "bg-weather-snow" },
  73: { description: "Moderate Snowfall",   icon: "snowflake",       iconDay: "snowflake",     iconNight: "snowflake",     bgClass: "bg-weather-snow" },
  75: { description: "Heavy Snowfall",      icon: "snowflake",       iconDay: "snowflake",     iconNight: "snowflake",     bgClass: "bg-weather-snow" },
  77: { description: "Snow Grains",         icon: "snowflake",       iconDay: "snowflake",     iconNight: "snowflake",     bgClass: "bg-weather-snow" },
  80: { description: "Slight Rain Showers", icon: "cloud-rain",      iconDay: "cloud-rain",    iconNight: "cloud-rain",    bgClass: "bg-weather-rainy" },
  81: { description: "Moderate Rain Showers", icon: "cloud-rain",    iconDay: "cloud-rain",    iconNight: "cloud-rain",    bgClass: "bg-weather-rainy" },
  82: { description: "Violent Rain Showers", icon: "cloud-rain",     iconDay: "cloud-rain",    iconNight: "cloud-rain",    bgClass: "bg-weather-rainy" },
  85: { description: "Slight Snow Showers", icon: "snowflake",       iconDay: "snowflake",     iconNight: "snowflake",     bgClass: "bg-weather-snow" },
  86: { description: "Heavy Snow Showers",  icon: "snowflake",       iconDay: "snowflake",     iconNight: "snowflake",     bgClass: "bg-weather-snow" },
  95: { description: "Thunderstorm",        icon: "cloud-lightning", iconDay: "cloud-lightning", iconNight: "cloud-lightning", bgClass: "bg-weather-stormy" },
  96: { description: "Thunderstorm with Slight Hail", icon: "cloud-lightning", iconDay: "cloud-lightning", iconNight: "cloud-lightning", bgClass: "bg-weather-stormy" },
  99: { description: "Thunderstorm with Heavy Hail", icon: "cloud-lightning", iconDay: "cloud-lightning", iconNight: "cloud-lightning", bgClass: "bg-weather-stormy" },
};

export function getWeatherInfo(code: number): WeatherInfo {
  return WEATHER_CODES[code] || {
    description: "Unknown",
    icon: "cloud",
    iconDay: "cloud",
    iconNight: "cloud",
    bgClass: "bg-weather-cloudy",
  };
}

export function getWeatherDescription(code: number): string {
  return getWeatherInfo(code).description;
}

// ─── Temperature Utilities ──────────────────────────────────────────────────

export function getTemperatureColor(temp: number): string {
  if (temp <= 0) return "var(--temp-freezing)";
  if (temp <= 10) return "var(--temp-cold)";
  if (temp <= 18) return "var(--temp-cool)";
  if (temp <= 25) return "var(--temp-mild)";
  if (temp <= 35) return "var(--temp-warm)";
  return "var(--temp-hot)";
}

export function getTemperatureClass(temp: number): string {
  if (temp <= 0) return "temp-freezing";
  if (temp <= 10) return "temp-cold";
  if (temp <= 18) return "temp-cool";
  if (temp <= 25) return "temp-mild";
  if (temp <= 35) return "temp-warm";
  return "temp-hot";
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9/5 + 32) * 10) / 10;
}

export function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5/9) * 10) / 10;
}

// ─── Wind ───────────────────────────────────────────────────────────────────

export function getWindDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                       "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export function getWindDescription(speedKmh: number): string {
  if (speedKmh < 1) return "Calm";
  if (speedKmh < 12) return "Light Breeze";
  if (speedKmh < 29) return "Moderate Wind";
  if (speedKmh < 50) return "Strong Wind";
  if (speedKmh < 75) return "Gale";
  if (speedKmh < 103) return "Storm";
  return "Hurricane";
}

export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371 * 10) / 10;
}

// ─── Pressure ───────────────────────────────────────────────────────────────

export function hpaToInHg(hpa: number): number {
  return Math.round(hpa * 0.02953 * 100) / 100;
}

// ─── UV Index ───────────────────────────────────────────────────────────────

export function getUVLevel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Low", color: "#22c55e" };
  if (uv <= 5) return { label: "Moderate", color: "#eab308" };
  if (uv <= 7) return { label: "High", color: "#f97316" };
  if (uv <= 10) return { label: "Very High", color: "#ef4444" };
  return { label: "Extreme", color: "#a855f7" };
}

// ─── AQI ────────────────────────────────────────────────────────────────────

export function getAQILevel(aqi: number): { label: string; color: string; advice: string } {
  if (aqi <= 50) return { label: "Good", color: "#22c55e", advice: "Air quality is satisfactory." };
  if (aqi <= 100) return { label: "Moderate", color: "#eab308", advice: "Acceptable. Sensitive people should limit outdoor exposure." };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "#f97316", advice: "Sensitive groups may experience health effects." };
  if (aqi <= 200) return { label: "Unhealthy", color: "#ef4444", advice: "Everyone may begin to experience health effects." };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#7c3aed", advice: "Health alert. Avoid prolonged outdoor activity." };
  return { label: "Hazardous", color: "#991b1b", advice: "Health emergency. Stay indoors." };
}

// ─── Visibility ─────────────────────────────────────────────────────────────

export function getVisibilityDescription(meters: number): string {
  const km = meters / 1000;
  if (km >= 10) return "Excellent";
  if (km >= 5) return "Good";
  if (km >= 2) return "Moderate";
  if (km >= 1) return "Poor";
  return "Very Poor";
}

export function formatVisibility(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

// ─── Date / Time Formatting ─────────────────────────────────────────────────

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatDay(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function formatHour(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  if (date.getHours() === now.getHours() && date.toDateString() === now.toDateString()) return "Now";
  return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
}

// ─── Heat Index Calculation ────────────────────────────────────────────────

export function calculateHeatIndex(tempC: number, humidity: number): number {
  // Rothfusz regression equation (works for temp > 26.7°C / 80°F)
  const T = celsiusToFahrenheit(tempC);
  const R = humidity;

  if (T < 80) return tempC; // Return original temp if below threshold

  let HI = -42.379 + 2.04901523 * T + 10.14333127 * R
    - 0.22475541 * T * R - 6.83783e-3 * T * T
    - 5.481717e-2 * R * R + 1.22874e-3 * T * T * R
    + 8.5282e-4 * T * R * R - 1.99e-6 * T * T * R * R;

  return fahrenheitToCelsius(HI);
}

// ─── Comfort Level ──────────────────────────────────────────────────────────

export function getComfortLevel(tempC: number, humidity: number): { label: string; color: string } {
  const heatIndex = calculateHeatIndex(tempC, humidity);
  if (heatIndex < 10) return { label: "Cold", color: "var(--temp-cold)" };
  if (heatIndex < 18) return { label: "Cool", color: "var(--temp-cool)" };
  if (heatIndex < 26) return { label: "Comfortable", color: "var(--temp-mild)" };
  if (heatIndex < 32) return { label: "Warm", color: "var(--temp-warm)" };
  if (heatIndex < 40) return { label: "Hot", color: "var(--temp-hot)" };
  return { label: "Extreme Heat", color: "var(--temp-hot)" };
}
