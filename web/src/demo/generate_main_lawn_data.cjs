const fs = require('fs');
const path = require('path');

function haversineDistance(c1, c2) {
  const [lat1, lon1] = c1;
  const [lat2, lon2] = c2;
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sphericalPolygonArea(coords) {
  const R = 6378137;
  if (coords.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lon1] = coords[i].map(d => d * Math.PI / 180);
    const [lat2, lon2] = coords[i + 1].map(d => d * Math.PI / 180);
    total += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  return Math.abs(total * (R ** 2) / 2);
}

const kmlPath = path.join(__dirname, '../../public/demo-kml/main_lawn.kml');
const content = fs.readFileSync(kmlPath, 'utf8');

const nameMatch = content.match(/<Placemark[\s\S]*?<name>([\s\S]*?)<\/name>/i);
const placemarkName = nameMatch ? nameMatch[1].trim() : 'Main Lawn';

const coordMatch = content.match(/<coordinates>([\s\S]*?)<\/coordinates>/i);
const tokens = coordMatch[1].trim().split(/\s+/).filter(Boolean);

const coordinates = [];
const rawPoints = [];
let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;

tokens.forEach(t => {
  const parts = t.split(',');
  const lng = parseFloat(parts[0]);
  const lat = parseFloat(parts[1]);
  const alt = parts[2] ? parseFloat(parts[2]) : 0;
  coordinates.push([lat, lng]);
  rawPoints.push({ lat, lng, alt });
  if (lat < minLat) minLat = lat;
  if (lat > maxLat) maxLat = lat;
  if (lng < minLng) minLng = lng;
  if (lng > maxLng) maxLng = lng;
});

let perimeter = 0;
for (let i = 0; i < coordinates.length - 1; i++) {
  perimeter += haversineDistance(coordinates[i], coordinates[i + 1]);
}

const areaSqMeters = sphericalPolygonArea(coordinates);
const areaSqFt = areaSqMeters * 10.7639;
const areaAcres = areaSqMeters / 4046.86;
const areaHectares = areaSqMeters / 10000;

// Visual centroid calculation
let centerLat = 0, centerLng = 0;
coordinates.slice(0, -1).forEach(([lat, lng]) => {
  centerLat += lat;
  centerLng += lng;
});
centerLat /= (coordinates.length - 1);
centerLng /= (coordinates.length - 1);

const output = `/**
 * DISHASETU: Main Lawn Authoritative GPS Polygon Data
 * Presidency University Bengaluru
 * 
 * Source: main lawn.kml
 * Placemark: ${placemarkName}
 * 
 * Exact Surveyed Coordinates: 14 points (13 unique vertices + closing vertex)
 * Geodesic Area: ${areaSqMeters.toFixed(2)} m² (~${areaAcres.toFixed(2)} acres / ${Math.round(areaSqFt).toLocaleString()} sq ft)
 * Perimeter: ${perimeter.toFixed(2)} m (~0.67 km)
 * 
 * All coordinates preserve 100% exact original GPS precision without simplification,
 * smoothing, or manual approximation. Converted: KML [lng, lat, alt] -> Leaflet [lat, lng].
 */

export const MAIN_LAWN_KML = {
  id: 'main_lawn_polygon',
  name: 'Main Lawn',
  label: 'MAIN LAWN',
  sourceFile: 'main lawn.kml',
  placemarkName: ${JSON.stringify(placemarkName)},
  pointCount: ${coordinates.length},
  uniqueVertexCount: ${coordinates.length - 1},
  isClosedRing: ${coordinates[0][0] === coordinates[coordinates.length - 1][0] && coordinates[0][1] === coordinates[coordinates.length - 1][1]},
  bounds: [
    [${minLat}, ${minLng}],
    [${maxLat}, ${maxLng}]
  ],
  center: [${centerLat}, ${centerLng}],
  metrics: {
    perimeterMeters: ${perimeter.toFixed(2)},
    perimeterKm: ${(perimeter / 1000).toFixed(3)},
    areaSqMeters: ${areaSqMeters.toFixed(2)},
    areaSqFt: ${areaSqFt.toFixed(2)},
    areaAcres: ${areaAcres.toFixed(4)},
    areaHectares: ${areaHectares.toFixed(4)}
  },
  style: {
    fillColor: '#86efac',       // Light green matching the reference campus map
    fillOpacity: 0.70,          // 70% opacity as requested (65-75%)
    strokeColor: '#15803d',     // Clearly visible darker green border
    strokeWeight: 3.5,          // 3-4 px border
    strokeOpacity: 0.95
  },
  coordinates: ${JSON.stringify(coordinates, null, 2)},
  rawPoints: ${JSON.stringify(rawPoints, null, 2)}
};

export const MAIN_LAWN_BOUNDS = [
  [${minLat}, ${minLng}],
  [${maxLat}, ${maxLng}]
];

export const MAIN_LAWN_CENTER = [${centerLat}, ${centerLng}];
`;

const outputPath = path.join(__dirname, 'mainLawnDemoData.js');
fs.writeFileSync(outputPath, output, 'utf8');
console.log('Successfully written mainLawnDemoData.js!');
console.log('Points:', coordinates.length, 'Perimeter:', perimeter.toFixed(2), 'Area m²:', areaSqMeters.toFixed(2));
