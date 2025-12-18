/**
 * Tidal Harmonic Analysis Module
 * 
 * This module provides functions to calculate tide heights and predict high/low tides
 * using harmonic analysis of tidal constituents.
 */

// Angular speeds in degrees per hour for major tidal constituents
const TIDAL_SPEEDS = {
  M2: 28.9841042,    // Principal lunar semidiurnal
  S2: 30.0,          // Principal solar semidiurnal
  N2: 28.4397295,    // Larger lunar elliptic semidiurnal
  K1: 15.0410686,    // Lunar diurnal
  O1: 13.9430356,    // Lunar diurnal
  P1: 14.9589314,    // Solar diurnal
  K2: 30.0821373,    // Lunisolar semidiurnal
  Q1: 13.3986609,    // Larger lunar elliptic diurnal
  L2: 29.5284789,    // Smaller lunar elliptic semidiurnal
  T2: 29.9589333     // Larger solar elliptic semidiurnal
};

// Reference epoch: January 1, 2000, 00:00:00 UTC
const EPOCH = new Date('2000-01-01T00:00:00Z');

/**
 * Load tidal station data from a JSON file
 * @param {string} url - URL to the stations.json file
 * @returns {Promise<Map>} Map of station ID to station object
 */
export async function loadStations(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load stations: ${response.statusText}`);
    }
    const data = await response.json();
    
    const stationMap = new Map();
    for (const station of data.stations) {
      stationMap.set(station.id, station);
    }
    
    return stationMap;
  } catch (error) {
    console.error('Error loading stations:', error);
    throw error;
  }
}

/**
 * Convert a Date object to hours since epoch
 * @param {Date} date - Date to convert
 * @returns {number} Hours since epoch
 */
function dateToHoursSinceEpoch(date) {
  const milliseconds = date.getTime() - EPOCH.getTime();
  return milliseconds / (1000 * 60 * 60);
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Predict tide height at a specific time for a given station
 * @param {Object} station - Station object with constituents
 * @param {Date} date - Date/time for prediction
 * @returns {number} Predicted tide height in meters
 */
export function predictTideHeight(station, date) {
  const t = dateToHoursSinceEpoch(date);
  const datum = station.datum || 0;
  
  let height = datum;
  
  // Sum contributions from all constituents
  for (const [name, constituent] of Object.entries(station.constituents)) {
    const speed = TIDAL_SPEEDS[name];
    if (!speed) {
      console.warn(`Unknown constituent: ${name}`);
      continue;
    }
    
    const amplitude = constituent.amplitude;
    const phase = constituent.phase;
    
    // h(t) = A * cos(ω*t - φ)
    // where ω is in degrees/hour, converted to radians
    const omega = toRadians(speed);
    const phi = toRadians(phase);
    
    height += amplitude * Math.cos(omega * t - phi);
  }
  
  return height;
}

/**
 * Generate a time series of tide predictions
 * @param {Object} station - Station object
 * @param {Date} startDate - Start date/time
 * @param {number} hours - Number of hours to predict
 * @param {number} stepMinutes - Time step in minutes (default: 60)
 * @returns {Array<{time: Date, height: number}>} Array of tide predictions
 */
export function generateTideSeries(station, startDate, hours, stepMinutes = 60) {
  const series = [];
  const stepMs = stepMinutes * 60 * 1000;
  const endTime = startDate.getTime() + (hours * 60 * 60 * 1000);
  
  for (let time = startDate.getTime(); time <= endTime; time += stepMs) {
    const date = new Date(time);
    const height = predictTideHeight(station, date);
    series.push({ time: date, height });
  }
  
  return series;
}

/**
 * Find high and low tides in a time series
 * @param {Array<{time: Date, height: number}>} series - Tide time series
 * @returns {{highs: Array, lows: Array}} Arrays of high and low tide events
 */
export function findHighLowTides(series) {
  const highs = [];
  const lows = [];
  
  if (series.length < 3) {
    return { highs, lows };
  }
  
  // Find local maxima and minima
  for (let i = 1; i < series.length - 1; i++) {
    const prev = series[i - 1].height;
    const current = series[i].height;
    const next = series[i + 1].height;
    
    // Local maximum (high tide)
    if (current > prev && current > next) {
      highs.push({
        time: series[i].time,
        height: series[i].height
      });
    }
    
    // Local minimum (low tide)
    if (current < prev && current < next) {
      lows.push({
        time: series[i].time,
        height: series[i].height
      });
    }
  }
  
  return { highs, lows };
}

/**
 * Get current tide information and next high/low tides
 * @param {Object} station - Station object
 * @param {Date} currentDate - Current date/time
 * @param {number} forecastHours - Hours to look ahead (default: 48)
 * @returns {Object} Current tide info and next high/low tides
 */
export function getCurrentTideInfo(station, currentDate = new Date(), forecastHours = 48) {
  const currentHeight = predictTideHeight(station, currentDate);
  
  // Generate high-resolution series for accurate extrema detection
  const series = generateTideSeries(station, currentDate, forecastHours, 10);
  const { highs, lows } = findHighLowTides(series);
  
  // Find next high and low tides after current time
  const nextHigh = highs.find(h => h.time > currentDate);
  const nextLow = lows.find(l => l.time > currentDate);
  
  return {
    current: {
      time: currentDate,
      height: currentHeight
    },
    nextHigh: nextHigh || null,
    nextLow: nextLow || null,
    allHighs: highs,
    allLows: lows
  };
}
