/**
 * DISHASETU: KML Parser Utility
 * Presidency University Bengaluru
 * 
 * Extracts LineString geometry, coordinates [lat, lng], original order,
 * calculates geodesic distance, and creates route metadata.
 */

// Geodesic Haversine distance in meters
export function haversineDistance(coord1, coord2) {
  const [lat1, lon1] = Array.isArray(coord1) ? coord1 : [coord1.lat, coord1.lng];
  const [lat2, lon2] = Array.isArray(coord2) ? coord2 : [coord2.lat, coord2.lng];
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate bearing in degrees between two points
export function calculateBearing(coord1, coord2) {
  const [lat1, lon1] = Array.isArray(coord1) ? coord1 : [coord1.lat, coord1.lng];
  const [lat2, lon2] = Array.isArray(coord2) ? coord2 : [coord2.lat, coord2.lng];
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return (θ * 180 / Math.PI + 360) % 360;
}

/**
 * Parses raw KML text into verified LineString coordinates and metadata
 * @param {string} kmlText - The raw KML XML string
 * @param {string} fileName - Original file name
 * @param {object} options - Optional overrides (name, startNode, endNode, routeType)
 */
export function parseKml(kmlText, fileName = 'Untitled map project.kml', options = {}) {
  if (!kmlText || typeof kmlText !== 'string') {
    throw new Error('Invalid KML content provided.');
  }

  // 1. Locate <coordinates> block
  const coordMatches = [...kmlText.matchAll(/<coordinates>([\s\S]*?)<\/coordinates>/gi)];
  if (!coordMatches.length) {
    throw new Error('No valid <coordinates> tag found in the uploaded KML file.');
  }

  // 2. Extract Document / Placemark Name
  const docNameMatch = kmlText.match(/<Placemark[\s\S]*?<name>([\s\S]*?)<\/name>/i) ||
                       kmlText.match(/<Document[\s\S]*?<name>([\s\S]*?)<\/name>/i);
  const originalName = docNameMatch ? docNameMatch[1].trim() : 'Surveyed Walking Path';

  // 3. Extract and parse coordinate tokens (format: lng,lat,alt)
  const coordText = coordMatches[0][1].trim();
  const tokens = coordText.split(/\s+/);
  const coordinates = [];
  const rawPoints = [];

  for (const token of tokens) {
    if (!token.trim()) continue;
    const parts = token.split(',');
    if (parts.length >= 2) {
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      const alt = parts[2] ? parseFloat(parts[2]) : 0;
      if (!isNaN(lat) && !isNaN(lng)) {
        // [lat, lng] format used across DishaSetu
        coordinates.push([lat, lng]);
        rawPoints.push({ lat, lng, alt });
      }
    }
  }

  if (coordinates.length < 2) {
    throw new Error('KML LineString must contain at least 2 valid GPS coordinates.');
  }

  // 4. Calculate total geodesic path distance
  let totalDistanceMeters = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistanceMeters += haversineDistance(coordinates[i], coordinates[i + 1]);
  }

  const distanceMeters = Math.round(totalDistanceMeters);
  // Average campus walking speed: 1.25 m/s (~75 meters/min)
  const estimatedWalkingMinutes = Math.max(1, Math.round(distanceMeters / 75));

  const startCoord = coordinates[0];
  const endCoord = coordinates[coordinates.length - 1];

  const routeName = options.name ||
    (fileName.toLowerCase().includes('d block') || originalName.toLowerCase().includes('d block')
      ? 'Main Gate → D Block'
      : (options.pathName || originalName || 'Main Gate → D Block'));

  return {
    name: routeName,
    originalName,
    sourceFileName: fileName,
    routeType: options.routeType || 'Walking',
    verificationStatus: 'Verified',
    status: 'active',
    active: true,
    pointCount: coordinates.length,
    coordinates, // [[lat, lng], ...]
    rawPoints,   // [{ lat, lng, alt }, ...]
    startNode: options.startNode || 'node_main_gate',
    endNode: options.endNode || 'node_d_block_ent',
    startLocation: {
      name: options.startName || 'Presidency University – Main Gate',
      lat: startCoord[0],
      lng: startCoord[1]
    },
    endLocation: {
      name: options.endName || 'D Block',
      lat: endCoord[0],
      lng: endCoord[1]
    },
    distanceMeters,
    estimatedWalkingMinutes,
    accessibility: options.accessibility !== false,
    hasStairs: false,
    hasRamp: true,
    surfaceType: 'Paved Walkway & Tiles',
    campus: 'Presidency University Bengaluru',
    notes: options.notes || `Surveyed GPS route imported from ${fileName}. Contains ${coordinates.length} precise GPS coordinates.`
  };
}
