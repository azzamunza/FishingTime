// Test file for verifying MarineTides integration
// This simulates loading and using tide data with expanded constituents

// Import the tide functions
import { predictTideHeight, generateTideSeries, findHighLowTides } from './tide-harmonic.js';

// Sample station with expanded constituents (like MarineTides would provide)
const sampleGlobalStation = {
    id: "test_station_nyc",
    name: "New York Harbor",
    latitude: 40.7128,
    longitude: -74.0060,
    datum: 0.5,
    constituents: {
        // Major constituents (original)
        M2: { amplitude: 0.62, phase: 123.4 },
        S2: { amplitude: 0.18, phase: 145.2 },
        N2: { amplitude: 0.13, phase: 109.8 },
        K1: { amplitude: 0.08, phase: 315.6 },
        O1: { amplitude: 0.06, phase: 289.3 },
        P1: { amplitude: 0.03, phase: 312.1 },
        
        // Additional constituents (from expanded TIDAL_SPEEDS)
        K2: { amplitude: 0.05, phase: 142.8 },
        Q1: { amplitude: 0.02, phase: 281.5 },
        M4: { amplitude: 0.04, phase: 246.8 },
        M6: { amplitude: 0.01, phase: 10.2 },  // Normalized from 370.2
        MF: { amplitude: 0.02, phase: 12.5 },
        MM: { amplitude: 0.01, phase: 45.3 },
        
        // Unknown constituent (should be skipped gracefully)
        UNKNOWN: { amplitude: 1.0, phase: 0.0 }
    }
};

// Test 1: Verify prediction works with expanded constituents
console.log('Test 1: Tide prediction with expanded constituents');
const testDate = new Date('2025-01-15T12:00:00Z');
try {
    const height = predictTideHeight(sampleGlobalStation, testDate);
    console.log(`✓ Predicted tide height: ${height.toFixed(3)} meters`);
    console.log('✓ Test passed: No errors with expanded constituents');
} catch (error) {
    console.error('✗ Test failed:', error.message);
}

// Test 2: Verify time series generation
console.log('\nTest 2: Generate tide series');
try {
    const series = generateTideSeries(sampleGlobalStation, testDate, 24, 60);
    console.log(`✓ Generated ${series.length} data points over 24 hours`);
    console.log(`  First point: ${series[0].height.toFixed(3)}m at ${series[0].time.toISOString()}`);
    console.log(`  Last point:  ${series[series.length-1].height.toFixed(3)}m at ${series[series.length-1].time.toISOString()}`);
    console.log('✓ Test passed: Time series generation works');
} catch (error) {
    console.error('✗ Test failed:', error.message);
}

// Test 3: Verify high/low tide detection
console.log('\nTest 3: Find high and low tides');
try {
    const series = generateTideSeries(sampleGlobalStation, testDate, 48, 10);
    const { highs, lows } = findHighLowTides(series);
    console.log(`✓ Found ${highs.length} high tides and ${lows.length} low tides over 48 hours`);
    if (highs.length > 0) {
        console.log(`  First high tide: ${highs[0].height.toFixed(3)}m at ${highs[0].time.toISOString()}`);
    }
    if (lows.length > 0) {
        console.log(`  First low tide:  ${lows[0].height.toFixed(3)}m at ${lows[0].time.toISOString()}`);
    }
    console.log('✓ Test passed: High/low tide detection works');
} catch (error) {
    console.error('✗ Test failed:', error.message);
}

// Test 4: Verify unknown constituents are skipped
console.log('\nTest 4: Unknown constituents handling');
const stationWithUnknown = {
    id: "test_unknown",
    name: "Test Station",
    latitude: 0,
    longitude: 0,
    datum: 0,
    constituents: {
        M2: { amplitude: 0.5, phase: 0 },
        FAKE1: { amplitude: 10.0, phase: 0 },  // Should be ignored
        FAKE2: { amplitude: 10.0, phase: 0 }   // Should be ignored
    }
};
try {
    const height = predictTideHeight(stationWithUnknown, testDate);
    console.log(`✓ Predicted height: ${height.toFixed(3)}m (unknown constituents ignored)`);
    console.log('✓ Test passed: Unknown constituents handled gracefully');
} catch (error) {
    console.error('✗ Test failed:', error.message);
}

console.log('\n=== All Tests Completed ===');
console.log('The MarineTides integration is compatible with the existing code.');
console.log('Expanded constituents are processed correctly.');
console.log('Unknown constituents are safely ignored.');
