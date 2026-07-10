import os
from enum import Enum
from typing import Optional
from groq import Groq
from openai import AsyncOpenAI
import google.generativeai as genai
from pydantic import BaseModel

class LLMProvider(str, Enum):
    GROQ = "groq"
    OPENAI = "openai"
    GEMINI = "gemini"
    OPENROUTER = "openrouter"

class ChatMessage(BaseModel):
    role: str
    content: str

class LLMService:
    def __init__(self):
        # Initialize clients lazily to allow dynamic API key loading
        self.groq_client: Optional[Groq] = None
        self.openai_client: Optional[AsyncOpenAI] = None
        self.openrouter_client: Optional[AsyncOpenAI] = None
        self.gemini_initialized = False

    def _get_groq_client(self) -> Groq:
        if not self.groq_client:
            self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        return self.groq_client

    def _get_openai_client(self) -> AsyncOpenAI:
        if not self.openai_client:
            self.openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        return self.openai_client

    def _get_openrouter_client(self) -> AsyncOpenAI:
        if not self.openrouter_client:
            self.openrouter_client = AsyncOpenAI(
                api_key=os.getenv("OPENROUTER_API_KEY"),
                base_url="https://openrouter.ai/api/v1"
            )
        return self.openrouter_client

    def _init_gemini(self):
        if not self.gemini_initialized:
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            self.gemini_initialized = True

    async def generate_insights(self, weather_data: dict, provider: LLMProvider = LLMProvider.GROQ) -> str:
        prompt = f"""
        You are an expert meteorologist AI assistant for 'Weather AI'.
        Analyze this current weather data and provide a short, conversational, and highly insightful 2-sentence summary.
        Don't just read the numbers, explain what they mean for the user (e.g., "It's a hot day, but the low humidity makes it feel pleasant." or "The high UV index means you should wear sunscreen today.")

        Weather Data:
        Temperature: {weather_data.get('temperature')}°C
        Humidity: {weather_data.get('humidity')}%
        Wind: {weather_data.get('wind_speed')} km/h
        Conditions: {weather_data.get('description')}
        UV Index: {weather_data.get('uv')}
        AQI: {weather_data.get('aqi')}
        """

        messages = [
            {"role": "system", "content": "You are a concise expert meteorologist."},
            {"role": "user", "content": prompt}
        ]

        if provider == LLMProvider.GROQ:
            client = self._get_groq_client()
            response = client.chat.completions.create(
                messages=messages,
                model="llama3-70b-8192",
            )
            return response.choices[0].message.content

        elif provider == LLMProvider.OPENAI:
            client = self._get_openai_client()
            response = await client.chat.completions.create(
                messages=messages,
                model="gpt-4o-mini",
            )
            return response.choices[0].message.content

        elif provider == LLMProvider.OPENROUTER:
            client = self._get_openrouter_client()
            response = await client.chat.completions.create(
                messages=messages,
                model="google/gemini-pro",
            )
            return response.choices[0].message.content

        elif provider == LLMProvider.GEMINI:
            self._init_gemini()
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            return response.text

        raise ValueError(f"Unsupported provider: {provider}")

    async def chat(self, messages: list[ChatMessage], weather_context: dict, provider: LLMProvider = LLMProvider.GROQ) -> str:
        system_message = {
            "role": "system",
            "content": f"""You are the intelligent assistant for 'Weather AI'. 
            Always be helpful, concise, and friendly. 
            Here is the user's current weather context to help answer their questions:
            Location: {weather_context.get('location', 'Unknown')}
            Current Temp: {weather_context.get('current_temp')}
            Conditions: {weather_context.get('conditions')}
            Forecast today: {weather_context.get('forecast_today')}
            """
        }

        # Convert Pydantic models to dicts for clients that expect dicts
        dict_messages = [system_message] + [{"role": m.role, "content": m.content} for m in messages]

        if provider == LLMProvider.GROQ:
            client = self._get_groq_client()
            response = client.chat.completions.create(
                messages=dict_messages,
                model="llama3-70b-8192",
            )
            return response.choices[0].message.content

        elif provider == LLMProvider.OPENAI:
            client = self._get_openai_client()
            response = await client.chat.completions.create(
                messages=dict_messages,
                model="gpt-4o-mini",
            )
            return response.choices[0].message.content

        elif provider == LLMProvider.OPENROUTER:
            client = self._get_openrouter_client()
            response = await client.chat.completions.create(
                messages=dict_messages,
                model="google/gemini-pro",
            )
            return response.choices[0].message.content

        elif provider == LLMProvider.GEMINI:
            self._init_gemini()
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Convert messages to Gemini format
            gemini_messages = []
            for msg in dict_messages:
                role = "user" if msg["role"] == "user" else "model"
                gemini_messages.append({"role": role, "parts": [msg["content"]]})
            
            response = model.generate_content(gemini_messages)
            return response.text

        raise ValueError(f"Unsupported provider: {provider}")

llm_service = LLMService()
