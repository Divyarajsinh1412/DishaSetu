/**
 * DISHASETU: Main Lawn Authoritative GPS Polygon Data
 * Presidency University Bengaluru
 * 
 * Source: main lawn.kml
 * Placemark: Main Lawn
 * 
 * Exact Surveyed Coordinates: 14 points (13 unique vertices + closing vertex)
 * Geodesic Area: 14596.23 m² (~3.61 acres / 1,57,112 sq ft)
 * Perimeter: 665.23 m (~0.67 km)
 * 
 * All coordinates preserve 100% exact original GPS precision without simplification,
 * smoothing, or manual approximation. Converted: KML [lng, lat, alt] -> Leaflet [lat, lng].
 */

export const MAIN_LAWN_KML = {
  id: 'main_lawn_polygon',
  name: 'Main Lawn',
  label: 'MAIN LAWN',
  sourceFile: 'main lawn.kml',
  placemarkName: "Main Lawn",
  pointCount: 14,
  uniqueVertexCount: 13,
  isClosedRing: true,
  bounds: [
    [13.16906515009727, 77.53525104479897],
    [13.17157313942493, 77.53670252127219]
  ],
  center: [13.17004541240058, 77.53563408986926],
  metrics: {
    perimeterMeters: 665.23,
    perimeterKm: 0.665,
    areaSqMeters: 14596.23,
    areaSqFt: 157112.36,
    areaAcres: 3.6068,
    areaHectares: 1.4596
  },
  style: {
    fillColor: '#86efac',       // Light green matching the reference campus map
    fillOpacity: 0.70,          // 70% opacity as requested (65-75%)
    strokeColor: '#15803d',     // Clearly visible darker green border
    strokeWeight: 3.5,          // 3-4 px border
    strokeOpacity: 0.95
  },
  coordinates: [
  [
    13.17139210870795,
    77.53670252127219
  ],
  [
    13.17157313942493,
    77.53636139757869
  ],
  [
    13.17058348029135,
    77.53577898044347
  ],
  [
    13.1703756310686,
    77.53564971030023
  ],
  [
    13.17027653706961,
    77.53559739807498
  ],
  [
    13.17015360404113,
    77.53553667740204
  ],
  [
    13.16999314251255,
    77.535452369835
  ],
  [
    13.16981211543586,
    77.53535751468524
  ],
  [
    13.16955263191546,
    77.53525104479897
  ],
  [
    13.16942214259823,
    77.53531558114577
  ],
  [
    13.16927934926582,
    77.53534835468231
  ],
  [
    13.16911132877874,
    77.5353053621707
  ],
  [
    13.16906515009727,
    77.53558625591066
  ],
  [
    13.17139210870795,
    77.53670252127219
  ]
],
  rawPoints: [
  {
    "lat": 13.17139210870795,
    "lng": 77.53670252127219,
    "alt": 0
  },
  {
    "lat": 13.17157313942493,
    "lng": 77.53636139757869,
    "alt": 0
  },
  {
    "lat": 13.17058348029135,
    "lng": 77.53577898044347,
    "alt": 0
  },
  {
    "lat": 13.1703756310686,
    "lng": 77.53564971030023,
    "alt": 0
  },
  {
    "lat": 13.17027653706961,
    "lng": 77.53559739807498,
    "alt": 0
  },
  {
    "lat": 13.17015360404113,
    "lng": 77.53553667740204,
    "alt": 0
  },
  {
    "lat": 13.16999314251255,
    "lng": 77.535452369835,
    "alt": 0
  },
  {
    "lat": 13.16981211543586,
    "lng": 77.53535751468524,
    "alt": 0
  },
  {
    "lat": 13.16955263191546,
    "lng": 77.53525104479897,
    "alt": 0
  },
  {
    "lat": 13.16942214259823,
    "lng": 77.53531558114577,
    "alt": 0
  },
  {
    "lat": 13.16927934926582,
    "lng": 77.53534835468231,
    "alt": 0
  },
  {
    "lat": 13.16911132877874,
    "lng": 77.5353053621707,
    "alt": 0
  },
  {
    "lat": 13.16906515009727,
    "lng": 77.53558625591066,
    "alt": 0
  },
  {
    "lat": 13.17139210870795,
    "lng": 77.53670252127219,
    "alt": 0
  }
]
};

export const MAIN_LAWN_BOUNDS = [
  [13.16906515009727, 77.53525104479897],
  [13.17157313942493, 77.53670252127219]
];

export const MAIN_LAWN_CENTER = [13.17004541240058, 77.53563408986926];
