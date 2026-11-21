import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CampusMap from './maps/CampusMap';
import MasterCampusMap from './maps/MasterCampusMap';
import CampusDigitalTwin3D from './components/twin3d/CampusDigitalTwin3D';
import ImmersiveViewer from './components/immersive/ImmersiveViewer';
import SurveyChecklistModal from './components/survey/SurveyChecklistModal';
import IndoorNavigationModal from './components/indoor/IndoorNavigationModal';
import BuildingPopupModal from './components/building/BuildingPopupModal';
import CafeModal from './components/cafe/CafeModal';
import CafeOwnerDashboard from './components/cafe/CafeOwnerDashboard';
import IssueReportModal from './components/issues/IssueReportModal';
import AdminMapEditorModal from './components/admin/AdminMapEditorModal';
import AdminIndoorSurveyModal from './components/admin/AdminIndoorSurveyModal';
import NavigationPanel from './components/NavigationPanel';
import NavigationGuidanceBar from './components/NavigationGuidanceBar';
import RoutePlanningModal from './components/navigation/RoutePlanningModal';
import LocationDetailsModal from './components/LocationDetailsModal';
import PlaceDetailsCard from './components/common/PlaceDetailsCard';
import EmergencyModal from './components/EmergencyModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminDashboard from './components/admin/AdminDashboard';
import CampusAIAssistantModal from './components/assistant/CampusAIAssistantModal';
import CampusEventsModal from './components/events/CampusEventsModal';
import FlutterAppModal from './components/common/FlutterAppModal';
import Toast from './components/common/Toast';
import KmlMapDemo from './demo/KmlMapDemo';
import MainLawnDemo from './demo/MainLawnDemo';
import {
  fetchCampusData,
  fetchCampusFeatures,
  fetchCampusLocations,
  fetchCampusRoutes,
  fetchBuildings,
  fetchDepartments,
  fetchApprovals,
  fetchAuditLogs,
  fetchCampusCatalog,
  fetchWalkingPaths,
  fetchPanoramaScenes,
  fetchPanoramaHotspots,
  fetchMapMarkersApi,
  calculateRouteApi,
  connectSyncStream
} from './services/api';
import { clientRoutingEngine } from './services/routingEngine';
import { Menu, Navigation as NavigationIcon, Compass, Shield, Globe, Map, Crosshair, Box, DoorOpen, Sparkles, Layers } from 'lucide-react';

export default function App() {
  const [campus, setCampus] = useState(null);
  const [features, setFeatures] = useState([]);
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [walkingPaths, setWalkingPaths] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // View Mode: 'master' (Official Expanded High-Res Illustrated Map - Default), 'map' (Geographic Google Map Engine), '3d' (3D Digital Twin), 'immersive' (360° Aerial Tour), 'indoor' (Multi-Floor Floorplans), 'main-lawn-demo' (Dedicated Main Lawn KML Preview), or 'kml-demo' (All KML Verification Map)
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      if (search.includes('main-lawn') || hash.includes('main-lawn')) {
        return 'main-lawn-demo';
      }
      if (search.includes('kml') || search.includes('demo') || hash.includes('kml') || hash.includes('demo')) {
        return 'kml-demo';
      }
    }
    return 'master';
  });
  const [mapType, setMapType] = useState('google_roadmap');
  const [showSplash, setShowSplash] = useState(true);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [isMapEditorOpen, setIsMapEditorOpen] = useState(false);
  const [panoramaScenes, setPanoramaScenes] = useState([]);
  const [panoramaHotspots, setPanoramaHotspots] = useState([]);
  const [currentSceneId, setCurrentSceneId] = useState('scene_central_campus_aerial');

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [showDetailedSteps, setShowDetailedSteps] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('places');
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isIndoorSurveyOpen, setIsIndoorSurveyOpen] = useState(false);
  const [targetIndoorSurveyRoom, setTargetIndoorSurveyRoom] = useState(null);
  const [isIndoorModalOpen, setIsIndoorModalOpen] = useState(false);
  const [targetIndoorBuilding, setTargetIndoorBuilding] = useState(null);
  const [selectedBuildingForPopup, setSelectedBuildingForPopup] = useState(null);
  const [indoorModalMode, setIndoorModalMode] = useState('view'); // 'view' | 'navigate'
  const [isCafeModalOpen, setIsCafeModalOpen] = useState(false);
  const [selectedCafeId, setSelectedCafeId] = useState(null);
  const [isCafeOwnerOpen, setIsCafeOwnerOpen] = useState(false);
  const [isIssueReportOpen, setIsIssueReportOpen] = useState(false);
  const [isRoutePlanningOpen, setIsRoutePlanningOpen] = useState(false);
  const [routePlanningStart, setRoutePlanningStart] = useState('node_main_gate');
  const [routePlanningDest, setRoutePlanningDest] = useState('bld_d_block');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isFlutterModalOpen, setIsFlutterModalOpen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('dishasetu_lang') || 'en');
  const [isLoading, setIsLoading] = useState(true);

  // Compute whether any overlay dialog or modal is currently open
  const isAnyModalOpen = Boolean(
    isCafeModalOpen ||
    isSOSOpen ||
    isAdminLoginOpen ||
    isAdminDashboardOpen ||
    isSurveyModalOpen ||
    isIndoorSurveyOpen ||
    (isIndoorModalOpen && viewMode !== 'indoor') ||
    selectedBuildingForPopup ||
    isRoutePlanningOpen ||
    isCafeOwnerOpen ||
    isIssueReportOpen ||
    isMapEditorOpen ||
    isAIAssistantOpen ||
    isEventsModalOpen ||
    isFlutterModalOpen
  );

  // Open Wayfinding / Route Planning Modal
  const handleOpenRoutePlanning = useCallback((start = null, dest = null) => {
    const validStart = (typeof start === 'string' && start.length > 0)
      ? start
      : (start && typeof start === 'object' && !start._reactName && !start.nativeEvent
          ? (start.id || start.shortCode || start.buildingId || null)
          : null);
    const validDest = (typeof dest === 'string' && dest.length > 0)
      ? dest
      : (dest && typeof dest === 'object' && !dest._reactName && !dest.nativeEvent
          ? (dest.id || dest.shortCode || dest.buildingId || null)
          : null);

    if (validStart) setRoutePlanningStart(validStart);
    if (validDest) setRoutePlanningDest(validDest);
    setIsRoutePlanningOpen(true);
  }, []);

  // Handle Cafe Opening
  const handleOpenCafe = useCallback((cafe) => {
    const cId = cafe?._id || cafe?.shortCode || cafe?.code || (typeof cafe === 'string' ? cafe : 'PU-CAFE-D-BLOCK');
    setSelectedCafeId(cId);
    setIsCafeModalOpen(true);
  }, []);

  // Map Coordinate Picker State for GPS Survey
  const [isPickingCoordinates, setIsPickingCoordinates] = useState(false);
  const [targetBuildingForPick, setTargetBuildingForPick] = useState(null);
  const [pickedCoordinates, setPickedCoordinates] = useState(null);

  // Unified Toast Notifications
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(curr => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  // Load campus data
  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('dishasetu_admin_token');
      const [c, f, l, r, b, d, app, aud, cat, paths, scenes, spots, markersRes] = await Promise.all([
        fetchCampusData(),
        fetchCampusFeatures(),
        fetchCampusLocations(),
        fetchCampusRoutes(),
        fetchBuildings(),
        fetchDepartments(),
        token ? fetchApprovals(token) : Promise.resolve([]),
        token ? fetchAuditLogs(50, token) : Promise.resolve([]),
        fetchCampusCatalog(),
        fetchWalkingPaths(),
        fetchPanoramaScenes(),
        fetchPanoramaHotspots(),
        fetchMapMarkersApi()
      ]);
      setCampus(c);
      setFeatures(f);
      setLocations(l);
      setRoutes(r);
      setBuildings(b);
      setDepartments(d);
      setApprovals(app);
      setAuditLogs(aud);
      setCatalog(cat);
      setWalkingPaths(paths);
      setPanoramaScenes(scenes);
      setPanoramaHotspots(spots);
      if (markersRes?.markers) {
        setMapMarkers(markersRes.markers);
      }
      if (scenes && scenes.length > 0) {
        setCurrentSceneId(prev => prev || scenes[0].sceneId);
      }
    } catch (err) {
      console.error('Failed to load initial campus data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Check user geolocation
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    // Connect Real-Time SSE synchronization stream
    const unsubscribeSync = connectSyncStream((eventPayload) => {
      console.log('[Real-Time Sync Event]', eventPayload);
      loadData();
    });

    return () => {
      if (unsubscribeSync) unsubscribeSync();
    };
  }, [loadData]);

  // Filtered locations and buildings based on search & category
  const filteredLocations = useMemo(() => {
    let result = locations;
    if (activeCategory !== 'all') {
      result = result.filter(loc => loc.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        loc =>
          loc.name.toLowerCase().includes(q) ||
          (loc.description && loc.description.toLowerCase().includes(q)) ||
          (loc.shortCode && loc.shortCode.toLowerCase().includes(q))
      );
    }
    return result;
  }, [locations, activeCategory, searchQuery]);

  const filteredBuildings = useMemo(() => {
    if (!searchQuery.trim()) return buildings;
    const q = searchQuery.toLowerCase();
    return buildings.filter(
      b =>
        b.name.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        (b.shortCode && b.shortCode.toLowerCase().includes(q)) ||
        (b.departments && b.departments.some(d => d.toLowerCase().includes(q)))
    );
  }, [buildings, searchQuery]);

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter(
      d =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.faculty && d.faculty.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [departments, searchQuery]);

  // Calculate Dijkstra walking route on pedestrian graph
  const handleCalculateRoute = async ({
    start,
    destination,
    accessibleOnly = false,
    startCoords = null,
    destCoords = null,
    startName = null,
    destName = null
  }) => {
    try {
      const route = await calculateRouteApi({
        start: start || (userLocation ? userLocation : 'node_main_gate'),
        destination,
        accessibleOnly,
        startCoords: startCoords || (start === 'current_location' ? userLocation : null),
        destCoords,
        startName,
        destName
      });
      setActiveRoute(route);
    } catch (err) {
      console.warn('Backend route calc failed, using local routing engine:', err.message);
      try {
        const route = clientRoutingEngine.calculateRoute({
          start: start || 'node_main_gate',
          destination,
          accessibleOnly,
          startCoords: startCoords || (start === 'current_location' ? userLocation : null),
          destCoords,
          startName,
          destName
        });
        setActiveRoute(route);
      } catch (localErr) {
        showToast(`No verified walking route is currently available for this destination. ${localErr.message}`, 'error');
      }
    }
  };

  // Handle start walking navigation to any campus location / building or pre-calculated route
  const handleStartNavigation = (destination) => {
    if (!destination) return;
    if (destination.routeId || (destination.geometry && destination.distanceMeters)) {
      setActiveRoute(destination);
      return;
    }
    const destId = destination.locationId || destination.shortCode || destination.nodeId || destination.name;
    const destCoords = destination.coordinates || destination.entranceCoordinates;
    handleCalculateRoute({
      start: userLocation ? userLocation : 'node_main_gate',
      destination: destId,
      destCoords,
      destName: destination.name
    });
  };

  // Start map picking mode from Admin Dashboard
  const handleStartMapPick = (buildingId) => {
    setTargetBuildingForPick(buildingId);
    setIsPickingCoordinates(true);
    setPickedCoordinates(null);
  };

  // Coordinate clicked on map
  const handleCoordinatePicked = (coords) => {
    setPickedCoordinates(coords);
    setIsPickingCoordinates(false);
    setIsAdminDashboardOpen(true);
  };

  // Universal Building Popup & Indoor Navigation Handlers
  const handleOpenBuildingPopup = useCallback((bld) => {
    if (!bld) return;
    const match = buildings.find(b =>
      b.shortCode === bld.shortCode ||
      b.buildingId === bld.buildingId ||
      b.name === bld.name ||
      b._id === bld._id ||
      (bld.buildingShortCode && b.shortCode === bld.buildingShortCode) ||
      (bld.shortCode && b.shortCode?.toLowerCase() === bld.shortCode.toLowerCase())
    );
    setSelectedBuildingForPopup(match || bld);
  }, [buildings]);

  const handleOpenIndoorMap = useCallback((bld) => {
    const dBlock = buildings.find(b => b.shortCode === 'PU-D-BLOCK' || /d[-_]?block/i.test(b.name)) || { name: 'D Block', shortCode: 'PU-D-BLOCK', buildingId: 'bld_d_block' };
    const target = bld || targetIndoorBuilding || dBlock;
    setTargetIndoorBuilding(target);
    setIndoorModalMode('view');
    setIsIndoorModalOpen(true);
  }, [targetIndoorBuilding, buildings]);

  const handleStartIndoorNavigation = useCallback((bld) => {
    const dBlock = buildings.find(b => b.shortCode === 'PU-D-BLOCK' || /d[-_]?block/i.test(b.name)) || { name: 'D Block', shortCode: 'PU-D-BLOCK', buildingId: 'bld_d_block' };
    const target = bld || targetIndoorBuilding || dBlock;
    setTargetIndoorBuilding(target);
    setIndoorModalMode('navigate');
    setIsIndoorModalOpen(true);
  }, [targetIndoorBuilding, buildings]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#e5e3df] dark:bg-[#202124]">
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen
          isLoading={isLoading}
          onFinish={handleSplashFinish}
        />
      )}

      {/* =================================================================== */}
      {/* 1. 100% FULL-SCREEN MAP VIEWPORT (Underneath all Google Maps UI)    */}
      {/* =================================================================== */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {viewMode === 'main-lawn-demo' ? (
          <MainLawnDemo onExit={() => setViewMode('master')} />
        ) : viewMode === 'kml-demo' ? (
          <KmlMapDemo onExit={() => setViewMode('master')} />
        ) : viewMode === 'master' ? (
          <MasterCampusMap
            markers={mapMarkers}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            selectedMarker={selectedLocation}
            onSelectMarker={(m) => setSelectedLocation(m)}
            onStartNavigation={handleStartNavigation}
            onOpenRoutePlanning={handleOpenRoutePlanning}
            onClearRoute={() => setActiveRoute(null)}
            onOpenIndoor={handleOpenIndoorMap}
            onOpenBuildingPopup={handleOpenBuildingPopup}
            onOpenIndoorMap={handleOpenIndoorMap}
            onStartIndoorNavigation={handleStartIndoorNavigation}
            onOpenCafe={handleOpenCafe}
            activeRoute={activeRoute}
            userLocation={userLocation}
            language={language}
            isModalOpen={isAnyModalOpen}
          />
        ) : viewMode === '3d' ? (
          <CampusDigitalTwin3D
            buildings={buildings}
            locations={filteredLocations}
            features={features}
            walkingPaths={walkingPaths}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            onStartNavigation={handleStartNavigation}
            activeRoute={activeRoute}
            onClearRoute={() => setActiveRoute(null)}
            onOpenIndoor={handleOpenIndoorMap}
            onOpenBuildingPopup={handleOpenBuildingPopup}
            onOpenIndoorMap={handleOpenIndoorMap}
            onStartIndoorNavigation={handleStartIndoorNavigation}
            onSwitchToImmersive={() => setViewMode('immersive')}
            onSwitchToMap={() => setViewMode('master')}
            userLocation={userLocation}
          />
        ) : viewMode === 'immersive' ? (
          <ImmersiveViewer
            scenes={panoramaScenes}
            hotspots={panoramaHotspots}
            currentSceneId={currentSceneId}
            onSceneChange={setCurrentSceneId}
            onStartNavigation={handleStartNavigation}
            onOpenBuildingPopup={handleOpenBuildingPopup}
            onOpenIndoorMap={handleOpenIndoorMap}
            onStartIndoorNavigation={handleStartIndoorNavigation}
            onSwitchToMap={() => setViewMode('master')}
            activeRoute={activeRoute}
            onClearRoute={() => setActiveRoute(null)}
          />
        ) : viewMode === 'indoor' ? (
          <div className="w-full h-full bg-[#0d0f14]">
            <IndoorNavigationModal
              isOpen={true}
              isEmbedded={true}
              onClose={() => setViewMode('master')}
              initialBuilding={targetIndoorBuilding || buildings.find(b => b.shortCode === 'PU-D-BLOCK') || { name: 'D Block', shortCode: 'PU-D-BLOCK', buildingId: 'bld_d_block' }}
              initialMode={indoorModalMode}
              buildings={buildings}
              onStartOutdoorNavigation={handleStartNavigation}
              onOpenRoutePlanning={handleOpenRoutePlanning}
              onOpenIndoorSurvey={(room) => {
                setTargetIndoorSurveyRoom(room || null);
                setIsIndoorSurveyOpen(true);
              }}
            />
          </div>
        ) : (
          <CampusMap
            campus={campus}
            features={features}
            locations={filteredLocations}
            routes={routes}
            buildings={buildings}
            walkingPaths={walkingPaths}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            onStartNavigation={handleStartNavigation}
            activeRoute={activeRoute}
            onClearRoute={() => setActiveRoute(null)}
            isPickingCoordinates={isPickingCoordinates}
            onCoordinatePicked={handleCoordinatePicked}
            pickedCoordinates={pickedCoordinates}
            onOpenIndoor={handleOpenIndoorMap}
            onOpenBuildingPopup={handleOpenBuildingPopup}
            onOpenIndoorMap={handleOpenIndoorMap}
            onStartIndoorNavigation={handleStartIndoorNavigation}
            onOpenRoutePlanning={handleOpenRoutePlanning}
            userLocation={userLocation}
            onSwitch3D={() => setViewMode('3d')}
            onSwitchImmersive={() => setViewMode('immersive')}
            language={language}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            isModalOpen={isAnyModalOpen}
            mapType={mapType}
            setMapType={setMapType}
          />
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. AUTHENTIC GOOGLE MAPS FLOATING SEARCH BAR & CATEGORY PILLS       */}
      {/* =================================================================== */}
      {viewMode !== 'kml-demo' && viewMode !== 'main-lawn-demo' && (
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onCategorySelect={(cat) => {
            setActiveCategory(cat);
          }}
          onOpenSOS={() => setIsSOSOpen(true)}
          onOpenAdmin={() => setIsAdminDashboardOpen(true)}
          onOpenSurvey={() => setIsSurveyModalOpen(true)}
          onOpenIndoor={(bld) => {
            const dBlock = buildings.find(b => b.shortCode === 'PU-D-BLOCK' || /d[-_]?block/i.test(b.name)) || { name: 'D Block', shortCode: 'PU-D-BLOCK', buildingId: 'bld_d_block' };
            setTargetIndoorBuilding(bld || dBlock);
            setViewMode('indoor');
          }}
          onOpenCafes={() => setIsCafeModalOpen(true)}
          onOpenCafeOwner={() => setIsCafeOwnerOpen(true)}
          onOpenIssueReport={() => setIsIssueReportOpen(true)}
          onOpenMapEditor={() => setIsMapEditorOpen(true)}
          onOpenIndoorSurvey={(room) => {
            setTargetIndoorSurveyRoom(room || null);
            setIsIndoorSurveyOpen(true);
          }}
          onOpenRoutePlanning={handleOpenRoutePlanning}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
          onOpenEvents={() => setIsEventsModalOpen(true)}
          onOpenFlutterApp={() => setIsFlutterModalOpen(true)}
          onSelectLocation={(loc) => setSelectedLocation(loc)}
          locations={filteredLocations}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          mapType={mapType}
          onMapTypeChange={setMapType}
          language={language}
          onLanguageChange={(lang) => {
            setLanguage(lang);
            localStorage.setItem('dishasetu_lang', lang);
          }}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />
      )}

      {/* =================================================================== */}
      {/* 3. LIVE TURN-BY-TURN GUIDANCE BANNER & FOOTER (When Route Active)   */}
      {/* =================================================================== */}
      {activeRoute && (
        <NavigationGuidanceBar
          route={activeRoute}
          onClose={() => setActiveRoute(null)}
          userLocation={userLocation}
        />
      )}

      {/* =================================================================== */}
      {/* 4. GOOGLE MAPS PLACE DETAILS CARD (Left Docked on Desktop)          */}
      {/* =================================================================== */}
      {selectedLocation && (
        <PlaceDetailsCard
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onStartNavigation={handleStartNavigation}
          onOpenIndoorMap={handleOpenIndoorMap}
          onStartIndoorNavigation={handleStartIndoorNavigation}
          onOpenIndoorSurvey={(room) => {
            setTargetIndoorSurveyRoom(room || null);
            setIsIndoorSurveyOpen(true);
          }}
        />
      )}

      {/* Detailed Navigation Turn List Panel */}
      {activeRoute && showDetailedSteps && (
        <NavigationPanel
          route={activeRoute}
          onClose={() => setShowDetailedSteps(false)}
        />
      )}

      {/* =================================================================== */}
      {/* 5. SLIDE-OVER DIRECTORY SIDEBAR DRAWER                             */}
      {/* =================================================================== */}
      {isSidebarOpen && (
        <div className="absolute top-0 bottom-0 left-0 z-[450] w-80 sm:w-96 shadow-2xl animate-in slide-in-from-left duration-200">
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            locations={filteredLocations}
            buildings={filteredBuildings}
            departments={filteredDepartments}
            features={features}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => {
              setSelectedLocation(loc);
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }}
            onStartNavigation={handleStartNavigation}
            onCalculateRoute={handleCalculateRoute}
            onOpenIndoor={handleOpenIndoorMap}
            onOpenBuildingPopup={handleOpenBuildingPopup}
            onOpenIndoorMap={handleOpenIndoorMap}
            onStartIndoorNavigation={handleStartIndoorNavigation}
            userLocation={userLocation}
            catalog={catalog}
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. MODALS & OVERLAYS (All Datasets & APIs Unaltered)               */}
      {/* =================================================================== */}
      {/* Emergency SOS */}
      <EmergencyModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
      />

      {/* Admin Login */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
      />

      {/* Admin GIS Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        buildings={buildings}
        departments={departments}
        approvals={approvals}
        auditLogs={auditLogs}
        catalog={catalog}
        walkingPaths={walkingPaths}
        onRefreshData={loadData}
        onStartMapPick={handleStartMapPick}
        pickedCoordinates={pickedCoordinates}
        onOpenIndoorSurvey={() => setIsIndoorSurveyOpen(true)}
      />

      {/* Field Survey Checklist */}
      <SurveyChecklistModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        onStartMapPick={handleStartMapPick}
        pickedCoordinates={pickedCoordinates}
        onSelectDestination={handleStartNavigation}
      />

      {/* Building Popup Modal */}
      <BuildingPopupModal
        isOpen={Boolean(selectedBuildingForPopup)}
        building={selectedBuildingForPopup}
        onClose={() => setSelectedBuildingForPopup(null)}
        onOpenIndoorMap={handleOpenIndoorMap}
        onStartIndoorNavigation={handleStartIndoorNavigation}
        onStartOutdoorNavigation={(bld) => handleOpenRoutePlanning(null, bld?.buildingId || bld?.shortCode || bld?.name)}
      />

      {/* Google Maps Style Route Planning & Wayfinding Modal */}
      <RoutePlanningModal
        isOpen={isRoutePlanningOpen}
        onClose={() => setIsRoutePlanningOpen(false)}
        onStartNavigation={(route) => {
          setActiveRoute(route);
          if (viewMode !== 'master' && viewMode !== '3d' && viewMode !== 'map') {
            setViewMode('map');
          }
        }}
        initialStart={routePlanningStart}
        initialDestination={routePlanningDest}
        userLocation={userLocation}
      />

      {/* Multi-Floor Indoor Navigation Modal */}
      <IndoorNavigationModal
        isOpen={isIndoorModalOpen && viewMode !== 'indoor'}
        isEmbedded={false}
        onClose={() => setIsIndoorModalOpen(false)}
        initialBuilding={targetIndoorBuilding}
        initialMode={indoorModalMode}
        buildings={buildings}
        onStartOutdoorNavigation={handleStartNavigation}
        onOpenRoutePlanning={handleOpenRoutePlanning}
        onOpenIndoorSurvey={(room) => {
          setTargetIndoorSurveyRoom(room || null);
          setIsIndoorSurveyOpen(true);
        }}
      />

      {/* Admin Indoor Survey */}
      <AdminIndoorSurveyModal
        isOpen={isIndoorSurveyOpen}
        onClose={() => setIsIndoorSurveyOpen(false)}
        initialBuilding={targetIndoorSurveyRoom?.building || targetIndoorBuilding}
        initialFloorNumber={targetIndoorSurveyRoom?.floorNumber || 0}
        onStartNavigation={handleStartNavigation}
        onRefreshData={loadData}
      />

      {/* Cafeteria Dining Modal */}
      <CafeModal
        isOpen={isCafeModalOpen}
        onClose={() => setIsCafeModalOpen(false)}
        initialCafeId={selectedCafeId}
        onStartNavigation={handleStartNavigation}
        onNavigateToCafe={(cafe) => {
          setIsCafeModalOpen(false);
          if (cafe.locationId) {
            const loc = locations.find(l => l.locationId === cafe.locationId || l._id === cafe.locationId);
            if (loc) {
              handleStartNavigation(loc);
              return;
            }
          }
          if (cafe.coordinates && cafe.coordinates.length === 2) {
            handleStartNavigation({
              name: cafe.name,
              latitude: cafe.coordinates[0],
              longitude: cafe.coordinates[1],
              category: 'Cafe'
            });
          }
        }}
      />

      {/* Cafe Concessionaire Dashboard */}
      <CafeOwnerDashboard
        isOpen={isCafeOwnerOpen}
        onClose={() => setIsCafeOwnerOpen(false)}
      />

      {/* Obstacle & Issue Reporter */}
      <IssueReportModal
        isOpen={isIssueReportOpen}
        onClose={() => setIsIssueReportOpen(false)}
        buildings={buildings}
        userLocation={userLocation}
      />

      {/* Admin Map Editor */}
      <AdminMapEditorModal
        isOpen={isMapEditorOpen}
        onClose={() => setIsMapEditorOpen(false)}
        buildings={buildings}
        onRefreshMarkers={loadData}
      />

      {/* AI Campus Assistant Modal */}
      <CampusAIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onStartNavigation={(route) => {
          setActiveRoute(route);
          if (viewMode !== 'master' && viewMode !== 'map') setViewMode('map');
        }}
        onLocateOnMap={(placeId) => {
          const target = mapMarkers.find(m => m._id === placeId || m.featureId === placeId || m.code === placeId);
          if (target) setSelectedLocation(target);
        }}
        onOpenIndoorRoom={(roomNumber) => {
          const dBlock = buildings.find(b => b.shortCode === 'PU-D-BLOCK') || { name: 'D Block', shortCode: 'PU-D-BLOCK' };
          setTargetIndoorBuilding(dBlock);
          setViewMode('indoor');
        }}
        onOpenCafe={(cafe) => {
          handleOpenCafe(cafe);
        }}
      />

      {/* Campus Events Modal */}
      <CampusEventsModal
        isOpen={isEventsModalOpen}
        onClose={() => setIsEventsModalOpen(false)}
        onStartNavigation={(route) => {
          setActiveRoute(route);
          if (viewMode !== 'master' && viewMode !== 'map') setViewMode('map');
        }}
      />

      {/* DishaSetu Flutter Mobile App Showcase & Instructions Modal */}
      <FlutterAppModal
        isOpen={isFlutterModalOpen}
        onClose={() => setIsFlutterModalOpen(false)}
      />

      {/* =================================================================== */}
      {/* 7. GOOGLE MAPS MOBILE BOTTOM BAR (< 768px)                          */}
      {/* =================================================================== */}
      {viewMode !== 'kml-demo' && viewMode !== 'main-lawn-demo' && (
        <nav className="md:hidden absolute bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#202124]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 grid grid-cols-5 items-center px-1 z-30 shadow-2xl pb-[env(safe-area-inset-bottom)] select-none">
          {/* 1. Master Campus Map */}
          <button
            onClick={() => {
              setViewMode('master');
              setIsSidebarOpen(false);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all h-full active:scale-95 ${
              viewMode === 'master' && !isSidebarOpen
                ? 'text-[#1a73e8] font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Official Campus Master Map"
          >
            <div className={`p-1 rounded-full ${viewMode === 'master' && !isSidebarOpen ? 'bg-blue-50 dark:bg-blue-950/60' : ''}`}>
              <Map className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight leading-none">Campus Map</span>
          </button>

          {/* 2. Directions / Route Planner (Google Blue) */}
          <button
            onClick={() => handleOpenRoutePlanning()}
            className="flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl text-[#1a73e8] hover:text-[#1557b0] transition-all font-bold h-full active:scale-95"
            title="Campus Directions"
          >
            <div className="p-1 rounded-full bg-blue-50 dark:bg-blue-950/60">
              <NavigationIcon className="w-4 h-4 text-[#1a73e8]" />
            </div>
            <span className="text-[10px] tracking-tight leading-none">Directions</span>
          </button>

          {/* 3. Google Geographic Map Toggle */}
          <button
            onClick={() => {
              setViewMode('map');
              setIsSidebarOpen(false);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all h-full active:scale-95 ${
              viewMode === 'map' && !isSidebarOpen
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Google Geographic Map"
          >
            <div className={`p-1 rounded-full ${viewMode === 'map' && !isSidebarOpen ? 'bg-blue-50 dark:bg-blue-950/60' : ''}`}>
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight leading-none">
              Google Map
            </span>
          </button>

          {/* 4. Directory Drawer */}
          <button
            onClick={() => {
              setIsSidebarOpen(prev => !prev);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all h-full active:scale-95 ${
              isSidebarOpen
                ? 'text-indigo-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-full ${isSidebarOpen ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
              <Menu className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight leading-none">Directory</span>
          </button>

          {/* 5. Emergency SOS */}
          <button
            onClick={() => setIsSOSOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl text-rose-600 transition-all font-bold h-full active:scale-95"
            title="Emergency Help (SOS)"
          >
            <div className="p-1 rounded-full bg-rose-50 dark:bg-rose-950/60">
              <Shield className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-[10px] tracking-tight leading-none text-rose-600">SOS</span>
          </button>
        </nav>
      )}

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
