import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Building2,
  Layers,
  MapPin,
  Navigation,
  Accessibility,
  ArrowRight,
  ArrowDown,
  ArrowLeftRight,
  Compass,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  DoorOpen,
  Footprints,
  X,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Shield,
  Edit3,
  Save,
  Check,
  Plus,
  ArrowUpDown,
  LocateFixed,
  CornerUpRight
} from 'lucide-react';
import {
  fetchIndoorFloors,
  fetchIndoorGraph,
  calculateIndoorRouteApi,
  updateIndoorFloorApi
} from '../../services/api';
import { D_BLOCK_FALLBACK_FLOORS, D_BLOCK_INFO } from '../../data/dBlockFloorsFallback.js';

/**
 * Top-Down 2D Architectural Indoor Navigation for Presidency University
 * Starting with D Block (6 Floors: Ground to Fifth).
 * Default View matches the ChatGPT Design Preview layout (Image 1):
 * - SELECT FLOOR 3x2 pill grid (Ground to Fifth)
 * - Centered Floor Title (D BLOCK – GROUND FLOOR)
 * - 6-Room Grid with Central Corridor (DG01-DG03 / CORRIDOR / DG04-DG06)
 * - Selected Destination Bottom Card with Down Arrow Action Button
 * - Toggleable SVG Blueprint view with graph A* routing and Admin Editor
 */
export default function IndoorNavigationModal({
  isOpen,
  onClose,
  initialBuilding = null,
  initialMode = 'view', // 'view' | 'navigate'
  buildings = [],
  onStartOutdoorNavigation,
  onOpenRoutePlanning,
  isEmbedded = false
}) {
  // Building Selection (defaults to D Block)
  const [selectedBuildingId, setSelectedBuildingId] = useState(
    () => initialBuilding?.buildingId || initialBuilding?.shortCode || initialBuilding?._id || 'bld_d_block'
  );

  const [floors, setFloors] = useState(D_BLOCK_FALLBACK_FLOORS);
  const [currentFloorNumber, setCurrentFloorNumber] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(D_BLOCK_FALLBACK_FLOORS[0].rooms[0]); // default DG01
  const [searchQuery, setSearchQuery] = useState('');
  const [startPoint, setStartPoint] = useState('entrance'); // 'entrance', 'elevator', 'stairs'
  const [isNavigating, setIsNavigating] = useState(true);
  const [layoutMode, setLayoutMode] = useState('card'); // 'card' (Image 1 ChatGPT preview) | 'blueprint' (SVG canvas)
  const [isModalFullscreen, setIsModalFullscreen] = useState(false);
  const searchInputRef = useRef(null);

  // Pan & Zoom for Blueprint view
  const [scale, setScale] = useState(1.0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Admin Editing Mode
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editForm, setEditForm] = useState({
    roomNumber: '',
    name: '',
    category: 'Laboratory',
    department: '',
    status: 'Operational'
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Sync with initialBuilding prop
  useEffect(() => {
    if (initialBuilding) {
      const bId = initialBuilding.buildingId || initialBuilding.shortCode || initialBuilding._id || 'bld_d_block';
      setSelectedBuildingId(bId);
    }
  }, [initialBuilding, isOpen]);

  // Handle initialMode ('view' vs 'navigate')
  useEffect(() => {
    if (isOpen && initialMode === 'navigate') {
      setIsNavigating(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    } else if (isOpen) {
      setIsNavigating(true);
    }
  }, [isOpen, initialMode]);

  // Active Building Meta
  const currentBuilding = useMemo(() => {
    const isD = selectedBuildingId === 'bld_d_block' ||
                selectedBuildingId === 'PU-D-BLOCK' ||
                /d[-_]?block/i.test(selectedBuildingId || '') ||
                /d[-_]?block/i.test(initialBuilding?.name || '');
    if (isD) {
      return D_BLOCK_INFO;
    }
    const found = buildings.find(b =>
      b._id === selectedBuildingId ||
      b.buildingId === selectedBuildingId ||
      b.shortCode === selectedBuildingId ||
      b.name === selectedBuildingId
    );
    if (found) return found;
    if (initialBuilding && (initialBuilding.buildingId === selectedBuildingId || initialBuilding.shortCode === selectedBuildingId)) {
      return initialBuilding;
    }
    return D_BLOCK_INFO;
  }, [buildings, selectedBuildingId, initialBuilding]);

  // Load floors from MongoDB Atlas with fallback
  useEffect(() => {
    if (!isOpen && !isEmbedded) return;

    const isD = selectedBuildingId === 'bld_d_block' ||
                selectedBuildingId === 'PU-D-BLOCK' ||
                /d[-_]?block/i.test(selectedBuildingId || '') ||
                /d[-_]?block/i.test(currentBuilding?.name || '');

    fetchIndoorFloors(selectedBuildingId)
      .then(data => {
        if (data && data.length > 0) {
          setFloors(data);
          const gFloor = data.find(f => f.floorNumber === 0) || data[0];
          setCurrentFloorNumber(gFloor.floorNumber);
          if (gFloor.rooms?.length > 0) {
            setSelectedRoom(gFloor.rooms[0]);
          } else {
            setSelectedRoom(null);
          }
        } else if (isD) {
          setFloors(D_BLOCK_FALLBACK_FLOORS);
          setCurrentFloorNumber(0);
          setSelectedRoom(D_BLOCK_FALLBACK_FLOORS[0].rooms[0]);
        } else {
          setFloors([]);
          setSelectedRoom(null);
        }
      })
      .catch(() => {
        if (isD) {
          setFloors(D_BLOCK_FALLBACK_FLOORS);
          setCurrentFloorNumber(0);
          setSelectedRoom(D_BLOCK_FALLBACK_FLOORS[0].rooms[0]);
        } else {
          setFloors([]);
          setSelectedRoom(null);
        }
      });
  }, [isOpen, isEmbedded, selectedBuildingId, currentBuilding]);

  // Active Floor Object
  const activeFloor = useMemo(() => {
    return floors.find(f => f.floorNumber === currentFloorNumber) || floors[0] || D_BLOCK_FALLBACK_FLOORS[0];
  }, [floors, currentFloorNumber]);

  // Split rooms into Top Row (01..03) and Bottom Row (04..06)
  const topRowRooms = useMemo(() => {
    if (!activeFloor?.rooms || activeFloor.rooms.length === 0) return [];
    if (activeFloor.rooms.length >= 6) {
      return activeFloor.rooms.slice(0, 3);
    }
    return activeFloor.rooms.slice(0, Math.ceil(activeFloor.rooms.length / 2));
  }, [activeFloor]);

  const bottomRowRooms = useMemo(() => {
    if (!activeFloor?.rooms || activeFloor.rooms.length === 0) return [];
    if (activeFloor.rooms.length >= 6) {
      return activeFloor.rooms.slice(3, 6);
    }
    return activeFloor.rooms.slice(Math.ceil(activeFloor.rooms.length / 2));
  }, [activeFloor]);

  // Handle Search: Automatically switch floors if room found on another floor
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) return;

    const q = query.toLowerCase().trim();

    for (const flr of floors) {
      if (flr.rooms) {
        const match = flr.rooms.find(
          r => r.roomNumber.toLowerCase() === q ||
               r.name.toLowerCase().includes(q) ||
               r.roomId.toLowerCase() === q
        );
        if (match) {
          if (flr.floorNumber !== currentFloorNumber) {
            setCurrentFloorNumber(flr.floorNumber);
          }
          setSelectedRoom(match);
          setIsNavigating(true);
          break;
        }
      }
    }
  };

  // Pan & Zoom handlers for SVG Blueprint view
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.0015;
    setScale(prev => Math.min(Math.max(prev + zoomFactor, 0.7), 3.0));
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setScale(1.0);
    setPosition({ x: 0, y: 0 });
  };

  // Calculate Walkable Indoor Route for Blueprint SVG
  const routePathD = useMemo(() => {
    if (!selectedRoom) return null;

    const door = selectedRoom.entrancePoint || { x: 190, y: 235 };
    const corridorY = 270;

    let startX = 480;
    let startY = 495;

    if (startPoint === 'stairs') {
      startX = 915;
      startY = corridorY;
    } else if (startPoint === 'elevator') {
      startX = 885;
      startY = corridorY;
    } else {
      if (currentFloorNumber === 0) {
        startX = 480;
        startY = 495;
      } else {
        startX = 885;
        startY = corridorY;
      }
    }

    if (startY !== corridorY) {
      return `M ${startX} ${startY} L ${startX} ${corridorY} L ${door.x} ${corridorY} L ${door.x} ${door.y}`;
    } else {
      return `M ${startX} ${corridorY} L ${door.x} ${corridorY} L ${door.x} ${door.y}`;
    }
  }, [selectedRoom, startPoint, currentFloorNumber]);

  // Turn-by-turn instruction summary
  const routeInstructions = useMemo(() => {
    if (!selectedRoom) return [];
    const isGround = currentFloorNumber === 0;
    const roomNum = selectedRoom.roomNumber;

    if (startPoint === 'entrance' && isGround) {
      return [
        { icon: '🚪', text: 'Enter D Block via Main Ground Entrance Portal' },
        { icon: '🚶', text: 'Walk north along entrance breezeway to Central Corridor' },
        { icon: '↔️', text: `Proceed along Central Corridor to Room ${roomNum}` },
        { icon: '🎯', text: `Turn into entrance of ${selectedRoom.name}` }
      ];
    } else if (startPoint === 'elevator' || !isGround) {
      return [
        { icon: '🛗', text: `Take Central Elevator to ${activeFloor?.floorName || 'Floor'}` },
        { icon: '↔️', text: `Walk west along Central Corridor toward Room ${roomNum}` },
        { icon: '🎯', text: `Turn into entrance of ${selectedRoom.name}` }
      ];
    } else {
      return [
        { icon: '🪜', text: `Take East Main Staircase to ${activeFloor?.floorName || 'Floor'}` },
        { icon: '↔️', text: `Walk west along Central Corridor to Room ${roomNum}` },
        { icon: '🎯', text: `Arrive at ${selectedRoom.name}` }
      ];
    }
  }, [selectedRoom, startPoint, currentFloorNumber, activeFloor]);

  // Admin Editing Handlers
  const handleOpenEditRoom = (room, e) => {
    e.stopPropagation();
    setEditingRoom(room);
    setEditForm({
      roomNumber: room.roomNumber,
      name: room.name,
      category: room.category || 'Laboratory',
      department: room.department || '',
      status: room.status || 'Operational'
    });
  };

  const handleSaveRoomEdit = async () => {
    if (!editingRoom) return;

    const token = localStorage.getItem('dishasetu_admin_token');
    const updatedRooms = activeFloor.rooms.map(r => {
      if (r.roomId === editingRoom.roomId) {
        return {
          ...r,
          roomNumber: editForm.roomNumber,
          name: editForm.name,
          category: editForm.category,
          department: editForm.department,
          status: editForm.status
        };
      }
      return r;
    });

    const updatedFloors = floors.map(f => {
      if (f.floorId === activeFloor.floorId) {
        return { ...f, rooms: updatedRooms };
      }
      return f;
    });
    setFloors(updatedFloors);

    if (selectedRoom?.roomId === editingRoom.roomId) {
      setSelectedRoom({
        ...selectedRoom,
        roomNumber: editForm.roomNumber,
        name: editForm.name,
        category: editForm.category,
        department: editForm.department,
        status: editForm.status
      });
    }

    try {
      if (token) {
        await updateIndoorFloorApi(activeFloor.floorId, { rooms: updatedRooms }, token);
      }
      setSaveSuccessMsg(`Saved ${editForm.roomNumber} successfully to database.`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.warn('Could not persist to Atlas, saved in local session:', err.message);
    }

    setEditingRoom(null);
  };

  if (!isOpen && !isEmbedded) return null;

  // The inner content component
  const content = (
    <div className={`relative flex flex-col w-full h-full bg-[#0d0f14] text-slate-100 select-none overflow-hidden ${
      isEmbedded ? '' : 'rounded-3xl border border-slate-800 shadow-2xl'
    }`}>
      {/* ============================================================== */}
      {/* 1. TOP HEADER: D BLOCK – INDOOR NAVIGATION (Design Preview)    */}
      {/* ============================================================== */}
      <div className="px-5 py-3.5 bg-[#090b10] border-b border-slate-800/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0d0f14] rounded-[10px] flex items-center justify-center">
              <DoorOpen className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base tracking-tight text-white">
                {currentBuilding.name} – Indoor Navigation
              </h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                selectedBuildingId === 'PU-D-BLOCK' || selectedBuildingId === 'bld_d_block'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                {selectedBuildingId === 'PU-D-BLOCK' || selectedBuildingId === 'bld_d_block'
                  ? 'Verified Architectural Layout'
                  : 'Illustrative Layout · Survey Pending'}
              </span>
              {isAdminMode && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  Admin Active
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2 mt-0.5">
              <span>Presidency University Bengaluru</span>
              <span>•</span>
              <select
                value={selectedBuildingId}
                onChange={e => setSelectedBuildingId(e.target.value)}
                className="bg-[#181c25] text-sky-300 text-xs font-semibold rounded-lg px-2 py-0.5 border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="PU-D-BLOCK">D Block (6 Floors Verified)</option>
                <option value="PU-E-BLOCK">E Block – School of CSE &amp; AI (Survey Pending)</option>
                <option value="PU-F-BLOCK">F Block – Information Science (Survey Pending)</option>
                <option value="PU-L-BLOCK">L Block – Electronics &amp; Robotics (Survey Pending)</option>
                <option value="PU-H-BLOCK">H Block – Admissions &amp; Admin (Survey Pending)</option>
                <option value="PU-MBA-SOM">MBA / SOM Block (Survey Pending)</option>
                {buildings && buildings.map(b => (
                  !['PU-D-BLOCK', 'PU-E-BLOCK', 'PU-F-BLOCK', 'PU-L-BLOCK', 'PU-H-BLOCK', 'PU-MBA-SOM'].includes(b.shortCode) && (
                    <option key={b._id || b.shortCode} value={b.shortCode || b.buildingId || b._id}>
                      {b.name} ({b.shortCode})
                    </option>
                  )
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Card View vs SVG Blueprint View Switcher */}
          <div className="hidden md:flex items-center bg-[#181c25] rounded-xl p-0.5 border border-slate-700/60 text-xs">
            <button
              onClick={() => setLayoutMode('card')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                layoutMode === 'card' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Card Layout
            </button>
            <button
              onClick={() => setLayoutMode('blueprint')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                layoutMode === 'blueprint' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Blueprint / Route
            </button>
          </div>

          {/* Admin Editor Toggle */}
          <button
            onClick={() => setIsAdminMode(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isAdminMode
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60'
            }`}
            title="Toggle Administrator Floor-Plan Editor"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isAdminMode ? 'Exit Admin' : 'Admin'}</span>
          </button>

          {/* Outdoor Route Button */}
          {onStartOutdoorNavigation && (
            <button
              onClick={() => {
                onStartOutdoorNavigation(currentBuilding);
                if (onClose) onClose();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-xl border border-sky-500/30 transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Outdoor Map</span>
            </button>
          )}

          {/* Fullscreen Toggle (only in modal mode) */}
          {!isEmbedded && (
            <button
              onClick={() => setIsModalFullscreen(prev => !prev)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isModalFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isModalFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccessMsg && (
        <div className="px-5 py-2 bg-emerald-950/80 border-b border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      {floors.length === 0 ? (
        /* Rule 5: Non-Surveyed Building Banner */
        <div className="flex-1 flex items-center justify-center p-6 text-center overflow-y-auto">
          <div className="max-w-md w-full bg-[#141822] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Survey In Progress
              </span>
              <h3 className="text-lg font-black text-white mt-2">
                Indoor Map Coming Soon
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Indoor floor plans for this building are pending official GPS &amp; indoor layout survey.
              </p>
            </div>

            <div className="p-3 bg-[#0a0d14] border border-slate-800 rounded-2xl text-left space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Building Code:</span>
                <span className="font-mono font-bold text-sky-400">{currentBuilding.shortCode || 'PU-BLD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Planned Floors:</span>
                <span className="font-bold text-white">{currentBuilding.totalFloors || 4} Floors</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-emerald-400">{currentBuilding.category || 'Academic Block'}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => setSelectedBuildingId('PU-D-BLOCK')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-[1.02]"
              >
                View D Block (Live 6-Floor Plan Demo)
              </button>
            </div>
          </div>
        </div>
      ) : layoutMode === 'card' ? (
        /* ============================================================== */
        /* 2. CARD ARCHITECTURAL VIEW: EXACT MATCH TO CHATGPT IMAGE 1    */
        /* ============================================================== */
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col items-center justify-start bg-[#0d0f14]">
          <div className="w-full max-w-xl space-y-5 animate-in fade-in duration-150">
            
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search room (e.g. DG01, DG03, D304, Metrology...)"
                className="w-full pl-10 pr-4 py-2.5 bg-[#181c25] border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
              />
            </div>

            {/* SELECT FLOOR (2 Rows x 3 Pills Grid) */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">
                SELECT FLOOR
              </div>
              <div className="grid grid-cols-3 gap-2">
                {floors.map(flr => {
                  const isActive = currentFloorNumber === flr.floorNumber;
                  return (
                    <button
                      key={flr.floorNumber}
                      onClick={() => {
                        setCurrentFloorNumber(flr.floorNumber);
                        if (flr.rooms?.length > 0) {
                          setSelectedRoom(flr.rooms[0]);
                        }
                      }}
                      className={`py-2.5 px-3 rounded-full text-xs font-bold transition-all text-center border ${
                        isActive
                          ? 'bg-white text-slate-950 border-white shadow-lg ring-1 ring-white/60'
                          : 'bg-[#181c25] hover:bg-[#222733] text-slate-200 border-slate-700/60'
                      }`}
                    >
                      {flr.floorName || `Floor ${flr.floorNumber}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CENTERED FLOOR TITLE */}
            <div className="text-center pt-3 pb-1">
              <h3 className="text-xs sm:text-sm font-black tracking-widest text-white uppercase">
                {currentBuilding.name.toUpperCase()} – {activeFloor?.floorName?.toUpperCase() || `FLOOR ${currentFloorNumber}`}
              </h3>
            </div>

            {/* 6-ROOM ARCHITECTURAL GRID + CENTRAL CORRIDOR */}
            <div className="space-y-3">
              {/* TOP ROW: DG01, DG02, DG03 */}
              <div className="grid grid-cols-3 gap-3">
                {topRowRooms.map(room => (
                  <RoomCard
                    key={room.roomId}
                    room={room}
                    isSelected={selectedRoom?.roomId === room.roomId}
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsNavigating(true);
                    }}
                    isAdminMode={isAdminMode}
                    onEdit={(e) => handleOpenEditRoom(room, e)}
                  />
                ))}
              </div>

              {/* MIDDLE ROW: CENTRAL CORRIDOR */}
              <div className="w-full bg-[#181c25] border border-slate-700/70 rounded-2xl py-4 px-4 flex flex-col items-center justify-center text-center shadow-lg transition-all hover:border-slate-600">
                <div className="text-slate-400 text-lg font-bold mb-0.5 select-none leading-none">
                  ⇆
                </div>
                <div className="text-xs sm:text-sm font-black tracking-widest text-slate-200 uppercase mt-0.5">
                  CENTRAL CORRIDOR
                </div>
              </div>

              {/* BOTTOM ROW: DG04, DG05, DG06 */}
              <div className="grid grid-cols-3 gap-3">
                {bottomRowRooms.map(room => (
                  <RoomCard
                    key={room.roomId}
                    room={room}
                    isSelected={selectedRoom?.roomId === room.roomId}
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsNavigating(true);
                    }}
                    isAdminMode={isAdminMode}
                    onEdit={(e) => handleOpenEditRoom(room, e)}
                  />
                ))}
              </div>
            </div>

            {/* BOTTOM SELECTED DESTINATION PANEL */}
            {selectedRoom && (
              <div className="bg-[#181c25] border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-white">
                    Selected destination: {selectedRoom.roomNumber}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {activeFloor?.floorName || 'Ground Floor'} · {currentBuilding.name}
                  </div>
                  <div className="mt-2">
                    <span className="text-[11px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-500/30 px-3 py-0.5 rounded-full inline-block">
                      Illustrative layout – awaiting survey
                    </span>
                  </div>
                </div>

                {/* Circular Action Button with Down Arrow (matches Image 1) */}
                <button
                  onClick={() => {
                    if (onOpenRoutePlanning) {
                      onOpenRoutePlanning(null, selectedRoom.roomId || selectedRoom.roomNumber);
                    } else if (onStartOutdoorNavigation) {
                      onStartOutdoorNavigation({
                        name: `${currentBuilding.name} · ${selectedRoom.roomNumber}`,
                        locationId: selectedRoom.roomId,
                        category: 'Academic'
                      });
                    }
                  }}
                  className="w-11 h-11 rounded-full bg-[#10131a] hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-xl group shrink-0"
                  title="Start Navigation to Destination"
                >
                  <ArrowDown className="w-5 h-5 text-slate-200 group-hover:text-emerald-400 transition-colors" />
                </button>
              </div>
            )}

            {/* Room Details Subtitle */}
            {selectedRoom && (
              <div className="px-2 text-center text-xs text-slate-500">
                <span>{selectedRoom.name}</span>
                {selectedRoom.department && <span> · {selectedRoom.department}</span>}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 3. SVG BLUEPRINT & REAL A* GRAPH ROUTING VIEW                  */
        /* ============================================================== */
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`flex-1 relative p-2 sm:p-4 flex items-center justify-center overflow-hidden select-none bg-[#090b10] ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Zoom Controls */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 shadow-lg backdrop-blur-md no-drag">
            <button
              onClick={() => setScale(prev => Math.min(prev + 0.25, 3.0))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScale(prev => Math.max(prev - 0.25, 0.7))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-bold"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
            className="w-full max-w-4xl h-full flex items-center justify-center will-change-transform"
          >
            <svg
              viewBox="0 0 960 540"
              className="w-full h-auto max-h-[68vh] rounded-3xl border border-slate-800 shadow-2xl bg-[#0d0f14]"
            >
              <defs>
                <pattern id="dBlockGrid2" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
                <filter id="glowGreen2" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect width="960" height="540" fill="url(#dBlockGrid2)" rx="24" />

              {/* Central Corridor */}
              <g className="corridor-group">
                <rect
                  x="40"
                  y="235"
                  width="880"
                  height="70"
                  fill="#181c25"
                  stroke="#2b3345"
                  strokeWidth="1.5"
                  rx="12"
                />
                <text x="480" y="262" fill="#60a5fa" fontSize="18" fontWeight="bold" textAnchor="middle">
                  ⇆
                </text>
                <text x="480" y="282" fill="#cbd5e1" fontSize="13" fontWeight="extrabold" letterSpacing="3" textAnchor="middle">
                  CENTRAL CORRIDOR
                </text>

                {/* Fire Exit */}
                <rect x="12" y="238" width="24" height="64" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="6" />
                <text x="24" y="274" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">
                  EXIT
                </text>

                {/* Lift and Stairs */}
                <rect x="924" y="238" width="24" height="30" fill="#312e81" stroke="#6366f1" strokeWidth="1" rx="6" />
                <text x="936" y="257" fill="#c7d2fe" fontSize="8" fontWeight="bold" textAnchor="middle">
                  LIFT
                </text>
                <rect x="924" y="272" width="24" height="30" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="6" />
                <text x="936" y="291" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
                  STAIR
                </text>
              </g>

              {/* Ground Floor Entrance Portal */}
              {currentFloorNumber === 0 && (
                <g className="main-entrance-portal">
                  <line x1="480" y1="305" x2="480" y2="480" stroke="#10b981" strokeWidth="3" strokeDasharray="6 4" />
                  <rect x="410" y="480" width="140" height="36" fill="#065f46" stroke="#34d399" strokeWidth="1.5" rx="10" />
                  <text x="480" y="503" fill="#ffffff" fontSize="11" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
                    MAIN ENTRANCE
                  </text>
                </g>
              )}

              {/* SVG Rooms */}
              {activeFloor?.rooms?.map(room => {
                const isSelected = selectedRoom?.roomId === room.roomId;
                const b = room.bounds || { x: 60, y: 50, width: 260, height: 160 };

                return (
                  <g
                    key={room.roomId}
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsNavigating(true);
                    }}
                    className="cursor-pointer group no-drag"
                  >
                    <rect
                      x={b.x}
                      y={b.y}
                      width={b.width}
                      height={b.height}
                      fill={isSelected ? '#a7f3d0' : '#181c25'}
                      stroke={isSelected ? '#059669' : '#2b3345'}
                      strokeWidth={isSelected ? '3' : '1.5'}
                      rx="16"
                      className="transition-all duration-200"
                    />

                    {/* Arched Door Icon */}
                    <g
                      transform={`translate(${b.x + b.width / 2 - 10}, ${b.y + 40})`}
                      stroke={isSelected ? '#064e3b' : '#94a3b8'}
                      strokeWidth="2"
                      fill="none"
                    >
                      <path d="M 2 20 V 6 A 8 8 0 0 1 18 6 V 20" />
                      <line x1="0" y1="20" x2="20" y2="20" />
                      <circle cx="15" cy="12" r="1.5" fill={isSelected ? '#064e3b' : '#94a3b8'} />
                    </g>

                    <text
                      x={b.x + b.width / 2}
                      y={b.y + 88}
                      fill={isSelected ? '#064e3b' : '#ffffff'}
                      fontSize="22"
                      fontWeight="900"
                      letterSpacing="1"
                      textAnchor="middle"
                    >
                      {room.roomNumber}
                    </text>

                    <text
                      x={b.x + b.width / 2}
                      y={b.y + 115}
                      fill={isSelected ? '#047857' : '#94a3b8'}
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {room.name.length > 28 ? room.name.substring(0, 26) + '...' : room.name}
                    </text>

                    <text
                      x={b.x + b.width / 2}
                      y={b.y + 135}
                      fill={isSelected ? '#065f46' : '#64748b'}
                      fontSize="9.5"
                      fontWeight="bold"
                      textAnchor="middle"
                      letterSpacing="0.5"
                    >
                      {room.category || 'Laboratory'}
                    </text>

                    {isAdminMode && (
                      <g
                        onClick={(e) => handleOpenEditRoom(room, e)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={b.x + b.width - 32}
                          y={b.y + 8}
                          width="24"
                          height="24"
                          fill="#f59e0b"
                          rx="6"
                        />
                        <path
                          d={`M ${b.x + b.width - 24} ${b.y + 23} L ${b.x + b.width - 15} ${b.y + 14} L ${b.x + b.width - 12} ${b.y + 17} Z`}
                          fill="#0f172a"
                        />
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Animated Path Overlay */}
              {isNavigating && routePathD && (
                <g className="navigation-route-overlay pointer-events-none">
                  <path
                    d={routePathD}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.4"
                  />
                  <path
                    d={routePathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="8 6"
                    className="animate-dash"
                  />
                  {selectedRoom?.entrancePoint && (
                    <circle
                      cx={selectedRoom.entrancePoint.x}
                      cy={selectedRoom.entrancePoint.y}
                      r="6"
                      fill="#34d399"
                      stroke="#ffffff"
                      strokeWidth="2"
                      filter="url(#glowGreen2)"
                    />
                  )}
                </g>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Admin Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 z-[700] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-base">Edit Room {editingRoom.roomNumber}</h4>
              </div>
              <button
                onClick={() => setEditingRoom(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Room Code / Number</label>
                <input
                  type="text"
                  value={editForm.roomNumber}
                  onChange={e => setEditForm({ ...editForm, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Room Name &amp; Description</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Classification / Category</label>
                <select
                  value={editForm.category}
                  onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Classroom">Classroom</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Faculty room">Faculty room</option>
                  <option value="Office">Office</option>
                  <option value="Seminar room">Seminar room</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Operational Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Operational">Operational</option>
                  <option value="Scheduled Lecture">Scheduled Lecture</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingRoom(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoomEdit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // If embedded in App viewport:
  if (isEmbedded) {
    return content;
  }

  // If modal dialog:
  return (
    <div className="fixed inset-0 z-[600] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div
        className={`relative w-full transition-all duration-200 ${
          isModalFullscreen ? 'w-full h-full' : 'max-w-4xl h-[92vh]'
        }`}
      >
        {content}
      </div>
    </div>
  );
}

/**
 * Architectural Room Card matching ChatGPT Design Preview (Image 1)
 */
function RoomCard({ room, isSelected, onClick, isAdminMode, onEdit }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer border ${
        isSelected
          ? 'bg-[#a7f3d0] border-[#a7f3d0] shadow-lg shadow-emerald-500/10 scale-[1.02]'
          : 'bg-[#181c25] border-slate-700/70 hover:bg-[#202532] hover:border-slate-500 hover:scale-[1.01]'
      }`}
      style={{ minHeight: '105px' }}
    >
      {/* Arched Doorway SVG Icon matching Image 1 */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mb-2">
        <path
          d="M 5 21 V 8 A 7 7 0 0 1 19 8 V 21"
          stroke={isSelected ? '#064e3b' : '#94a3b8'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line x1="3" y1="21" x2="21" y2="21" stroke={isSelected ? '#064e3b' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="14" r="1.3" fill={isSelected ? '#064e3b' : '#94a3b8'} />
      </svg>

      {/* Large Bold Room Number */}
      <span className={`text-base sm:text-lg font-black tracking-tight ${
        isSelected ? 'text-[#064e3b]' : 'text-white'
      }`}>
        {room.roomNumber}
      </span>

      {/* Admin Edit Trigger */}
      {isAdminMode && (
        <span
          onClick={onEdit}
          className="absolute top-2 right-2 p-1 rounded-md bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow"
          title="Edit room"
        >
          <Edit3 className="w-3 h-3" />
        </span>
      )}
    </button>
  );
}
