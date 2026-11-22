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
} from './mainLawnDemoData.js';

import {
  MAIN_GATE_TO_D_BLOCK_KML,
  MAIN_GATE_TO_D_BLOCK_BOUNDS,
  MAIN_GATE_TO_D_BLOCK_CENTER
} from './mainGateToDBlockData.js';

import {
  ADMISSION_BLOCK_KML,
  ADMISSION_BLOCK_BOUNDS,
  ADMISSION_BLOCK_CENTER
} from './admissionBlockData.js';

import {
  D_BLOCK_KML,
  D_BLOCK_BOUNDS,
  D_BLOCK_CENTER
} from './dBlockData.js';

import {
  E_BLOCK_KML,
  E_BLOCK_BOUNDS,
  E_BLOCK_CENTER
} from './eBlockData.js';

import {
  F_BLOCK_KML,
  F_BLOCK_BOUNDS,
  F_BLOCK_CENTER
} from './fBlockData.js';

import {
  L_BLOCK_KML,
  L_BLOCK_BOUNDS,
  L_BLOCK_CENTER
} from './lBlockData.js';

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

// 1. MAIN LAWN (Preserved 100% untouched)
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

// 2. MAIN GATE → D BLOCK (Surveyed Walking Corridor Ribbon Polygon)
export const MAIN_GATE_TO_D_BLOCK_GEOMETRY = {
  id: 'main_gate_to_d_block',
  name: 'Main Gate → D Block',
  label: 'Main Gate → D Block',
  category: 'Route',
  type: 'polygon',
  sourceFile: 'main gate to D block p-1.kml',
  pointCount: 100,
  uniqueVertexCount: 99,
  isClosedRing: true,
  coordinates: MAIN_GATE_TO_D_BLOCK_KML.coordinates,
  rawPoints: MAIN_GATE_TO_D_BLOCK_KML.rawPoints,
  bounds: MAIN_GATE_TO_D_BLOCK_BOUNDS,
  gpsCenter: MAIN_GATE_TO_D_BLOCK_CENTER,
  svgPoints: MAIN_GATE_TO_D_BLOCK_KML.svgPoints,
  svgPointsString: MAIN_GATE_TO_D_BLOCK_KML.svgPointsString,
  svgCenter: MAIN_GATE_TO_D_BLOCK_KML.svgCenter,
  metrics: MAIN_GATE_TO_D_BLOCK_KML.metrics,
  style: {
    fillColor: 'rgba(249, 115, 22, 0.70)', // Orange matching the reference PDF screenshot (approx 70% opacity)
    strokeColor: '#c2410c',                // Darker orange border
    strokeWidth: 2.5,                      // 2-3px border width
    strokeOpacity: 0.95
  },
  activeInDemo: true
};

// 3. ADMISSION BLOCK (Surveyed Building Polygon)
export const ADMISSION_BLOCK_GEOMETRY = {
  id: 'admission_block',
  name: 'Admission Block',
  label: 'ADMISSION BLOCK',
  category: 'Academic',
  type: 'polygon',
  sourceFile: 'admission_block.kml',
  pointCount: 5,
  uniqueVertexCount: 4,
  isClosedRing: true,
  coordinates: ADMISSION_BLOCK_KML.coordinates,
  rawPoints: ADMISSION_BLOCK_KML.rawPoints,
  bounds: ADMISSION_BLOCK_BOUNDS,
  gpsCenter: ADMISSION_BLOCK_CENTER,
  svgPoints: ADMISSION_BLOCK_KML.coordinates.map(([lat, lng]) => projectGpsToMasterMapSvg(lat, lng)),
  svgPointsString: ADMISSION_BLOCK_KML.coordinates.map(([lat, lng]) => {
    const [x, y] = projectGpsToMasterMapSvg(lat, lng);
    return `${x},${y}`;
  }).join(' '),
  metrics: ADMISSION_BLOCK_KML.metrics,
  style: {
    fillColor: 'rgba(234, 179, 8, 0.55)', // Warm gold/yellow building fill
    strokeColor: '#ca8a04',               // Darker golden border
    strokeWidth: 2.5,
    strokeOpacity: 0.95
  },
  activeInDemo: true
};

// 4. D BLOCK (Surveyed Premier Engineering Academic Block)
export const D_BLOCK_GEOMETRY = {
  id: 'bld_d_block',
  name: 'D Block',
  label: 'D BLOCK',
  category: 'Academic',
  type: 'polygon',
  sourceFile: 'D_Block.kml',
  pointCount: 5,
  uniqueVertexCount: 4,
  isClosedRing: true,
  coordinates: D_BLOCK_KML.coordinates,
  rawPoints: D_BLOCK_KML.rawPoints,
  bounds: D_BLOCK_BOUNDS,
  gpsCenter: D_BLOCK_CENTER,
  svgCenter: [202.5, 917.2],
  metrics: D_BLOCK_KML.metrics,
  style: {
    fillColor: 'rgba(234, 179, 8, 0.55)',
    strokeColor: '#ca8a04',
    strokeWidth: 2.5,
    strokeOpacity: 0.95
  },
  activeInDemo: true
};

// 5. E BLOCK (Surveyed Computer Science Academic Block)
export const E_BLOCK_GEOMETRY = {
  id: 'bld_e_block',
  name: 'E Block',
  label: 'E BLOCK',
  category: 'Academic',
  type: 'polygon',
  sourceFile: 'E_blocks.kml',
  pointCount: 12,
  uniqueVertexCount: 11,
  isClosedRing: true,
  coordinates: E_BLOCK_KML.coordinates,
  rawPoints: E_BLOCK_KML.rawPoints,
  bounds: E_BLOCK_BOUNDS,
  gpsCenter: E_BLOCK_CENTER,
  svgCenter: [202.5, 991.8],
  metrics: E_BLOCK_KML.metrics,
  style: {
    fillColor: 'rgba(234, 179, 8, 0.55)',
    strokeColor: '#ca8a04',
    strokeWidth: 2.5,
    strokeOpacity: 0.95
  },
  activeInDemo: true
};

// 6. F BLOCK (Surveyed Information Science Academic Block)
export const F_BLOCK_GEOMETRY = {
  id: 'bld_f_block',
  name: 'F Block',
  label: 'F BLOCK',
  category: 'Academic',
  type: 'polygon',
  sourceFile: 'F_blocks.kml',
  pointCount: 6,
  uniqueVertexCount: 5,
  isClosedRing: true,
  coordinates: F_BLOCK_KML.coordinates,
  rawPoints: F_BLOCK_KML.rawPoints,
  bounds: F_BLOCK_BOUNDS,
  gpsCenter: F_BLOCK_CENTER,
  svgCenter: [202.5, 1067.9],
  metrics: F_BLOCK_KML.metrics,
  style: {
    fillColor: 'rgba(234, 179, 8, 0.55)',
    strokeColor: '#ca8a04',
    strokeWidth: 2.5,
    strokeOpacity: 0.95
  },
  activeInDemo: true
};

// 7. L BLOCK (Surveyed Electronics & Communication Academic Block)
export const L_BLOCK_GEOMETRY = {
  id: 'bld_l_block',
  name: 'L Block',
  label: 'L BLOCK',
  category: 'Academic',
  type: 'polygon',
  sourceFile: 'L_blocks.kml',
  pointCount: 5,
  uniqueVertexCount: 4,
  isClosedRing: true,
  coordinates: L_BLOCK_KML.coordinates,
  rawPoints: L_BLOCK_KML.rawPoints,
  bounds: L_BLOCK_BOUNDS,
  gpsCenter: L_BLOCK_CENTER,
  svgCenter: [200.0, 1142.6],
  metrics: L_BLOCK_KML.metrics,
  style: {
    fillColor: 'rgba(234, 179, 8, 0.55)',
    strokeColor: '#ca8a04',
    strokeWidth: 2.5,
    strokeOpacity: 0.95
  },
  activeInDemo: true
};

// Extensible Registry Array for future KML additions
export const VERIFIED_CAMPUS_GEOMETRIES = [
  MAIN_LAWN_GEOMETRY,
  MAIN_GATE_TO_D_BLOCK_GEOMETRY,
  ADMISSION_BLOCK_GEOMETRY,
  D_BLOCK_GEOMETRY,
  E_BLOCK_GEOMETRY,
  F_BLOCK_GEOMETRY,
  L_BLOCK_GEOMETRY
];

export function getActiveDemoGeometries() {
  return VERIFIED_CAMPUS_GEOMETRIES.filter(g => g.activeInDemo);
}
