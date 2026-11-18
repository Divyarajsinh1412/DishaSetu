import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Building2,
  Navigation,
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
  Layers
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
      case 'Gate': return { Icon: Compass, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'Academic': return { Icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' };
      case 'Cafe': return { Icon: Coffee, color: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'Medical': return { Icon: HeartPulse, color: 'text-rose-400', bg: 'bg-rose-500/10' };
      case 'Library': return { Icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'Sports': return { Icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
      case 'Parking': return { Icon: Car, color: 'text-orange-400', bg: 'bg-orange-500/10' };
      case 'Garden': return { Icon: Trees, color: 'text-green-400', bg: 'bg-green-500/10' };
      case 'Landmark': return { Icon: Droplets, color: 'text-sky-400', bg: 'bg-sky-500/10' };
      default: return { Icon: MapPin, color: 'text-sky-400', bg: 'bg-sky-500/10' };
    }
  };

  // Directions Form State
  const [startPoint, setStartPoint] = useState('node_main_gate'); // 'current_location' | 'node_main_gate' | 'node_parking_entry' | ...
  const [destPoint, setDestPoint] = useState('node_d_block_ent');
  const [accessibleOnly, setAccessibleOnly] = useState(false);

  // Popular Pre-tested Routes for Presidency University
  const popularRoutes = [
    { name: 'Main Gate → D Block (Mechanical/Civil)', start: 'node_main_gate', dest: 'node_d_block_ent' },
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-40 md:z-20 flex flex-col bg-[#0f172a]/95 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-[88vw] sm:w-96 md:w-80 lg:w-96 shadow-2xl md:shadow-none' : 'w-0 pointer-events-none md:pointer-events-auto'
        } overflow-hidden shrink-0 h-full`}
      >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" /> Campus Directory
          </h2>
          <p className="text-[11px] text-slate-400">Presidency University Verified Map</p>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="p-2 border-b border-slate-800/80 grid grid-cols-5 gap-1 bg-[#0b132b]">
        <button
          onClick={() => setActiveTab('places')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            activeTab === 'places'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Places
        </button>
        <button
          onClick={() => setActiveTab('buildings')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            activeTab === 'buildings'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Buildings
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            activeTab === 'departments'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Depts
        </button>
        <button
          onClick={() => setActiveTab('directions')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'directions'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Navigation className="w-3 h-3" /> Route
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'saved'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Star className="w-3 h-3" /> Saved
        </button>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* TAB 4: DIRECTIONS (PHASE 3A) */}
        {activeTab === 'directions' && (
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Plan Walking Directions
            </div>

            {/* Origin & Destination Selector Card */}
            <div className="p-3 bg-[#1e293b]/70 border border-slate-800 rounded-xl space-y-3">
              {/* Origin */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div> Start Location
                </label>
                <select
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  className="w-full bg-[#0b132b] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
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
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div> Destination
                </label>
                <select
                  value={destPoint}
                  onChange={(e) => setDestPoint(e.target.value)}
                  className="w-full bg-[#0b132b] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
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
              <label className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={accessibleOnly}
                  onChange={(e) => setAccessibleOnly(e.target.checked)}
                  className="rounded bg-[#0b132b] border-slate-700 text-sky-500"
                />
                <Accessibility className="w-3.5 h-3.5 text-emerald-400" />
                <span>Wheelchair accessible route only</span>
              </label>

              {/* Calculate Button */}
              <button
                onClick={() => handleRunDirections()}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Navigation className="w-4 h-4" /> Get Walking Directions
              </button>
            </div>

            {/* Popular Route Shortcuts */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Popular Routes
              </div>
              <div className="space-y-1.5">
                {popularRoutes.map((rt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setStartPoint(rt.start);
                      setDestPoint(rt.dest);
                      handleRunDirections(rt.start, rt.dest, accessibleOnly);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-[#1e293b]/40 hover:bg-[#1e293b] border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between group"
                  >
                    <div className="text-xs text-slate-200 group-hover:text-white font-medium">
                      {rt.name}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 shrink-0 transition-colors" />
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
              Surveyed Points of Interest
            </div>

            {locations.map((loc) => {
              const { Icon, color: iconColor, bg: iconBg } = getCategoryIcon(loc.category);
              const locId = loc.locationId || loc._id || loc.shortCode;
              const isSaved = savedPlaces.includes(locId);

              return (
                <div
                  key={loc._id || loc.shortCode}
                  onClick={() => onSelectLocation && onSelectLocation(loc)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedLocation?._id === loc._id
                      ? 'bg-blue-950/40 border-blue-500/80 shadow-lg'
                      : 'bg-[#1e293b]/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">{loc.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">{loc.shortCode}</span>
                          <span className="text-[10px] text-slate-400">&bull;</span>
                          <span className="text-[10px] text-blue-400 font-medium">{loc.category}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSavePlace(locId);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-colors"
                      title={isSaved ? 'Remove from Saved' : 'Save this location'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mt-2 line-clamp-2">
                    {loc.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> GPS Verified
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartNavigation && onStartNavigation(loc);
                      }}
                      className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
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
              <span className="text-[10px] text-slate-400">{buildings.length} Total</span>
            </div>

            {buildings.map((bld) => {
              const hasEntrances = bld.entrances && bld.entrances.length > 0;
              return (
                <div
                  key={bld._id || bld.shortCode}
                  className="p-3 rounded-xl bg-[#1e293b]/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">{bld.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-300">{bld.shortCode}</span>
                          <span className="text-[10px] text-slate-400">&bull;</span>
                          <span className="text-[10px] text-slate-400">{bld.totalFloors} Floors</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {bld.description}
                  </p>

                  {/* Entrances Count & Directions Action */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      {hasEntrances ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {bld.entrances.length} Entrance(s)
                        </span>
                      ) : (
                        <span className="text-amber-400/80">Pending Survey</span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenIndoor && onOpenIndoor(bld)}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                        title="Explore Indoor Floor Plan"
                      >
                        <Layers className="w-3 h-3" /> Floors
                      </button>
                      <button
                        onClick={() => onStartNavigation && onStartNavigation(bld)}
                        className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        Navigate <ChevronRight className="w-3 h-3" />
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
              Academic & Administrative Departments
            </div>

            {departments.map((dept) => (
              <div
                key={dept._id || dept.code}
                className="p-3 rounded-xl bg-[#1e293b]/60 border border-slate-800 hover:border-slate-700 transition-all space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-400 border border-blue-500/30">
                      {dept.code}
                    </span>
                    <h4 className="font-bold text-xs text-white mt-1">{dept.name}</h4>
                    <div className="text-[10px] text-indigo-400 font-medium">{dept.faculty}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {dept.description}
                </p>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="text-slate-400">
                    Located in: <strong className="text-white">{dept.buildingShortCode || 'Campus'}</strong> &bull; Floor {dept.floorNumber}
                  </span>
                  <button
                    onClick={() => {
                      const bld = buildings.find(b => b.shortCode === dept.buildingShortCode);
                      if (bld) onStartNavigation(bld);
                      else onStartNavigation({ name: dept.name, shortCode: dept.code });
                    }}
                    className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors text-[10px]"
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
              <span className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> Bookmarked Campus Places
              </span>
              <span className="text-[10px] text-slate-400">
                {locations.filter(l => savedPlaces.includes(l.locationId || l._id || l.shortCode)).length} Saved
              </span>
            </div>

            {locations.filter(l => savedPlaces.includes(l.locationId || l._id || l.shortCode)).length === 0 ? (
              <div className="p-8 text-center bg-[#1e293b]/30 rounded-2xl border border-slate-800 text-slate-400 space-y-2 mt-2">
                <Star className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-semibold text-slate-300">No Saved Places Yet</div>
                <p className="text-[11px] leading-relaxed">
                  Click the star icon on any building, classroom, cafeteria or facility to bookmark it for one-tap navigation.
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
                      className="p-3 rounded-xl bg-[#1e293b]/70 border border-amber-500/30 hover:border-amber-500/60 transition-all space-y-2 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-white">{loc.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">{loc.shortCode}</span>
                              <span className="text-[10px] text-slate-400">&bull;</span>
                              <span className="text-[10px] text-amber-400 font-medium">{loc.category}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSavePlace(locId)}
                          className="p-1 rounded-lg hover:bg-slate-700 text-amber-400 transition-colors"
                          title="Remove bookmark"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 text-[10px]">
                          {loc.coordinates ? `${loc.coordinates.lat?.toFixed(5)}, ${loc.coordinates.lng?.toFixed(5)}` : 'Awaiting Survey'}
                        </span>
                        <button
                          onClick={() => onStartNavigation && onStartNavigation(loc)}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors text-[11px]"
                        >
                          <Navigation className="w-3 h-3" /> Navigate
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
      <div className="p-3 border-t border-slate-800 bg-[#0b132b] text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Live GIS Data
        </span>
        <span>Presidency Univ &copy; 2026</span>
      </div>
    </aside>
    </>
  );
}
