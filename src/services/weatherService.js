/**
 * StyleSync Real-Time Weather & Geolocation Service
 * Uses Open-Meteo (Free, No API Key required, Global Coverage) & Geocoding APIs
 */

// WMO Weather interpretation codes (WW)
const WMO_CODE_MAP = {
  0: { condition: 'Sunny', label: 'Clear Sky', icon: 'Sun', desc: 'Sunny and clear skies', category: 'Sunny' },
  1: { condition: 'Sunny', label: 'Mainly Clear', icon: 'Sun', desc: 'Mostly clear with plenty of sunshine', category: 'Sunny' },
  2: { condition: 'Mild', label: 'Partly Cloudy', icon: 'Cloud', desc: 'Partly cloudy with pleasant conditions', category: 'Mild' },
  3: { condition: 'Mild', label: 'Overcast', icon: 'Cloud', desc: 'Overcast skies, mild temperature', category: 'Mild' },
  45: { condition: 'Cool', label: 'Foggy', icon: 'Wind', desc: 'Dense fog and reduced visibility', category: 'Cool' },
  48: { condition: 'Cool', label: 'Depositing Rime Fog', icon: 'Wind', desc: 'Icy cold fog', category: 'Cool' },
  51: { condition: 'Rainy', label: 'Light Drizzle', icon: 'CloudRain', desc: 'Light mist & drizzle in the air', category: 'Rainy' },
  53: { condition: 'Rainy', label: 'Moderate Drizzle', icon: 'CloudRain', desc: 'Continuous drizzle', category: 'Rainy' },
  55: { condition: 'Rainy', label: 'Dense Drizzle', icon: 'CloudRain', desc: 'Heavy drizzle, damp conditions', category: 'Rainy' },
  61: { condition: 'Rainy', label: 'Slight Rain', icon: 'CloudRain', desc: 'Scattered light showers', category: 'Rainy' },
  63: { condition: 'Rainy', label: 'Moderate Rain', icon: 'CloudRain', desc: 'Steady rain showers', category: 'Rainy' },
  65: { condition: 'Rainy', label: 'Heavy Rain', icon: 'CloudRain', desc: 'Heavy monsoon downpour', category: 'Rainy' },
  71: { condition: 'Cool', label: 'Slight Snow', icon: 'Snowflake', desc: 'Light snowfall', category: 'Cool' },
  73: { condition: 'Cool', label: 'Moderate Snow', icon: 'Snowflake', desc: 'Steady snowfall', category: 'Cool' },
  75: { condition: 'Cool', label: 'Heavy Snow', icon: 'Snowflake', desc: 'Intense cold & heavy snow', category: 'Cool' },
  80: { condition: 'Rainy', label: 'Slight Showers', icon: 'CloudRain', desc: 'Passing rain showers', category: 'Rainy' },
  81: { condition: 'Rainy', label: 'Moderate Showers', icon: 'CloudRain', desc: 'Frequent rain showers', category: 'Rainy' },
  82: { condition: 'Rainy', label: 'Violent Showers', icon: 'CloudRain', desc: 'Sudden intense showers', category: 'Rainy' },
  95: { condition: 'Rainy', label: 'Thunderstorm', icon: 'Zap', desc: 'Thunderstorms with rain', category: 'Rainy' },
  96: { condition: 'Rainy', label: 'Thunderstorm with Hail', icon: 'Zap', desc: 'Severe storm with hail', category: 'Rainy' },
  99: { condition: 'Rainy', label: 'Heavy Thunderstorm', icon: 'Zap', desc: 'Heavy thunderstorm', category: 'Rainy' },
};

/**
 * Derives styling tips based on temperature and condition
 */
export function getStylingAdvice(temp, condition, weatherLabel) {
  if (condition === 'Rainy') {
    return {
      tip: 'Monsoon / Wet Ready: Opt for quick-dry fabrics, darker bottoms to avoid splash marks, and water-resistant footwear.',
      suggestedLayers: ['Waterproof Shell', 'Light Jacket'],
      fabrics: 'Nylon, Synthetic Blends, Dark Denim'
    };
  }

  if (temp >= 30) {
    return {
      tip: 'Hot & Humid: Wear light, breathable linens, cottons, and relaxed-fit silhouettes for maximum airflow.',
      suggestedLayers: ['No Outerwear Needed', 'Linen Shirt as Open Layer'],
      fabrics: 'Linen, 100% Breathable Cotton, Chambray'
    };
  }

  if (temp >= 22) {
    return {
      tip: `Pleasant & ${weatherLabel}: Ideal for versatile smart-casual pieces, polo shirts, chinos, and crisp sneakers.`,
      suggestedLayers: ['Optional Overshirt', 'Light Cardigan'],
      fabrics: 'Pima Cotton, Chino Twill, Lightweight Wool'
    };
  }

  if (temp >= 15) {
    return {
      tip: 'Crisp & Mild: Perfect temperature for stylish layering—pair a structured overshirt or blazer over a fine-knit tee.',
      suggestedLayers: ['Structured Blazer', 'Denim Jacket', 'Cardigan'],
      fabrics: 'Medium Weight Cotton, Merino Wool, Denim'
    };
  }

  return {
    tip: 'Chilly & Cold: Prioritize thermal insulation with wool overcoats, textured knitwear, and sturdy leather boots.',
    suggestedLayers: ['Heavy Wool Coat', 'Trench Coat', 'Puffer Jacket'],
    fabrics: 'Wool Blend, Cashmere, Heavy Fleece, Leather'
  };
}

/**
 * Get device GPS coordinates with timeout & fallback
 */
export function getBrowserCoordinates(timeoutMs = 7000) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isGps: true,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 10 * 60 * 1000, // 10 min cache
      }
    );
  });
}

/**
 * Fallback to IP-based location if GPS is denied or unavailable
 */
export async function getIpCoordinates() {
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (!res.ok) throw new Error('IP geolocation service failed');
    const data = await res.json();
    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      city: data.city || 'Your City',
      country: data.country || '',
      isGps: false,
    };
  } catch (err) {
    // Ultimate fallback: Mumbai, India default
    return {
      latitude: 19.0760,
      longitude: 72.8777,
      city: 'Mumbai',
      country: 'India',
      isGps: false,
    };
  }
}

// In-memory cache & in-flight deduplication
const geocodeCache = new Map();
let inFlightWeatherPromise = null;
let lastWeatherCache = null;
let lastWeatherTime = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Reverse geocode latitude/longitude to City, State, Country (Cached)
 */
export async function reverseGeocode(latitude, longitude) {
  const cacheKey = `${Number(latitude).toFixed(3)},${Number(longitude).toFixed(3)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Current City';
      const country = data.countryName || '';
      const state = data.principalSubdivision || '';
      const formatted = country ? `${city}, ${country}` : city;
      const result = { city, state, country, formattedLocation: formatted };
      geocodeCache.set(cacheKey, result);
      return result;
    }
  } catch (e) {
    console.warn('Reverse geocoding error:', e);
  }

  const fallback = {
    city: 'Current Location',
    state: '',
    country: '',
    formattedLocation: 'Current Location',
  };
  geocodeCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Search locations/cities around the world
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item) => ({
      id: `${item.id}-${item.name}`,
      name: item.name,
      state: item.admin1 || '',
      country: item.country || '',
      latitude: item.latitude,
      longitude: item.longitude,
      formatted: `${item.name}${item.admin1 ? `, ${item.admin1}` : ''}, ${item.country || ''}`,
    }));
  } catch (e) {
    console.error('Error searching cities:', e);
    return [];
  }
}

/**
 * Fetch live weather from Open-Meteo for given coordinates
 */
export async function fetchLiveWeather(latitude, longitude, customLocationName = null) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather fetch failed: ${res.statusText}`);
  }

  const data = await res.json();
  const current = data.current;
  const weatherCode = current.weather_code;
  const codeInfo = WMO_CODE_MAP[weatherCode] || {
    condition: current.temperature_2m > 20 ? 'Sunny' : 'Cool',
    label: 'Partly Cloudy',
    icon: 'Sun',
    desc: 'Mild pleasant weather',
    category: current.temperature_2m > 20 ? 'Sunny' : 'Cool',
  };

  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const windSpeed = Math.round(current.wind_speed_10m);
  const isDay = current.is_day === 1;

  // Max & Min
  const highTemp = data.daily?.temperature_2m_max?.[0] ? Math.round(data.daily.temperature_2m_max[0]) : temp + 2;
  const lowTemp = data.daily?.temperature_2m_min?.[0] ? Math.round(data.daily.temperature_2m_min[0]) : temp - 3;

  // Styling Advice
  const styling = getStylingAdvice(temp, codeInfo.condition, codeInfo.label);

  return {
    temp,
    feelsLike,
    condition: codeInfo.condition,
    category: codeInfo.category,
    label: codeInfo.label,
    description: codeInfo.desc,
    icon: codeInfo.icon,
    humidity,
    windSpeed,
    isDay,
    highTemp,
    lowTemp,
    stylingAdvice: styling.tip,
    suggestedLayers: styling.suggestedLayers,
    recommendedFabrics: styling.fabrics,
    latitude,
    longitude,
    locationName: customLocationName,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Unified pipeline: tries GPS -> reverse geocode -> Open-Meteo.
 * Includes in-flight deduplication and 10-minute caching.
 */
export async function getCompleteLiveWeather(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && lastWeatherCache && (now - lastWeatherTime) < CACHE_DURATION_MS) {
    return lastWeatherCache;
  }

  if (inFlightWeatherPromise) {
    return inFlightWeatherPromise;
  }

  inFlightWeatherPromise = (async () => {
    let coords;
    let isGps = false;
    let locationInfo = { city: 'Local Area', formattedLocation: 'Local Area' };

    try {
      // Try GPS first
      coords = await getBrowserCoordinates(5000);
      isGps = true;
      locationInfo = await reverseGeocode(coords.latitude, coords.longitude);
    } catch {
      const ipGeo = await getIpCoordinates();
      coords = { latitude: ipGeo.latitude, longitude: ipGeo.longitude };
      isGps = false;
      locationInfo = {
        city: ipGeo.city,
        country: ipGeo.country,
        formattedLocation: ipGeo.country ? `${ipGeo.city}, ${ipGeo.country}` : ipGeo.city,
      };
    }

    const weather = await fetchLiveWeather(
      coords.latitude,
      coords.longitude,
      locationInfo.formattedLocation
    );

    const result = {
      ...weather,
      location: locationInfo.formattedLocation,
      city: locationInfo.city,
      country: locationInfo.country || '',
      isGps,
    };

    lastWeatherCache = result;
    lastWeatherTime = Date.now();
    return result;
  })().finally(() => {
    inFlightWeatherPromise = null;
  });

  return inFlightWeatherPromise;
}
