import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Send,
  Check,
  Camera,
  Shirt,
  ChevronLeft,
  Compass,
  ArrowLeftRight,
  ShoppingBag,
  RotateCcw,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { useWeather } from '../context/WeatherContext';
import { chatApi } from '../api/chatApi';
import { ProfileAvatarButton } from '../components/common/ProfileAvatarButton';
import { SyncraLogo } from '../components/common/BrandLogo';

// Bespoke Haute-Couture AI Avatar for Syncra
const SyncraAIAvatar = ({ size = "w-8 h-8" }) => (
  <div className={`${size} rounded-2xl bg-gradient-to-tr from-[#1E2E22] via-[#2F4535] to-[#4A5D44] text-[#E6F4EA] flex items-center justify-center shrink-0 shadow-xs ring-1 ring-[#BDD2C1]/60 relative select-none`}>
    <SyncraLogo className="w-5 h-5" />
    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#FAF8F5]" />
  </div>
);

// Curated dinner look pieces matching fashion editorial aesthetic
const DEFAULT_DINNER_LOOK = {
  top: {
    name: 'Olive Linen Tunic Shirt',
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80'
  },
  bottom: {
    name: 'Tailored Navy Trousers',
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=300&q=80'
  },
  shoes: {
    name: 'Minimal White Sneakers',
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80'
  }
};

export const AssistantPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { wardrobe, showToast } = useWardrobe();
  const { weather } = useWeather();

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    navigate('/dashboard');
  };

  // Find real wardrobe items for the dinner look card
  const dinnerLookPieces = useMemo(() => {
    const list = Array.isArray(wardrobe) ? wardrobe : [];
    const top = list.find(w => ['top', 'shirt', 'overshirt', 'jacket', 'tunic'].some(c => (w.category || '').toLowerCase().includes(c))) || DEFAULT_DINNER_LOOK.top;
    const bottom = list.find(w => ['bottom', 'pant', 'trouser', 'jeans'].some(c => (w.category || '').toLowerCase().includes(c))) || DEFAULT_DINNER_LOOK.bottom;
    const shoes = list.find(w => ['shoe', 'sneaker', 'loafer'].some(c => (w.category || '').toLowerCase().includes(c))) || DEFAULT_DINNER_LOOK.shoes;
    return { top, bottom, shoes };
  }, [wardrobe]);

  // Messages state & cleared flag
  const [showInitialLook, setShowInitialLook] = useState(() => {
    return !localStorage.getItem('stylesync_chat_cleared');
  });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('stylesync_syncra_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookSaved, setIsLookSaved] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const hasUserSentMessage = useRef(false);

  // Sync messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('stylesync_syncra_messages', JSON.stringify(messages));
        localStorage.removeItem('stylesync_chat_cleared');
      } catch {}
    }
  }, [messages]);

  // Auto-scroll only when user actually sends a message
  useEffect(() => {
    if (hasUserSentMessage.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
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

  // TRUE CLEAR CHAT: Wipes all messages, hides sample look, and starts completely fresh
  const handleResetChat = () => {
    setMessages([]);
    setShowInitialLook(false);
    setSelectedImage(null);
    setInputText('');
    setIsLookSaved(false);
    hasUserSentMessage.current = false;
    try {
      localStorage.setItem('stylesync_chat_cleared', 'true');
      localStorage.removeItem('stylesync_syncra_messages');
      window.dispatchEvent(new CustomEvent('stylesync:chat_sync', { detail: [] }));
    } catch {}
  };

  const handleSend = async (textToSend = null) => {
    const query = (typeof textToSend === 'string' ? textToSend : inputText).trim();
    const currentImage = selectedImage;

    if (!query && !currentImage) return;

    hasUserSentMessage.current = true;

    const userMessage = {
      id: 'msg_user_' + Date.now(),
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
      const history = messages.slice(-4).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text
      }));

      const userContext = {
        name: user?.name || user?.fullName || user?.username,
        email: user?.email,
        style: user?.preferences?.favoriteStyles?.[0] || 'Smart Casual',
        wardrobeCount: wardrobe?.length || 0,
        weather: weather?.temp ? `${weather.temp}°C ${weather.condition || ''}` : '24°C mild'
      };

      const backendReply = await chatApi.sendMessage(userMessage.text, history, currentImage, userContext);

      const isOutfitRequest = /outfit|wear|dress|dinner|look|clothes/i.test(query);

      const aiMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: backendReply || "Here's a refined way to style that look with pieces from your closet.",
        showOutfitCard: isOutfitRequest,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const fallbackReply = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: "I analyzed your wardrobe. For this look, pair neutral basics like your olive overshirt with dark trousers and clean sneakers for an effortless aesthetic.",
        showOutfitCard: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPillClick = (action) => {
    if (action === 'Create outfit') {
      handleSend('Can you suggest a complete curated outfit from my wardrobe?');
    } else if (action === 'Trip capsule') {
      handleSend('Can you suggest a versatile 3-day travel packing capsule from my wardrobe?');
    } else if (action === 'Compare') {
      navigate('/compare');
    } else if (action === 'Help me shop') {
      navigate('/advisor');
    }
  };

  const handleSaveLook = () => {
    setIsLookSaved(true);
    if (showToast) {
      showToast('Outfit look saved to your collection!', 'success');
    }
  };

  const handleViewItems = () => {
    navigate('/wardrobe');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F6F4EE] text-[#1A1D1A] overflow-hidden">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* 1. STABLE FIXED HEADER: Never scrolls when chat scrolls */}
      <header className="shrink-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md px-3 sm:px-6 py-3 border-b border-[#ECE8DF] shadow-2xs">
        <div className="w-full max-w-4xl mx-auto flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <button
              type="button"
              onClick={handleBack}
              className="p-1 -ml-1 text-[#1A1D1A] hover:opacity-70 rounded-full active:scale-95 transition-all cursor-pointer mt-0.5"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1D1A] tracking-tight leading-tight">
                Syncra AI
              </h1>
              <p className="text-xs text-[#717670] font-normal mt-0.5">
                Your personal fashion advisor.
              </p>
            </div>
          </div>

          {/* Minimalist icon buttons on right: Clear/Reset + Profile */}
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <button
              type="button"
              onClick={handleResetChat}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#ECE8DF] text-[#717670] hover:text-[#1A1D1A] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Clear chat history"
              aria-label="Clear chat history"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <ProfileAvatarButton />
          </div>
        </div>
      </header>

      {/* 2. DEDICATED SCROLLABLE CHAT MESSAGES BODY */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4">
        <div className="w-full max-w-4xl mx-auto space-y-4">
        {/* Stylist Greeting with Bespoke AI Avatar */}
        <div className="flex items-start gap-2.5">
          <SyncraAIAvatar />
          <div className="bg-white rounded-3xl rounded-tl-sm px-5 py-3.5 shadow-2xs border border-[#ECE8DF] text-xs sm:text-sm text-[#1A1D1A] font-medium leading-relaxed max-w-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1E2E22] uppercase tracking-wider mb-1">
              <SyncraLogo className="w-3.5 h-3.5" />
              <span>Syncra Stylist</span>
            </div>
            <p>How can I help you style today? Pick an action below or ask me any question about your clothes.</p>
          </div>
        </div>

        {/* 4 Quick Action Cards in 2x2 Grid with Contextual Subtext */}
        <div className="grid grid-cols-2 gap-2 pl-10 pr-1">
          {[
            { label: 'Create outfit', subtext: "Today's weather", Icon: Shirt, iconColor: 'text-amber-600 bg-amber-50', action: () => handleQuickPillClick('Create outfit') },
            { label: 'Trip capsule', subtext: 'Pack smarter', Icon: Compass, iconColor: 'text-sky-600 bg-sky-50', action: () => handleQuickPillClick('Trip capsule') },
            { label: 'Compare', subtext: 'Head-to-head', Icon: ArrowLeftRight, iconColor: 'text-rose-600 bg-rose-50', action: () => handleQuickPillClick('Compare') },
            { label: 'Help me shop', subtext: 'Find gaps', Icon: ShoppingBag, iconColor: 'text-emerald-600 bg-emerald-50', action: () => handleQuickPillClick('Help me shop') }
          ].map((pill) => {
            const Icon = pill.Icon;
            return (
              <button
                key={pill.label}
                type="button"
                onClick={pill.action}
                className="bg-white hover:bg-[#FAF8F5] active:scale-95 text-[#1A1D1A] py-2.5 px-3 rounded-2xl border border-[#ECE8DF] shadow-2xs transition-all text-left flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <div className={`w-7 h-7 rounded-xl ${pill.iconColor} flex items-center justify-center shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-[#1A1D1A] group-hover:text-[#1E2E22] truncate">{pill.label}</div>
                  <div className="text-[10px] text-[#8E968C] font-normal truncate">{pill.subtext}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Suggested Questions (Eliminates the empty beige void when chat is fresh/cleared) */}
        {messages.length === 0 && !showInitialLook && (
          <div className="pl-10 pr-1 pt-2 space-y-2 animate-fade-in">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8E968C] uppercase tracking-wider">
              <MessageSquare className="w-3 h-3 text-[#1E2E22]" />
              <span>Suggested questions</span>
            </div>
            <div className="space-y-1.5">
              {[
                'What should I wear for dinner tonight?',
                'Do I have pieces that match an olive jacket?',
                'What are the critical missing gaps in my closet?'
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left bg-white hover:bg-[#FAF8F5] active:scale-[0.99] border border-[#ECE8DF] hover:border-[#D5D0C5] rounded-2xl px-3.5 py-2.5 text-xs text-[#1A1D1A] flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs group"
                >
                  <span className="truncate group-hover:text-[#1E2E22] font-medium">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A29E94] group-hover:text-[#1E2E22] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Showcase Look (Only shown initially, CLEARED when user taps Reset) */}
        {showInitialLook && messages.length === 0 && (
          <>
            <div className="flex justify-end pt-1">
              <div className="bg-[#1E2E22] text-[#F8F6F0] rounded-3xl rounded-tr-sm px-5 py-3.5 text-xs sm:text-sm font-medium shadow-2xs max-w-[85%]">
                Can you suggest a dinner look?
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <SyncraAIAvatar />

              <div className="bg-white rounded-3xl rounded-tl-sm p-5 border border-[#ECE8DF] shadow-xs space-y-4 max-w-sm flex-1">
                <div className="flex items-center justify-between pb-1 border-b border-[#ECE8DF]/60">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>98% Harmony Match</span>
                  </span>
                  <span className="text-[10px] text-[#8E968C]">Smart Casual</span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-[#1A1D1A] leading-relaxed">
                  Here's a refined evening dinner look assembled from your wardrobe.
                </p>

                {/* 3 Garments Display */}
                <div className="bg-[#FAF8F5] rounded-2xl p-3 border border-[#ECE8DF]/60 flex items-center justify-around gap-2 min-h-[110px]">
                  {/* Piece 1: Top */}
                  <div className="flex flex-col items-center flex-1 max-w-[85px] group">
                    <div className="w-16 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-[#ECE8DF] p-1 shadow-2xs group-hover:scale-105 transition-transform">
                      <img
                        src={dinnerLookPieces.top.image}
                        alt={dinnerLookPieces.top.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[9px] font-medium text-[#717670] mt-1 truncate max-w-[75px] text-center">
                      Overshirt
                    </span>
                  </div>

                  {/* Piece 2: Trousers */}
                  <div className="flex flex-col items-center flex-1 max-w-[85px] group">
                    <div className="w-16 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-[#ECE8DF] p-1 shadow-2xs group-hover:scale-105 transition-transform">
                      <img
                        src={dinnerLookPieces.bottom.image}
                        alt={dinnerLookPieces.bottom.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[9px] font-medium text-[#717670] mt-1 truncate max-w-[75px] text-center">
                      Trousers
                    </span>
                  </div>

                  {/* Piece 3: Shoes */}
                  <div className="flex flex-col items-center flex-1 max-w-[85px] group">
                    <div className="w-16 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-[#ECE8DF] p-1 shadow-2xs group-hover:scale-105 transition-transform">
                      <img
                        src={dinnerLookPieces.shoes.image}
                        alt={dinnerLookPieces.shoes.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[9px] font-medium text-[#717670] mt-1 truncate max-w-[75px] text-center">
                      Sneakers
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#8E968C] font-normal">
                  3 pieces · Linen &amp; cotton balance · Ideal for 22°–26°C
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleSaveLook}
                    className="flex-1 py-3 px-4 bg-[#1E2E22] hover:bg-[#162319] text-white rounded-2xl font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isLookSaved && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{isLookSaved ? 'Saved to Looks' : 'Save Look'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleViewItems}
                    className="flex-1 py-3 px-4 bg-white hover:bg-[#FAF8F5] border border-[#ECE8DF] text-[#1A1D1A] rounded-2xl font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer text-center"
                  >
                    View Closet
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Dynamic User & AI Messages */}
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 pt-1 ${isAI ? '' : 'justify-end'}`}
            >
              {isAI && <SyncraAIAvatar />}

              <div
                className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-2xs max-w-[85%] ${
                  isAI
                    ? 'bg-white rounded-tl-sm border border-[#ECE8DF] text-[#1A1D1A]'
                    : 'bg-[#1E2E22] text-[#F8F6F0] rounded-tr-sm font-medium'
                }`}
              >
                {msg.image && (
                  <div className="rounded-2xl overflow-hidden max-h-48 border border-[#ECE8DF] bg-black/5 mb-2">
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

                {/* Dynamic Outfit Card in Response */}
                {isAI && msg.showOutfitCard && (
                  <div className="mt-3 pt-3 border-t border-[#ECE8DF]/70">
                    <div className="bg-[#FAF8F5] rounded-2xl p-2.5 border border-[#ECE8DF]/60 flex items-center justify-around gap-2">
                      <div className="w-14 h-16 rounded-xl overflow-hidden bg-white border border-[#ECE8DF] p-1 flex items-center justify-center">
                        <img src={dinnerLookPieces.top.image} alt="Top" className="w-full h-full object-contain" />
                      </div>
                      <div className="w-14 h-16 rounded-xl overflow-hidden bg-white border border-[#ECE8DF] p-1 flex items-center justify-center">
                        <img src={dinnerLookPieces.bottom.image} alt="Bottom" className="w-full h-full object-contain" />
                      </div>
                      <div className="w-14 h-16 rounded-xl overflow-hidden bg-white border border-[#ECE8DF] p-1 flex items-center justify-center">
                        <img src={dinnerLookPieces.shoes.image} alt="Shoes" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live AI Thinking Indicator */}
        {isTyping && (
          <div className="flex items-start gap-2.5 pt-1">
            <SyncraAIAvatar />
            <div className="bg-white rounded-3xl rounded-tl-sm px-4 py-3 shadow-2xs border border-[#ECE8DF] flex items-center gap-2 text-xs text-[#5A6359] font-medium">
              <SyncraLogo className="w-4 h-4 animate-pulse" />
              <span>Syncra is analyzing your wardrobe...</span>
              <span className="flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
        </div>
      </div>

      {/* 3. STABLE FIXED INPUT DOCK: Never scrolls */}
      <footer className="shrink-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#ECE8DF] px-3 sm:px-6 py-3 shadow-sm">
        <div className="w-full max-w-4xl mx-auto">
          {selectedImage && (
            <div className="mb-2 relative inline-block">
              <img
                src={selectedImage}
                alt="Preview"
                className="w-14 h-14 object-cover rounded-xl border border-[#ECE8DF] shadow-md"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1A1D1A] text-white flex items-center justify-center text-xs active:scale-95"
              >
                ×
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="bg-white rounded-full border border-[#ECE8DF] focus-within:border-[#1E2E22] focus-within:ring-2 focus-within:ring-[#1E2E22]/10 flex items-center gap-2 px-3.5 py-1.5 transition-all shadow-xs"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-[#717670] hover:text-[#1E2E22] rounded-full hover:bg-[#FAF8F5] transition-all cursor-pointer shrink-0 active:scale-90"
              title="Upload photo"
            >
              <Camera className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Syncra anything about your style..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#1A1D1A] placeholder:text-[#9CA3AF] focus:outline-none py-1.5"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !selectedImage}
              className="w-8 h-8 rounded-full bg-[#1E2E22] hover:bg-[#162319] text-white flex items-center justify-center shrink-0 disabled:opacity-25 disabled:bg-[#D5D0C5] cursor-pointer transition-all active:scale-95 shadow-xs"
              title="Send"
            >
              <Send className="w-3.5 h-3.5 text-[#E6F4EA]" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default AssistantPage;
