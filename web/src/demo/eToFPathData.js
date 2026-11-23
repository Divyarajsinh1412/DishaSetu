/**
 * DISHASETU: E Block → F Block Exact Surveyed Walkway Path Data
 * Source: Block_E_to_F_path.kml (Presidency University Bengaluru)
 *
 * All coordinates preserved exactly from Google Earth KML (single source of truth).
 */

export const E_TO_F_PATH_KML = {
  id: "path_e_to_f",
  name: "E Block → F Block Walkway",
  label: "E → F PATH",
  category: "Pathway",
  type: "LineString",
  sourceFile: "Block_E_to_F_path.kml",
  placemarkName: "Block E to F path",
  pointCount: 14,
  distanceMeters: 47.02,
  estimatedWalkingMinutes: 0.6,
  lookAt: {
    longitude: 77.53345824218356,
    latitude: 13.16904730836284,
    altitude: 922.7501254995321,
    heading: 352.4940070898861,
    tilt: 0,
    range: 150.8163724916267
  },
  bounds: [
    [13.16883382361067, 77.53358288724588], // [South, West]
    [13.16922581043442, 77.53374838252056]  // [North, East]
  ],
  startPoint: [13.16922581043442, 77.53374838252056], // E Block exit portal
  endPoint: [13.16883382361067, 77.53358288724588],   // F Block entry portal
  // [latitude, longitude] array for Leaflet, Mapbox, Flutter
  coordinates: [
    [13.16922581043442, 77.53374838252056],
    [13.16918960237059, 77.53373237009161],
    [13.16915161956307, 77.53371744159026],
    [13.16911474449877, 77.53369770168051],
    [13.16908524173381, 77.53368679207321],
    [13.16905426359634, 77.53367146613144],
    [13.16902284816958, 77.53365996732241],
    [13.16898658829452, 77.53364633665677],
    [13.16894668893453, 77.53363211029597],
    [13.16891988296132, 77.53362078253889],
    [13.16889094539063, 77.53360697185322],
    [13.16887181098381, 77.53359832121349],
    [13.16884508719851, 77.53358601157329],
    [13.16883382361067, 77.53358288724588]
  ],
  // [longitude, latitude, altitude] exact KML order
  rawPoints: [
    [77.53374838252056, 13.16922581043442, 0],
    [77.53373237009161, 13.16918960237059, 0],
    [77.53371744159026, 13.16915161956307, 0],
    [77.53369770168051, 13.16911474449877, 0],
    [77.53368679207321, 13.16908524173381, 0],
    [77.53367146613144, 13.16905426359634, 0],
    [77.53365996732241, 13.16902284816958, 0],
    [77.53364633665677, 13.16898658829452, 0],
    [77.53363211029597, 13.16894668893453, 0],
    [77.53362078253889, 13.16891988296132, 0],
    [77.53360697185322, 13.16889094539063, 0],
    [77.53359832121349, 13.16887181098381, 0],
    [77.53358601157329, 13.16884508719851, 0],
    [77.53358288724588, 13.16883382361067, 0]
  ]
};

export const E_TO_F_PATH_BOUNDS = E_TO_F_PATH_KML.bounds;
export const E_TO_F_PATH_COORDINATES = E_TO_F_PATH_KML.coordinates;

export default E_TO_F_PATH_KML;
