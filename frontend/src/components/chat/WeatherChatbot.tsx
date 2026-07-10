"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { useWeather } from "@/hooks/useWeatherContext";
import { chatWithAI, ChatMessage } from "@/lib/api";

export default function WeatherChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your Weather AI assistant. Ask me anything about the forecast, weather, or what to wear today!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { weather, location, airQuality } = useWeather();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const context = {
        location: location?.name || "Unknown",
        current_temp: weather?.current?.temperature_2m,
        conditions: weather?.current?.weather_code, // ideally mapped to text
        forecast_today: weather?.daily?.temperature_2m_max?.[0]
      };

      const response = await chatWithAI([...messages, userMsg], context);
      
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to my AI brain right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-50"
        style={{
          background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
          color: "white"
        }}
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            style={{ 
              height: "500px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              backdropFilter: "blur(20px)"
            }}
          >
            {/* Header */}
            <div 
              className="p-4 flex justify-between items-center"
              style={{ borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.2)" }}
            >
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-blue-500" />
                <h3 className="font-bold text-sm">Weather AI Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-blue-600" : "bg-purple-600"}`}>
                    {msg.role === "user" ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
                  </div>
                  <div 
                    className={`p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-gray-800 text-gray-100 rounded-tl-none"}`}
                    style={msg.role === "assistant" ? { background: "var(--bg-card)" } : {}}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 mr-auto max-w-[85%]">
                  <div className="p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 bg-purple-600">
                    <Bot size={14} color="white" />
                  </div>
                  <div className="p-3 rounded-2xl text-sm rounded-tl-none" style={{ background: "var(--bg-card)" }}>
                    <div className="flex gap-1">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 bg-black/20 rounded-full p-1 pl-4"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the weather..."
                  className="flex-1 bg-transparent text-sm outline-none text-white placeholder-gray-400"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 rounded-full bg-blue-600 text-white disabled:opacity-50 transition-opacity"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
