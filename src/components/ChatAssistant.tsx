'use client';

import { useState, useRef, useEffect } from "react";

interface IMessage {
  sender: "user" | "bot";
  text: string;
}

interface IChatAction {
  type: "ADD_TO_CART" | "REMOVE_FROM_CART" | "CLEAR_CART" | "NONE";
  productId?: string;
  name?: string;
  price?: number;
  size?: string;
}

interface IChatResponse {
  reply?: string;
  actions?: IChatAction[];
  error?: string;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([
    { sender: "bot", text: "Hi! I am your KIORI IRO shopping assistant. Ask me to browse styles or add items to your cart!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  //auto s roll to new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data: IChatResponse = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to parse query");

      if (data.reply) { setMessages((prev) => [...prev, { sender: "bot", text: data.reply ?? "" }]);}

      
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          if (action.type === "ADD_TO_CART" && action.productId) {
            
            await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: action.productId,
                name: action.name,
                price: action.price,
                size: action.size || "M", 
                quantity: 1
              }),
            });
          }
        }
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setMessages((prev) => [...prev, { sender: "bot", text: `Error: ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-4 shadow-xl flex items-center justify-center transition transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        </button>
      )}

      {/* Interface Container */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-5">
          {/* Header Panel */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
              <h2 className="font-semibold text-sm tracking-wide">KIORI Assistant</h2>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-indigo-200 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] text-xs px-3.5 py-2.5 rounded-2xl shadow-sm border ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white border-indigo-600 rounded-tr-none"
                    : "bg-white text-gray-800 border-gray-100 rounded-tl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 text-[11px] border border-gray-100 px-3.5 py-2 rounded-xl rounded-tl-none italic shadow-sm animate-pulse">
                  Assistant is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/*  */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask KIORI assistant..."
              className="flex-1 bg-gray-50 rounded-lg text-xs px-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}