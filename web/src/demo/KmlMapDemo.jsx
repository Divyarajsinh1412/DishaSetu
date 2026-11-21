import React, { useState } from 'react';
import MasterCampusMap from '../maps/MasterCampusMap';
import {
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
import { MAIN_LAWN_GEOMETRY } from './campusGeometryRegistry';

export default function KmlMapDemo({ onExit }) {
  // Main Lawn visibility toggle
  const [showMainLawn, setShowMainLawn] = useState(true);

  // Inspector modal state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  const handleCopyCoords = () => {
    const text = MAIN_LAWN_GEOMETRY.coordinates
      .map(([lat, lng], idx) => `#${idx + 1}: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Trees className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  Main Lawn Demo — Campus Master Map
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 uppercase tracking-wider">
                  KML Verified (Main Lawn Only)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Presidency University Bengaluru • Authoritative 14-Node GPS Polygon Preview
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Main Lawn Visibility Toggle */}
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

          {/* Polygon Information Button */}
          <button
            onClick={() => setShowInfoModal(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-xs font-semibold active:scale-95 shadow-sm"
          >
            <Info className="w-3.5 h-3.5 text-emerald-400" />
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
            showMainLawn,
            showCampusBoundary: false, // Explicitly disabled: Main Lawn ONLY
            mainLawnPoints: MAIN_LAWN_GEOMETRY.svgPointsString,
            mainLawnCenter: MAIN_LAWN_GEOMETRY.svgCenter,
            onSelectPolygon: () => setShowInfoModal(true)
          }}
        />

        {/* ================================================================= */}
        {/* 3. FLOATING MAIN LAWN CONTROLS PANEL (Top-Left)                   */}
        {/* ================================================================= */}
        <div className="absolute top-4 left-4 z-30 w-76 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
          <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Trees className="w-4 h-4 text-emerald-400" />
              Main Lawn Controls
            </span>
            <button
              onClick={() => setShowInfoModal(true)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2"
            >
              Details
            </button>
          </div>

          <div className="p-3 space-y-2.5 text-xs">
            {/* Visibility Toggle Item */}
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
                  <div className="text-[10px] text-slate-400">14 Surveyed GPS Nodes • Closed Ring</div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Geodesic Area</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">14,596 m²</span>
                <span className="text-[10px] text-slate-400 block">3.61 Acres</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Perimeter</span>
                <span className="text-sm font-bold text-sky-400 font-mono">665.2 m</span>
                <span className="text-[10px] text-slate-400 block">0.665 km boundary</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. MAIN LAWN GEOMETRY INSPECTOR POPUP / MODAL                     */}
        {/* ================================================================= */}
        {showInfoModal && (
          <div className="absolute top-4 right-4 z-40 w-96 max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right duration-200 pointer-events-auto">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Main Lawn Geometry Details
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
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trees className="w-4 h-4 text-emerald-400" />
                  Main Lawn
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Source: <code className="text-emerald-300 font-mono">{MAIN_LAWN_GEOMETRY.sourceFile}</code>
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Total Coordinates</span>
                  <span className="text-base font-bold text-white font-mono">
                    {MAIN_LAWN_GEOMETRY.pointCount} points
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

              {/* Measured Metrics */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-[11px]">
                <div className="font-semibold text-slate-300">Measured Geodesic Dimensions:</div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Total Area:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {MAIN_LAWN_GEOMETRY.metrics.areaSqMeters.toLocaleString()} m² ({MAIN_LAWN_GEOMETRY.metrics.areaAcres} acres)
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Area (Square Feet):</span>
                  <span className="font-mono text-slate-300">
                    {Math.round(MAIN_LAWN_GEOMETRY.metrics.areaSqFt).toLocaleString()} sq ft
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Total Perimeter:</span>
                  <span className="font-mono font-bold text-sky-300">
                    {MAIN_LAWN_GEOMETRY.metrics.perimeterMeters} m ({MAIN_LAWN_GEOMETRY.metrics.perimeterKm} km)
                  </span>
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
                  {MAIN_LAWN_GEOMETRY.coordinates.map(([lat, lng], idx) => (
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
