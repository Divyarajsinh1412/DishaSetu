import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  Marker,
  Popup,
  Tooltip,
  Circle,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import {
  Compass,
  Maximize2,
  Navigation as NavigationIcon,
  Layers,
  MapPin,
  Trees,
  Car,
  Footprints,
  Info,
  CheckCircle2,
  Droplets,
  Building2,
  Crosshair,
  Accessibility,
  Plus,
  Minus,
  LocateFixed,
  Box,
  Eye,
  Coffee,
  HeartPulse,
  BookOpen,
  Trophy,
  Shield,
  RotateCcw,
  Sparkles,
  ArrowRight,
  DoorOpen
} from 'lucide-react';

// =====================================================================
// GOOGLE MAPS STYLE PIN GENERATOR (Crisp SVG Teardrop Pin Drops)
// =====================================================================
const createGoogleMapsPin = ({
  bgColor = '#2563eb',
  glyphSvg,
  borderColor = '#ffffff',
  size = 38,
  glow = false
}) => {
  const pinWidth = size;
  const pinHeight = Math.round(size * 1.25);
  const anchorX = pinWidth / 2;
  const anchorY = pinHeight;

  const html = `
    <div style="position:relative; width:${pinWidth}px; height:${pinHeight}px; transform:translate3d(0,0,0); filter:${glow ? 'drop-shadow(0 0 10px rgba(37,99,235,0.7))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))'}; transition:transform 0.15s ease;">
      <svg width="${pinWidth}" height="${pinHeight}" viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Pin Drop Teardrop Body -->
        <path d="M19 0C8.506 0 0 8.506 0 19C0 30.6 19 48 19 48C19 48 38 30.6 38 19C38 8.506 29.494 0 19 0Z" fill="${bgColor}" stroke="${borderColor}" stroke-width="2.5"/>
        <!-- Inner Glow Circle -->
        <circle cx="19" cy="19" r="13" fill="#ffffff" fill-opacity="0.22"/>
      </svg>
      <!-- Center Icon Glyph -->
      <div style="position:absolute; top:7px; left:${anchorX - 12}px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; color:#ffffff; pointer-events:none;">
        ${glyphSvg}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'leaflet-google-pin',
    iconSize: [pinWidth, pinHeight],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, -pinHeight + 8]
  });
};

// Category SVG Icons
const ICON_SVGS = {
  academic: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16M2 11h20M12 2l10 9H2l10-9zM6 11v8M10 11v8M14 11v8M18 11v8"/></svg>`,
  cafe: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>`,
  library: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/></svg>`,
  medical: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
  gate: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h6M9 13h6M9 17h6"/></svg>`,
  parking: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
  sports: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H7v2h10v-2h-2c-.55 0-1-.45-1-1v-2.34M6 4h12v7a6 6 0 0 1-12 0V4z"/></svg>`,
  garden: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c2 3 6 4 6 9a6 6 0 0 1-12 0c0-5 4-6 6-9z"/><path d="M12 12v9"/></svg>`,
  landmark: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  door: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20"/><path d="M14 12v.01"/></svg>`
};

// Preset category pin instances
const pinIcons = {
  academic: createGoogleMapsPin({ bgColor: '#2563eb', glyphSvg: ICON_SVGS.academic }),
  cafe: createGoogleMapsPin({ bgColor: '#d97706', glyphSvg: ICON_SVGS.cafe }),
  library: createGoogleMapsPin({ bgColor: '#0284c7', glyphSvg: ICON_SVGS.library }),
  medical: createGoogleMapsPin({ bgColor: '#e11d48', glyphSvg: ICON_SVGS.medical }),
  gate: createGoogleMapsPin({ bgColor: '#059669', glyphSvg: ICON_SVGS.gate, size: 42, glow: true }),
  parking: createGoogleMapsPin({ bgColor: '#ea580c', glyphSvg: ICON_SVGS.parking }),
  sports: createGoogleMapsPin({ bgColor: '#ca8a04', glyphSvg: ICON_SVGS.sports }),
  garden: createGoogleMapsPin({ bgColor: '#16a34a', glyphSvg: ICON_SVGS.garden }),
  landmark: createGoogleMapsPin({ bgColor: '#0d9488', glyphSvg: ICON_SVGS.landmark }),
  door: createGoogleMapsPin({ bgColor: '#7c3aed', glyphSvg: ICON_SVGS.door })
};

// High-Precision User GPS Pin with Pulsing Ripple Effect
const userGpsIcon = L.divIcon({
  html: `
    <div style="position:relative; width:48px; height:48px; display:flex; align-items:center; justify-content:center;">
      <div style="position:absolute; width:48px; height:48px; border-radius:50%; background:rgba(37,99,235,0.25); animation:pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div>
      <div style="position:absolute; width:22px; height:22px; border-radius:50%; background:#2563eb; border:3px solid #ffffff; box-shadow:0 3px 10px rgba(0,0,0,0.4);"></div>
      <div style="width:6px; height:6px; border-radius:50%; background:#ffffff;"></div>
    </div>
  `,
  className: 'user-gps-marker',
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});

// Route Start Pin (A - Emerald)
const routeStartIcon = L.divIcon({
  html: `
    <div style="position:relative; width:34px; height:44px; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
      <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
        <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 17 44 17 44C17 44 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="#10b981" stroke="#ffffff" stroke-width="2.5"/>
      </svg>
      <div style="position:absolute; top:5px; left:0; width:34px; text-align:center; font-weight:900; font-size:14px; color:#ffffff; font-family:sans-serif;">A</div>
    </div>
  `,
  className: 'route-start-pin',
  iconSize: [34, 44],
  iconAnchor: [17, 44]
});

// Route Destination Pin (B - Rose)
const routeEndIcon = L.divIcon({
  html: `
    <div style="position:relative; width:34px; height:44px; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
      <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
        <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 17 44 17 44C17 44 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="#ef4444" stroke="#ffffff" stroke-width="2.5"/>
      </svg>
      <div style="position:absolute; top:5px; left:0; width:34px; text-align:center; font-weight:900; font-size:14px; color:#ffffff; font-family:sans-serif;">B</div>
    </div>
  `,
  className: 'route-end-pin',
  iconSize: [34, 44],
  iconAnchor: [17, 44]
});

// Waypoint Step Pin
const createWaypointIcon = (stepNumber) => L.divIcon({
  html: `
    <div style="width:24px; height:24px; border-radius:50%; background:#1d4ed8; border:2px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:800; font-size:11px; font-family:sans-serif;">
      ${stepNumber}
    </div>
  `,
  className: 'route-waypoint-pin',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// =====================================================================
// MAP CONTROLLER (Smooth Leaflet Camera Control & Bounds Framing)
// =====================================================================
function MapController({
  centerCoords,
  zoomLevel,
  activeRoute,
  selectedLocation,
  fitCampusTrigger,
  bounds
}) {
  const map = useMap();

  // Initial Center & Zoom
  useEffect(() => {
    if (centerCoords && centerCoords.lat && centerCoords.lng) {
      map.setView([centerCoords.lat, centerCoords.lng], zoomLevel || 17.5, {
        animate: true,
        duration: 1.0
      });
    }
  }, [centerCoords, zoomLevel, map]);

  // Fit Campus Trigger
  useEffect(() => {
    if (fitCampusTrigger > 0 && bounds) {
      map.flyToBounds(
        [bounds.southWest, bounds.northEast],
        { padding: [60, 60], duration: 1.2 }
      );
    }
  }, [fitCampusTrigger, bounds, map]);

  // Auto-Frame Active Walking Route
  useEffect(() => {
    if (activeRoute && activeRoute.geometry && activeRoute.geometry.length > 1) {
      const lats = activeRoute.geometry.map(p => Array.isArray(p) ? p[0] : p.lat);
      const lngs = activeRoute.geometry.map(p => Array.isArray(p) ? p[1] : p.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      map.flyToBounds(
        [[minLat, minLng], [maxLat, maxLng]],
        { padding: [90, 90], duration: 1.2 }
      );
    }
  }, [activeRoute, map]);

  // Pan to Selected Location
  useEffect(() => {
    if (selectedLocation) {
      const lat = selectedLocation.latitude || selectedLocation.coordinates?.lat || selectedLocation.entranceCoordinates?.lat;
      const lng = selectedLocation.longitude || selectedLocation.coordinates?.lng || selectedLocation.entranceCoordinates?.lng;
      if (lat != null && lng != null) {
        map.flyTo([lat, lng], Math.max(map.getZoom(), 18), {
          duration: 1.0,
          easeLinearity: 0.25
        });
      }
    }
  }, [selectedLocation, map]);

  return null;
}

// Map Click Listener for Entrance Coordinate Picking
function MapClickHandler({ isPicking, onPickCoordinates }) {
  useMapEvents({
    click(e) {
      if (isPicking && onPickCoordinates) {
        onPickCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
}

// =====================================================================
// FIXED GOOGLE MAPS-STYLE ON-SCREEN CONTROLS (Never Zoom With Map)
// =====================================================================
function GoogleMapsFixedControls({
  mapType,
  setMapType,
  onZoomIn,
  onZoomOut,
  onLocateMe,
  onFitCampus,
  onSwitch3D,
  onSwitchImmersive,
  hasActiveRoute,
  onClearRoute
}) {
  return (
    <>
      {/* 1. TOP-RIGHT MAP STYLE SELECTOR (Explore / Satellite / Dark) */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-2">
        <div className="bg-white/95 dark:bg-[#0b1728]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.12)] p-1 flex items-center gap-1 select-none">
          <button
            type="button"
            onClick={() => setMapType('voyager')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mapType === 'voyager'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title="Clean Vector Map (Google Maps Style)"
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mapType === 'satellite'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title="High-Resolution Satellite Aerial View"
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapType('dark')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mapType === 'dark'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title="Dark Navigation Theme"
          >
            Dark
          </button>
        </div>

        {/* 3D Digital Twin Switcher Pill */}
        {onSwitch3D && (
          <button
            type="button"
            onClick={onSwitch3D}
            className="p-2.5 rounded-2xl bg-white/95 dark:bg-[#0b1728]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-[0_8px_25px_rgba(0,0,0,0.12)] transition-all hover:scale-105 active:scale-95"
            title="View 3D Campus Digital Twin"
          >
            <Box className="w-4 h-4 text-sky-500" />
          </button>
        )}

        {/* 360° Aerial Tour Switcher */}
        {onSwitchImmersive && (
          <button
            type="button"
            onClick={onSwitchImmersive}
            className="p-2.5 rounded-2xl bg-white/95 dark:bg-[#0b1728]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-amber-500 shadow-[0_8px_25px_rgba(0,0,0,0.12)] transition-all hover:scale-105 active:scale-95"
            title="360° Campus Aerial Tour"
          >
            <Eye className="w-4 h-4 text-amber-400" />
          </button>
        )}
      </div>

      {/* 2. BOTTOM-RIGHT GOOGLE MAPS CONTROLS COLUMN (Fixed on screen) */}
      <div className="absolute bottom-20 sm:bottom-6 right-3 sm:right-4 z-[400] flex flex-col items-center gap-2 select-none">
        {/* Clear Route Button (when route is active) */}
        {hasActiveRoute && (
          <button
            type="button"
            onClick={onClearRoute}
            className="px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xl flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 mb-1"
            title="Clear Active Walking Route"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>End Route</span>
          </button>
        )}

        {/* Fit Campus Button */}
        <button
          type="button"
          onClick={onFitCampus}
          className="w-11 h-11 bg-white/95 dark:bg-[#0b1728]/95 hover:bg-white dark:hover:bg-[#13233a] border border-slate-200/90 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-[0_8px_25px_rgba(0,0,0,0.14)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
          title="Fit Campus (Frame Presidency University Grounds)"
        >
          <Maximize2 className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
        </button>

        {/* Locate Me / Current GPS Position */}
        <button
          type="button"
          onClick={onLocateMe}
          className="w-11 h-11 bg-white/95 dark:bg-[#0b1728]/95 hover:bg-white dark:hover:bg-[#13233a] border border-slate-200/90 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-[0_8px_25px_rgba(0,0,0,0.14)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
          title="Show My Current GPS Location"
        >
          <LocateFixed className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
        </button>

        {/* Zoom In & Zoom Out Split Card (Native Google Maps Shape) */}
        <div className="bg-white/95 dark:bg-[#0b1728]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.14)] flex flex-col overflow-hidden">
          <button
            type="button"
            onClick={onZoomIn}
            className="w-11 h-11 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-colors border-b border-slate-200/80 dark:border-slate-800"
            title="Zoom In"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="w-11 h-11 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-5 h-5 font-bold" />
          </button>
        </div>
      </div>
    </>
  );
}

// Inner Leaflet Connector for Fixed Controls
function LeafletMapControlsWrapper({
  mapType,
  setMapType,
  onLocateMe,
  onFitCampus,
  onSwitch3D,
  onSwitchImmersive,
  hasActiveRoute,
  onClearRoute
}) {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <GoogleMapsFixedControls
      mapType={mapType}
      setMapType={setMapType}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      onLocateMe={onLocateMe}
      onFitCampus={onFitCampus}
      onSwitch3D={onSwitch3D}
      onSwitchImmersive={onSwitchImmersive}
      hasActiveRoute={hasActiveRoute}
      onClearRoute={onClearRoute}
    />
  );
}

// =====================================================================
// MAIN CAMPUS MAP EXPORT COMPONENT
// =====================================================================
export default function CampusMap({
  campus,
  features = [],
  locations = [],
  routes = [],
  buildings = [],
  walkingPaths = [],
  selectedLocation,
  onSelectLocation,
  activeRoute,
  onClearRoute,
  isPickingCoordinates,
  onCoordinatePicked,
  pickedCoordinates,
  onOpenIndoor,
  onOpenBuildingPopup,
  onOpenIndoorMap,
  onStartIndoorNavigation,
  onOpenRoutePlanning,
  userLocation: propUserLocation,
  onSwitch3D,
  onSwitchImmersive,
  language = 'en',
  activeCategory = 'all',
  searchQuery = ''
}) {
  // Map Base Tile Style: 'voyager' (Google Maps style clean light), 'satellite' (Esri World Imagery), 'dark' (CartoDB Dark)
  const [mapType, setMapType] = useState('voyager');
  const [fitCampusTrigger, setFitCampusTrigger] = useState(0);
  const [userLocation, setUserLocation] = useState(propUserLocation || null);
  const [locationError, setLocationError] = useState(null);

  // Sync external user location
  useEffect(() => {
    if (propUserLocation) {
      setUserLocation(propUserLocation);
    }
  }, [propUserLocation]);

  // Presidency University Official Coordinates (Itgalpur, Rajankunte, Bengaluru)
  const presidencyCenter = {
    lat: 13.171400,
    lng: 77.536100,
    zoom: 17.5
  };

  // Official Campus Perimeter Polygon
  const officialCampusBoundary = useMemo(() => [
    [13.172050, 77.535300], // North-West perimeter
    [13.172150, 77.536190], // North perimeter (Main Gate road)
    [13.172080, 77.536650], // North-East perimeter
    [13.171200, 77.536900], // East perimeter (Academic zone)
    [13.170100, 77.537100], // East perimeter (SOM & Law)
    [13.169120, 77.537050], // South-East (Gate 2 & Bus Bays)
    [13.168700, 77.536850], // South perimeter (Sports Grounds)
    [13.168600, 77.535800], // South-West perimeter
    [13.168900, 77.534800], // South-West perimeter (Hostel/Garden)
    [13.169800, 77.534700], // West perimeter (Fountain & Lawns)
    [13.170800, 77.534900], // West perimeter (Parking zone)
    [13.171800, 77.535100], // West perimeter near Two-Wheeler Gate
    [13.172050, 77.535300]  // Return to start
  ], []);

  // Dynamic Campus Bounds for 1-Click Fit Campus
  const dynamicCampusBounds = useMemo(() => {
    return {
      southWest: [13.16840, 77.53450],
      northEast: [13.17240, 77.53740]
    };
  }, []);

  // Request High-Precision GPS Location
  const handleLocateMe = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser or device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        };
        setUserLocation(coords);
        setLocationError(null);
      },
      (err) => {
        setLocationError('Could not retrieve GPS location. Please ensure location permissions are enabled.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  // Filter Locations for Category & Search
  const filteredLocationList = useMemo(() => {
    let list = locations;
    if (activeCategory && activeCategory !== 'all') {
      list = list.filter(l => l.category === activeCategory);
    }
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(l =>
        l.name?.toLowerCase().includes(q) ||
        l.shortCode?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [locations, activeCategory, searchQuery]);

  // Marker Icon Selector Helper
  const getMarkerIcon = useCallback((loc) => {
    const cat = loc.category?.toLowerCase() || '';
    if (cat.includes('academic') || cat.includes('building') || loc.shortCode?.includes('BLOCK')) return pinIcons.academic;
    if (cat.includes('cafe') || loc.shortCode?.includes('CAFE') || loc.name?.toLowerCase().includes('kappi')) return pinIcons.cafe;
    if (cat.includes('library')) return pinIcons.library;
    if (cat.includes('medical') || cat.includes('health')) return pinIcons.medical;
    if (cat.includes('gate') || loc.shortCode?.includes('GATE')) return pinIcons.gate;
    if (cat.includes('parking')) return pinIcons.parking;
    if (cat.includes('sport')) return pinIcons.sports;
    if (cat.includes('garden') || cat.includes('lawn')) return pinIcons.garden;
    if (cat.includes('door') || loc.roomNumber) return pinIcons.door;
    return pinIcons.landmark;
  }, []);

  return (
    <div className="relative w-full h-full min-h-full overflow-hidden select-none bg-slate-100 dark:bg-[#071322]">
      {/* ================================================================= */}
      {/* 1. COORDINATE SURVEY PICKER BANNER (When Active)                  */}
      {/* ================================================================= */}
      {isPickingCoordinates && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-blue-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400 font-semibold text-xs animate-bounce">
          <Crosshair className="w-4 h-4 text-white animate-spin" />
          <span>Click anywhere on the map to set Entrance coordinates!</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. FULL-SCREEN LEAFLET MAP ENGINE                                 */}
      {/* ================================================================= */}
      <MapContainer
        center={[presidencyCenter.lat, presidencyCenter.lng]}
        zoom={presidencyCenter.zoom}
        minZoom={14}
        maxZoom={21}
        maxBounds={[ [13.155, 77.520], [13.185, 77.555] ]}
        maxBoundsViscosity={0.7}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        className="w-full h-full absolute inset-0 z-0"
      >
        <MapController
          centerCoords={presidencyCenter}
          zoomLevel={presidencyCenter.zoom}
          activeRoute={activeRoute}
          selectedLocation={selectedLocation}
          fitCampusTrigger={fitCampusTrigger}
          bounds={dynamicCampusBounds}
        />

        <MapClickHandler
          isPicking={isPickingCoordinates}
          onPickCoordinates={onCoordinatePicked}
        />

        {/* ------------------------------------------------------------- */}
        {/* BASE GEOGRAPHIC TILE LAYERS (Clean Light / Satellite / Dark)   */}
        {/* ------------------------------------------------------------- */}
        {mapType === 'voyager' ? (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains={['a', 'b', 'c', 'd']}
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Presidency University'
            maxZoom={21}
          />
        ) : mapType === 'satellite' ? (
          <>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri, Earthstar Geographics | Presidency University"
              maxZoom={20}
            />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
              subdomains={['a', 'b', 'c', 'd']}
              maxZoom={20}
              opacity={0.8}
            />
          </>
        ) : (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains={['a', 'b', 'c', 'd']}
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap | Presidency University'
            maxZoom={20}
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* PRESIDENCY UNIVERSITY OFFICIAL BOUNDARY PERIMETER              */}
        {/* ------------------------------------------------------------- */}
        <Polygon
          positions={officialCampusBoundary}
          pathOptions={{
            color: '#059669',
            weight: 3,
            opacity: 0.95,
            fillColor: '#10b981',
            fillOpacity: 0.05,
            dashArray: '6, 6'
          }}
        >
          <Tooltip sticky>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">
              Presidency University Bengaluru
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-300">
              Official Campus Boundary · Itgalpur Campus
            </div>
          </Tooltip>
        </Polygon>

        {/* ------------------------------------------------------------- */}
        {/* ARCHITECTURAL CAMPUS FEATURES (Walkways, Quads, Gardens, etc)  */}
        {/* ------------------------------------------------------------- */}
        {features.map((feat) => {
          if (!feat.coordinates || !Array.isArray(feat.coordinates) || feat.coordinates.length < 2) return null;

          const isPolygon = feat.geometryType === 'Polygon' || (Array.isArray(feat.coordinates[0]) && Array.isArray(feat.coordinates[0][0]));
          const coords = feat.coordinates;

          if (isPolygon) {
            return (
              <Polygon
                key={feat.featureId || feat._id}
                positions={coords}
                pathOptions={{
                  color: feat.category === 'Garden' ? '#16a34a' : feat.category === 'Parking' ? '#ea580c' : '#3b82f6',
                  fillColor: feat.category === 'Garden' ? '#22c55e' : feat.category === 'Parking' ? '#f97316' : '#60a5fa',
                  weight: 2,
                  fillOpacity: feat.category === 'Garden' ? 0.35 : feat.category === 'Parking' ? 0.3 : 0.25
                }}
              >
                <Tooltip sticky>
                  <div className="font-bold text-xs">{feat.featureName || feat.name}</div>
                  <div className="text-[10px] text-slate-500">{feat.description}</div>
                </Tooltip>
              </Polygon>
            );
          }

          return (
            <Polyline
              key={feat.featureId || feat._id}
              positions={coords}
              pathOptions={{
                color: feat.category === 'Gate' ? '#059669' : feat.category === 'Tree' ? '#047857' : '#2563eb',
                weight: feat.category === 'Gate' ? 6 : 4,
                opacity: 0.85
              }}
            />
          );
        })}

        {/* ------------------------------------------------------------- */}
        {/* VERIFIED WALKING PATHS & PEDESTRIAN NETWORK                   */}
        {/* ------------------------------------------------------------- */}
        {walkingPaths.map((p) => {
          if (!p.geometry || p.geometry.length < 2) return null;
          return (
            <Polyline
              key={p.pathId}
              positions={p.geometry}
              pathOptions={{
                color: p.status === 'active' ? '#64748b' : '#ef4444',
                weight: 2.5,
                opacity: 0.45,
                dashArray: '4, 6'
              }}
            />
          );
        })}

        {/* ------------------------------------------------------------- */}
        {/* LIVE ACTIVE WALKING ROUTE (Cyan/Blue Pedestrian Guidance Path) */}
        {/* ------------------------------------------------------------- */}
        {activeRoute && activeRoute.geometry && activeRoute.geometry.length > 0 && (
          <>
            {/* Outer Cyan Glow Halo */}
            <Polyline
              positions={activeRoute.geometry}
              pathOptions={{
                color: '#0284c7',
                weight: 12,
                opacity: 0.4,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />

            {/* Inner Vibrant Walking Path */}
            <Polyline
              positions={activeRoute.geometry}
              pathOptions={{
                color: '#2563eb',
                weight: 5,
                opacity: 1.0,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />

            {/* Route Origin Marker (A) */}
            <Marker
              position={activeRoute.geometry[0]}
              icon={routeStartIcon}
            >
              <Tooltip permanent sticky>
                <div className="font-bold text-xs text-emerald-600">Start (A)</div>
                <div className="text-[10px]">{activeRoute.startLocation?.name || 'Starting Point'}</div>
              </Tooltip>
            </Marker>

            {/* Route Destination Marker (B) */}
            <Marker
              position={activeRoute.geometry[activeRoute.geometry.length - 1]}
              icon={routeEndIcon}
            >
              <Tooltip permanent sticky>
                <div className="font-bold text-xs text-rose-600">Destination (B)</div>
                <div className="text-[10px]">{activeRoute.endLocation?.name || 'Destination'}</div>
              </Tooltip>
            </Marker>

            {/* Waypoint Step Pins */}
            {activeRoute.waypoints && activeRoute.waypoints.map((step, idx) => {
              if (idx === 0 || idx === activeRoute.waypoints.length - 1) return null;
              const stepGeom = activeRoute.geometry[Math.min(idx, activeRoute.geometry.length - 1)];
              if (!stepGeom) return null;
              return (
                <Marker
                  key={`step_${idx}`}
                  position={stepGeom}
                  icon={createWaypointIcon(step.stepIndex)}
                >
                  <Tooltip sticky>
                    <div className="font-bold text-xs text-blue-600">Turn #{step.stepIndex}</div>
                    <div className="text-[11px] text-slate-700">{step.instruction}</div>
                  </Tooltip>
                </Marker>
              );
            })}
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CAMPUS LOCATION PINS (Google Maps Style Pin Drops)            */}
        {/* ------------------------------------------------------------- */}
        {filteredLocationList.map((loc) => {
          const lat = loc.coordinates?.lat || loc.latitude;
          const lng = loc.coordinates?.lng || loc.longitude;
          if (lat == null || lng == null) return null;

          const isSelected = selectedLocation && (
            selectedLocation._id === loc._id ||
            selectedLocation.locationId === loc.locationId ||
            selectedLocation.shortCode === loc.shortCode
          );

          return (
            <Marker
              key={loc._id || loc.locationId || loc.shortCode}
              position={[lat, lng]}
              icon={getMarkerIcon(loc)}
              eventHandlers={{
                click: () => {
                  if (onSelectLocation) onSelectLocation(loc);
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -38]} opacity={0.95}>
                <div className="font-bold text-xs text-slate-900">{loc.name}</div>
                <div className="text-[10px] text-slate-500 font-semibold">{loc.category} · {loc.shortCode || 'PU'}</div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* ------------------------------------------------------------- */}
        {/* TEMPORARY SURVEY PICK PIN (When Admin Picking Coordinates)    */}
        {/* ------------------------------------------------------------- */}
        {pickedCoordinates && (
          <Marker
            position={[pickedCoordinates.lat, pickedCoordinates.lng]}
            icon={pinIcons.landmark}
          >
            <Tooltip permanent>
              <div className="font-bold text-rose-600">Selected Coordinates</div>
              <div className="text-[10px] font-mono">
                {pickedCoordinates.lat.toFixed(6)}, {pickedCoordinates.lng.toFixed(6)}
              </div>
            </Tooltip>
          </Marker>
        )}

        {/* ------------------------------------------------------------- */}
        {/* LIVE USER GPS POSITION PIN & ACCURACY RADIUS CIRCLE           */}
        {/* ------------------------------------------------------------- */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userGpsIcon}>
              <Tooltip sticky>
                <div className="font-bold text-blue-600 text-xs">You are here</div>
                <div className="text-[10px] text-slate-500">
                  Accuracy: ±{Math.round(userLocation.accuracy || 5)}m
                </div>
              </Tooltip>
            </Marker>

            {userLocation.accuracy && userLocation.accuracy < 100 && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={userLocation.accuracy}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#60a5fa',
                  fillOpacity: 0.12,
                  weight: 1.5,
                  dashArray: '3, 4'
                }}
              />
            )}
          </>
        )}

        {/* Fixed Google Maps On-Screen Controls */}
        <LeafletMapControlsWrapper
          mapType={mapType}
          setMapType={setMapType}
          onLocateMe={handleLocateMe}
          onFitCampus={() => setFitCampusTrigger(t => t + 1)}
          onSwitch3D={onSwitch3D}
          onSwitchImmersive={onSwitchImmersive}
          hasActiveRoute={Boolean(activeRoute)}
          onClearRoute={onClearRoute}
        />
      </MapContainer>

      {/* ================================================================= */}
      {/* 3. GPS LOCATION ERROR TOAST                                       */}
      {/* ================================================================= */}
      {locationError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[500] bg-rose-600 text-white px-4 py-2 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-white shrink-0" />
          <span>{locationError}</span>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className="ml-2 p-0.5 hover:bg-rose-700 rounded-lg text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. BOTTOM-LEFT CAMPUS BRAND STATUS PILL                           */}
      {/* ================================================================= */}
      <div className="hidden sm:flex absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-[#0b1728]/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-full px-3.5 py-1.5 text-[11px] text-slate-600 dark:text-slate-300 items-center gap-2 shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-extrabold text-slate-900 dark:text-white">Presidency University</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-500 font-mono text-[10px]">13.1714°N, 77.5361°E · Bengaluru GIS</span>
      </div>
    </div>
  );
}
