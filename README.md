# FishingTime 🎣

A comprehensive fishing conditions forecasting system for Perth, Western Australia. FishingTime combines tidal predictions, weather data, and marine conditions to help you find the best time to go fishing at your favorite locations.

## Features

- **Tidal Predictions**: Harmonic analysis-based tide calculations for accurate height predictions and high/low tide times
- **Weather Data**: Real-time weather conditions including temperature, wind, and precipitation
- **Marine Conditions**: Wave height, sea temperature, swell information
- **Fishing Score**: Intelligent scoring system that evaluates current conditions for fishing quality
- **Multiple Locations**: Support for Perth coastal beaches and Swan River locations
- **48-Hour Forecast**: Visual tide chart showing the next 48 hours
- **Offline Capable**: Works offline once data is loaded (tidal calculations are entirely client-side)

## How It Works

### Tidal Harmonic Analysis

FishingTime uses harmonic analysis to predict tides. This method calculates tide heights by summing the contributions of multiple tidal constituents (gravitational forces from the moon and sun):

```
h(t) = datum + Σ [A × cos(ω×t - φ)]
```

Where:
- **h(t)** = tide height at time t
- **A** = amplitude of the constituent (in meters)
- **ω** = angular speed of the constituent (degrees/hour)
- **φ** = phase lag (degrees)
- **t** = time in hours since epoch (2000-01-01 00:00:00 UTC)

The main tidal constituents used are:
- **M2**: Principal lunar semidiurnal (12.42 hours) - most important
- **S2**: Principal solar semidiurnal (12.00 hours)
- **K1**: Lunar diurnal (23.93 hours)
- **O1**: Lunar diurnal (25.82 hours)
- **N2**: Larger lunar elliptic semidiurnal (12.66 hours)
- **P1**: Solar diurnal (24.07 hours)

### Weather and Marine Integration

Weather and marine data are fetched from the Open-Meteo API, which provides:
- Temperature, wind speed, and direction
- Cloud cover and precipitation probability
- Wave height, period, and direction
- Sea surface temperature
- Swell information

### Fishing Quality Score

The fishing score (0-100) evaluates conditions based on:
- **Tide Movement**: Best fishing near high/low tide changes (+15 points)
- **Wave Conditions**: Moderate waves (0.3-1.5m) are ideal (+10 points)
- **Wind**: Light to moderate wind is best (+10 points)
- **Temperature**: Comfortable range (18-28°C) (+5 points)
- **Weather**: Low rain probability and partial cloud cover (+10 points)

Score Ranges:
- **75-100**: Excellent conditions
- **60-74**: Good conditions
- **45-59**: Fair conditions
- **0-44**: Poor conditions

## File Structure

```
FishingTime/
├── index.html           # Main HTML interface
├── app.js               # Main application logic
├── tide-harmonic.js     # Tidal calculation module
├── weather-marine.js    # Weather and marine data module
├── stations.json        # Station data with harmonic constants
├── styles.css           # Application styles
└── README.md            # This file
```

## Usage

### Running the Application

1. Clone the repository
2. Serve the files using a local web server (required for ES6 modules):
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```
3. Open `http://localhost:8000` in your browser
4. Select a location from the dropdown
5. View current conditions and fishing score

### Adding a New Station

To add a new tidal station, edit `stations.json`:

```json
{
  "id": "your_station_id",
  "name": "Station Name",
  "latitude": -31.9688,
  "longitude": 115.7673,
  "datum": 0.0,
  "constituents": {
    "M2": { "amplitude": 0.25, "phase": 123.4 },
    "S2": { "amplitude": 0.08, "phase": 110.1 },
    "K1": { "amplitude": 0.14, "phase": 45.2 },
    "O1": { "amplitude": 0.11, "phase": 210.9 },
    "N2": { "amplitude": 0.05, "phase": 115.3 },
    "P1": { "amplitude": 0.04, "phase": 42.8 }
  }
}
```

#### Required Data for Each Constituent

- **amplitude**: Tide amplitude in meters (always positive)
- **phase**: Phase lag in degrees (0-360), referenced to UTC/GMT

#### Where to Get Harmonic Constants

1. **Official Tide Gauges**: National agencies (e.g., BoM Australia) publish harmonic constants
2. **Global Tide Models**: FES2014, TPXO9, etc. (requires extraction tools)
3. **Existing Stations**: Interpolate from nearby stations (less accurate)
4. **Tidal Analysis**: If you have historical tide data, you can perform harmonic analysis

⚠️ **Note**: Harmonic constants must be accurate for the specific location. Using constants from distant stations will produce incorrect predictions.

## Data Update Frequency

- **Tidal Predictions**: No updates needed (harmonic constants are long-term stable)
- **Weather/Marine Data**: Automatically refreshed every 5 minutes while the app is open
- **Harmonic Constants**: Update only if:
  - New official data becomes available
  - Station location changes
  - Improved model data is released

## Accuracy and Limitations

### Good Accuracy ✓
- Open coast locations with 4+ constituents
- Short-term predictions (7-14 days)
- Astronomical tide calculations

### Limited Accuracy ⚠️
- **Swan River locations**: River systems have complex dynamics; official gauge data recommended
- **Estuaries**: Local effects may not be captured by harmonic analysis alone
- **Long-term predictions**: Accuracy decreases beyond 30 days

### Not Included ⚠️
- **Storm surge**: Weather-driven sea level changes
- **Wind setup**: Wind-driven water level changes
- **Barometric effects**: Atmospheric pressure impacts
- **River discharge**: Freshwater flow effects (for river locations)
- **Nodal corrections**: Long-period astronomical variations (can be added for better accuracy)

### Best Practices
1. Always check official tide predictions and weather forecasts
2. Consider local knowledge and conditions
3. Be aware of weather warnings and marine advisories
4. Use predictions as a guide, not absolute values
5. For critical applications, consult official sources

## Technical Details

### Browser Compatibility

- Modern browsers with ES6 module support
- Chrome 61+, Firefox 60+, Safari 11+, Edge 16+

### API Dependencies

- **Open-Meteo Weather API**: Free, no API key required
- **Open-Meteo Marine API**: Free, no API key required

### Performance

- Tidal calculations: < 1ms per prediction
- Full 7-day forecast: < 10ms
- Initial data load: 1-3 seconds (network dependent)

## Development

### Making Changes

1. **Tidal Module** (`tide-harmonic.js`): Modify calculation algorithms
2. **Weather Module** (`weather-marine.js`): Add new weather parameters
3. **App Logic** (`app.js`): Change display logic and user interface
4. **Styles** (`styles.css`): Customize appearance
5. **Stations** (`stations.json`): Add/modify locations

### Testing

Test tide predictions against official sources:
- [BoM Australian Tide Predictions](http://www.bom.gov.au/oceanography/tides/)
- Local tide tables

## Contributing

To contribute:
1. Fork the repository
2. Create a feature branch
3. Test your changes thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Credits

- Tidal calculations based on harmonic analysis principles
- Weather and marine data from [Open-Meteo](https://open-meteo.com)
- Inspired by traditional tide prediction methods

## Disclaimer

⚠️ **Important**: This application provides tide predictions for recreational purposes only. Predictions are astronomical tides and do not include weather effects. Always consult official sources, current conditions, and local knowledge before engaging in water activities. The developers are not responsible for any consequences of using this information.
