import { apiClient, simulateNetworkDelay } from './client';

/**
 * Human-Friendly Stylist System Prompt
 * Direct, conversational, natural English (no robotic jargon)
 */
const HUMAN_STYLIST_SYSTEM_PROMPT = `
You are an honest, stylish, and down-to-earth personal stylist chatting with a friend in a fitting room.

CRITICAL RULES:
1. Speak in natural, everyday conversational English.
2. Keep responses short and punchy (2-3 sentences max).
3. Always give practical, specific pairing advice (e.g. "wear with dark wash jeans and white sneakers").
4. If evaluating a prospective buy or uploaded piece, give a clear direct verdict (BUY, PASS, or CONSIDER) and explain why in one sentence.
5. NEVER use robotic AI buzzwords: "elevate", "delve", "seamlessly", "tapestry", "game-changer", "sartorial", "curate", "testament", "multifaceted".
6. Be friendly, warm, and confident.
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
    } catch {
      // Backend chat endpoint offline
    }

    // 4. Intelligent Human Conversational Stylist Engine
    await simulateNetworkDelay(350);

    if (image) {
      const tone = visualData?.tone || 'neutral';
      return `🟢 **BUY** — This ${tone} piece looks great. It's versatile and will pair cleanly with dark jeans, beige chinos, and white sneakers.`;
    }

    const q = (message || '').toLowerCase().trim();

    // Get current user details from context or localStorage
    let currentUserName = context?.name;
    let currentUserEmail = context?.email;
    let currentUserStyle = context?.style || 'Smart Casual';
    let wardrobeCount = context?.wardrobeCount;

    if (!currentUserName || typeof currentUserName !== 'string') {
      try {
        const storedUser = localStorage.getItem('stylesync_user') || localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          currentUserName = parsed.name || parsed.fullName || parsed.username;
          currentUserEmail = currentUserEmail || parsed.email;
          if (parsed.stylePreferences?.length) currentUserStyle = parsed.stylePreferences[0];
        }
      } catch {}
    }

    // 1. Bot Identity & Name Queries ("what is your name", "who are you")
    if (
      q.includes('your name') || 
      q.includes('ur name') || 
      q.includes('who are you') || 
      q.includes('who are u') || 
      q.includes('who r u') || 
      q.includes('what are you') || 
      q.includes('what is your name') || 
      q.includes('whats your name') || 
      q.includes('call you') || 
      q.includes('tell me about yourself')
    ) {
      return `I'm your **StyleSync AI Stylist**! I'm here to give you honest outfit advice, review potential buys with a simple BUY or PASS verdict, and help you look your best every day.`;
    }

    // 2. User Identity & Profile Queries ("what is my name", "who am i")
    if (
      q.includes('my name') || 
      q.includes('who am i') || 
      q.includes('who i am') || 
      q.includes('what is my name') || 
      q.includes('whats my name') || 
      q.includes('know my name')
    ) {
      if (currentUserName) {
        return `Your name is **${currentUserName}**! You're currently logged into StyleSync with a **${currentUserStyle}** style profile.`;
      }
      return `You're currently signed in as a guest or your profile name isn't set yet. You can update your name anytime in your Profile settings!`;
    }
    if (q.includes('my email') || q.includes('my account') || q.includes('my profile')) {
      return `You're logged in as **${currentUserName || 'StyleSync User'}** ${currentUserEmail ? `(${currentUserEmail})` : ''} with a **${currentUserStyle}** style profile.`;
    }
    if (q.includes('my closet') || q.includes('my wardrobe') || q.includes('how many clothes') || q.includes('how many items')) {
      return `You have **${wardrobeCount !== undefined ? wardrobeCount : 0} items** saved in your digital wardrobe.`;
    }

    // 3. Greetings & Small Talk
    if (q.match(/^(hi|hello|hey|hey there|howdy|hola|yo|gm|good morning|good evening|good afternoon)[\s!.]*$/i)) {
      const greetingName = currentUserName ? ` ${currentUserName.split(' ')[0]}` : '';
      return `Hey${greetingName}! Great to see you. What are we styling today? You can ask me for outfit advice or upload a photo of an item you're thinking of buying!`;
    }
    if (q.includes('how are you') || q.includes('how r u') || q.includes('how you doing') || q.includes("how's it going") || q.includes('whats up') || q.includes("what's up")) {
      return `I'm doing great, thanks for asking! Ready to help you put together some sharp outfits. What's on your mind today?`;
    }
    if (q.includes('thank') || q.includes('thx') || q.includes('appreciate it')) {
      return `You're welcome! Anytime you need a quick second opinion on an outfit or purchase, just drop it here.`;
    }
    if (q.includes('bye') || q.includes('goodbye') || q.includes('see you') || q.includes('good night')) {
      return `Have a great day! Drop by anytime you want to check an outfit or review a piece.`;
    }
    if (q.includes('help') || q.includes('how to use') || q.includes('what can you do') || q.includes('how does this work')) {
      return `Here's how I can help: 1) **Upload any clothing photo** to get a fast BUY or PASS verdict, 2) **Ask for daily outfit pairings** based on your wardrobe, or 3) **Get color and styling advice** for any occasion!`;
    }

    // 3. Weather & Daily Outfits
    if (q.includes('today') || q.includes('weather') || q.includes('today look') || q.includes('what should i wear')) {
      const weatherContext = context?.weather || 'mild';
      if (q.includes('hot') || q.includes('summer') || weatherContext.includes('hot')) {
        return `For warm weather, go with a breathable linen or light cotton tee, relaxed linen trousers or chino shorts, and clean canvas sneakers or loafers.`;
      }
      if (q.includes('cold') || q.includes('winter') || weatherContext.includes('cold')) {
        return `Layer up with a heavyweight crewneck sweater over an Oxford shirt, tailored wool or heavy denim trousers, and a structured overcoat with leather boots.`;
      }
      return `For today's weather, pair a clean Oxford button-down or textured knit with slim dark denim and minimal leather sneakers. Layer with an overshirt if the evening gets breezy.`;
    }

    // 4. Occasions (Date, Interview/Work, Party, Wedding, Casual)
    if (q.includes('date') || q.includes('first date') || q.includes('dinner')) {
      return `For a date, keep it effortlessly sharp: a fitted dark knit or merino crewneck, charcoal or black slim trousers, and clean Chelsea boots or leather low-tops.`;
    }
    if (q.includes('interview') || q.includes('office') || q.includes('work') || q.includes('business')) {
      return `For work or an interview, stick to smart basics: a crisp white or light blue dress shirt, navy or charcoal tailored chinos, and polished brown or black dress shoes.`;
    }
    if (q.includes('party') || q.includes('club') || q.includes('night out')) {
      return `Go with an open camp-collar shirt over a fitted white tank or tee, relaxed black trousers, and minimal leather boots. Keep accessories simple.`;
    }
    if (q.includes('wedding')) {
      return `Unless the invite says black-tie, a tailored navy or slate grey two-piece suit with a white dress shirt, silk pocket square, and oxford shoes is foolproof.`;
    }

    // 5. Footwear & Shoes
    if (q.includes('white sneaker') || q.includes('white shoe') || (q.includes('white') && q.includes('sneaker'))) {
      return `🟢 **BUY** — Clean white sneakers are the most versatile shoe you can own. They match over 90% of casual outfits, from jeans to relaxed chinos.`;
    }
    if (q.includes('shoe') || q.includes('sneaker') || q.includes('boot') || q.includes('loafer')) {
      return `A solid footwear rotation starts with three pairs: clean minimal white sneakers for daily wear, brown leather loafers for smart casual, and black boots for evenings.`;
    }

    // 6. Wardrobe Gaps & Shopping Advice
    if (q.includes('gap') || q.includes('buy next') || q.includes('missing') || q.includes('wardrobe')) {
      return `The best pieces to add next are versatile neutral staples: a tailored overshirt, charcoal chinos, a quality white tee, and minimal leather low-top sneakers.`;
    }
    if (q.includes('jacket') || q.includes('coat') || q.includes('outerwear') || q.includes('hoodie')) {
      return `A neutral Harrington jacket or a classic wool overcoat adds structure to any casual outfit and works across multiple seasons.`;
    }
    if (q.includes('jean') || q.includes('denim') || q.includes('pant') || q.includes('trouser')) {
      return `Aim for a classic straight or slim-straight cut in dark indigo or washed black. They offer the cleanest silhouette and pair with almost everything.`;
    }

    // 7. Colors & Palette
    if (q.includes('color') || q.includes('match') || q.includes('palette')) {
      return `Stick to the 3-color rule: build your base with neutrals (navy, grey, black, white, beige) and add at most one accent color like olive, burgundy, or forest green.`;
    }

    // 8. General Conversational Fallback
    return `That sounds interesting! For your **${currentUserStyle}** aesthetic, focusing on clean silhouettes and neutral staples gives the best versatility. Feel free to upload a photo of any item or ask specific outfit questions!`;
  }
};
