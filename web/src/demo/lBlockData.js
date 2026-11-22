/**
 * DISHASETU: L Block Exact Surveyed Geometry Data
 * Source: L_blocks.kml (Presidency University Bengaluru)
 *
 * All coordinates preserved exactly from Google Earth KML (single source of truth).
 */

export const L_BLOCK_KML = {
  id: "bld_l_block",
  name: "L Block",
  label: "L BLOCK",
  code: "PU-L-BLOCK",
  category: "Academic",
  sourceFile: "L_blocks.kml",
  placemarkName: "L blocks",
  pointCount: 5,
  uniqueVertexCount: 4,
  isClosedRing: true,
  lookAt: {
    longitude: 77.53309691764082,
    latitude: 13.16828580917335,
    altitude: 923.0014505037865,
    heading: 352.4938799481056,
    tilt: 0,
    range: 272.4421578439797
  },
  bounds: [
    [13.16809148481258, 77.5327962108044],  // [South, West]
    [13.16856220095147, 77.53339508405537]  // [North, East]
  ],
  center: [13.168326842882024, 77.53309564742989], // [Latitude, Longitude]
  metrics: {
    perimeterMeters: 179.25,
    areaSquareMeters: 1867.3,
    edgesMeters: [34.02, 54.34, 34.08, 56.81]
  },
  coordinates: [
    [13.16856220095147, 77.53291262496151],
    [13.16828264588369, 77.53279621080441],
    [13.16809148481258, 77.5332783767868],
    [13.16836089675141, 77.53339508405537],
    [13.16856220095147, 77.53291262496151]
  ],
  rawPoints: [
    [77.53291262496151, 13.16856220095147, 0],
    [77.53279621080441, 13.16828264588369, 0],
    [77.5332783767868, 13.16809148481258, 0],
    [77.53339508405537, 13.16836089675141, 0],
    [77.53291262496151, 13.16856220095147, 0]
  ]
};

export const L_BLOCK_BOUNDS = L_BLOCK_KML.bounds;
export const L_BLOCK_CENTER = L_BLOCK_KML.center;

export default L_BLOCK_KML;
