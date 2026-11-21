import { MAIN_LAWN_KML } from './mainLawnDemoData.js';
import { CAMPUS_BOUNDARY_KML } from './kmlDemoData.js';

// Project GPS [lat, lng] to Master Campus Map SVG [viewBox 0 0 1000 1422]
const lat0 = 13.1700;
const lng0 = 77.5360;
const ax = 27.508115, bx = -9.116564, cx = 579.0793;
const ay = -2.417814, by = -17.802639, cy = 649.2956;

export function gpsToMasterMapSvg(lat, lng) {
  const u = (lng - lng0) * 10000;
  const v = (lat - lat0) * 10000;
  const x = ax * u + bx * v + cx;
  const y = ay * u + by * v + cy;
  return [parseFloat(x.toFixed(1)), parseFloat(y.toFixed(1))];
}

// 14 Points of Main Lawn
export const MAIN_LAWN_MASTER_SVG_POINTS = MAIN_LAWN_KML.coordinates
  .map(([lat, lng]) => gpsToMasterMapSvg(lat, lng));

export const MAIN_LAWN_MASTER_SVG_STRING = MAIN_LAWN_MASTER_SVG_POINTS
  .map(([x, y]) => `${x},${y}`)
  .join(' ');

// Center point for Main Lawn Label
export const MAIN_LAWN_MASTER_CENTER = [505, 605];

// 24 Points of Campus Boundary
export const CAMPUS_BOUNDARY_MASTER_SVG_POINTS = CAMPUS_BOUNDARY_KML.coordinates
  .map(([lat, lng]) => gpsToMasterMapSvg(lat, lng));

export const CAMPUS_BOUNDARY_MASTER_SVG_STRING = CAMPUS_BOUNDARY_MASTER_SVG_POINTS
  .map(([x, y]) => `${x},${y}`)
  .join(' ');

export { MAIN_LAWN_KML, CAMPUS_BOUNDARY_KML };
