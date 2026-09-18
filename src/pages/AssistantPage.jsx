import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Compass,
  Send,
  Paperclip,
  Image as ImageIcon,
  Bot,
  User,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { INITIAL_CHAT_MESSAGES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { chatApi } from '../api/chatApi';

export const AssistantPage = () => {
  const { user } = useAuth();
  const { wardrobe } = useWardrobe();
  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const promptPills = [
    'Will minimal white sneakers work with my wardrobe?',
    'What should I buy next to fill wardrobe gaps?',
    'I need an outfit for a corporate interview.',
    'Which color palette suits my existing items best?',
    'Should I buy a ₹18,999 suede trucker jacket or save?'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend = null) => {
    const query = typeof textToSend === 'string' ? textToSend : inputText;
    if (!query.trim()) return;

    const userMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Build history for backend AI
      const history = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text
      }));

      const backendReply = await chatApi.sendMessage(query, history);

      if (backendReply) {
        const aiMessage = {
          id: 'msg_ai_' + Date.now(),
          sender: 'ai',
          text: backendReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fallback to local stylist engine
    }

    // Local styling intelligence fallback
    setTimeout(() => {
      let aiReply = '';
      const lower = query.toLowerCase();

      if (lower.includes('sneakers') || lower.includes('white')) {
        aiReply = `Minimal white leather low-tops are a **95% style match** for your wardrobe! They pair directly with your Washed Black Selvedge Jeans, Warm Beige Chinos, and White Oxford Shirt. Since your footwear budget maxes at ₹14,000, any pair around ₹7,500 gives you a tremendous cost-per-wear under ₹40/day. 🟢 **Recommendation: BUY.**`;
      } else if (lower.includes('gaps') || lower.includes('buy next')) {
        aiReply = `Looking at your ${wardrobe.length} wardrobe pieces, your main gap is **transitional knitwear** and **smart-casual footwear**. You currently have 4 neutral tops and 2 bottoms, but only 1 pair of versatile boots. A clean minimal sneaker or a charcoal merino cardigan would unlock 6+ new outfit combinations.`;
      } else if (lower.includes('interview') || lower.includes('corporate')) {
        aiReply = `For a formal/smart-casual interview, wear your **White Oxford Shirt** tucked into your **Pleated Tapered Chinos (Beige)**, finished with the **Suede Chelsea Boots** and your **Seiko Steel Chronograph Watch**. This delivers clean, sharp, intentional proportions with a 94% Outfit Harmony score.`;
      } else if (lower.includes('color') || lower.includes('palette')) {
        aiReply = `Your core capsule is anchored in **Black, White, Beige, Navy, and Olive Green**. We advise steering clear of neon/hot pink tones as they clash with your neutral foundations. Earthy tones (camel, tobacco, charcoal) will integrate with 100% of your wardrobe.`;
      } else if (lower.includes('suede') || lower.includes('jacket') || lower.includes('save')) {
        aiReply = `The suede western trucker jacket looks fantastic (74/100 score), but at ₹18,999 it exceeds your monthly clothing ceiling by ~40%. 🟡 **Recommendation: MAYBE / WAIT.** We recommend waiting for seasonal sales or opting for a cotton twill harrington around ₹5,990.`;
      } else {
        aiReply = `Based on your style profile (${user?.stylePreferences?.join(', ') || 'Minimal, Smart Casual'}), this item fits well within your daily rotation. Check the care label and ensure it matches at least 3 pieces already in your wardrobe before purchasing!`;
      }

      const aiMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden animate-fade-in">
      {/* Assistant Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold shadow-sm">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Ask StyleSync</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Personal AI Stylist & Shopping Advisor</p>
          </div>
        </div>

        <button
          onClick={() => setMessages(INITIAL_CHAT_MESSAGES)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-subtle ${
                  isAI
                    ? 'bg-[#FAFAF9] border border-slate-200/80 text-slate-800'
                    : 'bg-slate-900 text-white font-medium'
                }`}
              >
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
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>StyleSync is analyzing your wardrobe rules</span>
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
          Suggested:
        </span>
        {promptPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(pill)}
            className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700 whitespace-nowrap transition-colors shadow-2xs"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask anything (e.g. 'Will these sunglasses suit my face shape?')..."
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all active:scale-95"
        >
          <Send className="w-4 h-4 text-emerald-400" />
        </button>
      </form>
    </div>
  );
};
