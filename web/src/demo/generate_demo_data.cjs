const fs = require('fs');
const path = require('path');

function parseKmlPolygon(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const coordMatches = [...content.matchAll(/<coordinates>([\s\S]*?)<\/coordinates>/gi)];
  if (!coordMatches.length) throw new Error('No coordinates in ' + filePath);
  
  const nameMatch = content.match(/<Placemark[\s\S]*?<name>([\s\S]*?)<\/name>/i) ||
                    content.match(/<Document[\s\S]*?<name>([\s\S]*?)<\/name>/i);
  const name = nameMatch ? nameMatch[1].trim() : 'Unnamed';

  const coordStr = coordMatches[0][1].trim();
  const rawPairs = coordStr.split(/\s+/).filter(Boolean);
  const leafletCoords = [];
  const rawPoints = [];
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;

  for (const pair of rawPairs) {
    const parts = pair.split(',');
    if (parts.length >= 2) {
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      const alt = parts[2] ? parseFloat(parts[2]) : 0;
      if (!isNaN(lat) && !isNaN(lng)) {
        leafletCoords.push([lat, lng]);
        rawPoints.push({ lat, lng, alt });
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }
    }
  }

  // Centroid
  let centerLat = 0, centerLng = 0;
  leafletCoords.forEach(([lat, lng]) => {
    centerLat += lat;
    centerLng += lng;
  });
  centerLat /= leafletCoords.length;
  centerLng /= leafletCoords.length;

  return {
    name,
    leafletCoords,
    rawPoints,
    pointCount: leafletCoords.length,
    bounds: [[minLat, minLng], [maxLat, maxLng]],
    center: [centerLat, centerLng]
  };
}

const campusPath = path.join(__dirname, '../../public/demo-kml/campusBoundary.kml');
const gardenPath = path.join(__dirname, '../../public/demo-kml/gardenArea.kml');

const campusData = parseKmlPolygon(campusPath);
const gardenData = parseKmlPolygon(gardenPath);

const combinedMinLat = Math.min(campusData.bounds[0][0], gardenData.bounds[0][0]);
const combinedMinLng = Math.min(campusData.bounds[0][1], gardenData.bounds[0][1]);
const combinedMaxLat = Math.max(campusData.bounds[1][0], gardenData.bounds[1][0]);
const combinedMaxLng = Math.max(campusData.bounds[1][1], gardenData.bounds[1][1]);
const combinedBounds = [[combinedMinLat, combinedMinLng], [combinedMaxLat, combinedMaxLng]];

const outJs = `/**
 * DISHASETU: KML Map Demo Data & Verified GPS Geometries
 * Presidency University Bengaluru
 * 
 * Auto-extracted strictly from user-uploaded KML files:
 * 1. Untitled map project (1).kml -> campusBoundary.kml (Campus Boundary Polygon, 24 points)
 * 2. gardenArea.kml -> gardenArea.kml (Garden / Main Lawn Polygon, 77 points)
 * 
 * NOTE: All coordinates preserve 100% exact original GPS precision without modification,
 * smoothing, or manual approximation. Coordinate order converted: KML [lng, lat, alt] -> Leaflet [lat, lng].
 */

export const CAMPUS_BOUNDARY_KML = {
  id: 'kml_campus_boundary',
  name: 'Presidency University Campus Boundary',
  displayName: 'Campus Boundary',
  kmlName: ${JSON.stringify(campusData.name)},
  sourceFile: 'Untitled map project (1).kml',
  pointCount: ${campusData.pointCount},
  bounds: ${JSON.stringify(campusData.bounds)},
  center: ${JSON.stringify(campusData.center)},
  strokeColor: '#0284c7',
  strokeWeight: 2.5,
  dashArray: '6, 6',
  fillColor: '#38bdf8',
  fillOpacity: 0.08,
  coordinates: ${JSON.stringify(campusData.leafletCoords, null, 2)},
  rawPoints: ${JSON.stringify(campusData.rawPoints, null, 2)}
};

export const GARDEN_AREA_KML = {
  id: 'kml_garden_area',
  name: 'Garden / Main Lawn Area',
  displayName: 'Garden / Main Lawn',
  kmlName: ${JSON.stringify(gardenData.name)},
  sourceFile: 'gardenArea.kml',
  pointCount: ${gardenData.pointCount},
  bounds: ${JSON.stringify(gardenData.bounds)},
  center: ${JSON.stringify(gardenData.center)},
  strokeColor: '#16a34a',
  strokeWeight: 2.5,
  fillColor: '#22c55e',
  fillOpacity: 0.35,
  coordinates: ${JSON.stringify(gardenData.leafletCoords, null, 2)},
  rawPoints: ${JSON.stringify(gardenData.rawPoints, null, 2)}
};

export const COMBINED_KML_BOUNDS = ${JSON.stringify(combinedBounds)};
export const DEFAULT_CAMPUS_CENTER = [13.169722, 77.535722];
export const DEFAULT_CAMPUS_ZOOM = 17;
`;

const outputPath = path.join(__dirname, 'kmlDemoData.js');
fs.writeFileSync(outputPath, outJs, 'utf8');
console.log('Successfully written:', outputPath);
