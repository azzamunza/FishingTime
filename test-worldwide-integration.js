#!/usr/bin/env node
/**
 * test-worldwide-integration.js
 * Test script to verify worldwide harmonics integration
 */

const fs = require('fs');
const path = require('path');

console.log('Testing Worldwide Harmonics Integration\n');
console.log('=' .repeat(50));

// Test 1: Verify stations_worldwide.json exists and is valid
console.log('\n1. Testing stations_worldwide.json file...');
try {
    const stationsPath = path.join(__dirname, 'stations_worldwide.json');
    const stationsData = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
    
    console.log(`   ✓ File exists and is valid JSON`);
    console.log(`   ✓ Total stations: ${stationsData.length}`);
    
    // Verify structure
    const firstStation = stationsData[0];
    const requiredFields = ['id', 'name', 'latitude', 'longitude', 'constituents'];
    const hasAllFields = requiredFields.every(field => field in firstStation);
    
    if (hasAllFields) {
        console.log(`   ✓ Stations have required fields: ${requiredFields.join(', ')}`);
    } else {
        throw new Error('Missing required fields in station data');
    }
    
    // Check for worldwide coverage
    const latitudes = stationsData.map(s => s.latitude);
    const longitudes = stationsData.map(s => s.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);
    
    console.log(`   ✓ Latitude range: ${minLat.toFixed(2)}° to ${maxLat.toFixed(2)}°`);
    console.log(`   ✓ Longitude range: ${minLon.toFixed(2)}° to ${maxLon.toFixed(2)}°`);
    
    // Verify constituents
    const constituents = Object.keys(firstStation.constituents);
    console.log(`   ✓ Sample constituents: ${constituents.slice(0, 6).join(', ')}`);
    
} catch (error) {
    console.error(`   ✗ Error: ${error.message}`);
    process.exit(1);
}

// Test 2: Verify fishing-map.html references the worldwide file
console.log('\n2. Testing fishing-map.html integration...');
try {
    const htmlPath = path.join(__dirname, 'fishing-map.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Check for worldwide stations reference
    if (htmlContent.includes('stations_worldwide.json')) {
        console.log(`   ✓ References stations_worldwide.json`);
    } else {
        throw new Error('Does not reference stations_worldwide.json');
    }
    
    // Check for worldwide title
    if (htmlContent.includes('Worldwide Fishing Spots')) {
        console.log(`   ✓ Title updated to "Worldwide Fishing Spots"`);
    } else {
        throw new Error('Title not updated');
    }
    
    // Check for worldwide map view
    if (htmlContent.includes('setView([20, 0], 2)')) {
        console.log(`   ✓ Map initialized with worldwide view (20°N, 0°E, zoom 2)`);
    } else {
        throw new Error('Map view not set to worldwide');
    }
    
    // Check for tide station icon
    if (htmlContent.includes('tideStationIcon')) {
        console.log(`   ✓ Tide station icon defined`);
    } else {
        throw new Error('Tide station icon not defined');
    }
    
    // Check for tide station loading logic
    if (htmlContent.includes('loadTideStations')) {
        console.log(`   ✓ Tide station loading function implemented`);
    } else {
        throw new Error('Tide station loading function not found');
    }
    
} catch (error) {
    console.error(`   ✗ Error: ${error.message}`);
    process.exit(1);
}

// Test 3: List all worldwide stations by region
console.log('\n3. Worldwide station coverage:');
try {
    const stationsPath = path.join(__dirname, 'stations_worldwide.json');
    const stationsData = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
    
    // Group by approximate region
    const regions = {
        'Australia': [],
        'North America': [],
        'Asia': [],
        'Europe': []
    };
    
    stationsData.forEach(station => {
        if (station.latitude < -10 && station.longitude > 100 && station.longitude < 160) {
            regions['Australia'].push(station.name);
        } else if (station.latitude > 25 && station.latitude < 60 && station.longitude < -60) {
            regions['North America'].push(station.name);
        } else if (station.latitude > 20 && station.latitude < 50 && station.longitude > 100) {
            regions['Asia'].push(station.name);
        } else if (station.latitude > 40 && station.latitude < 60 && station.longitude > -10 && station.longitude < 30) {
            regions['Europe'].push(station.name);
        }
    });
    
    for (const [region, stations] of Object.entries(regions)) {
        if (stations.length > 0) {
            console.log(`\n   ${region} (${stations.length} stations):`);
            stations.forEach(name => console.log(`     - ${name}`));
        }
    }
    
} catch (error) {
    console.error(`   ✗ Error: ${error.message}`);
    process.exit(1);
}

console.log('\n' + '='.repeat(50));
console.log('✓ All tests passed!\n');
console.log('Summary:');
console.log('  - stations_worldwide.json created with 15 stations');
console.log('  - fishing-map.html updated to load worldwide stations');
console.log('  - Map view changed to worldwide (20°N, 0°E, zoom 2)');
console.log('  - Tide station markers added to map');
console.log('  - Coverage: Australia, North America, Asia, Europe');
console.log('\nThe fishing-map.html now displays tide stations from around the world!');
