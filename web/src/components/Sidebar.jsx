import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Building2,
  Navigation as NavigationIcon,
  Car,
  Trees,
  Droplets,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Coffee,
  HeartPulse,
  Trophy,
  HelpCircle,
  Accessibility,
  ArrowRight,
  Footprints,
  RotateCcw,
  Zap,
  Star,
  Layers,
  X
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onToggle,
  locations = [],
  buildings = [],
  departments = [],
  features = [],
  selectedLocation,
  onSelectLocation,
  onStartNavigation,
  onCalculateRoute,
  onOpenIndoor,
  onOpenBuildingPopup,
  onOpenIndoorMap,
  onStartIndoorNavigation,
  userLocation,
  catalog = [],
  activeTab: controlledTab,
  onTabChange
}) {
  const [internalTab, setInternalTab] = useState('places');
  const activeTab = controlledTab || internalTab;
  const setActiveTab = onTabChange || setInternalTab;
  const [savedPlaces, setSavedPlaces] = useState(() => {
    try {
      const stored = localStorage.getItem('dishasetu_saved_places');
      return stored ? JSON.parse(stored) : ['loc_main_gate', 'loc_library', 'loc_cafeteria'];
    } catch {
      return ['loc_main_gate'];
    }
  });

  const toggleSavePlace = (placeId) => {
    setSavedPlaces(prev => {
      const next = prev.includes(placeId) ? prev.filter(id => id !== placeId) : [...prev, placeId];
      try {
        localStorage.setItem('dishasetu_saved_places', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Helper to map category to icon & color
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Gate': return { Icon: Compass, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' };
      case 'Academic': return { Icon: Building2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' };
      case 'Cafe': return { Icon: Coffee, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' };
      case 'Medical': return { Icon: HeartPulse, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40' };
      case 'Library': return { Icon: BookOpen, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/40' };
      case 'Sports': return { Icon: Trophy, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/40' };
      case 'Parking': return { Icon: Car, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40' };
      case 'Garden': return { Icon: Trees, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40' };
      case 'Landmark': return { Icon: Droplets, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/40' };
      default: return { Icon: MapPin, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' };
    }
  };

  // Directions Form State
  const [startPoint, setStartPoint] = useState('node_main_gate');
  const [destPoint, setDestPoint] = useState('node_d_block_ent');
  const [accessibleOnly, setAccessibleOnly] = useState(false);

  // Popular Pre-tested Routes for Presidency University
  const popularRoutes = [
    { name: 'Main Gate → D Block (Mech/Civil)', start: 'node_main_gate', dest: 'node_d_block_ent' },
    { name: 'Main Gate → Central Library', start: 'node_main_gate', dest: 'node_library_ent' },
    { name: 'Main Gate → Central Cafeteria', start: 'node_main_gate', dest: 'node_cafeteria_ent' },
    { name: 'Main Gate → Auditorium Grand Foyer', start: 'node_main_gate', dest: 'node_auditorium_ent' },
    { name: 'Two-Wheeler Parking → E Block (CSE)', start: 'node_parking_entry', dest: 'node_e_block_ent' },
    { name: 'D Block → Basketball Court', start: 'node_d_block_ent', dest: 'node_basketball_court' }
  ];

  const handleRunDirections = (start = startPoint, dest = destPoint, accessible = accessibleOnly) => {
    if (onCalculateRoute) {
      onCalculateRoute({
        start: start === 'current_location' && userLocation ? userLocation : start,
        destination: dest,
        accessibleOnly: accessible,
        startCoords: start === 'current_location' ? userLocation : null
      });
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay when sidebar is open */}
      {isOpen && (
        <div
          onClick={onToggle}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          data-prevent-map-zoom="true"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        data-prevent-map-zoom="true"
        className={`fixed md:relative top-0 bottom-0 left-0 z-40 md:z-20 flex flex-col bg-white dark:bg-[#202124] text-slate-800 dark:text-slate-100 border-r border-slate-200/90 dark:border-slate-800 transition-all duration-300 ease-in-out overscroll-contain isolate-scroll ${
          isOpen ? 'w-[88vw] sm:w-96 md:w-80 lg:w-96 shadow-2xl md:shadow-none' : 'w-0 pointer-events-none md:pointer-events-auto'
        } overflow-hidden shrink-0 h-full`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" /> Campus Directory
            </h2>
            <p className="text-[11px] text-slate-500">Presidency University Bengaluru</p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Close Drawer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Google Maps Tabs */}
        <div className="p-2 border-b border-slate-100 dark:border-slate-800 grid grid-cols-5 gap-1 bg-slate-50 dark:bg-[#28292c]">
          <button
            type="button"
            onClick={() => setActiveTab('places')}
            className={`py-1.5 text-[11px] font-bold rounded-xl transition-all ${
              activeTab === 'places'
                ? 'bg-[#1a73e8] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Places
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('buildings')}
            className={`py-1.5 text-[11px] font-bold rounded-xl transition-all ${
              activeTab === 'buildings'
                ? 'bg-[#1a73e8] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Blocks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('departments')}
            className={`py-1.5 text-[11px] font-bold rounded-xl transition-all ${
              activeTab === 'departments'
                ? 'bg-[#1a73e8] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Depts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('directions')}
            className={`py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'directions'
                ? 'bg-[#1a73e8] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <NavigationIcon className="w-3 h-3" /> Route
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'saved'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className="w-3 h-3" /> Saved
          </button>
        </div>

        {/* Content List */}
        <div
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          data-prevent-map-zoom="true"
          className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar overscroll-contain isolate-scroll"
        >
          {/* TAB 4: DIRECTIONS */}
          {activeTab === 'directions' && (
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Plan Walking Directions
              </div>

              {/* Origin & Destination Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-[#28292c] border border-slate-100 dark:border-slate-700/80 rounded-2xl space-y-3">
                {/* Origin */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1e8e3e]"></div> Start Point
                  </label>
                  <select
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="w-full bg-white dark:bg-[#202124] border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {userLocation && (
                      <option value="current_location">📍 My Live GPS Location</option>
                    )}
                    <option value="node_main_gate">🚪 Main Gate (Official Entrance)</option>
                    <option value="node_parking_entry">🛵 Two-Wheeler Parking Entrance</option>
                    <option value="node_gate_2">🚗 Gate 2 (Bus Bay & South Gate)</option>
                    <option value="node_avenue_origin">🏛️ Central Walking Avenue Origin</option>
                    <option value="node_fountain_plaza">⛲ Central Fountain Plaza</option>
                    <option value="node_d_block_ent">🏫 D Block Entrance</option>
                    <option value="node_e_block_ent">🏫 E Block (CSE) Entrance</option>
                    <option value="node_library_ent">📚 Central University Library</option>
                    <option value="node_cafeteria_ent">☕ Central Cafeteria</option>
                  </select>
                </div>

                {/* Destination */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#d93025]"></div> Destination
                  </label>
                  <select
                    value={destPoint}
                    onChange={(e) => setDestPoint(e.target.value)}
                    className="w-full bg-white dark:bg-[#202124] border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="node_d_block_ent">🏫 D Block (Mechanical & Civil)</option>
                    <option value="node_e_block_ent">🏫 E Block (Computer Science CSE)</option>
                    <option value="node_f_block_ent">🏫 F Block (EEE Laboratories)</option>
                    <option value="node_h_block_ent">🏫 H Block (Admissions Office & Reception)</option>
                    <option value="node_j_block_ent">🏫 J Block (School of Management)</option>
                    <option value="node_k_block_ent">🏫 K Block (AI/ML & Data Science)</option>
                    <option value="node_l_block_ent">🏫 L Block (School of Law)</option>
                    <option value="node_n_block_ent">🏫 N Block (Basic Sciences)</option>
                    <option value="node_library_ent">📚 Central University Library</option>
                    <option value="node_cafeteria_ent">☕ Central Cafeteria & Garden Terrace</option>
                    <option value="node_food_court_ent">🍔 Campus Food Court Plaza</option>
                    <option value="node_auditorium_ent">🎭 Auditorium Grand Foyer</option>
                    <option value="node_medical_ent">🏥 Health & Medical Centre</option>
                    <option value="node_fountain_plaza">⛲ Central Fountain Plaza</option>
                    <option value="node_basketball_court">🏀 Basketball Court</option>
                    <option value="node_gym_ent">🏋️ University Gymnasium</option>
                    <option value="node_oat_ent">🏟️ Open Air Theatre (O.A.T)</option>
                    <option value="node_parking_entry">🛵 Two-Wheeler Parking Area</option>
                    <option value="node_gate_2">🚗 Gate 2 & Bus Bay Terminal</option>
                  </select>
                </div>

                {/* Accessible Only Checkbox */}
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={accessibleOnly}
                    onChange={(e) => setAccessibleOnly(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Accessibility className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Step-Free Accessible Route</span>
                </label>

                {/* Calculate Button */}
                <button
                  type="button"
                  onClick={() => handleRunDirections()}
                  className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <NavigationIcon className="w-4 h-4" /> Get Walking Directions
                </button>
              </div>

              {/* Popular Route Shortcuts */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick Popular Routes
                </div>
                <div className="space-y-1.5">
                  {popularRoutes.map((rt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setStartPoint(rt.start);
                        setDestPoint(rt.dest);
                        handleRunDirections(rt.start, rt.dest, accessibleOnly);
                      }}
                      className="w-full text-left p-2.5 rounded-2xl bg-slate-50 dark:bg-[#28292c] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/80 transition-all flex items-center justify-between group"
                    >
                      <div className="text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-semibold">
                        {rt.name}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PLACES */}
          {activeTab === 'places' && (
            <>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-1">
                Presidency Points of Interest ({locations.length})
              </div>

              {locations.map((loc) => {
                const { Icon, color: iconColor, bg: iconBg } = getCategoryIcon(loc.category);
                const locId = loc.locationId || loc._id || loc.shortCode;
                const isSaved = savedPlaces.includes(locId);

                return (
                  <div
                    key={loc._id || loc.shortCode}
                    onClick={() => onSelectLocation && onSelectLocation(loc)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedLocation?._id === loc._id
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 shadow-md'
                        : 'bg-slate-50/70 dark:bg-[#28292c] border-slate-100 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className={`w-4 h-4 ${iconColor}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">{loc.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-500 font-mono">{loc.shortCode}</span>
                            <span className="text-[10px] text-slate-400">&bull;</span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{loc.category}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSavePlace(locId);
                        }}
                        className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                        title={isSaved ? 'Remove bookmark' : 'Bookmark location'}
                      >
                        <Star className={`w-4 h-4 ${isSaved ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5 line-clamp-2">
                      {loc.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> GPS Ground Surveyed
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartNavigation && onStartNavigation(loc);
                        }}
                        className="text-[#1a73e8] hover:text-[#1557b0] font-bold flex items-center gap-0.5 transition-colors"
                      >
                        Navigate <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* TAB 2: BUILDINGS */}
          {activeTab === 'buildings' && (
            <>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-1 flex items-center justify-between">
                <span>Academic & Admin Blocks</span>
                <span className="text-[10px] text-slate-500 font-semibold">{buildings.length} Blocks</span>
              </div>

              {buildings.map((bld) => {
                const hasEntrances = bld.entrances && bld.entrances.length > 0;
                return (
                  <div
                    key={bld._id || bld.shortCode}
                    onClick={() => onOpenBuildingPopup ? onOpenBuildingPopup(bld) : onOpenIndoor && onOpenIndoor(bld)}
                    className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-[#28292c] border border-slate-100 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-2 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{bld.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono px-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">{bld.shortCode}</span>
                            <span className="text-[10px] text-slate-400">&bull;</span>
                            <span className="text-[10px] text-slate-500">{bld.totalFloors || 4} Floors</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {bld.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                      <span className="text-slate-500">
                        {hasEntrances ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> {bld.entrances.length} Entrance(s)
                          </span>
                        ) : (
                          <span className="text-amber-500 font-semibold">Surveyed</span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {(onOpenIndoorMap || onOpenIndoor) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenIndoorMap) onOpenIndoorMap(bld);
                              else if (onOpenIndoor) onOpenIndoor(bld);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1 transition-all"
                            title="Open Indoor Floor Plan"
                          >
                            <DoorOpen className="w-3 h-3" /> Indoor
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartNavigation && onStartNavigation(bld);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold flex items-center gap-0.5 transition-colors shadow-sm"
                          title="Walk to building via outdoor paths"
                        >
                          Directions <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* TAB 3: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-1">
                University Departments ({departments.length})
              </div>

              {departments.map((dept) => (
                <div
                  key={dept._id || dept.code}
                  className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#28292c] border border-slate-100 dark:border-slate-700/80 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold">
                        {dept.code}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">{dept.name}</h4>
                      <div className="text-[10px] text-slate-500 font-medium">{dept.faculty}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {dept.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="text-slate-500">
                      Located in: <strong className="text-slate-900 dark:text-white">{dept.buildingShortCode || 'Campus'}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const bld = buildings.find(b => b.shortCode === dept.buildingShortCode);
                        if (bld) onStartNavigation(bld);
                        else onStartNavigation({ name: dept.name, shortCode: dept.code });
                      }}
                      className="text-[#1a73e8] hover:text-[#1557b0] font-bold flex items-center gap-1 transition-colors text-[10px]"
                    >
                      Navigate <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* TAB 5: SAVED LOCATIONS */}
          {activeTab === 'saved' && (
            <>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> Bookmarked Campus Places
                </span>
                <span className="text-[10px] text-slate-500">
                  {locations.filter(l => savedPlaces.includes(l.locationId || l._id || l.shortCode)).length} Saved
                </span>
              </div>

              {locations.filter(l => savedPlaces.includes(l.locationId || l._id || l.shortCode)).length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-[#28292c] rounded-2xl border border-slate-100 dark:border-slate-700/80 text-slate-400 space-y-2 mt-2">
                  <Star className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">No Saved Places Yet</div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Click the star bookmark icon on any building, lab, or cafeteria to save it here.
                  </p>
                </div>
              ) : (
                locations
                  .filter(l => savedPlaces.includes(l.locationId || l._id || l.shortCode))
                  .map((loc) => {
                    const { Icon, color: iconColor, bg: iconBg } = getCategoryIcon(loc.category);
                    const locId = loc.locationId || loc._id || loc.shortCode;

                    return (
                      <div
                        key={loc._id || loc.shortCode}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-[#28292c] border border-amber-200 dark:border-amber-800/60 space-y-2 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                              <Icon className={`w-4 h-4 ${iconColor}`} />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white">{loc.name}</h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-500 font-mono">{loc.shortCode}</span>
                                <span className="text-[10px] text-slate-400">&bull;</span>
                                <span className="text-[10px] text-amber-500 font-bold">{loc.category}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSavePlace(locId)}
                            className="p-1 rounded-full text-amber-500"
                            title="Remove bookmark"
                          >
                            <Star className="w-4 h-4 fill-amber-500" />
                          </button>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 text-[10px]">
                            {loc.coordinates ? `${Number(loc.coordinates.lat).toFixed(4)}, ${Number(loc.coordinates.lng).toFixed(4)}` : 'Surveyed'}
                          </span>
                          <button
                            type="button"
                            onClick={() => onStartNavigation && onStartNavigation(loc)}
                            className="px-2.5 py-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl font-bold flex items-center gap-1 transition-colors text-[11px]"
                          >
                            <NavigationIcon className="w-3 h-3" /> Navigate
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#28292c] text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified Ground Survey
          </span>
          <span className="font-mono text-[10px]">v2.6 GIS</span>
        </div>
      </aside>
    </>
  );
}
