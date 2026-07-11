import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { temperature, humidity, wind_speed, description, uv, aqi } = body;

    const prompt = `
      You are an expert meteorologist AI assistant for 'Weather AI'.
      Analyze this current weather data and provide a short, conversational, and highly insightful 2-sentence summary.
      Don't just read the numbers, explain what they mean for the user (e.g., "It's a hot day, but the low humidity makes it feel pleasant." or "The high UV index means you should wear sunscreen today.")

      Weather Data:
      Temperature: ${temperature}°C
      Humidity: ${humidity}%
      Wind: ${wind_speed} km/h
      Conditions: ${description}
      UV Index: ${uv}
      AQI: ${aqi}
    `;

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY environment variable" }, { status: 500 });
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a concise expert meteorologist." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json({ error: "Failed to fetch AI insights from provider" }, { status: 502 });
    }

    const data = await res.json();
    const insights = data.choices?.[0]?.message?.content || "No insights could be generated.";

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
