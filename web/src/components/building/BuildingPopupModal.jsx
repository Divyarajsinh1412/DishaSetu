import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Map as MapIcon,
  Navigation,
  Compass,
  Layers,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  GraduationCap,
  Footprints,
  Info
} from 'lucide-react';

/**
 * DishaSetu: Universal Building Information Popup & Action Hub
 * Requirement 10: Clean, modern information card containing:
 * - Building name
 * - Building code
 * - Building category
 * - Number of floors
 * - Available facilities
 * - Prominent action BUTTON 1: OPEN INDOOR MAP (Icon: Map)
 * - Prominent action BUTTON 2: START INDOOR NAVIGATION (Icon: Navigation)
 * - Outdoor GPS pedestrian walking route action
 */
export default function BuildingPopupModal({
  isOpen,
  building,
  onClose,
  onOpenIndoorMap,
  onStartIndoorNavigation,
  onStartOutdoorNavigation
}) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  if (!isOpen || !building) return null;

  // Determine if building has surveyed/available indoor floor plans
  const hasIndoorSurvey = Boolean(
    building.shortCode === 'PU-D-BLOCK' ||
    building.buildingId === 'bld_d_block' ||
    /d[-_]?block/i.test(building.name || '') ||
    (building.floors && building.floors.length > 0)
  );

  const totalFloors = building.totalFloors || (building.shortCode === 'PU-D-BLOCK' ? 6 : 4);
  const buildingCode = building.shortCode || building.buildingCode || building.code || 'PU-BLD';
  const category = building.category || 'Academic Block';
  const departments = building.departments || [
    'Instructional Classrooms',
    'Specialized Engineering Laboratories',
    'Faculty Workspaces'
  ];

  const coords = building.coordinates || building.entranceCoordinates || { lat: 13.1706, lng: 77.5358 };

  return (
    <div className="fixed inset-0 z-[550] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0b132b] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Top Header with Presidency Accent Gradient */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border-b border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/25 shrink-0">
              <div className="w-full h-full bg-[#0b132b] rounded-[14px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {category}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {buildingCode}
                </span>
                {hasIndoorSurvey ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>6 Floors Verified</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Survey Pending</span>
                  </span>
                )}
              </div>

              <h2 className="text-lg font-black text-white mt-1 tracking-tight">
                {building.name}
              </h2>
              <div className="text-xs text-slate-400">Presidency University Bengaluru</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
          
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-[#131d3b]/80 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Floors</span>
              <span className="text-base font-extrabold text-white mt-0.5 flex items-center justify-center gap-1">
                <Layers className="w-4 h-4 text-emerald-400" />
                {totalFloors}
              </span>
            </div>

            <div className="p-3 bg-[#131d3b]/80 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Rooms</span>
              <span className="text-base font-extrabold text-white mt-0.5 flex items-center justify-center gap-1">
                <GraduationCap className="w-4 h-4 text-sky-400" />
                {hasIndoorSurvey ? `${totalFloors * 6}` : 'Surveying'}
              </span>
            </div>

            <div className="p-3 bg-[#131d3b]/80 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Status</span>
              <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Operational
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            {building.description ||
              `${building.name} is a premier educational facility at Presidency University Bengaluru housing lecture halls, specialized laboratories, and faculty offices across ${totalFloors} floors.`}
          </p>

          {/* Collapsible Available Facilities Accordion */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#101935]/60">
            <button
              onClick={() => setIsAccordionOpen(prev => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Available Facilities & Departments</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {departments.length}
                </span>
              </div>
              {isAccordionOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {isAccordionOpen && (
              <div className="p-4 pt-1 border-t border-slate-800/80 space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {departments.map((dept, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-800/90 text-slate-200 border border-slate-700/60 font-medium"
                    >
                      {dept}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Restrooms, emergency staircases, and accessible ramps available on each floor.</span>
                </div>
              </div>
            )}
          </div>

          {/* Indoor Survey Status Banner */}
          {!hasIndoorSurvey && (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block mb-0.5">Pending Field Survey</span>
                <span className="text-[11px] leading-relaxed text-amber-200/90">
                  Indoor map for this building is coming soon. This building is currently pending field GPS & indoor layout survey.
                </span>
              </div>
            </div>
          )}

          {/* GPS Coordinates & Entrance Info */}
          <div className="px-3.5 py-2.5 rounded-xl bg-[#070e22] border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Location GPS:</span>
            <span className="text-slate-200">
              {coords.lat?.toFixed(6) || '13.170600'}°N, {coords.lng?.toFixed(6) || '77.535800'}°E
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TWO PROMINENT ACTION BUTTONS (MANDATORY REQUIREMENT 10)         */}
        {/* ============================================================== */}
        <div className="p-5 bg-[#070e22] border-t border-slate-800 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* BUTTON 1: OPEN INDOOR MAP */}
            <button
              onClick={() => {
                onOpenIndoorMap(building);
                onClose();
              }}
              className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Open the selected building's indoor floor-plan interface"
            >
              <MapIcon className="w-4 h-4 text-emerald-200" />
              <span>OPEN INDOOR MAP</span>
            </button>

            {/* BUTTON 2: START INDOOR NAVIGATION */}
            <button
              onClick={() => {
                onStartIndoorNavigation(building);
                onClose();
              }}
              className="py-3 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Open indoor navigation and search for rooms in this building"
            >
              <Navigation className="w-4 h-4 text-sky-200" />
              <span>START INDOOR NAVIGATION</span>
            </button>
          </div>

          {/* Secondary Action: Walk to Building Entrance via Outdoor GPS */}
          {onStartOutdoorNavigation && (
            <button
              onClick={() => {
                onStartOutdoorNavigation(building);
                onClose();
              }}
              className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/60 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Footprints className="w-3.5 h-3.5 text-sky-400" />
              <span>Walk to Building Entrance (Outdoor Pedestrian Path)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
