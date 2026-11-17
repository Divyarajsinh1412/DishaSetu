import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Layers,
  MapPin,
  Navigation,
  Accessibility,
  ArrowRight,
  Compass,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  DoorOpen,
  Footprints,
  X,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import {
  fetchIndoorFloors,
  fetchIndoorGraph,
  calculateIndoorRouteApi
} from '../../services/api';

export default function IndoorNavigationModal({
  isOpen,
  onClose,
  initialBuilding = null,
  buildings = [],
  onStartOutdoorNavigation
}) {
  const [selectedBuildingId, setSelectedBuildingId] = useState(() => initialBuilding?.buildingId || initialBuilding?._id || 'bld_cse');
  const [floors, setFloors] = useState([]);
  const [currentFloorNumber, setCurrentFloorNumber] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startNodeId, setStartNodeId] = useState('in_cse_g_ent');
  const [destRoomId, setDestRoomId] = useState('rm_cse_101');
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [activeIndoorRoute, setActiveIndoorRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrSimulator, setShowQrSimulator] = useState(false);
  const [simulatedQrMessage, setSimulatedQrMessage] = useState('');

  // Active Building Object
  const currentBuilding = useMemo(() => {
    return buildings.find(b => b._id === selectedBuildingId || b.buildingId === selectedBuildingId || b.shortCode === 'CSE') || {
      name: 'Computer Science & Engineering Block',
      shortCode: 'CSE',
      description: 'Department of Computer Science & Engineering and AI Innovation Labs.'
    };
  }, [buildings, selectedBuildingId]);

  // Load floors for current building
  useEffect(() => {
    if (!isOpen) return;

    fetchIndoorFloors(selectedBuildingId).then((data) => {
      if (data && data.length > 0) {
        setFloors(data);
        setCurrentFloorNumber(data[0].floorNumber);
      }
    });
  }, [isOpen, selectedBuildingId]);

  // Active Floor Object
  const activeFloor = useMemo(() => {
    return floors.find(f => f.floorNumber === currentFloorNumber) || floors[0] || null;
  }, [floors, currentFloorNumber]);

  // Filtered rooms for directory
  const filteredRooms = useMemo(() => {
    if (!activeFloor?.rooms) return [];
    if (!searchQuery.trim()) return activeFloor.rooms;
    const q = searchQuery.toLowerCase().trim();
    return activeFloor.rooms.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.roomNumber.toLowerCase().includes(q) ||
      (r.department && r.department.toLowerCase().includes(q))
    );
  }, [activeFloor, searchQuery]);

  // Calculate Indoor Route
  const handleCalculateRoute = async () => {
    try {
      const res = await calculateIndoorRouteApi({
        buildingId: selectedBuildingId,
        startNodeId,
        destRoomId,
        accessibleOnly
      });
      if (res) {
        setActiveIndoorRoute(res);
        if (res.isMultiFloor && res.destFloor !== currentFloorNumber) {
          // Switch view to destination floor so user sees target room
          setCurrentFloorNumber(res.destFloor);
        }
      }
    } catch (e) {
      console.warn('Failed to calculate indoor route:', e);
    }
  };

  // Simulate scanning a door QR code plaque
  const handleScanQrCode = (room) => {
    setSelectedRoom(room);
    setStartNodeId(room.roomId || `rm_${room.roomNumber}`);
    setSimulatedQrMessage(`Position localized via QR checkpoint [${room.qrCodeId || room.roomNumber}]: ${room.name}!`);
    setShowQrSimulator(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">{currentBuilding.name}</span>
                {currentBuilding.shortCode && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {currentBuilding.shortCode}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                Presidency University Bengaluru · Multi-Floor Indoor Navigation
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Outdoor Navigation Transition */}
            <button
              onClick={() => {
                onStartOutdoorNavigation({
                  name: currentBuilding.name,
                  shortCode: currentBuilding.shortCode,
                  buildingId: selectedBuildingId
                });
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Walk to Building (Outdoor)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floor Selection Tab Bar */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-xs font-bold text-slate-300">Select Floor:</span>
            {floors.map((floor) => {
              const isActive = floor.floorNumber === currentFloorNumber;
              return (
                <button
                  key={floor.floorId}
                  onClick={() => setCurrentFloorNumber(floor.floorNumber)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 border border-sky-400/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {floor.floorName}
                </button>
              );
            })}
          </div>

          {/* QR Checkpoint Scanner Simulator */}
          <button
            onClick={() => setShowQrSimulator(!showQrSimulator)}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-semibold rounded-xl border border-indigo-500/40 transition-colors shrink-0"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan Door QR Plaque</span>
          </button>
        </div>

        {/* Simulated QR Notification */}
        {simulatedQrMessage && (
          <div className="px-4 py-2 bg-emerald-950/60 border-b border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{simulatedQrMessage}</span>
            </div>
            <button
              onClick={() => setSimulatedQrMessage('')}
              className="text-emerald-400 hover:text-emerald-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Area: Left SVG Floor Plan + Right Guidance & Directory */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left SVG Floor Plan Canvas */}
          <div className="flex-1 relative bg-slate-950 p-4 flex items-center justify-center overflow-auto custom-scrollbar select-none">
            <svg
              viewBox="0 0 760 380"
              className="w-full h-auto max-h-[70vh] rounded-xl border border-slate-800 shadow-2xl bg-[#070d1e]"
            >
              {/* Floor Background Grid */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="760" height="380" fill="url(#grid)" />

              {/* Main Corridor Pathway */}
              <rect x="30" y="140" width="700" height="40" fill="#1e293b" rx="6" />
              <text x="380" y="164" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="2">
                CENTRAL CORRIDOR
              </text>

              {/* Central Ground Entrance Marker */}
              {currentFloorNumber === 0 && (
                <g>
                  <rect x="300" y="250" width="100" height="40" fill="#059669" rx="8" />
                  <text x="350" y="274" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                    MAIN ENTRANCE
                  </text>
                  <line x1="350" y1="250" x2="350" y2="180" stroke="#10b981" strokeWidth="3" strokeDasharray="4 4" />
                </g>
              )}

              {/* Central Elevator */}
              <g>
                <rect x="320" y="200" width="60" height="40" fill="#4f46e5" rx="6" />
                <text x="350" y="224" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  ELEVATOR
                </text>
              </g>

              {/* East Main Staircase */}
              <g>
                <rect x="670" y="130" width="60" height="60" fill="#334155" rx="8" />
                <text x="700" y="164" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
                  STAIRS
                </text>
              </g>

              {/* West Fire Exit Staircase */}
              <g>
                <rect x="15" y="130" width="40" height="60" fill="#991b1b" rx="6" />
                <text x="35" y="164" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">
                  EXIT
                </text>
              </g>

              {/* Rooms Rendered as Polygons/Rectangles */}
              {activeFloor?.rooms?.map((room) => {
                const b = room.bounds || { x: 50, y: 50, width: 140, height: 90 };
                const isSelected = selectedRoom?.roomId === room.roomId || destRoomId === room.roomId;

                return (
                  <g
                    key={room.roomId}
                    onClick={() => {
                      setSelectedRoom(room);
                      setDestRoomId(room.roomId);
                    }}
                    className="cursor-pointer group"
                  >
                    <rect
                      x={b.x}
                      y={b.y}
                      width={b.width}
                      height={b.height}
                      fill={isSelected ? '#1e3a8a' : '#0f172a'}
                      stroke={isSelected ? '#38bdf8' : '#334155'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      rx="8"
                      className="transition-colors group-hover:stroke-sky-400 group-hover:fill-slate-800"
                    />

                    {/* Room Number Badge */}
                    <rect x={b.x + 8} y={b.y + 8} width="44" height="18" fill="#1e293b" rx="4" />
                    <text x={b.x + 30} y={b.y + 21} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {room.roomNumber}
                    </text>

                    {/* Room Name */}
                    <text
                      x={b.x + b.width / 2}
                      y={b.y + b.height / 2 + 10}
                      fill="#e2e8f0"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="group-hover:fill-white"
                    >
                      {room.name.length > 20 ? room.name.substring(0, 18) + '...' : room.name}
                    </text>

                    {/* Door Marker on Corridor */}
                    {room.entrancePoint && (
                      <circle
                        cx={room.entrancePoint.x}
                        cy={room.entrancePoint.y}
                        r="4"
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                );
              })}

              {/* Animated Indoor Walking Route Polyline */}
              {activeIndoorRoute && (
                <g>
                  {/* Visual Route Path on Central Corridor */}
                  <path
                    d={
                      currentFloorNumber === 0
                        ? 'M 350 250 L 350 160 L 120 160'
                        : 'M 350 200 L 350 160 L 125 160'
                    }
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="8 6"
                    className="animate-pulse"
                  />
                  {/* Destination Indicator Pin */}
                  <circle cx="125" cy="160" r="7" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                </g>
              )}
            </svg>

            {/* Bottom Left Legend */}
            <div className="absolute bottom-6 left-6 p-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl flex items-center gap-3 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#0f172a] border border-sky-400"></span>
                <span>Classroom / Lab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600"></span>
                <span>Elevator</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-700"></span>
                <span>Staircase</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600"></span>
                <span>Entrance</span>
              </div>
            </div>
          </div>

          {/* Right Guidance & Directory Panel */}
          <div className="w-88 border-l border-slate-800 flex flex-col bg-slate-950/70 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find room, lab, or faculty office..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Route Action Card */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/50 space-y-2.5">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Indoor Route Planner</span>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 font-normal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accessibleOnly}
                    onChange={(e) => setAccessibleOnly(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
                  />
                  <span>Wheelchair (Elevator only)</span>
                </label>
              </div>

              <div className="text-xs text-slate-300">
                <span className="text-slate-400">Target: </span>
                <span className="font-bold text-sky-400">
                  {selectedRoom?.name || 'Select any room on the floor plan'}
                </span>
              </div>

              <button
                onClick={handleCalculateRoute}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-white" />
                <span>Calculate Indoor Walking Route</span>
              </button>
            </div>

            {/* Active Turn-by-Turn Guidance */}
            {activeIndoorRoute && (
              <div className="p-3 border-b border-slate-800 bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-400">Turn-by-Turn Guidance</span>
                  <span className="text-[11px] font-mono text-white font-bold">
                    {activeIndoorRoute.totalDistanceMeters}m · ~{activeIndoorRoute.estimatedWalkingMinutes} min
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-200">
                  {activeIndoorRoute.instructions?.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 text-[10px] flex items-center justify-center shrink-0 font-bold text-sky-400 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Directory List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 text-xs custom-scrollbar">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Rooms on {activeFloor?.floorName || 'This Floor'}
              </div>
              {filteredRooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => {
                    setSelectedRoom(room);
                    setDestRoomId(room.roomId);
                  }}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    selectedRoom?.roomId === room.roomId
                      ? 'bg-sky-950/60 border border-sky-500/40 text-white'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="text-sky-400 font-mono">[{room.roomNumber}]</span>
                      <span>{room.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {room.category} · {room.department || 'General'}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QR Code Simulator Modal Popup */}
        {showQrSimulator && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  <span>Simulate Room QR Plaque Scan</span>
                </div>
                <button
                  onClick={() => setShowQrSimulator(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                In physical deployment, students scan the QR code plaque next to room doors. Tap any room below to simulate localization:
              </p>

              <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
                {activeFloor?.rooms?.map((room) => (
                  <button
                    key={room.roomId}
                    onClick={() => handleScanQrCode(room)}
                    className="w-full text-left p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-sky-400 mr-2 font-mono">[{room.roomNumber}]</span>
                      <span className="text-slate-200">{room.name}</span>
                    </div>
                    <QrCode className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}