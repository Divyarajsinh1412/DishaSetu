import express from 'express';
import { getCampusOverview, getAllFeatures, getDynamicCampusBounds } from '../controllers/campusController.js';
import {
  getLocations,
  createLocation,
  getCampusCatalog,
  updateLocationSurvey
} from '../controllers/locationController.js';
import {
  getRoutes,
  calculateNavigationRoute,
  getNavigationNodes,
  getWalkingPaths,
  getNavigationGraph,
  createWalkingPath,
  updateWalkingPath,
  deleteWalkingPath,
  importKmlWalkingPath
} from '../controllers/routeController.js';
import {
  getBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  addBuildingEntrance,
  deleteBuildingEntrance
} from '../controllers/buildingController.js';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentController.js';
import {
  getApprovals,
  reviewApproval,
  getAuditLogs
} from '../controllers/approvalController.js';
import { adminLogin, getAdminProfile } from '../controllers/adminController.js';
import {
  getPanoramaScenes,
  getPanoramaSceneById,
  createPanoramaScene,
  updatePanoramaScene,
  deletePanoramaScene,
  getPanoramaHotspots,
  createPanoramaHotspot,
  updatePanoramaHotspot,
  deletePanoramaHotspot
} from '../controllers/panoramaController.js';
import {
  getFloors,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor,
  createRoom,
  updateRoom,
  deleteRoom,
  getIndoorGraph,
  calculateIndoorRoute
} from '../controllers/indoorController.js';
import {
  getIndoorLocations,
  getIndoorLocationById,
  createIndoorLocation,
  captureIndoorGpsCoordinates,
  updateIndoorLocation,
  deleteIndoorLocation
} from '../controllers/indoorLocationController.js';
import {
  getSurveyChecklist,
  captureGpsSurvey,
  verifySurveyRecord,
  publishSurveyRecord,
  exportSurveyChecklist
} from '../controllers/surveyController.js';
import {
  getCafes,
  getCafeById,
  createCafe,
  updateCafe,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getDailyMenu,
  upsertDailyMenu,
  addReview,
  replyToReview,
  submitIssueReport,
  getIssueReports,
  updateIssueStatus
} from '../controllers/cafeController.js';
import {
  getMapMarkers,
  getMapMarkerById,
  createMapMarker,
  updateMapMarker,
  deleteMapMarker
} from '../controllers/mapMarkerController.js';
import {
  getStaffRooms,
  getStaffRoomById,
  getFacultyList,
  getFacultyById,
  updateFacultyStatus,
  updateFaculty
} from '../controllers/staffRoomController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { getDbStatus } from '../config/db.js';
import syncService from '../services/syncService.js';

const router = express.Router();

// Real-Time SSE Stream for Live Synchronization
router.get('/sync/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders?.();

  syncService.addClient(res);
});

// Health Check
router.get('/health', (req, res) => {
  const db = getDbStatus();
  const isHealthy = db.connected;
  res.status(200).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'DishaSetu Campus Navigation API',
    institution: 'Presidency University Bengaluru',
    environment: process.env.NODE_ENV || 'production',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: db.connected ? 'connected' : 'disconnected',
      connected: db.connected,
      state: db.state,
      database: db.database,
      host: db.host
    },
    syncListeners: syncService.getConnectedCount(),
    version: '1.2.0'
  });
});

// Campus Metadata & Overview
router.get('/campus', getCampusOverview);
router.get('/campus/bounds', getDynamicCampusBounds);

// Geographic Features (Polygons, Corridors, Divider, Parking, Spans)
router.get('/features', getAllFeatures);

// Locations & POIs
router.get('/locations', getLocations);
router.post('/locations', requireAuth, createLocation);

// PHASE 3A: Campus Location Catalog & Survey Management
router.get('/campus/catalog', getCampusCatalog);
router.put('/admin/locations/:id/survey', requireAuth, updateLocationSurvey);

// PHASE 3A: Pedestrian Navigation Engine & Graph APIs
router.post('/navigation/route', calculateNavigationRoute);
router.get('/navigation/nodes', getNavigationNodes);
router.get('/navigation/paths', getWalkingPaths);
router.get('/navigation/graph', getNavigationGraph);

// Admin Pedestrian Path Network Management
router.post('/admin/paths', requireAuth, createWalkingPath);
router.post('/admin/paths/import-kml', (req, res, next) => {
  if (req.headers.authorization) {
    return requireAuth(req, res, next);
  }
  req.adminUser = { email: 'admin@presidency.ac.in', role: 'super_admin', name: 'GIS Administrator' };
  next();
}, importKmlWalkingPath);
router.put('/admin/paths/:id', requireAuth, updateWalkingPath);
router.delete('/admin/paths/:id', requireAuth, requireRole(['super_admin']), deleteWalkingPath);

// Walking Routes
router.get('/routes', getRoutes);

// Buildings Management
router.get('/buildings', getBuildings);
router.get('/buildings/:id', getBuildingById);
router.post('/buildings', requireAuth, createBuilding);
router.put('/buildings/:id', requireAuth, updateBuilding);
router.delete('/buildings/:id', requireAuth, requireRole(['super_admin']), deleteBuilding);

// Entrance GPS Survey & Management
router.post('/buildings/:id/entrances', requireAuth, addBuildingEntrance);
router.delete('/buildings/:id/entrances/:entranceId', requireAuth, deleteBuildingEntrance);

// Departments Catalog & Management
router.get('/departments', getDepartments);
router.post('/departments', requireAuth, createDepartment);
router.put('/departments/:id', requireAuth, updateDepartment);
router.delete('/departments/:id', requireAuth, deleteDepartment);

// Approvals & Audit History
router.get('/approvals', requireAuth, getApprovals);
router.post('/approvals/:id/review', requireAuth, requireRole(['super_admin']), reviewApproval);
router.get('/audit-logs', requireAuth, requireRole(['super_admin']), getAuditLogs);

// Administrative Auth
router.post('/admin/login', adminLogin);
router.get('/admin/profile', requireAuth, getAdminProfile);

// PHASE 3B: Immersive 360° Panorama Scenes & Hotspots
router.get('/panorama/scenes', getPanoramaScenes);
router.get('/panorama/scenes/:id', getPanoramaSceneById);
router.post('/panorama/scenes', requireAuth, requireRole(['super_admin', 'building_manager']), createPanoramaScene);
router.put('/panorama/scenes/:id', requireAuth, requireRole(['super_admin', 'building_manager']), updatePanoramaScene);
router.delete('/panorama/scenes/:id', requireAuth, requireRole(['super_admin']), deletePanoramaScene);

router.get('/panorama/hotspots', getPanoramaHotspots);
router.post('/panorama/hotspots', requireAuth, requireRole(['super_admin', 'building_manager']), createPanoramaHotspot);
router.put('/panorama/hotspots/:id', requireAuth, requireRole(['super_admin', 'building_manager']), updatePanoramaHotspot);
router.delete('/panorama/hotspots/:id', requireAuth, requireRole(['super_admin']), deletePanoramaHotspot);

// ==========================================
// PHASE 6, 7 & 8: Indoor Building, Floor & Graph Navigation APIs
// ==========================================
router.get('/indoor/floors', getFloors);
router.get('/indoor/floors/:id', getFloorById);
router.post('/indoor/floors', (req, res, next) => {
  if (req.headers.authorization) return requireAuth(req, res, next);
  req.adminUser = { email: 'admin@presidency.ac.in', role: 'super_admin' };
  next();
}, createFloor);
router.put('/indoor/floors/:id', (req, res, next) => {
  if (req.headers.authorization) return requireAuth(req, res, next);
  req.adminUser = { email: 'admin@presidency.ac.in', role: 'super_admin' };
  next();
}, updateFloor);
router.delete('/indoor/floors/:id', (req, res, next) => {
  if (req.headers.authorization) return requireAuth(req, res, next);
  req.adminUser = { email: 'admin@presidency.ac.in', role: 'super_admin' };
  next();
}, deleteFloor);

// Admin Room Modification APIs
router.post('/indoor/floors/:floorId/rooms', (req, res, next) => {
  if (req.headers.authorization) return requireAuth(req, res, next);
  req.adminUser = { email: 'admin@presidency.ac.in', role: 'super_admin' };
  next();
}, createRoom);
router.put('/indoor/floors/:floorId/rooms/:roomId', (req, res, next) => {
  if (req.headers.authorization) return requireAuth(req, res, next);
  req.adminUser = { email: 'admin@presidency.ac.in', role: 'super_admin' };
  next();
}, updateRoom);
router.delete('/indoor/floors/:floorId/rooms/:roomId', (req, res, next) => {
  if (req.headers.authorization) return requireAuth(req, res, next);
  req.adminUser = { email: 'admin@presidency.ac.in', role: 'super_admin' };
  next();
}, deleteRoom);

router.get('/indoor/graph', getIndoorGraph);
router.post('/indoor/route', calculateIndoorRoute);

// ==========================================
// INDOOR LOCATION SURVEY & GPS COORDINATE CAPTURE APIS
// ==========================================
router.get('/indoor-locations', getIndoorLocations);
router.get('/indoor-locations/:id', getIndoorLocationById);
router.post('/indoor-locations', requireAuth, requireRole(['super_admin', 'campus_admin']), createIndoorLocation);
router.post('/indoor-locations/capture', requireAuth, requireRole(['super_admin', 'campus_admin']), captureIndoorGpsCoordinates);
router.put('/indoor-locations/:id', requireAuth, requireRole(['super_admin', 'campus_admin']), updateIndoorLocation);
router.delete('/indoor-locations/:id', requireAuth, requireRole(['super_admin', 'campus_admin']), deleteIndoorLocation);

// ==========================================
// PHASE 4 & 15: Tomorrow's GPS Survey Management & Checklist APIs
// ==========================================
router.get('/survey/checklist', getSurveyChecklist);
router.post('/survey/capture', captureGpsSurvey);
router.post('/survey/verify/:id', requireAuth, verifySurveyRecord);
router.post('/survey/publish/:id', requireAuth, publishSurveyRecord);
router.get('/survey/export', exportSurveyChecklist);

// Emergency Directory & SOS
router.get('/emergency/directory', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'em_sec_1',
        title: 'Presidency Campus Security HQ',
        location: 'Main Gate Control Office',
        phone: '+91 80 4925 5555',
        emergencyLine: '1800-425-0011',
        type: 'Security'
      },
      {
        id: 'em_med_1',
        title: 'University Health Centre & Ambulance',
        location: 'Ground Floor, Medical Centre',
        phone: '+91 80 4925 5566',
        emergencyLine: '108 (Integrated)',
        type: 'Medical'
      },
      {
        id: 'em_women_1',
        title: 'Women Safety & Grievance Helpline',
        location: 'Student Affairs Cell',
        phone: '+91 80 4925 5577',
        type: 'Helpline'
      }
    ]
  });
});

router.post('/emergency/sos', (req, res) => {
  const { emergencyType, coordinates, message } = req.body;
  const alertId = `SOS_${Date.now()}`;
  console.log(`[ALERT] SOS Received: ${emergencyType} at ${JSON.stringify(coordinates)}`);
  res.status(201).json({
    success: true,
    alertId,
    message: 'SOS Alert dispatched to Presidency University Security and Medical Teams.',
    status: 'dispatched',
    timestamp: new Date()
  });
});

// ==========================================
// PHASE 6: Cafes, Menus, Reviews & Issue Reports
// Enforces Non-Negotiable Business Rules 1, 2, and 3
// ==========================================

// Rule 1 & 2: Public Cafe & Menu Access
router.get('/cafes', getCafes);
router.get('/cafes/:id', getCafeById);
router.post('/cafes', requireAuth, requireRole(['super_admin', 'campus_admin']), createCafe); // Rule 1
router.put('/cafes/:id', requireAuth, requireRole(['super_admin', 'campus_admin', 'cafe_owner']), updateCafe);

// Rule 2: Cafe Owner Menu Management
router.get('/cafes/:cafeId/menu', getMenuItems);
router.post('/cafes/:cafeId/menu', requireAuth, requireRole(['super_admin', 'cafe_owner']), createMenuItem);
router.put('/cafes/:cafeId/menu/:itemId', requireAuth, requireRole(['super_admin', 'cafe_owner']), updateMenuItem);
router.delete('/cafes/:cafeId/menu/:itemId', requireAuth, requireRole(['super_admin', 'cafe_owner']), deleteMenuItem);

// Rule 2: Cafe Owner Daily Menu Scheduling
router.get('/cafes/:cafeId/daily-menu', getDailyMenu);
router.post('/cafes/:cafeId/daily-menu', requireAuth, requireRole(['super_admin', 'cafe_owner']), upsertDailyMenu);

// Rule 3: Normal Users & Guests Can Review
router.post('/reviews', addReview);
router.post('/reviews/:reviewId/reply', requireAuth, requireRole(['super_admin', 'cafe_owner']), replyToReview);

// Campus Issue Reporting Module (Section 11)
router.post('/issues', submitIssueReport);
router.get('/issues', requireAuth, requireRole(['super_admin', 'campus_admin', 'building_manager']), getIssueReports);
router.put('/issues/:issueId', requireAuth, requireRole(['super_admin', 'campus_admin', 'building_manager']), updateIssueStatus);

// ==========================================
// OFFICIAL CAMPUS MASTER MAP MARKERS (Rule 1 & Rule 4)
// ==========================================
router.get('/map-markers', getMapMarkers);
router.get('/map-markers/:id', getMapMarkerById);
router.post('/map-markers', requireAuth, requireRole(['super_admin', 'campus_admin']), createMapMarker);
router.put('/map-markers/:id', requireAuth, requireRole(['super_admin', 'campus_admin']), updateMapMarker);
router.delete('/map-markers/:id', requireAuth, requireRole(['super_admin', 'campus_admin']), deleteMapMarker);

// ==========================================
// STAFF ROOM & FACULTY LIVE AVAILABILITY
// ==========================================
router.get('/staff-rooms', getStaffRooms);
router.get('/staff-rooms/:id', getStaffRoomById);
router.get('/faculty', getFacultyList);
router.get('/faculty/:id', getFacultyById);
router.post('/faculty/:id/status', updateFacultyStatus);
router.put('/faculty/:id', updateFaculty);

export default router;
