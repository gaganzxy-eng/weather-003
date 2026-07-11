import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    const systemMessage = {
      role: "system",
      content: `You are the intelligent assistant for 'Weather AI'. 
      Always be helpful, concise, and friendly. 
      Here is the user's current weather context to help answer their questions:
      Location: ${context?.location || 'Unknown'}
      Current Temp: ${context?.current_temp || 'Unknown'}°C
      Conditions: ${context?.conditions || 'Unknown'}
      Forecast today: ${context?.forecast_today || 'Unknown'}°C
      `
    };

    const apiMessages = [systemMessage, ...messages.map((m: any) => ({ role: m.role, content: m.content }))];

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
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json({ error: "Failed to communicate with AI provider" }, { status: 502 });
    }

    const data = await res.json();
    const responseText = data.choices?.[0]?.message?.content || "I'm having trouble thinking right now.";

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Chat Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
