import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  MapPin,
  Map as MapIcon,
  Navigation as NavigationIcon,
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
  Info,
  FlaskConical,
  BookOpen,
  DoorOpen,
  ArrowRight
} from 'lucide-react';
import {
  fetchIndoorFloors
} from '../../services/api';
import StaffRoomCabinMapModal from '../indoor/StaffRoomCabinMapModal';
import {
  getBuildingFloorsFallback,
  CAMPUS_BLOCKS_INFO,
  resolveBuildingKey
} from '../../data/campusFloorsDataset';

/**
 * DishaSetu: Universal Interactive Building Details, Floor Browser & Room Inspector
 * 
 * Interactive Workflow:
 * 1. Open building details.
 * 2. Show available floors (Ground Floor, First Floor, Second Floor...).
 * 3. Allow selecting a floor.
 * 4. Display rooms on that floor.
 * 5. Allow clicking a room.
 * 6. Show room ID, room type (LAB for D block, CLASSROOM for others), block, and floor.
 * 7. Provide direct navigation to the selected room.
 */
export default function BuildingPopupModal({
  isOpen,
  building,
  onClose,
  onOpenIndoorMap,
  onStartIndoorNavigation,
  onStartOutdoorNavigation
}) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [floors, setFloors] = useState([]);
  const [selectedFloorNumber, setSelectedFloorNumber] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [showStaffRoomModal, setShowStaffRoomModal] = useState(false);

  const targetKey = resolveBuildingKey(building?.buildingId || building?.code || building?.shortCode || building?.name || building?.featureId || 'bld_d_block');
  const bId = targetKey;

  // Load floor and room structures for this building
  useEffect(() => {
    if (!isOpen || !building) return;

    const fallbackFloors = getBuildingFloorsFallback(targetKey);
    setFloors(fallbackFloors);
    setSelectedFloorNumber(0);
    if (fallbackFloors.length > 0 && fallbackFloors[0].rooms?.length > 0) {
      setSelectedRoom(fallbackFloors[0].rooms[0]);
    } else {
      setSelectedRoom(null);
    }

    setIsLoadingFloors(true);
    fetchIndoorFloors(targetKey)
      .then((data) => {
        if (data && data.length > 0) {
          const meta = CAMPUS_BLOCKS_INFO[targetKey];
          const filtered = data.filter(f =>
            f.buildingId === meta?.buildingId ||
            f.buildingShortCode === meta?.shortCode ||
            f.floorId?.startsWith(`flr_${meta?.blockLetter?.toLowerCase()}`)
          );
          const validData = filtered.length > 0 ? filtered : data;
          setFloors(validData);
          const gFloor = validData.find(f => f.floorNumber === 0) || validData[0];
          setSelectedFloorNumber(gFloor.floorNumber);
          if (gFloor.rooms?.length > 0) {
            setSelectedRoom(gFloor.rooms[0]);
          }
        }
      })
      .catch(() => {
        // Fallback already set
      })
      .finally(() => {
        setIsLoadingFloors(false);
      });
  }, [isOpen, building, targetKey]);

  if (!isOpen || !building) return null;

  // Active Floor & Rooms
  const currentFloor = floors.find(f => f.floorNumber === selectedFloorNumber) || floors[0];
  const roomsOnFloor = currentFloor?.rooms || [];

  // Determine Block Info
  const blockMeta = CAMPUS_BLOCKS_INFO[targetKey];
  const isDBlock = blockMeta ? blockMeta.blockLetter === 'D' : (/d[-_ ]?block/i.test(building.name || '') ||
                   building.shortCode === 'PU-D-BLOCK' ||
                   building.buildingId === 'bld_d_block');

  const buildingCode = building.shortCode || building.code || 'PU-BLD';
  const category = building.category || 'Academic Block';
  const totalFloors = floors.length || building.totalFloors || 3;
  const departments = building.departments || [
    'Instructional Classrooms',
    'Specialized Engineering Laboratories',
    'Faculty Workspaces'
  ];

  const coords = building.coordinates || building.entranceCoordinates || { lat: 13.1706, lng: 77.5358 };

  const handleSelectFloor = (flrNumber) => {
    setSelectedFloorNumber(flrNumber);
    const flr = floors.find(f => f.floorNumber === flrNumber);
    if (flr && flr.rooms?.length > 0) {
      setSelectedRoom(flr.rooms[0]);
    } else {
      setSelectedRoom(null);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    const isSR = room.category === 'Staff Room' || room.type === 'Staff Room' || room.roomNumber?.toLowerCase().includes('staff') || room.roomNumber?.includes('SR') || room.category === 'Office' || room.roomNumber?.toLowerCase().includes('dean');
    if (isSR) {
      setShowStaffRoomModal(true);
    }
  };

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      data-prevent-map-zoom="true"
      className="fixed inset-0 z-[550] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        data-prevent-map-zoom="true"
        className="relative w-full max-w-xl bg-[#0b132b] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overscroll-contain isolate-scroll"
      >
        
        {/* Top Header with Accent Gradient */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border-b border-slate-800 flex items-start justify-between gap-3 shrink-0">
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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{totalFloors} Floors Available</span>
                </span>
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

        {/* Modal Scrollable Body */}
        <div
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          data-prevent-map-zoom="true"
          className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1 overscroll-contain isolate-scroll"
        >
          
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
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Room Type</span>
              <span className={`text-xs font-black mt-1 flex items-center justify-center gap-1 ${
                isDBlock ? 'text-sky-400' : 'text-emerald-400'
              }`}>
                {isDBlock ? (
                  <>
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>ALL LABS</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>CLASSROOMS</span>
                  </>
                )}
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

          {/* ============================================================== */}
          {/* FLOOR-WISE ROOM SELECTION HUB (STEP 2, 3, 4, 5, 6)              */}
          {/* ============================================================== */}
          <div className="bg-[#101935]/90 border border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-black tracking-wider uppercase text-slate-200">
                  Select Floor
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {roomsOnFloor.length} Rooms Available
              </span>
            </div>

            {/* Floor Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {floors.map((flr) => {
                const isActive = selectedFloorNumber === flr.floorNumber;
                return (
                  <button
                    key={flr.floorNumber}
                    onClick={() => handleSelectFloor(flr.floorNumber)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30 ring-1 ring-sky-300'
                        : 'bg-[#182348] hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <span>{flr.floorName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                      Level {flr.floorNumber}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Rooms on this Floor */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
                <span>Rooms on {currentFloor?.floorName || 'Floor'}:</span>
                <span className="text-[10px] text-amber-300/90 font-medium">Click a room to view details</span>
              </div>

              {roomsOnFloor.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {roomsOnFloor.map((rm) => {
                    const isSelected = selectedRoom?.roomId === rm.roomId;
                    const isLab = rm.category === 'Laboratory' || rm.type === 'Laboratory' || isDBlock;
                    const isStaffRoom = rm.category === 'Staff Room' || rm.type === 'Staff Room' || rm.roomNumber?.toLowerCase().includes('staff') || rm.roomNumber?.includes('SR');
                    const isOffice = rm.category === 'Office' || rm.type === 'Office' || rm.roomNumber?.toLowerCase().includes('dean') || rm.roomNumber?.includes('DEAN');
                    const badgeText = isLab ? 'LAB' : isStaffRoom ? 'STAFF ROOM' : isOffice ? 'OFFICE' : 'CLASSROOM';

                    return (
                      <button
                        key={rm.roomId}
                        onClick={() => handleSelectRoom(rm)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? isLab
                              ? 'bg-sky-950/80 border-sky-400 shadow-md shadow-sky-500/20 ring-1 ring-sky-400'
                              : isStaffRoom
                              ? 'bg-amber-950/80 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                              : isOffice
                              ? 'bg-purple-950/80 border-purple-400 shadow-md shadow-purple-500/20 ring-1 ring-purple-400'
                              : 'bg-emerald-950/80 border-emerald-400 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400'
                            : 'bg-[#182348]/70 hover:bg-[#1e2c5a] border-slate-700/60'
                        }`}
                        style={{ minHeight: '68px' }}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className={`text-xs font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                            {rm.roomNumber}
                          </span>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full border ${
                            isLab
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : isStaffRoom
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : isOffice
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}>
                            {badgeText}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate line-clamp-1">
                          {rm.name.replace(/^.*?–\s*/, '')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
                  No rooms cataloged on this floor yet. Admin can add rooms via Admin Editor.
                </div>
              )}
            </div>

            {/* Selected Room Inspector Card (Requirements 5 & 6) */}
            {selectedRoom && (
              <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-[#131d3b] to-slate-900 border border-slate-700 shadow-xl space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">
                        {selectedRoom.roomNumber}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        selectedRoom.category === 'Laboratory' || isDBlock
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : selectedRoom.category === 'Staff Room' || selectedRoom.roomNumber?.toLowerCase().includes('staff') || selectedRoom.roomNumber?.includes('SR')
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : selectedRoom.category === 'Office' || selectedRoom.roomNumber?.toLowerCase().includes('dean') || selectedRoom.roomNumber?.includes('DEAN')
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {selectedRoom.category === 'Laboratory' || isDBlock
                          ? 'LAB'
                          : selectedRoom.category === 'Staff Room' || selectedRoom.roomNumber?.toLowerCase().includes('staff') || selectedRoom.roomNumber?.includes('SR')
                          ? 'STAFF ROOM'
                          : selectedRoom.category === 'Office' || selectedRoom.roomNumber?.toLowerCase().includes('dean') || selectedRoom.roomNumber?.includes('DEAN')
                          ? 'OFFICE'
                          : 'CLASSROOM'}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-300 mt-0.5">
                      {selectedRoom.name}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Floor {selectedFloorNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800 text-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Building / Block</span>
                    <span className="font-semibold text-slate-200">{building.name} ({buildingCode})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Floor Level</span>
                    <span className="font-semibold text-slate-200">{currentFloor?.floorName || 'Ground Floor'}</span>
                  </div>
                </div>

                {/* Staff Room Interactive Layout Button */}
                {(selectedRoom.category === 'Staff Room' || selectedRoom.type === 'Staff Room' || selectedRoom.roomNumber?.toLowerCase().includes('staff') || selectedRoom.roomNumber?.includes('SR') || selectedRoom.category === 'Office' || selectedRoom.roomNumber?.toLowerCase().includes('dean')) && (
                  <button
                    type="button"
                    onClick={() => setShowStaffRoomModal(true)}
                    className="w-full mt-2 py-2.5 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs rounded-xl shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>OPEN INTERACTIVE CABIN MAP & LIVE FACULTY AVAILABILITY</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Direct Room Navigation Button (Requirement 7) */}
                <button
                  type="button"
                  onClick={() => {
                    if (onStartIndoorNavigation) {
                      onStartIndoorNavigation(building, selectedRoom);
                    } else if (onOpenIndoorMap) {
                      onOpenIndoorMap({
                        ...building,
                        focusRoom: selectedRoom.roomNumber,
                        selectedFloor: selectedFloorNumber
                      });
                    }
                    onClose();
                  }}
                  className="w-full mt-2 py-2.5 px-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-sky-900/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
                >
                  <NavigationIcon className="w-3.5 h-3.5" />
                  <span>NAVIGATE TO ROOM {selectedRoom.roomNumber}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            {building.description ||
              `${building.name} is a premier educational facility at Presidency University Bengaluru housing classrooms, research laboratories, and faculty offices across ${totalFloors} floors.`}
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

          {/* GPS Coordinates & Entrance Info */}
          <div className="px-3.5 py-2.5 rounded-xl bg-[#070e22] border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Building GPS:</span>
            <span className="text-slate-200">
              {coords.lat?.toFixed(6) || '13.170600'}°N, {coords.lng?.toFixed(6) || '77.535800'}°E
            </span>
          </div>
        </div>

        {/* Action Buttons Hub */}
        <div className="p-5 bg-[#070e22] border-t border-slate-800 space-y-2.5 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* BUTTON 1: OPEN INDOOR MAP */}
            <button
              onClick={() => {
                onOpenIndoorMap({
                  ...building,
                  selectedFloor: selectedFloorNumber,
                  focusRoom: selectedRoom?.roomNumber
                });
                onClose();
              }}
              className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Open the full multi-floor architectural schematic map"
            >
              <MapIcon className="w-4 h-4 text-emerald-200" />
              <span>OPEN FULL FLOOR MAP</span>
            </button>

            {/* BUTTON 2: START INDOOR NAVIGATION */}
            <button
              onClick={() => {
                onStartIndoorNavigation(building, selectedRoom);
                onClose();
              }}
              className="py-3 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Open indoor navigation and search for rooms in this building"
            >
              <NavigationIcon className="w-4 h-4 text-sky-200" />
              <span>START ROOM NAVIGATION</span>
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

      {/* Interactive Staff Room Cabin Map & Live Faculty Availability Modal */}
      {showStaffRoomModal && (
        <StaffRoomCabinMapModal
          isOpen={showStaffRoomModal}
          onClose={() => setShowStaffRoomModal(false)}
          onSelectFloor={(flr) => {
            setShowStaffRoomModal(false);
            handleSelectFloor(flr);
          }}
          onNavigateToLocation={(locName) => {
            setShowStaffRoomModal(false);
            onClose();
            if (onStartOutdoorNavigation) {
              onStartOutdoorNavigation({ name: locName, shortCode: locName });
            }
          }}
          initialRoomId="sr_e_block_01"
        />
      )}
    </div>
  );
}
