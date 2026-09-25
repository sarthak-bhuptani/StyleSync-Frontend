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

const getInitialMessages = (name) => [
  {
    id: 'msg_welcome',
    sender: 'ai',
    text: `Hey ${name ? name.split(' ')[0] : 'there'}! I'm your StyleSync personal stylist. Ask me any style question or **upload a photo** of any item to get an instant **BUY or PASS** verdict!`,
    timestamp: 'Just now'
  }
];

export const AssistantPage = () => {
  const { user } = useAuth();
  const { wardrobe } = useWardrobe();
  const { weather } = useWeather();

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('stylesync_assistant_messages');
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

  useEffect(() => {
    try {
      localStorage.setItem('stylesync_assistant_messages', JSON.stringify(messages));
    } catch {}
  }, [messages]);

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
    setMessages(getInitialMessages(user?.name));
    setSelectedImage(null);
    setInputText('');
    try {
      localStorage.removeItem('stylesync_assistant_messages');
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

      const backendReply = await chatApi.sendMessage(userMessage.text, history, currentImage);

      if (backendReply) {
        const aiMessage = {
          id: 'msg_ai_' + Date.now(),
          sender: 'ai',
          text: backendReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fallback to local stylist engine
    }

    // Local styling intelligence fallback with simple, punchy, everyday language
    setTimeout(() => {
      let aiReply = '';
      if (currentImage) {
        aiReply = `🟢 **BUY — Great Choice!**\n\nThis piece fits your ${user?.stylePreferences?.[0] || 'Smart Casual'} aesthetic nicely. It will pair effortlessly with your dark denim, neutral chinos, and basic tees. Simple and versatile!`;
      } else {
        const lower = (query || '').toLowerCase();

        if (lower.includes('sneakers') || lower.includes('white')) {
          aiReply = `🟢 **BUY.** Clean white sneakers go with 90%+ of your wardrobe. Pair them with straight-leg jeans, chinos, and casual shirts.`;
        } else if (lower.includes('today') || lower.includes('wear') || lower.includes('weather')) {
          aiReply = `For today's ${weather?.temp ? `${weather.temp}°C ${weather.label || ''}` : 'weather'}, wear a crisp Oxford shirt with rolled sleeves, slim beige chinos, and clean low-top sneakers.`;
        } else if (lower.includes('gaps') || lower.includes('buy next')) {
          aiReply = `Your biggest wardrobe gaps are **versatile footwear** (like clean leather boots or white sneakers) and a **lightweight layering jacket** (like an olive overshirt).`;
        } else if (lower.includes('color') || lower.includes('palette')) {
          aiReply = `Stick to neutral classics: **Navy, Charcoal, White, Olive, and Beige**. They mix and match together easily without clashing.`;
        } else {
          aiReply = `That matches your ${user?.stylePreferences?.[0] || 'Smart Casual'} profile well and gives you multiple easy outfit combinations with your ${wardrobe?.length || 10} wardrobe staples!`;
        }
      }

      const aiMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden animate-fade-in">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Assistant Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold shadow-sm">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Your AI Personal Stylist</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Simple style advice &amp; instant photo evaluations</p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAFAF9]">
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
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isAI
                    ? 'bg-slate-900 text-emerald-400 shadow-xs'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isAI ? <MessageSquare className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-subtle ${
                  isAI
                    ? 'bg-white border border-slate-200/80 text-slate-800'
                    : 'bg-slate-900 text-white font-medium'
                }`}
              >
                {/* Render uploaded image if present */}
                {msg.image && (
                  <div className="rounded-xl overflow-hidden max-h-56 border border-white/20 bg-black/10 mb-2">
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
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-1.5 text-xs text-slate-600 font-medium shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span>Stylist is reviewing your look...</span>
              <span className="flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
          Quick Ask:
        </span>
        {promptPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(pill)}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700 whitespace-nowrap transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Selected Image Preview before sending */}
      {selectedImage && (
        <div className="px-4 py-2 bg-emerald-50/70 border-t border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-200 bg-white">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900">Photo Attached</p>
              <p className="text-[11px] text-emerald-700">Ready for instant AI styling verdict</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="p-1.5 rounded-full hover:bg-emerald-200/60 text-emerald-800 transition-colors"
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
          className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200/80 bg-slate-50"
        >
          <Camera className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline text-xs font-semibold text-slate-700">Add Photo</span>
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={selectedImage ? "Ask about this photo (e.g. 'Should I buy this?') or press send..." : "Ask a simple question or upload an outfit photo..."}
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
        />

        <button
          type="submit"
          disabled={!inputText.trim() && !selectedImage}
          className="p-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Send className="w-4 h-4 text-emerald-400" />
        </button>
      </form>
    </div>
  );
};

export default AssistantPage;
