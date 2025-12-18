/**
 * Weather and Marine Data Module
 * 
 * This module provides functions to fetch weather and marine data from Open-Meteo APIs
 */

// Constants for wind direction
const WIND_DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                         'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const DEGREES_PER_DIRECTION = 360 / WIND_DIRECTIONS.length; // 22.5 degrees

// Forecast duration
const DEFAULT_FORECAST_HOURS = 168; // 7 days

/**
 * Fetch weather data from Open-Meteo API
 * @param {number} latitude - Latitude in decimal degrees
 * @param {number} longitude - Longitude in decimal degrees
 * @param {string} timezone - Timezone string (e.g., 'Asia/Singapore', 'Australia/Perth')
 * @returns {Promise<Object>} Weather data
 */
export async function fetchWeatherData(latitude, longitude, timezone) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: [
      'temperature_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'cloud_cover',
      'surface_pressure',
      'pressure_msl',
      'precipitation_probability',
      'rain',
      'relative_humidity_2m',
      'apparent_temperature'
    ].join(','),
    timezone: timezone
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

/**
 * Fetch marine data from Open-Meteo Marine API
 * @param {number} latitude - Latitude in decimal degrees
 * @param {number} longitude - Longitude in decimal degrees
 * @param {string} timezone - Timezone string
 * @returns {Promise<Object>} Marine data
 */
export async function fetchMarineData(latitude, longitude, timezone) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: [
      'wave_height',
      'sea_surface_temperature',
      'wave_direction',
      'wave_period',
      'tertiary_swell_wave_height',
      'tertiary_swell_wave_period',
      'tertiary_swell_wave_direction'
    ].join(','),
    timezone: timezone
  });

  const url = `https://marine-api.open-meteo.com/v1/marine?${params}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Marine API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching marine data:', error);
    throw error;
  }
}

/**
 * Find the closest time index in hourly data array
 * @param {Array<string>} timeArray - Array of ISO timestamp strings
 * @param {Date} targetTime - Target time to find
 * @returns {number} Index of closest time
 */
function findClosestTimeIndex(timeArray, targetTime = new Date()) {
  let closestIndex = 0;
  let minDiff = Infinity;
  
  for (let i = 0; i < timeArray.length; i++) {
    const time = new Date(timeArray[i]);
    const diff = Math.abs(time - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }
  
  return closestIndex;
}

/**
 * Get current weather conditions from weather data
 * @param {Object} weatherData - Weather data from API
 * @returns {Object} Current weather conditions
 */
export function getCurrentWeather(weatherData) {
  if (!weatherData || !weatherData.hourly) {
    return null;
  }

  const hourly = weatherData.hourly;
  const closestIndex = findClosestTimeIndex(hourly.time);

  return {
    time: new Date(hourly.time[closestIndex]),
    temperature: hourly.temperature_2m[closestIndex],
    apparentTemperature: hourly.apparent_temperature[closestIndex],
    windSpeed: hourly.wind_speed_10m[closestIndex],
    windDirection: hourly.wind_direction_10m[closestIndex],
    cloudCover: hourly.cloud_cover[closestIndex],
    humidity: hourly.relative_humidity_2m[closestIndex],
    precipitationProbability: hourly.precipitation_probability[closestIndex],
    rain: hourly.rain[closestIndex]
  };
}

/**
 * Get current marine conditions from marine data
 * @param {Object} marineData - Marine data from API
 * @returns {Object} Current marine conditions
 */
export function getCurrentMarine(marineData) {
  if (!marineData || !marineData.hourly) {
    return null;
  }

  const hourly = marineData.hourly;
  const closestIndex = findClosestTimeIndex(hourly.time);

  return {
    time: new Date(hourly.time[closestIndex]),
    waveHeight: hourly.wave_height[closestIndex],
    seaSurfaceTemperature: hourly.sea_surface_temperature[closestIndex],
    waveDirection: hourly.wave_direction[closestIndex],
    wavePeriod: hourly.wave_period[closestIndex],
    swellHeight: hourly.tertiary_swell_wave_height[closestIndex],
    swellPeriod: hourly.tertiary_swell_wave_period[closestIndex],
    swellDirection: hourly.tertiary_swell_wave_direction[closestIndex]
  };
}

/**
 * Get forecast data for the next N hours
 * @param {Object} weatherData - Weather data from API
 * @param {Object} marineData - Marine data from API
 * @param {number} hours - Number of hours to forecast (default: 168 for 7 days)
 * @returns {Array} Array of forecast objects
 */
export function getForecast(weatherData, marineData, hours = DEFAULT_FORECAST_HOURS) {
  const forecast = [];
  const now = new Date();
  const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

  if (!weatherData || !weatherData.hourly || !marineData || !marineData.hourly) {
    return forecast;
  }

  for (let i = 0; i < weatherData.hourly.time.length; i++) {
    const time = new Date(weatherData.hourly.time[i]);
    
    if (time >= now && time <= endTime) {
      forecast.push({
        time: time,
        temperature: weatherData.hourly.temperature_2m[i],
        windSpeed: weatherData.hourly.wind_speed_10m[i],
        windDirection: weatherData.hourly.wind_direction_10m[i],
        waveHeight: marineData.hourly.wave_height[i],
        seaSurfaceTemperature: marineData.hourly.sea_surface_temperature[i],
        precipitationProbability: weatherData.hourly.precipitation_probability[i]
      });
    }
  }

  return forecast;
}

/**
 * Get wind direction as cardinal direction
 * @param {number} degrees - Wind direction in degrees
 * @returns {string} Cardinal direction (e.g., 'N', 'NE', 'E')
 */
export function getWindDirection(degrees) {
  const index = Math.round(degrees / DEGREES_PER_DIRECTION) % WIND_DIRECTIONS.length;
  return WIND_DIRECTIONS[index];
}

/**
 * Calculate fishing quality score based on conditions
 * Higher score = better fishing conditions
 * @param {Object} weather - Current weather
 * @param {Object} marine - Current marine conditions
 * @param {Object} tide - Current tide info
 * @returns {Object} Fishing quality score and explanation
 */
export function calculateFishingScore(weather, marine, tide) {
  let score = 50; // Base score
  const factors = [];

  // Tide factors (moving water is better)
  if (tide && tide.nextHigh && tide.nextLow) {
    const now = new Date();
    const nextHighTime = tide.nextHigh.time.getTime();
    const nextLowTime = tide.nextLow.time.getTime();
    const currentTime = now.getTime();
    
    // Check if we're near tide change (1 hour before/after)
    const hourMs = 60 * 60 * 1000;
    const nearHighTide = Math.abs(nextHighTime - currentTime) < hourMs;
    const nearLowTide = Math.abs(nextLowTime - currentTime) < hourMs;
    
    if (nearHighTide || nearLowTide) {
      score += 15;
      factors.push('Near tide change (+15)');
    } else {
      score += 5;
      factors.push('Tide moving (+5)');
    }
  }

  // Wave height (moderate waves are best)
  if (marine && marine.waveHeight !== null) {
    if (marine.waveHeight > 0.3 && marine.waveHeight < 1.5) {
      score += 10;
      factors.push('Good wave height (+10)');
    } else if (marine.waveHeight >= 1.5 && marine.waveHeight < 2.5) {
      score += 5;
      factors.push('Moderate waves (+5)');
    } else if (marine.waveHeight >= 2.5) {
      score -= 10;
      factors.push('Rough seas (-10)');
    }
  }

  // Wind speed (light to moderate is best)
  if (weather && weather.windSpeed !== null) {
    if (weather.windSpeed < 10) {
      score += 10;
      factors.push('Light wind (+10)');
    } else if (weather.windSpeed < 20) {
      score += 5;
      factors.push('Moderate wind (+5)');
    } else if (weather.windSpeed >= 25) {
      score -= 15;
      factors.push('Strong wind (-15)');
    }
  }

  // Temperature (comfortable range)
  if (weather && weather.temperature !== null) {
    if (weather.temperature >= 18 && weather.temperature <= 28) {
      score += 5;
      factors.push('Good temperature (+5)');
    } else if (weather.temperature < 10 || weather.temperature > 35) {
      score -= 5;
      factors.push('Extreme temperature (-5)');
    }
  }

  // Rain probability
  if (weather && weather.precipitationProbability !== null) {
    if (weather.precipitationProbability < 20) {
      score += 5;
      factors.push('Low rain chance (+5)');
    } else if (weather.precipitationProbability > 70) {
      score -= 10;
      factors.push('High rain chance (-10)');
    }
  }

  // Cloud cover (some cloud is good, full sun can be harsh)
  if (weather && weather.cloudCover !== null) {
    if (weather.cloudCover >= 20 && weather.cloudCover <= 70) {
      score += 5;
      factors.push('Partly cloudy (+5)');
    } else if (weather.cloudCover > 90) {
      score -= 5;
      factors.push('Overcast (-5)');
    }
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  let quality = 'Poor';
  if (score >= 75) quality = 'Excellent';
  else if (score >= 60) quality = 'Good';
  else if (score >= 45) quality = 'Fair';

  return {
    score,
    quality,
    factors
  };
}
