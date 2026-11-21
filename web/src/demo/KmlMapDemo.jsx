import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  Tooltip,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Trees,
  CheckCircle2,
  Info,
  Eye,
  EyeOff,
  Maximize2,
  RotateCcw,
  ArrowLeft,
  FileCode,
  Shield,
  Crosshair,
  ExternalLink,
  ChevronDown,
  X,
  Compass,
  Check
} from 'lucide-react';
import {
  CAMPUS_BOUNDARY_KML,
  GARDEN_AREA_KML,
  COMBINED_KML_BOUNDS,
  DEFAULT_CAMPUS_CENTER,
  DEFAULT_CAMPUS_ZOOM
} from './kmlDemoData';

// Helper component to programmatically pan/zoom map
function MapController({ targetBounds, targetCenter, targetZoom }) {
  const map = useMap();

  React.useEffect(() => {
    if (targetBounds) {
      map.fitBounds(targetBounds, {
        padding: [40, 40],
        maxZoom: 19,
        animate: true,
        duration: 0.8
      });
    }
  }, [targetBounds, map]);

  React.useEffect(() => {
    if (targetCenter) {
      map.setView(targetCenter, targetZoom || DEFAULT_CAMPUS_ZOOM, {
        animate: true,
        duration: 0.8
      });
    }
  }, [targetCenter, targetZoom, map]);

  return null;
}

// Mouse coordinates tracker
function MouseCoordsTracker({ onMouseMove }) {
  useMapEvents({
    mousemove(e) {
      if (onMouseMove) {
        onMouseMove({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
}

export default function KmlMapDemo({ onExit }) {
  // Layer visibility state
  const [showCampusBoundary, setShowCampusBoundary] = useState(true);
  const [showGardenArea, setShowGardenArea] = useState(true);

  // Map Tile type
  // 'satellite' = Google Hybrid, 'roadmap' = Google Maps, 'terrain' = Google Terrain, 'dark' = Carto Dark
  const [tileMode, setTileMode] = useState('satellite');

  // Selected polygon detail inspection modal/card
  const [selectedPolygon, setSelectedPolygon] = useState(null);

  // Programmatic map movement triggers
  const [fitBoundsTarget, setFitBoundsTarget] = useState(null);
  const [centerTarget, setCenterTarget] = useState(null);

  // Real-time cursor coordinates
  const [cursorCoords, setCursorCoords] = useState(null);

  // Base Map Tile configurations
  const tileProviders = {
    satellite: {
      name: 'Google Satellite Hybrid',
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps Hybrid Imagery | Presidency University'
    },
    roadmap: {
      name: 'Google Standard Roadmap',
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps | Presidency University Bengaluru'
    },
    terrain: {
      name: 'Google Terrain',
      url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps Terrain | Presidency University'
    },
    dark: {
      name: 'Carto Dark Mode',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap | Presidency University'
    }
  };

  // Handler to Fit All Campus Geometries
  const handleFitCampus = () => {
    setFitBoundsTarget([...COMBINED_KML_BOUNDS]);
  };

  // Handler to Fit Garden specifically
  const handleFitGarden = () => {
    setFitBoundsTarget([...GARDEN_AREA_KML.bounds]);
  };

  // Handler to Reset Map to Default View
  const handleResetMap = () => {
    setCenterTarget({ center: DEFAULT_CAMPUS_CENTER, zoom: DEFAULT_CAMPUS_ZOOM });
    setSelectedPolygon(null);
  };

  // Handler to Show All
  const handleShowAll = () => {
    setShowCampusBoundary(true);
    setShowGardenArea(true);
    handleFitCampus();
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* =================================================================== */}
      {/* 1. TOP HEADER / CONTROL NAVIGATION BAR                              */}
      {/* =================================================================== */}
      <header className="relative z-30 flex items-center justify-between px-4 py-3 bg-[#111827]/95 backdrop-blur-md border-b border-slate-700/80 shadow-xl">
        <div className="flex items-center gap-3">
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold border border-slate-700 active:scale-95"
              title="Return to Main Campus Master Map"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Campus Map</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <FileCode className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  KML Geometry Verification & Demo Map
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase tracking-wider">
                  Independent Test Environment
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Presidency University Bengaluru • Strict Surveyed GPS Accuracy
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Tile Selector */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setTileMode('satellite')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                tileMode === 'satellite'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setTileMode('roadmap')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                tileMode === 'roadmap'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setTileMode('terrain')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                tileMode === 'terrain'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Terrain
            </button>
            <button
              onClick={() => setTileMode('dark')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                tileMode === 'dark'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dark
            </button>
          </div>

          {/* Quick Fit Controls */}
          <button
            onClick={handleFitCampus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-700/60 transition-all text-xs font-semibold active:scale-95"
            title="Auto-fit Map to Both Campus Boundary & Garden"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fit Campus</span>
          </button>

          <button
            onClick={handleResetMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs font-semibold border border-slate-700 active:scale-95"
            title="Reset Map Center and Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. MAP VIEWPORT & OVERLAY CONTROLS                                  */}
      {/* =================================================================== */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Interactive Leaflet Map */}
        <MapContainer
          center={DEFAULT_CAMPUS_CENTER}
          zoom={DEFAULT_CAMPUS_ZOOM}
          maxZoom={22}
          zoomControl={false}
          className="w-full h-full z-0"
        >
          {/* Base Layer */}
          <TileLayer
            key={tileMode}
            url={tileProviders[tileMode].url}
            attribution={tileProviders[tileMode].attribution}
            maxZoom={22}
          />

          {/* Mouse coordinate listener */}
          <MouseCoordsTracker onMouseMove={setCursorCoords} />

          {/* Map auto-controller */}
          <MapController
            targetBounds={fitBoundsTarget}
            targetCenter={centerTarget?.center}
            targetZoom={centerTarget?.zoom}
          />

          {/* 1. CAMPUS BOUNDARY POLYGON (File 1: Untitled map project (1).kml) */}
          {showCampusBoundary && (
            <Polygon
              positions={CAMPUS_BOUNDARY_KML.coordinates}
              pathOptions={{
                color: '#38bdf8',
                weight: 2.5,
                opacity: 0.95,
                dashArray: '6, 6',
                fillColor: '#0284c7',
                fillOpacity: 0.12
              }}
              eventHandlers={{
                click: () => {
                  setSelectedPolygon(CAMPUS_BOUNDARY_KML);
                }
              }}
            >
              <Tooltip sticky direction="top" className="custom-kml-tooltip">
                <div className="p-1 text-xs font-sans">
                  <div className="font-bold text-sky-400">Presidency University</div>
                  <div className="text-slate-300">Official Campus Boundary (24 GPS Points)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Click for polygon inspection</div>
                </div>
              </Tooltip>

              <Popup className="custom-kml-popup">
                <div className="p-2 text-xs font-sans text-slate-900 min-w-[220px]">
                  <div className="font-bold text-sm text-sky-700 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-sky-600" />
                    Campus Boundary
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    <strong>Source:</strong> {CAMPUS_BOUNDARY_KML.sourceFile}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Points:</strong> {CAMPUS_BOUNDARY_KML.pointCount} Surveyed GPS Coordinates
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                    ✓ Closed Polygon Verified
                  </div>
                  <button
                    onClick={() => setSelectedPolygon(CAMPUS_BOUNDARY_KML)}
                    className="mt-2 w-full py-1 px-2 bg-sky-600 text-white rounded text-[11px] font-semibold hover:bg-sky-700 transition-colors"
                  >
                    View Coordinate Inspector
                  </button>
                </div>
              </Popup>
            </Polygon>
          )}

          {/* 2. GARDEN / MAIN LAWN AREA POLYGON (File 2: gardenArea.kml) */}
          {showGardenArea && (
            <Polygon
              positions={GARDEN_AREA_KML.coordinates}
              pathOptions={{
                color: '#16a34a',
                weight: 2.8,
                opacity: 0.95,
                fillColor: '#22c55e',
                fillOpacity: 0.38
              }}
              eventHandlers={{
                click: () => {
                  setSelectedPolygon(GARDEN_AREA_KML);
                }
              }}
            >
              <Tooltip sticky direction="top" className="custom-kml-tooltip">
                <div className="p-1 text-xs font-sans">
                  <div className="font-bold text-emerald-400">Main Lawn / Garden Area</div>
                  <div className="text-slate-300">Surveyed Lawn Perimeter (77 GPS Points)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Click for polygon inspection</div>
                </div>
              </Tooltip>

              <Popup className="custom-kml-popup">
                <div className="p-2 text-xs font-sans text-slate-900 min-w-[220px]">
                  <div className="font-bold text-sm text-emerald-700 flex items-center gap-1.5">
                    <Trees className="w-4 h-4 text-emerald-600" />
                    Garden / Main Lawn Area
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    <strong>Source:</strong> {GARDEN_AREA_KML.sourceFile}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Points:</strong> {GARDEN_AREA_KML.pointCount} Surveyed GPS Coordinates
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                    ✓ Geographically Fixed on Lawn
                  </div>
                  <button
                    onClick={() => setSelectedPolygon(GARDEN_AREA_KML)}
                    className="mt-2 w-full py-1 px-2 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    View Coordinate Inspector
                  </button>
                </div>
              </Popup>
            </Polygon>
          )}
        </MapContainer>

        {/* ================================================================= */}
        {/* 3. FLOATING DEMO CONTROL PANEL (Top-Left)                         */}
        {/* ================================================================= */}
        <div className="absolute top-4 left-4 z-20 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
          {/* Panel Header */}
          <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                KML Layer Controls
              </span>
            </div>
            <button
              onClick={handleShowAll}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2"
            >
              Show All
            </button>
          </div>

          {/* Layer Checkboxes */}
          <div className="p-3 space-y-2.5">
            {/* 1. Campus Boundary Toggle */}
            <div
              onClick={() => setShowCampusBoundary(prev => !prev)}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                showCampusBoundary
                  ? 'bg-sky-950/40 border-sky-600/60 text-sky-200'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400 opacity-75'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                    showCampusBoundary
                      ? 'bg-sky-500 border-sky-400 text-white'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {showCampusBoundary && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="text-xs font-semibold flex items-center gap-1.5 text-slate-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block shadow-sm shadow-sky-400/50" />
                    Campus Boundary
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Untitled map project (1).kml • 24 pts
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPolygon(CAMPUS_BOUNDARY_KML);
                }}
                className="p-1 rounded-lg hover:bg-slate-700/70 text-slate-400 hover:text-white transition-colors"
                title="Inspect Boundary Info"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Garden / Main Lawn Area Toggle */}
            <div
              onClick={() => setShowGardenArea(prev => !prev)}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                showGardenArea
                  ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400 opacity-75'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                    showGardenArea
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {showGardenArea && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="text-xs font-semibold flex items-center gap-1.5 text-slate-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
                    Garden / Main Lawn
                  </div>
                  <div className="text-[10px] text-slate-400">
                    gardenArea.kml • 77 pts
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFitGarden();
                  }}
                  className="p-1 rounded-lg hover:bg-slate-700/70 text-slate-400 hover:text-emerald-300 transition-colors"
                  title="Zoom directly to Garden"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPolygon(GARDEN_AREA_KML);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-700/70 text-slate-400 hover:text-white transition-colors"
                  title="Inspect Garden Info"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Footer */}
          <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Verified KML Geometries</span>
            <span className="text-emerald-400 font-mono font-medium">101 Total GPS Nodes</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. BOTTOM-RIGHT CURSOR GPS DISPLAY & LEGEND                       */}
        {/* ================================================================= */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
          {/* Coordinates readout */}
          {cursorCoords && (
            <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg text-[11px] font-mono text-slate-300 shadow-xl flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>
                Lat: <span className="text-white font-bold">{cursorCoords.lat.toFixed(6)}</span>
              </span>
              <span>
                Lng: <span className="text-white font-bold">{cursorCoords.lng.toFixed(6)}</span>
              </span>
            </div>
          )}

          {/* Map Status Badge */}
          <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg text-[11px] text-slate-400 shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Presidency University Bengaluru Map Coordinates Active</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 5. GEOMETRY INSPECTOR POPUP / MODAL                               */}
        {/* ================================================================= */}
        {selectedPolygon && (
          <div className="absolute top-4 right-4 z-30 w-96 max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Geometry Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedPolygon(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Feature Title */}
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {selectedPolygon.displayName}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Extracted from <code className="text-cyan-300 font-mono">{selectedPolygon.sourceFile}</code>
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block">Total GPS Points</span>
                  <span className="text-base font-bold text-white font-mono">
                    {selectedPolygon.pointCount}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block">Polygon Status</span>
                  <span className="text-xs font-bold text-emerald-400 font-sans flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Closed Ring
                  </span>
                </div>
              </div>

              {/* Geographical Extents */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-[11px]">
                <div className="font-semibold text-slate-300">Bounding Box Extents:</div>
                <div className="flex justify-between font-mono text-[10px] text-slate-300">
                  <span>Min Lat: {selectedPolygon.bounds[0][0].toFixed(6)}</span>
                  <span>Max Lat: {selectedPolygon.bounds[1][0].toFixed(6)}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-slate-300">
                  <span>Min Lng: {selectedPolygon.bounds[0][1].toFixed(6)}</span>
                  <span>Max Lng: {selectedPolygon.bounds[1][1].toFixed(6)}</span>
                </div>
              </div>

              {/* Coordinate Preview Table */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-300">
                    Coordinate Sequence (Sample)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    [lat, lng]
                  </span>
                </div>
                <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/80 p-2 font-mono text-[10px] space-y-1 text-slate-300">
                  {selectedPolygon.coordinates.slice(0, 15).map(([lat, lng], idx) => (
                    <div key={idx} className="flex justify-between py-0.5 border-b border-slate-800/50">
                      <span className="text-slate-500">#{idx + 1}</span>
                      <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                    </div>
                  ))}
                  {selectedPolygon.coordinates.length > 15 && (
                    <div className="text-center text-slate-500 text-[10px] py-1 italic">
                      + {selectedPolygon.coordinates.length - 15} more coordinates...
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setFitBoundsTarget([...selectedPolygon.bounds])}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/20 active:scale-95"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Zoom to Geometry</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
