import React, { useState } from 'react';
import MasterCampusMap from '../maps/MasterCampusMap';
import {
  Shield,
  Trees,
  Check,
  CheckCircle2,
  Maximize2,
  RotateCcw,
  Info,
  ArrowLeft,
  Copy,
  X,
  FileCode,
  Layers
} from 'lucide-react';
import {
  MAIN_LAWN_MASTER_SVG_STRING,
  MAIN_LAWN_MASTER_CENTER,
  CAMPUS_BOUNDARY_MASTER_SVG_STRING,
  MAIN_LAWN_KML,
  CAMPUS_BOUNDARY_KML
} from './masterMapKmlData';

export default function KmlMapDemo({ onExit }) {
  // Layer visibility state
  const [showCampusBoundary, setShowCampusBoundary] = useState(true);
  const [showMainLawn, setShowMainLawn] = useState(true);

  // Inspector panel
  const [selectedPolygonType, setSelectedPolygonType] = useState('main_lawn');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Active polygon data
  const activePolygonData = selectedPolygonType === 'main_lawn' ? MAIN_LAWN_KML : CAMPUS_BOUNDARY_KML;

  const handleCopyCoords = () => {
    const coords = activePolygonData.coordinates;
    const text = coords
      .map(([lat, lng], idx) => `#${idx + 1}: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleSelectPolygon = (type) => {
    setSelectedPolygonType(type);
    setShowInfoModal(true);
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold border border-slate-700 active:scale-95 shadow-sm"
              title="Return to Main Campus Master Map"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Campus Map</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  KML Geometry Demo — Campus Master Map Style
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-950/80 text-blue-300 border border-blue-700/60 uppercase tracking-wider">
                  Master Map Base
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Presidency University Bengaluru • Exact Surveyed KML Polygons on Official Campus Map
              </p>
            </div>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="flex items-center gap-2">
          {/* Layer Toggles */}
          <button
            onClick={() => setShowCampusBoundary(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
              showCampusBoundary
                ? 'bg-sky-950/80 border-sky-600 text-sky-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Campus Boundary</span>
          </button>

          <button
            onClick={() => setShowMainLawn(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
              showMainLawn
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Main Lawn</span>
          </button>

          {/* Info Button */}
          <button
            onClick={() => setShowInfoModal(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-xs font-semibold active:scale-95 shadow-sm"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Polygon Info</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. BASE MAP: OFFICIAL CAMPUS MASTER MAP RENDERING SYSTEM            */}
      {/* =================================================================== */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <MasterCampusMap
          kmlOverlays={{
            showCampusBoundary,
            showMainLawn,
            campusBoundaryPoints: CAMPUS_BOUNDARY_MASTER_SVG_STRING,
            mainLawnPoints: MAIN_LAWN_MASTER_SVG_STRING,
            mainLawnCenter: MAIN_LAWN_MASTER_CENTER,
            onSelectPolygon: handleSelectPolygon
          }}
        />

        {/* ================================================================= */}
        {/* 3. FLOATING KML CONTROLS PANEL (Top-Left)                         */}
        {/* ================================================================= */}
        <div className="absolute top-4 left-4 z-30 w-76 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
          <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              KML Overlay Controls
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              GPS Synchronized
            </span>
          </div>

          <div className="p-3 space-y-2 text-xs">
            {/* Campus Boundary Layer */}
            <div
              onClick={() => setShowCampusBoundary(prev => !prev)}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                showCampusBoundary
                  ? 'bg-sky-950/40 border-sky-600/60 text-sky-200'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400 opacity-70'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    showCampusBoundary ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {showCampusBoundary && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Campus Boundary
                  </div>
                  <div className="text-[10px] text-slate-400">Blue dashed outline • 24 nodes</div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPolygon('campus_boundary');
                }}
                className="p-1 hover:text-white text-slate-400"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Main Lawn Layer */}
            <div
              onClick={() => setShowMainLawn(prev => !prev)}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                showMainLawn
                  ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400 opacity-70'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    showMainLawn ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {showMainLawn && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Main Lawn Area
                  </div>
                  <div className="text-[10px] text-slate-400">Green fill with border • 14 nodes</div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPolygon('main_lawn');
                }}
                className="p-1 hover:text-white text-slate-400"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. GEOMETRY INSPECTOR POPUP / MODAL                               */}
        {/* ================================================================= */}
        {showInfoModal && (
          <div className="absolute top-4 right-4 z-40 w-96 max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right duration-200 pointer-events-auto">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {selectedPolygonType === 'main_lawn' ? 'Main Lawn Geometry' : 'Campus Boundary Geometry'}
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
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
                  {selectedPolygonType === 'main_lawn' ? (
                    <>
                      <Trees className="w-4 h-4 text-emerald-400" />
                      Main Lawn
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-sky-400" />
                      Presidency University Campus Boundary
                    </>
                  )}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Source: <code className="text-cyan-300 font-mono">{activePolygonData.sourceFile}</code>
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Total GPS Nodes</span>
                  <span className="text-base font-bold text-white font-mono">
                    {activePolygonData.pointCount} points
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Polygon Closure</span>
                  <span className="text-xs font-bold text-emerald-400 font-sans flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Closed Ring
                  </span>
                </div>
              </div>

              {/* Geodesic metrics if Main Lawn */}
              {selectedPolygonType === 'main_lawn' && activePolygonData.metrics && (
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-[11px]">
                  <div className="font-semibold text-slate-300">Measured Geodesic Dimensions:</div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Total Area:</span>
                    <span className="font-mono font-bold text-emerald-300">
                      {activePolygonData.metrics.areaSqMeters.toLocaleString()} m² ({activePolygonData.metrics.areaAcres} acres)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Total Perimeter:</span>
                    <span className="font-mono font-bold text-sky-300">
                      {activePolygonData.metrics.perimeterMeters} m ({activePolygonData.metrics.perimeterKm} km)
                    </span>
                  </div>
                </div>
              )}

              {/* Complete Coordinate List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-300">
                    Exact Surveyed Coordinates ({activePolygonData.pointCount} nodes)
                  </span>
                  <button
                    onClick={handleCopyCoords}
                    className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
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
                <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/80 p-2 font-mono text-[10px] space-y-1 text-slate-300">
                  {activePolygonData.coordinates.map(([lat, lng], idx) => (
                    <div key={idx} className="flex justify-between py-0.5 border-b border-slate-800/50">
                      <span className="text-slate-500 font-bold">#{idx + 1}</span>
                      <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
