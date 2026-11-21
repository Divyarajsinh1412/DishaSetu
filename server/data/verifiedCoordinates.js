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

  // F. Campus Garden Area (Closed Polygon - 77 Surveyed GPS Points from gardenArea.kml)
  campusGardenArea: [
    { order: 0, lat: 13.17152290823564, lng: 77.5363562412353 },
    { order: 1, lat: 13.17148072406983, lng: 77.53633795180612 },
    { order: 2, lat: 13.17140654182833, lng: 77.53629998545708 },
    { order: 3, lat: 13.17134800989193, lng: 77.53626075332731 },
    { order: 4, lat: 13.1712761858355, lng: 77.53622404454744 },
    { order: 5, lat: 13.17119585164052, lng: 77.53618622731655 },
    { order: 6, lat: 13.17111759348025, lng: 77.53617443779876 },
    { order: 7, lat: 13.17104213239928, lng: 77.53611478645108 },
    { order: 8, lat: 13.17097049383457, lng: 77.53604749091242 },
    { order: 9, lat: 13.17091771767935, lng: 77.53602097523125 },
    { order: 10, lat: 13.17085184939099, lng: 77.5360031825136 },
    { order: 11, lat: 13.17076110930907, lng: 77.53593220277666 },
    { order: 12, lat: 13.1706627232172, lng: 77.53587704372272 },
    { order: 13, lat: 13.17056442601003, lng: 77.53582821190423 },
    { order: 14, lat: 13.17049177121818, lng: 77.53579182507498 },
    { order: 15, lat: 13.17042472215736, lng: 77.53575854596366 },
    { order: 16, lat: 13.17035770656788, lng: 77.53571302461059 },
    { order: 17, lat: 13.17027891471381, lng: 77.5356537038804 },
    { order: 18, lat: 13.17018981591472, lng: 77.53561060052202 },
    { order: 19, lat: 13.17010543591354, lng: 77.53556950502835 },
    { order: 20, lat: 13.1700486150084, lng: 77.53553865533281 },
    { order: 21, lat: 13.16999645947995, lng: 77.53550407030136 },
    { order: 22, lat: 13.16992378899816, lng: 77.53546824575089 },
    { order: 23, lat: 13.16983688852284, lng: 77.5354096512061 },
    { order: 24, lat: 13.16976569908299, lng: 77.53535602034178 },
    { order: 25, lat: 13.16969579028563, lng: 77.53532382438344 },
    { order: 26, lat: 13.16963949351665, lng: 77.53529582811302 },
    { order: 27, lat: 13.16955416724464, lng: 77.53526576380477 },
    { order: 28, lat: 13.16949434251002, lng: 77.53527315960872 },
    { order: 29, lat: 13.16941257288816, lng: 77.53529761895089 },
    { order: 30, lat: 13.16935141712477, lng: 77.53532327399667 },
    { order: 31, lat: 13.16926462836346, lng: 77.53532170048852 },
    { order: 32, lat: 13.16919068664479, lng: 77.53529313654639 },
    { order: 33, lat: 13.16913513499487, lng: 77.53528824681031 },
    { order: 34, lat: 13.16911643762711, lng: 77.5353344273226 },
    { order: 35, lat: 13.16909034347085, lng: 77.53539823028237 },
    { order: 36, lat: 13.16907785806334, lng: 77.53546541734943 },
    { order: 37, lat: 13.16905622472556, lng: 77.53551885010492 },
    { order: 38, lat: 13.16905269480843, lng: 77.53556255837881 },
    { order: 39, lat: 13.16908880735216, lng: 77.53560689770956 },
    { order: 40, lat: 13.16915811726736, lng: 77.53563979583177 },
    { order: 41, lat: 13.16926513748561, lng: 77.53569373186512 },
    { order: 42, lat: 13.16932589396229, lng: 77.53571950332226 },
    { order: 43, lat: 13.1693931448133, lng: 77.53575147365568 },
    { order: 44, lat: 13.16947638004298, lng: 77.53576691561898 },
    { order: 45, lat: 13.16956207818694, lng: 77.53580479985914 },
    { order: 46, lat: 13.16960687658126, lng: 77.53582324843633 },
    { order: 47, lat: 13.16967942807109, lng: 77.53585197945324 },
    { order: 48, lat: 13.16973725448054, lng: 77.53590084062101 },
    { order: 49, lat: 13.16988528534224, lng: 77.53595062616208 },
    { order: 50, lat: 13.17001660283526, lng: 77.53603176079113 },
    { order: 51, lat: 13.17011411363251, lng: 77.53608121995914 },
    { order: 52, lat: 13.17019682154181, lng: 77.53611153853964 },
    { order: 53, lat: 13.170248523833, lng: 77.5361399003381 },
    { order: 54, lat: 13.17029996741501, lng: 77.53616199423722 },
    { order: 55, lat: 13.17037173733629, lng: 77.53619729135622 },
    { order: 56, lat: 13.17046516602148, lng: 77.53624938639284 },
    { order: 57, lat: 13.17054543874848, lng: 77.53629811646249 },
    { order: 58, lat: 13.17062324810489, lng: 77.5363392650187 },
    { order: 59, lat: 13.17069265030788, lng: 77.53637335162897 },
    { order: 60, lat: 13.17074766522529, lng: 77.5364004411824 },
    { order: 61, lat: 13.17079776619141, lng: 77.53641910789602 },
    { order: 62, lat: 13.17086463763862, lng: 77.5364521251532 },
    { order: 63, lat: 13.17093872050851, lng: 77.53648862319177 },
    { order: 64, lat: 13.17101596440048, lng: 77.53651782409436 },
    { order: 65, lat: 13.17108758765604, lng: 77.5365470214659 },
    { order: 66, lat: 13.17116664621149, lng: 77.53658581304107 },
    { order: 67, lat: 13.17122419186695, lng: 77.53661176426027 },
    { order: 68, lat: 13.17127251394573, lng: 77.5366561026811 },
    { order: 69, lat: 13.17134241151924, lng: 77.53670112746313 },
    { order: 70, lat: 13.17140252965973, lng: 77.5366648692055 },
    { order: 71, lat: 13.1714414682026, lng: 77.53662361391387 },
    { order: 72, lat: 13.1714710611276, lng: 77.53657127490692 },
    { order: 73, lat: 13.17150730978909, lng: 77.5365004597208 },
    { order: 74, lat: 13.17153595985238, lng: 77.53645026900378 },
    { order: 75, lat: 13.17158522884285, lng: 77.53635437955832 },
    { order: 76, lat: 13.17152290823564, lng: 77.5363562412353 }
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
