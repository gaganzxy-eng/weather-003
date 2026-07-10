"""
Weather AI — Open-Meteo API Service
Handles all communication with the Open-Meteo free weather API.
No API key required.
"""

import httpx
from typing import Optional
from datetime import datetime, timedelta
from functools import lru_cache


# Base URLs for Open-Meteo APIs
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
HISTORICAL_URL = "https://archive-api.open-meteo.com/v1/archive"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"


# Standard parameters we request for each API
CURRENT_PARAMS = [
    "temperature_2m", "relative_humidity_2m", "apparent_temperature",
    "is_day", "precipitation", "rain", "weather_code",
    "cloud_cover", "surface_pressure", "wind_speed_10m",
    "wind_direction_10m", "wind_gusts_10m"
]

HOURLY_PARAMS = [
    "temperature_2m", "relative_humidity_2m", "apparent_temperature",
    "precipitation_probability", "precipitation", "rain",
    "weather_code", "surface_pressure", "wind_speed_10m",
    "wind_direction_10m", "wind_gusts_10m", "visibility",
    "uv_index", "cloud_cover", "is_day"
]

DAILY_PARAMS = [
    "weather_code", "temperature_2m_max", "temperature_2m_min",
    "apparent_temperature_max", "apparent_temperature_min",
    "sunrise", "sunset", "uv_index_max",
    "precipitation_sum", "rain_sum", "precipitation_probability_max",
    "wind_speed_10m_max", "wind_direction_10m_dominant",
    "precipitation_hours"
]

AIR_QUALITY_PARAMS = [
    "us_aqi", "pm2_5", "pm10", "carbon_monoxide",
    "nitrogen_dioxide", "sulphur_dioxide", "ozone", "uv_index"
]


class OpenMeteoService:
    """Service for interacting with the Open-Meteo weather API."""

    def __init__(self):
        self._client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close the HTTP client."""
        await self._client.aclose()

    async def get_weather(
        self,
        latitude: float,
        longitude: float,
        timezone: str = "auto",
        forecast_days: int = 16,
    ) -> dict:
        """
        Get current weather + hourly + daily forecast.
        Open-Meteo supports up to 16-day forecasts for free.
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "timezone": timezone,
            "forecast_days": min(forecast_days, 16),
            "current": ",".join(CURRENT_PARAMS),
            "hourly": ",".join(HOURLY_PARAMS),
            "daily": ",".join(DAILY_PARAMS),
        }

        response = await self._client.get(FORECAST_URL, params=params)
        response.raise_for_status()
        return response.json()

    async def get_air_quality(
        self,
        latitude: float,
        longitude: float,
        timezone: str = "auto",
    ) -> dict:
        """Get current air quality data."""
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "timezone": timezone,
            "hourly": ",".join(AIR_QUALITY_PARAMS),
            "forecast_days": 3,
        }

        response = await self._client.get(AIR_QUALITY_URL, params=params)
        response.raise_for_status()
        return response.json()

    async def get_historical(
        self,
        latitude: float,
        longitude: float,
        start_date: str,
        end_date: str,
        timezone: str = "auto",
    ) -> dict:
        """
        Get historical weather data. Open-Meteo has data back to 1940.
        Dates in YYYY-MM-DD format.
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "timezone": timezone,
            "start_date": start_date,
            "end_date": end_date,
            "daily": ",".join(DAILY_PARAMS),
            "hourly": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,surface_pressure",
        }

        response = await self._client.get(HISTORICAL_URL, params=params)
        response.raise_for_status()
        return response.json()

    async def search_city(
        self,
        query: str,
        count: int = 5,
        language: str = "en",
    ) -> dict:
        """
        Search for cities by name using Open-Meteo Geocoding.
        Returns latitude, longitude, country, timezone, etc.
        """
        params = {
            "name": query,
            "count": count,
            "language": language,
            "format": "json",
        }

        response = await self._client.get(GEOCODING_URL, params=params)
        response.raise_for_status()
        return response.json()


# Singleton instance
_service: Optional[OpenMeteoService] = None


def get_open_meteo_service() -> OpenMeteoService:
    """Get or create the Open-Meteo service singleton."""
    global _service
    if _service is None:
        _service = OpenMeteoService()
    return _service
