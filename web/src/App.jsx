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
import NavigationPanel from './components/NavigationPanel';
import NavigationGuidanceBar from './components/NavigationGuidanceBar';
import RoutePlanningModal from './components/navigation/RoutePlanningModal';
import LocationDetailsModal from './components/LocationDetailsModal';
import EmergencyModal from './components/EmergencyModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminDashboard from './components/admin/AdminDashboard';
import CampusAIAssistantModal from './components/assistant/CampusAIAssistantModal';
import CampusEventsModal from './components/events/CampusEventsModal';
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
import { Menu, Navigation as NavigationIcon, Compass, Shield, Globe, Map, Crosshair, Box, DoorOpen } from 'lucide-react';

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

  // View Mode: 'master' (Official Presidency Master Campus Map), '3d' (3D Digital Twin), 'immersive' (360° Aerial Tour), or 'map' (2D GPS Map)
  const [viewMode, setViewMode] = useState('master');
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [sidebarTab, setSidebarTab] = useState('places');
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
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
  const [language, setLanguage] = useState(() => localStorage.getItem('dishasetu_lang') || 'en');
  const [isLoading, setIsLoading] = useState(true);

  // Open Wayfinding / Route Planning Modal
  const handleOpenRoutePlanning = useCallback((start = null, dest = null) => {
    // Defend against raw event objects
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

  // Handle Cafe Opening (Universal click from Master Map, 3D Twin, or Directory)
  const handleOpenCafe = useCallback((cafe) => {
    const cId = cafe?._id || cafe?.shortCode || cafe?.code || (typeof cafe === 'string' ? cafe : 'PU-CAFE-D-BLOCK');
    setSelectedCafeId(cId);
    setIsCafeModalOpen(true);
  }, []);

  // Map Coordinate Picker State for GPS Survey
  const [isPickingCoordinates, setIsPickingCoordinates] = useState(false);
  const [targetBuildingForPick, setTargetBuildingForPick] = useState(null);
  const [pickedCoordinates, setPickedCoordinates] = useState(null);

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
        alert(`Navigation Error: ${localErr.message}`);
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b132b]">
      {/* Premium Professional Splash Screen */}
      {showSplash && (
        <SplashScreen
          isLoading={isLoading}
          onFinish={handleSplashFinish}
        />
      )}

      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategorySelect={(cat) => {
          setActiveCategory(cat);
          if (cat === 'Cafe') {
            setIsCafeModalOpen(true);
          }
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
        onOpenRoutePlanning={handleOpenRoutePlanning}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        onOpenEvents={() => setIsEventsModalOpen(true)}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        locations={filteredLocations}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        language={language}
        onLanguageChange={(lang) => {
          setLanguage(lang);
          localStorage.setItem('dishasetu_lang', lang);
        }}
      />

      {/* Live Turn-by-Turn Walking Guidance Bar (Floats across all map views) */}
      {activeRoute && (
        <NavigationGuidanceBar
          route={activeRoute}
          onClose={() => setActiveRoute(null)}
          userLocation={userLocation}
        />
      )}

      {/* Main Workspace Viewport: Official Master Campus Map vs 3D Campus vs 360° Aerial vs 2D GPS Map */}
      {viewMode === 'master' ? (
        <div className="flex-1 relative w-full h-full overflow-hidden">
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
          />
        </div>
      ) : viewMode === '3d' ? (
        <div className="flex-1 relative w-full h-full overflow-hidden">
          <CampusDigitalTwin3D
            buildings={buildings}
            locations={filteredLocations}
            features={features}
            walkingPaths={walkingPaths}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            activeRoute={activeRoute}
            onClearRoute={() => setActiveRoute(null)}
            onStartNavigation={handleStartNavigation}
            onOpenIndoor={handleOpenIndoorMap}
            onOpenBuildingPopup={handleOpenBuildingPopup}
            onOpenIndoorMap={handleOpenIndoorMap}
            onStartIndoorNavigation={handleStartIndoorNavigation}
            onSwitchToImmersive={() => setViewMode('immersive')}
            onSwitchToMap={() => setViewMode('map')}
            userLocation={userLocation}
          />
        </div>
      ) : viewMode === 'immersive' ? (
        <div className="flex-1 relative w-full h-full overflow-hidden">
          <ImmersiveViewer
            scenes={panoramaScenes}
            hotspots={panoramaHotspots}
            currentSceneId={currentSceneId}
            onSceneChange={setCurrentSceneId}
            onStartNavigation={handleStartNavigation}
            onOpenBuildingPopup={handleOpenBuildingPopup}
            onOpenIndoorMap={handleOpenIndoorMap}
            onStartIndoorNavigation={handleStartIndoorNavigation}
            onSwitchToMap={() => setViewMode('map')}
            activeRoute={activeRoute}
            onClearRoute={() => setActiveRoute(null)}
          />
        </div>
      ) : viewMode === 'indoor' ? (
        <div className="flex-1 relative w-full h-full overflow-hidden bg-[#0d0f14]">
          <IndoorNavigationModal
            isOpen={true}
            isEmbedded={true}
            onClose={() => setViewMode('master')}
            initialBuilding={targetIndoorBuilding || buildings.find(b => b.shortCode === 'PU-D-BLOCK') || { name: 'D Block', shortCode: 'PU-D-BLOCK', buildingId: 'bld_d_block' }}
            initialMode={indoorModalMode}
            buildings={buildings}
            onStartOutdoorNavigation={handleStartNavigation}
            onOpenRoutePlanning={handleOpenRoutePlanning}
          />
        </div>
      ) : (
        <div className="flex-1 flex relative overflow-hidden">
          {/* Toggle Sidebar Floating Trigger (when collapsed) */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-4 left-4 z-[400] p-2.5 bg-[#1e293b]/95 backdrop-blur-md border border-slate-700/80 rounded-xl text-slate-200 shadow-xl hover:bg-[#334155] transition-all"
              title="Open Campus Directory"
            >
              <Menu className="w-5 h-5 text-sky-400" />
            </button>
          )}

          {/* Collapsible Campus Directory Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            locations={filteredLocations}
            buildings={filteredBuildings}
            departments={filteredDepartments}
            features={features}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
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

          {/* Interactive Leaflet Campus Map */}
          <main className="flex-1 relative h-full w-full">
            <CampusMap
              campus={campus}
              features={features}
              locations={filteredLocations}
              routes={routes}
              buildings={buildings}
              walkingPaths={walkingPaths}
              selectedLocation={selectedLocation}
              onSelectLocation={(loc) => setSelectedLocation(loc)}
              activeRoute={activeRoute}
              isPickingCoordinates={isPickingCoordinates}
              onCoordinatePicked={handleCoordinatePicked}
              pickedCoordinates={pickedCoordinates}
              onOpenIndoor={handleOpenIndoorMap}
              onOpenBuildingPopup={handleOpenBuildingPopup}
              onOpenIndoorMap={handleOpenIndoorMap}
              onStartIndoorNavigation={handleStartIndoorNavigation}
            />

            {/* Phase 3A: Live Outdoor Walking Guidance Bar */}
            {activeRoute && (
              <NavigationGuidanceBar
                route={activeRoute}
                onClose={() => setActiveRoute(null)}
                userLocation={userLocation}
              />
            )}

            {/* Turn-by-Turn Walking Navigation Panel (Sidebar summary) */}
            {activeRoute && (
              <NavigationPanel
                route={activeRoute}
                onClose={() => setActiveRoute(null)}
              />
            )}
          </main>
        </div>
      )}

      {/* Selected Location Details Modal */}
      {selectedLocation && (
        <LocationDetailsModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onStartNavigation={handleStartNavigation}
          onOpenIndoorMap={handleOpenIndoorMap}
          onStartIndoorNavigation={handleStartIndoorNavigation}
        />
      )}

      {/* Campus Emergency / SOS Modal */}
      <EmergencyModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
      />

      {/* Admin Login Modal (if prompted) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
      />

      {/* Super Admin & Building Manager Master Dashboard */}
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
      />

      {/* PHASE 4 & 15: Tomorrow's Guided GPS Field Survey Checklist Modal */}
      <SurveyChecklistModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        onStartMapPick={handleStartMapPick}
        pickedCoordinates={pickedCoordinates}
        onSelectDestination={handleStartNavigation}
      />

      {/* UNIVERSAL BUILDING POPUP: Requirement 10 (Open Indoor Map & Start Indoor Navigation) */}
      <BuildingPopupModal
        isOpen={Boolean(selectedBuildingForPopup)}
        building={selectedBuildingForPopup}
        onClose={() => setSelectedBuildingForPopup(null)}
        onOpenIndoorMap={handleOpenIndoorMap}
        onStartIndoorNavigation={handleStartIndoorNavigation}
        onStartOutdoorNavigation={(bld) => handleOpenRoutePlanning(null, bld?.buildingId || bld?.shortCode || bld?.name)}
      />

      {/* CAMPUS WAYFINDING & DIRECTIONS: Select place and navigate from one place to another place */}
      <RoutePlanningModal
        isOpen={isRoutePlanningOpen}
        onClose={() => setIsRoutePlanningOpen(false)}
        onStartNavigation={(route) => {
          setActiveRoute(route);
          if (viewMode !== 'master' && viewMode !== '3d') {
            setViewMode('master');
          }
        }}
        initialStart={routePlanningStart}
        initialDestination={routePlanningDest}
        userLocation={userLocation}
      />

      {/* PHASE 6, 7, 8 & 10: Multi-Floor Indoor Navigation & Floor Plan Modal */}
      <IndoorNavigationModal
        isOpen={isIndoorModalOpen && viewMode !== 'indoor'}
        isEmbedded={false}
        onClose={() => setIsIndoorModalOpen(false)}
        initialBuilding={targetIndoorBuilding}
        initialMode={indoorModalMode}
        buildings={buildings}
        onStartOutdoorNavigation={handleStartNavigation}
        onOpenRoutePlanning={handleOpenRoutePlanning}
      />

      {/* RULE 3 & PHASE 6: Student & Visitor Campus Dining & Live Menus Modal */}
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

      {/* RULE 2: Dedicated Dining Concessionaire Partner Dashboard */}
      <CafeOwnerDashboard
        isOpen={isCafeOwnerOpen}
        onClose={() => setIsCafeOwnerOpen(false)}
      />

      {/* RULE 3: Public Helpdesk & Campus Obstacle Issue Reporter */}
      <IssueReportModal
        isOpen={isIssueReportOpen}
        onClose={() => setIsIssueReportOpen(false)}
        buildings={buildings}
        userLocation={userLocation}
      />

      {/* TASK 5 & RULE 1: Admin Interactive Campus Master Map Marker Editor */}
      <AdminMapEditorModal
        isOpen={isMapEditorOpen}
        onClose={() => setIsMapEditorOpen(false)}
        buildings={buildings}
        onRefreshMarkers={loadData}
      />

      {/* PHASE 7: DishaSetu AI Campus Assistant Modal */}
      <CampusAIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onStartNavigation={(route) => {
          setActiveRoute(route);
          if (viewMode !== 'master' && viewMode !== 'map') setViewMode('master');
        }}
        onLocateOnMap={(placeId) => {
          setViewMode('master');
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

      {/* PHASE 6: Presidency University Campus Events & Workshops Modal */}
      <CampusEventsModal
        isOpen={isEventsModalOpen}
        onClose={() => setIsEventsModalOpen(false)}
        onStartNavigation={(route) => {
          setActiveRoute(route);
          if (viewMode !== 'master' && viewMode !== 'map') setViewMode('master');
        }}
      />

      {/* Floating AI Assistant Trigger Pill (Persistent across all map views) */}
      {!isAIAssistantOpen && (
        <button
          type="button"
          onClick={() => setIsAIAssistantOpen(true)}
          className="fixed bottom-5 right-20 sm:bottom-6 sm:right-24 z-40 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0d223d] via-[#102d52] to-[#1e3a8a] hover:from-[#133056] hover:to-[#2563eb] text-white text-xs font-bold border border-[#2d568c]/80 shadow-2xl shadow-blue-900/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group"
          title="Ask DishaSetu AI Assistant"
        >
          <div className="w-5 h-5 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="hidden sm:inline tracking-wide font-extrabold text-slate-100 group-hover:text-white">
            Ask AI Assistant
          </span>
        </button>
      )}

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet screens < 768px) */}
      <nav className="md:hidden h-14 bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 z-30 shrink-0 shadow-2xl">
        <button
          onClick={() => {
            setViewMode('master');
            setIsSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            viewMode === 'master' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px]">Official Map</span>
        </button>

        <button
          onClick={() => handleOpenRoutePlanning()}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl text-sky-400 hover:text-sky-300 transition-all font-bold"
          title="Directions: Select place and navigate from one place to another place"
        >
          <NavigationIcon className="w-4 h-4 text-sky-400" />
          <span className="text-[10px]">Directions</span>
        </button>

        <button
          onClick={() => {
            setViewMode('3d');
            setIsSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            viewMode === '3d' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px]">3D Campus</span>
        </button>

        <button
          onClick={() => {
            setViewMode('immersive');
            setIsSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            viewMode === 'immersive' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-amber-400" />
          <span className="text-[10px]">360° Aerial</span>
        </button>

        <button
          onClick={() => {
            setViewMode('map');
            setIsSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            viewMode === 'map' && !isSidebarOpen ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px]">2D Map</span>
        </button>

        <button
          onClick={() => {
            setViewMode('indoor');
            setIsSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            viewMode === 'indoor' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DoorOpen className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px]">Indoor</span>
        </button>

        <button
          onClick={() => {
            setViewMode('map');
            setSidebarTab('places');
            setIsSidebarOpen(true);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            isSidebarOpen && sidebarTab === 'places' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px]">Directory</span>
        </button>

        <button
          onClick={() => {
            setViewMode('map');
            setSidebarTab('directions');
            setIsSidebarOpen(true);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            isSidebarOpen && sidebarTab === 'directions' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <NavigationIcon className="w-4 h-4" />
          <span className="text-[10px]">Route</span>
        </button>

        <button
          onClick={() => setIsSurveyModalOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-amber-400 hover:text-amber-300 transition-all font-semibold"
          title="Open Campus GPS Field Survey"
        >
          <Crosshair className="w-4 h-4 text-amber-400" />
          <span className="text-[10px]">Survey</span>
        </button>

        <button
          onClick={() => setIsSOSOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-rose-400 hover:text-rose-300 transition-all font-semibold"
        >
          <Shield className="w-4 h-4" />
          <span className="text-[10px]">SOS</span>
        </button>
      </nav>
    </div>
  );
}
