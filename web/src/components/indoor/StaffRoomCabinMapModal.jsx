import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  Users,
  Clock,
  MapPin,
  Calendar,
  BookOpen,
  Briefcase,
  CheckCircle2,
  XCircle,
  Footprints,
  Navigation,
  RefreshCw,
  X,
  Layers,
  ChevronRight
} from 'lucide-react';
import { fetchStaffRoomById, updateFacultyStatusApi } from '../../services/api';

export default function StaffRoomCabinMapModal({
  isOpen,
  onClose,
  onSelectFloor,
  onNavigateToLocation,
  initialRoomId = 'sr_e_block_01'
}) {
  const [staffRoom, setStaffRoom] = useState(null);
  const [selectedCabin, setSelectedCabin] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch staff room layout and faculty statuses
  const loadStaffRoom = async () => {
    const data = await fetchStaffRoomById(initialRoomId);
    if (data) {
      setStaffRoom(data);
      // Default select SR-03 (Faizan Anwar Khan) to match the reference mockup
      if (!selectedCabin && data.cabins) {
        const defaultCabin = data.cabins.find(c => c.cabinId === 'SR-03') || data.cabins[0];
        setSelectedCabin(defaultCabin);
        setSelectedFaculty(defaultCabin.faculty || null);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStaffRoom();
    }
  }, [isOpen, initialRoomId]);

  if (!isOpen) return null;

  const cabins = staffRoom?.cabins || [];

  // Categorize cabins into the 3 rows
  const row1 = cabins.filter(c => c.row === 1);
  const row2 = cabins.filter(c => c.row === 2);
  const row3 = cabins.filter(c => c.row === 3);

  const availableCount = cabins.filter(c => c.type === 'cabin' && c.status === 'Available').length || 6;
  const unavailableCount = cabins.filter(c => c.type === 'cabin' && c.status === 'Unavailable').length || 4;

  const handleCabinClick = (cabin) => {
    if (cabin.type === 'walking_area' || cabin.type === 'lounge_entry') return;
    setSelectedCabin(cabin);
    setSelectedFaculty(cabin.faculty || null);
  };

  // Toggle Live Availability (Available ↔ Unavailable)
  const handleToggleStatus = async () => {
    if (!selectedFaculty) return;
    const newStatus = selectedFaculty.currentStatus === 'Available' ? 'Unavailable' : 'Available';
    setIsUpdatingStatus(true);
    try {
      const payload = {
        status: newStatus,
        currentActivity: newStatus === 'Available' ? 'In Cabin' : 'Taking Lecture',
        currentLocation: newStatus === 'Available' ? 'Staff Room 01' : (selectedFaculty.currentClassLocation || 'E Block – EF03'),
        nextAvailability: newStatus === 'Available' ? 'Available Now' : 'Check Schedule'
      };
      await updateFacultyStatusApi(selectedFaculty.facultyId, payload);
      await loadStaffRoom();

      setSelectedFaculty(prev => ({
        ...prev,
        currentStatus: newStatus,
        currentActivity: payload.currentActivity,
        currentLocation: payload.currentLocation
      }));
    } catch (err) {
      console.error('Failed to update faculty status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[600] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      <div className="relative w-full max-w-7xl bg-[#F8FAFC] text-slate-800 rounded-3xl shadow-2xl flex flex-col border border-slate-300 overflow-hidden my-auto max-h-[96vh]">
        
        {/* ======================================================== */}
        {/* 1. TOP HEADER BAR                                        */}
        {/* ======================================================== */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200"
              title="Return to Building View"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-slate-700">
              <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">
                E Block <span className="text-slate-400 mx-1">›</span> Staff Room 01
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Status • {currentTime || '10:24 AM'}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. MAIN CONTENT (FLOOR MAP + FACULTY SIDEBAR)            */}
        {/* ======================================================== */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT 8 COLS: ARCHITECTURAL FLOOR PLAN */}
          <div className="lg:col-span-8 flex flex-col items-center">
            
            {/* Top Room Name Pill */}
            <div className="mb-3 px-5 py-1.5 rounded-full bg-[#1E293B] text-white text-xs font-bold flex items-center gap-2 shadow-md">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Staff Room 01</span>
            </div>

            {/* THE ARCHITECTURAL FLOOR CONTAINER */}
            <div className="w-full bg-[#F1F5F9] border-4 border-[#1E293B] rounded-2xl p-4 shadow-xl relative">
              
              {/* ROW 1: CABINS SR-01, SR-02, WALKING, SR-03, SR-04 */}
              <div className="grid grid-cols-5 gap-3 mb-3">
                {row1.map(cabin => renderCabinCard(cabin))}
              </div>

              {/* CORRIDOR 1 AISLE */}
              <div className="w-full py-2 bg-[#E2E8F0] border-y-2 border-slate-300 rounded-lg flex items-center justify-center my-3 text-[11px] font-black tracking-[0.3em] text-slate-500 uppercase select-none">
                W A L K I N G &nbsp; A R E A
              </div>

              {/* ROW 2: CABINS SR-05, SR-06, WALKING, SR-07, SR-08 */}
              <div className="grid grid-cols-5 gap-3 mb-3">
                {row2.map(cabin => renderCabinCard(cabin))}
              </div>

              {/* CORRIDOR 2 AISLE */}
              <div className="w-full py-2 bg-[#E2E8F0] border-y-2 border-slate-300 rounded-lg flex items-center justify-center my-3 text-[11px] font-black tracking-[0.3em] text-slate-500 uppercase select-none">
                W A L K I N G &nbsp; A R E A
              </div>

              {/* ROW 3: ENTRY & LOUNGE, SR-09, SR-10, DEAN OFFICE */}
              <div className="grid grid-cols-12 gap-3 items-stretch">
                
                {/* Entry & Waiting Lounge (Cols 1-4) */}
                <div className="col-span-4 bg-white border-2 border-slate-300 rounded-xl p-3 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
                    <span className="text-base text-slate-900 font-extrabold">↑</span>
                    <span>Entry</span>
                  </div>

                  {/* Lounge Sofas Illustration */}
                  <div className="flex items-center justify-center gap-2 my-auto py-1">
                    {/* Left Single Couch */}
                    <div className="w-4 h-8 bg-slate-300 rounded border border-slate-400" />
                    {/* Coffee Table */}
                    <div className="w-12 h-6 bg-amber-200/80 rounded-md border border-amber-400 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" title="Plant" />
                    </div>
                    {/* Right Single Couch */}
                    <div className="w-4 h-8 bg-slate-300 rounded border border-slate-400" />
                  </div>

                  <div className="text-[10px] text-slate-400 text-center font-medium mt-1">
                    Visitor Waiting Lounge
                  </div>
                </div>

                {/* SR-09 (Cols 5-6) */}
                <div className="col-span-3">
                  {row3.find(c => c.cabinId === 'SR-09') && renderCabinCard(row3.find(c => c.cabinId === 'SR-09'))}
                </div>

                {/* SR-10 (Cols 7-8) */}
                <div className="col-span-3">
                  {row3.find(c => c.cabinId === 'SR-10') && renderCabinCard(row3.find(c => c.cabinId === 'SR-10'))}
                </div>

                {/* Dean Office (Cols 9-12) */}
                <div className="col-span-2">
                  {row3.find(c => c.cabinId === 'DEAN-OFFICE') && renderCabinCard(row3.find(c => c.cabinId === 'DEAN-OFFICE'))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT 4 COLS: LIVE AVAILABILITY & FACULTY DETAILS */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Live Summary Legend Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                  <span className="text-xs font-bold text-slate-700">Available (In Cabin)</span>
                </div>
                <span className="text-base font-extrabold text-emerald-700">{availableCount}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/70 border border-rose-200">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                  <span className="text-xs font-bold text-slate-700">Unavailable (In Lecture)</span>
                </div>
                <span className="text-base font-extrabold text-rose-700">{unavailableCount}</span>
              </div>
            </div>

            {/* Selected Faculty Details Panel */}
            {selectedFaculty ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-800">Faculty Details</h3>
                  <button
                    type="button"
                    onClick={() => { setSelectedCabin(null); setSelectedFaculty(null); }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={selectedFaculty.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={selectedFaculty.name}
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-900 truncate">{selectedFaculty.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 font-medium">Cabin: {selectedFaculty.cabinNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                        selectedFaculty.currentStatus === 'Available'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          selectedFaculty.currentStatus === 'Available' ? 'bg-emerald-600' : 'bg-rose-600'
                        }`} />
                        {selectedFaculty.currentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> Current Activity
                    </span>
                    <span className="font-bold text-slate-800">{selectedFaculty.currentActivity || 'In Cabin'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Class Location
                    </span>
                    <span className="font-extrabold text-indigo-700">
                      {selectedFaculty.currentClassLocation || selectedFaculty.currentLocation || 'Staff Room 01'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Time
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedFaculty.currentLectureTime || 'Available Now'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Subject
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedFaculty.currentSubject || selectedFaculty.department || 'Computer Science'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Next Availability
                    </span>
                    <span className="font-bold text-emerald-700">
                      {selectedFaculty.nextAvailability || '11:00 AM'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTimetableModal(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 border border-indigo-200 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>View Full Timetable</span>
                  </button>

                  <div className="flex gap-2">
                    {/* Faculty/Admin Override Status Toggle */}
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={handleToggleStatus}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
                      title="Faculty/Admin quick toggle"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingStatus ? 'animate-spin' : ''}`} />
                      <span>{selectedFaculty.currentStatus === 'Available' ? 'Mark In Lecture' : 'Mark In Cabin'}</span>
                    </button>

                    {/* Walking Navigation to Class / Cabin */}
                    {onNavigateToLocation && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToLocation(selectedFaculty.currentClassLocation || selectedFaculty.currentLocation || 'E Block');
                        }}
                        className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">Select Any Faculty Cabin</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Click on any cabin on the floor plan to inspect faculty details, lecture schedule, and live availability.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. BOTTOM FLOOR SWITCHER STRIP                          */}
        {/* ======================================================== */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              className="py-2 px-4 rounded-xl text-xs font-bold bg-sky-600 text-white border border-sky-400 shadow-md shadow-sky-600/30 flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Ground Floor (Staff & Offices)</span>
            </button>

            <button
              type="button"
              onClick={() => { onClose(); onSelectFloor?.(1); }}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>First Floor (Classrooms)</span>
            </button>

            <button
              type="button"
              onClick={() => { onClose(); onSelectFloor?.(2); }}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Second Floor (Classrooms)</span>
            </button>

            <button
              type="button"
              onClick={() => { onClose(); onSelectFloor?.(3); }}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Third Floor (Classrooms)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5"
          >
            Back to Building Overview
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. WEEKLY TIMETABLE POPUP MODAL                          */}
      {/* ======================================================== */}
      {showTimetableModal && selectedFaculty && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedFaculty.name} — Weekly Schedule
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTimetableModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {selectedFaculty.timetable && selectedFaculty.timetable.length > 0 ? (
                selectedFaculty.timetable.map((slot, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-indigo-700">{slot.day}</span>
                        <span className="text-[11px] font-bold text-slate-700">• {slot.subject}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {slot.building} — {slot.room} ({slot.floor})
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-800 block">{slot.startTime}</span>
                      <span className="text-[10px] text-slate-400">to {slot.endTime}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No weekly lecture timetable registered.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowTimetableModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Close Timetable
            </button>
          </div>
        </div>
      )}

    </div>
  );

  // Helper renderer for each Cabin box in the Floor Plan
  function renderCabinCard(cabin) {
    if (!cabin) return null;

    if (cabin.type === 'walking_area') {
      return (
        <div
          key={cabin.cabinId}
          className="h-28 bg-[#CBD5E1] border-2 border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-600 shadow-inner"
        >
          <Footprints className="w-6 h-6 text-slate-400 mb-1" />
          <span className="text-[10px] font-extrabold text-slate-500 tracking-wide">Walking Area</span>
        </div>
      );
    }

    const isSelected = selectedCabin?.cabinId === cabin.cabinId;
    const isAvailable = cabin.status === 'Available';
    const isDeanOffice = cabin.type === 'dean_office';

    return (
      <div
        key={cabin.cabinId}
        onClick={() => handleCabinClick(cabin)}
        className={`h-28 rounded-xl border-2 p-2 flex flex-col justify-between cursor-pointer transition-all duration-150 relative overflow-hidden shadow-sm ${
          isDeanOffice
            ? isSelected
              ? 'bg-purple-100/90 border-purple-500 ring-2 ring-purple-400'
              : 'bg-purple-50/70 hover:bg-purple-100/70 border-purple-300'
            : isAvailable
            ? isSelected
              ? 'bg-emerald-100/90 border-emerald-500 ring-2 ring-emerald-400'
              : 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-300'
            : isSelected
            ? 'bg-rose-100/90 border-rose-500 ring-2 ring-rose-400'
            : 'bg-rose-50/70 hover:bg-rose-100/70 border-rose-300'
        }`}
      >
        {/* Top Header: Status Indicator + Cabin Code */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isDeanOffice
                  ? 'bg-purple-600'
                  : isAvailable
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-400/50'
                  : 'bg-rose-500 shadow-sm shadow-rose-400/50'
              }`}
            />
            <span className="text-[11px] font-black text-slate-800 tracking-tight">
              {cabin.cabinNumber}
            </span>
          </div>

          {/* Plant Icon on corners */}
          {(cabin.cabinNumber === 'SR-01' || cabin.cabinNumber === 'SR-04' || cabin.cabinNumber === 'SR-05' || cabin.cabinNumber === 'SR-08' || cabin.cabinNumber === 'SR-09') && (
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" title="Desk Plant" />
          )}

          {isDeanOffice && (
            <Briefcase className="w-3.5 h-3.5 text-purple-600" />
          )}
        </div>

        {/* Faculty Name */}
        <div className="my-auto">
          <div className="text-[11px] font-extrabold text-slate-900 truncate leading-tight">
            {cabin.facultyName || 'Vacant Cabin'}
          </div>
        </div>

        {/* Architectural Desk + Chair Icon Graphic */}
        <div className="flex items-center justify-center gap-1 mt-auto">
          {/* Chair */}
          <div className="w-3.5 h-2.5 bg-slate-700 rounded-t-sm" />
          {/* Table */}
          <div className="w-10 h-3 bg-amber-700/80 rounded-sm border border-amber-800" />
        </div>

        {/* Door Swing Arc (Architectural CAD element) */}
        <div className="absolute bottom-0 right-1 w-4 h-4 border-t border-l border-slate-400 rounded-tl-full opacity-60" />
      </div>
    );
  }
}
