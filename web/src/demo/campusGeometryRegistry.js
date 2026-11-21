/**
 * DISHASETU: Incremental Campus Geometry Registry
 * Presidency University Bengaluru
 * 
 * ARCHITECTURE FOR INCREMENTAL CAMPUS MAPPING:
 * - This registry acts as the single source of truth for verified surveyed KML geometries.
 * - When new KML files are uploaded (buildings, roads, parking lots, pathways, sports complexes),
 *   they are appended here without modifying or deleting existing geometries.
 * - Current Active Geometries: ONLY Main Lawn (as requested).
 */

import {
  MAIN_LAWN_KML,
  MAIN_LAWN_BOUNDS,
  MAIN_LAWN_CENTER
} from './mainLawnDemoData';

// Calibrated Perspective Homography Matrix for Master Campus Map (viewBox 0 0 1000 1422)
// Accurately maps surveyed GPS coordinates to the illustrated campus master map
const lat0 = 13.1700;
const lng0 = 77.5360;
const H = [
  [51.1333046, -23.3175022, 636.978465],
  [18.8427871, -26.4840471, 627.040870],
  [0.051377301, -0.026919293, 1.0]
];

export function projectGpsToMasterMapSvg(lat, lng) {
  const u = (lng - lng0) * 10000;
  const v = (lat - lat0) * 10000;
  const denom = H[2][0] * u + H[2][1] * v + H[2][2];
  const x = (H[0][0] * u + H[0][1] * v + H[0][2]) / denom;
  const y = (H[1][0] * u + H[1][1] * v + H[1][2]) / denom;
  return [parseFloat(x.toFixed(1)), parseFloat(y.toFixed(1))];
}

// 1. MAIN LAWN (Currently the ONLY active geometry in demo)
export const MAIN_LAWN_GEOMETRY = {
  id: 'main_lawn',
  name: 'Main Lawn',
  label: 'MAIN LAWN',
  category: 'Garden',
  type: 'polygon',
  sourceFile: 'main lawn.kml',
  pointCount: 14,
  uniqueVertexCount: 13,
  isClosedRing: true,
  coordinates: MAIN_LAWN_KML.coordinates,
  rawPoints: MAIN_LAWN_KML.rawPoints,
  bounds: MAIN_LAWN_BOUNDS,
  gpsCenter: MAIN_LAWN_CENTER,
  svgPoints: MAIN_LAWN_KML.coordinates.map(([lat, lng]) => projectGpsToMasterMapSvg(lat, lng)),
  svgPointsString: MAIN_LAWN_KML.coordinates.map(([lat, lng]) => {
    const [x, y] = projectGpsToMasterMapSvg(lat, lng);
    return `${x},${y}`;
  }).join(' '),
  svgCenter: [595, 590],
  metrics: MAIN_LAWN_KML.metrics,
  style: {
    fillColor: 'rgba(34, 197, 94, 0.45)', // Green transparent fill matching reference campus map
    strokeColor: '#15803d',               // Darker green border
    strokeWidth: 3.5,
    strokeOpacity: 0.95
  },
  activeInDemo: true
};

// Extensible Registry Array for future KML additions
// Future KML items will be appended here incrementally
export const VERIFIED_CAMPUS_GEOMETRIES = [
  MAIN_LAWN_GEOMETRY
];

export function getActiveDemoGeometries() {
  return VERIFIED_CAMPUS_GEOMETRIES.filter(g => g.activeInDemo);
}
