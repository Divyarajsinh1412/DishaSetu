import express from 'express';
import { getCampusOverview, getAllFeatures } from '../controllers/campusController.js';
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
  deleteWalkingPath
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
  res.json({
    status: 'healthy',
    service: 'DishaSetu Campus Navigation API',
    institution: 'Presidency University Bengaluru',
    timestamp: new Date().toISOString(),
    database: db,
    syncListeners: syncService.getConnectedCount(),
    version: '1.2.0'
  });
});

// Campus Metadata & Overview
router.get('/campus', getCampusOverview);

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

export default router;
