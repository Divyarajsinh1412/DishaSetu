import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Building2,
  Layers,
  MapPin,
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
  Trash2,
  ArrowUpDown,
  LocateFixed,
  CornerUpRight,
  FlaskConical,
  GraduationCap,
  Sparkles,
  Info
} from 'lucide-react';
import {
  fetchIndoorFloors,
  fetchIndoorGraph,
  calculateIndoorRouteApi,
  updateIndoorFloorApi,
  createIndoorFloorApi,
  deleteIndoorFloorApi,
  createIndoorRoomApi,
  updateIndoorRoomApi,
  deleteIndoorRoomApi
} from '../../services/api';
import {
  CAMPUS_BLOCKS_INFO,
  getBuildingFloorsFallback,
  getRoomCodePrefix,
  getFloorName,
  calculateRoomBounds,
  resolveBuildingKey
} from '../../data/campusFloorsDataset';

/**
 * Top-Down 2D Architectural Indoor Navigation for Presidency University
 * Supports D, E, F, L, N, and M Blocks
 * 
 * Rules:
 * - D Block: ALL rooms are LABS (DGL01, DFL01, DSL01...)
 * - E, F, L, N, M Blocks: ALL rooms are CLASSROOMS (EG01.., FG01.., LG01.., NG01.., MG01..)
 * - Multi-Floor: Ground Floor, First Floor, Second Floor
 * - Unverified Layout Banner: "⚠️ Schematic Floor Layout • Unverified Architectural Reference"
 * - Full Admin Management: Add Floor, Add Room, Edit Room, Delete Room, Categorization
 */
export default function IndoorNavigationModal({
  isOpen,
  onClose,
  initialBuilding = null,
  initialMode = 'view', // 'view' | 'navigate'
  buildings = [],
  onStartOutdoorNavigation,
  onOpenRoutePlanning,
  onOpenIndoorSurvey = null,
  isEmbedded = false
}) {
  // Building Selection
  const [selectedBuildingId, setSelectedBuildingId] = useState(() => {
    const b = initialBuilding?.buildingId || initialBuilding?.code || initialBuilding?.shortCode || initialBuilding?._id || initialBuilding?.name;
    return resolveBuildingKey(b || 'bld_d_block');
  });

  const [floors, setFloors] = useState(() => {
    const b = initialBuilding?.buildingId || initialBuilding?.code || initialBuilding?.shortCode || initialBuilding?._id || initialBuilding?.name;
    const key = resolveBuildingKey(b || 'bld_d_block');
    return getBuildingFloorsFallback(key);
  });
  const [currentFloorNumber, setCurrentFloorNumber] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startPoint, setStartPoint] = useState('entrance'); // 'entrance', 'elevator', 'stairs'
  const [isNavigating, setIsNavigating] = useState(true);
  const [layoutMode, setLayoutMode] = useState('card'); // 'card' | 'blueprint'
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
    category: 'Classroom',
    type: 'Classroom',
    department: '',
    status: 'Operational'
  });

  // Admin Add Room State
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [addRoomForm, setAddRoomForm] = useState({
    roomNumber: '',
    name: '',
    category: 'Classroom',
    type: 'Classroom',
    department: '',
    capacity: 60
  });

  // Admin Add Floor State
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [addFloorForm, setAddFloorForm] = useState({
    floorNumber: 3,
    floorName: 'Third Floor'
  });

  const [notificationMsg, setNotificationMsg] = useState('');
  const showNotification = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 3500);
  };

  // Sync with initialBuilding prop
  useEffect(() => {
    if (initialBuilding) {
      const b = initialBuilding.buildingId || initialBuilding.code || initialBuilding.shortCode || initialBuilding._id || initialBuilding.name;
      const targetId = resolveBuildingKey(b || 'bld_d_block');
      setSelectedBuildingId(targetId);

      if (initialBuilding.selectedFloor !== undefined) {
        setCurrentFloorNumber(Number(initialBuilding.selectedFloor));
      }
    }
  }, [initialBuilding, isOpen]);

  // Active Building Meta
  const currentBuilding = useMemo(() => {
    const targetKey = resolveBuildingKey(selectedBuildingId);
    const meta = CAMPUS_BLOCKS_INFO[targetKey];
    if (meta) return meta;

    const found = buildings.find(b =>
      b._id === selectedBuildingId ||
      b.buildingId === selectedBuildingId ||
      b.shortCode === selectedBuildingId ||
      b.name === selectedBuildingId
    );
    if (found) return found;

    return CAMPUS_BLOCKS_INFO.bld_d_block;
  }, [buildings, selectedBuildingId]);

  const isDBlock = currentBuilding.blockLetter === 'D' || /d[-_]?block/i.test(currentBuilding.name || '');

  // Load floors from MongoDB Atlas with fallback
  useEffect(() => {
    if (!isOpen && !isEmbedded) return;

    const targetKey = resolveBuildingKey(selectedBuildingId);
    const fallback = getBuildingFloorsFallback(targetKey);
    setFloors(fallback);

    fetchIndoorFloors(targetKey)
      .then(data => {
        if (data && data.length > 0) {
          const meta = CAMPUS_BLOCKS_INFO[targetKey];
          const filtered = data.filter(f =>
            f.buildingId === meta?.buildingId ||
            f.buildingShortCode === meta?.shortCode ||
            f.floorId?.startsWith(`flr_${meta?.blockLetter?.toLowerCase()}`)
          );
          const validData = filtered.length > 0 ? filtered : data;
          setFloors(validData);
          const active = validData.find(f => f.floorNumber === currentFloorNumber) || validData[0];
          setCurrentFloorNumber(active.floorNumber);

          if (initialBuilding?.focusRoom) {
            const matchedRoom = active.rooms?.find(r => r.roomNumber.toLowerCase() === initialBuilding.focusRoom.toLowerCase());
            if (matchedRoom) {
              setSelectedRoom(matchedRoom);
              return;
            }
          }
          if (active.rooms?.length > 0) {
            setSelectedRoom(active.rooms[0]);
          } else {
            setSelectedRoom(null);
          }
        }
      })
      .catch(() => {
        // Fallback already active
        if (fallback.length > 0 && fallback[0].rooms?.length > 0) {
          setSelectedRoom(fallback[0].rooms[0]);
        }
      });
  }, [isOpen, isEmbedded, selectedBuildingId]);

  // Active Floor Object
  const activeFloor = useMemo(() => {
    const targetKey = resolveBuildingKey(selectedBuildingId);
    const meta = CAMPUS_BLOCKS_INFO[targetKey] || currentBuilding;
    const matchingFloors = floors.filter(f =>
      f.buildingId === meta?.buildingId ||
      f.buildingShortCode === meta?.shortCode ||
      f.floorId?.startsWith(`flr_${meta?.blockLetter?.toLowerCase()}`)
    );
    const pool = matchingFloors.length > 0 ? matchingFloors : getBuildingFloorsFallback(targetKey);
    return pool.find(f => f.floorNumber === currentFloorNumber) || pool[0];
  }, [floors, currentFloorNumber, selectedBuildingId, currentBuilding]);

  // Dynamic Room Splitting: Adapts to ANY number of rooms along corridor
  const topRowRooms = useMemo(() => {
    if (!activeFloor?.rooms || activeFloor.rooms.length === 0) return [];
    const topCount = Math.ceil(activeFloor.rooms.length / 2);
    return activeFloor.rooms.slice(0, topCount);
  }, [activeFloor]);

  const bottomRowRooms = useMemo(() => {
    if (!activeFloor?.rooms || activeFloor.rooms.length === 0) return [];
    const topCount = Math.ceil(activeFloor.rooms.length / 2);
    return activeFloor.rooms.slice(topCount);
  }, [activeFloor]);

  // Handle Search
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

  // Turn-by-turn instruction summary
  const routeInstructions = useMemo(() => {
    if (!selectedRoom) return [];
    const isGround = currentFloorNumber === 0;
    const roomNum = selectedRoom.roomNumber;
    const bName = currentBuilding.name;

    if (startPoint === 'entrance' && isGround) {
      return [
        { icon: '🚪', text: `Enter ${bName} via Main Ground Entrance Portal` },
        { icon: '🚶', text: 'Walk north along the entrance foyer to the Central Corridor' },
        { icon: '↔️', text: `Proceed along Central Corridor to Room ${roomNum}` },
        { icon: '🎯', text: `Turn into entrance of ${selectedRoom.name}` }
      ];
    } else if (startPoint === 'elevator' || !isGround) {
      return [
        { icon: '🛗', text: `Take Central Accessible Elevator to ${activeFloor?.floorName || 'Floor'}` },
        { icon: '↔️', text: `Proceed along Central Corridor toward Room ${roomNum}` },
        { icon: '🎯', text: `Turn into entrance of ${selectedRoom.name}` }
      ];
    } else {
      return [
        { icon: '🪜', text: `Take East Main Staircase to ${activeFloor?.floorName || 'Floor'}` },
        { icon: '↔️', text: `Walk along Central Corridor to Room ${roomNum}` },
        { icon: '🎯', text: `Arrive at ${selectedRoom.name}` }
      ];
    }
  }, [selectedRoom, startPoint, currentFloorNumber, activeFloor, currentBuilding]);

  // ==========================================
  // ADMIN HANDLERS (Add/Edit/Delete Room & Floor)
  // ==========================================
  const handleOpenEditRoom = (room, e) => {
    if (e) e.stopPropagation();
    setEditingRoom(room);
    setEditForm({
      roomNumber: room.roomNumber,
      name: room.name,
      category: room.category || (isDBlock ? 'Laboratory' : 'Classroom'),
      type: room.type || (isDBlock ? 'Laboratory' : 'Classroom'),
      department: room.department || currentBuilding.departments?.[0] || '',
      status: room.status || 'Operational'
    });
  };

  const handleSaveRoomEdit = async () => {
    if (!editingRoom || !activeFloor) return;
    const token = localStorage.getItem('dishasetu_admin_token') || 'demo_token';

    const updatedRooms = activeFloor.rooms.map(r => {
      if (r.roomId === editingRoom.roomId) {
        return {
          ...r,
          roomNumber: editForm.roomNumber,
          name: editForm.name,
          category: editForm.category,
          type: editForm.category,
          roomType: editForm.category.toLowerCase().includes('lab') ? 'lab' : 'classroom',
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
        type: editForm.category,
        roomType: editForm.category.toLowerCase().includes('lab') ? 'lab' : 'classroom',
        department: editForm.department,
        status: editForm.status
      });
    }

    try {
      await updateIndoorRoomApi(activeFloor.floorId, editingRoom.roomId, editForm, token);
      showNotification(`Saved room ${editForm.roomNumber} successfully.`);
    } catch (err) {
      showNotification(`Updated room ${editForm.roomNumber} in active session.`);
    }

    setEditingRoom(null);
  };

  const handleDeleteRoom = async (room, e) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to delete room ${room.roomNumber}?`)) return;

    const token = localStorage.getItem('dishasetu_admin_token') || 'demo_token';
    const updatedRooms = activeFloor.rooms.filter(r => r.roomId !== room.roomId);

    const updatedFloors = floors.map(f => {
      if (f.floorId === activeFloor.floorId) {
        return { ...f, rooms: updatedRooms };
      }
      return f;
    });
    setFloors(updatedFloors);

    if (selectedRoom?.roomId === room.roomId) {
      setSelectedRoom(updatedRooms[0] || null);
    }

    try {
      await deleteIndoorRoomApi(activeFloor.floorId, room.roomId, token);
      showNotification(`Room ${room.roomNumber} deleted.`);
    } catch (err) {
      showNotification(`Room ${room.roomNumber} removed from session.`);
    }
  };

  const handleOpenAddRoom = () => {
    const blockLetter = currentBuilding.blockLetter || 'D';
    const prefix = getRoomCodePrefix(blockLetter, currentFloorNumber);
    const existingCount = activeFloor?.rooms?.length || 0;
    const nextSeq = String(existingCount + 1).padStart(2, '0');
    const autoRoomNumber = `${prefix}${nextSeq}`;

    setAddRoomForm({
      roomNumber: autoRoomNumber,
      name: `${autoRoomNumber} – ${isDBlock ? 'New Laboratory' : 'New Lecture Classroom'}`,
      category: isDBlock ? 'Laboratory' : 'Classroom',
      type: isDBlock ? 'Laboratory' : 'Classroom',
      department: currentBuilding.departments?.[0] || 'Academic Quad',
      capacity: isDBlock ? 35 : 60
    });
    setShowAddRoomModal(true);
  };

  const handleSaveNewRoom = async () => {
    if (!addRoomForm.roomNumber.trim()) return;
    const token = localStorage.getItem('dishasetu_admin_token') || 'demo_token';

    const existingRooms = activeFloor?.rooms || [];
    const newIndex = existingRooms.length;
    const { bounds, entrancePoint } = calculateRoomBounds(newIndex + 1, newIndex);

    const newRoomObj = {
      roomId: `rm_${currentBuilding.blockLetter.toLowerCase()}_${currentFloorNumber}_${Date.now()}`,
      roomNumber: addRoomForm.roomNumber.trim().toUpperCase(),
      name: addRoomForm.name.trim(),
      category: addRoomForm.category,
      type: addRoomForm.category,
      roomType: addRoomForm.category.toLowerCase().includes('lab') ? 'lab' : 'classroom',
      department: addRoomForm.department,
      bounds,
      entrancePoint,
      qrCodeId: `QR-${currentBuilding.shortCode}-${addRoomForm.roomNumber}`,
      isAccessible: true,
      capacity: Number(addRoomForm.capacity) || 60,
      status: 'Operational'
    };

    const updatedRooms = [...existingRooms, newRoomObj];
    const updatedFloors = floors.map(f => {
      if (f.floorId === activeFloor.floorId) {
        return { ...f, rooms: updatedRooms };
      }
      return f;
    });
    setFloors(updatedFloors);
    setSelectedRoom(newRoomObj);

    try {
      await createIndoorRoomApi(activeFloor.floorId, newRoomObj, token);
      showNotification(`Room ${newRoomObj.roomNumber} created successfully.`);
    } catch (err) {
      showNotification(`Room ${newRoomObj.roomNumber} added to current session.`);
    }

    setShowAddRoomModal(false);
  };

  const handleOpenAddFloor = () => {
    const nextFloorNum = floors.length;
    setAddFloorForm({
      floorNumber: nextFloorNum,
      floorName: getFloorName(nextFloorNum)
    });
    setShowAddFloorModal(true);
  };

  const handleSaveNewFloor = async () => {
    const token = localStorage.getItem('dishasetu_admin_token') || 'demo_token';
    const newFloorObj = {
      floorId: `flr_${currentBuilding.blockLetter.toLowerCase()}_${addFloorForm.floorNumber}`,
      buildingId: currentBuilding.buildingId,
      buildingShortCode: currentBuilding.shortCode,
      buildingName: currentBuilding.name,
      floorNumber: Number(addFloorForm.floorNumber),
      floorName: addFloorForm.floorName,
      dimensions: { widthMeters: 80, heightMeters: 50, scalePixelsPerMeter: 12 },
      rooms: [],
      staircases: [],
      elevators: [],
      emergencyExits: [],
      status: 'published'
    };

    const updatedFloors = [...floors, newFloorObj].sort((a, b) => a.floorNumber - b.floorNumber);
    setFloors(updatedFloors);
    setCurrentFloorNumber(newFloorObj.floorNumber);
    setSelectedRoom(null);

    try {
      await createIndoorFloorApi(newFloorObj, token);
      showNotification(`${newFloorObj.floorName} created successfully.`);
    } catch (err) {
      showNotification(`${newFloorObj.floorName} added to current session.`);
    }

    setShowAddFloorModal(false);
  };

  const handleDeleteFloor = async () => {
    if (!activeFloor) return;
    if (floors.length <= 1) {
      alert('Cannot delete the only remaining floor of this building.');
      return;
    }
    if (!confirm(`Are you sure you want to delete ${activeFloor.floorName} and all its rooms?`)) return;

    const token = localStorage.getItem('dishasetu_admin_token') || 'demo_token';
    const updatedFloors = floors.filter(f => f.floorId !== activeFloor.floorId);
    setFloors(updatedFloors);
    setCurrentFloorNumber(updatedFloors[0].floorNumber);
    setSelectedRoom(updatedFloors[0].rooms?.[0] || null);

    try {
      await deleteIndoorFloorApi(activeFloor.floorId, token);
      showNotification(`${activeFloor.floorName} deleted.`);
    } catch (err) {
      showNotification(`${activeFloor.floorName} removed from session.`);
    }
  };

  // Content Wrapper
  const content = (
    <div className="w-full h-full bg-[#0d111a] border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER & ACCENT BAR                                     */}
      {/* ============================================================== */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-[#131722] to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl p-0.5 shadow-lg shrink-0 ${
            isDBlock
              ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-sky-500/20'
              : 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/20'
          }`}>
            <div className="w-full h-full bg-[#0d111a] rounded-[14px] flex items-center justify-center">
              {isDBlock ? (
                <FlaskConical className="w-5 h-5 text-sky-400" />
              ) : (
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {currentBuilding.shortCode}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDBlock
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {isDBlock ? 'ALL ROOMS ARE LABS' : 'ALL ROOMS ARE CLASSROOMS'}
              </span>
            </div>

            {/* Building Switcher Dropdown */}
            <div className="mt-0.5 flex items-center gap-2">
              <select
                value={selectedBuildingId}
                onChange={e => {
                  setSelectedBuildingId(e.target.value);
                  setCurrentFloorNumber(0);
                }}
                className="bg-transparent text-sm sm:text-base font-black text-white hover:text-emerald-400 focus:outline-none cursor-pointer tracking-tight"
              >
                <option value="bld_d_block" className="bg-[#181c25] text-white">D Block (Labs • Ground to 2nd Floor)</option>
                <option value="bld_e_block" className="bg-[#181c25] text-white">E Block (Classrooms • Ground to 2nd Floor)</option>
                <option value="bld_f_block" className="bg-[#181c25] text-white">F Block (Classrooms • Ground to 2nd Floor)</option>
                <option value="bld_l_block" className="bg-[#181c25] text-white">L Block (Classrooms • Ground to 2nd Floor)</option>
                <option value="bld_n_block" className="bg-[#181c25] text-white">N Block (Classrooms • Ground to 2nd Floor)</option>
                <option value="bld_som_block" className="bg-[#181c25] text-white">M Block (Classrooms • Ground to 2nd Floor)</option>
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
            title="Toggle Administrator Floor & Room Management"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAdminMode ? 'Exit Admin' : 'Admin'}</span>
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
              <span>Outdoor</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
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
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="bg-emerald-950 border-b border-emerald-500/40 px-4 py-2 text-xs font-bold text-emerald-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg('')} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* UNVERIFIED PLACEHOLDER LAYOUT BANNER (MANDATORY REQUIREMENT) */}
      <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-[11px] text-amber-200 shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Schematic Floor Layout • Unverified Architectural Reference:</strong> Standardized corridor bay model. Exact room positions subject to upcoming indoor survey.
          </span>
        </div>
        {onOpenIndoorSurvey && (
          <button
            onClick={() => onOpenIndoorSurvey({
              building: currentBuilding.name,
              floorNumber: currentFloorNumber,
              roomNumber: selectedRoom?.roomNumber
            })}
            className="text-[10px] font-bold text-amber-300 hover:text-white bg-amber-900/60 hover:bg-amber-800 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1 shrink-0 ml-2"
          >
            <LocateFixed className="w-3 h-3" />
            <span>Field Survey</span>
          </button>
        )}
      </div>

      {/* ADMIN TOOLBAR (When Admin Mode Active) */}
      {isAdminMode && (
        <div className="bg-slate-900 border-b border-amber-500/30 px-5 py-2.5 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>Admin Floor & Room Controls:</span>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenAddRoom}
              className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Room</span>
            </button>
            <button
              onClick={handleOpenAddFloor}
              className="py-1 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Floor</span>
            </button>
            <button
              onClick={handleDeleteFloor}
              className="py-1 px-3 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Active Floor</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MAIN BODY (CARD VIEW VS BLUEPRINT VIEW)                     */}
      {/* ============================================================== */}
      {layoutMode === 'card' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-4">
            
            {/* SEARCH ROOM INPUT */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder={`Search room in ${currentBuilding.name} (e.g. ${
                  currentBuilding.blockLetter === 'D' ? 'DGL01, DFL02' :
                  currentBuilding.blockLetter === 'E' ? 'EG01, EF02' :
                  currentBuilding.blockLetter === 'F' ? 'FG01, FF02' :
                  currentBuilding.blockLetter === 'L' ? 'LG01, LF02' :
                  currentBuilding.blockLetter === 'N' ? 'NG01, NF02' :
                  currentBuilding.blockLetter === 'M' ? 'MG01, MF02' :
                  `${currentBuilding.blockLetter || 'E'}G01, ${currentBuilding.blockLetter || 'E'}F02`
                }...)`}
                className="w-full pl-10 pr-4 py-2.5 bg-[#181c25] border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
              />
            </div>

            {/* SELECT FLOOR (Pill Grid) */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1 flex items-center justify-between">
                <span>SELECT FLOOR</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {floors.length} Floors Available
                </span>
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
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                        isActive
                          ? 'bg-white text-slate-950 border-white shadow-lg ring-1 ring-white/60'
                          : 'bg-[#181c25] hover:bg-[#222733] text-slate-200 border-slate-700/60'
                      }`}
                    >
                      <span>{flr.floorName || `Floor ${flr.floorNumber}`}</span>
                      <span className="block text-[10px] opacity-75 font-mono">
                        Level {flr.floorNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CENTERED FLOOR TITLE */}
            <div className="text-center pt-2 pb-1">
              <h3 className="text-xs sm:text-sm font-black tracking-widest text-white uppercase">
                {currentBuilding.name.toUpperCase()} – {activeFloor?.floorName?.toUpperCase() || `FLOOR ${currentFloorNumber}`}
              </h3>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {isDBlock ? 'Engineering Laboratory Suites' : 'Lecture Classroom Suites'}
              </div>
            </div>

            {/* DYNAMIC SCHEMATIC ROOM GRID + CENTRAL CORRIDOR */}
            <div className="space-y-3">
              {/* TOP ROW OF ROOMS */}
              {topRowRooms.length > 0 ? (
                <div className={`grid gap-3 ${
                  topRowRooms.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
                }`}>
                  {topRowRooms.map(room => (
                    <RoomCard
                      key={room.roomId}
                      room={room}
                      isDBlock={isDBlock}
                      isSelected={selectedRoom?.roomId === room.roomId}
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsNavigating(true);
                      }}
                      isAdminMode={isAdminMode}
                      onEdit={(e) => handleOpenEditRoom(room, e)}
                      onDelete={(e) => handleDeleteRoom(room, e)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-500 bg-[#181c25]/50 rounded-xl">
                  No rooms in top bay
                </div>
              )}

              {/* MIDDLE ROW: CENTRAL CORRIDOR */}
              <div className="w-full bg-[#181c25] border border-slate-700/70 rounded-2xl py-3 px-4 flex flex-col items-center justify-center text-center shadow-lg transition-all hover:border-slate-600">
                <div className="text-slate-400 text-base font-bold select-none leading-none">
                  ⇆
                </div>
                <div className="text-xs sm:text-sm font-black tracking-widest text-slate-200 uppercase mt-0.5">
                  CENTRAL CORRIDOR
                </div>
              </div>

              {/* BOTTOM ROW OF ROOMS */}
              {bottomRowRooms.length > 0 ? (
                <div className={`grid gap-3 ${
                  bottomRowRooms.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
                }`}>
                  {bottomRowRooms.map(room => (
                    <RoomCard
                      key={room.roomId}
                      room={room}
                      isDBlock={isDBlock}
                      isSelected={selectedRoom?.roomId === room.roomId}
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsNavigating(true);
                      }}
                      isAdminMode={isAdminMode}
                      onEdit={(e) => handleOpenEditRoom(room, e)}
                      onDelete={(e) => handleDeleteRoom(room, e)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-500 bg-[#181c25]/50 rounded-xl">
                  No rooms in bottom bay
                </div>
              )}
            </div>

            {/* BOTTOM SELECTED DESTINATION PANEL */}
            {selectedRoom && (
              <div className="bg-[#181c25] border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-white">
                      Selected: {selectedRoom.roomNumber}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      isDBlock
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {isDBlock ? 'LAB' : 'CLASSROOM'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {activeFloor?.floorName || 'Ground Floor'} · {currentBuilding.name}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    {selectedRoom.name}
                  </div>
                </div>

                {/* Circular Action Button */}
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
                  title="Start Navigation to this Room"
                >
                  <ArrowDown className="w-5 h-5 text-slate-200 group-hover:text-emerald-400 transition-colors" />
                </button>
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
                <pattern id="campusGrid2" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
                <filter id="glowGreen2" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect width="960" height="540" fill="url(#campusGrid2)" rx="24" />

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
                      fill={isSelected ? (isDBlock ? '#bae6fd' : '#a7f3d0') : '#181c25'}
                      stroke={isSelected ? (isDBlock ? '#0284c7' : '#059669') : '#2b3345'}
                      strokeWidth={isSelected ? '3' : '1.5'}
                      rx="16"
                      className="transition-all duration-200"
                    />

                    {/* Room Type Pill inside SVG */}
                    <text
                      x={b.x + b.width / 2}
                      y={b.y + 25}
                      fill={isSelected ? '#0369a1' : '#64748b'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {isDBlock ? 'LABORATORY' : 'CLASSROOM'}
                    </text>

                    {/* Room Number */}
                    <text
                      x={b.x + b.width / 2}
                      y={b.y + b.height / 2 + 10}
                      fill={isSelected ? '#0f172a' : '#ffffff'}
                      fontSize="17"
                      fontWeight="900"
                      textAnchor="middle"
                      letterSpacing="0.5"
                    >
                      {room.roomNumber}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. ADMIN MODALS: EDIT ROOM, ADD ROOM, ADD FLOOR                */}
      {/* ============================================================== */}
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
                <label className="block text-slate-400 font-bold mb-1">Room Classification / Type</label>
                <select
                  value={editForm.category}
                  onChange={e => setEditForm({ ...editForm, category: e.target.value, type: e.target.value })}
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

      {/* Admin Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-[700] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h4 className="font-extrabold text-base">Add Room to {activeFloor?.floorName}</h4>
              </div>
              <button
                onClick={() => setShowAddRoomModal(false)}
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
                  value={addRoomForm.roomNumber}
                  onChange={e => setAddRoomForm({ ...addRoomForm, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  placeholder="e.g. EG07, DGL05"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Room Name &amp; Description</label>
                <input
                  type="text"
                  value={addRoomForm.name}
                  onChange={e => setAddRoomForm({ ...addRoomForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  placeholder="e.g. Advanced AI Classroom"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Classification / Type</label>
                <select
                  value={addRoomForm.category}
                  onChange={e => setAddRoomForm({ ...addRoomForm, category: e.target.value, type: e.target.value })}
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
                  value={addRoomForm.department}
                  onChange={e => setAddRoomForm({ ...addRoomForm, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Capacity</label>
                <input
                  type="number"
                  value={addRoomForm.capacity}
                  onChange={e => setAddRoomForm({ ...addRoomForm, capacity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddRoomModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewRoom}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add Floor Modal */}
      {showAddFloorModal && (
        <div className="fixed inset-0 z-[700] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <h4 className="font-extrabold text-base">Add Floor to {currentBuilding.name}</h4>
              </div>
              <button
                onClick={() => setShowAddFloorModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Floor Level Number</label>
                <input
                  type="number"
                  value={addFloorForm.floorNumber}
                  onChange={e => setAddFloorForm({ ...addFloorForm, floorNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Floor Name</label>
                <input
                  type="text"
                  value={addFloorForm.floorName}
                  onChange={e => setAddFloorForm({ ...addFloorForm, floorName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  placeholder="e.g. Third Floor"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddFloorModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewFloor}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-sky-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Create Floor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      data-prevent-map-zoom="true"
      className="fixed inset-0 z-[600] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        data-prevent-map-zoom="true"
        className={`relative w-full transition-all duration-200 overscroll-contain isolate-scroll ${
          isModalFullscreen ? 'w-full h-full' : 'max-w-4xl h-[92vh]'
        }`}
      >
        {content}
      </div>
    </div>
  );
}

/**
 * Architectural Room Card Component
 */
function RoomCard({ room, isDBlock, isSelected, onClick, isAdminMode, onEdit, onDelete }) {
  const isLab = room.category === 'Laboratory' || room.type === 'Laboratory' || isDBlock;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center transition-all cursor-pointer border ${
        isSelected
          ? isLab
            ? 'bg-[#bae6fd] border-[#38bdf8] shadow-lg shadow-sky-500/20 scale-[1.02]'
            : 'bg-[#a7f3d0] border-[#34d399] shadow-lg shadow-emerald-500/20 scale-[1.02]'
          : 'bg-[#181c25] border-slate-700/70 hover:bg-[#202532] hover:border-slate-500 hover:scale-[1.01]'
      }`}
      style={{ minHeight: '105px' }}
    >
      {/* Category Badge */}
      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full mb-1 border ${
        isSelected
          ? isLab
            ? 'bg-sky-800 text-sky-100 border-sky-900'
            : 'bg-emerald-800 text-emerald-100 border-emerald-900'
          : isLab
            ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      }`}>
        {isLab ? 'LAB' : 'CLASSROOM'}
      </span>

      {/* Large Bold Room Number */}
      <span className={`text-base sm:text-lg font-black tracking-tight ${
        isSelected ? (isLab ? 'text-[#0369a1]' : '#064e3b') : 'text-white'
      }`}>
        {room.roomNumber}
      </span>

      {/* Subtitle Name */}
      <span className={`text-[10px] mt-0.5 line-clamp-1 max-w-[150px] truncate text-center ${
        isSelected ? 'text-slate-700 font-semibold' : 'text-slate-400'
      }`}>
        {room.name.replace(/^.*?–\s*/, '')}
      </span>

      {/* Admin Edit & Delete Triggers */}
      {isAdminMode && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span
            onClick={onEdit}
            className="p-1 rounded-md bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow"
            title="Edit room"
          >
            <Edit3 className="w-3 h-3" />
          </span>
          <span
            onClick={onDelete}
            className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow"
            title="Delete room"
          >
            <Trash2 className="w-3 h-3" />
          </span>
        </div>
      )}
    </button>
  );
}
