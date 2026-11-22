/**
 * DISHASETU: D Block Exact Surveyed Geometry Data
 * Source: D_Block.kml (Presidency University Bengaluru)
 *
 * All coordinates preserved exactly from Google Earth KML (single source of truth).
 */

export const D_BLOCK_KML = {
  id: "bld_d_block",
  name: "D Block",
  label: "D BLOCK",
  code: "PU-D-BLOCK",
  category: "Academic",
  sourceFile: "D_Block.kml",
  placemarkName: "D Block",
  pointCount: 5,
  uniqueVertexCount: 4,
  isClosedRing: true,
  lookAt: {
    longitude: 77.5336010364915,
    latitude: 13.16932260432704,
    altitude: 923.3636184032316,
    heading: 352.4939775264356,
    tilt: 0,
    range: 213.9527441764221
  },
  bounds: [
    [13.16913402864222, 77.53321948845671], // [South, West]
    [13.16960429914654, 77.5338257646441]   // [North, East]
  ],
  center: [13.16936916389438, 77.53352262655041], // [Latitude, Longitude]
  metrics: {
    perimeterMeters: 179.82,
    areaSquareMeters: 1905.5,
    edgesMeters: [34.38, 54.59, 34.43, 56.42]
  },
  // Coordinate formats:
  // 1. [latitude, longitude] for Leaflet / Google Maps / Mobile Flutter map
  coordinates: [
    [13.16960429914654, 77.53334345715004], // Northwest
    [13.16931965547368, 77.53321948845671], // Southwest
    [13.16913402864222, 77.53368623205598], // Southeast
    [13.1694122977665, 77.53382576464411],  // Northeast
    [13.16960429914654, 77.53334345715004]  // Closes loop
  ],
  // 2. [longitude, latitude, altitude] exact KML order
  rawPoints: [
    [77.53334345715004, 13.16960429914654, 0],
    [77.53321948845671, 13.16931965547368, 0],
    [77.53368623205598, 13.16913402864222, 0],
    [77.53382576464411, 13.1694122977665, 0],
    [77.53334345715004, 13.16960429914654, 0]
  ]
};

export const D_BLOCK_BOUNDS = D_BLOCK_KML.bounds;
export const D_BLOCK_CENTER = D_BLOCK_KML.center;

export default D_BLOCK_KML;
