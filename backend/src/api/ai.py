from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from src.services.llm_service import llm_service, LLMProvider, ChatMessage

router = APIRouter(prefix="/ai", tags=["ai"])

class InsightsRequest(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    description: str
    uv: float
    aqi: Optional[float] = None
    provider: Optional[LLMProvider] = LLMProvider.GROQ

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: dict
    provider: Optional[LLMProvider] = LLMProvider.GROQ

@router.post("/insights")
async def get_insights(request: InsightsRequest):
    try:
        insights = await llm_service.generate_insights(
            weather_data=request.model_dump(),
            provider=request.provider
        )
        return {"insights": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = await llm_service.chat(
            messages=request.messages,
            weather_context=request.context,
            provider=request.provider
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
