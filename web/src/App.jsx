import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CampusMap from './maps/CampusMap';
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
  calculateRouteApi,
  connectSyncStream
} from './services/api';
import { clientRoutingEngine } from './services/routingEngine';
import { Menu, Navigation, Compass, Shield } from 'lucide-react';

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

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [showDetailedSteps, setShowDetailedSteps] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Map Coordinate Picker State for GPS Survey
  const [isPickingCoordinates, setIsPickingCoordinates] = useState(false);
  const [targetBuildingForPick, setTargetBuildingForPick] = useState(null);
  const [pickedCoordinates, setPickedCoordinates] = useState(null);

  // Load campus data
  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('dishasetu_admin_token');
      const [c, f, l, r, b, d, app, aud, cat, paths] = await Promise.all([
        fetchCampusData(),
        fetchCampusFeatures(),
        fetchCampusLocations(),
        fetchCampusRoutes(),
        fetchBuildings(),
        fetchDepartments(),
        token ? fetchApprovals(token) : Promise.resolve([]),
        token ? fetchAuditLogs(50, token) : Promise.resolve([]),
        fetchCampusCatalog(),
        fetchWalkingPaths()
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
        locations={filteredLocations}
      />

      {/* Main Workspace: Sidebar + Map */}
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
          userLocation={userLocation}
          catalog={catalog}
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
    </div>
  );
}
