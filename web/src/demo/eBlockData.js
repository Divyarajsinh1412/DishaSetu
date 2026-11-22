/**
 * DISHASETU: E Block Exact Surveyed Geometry Data
 * Source: E_blocks.kml (Presidency University Bengaluru)
 *
 * All coordinates preserved exactly from Google Earth KML (single source of truth).
 */

export const E_BLOCK_KML = {
  id: "bld_e_block",
  name: "E Block",
  label: "E BLOCK",
  code: "PU-E-BLOCK",
  category: "Academic",
  sourceFile: "E_blocks.kml",
  placemarkName: "E blocks",
  pointCount: 12,
  uniqueVertexCount: 11,
  isClosedRing: true,
  lookAt: {
    longitude: 77.53371984646557,
    latitude: 13.16898943745478,
    altitude: 923.1147197996663,
    heading: 352.4940481406849,
    tilt: 0,
    range: 272.3288889159085
  },
  bounds: [
    [13.16874128152772, 77.53314339639763], // [South, West]
    [13.16924176270007, 77.53389309172695]  // [North, East]
  ],
  center: [13.168991522113895, 77.5335182440623], // [Latitude, Longitude]
  metrics: {
    perimeterMeters: 225.15,
    areaSquareMeters: 2230.9,
    vertexCount: 11
  },
  coordinates: [
    [13.16924176270007, 77.5332040689098],
    [13.16909058551649, 77.53314339639763],
    [13.16903521966335, 77.53322547683028],
    [13.16892225444154, 77.53320376752791],
    [13.16882611711523, 77.53345050580258],
    [13.16874128152772, 77.53373977918039],
    [13.16881051410963, 77.53378125010779],
    [13.16878209426692, 77.53385434344899],
    [13.16885779677831, 77.53389309172695],
    [13.16888315229893, 77.53379674649331],
    [13.16897085539149, 77.53382871888829],
    [13.16924176270007, 77.5332040689098]
  ],
  rawPoints: [
    [77.5332040689098, 13.16924176270007, 0],
    [77.53314339639763, 13.16909058551649, 0],
    [77.53322547683028, 13.16903521966335, 0],
    [77.53320376752791, 13.16892225444154, 0],
    [77.53345050580258, 13.16882611711523, 0],
    [77.53373977918039, 13.16874128152772, 0],
    [77.53378125010779, 13.16881051410963, 0],
    [77.53385434344899, 13.16878209426692, 0],
    [77.53389309172695, 13.16885779677831, 0],
    [77.53379674649331, 13.16888315229893, 0],
    [77.53382871888829, 13.16897085539149, 0],
    [77.5332040689098, 13.16924176270007, 0]
  ]
};

export const E_BLOCK_BOUNDS = E_BLOCK_KML.bounds;
export const E_BLOCK_CENTER = E_BLOCK_KML.center;

export default E_BLOCK_KML;
