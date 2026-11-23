/**
 * DishaSetu Web API Client
 * Integrated with Presidency University Bengaluru Campus Backend
 */
import { INITIAL_PANORAMA_SCENES, INITIAL_PANORAMA_HOTSPOTS } from '../data/panoramaData.js';
import { API_BASE_URL, getApiUrl, apiFetch } from '../config/apiConfig.js';
export { API_BASE_URL, getApiUrl, apiFetch };

/**
 * Resilient centralized fetch wrapper that automatically prepends API_BASE_URL
 * and injects authorization headers.
 */
export const appFetch = (endpoint, options = {}) => {
  const fullUrl = getApiUrl(endpoint);
  const token = options.token || (typeof window !== 'undefined' ? localStorage.getItem('dishasetu_admin_token') : null);
  const headers = { ...options.headers };
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(fullUrl, { ...options, headers });
};


// Fallback verified campus dataset (matches server/data/verifiedCoordinates.js)
const FALLBACK_CAMPUS_DATA = {
  campus: {
    id: 'presidency_univ_blr',
    name: 'Presidency University',
    university: 'Presidency University Bengaluru',
    tagline: 'Your Campus. Your Direction. Your Way.',
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
    }
  },
  features: [
    {
      featureId: 'feature_main_gate_span',
      name: 'Presidency University – Main Gate Span',
      category: 'gate_span',
      geometryType: 'LineString',
      coordinates: [
        [13.171733, 77.535971],
        [13.171866, 77.536412]
      ],
      style: { color: '#10b981', weight: 6, opacity: 1.0 },
      metadata: { description: 'Main entrance span connecting West and East gate pillars.' }
    },
    {
      featureId: 'feature_walking_avenue_corridor',
      name: 'Main Walking Avenue Corridor',
      category: 'corridor',
      geometryType: 'Polygon',
      coordinates: [
        [13.171678294400234, 77.53603793626303],
        [13.171686129333589, 77.53619216327907],
        [13.171707022487999, 77.53634639029512],
        [13.171482420984697, 77.53602050190469],
        [13.171407336133866, 77.53601916079396],
        [13.17129634109479, 77.53596551661188],
        [13.171230447857006, 77.53593383670935],
        [13.171064287934131, 77.53583336109162],
        [13.170909265878267, 77.53577684729817],
        [13.170778148908282, 77.5357123626213],
        [13.170563006125553, 77.53557296192078],
        [13.170114090822393, 77.53530991424002],
        [13.169806615823875, 77.53513129092394],
        [13.16971600799429, 77.53534624588568],
        [13.169924941141574, 77.53547633302622],
        [13.170159990725024, 77.53557825696399],
        [13.170408125447253, 77.53574193107875],
        [13.170573933501382, 77.53584455450823],
        [13.170820998276696, 77.53596183842467],
        [13.171020846045975, 77.5360689727723],
        [13.17117786917938, 77.53617385165995],
        [13.171340382525962, 77.5362505372984],
        [13.171528151186376, 77.53633624477916]
      ],
      style: { color: '#3b82f6', fillColor: '#60a5fa', weight: 2, opacity: 0.9, fillOpacity: 0.35 },
      metadata: { description: 'Combined pedestrian avenue corridor extending from Main Gate into central campus.' }
    },
    {
      featureId: 'feature_walking_avenue_right_side',
      name: 'Walking Avenue – Right Boundary',
      category: 'walkway',
      geometryType: 'LineString',
      coordinates: [
        [13.171482420984697, 77.53602050190469],
        [13.171407336133866, 77.53601916079396],
        [13.17129634109479, 77.53596551661188],
        [13.171230447857006, 77.53593383670935],
        [13.171064287934131, 77.53583336109162],
        [13.170909265878267, 77.53577684729817],
        [13.170778148908282, 77.5357123626213],
        [13.170563006125553, 77.53557296192078],
        [13.170114090822393, 77.53530991424002],
        [13.169806615823875, 77.53513129092394]
      ],
      style: { color: '#2563eb', weight: 4, opacity: 0.9 },
      metadata: { description: 'Surveyed right-side paved avenue border (10 ordered points).' }
    },
    {
      featureId: 'feature_walking_avenue_left_side',
      name: 'Walking Avenue – Left Boundary',
      category: 'walkway',
      geometryType: 'LineString',
      coordinates: [
        [13.171528151186376, 77.53633624477916],
        [13.171340382525962, 77.5362505372984],
        [13.17117786917938, 77.53617385165995],
        [13.171020846045975, 77.5360689727723],
        [13.170820998276696, 77.53596183842467],
        [13.170573933501382, 77.53584455450823],
        [13.170408125447253, 77.53574193107875],
        [13.170159990725024, 77.53557825696399],
        [13.169924941141574, 77.53547633302622],
        [13.16971600799429, 77.53534624588568]
      ],
      style: { color: '#2563eb', weight: 4, opacity: 0.9 },
      metadata: { description: 'Surveyed left-side paved avenue border (10 ordered points).' }
    },
    {
      featureId: 'feature_central_tree_divider',
      name: 'Central Landscaped Tree Divider',
      category: 'divider',
      geometryType: 'LineString',
      coordinates: [
        [13.171202041140145, 77.53603155029147],
        [13.169760688021354, 77.53523385567227]
      ],
      style: { color: '#059669', weight: 5, opacity: 0.95, dashArray: '8, 6' },
      metadata: { description: 'Central landscaped tree divider running between the two sides of the walking avenue.' }
    },
    {
      featureId: 'feature_campus_garden_area',
      name: 'Presidency Campus Central Garden',
      category: 'garden',
      geometryType: 'Polygon',
      coordinates: [
        [13.171584588886313, 77.53637275667879],
        [13.17138145045566, 77.53670086988951],
        [13.171036114731598, 77.53606929937222],
        [13.17049286550813, 77.53578670581075],
        [13.169559294189776, 77.53524986285183],
        [13.169461356647048, 77.53526729720942],
        [13.16927853980882, 77.53531021255301],
        [13.169053936076063, 77.53527534383593],
        [13.169044795226714, 77.5355918444972],
        [13.169281151482723, 77.53571790832018],
        [13.169496614168251, 77.53579301017147],
        [13.169560600027184, 77.5357970334883],
        [13.169909257338746, 77.53597003596872],
        [13.170257914157348, 77.53613230961408],
        [13.170692755112608, 77.5363535918569],
        [13.171030964211255, 77.53652927654741],
        [13.171387454367919, 77.53669155019038],
        [13.171382231077873, 77.53669825571407],
        [13.171497143547667, 77.53653061765316]
      ],
      style: { color: '#15803d', fillColor: '#22c55e', weight: 2, opacity: 0.9, fillOpacity: 0.4 },
      metadata: { description: 'Campus garden polygon preserved with 19 ordered boundary points without simplification.' }
    },
    {
      featureId: 'feature_garden_interior_boundary',
      name: 'Garden Interior Ending Boundary',
      category: 'garden',
      geometryType: 'LineString',
      coordinates: [
        [13.169051180005779, 77.53557258820744],
        [13.169073141465367, 77.53547109251141],
        [13.169128045105731, 77.53532899853697],
        [13.169200517892161, 77.53534478675634],
        [13.169310325103451, 77.53532899853697],
        [13.16938719012206, 77.53531546577749],
        [13.169448682119583, 77.53529291117837],
        [13.169538723945223, 77.53527486749907]
      ],
      style: { color: '#166534', weight: 3, opacity: 0.85, dashArray: '4, 4' },
      metadata: { description: 'Interior boundary line inside the south-west garden zone (8 ordered points).' }
    },
    {
      featureId: 'feature_parking_entry_span',
      name: 'Two-Wheeler Parking Entry Span',
      category: 'gate_span',
      geometryType: 'LineString',
      coordinates: [
        [13.171785830327467, 77.53556087481425],
        [13.171706274643501, 77.53551828627056]
      ],
      style: { color: '#ea580c', weight: 6, opacity: 1.0 },
      metadata: { description: 'Two-Wheeler parking entrance vehicular access span.' }
    },
    {
      featureId: 'feature_two_wheeler_parking_area',
      name: 'Two-Wheeler Student & Staff Parking',
      category: 'parking',
      geometryType: 'Polygon',
      coordinates: [
        [13.171784151929373, 77.5355488587235],
        [13.171650188478493, 77.53597175745696],
        [13.171023405208425, 77.53569472664753],
        [13.171183353574152, 77.53531338512849]
      ],
      style: { color: '#c2410c', fillColor: '#f97316', weight: 2, opacity: 0.9, fillOpacity: 0.35 },
      metadata: { description: 'Paved two-wheeler parking lot with validated non-self-intersecting perimeter geometry.' }
    },
    {
      featureId: 'feat_def_blocks',
      name: 'DEF Blocks',
      category: 'boundary',
      geometryType: 'Polygon',
      coordinates: [
        [13.16828186104801, 77.53263433547887],
        [13.168026534086, 77.53317107659311],
        [13.16677606947738, 77.53263663130764],
        [13.16651440674394, 77.53344099346141],
        [13.1691612075576, 77.5345945482777],
        [13.16969830413923, 77.53332483536148],
        [13.16828186104801, 77.53263433547887]
      ],
      geoJSON: {
        type: 'Polygon',
        coordinates: [
          [
            [77.53263433547887, 13.16828186104801],
            [77.53317107659311, 13.168026534086],
            [77.53263663130764, 13.16677606947738],
            [77.53344099346141, 13.16651440674394],
            [77.5345945482777, 13.1691612075576],
            [77.53332483536148, 13.16969830413923],
            [77.53263433547887, 13.16828186104801]
          ]
        ]
      },
      style: {
        color: '#FBC02D',
        fillColor: '#FBC02D',
        weight: 3.5,
        opacity: 0.95,
        fillOpacity: 0.25,
        dashArray: '8, 5'
      },
      metadata: {
        description: 'Exact surveyed boundary polygon for DEF Blocks complex extracted from Google Earth KML.',
        placemarkName: 'DEF blocks',
        kmlSource: 'Untitled map project(1).kml',
        blocksIncluded: ['D Block', 'E Block', 'F Block']
      },
      verified: true,
      status: 'published'
    }
  ],
  locations: [
    {
      _id: 'loc_main_gate',
      name: 'Presidency University – Main Gate',
      shortCode: 'PU-GATE-MAIN',
      category: 'Gate',
      description: 'Official main campus entrance gate and visitor/student arrival portal.',
      coordinates: { lat: 13.1717995, lng: 77.5361915 },
      verified: true,
      status: 'published'
    },
    {
      _id: 'loc_fountain',
      name: 'Campus Central Fountain',
      shortCode: 'PU-FOUNTAIN-01',
      category: 'Landmark',
      description: 'Central decorative water fountain landmark located near avenue south termination.',
      coordinates: { lat: 13.169277162668132, lng: 77.53496327115832 },
      verified: true,
      status: 'published'
    },
    {
      _id: 'loc_parking_entry',
      name: 'Two-Wheeler Parking Entry',
      shortCode: 'PU-PARK-2W',
      category: 'Parking',
      description: 'Vehicular access span for student and faculty two-wheelers.',
      coordinates: { lat: 13.171746, lng: 77.53554 },
      verified: true,
      status: 'published'
    },
    {
      _id: 'loc_garden',
      name: 'Presidency Campus Central Garden',
      shortCode: 'PU-GARDEN-01',
      category: 'Garden',
      description: 'Lush landscaped green garden along the avenue corridor.',
      coordinates: { lat: 13.17049286550813, lng: 77.53578670581075 },
      verified: true,
      status: 'published'
    }
  ],
  routes: [
    {
      _id: 'route_main_gate_to_fountain',
      name: 'Main Gate to Central Fountain Walkway',
      routeId: 'route_main_gate_to_fountain',
      startLocation: { name: 'Presidency University – Main Gate', lat: 13.1717995, lng: 77.5361915 },
      endLocation: { name: 'Campus Central Fountain', lat: 13.169277162668132, lng: 77.53496327115832 },
      waypoints: [
        { order: 0, lat: 13.1717995, lng: 77.5361915, instruction: 'Start at Presidency University Main Gate.', landmark: 'Main Gate' },
        { order: 1, lat: 13.171686129333589, lng: 77.53619216327907, instruction: 'Proceed south along the main paved walking avenue.', landmark: 'Avenue Origin' },
        { order: 2, lat: 13.170820998276696, lng: 77.53596183842467, instruction: 'Continue straight past the central tree divider on your right.', landmark: 'Central Tree Divider' },
        { order: 3, lat: 13.169806615823875, lng: 77.53513129092394, instruction: 'Reach the end of the walking avenue near the garden pavilion.', landmark: 'Garden Pavilion' },
        { order: 4, lat: 13.169277162668132, lng: 77.53496327115832, instruction: 'Arrive at Campus Central Fountain on your right.', landmark: 'Central Fountain' }
      ],
      geometry: [
        [13.1717995, 77.5361915],
        [13.171686129333589, 77.53619216327907],
        [13.171407336133866, 77.53601916079396],
        [13.171064287934131, 77.53583336109162],
        [13.170563006125553, 77.53557296192078],
        [13.170114090822393, 77.53530991424002],
        [13.169806615823875, 77.53513129092394],
        [13.169461356647048, 77.53505],
        [13.169277162668132, 77.53496327115832]
      ],
      distanceMeters: 345,
      estimatedWalkingMinutes: 4.5,
      routeType: 'pedestrian',
      accessible: true
    }
  ]
};

export const fetchCampusData = async () => {
  try {
    const res = await appFetch('/api/campus');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.campus) return data.campus;
    }
  } catch (e) {
    console.warn('API /campus fallback:', e.message);
  }
  return FALLBACK_CAMPUS_DATA.campus;
};

export const fetchCampusFeatures = async () => {
  try {
    const res = await appFetch('/api/features');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /features fallback:', e.message);
  }
  return FALLBACK_CAMPUS_DATA.features;
};

export const fetchCampusLocations = async (category = '', search = '') => {
  try {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const res = await appFetch(`/api/locations?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /locations fallback:', e.message);
  }
  let list = FALLBACK_CAMPUS_DATA.locations;
  if (category) list = list.filter(l => l.category.toLowerCase() === category.toLowerCase());
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(l => l.name.toLowerCase().includes(q) || (l.description && l.description.toLowerCase().includes(q)));
  }
  return list;
};

export const fetchCampusRoutes = async () => {
  try {
    const res = await appFetch('/api/routes');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /routes fallback:', e.message);
  }
  return FALLBACK_CAMPUS_DATA.routes;
};

// BUILDINGS API
export const fetchBuildings = async (category = '', search = '') => {
  try {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const res = await appFetch(`/api/buildings?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /buildings fallback:', e.message);
  }
  return [];
};

export const createBuildingApi = async (buildingData, token) => {
  const res = await appFetch('/api/buildings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(buildingData)
  });
  return await res.json();
};

export const updateBuildingApi = async (id, buildingData, token) => {
  const res = await appFetch(`/api/buildings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(buildingData)
  });
  return await res.json();
};

export const deleteBuildingApi = async (id, token) => {
  const res = await appFetch(`/api/buildings/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await res.json();
};

export const addBuildingEntranceApi = async (buildingId, entranceData, token) => {
  const res = await appFetch(`/api/buildings/${buildingId}/entrances`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(entranceData)
  });
  return await res.json();
};

export const deleteBuildingEntranceApi = async (buildingId, entranceId, token) => {
  const res = await appFetch(`/api/buildings/${buildingId}/entrances/${entranceId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await res.json();
};

// DEPARTMENTS API
export const fetchDepartments = async (filter = {}) => {
  try {
    const params = new URLSearchParams();
    if (filter.faculty) params.append('faculty', filter.faculty);
    if (filter.buildingShortCode) params.append('buildingShortCode', filter.buildingShortCode);
    const res = await appFetch(`/api/departments?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /departments fallback:', e.message);
  }
  return [];
};

export const createDepartmentApi = async (deptData, token) => {
  const res = await appFetch('/api/departments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(deptData)
  });
  return await res.json();
};

export const updateDepartmentApi = async (id, deptData, token) => {
  const res = await appFetch(`/api/departments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(deptData)
  });
  return await res.json();
};

export const deleteDepartmentApi = async (id, token) => {
  const res = await appFetch(`/api/departments/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await res.json();
};

// APPROVALS & AUDIT API
export const fetchApprovals = async (token) => {
  try {
    const res = await appFetch('/api/approvals', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /approvals fallback:', e.message);
  }
  return [];
};

export const reviewApprovalApi = async (id, decision, rejectionReason, token) => {
  const res = await appFetch(`/api/approvals/${id}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ decision, rejectionReason })
  });
  return await res.json();
};

export const fetchAuditLogs = async (limit = 50, token) => {
  try {
    const res = await appFetch(`/api/audit-logs?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /audit-logs fallback:', e.message);
  }
  return [];
};

// REAL-TIME SYNC STREAM
export const connectSyncStream = (onEvent) => {
  try {
    const eventSource = new EventSource(getApiUrl('/api/sync/stream'));
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (onEvent) onEvent(payload);
      } catch (err) {
        console.error('SSE JSON parse error:', err);
      }
    };
    eventSource.onerror = () => {
      // EventSource auto reconnects
    };
    return () => eventSource.close();
  } catch (err) {
    console.warn('Could not establish EventSource connection:', err.message);
    return () => { };
  }
};

// ========================================================
// PHASE 3A: CAMPUS LOCATION CATALOG & GPS SURVEY APIS
// ========================================================
export const fetchCampusCatalog = async (filter = {}) => {
  try {
    const params = new URLSearchParams();
    if (filter.category) params.append('category', filter.category);
    if (filter.status) params.append('status', filter.status);
    if (filter.search) params.append('search', filter.search);

    const res = await appFetch(`/api/campus/catalog?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /campus/catalog fallback:', e.message);
  }

  // Offline fallback from local campus catalog
  try {
    const { COMPLETE_CAMPUS_CATALOG } = await import('./campusCatalog.js');
    return COMPLETE_CAMPUS_CATALOG;
  } catch {
    return [];
  }
};

export const updateLocationSurveyApi = async (id, surveyData, token) => {
  const res = await appFetch(`/api/admin/locations/${id}/survey`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(surveyData)
  });
  return await res.json();
};

// ========================================================
// PHASE 3A: PEDESTRIAN NAVIGATION & ROUTING APIS
// ========================================================
export const calculateRouteApi = async (routeParams) => {
  try {
    const res = await appFetch('/api/navigation/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routeParams)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('Backend route calculation fallback to client routing engine:', e.message);
  }

  // Fallback to local client routing engine (instant zero-latency client-side Dijkstra)
  const { clientRoutingEngine } = await import('./routingEngine.js');
  return clientRoutingEngine.calculateRoute(routeParams);
};

export const fetchNavigationNodes = async () => {
  try {
    const res = await appFetch('/api/navigation/nodes');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /navigation/nodes fallback:', e.message);
  }
  const { NAVIGATION_NODES } = await import('./pedestrianGraphData.js');
  return NAVIGATION_NODES;
};

export const fetchWalkingPaths = async () => {
  try {
    const res = await appFetch('/api/navigation/paths');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /navigation/paths fallback:', e.message);
  }
  const { WALKING_PATHS } = await import('./pedestrianGraphData.js');
  return WALKING_PATHS;
};

export const fetchNavigationGraph = async () => {
  try {
    const res = await appFetch('/api/navigation/graph');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /navigation/graph fallback:', e.message);
  }
  const { NAVIGATION_NODES, WALKING_PATHS } = await import('./pedestrianGraphData.js');
  return { nodes: NAVIGATION_NODES, paths: WALKING_PATHS };
};

export const createWalkingPathApi = async (pathData, token) => {
  const res = await appFetch('/api/admin/paths', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(pathData)
  });
  return await res.json();
};

export const importKmlPathApi = async (kmlPayload, token) => {
  const res = await appFetch('/api/admin/paths/import-kml', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(kmlPayload)
  });
  return await res.json();
};

export const updateWalkingPathApi = async (pathId, updates, token) => {
  const res = await appFetch(`/api/admin/paths/${pathId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  return await res.json();
};

export const deleteWalkingPathApi = async (pathId, token) => {
  const res = await appFetch(`/api/admin/paths/${pathId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await res.json();
};

// ==========================================
// 360° IMMERSIVE AERIAL PANORAMA APIS
// ==========================================

export const fetchPanoramaScenes = async () => {
  try {
    const res = await appFetch('/api/panorama/scenes');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) return data.data;
    }
  } catch (e) {
    console.warn('API /panorama/scenes fallback:', e.message);
  }
  return INITIAL_PANORAMA_SCENES;
};

export const fetchPanoramaSceneById = async (sceneId) => {
  try {
    const res = await appFetch(`/api/panorama/scenes/${sceneId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /panorama/scenes/:id fallback:', e.message);
  }
  return INITIAL_PANORAMA_SCENES.find(s => s.sceneId === sceneId) || INITIAL_PANORAMA_SCENES[0];
};

export const fetchPanoramaHotspots = async (sceneId = null) => {
  try {
    const url = sceneId ? `/api/panorama/hotspots?sceneId=${sceneId}` : '/api/panorama/hotspots';
    const res = await appFetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) return data.data;
    }
  } catch (e) {
    console.warn('API /panorama/hotspots fallback:', e.message);
  }
  if (sceneId) {
    return INITIAL_PANORAMA_HOTSPOTS.filter(h => h.sceneId === sceneId);
  }
  return INITIAL_PANORAMA_HOTSPOTS;
};

export const createPanoramaSceneApi = async (sceneData, token) => {
  const res = await appFetch('/api/panorama/scenes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(sceneData)
  });
  return await res.json();
};

export const updatePanoramaSceneApi = async (id, updates, token) => {
  const res = await appFetch(`/api/panorama/scenes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  return await res.json();
};

export const deletePanoramaSceneApi = async (id, token) => {
  const res = await appFetch(`/api/panorama/scenes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await res.json();
};

export const createPanoramaHotspotApi = async (hotspotData, token) => {
  const res = await appFetch('/api/panorama/hotspots', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(hotspotData)
  });
  return await res.json();
};

export const updatePanoramaHotspotApi = async (id, updates, token) => {
  const res = await appFetch(`/api/panorama/hotspots/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  return await res.json();
};

export const deletePanoramaHotspotApi = async (id, token) => {
  const res = await appFetch(`/api/panorama/hotspots/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await res.json();
};

// ==========================================
// PHASE 2 & 4: DYNAMIC CAMPUS BOUNDS & AUTO-EXPANSION
// ==========================================

export const fetchDynamicCampusBounds = async () => {
  try {
    const res = await appFetch('/api/campus/bounds');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /campus/bounds fallback:', e.message);
  }
  return {
    bounds: {
      southWest: [13.169044795226714, 77.53496327115832],
      northEast: [13.171866, 77.53670086988951]
    },
    center: [13.1717995, 77.5361915]
  };
};

// ==========================================
// PHASE 6, 7 & 8: INDOOR FLOORS, ROOMS & GRAPH NAVIGATION
// ==========================================

export const fetchIndoorFloors = async (buildingId = null) => {
  try {
    const url = buildingId ? `/api/indoor/floors?buildingId=${buildingId}` : '/api/indoor/floors';
    const res = await appFetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /indoor/floors fallback:', e.message);
  }
  return [];
};

export const fetchIndoorFloorById = async (floorId) => {
  try {
    const res = await appFetch(`/api/indoor/floors/${floorId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /indoor/floors/:id fallback:', e.message);
  }
  return null;
};

export const createIndoorFloorApi = async (floorData, token) => {
  const res = await appFetch('/api/indoor/floors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(floorData)
  });
  return await res.json();
};

export const updateIndoorFloorApi = async (floorId, updates, token) => {
  const res = await appFetch(`/api/indoor/floors/${floorId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  return await res.json();
};

export const deleteIndoorFloorApi = async (floorId, token) => {
  const res = await appFetch(`/api/indoor/floors/${floorId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await res.json();
};

export const createIndoorRoomApi = async (floorId, roomData, token) => {
  const res = await appFetch(`/api/indoor/floors/${floorId}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(roomData)
  });
  return await res.json();
};

export const updateIndoorRoomApi = async (floorId, roomId, updates, token) => {
  const res = await appFetch(`/api/indoor/floors/${floorId}/rooms/${roomId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  return await res.json();
};

export const deleteIndoorRoomApi = async (floorId, roomId, token) => {
  const res = await appFetch(`/api/indoor/floors/${floorId}/rooms/${roomId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await res.json();
};

export const fetchIndoorGraph = async (buildingId, floorNumber) => {
  try {
    const query = new URLSearchParams();
    if (buildingId) query.set('buildingId', buildingId);
    if (floorNumber !== undefined) query.set('floorNumber', floorNumber);
    const res = await appFetch(`/api/indoor/graph?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /indoor/graph fallback:', e.message);
  }
  return { nodes: [], paths: [] };
};

export const calculateIndoorRouteApi = async (routeParams) => {
  try {
    const res = await appFetch('/api/indoor/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routeParams)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    console.warn('API /indoor/route fallback:', e.message);
  }
  return null;
};

// ==========================================
// PHASE 4 & 15: TOMORROW'S GPS SURVEY MANAGEMENT & CHECKLIST
// ==========================================

export const fetchSurveyChecklist = async ({ status = 'all', category = 'all', search = '' } = {}) => {
  try {
    const query = new URLSearchParams();
    if (status && status !== 'all') query.set('status', status);
    if (category && category !== 'all') query.set('category', category);
    if (search) query.set('search', search);

    const res = await appFetch(`/api/survey/checklist?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (e) {
    console.warn('API /survey/checklist fallback:', e.message);
  }
  const { COMPLETE_CAMPUS_CATALOG } = await import('./campusCatalog.js');
  return {
    success: true,
    stats: {
      total: COMPLETE_CAMPUS_CATALOG.length,
      published: COMPLETE_CAMPUS_CATALOG.filter(c => c.verificationStatus === 'Published').length,
      verified: COMPLETE_CAMPUS_CATALOG.filter(c => c.verificationStatus === 'Verified').length,
      gpsCaptured: COMPLETE_CAMPUS_CATALOG.filter(c => c.verificationStatus === 'GPS Captured').length,
      pending: COMPLETE_CAMPUS_CATALOG.filter(c => !c.coordinates || c.verificationStatus === 'Awaiting Survey' || c.verificationStatus === 'Not Surveyed').length,
      percentComplete: Math.round((COMPLETE_CAMPUS_CATALOG.filter(c => c.coordinates).length / COMPLETE_CAMPUS_CATALOG.length) * 100)
    },
    data: COMPLETE_CAMPUS_CATALOG
  };
};

export const captureGpsSurveyApi = async (surveyData, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await appFetch('/api/survey/capture', {
    method: 'POST',
    headers,
    body: JSON.stringify(surveyData)
  });
  return await res.json();
};

export const verifySurveyRecordApi = async (id, verifiedBy, token) => {
  const res = await appFetch(`/api/survey/verify/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ verifiedBy })
  });
  return await res.json();
};

export const publishSurveyRecordApi = async (id, token) => {
  const res = await appFetch(`/api/survey/publish/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await res.json();
};

export const exportSurveyChecklistUrl = (format = 'csv') => {
  return `/api/survey/export?format=${format}`;
};

// ==========================================
// PHASE 6: Cafes, Menus, Reviews & Issue Reports APIs
// ==========================================

export const fetchCafes = async () => {
  try {
    const res = await appFetch('/api/cafes');
    if (!res.ok) throw new Error('Failed to fetch cafes');
    return await res.json();
  } catch (err) {
    console.warn('[API] fetchCafes fallback:', err.message);
    return [];
  }
};

export const fetchCafeById = async (id) => {
  try {
    const res = await appFetch(`/api/cafes/${id}`);
    if (!res.ok) throw new Error('Failed to fetch cafe');
    return await res.json();
  } catch (err) {
    console.warn('[API] fetchCafeById fallback:', err.message);
    return null;
  }
};

export const createCafeApi = async (data, token) => {
  const res = await appFetch('/api/cafes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const updateCafeApi = async (id, data, token) => {
  const res = await appFetch(`/api/cafes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const fetchCafeMenu = async (cafeId) => {
  try {
    const res = await appFetch(`/api/cafes/${cafeId}/menu`);
    if (!res.ok) throw new Error('Failed to fetch menu');
    return await res.json();
  } catch (err) {
    return [];
  }
};

export const createMenuItemApi = async (cafeId, data, token) => {
  const res = await appFetch(`/api/cafes/${cafeId}/menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const updateMenuItemApi = async (cafeId, itemId, data, token) => {
  const res = await appFetch(`/api/cafes/${cafeId}/menu/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const deleteMenuItemApi = async (cafeId, itemId, token) => {
  const res = await appFetch(`/api/cafes/${cafeId}/menu/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await res.json();
};

export const fetchDailyMenu = async (cafeId, date) => {
  try {
    const url = date ? `/api/cafes/${cafeId}/daily-menu?date=${date}` : `/api/cafes/${cafeId}/daily-menu`;
    const res = await appFetch(url);
    if (!res.ok) throw new Error('Failed to fetch daily menu');
    return await res.json();
  } catch (err) {
    return null;
  }
};

export const upsertDailyMenuApi = async (cafeId, data, token) => {
  const res = await appFetch(`/api/cafes/${cafeId}/daily-menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const submitReviewApi = async (data) => {
  const res = await appFetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const reportReviewApi = async (reviewId, reason = 'Inappropriate content') => {
  const res = await appFetch(`/api/reviews/${reviewId}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  return await res.json();
};

export const replyToReviewApi = async (reviewId, replyText, token) => {
  const res = await appFetch(`/api/reviews/${reviewId}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ replyText })
  });
  return await res.json();
};

export const submitIssueReportApi = async (data) => {
  const res = await appFetch('/api/issues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const fetchIssueReports = async (token) => {
  try {
    const res = await appFetch('/api/issues', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch issues');
    return await res.json();
  } catch (err) {
    return [];
  }
};

export const updateIssueStatusApi = async (issueId, data, token) => {
  const res = await appFetch(`/api/issues/${issueId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const adminLoginApi = async (email, password) => {
  const res = await appFetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Authentication failed');
  }
  return data;
};

// ==========================================
// OFFICIAL CAMPUS MASTER MAP MARKERS APIS (Task 4 & 5)
// ==========================================

export const fetchMapMarkersApi = async (category) => {
  try {
    const url = category && category !== 'all' ? `/api/map-markers?category=${category}` : '/api/map-markers';
    const res = await appFetch(url);
    if (!res.ok) throw new Error('Failed to fetch map markers');
    return await res.json();
  } catch (err) {
    console.warn('[API] fetchMapMarkersApi fallback error:', err.message);
    return { success: false, markers: [] };
  }
};

export const fetchMapMarkerByIdApi = async (id) => {
  try {
    const res = await appFetch(`/api/map-markers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch map marker');
    return await res.json();
  } catch (err) {
    return null;
  }
};

export const createMapMarkerApi = async (markerData, token) => {
  const res = await appFetch('/api/map-markers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(markerData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create map marker');
  }
  return data;
};

export const updateMapMarkerApi = async (id, markerData, token) => {
  const res = await appFetch(`/api/map-markers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(markerData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update map marker');
  }
  return data;
};

export const deleteMapMarkerApi = async (id, token) => {
  const res = await appFetch(`/api/map-markers/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete map marker');
  }
  return data;
};

// ========================================================
// INDOOR LOCATION SURVEY & GPS COORDINATE CAPTURE APIS
// ========================================================
export const fetchIndoorLocations = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.building) query.set('building', params.building);
    if (params.floor) query.set('floor', params.floor);
    if (params.floorNumber !== undefined) query.set('floorNumber', params.floorNumber);
    if (params.type && params.type !== 'all') query.set('type', params.type);
    if (params.department && params.department !== 'all') query.set('department', params.department);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.verified !== undefined) query.set('verified', params.verified);
    if (params.search) query.set('search', params.search);

    const queryString = query.toString();
    const url = queryString ? `/api/indoor-locations?${queryString}` : '/api/indoor-locations';
    const res = await appFetch(url);
    if (!res.ok) throw new Error('Failed to fetch indoor locations');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('[API] fetchIndoorLocations error:', err.message);
    return [];
  }
};

export const fetchIndoorLocationById = async (id) => {
  try {
    const res = await appFetch(`/api/indoor-locations/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    return null;
  }
};

export const createIndoorLocationApi = async (locationData, token) => {
  const res = await appFetch('/api/indoor-locations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(locationData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create indoor location');
  }
  return data;
};

export const captureIndoorGpsApi = async (captureData, token) => {
  const res = await appFetch('/api/indoor-locations/capture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(captureData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to capture indoor GPS coordinates');
  }
  return data;
};

export const updateIndoorLocationApi = async (id, updates, token) => {
  const res = await appFetch(`/api/indoor-locations/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update indoor location');
  }
  return data;
};

export const deleteIndoorLocationApi = async (id, token) => {
  const res = await appFetch(`/api/indoor-locations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete indoor location');
  }
  return data;
};

/**
 * Staff Room & Faculty Availability API Integrations
 */
export const fetchStaffRoomById = async (id = 'sr_e_block_01') => {
  try {
    const res = await appFetch(`/api/staff-rooms/${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.staffRoom) return data.staffRoom;
    }
  } catch (err) {
    console.warn('[API] Staff room fetch failed, using fallback layout:', err.message);
  }
  return null;
};

export const fetchFacultyListApi = async () => {
  try {
    const res = await appFetch('/api/faculty');
    if (res.ok) {
      const data = await res.json();
      return data.faculty || [];
    }
  } catch (err) {
    console.warn('[API] Faculty list fetch error:', err.message);
  }
  return [];
};

export const updateFacultyStatusApi = async (facultyId, payload) => {
  const res = await appFetch(`/api/faculty/${encodeURIComponent(facultyId)}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
};

/**
 * Health check endpoint integration
 */
export const fetchHealthStatus = async () => {
  try {
    const res = await appFetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[API] Health check unreachable:', err.message);
  }
  return { status: 'offline', database: { connected: false } };
};
