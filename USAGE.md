# FishingTime Usage Guide

## Quick Start

### Running Locally

1. **Start a local web server** (required for ES6 modules):
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # OR using Node.js
   npx serve
   
   # OR using PHP
   php -S localhost:8000
   ```

2. **Open in browser**:
   ```
   http://localhost:8000
   ```

3. **Select a location** from the dropdown menu

4. **View fishing conditions**:
   - Current tide height
   - Next high and low tides
   - 48-hour tide chart
   - Weather conditions (when online)
   - Marine conditions (when online)
   - Fishing quality score (when online)

## Features

### Tidal Information
- **Current Tide**: Real-time tide height in meters
- **Next High/Low**: Predicted times and heights for upcoming tide changes
- **48-Hour Chart**: Visual representation of tide patterns with high/low markers
- **Location-Specific**: Different tidal patterns for each location

### Weather Conditions
- Temperature and "feels like" temperature
- Wind speed and direction
- Cloud cover percentage
- Humidity
- Precipitation probability

### Marine Conditions
- Wave height in meters
- Wave direction
- Wave period (seconds between waves)
- Sea surface temperature
- Swell height and direction

### Fishing Quality Score
A 0-100 score based on multiple factors:
- **75-100 (Excellent)**: Ideal fishing conditions
- **60-74 (Good)**: Favorable conditions
- **45-59 (Fair)**: Acceptable conditions
- **0-44 (Poor)**: Challenging conditions

Factors considered:
- Tide movement (best near high/low tide changes)
- Wave conditions (moderate waves preferred)
- Wind speed (light to moderate is best)
- Temperature (comfortable range)
- Weather (low rain, partial clouds)

## Available Locations

1. **Fremantle Harbour** - Popular harbor location
2. **Cottesloe Beach** - Famous swimming and fishing beach
3. **City Beach** - Central Perth beach
4. **Scarborough Beach** - Northern beaches
5. **Hillarys Boat Harbour** - Marina and harbor
6. **Swan River (Mouth)** - River entrance
7. **Swan River (Perth)** - Upriver location
8. **Rockingham** - Southern coastal area

## Understanding Tide Predictions

### How It Works
Tides are predicted using harmonic analysis of astronomical forces:
- **M2**: Principal lunar (12.42 hours) - strongest influence
- **S2**: Principal solar (12.00 hours)
- **K1**: Lunar diurnal (23.93 hours)
- **O1**: Lunar diurnal (25.82 hours)
- **N2**: Lunar elliptic (12.66 hours)
- **P1**: Solar diurnal (24.07 hours)

### What's Included
✅ Astronomical tides (gravitational effects)
✅ Local variations by location
✅ High and low tide predictions

### What's NOT Included
❌ Storm surge
❌ Wind effects
❌ Barometric pressure changes
❌ River discharge (for Swan River)
❌ Local weather impacts

**Always check official forecasts and current conditions before heading out!**

## Best Times to Fish

### General Guidelines
1. **Tide Changes**: 1 hour before/after high or low tide
2. **Moving Water**: When tide is actively changing
3. **Early Morning**: Dawn is often productive
4. **Late Afternoon**: Dusk can be good
5. **Weather**: Overcast with light wind
6. **Waves**: Moderate waves (0.5-1.5m)

### Location-Specific Tips

**Fremantle Harbour**
- Good year-round
- Protected from swell
- Watch for boat traffic

**Cottesloe Beach**
- Surf fishing on incoming tide
- Early morning best
- Check swell conditions

**Swan River**
- Calmer conditions
- Less affected by ocean swell
- Tide changes important

**Hillarys Boat Harbour**
- Protected marina
- Consistent conditions
- Tide less critical

## Troubleshooting

### "Weather/Marine data unavailable"
- **Cause**: No internet connection or API blocked
- **Solution**: Tides still work! Weather/marine data will load when online
- **Note**: Fishing score requires all data to calculate

### Tides seem incorrect
- **Check**: Is the correct location selected?
- **Note**: Different locations have different tidal patterns
- **Compare**: With official BoM tide tables for verification

### Page doesn't load
- **Check**: Using a web server (not opening file directly)
- **Requirement**: Must use http://localhost:8000, not file://
- **Browser**: Use modern browser (Chrome, Firefox, Safari, Edge)

### Chart not displaying
- **Check**: Browser console for errors
- **Try**: Refresh the page
- **Browser**: Ensure JavaScript is enabled

## Data Sources

- **Tides**: Harmonic analysis with location-specific constituents
- **Weather**: [Open-Meteo Weather API](https://open-meteo.com)
- **Marine**: [Open-Meteo Marine API](https://marine-api.open-meteo.com)

## Offline Capability

The tidal predictions work entirely offline once the page is loaded:
- Harmonic calculations done in browser
- No server needed for tide calculations
- Weather/marine data requires internet
- Station data cached in browser

## Updates and Refreshes

- **Automatic**: Page refreshes data every 5 minutes
- **Manual**: Reload page or change location to refresh
- **Tides**: Recalculated in real-time
- **Weather/Marine**: Fetched from API every refresh

## Privacy and Data

- **No tracking**: No analytics or user tracking
- **No accounts**: No login required
- **No storage**: Only temporary browser cache
- **No data sent**: All calculations done locally
- **Public APIs**: Weather/marine from free public APIs

## Limitations

1. **Swan River Accuracy**: River locations less accurate than coast
2. **Short-term Only**: Best for 1-7 day predictions
3. **Weather Effects**: Predictions don't include storm surge
4. **Local Knowledge**: Use in combination with local expertise
5. **Recreational Use**: Not for navigation or safety-critical applications

## Safety Reminders

⚠️ **Important Safety Information**

- Always check official weather forecasts
- Be aware of marine warnings and advisories
- Tell someone where you're going
- Check local regulations and licenses
- Wear appropriate safety gear
- Never fish alone in unfamiliar areas
- Be aware of changing weather conditions
- Watch for dangerous waves and currents
- Stay off rocks in rough conditions

## Further Reading

- [Bureau of Meteorology Tides](http://www.bom.gov.au/oceanography/tides/)
- [Open-Meteo Documentation](https://open-meteo.com/en/docs)
- [Recreational Fishing WA](https://www.fish.wa.gov.au)
- [WA Marine Weather](http://www.bom.gov.au/wa/marine/)

## Support

For issues or questions:
1. Check this guide first
2. Review README.md for technical details
3. Open an issue on GitHub
4. Check browser console for error messages

---

**Happy Fishing! 🎣**

*Remember: This tool is a guide. Always use your judgment and local knowledge for the best fishing experience.*
