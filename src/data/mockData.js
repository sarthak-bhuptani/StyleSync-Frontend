// Clean Initial Data Structures for StyleSync Application (No dummy data)

export const INITIAL_USER = null;

export const INITIAL_WARDROBE = [];

export const SAMPLE_PRODUCTS = [];

export const INITIAL_PURCHASES = [];

export const INITIAL_BUDGET = {
  monthlyLimit: 10000,
  spentThisMonth: 0,
  currency: '₹',
  period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
  categories: [
    { name: 'Clothing', allocated: 4000, spent: 0, color: '#3B82F6' },
    { name: 'Shoes', allocated: 3000, spent: 0, color: '#10B981' },
    { name: 'Accessories & Eyewear', allocated: 2000, spent: 0, color: '#F59E0B' },
    { name: 'Other', allocated: 1000, spent: 0, color: '#8B5CF6' }
  ],
  monthlyTrend: []
};

export const INITIAL_OUTFITS = [];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg_welcome',
    sender: 'ai',
    text: "Hello! I am your StyleSync AI Personal Stylist. Before you purchase any clothes, shoes, or goggles, ask me anything about suitability, color harmony, or wardrobe versatility!",
    timestamp: 'Just now'
  }
];
