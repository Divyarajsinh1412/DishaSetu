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
  ChevronRight,
  CornerUpRight
} from 'lucide-react';

export default function NavigationPanel({ route, onClose }) {
  if (!route) return null;

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      data-prevent-map-zoom="true"
      className="absolute top-20 left-3 sm:left-4 z-[420] w-[calc(100%-24px)] sm:w-96 bg-white dark:bg-[#202124] border border-slate-200/90 dark:border-slate-700/80 rounded-3xl shadow-gmap-card p-4 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-4 duration-300 select-none overscroll-contain isolate-scroll"
    >
      {/* Route Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
            <Footprints className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Walking Route</h3>
            <p className="text-[11px] text-slate-500">Presidency University Pedestrian Network</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Close directions panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Origin -> Destination summary */}
      <div className="mt-3 p-3 bg-slate-50 dark:bg-[#28292c] border border-slate-100 dark:border-slate-700/80 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-[#1e8e3e] flex items-center justify-center text-white text-[9px] font-bold">A</div>
          <span className="text-slate-500">From:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{route.startLocation?.name || 'Main Gate'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-[#d93025] flex items-center justify-center text-white text-[9px] font-bold">B</div>
          <span className="text-slate-500">To:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{route.endLocation?.name || 'Destination'}</span>
        </div>
      </div>

      {/* Metrics: Distance & Walking Time */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="p-2.5 bg-slate-50 dark:bg-[#28292c] border border-slate-100 dark:border-slate-700/80 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <Compass className="w-3 h-3 text-blue-600" /> Distance
          </div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{route.distanceMeters} m</div>
        </div>
        <div className="p-2.5 bg-slate-50 dark:bg-[#28292c] border border-slate-100 dark:border-slate-700/80 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-emerald-600" /> Walk Time
          </div>
          <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{route.estimatedWalkingMinutes} min</div>
        </div>
      </div>

      {/* Turn-by-turn steps */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Step-by-step turns ({route.waypoints?.length || 0})
        </div>
        <div
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          data-prevent-map-zoom="true"
          className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar overscroll-contain isolate-scroll"
        >
          {route.waypoints && route.waypoints.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
              <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="text-slate-800 dark:text-slate-200 leading-tight font-medium">{step.instruction}</div>
                {step.landmark && (
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Landmark: {step.landmark}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Finish Navigation Action */}
      <button
        type="button"
        onClick={onClose}
        className="w-full mt-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl transition-colors"
      >
        Close Route
      </button>
    </div>
  );
}
