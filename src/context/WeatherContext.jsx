import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCompleteLiveWeather,
  fetchLiveWeather,
  searchCities as searchCitiesApi,
  getStylingAdvice,
} from '../services/weatherService';

const WeatherContext = createContext(null);

const STORAGE_KEY = 'stylesync_live_weather';

const DEFAULT_WEATHER = {
  condition: 'Sunny',
  category: 'Sunny',
  temp: 27,
  feelsLike: 28,
  location: 'Detecting Location...',
  city: 'Local Area',
  country: '',
  label: 'Warm & Sunny',
  description: 'Clear pleasant skies',
  icon: 'Sun',
  humidity: 62,
  windSpeed: 14,
  highTemp: 29,
  lowTemp: 23,
  isDay: true,
  isGps: false,
  stylingAdvice: 'Ideal for versatile smart-casual pieces, polo shirts, chinos, and crisp sneakers.',
  suggestedLayers: ['Optional Overshirt', 'Light Cardigan'],
  recommendedFabrics: 'Pima Cotton, Chino Twill, Lightweight Wool',
  lastUpdated: 'Just now',
};

export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Failed reading cached weather:', e);
    }
    return DEFAULT_WEATHER;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch live weather using GPS + Open-Meteo
  const refreshWeather = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await getCompleteLiveWeather();
      setWeather(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      console.error('Failed to get real weather:', err);
      setError('Could not update live weather. Using cached values.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  // Fetch weather for a custom searched city
  const selectCity = useCallback(async (cityObj) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLiveWeather(
        cityObj.latitude,
        cityObj.longitude,
        cityObj.formatted || cityObj.name
      );
      const fullData = {
        ...data,
        location: cityObj.formatted || `${cityObj.name}, ${cityObj.country}`,
        city: cityObj.name,
        country: cityObj.country || '',
        isGps: false,
      };
      setWeather(fullData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullData));
      return fullData;
    } catch (err) {
      console.error('Failed fetching custom city weather:', err);
      setError(`Could not fetch weather for ${cityObj.name}.`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set manual preset (e.g. Sunny, Mild, Rainy, Cool)
  const setManualPreset = useCallback((preset) => {
    const presetsMap = {
      Sunny: { temp: 28, feelsLike: 30, label: 'Warm & Sunny', condition: 'Sunny', icon: 'Sun' },
      Mild: { temp: 22, feelsLike: 22, label: 'Pleasant & Mild', condition: 'Mild', icon: 'Cloud' },
      Rainy: { temp: 24, feelsLike: 26, label: 'Monsoon / Wet', condition: 'Rainy', icon: 'CloudRain' },
      Cool: { temp: 15, feelsLike: 14, label: 'Chilly / Layered', condition: 'Cool', icon: 'Snowflake' },
    };

    const target = presetsMap[preset] || presetsMap.Sunny;
    const styling = getStylingAdvice(target.temp, target.condition, target.label);

    setWeather((prev) => {
      const updated = {
        ...prev,
        ...target,
        category: target.condition,
        description: `Manual preset: ${target.label}`,
        stylingAdvice: styling.tip,
        suggestedLayers: styling.suggestedLayers,
        recommendedFabrics: styling.fabrics,
        lastUpdated: 'Preset applied',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    refreshWeather(false);
  }, [refreshWeather]);

  const value = {
    weather,
    isLoading,
    error,
    refreshWeather,
    selectCity,
    searchCities: searchCitiesApi,
    setManualPreset,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
