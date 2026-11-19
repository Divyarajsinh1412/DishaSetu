import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Navigation,
  Compass,
  ArrowRight,
  ArrowUpDown,
  MapPin,
  Building2,
  Coffee,
  HeartPulse,
  BookOpen,
  Car,
  Trophy,
  Trees,
  DoorOpen,
  Footprints,
  Clock,
  Accessibility,
  CheckCircle2,
  X,
  Search,
  ChevronDown,
  Sparkles,
  LocateFixed
} from 'lucide-react';
import { clientRoutingEngine } from '../../services/routingEngine';
import { COMPLETE_CAMPUS_CATALOG } from '../../services/campusCatalog';
import { MASTER_CAMPUS_FEATURES } from '../../data/masterMapFeatures';

// Comprehensive selectable campus places for wayfinding
const CAMPUS_PLACES = [
  // 1. Gates & Entry Points
  { id: 'node_main_gate', code: 'PU-GATE-01', name: 'Main Gate (Upper Entrance)', category: 'Gate', group: 'Gates & Entrances', icon: Compass },
  { id: 'node_gate_2', code: 'PU-GATE-02', name: 'Gate 2 (Upper-Right Entrance)', category: 'Gate', group: 'Gates & Entrances', icon: Compass },
  { id: 'node_parking_entry', code: 'PU-PARK-2W', name: 'Student 2-Wheeler Parking', category: 'Parking', group: 'Parking & Transit', icon: Car },
  { id: 'node_visitor_parking', code: 'PU-PARK-VIS', name: 'Visitor Parking', category: 'Parking', group: 'Parking & Transit', icon: Car },
  { id: 'node_bus_point_2', code: 'PU-BUS-02', name: 'Bus Point 2', category: 'Transport', group: 'Parking & Transit', icon: Navigation },
  { id: 'node_bus_boarding', code: 'PU-BUS-BAY', name: 'Bus Boarding Bay', category: 'Transport', group: 'Parking & Transit', icon: Navigation },
  { id: 'node_parking_4w', code: 'PU-PARK-4W', name: '4 Wheeler Parking', category: 'Parking', group: 'Parking & Transit', icon: Car },

  // 2. Academic Blocks
  { id: 'bld_d_block', code: 'PU-D-BLOCK', name: 'D Block (Mechanical & Civil Engineering)', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_e_block', code: 'PU-E-BLOCK', name: 'E Block (School of CSE & AI)', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_f_block', code: 'PU-F-BLOCK', name: 'F Block (Information Science & EEE)', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_l_block', code: 'PU-L-BLOCK', name: 'L Block (Electronics & Robotics)', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_h_block', code: 'PU-H-BLOCK', name: 'H Block (Admissions & Registrar Office)', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_j_block', code: 'PU-J-BLOCK', name: 'J Block', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_k_block', code: 'PU-K-BLOCK', name: 'K Block', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_n_block', code: 'PU-N-BLOCK', name: 'N Block', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_p_block', code: 'PU-P-BLOCK', name: 'P Block', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_q_block', code: 'PU-Q-BLOCK', name: 'Q Block', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_r_block', code: 'PU-R-BLOCK', name: 'R Block', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_s_block', code: 'PU-S-BLOCK', name: 'S Block', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_u_block', code: 'PU-U-BLOCK', name: 'U Block (South Academic Wing)', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_hr_block', code: 'PU-HR-BLOCK', name: 'HR Block & Plaza', category: 'Administrative', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_coe', code: 'PU-COE', name: 'COE Block (Controller of Examinations)', category: 'Administrative', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_dsa', code: 'PU-DSA', name: 'DSA & Fee Counter', category: 'Administrative', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_mba_som', code: 'PU-MBA-SOM', name: 'MBA / SOM Block (School of Management)', category: 'Academic', group: 'Academic Blocks', icon: Building2 },
  { id: 'bld_auditorium', code: 'PU-AUDITORIUM', name: 'Auditorium Grand Foyer', category: 'Facility', group: 'Campus Facilities', icon: Trophy },
  { id: 'bld_hostel_mess', code: 'PU-HOSTEL-MESS', name: 'Hostel Mess & Dining Hall', category: 'Facility', group: 'Campus Facilities', icon: Coffee },

  // 3. Cafes & Food Points
  { id: 'feat_food_d_block', code: 'PU-CAFE-D-BLOCK', name: 'Hatti Kappi (Near D Block)', category: 'Cafe', group: 'Dining & Cafes', icon: Coffee },
  { id: 'feat_food_point_main', code: 'PU-CAFE-01', name: 'Central Food Point & Refreshments', category: 'Cafe', group: 'Dining & Cafes', icon: Coffee },

  // 4. Central Landmarks & Green Zones
  { id: 'feat_fountain', code: 'PU-LM-FOUNTAIN', name: 'Central Fountain Roundabout', category: 'Garden', group: 'Landmarks & Greenery', icon: Compass },
  { id: 'feat_main_lawn', code: 'PU-LM-LAWN', name: 'Main Lawn (Central Green)', category: 'Garden', group: 'Landmarks & Greenery', icon: Trees },
  { id: 'feat_dsa_lawn', code: 'PU-LM-DSA-LAWN', name: 'DSA Lawn', category: 'Garden', group: 'Landmarks & Greenery', icon: Trees },

  // 5. University Facilities & Health
  { id: 'feat_library', code: 'PU-FAC-LIB', name: 'Central University Library', category: 'Library', group: 'Campus Facilities', icon: BookOpen },
  { id: 'feat_medical', code: 'PU-FAC-MED', name: 'Health & Medical Centre', category: 'Medical', group: 'Campus Facilities', icon: HeartPulse },
  { id: 'feat_atm_d_block', code: 'PU-FAC-ATM', name: 'Campus ATM (Near D Block)', category: 'Facility', group: 'Campus Facilities', icon: MapPin },

  // 6. Sports Arena
  { id: 'feat_football', code: 'PU-SPORT-FB', name: 'Football Ground', category: 'Sports', group: 'Sports Arena', icon: Trophy },
  { id: 'feat_volleyball', code: 'PU-SPORT-VB', name: 'Volleyball Courts & Nets', category: 'Sports', group: 'Sports Arena', icon: Trophy },
  { id: 'feat_basketball', code: 'PU-SPORT-BB', name: 'Basketball Court', category: 'Sports', group: 'Sports Arena', icon: Trophy },
  { id: 'feat_cricket', code: 'PU-SPORT-CRIC', name: 'Cricket Practice Nets', category: 'Sports', group: 'Sports Arena', icon: Trophy },

  // 7. D Block Specific Labs & Rooms
  { id: 'room_dg01', code: 'DG01', name: 'DG01 - Fluid Mechanics & Hydraulics Lab', category: 'Room', group: 'D Block Rooms', icon: DoorOpen },
  { id: 'room_dg02', code: 'DG02', name: 'DG02 - Material Testing Lab', category: 'Room', group: 'D Block Rooms', icon: DoorOpen },
  { id: 'room_dg03', code: 'DG03', name: 'DG03 - CAD & Simulation Studio', category: 'Room', group: 'D Block Rooms', icon: DoorOpen },
  { id: 'room_dg04', code: 'DG04', name: 'DG04 - Robotics & Mechatronics Lab', category: 'Room', group: 'D Block Rooms', icon: DoorOpen },
  { id: 'room_dg05', code: 'DG05', name: 'DG05 - IC Engines & Thermal Lab', category: 'Room', group: 'D Block Rooms', icon: DoorOpen },
  { id: 'room_dg06', code: 'DG06', name: 'DG06 - Metrology & Quality Lab', category: 'Room', group: 'D Block Rooms', icon: DoorOpen }
];

export default function RoutePlanningModal({
  isOpen,
  onClose,
  onStartNavigation,
  initialStart = 'node_main_gate',
  initialDestination = 'bld_d_block',
  userLocation = null
}) {
  const [startPlaceId, setStartPlaceId] = useState(initialStart);
  const [destPlaceId, setDestPlaceId] = useState(initialDestination);
  const [accessibleOnly, setAccessibleOnly] = useState(false);

  // Search filter states for dropdowns
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [startSearch, setStartSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  // Computed Route
  const [calculatedRoute, setCalculatedRoute] = useState(null);
  const [routeError, setRouteError] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Sync initial inputs
  useEffect(() => {
    if (initialStart) setStartPlaceId(initialStart);
    if (initialDestination) setDestPlaceId(initialDestination);
  }, [initialStart, initialDestination]);

  // Resolve Place Details helper
  const resolvePlace = (id) => {
    if (id === 'current_location') {
      return {
        id: 'current_location',
        name: 'Your Current GPS Location',
        category: 'GPS',
        icon: LocateFixed,
        code: 'GPS'
      };
    }
    const match = CAMPUS_PLACES.find(p => p.id === id || p.code === id || p.name === id);
    if (match) return match;
    const catMatch = COMPLETE_CAMPUS_CATALOG.find(c => c.locationId === id || c.shortCode === id || c.name === id);
    if (catMatch) {
      return {
        id: catMatch.locationId,
        code: catMatch.shortCode,
        name: catMatch.name,
        category: catMatch.category,
        icon: Building2
      };
    }
    return { id, name: id, category: 'Campus', icon: MapPin };
  };

  const selectedStartPlace = useMemo(() => resolvePlace(startPlaceId), [startPlaceId]);
  const selectedDestPlace = useMemo(() => resolvePlace(destPlaceId), [destPlaceId]);

  // Filtered lists for dropdown search
  const filteredStartPlaces = useMemo(() => {
    const q = startSearch.trim().toLowerCase();
    const list = userLocation
      ? [{ id: 'current_location', name: 'Your Current GPS Location', code: 'LIVE GPS', category: 'GPS', group: 'Real-Time Location', icon: LocateFixed }, ...CAMPUS_PLACES]
      : CAMPUS_PLACES;
    if (!q) return list;
    return list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.group && p.group.toLowerCase().includes(q))
    );
  }, [startSearch, userLocation]);

  const filteredDestPlaces = useMemo(() => {
    const q = destSearch.trim().toLowerCase();
    if (!q) return CAMPUS_PLACES;
    return CAMPUS_PLACES.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.group && p.group.toLowerCase().includes(q))
    );
  }, [destSearch]);

  // Calculate Route using Client Routing Engine
  const calculateRoute = () => {
    if (!startPlaceId || !destPlaceId) return;
    if (startPlaceId === destPlaceId) {
      setRouteError('Start and destination cannot be the same place.');
      setCalculatedRoute(null);
      return;
    }

    setIsCalculating(true);
    setRouteError(null);

    try {
      // Map Place IDs to graph nodes or coordinates
      const resolveTargetNodeId = (placeId) => {
        if (placeId === 'current_location' && userLocation) {
          return userLocation;
        }
        if (placeId.startsWith('node_')) return placeId;
        if (placeId === 'bld_d_block' || placeId === 'PU-D-BLOCK') return 'node_d_block_ent';
        if (placeId === 'bld_e_block' || placeId === 'PU-E-BLOCK') return 'node_e_block_ent';
        if (placeId === 'bld_f_block' || placeId === 'PU-F-BLOCK') return 'node_f_block_ent';
        if (placeId === 'bld_l_block' || placeId === 'PU-L-BLOCK') return 'node_l_block_ent';
        if (placeId === 'bld_h_block' || placeId === 'PU-H-BLOCK') return 'node_h_block_ent';
        if (placeId === 'bld_auditorium') return 'node_auditorium_ent';
        if (placeId === 'feat_food_d_block' || placeId === 'PU-CAFE-D-BLOCK') return 'node_cafe_d_block';
        if (placeId === 'feat_library') return 'node_library_ent';
        if (placeId === 'feat_medical') return 'node_medical_ent';
        if (placeId === 'feat_fountain') return 'node_fountain';
        if (placeId === 'feat_football') return 'node_football_court';
        if (placeId === 'feat_volleyball') return 'node_volleyball_court';
        if (placeId === 'bld_hostel_mess') return 'node_hostel_mess';
        if (placeId === 'node_gate_2' || placeId === 'PU-GATE-02') return 'node_gate_2';
        if (placeId.startsWith('room_dg')) return 'node_d_block_ent';

        const place = CAMPUS_PLACES.find(p => p.id === placeId);
        if (place && place.code) return place.code;
        return placeId;
      };

      const startTarget = resolveTargetNodeId(startPlaceId);
      const destTarget = resolveTargetNodeId(destPlaceId);

      const route = clientRoutingEngine.calculateRoute({
        start: startTarget,
        destination: destTarget,
        accessibleOnly,
        startName: selectedStartPlace.name,
        destName: selectedDestPlace.name
      });

      setCalculatedRoute(route);
    } catch (err) {
      console.warn('Navigation Route calculation notice:', err.message);
      setRouteError(err.message || 'Unable to find an obstacle-free route between selected locations.');
      setCalculatedRoute(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Re-calculate route when endpoints or accessibility change
  useEffect(() => {
    if (isOpen) {
      calculateRoute();
    }
  }, [startPlaceId, destPlaceId, accessibleOnly, isOpen]);

  // Swap Start and Destination
  const handleSwapEndpoints = () => {
    const temp = startPlaceId;
    setStartPlaceId(destPlaceId);
    setDestPlaceId(temp);
  };

  // Apply Popular Preset Route
  const handleApplyPreset = (startId, destId) => {
    setStartPlaceId(startId);
    setDestPlaceId(destId);
  };

  // Confirm and start live navigation on map
  const handleConfirmStart = () => {
    if (calculatedRoute && onStartNavigation) {
      onStartNavigation(calculatedRoute);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#0b1328]/95 backdrop-blur-2xl border border-sky-500/30 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden"
        onClick={(e) => {
          // Close open dropdowns if clicked outside
          if (!e.target.closest('.endpoint-dropdown')) {
            setIsStartOpen(false);
            setIsDestOpen(false);
          }
        }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b1328] rounded-[14px] flex items-center justify-center">
                <Navigation className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Campus Wayfinding & Navigation
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  A* Dijkstra Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Select your starting point and destination across Presidency University Bengaluru
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          
          {/* ============================================================== */}
          {/* 1. ORIGIN & DESTINATION SELECTORS (GOOGLE MAPS STYLE)          */}
          {/* ============================================================== */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl relative space-y-3">
            
            {/* Start Location Input */}
            <div className="relative endpoint-dropdown">
              <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-950"></span>
                <span>Starting Point (From)</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsStartOpen(!isStartOpen);
                  setIsDestOpen(false);
                }}
                className="w-full p-3 bg-slate-950/90 hover:bg-slate-950 border border-slate-700 hover:border-emerald-500/80 rounded-xl flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <selectedStartPlace.icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {selectedStartPlace.name}
                  </span>
                  {selectedStartPlace.code && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedStartPlace.code}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
              </button>

              {/* Start Dropdown Popup */}
              {isStartOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-800">
                    <div className="relative flex items-center bg-slate-900 rounded-xl px-2.5 py-1.5">
                      <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                      <input
                        type="text"
                        value={startSearch}
                        onChange={(e) => setStartSearch(e.target.value)}
                        placeholder="Search starting building, gate, parking..."
                        className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                    {filteredStartPlaces.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => {
                          setStartPlaceId(place.id);
                          setIsStartOpen(false);
                          setStartSearch('');
                        }}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors ${
                          startPlaceId === place.id ? 'bg-emerald-600/20 text-emerald-300 font-bold' : 'hover:bg-slate-800/80 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <place.icon className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs truncate">{place.name}</span>
                        </div>
                        {place.code && (
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                            {place.code}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Swap Button (Centered) */}
            <div className="flex items-center justify-center -my-1 z-10 relative">
              <button
                type="button"
                onClick={handleSwapEndpoints}
                className="p-2 rounded-full bg-slate-800 hover:bg-sky-600 border border-slate-700 hover:border-sky-400 text-slate-300 hover:text-white shadow-lg transition-all hover:scale-110 active:scale-95"
                title="Swap Start and Destination (⇄)"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Destination Location Input */}
            <div className="relative endpoint-dropdown">
              <label className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 ring-4 ring-rose-950"></span>
                <span>Destination (To)</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsDestOpen(!isDestOpen);
                  setIsStartOpen(false);
                }}
                className="w-full p-3 bg-slate-950/90 hover:bg-slate-950 border border-slate-700 hover:border-rose-500/80 rounded-xl flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <selectedDestPlace.icon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {selectedDestPlace.name}
                  </span>
                  {selectedDestPlace.code && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedDestPlace.code}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
              </button>

              {/* Destination Dropdown Popup */}
              {isDestOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-800">
                    <div className="relative flex items-center bg-slate-900 rounded-xl px-2.5 py-1.5">
                      <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                      <input
                        type="text"
                        value={destSearch}
                        onChange={(e) => setDestSearch(e.target.value)}
                        placeholder="Search destination building, lab (DG01), cafe..."
                        className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                    {filteredDestPlaces.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => {
                          setDestPlaceId(place.id);
                          setIsDestOpen(false);
                          setDestSearch('');
                        }}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors ${
                          destPlaceId === place.id ? 'bg-rose-600/20 text-rose-300 font-bold' : 'hover:bg-slate-800/80 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <place.icon className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="text-xs truncate">{place.name}</span>
                        </div>
                        {place.code && (
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                            {place.code}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accessibility / Wheelchair Option Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Accessibility className="w-4 h-4 text-sky-400" />
                <span>Require Wheelchair Accessible (Step-Free) Paths</span>
              </div>
              <button
                type="button"
                onClick={() => setAccessibleOnly(!accessibleOnly)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  accessibleOnly ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    accessibleOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. QUICK POPULAR CAMPUS PRESET ROUTES                          */}
          {/* ============================================================== */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Popular Direct Routes</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Main Gate → D Block', start: 'node_main_gate', dest: 'bld_d_block' },
                { label: 'Main Gate → Hatti Kappi', start: 'node_main_gate', dest: 'feat_food_d_block' },
                { label: 'Main Gate → Central Library', start: 'node_main_gate', dest: 'feat_library' },
                { label: 'Main Gate → Auditorium', start: 'node_main_gate', dest: 'bld_auditorium' },
                { label: 'D Block → Central Fountain', start: 'bld_d_block', dest: 'feat_fountain' },
                { label: 'D Block → Auditorium', start: 'bld_d_block', dest: 'bld_auditorium' },
                { label: 'Parking → E Block (CSE)', start: 'node_parking_entry', dest: 'bld_e_block' },
                { label: 'Hatti Kappi → Library', start: 'feat_food_d_block', dest: 'feat_library' }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset.start, preset.dest)}
                  className="px-2.5 py-1 text-xs rounded-xl bg-slate-900 border border-slate-700/80 hover:border-sky-500/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center gap-1"
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3. ROUTE SUMMARY PREVIEW CARD & TURN-BY-TURN PREVIEW          */}
          {/* ============================================================== */}
          {calculatedRoute && (
            <div className="p-4 bg-gradient-to-br from-slate-900/90 to-slate-950 border border-emerald-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                    <Footprints className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white">{calculatedRoute.distanceMeters} m</span>
                      <span className="text-slate-500 font-bold">·</span>
                      <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        ~{calculatedRoute.estimatedWalkingMinutes} min walk
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Verified pedestrian pathway · {calculatedRoute.waypoints?.length || 0} navigation waypoints
                    </div>
                  </div>
                </div>

                {calculatedRoute.accessible && (
                  <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    <Accessibility className="w-3.5 h-3.5" />
                    Step-Free
                  </span>
                )}
              </div>

              {/* Waypoint Steps Preview (first 3 + arrival) */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Turn Preview:</div>
                {calculatedRoute.waypoints?.slice(0, 4).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="truncate">{step.instruction}</span>
                  </div>
                ))}
                {calculatedRoute.waypoints && calculatedRoute.waypoints.length > 4 && (
                  <div className="text-[10px] text-slate-400 pl-6">
                    + {calculatedRoute.waypoints.length - 4} more turn instructions along path...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Route Error Notification */}
          {routeError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <span className="font-bold">Notice:</span>
              <span>{routeError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-950/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!calculatedRoute}
            onClick={handleConfirmStart}
            className={`px-6 py-2.5 rounded-xl text-xs font-black shadow-xl flex items-center gap-2 transition-all ${
              calculatedRoute
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 hover:scale-105 active:scale-95 shadow-emerald-500/25 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>START NAVIGATION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}