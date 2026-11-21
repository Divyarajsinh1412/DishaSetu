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
  DoorOpen,
  Map as MapIcon
} from 'lucide-react';
import { MASTER_CAMPUS_FEATURES } from '../data/masterMapFeatures';
import { MAIN_LAWN_SURVEYED_GPS_COORDINATES } from '../data/gardenAreaCoords';

// =====================================================================
// AUTHENTIC GOOGLE MAPS PIN GENERATOR (SVG Teardrop Drop Pins)
// =====================================================================
const createGoogleMapsPin = ({
  bgColor = '#1a73e8',
  glyphSvg,
  borderColor = '#ffffff',
  size = 38,
  glow = false,
  isSelected = false
}) => {
  const pinWidth = size;
  const pinHeight = Math.round(size * 1.25);
  const anchorX = pinWidth / 2;
  const anchorY = pinHeight;

  const html = `
    <div style="position:relative; width:${pinWidth}px; height:${pinHeight}px; transform:translate3d(0,0,0); ${isSelected ? 'transform:scale(1.22) translateY(-4px);' : ''} filter:${glow || isSelected ? 'drop-shadow(0 0 12px rgba(26,115,232,0.85))' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))'}; transition:transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);">
      ${isSelected ? '<div style="position:absolute; -inset:8px; border-radius:50%; background:rgba(26,115,232,0.35); animation:google-pulse-ring 2s infinite;"></div>' : ''}
      <svg width="${pinWidth}" height="${pinHeight}" viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Pin Drop Teardrop Body -->
        <path d="M19 0C8.506 0 0 8.506 0 19C0 30.6 19 48 19 48C19 48 38 30.6 38 19C38 8.506 29.494 0 19 0Z" fill="${bgColor}" stroke="${borderColor}" stroke-width="2.2"/>
        <!-- Inner White Circle for Contrast -->
        <circle cx="19" cy="19" r="13" fill="#ffffff" fill-opacity="0.25"/>
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
    popupAnchor: [0, -pinHeight + 6]
  });
};

// Google Material Category SVG Glyphs
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

// Preset category pins (Google Maps Palette: Blue #1a73e8, Amber #ea8600, Teal #00897b, Red #d93025, Green #1e8e3e, Orange #e8710a)
const pinIcons = {
  academic: createGoogleMapsPin({ bgColor: '#1a73e8', glyphSvg: ICON_SVGS.academic }),
  cafe: createGoogleMapsPin({ bgColor: '#ea8600', glyphSvg: ICON_SVGS.cafe }),
  library: createGoogleMapsPin({ bgColor: '#0288d1', glyphSvg: ICON_SVGS.library }),
  medical: createGoogleMapsPin({ bgColor: '#d93025', glyphSvg: ICON_SVGS.medical }),
  gate: createGoogleMapsPin({ bgColor: '#1e8e3e', glyphSvg: ICON_SVGS.gate, size: 42, glow: true }),
  parking: createGoogleMapsPin({ bgColor: '#e8710a', glyphSvg: ICON_SVGS.parking }),
  sports: createGoogleMapsPin({ bgColor: '#f29900', glyphSvg: ICON_SVGS.sports }),
  garden: createGoogleMapsPin({ bgColor: '#0d904f', glyphSvg: ICON_SVGS.garden }),
  landmark: createGoogleMapsPin({ bgColor: '#00897b', glyphSvg: ICON_SVGS.landmark }),
  door: createGoogleMapsPin({ bgColor: '#8e24aa', glyphSvg: ICON_SVGS.door })
};

// Selected Category Pin Generator
const getSelectedPinIcon = (catKey) => {
  const glyph = ICON_SVGS[catKey] || ICON_SVGS.landmark;
  return createGoogleMapsPin({
    bgColor: '#1a73e8',
    glyphSvg: glyph,
    size: 44,
    glow: true,
    isSelected: true
  });
};

// Google Maps High-Precision User Location Marker (Blue Pulsing Dot)
const userGpsIcon = L.divIcon({
  html: `
    <div style="position:relative; width:48px; height:48px; display:flex; align-items:center; justify-content:center;">
      <div style="position:absolute; width:48px; height:48px; border-radius:50%; background:rgba(26,115,232,0.25); animation:google-pulse-ring 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div>
      <div style="position:absolute; width:20px; height:20px; border-radius:50%; background:#1a73e8; border:3px solid #ffffff; box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>
      <div style="width:5px; height:5px; border-radius:50%; background:#ffffff;"></div>
    </div>
  `,
  className: 'user-gps-marker',
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});

// Google Maps Route Origin Pin (A - Green)
const routeStartIcon = L.divIcon({
  html: `
    <div style="position:relative; width:34px; height:44px; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
      <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
        <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 17 44 17 44C17 44 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="#1e8e3e" stroke="#ffffff" stroke-width="2.5"/>
      </svg>
      <div style="position:absolute; top:6px; left:0; width:34px; text-align:center; font-weight:900; font-size:13px; color:#ffffff; font-family:sans-serif;">A</div>
    </div>
  `,
  className: 'route-start-pin',
  iconSize: [34, 44],
  iconAnchor: [17, 44]
});

// Google Maps Route Destination Pin (B - Red)
const routeEndIcon = L.divIcon({
  html: `
    <div style="position:relative; width:34px; height:44px; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
      <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
        <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 17 44 17 44C17 44 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="#d93025" stroke="#ffffff" stroke-width="2.5"/>
      </svg>
      <div style="position:absolute; top:6px; left:0; width:34px; text-align:center; font-weight:900; font-size:13px; color:#ffffff; font-family:sans-serif;">B</div>
    </div>
  `,
  className: 'route-end-pin',
  iconSize: [34, 44],
  iconAnchor: [17, 44]
});

// Waypoint Step Pin
const createWaypointIcon = (stepNumber) => L.divIcon({
  html: `
    <div style="width:22px; height:22px; border-radius:50%; background:#1a73e8; border:2px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:800; font-size:11px; font-family:sans-serif;">
      ${stepNumber}
    </div>
  `,
  className: 'route-waypoint-pin',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
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
  resetViewTrigger,
  bounds
}) {
  const map = useMap();

  // Initial Center & Zoom (Presidency University, Bengaluru)
  useEffect(() => {
    if (centerCoords && centerCoords.lat && centerCoords.lng) {
      map.setView([centerCoords.lat, centerCoords.lng], zoomLevel || 17.5, {
        animate: true,
        duration: 0.8
      });
    }
  }, [centerCoords, zoomLevel, map]);

  // Reset View to Initial University Center
  useEffect(() => {
    if (resetViewTrigger > 0 && centerCoords && centerCoords.lat && centerCoords.lng) {
      map.flyTo([centerCoords.lat, centerCoords.lng], zoomLevel || 17.5, {
        duration: 1.0,
        easeLinearity: 0.25
      });
    }
  }, [resetViewTrigger, centerCoords, zoomLevel, map]);

  // Fit Campus Trigger
  useEffect(() => {
    if (fitCampusTrigger > 0 && bounds) {
      map.flyToBounds(
        [bounds.southWest, bounds.northEast],
        { padding: [70, 70], duration: 1.0 }
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
        { padding: [100, 100], duration: 1.0 }
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
          duration: 0.9,
          easeLinearity: 0.25
        });
      }
    }
  }, [selectedLocation, map]);

  return null;
}

// Wheel and Interaction Isolation Controller for Leaflet
function MapInteractionIsolationController({ isModalOpen }) {
  const map = useMap();

  // 1. Dynamically toggle scrollWheelZoom based on modal state
  useEffect(() => {
    if (!map) return;
    if (isModalOpen) {
      map.scrollWheelZoom.disable();
    } else {
      map.scrollWheelZoom.enable();
    }
  }, [isModalOpen, map]);

  // 2. Capture-phase wheel listener on map container to stop wheel events originating from overlays
  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();
    if (!container) return;

    const onWheelCapture = (e) => {
      // If modal is open, completely stop wheel zoom
      if (isModalOpen) {
        e.stopPropagation();
        return;
      }

      // If wheel event is over any UI overlay, drawer, card, dropdown, or button
      const isOverlay = e.target.closest(
        'button, input, select, textarea, aside, dialog, [role="dialog"], [data-panel], [data-prevent-map-zoom], .interactive-overlay, .no-map-zoom, .overscroll-contain, .isolate-scroll, .modal-content, .overflow-y-auto, .overflow-x-auto, .leaflet-control, .google-maps-panel, .custom-scrollbar'
      );
      if (isOverlay) {
        e.stopPropagation();
      }
    };

    const onTouchMoveCapture = (e) => {
      if (isModalOpen) {
        e.stopPropagation();
        return;
      }
      const isOverlay = e.target.closest(
        'aside, dialog, [role="dialog"], [data-panel], [data-prevent-map-zoom], .overscroll-contain, .isolate-scroll, .modal-content'
      );
      if (isOverlay) {
        e.stopPropagation();
      }
    };

    container.addEventListener('wheel', onWheelCapture, { capture: true, passive: false });
    container.addEventListener('touchmove', onTouchMoveCapture, { capture: true, passive: false });

    return () => {
      container.removeEventListener('wheel', onWheelCapture, { capture: true });
      container.removeEventListener('touchmove', onTouchMoveCapture, { capture: true });
    };
  }, [map, isModalOpen]);

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
// FIXED GOOGLE MAPS-STYLE ON-SCREEN CONTROLS (Bottom-Right & Bottom-Left)
// =====================================================================
function GoogleMapsFixedControls({
  mapType,
  setMapType,
  onZoomIn,
  onZoomOut,
  onLocateMe,
  onFitCampus,
  onResetView,
  onSwitch3D,
  onSwitchImmersive,
  hasActiveRoute,
  onClearRoute
}) {
  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState(false);

  return (
    <>
      {/* 1. BOTTOM-LEFT GOOGLE MAPS LAYER SWITCHER THUMBNAIL */}
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="absolute bottom-6 left-3 sm:left-4 z-[400] select-none"
      >
        <div className="relative">
          {isLayerDrawerOpen && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-[#202124] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700/80 flex flex-col gap-1.5 w-44 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Map Types
              </div>
              <button
                type="button"
                onClick={() => { setMapType('google_roadmap'); setIsLayerDrawerOpen(false); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors ${
                  mapType === 'google_roadmap'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>Google Map</span>
                {mapType === 'google_roadmap' && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
              </button>
              <button
                type="button"
                onClick={() => { setMapType('google_satellite'); setIsLayerDrawerOpen(false); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors ${
                  mapType === 'google_satellite'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>Satellite Hybrid</span>
                {mapType === 'google_satellite' && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
              </button>
              <button
                type="button"
                onClick={() => { setMapType('google_terrain'); setIsLayerDrawerOpen(false); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors ${
                  mapType === 'google_terrain'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>Terrain</span>
                {mapType === 'google_terrain' && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
              </button>
              <button
                type="button"
                onClick={() => { setMapType('dark'); setIsLayerDrawerOpen(false); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors ${
                  mapType === 'dark'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>Dark Theme</span>
                {mapType === 'dark' && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
              </button>
            </div>
          )}

          {/* Google Maps Classic Square Layers Thumbnail Button */}
          <button
            type="button"
            onClick={() => setIsLayerDrawerOpen(!isLayerDrawerOpen)}
            className="w-11 h-11 bg-white dark:bg-[#202124] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl shadow-gmap-floating flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
            title="Switch Map Layers (Default / Satellite / Terrain)"
          >
            <Layers className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* 2. BOTTOM-RIGHT GOOGLE MAPS CONTROLS COLUMN */}
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="absolute bottom-20 sm:bottom-6 right-3 sm:right-4 z-[400] flex flex-col items-center gap-2 select-none"
      >
        {/* End Route FAB (when active navigation is on) */}
        {hasActiveRoute && (
          <button
            type="button"
            onClick={onClearRoute}
            className="px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 mb-1"
            title="End Active Navigation Route"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>End Route</span>
          </button>
        )}

        {/* Fit Campus Bounds Button */}
        <button
          type="button"
          onClick={onFitCampus}
          className="w-11 h-11 bg-white dark:bg-[#202124] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl text-slate-700 dark:text-slate-200 hover:text-blue-600 shadow-gmap-floating flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
          title="Fit Campus Bounds (Presidency Grounds)"
        >
          <Maximize2 className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-blue-600 group-hover:scale-110 transition-all" />
        </button>

        {/* Reset View Button (Presidency Center) */}
        <button
          type="button"
          onClick={onResetView}
          className="w-11 h-11 bg-white dark:bg-[#202124] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl text-slate-700 dark:text-slate-200 hover:text-blue-600 shadow-gmap-floating flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
          title="Reset View (Presidency Center)"
        >
          <Compass className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-blue-600 group-hover:rotate-45 transition-all" />
        </button>

        {/* Google Maps My Location GPS Button */}
        <button
          type="button"
          onClick={onLocateMe}
          className="w-11 h-11 bg-white dark:bg-[#202124] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl text-slate-700 dark:text-slate-200 shadow-gmap-floating flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
          title="Center on My GPS Location"
        >
          <LocateFixed className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-115 transition-transform" />
        </button>

        {/* Google Maps Zoom Control (+ / -) Split Card */}
        <div className="bg-white dark:bg-[#202124] border border-slate-200/90 dark:border-slate-700/80 rounded-2xl shadow-gmap-floating flex flex-col overflow-hidden">
          <button
            type="button"
            onClick={onZoomIn}
            className="w-11 h-11 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 flex items-center justify-center transition-colors border-b border-slate-200/80 dark:border-slate-700"
            title="Zoom In"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="w-11 h-11 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 flex items-center justify-center transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-5 h-5" />
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
  onResetView,
  onSwitch3D,
  onSwitchImmersive,
  hasActiveRoute,
  onClearRoute
}) {
  const map = useMap();

  return (
    <GoogleMapsFixedControls
      mapType={mapType}
      setMapType={setMapType}
      onZoomIn={() => map.zoomIn()}
      onZoomOut={() => map.zoomOut()}
      onLocateMe={onLocateMe}
      onFitCampus={onFitCampus}
      onResetView={onResetView}
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
  onStartNavigation,
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
  searchQuery = '',
  isModalOpen = false,
  mapType: propMapType,
  setMapType: propSetMapType
}) {
  // Tile Type: 'google_roadmap', 'google_satellite', 'google_terrain', 'voyager', 'dark'
  const [internalMapType, setInternalMapType] = useState('google_roadmap');
  const mapType = propMapType || internalMapType;
  const setMapType = propSetMapType || setInternalMapType;
  const [fitCampusTrigger, setFitCampusTrigger] = useState(0);
  const [resetViewTrigger, setResetViewTrigger] = useState(0);
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
    [13.172050, 77.535300],
    [13.172150, 77.536190],
    [13.172080, 77.536650],
    [13.171200, 77.536900],
    [13.170100, 77.537100],
    [13.169120, 77.537050],
    [13.168700, 77.536850],
    [13.168600, 77.535800],
    [13.168900, 77.534800],
    [13.169800, 77.534700],
    [13.170800, 77.534900],
    [13.171800, 77.535100],
    [13.172050, 77.535300]
  ], []);

  // Dynamic Campus Bounds for 1-Click Fit Campus
  const dynamicCampusBounds = useMemo(() => ({
    southWest: [13.16840, 77.53450],
    northEast: [13.17240, 77.53740]
  }), []);

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

  // Unified Campus Points: Merging server catalog with 35+ verified institutional master features
  const allCampusPoints = useMemo(() => {
    const list = [...locations];
    const seenCodes = new Set(
      list.map(l => (l.shortCode || l.code || l.locationId || l.name || '').toLowerCase())
    );

    MASTER_CAMPUS_FEATURES.forEach(feat => {
      const codeKey = (feat.code || feat.featureId || feat.featureName || '').toLowerCase();
      if (!seenCodes.has(codeKey) && feat.latitude != null && feat.longitude != null) {
        seenCodes.add(codeKey);
        list.push({
          locationId: feat.featureId,
          _id: feat.featureId,
          name: feat.featureName,
          shortCode: feat.code,
          category: feat.category,
          description: feat.description,
          latitude: feat.latitude,
          longitude: feat.longitude,
          coordinates: { lat: feat.latitude, lng: feat.longitude },
          departments: feat.departments || [],
          totalFloors: feat.totalFloors,
          hasIndoorMap: feat.hasIndoorMap,
          buildingId: feat.buildingId,
          brand: feat.brand,
          operatingHours: feat.operatingHours,
          raw: feat
        });
      }
    });

    return list;
  }, [locations]);

  // Realistic Geographic Building Footprints Generator
  const buildingFootprints = useMemo(() => {
    const DEG_LAT_METER = 0.00000899;
    const DEG_LNG_METER = 0.00000924;

    const footprints = [];
    const configs = [
      { code: 'PU-D-BLOCK', width: 44, depth: 24, name: 'D Block (Engineering Labs)' },
      { code: 'PU-E-BLOCK', width: 44, depth: 24, name: 'E Block (CSE & AI Research)' },
      { code: 'PU-F-BLOCK', width: 44, depth: 24, name: 'F Block (Information Science)' },
      { code: 'PU-L-BLOCK', width: 42, depth: 24, name: 'L Block (ECE & Robotics)' },
      { code: 'PU-ADM-BLOCK', width: 36, depth: 20, name: 'Admissions & Registrar' },
      { code: 'PU-H-BLOCK', width: 38, depth: 22, name: 'H Block (Electrical Eng.)' },
      { code: 'PU-J-BLOCK', width: 32, depth: 20, name: 'J Block (Management Studies)' },
      { code: 'PU-K-BLOCK', width: 34, depth: 20, name: 'K Block (Research Suites)' },
      { code: 'PU-N-BLOCK', width: 40, depth: 24, name: 'N Block (School of Design)' },
      { code: 'PU-P-BLOCK', width: 36, depth: 22, name: 'P Block (Postgraduate Studies)' },
      { code: 'PU-Q-BLOCK', width: 36, depth: 22, name: 'Q Block (Basic Sciences)' },
      { code: 'PU-R-BLOCK', width: 36, depth: 22, name: 'R Block (Humanities Wing)' },
      { code: 'PU-S-BLOCK', width: 45, depth: 26, name: 'S Block (School of Law)' },
      { code: 'PU-U-BLOCK', width: 38, depth: 22, name: 'U Block (Innovation Hub)' },
      { code: 'PU-HR-BLOCK', width: 48, depth: 30, name: 'Plaza & HR Block' },
      { code: 'PU-COE', width: 28, depth: 20, name: 'Controller of Examinations' },
      { code: 'PU-FEE-COUNTER', width: 30, depth: 18, name: 'Fee Counter & Finance' },
      { code: 'PU-DSA', width: 28, depth: 18, name: 'Directorate of Student Affairs' },
      { code: 'PU-SOM-BLOCK', width: 48, depth: 26, name: 'School of Management (MBA)' },
      { code: 'PU-AUDITORIUM', width: 54, depth: 36, name: 'University Auditorium' },
      { code: 'PU-HOSTEL-MESS', width: 42, depth: 30, name: 'Hostel Mess & Dining Hall' },
      { code: 'PU-LIBRARY-CENTRAL', width: 44, depth: 28, name: 'Central University Library' },
      { code: 'PU-FOOTBALL-COURT', width: 55, depth: 85, name: 'Football Ground (Regulation Turf)', isSports: true },
      { code: 'PU-BASKETBALL-COURT', width: 28, depth: 18, name: 'Basketball Court', isSports: true },
      { code: 'PU-VOLLEYBALL-NETS', width: 22, depth: 14, name: 'Volleyball Courts', isSports: true },
      { code: 'PU-CRICKET-NETS', width: 26, depth: 16, name: 'Cricket Practice Nets', isSports: true },
      { code: 'PU-PARK-STU-MAIN', width: 45, depth: 30, name: 'Main Student Parking', isParking: true },
      { code: 'PU-PARK-2W-STU', width: 35, depth: 20, name: 'Student 2-Wheeler Parking', isParking: true },
      { code: 'PU-PARK-VISITOR', width: 32, depth: 22, name: 'Visitor Parking Lot', isParking: true }
    ];

    configs.forEach(cfg => {
      const match = allCampusPoints.find(p => (p.shortCode || p.code) === cfg.code);
      if (match && match.latitude != null && match.longitude != null) {
        const halfLat = (cfg.depth / 2) * DEG_LAT_METER;
        const halfLng = (cfg.width / 2) * DEG_LNG_METER;
        const coords = [
          [match.latitude - halfLat, match.longitude - halfLng],
          [match.latitude - halfLat, match.longitude + halfLng],
          [match.latitude + halfLat, match.longitude + halfLng],
          [match.latitude + halfLat, match.longitude - halfLng]
        ];

        footprints.push({
          id: `fp_${cfg.code}`,
          code: cfg.code,
          name: cfg.name || match.name,
          category: match.category,
          departments: match.departments || [],
          coordinates: coords,
          source: match,
          isSports: cfg.isSports,
          isParking: cfg.isParking
        });
      }
    });

    return footprints;
  }, [allCampusPoints]);

  // Filter Locations for Category & Search
  const filteredLocationList = useMemo(() => {
    let list = allCampusPoints;
    if (activeCategory && activeCategory !== 'all') {
      const target = activeCategory.toLowerCase();
      list = list.filter(l => {
        const c = (l.category || '').toLowerCase();
        if (target === 'academic') return c === 'academic' || c === 'administrative';
        if (target === 'cafe') return c === 'cafe' || c === 'food' || c === 'dining';
        if (target === 'garden') return c === 'garden' || c === 'outdoor' || c === 'lawn';
        return c === target;
      });
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
  }, [allCampusPoints, activeCategory, searchQuery]);

  // Marker Icon Selector Helper
  const getMarkerIcon = useCallback((loc, isSelected = false) => {
    const cat = loc.category?.toLowerCase() || '';
    let catKey = 'landmark';

    if (cat.includes('academic') || cat.includes('building') || loc.shortCode?.includes('BLOCK')) catKey = 'academic';
    else if (cat.includes('cafe') || loc.shortCode?.includes('CAFE') || loc.name?.toLowerCase().includes('kappi')) catKey = 'cafe';
    else if (cat.includes('library')) catKey = 'library';
    else if (cat.includes('medical') || cat.includes('health')) catKey = 'medical';
    else if (cat.includes('gate') || loc.shortCode?.includes('GATE')) catKey = 'gate';
    else if (cat.includes('parking')) catKey = 'parking';
    else if (cat.includes('sport')) catKey = 'sports';
    else if (cat.includes('garden') || cat.includes('lawn')) catKey = 'garden';
    else if (cat.includes('door') || loc.roomNumber) catKey = 'door';

    if (isSelected) {
      return getSelectedPinIcon(catKey);
    }
    return pinIcons[catKey] || pinIcons.landmark;
  }, []);

  return (
    <div className="relative w-full h-full min-h-full overflow-hidden select-none bg-[#e5e3df] dark:bg-[#202124]">
      {/* 1. COORDINATE SURVEY PICKER BANNER (When Active) */}
      {isPickingCoordinates && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[500] bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-blue-400 font-semibold text-xs animate-bounce">
          <Crosshair className="w-4 h-4 text-white animate-spin" />
          <span>Click anywhere on the map to set Entrance coordinates!</span>
        </div>
      )}

      {/* 2. FULL-SCREEN LEAFLET MAP ENGINE (100% Viewport, Continuous Pan & Zoom) */}
      <MapContainer
        center={[presidencyCenter.lat, presidencyCenter.lng]}
        zoom={presidencyCenter.zoom}
        minZoom={3}
        maxZoom={22}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        className="w-full h-full absolute inset-0 z-0"
      >
        <MapInteractionIsolationController isModalOpen={isModalOpen} />

        <MapController
          centerCoords={presidencyCenter}
          zoomLevel={presidencyCenter.zoom}
          activeRoute={activeRoute}
          selectedLocation={selectedLocation}
          fitCampusTrigger={fitCampusTrigger}
          resetViewTrigger={resetViewTrigger}
          bounds={dynamicCampusBounds}
        />

        <MapClickHandler
          isPicking={isPickingCoordinates}
          onPickCoordinates={onCoordinatePicked}
        />

        {/* ------------------------------------------------------------- */}
        {/* BASE MAP TILE ENGINE (Google Maps Road / Satellite / Terrain)  */}
        {/* ------------------------------------------------------------- */}
        {mapType === 'google_roadmap' ? (
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution='&copy; Google Maps | Presidency University Bengaluru'
            maxZoom={22}
          />
        ) : mapType === 'google_satellite' ? (
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            attribution='&copy; Google Maps Hybrid Imagery | Presidency University Bengaluru'
            maxZoom={22}
          />
        ) : mapType === 'google_terrain' ? (
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            attribution='&copy; Google Maps Terrain | Presidency University Bengaluru'
            maxZoom={20}
          />
        ) : mapType === 'dark' ? (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains={['a', 'b', 'c', 'd']}
            attribution='&copy; CARTO &copy; OpenStreetMap | Presidency University'
            maxZoom={20}
          />
        ) : (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains={['a', 'b', 'c', 'd']}
            attribution='&copy; CARTO &copy; OpenStreetMap | Presidency University'
            maxZoom={21}
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* PRESIDENCY UNIVERSITY OFFICIAL BOUNDARY PERIMETER              */}
        {/* ------------------------------------------------------------- */}
        <Polygon
          positions={officialCampusBoundary}
          pathOptions={{
            color: '#1a73e8',
            weight: 2.5,
            opacity: 0.9,
            fillColor: '#1a73e8',
            fillOpacity: 0.04,
            dashArray: '5, 5'
          }}
        >
          <Tooltip sticky>
            <div className="font-bold text-blue-600">
              Presidency University Bengaluru
            </div>
            <div className="text-[10px] text-slate-600">
              Official Campus Boundary · Itgalpur Campus
            </div>
          </Tooltip>
        </Polygon>

        {/* ------------------------------------------------------------- */}
        {/* AUTHORITATIVE SURVEYED MAIN LAWN / GARDEN AREA (77 GPS Points) */}
        {/* ------------------------------------------------------------- */}
        <Polygon
          positions={MAIN_LAWN_SURVEYED_GPS_COORDINATES}
          pathOptions={{
            color: '#15803d',
            fillColor: '#22c55e',
            weight: 2.5,
            opacity: 0.95,
            fillOpacity: 0.32
          }}
          eventHandlers={{
            click: () => {
              if (onSelectLocation) {
                onSelectLocation({
                  locationId: 'loc_main_lawn',
                  name: 'Main Lawn / Garden Area',
                  category: 'Garden',
                  description: 'Central campus green lawn and landscaped gardens, surveyed via Google Earth KML (77 GPS points).',
                  coordinates: { lat: 13.17032, lng: 77.53605 }
                });
              }
            }
          }}
        >
          <Tooltip sticky>
            <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Main Lawn / Garden Area</span>
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400">
              Presidency University Central Campus Garden &bull; 77 Surveyed GPS Points
            </div>
          </Tooltip>
          <Popup>
            <div className="p-1 min-w-[220px]">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Main Lawn / Garden Area</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mb-2">
                <div><strong>Category:</strong> Campus Gardens &amp; Lawns</div>
                <div><strong>Status:</strong> <span className="text-emerald-600 font-bold">Verified KML Surveyed</span></div>
                <div><strong>GPS Accuracy:</strong> 77 Boundary Coordinates</div>
                <div><strong>Location:</strong> Central Promenade, between Main Avenue and Faculty Parking</div>
              </div>
              {onOpenRoutePlanning && (
                <button
                  type="button"
                  onClick={() => onOpenRoutePlanning('node_main_gate', 'loc_main_lawn')}
                  className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <NavigationIcon className="w-3.5 h-3.5" />
                  <span>Navigate to Main Lawn</span>
                </button>
              )}
            </div>
          </Popup>
        </Polygon>

        {/* ------------------------------------------------------------- */}
        {/* ARCHITECTURAL CAMPUS FEATURES (Walkways, Quads, Gardens, etc)  */}
        {/* ------------------------------------------------------------- */}
        {features.map((feat) => {
          if (!feat.coordinates || !Array.isArray(feat.coordinates) || feat.coordinates.length < 2) return null;
          if (feat.featureId === 'feature_campus_garden_area' || feat.name === 'Main Lawn / Garden Area' || feat.name === 'Presidency Campus Central Garden') {
            return null;
          }

          const isPolygon = feat.geometryType === 'Polygon' || (Array.isArray(feat.coordinates[0]) && Array.isArray(feat.coordinates[0][0]));
          const coords = feat.coordinates;

          if (isPolygon) {
            return (
              <Polygon
                key={feat.featureId || feat._id}
                positions={coords}
                pathOptions={{
                  color: feat.category === 'Garden' ? '#1e8e3e' : feat.category === 'Parking' ? '#ea580c' : '#1a73e8',
                  fillColor: feat.category === 'Garden' ? '#34a853' : feat.category === 'Parking' ? '#f97316' : '#4285f4',
                  weight: 2,
                  fillOpacity: feat.category === 'Garden' ? 0.3 : feat.category === 'Parking' ? 0.25 : 0.2
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
                color: feat.category === 'Gate' ? '#1e8e3e' : feat.category === 'Tree' ? '#0d904f' : '#1a73e8',
                weight: feat.category === 'Gate' ? 5 : 3.5,
                opacity: 0.85
              }}
            />
          );
        })}

        {/* ------------------------------------------------------------- */}
        {/* REALISTIC GEOGRAPHIC CAMPUS BUILDING FOOTPRINTS               */}
        {/* ------------------------------------------------------------- */}
        {buildingFootprints.map((footprint) => {
          const isSelected = selectedLocation && (
            selectedLocation.shortCode === footprint.code ||
            selectedLocation.code === footprint.code ||
            selectedLocation.locationId === footprint.id ||
            selectedLocation.name === footprint.name
          );

          let strokeColor = '#9aa0a6';
          let fillColor = mapType === 'dark' ? '#3c4043' : '#d6dbe0';
          let fillOpacity = 0.65;

          if (footprint.isSports) {
            strokeColor = '#1e8e3e';
            fillColor = '#34a853';
            fillOpacity = 0.35;
          } else if (footprint.isParking) {
            strokeColor = '#c2410c';
            fillColor = '#ea580c';
            fillOpacity = 0.22;
          } else if (mapType === 'google_satellite') {
            strokeColor = '#1a73e8';
            fillColor = '#ffffff';
            fillOpacity = 0.22;
          }

          if (isSelected) {
            strokeColor = '#1a73e8';
            fillColor = '#4285f4';
            fillOpacity = 0.75;
          }

          return (
            <Polygon
              key={footprint.id}
              positions={footprint.coordinates}
              pathOptions={{
                color: strokeColor,
                weight: isSelected ? 2.5 : 1.5,
                fillColor: fillColor,
                fillOpacity: fillOpacity
              }}
              eventHandlers={{
                click: () => {
                  if (onSelectLocation && footprint.source) {
                    onSelectLocation(footprint.source);
                  }
                }
              }}
            >
              <Tooltip sticky>
                <div className="font-bold text-xs text-slate-900">{footprint.name}</div>
                <div className="text-[10px] text-slate-500 font-semibold">{footprint.category} · {footprint.code}</div>
                {footprint.departments && footprint.departments.length > 0 && (
                  <div className="text-[9px] text-blue-600 mt-0.5">{footprint.departments.slice(0, 2).join(', ')}</div>
                )}
              </Tooltip>
            </Polygon>
          );
        })}

        {/* Central Fountain Architectural Landmark */}
        <Circle
          center={[13.17075, 77.53635]}
          radius={13}
          pathOptions={{
            color: '#0288d1',
            fillColor: '#29b6f6',
            fillOpacity: 0.5,
            weight: 2
          }}
        >
          <Tooltip sticky>
            <div className="font-bold text-xs text-sky-700">Central Fountain</div>
            <div className="text-[10px] text-slate-500">Directional Roundabout & Landmark</div>
          </Tooltip>
        </Circle>

        {/* ------------------------------------------------------------- */}
        {/* VERIFIED WALKING PATHS NETWORK                                */}
        {/* ------------------------------------------------------------- */}
        {walkingPaths.map((p) => {
          if (!p.geometry || p.geometry.length < 2) return null;
          const isKmlPath = p.pathId === 'path_kml_main_gate_to_d_block' ||
                            p.sourceType === 'kml_import' ||
                            (p.source && String(p.source).toLowerCase().includes('kml'));

          return (
            <Polyline
              key={p.pathId}
              positions={p.geometry}
              pathOptions={{
                color: isKmlPath ? '#0284c7' : (p.status === 'active' ? '#9aa0a6' : '#ea4335'),
                weight: isKmlPath ? 4 : 2.5,
                opacity: isKmlPath ? 0.9 : 0.5,
                dashArray: isKmlPath ? null : '3, 5'
              }}
            >
              <Tooltip sticky>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isKmlPath ? 'bg-sky-500' : 'bg-slate-400'}`}></span>
                  <span>{p.name || 'Walking Path'}</span>
                </div>
                <div className="text-[10px] text-slate-600">
                  {p.distanceMeters} m · {isKmlPath ? 'Google Earth KML Surveyed' : 'Pedestrian Walkway'}
                </div>
              </Tooltip>
              <Popup>
                <div className="p-1 min-w-[210px]">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span>{p.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mb-2 space-y-0.5">
                    <div><strong>Distance:</strong> {p.distanceMeters} meters (~{p.estimatedWalkingMinutes || Math.max(1, Math.round(p.distanceMeters / 75))} mins walk)</div>
                    <div><strong>Status:</strong> <span className="text-emerald-600 font-bold">Verified Surveyed Route</span></div>
                    {p.pointCount && <div><strong>GPS Coordinates:</strong> {p.pointCount} surveyed points</div>}
                    <div><strong>Source:</strong> {p.source || 'Google Earth KML'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onStartNavigation) {
                        onStartNavigation({
                          routeId: `route_${p.pathId}`,
                          name: p.name,
                          geometry: p.geometry,
                          distanceMeters: p.distanceMeters,
                          estimatedWalkingMinutes: p.estimatedWalkingMinutes || Math.max(1, Math.round(p.distanceMeters / 75)),
                          startLocation: p.startLocation || { name: 'Main Gate', lat: p.geometry[0][0], lng: p.geometry[0][1] },
                          endLocation: p.endLocation || { name: 'D Block', lat: p.geometry[p.geometry.length - 1][0], lng: p.geometry[p.geometry.length - 1][1] }
                        });
                      } else if (onOpenRoutePlanning) {
                        onOpenRoutePlanning('node_main_gate', 'bld_d_block');
                      }
                    }}
                    className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <NavigationIcon className="w-3.5 h-3.5" />
                    <span>Navigate This Route</span>
                  </button>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* ------------------------------------------------------------- */}
        {/* LIVE ACTIVE WALKING ROUTE (Google Maps Signature Blue Line)    */}
        {/* ------------------------------------------------------------- */}
        {activeRoute && activeRoute.geometry && activeRoute.geometry.length > 0 && (
          <>
            {/* Outer White Border Line */}
            <Polyline
              positions={activeRoute.geometry}
              pathOptions={{
                color: '#ffffff',
                weight: 9,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />

            {/* Inner Vibrant Google Maps Blue Polyline */}
            <Polyline
              positions={activeRoute.geometry}
              pathOptions={{
                color: '#1a73e8',
                weight: 6,
                opacity: 1.0,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />

            {/* Route Origin Marker (A - Green) */}
            <Marker
              position={activeRoute.geometry[0]}
              icon={routeStartIcon}
            >
              <Tooltip permanent sticky>
                <div className="font-bold text-xs text-emerald-600">Start (A)</div>
                <div className="text-[10px]">{activeRoute.startLocation?.name || 'Starting Point'}</div>
              </Tooltip>
            </Marker>

            {/* Route Destination Marker (B - Red) */}
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
                    <div className="font-bold text-xs text-blue-600">Step #{step.stepIndex}</div>
                    <div className="text-[11px] text-slate-700">{step.instruction}</div>
                  </Tooltip>
                </Marker>
              );
            })}
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CAMPUS LOCATION PINS (Google Maps Teardrop Markers)           */}
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
              icon={getMarkerIcon(loc, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectLocation) onSelectLocation(loc);
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -36]} opacity={0.95}>
                <div className="font-bold text-xs text-slate-900">{loc.name}</div>
                <div className="text-[10px] text-slate-500 font-semibold">{loc.category} · {loc.shortCode || 'PU'}</div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* ------------------------------------------------------------- */}
        {/* TEMPORARY SURVEY PICK PIN                                     */}
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
                  color: '#1a73e8',
                  fillColor: '#4285f4',
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
          onResetView={() => setResetViewTrigger(t => t + 1)}
          onSwitch3D={onSwitch3D}
          onSwitchImmersive={onSwitchImmersive}
          hasActiveRoute={Boolean(activeRoute)}
          onClearRoute={onClearRoute}
        />
      </MapContainer>

      {/* 3. GPS LOCATION ERROR TOAST */}
      {locationError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[500] bg-rose-600 text-white px-4 py-2 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-white shrink-0" />
          <span>{locationError}</span>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className="ml-2 p-0.5 hover:bg-rose-700 rounded-full text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
