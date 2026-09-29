import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  User,
  Sparkles,
  RefreshCw,
  X,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { useWeather } from '../context/WeatherContext';
import { chatApi } from '../api/chatApi';

const SHARED_CHAT_STORAGE_KEY = 'stylesync_syncra_messages';

const getInitialMessages = (name) => [
  {
    id: 'msg_welcome',
    sender: 'ai',
    text: `Hey ${name ? name.split(' ')[0] : 'there'}! I'm **Syncra**, your personal stylist. What are we styling today? ✨`,
    timestamp: 'Just now'
  }
];

export const AssistantPage = () => {
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

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const promptPills = [
    '📷 Check my photo',
    'Will minimal white sneakers work with my wardrobe?',
    'What should I buy next to fill wardrobe gaps?',
    'What should I wear today?',
    'Which color palette suits my existing items best?'
  ];

  // Sync to shared localStorage and notify other instances
  useEffect(() => {
    try {
      localStorage.setItem(SHARED_CHAT_STORAGE_KEY, JSON.stringify(messages));
      window.dispatchEvent(new CustomEvent('stylesync:chat_sync', { detail: messages }));
    } catch {}
  }, [messages]);

  // Listen for sync events from floating widget
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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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

  const handleResetChat = () => {
    const initial = getInitialMessages(user?.name);
    setMessages(initial);
    setSelectedImage(null);
    setInputText('');
    try {
      localStorage.setItem(SHARED_CHAT_STORAGE_KEY, JSON.stringify(initial));
      window.dispatchEvent(new CustomEvent('stylesync:chat_sync', { detail: initial }));
    } catch {}
  };

  const handleSend = async (textToSend = null) => {
    if (textToSend === '📷 Check my photo') {
      fileInputRef.current?.click();
      return;
    }

    const query = typeof textToSend === 'string' ? textToSend : inputText;
    const currentImage = selectedImage;

    if (!query.trim() && !currentImage) return;

    const userMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: query || (currentImage ? 'Should I buy this item? Does it match my wardrobe?' : ''),
      image: currentImage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      // Build short history for backend AI
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

      const aiMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: backendReply || "I couldn't process that response. Please try asking again!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: "⚠️ Sorry, there was an issue connecting to the AI stylist. Please make sure your backend is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden animate-fade-in">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Assistant Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#091224] text-emerald-400 flex items-center justify-center font-bold shadow-2xs border border-slate-800">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Syncra — AI Stylist</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Instant outfit pairings &amp; smart style advice</p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-2xl ${
                isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-2xs ${
                  isAI
                    ? 'bg-[#091224] text-emerald-400 border border-slate-800'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isAI ? <MessageSquare className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isAI
                    ? 'bg-white border border-slate-200 text-slate-900'
                    : 'bg-[#091224] text-white font-medium border border-slate-800'
                }`}
              >
                {/* Render uploaded image if present */}
                {msg.image && (
                  <div className="rounded-2xl overflow-hidden max-h-56 border border-white/20 bg-black/10 mb-2">
                    <img
                      src={msg.image}
                      alt="Uploaded item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br />')
                  }}
                />
                <span
                  className={`block text-[10px] mt-1.5 font-medium ${
                    isAI ? 'text-slate-400' : 'text-slate-400 text-right'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3 max-w-2xl">
            <div className="w-8 h-8 rounded-2xl bg-[#091224] text-emerald-400 flex items-center justify-center shadow-2xs border border-slate-800">
              <MessageSquare className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-1.5 text-xs text-slate-600 font-medium shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
              <span>Syncra is reviewing your look...</span>
              <span className="flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-200" />
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0 font-mono">
          Quick Ask:
        </span>
        {promptPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(pill)}
            className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap transition-colors shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Selected Image Preview before sending */}
      {selectedImage && (
        <div className="px-4 py-2.5 bg-emerald-50/80 border-t border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-200 bg-white">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">Photo Attached</p>
              <p className="text-[11px] text-emerald-600">Ready for Syncra's instant verdict</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload or Take Photo"
          className="p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200 bg-slate-50"
        >
          <Camera className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline text-xs font-semibold text-slate-800">Add Photo</span>
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={selectedImage ? "Ask Syncra about this photo..." : "Ask Syncra a question or upload an outfit photo..."}
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-slate-900 text-slate-900 placeholder:text-slate-400"
        />

        <button
          type="submit"
          disabled={!inputText.trim() && !selectedImage}
          className="p-3 bg-[#091224] hover:bg-[#121F3A] disabled:opacity-40 text-white rounded-2xl shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
        >
          <Send className="w-4 h-4 text-emerald-400" />
        </button>
      </form>
    </div>
  );
};

export default AssistantPage;
