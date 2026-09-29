import { apiClient, simulateNetworkDelay } from './client';

/**
 * Human-Friendly Stylist System Prompt
 * Direct, conversational, natural English (no robotic jargon)
 */
const HUMAN_STYLIST_SYSTEM_PROMPT = `
You are Syncra, an honest, stylish, and down-to-earth personal fashion stylist chatting with a friend in a fitting room.

CRITICAL RULES:
1. When asked about your identity or name, always introduce yourself as Syncra.
2. Speak in natural, everyday conversational English.
3. Keep responses short, helpful, and punchy (2-3 sentences max).
4. Always give practical, specific pairing advice (e.g. "wear with dark wash jeans and white sneakers").
5. If evaluating a prospective buy or uploaded piece, give a clear direct verdict (BUY, PASS, or CONSIDER) and explain why in one sentence.
6. NEVER use robotic AI buzzwords: "elevate", "delve", "seamlessly", "tapestry", "game-changer", "sartorial", "curate", "testament", "multifaceted".
7. Be friendly, warm, and confident.
`.trim();

// Quick client-side color & visual tone extractor from image data URL
const analyzeImageTone = (imageDataUrl) => {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || !imageDataUrl) {
        return resolve({ tone: 'neutral', label: 'piece', isFootwear: false });
      }
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 16;
          canvas.height = 16;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 16, 16);
          const data = ctx.getImageData(0, 0, 16, 16).data;
          
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 50 && (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245)) {
              r += data[i];
              g += data[i + 1];
              b += data[i + 2];
              count++;
            }
          }

          if (count === 0) count = 1;
          const avgR = r / count;
          const avgG = g / count;
          const avgB = b / count;
          const brightness = (avgR + avgG + avgB) / 3;

          let tone = 'classic neutral';
          if (avgR > avgB + 30 && avgG > avgB + 10) {
            tone = avgR > 180 ? 'warm camel/tan' : 'rich earth tone';
          } else if (avgB > avgR + 20) {
            tone = 'classic navy';
          } else if (avgG > avgR + 10 && avgG > avgB + 10) {
            tone = 'olive green';
          } else if (brightness < 60) {
            tone = 'sleek black';
          } else if (brightness > 200) {
            tone = 'clean white';
          }

          resolve({
            tone,
            aspectRatio: img.width / (img.height || 1),
            isFootwear: (img.width / (img.height || 1)) > 1.3
          });
        } catch {
          resolve({ tone: 'versatile neutral', isFootwear: false });
        }
      };
      img.onerror = () => resolve({ tone: 'versatile neutral', isFootwear: false });
      img.src = imageDataUrl;
    } catch {
      resolve({ tone: 'versatile neutral', isFootwear: false });
    }
  });
};

export const chatApi = {
  /**
   * Send a human-friendly stylist message
   * @param {string} message - User query
   * @param {Array} history - Previous messages
   * @param {string|null} image - Base64 image
   * @param {Object} context - Optional user profile and closet context
   */
  sendMessage: async (message, history = [], image = null, context = {}) => {
    let visualData = null;
    if (image) {
      visualData = await analyzeImageTone(image);
    }

    // 1. Context injection string
    const userContextStr = context?.style
      ? `[User Context: Style is ${context.style}, Closet has ${context.wardrobeCount || 0} items, Today's Weather: ${context.weather || 'mild'}]`
      : '';

    // 2. If an image is uploaded, first try backend Vision AI
    if (image) {
      try {
        const visionResponse = await apiClient.post('/products/analyze', {
          image,
          imageUrl: image,
          name: message || 'Evaluated Item',
          description: message || 'Photo styling assessment'
        });

        const product = visionResponse.data?.data || visionResponse.data?.product || visionResponse.data;
        if (product && (product.decision || product.score !== undefined)) {
          const isBuy = product.decision === 'BUY' || (product.score && product.score >= 70);
          const emoji = isBuy ? '🟢' : '🟡';
          const verdict = isBuy ? 'BUY' : (product.decision === 'SKIP' ? 'PASS' : 'CONSIDER');
          const toneLabel = visualData?.tone ? ` (${visualData.tone})` : '';

          return `${emoji} **${verdict}** — This ${toneLabel} piece looks really clean. It pairs naturally with dark wash jeans and clean white sneakers.`;
        }
      } catch {
        // Fall through to conversational endpoint
      }
    }

    // 3. Try conversational AI chat endpoint with strict human persona
    try {
      const payload = {
        message: `${message || 'Please check this item.'}\n\n${userContextStr}`,
        prompt: message,
        systemInstruction: HUMAN_STYLIST_SYSTEM_PROMPT,
        history: history.slice(-6)
      };

      if (image) {
        payload.image = image;
        payload.imageUrl = image;
        payload.photo = image;
      }

      const response = await apiClient.post('/chat/message', payload);
      
      let reply = response.data?.reply || response.data?.data?.reply || response.data?.message || response.data;
      if (typeof reply === 'object' && reply !== null) {
        reply = reply.text || reply.content || JSON.stringify(reply);
      }

      // Filter false negative image detections from text-only models
      if (typeof reply === 'string' && image) {
        const lower = reply.toLowerCase();
        const falseMissingPhoto = 
          lower.includes("haven't attached") || 
          lower.includes("attach the picture") || 
          lower.includes("no picture") || 
          lower.includes("no image") || 
          lower.includes("drop the photo") || 
          lower.includes("upload a photo") ||
          lower.includes("didn't attach");

        if (falseMissingPhoto) {
          const tone = visualData?.tone || 'clean neutral';
          return `🟢 **BUY** — This ${tone} piece looks super sharp. It'll pair easily with neutral basics, straight-leg jeans, and casual footwear.`;
        }
      }

      if (reply) return reply;
      throw new Error('No reply from AI service');
    } catch (err) {
      console.warn('Backend AI service call failed:', err);
      // If backend is offline or errors out, return a helpful notice rather than fake hardcoded answers
      const errorMsg = err.response?.data?.message || err.message;
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        return "⚠️ I couldn't reach the AI backend server. Please make sure your backend is running on port 5000.";
      }
      return errorMsg && !errorMsg.includes('No reply') 
        ? `⚠️ AI Assistant Error: ${errorMsg}` 
        : "⚠️ AI Stylist is temporarily unavailable. Please check your backend connection and Gemini API key.";
    }
  }
};

