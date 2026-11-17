import React from 'react';
import {
  X,
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  Clock,
  Share2,
  Layers
} from 'lucide-react';

export default function LocationDetailsModal({
  location,
  onClose,
  onStartNavigation
}) {
  if (!location) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-sky-400 border border-blue-500/30">
                {location.category}
              </span>
              <h2 className="font-bold text-base text-white mt-1 leading-snug">{location.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-sm text-slate-300">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Description
            </div>
            <p className="leading-relaxed text-slate-200">{location.description}</p>
          </div>

          <div className="p-3 bg-[#1e293b]/70 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Presidency Code:</span>
              <span className="font-mono font-bold text-sky-400">{location.shortCode || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">GPS Coordinates:</span>
              <span className="font-mono text-slate-200">
                {location.coordinates?.lat?.toFixed(6)}, {location.coordinates?.lng?.toFixed(6)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Survey Status:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Ground Feature
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#0b132b] border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={() => {
              onStartNavigation(location);
              onClose();
            }}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Navigation className="w-4 h-4" /> Start Walking Route
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
