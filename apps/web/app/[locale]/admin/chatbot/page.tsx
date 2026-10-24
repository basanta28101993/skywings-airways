'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export default function ChatbotDashboard() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: 'Hello! I am your SkyWings AI Assistant. I can help you with baggage policies, cancel bookings, or check flight details. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI immediately
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages, // Send previous history
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to get response');

      // 🚨 Safety Check: Prevent blank screen if history is missing
      if (Array.isArray(data.updated_history) && data.updated_history.length > 0) {
        setMessages(data.updated_history);
      } else {
        setMessages([...newMessages, { role: 'ai', content: data.response || "I couldn't generate a response." }]);
      }

    } catch (err: any) {
      // 🚨 Handle API Quota Exhaustion gracefully
      let errorMsg = err.message;
      if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('429')) {
        errorMsg = "I'm sorry, but I have reached my daily API limit. Please try again tomorrow.";
      }
      setMessages([...newMessages, { role: 'ai', content: `❌ Error: ${errorMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">🤖</span> SkyWings AI Assistant
            </h1>
            <p className="text-blue-100 text-sm mt-1">Agentic Support (Powered by Gemini)</p>
          </div>
          <Link href="/in" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition">
            Back to Home
          </Link>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
              }`}>
                <div className="whitespace-pre-wrap">
                  {msg.role === 'ai' ? (
                    msg.content.split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                    )
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-5 py-3 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about policies, or type 'Cancel my booking PNR123'..."
              className="flex-1 border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Thinking...' : 'Send 🚀'}
            </button>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">AI can make mistakes. Please verify critical information.</p>
        </div>

      </div>
    </div>
  );
}
