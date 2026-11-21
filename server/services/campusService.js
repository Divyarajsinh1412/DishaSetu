import Campus from '../models/Campus.js';
import CampusFeature from '../models/CampusFeature.js';
import Location from '../models/Location.js';
import Route from '../models/Route.js';
import Building from '../models/Building.js';
import Department from '../models/Department.js';
import ApprovalRequest from '../models/ApprovalRequest.js';
import AuditLog from '../models/AuditLog.js';
import WalkingPath from '../models/WalkingPath.js';
import NavigationNode from '../models/NavigationNode.js';
import syncService from './syncService.js';
import {
  VERIFIED_CAMPUS_DATA,
  getValidatedParkingPolygon,
  getWalkingAvenueCorridorPolygon
} from '../data/verifiedCoordinates.js';
import { PRESIDENCY_BUILDINGS_CATALOG } from '../data/presidencyCampusDataset.js';
import { COMPLETE_CAMPUS_CATALOG } from '../data/campusCatalog.js';
import { NAVIGATION_NODES, WALKING_PATHS } from '../data/pedestrianGraphData.js';
import routingServiceInstance from './routingService.js';
import { getDbStatus } from '../config/db.js';
import { parseKml } from '../utils/kmlParser.js';

// Campus Coordinate Bounding Box for Presidency University validation
export const CAMPUS_VALIDATION_BOUNDS = {
  minLat: 13.160,
  maxLat: 13.180,
  minLng: 77.530,
  maxLng: 77.545
};

export const validateCoordinates = (lat, lng) => {
  if (lat == null || lng == null) {
    return { valid: false, error: 'Latitude and Longitude are both required.' };
  }
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (isNaN(nLat) || isNaN(nLng)) {
    return { valid: false, error: 'Coordinates must be valid numbers.' };
  }
  if (nLat < CAMPUS_VALIDATION_BOUNDS.minLat || nLat > CAMPUS_VALIDATION_BOUNDS.maxLat) {
    return {
      valid: false,
      error: `Latitude ${nLat} is outside Presidency University campus bounds (${CAMPUS_VALIDATION_BOUNDS.minLat} - ${CAMPUS_VALIDATION_BOUNDS.maxLat}).`
    };
  }
  if (nLng < CAMPUS_VALIDATION_BOUNDS.minLng || nLng > CAMPUS_VALIDATION_BOUNDS.maxLng) {
    return {
      valid: false,
      error: `Longitude ${nLng} is outside Presidency University campus bounds (${CAMPUS_VALIDATION_BOUNDS.minLng} - ${CAMPUS_VALIDATION_BOUNDS.maxLng}).`
    };
  }
  return { valid: true, lat: nLat, lng: nLng };
};

// Initial in-memory departments catalog
export const INITIAL_DEPARTMENTS = [
  {
    _id: 'dept_cse',
    code: 'CSE',
    name: 'Computer Science & Engineering',
    faculty: 'School of Engineering',
    buildingShortCode: 'PU-E-BLOCK',
    floorNumber: 2,
    headOfDepartment: 'Dr. C. Sharma',
    contactEmail: 'cse.hod@presidencyuniversity.in',
    contactPhone: '+91 80 4925 5101',
    description: 'Undergraduate and postgraduate programs in software engineering, systems, and algorithms.',
    status: 'active'
  },
  {
    _id: 'dept_ai_ml',
    code: 'AIML',
    name: 'Artificial Intelligence & Machine Learning',
    faculty: 'School of Engineering',
    buildingShortCode: 'PU-K-BLOCK',
    floorNumber: 3,
    headOfDepartment: 'Dr. S. Nair',
    contactEmail: 'aiml.hod@presidencyuniversity.in',
    contactPhone: '+91 80 4925 5102',
    description: 'Advanced computing, deep learning laboratories, and natural language processing research.',
    status: 'active'
  },
  {
    _id: 'dept_mech',
    code: 'MECH',
    name: 'Mechanical Engineering',
    faculty: 'School of Engineering',
    buildingShortCode: 'PU-D-BLOCK',
    floorNumber: 1,
    headOfDepartment: 'Dr. R. Gowda',
    contactEmail: 'mech.hod@presidencyuniversity.in',
    contactPhone: '+91 80 4925 5103',
    description: 'Robotics, thermal engineering, CAD/CAM design studios, and heavy machinery workshops.',
    status: 'active'
  },
  {
    _id: 'dept_civil',
    code: 'CIVIL',
    name: 'Civil Engineering',
    faculty: 'School of Engineering',
    buildingShortCode: 'PU-D-BLOCK',
    floorNumber: 1,
    headOfDepartment: 'Dr. K. Rao',
    contactEmail: 'civil.hod@presidencyuniversity.in',
    contactPhone: '+91 80 4925 5104',
    description: 'Structural engineering, geotechnical analysis, and environmental hydraulics labs.',
    status: 'active'
  },
  {
    _id: 'dept_som',
    code: 'SOM',
    name: 'School of Management (MBA & BBA)',
    faculty: 'School of Management',
    buildingShortCode: 'PU-J-BLOCK',
    floorNumber: 2,
    headOfDepartment: 'Dr. P. Murthy',
    contactEmail: 'som.dean@presidencyuniversity.in',
    contactPhone: '+91 80 4925 5201',
    description: 'Business analytics, marketing, corporate leadership, and finance research suites.',
    status: 'active'
  },
  {
    _id: 'dept_sol',
    code: 'SOL',
    name: 'School of Law',
    faculty: 'School of Law',
    buildingShortCode: 'PU-L-BLOCK',
    floorNumber: 1,
    headOfDepartment: 'Prof. V. Reddy',
    contactEmail: 'law.dean@presidencyuniversity.in',
    contactPhone: '+91 80 4925 5301',
    description: 'Moot court hall, legal aid clinic, jurisprudence archives, and intellectual property research.',
    status: 'active'
  },
  {
    _id: 'dept_admin',
    code: 'ADMIN',
    name: 'Admissions & Student Affairs',
    faculty: 'Administration',
    buildingShortCode: 'PU-H-BLOCK',
    floorNumber: 1,
    headOfDepartment: 'Registrar Office',
    contactEmail: 'admissions@presidencyuniversity.in',
    contactPhone: '+91 80 4925 5500',
    description: 'Student counseling, fee payments, document verification, and academic records.',
    status: 'active'
  }
];

// In-Memory Seeded Store
let memoryStore = {
  campus: {
    ...VERIFIED_CAMPUS_DATA.campus,
    mapSettings: {
      minZoom: 15,
      maxZoom: 22,
      bounds: VERIFIED_CAMPUS_DATA.campus.bounds
    }
  },
  features: [
    {
      featureId: 'feature_main_gate_span',
      name: 'Main Gate Entrance Span',
      category: 'gate_span',
      geometryType: 'LineString',
      coordinates: VERIFIED_CAMPUS_DATA.mainGate.spanEndpoints.map(p => [p.lat, p.lng]),
      style: { color: '#10b981', weight: 6, opacity: 1.0 },
      metadata: { description: 'Official entrance span connecting West and East gate pillars.' },
      verified: true,
      status: 'published'
    },
    {
      featureId: 'feature_walking_avenue_corridor',
      name: 'Main Walking Avenue Corridor',
      category: 'corridor',
      geometryType: 'Polygon',
      coordinates: getWalkingAvenueCorridorPolygon(),
      style: { color: '#3b82f6', fillColor: '#60a5fa', weight: 2, opacity: 0.9, fillOpacity: 0.35 },
      metadata: { description: 'Combined pedestrian avenue corridor extending from Main Gate into central campus.' },
      verified: true,
      status: 'published'
    },
    {
      featureId: 'feature_walking_avenue_right_side',
      name: 'Walking Avenue – Right Boundary',
      category: 'walkway',
      geometryType: 'LineString',
      coordinates: VERIFIED_CAMPUS_DATA.walkingAvenueRightSide.map(p => [p.lat, p.lng]),
      style: { color: '#2563eb', weight: 4, opacity: 0.9 },
      metadata: { description: 'Surveyed right-side paved avenue border (10 ordered points).' },
      verified: true,
      status: 'published'
    },
    {
      featureId: 'feature_walking_avenue_left_side',
      name: 'Walking Avenue – Left Boundary',
      category: 'walkway',
      geometryType: 'LineString',
      coordinates: VERIFIED_CAMPUS_DATA.walkingAvenueLeftSide.map(p => [p.lat, p.lng]),
      style: { color: '#2563eb', weight: 4, opacity: 0.9 },
      metadata: { description: 'Surveyed left-side paved avenue border (10 ordered points).' },
      verified: true,
      status: 'published'
    },
    {
      featureId: 'feature_central_tree_divider',
      name: 'Central Landscaped Tree Divider',
      category: 'divider',
      geometryType: 'LineString',
      coordinates: [
        [VERIFIED_CAMPUS_DATA.centralTreeDivider.start.lat, VERIFIED_CAMPUS_DATA.centralTreeDivider.start.lng],
        [VERIFIED_CAMPUS_DATA.centralTreeDivider.end.lat,   VERIFIED_CAMPUS_DATA.centralTreeDivider.end.lng]
      ],
      style: { color: '#059669', weight: 5, opacity: 0.95, dashArray: '8, 6' },
      metadata: { description: 'Central landscaped tree median separating pedestrian traffic lanes.' },
      verified: true,
      status: 'published'
    },
    {
      featureId: 'feature_campus_garden_area',
      name: 'Presidency Campus Central Garden',
      category: 'garden',
      geometryType: 'Polygon',
      coordinates: VERIFIED_CAMPUS_DATA.campusGardenArea.map(p => [p.lat, p.lng]),
      style: { color: '#15803d', fillColor: '#22c55e', weight: 2, opacity: 0.9, fillOpacity: 0.4 },
      metadata: { description: 'Campus garden polygon preserved with 19 ordered boundary points without simplification.' },
      verified: true,
      status: 'published'
    },
    {
      featureId: 'feature_garden_interior_boundary',
      name: 'Garden Interior Ending Boundary',
      category: 'garden',
      geometryType: 'LineString',
      coordinates: VERIFIED_CAMPUS_DATA.gardenInteriorBoundary.map(p => [p.lat, p.lng]),
      style: { color: '#166534', weight: 3, opacity: 0.85, dashArray: '4, 4' },
      metadata: { description: 'Interior boundary line inside the south-west garden zone (8 ordered points).' },
      verified: true,
      status: 'published'
    },
    {
      featureId: 'feature_parking_entry_span',
      name: 'Two-Wheeler Parking Entry Span',
      category: 'gate_span',
      geometryType: 'LineString',
      coordinates: VERIFIED_CAMPUS_DATA.parkingEntry.spanEndpoints.map(p => [p.lat, p.lng]),
      style: { color: '#ea580c', weight: 6, opacity: 1.0 },
      metadata: { description: 'Two-Wheeler parking entrance vehicular access span.' },
      verified: true,
      status: 'published'
    },
    {
      featureId: 'feature_two_wheeler_parking_area',
      name: 'Two-Wheeler Student & Staff Parking',
      category: 'parking',
      geometryType: 'Polygon',
      coordinates: getValidatedParkingPolygon(),
      style: { color: '#c2410c', fillColor: '#f97316', weight: 2, opacity: 0.9, fillOpacity: 0.35 },
      metadata: { description: 'Paved two-wheeler parking lot with validated non-self-intersecting perimeter geometry.' },
      verified: true,
      status: 'published'
    }
  ],
  locations: [
    {
      _id: 'loc_main_gate',
      name: VERIFIED_CAMPUS_DATA.mainGate.name,
      shortCode: 'PU-GATE-MAIN',
      category: 'Gate',
      description: VERIFIED_CAMPUS_DATA.mainGate.description,
      coordinates: VERIFIED_CAMPUS_DATA.mainGate.center,
      geometry: {
        type: 'Point',
        coordinates: [VERIFIED_CAMPUS_DATA.mainGate.center.lng, VERIFIED_CAMPUS_DATA.mainGate.center.lat]
      },
      verified: true,
      status: 'published'
    },
    {
      _id: 'loc_fountain',
      name: VERIFIED_CAMPUS_DATA.fountain.name,
      shortCode: 'PU-FOUNTAIN-01',
      category: 'Landmark',
      description: VERIFIED_CAMPUS_DATA.fountain.description,
      coordinates: VERIFIED_CAMPUS_DATA.fountain.coordinates,
      geometry: {
        type: 'Point',
        coordinates: [VERIFIED_CAMPUS_DATA.fountain.coordinates.lng, VERIFIED_CAMPUS_DATA.fountain.coordinates.lat]
      },
      verified: true,
      status: 'published'
    },
    {
      _id: 'loc_parking_entry',
      name: VERIFIED_CAMPUS_DATA.parkingEntry.name,
      shortCode: 'PU-PARK-2W',
      category: 'Parking',
      description: VERIFIED_CAMPUS_DATA.parkingEntry.description,
      coordinates: VERIFIED_CAMPUS_DATA.parkingEntry.center,
      geometry: {
        type: 'Point',
        coordinates: [VERIFIED_CAMPUS_DATA.parkingEntry.center.lng, VERIFIED_CAMPUS_DATA.parkingEntry.center.lat]
      },
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
      geometry: {
        type: 'Point',
        coordinates: [77.53578670581075, 13.17049286550813]
      },
      verified: true,
      status: 'published'
    }
  ],
  routes: [
    {
      _id: 'route_main_gate_to_fountain',
      name: 'Main Gate to Central Fountain Walkway',
      routeId: 'route_main_gate_to_fountain',
      startLocation: {
        name: 'Presidency University – Main Gate',
        lat: VERIFIED_CAMPUS_DATA.mainGate.center.lat,
        lng: VERIFIED_CAMPUS_DATA.mainGate.center.lng
      },
      endLocation: {
        name: 'Campus Central Fountain',
        lat: VERIFIED_CAMPUS_DATA.fountain.coordinates.lat,
        lng: VERIFIED_CAMPUS_DATA.fountain.coordinates.lng
      },
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
      accessible: true,
      verified: true,
      status: 'published'
    }
  ],
  buildings: PRESIDENCY_BUILDINGS_CATALOG.map((b, i) => ({
    _id: `bld_${i + 1}`,
    name: b.name,
    shortCode: b.code,
    category: b.category,
    description: b.description,
    totalFloors: b.totalFloors,
    departments: b.departments || [],
    entrances: [], // Entrances to be captured via GPS survey
    photos: [],
    isVerified: b.isVerified,
    status: b.status || 'pending_gps_survey'
  })),
  departments: [...INITIAL_DEPARTMENTS],
  catalog: [...COMPLETE_CAMPUS_CATALOG],
  walkingPaths: [...WALKING_PATHS],
  navigationNodes: [...NAVIGATION_NODES],
  approvals: [],
  auditLogs: []
};

export const CampusService = {
  // CAMPUS INFO
  async getCampusInfo() {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        const campus = await Campus.findOne();
        if (campus) return { ...campus.toObject(), dataSource: 'MongoDB Atlas' };
      } catch (err) {
        console.warn('[CampusService] Fallback to memory store:', err.message);
      }
    }
    return { ...memoryStore.campus, dataSource: 'Verified In-Memory Store' };
  },

  // FEATURES
  async getFeatures(category = null) {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        const query = category ? { category } : {};
        const features = await CampusFeature.find(query);
        if (features.length > 0) return features;
      } catch (err) {
        console.warn('[CampusService] Features DB fallback:', err.message);
      }
    }
    return category ? memoryStore.features.filter(f => f.category === category) : memoryStore.features;
  },

  // LOCATIONS
  async getLocations(category = null, search = '') {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        let query = {};
        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };
        const locations = await Location.find(query);
        if (locations.length > 0) return locations;
      } catch (err) {
        console.warn('[CampusService] Locations DB fallback:', err.message);
      }
    }
    let res = memoryStore.locations;
    if (category) res = res.filter(l => l.category.toLowerCase() === category.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(l => l.name.toLowerCase().includes(q) || (l.description && l.description.toLowerCase().includes(q)));
    }
    return res;
  },

  // ROUTES
  async getRoutes() {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        const routes = await Route.find({ status: 'published' });
        if (routes.length > 0) return routes;
      } catch (err) {
        console.warn('[CampusService] Routes DB fallback:', err.message);
      }
    }
    return memoryStore.routes;
  },

  // BUILDINGS
  async getBuildings(category = null, search = '') {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        let query = {};
        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };
        const buildings = await Building.find(query);
        if (buildings.length > 0) return buildings;
      } catch (err) {
        console.warn('[CampusService] Buildings DB fallback:', err.message);
      }
    }
    let res = memoryStore.buildings;
    if (category) res = res.filter(b => b.category.toLowerCase() === category.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.shortCode.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
      );
    }
    return res;
  },

  async getBuildingById(id) {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        const b = await Building.findById(id);
        if (b) return b;
      } catch {}
    }
    return memoryStore.buildings.find(b => b._id.toString() === id.toString() || b.shortCode === id);
  },

  async createBuilding(buildingData, user) {
    const newBuilding = {
      name: buildingData.name,
      shortCode: buildingData.shortCode.toUpperCase(),
      category: buildingData.category || 'Academic',
      description: buildingData.description || '',
      totalFloors: Number(buildingData.totalFloors) || 1,
      departments: buildingData.departments || [],
      entrances: buildingData.entrances || [],
      photos: buildingData.photos || [],
      isVerified: buildingData.isVerified || false,
      status: buildingData.status || (user?.role === 'super_admin' ? 'published' : 'pending_approval'),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      throw new Error('Database write operation unavailable: MongoDB Atlas is disconnected. Building cannot be saved.');
    }

    const created = await Building.create(newBuilding);
    this.logAudit('create', user?.email || 'admin@presidency.ac.in', user?.role || 'super_admin', 'building', created._id.toString(), { name: created.name });
    syncService.broadcast('building:created', created);
    return created;
  },

  async updateBuilding(id, updateData, user) {
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      throw new Error('Database write operation unavailable: MongoDB Atlas is disconnected. Building updates cannot be persisted.');
    }

    const updated = await Building.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!updated) {
      throw new Error(`Building ${id} not found.`);
    }
    this.logAudit('update', user.email, user.role, 'building', id, updateData);
    syncService.broadcast('building:updated', updated);
    return updated;
  },

  async deleteBuilding(id, user) {
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      throw new Error('Database write operation unavailable: MongoDB Atlas is disconnected. Building deletion cannot be persisted.');
    }

    await Building.findByIdAndDelete(id);
    this.logAudit('delete', user.email, user.role, 'building', id, {});
    syncService.broadcast('building:deleted', { id });
    return true;
  },

  // ENTRANCE GPS SURVEY MANAGEMENT
  async addBuildingEntrance(buildingId, entranceData, user) {
    const coordCheck = validateCoordinates(entranceData.coordinates?.lat, entranceData.coordinates?.lng);
    if (!coordCheck.valid) {
      throw new Error(coordCheck.error);
    }

    const newEntrance = {
      entranceId: `ent_${Date.now()}`,
      name: entranceData.name || 'Main Entrance',
      coordinates: { lat: coordCheck.lat, lng: coordCheck.lng },
      isAccessible: entranceData.isAccessible ?? true,
      isPrimary: entranceData.isPrimary ?? false,
      hasRamp: entranceData.hasRamp ?? false,
      hasElevatorNearby: entranceData.hasElevatorNearby ?? false,
      status: 'verified',
      notes: entranceData.notes || ''
    };

    const building = await this.getBuildingById(buildingId);
    if (!building) throw new Error('Building not found');

    const entrances = building.entrances || [];
    // If set as primary, unmark others
    if (newEntrance.isPrimary) {
      entrances.forEach(e => e.isPrimary = false);
    }
    entrances.push(newEntrance);

    const updatePayload = {
      entrances,
      entranceCoordinates: newEntrance.isPrimary ? newEntrance.coordinates : (building.entranceCoordinates || newEntrance.coordinates),
      isVerified: true,
      status: 'published'
    };

    const updatedBuilding = await this.updateBuilding(buildingId, updatePayload, user);

    // Also register entrance as a verified campus Location / POI for navigation
    const entranceLocation = {
      name: `${building.name} – ${newEntrance.name}`,
      shortCode: `${building.shortCode}-${newEntrance.name.substring(0, 4).toUpperCase()}`,
      category: 'Building',
      description: `Surveyed entrance door for ${building.name}. Accessible: ${newEntrance.isAccessible ? 'Yes' : 'No'}.`,
      coordinates: newEntrance.coordinates,
      geometry: { type: 'Point', coordinates: [newEntrance.coordinates.lng, newEntrance.coordinates.lat] },
      buildingId: building._id,
      verified: true,
      status: 'published'
    };
    await this.addLocation(entranceLocation);

    this.logAudit('add_entrance', user.email, user.role, 'building', buildingId, { entrance: newEntrance });
    syncService.broadcast('entrance:added', { buildingId, entrance: newEntrance });
    return updatedBuilding;
  },

  async deleteBuildingEntrance(buildingId, entranceId, user) {
    const building = await this.getBuildingById(buildingId);
    if (!building) throw new Error('Building not found');

    const entrances = (building.entrances || []).filter(e => e.entranceId !== entranceId);
    const updated = await this.updateBuilding(buildingId, { entrances }, user);
    this.logAudit('delete_entrance', user.email, user.role, 'building', buildingId, { entranceId });
    syncService.broadcast('entrance:deleted', { buildingId, entranceId });
    return updated;
  },

  // DEPARTMENTS
  async getDepartments(filter = {}) {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        const query = {};
        if (filter.faculty) query.faculty = filter.faculty;
        if (filter.buildingShortCode) query.buildingShortCode = filter.buildingShortCode;
        const depts = await Department.find(query);
        if (depts.length > 0) return depts;
      } catch (err) {
        console.warn('[CampusService] Departments DB fallback:', err.message);
      }
    }
    let res = memoryStore.departments;
    if (filter.faculty) res = res.filter(d => d.faculty === filter.faculty);
    if (filter.buildingShortCode) res = res.filter(d => d.buildingShortCode === filter.buildingShortCode);
    return res;
  },

  async createDepartment(departmentData, user) {
    const newDept = {
      name: departmentData.name,
      code: departmentData.code.toUpperCase(),
      faculty: departmentData.faculty || 'School of Engineering',
      buildingShortCode: departmentData.buildingShortCode || '',
      floorNumber: Number(departmentData.floorNumber) || 1,
      headOfDepartment: departmentData.headOfDepartment || '',
      contactEmail: departmentData.contactEmail || '',
      contactPhone: departmentData.contactPhone || '',
      description: departmentData.description || '',
      status: departmentData.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      throw new Error('Database write operation unavailable: MongoDB Atlas is disconnected. Department cannot be saved.');
    }

    const created = await Department.create(newDept);
    this.logAudit('create', user?.email || 'admin@presidency.ac.in', user?.role || 'super_admin', 'department', created._id.toString(), { name: created.name });
    syncService.broadcast('department:created', created);
    return created;
  },

  async updateDepartment(id, updateData, user) {
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      throw new Error('Database write operation unavailable: MongoDB Atlas is disconnected. Department updates cannot be persisted.');
    }

    const updated = await Department.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!updated) {
      throw new Error(`Department ${id} not found.`);
    }
    this.logAudit('update', user.email, user.role, 'department', id, updateData);
    syncService.broadcast('department:updated', updated);
    return updated;
  },

  async deleteDepartment(id, user) {
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      throw new Error('Database write operation unavailable: MongoDB Atlas is disconnected. Department deletion cannot be persisted.');
    }

    await Department.findByIdAndDelete(id);
    this.logAudit('delete', user.email, user.role, 'department', id, {});
    syncService.broadcast('department:deleted', { id });
    return true;
  },

  // APPROVALS
  async getPendingApprovals() {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        return await ApprovalRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
      } catch {}
    }
    return memoryStore.approvals.filter(a => a.status === 'pending');
  },

  async createApprovalRequest(requestData, user) {
    const newReq = {
      requestId: `req_${Date.now()}`,
      resourceType: requestData.resourceType,
      resourceId: requestData.resourceId,
      action: requestData.action,
      payload: requestData.payload,
      requestedBy: { name: user.name, email: user.email, role: user.role },
      status: 'pending',
      createdAt: new Date()
    };
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        return await ApprovalRequest.create(newReq);
      } catch {}
    }
    memoryStore.approvals.unshift(newReq);
    return newReq;
  },

  async reviewApproval(requestId, decision, reviewer, rejectionReason = '') {
    const dbStatus = getDbStatus();
    let reqDoc = null;
    if (dbStatus.connected) {
      try {
        reqDoc = await ApprovalRequest.findOne({ requestId });
        if (reqDoc) {
          reqDoc.status = decision;
          reqDoc.reviewedBy = { name: reviewer.name, email: reviewer.email };
          reqDoc.rejectionReason = rejectionReason;
          reqDoc.reviewedAt = new Date();
          await reqDoc.save();
        }
      } catch {}
    }
    const memReq = memoryStore.approvals.find(a => a.requestId === requestId);
    if (memReq) {
      memReq.status = decision;
      memReq.reviewedBy = { name: reviewer.name, email: reviewer.email };
      memReq.rejectionReason = rejectionReason;
      memReq.reviewedAt = new Date();
    }
    this.logAudit('review_approval', reviewer.email, reviewer.role, 'approval', requestId, { decision, rejectionReason });
    syncService.broadcast('approval:reviewed', { requestId, decision });
    return true;
  },

  // AUDIT LOGS
  logAudit(action, performedBy, userRole, resource, resourceId, details) {
    const entry = {
      _id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      performedBy,
      userRole,
      resource,
      resourceId,
      details,
      createdAt: new Date()
    };
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      AuditLog.create(entry).catch(() => {});
    }
    memoryStore.auditLogs.unshift(entry);
    if (memoryStore.auditLogs.length > 200) memoryStore.auditLogs.pop();
  },

  async getAuditLogs(limit = 50) {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        return await AuditLog.find().sort({ createdAt: -1 }).limit(limit);
      } catch {}
    }
    return memoryStore.auditLogs.slice(0, limit);
  },

  // ADD LOCATION
  async addLocation(locationData) {
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      throw new Error('Database write operation unavailable: MongoDB Atlas is disconnected. Location cannot be saved.');
    }
    const created = await Location.create(locationData);
    syncService.broadcast('location:created', created);
    return created;
  },

  // ========================================================
  // PHASE 3A: CAMPUS CATALOG & GPS SURVEY METHODS
  // ========================================================
  async getCampusCatalog(filter = {}) {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        let query = {};
        if (filter.category && filter.category !== 'all') {
          query.category = { $regex: new RegExp(`^${filter.category}$`, 'i') };
        }
        if (filter.status && filter.status !== 'all') {
          query.verificationStatus = { $regex: new RegExp(`^${filter.status}$`, 'i') };
        }
        if (filter.search) {
          const q = filter.search;
          query.$or = [
            { name: { $regex: q, $options: 'i' } },
            { shortCode: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ];
        }
        const dbItems = await Location.find(query);
        if (dbItems && dbItems.length > 0) return dbItems;
      } catch (err) {
        console.warn('[CampusService] Catalog DB fallback:', err.message);
      }
    }

    let list = [...memoryStore.catalog];
    if (filter.category && filter.category !== 'all') {
      list = list.filter(item => item.category?.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.status && filter.status !== 'all') {
      list = list.filter(item => item.verificationStatus?.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.shortCode?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async updateLocationSurvey(locationId, surveyData, adminUser = { email: 'admin@presidency.ac.in', role: 'super_admin' }) {
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      throw new Error('Database write operation unavailable: MongoDB Atlas is disconnected. GPS survey changes cannot be saved.');
    }

    const item = memoryStore.catalog.find(c => c.locationId === locationId || c._id === locationId);
    if (!item) {
      throw new Error(`Location ${locationId} not found in campus catalog.`);
    }

    // Validate coordinates if provided
    if (surveyData.coordinates) {
      const v = validateCoordinates(surveyData.coordinates.lat, surveyData.coordinates.lng);
      if (!v.valid) throw new Error(v.error);
      item.coordinates = { lat: v.lat, lng: v.lng };
    }

    if (surveyData.entranceCoordinates) {
      const v = validateCoordinates(surveyData.entranceCoordinates.lat, surveyData.entranceCoordinates.lng);
      if (!v.valid) throw new Error(v.error);
      item.entranceCoordinates = { lat: v.lat, lng: v.lng };
    }

    if (surveyData.entrances && Array.isArray(surveyData.entrances)) {
      item.entrances = surveyData.entrances.map((ent, idx) => {
        if (ent.coordinates) {
          const v = validateCoordinates(ent.coordinates.lat, ent.coordinates.lng);
          if (v.valid) ent.coordinates = { lat: v.lat, lng: v.lng };
        }
        return {
          entranceId: ent.entranceId || `ent_${locationId}_${idx + 1}`,
          name: ent.name || `Entrance ${idx + 1}`,
          coordinates: ent.coordinates,
          isAccessible: Boolean(ent.isAccessible),
          isPrimary: Boolean(ent.isPrimary),
          hasRamp: Boolean(ent.hasRamp),
          hasElevator: Boolean(ent.hasElevator)
        };
      });
    }

    if (surveyData.verificationStatus) {
      item.verificationStatus = surveyData.verificationStatus;
    }
    if (surveyData.coordinateSource) {
      item.coordinateSource = surveyData.coordinateSource;
    }
    if (surveyData.gpsAccuracy != null) {
      item.gpsAccuracy = Number(surveyData.gpsAccuracy);
    }

    item.surveyDate = new Date().toISOString().split('T')[0];
    item.surveyedBy = adminUser.name || adminUser.email;

    if (dbStatus.connected) {
      try {
        const updateDoc = {
          verificationStatus: item.verificationStatus,
          coordinates: item.coordinates,
          entranceCoordinates: item.entranceCoordinates,
          entrances: item.entrances,
          coordinateSource: item.coordinateSource,
          gpsAccuracy: item.gpsAccuracy,
          surveyDate: item.surveyDate,
          surveyedBy: item.surveyedBy,
          status: item.verificationStatus === 'Published' ? 'published' : 'pending'
        };
        if (item.coordinates && item.coordinates.lat && item.coordinates.lng) {
          updateDoc.geometry = {
            type: 'Point',
            coordinates: [item.coordinates.lng, item.coordinates.lat]
          };
          updateDoc.verified = true;
        }
        await Location.findOneAndUpdate(
          { $or: [{ locationId }, { shortCode: locationId }] },
          { $set: updateDoc },
          { new: true }
        );
      } catch (err) {
        console.warn('[CampusService] Location survey DB update warning:', err.message);
      }
    }

    this.logAudit(
      'gps_survey_update',
      adminUser.email,
      adminUser.role,
      'campus_catalog_location',
      locationId,
      {
        verificationStatus: item.verificationStatus,
        coordinates: item.coordinates,
        coordinateSource: item.coordinateSource,
        gpsAccuracy: item.gpsAccuracy
      }
    );

    syncService.broadcast('location:surveyed', item);
    return item;
  },

  // ========================================================
  // PHASE 3A: PEDESTRIAN GRAPH & ROUTING METHODS
  // ========================================================
  async getNavigationNodes() {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        const nodes = await NavigationNode.find({ isActive: true });
        if (nodes && nodes.length > 0) return nodes;
      } catch (err) {
        console.warn('[CampusService] Nodes DB fallback:', err.message);
      }
    }
    return routingServiceInstance.getNodes();
  },

  async getWalkingPaths() {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        const paths = await WalkingPath.find({ status: 'active' });
        if (paths && paths.length > 0) return paths;
      } catch (err) {
        console.warn('[CampusService] Paths DB fallback:', err.message);
      }
    }
    return routingServiceInstance.getPaths();
  },

  async addWalkingPath(pathData, adminUser = { email: 'admin@presidency.ac.in', role: 'super_admin' }) {
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      throw new Error('Database write operation unavailable: MongoDB Atlas is disconnected. Walking path cannot be saved.');
    }

    if (!pathData.startNode || !pathData.endNode) {
      throw new Error('Both startNode and endNode are required for a walking path.');
    }

    const newPath = {
      pathId: pathData.pathId || `path_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: pathData.name || `Walkway: ${pathData.startNode} to ${pathData.endNode}`,
      startNode: pathData.startNode,
      endNode: pathData.endNode,
      geometry: pathData.geometry || [],
      distanceMeters: Number(pathData.distanceMeters) || 10,
      accessibility: pathData.accessibility !== false,
      pathType: pathData.pathType || 'secondary_walkway',
      status: pathData.status || 'active',
      verificationStatus: 'Verified',
      createdAt: new Date()
    };

    await WalkingPath.create(newPath);
    memoryStore.walkingPaths.push(newPath);
    routingServiceInstance.updateGraph(null, memoryStore.walkingPaths);

    this.logAudit(
      'add_walking_path',
      adminUser.email,
      adminUser.role,
      'walking_path',
      newPath.pathId,
      { startNode: newPath.startNode, endNode: newPath.endNode, distance: newPath.distanceMeters }
    );

    syncService.broadcast('path:created', newPath);
    return newPath;
  },

  async updateWalkingPath(pathId, updates, adminUser = { email: 'admin@presidency.ac.in', role: 'super_admin' }) {
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      throw new Error('Database write operation unavailable: MongoDB Atlas is disconnected. Walking path updates cannot be saved.');
    }

    const path = memoryStore.walkingPaths.find(p => p.pathId === pathId);
    if (!path) {
      throw new Error(`Walking path ${pathId} not found.`);
    }

    if (updates.status) path.status = updates.status;
    if (updates.accessibility != null) path.accessibility = Boolean(updates.accessibility);
    if (updates.name) path.name = updates.name;
    if (updates.distanceMeters != null) path.distanceMeters = Number(updates.distanceMeters);

    await WalkingPath.findOneAndUpdate({ pathId }, { $set: updates }, { new: true });
    routingServiceInstance.updateGraph(null, memoryStore.walkingPaths);

    this.logAudit(
      'update_walking_path',
      adminUser.email,
      adminUser.role,
      'walking_path',
      pathId,
      updates
    );

    syncService.broadcast('path:updated', path);
    return path;
  },

  async deleteWalkingPath(pathId, adminUser = { email: 'admin@presidency.ac.in', role: 'super_admin' }) {
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      throw new Error('Database write operation unavailable: MongoDB Atlas is disconnected. Walking path deletion cannot be saved.');
    }

    const idx = memoryStore.walkingPaths.findIndex(p => p.pathId === pathId);
    if (idx === -1) {
      throw new Error(`Walking path ${pathId} not found.`);
    }

    const removed = memoryStore.walkingPaths.splice(idx, 1)[0];
    await WalkingPath.findOneAndDelete({ pathId });

    routingServiceInstance.updateGraph(null, memoryStore.walkingPaths);

    this.logAudit(
      'delete_walking_path',
      adminUser.email,
      adminUser.role,
      'walking_path',
      pathId,
      { name: removed.name }
    );

    syncService.broadcast('path:deleted', { pathId });
    return true;
  },

  syncKmlPathToMemory(pathDoc, routeDoc) {
    if (pathDoc) {
      const existingIdx = memoryStore.walkingPaths.findIndex(p => p.pathId === pathDoc.pathId);
      if (existingIdx >= 0) {
        memoryStore.walkingPaths[existingIdx] = pathDoc;
      } else {
        memoryStore.walkingPaths.unshift(pathDoc);
      }
      routingServiceInstance.updateGraph(null, memoryStore.walkingPaths);
    }
    if (routeDoc) {
      const existingRouteIdx = memoryStore.routes.findIndex(r => r.routeId === routeDoc.routeId);
      if (existingRouteIdx >= 0) {
        memoryStore.routes[existingRouteIdx] = routeDoc;
      } else {
        memoryStore.routes.unshift(routeDoc);
      }
    }
  },

  async importKmlPath(kmlPayload, adminUser = { email: 'admin@presidency.ac.in', role: 'super_admin' }) {
    const { kmlContent, fileName = 'Untitled map project.kml', pathName, startNode, endNode, routeType, notes } = kmlPayload;
    if (!kmlContent) {
      throw new Error('KML content is required for path import.');
    }

    const parsed = parseKml(kmlContent, fileName, {
      name: pathName,
      startNode,
      endNode,
      routeType,
      notes
    });

    const slug = (parsed.name || 'imported').toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 32);
    const pathId = `path_kml_${slug}`;

    const newPath = {
      pathId,
      name: parsed.name,
      geometry: parsed.coordinates,
      startNode: parsed.startNode,
      endNode: parsed.endNode,
      distanceMeters: parsed.distanceMeters,
      estimatedWalkingMinutes: parsed.estimatedWalkingMinutes,
      accessibility: parsed.accessibility !== false,
      hasStairs: false,
      hasRamp: true,
      pathType: 'main_avenue',
      routeType: parsed.routeType || 'Walking',
      verificationStatus: 'Verified',
      status: 'active',
    active: true,
      surfaceType: 'Paved Walkway & Tiles',
      sourceFileName: parsed.sourceFileName,
      source: 'Google Earth KML',
      sourceType: 'kml_import',
      campus: 'Presidency University Bengaluru',
      startLocation: parsed.startLocation,
      endLocation: parsed.endLocation,
      pointCount: parsed.pointCount,
      active: true,
      notes: parsed.notes || `Surveyed GPS route imported from ${parsed.sourceFileName}.`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      try {
        await WalkingPath.findOneAndUpdate({ pathId }, { $set: newPath }, { upsert: true, new: true });

        const routeDoc = {
          routeId: `route_${slug}`,
          name: parsed.name,
          startLocation: parsed.startLocation,
          endLocation: parsed.endLocation,
          geometry: parsed.coordinates,
          distanceMeters: parsed.distanceMeters,
          estimatedWalkingMinutes: parsed.estimatedWalkingMinutes,
          routeType: 'pedestrian',
          accessible: true,
          verified: true,
          sourceFileName: parsed.sourceFileName,
          source: 'Google Earth KML',
          campus: 'Presidency University Bengaluru',
          status: 'published',
          updatedAt: new Date()
        };
        await Route.findOneAndUpdate({ routeId: routeDoc.routeId }, { $set: routeDoc }, { upsert: true, new: true });
      } catch (err) {
        console.warn('[CampusService] KML import DB save warning:', err.message);
      }
    }

    this.syncKmlPathToMemory(newPath);

    this.logAudit(
      'import_kml_path',
      adminUser.email,
      adminUser.role,
      'walking_path',
      newPath.pathId,
      {
        name: newPath.name,
        pointCount: parsed.pointCount,
        distanceMeters: newPath.distanceMeters,
        sourceFileName: newPath.sourceFileName
      }
    );

    syncService.broadcast('path:created', newPath);
    return newPath;
  },

  calculateRoute(options) {
    return routingServiceInstance.calculateRoute(options);
  }
};
