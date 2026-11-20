import React, { useState } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  Clock,
  Star,
  Layers,
  Building2,
  Coffee,
  HeartPulse,
  BookOpen,
  Car,
  Trophy,
  Trees,
  DoorOpen,
  Accessibility,
  Share2,
  LocateFixed,
  ArrowRight
} from 'lucide-react';

export default function PlaceDetailsCard({
  location,
  onClose,
  onStartNavigation,
  onOpenIndoorMap,
  onStartIndoorNavigation,
  onOpenIndoorSurvey
}) {
  if (!location) return null;

  const locId = location.locationId || location._id || location.shortCode || location.code;
  const isBuilding =
    location.category === 'Academic' ||
    location.category === 'Building' ||
    location.category === 'Library' ||
    location.shortCode?.includes('BLOCK') ||
    location.name?.includes('Block') ||
    location.buildingId;

  const hasIndoor = Boolean(
    location.hasIndoorMap ||
    location.shortCode === 'PU-D-BLOCK' ||
    /d[-_]?block/i.test(location.name || '') ||
    location.roomNumber
  );

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

  const getCategoryColor = (cat = '') => {
    const c = cat.toLowerCase();
    if (c.includes('academic') || c.includes('building')) return 'bg-blue-600 text-white';
    if (c.includes('cafe') || c.includes('food')) return 'bg-amber-600 text-white';
    if (c.includes('library')) return 'bg-sky-600 text-white';
    if (c.includes('medical')) return 'bg-rose-600 text-white';
    if (c.includes('gate')) return 'bg-emerald-600 text-white';
    if (c.includes('parking')) return 'bg-orange-600 text-white';
    if (c.includes('sport')) return 'bg-yellow-600 text-white';
    if (c.includes('garden')) return 'bg-green-600 text-white';
    return 'bg-indigo-600 text-white';
  };

  return (
    <aside
      role="dialog"
      aria-label="Location Details"
      className="absolute top-20 sm:top-24 left-3 sm:left-4 z-[450] w-[calc(100%-24px)] sm:w-96 max-h-[calc(100vh-160px)] sm:max-h-[calc(100vh-130px)] flex flex-col bg-white dark:bg-[#0b1728] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden select-none animate-in fade-in slide-in-from-left-4 duration-200"
    >
      {/* Top Hero Banner */}
      <div className="relative h-28 bg-gradient-to-br from-[#1e3a8a] via-[#0f294d] to-[#0a192f] p-4 flex flex-col justify-between text-white shrink-0">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getCategoryColor(location.category)} shadow-sm`}>
            {location.category || 'Campus Location'}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleSave}
              className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-slate-200 hover:text-amber-400 transition-colors"
              title={isSaved ? 'Bookmarked in Saved Places' : 'Save this location'}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-slate-200 hover:text-white transition-colors"
              title="Close card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-1 text-white">
            {location.name}
          </h2>
          {location.shortCode && (
            <div className="text-[11px] font-mono text-sky-300 font-semibold mt-0.5">
              Code: {location.shortCode}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Information Body */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 custom-scrollbar">
        {/* Description */}
        {location.description && (
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              About Location
            </div>
            <p className="leading-relaxed text-slate-700 dark:text-slate-200 text-xs">
              {location.description}
            </p>
          </div>
        )}

        {/* Location Attributes Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-[#06111f] rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold">Campus Zone</div>
            <div className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
              Presidency University
            </div>
          </div>
          {location.totalFloors && (
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">Floors</div>
              <div className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                {location.totalFloors} Floor Levels
              </div>
            </div>
          )}
          {location.roomNumber && (
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">Room / Door</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {location.roomNumber}
              </div>
            </div>
          )}
          {location.department && (
            <div className="col-span-2">
              <div className="text-[10px] text-slate-400 font-semibold">Department</div>
              <div className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 truncate">
                {location.department}
              </div>
            </div>
          )}
        </div>

        {/* Wheelchair Accessibility Badge */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
          <Accessibility className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-[11px] font-semibold">
            Wheelchair Accessible & Level Pedestrian Entrance
          </span>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 space-y-2">
          {/* 1. Navigate / Directions (Prominent Blue Button) */}
          <button
            type="button"
            onClick={() => {
              if (onStartNavigation) onStartNavigation(location);
            }}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
          >
            <Navigation className="w-4 h-4" />
            <span>Directions / Navigate Here</span>
          </button>

          {/* 2. Indoor Floor Map (if available) */}
          {hasIndoor && (
            <button
              type="button"
              onClick={() => {
                if (onOpenIndoorMap) onOpenIndoorMap(location);
                else if (onStartIndoorNavigation) onStartIndoorNavigation(location);
              }}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <DoorOpen className="w-4 h-4 text-emerald-500" />
              <span>Explore Indoor Floor Plan</span>
            </button>
          )}

          {/* 3. Admin Survey GPS (if callback provided) */}
          {onOpenIndoorSurvey && (
            <button
              type="button"
              onClick={() => onOpenIndoorSurvey(location)}
              className="w-full py-2 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] rounded-xl border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center gap-1.5 transition-all"
            >
              <LocateFixed className="w-3.5 h-3.5 text-emerald-500" />
              <span>Survey & Capture Room Coordinates</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
