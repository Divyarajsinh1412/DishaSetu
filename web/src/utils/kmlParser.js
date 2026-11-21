/**
 * DISHASETU: Frontend KML Parser Utility
 * Presidency University Bengaluru
 */

export function haversineDistance(coord1, coord2) {
  const [lat1, lon1] = Array.isArray(coord1) ? coord1 : [coord1.lat, coord1.lng];
  const [lat2, lon2] = Array.isArray(coord2) ? coord2 : [coord2.lat, coord2.lng];
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function parseKml(kmlText, fileName = 'Untitled map project.kml', options = {}) {
  if (!kmlText || typeof kmlText !== 'string') {
    throw new Error('Invalid KML content provided.');
  }

  const coordMatches = [...kmlText.matchAll(/<coordinates>([\s\S]*?)<\/coordinates>/gi)];
  if (!coordMatches.length) {
    throw new Error('No valid <coordinates> tag found in the uploaded KML file.');
  }

  const docNameMatch = kmlText.match(/<Placemark[\s\S]*?<name>([\s\S]*?)<\/name>/i) ||
                       kmlText.match(/<Document[\s\S]*?<name>([\s\S]*?)<\/name>/i);
  const originalName = docNameMatch ? docNameMatch[1].trim() : 'Surveyed Walking Path';

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
        coordinates.push([lat, lng]);
        rawPoints.push({ lat, lng, alt });
      }
    }
  }

  if (coordinates.length < 2) {
    throw new Error('KML LineString must contain at least 2 valid GPS coordinates.');
  }

  let totalDistanceMeters = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistanceMeters += haversineDistance(coordinates[i], coordinates[i + 1]);
  }

  const distanceMeters = Math.round(totalDistanceMeters);
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
    coordinates,
    rawPoints,
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

/**
 * Reusable KML Polygon Parser
 * Extracts LinearRing coordinates from KML Polygons
 * Converts KML [lng, lat, alt] to Leaflet [lat, lng] format
 */
export function parseKmlPolygon(kmlText, fileName = 'geometry.kml', options = {}) {
  if (!kmlText || typeof kmlText !== 'string') {
    throw new Error('Invalid KML content provided.');
  }

  const coordMatches = [...kmlText.matchAll(/<coordinates>([\s\S]*?)<\/coordinates>/gi)];
  if (!coordMatches.length) {
    throw new Error('No valid <coordinates> tag found in the uploaded KML polygon.');
  }

  const docNameMatch = kmlText.match(/<Placemark[\s\S]*?<name>([\s\S]*?)<\/name>/i) ||
                       kmlText.match(/<Document[\s\S]*?<name>([\s\S]*?)<\/name>/i);
  const originalName = docNameMatch ? docNameMatch[1].trim() : 'Surveyed Polygon';

  // Use the coordinates from the first LinearRing (outerBoundaryIs)
  const coordText = coordMatches[0][1].trim();
  const tokens = coordText.split(/\s+/).filter(Boolean);
  const coordinates = [];
  const rawPoints = [];
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;

  for (const token of tokens) {
    const parts = token.split(',');
    if (parts.length >= 2) {
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      const alt = parts[2] ? parseFloat(parts[2]) : 0;
      if (!isNaN(lat) && !isNaN(lng)) {
        coordinates.push([lat, lng]);
        rawPoints.push({ lat, lng, alt });
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }
    }
  }

  if (coordinates.length < 3) {
    throw new Error('KML Polygon must contain at least 3 valid GPS coordinates.');
  }

  // Calculate centroid
  let centerLat = 0, centerLng = 0;
  coordinates.forEach(([lat, lng]) => {
    centerLat += lat;
    centerLng += lng;
  });
  centerLat /= coordinates.length;
  centerLng /= coordinates.length;

  return {
    name: options.name || originalName,
    originalName,
    sourceFileName: fileName,
    pointCount: coordinates.length,
    coordinates,
    rawPoints,
    bounds: [[minLat, minLng], [maxLat, maxLng]],
    center: [centerLat, centerLng]
  };
}
