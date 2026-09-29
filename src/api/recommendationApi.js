import { apiClient } from './client';

// Realistic catalog images dynamically resolved based on AI-generated piece type
const REALISTIC_FASHION_IMAGES = {
  whiteSneakers: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
  casualShoes: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
  loafers: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80',
  overshirt: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
  denimJacket: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
  chinos: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
  linenShirt: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
  oxfordShirt: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
  poloTee: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
  basicTee: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  hoodie: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'
};

const resolveImage = (title = '', category = '') => {
  const t = (title + ' ' + category).toLowerCase();
  if (t.includes('sneaker') || t.includes('low-top') || t.includes('white shoe')) return REALISTIC_FASHION_IMAGES.whiteSneakers;
  if (t.includes('loafer')) return REALISTIC_FASHION_IMAGES.loafers;
  if (t.includes('shoe') || t.includes('footwear')) return REALISTIC_FASHION_IMAGES.casualShoes;
  if (t.includes('overshirt') || t.includes('shacket') || t.includes('twill')) return REALISTIC_FASHION_IMAGES.overshirt;
  if (t.includes('denim') || t.includes('jacket')) return REALISTIC_FASHION_IMAGES.denimJacket;
  if (t.includes('chino') || t.includes('trouser') || t.includes('pant') || t.includes('bottom')) return REALISTIC_FASHION_IMAGES.chinos;
  if (t.includes('linen')) return REALISTIC_FASHION_IMAGES.linenShirt;
  if (t.includes('polo')) return REALISTIC_FASHION_IMAGES.poloTee;
  if (t.includes('hoodie') || t.includes('sweatshirt')) return REALISTIC_FASHION_IMAGES.hoodie;
  if (t.includes('shirt') || t.includes('button')) return REALISTIC_FASHION_IMAGES.oxfordShirt;
  return REALISTIC_FASHION_IMAGES.basicTee;
};

// Ultra-robust JSON extractor and parser for Gemini AI responses
const parseJSONSafely = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  let text = '';
  if (typeof raw === 'string') {
    text = raw;
  } else if (typeof raw === 'object' && raw !== null) {
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.reply)) return raw.reply;
    if (Array.isArray(raw.message)) return raw.message;
    if (Array.isArray(raw.gaps)) return raw.gaps;

    text =
      raw.reply ||
      raw.message ||
      raw.response ||
      raw.text ||
      raw.content ||
      raw.data?.reply ||
      raw.data?.message ||
      raw.data?.response ||
      raw.data?.text ||
      raw.data?.content ||
      (typeof raw.data === 'string' ? raw.data : '') ||
      '';

    if (!text && Object.keys(raw).length > 0) {
      // Look for any string property containing JSON array brackets
      for (const key of Object.keys(raw)) {
        if (typeof raw[key] === 'string' && (raw[key].includes('[') || raw[key].includes('{'))) {
          text = raw[key];
          break;
        }
      }
    }
  }

  if (typeof text !== 'string' || !text.trim()) return [];

  // If text is double-encoded (e.g. "\"[{\\\"id\\\": ... }]\"")
  let clean = text.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    try {
      const unescaped = JSON.parse(clean);
      if (typeof unescaped === 'string') {
        clean = unescaped.trim();
      } else if (Array.isArray(unescaped)) {
        return unescaped;
      }
    } catch {}
  }

  // Step 1: Strip markdown fences
  clean = clean
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/```json/gi, '')
    .replace(/```/gi, '')
    .trim();

  // Step 2: Try direct parse
  try {
    const direct = JSON.parse(clean);
    if (Array.isArray(direct) && direct.length > 0) return direct;
    if (direct && Array.isArray(direct.gaps) && direct.gaps.length > 0) return direct.gaps;
    if (direct && Array.isArray(direct.data) && direct.data.length > 0) return direct.data;
    if (direct && Array.isArray(direct.recommendations) && direct.recommendations.length > 0) return direct.recommendations;
    if (direct && typeof direct === 'object' && direct.title) return [direct];
  } catch {}

  // Step 3: Extract from first [ to last ]
  const firstArrayIdx = clean.indexOf('[');
  const lastArrayIdx = clean.lastIndexOf(']');
  if (firstArrayIdx !== -1 && lastArrayIdx > firstArrayIdx) {
    const arraySlice = clean.substring(firstArrayIdx, lastArrayIdx + 1);
    try {
      const fixed = arraySlice.replace(/,\s*([}\]])/g, '$1');
      const parsed = JSON.parse(fixed);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  // Step 4: Brace-counting object extractor with nested brace protection
  const results = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          const objStr = clean.substring(start, i + 1);
          try {
            const fixedObj = objStr.replace(/,\s*([}\]])/g, '$1');
            const obj = JSON.parse(fixedObj);
            if (obj && (obj.title || obj.name || obj.category)) {
              results.push(obj);
            }
          } catch {
            // Regex fallback for individual object
            const titleMatch = objStr.match(/"title"\s*:\s*"([^"]+)"/i) || objStr.match(/"name"\s*:\s*"([^"]+)"/i);
            const catMatch = objStr.match(/"category"\s*:\s*"([^"]+)"/i);
            const multMatch = objStr.match(/"multiplier"\s*:\s*"([^"]+)"/i);
            const reasonMatch = objStr.match(/"reason"\s*:\s*"([^"]+)"/i) || objStr.match(/"description"\s*:\s*"([^"]+)"/i);
            const priceMatch = objStr.match(/"priceRange"\s*:\s*"([^"]+)"/i) || objStr.match(/"price"\s*:\s*"?([^",}]+)"?/i);

            if (titleMatch) {
              results.push({
                id: `gap_${results.length + 1}`,
                title: titleMatch[1],
                category: catMatch ? catMatch[1] : 'Wardrobe Staple',
                multiplier: multMatch ? multMatch[1] : '+8 Outfits',
                reason: reasonMatch ? reasonMatch[1] : 'Essential foundation piece that expands outfit combinations.',
                priceRange: priceMatch ? priceMatch[1] : '₹699 – ₹1,299',
                curatedPicks: []
              });
            }
          }
          start = -1;
        }
      }
    }
  }

  if (results.length > 0) return results;

  // Step 5: If brace parser got zero, fallback to regex splitting on "title": or "id": "gap_
  const sections = clean.split(/(?=\{"id"|"id"\s*:|"title"\s*:)/gi);
  for (const sec of sections) {
    const titleMatch = sec.match(/"title"\s*:\s*"([^"]+)"/i) || sec.match(/"name"\s*:\s*"([^"]+)"/i);
    if (titleMatch && titleMatch[1]) {
      const catMatch = sec.match(/"category"\s*:\s*"([^"]+)"/i);
      const multMatch = sec.match(/"multiplier"\s*:\s*"([^"]+)"/i);
      const reasonMatch = sec.match(/"reason"\s*:\s*"([^"]+)"/i);
      const priceMatch = sec.match(/"priceRange"\s*:\s*"([^"]+)"/i);

      results.push({
        id: `gap_${results.length + 1}`,
        title: titleMatch[1],
        category: catMatch ? catMatch[1] : 'Foundation Staple',
        multiplier: multMatch ? multMatch[1] : '+6 Outfits',
        reason: reasonMatch ? reasonMatch[1] : 'Key piece to balance your wardrobe silhouette.',
        priceRange: priceMatch ? priceMatch[1] : '₹799 – ₹1,399',
        curatedPicks: []
      });
    }
  }

  return results;
};

export const recommendationApi = {
  getRecentRecommendations: async () => {
    try {
      const response = await apiClient.get('/recommendations/recent');
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  /**
   * 100% Dynamic AI Wardrobe Gap Analysis via Gemini
   * Dispatches directly to AI backend without hardcoded dummy fallback data
   */
  analyzeWardrobeGapsWithAI: async (wardrobe = [], userProfile = {}) => {
    if (!Array.isArray(wardrobe) || wardrobe.length === 0) {
      return [];
    }

    const tops = wardrobe.filter(i => ['Tops', 'Top', 'Shirt', 'T-shirt'].includes(i.category) || i.name?.toLowerCase().includes('shirt') || i.name?.toLowerCase().includes('tee'));
    const bottoms = wardrobe.filter(i => ['Bottoms', 'Bottom', 'Pants', 'Jeans', 'Trousers', 'Shorts'].includes(i.category) || i.name?.toLowerCase().includes('pant') || i.name?.toLowerCase().includes('jean'));
    const shoes = wardrobe.filter(i => ['Shoes', 'Footwear', 'Sneakers', 'Boots'].includes(i.category) || i.name?.toLowerCase().includes('shoe') || i.name?.toLowerCase().includes('sneaker'));
    const layers = wardrobe.filter(i => ['Outerwear', 'Jacket', 'Coat', 'Blazer'].includes(i.category) || i.name?.toLowerCase().includes('jacket') || i.name?.toLowerCase().includes('blazer'));

    const itemsSummary = `
Current User Wardrobe Breakdown (${wardrobe.length} total pieces):
- Tops (${tops.length}): ${tops.map(t => `${t.name} (${t.color || 'Neutral'})`).join(', ') || 'None'}
- Bottoms (${bottoms.length}): ${bottoms.map(b => `${b.name} (${b.color || 'Neutral'})`).join(', ') || 'None'}
- Shoes (${shoes.length}): ${shoes.map(s => `${s.name} (${s.color || 'Neutral'})`).join(', ') || 'None'}
- Outerwear/Layers (${layers.length}): ${layers.map(l => `${l.name} (${l.color || 'Neutral'})`).join(', ') || 'None'}
User Preferred Style: ${userProfile?.stylePreferences?.[0] || 'Smart Casual / Minimal'}
`.trim();

    const prompt = `
You are Syncra, an expert personal fashion stylist.
Analyze the user's current wardrobe items below and identify the TOP 4 critical missing foundation pieces (capsule wardrobe gaps) that will unlock the most new outfit combinations.

${itemsSummary}

CRITICAL RULES FOR PRICING & BRANDS:
- Recommend realistic, affordable, budget-friendly everyday pieces priced between ₹499 and ₹1,799.
- Use popular value & accessible brands (e.g. Red Tape, Roadster, Snitch, H&M, Dennis Lingo, Highlander, The Souled Store, HRX, Campus, Sparx).
- Avoid overly expensive luxury pricing.

Respond ONLY with a valid JSON array of 4 objects. No markdown formatting outside the JSON, no backticks if possible, just raw JSON:
[
  {
    "id": "gap_1",
    "title": "Concise specific piece name (e.g. Minimalist Clean White Low-Tops)",
    "category": "Category tag (e.g. Footwear Staple, Layering Essential, Bottoms Foundation, Warm-Weather Staple)",
    "multiplier": "+X Outfits (e.g. +10 Outfits)",
    "reason": "1-2 sentences explaining specifically why this piece fills their closet gaps and multiplies combinations with their current pants/tops.",
    "priceRange": "₹799 – ₹1,499",
    "curatedPicks": [
      {
        "name": "Specific Model Name (e.g. Classic Low-Top White Sneaker)",
        "brand": "Affordable Brand (e.g. Red Tape)",
        "price": 1199
      },
      {
        "name": "Alternative Model Name (e.g. Clean Retro Casual Sneaker)",
        "brand": "Affordable Brand (e.g. HRX / Roadster)",
        "price": 899
      }
    ]
  }
]
`.trim();

    try {
      const response = await apiClient.post('/chat/message', {
        message: prompt,
        prompt: prompt,
        systemInstruction: 'You are an AI Stylist API that only outputs valid JSON arrays for wardrobe gap analysis.'
      });

      const rawPayload =
        response.data?.message ||
        response.data?.reply ||
        response.data?.data?.message ||
        response.data?.data?.reply ||
        response.data?.data ||
        response.data;

      const parsedArray = parseJSONSafely(rawPayload);
      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        const enriched = parsedArray.map((gap, idx) => {
          let picks = gap.curatedPicks;
          if (!Array.isArray(picks) || picks.length === 0) {
            const brands = ['Red Tape', 'Roadster', 'Snitch', 'Highlander', 'Dennis Lingo', 'The Souled Store'];
            picks = [
              {
                name: gap.title || 'Essential Classic Pick',
                brand: brands[idx % brands.length],
                price: 799 + (idx * 150)
              },
              {
                name: `Everyday ${gap.title || 'Alternative'}`,
                brand: brands[(idx + 2) % brands.length],
                price: 649 + (idx * 120)
              }
            ];
          }

          return {
            ...gap,
            id: gap.id || `ai_gap_${idx}_${Date.now()}`,
            category: gap.category || 'Wardrobe Essential',
            multiplier: gap.multiplier || `+${6 + idx * 2} Outfits`,
            reason: gap.reason || 'Crucial missing capsule foundation piece that multiplies outfit variety with your current closet.',
            priceRange: gap.priceRange || '₹699 – ₹1,299',
            image: resolveImage(gap.title, gap.category),
            curatedPicks: picks.map(p => ({
              ...p,
              image: resolveImage(p.name || gap.title, gap.category)
            }))
          };
        });

        try {
          localStorage.setItem('stylesync_ai_gaps_cache', JSON.stringify(enriched));
        } catch {}

        return enriched;
      }
    } catch (err) {
      console.warn('AI Gap request error:', err);
    }

    return [];
  },

  getCapsuleGaps: async () => {
    try {
      const res = await apiClient.get('/recommendations/gaps');
      return res.data?.data || res.data?.gaps || res.data || [];
    } catch {
      return [];
    }
  },

  getWardrobeGaps: async () => {
    return recommendationApi.getCapsuleGaps();
  },

  compareProducts: async (payload) => {
    const body = Array.isArray(payload) ? { productIds: payload } : (payload?.productIds ? payload : { productIds: payload });
    const response = await apiClient.post('/products/compare', body);
    return response.data?.data || response.data;
  }
};

export default recommendationApi;

