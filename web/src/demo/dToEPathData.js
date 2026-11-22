/**
 * DISHASETU: D Block → E Block Exact Surveyed Walkway Path Data
 * Source: block_D_to_E_path.kml (Presidency University Bengaluru)
 *
 * All coordinates preserved exactly from Google Earth KML (single source of truth).
 */

export const D_TO_E_PATH_KML = {
  id: "path_d_to_e",
  name: "D Block → E Block Walkway",
  label: "D → E PATH",
  category: "Pathway",
  type: "LineString",
  sourceFile: "block_D_to_E_path.kml",
  placemarkName: "D to E path",
  pointCount: 8,
  distanceMeters: 35.71,
  estimatedWalkingMinutes: 0.5,
  lookAt: {
    longitude: 77.53316016313386,
    latitude: 13.16918982686245,
    altitude: 922.2337223783193,
    heading: 352.4938906768102,
    tilt: 0,
    range: 273.2098926451727
  },
  bounds: [
    [13.16897943341513, 77.53359127757469], // [South, West]
    [13.16921961010325, 77.53374368525881]  // [North, East]
  ],
  startPoint: [13.16921961010325, 77.53374368525881], // D Block exit portal
  endPoint: [13.16899625259435, 77.53359127757469],   // E Block entry portal
  // [latitude, longitude] array for Leaflet, Mapbox, Flutter
  coordinates: [
    [13.16921961010325, 77.53374368525881],
    [13.16916175269351, 77.53371476009588],
    [13.16909272541975, 77.53368916371579],
    [13.16905243962133, 77.53368308758547],
    [13.16901930916995, 77.5336693526416],
    [13.16897943341513, 77.5336527021713],
    [13.16898258842619, 77.53361351579872],
    [13.16899625259435, 77.53359127757469]
  ],
  // [longitude, latitude, altitude] exact KML order
  rawPoints: [
    [77.53374368525881, 13.16921961010325, 0],
    [77.53371476009588, 13.16916175269351, 0],
    [77.53368916371579, 13.16909272541975, 0],
    [77.53368308758547, 13.16905243962133, 0],
    [77.5336693526416, 13.16901930916995, 0],
    [77.5336527021713, 13.16897943341513, 0],
    [77.53361351579872, 13.16898258842619, 0],
    [77.53359127757469, 13.16899625259435, 0]
  ]
};

export const D_TO_E_PATH_BOUNDS = D_TO_E_PATH_KML.bounds;
export const D_TO_E_PATH_COORDINATES = D_TO_E_PATH_KML.coordinates;

export default D_TO_E_PATH_KML;
