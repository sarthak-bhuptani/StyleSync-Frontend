import { Shirt, Layers, ShoppingBag, Sun, Sparkles } from 'lucide-react';

export const CATEGORY_DEFINITIONS = [
  {
    id: 'Tops',
    label: 'Tops & Shirts',
    shortLabel: 'Tops',
    icon: Shirt,
    desc: 'T-shirts, shirts, polos, sweaters & blouses',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 'Bottoms',
    label: 'Pants & Bottoms',
    shortLabel: 'Bottoms',
    icon: Layers,
    desc: 'Jeans, chinos, trousers, shorts & joggers',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'Shoes',
    label: 'Shoes & Footwear',
    shortLabel: 'Shoes',
    icon: ShoppingBag,
    desc: 'Sneakers, boots, loafers & formal shoes',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    id: 'Outerwear',
    label: 'Outerwear & Layers',
    shortLabel: 'Outerwear',
    icon: Sun,
    desc: 'Jackets, coats, blazers & hoodies',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    id: 'Accessories',
    label: 'Accessories & Extras',
    shortLabel: 'Accessories',
    icon: Sparkles,
    desc: 'Watches, bags, eyewear, belts & caps',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
  }
];

export const getCanonicalCategory = (itemOrCat) => {
  if (!itemOrCat) return 'Tops';
  const text =
    typeof itemOrCat === 'string'
      ? itemOrCat.toLowerCase()
      : `${itemOrCat.category || ''} ${itemOrCat.subcategory || ''} ${itemOrCat.name || ''}`.toLowerCase();

  // 1. Bottoms
  if (
    text.includes('pant') ||
    text.includes('jean') ||
    text.includes('trouser') ||
    text.includes('chino') ||
    text.includes('short') ||
    text.includes('cargo') ||
    text.includes('bottom') ||
    text.includes('jogger') ||
    text.includes('skirt') ||
    text.includes('legging') ||
    text.includes('trackpant') ||
    text.includes('sweatpant')
  ) {
    return 'Bottoms';
  }

  // 2. Shoes
  if (
    text.includes('shoe') ||
    text.includes('sneaker') ||
    text.includes('boot') ||
    text.includes('footwear') ||
    text.includes('loafer') ||
    text.includes('sandal') ||
    text.includes('slide') ||
    text.includes('trainer') ||
    text.includes('heel') ||
    text.includes('oxford') ||
    text.includes('derby')
  ) {
    return 'Shoes';
  }

  // 3. Outerwear
  if (
    text.includes('outer') ||
    text.includes('jacket') ||
    text.includes('coat') ||
    text.includes('blazer') ||
    text.includes('hoodie') ||
    text.includes('overcoat') ||
    text.includes('parka') ||
    text.includes('cardigan') ||
    text.includes('windbreaker') ||
    text.includes('trench') ||
    text.includes('bomber') ||
    text.includes('puffer') ||
    text.includes('vest')
  ) {
    return 'Outerwear';
  }

  // 4. Tops
  if (
    text.includes('top') ||
    text.includes('shirt') ||
    text.includes('tee') ||
    text.includes('t-shirt') ||
    text.includes('polo') ||
    text.includes('blouse') ||
    text.includes('kurta') ||
    text.includes('sweater') ||
    text.includes('tank') ||
    text.includes('henley') ||
    text.includes('flannel') ||
    text.includes('jersey')
  ) {
    return 'Tops';
  }

  // 5. Accessories
  if (
    text.includes('glass') ||
    text.includes('watch') ||
    text.includes('belt') ||
    text.includes('bag') ||
    text.includes('hat') ||
    text.includes('cap') ||
    text.includes('wallet') ||
    text.includes('accessory') ||
    text.includes('accessories') ||
    text.includes('eyewear') ||
    text.includes('tie') ||
    text.includes('scarf') ||
    text.includes('ring') ||
    text.includes('chain') ||
    text.includes('bracelet')
  ) {
    return 'Accessories';
  }

  return 'Tops';
};
