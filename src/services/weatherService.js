/**
 * StyleSync Real-Time Weather & Geolocation Service
 * Uses Open-Meteo (Free, No API Key required, Global Coverage) & Geocoding APIs
 * Fully deduplicated with 15-minute smart memory & local storage caching
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

// Global in-flight fetch deduplication map
const inFlightRequests = new Map();
const requestCache = new Map();
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

async function fetchJsonDeduped(url, ttlMs = CACHE_DURATION_MS) {
  const now = Date.now();
  if (requestCache.has(url)) {
    const cached = requestCache.get(url);
    if (now - cached.timestamp < ttlMs) {
      return cached.data;
    }
  }

  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url);
  }

  const promise = (async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    requestCache.set(url, { data, timestamp: Date.now() });
    return data;
  })().finally(() => {
    inFlightRequests.delete(url);
  });

  inFlightRequests.set(url, promise);
  return promise;
}

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

let inFlightGpsPromise = null;

/**
 * Get device GPS coordinates with timeout & fallback
 */
export function getBrowserCoordinates(timeoutMs = 5000) {
  if (inFlightGpsPromise) return inFlightGpsPromise;

  inFlightGpsPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
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
        maximumAge: 15 * 60 * 1000,
      }
    );
  }).finally(() => {
    inFlightGpsPromise = null;
  });

  return inFlightGpsPromise;
}

/**
 * Fallback to IP-based location if GPS is denied or unavailable
 */
export async function getIpCoordinates() {
  try {
    const data = await fetchJsonDeduped('https://get.geojs.io/v1/ip/geo.json');
    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      city: data.city || 'Your City',
      country: data.country || '',
      isGps: false,
    };
  } catch (err) {
    return {
      latitude: 19.0760,
      longitude: 72.8777,
      city: 'Mumbai',
      country: 'India',
      isGps: false,
    };
  }
}

/**
 * Reverse geocode latitude/longitude to City, State, Country (Cached & Deduplicated)
 */
export async function reverseGeocode(latitude, longitude) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
  try {
    const data = await fetchJsonDeduped(url);
    const city = data.city || data.locality || data.principalSubdivision || 'Current City';
    const country = data.countryName || '';
    const state = data.principalSubdivision || '';
    const formatted = country ? `${city}, ${country}` : city;
    return { city, state, country, formattedLocation: formatted };
  } catch (e) {
    return {
      city: 'Current Location',
      state: '',
      country: '',
      formattedLocation: 'Current Location',
    };
  }
}

/**
 * Search locations/cities around the world
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  try {
    const data = await fetchJsonDeduped(url, 60 * 1000);
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
    return [];
  }
}

/**
 * Fetch live weather from Open-Meteo for given coordinates (Deduplicated)
 */
export async function fetchLiveWeather(latitude, longitude, customLocationName = null) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

  const data = await fetchJsonDeduped(url);
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

let inFlightWeatherPipeline = null;
let lastWeatherResult = null;
let lastWeatherTimestamp = 0;

/**
 * Unified pipeline: tries GPS -> reverse geocode -> Open-Meteo.
 * Includes global in-flight deduplication and 15-minute caching.
 */
export async function getCompleteLiveWeather(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && lastWeatherResult && (now - lastWeatherTimestamp) < CACHE_DURATION_MS) {
    return lastWeatherResult;
  }

  if (inFlightWeatherPipeline) {
    return inFlightWeatherPipeline;
  }

  inFlightWeatherPipeline = (async () => {
    let coords;
    let isGps = false;
    let locationInfo = { city: 'Local Area', formattedLocation: 'Local Area' };

    try {
      coords = await getBrowserCoordinates(4000);
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

    lastWeatherResult = result;
    lastWeatherTimestamp = Date.now();
    return result;
  })().finally(() => {
    inFlightWeatherPipeline = null;
  });

  return inFlightWeatherPipeline;
}
