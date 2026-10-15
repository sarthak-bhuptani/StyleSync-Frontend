import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Link as LinkIcon,
  Check,
  RefreshCw,
  Layers,
  Upload,
  ArrowRight,
  Plus,
  AlertCircle,
  X
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { useAuth } from '../context/AuthContext';
import { productApi } from '../api/productApi';
import { QuickModulesModal } from '../components/common/QuickModulesModal';
import { ProfileAvatarButton } from '../components/common/ProfileAvatarButton';

// Robust price parser handling formats like ₹1,999, 1,490.50, Rs. 2490, $29.99
const parsePrice = (raw) => {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === 'number') return isNaN(raw) ? 0 : Math.round(raw);
  const match = String(raw).match(/[0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?/);
  if (!match) return 0;
  const num = parseFloat(match[0].replace(/,/g, ''));
  return isNaN(num) ? 0 : Math.round(num);
};

const CATEGORY_DEFAULT_IMAGES = {
  Tops: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
  Bottoms: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
  Outerwear: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
  Shoes: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
  Accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
};

// Comprehensive product & wardrobe dynamic harmony analyzer
const analyzeInputItem = (rawInput, userWardrobe = []) => {
  const str = String(rawInput || '').toLowerCase();
  
  // 1. Detect Category
  let category = 'Tops';
  if (['shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'boots', 'loafer', 'loafers', 'derby', 'slide', 'slides', 'oxford'].some(k => str.includes(k))) {
    category = 'Shoes';
  } else if (['pant', 'pants', 'trouser', 'trousers', 'jeans', 'denim', 'shorts', 'chino', 'chinos', 'cargo'].some(k => str.includes(k))) {
    category = 'Bottoms';
  } else if (['jacket', 'coat', 'blazer', 'overshirt', 'outerwear', 'bomber', 'cardigan', 'hoodie', 'sweater', 'fleece', 'parka', 'trench'].some(k => str.includes(k))) {
    category = 'Outerwear';
  } else if (['shirt', 't-shirt', 'tshirt', 'tee', 'top', 'polo', 'knit', 'blouse', 'tank'].some(k => str.includes(k))) {
    category = 'Tops';
  } else if (['watch', 'bag', 'tote', 'belt', 'cap', 'hat', 'sunglasses', 'scarf', 'jewelry'].some(k => str.includes(k))) {
    category = 'Accessories';
  }

  // 2. Detect Color
  const colors = ['black', 'white', 'olive', 'navy', 'beige', 'brown', 'grey', 'gray', 'cream', 'blue', 'green', 'khaki', 'tan', 'burgundy', 'charcoal'];
  const matchedColor = colors.find(c => str.includes(c)) || 'Neutral';
  const colorFormatted = matchedColor.charAt(0).toUpperCase() + matchedColor.slice(1);

  // 3. Detect Brand
  let brand = 'Store Retailer';
  if (str.includes('zara')) brand = 'Zara';
  else if (str.includes('hm') || str.includes('h&m')) brand = 'H&M';
  else if (str.includes('uniqlo')) brand = 'Uniqlo';
  else if (str.includes('nike')) brand = 'Nike';
  else if (str.includes('myntra')) brand = 'Myntra';
  else if (str.includes('snitch')) brand = 'Snitch';
  else if (str.includes('mango')) brand = 'Mango';
  else if (str.includes('asos')) brand = 'ASOS';
  else if (str.includes('levis') || str.includes("levi's")) brand = "Levi's";
  else if (str.includes('adidas')) brand = 'Adidas';

  // 4. Calculate REAL compatibility with user's closet pieces
  const list = Array.isArray(userWardrobe) ? userWardrobe : [];
  let compatibleWardrobePieces = [];

  if (category === 'Tops') {
    compatibleWardrobePieces = list.filter(w => ['bottoms', 'shoes', 'outerwear', 'pants', 'trousers', 'jeans'].some(c => (w.category || '').toLowerCase().includes(c)));
  } else if (category === 'Bottoms') {
    compatibleWardrobePieces = list.filter(w => ['tops', 'shoes', 'outerwear', 'shirts', 't-shirt'].some(c => (w.category || '').toLowerCase().includes(c)));
  } else if (category === 'Outerwear') {
    compatibleWardrobePieces = list.filter(w => ['tops', 'bottoms', 'shirt', 'jeans', 'trousers'].some(c => (w.category || '').toLowerCase().includes(c)));
  } else if (category === 'Shoes') {
    compatibleWardrobePieces = list.filter(w => ['bottoms', 'tops', 'pants', 'jeans'].some(c => (w.category || '').toLowerCase().includes(c)));
  } else {
    compatibleWardrobePieces = list;
  }

  const compCount = Math.max(1, compatibleWardrobePieces.length);
  const possibleOutfits = Math.max(2, Math.round(compCount * (category === 'Shoes' ? 1.4 : 1.1)));

  // 5. Dynamic Harmony Score based on real closet composition
  const existingSameCategory = list.filter(w => (w.category || '').toLowerCase().includes(category.toLowerCase())).length;
  let dynamicScore = 84;
  if (existingSameCategory === 0) {
    dynamicScore = 94; // Fills an empty gap in closet
  } else if (existingSameCategory === 1) {
    dynamicScore = 89; // Great second foundation piece
  } else if (existingSameCategory >= 5) {
    dynamicScore = 72; // Diminishing return - already has many of this type
  } else {
    dynamicScore = 82 + ((compCount % 7) - 2);
  }

  // 6. Dynamic tailored reasons mentioning real wardrobe pieces
  const sampleMatch = compatibleWardrobePieces[0]?.name;
  const sampleMatch2 = compatibleWardrobePieces[1]?.name;

  let reasons = [];
  if (sampleMatch && sampleMatch2) {
    reasons.push(`Directly pairs with your "${sampleMatch}" & "${sampleMatch2}"`);
  } else if (sampleMatch) {
    reasons.push(`Directly complements your "${sampleMatch}"`);
  } else {
    reasons.push(`Solid versatile base that works across ${compCount} closet items`);
  }

  if (existingSameCategory === 0) {
    reasons.push(`Fills a missing ${category} capsule foundation in your wardrobe`);
  } else if (existingSameCategory <= 2) {
    reasons.push(`Reinforces your ${category} rotation in a clean ${colorFormatted} tone`);
  } else {
    reasons.push(`Distinct silhouette from your ${existingSameCategory} existing ${category} pieces`);
  }

  if (category === 'Outerwear') {
    reasons.push('Elevates transitional layering over everyday tees and knits');
  } else if (category === 'Shoes') {
    reasons.push('Anchors relaxed trousers and casual denim with balanced proportions');
  } else if (category === 'Bottoms') {
    reasons.push('High rotational utility across both casual and smart-casual styling');
  } else {
    reasons.push('Versatile color harmony that integrates into core weekly outfits');
  }

  let grade = 'STRONG MATCH';
  if (dynamicScore >= 90) grade = 'EXCELLENT MATCH';
  else if (dynamicScore >= 80) grade = 'STRONG MATCH';
  else if (dynamicScore >= 70) grade = 'GOOD PAIRING';
  else grade = 'CONSIDER ALTERNATIVES';

  return {
    category,
    color: colorFormatted,
    brand,
    dynamicScore,
    grade,
    compatibleCount: compCount,
    possibleOutfits,
    reasons,
    fallbackImage: CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES.Tops
  };
};

export const ProductAdvisorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wardrobe, analyzedProducts, showToast } = useWardrobe();
  const { user } = useAuth();

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    navigate('/dashboard');
  };

  const [modulesModalOpen, setModulesModalOpen] = useState(false);
  const [productUrl, setProductUrl] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [inputError, setInputError] = useState('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Evaluated product loaded ONLY from real passed state or real previous API analysis
  const [evaluatedProduct, setEvaluatedProduct] = useState(() => {
    if (location.state?.initialProduct) return location.state.initialProduct;
    if (Array.isArray(analyzedProducts) && analyzedProducts.length > 0) {
      return analyzedProducts[0];
    }
    return null;
  });

  const initial = (user?.name?.trim()?.[0] || user?.username?.trim()?.[0] || 'S').toUpperCase();

  // Dynamic compatibility stats based on real user wardrobe from API
  const compatibleCount = useMemo(() => {
    if (evaluatedProduct?.compatibleCount) {
      return evaluatedProduct.compatibleCount;
    }
    if (!wardrobe || wardrobe.length === 0) return 0;
    return Math.max(1, Math.min(wardrobe.length, Math.round(wardrobe.length * 0.75)));
  }, [wardrobe, evaluatedProduct]);

  const possibleOutfits = useMemo(() => {
    if (evaluatedProduct?.possibleOutfits) {
      return evaluatedProduct.possibleOutfits;
    }
    return Math.max(2, Math.round(compatibleCount * 1.2));
  }, [compatibleCount, evaluatedProduct]);

  // Synchronized Cost-Per-Wear strictly based on evaluated product price
  const estCostPerWear = useMemo(() => {
    const price = Number(evaluatedProduct?.price || 0);
    if (!price || price <= 0) return 0;
    return Math.max(1, Math.round(price / 20));
  }, [evaluatedProduct?.price]);

  const handleSaveEditedPrice = () => {
    const num = Number(editPriceValue);
    if (num > 0) {
      setEvaluatedProduct(prev => {
        if (!prev) return prev;
        const updated = { ...prev, price: num, isPriceEstimated: false };
        try {
          const stored = JSON.parse(localStorage.getItem('stylesync_analyzed_products') || '[]');
          const updatedList = stored.map(p => (p.id === updated.id || p.name === updated.name) ? { ...p, price: num, isPriceEstimated: false } : p);
          localStorage.setItem('stylesync_analyzed_products', JSON.stringify(updatedList));
        } catch {}
        return updated;
      });
      if (showToast) showToast(`Price updated to ₹${num.toLocaleString()}!`, 'success');
    }
    setIsEditingPrice(false);
  };

  // Handle URL Link Analysis with API
  const handleAnalyzeLink = async (e) => {
    e.preventDefault();
    setInputError('');
    let input = productUrl.trim();
    if (!input) {
      setInputError('Please paste a fashion product link or item name');
      return;
    }

    let isWebUrl = input.startsWith('http://') || input.startsWith('https://');

    // Resolve Google redirect / ad / shopping URLs if pasted
    if (isWebUrl) {
      try {
        const parsedUrl = new URL(input);
        const host = parsedUrl.hostname.toLowerCase();

        // If it's a Google ad/shopping/search redirect (google.com/aclk, google.com/url, etc.)
        if (host.includes('google.')) {
          // Check for &adurl= or &url= in the raw string first to preserve full target destination
          const adurlIdx = input.indexOf('adurl=');
          const urlIdx = input.indexOf('url=');
          if (adurlIdx !== -1) {
            try {
              input = decodeURIComponent(input.substring(adurlIdx + 6));
            } catch {
              input = input.substring(adurlIdx + 6);
            }
          } else if (urlIdx !== -1 && input.substring(urlIdx + 4).startsWith('http')) {
            try {
              input = decodeURIComponent(input.substring(urlIdx + 4));
            } catch {
              input = input.substring(urlIdx + 4);
            }
          } else {
            const redirectTarget = parsedUrl.searchParams.get('adurl') || parsedUrl.searchParams.get('url');
            if (redirectTarget && (redirectTarget.startsWith('http://') || redirectTarget.startsWith('https://'))) {
              input = decodeURIComponent(redirectTarget);
            } else {
              const qParam = parsedUrl.searchParams.get('q');
              if (qParam && (qParam.startsWith('http://') || qParam.startsWith('https://'))) {
                input = decodeURIComponent(qParam);
              } else if (qParam && !parsedUrl.pathname.includes('/shopping/product/')) {
                // User searched on Google e.g. "overshirt" or "zara jacket" -> treat as item name
                input = qParam.replace(/\+/g, ' ').trim();
                isWebUrl = false;
              }
            }
          }
        }

        // Reject only strictly non-fashion platforms (e.g. Figma, GitHub, YouTube, Docs)
        const nonFashionDomains = ['figma.com', 'github.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com', 'linkedin.com', 'tiktok.com', 'netflix.com', 'spotify.com'];
        const isNonFashion = nonFashionDomains.some(d => parsedUrl.hostname.toLowerCase().includes(d));
        if (isNonFashion) {
          setInputError('Please enter a fashion store link (e.g., Zara, H&M, Myntra) or an item name (e.g., Linen Overshirt)');
          return;
        }
      } catch {
        // Fallback to text item
      }
    }

    let userEnteredPrice = productPrice.trim() ? parsePrice(productPrice) : null;

    if (!userEnteredPrice && !isWebUrl) {
      // Check for price mentioned in item title (e.g. "Zara jacket 1999" or "linen shirt ₹2499")
      const priceMatch = input.match(/(?:₹|rs\.?|inr|\$)\s*([0-9,]+(?:\.[0-9]{2})?)/i) || 
                         input.match(/\s+([1-9][0-9]{2,5})\b/);
      if (priceMatch) {
        userEnteredPrice = parsePrice(priceMatch[1]);
        input = input.replace(priceMatch[0], '').trim();
      }
    }

    setIsAnalyzing(true);
    setScrapeStatus('Connecting to store & extracting product...');
    try {
      // Extract brand and clean name from input/URL
      let detectedBrand = 'Retailer';
      let detectedName = input;
      let detectedCategory = 'Clothing';
      let detectedPrice = userEnteredPrice || 0;
      let priceNeedsConfirmation = false;
      let detectedImage = null;
      let detectedColor = '';
      let detectedDescription = '';

      if (isWebUrl) {
        // Step 1: Call Backend URL Scraper Service
        try {
          const scraped = await productApi.parseProductUrl(input);
          if (scraped && !scraped.error) {
            if (scraped.name) detectedName = scraped.name;
            if (scraped.brand) detectedBrand = scraped.brand;
            if (scraped.category) detectedCategory = scraped.category;
            const parsedScrapedPrice = parsePrice(scraped.price);
            if (!userEnteredPrice && parsedScrapedPrice > 0) {
              detectedPrice = parsedScrapedPrice;
            }
            if (scraped.image) detectedImage = scraped.image;
            if (scraped.color) detectedColor = scraped.color;
            if (scraped.description) detectedDescription = scraped.description;
          }
        } catch (scraperErr) {
          console.warn('Live scraper fallback to heuristic parsing:', scraperErr);
        }

        // Fallback brand heuristic if scraper didn't catch specific brand name
        if (detectedBrand === 'Retailer' || detectedBrand === 'Online Brand') {
          if (input.toLowerCase().includes('zara')) detectedBrand = 'Zara';
          else if (input.toLowerCase().includes('hm.com') || input.toLowerCase().includes('h&m')) detectedBrand = 'H&M';
          else if (input.toLowerCase().includes('uniqlo')) detectedBrand = 'Uniqlo';
          else if (input.toLowerCase().includes('nike')) detectedBrand = 'Nike';
          else if (input.toLowerCase().includes('myntra')) detectedBrand = 'Myntra';
          else if (input.toLowerCase().includes('amazon')) detectedBrand = 'Amazon';
          else if (input.toLowerCase().includes('asos')) detectedBrand = 'ASOS';
          else if (input.toLowerCase().includes('mango')) detectedBrand = 'Mango';
        }

        // Fallback slug cleaner if name was still raw URL
        if (detectedName.startsWith('http')) {
          try {
            const urlObj = new URL(input);
            const pathSegments = urlObj.pathname.split('/').filter(Boolean);
            const lastSegment = pathSegments[pathSegments.length - 1] || pathSegments[pathSegments.length - 2] || 'Clothing Item';
            detectedName = decodeURIComponent(lastSegment)
              .replace(/[-_]/g, ' ')
              .replace(/\.html?$/i, '')
              .replace(/[0-9]+/g, '')
              .trim();
            detectedName = detectedName.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || `${detectedBrand} Piece`;
          } catch {
            detectedName = `${detectedBrand} Piece`;
          }
        }
      } else {
        // Plain text item input (e.g. "Uniqlo Linen Shirt")
        if (input.toLowerCase().includes('zara')) detectedBrand = 'Zara';
        else if (input.toLowerCase().includes('h&m')) detectedBrand = 'H&M';
        else if (input.toLowerCase().includes('uniqlo')) detectedBrand = 'Uniqlo';
        else if (input.toLowerCase().includes('nike')) detectedBrand = 'Nike';
        else if (input.toLowerCase().includes('snitch')) detectedBrand = 'Snitch';
      }

      // Infer category from name keywords if still generic
      const nameLower = detectedName.toLowerCase();
      if (['shirt', 't-shirt', 'tshirt', 'top', 'polo', 'hoodie', 'sweater', 'blouse'].some(k => nameLower.includes(k))) {
        detectedCategory = 'Tops';
      } else if (['pant', 'pants', 'trouser', 'trousers', 'jeans', 'shorts', 'chino'].some(k => nameLower.includes(k))) {
        detectedCategory = 'Bottoms';
      } else if (['jacket', 'coat', 'overshirt', 'blazer', 'outerwear', 'bomber'].some(k => nameLower.includes(k))) {
        detectedCategory = 'Outerwear';
      } else if (['shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'boots', 'loafer'].some(k => nameLower.includes(k))) {
        detectedCategory = 'Shoes';
      }

      // If price couldn't be extracted because store blocks automated bot scraping
      if (!detectedPrice || detectedPrice <= 0) {
        detectedPrice = 1990;
        priceNeedsConfirmation = !userEnteredPrice;
      }

      setScrapeStatus('AI evaluating against your wardrobe & physical traits...');

      const result = await productApi.analyzeProduct({
        url: input,
        name: detectedName,
        brand: detectedBrand,
        category: detectedCategory,
        price: detectedPrice,
        image: detectedImage || '',
        color: detectedColor,
        description: detectedDescription,
        wardrobeItems: wardrobe
      });

      // Generate dynamic tailored evaluation specifically for this product & closet
      const dynamicAnalysis = analyzeInputItem(detectedName + ' ' + input, wardrobe);

      setEvaluatedProduct({
        brand: detectedBrand !== 'Retailer' ? detectedBrand : dynamicAnalysis.brand,
        name: detectedName,
        price: detectedPrice,
        isPriceEstimated: priceNeedsConfirmation,
        image: detectedImage || (result?.image && !result.image.includes('placeholder') ? result.image : dynamicAnalysis.fallbackImage),
        category: detectedCategory !== 'Clothing' ? detectedCategory : dynamicAnalysis.category,
        matchScore: result?.score && result.score !== 86 ? result.score : dynamicAnalysis.dynamicScore,
        matchGrade: dynamicAnalysis.grade,
        compatibleCount: dynamicAnalysis.compatibleCount,
        possibleOutfits: dynamicAnalysis.possibleOutfits,
        reasons: dynamicAnalysis.reasons
      });
      if (showToast) showToast('Product parsed & evaluated!', 'success');
    } catch (err) {
      console.warn('Analysis error:', err);
      setInputError(err.message || 'Could not evaluate link. Please check the URL.');
    } finally {
      setIsAnalyzing(false);
      setScrapeStatus('');
    }
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(true);
    if (showToast) {
      showToast(`Added "${evaluatedProduct.name}" to your wishlist!`, 'success');
    }
  };

  const handleViewOutfits = () => {
    navigate('/daily-stylist');
  };

  return (
    <div className="max-w-md mx-auto px-1 sm:px-2 animate-fade-in pb-1 text-[#1A1D1A]">
      {/* 1. Header: < Should I buy this? [S] matching Image 2 */}
      <div className="flex items-start justify-between pt-2 pb-1">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            className="p-1 -ml-1 text-[#1A1D1A] hover:opacity-75 rounded-full active:scale-95 cursor-pointer mt-0.5"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A1D1A] tracking-tight">
              Should I buy this?
            </h1>
            <p className="text-xs text-[#717670] font-normal mt-0.5">
              See how a new piece fits your wardrobe.
            </p>
          </div>
        </div>

        {/* Unified Profile Avatar Button */}
        <ProfileAvatarButton />
      </div>

      {/* 2. Product Link Input + Optional Price + Analyze Button */}
      <form onSubmit={handleAnalyzeLink} className="space-y-2.5 my-4">
        <div className={`bg-white rounded-2xl border ${inputError ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-[#ECE8DF]'} px-4 py-3.5 flex items-center gap-2.5 shadow-2xs transition-all`}>
          <LinkIcon className="w-4 h-4 text-[#A0A69F] shrink-0" />
          <input
            type="text"
            value={productUrl}
            onChange={(e) => {
              setProductUrl(e.target.value);
              if (inputError) setInputError('');
            }}
            placeholder="Paste product link or item name"
            className="w-full bg-transparent text-xs text-[#1A1D1A] placeholder:text-[#A0A69F] focus:outline-none"
          />
          {productUrl && (
            <button
              type="button"
              onClick={() => {
                setProductUrl('');
                setInputError('');
              }}
              className="text-[#A0A69F] hover:text-[#1A1D1A] p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Optional Price Input for accurate budgeting & cost-per-wear */}
        <div className="bg-white rounded-2xl border border-[#ECE8DF] px-4 py-3 flex items-center gap-2.5 shadow-2xs">
          <span className="text-xs font-bold text-[#A0A69F]">₹</span>
          <input
            type="text"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Item price in ₹ (optional - auto-detected if left empty)"
            className="w-full bg-transparent text-xs text-[#1A1D1A] placeholder:text-[#A0A69F] focus:outline-none"
          />
          {productPrice && (
            <button
              type="button"
              onClick={() => setProductPrice('')}
              className="text-[#A0A69F] hover:text-[#1A1D1A] p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Inline Feedback Banner */}
        {inputError && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-rose-50 border border-rose-200/70 rounded-2xl text-rose-800 text-xs animate-fade-in shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="flex-1 font-medium leading-snug">{inputError}</span>
            <button
              type="button"
              onClick={() => setInputError('')}
              className="p-1 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-100/60 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full py-3.5 px-4 bg-[#111827] hover:bg-[#030712] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white/80" />
              <span>{scrapeStatus || 'Analyzing product details...'}</span>
            </>
          ) : (
            <span>Analyze</span>
          )}
        </button>
      </form>

      {/* 3. Product Evaluation Result Card matching Image 2 */}
      {evaluatedProduct ? (
        <div className="bg-white rounded-3xl border border-[#ECE8DF] p-5 sm:p-6 shadow-2xs space-y-4 my-4 animate-fade-in">
          {/* Top Row: Left Image Container + Right Details */}
          <div className="flex items-start gap-4">
            {/* Left Large Oatmeal Image Container */}
            <div className="w-32 sm:w-36 h-36 sm:h-40 rounded-3xl bg-[#EFECE5] flex items-center justify-center p-3 shrink-0 overflow-hidden shadow-2xs">
              {evaluatedProduct.image ? (
                <img
                  src={evaluatedProduct.image}
                  alt={evaluatedProduct.name}
                  className="max-h-full max-w-full object-contain rounded-2xl"
                />
              ) : (
                <Layers className="w-10 h-10 text-[#8E968C]" />
              )}
            </div>

            {/* Right Product Details */}
            <div className="flex-1 min-w-0 space-y-1 pt-1">
              <p className="text-[11px] font-medium text-[#8E968C] uppercase tracking-wider">
                {evaluatedProduct.brand || 'BRAND'}
              </p>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#1A1D1A] leading-snug line-clamp-2">
                {evaluatedProduct.name || 'Clothing Piece'}
              </h3>
              
              {/* Editable Real Price */}
              {isEditingPrice ? (
                <div className="flex items-center gap-1.5 pt-1 animate-fade-in">
                  <span className="text-sm font-bold text-[#1A1D1A]">₹</span>
                  <input
                    type="number"
                    value={editPriceValue}
                    onChange={(e) => setEditPriceValue(e.target.value)}
                    className="w-24 px-2 py-0.5 text-xs font-bold bg-[#FAF8F5] border border-[#ECE8DF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E2E22]"
                    placeholder="Real price"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveEditedPrice}
                    className="px-2 py-1 bg-[#111827] text-white text-[10px] font-bold rounded-lg hover:bg-black cursor-pointer active:scale-95"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPrice(false)}
                    className="p-1 text-[#8E968C] hover:text-[#1A1D1A] rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                  <p className="text-base font-bold text-[#1A1D1A]">
                    ₹{Number(evaluatedProduct.price || 0).toLocaleString()}
                  </p>
                  {evaluatedProduct.isPriceEstimated && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-semibold rounded-md border border-amber-200">
                      Auto-estimated
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditPriceValue(String(evaluatedProduct.price || ''));
                      setIsEditingPrice(true);
                    }}
                    className="text-[11px] font-semibold text-[#1E2E22] hover:text-black underline cursor-pointer"
                    title="Edit price"
                  >
                    {evaluatedProduct.isPriceEstimated ? 'Change to real price' : 'Edit'}
                  </button>
                </div>
              )}

              {/* Informative notification if the store blocked automated price reading */}
              {evaluatedProduct.isPriceEstimated && (
                <p className="text-[11px] text-amber-700/90 pt-0.5 leading-snug">
                  Store blocked bot scraping. Tap <strong>Change to real price</strong> to set your exact tag.
                </p>
              )}

              <div className="pt-2">
                <span className="inline-block px-3.5 py-1.5 bg-white border border-[#ECE8DF] rounded-full text-[10px] font-bold text-[#1A1D1A] tracking-wider uppercase shadow-2xs">
                  {evaluatedProduct.matchGrade || 'STRONG MATCH'}
                </span>
              </div>
            </div>
          </div>

          {/* Compatibility Score & Micro Metrics Row */}
          <div className="flex items-center justify-between pt-1">
            {/* Left Big Score: 86 /100 */}
            <div className="flex items-baseline gap-1">
              <span className="font-serif font-bold text-5xl text-[#1A1D1A] tracking-tight">
                {evaluatedProduct.matchScore || evaluatedProduct.score || 86}
              </span>
              <span className="text-xs text-[#8E968C] font-normal">/100</span>
            </div>

            {/* Right Micro Breakdown */}
            <div className="text-right space-y-0.5">
              <p className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                {compatibleCount} compatible items
              </p>
              <p className="text-xs text-[#8E968C] font-normal">
                {possibleOutfits} possible outfits
              </p>
              <p className="text-xs text-[#8E968C] font-normal">
                ₹{estCostPerWear} estimated / wear
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#ECE8DF]" />

          {/* WHY IT MAKES SENSE Section */}
          <div className="space-y-2 pt-0.5">
            <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2.5">
              WHY IT MAKES SENSE
            </span>

            <div className="space-y-2.5 text-xs">
              {(evaluatedProduct.reasons && evaluatedProduct.reasons.length > 0 ? evaluatedProduct.reasons : [
                `Works with ${compatibleCount} wardrobe pieces`,
                'Fills a capsule foundation gap',
                'Complements your current wardrobe palette'
              ]).map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-[#1A1D1A]">
                  <Check className="w-4 h-4 text-[#3B6E48] stroke-[2.5] shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons: Add to Wishlist & View Outfits */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToWishlist}
              className="flex-1 py-3.5 px-4 bg-[#111827] hover:bg-[#030712] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              {isWishlisted ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>In Wishlist</span>
                </>
              ) : (
                <span>Add to wishlist</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleViewOutfits}
              className="flex-1 py-3.5 px-4 bg-white border border-[#ECE8DF] hover:border-[#1A1D1A]/30 text-[#1A1D1A] rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 transition-all"
            >
              View outfits
            </button>
          </div>
        </div>
      ) : (
        /* Clean Empty / Starter State */
        <div className="bg-white rounded-3xl border border-[#ECE8DF] p-8 text-center space-y-3 my-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#ECE8DF] mx-auto flex items-center justify-center text-[#1E2E22]">
            <LinkIcon className="w-5 h-5 text-[#8E968C]" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#1A1D1A]">
              Evaluate Before You Buy
            </h3>
            <p className="text-xs text-[#8E968C] mt-1 max-w-xs mx-auto leading-relaxed">
              Paste any product link above to evaluate how it pairs with your {wardrobe.length} registered pieces, estimate cost-per-wear, and unlock new outfit combinations.
            </p>
          </div>
        </div>
      )}

      {/* Quick Modules Modal */}
      <QuickModulesModal
        isOpen={modulesModalOpen}
        onClose={() => setModulesModalOpen(false)}
      />
    </div>
  );
};

export default ProductAdvisorPage;
