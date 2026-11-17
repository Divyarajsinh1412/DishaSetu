/**
 * DISHASETU: AI-Powered Smart Campus Navigation System
 * Presidency University Bengaluru
 * 
 * VERIFIED GEOGRAPHIC COORDINATES DATASET
 * Format: Latitude, Longitude (Never swapped)
 */

export const VERIFIED_CAMPUS_DATA = {
  campus: {
    id: 'presidency_univ_blr',
    name: 'Presidency University',
    university: 'Presidency University Bengaluru',
    tagline: 'Your Campus. Your Direction. Your Way.',
    state: 'Karnataka',
    country: 'India',
    address: 'Itgalpur, Rajanakunte, Yelahanka, Bengaluru, Karnataka 560064',
    defaultLocation: {
      name: 'Presidency University – Main Gate',
      lat: 13.1717995,
      lng: 77.5361915,
      zoom: 18
    },
    bounds: {
      southWest: [13.169044795226714, 77.53496327115832],
      northEast: [13.171866, 77.53670086988951]
    },
    boundaryStatus: 'Pending complete perimeter verification by project owner'
  },

  // A. Main Gate
  mainGate: {
    id: 'main_gate',
    name: 'Presidency University – Main Gate',
    type: 'entrance',
    category: 'Gate',
    description: 'Main campus entrance gate and official visitor/student arrival portal.',
    center: {
      lat: 13.1717995,
      lng: 77.5361915
    },
    spanEndpoints: [
      { lat: 13.171733, lng: 77.535971, label: 'Main Gate West Span' },
      { lat: 13.171866, lng: 77.536412, label: 'Main Gate East Span' }
    ],
    verified: true
  },

  // B. Walking Avenue Starting Points
  walkingAvenueStartingPoints: [
    { order: 0, lat: 13.171678294400234, lng: 77.53603793626303, label: 'Start Point 1 (West)' },
    { order: 1, lat: 13.171686129333589, lng: 77.53619216327907, label: 'Start Point 2 (Center)' },
    { order: 2, lat: 13.171707022487999, lng: 77.53634639029512, label: 'Start Point 3 (East)' }
  ],

  // C. Walking Avenue Right Side (Ordered)
  walkingAvenueRightSide: [
    { order: 0, lat: 13.171482420984697, lng: 77.53602050190469 },
    { order: 1, lat: 13.171407336133866, lng: 77.53601916079396 },
    { order: 2, lat: 13.17129634109479,  lng: 77.53596551661188 },
    { order: 3, lat: 13.171230447857006, lng: 77.53593383670935 },
    { order: 4, lat: 13.171064287934131, lng: 77.53583336109162 },
    { order: 5, lat: 13.170909265878267, lng: 77.53577684729817 },
    { order: 6, lat: 13.170778148908282, lng: 77.5357123626213 },
    { order: 7, lat: 13.170563006125553, lng: 77.53557296192078 },
    { order: 8, lat: 13.170114090822393, lng: 77.53530991424002 },
    { order: 9, lat: 13.169806615823875, lng: 77.53513129092394 }
  ],

  // D. Walking Avenue Left Side (Ordered)
  walkingAvenueLeftSide: [
    { order: 0, lat: 13.171528151186376, lng: 77.53633624477916 },
    { order: 1, lat: 13.171340382525962, lng: 77.5362505372984 },
    { order: 2, lat: 13.17117786917938,  lng: 77.53617385165995 },
    { order: 3, lat: 13.171020846045975, lng: 77.5360689727723 },
    { order: 4, lat: 13.170820998276696, lng: 77.53596183842467 },
    { order: 5, lat: 13.170573933501382, lng: 77.53584455450823 },
    { order: 6, lat: 13.170408125447253, lng: 77.53574193107875 },
    { order: 7, lat: 13.170159990725024, lng: 77.53557825696399 },
    { order: 8, lat: 13.169924941141574, lng: 77.53547633302622 },
    { order: 9, lat: 13.16971600799429,  lng: 77.53534624588568 }
  ],

  // E. Central Tree Divider
  centralTreeDivider: {
    id: 'central_tree_divider',
    name: 'Central Landscaped Tree Divider',
    type: 'divider',
    start: { lat: 13.171202041140145, lng: 77.53603155029147 },
    end:   { lat: 13.169760688021354, lng: 77.53523385567227 },
    description: 'Central landscaped tree divider separating parallel avenue lanes.',
    verified: true
  },

  // F. Campus Garden Area (Closed Polygon)
  campusGardenArea: [
    { order: 0,  lat: 13.171584588886313, lng: 77.53637275667879 },
    { order: 1,  lat: 13.17138145045566,  lng: 77.53670086988951 },
    { order: 2,  lat: 13.171036114731598, lng: 77.53606929937222 },
    { order: 3,  lat: 13.17049286550813,  lng: 77.53578670581075 },
    { order: 4,  lat: 13.169559294189776, lng: 77.53524986285183 },
    { order: 5,  lat: 13.169461356647048, lng: 77.53526729720942 },
    { order: 6,  lat: 13.16927853980882,  lng: 77.53531021255301 },
    { order: 7,  lat: 13.169053936076063, lng: 77.53527534383593 },
    { order: 8,  lat: 13.169044795226714, lng: 77.5355918444972 },
    { order: 9,  lat: 13.169281151482723, lng: 77.53571790832018 },
    { order: 10, lat: 13.169496614168251, lng: 77.53579301017147 },
    { order: 11, lat: 13.169560600027184, lng: 77.5357970334883 },
    { order: 12, lat: 13.169909257338746, lng: 77.53597003596872 },
    { order: 13, lat: 13.170257914157348, lng: 77.53613230961408 },
    { order: 14, lat: 13.170692755112608, lng: 77.5363535918569 },
    { order: 15, lat: 13.171030964211255, lng: 77.53652927654741 },
    { order: 16, lat: 13.171387454367919, lng: 77.53669155019038 },
    { order: 17, lat: 13.171382231077873, lng: 77.53669825571407 },
    { order: 18, lat: 13.171497143547667, lng: 77.53653061765316 }
  ],

  // G. Garden Interior Ending Boundary
  gardenInteriorBoundary: [
    { order: 0, lat: 13.169051180005779, lng: 77.53557258820744 },
    { order: 1, lat: 13.169073141465367, lng: 77.53547109251141 },
    { order: 2, lat: 13.169128045105731, lng: 77.53532899853697 },
    { order: 3, lat: 13.169200517892161, lng: 77.53534478675634 },
    { order: 4, lat: 13.169310325103451, lng: 77.53532899853697 },
    { order: 5, lat: 13.16938719012206,  lng: 77.53531546577749 },
    { order: 6, lat: 13.169448682119583, lng: 77.53529291117837 },
    { order: 7, lat: 13.169538723945223, lng: 77.53527486749907 }
  ],

  // H. Two-Wheeler Parking Entry
  parkingEntry: {
    id: 'parking_entry_two_wheeler',
    name: 'Two-Wheeler Parking Entry',
    type: 'parking_entry',
    category: 'Parking',
    description: 'Designated campus vehicular access span for student and faculty two-wheelers.',
    center: {
      lat: (13.171785830327467 + 13.171706274643501) / 2,
      lng: (77.53556087481425 + 77.53551828627056) / 2
    },
    spanEndpoints: [
      { lat: 13.171785830327467, lng: 77.53556087481425, label: 'Entry Span North' },
      { lat: 13.171706274643501, lng: 77.53551828627056, label: 'Entry Span South' }
    ],
    verified: true
  },

  // I. Two-Wheeler Parking Area (Four Boundary Points)
  parkingAreaPoints: [
    { order: 0, lat: 13.171784151929373, lng: 77.5355488587235,  label: 'North-West' },
    { order: 1, lat: 13.171650188478493, lng: 77.53597175745696, label: 'North-East' },
    { order: 2, lat: 13.171183353574152, lng: 77.53531338512849, label: 'South-West' },
    { order: 3, lat: 13.171023405208425, lng: 77.53569472664753, label: 'South-East' }
  ],

  // J. Fountain Landmark
  fountain: {
    id: 'campus_fountain',
    name: 'Campus Central Fountain',
    type: 'landmark',
    category: 'Landmark',
    description: 'Central landmark decorative fountain situated near the avenue south termination.',
    coordinates: {
      lat: 13.169277162668132,
      lng: 77.53496327115832
    },
    verified: true
  }
};

/**
 * Validated non-self-intersecting perimeter for Two-Wheeler Parking Area
 * (NW -> NE -> SE -> SW -> NW)
 */
export const getValidatedParkingPolygon = () => {
  const p = VERIFIED_CAMPUS_DATA.parkingAreaPoints;
  return [
    [p[0].lat, p[0].lng],
    [p[1].lat, p[1].lng],
    [p[3].lat, p[3].lng],
    [p[2].lat, p[2].lng]
  ];
};

/**
 * Walking Avenue corridor boundary polygon
 */
export const getWalkingAvenueCorridorPolygon = () => {
  const start = VERIFIED_CAMPUS_DATA.walkingAvenueStartingPoints.map(p => [p.lat, p.lng]);
  const right = VERIFIED_CAMPUS_DATA.walkingAvenueRightSide.map(p => [p.lat, p.lng]);
  const left = VERIFIED_CAMPUS_DATA.walkingAvenueLeftSide.map(p => [p.lat, p.lng]);

  return [
    ...start,
    ...right,
    ...left.slice().reverse()
  ];
};
