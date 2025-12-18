
# **Developer Brief: `fishingtime.html` Webpage**

## **1. Objective**

Create a new webpage named **`index.html`** that is functionally and visually consistent with the existing **`beachtime.html`** site, but focused on identifying **the best times of day to go fishing** at a selected location.

The page must:

* Reuse the **same location search**, **API construction**, and **data-handling patterns** used in `beachtime.html`
* Display fishing suitability using **radial charts**, **ideal ranges**, and **scoring logic**
* Extend visualisation to a **full 24-hour circular graph**
* Allow users to **enable/disable datasets** and adjust **acceptable and ideal ranges**

The page should feel like a **sibling**, not a redesign.

---

## **2. Reference Implementation (Critical)**

Before development begins, review and understand:

* Live site:
  [https://azzamunza.github.io/beachtime/](https://azzamunza.github.io/beachtime/)
* Existing logic in `beachtime.html`:

  * Location search & geocoding
  * API URL construction using lat/lon/timezone
  * Radial chart rendering
  * Dataset normalisation
  * Ideal range scoring
  * UI controls for adjusting ranges

**Assumption:**
Any behaviour not explicitly overridden below should match `beachtime.html`.

---

## **3. Data Sources (No Change in Pattern)**

`fishingtime.html` must construct API URLs **exactly the same way** as `beachtime.html`, inserting latitude, longitude, and timezone dynamically.

### **Weather API**

```text
https://api.open-meteo.com/v1/forecast
?latitude={lat}
&longitude={lon}
&hourly=
temperature_2m,
wind_speed_10m,
wind_direction_10m,
cloud_cover,
surface_pressure,
pressure_msl,
precipitation_probability,
rain,
relative_humidity_2m,
apparent_temperature
&timezone={timezone}
```

### **Marine API**

```text
https://marine-api.open-meteo.com/v1/marine
?latitude={lat}
&longitude={lon}
&hourly=
wave_height,
sea_surface_temperature,
wave_direction,
wave_period,
tertiary_swell_wave_height,
tertiary_swell_wave_period,
tertiary_swell_wave_direction
&timezone={timezone}
```

---

## **4. New Dataset: Tides (Client-Side Harmonic Model)**

### **Design Constraint**

* No runtime API calls for tides
* Tides must be calculated client-side using harmonic constants
* All harmonic data is stored locally in JSON

### **Data File: `stations.json`**

Each station entry must include:

| Field          | Description                           |
| -------------- | ------------------------------------- |
| `id`           | Unique string identifier              |
| `name`         | Display name                          |
| `latitude`     | Decimal degrees                       |
| `longitude`    | Decimal degrees                       |
| `datum`        | Vertical offset in meters (default 0) |
| `constituents` | Harmonic data                         |

**Minimum constituents:**

* M2
* S2
* K1
* O1

```json
{
  "id": "fremantle",
  "name": "Fremantle Harbour",
  "latitude": -32.055,
  "longitude": 115.745,
  "datum": 0,
  "constituents": {
    "M2": { "amplitude": 0.25, "phase": 123.4 },
    "S2": { "amplitude": 0.08, "phase": 110.1 },
    "K1": { "amplitude": 0.14, "phase": 45.2 },
    "O1": { "amplitude": 0.11, "phase": 210.9 }
  }
}
```

---

## **5. JavaScript Module: `tide-harmonic.js`**

### **Purpose**

Provide tide height predictions and high/low tide events for use in fishing suitability scoring.

### **Constraints**

* ES6 modules
* No external libraries
* UTC time internally
* Browser compatible

### **Required Constants**

```js
const TIDAL_SPEEDS = {
  M2: 28.9841042,
  S2: 30.0,
  N2: 28.4397295,
  K1: 15.0410686,
  O1: 13.9430356,
  P1: 14.9589314
};
```

### **Required Functions**

* `loadStations(url)`
* `predictTideHeight(station, date)`
* `generateTideSeries(station, startDate, hours, stepMinutes)`
* `findHighLowTides(series)`

These functions must be callable from `fishingtime.html` and integrated into its scoring system.

---

## **6. Visualisation Requirements (Key Difference from beachtime)**

### **Time Representation**

* The chart must represent **24 hours**
* Orientation:

  * **12:00 noon at top**
  * **12:00 midnight at bottom**
  * **6:00 am on the left**
  * **6:00 pm on the right**

This is a full circular dial, not a partial arc.

---

## **7. Dataset Controls (Expanded vs beachtime)**

Each dataset (e.g. wind speed, tide height, pressure, cloud cover) must include:

### **UI Controls**

* Checkbox to enable/disable dataset
* Min / max acceptable range
* Min / max ideal range (slider or numeric input)

### **Behaviour**

* Disabled datasets do not affect scoring
* Enabled datasets contribute to the overall fishing score
* Ideal range weighting behaves the same as in `beachtime.html`

---

## **8. Fishing Suitability Scoring**

### **Scoring Logic**

* Each dataset produces a **0–1 normalised score**
* Ideal ranges score highest
* Values outside acceptable ranges score 0
* Combined score is an average of enabled datasets

### **Output**

* Visual highlight of best fishing windows
* Optional numeric score display
* Tooltip or legend explaining colour intensity

---

## **9. Page Structure**

### **Files**

* `fishingtime.html`
* `tide-harmonic.js`
* `stations.json`
* Optional shared JS/CSS reused from beachtime

### **UI Expectations**

* Same visual language as beachtime
* Same responsiveness assumptions
* Desktop-first acceptable

---

## **10. Documentation**

Provide a short README explaining:

* How fishing suitability is calculated
* How tides are computed
* How to add a new tide station
* Accuracy limitations (astronomical tide only)

---

## **11. Explicit Limitations (Must Be Documented)**

* No fish species modelling
* No moon phase (unless later added)
* No storm surge or wind-driven tide effects
* Swan River accuracy depends on station quality

---

## **12. Success Criteria**

The feature is complete when:

* A user can search for a location
* View a 24-hour circular fishing suitability chart
* Enable/disable datasets and adjust ranges
* See tide influence without any external API
* The page behaves consistently with `beachtime.html`

---

### Final note (important)

This brief intentionally **does not prescribe visual styling code**, only behaviour. The developer should reuse existing chart logic where possible and only extend it where required for 24-hour representation and dataset controls.

---

# Fishingtime.html – Approval & Implementation Pack

---

## 1. One‑Page Approval Summary

### Purpose

`fishingtime.html` is a new webpage derived from the existing `beachtime.html` site. Its purpose is to help users identify the **best times of day to go fishing** at a chosen location, using weather, marine, and tidal conditions.

The page reuses the same design language, charts, and interaction patterns as `beachtime.html`, ensuring consistency and low development risk.

### Key Features

- Location search identical to `beachtime.html`
- 24‑hour circular chart (full dial)
- Visual scoring of fishing suitability by time
- Adjustable acceptable and ideal ranges per dataset
- Dataset enable/disable controls
- Client‑side tide calculation (no API key required)

### Data Sources

- Open‑Meteo Weather API
- Open‑Meteo Marine API
- Local harmonic tide data (`stations.json`)

### What This Is / Is Not

**Is:** A decision‑support visualisation for fishing conditions

**Is Not:**

- A fish species predictor
- A guarantee of fishing success
- A real‑time tide gauge

### Benefits

- Fully client‑side
- Works offline after load
- No recurring API costs
- Extensible to more locations and datasets

### Risks & Limitations

- Tide accuracy limited in rivers without high‑quality harmonic data
- No storm surge or wind‑driven tide effects

---

## 2. UI Wireframe (Conceptual)

### Layout Behaviour

- **Primary layout (desktop / wide screens):**
  - Circular 24‑hour fishing suitability chart on the **left**
  - Dataset controls panel on the **right**
- **Responsive layout (narrow screens / mobile):**
  - Circular chart remains at the top
  - Dataset controls **shift underneath** the chart in a single-column layout

This mirrors the responsive intent of `beachtime.html` while keeping controls immediately accessible.

### Conceptual Wireframe (Wide Screen)

```
+--------------------------------------------------------------+
| Location Search [ Perth, WA ]                                |
+--------------------------------------------------------------+
|                                                              |
|  +----------------------------+  +------------------------+ |
|  |                            |  | Dataset Controls       | |
|  |        12:00 (Noon)        |  |                        | |
|  |             ▲              |  | [✓] Tide Height        | |
|  |   6am ◀─── ○ ───▶ 6pm      |  |     Min [ ] Max [ ]    | |
|  |             ▼              |  |     Ideal [====|====] | |
|  |        12:00 (Midnight)    |  |                        | |
|  |                            |  | [✓] Wind Speed         | |
|  | [24‑Hour Circular Chart]   |  |     Min [ ] Max [ ]    | |
|  |                            |  |     Ideal [====|====] | |
|  +----------------------------+  |                        | |
|                                   | [ ] Cloud Cover        | |
|                                   |     Min [ ] Max [ ]    | |
|                                   |     Ideal [====|====] | |
|                                   +------------------------+ |
+--------------------------------------------------------------+
| Legend / Notes                                               |
+--------------------------------------------------------------+
```

### Conceptual Wireframe (Narrow Screen)

```
+--------------------------------------+
| Location Search [ Perth, WA ]        |
+--------------------------------------+
|                                      |
|        [24‑Hour Circular Chart]      |
|                                      |
+--------------------------------------+
| Dataset Controls                     |
|                                      |
| [✓] Tide Height                     |
|     Min [ ] Max [ ]                 |
|     Ideal [====|====]               |
|                                      |
| [✓] Wind Speed                      |
|     Min [ ] Max [ ]                 |
|     Ideal [====|====]               |
+--------------------------------------+
```

Notes:

- Breakpoint can match the existing `beachtime.html` responsive threshold
- Dataset panel should be scrollable if vertical space is limited
- Disabled datasets visually de-emphasised (opacity / muted colour)

\--------------------------------------------------+ | Location Search [ Perth, WA ]                    | +--------------------------------------------------+ |                                                  | |            12:00 (Noon)                          | |                 ▲                                | |        6am ◀─── ○ ───▶ 6pm                        | |                 ▼                                | |            12:00 (Midnight)                      | |                                                  | |   [ 24‑Hour Circular Fishing Suitability Chart ] | |                                                  | +--------------------------------------------------+ | Dataset Controls                                 | |                                                  | | [✓] Tide Height      Min [ ] Max [ ]             | |     Ideal Range: [====|====]                     | |                                                  | | [✓] Wind Speed       Min [ ] Max [ ]             | |     Ideal Range: [====|====]                     | |                                                  | | [ ] Cloud Cover      Min [ ] Max [ ]             | |     Ideal Range: [====|====]                     | |                                                  | | [✓] Pressure Trend   Min [ ] Max [ ]             | |     Ideal Range: [====|====]                     | +--------------------------------------------------+ | Legend / Notes                                   | |  Darker colour = better fishing conditions       | +--------------------------------------------------+

```

Notes:
- Chart style, colour ramps, and fonts mirror `beachtime.html`
- Dataset panel scrolls if needed
- Disabled datasets do not affect scoring

---

## 3. Dataset‑to‑Score Mapping Table

| Dataset | Source | Typical Range | Ideal Fishing Logic | Notes |
|------|------|------|------|------|
| Tide Height | Harmonic (local) | Station‑specific | Rising or falling tide within mid‑range | User‑adjustable |
| Tide Movement | Derived | −Δ to +Δ | Strong movement preferred | Calculated from slope |
| Wind Speed | Open‑Meteo | 0–30 km/h | Low to moderate | Species‑agnostic |
| Wind Direction | Open‑Meteo | 0–360° | Neutral unless user specifies | Optional weighting |
| Wave Height | Marine API | 0–3 m | Lower is better for shore fishing | Context‑dependent |
| Sea Surface Temp | Marine API | 18–28 °C | Mid‑to‑high preferred | Adjustable |
| Cloud Cover | Open‑Meteo | 0–100% | Partial cover often ideal | Optional |
| Pressure | Open‑Meteo | 980–1035 hPa | Stable or rising | Trend more important |
| Rain Probability | Open‑Meteo | 0–100% | Lower preferred | Binary impact |

### Scoring Rules
- Each dataset outputs a **0–1 score**
- Values inside ideal range → score ≈ 1
- Values outside acceptable range → score = 0
- Enabled dataset scores are averaged

---

## 4. Developer Checklist

### Pre‑Build
- [ ] Review `beachtime.html` logic and structure
- [ ] Identify reusable JS and CSS components
- [ ] Confirm dataset list and defaults

### Data
- [ ] Create `stations.json`
- [ ] Validate harmonic constants
- [ ] Confirm datum usage

### JavaScript
- [ ] Implement `tide-harmonic.js`
- [ ] Load stations via fetch
- [ ] Integrate tide data into scoring pipeline
- [ ] Ensure UTC time handling

### UI
- [ ] Clone layout and styling from `beachtime.html`
- [ ] Implement 24‑hour circular chart
- [ ] Ensure correct clock orientation
- [ ] Add dataset enable/disable checkboxes
- [ ] Add min/max and ideal range controls

### Scoring
- [ ] Normalise all datasets to 0–1
- [ ] Exclude disabled datasets
- [ ] Verify combined score output

### Testing
- [ ] Compare behaviour against `beachtime.html`
- [ ] Test multiple locations
- [ ] Test extreme values
- [ ] Confirm no external API calls for tides

### Documentation
- [ ] Write README
- [ ] Document limitations clearly

---
