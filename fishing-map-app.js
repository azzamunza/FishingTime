// Main fishing map application logic
import { marineSpeciesDatabase, locationTypes, getSpeciesForLocation } from './marine-species.js';

// Fishing spots data with coordinates, location types, and fish species
export const fishingSpots = [
    // Swan River Region
    {
        name: 'Ascot (Swan River)',
        lat: -31.9371,
        lng: 115.9279,
        region: 'Swan River',
        locationType: 'river',
        stationId: 'perth'
    },
    {
        name: 'Bayswater (Swan River)',
        lat: -31.9178,
        lng: 115.9098,
        region: 'Swan River',
        locationType: 'river',
        stationId: 'perth'
    },
    {
        name: 'East Fremantle (Swan River)',
        lat: -32.0397,
        lng: 115.7677,
        region: 'Swan River',
        locationType: 'river',
        stationId: 'fremantle'
    },
    {
        name: 'Point Walter (Swan River)',
        lat: -32.0108,
        lng: 115.7989,
        region: 'Swan River',
        locationType: 'river',
        stationId: 'fremantle'
    },
    {
        name: 'Claremont Jetty (Swan River)',
        lat: -31.9843,
        lng: 115.7782,
        region: 'Swan River',
        locationType: 'river',
        stationId: 'perth'
    },
    
    // Canning River Region
    {
        name: 'Shelley Foreshore (Canning River)',
        lat: -32.0298,
        lng: 115.8568,
        region: 'Canning River',
        locationType: 'river',
        stationId: 'perth'
    },
    {
        name: 'Riverton Bridge (Canning River)',
        lat: -32.0324,
        lng: 115.8945,
        region: 'Canning River',
        locationType: 'river',
        stationId: 'perth'
    },
    {
        name: 'Deep Water Point (Canning River)',
        lat: -32.0197,
        lng: 115.8712,
        region: 'Canning River',
        locationType: 'river',
        stationId: 'perth'
    },
    
    // Perth Coast Region
    {
        name: 'Cottesloe Groyne',
        lat: -31.9959,
        lng: 115.7557,
        region: 'Perth Coast',
        locationType: 'breakwater',
        stationId: 'fremantle'
    },
    {
        name: 'North Mole (Fremantle)',
        lat: -32.0545,
        lng: 115.7373,
        region: 'Perth Coast',
        locationType: 'breakwater',
        stationId: 'fremantle'
    },
    {
        name: 'Trigg Beach',
        lat: -31.8675,
        lng: 115.7554,
        region: 'Perth Coast',
        locationType: 'beach',
        stationId: 'hillarys'
    },
    {
        name: 'Hillarys Boat Harbour',
        lat: -31.8239,
        lng: 115.7402,
        region: 'Perth Coast',
        locationType: 'breakwater',
        stationId: 'hillarys'
    },
    {
        name: 'Woodman Point',
        lat: -32.1244,
        lng: 115.7520,
        region: 'Perth Coast',
        locationType: 'beach',
        stationId: 'fremantle'
    }
];

// Open-Meteo API integration
export async function getWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation,rain,cloud_cover,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,rain_sum,wind_speed_10m_max&timezone=Australia%2FPerth&forecast_days=7`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather API failed');
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

export async function getMarineData(lat, lon) {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period&hourly=wave_height,wave_direction,wave_period&daily=wave_height_max,wave_direction_dominant,wave_period_max&timezone=Australia%2FPerth&forecast_days=7`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Marine API failed');
        return await response.json();
    } catch (error) {
        console.error('Error fetching marine data:', error);
        return null;
    }
}

// Calculate landscape data for animation
export function calculateLandscapeData(weatherData, marineData, tideData) {
    const current = weatherData?.current || {};
    const marine = marineData?.current || {};
    
    const now = new Date();
    const hour = now.getHours();
    
    return {
        time: hour,
        tide: tideData?.heightPercent || 50,
        windSpeed: Math.round(current.wind_speed_10m || 10),
        windDir: current.wind_direction_10m || 90,
        rain: current.rain || 0,
        clouds: current.cloud_cover || 20,
        moonPhase: getMoonPhase(now),
        waveHeight: marine.wave_height || 0.5,
        temperature: current.temperature_2m || 20
    };
}

// Calculate moon phase (0 = new, 0.5 = full, 1 = new)
function getMoonPhase(date) {
    const knownNewMoon = new Date('2000-01-06').getTime();
    const synodicMonth = 29.530588853; // days
    
    const days = (date.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);
    const phase = (days % synodicMonth) / synodicMonth;
    
    return phase;
}

// Get tide state info
export function getTideStateInfo(tideMovement) {
    let state = 'Still';
    let arrow = '-';
    let color = 'white';
    let flow = 0;
    
    if (tideMovement > 0.01) {
        state = 'Incoming';
        arrow = '↑';
        color = '#4fc3f7';
        flow = 1;
    } else if (tideMovement < -0.01) {
        state = 'Outgoing';
        arrow = '↓';
        color = '#ff8a65';
        flow = -1;
    }
    
    return { state, arrow, color, flow };
}

// Get landscape type for location
export function getLandscapeType(locationType) {
    const mapping = {
        'river': 'river',
        'estuary': 'estuary',
        'beach': 'beach',
        'breakwater': 'breakwater',
        'reef': 'breakwater',
        'lake': 'lake'
    };
    
    return mapping[locationType] || 'beach';
}
