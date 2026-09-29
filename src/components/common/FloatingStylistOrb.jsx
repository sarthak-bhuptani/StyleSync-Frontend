import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  User,
  Maximize2,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../context/WardrobeContext';
import { useWeather } from '../../context/WeatherContext';
import { chatApi } from '../../api/chatApi';

const SHARED_CHAT_STORAGE_KEY = 'stylesync_syncra_messages';

const getInitialMessages = (name) => [
  {
    id: 'welcome',
    sender: 'ai',
    text: `Hey ${name ? name.split(' ')[0] : 'there'}! I'm **Syncra**, your personal stylist. What are we styling today? ✨`,
    timestamp: 'Just now'
  }
];

export const FloatingStylistOrb = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wardrobe } = useWardrobe();
  const { weather } = useWeather();
  
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(SHARED_CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return getInitialMessages(user?.name);
  });

  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Hide widget if already on dedicated assistant page
  const isAssistantPage = location.pathname === '/assistant';

  // Sync to shared storage and broadcast update
  useEffect(() => {
    try {
      localStorage.setItem(SHARED_CHAT_STORAGE_KEY, JSON.stringify(messages));
      window.dispatchEvent(new CustomEvent('stylesync:chat_sync', { detail: messages }));
    } catch {}
  }, [messages]);

  // Listen for sync events from AssistantPage
  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setMessages(e.detail);
      }
    };
    window.addEventListener('stylesync:chat_sync', handleSync);
    return () => window.removeEventListener('stylesync:chat_sync', handleSync);
  }, []);

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

  const handleClearChat = () => {
    const initial = getInitialMessages(user?.name);
    setMessages(initial);
    setSelectedImage(null);
    setInput('');
    try {
      localStorage.setItem(SHARED_CHAT_STORAGE_KEY, JSON.stringify(initial));
      window.dispatchEvent(new CustomEvent('stylesync:chat_sync', { detail: initial }));
    } catch {}
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
      const userContext = {
        name: user?.name || user?.fullName || user?.username,
        email: user?.email,
        style: user?.stylePreferences?.[0] || 'Smart Casual',
        wardrobeCount: wardrobe?.length || 0,
        weather: weather?.temp ? `${weather.temp}°C ${weather.condition || ''}` : 'mild'
      };

      const backendReply = await chatApi.sendMessage(userMessage.text, history, currentImage, userContext);
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: backendReply || "I couldn't get a response. Please try again!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: "⚠️ Couldn't connect to AI backend. Please verify your backend server is active.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
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
          aria-label="Ask Syncra"
          className="w-12 h-12 rounded-full bg-[#091224] hover:bg-[#121F3A] text-white shadow-floating border border-emerald-400/30 flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-105 cursor-pointer relative group"
        >
          {isChatOpen ? (
            <X className="w-5 h-5 text-white transition-transform duration-200 rotate-90" />
          ) : (
            <div className="relative flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#091224] animate-pulse" />
            </div>
          )}

          {/* Desktop Hover Tooltip */}
          {!isChatOpen && (
            <span className="hidden lg:group-hover:block absolute right-16 bg-[#091224] text-white text-xs font-semibold px-4 py-1.5 rounded-2xl shadow-card whitespace-nowrap border border-slate-800">
              Ask Syncra 
            </span>
          )}
        </button>
      </div>

      {/* 3. INTEGRATED AI CHAT DRAWER */}
      {isChatOpen && (
        <div className="fixed inset-0 lg:inset-auto lg:bottom-22 lg:right-6 z-50 flex items-end justify-center lg:block animate-slide-up-mobile">
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs lg:hidden"
            onClick={() => setIsChatOpen(false)}
          />

          {/* Dialog Container */}
          <div className="relative w-full lg:w-96 max-h-[85dvh] lg:max-h-[540px] h-[520px] bg-white rounded-t-3xl lg:rounded-3xl shadow-floating border border-slate-200/90 flex flex-col overflow-hidden z-10">
            {/* Header */}
            <div className="px-4 py-3.5 bg-[#091224] text-white flex items-center justify-between flex-shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white">Syncra AI</h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-400">Personal Stylist</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Clear Chat Button */}
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear chat history"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChatOpen(false);
                    navigate('/assistant');
                  }}
                  title="Open Full Assistant Page"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Body */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50">
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
                        isAI ? 'bg-[#091224] text-emerald-400 border border-slate-800' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isAI ? <MessageSquare className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed space-y-2 shadow-2xs ${
                        isAI
                          ? 'bg-white border border-slate-200 text-slate-900'
                          : 'bg-[#091224] text-white font-medium border border-slate-800'
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
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-2xl border border-slate-200 w-fit shadow-2xs">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>Syncra is reviewing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200 whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ImageIcon className="w-3 h-3 text-emerald-600" />
                <span>📷 Upload Photo</span>
              </button>
              <button
                type="button"
                onClick={() => handleSend(`What should I wear today in ${weather.city || 'my city'} for ${weather.temp}°C ${weather.condition}?`)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-lg border border-slate-200 whitespace-nowrap transition-colors"
              >
                ☀️ Today's Look ({weather.temp || 22}°C)
              </button>
              <button
                type="button"
                onClick={() => handleSend('Will minimal white sneakers match my wardrobe?')}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-lg border border-slate-200 whitespace-nowrap transition-colors"
              >
                👟 White Sneakers
              </button>
            </div>

            {/* Preview image thumbnail above input if selected */}
            {selectedImage && (
              <div className="px-3 pt-2 bg-white flex items-center gap-2">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50/50 flex-shrink-0">
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
                placeholder={selectedImage ? "Ask Syncra about this photo..." : "Ask Syncra or upload photo..."}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-emerald-500 focus:bg-white"
              />

              <button
                type="submit"
                disabled={!input.trim() && !selectedImage}
                className="p-2 bg-[#091224] hover:bg-[#121F3A] disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer flex-shrink-0 shadow-2xs flex items-center justify-center"
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
