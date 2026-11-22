/**
 * DISHASETU: F Block Exact Surveyed Geometry Data
 * Source: F_blocks.kml (Presidency University Bengaluru)
 *
 * All coordinates preserved exactly from Google Earth KML (single source of truth).
 */

export const F_BLOCK_KML = {
  id: "bld_f_block",
  name: "F Block",
  label: "F BLOCK",
  code: "PU-F-BLOCK",
  category: "Academic",
  sourceFile: "F_blocks.kml",
  placemarkName: "F blocks",
  pointCount: 6,
  uniqueVertexCount: 5,
  isClosedRing: true,
  lookAt: {
    longitude: 77.53331089357806,
    latitude: 13.16872162958975,
    altitude: 923.5509769707542,
    heading: 352.4939328175869,
    tilt: 0,
    range: 271.8926401407589
  },
  bounds: [
    [13.16837251578433, 77.53298303366202], // [South, West]
    [13.16888089591784, 77.5336757223078]   // [North, East]
  ],
  center: [13.168626705851086, 77.53332937798491], // [Latitude, Longitude]
  metrics: {
    perimeterMeters: 201.91,
    areaSquareMeters: 2206.8,
    vertexCount: 5
  },
  coordinates: [
    [13.16888089591784, 77.53311032453989],
    [13.16860154987379, 77.53298303366202],
    [13.1684781994336, 77.53328655706838],
    [13.16837251578433, 77.533600721204],
    [13.16861816298307, 77.53367572230781],
    [13.16888089591784, 77.53311032453989]
  ],
  rawPoints: [
    [77.53311032453989, 13.16888089591784, 0],
    [77.53298303366202, 13.16860154987379, 0],
    [77.53328655706838, 13.1684781994336, 0],
    [77.533600721204, 13.16837251578433, 0],
    [77.53367572230781, 13.16861816298307, 0],
    [77.53311032453989, 13.16888089591784, 0]
  ]
};

export const F_BLOCK_BOUNDS = F_BLOCK_KML.bounds;
export const F_BLOCK_CENTER = F_BLOCK_KML.center;

export default F_BLOCK_KML;
