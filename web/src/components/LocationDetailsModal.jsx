import React, { useState } from 'react';
import {
  X,
  MapPin,
  Navigation as NavigationIcon,
  Compass,
  CheckCircle2,
  Clock,
  Share2,
  Layers,
  Star
} from 'lucide-react';

export default function LocationDetailsModal({
  location,
  onClose,
  onStartNavigation,
  onOpenIndoorMap,
  onStartIndoorNavigation
}) {
  if (!location) return null;

  const isBuilding = location.category === 'Academic' ||
                     location.category === 'Building' ||
                     location.category === 'Library' ||
                     location.shortCode?.includes('BLOCK') ||
                     location.name?.includes('Block') ||
                     location.buildingId;

  const locId = location.locationId || location._id || location.shortCode;
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const stored = localStorage.getItem('dishasetu_saved_places');
      return stored ? JSON.parse(stored).includes(locId) : false;
    } catch {
      return false;
    }
  });

  const toggleSave = () => {
    try {
      const stored = localStorage.getItem('dishasetu_saved_places');
      let arr = stored ? JSON.parse(stored) : [];
      if (arr.includes(locId)) {
        arr = arr.filter(id => id !== locId);
        setIsSaved(false);
      } else {
        arr.push(locId);
        setIsSaved(true);
      }
      localStorage.setItem('dishasetu_saved_places', JSON.stringify(arr));
    } catch {}
  };

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      data-prevent-map-zoom="true"
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        data-prevent-map-zoom="true"
        className="w-full max-w-md bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 overscroll-contain isolate-scroll"
      >
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
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleSave}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              title={isSaved ? 'Bookmarked' : 'Bookmark this location'}
            >
              <Star className={`w-5 h-5 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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

        {/* Modal Footer Actions: Requirement 10 Buttons */}
        <div className="p-4 bg-[#0b132b] border-t border-slate-800 space-y-2">
          {isBuilding && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (onOpenIndoorMap) onOpenIndoorMap(location);
                  onClose();
                }}
                className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.02]"
                title="BUTTON 1: Open Indoor Map"
              >
                <Layers className="w-4 h-4" /> Open Indoor Map
              </button>

              <button
                onClick={() => {
                  if (onStartIndoorNavigation) onStartIndoorNavigation(location);
                  onClose();
                }}
                className="py-2.5 px-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.02]"
                title="BUTTON 2: Start Indoor Navigation"
              >
                <NavigationIcon className="w-4 h-4" /> Start Indoor Nav
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onStartNavigation(location);
                onClose();
              }}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <NavigationIcon className="w-3.5 h-3.5 text-sky-400" /> Walk via GPS
            </button>
            <button
              onClick={onClose}
              className="py-2 px-4 bg-slate-850 hover:bg-slate-800 text-slate-400 font-semibold text-xs rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
