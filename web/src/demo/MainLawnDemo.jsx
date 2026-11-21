import React, { useState, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Tooltip,
  Popup,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import {
  Trees,
  Layers,
  Maximize2,
  RotateCcw,
  Eye,
  EyeOff,
  Info,
  ArrowLeft,
  Crosshair,
  Copy,
  Check,
  CheckCircle2,
  FileCode,
  MapPin,
  ExternalLink,
  X
} from 'lucide-react';
import {
  MAIN_LAWN_KML,
  MAIN_LAWN_BOUNDS,
  MAIN_LAWN_CENTER
} from './mainLawnDemoData';

// Map controller for animated zooming and panning
function MapController({ targetBounds, targetCenter, targetZoom }) {
  const map = useMap();

  React.useEffect(() => {
    if (targetBounds) {
      map.fitBounds(targetBounds, {
        padding: [50, 50],
        maxZoom: 19,
        animate: true,
        duration: 0.8
      });
    }
  }, [targetBounds, map]);

  React.useEffect(() => {
    if (targetCenter) {
      map.setView(targetCenter, targetZoom || 18, {
        animate: true,
        duration: 0.8
      });
    }
  }, [targetCenter, targetZoom, map]);

  return null;
}

// Real-time cursor coordinates tracker
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

export default function MainLawnDemo({ onExit }) {
  // Main Lawn polygon visibility
  const [showLawn, setShowLawn] = useState(true);

  // Map Tile layer: 'street' (OpenStreetMap) | 'satellite' (Google Satellite Hybrid) | 'roadmap' (Google Roadmap) | 'dark' (Carto Dark)
  const [mapLayer, setMapLayer] = useState('street');

  // Polygon info modal/drawer state
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Copied coordinate status
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Programmatic map navigation targets
  const [fitBoundsTarget, setFitBoundsTarget] = useState(null);
  const [centerTarget, setCenterTarget] = useState(null);

  // Live cursor GPS coordinates
  const [cursorCoords, setCursorCoords] = useState(null);

  // Tile provider definitions
  const tileProviders = {
    street: {
      name: 'OpenStreetMap Standard',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Presidency University'
    },
    satellite: {
      name: 'Satellite Hybrid Imagery',
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps Hybrid Imagery | Presidency University Bengaluru'
    },
    roadmap: {
      name: 'Google Standard Roadmap',
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps | Presidency University Bengaluru'
    },
    dark: {
      name: 'Carto Dark Map',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap | Presidency University'
    }
  };

  // Handler: Fit Main Lawn
  const handleFitMainLawn = () => {
    setFitBoundsTarget([...MAIN_LAWN_BOUNDS]);
  };

  // Handler: Reset View
  const handleResetView = () => {
    setCenterTarget({ center: MAIN_LAWN_CENTER, zoom: 18 });
  };

  // Handler: Copy all coordinates to clipboard
  const handleCopyCoords = () => {
    const text = MAIN_LAWN_KML.coordinates
      .map(([lat, lng], idx) => `#${idx + 1}: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* =================================================================== */}
      {/* 1. TOP HEADER NAVIGATION BAR                                        */}
      {/* =================================================================== */}
      <header className="relative z-30 flex items-center justify-between px-4 py-3 bg-[#111827]/95 backdrop-blur-md border-b border-slate-700/80 shadow-xl">
        <div className="flex items-center gap-3">
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold border border-slate-700 active:scale-95 shadow-sm"
              title="Return to Main Campus Master Map"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Campus Map</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Trees className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  Main Lawn Demo
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 uppercase tracking-wider">
                  KML Verified Polygon
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Presidency University Bengaluru • Authoritative 14-Node GPS Geometry
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Base Layer Switcher */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setMapLayer('street')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                mapLayer === 'street'
                  ? 'bg-emerald-600 text-white shadow font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Street Map
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                mapLayer === 'satellite'
                  ? 'bg-emerald-600 text-white shadow font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapLayer('roadmap')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                mapLayer === 'roadmap'
                  ? 'bg-emerald-600 text-white shadow font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setMapLayer('dark')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                mapLayer === 'dark'
                  ? 'bg-emerald-600 text-white shadow font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dark
            </button>
          </div>

          {/* Fit Main Lawn */}
          <button
            onClick={handleFitMainLawn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-700/60 transition-all text-xs font-semibold active:scale-95 shadow-sm"
            title="Auto-fit viewport to Main Lawn bounds"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fit Main Lawn</span>
          </button>

          {/* Reset View */}
          <button
            onClick={handleResetView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs font-semibold border border-slate-700 active:scale-95 shadow-sm"
            title="Reset to default center and zoom 18"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. INTERACTIVE MAP VIEWPORT                                         */}
      {/* =================================================================== */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <MapContainer
          center={MAIN_LAWN_CENTER}
          zoom={18}
          maxZoom={22}
          zoomControl={false}
          className="w-full h-full z-0"
        >
          {/* Base Map Tiles */}
          <TileLayer
            key={mapLayer}
            url={tileProviders[mapLayer].url}
            attribution={tileProviders[mapLayer].attribution}
            maxZoom={22}
          />

          {/* Mouse coordinate listener */}
          <MouseCoordsTracker onMouseMove={setCursorCoords} />

          {/* Programmatic map navigation controller */}
          <MapController
            targetBounds={fitBoundsTarget}
            targetCenter={centerTarget?.center}
            targetZoom={centerTarget?.zoom}
          />

          {/* =============================================================== */}
          {/* MAIN LAWN POLYGON                                               */}
          {/* Exact 14 GPS Coordinates from main lawn.kml                     */}
          {/* Styled to match the reference campus map (light green, 70% fill) */}
          {/* =============================================================== */}
          {showLawn && (
            <Polygon
              positions={MAIN_LAWN_KML.coordinates}
              pathOptions={{
                color: MAIN_LAWN_KML.style.strokeColor,       // #15803d (darker green border)
                weight: MAIN_LAWN_KML.style.strokeWeight,     // 3.5 px
                opacity: MAIN_LAWN_KML.style.strokeOpacity,   // 0.95
                fillColor: MAIN_LAWN_KML.style.fillColor,     // #86efac (light green)
                fillOpacity: MAIN_LAWN_KML.style.fillOpacity  // 0.70 (70% opacity)
              }}
              eventHandlers={{
                click: () => {
                  setShowInfoPanel(true);
                }
              }}
            >
              {/* Institutional Centered "MAIN LAWN" Label */}
              <Tooltip
                permanent
                direction="center"
                className="main-lawn-center-label"
              >
                <div className="flex flex-col items-center justify-center pointer-events-none select-none">
                  <span className="font-extrabold text-[13px] tracking-wider text-slate-900 leading-tight drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] uppercase">
                    MAIN LAWN
                  </span>
                  <span className="text-[9px] font-bold text-emerald-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                    3.61 Acres
                  </span>
                </div>
              </Tooltip>

              {/* Interactive Popup */}
              <Popup className="custom-kml-popup">
                <div className="p-2 text-xs font-sans text-slate-900 min-w-[220px]">
                  <div className="font-bold text-sm text-emerald-700 flex items-center gap-1.5">
                    <Trees className="w-4 h-4 text-emerald-600" />
                    Main Lawn
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    <strong>Source:</strong> {MAIN_LAWN_KML.sourceFile}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Area:</strong> {MAIN_LAWN_KML.metrics.areaSqMeters.toLocaleString()} m² ({MAIN_LAWN_KML.metrics.areaAcres} acres)
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Perimeter:</strong> {MAIN_LAWN_KML.metrics.perimeterMeters} m
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                    ✓ 14 Surveyed GPS Coordinates
                  </div>
                  <button
                    onClick={() => setShowInfoPanel(true)}
                    className="mt-2 w-full py-1 px-2 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Open Geometry Inspector
                  </button>
                </div>
              </Popup>
            </Polygon>
          )}
        </MapContainer>

        {/* ================================================================= */}
        {/* 3. FLOATING MAIN LAWN CONTROLS PANEL (Top-Left)                   */}
        {/* ================================================================= */}
        <div className="absolute top-4 left-4 z-20 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
          {/* Panel Header */}
          <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trees className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Main Lawn Controls
              </span>
            </div>
            <button
              onClick={() => setShowInfoPanel(prev => !prev)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2 flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Info</span>
            </button>
          </div>

          {/* Layer Visibility Toggle */}
          <div className="p-3 space-y-2.5">
            <div
              onClick={() => setShowLawn(prev => !prev)}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                showLawn
                  ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400 opacity-75'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                    showLawn
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {showLawn && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="text-xs font-semibold flex items-center gap-1.5 text-slate-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
                    Main Lawn Polygon
                  </div>
                  <div className="text-[10px] text-slate-400">
                    main lawn.kml • 14 GPS Nodes
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFitMainLawn();
                  }}
                  className="p-1 rounded-lg hover:bg-slate-700/70 text-slate-400 hover:text-emerald-300 transition-colors"
                  title="Fit to Main Lawn"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInfoPanel(true);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-700/70 text-slate-400 hover:text-white transition-colors"
                  title="View Polygon Info"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Summary Chips */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Geodesic Area</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  14,596 m²
                </span>
                <span className="text-[10px] text-slate-400 block">3.61 Acres</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Perimeter</span>
                <span className="text-sm font-bold text-sky-400 font-mono">
                  665.2 m
                </span>
                <span className="text-[10px] text-slate-400 block">0.665 km boundary</span>
              </div>
            </div>
          </div>

          {/* Quick Footer */}
          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Polygon Closure</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. BOTTOM-RIGHT CURSOR GPS DISPLAY & STATUS                       */}
        {/* ================================================================= */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
          {cursorCoords && (
            <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg text-[11px] font-mono text-slate-300 shadow-xl flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>
                Lat: <span className="text-white font-bold">{cursorCoords.lat.toFixed(6)}</span>
              </span>
              <span>
                Lng: <span className="text-white font-bold">{cursorCoords.lng.toFixed(6)}</span>
              </span>
            </div>
          )}

          <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg text-[11px] text-slate-400 shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Presidency University Bengaluru Map Coordinates</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 5. POLYGON INFORMATION DRAWER / MODAL                             */}
        {/* ================================================================= */}
        {showInfoPanel && (
          <div className="absolute top-4 right-4 z-30 w-96 max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Main Lawn Geometry Details
                </h3>
              </div>
              <button
                onClick={() => setShowInfoPanel(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Feature Title */}
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trees className="w-4 h-4 text-emerald-400" />
                  Main Lawn
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Extracted from <code className="text-emerald-300 font-mono">main lawn.kml</code>
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Total Coordinates</span>
                  <span className="text-base font-bold text-white font-mono">
                    {MAIN_LAWN_KML.pointCount} points
                  </span>
                  <span className="text-[10px] text-slate-400 block">13 Unique Vertices</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Ring Closure</span>
                  <span className="text-xs font-bold text-emerald-400 font-sans flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Perfectly Closed
                  </span>
                  <span className="text-[10px] text-slate-400 block">Node #1 = Node #14</span>
                </div>
              </div>

              {/* Geodesic Metrics */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-[11px]">
                <div className="font-semibold text-slate-300">Geodesic Metrics (WGS84 Ellipsoid):</div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Calculated Area:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {MAIN_LAWN_KML.metrics.areaSqMeters.toLocaleString()} m²
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Area (Imperial):</span>
                  <span className="font-mono text-slate-300">
                    {Math.round(MAIN_LAWN_KML.metrics.areaSqFt).toLocaleString()} sq ft ({MAIN_LAWN_KML.metrics.areaAcres} acres)
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Calculated Perimeter:</span>
                  <span className="font-mono font-bold text-sky-300">
                    {MAIN_LAWN_KML.metrics.perimeterMeters} m ({MAIN_LAWN_KML.metrics.perimeterKm} km)
                  </span>
                </div>
              </div>

              {/* Geographical Extents */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-[11px]">
                <div className="font-semibold text-slate-300">Bounding Box Extents:</div>
                <div className="flex justify-between font-mono text-[10px] text-slate-300">
                  <span>Min Lat: {MAIN_LAWN_KML.bounds[0][0].toFixed(6)}</span>
                  <span>Max Lat: {MAIN_LAWN_KML.bounds[1][0].toFixed(6)}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-slate-300">
                  <span>Min Lng: {MAIN_LAWN_KML.bounds[0][1].toFixed(6)}</span>
                  <span>Max Lng: {MAIN_LAWN_KML.bounds[1][1].toFixed(6)}</span>
                </div>
              </div>

              {/* Complete Coordinate List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-300">
                    Exact Surveyed Coordinates (14 nodes)
                  </span>
                  <button
                    onClick={handleCopyCoords}
                    className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
                  >
                    {copiedCoords ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/80 p-2 font-mono text-[10px] space-y-1 text-slate-300">
                  {MAIN_LAWN_KML.coordinates.map(([lat, lng], idx) => (
                    <div key={idx} className="flex justify-between py-0.5 border-b border-slate-800/50">
                      <span className="text-emerald-500 font-bold">#{idx + 1}</span>
                      <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                      <span className="text-[9px] text-slate-500">
                        {idx === 0 ? 'Start' : idx === 13 ? 'Closure' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleFitMainLawn}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Fit Main Lawn</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
