/**
 * DISHASETU: Admission Block Exact Surveyed Geometry Data
 * Source: admission_block.kml (Presidency University Bengaluru)
 *
 * All coordinates preserved exactly from Google Earth KML (single source of truth).
 */

export const ADMISSION_BLOCK_KML = {
  id: "admission_block",
  name: "Admission Block",
  label: "ADMISSION BLOCK",
  sourceFile: "admission_block.kml",
  placemarkName: "admission block",
  pointCount: 5,
  uniqueVertexCount: 4,
  isClosedRing: true,
  lookAt: {
    longitude: 77.53409250090466,
    latitude: 13.16921851576345,
    altitude: 925.1407965922095,
    heading: 352.4940923048082,
    tilt: 0,
    range: 212.1755785679125
  },
  bounds: [
    [13.16895307234977, 77.53388059752243], // [South, West]
    [13.16928027417512, 77.53427046298394]  // [North, East]
  ],
  center: [13.169116673262446, 77.53407553025318], // [Latitude, Longitude]
  metrics: {
    perimeterMeters: 120.53,
    areaSquareMeters: 867.3,
    edgesMeters: [24.55, 36.01, 23.19, 36.79]
  },
  // Coordinate formats:
  // 1. [latitude, longitude] for Leaflet / Google Maps / Flutter map
  coordinates: [
    [13.16928027417512, 77.53395987420603],
    [13.16907345527522, 77.53388059752243],
    [13.16895307234977, 77.53418933405754],
    [13.16914604861018, 77.53427046298394],
    [13.16928027417512, 77.53395987420603]
  ],
  // 2. [longitude, latitude, altitude] exact KML order
  rawPoints: [
    [77.53395987420603, 13.16928027417512, 0],
    [77.53388059752243, 13.16907345527522, 0],
    [77.53418933405754, 13.16895307234977, 0],
    [77.53427046298394, 13.16914604861018, 0],
    [77.53395987420603, 13.16928027417512, 0]
  ]
};

export const ADMISSION_BLOCK_BOUNDS = ADMISSION_BLOCK_KML.bounds;
export const ADMISSION_BLOCK_CENTER = ADMISSION_BLOCK_KML.center;

export default ADMISSION_BLOCK_KML;
