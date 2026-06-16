"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function MessagingPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Financial Advisor. I can help you analyze your spending, provide insights on your expenses, and answer questions about your financial habits. Try asking me something like 'Am I spending too much on food?' or 'Give me a summary of my spending.'",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setError("");
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail") || "user@example.com";
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const res = await fetch(`${API_URL}/ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();

      if (res.ok) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        setError(data.message || "Failed to get response");
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I encountered an error. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError("Connection error. Make sure the backend is running.");
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Connection error. Please make sure the backend is running.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto h-screen md:h-[calc(100vh-40px)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            <span className="text-white">Financial </span>
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Advisor</span>
          </h1>
          <p className="text-zinc-400 text-lg">Ask me anything about your finances</p>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm overflow-hidden flex flex-col mb-6">
          {/* Messages Area */}
          <CardContent className="flex-1 p-6 overflow-y-auto space-y-4 bg-zinc-950/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none"
                      : "bg-zinc-800/60 text-zinc-100 rounded-bl-none border border-zinc-700/50"
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                  <span className={`text-xs mt-2 block ${message.sender === "user" ? "text-violet-200" : "text-zinc-400"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800/60 text-zinc-100 px-4 py-3 rounded-2xl rounded-bl-none border border-zinc-700/50 flex items-center gap-2">
                  <Loader className="animate-spin" size={18} />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="border-t border-zinc-800/50 p-4 bg-zinc-900/30">
            {error && (
              <div className="mb-3 p-3 bg-red-600/20 border border-red-600/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your spending..."
                disabled={loading}
                className="flex-1 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 h-12 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition-all"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
          <p className="text-zinc-400 text-sm font-medium mb-2">Try asking:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              onClick={() => setInput("Give me a summary of my spending")}
              className="text-left text-xs md:text-sm p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-all"
            >
              💰 "Summarize my spending"
            </button>
            <button
              onClick={() => setInput("Am I spending too much on food?")}
              className="text-left text-xs md:text-sm p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-all"
            >
              🍽️ "Am I spending too much?"
            </button>
            <button
              onClick={() => setInput("What are my top spending categories?")}
              className="text-left text-xs md:text-sm p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-all"
            >
              📊 "Top categories?"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
