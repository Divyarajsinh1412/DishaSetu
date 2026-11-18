import React from 'react';
import {
  Compass,
  Search,
  AlertTriangle,
  LogIn,
  Shield,
  Layers,
  MapPin,
  Building2,
  Car,
  Trees,
  Coffee,
  HeartPulse,
  BookOpen,
  Trophy,
  Globe,
  Map,
  Crosshair,
  Box
} from 'lucide-react';

export default function Header({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategorySelect,
  onOpenSOS,
  onOpenAdmin,
  onOpenSurvey,
  onOpenIndoor,
  locations = [],
  viewMode = 'immersive',
  onViewModeChange
}) {
  const categories = [
    { id: 'all', label: 'All', icon: MapPin },
    { id: 'Gate', label: 'Gates', icon: Compass },
    { id: 'Academic', label: 'Academic', icon: Building2 },
    { id: 'Cafe', label: 'Food & Cafes', icon: Coffee },
    { id: 'Medical', label: 'Medical', icon: HeartPulse },
    { id: 'Library', label: 'Library', icon: BookOpen },
    { id: 'Parking', label: 'Parking', icon: Car },
    { id: 'Sports', label: 'Sports', icon: Trophy },
    { id: 'Garden', label: 'Gardens', icon: Trees },
    { id: 'Landmark', label: 'Landmarks', icon: Compass }
  ];

  return (
    <header className="bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 z-30 shrink-0 shadow-lg">
      <div className="h-16 px-4 flex items-center justify-between gap-4">
        {/* Brand & University Identifier */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b132b] rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">DishaSetu</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-400 border border-blue-500/30">
                Campus GIS
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Presidency University Bengaluru
            </div>
          </div>
        </div>

        {/* Central Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search building, department, classroom, cafeteria, gate..."
              className="w-full pl-10 pr-4 py-2 bg-[#1e293b]/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* View Mode Switcher Pill */}
        <div className="flex items-center p-1 bg-[#1e293b]/90 border border-slate-700/80 rounded-xl shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">3D Campus</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('immersive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'immersive'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">360° Aerial</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">2D GPS Map</span>
          </button>
        </div>

        {/* SECTION 15: Dedicated START CAMPUS SURVEY Trigger */}
        <button
          onClick={onOpenSurvey}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/20 border border-amber-300 transition-all hover:scale-105 active:scale-95 shrink-0"
          title="Open Guided GPS Field Survey Checklist"
        >
          <Crosshair className="w-3.5 h-3.5 text-slate-950 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="hidden xl:inline">START CAMPUS SURVEY</span>
          <span className="xl:hidden">SURVEY</span>
        </button>

        {/* Action Buttons: SOS & Admin Portal */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Emergency SOS Button */}
          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-900/30 border border-rose-500/30 transition-all hover:scale-105 active:scale-95 animate-pulse"
          >
            <AlertTriangle className="w-4 h-4 text-white" />
            <span className="hidden md:inline">Campus SOS</span>
          </button>

          {/* Admin Portal Button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Shield className="w-4 h-4 text-sky-400" />
            <span className="hidden lg:inline">Admin Portal</span>
          </button>
        </div>
      </div>

      {/* Quick Category Chips Bar */}
      <div className="px-4 py-1.5 bg-[#0b132b]/80 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm'
                  : 'bg-[#1e293b]/60 text-slate-400 hover:text-slate-200 hover:bg-[#1e293b] border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
