#!/usr/bin/env Rscript
# extract_marine_tides.R
# Extract harmonic tide station data from MarineTides package
# This script exports global harmonic tide stations to a JSON file
# compatible with the FishingTime JavaScript application.

# Required packages
required_packages <- c("MarineTides", "data.table", "jsonlite")

# Check and install missing packages
for (pkg in required_packages) {
  if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
    cat(sprintf("Installing package: %s\n", pkg))
    install.packages(pkg, repos = "https://cloud.r-project.org/")
    library(pkg, character.only = TRUE)
  }
}

cat("Loading MarineTides data...\n")

# 1. Load Data
data("harmonics", package = "MarineTides")

# 2. Filter for Harmonic Stations only (Type 'H')
# 'st_data' contains metadata, 'st_constituents' contains harmonics
stations <- as.data.table(harmonics$st_data)[station_type == "H"]
constituents <- as.data.table(harmonics$st_constituents)

cat(sprintf("Found %d harmonic stations\n", nrow(stations)))
cat(sprintf("Total constituent records: %d\n", nrow(constituents)))

# 3. Join and Format
# We need to restructure this into the nesting the JS expects:
# Station -> Constituents -> M2, S2, etc.

export_list <- list()
stations_with_constituents <- 0

for(i in 1:nrow(stations)) {
  st_code <- stations$station_code[i]
  st_name <- stations$station_name[i]
  
  # Get constituents for this station
  st_consts <- constituents[station_code == st_code]
  
  # Skip if no constituents
  if(nrow(st_consts) == 0) {
    next
  }
  
  stations_with_constituents <- stations_with_constituents + 1
  
  # Format constituents object
  const_obj <- list()
  for(j in 1:nrow(st_consts)) {
    c_name <- st_consts$code[j]
    # Export the raw nominal amplitude and phase
    # The JS application uses static amplitudes without nodal corrections
    const_obj[[c_name]] <- list(
      amplitude = st_consts$amplitude[j],
      phase = st_consts$phase[j]
    )
  }
  
  # Create station entry
  station_entry <- list(
    id = st_code,
    name = st_name,
    latitude = stations$latitude[i],
    longitude = stations$longitude[i],
    datum = ifelse(is.na(stations$station_datum[i]), 0, stations$station_datum[i]),
    constituents = const_obj
  )
  
  export_list[[length(export_list) + 1]] <- station_entry
}

cat(sprintf("Exporting %d stations with constituents\n", stations_with_constituents))

# 4. Save to JSON
output_file <- "stations_global.json"
write_json(export_list, output_file, auto_unbox = TRUE, pretty = TRUE)

cat(sprintf("Successfully exported to %s\n", output_file))
cat("\nTo use this file in FishingTime:\n")
cat("1. Replace stations.json with stations_global.json, or\n")
cat("2. Use stations_global.json as an alternative station database\n")
cat("\nNote: The JS application will skip any constituents it doesn't recognize.\n")
cat("Ensure TIDAL_SPEEDS in tide-harmonic.js includes all constituent names.\n")
