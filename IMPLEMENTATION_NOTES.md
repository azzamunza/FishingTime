# Fishing Map Implementation Notes

## Overview
This document describes the implementation of the enhanced fishing-map.html with two-column layout, marine species database, and interactive landscape animations.

## Changes Made

### 1. New Two-Column Layout
- **Left side**: Interactive Leaflet map showing fishing locations around Perth
- **Right side**: Fish species table with:
  - Animated landscape banner at the top
  - Scrollable accordion list of marine species below

### 2. New Files Created

#### `marine-species.js`
Comprehensive database of 15+ marine species found in the Perth region:
- **Fish**: Black Bream, Tailor, Pink Snapper, Flathead, Mulloway, Whiting, Herring, Baldchin Groper, Garfish
- **Crustaceans**: Blue Swimmer Crab, Western King Prawn, Western Rock Lobster, Sand Crab
- **Cephalopods**: Southern Calamari, Southern Keeled Octopus

Each species includes:
- Scientific name
- Category (fish, crab, prawn, squid, crayfish, octopus)
- Basic information (size limits, bag limits, regulations)
- Location types where found
- Best fishing times (time of day, tide, season)
- Detailed rig setup (rod, line, hooks, sinkers, leaders)
- Bait and lure recommendations
- Fishing tactics and tips

#### `fishing-map-app.js`
Application logic module containing:
- Fishing spots array with coordinates and location types
- Open-Meteo weather API integration
- Marine data API integration
- Tide calculation helpers
- Landscape type mappings
- Moon phase calculations

#### Enhanced `animations/FishingLandscape.jsx`
Improved landscape component with:
- **5 landscape types**: Beach, River, Estuary, Breakwater, Lake
- **Location-specific elements**:
  - Beach: Golden sand, distant mountains
  - River: Green grass banks, trees
  - Estuary: Marshy muddy terrain, reeds
  - Breakwater: Rocky rugged shoreline
  - Lake: Calm waters, distant mountain treeline
- **Birds**: Location-appropriate birds (seagulls, pelicans, swans, herons, ducks, terns, cormorants)
- **Tackle box**: Fishing tackle box on jetty
- **Improved fisherman**: Better sitting position and animations
- **Enhanced water**: Different colors per landscape type
- **Better perspective**: Shoreline on right flowing to foreground

### 3. Updated `fishing-map.html`

#### Layout Structure
```
├── Map Section (left column)
│   └── Leaflet map
│
└── Fish Table Section (right column)
    ├── Landscape Banner (animated)
    └── Fish List (scrollable accordion)
```

#### Features
- **Interactive map markers**: Click to select location
- **Weather/tide integration**: Fetches live data from Open-Meteo API
- **Dynamic landscape**: Changes based on location type
- **Species filtering**: Shows only species available at selected location
- **Accordion species list**: 
  - Collapsed: Shows name, image, basic info
  - Expanded: Shows detailed rig info, baits, tactics, best times
- **Responsive design**: Adapts to different screen sizes

## API Integrations

### Open-Meteo Weather API
Fetches 7-day forecast including:
- Temperature, humidity, precipitation
- Wind speed and direction
- Cloud cover
- Weather codes

### Open-Meteo Marine API
Fetches marine conditions:
- Wave height, direction, period
- Sea surface conditions

### Tide Calculations
Uses existing `tide-harmonic.js` module:
- Harmonic tide predictions for Perth stations
- Tide height and movement calculations
- Tide state (incoming/outgoing/slack)

## Location Types and Landscapes

| Location Type | Landscape | Birds | Water Color |
|--------------|-----------|-------|-------------|
| Swan River | River | Swan, Duck, Cormorant | Green |
| Canning River | River | Swan, Heron, Cormorant | Green |
| Perth Coast | Beach | Seagull, Pelican, Tern | Blue |
| Breakwater | Breakwater | Seagull, Cormorant, Tern | Teal |
| Estuary | Estuary | Pelican, Tern, Cormorant | Gray |
| Lake | Lake | Swan, Duck, Heron | Light Blue |

## Testing Instructions

### Local Testing
1. Start a local web server in the repository directory:
   ```bash
   python3 -m http.server 8080
   ```

2. Open in a web browser:
   ```
   http://localhost:8080/fishing-map.html
   ```

3. Test features:
   - Click map markers to select locations
   - Verify landscape changes based on location type
   - Check species list filters to show only local species
   - Expand/collapse species items in accordion
   - Verify weather/tide data loads (requires internet)

### Expected Behavior
1. **Initial load**: Shows all Perth marine species, default landscape
2. **Click marker**: 
   - Updates location info banner
   - Filters species list to location-specific species
   - Changes landscape type (river/beach/estuary/breakwater/lake)
   - Fetches and displays weather/tide data
   - Updates landscape animation with current conditions
3. **Species accordion**: 
   - Click to expand/collapse
   - Shows detailed information when expanded
4. **Landscape animation**:
   - Reflects current weather (clouds, rain, wind)
   - Shows tide level and movement
   - Displays appropriate birds for location
   - Changes terrain/colors based on landscape type

## Known Limitations
- External CDN resources (React, Leaflet, Babel) may be blocked in some testing environments
- Weather/marine APIs require internet connection
- Tide calculations are astronomical only (doesn't account for weather effects)
- Species images are placeholder SVGs (can be replaced with actual photos)

## Future Enhancements
- Add actual species photos
- Include fishing rig diagrams
- Add bait images
- Implement time-of-day selector for landscape
- Add seasonal variations to landscapes
- Include catch reports/statistics
- Add user location detection
- Implement favorite locations feature

## Browser Compatibility
- Modern browsers with ES6 support
- JavaScript must be enabled
- Canvas and SVG support required
- Tested on Chrome, Firefox, Safari, Edge

## Dependencies
- React 18 (CDN)
- React-DOM 18 (CDN)
- Babel Standalone (CDN)
- Leaflet 1.9.4 (CDN)
- OpenStreetMap tiles
- Open-Meteo API (free, no key required)

## Module Structure
```
marine-species.js (export)
    ├── marineSpeciesDatabase[]
    ├── locationTypes{}
    └── getSpeciesForLocation()

fishing-map-app.js (export)
    ├── fishingSpots[]
    ├── getWeatherData()
    ├── getMarineData()
    ├── calculateLandscapeData()
    ├── getTideStateInfo()
    └── getLandscapeType()

FishingLandscape.jsx (export)
    ├── SkyGradient
    ├── Moon
    ├── Clouds
    ├── Water
    ├── Rain
    ├── WindIndicator
    ├── Birds
    ├── TackleBox
    ├── Fisherman
    ├── LandscapeBackground
    └── Landscape (main component)

fishing-map.html
    ├── HTML structure
    ├── CSS styling
    └── React app integration
```

## Performance Notes
- Landscape animations use CSS transitions for smooth performance
- Species list uses React for efficient rendering
- API calls are throttled to prevent excessive requests
- Map tiles are cached by Leaflet
- SVG graphics for landscape are lightweight

## Accessibility
- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- High contrast text on backgrounds
- Responsive design for various screen sizes
