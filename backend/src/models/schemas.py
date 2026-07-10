"""
Weather AI — Pydantic Schemas
All request/response models for the API.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ─── Geocoding ────────────────────────────────────────────────────────────────

class GeoLocation(BaseModel):
    """A geocoded location result."""
    id: int
    name: str
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    timezone: Optional[str] = None
    admin1: Optional[str] = None  # State/Province


class GeocodingResponse(BaseModel):
    """Response from geocoding search."""
    results: list[GeoLocation] = []


# ─── Current Weather ──────────────────────────────────────────────────────────

class CurrentWeather(BaseModel):
    """Current weather conditions."""
    temperature: float
    feels_like: float
    humidity: int
    pressure: float
    wind_speed: float
    wind_direction: int
    wind_gusts: Optional[float] = None
    weather_code: int
    cloud_cover: int
    visibility: Optional[float] = None
    uv_index: Optional[float] = None
    precipitation: float = 0
    rain: float = 0
    is_day: bool = True
    time: str


# ─── Hourly Forecast ─────────────────────────────────────────────────────────

class HourlyData(BaseModel):
    """Hourly forecast data point."""
    time: list[str]
    temperature_2m: list[float]
    relative_humidity_2m: list[int]
    apparent_temperature: list[float]
    precipitation_probability: list[Optional[int]] = []
    precipitation: list[float]
    rain: list[float]
    weather_code: list[int]
    surface_pressure: list[float]
    wind_speed_10m: list[float]
    wind_direction_10m: list[int]
    wind_gusts_10m: list[Optional[float]] = []
    visibility: list[Optional[float]] = []
    uv_index: list[Optional[float]] = []
    cloud_cover: list[int] = []
    is_day: list[Optional[int]] = []


# ─── Daily Forecast ──────────────────────────────────────────────────────────

class DailyData(BaseModel):
    """Daily forecast data."""
    time: list[str]
    weather_code: list[int]
    temperature_2m_max: list[float]
    temperature_2m_min: list[float]
    apparent_temperature_max: list[float]
    apparent_temperature_min: list[float]
    sunrise: list[str]
    sunset: list[str]
    uv_index_max: list[Optional[float]] = []
    precipitation_sum: list[float]
    rain_sum: list[float]
    precipitation_probability_max: list[Optional[int]] = []
    wind_speed_10m_max: list[float]
    wind_direction_10m_dominant: list[int]
    precipitation_hours: list[Optional[float]] = []


# ─── Air Quality ──────────────────────────────────────────────────────────────

class AirQualityHourly(BaseModel):
    """Hourly air quality data."""
    time: list[str]
    us_aqi: list[Optional[int]] = []
    pm2_5: list[Optional[float]] = []
    pm10: list[Optional[float]] = []
    carbon_monoxide: list[Optional[float]] = []
    nitrogen_dioxide: list[Optional[float]] = []
    sulphur_dioxide: list[Optional[float]] = []
    ozone: list[Optional[float]] = []
    uv_index: list[Optional[float]] = []


class AirQualityResponse(BaseModel):
    """Air quality API response."""
    latitude: float
    longitude: float
    hourly: AirQualityHourly


# ─── Combined Weather Response ────────────────────────────────────────────────

class WeatherResponse(BaseModel):
    """Full weather response combining current + forecast."""
    latitude: float
    longitude: float
    timezone: str
    timezone_abbreviation: str
    elevation: Optional[float] = None
    current: Optional[CurrentWeather] = None
    hourly: Optional[HourlyData] = None
    daily: Optional[DailyData] = None


# ─── API Request Models ──────────────────────────────────────────────────────

class WeatherRequest(BaseModel):
    """Request for weather data."""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone: str = "auto"


class HistoricalRequest(BaseModel):
    """Request for historical weather data."""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    start_date: str  # YYYY-MM-DD
    end_date: str    # YYYY-MM-DD
    timezone: str = "auto"


class SearchRequest(BaseModel):
    """Request for city search."""
    query: str = Field(..., min_length=2)
    count: int = Field(default=5, ge=1, le=20)
