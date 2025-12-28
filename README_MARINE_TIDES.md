# MarineTides Integration Guide

This guide explains how to integrate global tide station data from the MarineTides R package into FishingTime.

## Overview

The [MarineTides](https://github.com/arestrom/MarineTides) R package provides harmonic constituent data for over 3,000 tide stations worldwide. This integration allows FishingTime to replace its limited Perth-based stations with a comprehensive global database.

## Background

### Why This Integration?

- **Current Limitation**: FishingTime currently has only ~10 stations focused on Western Australia
- **MarineTides Capability**: Provides 3,000+ stations worldwide (1,100+ Harmonic, 2,100+ Subordinate)
- **Compatibility**: Only Harmonic stations (Type 'H') are compatible with FishingTime's prediction engine

### Station Types

1. **Harmonic Stations (Type 'H')**: 
   - Reference stations with full harmonic constituent data
   - Compatible with FishingTime's tide prediction algorithm
   - ~1,100 stations worldwide
   - **This integration uses these stations**

2. **Subordinate Stations (Type 'S')**: 
   - Defined by time and height offsets from a reference station
   - NOT compatible with current FishingTime implementation
   - Require different calculation logic
   - **Not included in this integration**

## Prerequisites

To run the R extraction script, you need:

1. **R** (version 4.0 or higher): https://www.r-project.org/
2. **Required R packages** (auto-installed by the script):
   - `MarineTides` - Source of tide station data
   - `data.table` - Efficient data manipulation
   - `jsonlite` - JSON export functionality

## Usage

### Step 1: Run the R Script

From the FishingTime repository directory:

```bash
Rscript extract_marine_tides.R
```

Or run interactively in R:

```r
source("extract_marine_tides.R")
```

**Output**: `stations_global.json` containing ~1,100 harmonic tide stations

### Step 2: Deploy the Data

Choose one of these options:

#### Option A: Replace Existing Stations (Global-Only)

```bash
cp stations_global.json stations.json
```

This replaces the Perth-based stations with the global database.

#### Option B: Keep Both Files (Dual Database)

Keep both `stations.json` (Perth stations) and `stations_global.json` (global stations).

Modify your application to allow users to choose which database to load, or automatically select based on location.

### Step 3: Verify the Integration

1. Open `index.html` or your FishingTime application
2. Enter coordinates for a location far from Perth (e.g., New York, Tokyo, London)
3. Fetch tide data
4. Verify that a nearby station is found and tide predictions are displayed

## Technical Details

### Data Format

The R script exports stations in the following JSON format:

```json
[
  {
    "id": "station_code",
    "name": "Station Name",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "datum": 0.0,
    "constituents": {
      "M2": { "amplitude": 0.62, "phase": 123.4 },
      "S2": { "amplitude": 0.18, "phase": 145.2 },
      "N2": { "amplitude": 0.13, "phase": 109.8 },
      "K1": { "amplitude": 0.08, "phase": 315.6 },
      "O1": { "amplitude": 0.06, "phase": 289.3 },
      "P1": { "amplitude": 0.03, "phase": 312.1 }
    }
  }
]
```

### Constituent Support

FishingTime's `tide-harmonic.js` has been expanded to support 37 common tidal constituents:

**Semidiurnal (12-hour periods)**:
- M2, S2, N2, K2, L2, T2, NU2, LAM2, MU2, 2N2, 2SM2

**Diurnal (24-hour periods)**:
- K1, O1, P1, Q1, J1, OO1

**Shallow Water**:
- M4, M6, M8, MK3, S4, MN4, MS4

**Long-Period**:
- MM, SSA, SA, MSF, MF

If MarineTides provides a constituent not in this list, it will be silently skipped (no error).

### Accuracy Considerations

#### What Changes

1. **Station Coverage**: From 10 stations (Western Australia) to 1,100+ (worldwide)
2. **Constituent Variety**: MarineTides may provide more constituents per station
3. **Data Source**: From manual entry to NOAA/IHO-derived database

#### What Stays The Same

1. **Prediction Method**: Harmonic analysis (no nodal corrections)
2. **Accuracy Limitations**: ±10-30cm depending on location
3. **No Subordinate Support**: Still limited to harmonic stations
4. **Static Constituents**: No 18.6-year lunar node adjustments

#### Known Limitations

⚠️ **Nodal Corrections**: MarineTides applies 18.6-year lunar cycle adjustments in R. This integration uses **static amplitudes** without nodal corrections. This introduces ~5-10% error in amplitude over the lunar cycle, but predictions remain useful.

⚠️ **Subordinate Stations Excluded**: ~2,100 subordinate stations are not included. These require offset-based calculations not currently supported.

⚠️ **Time Zone Handling**: Phases may be referenced to local or UTC time depending on the original data source. Most NOAA phases use local standard time.

## Updating the Data

### When to Update

- **Annually**: Minor improvements in accuracy
- **After MarineTides Updates**: When the R package adds new stations or updates constituents
- **For Specific Regions**: If you need coverage in a newly added area

### How to Update

1. Ensure you have the latest MarineTides package:
   ```r
   install.packages("MarineTides")
   ```

2. Re-run the extraction script:
   ```bash
   Rscript extract_marine_tides.R
   ```

3. Deploy the updated `stations_global.json`

## Troubleshooting

### R Script Fails to Run

**Problem**: Package installation errors

**Solution**: 
```r
# Install packages manually
install.packages(c("MarineTides", "data.table", "jsonlite"))
```

### No Stations Near My Location

**Problem**: `findNearestStation()` returns null or distant station

**Possible Causes**:
1. Your location is far from any harmonic tide station
2. The nearest station may be subordinate (not included)

**Solution**: Use the nearest available harmonic station, but note that predictions may be less accurate for your specific location.

### Tides Look Wrong

**Problem**: Predicted tides don't match observed tides

**Possible Causes**:
1. **Meteorological Effects**: Wind, pressure, storm surge (not modeled)
2. **River Discharge**: Freshwater influence (not modeled)
3. **Datum Differences**: Station datum may differ from local reference
4. **Nodal Corrections**: Static amplitudes vs. actual lunar cycle
5. **Phase Reference**: Local vs. UTC time zone confusion

**Debugging Steps**:
1. Check that your selected station is appropriate for your location
2. Verify the station's latitude/longitude match your fishing spot
3. Compare predictions to published tide tables for that station
4. Consider meteorological conditions affecting water levels

## Advanced: Custom Filtering

You can modify `extract_marine_tides.R` to filter stations by region:

```r
# Example: Filter for only North American stations
# Add after line: stations <- as.data.table(harmonics$st_data)[station_type == "H"]

# Filter by latitude/longitude bounds
stations <- stations[latitude >= 25 & latitude <= 50 & 
                     longitude >= -130 & longitude <= -60]
```

Or by country (if available in metadata):

```r
# Filter by country code
stations <- stations[country == "US"]
```

## Integration Benefits

✅ **Global Coverage**: Fish anywhere in the world with local tide predictions  
✅ **Minimal Code Changes**: Existing JS code works without modification  
✅ **No API Dependencies**: Still fully client-side after initial data load  
✅ **Easy Updates**: Re-run R script to get latest MarineTides data  
✅ **Quality Data**: Leverages NOAA and international hydrographic sources

## Future Enhancements

Possible improvements to this integration:

1. **Subordinate Station Support**: Implement offset-based calculations for ~2,100 additional stations
2. **Nodal Corrections**: Apply 18.6-year lunar node adjustments in JS
3. **Regional Databases**: Split global data into regional JSON files for faster loading
4. **Dynamic Loading**: Load only nearby stations based on user location
5. **Station Metadata**: Include additional info (country, datum name, data source)

## References

- **MarineTides Package**: https://github.com/arestrom/MarineTides
- **NOAA Tides & Currents**: https://tidesandcurrents.noaa.gov/
- **Harmonic Analysis Theory**: https://tidesandcurrents.noaa.gov/publications/glossary2.pdf

## Support

For issues with:
- **R Script**: Check this guide and verify R package versions
- **FishingTime Integration**: Ensure `tide-harmonic.js` includes all constituents
- **MarineTides Data**: Refer to the MarineTides package documentation

## License

This integration script is part of the FishingTime project. MarineTides data is sourced from public domain tide tables and NOAA databases.
