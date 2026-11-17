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
  Trees
} from 'lucide-react';

export default function Header({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategorySelect,
  onOpenSOS,
  onOpenAdmin,
  locations = []
}) {
  const categories = [
    { id: 'all', label: 'All Places', icon: MapPin },
    { id: 'Gate', label: 'Gates & Entrances', icon: Compass },
    { id: 'Academic', label: 'Academic Blocks', icon: Building2 },
    { id: 'Parking', label: 'Parking Lots', icon: Car },
    { id: 'Garden', label: 'Gardens & Lawns', icon: Trees },
    { id: 'Landmark', label: 'Landmarks', icon: Compass }
  ];

  return (
    <header className="h-16 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 z-30 px-4 flex items-center justify-between gap-4 shrink-0 shadow-lg">
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
            placeholder="Search campus building, gate, department, classroom or facility..."
            className="w-full pl-10 pr-4 py-2 bg-[#1e293b]/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
          />
        </div>
      </div>

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
    </header>
  );
}
