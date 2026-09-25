import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  User,
  Maximize2,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../context/WardrobeContext';
import { useWeather } from '../../context/WeatherContext';
import { chatApi } from '../../api/chatApi';

export const FloatingStylistOrb = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hey! I'm your StyleSync stylist. Send me a question or **upload a photo** of any item to see if it's a BUY or PASS!",
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wardrobe } = useWardrobe();
  const { weather } = useWeather();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Hide widget if already on dedicated assistant page
  const isAssistantPage = location.pathname === '/assistant';

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isChatOpen]);

  if (isAssistantPage) return null;

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textToSend = null) => {
    const query = typeof textToSend === 'string' ? textToSend : input;
    const currentImage = selectedImage;

    if (!query.trim() && !currentImage) return;

    const userMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: query || (currentImage ? 'Should I buy this item? Does it match my style?' : ''),
      image: currentImage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const history = messages.slice(-4).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text
      }));
      const backendReply = await chatApi.sendMessage(userMessage.text, history, currentImage);
      if (backendReply) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'ai_' + Date.now(),
            sender: 'ai',
            text: backendReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsTyping(false);
        return;
      }
    } catch {
      // fallback
    }

    setTimeout(() => {
      let reply = '';
      if (currentImage) {
        reply = `🟢 **BUY — Great Match!**\n\nThis piece looks super clean. The color and silhouette fit your ${user?.stylePreferences?.[0] || 'Smart Casual'} aesthetic and will pair easily with your existing jeans and neutral tops.`;
      } else {
        const lower = (query || '').toLowerCase();
        if (lower.includes('white') || lower.includes('sneaker')) {
          reply = `Minimal white low-tops pair with 90%+ of your wardrobe (jeans, chinos & overshirts). 🟢 **High Match.**`;
        } else if (lower.includes('today') || lower.includes('wear') || lower.includes('weather')) {
          reply = `For today's ${weather.temp}°C ${weather.label}, go with a lightweight Oxford shirt, tapered chinos, and clean low-tops.`;
        } else {
          reply = `That fits your ${user?.stylePreferences?.[0] || 'Smart Casual'} profile and pairs cleanly with your ${wardrobe.length} wardrobe staples!`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* 1. FLOATING ACTION BUTTON (FAB) - DIRECT AI CHAT TRIGGER */}
      <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 z-40 lg:bottom-6 lg:right-6">
        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label="Ask Stylist"
          className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-floating border border-slate-700/80 flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-105 cursor-pointer relative group"
        >
          {isChatOpen ? (
            <X className="w-5 h-5 text-white transition-transform duration-200 rotate-90" />
          ) : (
            <div className="relative flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
            </div>
          )}

          {/* Desktop Hover Tooltip */}
          {!isChatOpen && (
            <span className="hidden lg:group-hover:block absolute right-16 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap">
              Ask Stylist
            </span>
          )}
        </button>
      </div>

      {/* 3. INTEGRATED AI CHAT DRAWER */}
      {isChatOpen && (
        <div className="fixed inset-0 lg:inset-auto lg:bottom-22 lg:right-6 z-50 flex items-end justify-center lg:block animate-slide-up-mobile">
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs lg:hidden"
            onClick={() => setIsChatOpen(false)}
          />

          {/* Dialog Container */}
          <div className="relative w-full lg:w-96 max-h-[85dvh] lg:max-h-[540px] h-[520px] bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-10">
            {/* Header */}
            <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black text-white">Ask StyleSync</h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-400">Personal Stylist &amp; Visual Advisor</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsChatOpen(false);
                    navigate('/assistant');
                  }}
                  title="Open Full Assistant Page"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Body */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FAFAF9]">
              {messages.map((m) => {
                const isAI = m.sender === 'ai';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2 max-w-[88%] ${
                      isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        isAI ? 'bg-slate-900 text-emerald-400' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isAI ? <MessageSquare className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${
                        isAI
                          ? 'bg-white border border-slate-200/80 text-slate-800 shadow-2xs'
                          : 'bg-slate-900 text-white font-medium'
                      }`}
                    >
                      {/* Attached Photo in chat bubble */}
                      {m.image && (
                        <div className="rounded-xl overflow-hidden max-h-40 border border-white/20 bg-black/10 mb-1.5">
                          <img
                            src={m.image}
                            alt="Uploaded item"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div
                        dangerouslySetInnerHTML={{
                          __html: m.text
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br />')
                        }}
                      />
                      <span className={`block text-[9px] ${isAI ? 'text-slate-400' : 'text-slate-400 text-right'}`}>
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-2xl border border-slate-200 w-fit">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Analyzing style match...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-3 py-1.5 bg-slate-100/70 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200 whitespace-nowrap flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3 h-3 text-emerald-600" />
                <span>📷 Upload Photo</span>
              </button>
              <button
                type="button"
                onClick={() => handleSend(`What should I wear today in ${weather.city || 'my city'} for ${weather.temp}°C ${weather.condition}?`)}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 whitespace-nowrap"
              >
                ☀️ Today's Look ({weather.temp}°C)
              </button>
              <button
                type="button"
                onClick={() => handleSend('Will white sneakers match?')}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 whitespace-nowrap"
              >
                👟 White Sneakers
              </button>
            </div>

            {/* Preview image thumbnail above input if selected */}
            {selectedImage && (
              <div className="px-3 pt-2 bg-white flex items-center gap-2">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-slate-900/80 text-white flex items-center justify-center text-[10px]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[11px] font-medium text-slate-500">Photo attached — ready to evaluate</span>
              </div>
            )}

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 flex-shrink-0"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Photo or Screenshot"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex-shrink-0"
              >
                <ImageIcon className="w-4 h-4 text-emerald-600" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedImage ? "Ask about this photo..." : "Ask about style or upload photo..."}
                className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-emerald-500 focus:bg-white"
              />

              <button
                type="submit"
                disabled={!input.trim() && !selectedImage}
                className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer flex-shrink-0"
              >
                <Send className="w-4 h-4 text-emerald-400" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export const FloatingAIChatWidget = FloatingStylistOrb;
export default FloatingStylistOrb;
