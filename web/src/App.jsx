import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CampusMap from './maps/CampusMap';
import ImmersiveViewer from './components/immersive/ImmersiveViewer';
import SurveyChecklistModal from './components/survey/SurveyChecklistModal';
import IndoorNavigationModal from './components/indoor/IndoorNavigationModal';
import NavigationPanel from './components/NavigationPanel';
import NavigationGuidanceBar from './components/NavigationGuidanceBar';
import LocationDetailsModal from './components/LocationDetailsModal';
import EmergencyModal from './components/EmergencyModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminDashboard from './components/admin/AdminDashboard';
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
  calculateRouteApi,
  connectSyncStream
} from './services/api';
import { clientRoutingEngine } from './services/routingEngine';
import { Menu, Navigation, Compass, Shield, Globe, Map } from 'lucide-react';

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

  // View Mode: 'immersive' (default 360° aerial virtual campus) or 'map' (2D Leaflet GPS map)
  const [viewMode, setViewMode] = useState('immersive');
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
  const [isLoading, setIsLoading] = useState(true);

  // Map Coordinate Picker State for GPS Survey
  const [isPickingCoordinates, setIsPickingCoordinates] = useState(false);
  const [targetBuildingForPick, setTargetBuildingForPick] = useState(null);
  const [pickedCoordinates, setPickedCoordinates] = useState(null);

  // Load campus data
  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('dishasetu_admin_token');
      const [c, f, l, r, b, d, app, aud, cat, paths, scenes, spots] = await Promise.all([
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
        fetchPanoramaHotspots()
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

  // Handle start walking navigation to any campus location / building
  const handleStartNavigation = (destination) => {
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

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b132b]">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        onOpenSurvey={() => setIsSurveyModalOpen(true)}
        onOpenIndoor={(bld) => {
          setTargetIndoorBuilding(bld || buildings[0]);
          setIsIndoorModalOpen(true);
        }}
        locations={filteredLocations}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Workspace Viewport: 360° Immersive Aerial vs 2D Ground Map */}
      {viewMode === 'immersive' ? (
        <div className="flex-1 relative w-full h-full overflow-hidden">
          <ImmersiveViewer
            scenes={panoramaScenes}
            hotspots={panoramaHotspots}
            currentSceneId={currentSceneId}
            onSceneChange={setCurrentSceneId}
            onStartNavigation={handleStartNavigation}
            onSwitchToMap={() => setViewMode('map')}
            activeRoute={activeRoute}
            onClearRoute={() => setActiveRoute(null)}
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
            onOpenIndoor={(bld) => {
              setTargetIndoorBuilding(bld);
              setIsIndoorModalOpen(true);
            }}
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
              onOpenIndoor={(bld) => {
                setTargetIndoorBuilding(bld);
                setIsIndoorModalOpen(true);
              }}
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

      {/* PHASE 6, 7, 8 & 10: Multi-Floor Indoor Navigation & Floor Plan Modal */}
      <IndoorNavigationModal
        isOpen={isIndoorModalOpen}
        onClose={() => setIsIndoorModalOpen(false)}
        initialBuilding={targetIndoorBuilding}
        buildings={buildings}
        onStartOutdoorNavigation={handleStartNavigation}
      />

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet screens < 768px) */}
      <nav className="md:hidden h-14 bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 z-30 shrink-0 shadow-2xl">
        <button
          onClick={() => {
            setViewMode('immersive');
            setIsSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
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
          <Navigation className="w-4 h-4" />
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
