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
  CornerUpRight,
  Copy,
  Wifi,
  Phone,
  Globe,
  Check
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

  const [copiedCoords, setCopiedCoords] = useState(false);

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

  const lat = location.coordinates?.lat || location.latitude || 13.1714;
  const lng = location.coordinates?.lng || location.longitude || 77.5361;

  const handleCopyCoords = () => {
    const text = `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: `${location.name} - Presidency University`,
      text: `Location: ${location.name} at Presidency University Bengaluru (${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)})`,
      url: window.location.href
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      handleCopyCoords();
    }
  };

  return (
    <aside
      role="dialog"
      aria-label="Location Details"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      data-prevent-map-zoom="true"
      className="absolute sm:top-24 sm:left-4 bottom-16 sm:bottom-auto left-2 right-2 sm:right-auto sm:w-[392px] max-h-[72vh] sm:max-h-[calc(100vh-120px)] flex flex-col bg-white dark:bg-[#202124] border border-slate-200/90 dark:border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-gmap-card overflow-hidden select-none animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-left-4 duration-200 overscroll-contain isolate-scroll z-[430]"
    >
      {/* Mobile Swipe Handle */}
      <div className="sm:hidden w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-2 shrink-0" />

      {/* Hero Photo / Graphic Banner */}
      <div className="relative h-32 sm:h-36 bg-gradient-to-tr from-[#1a73e8] via-[#0d47a1] to-[#002171] p-4 flex flex-col justify-between text-white shrink-0 overflow-hidden">
        {/* Subtle Decorative Campus Geometric Background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Top Badges & Close Actions */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-sm flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
            <span>Presidency Verified</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleSave}
              className="p-1.5 rounded-full bg-black/25 hover:bg-black/40 text-slate-200 hover:text-amber-300 transition-colors"
              title={isSaved ? 'Remove from Saved' : 'Save location'}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-white'}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/25 hover:bg-black/40 text-slate-200 hover:text-white transition-colors"
              title="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Place Title & Short Code */}
        <div className="relative z-10">
          <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-1 text-white">
            {location.name}
          </h2>
          <div className="text-[11px] text-blue-100 flex items-center gap-2 mt-0.5">
            <span>{location.category || 'Campus Location'}</span>
            {location.shortCode && (
              <>
                <span>•</span>
                <span className="font-mono font-bold bg-white/15 px-1.5 py-0.2 rounded text-[10px]">
                  {location.shortCode}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Google Maps 4-Action Circular Button Row */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-2 text-center bg-slate-50/50 dark:bg-[#28292c]">
        {/* 1. Directions */}
        <button
          type="button"
          onClick={() => {
            if (onStartNavigation) onStartNavigation(location);
          }}
          className="flex flex-col items-center gap-1 group active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center shadow-md transition-all group-hover:scale-105">
            <CornerUpRight className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#1a73e8] dark:text-[#8ab4f8]">Directions</span>
        </button>

        {/* 2. Start Walk */}
        <button
          type="button"
          onClick={() => {
            if (onStartNavigation) onStartNavigation(location);
          }}
          className="flex flex-col items-center gap-1 group active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#1e8e3e] hover:bg-[#167632] text-white flex items-center justify-center shadow-md transition-all group-hover:scale-105">
            <Navigation className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#1e8e3e] dark:text-[#81c995]">Start</span>
        </button>

        {/* 3. Indoor Floorplan (if building) or Survey */}
        {hasIndoor ? (
          <button
            type="button"
            onClick={() => {
              if (onOpenIndoorMap) onOpenIndoorMap(location);
              else if (onStartIndoorNavigation) onStartIndoorNavigation(location);
            }}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-[#8e24aa] hover:bg-[#7b1fa2] text-white flex items-center justify-center shadow-md transition-all group-hover:scale-105">
              <DoorOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#8e24aa] dark:text-[#ce93d8]">Indoor</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleSave}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-white dark:bg-[#303134] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-sm transition-all group-hover:scale-105">
              <Star className={`w-5 h-5 ${isSaved ? 'text-amber-500 fill-amber-500' : 'text-slate-600 dark:text-slate-300'}`} />
            </div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        )}

        {/* 4. Share / Copy */}
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-col items-center gap-1 group active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-white dark:bg-[#303134] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-sm transition-all group-hover:scale-105">
            <Share2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Share</span>
        </button>
      </div>

      {/* Scrollable Information Body (Google Maps Style List) */}
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        data-prevent-map-zoom="true"
        className="p-4 overflow-y-auto space-y-3.5 text-xs text-slate-700 dark:text-slate-300 custom-scrollbar overscroll-contain isolate-scroll"
      >
        
        {/* Description */}
        {location.description && (
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {location.description}
          </p>
        )}

        {/* Hours / Status Row */}
        <div className="flex items-center gap-3 py-1.5 border-t border-slate-100 dark:border-slate-800">
          <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Open Now</span>
            <span className="text-slate-500 dark:text-slate-400"> · 8:00 AM – 6:00 PM (Mon–Sat)</span>
          </div>
        </div>

        {/* Address / Campus Zone Row */}
        <div className="flex items-center gap-3 py-1.5 border-t border-slate-100 dark:border-slate-800">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Presidency University Campus</div>
            <div className="text-[11px] text-slate-500">Itgalpur, Rajankunte, Bengaluru, Karnataka 560064</div>
          </div>
        </div>

        {/* GPS Coordinates with 1-Click Copy */}
        <div className="flex items-center justify-between py-1.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Compass className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">GPS Coordinates</div>
              <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyCoords}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors"
            title="Copy Coordinates"
          >
            {copiedCoords ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Accessibility Row */}
        <div className="flex items-center gap-3 py-1.5 border-t border-slate-100 dark:border-slate-800 text-emerald-700 dark:text-emerald-300">
          <Accessibility className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-[11px]">
            Wheelchair-accessible entrance & level pedestrian pathways
          </span>
        </div>

        {/* WiFi Row */}
        <div className="flex items-center gap-3 py-1.5 border-t border-slate-100 dark:border-slate-800">
          <Wifi className="w-4 h-4 text-sky-500 shrink-0" />
          <span className="text-[11px] text-slate-600 dark:text-slate-400">
            University High-Speed Wi-Fi Zone
          </span>
        </div>

        {/* Floor Level & Room Info (if present) */}
        {(location.totalFloors || location.roomNumber || location.department) && (
          <div className="p-3 bg-slate-50 dark:bg-[#28292c] rounded-2xl border border-slate-100 dark:border-slate-700/80 space-y-2">
            {location.totalFloors && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Building Levels:</span>
                <span className="font-bold text-slate-800 dark:text-white">{location.totalFloors} Floors</span>
              </div>
            )}
            {location.roomNumber && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Room / Door:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{location.roomNumber}</span>
              </div>
            )}
            {location.department && (
              <div className="text-xs">
                <span className="text-slate-500 block">Department:</span>
                <span className="font-bold text-slate-800 dark:text-white">{location.department}</span>
              </div>
            )}
          </div>
        )}

        {/* Indoor Navigation Button (if available) */}
        {hasIndoor && (
          <button
            type="button"
            onClick={() => {
              if (onOpenIndoorMap) onOpenIndoorMap(location);
              else if (onStartIndoorNavigation) onStartIndoorNavigation(location);
            }}
            className="w-full py-2.5 px-4 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-2xl border border-purple-200 dark:border-purple-800 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <DoorOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Open D Block Multi-Floor Floorplan</span>
          </button>
        )}

        {/* Admin Survey Option (if provided) */}
        {onOpenIndoorSurvey && (
          <button
            type="button"
            onClick={() => onOpenIndoorSurvey(location)}
            className="w-full py-2 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] rounded-xl border border-emerald-300 dark:border-emerald-700 flex items-center justify-center gap-1.5 transition-all"
          >
            <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
            <span>Survey & Capture GPS Coordinates</span>
          </button>
        )}
      </div>
    </aside>
  );
}
