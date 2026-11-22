import React, { useState } from 'react';
import MasterCampusMap from '../maps/MasterCampusMap';
import {
  Trees,
  Navigation,
  Check,
  CheckCircle2,
  Maximize2,
  RotateCcw,
  Info,
  ArrowLeft,
  Copy,
  X,
  FileCode,
  Layers,
  Compass
} from 'lucide-react';
import {
  MAIN_LAWN_GEOMETRY,
  MAIN_GATE_TO_D_BLOCK_GEOMETRY
} from './campusGeometryRegistry';

export default function KmlMapDemo({ onExit }) {
  // Layer visibility toggles (Main Lawn + Main Gate → D Block)
  const [showMainLawn, setShowMainLawn] = useState(true);
  const [showMainGateToDBlock, setShowMainGateToDBlock] = useState(true);

  // Programmatic Viewport Fit State
  const [fitTarget, setFitTarget] = useState(null);
  const [fitKey, setFitKey] = useState(0);

  // Inspector modal state & active inspection target
  const [selectedGeometryId, setSelectedGeometryId] = useState('main_gate_to_d_block');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  const activeGeometry = selectedGeometryId === 'main_lawn'
    ? MAIN_LAWN_GEOMETRY
    : MAIN_GATE_TO_D_BLOCK_GEOMETRY;

  const handleTriggerFit = (target) => {
    setFitTarget(target);
    setFitKey(prev => prev + 1);
  };

  const handleOpenInspector = (id) => {
    setSelectedGeometryId(id);
    setShowInfoModal(true);
  };

  const handleCopyCoords = () => {
    const text = activeGeometry.coordinates
      .map(([lat, lng], idx) => `#${idx + 1}: ${lat.toFixed(8)}, ${lng.toFixed(8)}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  Presidency University — KML Demo Map
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-950/80 text-orange-300 border border-orange-700/60 uppercase tracking-wider">
                  2 Surveyed Layers Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Campus Master Map • Incremental Surveyed KML Geometry Verification
              </p>
            </div>
          </div>
        </div>

        {/* Quick Header Toggles & Inspector */}
        <div className="flex items-center gap-2">
          {/* Main Lawn Toggle */}
          <button
            onClick={() => setShowMainLawn(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 shadow-sm ${
              showMainLawn
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{showMainLawn ? 'Hide Main Lawn' : 'Show Main Lawn'}</span>
          </button>

          {/* Main Gate -> D Block Toggle */}
          <button
            onClick={() => setShowMainGateToDBlock(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 shadow-sm ${
              showMainGateToDBlock
                ? 'bg-orange-950/80 border-orange-600 text-orange-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span>{showMainGateToDBlock ? 'Hide Main Gate → D Block' : 'Show Main Gate → D Block'}</span>
          </button>

          {/* Inspector Button */}
          <button
            onClick={() => setShowInfoModal(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-xs font-semibold active:scale-95 shadow-sm"
          >
            <Info className="w-3.5 h-3.5 text-orange-400" />
            <span>Layer Info</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. BASE MAP: OFFICIAL CAMPUS MASTER MAP RENDERING SYSTEM            */}
      {/* =================================================================== */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <MasterCampusMap
          kmlOverlays={{
            showMainLawn,
            showMainGateToDBlock,
            showCampusBoundary: false,
            mainLawnPoints: MAIN_LAWN_GEOMETRY.svgPointsString,
            mainLawnCenter: MAIN_LAWN_GEOMETRY.svgCenter,
            mainGateToDBlockPoints: MAIN_GATE_TO_D_BLOCK_GEOMETRY.svgPointsString,
            mainGateToDBlockCenter: MAIN_GATE_TO_D_BLOCK_GEOMETRY.svgCenter,
            fitTarget,
            fitKey,
            onSelectPolygon: (id) => handleOpenInspector(id)
          }}
        />

        {/* ================================================================= */}
        {/* 3. FLOATING KML CONTROLS PANEL (Top-Left)                         */}
        {/* ================================================================= */}
        <div className="absolute top-4 left-4 z-30 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
          <div className="px-4 py-2.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-orange-400" />
              KML Demo Layers
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              2 Active Geometries
            </span>
          </div>

          <div className="p-3 space-y-2.5 text-xs">
            {/* Layer 1: Main Lawn */}
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
                    1. Main Lawn Area
                  </div>
                  <div className="text-[10px] text-slate-400">14 Surveyed GPS Nodes • 3.61 Acres</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenInspector('main_lawn');
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 ml-2"
              >
                Inspect
              </button>
            </div>

            {/* Layer 2: Main Gate -> D Block */}
            <div
              onClick={() => setShowMainGateToDBlock(prev => !prev)}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                showMainGateToDBlock
                  ? 'bg-orange-950/40 border-orange-600/60 text-orange-200'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400 opacity-70'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    showMainGateToDBlock ? 'bg-orange-500 border-orange-400 text-white' : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {showMainGateToDBlock && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    2. Main Gate → D Block
                  </div>
                  <div className="text-[10px] text-slate-400">100 Surveyed GPS Nodes • 0.765 km</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenInspector('main_gate_to_d_block');
                }}
                className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2 ml-2"
              >
                Inspect
              </button>
            </div>

            {/* Viewport Fit Controls Bar */}
            <div className="pt-1 border-t border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Map View &amp; Fit Presets
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleTriggerFit('main_lawn')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Trees className="w-3 h-3 text-emerald-400" />
                  <span>Fit Main Lawn</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerFit('main_gate_to_d_block')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-300 border border-slate-700 font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Navigation className="w-3 h-3 text-orange-400" />
                  <span>Fit Route</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerFit('all')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Maximize2 className="w-3 h-3 text-sky-400" />
                  <span>Fit All Geometries</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerFit('reset')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset View</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. GEOMETRY INSPECTOR POPUP / MODAL                               */}
        {/* ================================================================= */}
        {showInfoModal && (
          <div className="absolute top-4 right-4 z-40 w-96 max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right duration-200 pointer-events-auto">
            {/* Header & Tabs */}
            <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className={`w-4 h-4 ${selectedGeometryId === 'main_lawn' ? 'text-emerald-400' : 'text-orange-400'}`} />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Geometry Details
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Geometry Tab Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 border-b border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setSelectedGeometryId('main_lawn')}
                className={`py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedGeometryId === 'main_lawn'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Trees className="w-3.5 h-3.5" />
                <span>Main Lawn (14)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedGeometryId('main_gate_to_d_block')}
                className={`py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedGeometryId === 'main_gate_to_d_block'
                    ? 'bg-orange-950/80 text-orange-300 border border-orange-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Main Gate → D (100)</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {selectedGeometryId === 'main_lawn' ? (
                    <Trees className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Navigation className="w-4 h-4 text-orange-400" />
                  )}
                  {activeGeometry.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Source KML: <code className={`${selectedGeometryId === 'main_lawn' ? 'text-emerald-300' : 'text-orange-300'} font-mono`}>{activeGeometry.sourceFile}</code>
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Total Coordinates</span>
                  <span className="text-base font-bold text-white font-mono">
                    {activeGeometry.pointCount} points
                  </span>
                  <span className="text-[10px] text-slate-400 block">{activeGeometry.uniqueVertexCount} Unique Vertices</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Polygon Closure</span>
                  <span className={`text-xs font-bold ${selectedGeometryId === 'main_lawn' ? 'text-emerald-400' : 'text-orange-400'} font-sans flex items-center gap-1 mt-1`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Perfectly Closed
                  </span>
                  <span className="text-[10px] text-slate-400 block">Node #1 = Node #{activeGeometry.pointCount}</span>
                </div>
              </div>

              {/* Measured Metrics */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-[11px]">
                <div className="font-semibold text-slate-300">Measured Geodesic Dimensions:</div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Total Area:</span>
                  <span className={`font-mono font-bold ${selectedGeometryId === 'main_lawn' ? 'text-emerald-300' : 'text-orange-300'}`}>
                    {activeGeometry.metrics.areaSqMeters.toLocaleString()} m² ({activeGeometry.metrics.areaAcres} acres)
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Area (Square Feet):</span>
                  <span className="font-mono text-slate-300">
                    {Math.round(activeGeometry.metrics.areaSqFt).toLocaleString()} sq ft
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Total Perimeter:</span>
                  <span className="font-mono font-bold text-sky-300">
                    {activeGeometry.metrics.perimeterMeters} m ({activeGeometry.metrics.perimeterKm} km)
                  </span>
                </div>
              </div>

              {/* Complete Coordinate List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-300">
                    Exact Surveyed Coordinates ({activeGeometry.pointCount} nodes)
                  </span>
                  <button
                    onClick={handleCopyCoords}
                    className={`flex items-center gap-1 text-[10px] ${selectedGeometryId === 'main_lawn' ? 'text-emerald-400 hover:text-emerald-300' : 'text-orange-400 hover:text-orange-300'} transition-colors font-semibold`}
                  >
                    {copiedCoords ? (
                      <>
                        <Check className="w-3 h-3" />
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
                  {activeGeometry.coordinates.map(([lat, lng], idx) => (
                    <div key={idx} className="flex justify-between py-0.5 border-b border-slate-800/50">
                      <span className={`${selectedGeometryId === 'main_lawn' ? 'text-emerald-500' : 'text-orange-500'} font-bold`}>#{idx + 1}</span>
                      <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                      <span className="text-[9px] text-slate-500">
                        {idx === 0 ? 'Start' : idx === activeGeometry.pointCount - 1 ? 'Closure' : ''}
                      </span>
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
