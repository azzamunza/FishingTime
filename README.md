# Fishing Time

A web-based tool for identifying the best times of day to go fishing at any location, using real-time weather, marine conditions, and astronomical tide predictions.

## Features

- **24-Hour Circular Visualization**: Full-day fishing forecast displayed on an intuitive circular chart
- **Client-Side Tide Prediction**: Harmonic tide calculations without external API dependencies
- **Customizable Datasets**: Enable/disable and adjust acceptable ranges for each environmental factor
- **Real-Time Weather & Marine Data**: Integration with Open-Meteo APIs for current conditions
- **Multiple Australian Stations**: Pre-configured tide stations across Western Australia and beyond

## How It Works

### Fishing Suitability Calculation

The fishing score at any given time is calculated by evaluating multiple environmental factors:

1. **Tide Height**: Fish often feed more actively during certain tide heights, particularly mid-range tides
2. **Tide Movement**: Fish activity typically increases during moving tides (rising or falling)
3. **Wind Speed**: Calm to moderate winds are generally preferred for fishing
4. **Temperature**: Comfortable air temperatures make for better fishing experiences
5. **Cloud Cover**: Light cloud cover can improve fishing, while heavy clouds may reduce it
6. **Barometric Pressure**: Stable or rising pressure often correlates with better fishing
7. **Wave Height**: Lower waves are typically better for shore and boat fishing

Each factor is normalized to a 0-1 score based on:
- **Minimum acceptable value**: Below this, score = 0
- **Ideal range**: Within this range, score = 1
- **Maximum acceptable value**: Above this, score = 0
- **Transition zones**: Linear interpolation between min/ideal and ideal/max

The overall fishing score is the **average of all enabled datasets**.

### How Tides Are Computed

Tides are predicted using **harmonic analysis**, a method that decomposes tidal patterns into constituent waves:

#### Harmonic Constituents

Each tide station has amplitude and phase data for major tidal constituents:

- **M2** (Principal lunar semidiurnal): 12.42-hour period - the main lunar tide
- **S2** (Principal solar semidiurnal): 12-hour period - the main solar tide
- **N2** (Larger lunar elliptic semidiurnal): 12.66-hour period - lunar orbital variation
- **K1** (Lunar diurnal): 23.93-hour period - luni-solar declination
- **O1** (Lunar diurnal): 25.82-hour period - principal lunar declination
- **P1** (Solar diurnal): 24.07-hour period - principal solar declination

#### Prediction Formula

For a given time `t` (hours from epoch J2000.0), the tide height is calculated as:

```
height = datum + Σ(amplitude_i × cos(speed_i × t + phase_i))
```

Where:
- `datum` is the vertical offset for the station
- `amplitude_i` is the amplitude of constituent i (in meters)
- `speed_i` is the angular speed of constituent i (degrees per hour)
- `phase_i` is the phase offset of constituent i (degrees)

This produces an **astronomical tide prediction** - the tide that would occur based purely on celestial mechanics.

### Tide Movement Calculation

Tide movement (rate of change) is calculated using a numerical derivative:

```
movement = (height_after - height_before) / time_delta
```

This gives us meters per hour, indicating how fast the tide is rising or falling.

## Adding New Tide Stations

To add a new tide station to `stations.json`:

1. **Obtain Harmonic Constants**: Get amplitude and phase data for at least M2, S2, K1, and O1 constituents
   - Sources: National tide agencies, oceanographic institutions, published tide tables
   - For Australia: Bureau of Meteorology, Australian Hydrographic Office

2. **Format the Station Entry**:
```json
{
  "id": "unique_station_id",
  "name": "Station Display Name",
  "latitude": -32.055,
  "longitude": 115.745,
  "datum": 0,
  "constituents": {
    "M2": { "amplitude": 0.25, "phase": 123.4 },
    "S2": { "amplitude": 0.08, "phase": 110.1 },
    "K1": { "amplitude": 0.14, "phase": 45.2 },
    "O1": { "amplitude": 0.11, "phase": 210.9 },
    "N2": { "amplitude": 0.05, "phase": 105.3 },
    "P1": { "amplitude": 0.05, "phase": 43.7 }
  }
}
```

3. **Add to stations.json**: Insert your station object into the array

4. **Test**: Load the page and verify the nearest station is selected correctly for your location

### Station Data Quality

- **Amplitudes** are in meters
- **Phases** are in degrees (0-360)
- More constituents = better accuracy (minimum 4 recommended, 6+ ideal)
- Coastal stations typically have better-defined constituents than estuarine stations
- River systems (like Swan River) may have less accurate predictions due to freshwater influence

## Accuracy Limitations

### What This Tool Predicts

✅ **Astronomical tides** - gravitational effects of Moon and Sun  
✅ **General weather patterns** - temperature, wind, clouds, pressure  
✅ **Ocean wave conditions** - height, period, direction  
✅ **Combined environmental scoring** - integrated suitability metric

### What This Tool Does NOT Account For

❌ **Storm surge** - water level rise from low pressure systems and wind  
❌ **Wind-driven tide effects** - local water level changes from sustained winds  
❌ **Freshwater influence** - river discharge affecting salinity and flow  
❌ **Seiche effects** - standing waves in enclosed bodies of water  
❌ **Fish species behavior** - species-specific feeding patterns and preferences  
❌ **Moon phase** - lunar illumination effects on fish activity  
❌ **Swell propagation** - long-period waves from distant storms  
❌ **Local currents** - rips, eddies, and coastal circulation  

### Accuracy Expectations

- **Open Coast Stations**: Generally accurate within ±10cm for tide height
- **Harbours**: Accurate within ±15cm for tide height
- **Estuaries/Rivers**: Less accurate, may vary ±20-30cm or more
- **Swan River**: Astronomical tide only; actual water levels heavily influenced by river flow
- **Timing**: High/low tide times typically accurate within ±15 minutes for open coast

## Usage

1. **Enter Location**: Input latitude and longitude for your fishing spot
2. **Select Timezone**: Choose appropriate timezone for time display
3. **Fetch Data**: Click "Get Fishing Conditions" to load forecast
4. **Customize**: Use the dataset controls to enable/disable factors and adjust ideal ranges
5. **Read Chart**: Brighter areas indicate better fishing conditions

### Chart Orientation

- **12:00 Noon**: Top of circle
- **12:00 Midnight**: Bottom of circle
- **6:00 AM**: Left side
- **6:00 PM**: Right side

The chart progresses clockwise through the day.

## Technical Details

### Data Sources

- **Weather API**: [Open-Meteo](https://open-meteo.com/) - Temperature, wind, cloud cover, pressure, precipitation
- **Marine API**: [Open-Meteo Marine](https://marine-api.open-meteo.com/) - Wave height, sea surface temperature, swell
- **Tide Calculations**: Client-side harmonic analysis (no API calls)

### Browser Compatibility

- Modern browsers with ES6 module support
- JavaScript must be enabled
- Canvas API support required
- Works offline after initial page load (except for weather/marine data)

### Files

- `index.html` - Main application
- `tide-harmonic.js` - Tide prediction module (ES6)
- `stations.json` - Tide station harmonic constants
- `guide.md` - Development specification
- `beachtime.html` - Reference implementation for beach conditions

## Development

This project was built following the specification in `guide.md`, with inspiration from the existing `beachtime.html` implementation.

### Design Principles

1. **Reuse existing patterns**: Location search, API construction, data handling from beachtime.html
2. **Extend thoughtfully**: 24-hour circular chart instead of semicircular arc
3. **Client-side focus**: No server required, no external tide API dependencies
4. **User control**: All datasets adjustable, enabling personal preference tuning

## License

This is an open-source project. Please check the repository for license details.

## Contributing

Contributions welcome! Areas for improvement:

- Additional tide stations worldwide
- Moon phase integration
- Species-specific scoring profiles
- Historical catch data overlay
- Weather forecast accuracy indicators
- Mobile app version

## Acknowledgments

- **Open-Meteo**: For providing free weather and marine APIs
- **Tide Station Data**: Derived from publicly available harmonic constant tables
- **beachtime.html**: Original beach conditions visualization that inspired this project
