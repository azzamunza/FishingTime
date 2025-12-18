/**
 * FishingTime Application
 * Main application logic coordinating tides, weather, and marine data
 */

import { loadStations, getCurrentTideInfo, generateTideSeries, findHighLowTides } from './tide-harmonic.js';
import { fetchWeatherData, fetchMarineData, getCurrentWeather, getCurrentMarine, getWindDirection, calculateFishingScore } from './weather-marine.js';

// Global state
let stations = null;
let currentStation = null;
let weatherData = null;
let marineData = null;

/**
 * Initialize the application
 */
async function init() {
  try {
    showLoading(true);
    
    // Load station data
    stations = await loadStations('stations.json');
    console.log(`Loaded ${stations.size} stations`);
    
    // Populate station selector
    populateStationSelector();
    
    // Load first station by default
    const firstStationId = stations.keys().next().value;
    await loadStation(firstStationId);
    
    showLoading(false);
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize application: ' + error.message);
  }
}

/**
 * Populate the station selector dropdown
 */
function populateStationSelector() {
  const selector = document.getElementById('station-selector');
  selector.innerHTML = '';
  
  for (const [id, station] of stations) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = station.name;
    selector.appendChild(option);
  }
  
  selector.addEventListener('change', (e) => {
    loadStation(e.target.value);
  });
}

/**
 * Load and display data for a specific station
 */
async function loadStation(stationId) {
  try {
    showLoading(true);
    
    currentStation = stations.get(stationId);
    console.log('Loading station:', currentStation.name);
    
    // Update selector
    document.getElementById('station-selector').value = stationId;
    
    // Get timezone for the location (using Australia/Perth for WA locations)
    const timezone = 'Australia/Perth';
    
    // Fetch weather and marine data in parallel (with error handling)
    try {
      [weatherData, marineData] = await Promise.all([
        fetchWeatherData(currentStation.latitude, currentStation.longitude, timezone).catch(err => {
          console.warn('Weather data unavailable:', err.message);
          return null;
        }),
        fetchMarineData(currentStation.latitude, currentStation.longitude, timezone).catch(err => {
          console.warn('Marine data unavailable:', err.message);
          return null;
        })
      ]);
    } catch (error) {
      console.warn('External data fetch failed:', error.message);
      weatherData = null;
      marineData = null;
    }
    
    // Update displays (tides work independently of external APIs)
    updateTideDisplay();
    updateWeatherDisplay();
    updateMarineDisplay();
    updateFishingScore();
    updateTideChart();
    
    // Show warning if external data failed
    if (!weatherData || !marineData) {
      showWarning('Note: Weather and marine data unavailable. Showing tide predictions only.');
    }
    
    showLoading(false);
  } catch (error) {
    console.error('Error loading station:', error);
    showError('Failed to load station data: ' + error.message);
  }
}

/**
 * Update tide information display
 */
function updateTideDisplay() {
  const tideInfo = getCurrentTideInfo(currentStation);
  
  const currentTideEl = document.getElementById('current-tide');
  const nextHighEl = document.getElementById('next-high');
  const nextLowEl = document.getElementById('next-low');
  
  currentTideEl.innerHTML = `
    <strong>Current Tide:</strong> ${tideInfo.current.height.toFixed(2)} m
  `;
  
  if (tideInfo.nextHigh) {
    const highTime = tideInfo.nextHigh.time.toLocaleString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });
    nextHighEl.innerHTML = `
      <strong>Next High:</strong> ${tideInfo.nextHigh.height.toFixed(2)} m at ${highTime}
    `;
  }
  
  if (tideInfo.nextLow) {
    const lowTime = tideInfo.nextLow.time.toLocaleString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });
    nextLowEl.innerHTML = `
      <strong>Next Low:</strong> ${tideInfo.nextLow.height.toFixed(2)} m at ${lowTime}
    `;
  }
}

/**
 * Update weather information display
 */
function updateWeatherDisplay() {
  const weather = getCurrentWeather(weatherData);
  const weatherEl = document.getElementById('weather-info');
  
  if (!weather) {
    weatherEl.innerHTML = '<div class="info-unavailable">Weather data currently unavailable. Please check back later or ensure you have an internet connection.</div>';
    return;
  }
  
  const windDir = getWindDirection(weather.windDirection);
  
  weatherEl.innerHTML = `
    <div class="info-item">
      <span class="label">Temperature:</span>
      <span class="value">${weather.temperature?.toFixed(1) || 'N/A'}°C (feels like ${weather.apparentTemperature?.toFixed(1) || 'N/A'}°C)</span>
    </div>
    <div class="info-item">
      <span class="label">Wind:</span>
      <span class="value">${weather.windSpeed?.toFixed(1) || 'N/A'} km/h ${windDir}</span>
    </div>
    <div class="info-item">
      <span class="label">Cloud Cover:</span>
      <span class="value">${weather.cloudCover || 'N/A'}%</span>
    </div>
    <div class="info-item">
      <span class="label">Humidity:</span>
      <span class="value">${weather.humidity || 'N/A'}%</span>
    </div>
    <div class="info-item">
      <span class="label">Rain Chance:</span>
      <span class="value">${weather.precipitationProbability || 0}%</span>
    </div>
  `;
}

/**
 * Update marine information display
 */
function updateMarineDisplay() {
  const marine = getCurrentMarine(marineData);
  const marineEl = document.getElementById('marine-info');
  
  if (!marine) {
    marineEl.innerHTML = '<div class="info-unavailable">Marine data currently unavailable. Please check back later or ensure you have an internet connection.</div>';
    return;
  }
  
  const waveDir = getWindDirection(marine.waveDirection);
  const swellDir = getWindDirection(marine.swellDirection);
  
  marineEl.innerHTML = `
    <div class="info-item">
      <span class="label">Wave Height:</span>
      <span class="value">${marine.waveHeight?.toFixed(2) || 'N/A'} m</span>
    </div>
    <div class="info-item">
      <span class="label">Wave Direction:</span>
      <span class="value">${waveDir}</span>
    </div>
    <div class="info-item">
      <span class="label">Wave Period:</span>
      <span class="value">${marine.wavePeriod?.toFixed(1) || 'N/A'} s</span>
    </div>
    <div class="info-item">
      <span class="label">Sea Temperature:</span>
      <span class="value">${marine.seaSurfaceTemperature?.toFixed(1) || 'N/A'}°C</span>
    </div>
    <div class="info-item">
      <span class="label">Swell:</span>
      <span class="value">${marine.swellHeight?.toFixed(2) || 'N/A'} m ${swellDir}</span>
    </div>
  `;
}

/**
 * Update fishing quality score display
 */
function updateFishingScore() {
  const weather = getCurrentWeather(weatherData);
  const marine = getCurrentMarine(marineData);
  const tideInfo = getCurrentTideInfo(currentStation);
  
  const scoreEl = document.getElementById('fishing-score');
  const factorsEl = document.getElementById('score-factors');
  
  if (!weather || !marine) {
    scoreEl.innerHTML = `
      <div class="score score-unavailable">
        <div class="score-quality">Score Unavailable</div>
        <div class="score-note">Weather/marine data needed</div>
      </div>
    `;
    factorsEl.innerHTML = '<p><em>Tide predictions are available below. Full fishing score requires weather and marine data.</em></p>';
    return;
  }
  
  const scoreResult = calculateFishingScore(weather, marine, tideInfo);
  
  // Color code based on score
  let scoreClass = 'score-poor';
  if (scoreResult.score >= 75) scoreClass = 'score-excellent';
  else if (scoreResult.score >= 60) scoreClass = 'score-good';
  else if (scoreResult.score >= 45) scoreClass = 'score-fair';
  
  scoreEl.innerHTML = `
    <div class="score ${scoreClass}">
      <div class="score-number">${scoreResult.score}</div>
      <div class="score-quality">${scoreResult.quality}</div>
    </div>
  `;
  
  factorsEl.innerHTML = '<strong>Factors:</strong><ul>' +
    scoreResult.factors.map(f => `<li>${f}</li>`).join('') +
    '</ul>';
}

/**
 * Update tide chart
 */
function updateTideChart() {
  const canvas = document.getElementById('tide-chart');
  const ctx = canvas.getContext('2d');
  
  // Generate 48 hours of tide data at 10-minute intervals
  const series = generateTideSeries(currentStation, new Date(), 48, 10);
  const { highs, lows } = findHighLowTides(series);
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set up drawing parameters
  const padding = 40;
  const chartWidth = canvas.width - 2 * padding;
  const chartHeight = canvas.height - 2 * padding;
  
  // Find min/max heights for scaling
  const heights = series.map(s => s.height);
  const minHeight = Math.min(...heights);
  const maxHeight = Math.max(...heights);
  const heightRange = maxHeight - minHeight;
  
  // Draw axes
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();
  
  // Draw tide line
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  series.forEach((point, i) => {
    const x = padding + (i / (series.length - 1)) * chartWidth;
    const y = canvas.height - padding - ((point.height - minHeight) / heightRange) * chartHeight;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
  
  // Build a map for efficient time lookup
  const timeToIndexMap = new Map();
  series.forEach((point, index) => {
    timeToIndexMap.set(point.time.getTime(), index);
  });
  
  // Draw high/low tide markers
  highs.forEach(high => {
    const index = timeToIndexMap.get(high.time.getTime());
    if (index !== undefined) {
      const x = padding + (index / (series.length - 1)) * chartWidth;
      const y = canvas.height - padding - ((high.height - minHeight) / heightRange) * chartHeight;
      
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
  
  lows.forEach(low => {
    const index = timeToIndexMap.get(low.time.getTime());
    if (index !== undefined) {
      const x = padding + (index / (series.length - 1)) * chartWidth;
      const y = canvas.height - padding - ((low.height - minHeight) / heightRange) * chartHeight;
      
      ctx.fillStyle = '#F44336';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
  
  // Draw labels
  ctx.fillStyle = '#666';
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`${maxHeight.toFixed(2)}m`, padding - 5, padding + 5);
  ctx.fillText(`${minHeight.toFixed(2)}m`, padding - 5, canvas.height - padding + 5);
  
  ctx.textAlign = 'center';
  ctx.fillText('Now', padding, canvas.height - padding + 20);
  ctx.fillText('48h', canvas.width - padding, canvas.height - padding + 20);
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
  const loader = document.getElementById('loading');
  if (loader) {
    loader.style.display = show ? 'block' : 'none';
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    errorEl.className = 'error-message';
  }
  showLoading(false);
}

/**
 * Show warning message
 */
function showWarning(message) {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    errorEl.className = 'warning-message';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Refresh data every 5 minutes (with cleanup on page unload)
let refreshInterval = null;

function startAutoRefresh() {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  // Set up new refresh interval
  refreshInterval = setInterval(() => {
    if (currentStation) {
      loadStation(currentStation.id);
    }
  }, 5 * 60 * 1000);
}

// Start auto-refresh
startAutoRefresh();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
