# Fishing Landscape Animations

This directory contains the React components responsible for rendering the dynamic, animated landscape banners used in the Fishing Time application.

## Overview

The primary component, `FishingLandscape.jsx`, generates a real-time SVG visualization of fishing conditions. Instead of presenting the user with only raw data (wind speed numbers, tide heights, etc.), this animation provides an immersive, "at-a-glance" visual summary of what it looks like at a specific fishing location.

## How It Functions

The animation is data-driven and reacts to the following inputs:

1.  **Location Type**: The background scenery changes based on the selected fishing spot (e.g., **Beach**, **River**, **Estuary**, **Breakwater**, or **Lake**).
2.  **Weather Conditions**:
    *   **Wind**: Animated clouds move faster/slower, wind indicator shows direction/speed, and waves increase in height.
    *   **Rain**: Rain intensity is visualized with falling droplets and storm effects.
    *   **Sky**: Gradients shift dynamically based on the time of day (dawn, day, dusk, night) and cloud cover.
3.  **Tide Data**:
    *   **Water Level**: The water height in the animation rises and falls according to the current tide percentage.
    *   **Flow**: Visual indicators show whether the tide is incoming or outgoing.
4.  **Moon Phase**: The moon is accurately rendered based on the current astronomical phase.

## Relation to Website Purpose

The goal of this website is to **"assist in finding the best time to go fishing."** These animations support this goal by:

*   **Visualizing Comfort/Safety**: Users can instantly see if it's stormy, windy, or calm.
*   **Contextualizing Tides**: It translates abstract tide percentages into a visual water level relative to a jetty/shore.
*   **Enhancing Engagement**: The inclusion of animated wildlife (birds specific to the habitat) and a reactive fisherman character (who fishes, drinks, or smokes) adds an element of fun and immersion to the data-checking process.

## Files

*   `FishingLandscape.jsx`: The main, production-ready component.
*   `FishingLandscape-enhanced.jsx`: A version with additional visual details or experimental features.
*   `FishingLandscape-original.jsx`: The legacy version of the animation.