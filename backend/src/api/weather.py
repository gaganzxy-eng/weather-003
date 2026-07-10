"""
Weather AI — Weather API Routes
Endpoints for current weather, forecast, air quality, historical data, and city search.
"""

from fastapi import APIRouter, HTTPException, Query
from src.services.open_meteo import get_open_meteo_service

router = APIRouter(tags=["weather"])


@router.get("/weather")
async def get_weather(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    timezone: str = Query("auto", description="Timezone (e.g., 'America/New_York' or 'auto')"),
    forecast_days: int = Query(16, ge=1, le=16, description="Number of forecast days"),
):
    """
    Get complete weather data: current conditions + hourly + daily forecast.
    Uses Open-Meteo API (no API key required).
    """
    try:
        service = get_open_meteo_service()
        data = await service.get_weather(lat, lon, timezone, forecast_days)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather data: {str(e)}")


@router.get("/weather/air-quality")
async def get_air_quality(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    timezone: str = Query("auto"),
):
    """Get air quality data including AQI, PM2.5, PM10, and other pollutants."""
    try:
        service = get_open_meteo_service()
        data = await service.get_air_quality(lat, lon, timezone)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch air quality data: {str(e)}")


@router.get("/weather/historical")
async def get_historical_weather(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    timezone: str = Query("auto"),
):
    """
    Get historical weather data. Open-Meteo has data back to 1940.
    Maximum range: 1 year per request recommended.
    """
    try:
        service = get_open_meteo_service()
        data = await service.get_historical(lat, lon, start_date, end_date, timezone)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch historical data: {str(e)}")


@router.get("/geocoding/search")
async def search_cities(
    q: str = Query(..., min_length=2, description="City name to search"),
    count: int = Query(5, ge=1, le=20, description="Number of results"),
    language: str = Query("en", description="Language for results"),
):
    """
    Search for cities by name. Returns coordinates, country, timezone.
    Uses Open-Meteo Geocoding API.
    """
    try:
        service = get_open_meteo_service()
        data = await service.search_city(q, count, language)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geocoding search failed: {str(e)}")
