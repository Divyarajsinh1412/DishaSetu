import React from 'react';
import {
  Navigation,
  X,
  Compass,
  Footprints,
  Clock,
  ArrowRight,
  CheckCircle2,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function NavigationPanel({ route, onClose }) {
  if (!route) return null;

  return (
    <div className="absolute top-20 left-4 z-[400] w-80 sm:w-96 bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Route Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Footprints className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Walking Directions</h3>
            <p className="text-[11px] text-slate-400">Presidency University Pedestrian Path</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Origin -> Destination summary */}
      <div className="mt-3 p-3 bg-[#1e293b]/70 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-950"></div>
          <span className="text-slate-400">From:</span>
          <span className="font-semibold text-white truncate">{route.startLocation?.name || 'Main Gate'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-sky-950"></div>
          <span className="text-slate-400">To:</span>
          <span className="font-semibold text-white truncate">{route.endLocation?.name || 'Destination'}</span>
        </div>
      </div>

      {/* Metrics: Distance & Walking Time */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="p-2.5 bg-[#1e293b]/50 border border-slate-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <Compass className="w-3 h-3 text-sky-400" /> Total Distance
          </div>
          <div className="text-lg font-extrabold text-white mt-0.5">{route.distanceMeters} m</div>
        </div>
        <div className="p-2.5 bg-[#1e293b]/50 border border-slate-800 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" /> Est. Walk Time
          </div>
          <div className="text-lg font-extrabold text-white mt-0.5">{route.estimatedWalkingMinutes} min</div>
        </div>
      </div>

      {/* Step by step directions */}
      <div className="mt-3 pt-3 border-t border-slate-800/80">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Turn-by-turn Walking Guide
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {route.waypoints && route.waypoints.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-sky-400 border border-blue-500/30 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="text-slate-200 leading-tight">{step.instruction}</div>
                {step.landmark && (
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Landmark: {step.landmark}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* End Navigation Action */}
      <button
        onClick={onClose}
        className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-700"
      >
        Finish Navigation
      </button>
    </div>
  );
}
