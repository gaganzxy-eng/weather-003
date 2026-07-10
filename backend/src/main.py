"""
Weather AI — FastAPI Application Entry Point
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.api.weather import router as weather_router
from src.api.ai import router as ai_router
from src.services.open_meteo import get_open_meteo_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage app lifecycle — startup and shutdown."""
    # Startup: initialize services
    service = get_open_meteo_service()
    yield
    # Shutdown: cleanup
    await service.close()


app = FastAPI(
    title="Weather AI API",
    description="AI-powered weather forecasting and analysis API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend to connect
frontend_url = os.getenv("FRONTEND_URL", "")
allowed_origins = [o.strip() for o in frontend_url.split(",") if o.strip()] + [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(weather_router, prefix="/api")
app.include_router(ai_router, prefix="/api")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "weather-ai-api"}
