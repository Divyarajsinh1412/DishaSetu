import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Compass,
  MapPin,
  Building2,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Search,
  Plus,
  Trash2,
  Edit3,
  X,
  Navigation,
  Accessibility,
  DoorOpen,
  ArrowRight,
  Shield,
  LocateFixed,
  Filter,
  Info,
  Maximize2,
  Minimize2,
  ExternalLink
} from 'lucide-react';
import {
  fetchIndoorLocations,
  createIndoorLocationApi,
  captureIndoorGpsApi,
  updateIndoorLocationApi,
  deleteIndoorLocationApi
} from '../../services/api';

// Campus Buildings available for Indoor Survey
const CAMPUS_BUILDINGS = [
  { id: 'bld_d_block', name: 'D Block', code: 'PU-D-BLOCK', floors: 6 },
  { id: 'bld_e_block', name: 'E Block', code: 'PU-E-BLOCK', floors: 5 },
  { id: 'bld_f_block', name: 'F Block', code: 'PU-F-BLOCK', floors: 5 },
  { id: 'bld_l_block', name: 'L Block', code: 'PU-L-BLOCK', floors: 5 },
  { id: 'bld_admission', name: 'Admission Block', code: 'PU-ADM-BLOCK', floors: 3 },
  { id: 'bld_h_block', name: 'H Block', code: 'PU-H-BLOCK', floors: 4 },
  { id: 'bld_som_block', name: 'MBA / SOM Block', code: 'PU-SOM-BLOCK', floors: 4 },
  { id: 'bld_library', name: 'Central Library', code: 'PU-LIBRARY', floors: 3 }
];

// Floor structure
const FLOOR_OPTIONS = [
  { number: 0, label: 'Ground Floor', code: 'G' },
  { number: 1, label: 'First Floor', code: '1' },
  { number: 2, label: 'Second Floor', code: '2' },
  { number: 3, label: 'Third Floor', code: '3' },
  { number: 4, label: 'Fourth Floor', code: '4' },
  { number: 5, label: 'Fifth Floor', code: '5' }
];

// Location types specified by requirements
const LOCATION_TYPES = [
  { id: 'classroom', label: 'Classroom' },
  { id: 'laboratory', label: 'Laboratory' },
  { id: 'faculty_office', label: 'Faculty Office' },
  { id: 'department_office', label: 'Department Office' },
  { id: 'corridor', label: 'Corridor' },
  { id: 'staircase', label: 'Staircase' },
  { id: 'lift', label: 'Lift / Elevator' },
  { id: 'entrance', label: 'Entrance' },
  { id: 'exit', label: 'Exit' },
  { id: 'washroom', label: 'Washroom / Restroom' },
  { id: 'library', label: 'Library' },
  { id: 'reception', label: 'Reception' },
  { id: 'conference_room', label: 'Conference Room' },
  { id: 'seminar_hall', label: 'Seminar Hall' },
  { id: 'cafeteria', label: 'Cafeteria / Food Point' },
  { id: 'medical_room', label: 'Medical Room' },
  { id: 'other', label: 'Other' }
];

// University Departments
const DEPARTMENTS = [
  'School of Engineering',
  'Mechanical Engineering',
  'Computer Science & Engineering',
  'Robotics & Automation',
  'Civil Engineering',
  'Electronics & Communication',
  'School of Management',
  'School of Law',
  'General Administration'
];

export default function AdminIndoorSurveyModal({
  isOpen,
  onClose,
  initialBuilding = null,
  initialFloorNumber = 0,
  onStartNavigation,
  onRefreshData
}) {
  const [activeTab, setActiveTab] = useState('capture'); // 'capture' | 'directory'

  // Survey Filter & Target Selection
  const [selectedBuilding, setSelectedBuilding] = useState('D Block');
  const [selectedFloorNumber, setSelectedFloorNumber] = useState(initialFloorNumber || 0);

  // Form State
  const [locationName, setLocationName] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [locationType, setLocationType] = useState('classroom');
  const [department, setDepartment] = useState('School of Engineering');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [accessibility, setAccessibility] = useState(['Wheelchair Accessible']);
  const [status, setStatus] = useState('captured');
  const [verified, setVerified] = useState(false);

  // GPS Coordinates & Telemetry
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [capturedAt, setCapturedAt] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Manual Coordinates Override Toggle
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Directory List & Filters
  const [indoorLocations, setIndoorLocations] = useState([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryBuildingFilter, setDirectoryBuildingFilter] = useState('all');
  const [directoryFloorFilter, setDirectoryFloorFilter] = useState('all');
  const [directoryTypeFilter, setDirectoryTypeFilter] = useState('all');
  const [directoryStatusFilter, setDirectoryStatusFilter] = useState('all');

  // Editing existing location
  const [editingLocationId, setEditingLocationId] = useState(null);

  // Status message
  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Sync initial building
  useEffect(() => {
    if (initialBuilding) {
      const bName = initialBuilding.name || initialBuilding.building || 'D Block';
      setSelectedBuilding(bName);
    }
    if (initialFloorNumber !== undefined) {
      setSelectedFloorNumber(initialFloorNumber);
    }
  }, [initialBuilding, initialFloorNumber]);

  // Load directory records
  const loadDirectory = useCallback(async () => {
    setIsLoadingDirectory(true);
    try {
      const list = await fetchIndoorLocations();
      setIndoorLocations(list);
    } catch (err) {
      console.warn('Failed to load indoor locations:', err);
    } finally {
      setIsLoadingDirectory(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadDirectory();
    }
  }, [isOpen, loadDirectory]);

  // Derive floor label
  const currentFloorLabel = useMemo(() => {
    const opt = FLOOR_OPTIONS.find(f => f.number === selectedFloorNumber);
    return opt ? opt.label : `Floor ${selectedFloorNumber}`;
  }, [selectedFloorNumber]);

  // Auto-generate code when building, floor, or room changes
  useEffect(() => {
    if (roomNumber && !editingLocationId) {
      const cleanRoom = roomNumber.trim().toUpperCase();
      setLocationCode(cleanRoom);
    }
  }, [roomNumber, editingLocationId]);

  // -------------------------------------------------------------
  // PHYSICAL GPS COORDINATE CAPTURE (High Accuracy Navigator GPS)
  // -------------------------------------------------------------
  const handleCaptureCurrentLocation = useCallback(() => {
    setGpsError(null);
    setIsCapturing(true);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser or mobile device.');
      setIsCapturing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        setLatitude(Number(lat.toFixed(6)));
        setLongitude(Number(lng.toFixed(6)));
        setGpsAccuracy(Math.round(accuracy * 10) / 10);
        setCapturedAt(new Date(position.timestamp));
        setIsCapturing(false);
        showNotification(
          `Captured GPS coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)} (Accuracy ±${Math.round(accuracy)}m)`,
          accuracy > 20 ? 'warning' : 'success'
        );
      },
      (error) => {
        setIsCapturing(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Location permission denied. Please allow location access in your phone/browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('Location information unavailable. Check if device GPS / Location Services are turned ON.');
            break;
          case error.TIMEOUT:
            setGpsError('GPS acquisition timed out. Please retry near a window or building opening for clearer satellite lock.');
            break;
          default:
            setGpsError(error.message || 'An unknown error occurred while capturing GPS coordinates.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );
  }, []);

  // Copy coordinates string
  const handleCopyCoordinates = () => {
    if (latitude != null && longitude != null) {
      const coordStr = `${latitude}, ${longitude}`;
      navigator.clipboard?.writeText(coordStr);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
      showNotification('Coordinates copied to clipboard!', 'info');
    }
  };

  // Evaluate Accuracy Category
  const accuracyAssessment = useMemo(() => {
    if (gpsAccuracy == null) return null;
    if (gpsAccuracy < 5) {
      return {
        level: 'Excellent',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        badgeColor: 'bg-emerald-500',
        note: 'Outstanding precision (< 5m). Ideal for classroom & room door placement.'
      };
    }
    if (gpsAccuracy <= 10) {
      return {
        level: 'Good',
        color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
        badgeColor: 'bg-teal-500',
        note: 'High ground accuracy (5–10m). Suitable for indoor wing calibration.'
      };
    }
    if (gpsAccuracy <= 20) {
      return {
        level: 'Moderate',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        badgeColor: 'bg-amber-500',
        note: 'Moderate indoor reception (10–20m). Concrete structural damping present.'
      };
    }
    return {
      level: 'Poor (Weak Signal)',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      badgeColor: 'bg-rose-500',
      note: 'Weak GPS signal (> 20m). We recommend re-capturing or adjusting coordinates manually on the map below.'
    };
  }, [gpsAccuracy]);

  // Reset form
  const handleResetForm = () => {
    setLocationName('');
    setLocationCode('');
    setRoomNumber('');
    setLocationType('classroom');
    setDescription('');
    setNotes('');
    setLatitude(null);
    setLongitude(null);
    setGpsAccuracy(null);
    setCapturedAt(null);
    setEditingLocationId(null);
    setIsManualOverride(false);
    setVerified(false);
    setStatus('captured');
  };

  // Save to MongoDB Atlas
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!locationName.trim() || !roomNumber.trim()) {
      showNotification('Please provide a Room Number and Location Name.', 'error');
      return;
    }
    if (latitude == null || longitude == null) {
      showNotification('Coordinates are required. Press "Capture Coordinates" or enter manually.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('dishasetu_admin_token');
      const bld = CAMPUS_BUILDINGS.find(b => b.name === selectedBuilding);
      const bldId = bld?.id || 'bld_d_block';

      const payload = {
        name: locationName.trim(),
        code: (locationCode || roomNumber).trim().toUpperCase(),
        roomNumber: roomNumber.trim().toUpperCase(),
        building: selectedBuilding,
        buildingId: bldId,
        floor: currentFloorLabel,
        floorNumber: selectedFloorNumber,
        type: locationType,
        department: department,
        latitude: Number(latitude),
        longitude: Number(longitude),
        gpsAccuracy: gpsAccuracy != null ? Number(gpsAccuracy) : null,
        description: description.trim(),
        notes: notes.trim(),
        accessibility: accessibility,
        status: verified ? 'verified' : status,
        verified: verified
      };

      if (editingLocationId) {
        await updateIndoorLocationApi(editingLocationId, payload, token);
        showNotification(`Updated location ${payload.code} successfully!`);
      } else {
        await createIndoorLocationApi(payload, token);
        showNotification(`Saved location ${payload.code} to MongoDB Atlas!`);
      }

      handleResetForm();
      loadDirectory();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      showNotification(err.message || 'Failed to save indoor location.', 'error');
    }
  };

  // Edit action
  const handleStartEdit = (loc) => {
    setEditingLocationId(loc._id || loc.code);
    setSelectedBuilding(loc.building);
    setSelectedFloorNumber(loc.floorNumber || 0);
    setLocationName(loc.name);
    setLocationCode(loc.code);
    setRoomNumber(loc.roomNumber);
    setLocationType(loc.type);
    setDepartment(loc.department || 'General');
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setGpsAccuracy(loc.gpsAccuracy);
    setCapturedAt(loc.capturedAt ? new Date(loc.capturedAt) : null);
    setDescription(loc.description || '');
    setNotes(loc.notes || '');
    setAccessibility(loc.accessibility || []);
    setStatus(loc.status || 'captured');
    setVerified(Boolean(loc.verified));
    setActiveTab('capture');
  };

  // Delete action
  const handleDeleteLocation = async (loc) => {
    const confirmDelete = window.confirm(`Delete indoor location ${loc.code} (${loc.name})?`);
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('dishasetu_admin_token');
      await deleteIndoorLocationApi(loc._id || loc.code, token);
      showNotification(`Deleted indoor location ${loc.code}.`);
      loadDirectory();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      showNotification(err.message || 'Failed to delete location', 'error');
    }
  };

  // Quick verify
  const handleQuickVerify = async (loc) => {
    try {
      const token = localStorage.getItem('dishasetu_admin_token');
      await updateIndoorLocationApi(loc._id || loc.code, { verified: true, status: 'published' }, token);
      showNotification(`Verified & Published ${loc.code}!`);
      loadDirectory();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      showNotification(err.message || 'Failed to verify location', 'error');
    }
  };

  // Filtered directory items
  const filteredDirectory = useMemo(() => {
    return indoorLocations.filter(loc => {
      if (directoryBuildingFilter !== 'all' && loc.building !== directoryBuildingFilter) return false;
      if (directoryFloorFilter !== 'all' && String(loc.floorNumber) !== directoryFloorFilter) return false;
      if (directoryTypeFilter !== 'all' && loc.type !== directoryTypeFilter) return false;
      if (directoryStatusFilter !== 'all') {
        if (directoryStatusFilter === 'verified' && !loc.verified) return false;
        if (directoryStatusFilter === 'unverified' && loc.verified) return false;
      }
      if (directorySearch.trim()) {
        const q = directorySearch.toLowerCase().trim();
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.code.toLowerCase().includes(q) ||
          loc.roomNumber.toLowerCase().includes(q) ||
          (loc.department && loc.department.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [
    indoorLocations,
    directoryBuildingFilter,
    directoryFloorFilter,
    directoryTypeFilter,
    directoryStatusFilter,
    directorySearch
  ]);

  if (!isOpen) return null;

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      data-prevent-map-zoom="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        data-prevent-map-zoom="true"
        className="relative w-full max-w-5xl h-[94vh] bg-[#081528] border border-[#23426e] rounded-2xl shadow-2xl flex flex-col text-slate-100 overflow-hidden overscroll-contain isolate-scroll"
      >
        
        {/* Header */}
        <div className="h-16 px-4 sm:px-6 bg-[#0c1e36] border-b border-[#1b3152] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d4ed8] via-[#0f3460] to-[#b48c26] p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#08172c] rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-[#d4af37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  Indoor Location Survey & GPS Capture
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                  Admin Ground Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Presidency University Bengaluru · Physical Room Coordinate Registration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex items-center p-1 bg-[#06101e] border border-[#1b3152] rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('capture')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'capture'
                    ? 'bg-[#1e3a8a] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LocateFixed className="w-3.5 h-3.5 text-sky-400" />
                <span>Survey & Capture</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'directory'
                    ? 'bg-[#1e3a8a] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Surveyed Directory ({indoorLocations.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#0e223d] hover:bg-[#15345d] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notification inside modal */}
        {notification && (
          <div className={`px-4 py-2 text-xs font-bold flex items-center justify-between border-b ${
            notification.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : notification.type === 'warning'
              ? 'bg-amber-950/90 text-amber-200 border-amber-800'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
          }`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 font-mono">✕</button>
          </div>
        )}

        {/* TAB 1: SURVEY & GPS CAPTURE */}
        {activeTab === 'capture' && (
          <div
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            data-prevent-map-zoom="true"
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain isolate-scroll"
          >
            
            {/* Step 1: Building & Floor Selector Grid */}
            <div className="p-4 bg-[#0a182b] border border-[#1e3a5f] rounded-2xl shadow-inner space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  1. Select University Building & Floor
                </span>
                <span className="text-[11px] text-slate-400">
                  Target: <strong className="text-white">{selectedBuilding}</strong> · {currentFloorLabel}
                </span>
              </div>

              {/* Building Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {CAMPUS_BUILDINGS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBuilding(b.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedBuilding === b.name
                        ? 'bg-[#1e3a8a] text-white border-blue-400 shadow-md'
                        : 'bg-[#0d213b] text-slate-300 border-transparent hover:border-slate-600'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>

              {/* Floor Selection 6-Pill Row */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                {FLOOR_OPTIONS.map((flr) => (
                  <button
                    key={flr.number}
                    type="button"
                    onClick={() => setSelectedFloorNumber(flr.number)}
                    className={`p-2 rounded-xl text-xs font-bold text-center border transition-all ${
                      selectedFloorNumber === flr.number
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-400 shadow-md'
                        : 'bg-[#0e223d] text-slate-300 border-[#1b3457] hover:bg-[#132c4f]'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-emerald-300 font-bold">Level {flr.code}</div>
                    <div className="truncate">{flr.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: High-Precision Physical GPS Coordinate Capture */}
            <div className="p-5 bg-gradient-to-br from-[#0c223f] via-[#091a32] to-[#081528] border-2 border-[#1e4675] rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <LocateFixed className="w-4 h-4 text-sky-400" />
                    2. Physical Ground GPS Capture
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Walk to the room door or center inside the building and press the button below.
                  </p>
                </div>

                {gpsAccuracy != null && accuracyAssessment && (
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${accuracyAssessment.color}`}>
                    <span className={`w-2 h-2 rounded-full ${accuracyAssessment.badgeColor} animate-ping`} />
                    <span>Accuracy: ±{gpsAccuracy}m ({accuracyAssessment.level})</span>
                  </div>
                )}
              </div>

              {/* Big Prominent Capture Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleCaptureCurrentLocation}
                  disabled={isCapturing}
                  className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm sm:text-base text-white shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-98 ${
                    isCapturing
                      ? 'bg-slate-700 cursor-wait'
                      : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sky-600/40 border-2 border-sky-400 hover:scale-[1.01]'
                  }`}
                >
                  <LocateFixed className={`w-6 h-6 ${isCapturing ? 'animate-spin' : 'animate-pulse'}`} />
                  <span>
                    {isCapturing
                      ? 'Acquiring High-Precision GPS Lock...'
                      : latitude != null
                      ? '📍 Re-Capture Current Coordinates'
                      : '📍 Capture Coordinates from Current Location'}
                  </span>
                </button>

                {latitude != null && (
                  <button
                    type="button"
                    onClick={handleCopyCoordinates}
                    className="py-4 px-4 rounded-2xl bg-[#0e2442] hover:bg-[#15345e] border border-[#234d7d] text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0"
                    title="Copy Latitude, Longitude to clipboard"
                  >
                    {copiedCoords ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
                    <span>{copiedCoords ? 'Copied!' : 'Copy Coords'}</span>
                  </button>
                )}
              </div>

              {/* Error Alert */}
              {gpsError && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{gpsError}</span>
                </div>
              )}

              {/* Captured Coordinates Telemetry Display */}
              {latitude != null && longitude != null && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 bg-[#061222] border border-[#1b3961] rounded-xl text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Latitude</div>
                    <div className="text-sm font-black text-sky-300">{latitude.toFixed(6)}° N</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Longitude</div>
                    <div className="text-sm font-black text-sky-300">{longitude.toFixed(6)}° E</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">GPS Accuracy</div>
                    <div className="text-sm font-black text-emerald-400">± {gpsAccuracy || 0} meters</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Captured At</div>
                    <div className="text-xs text-slate-300">
                      {capturedAt ? capturedAt.toLocaleTimeString() : 'Just now'}
                    </div>
                  </div>
                </div>
              )}

              {/* Accuracy Warning if poor */}
              {accuracyAssessment && gpsAccuracy > 20 && (
                <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{accuracyAssessment.note}</span>
                </div>
              )}

              {/* Manual Override Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsManualOverride(!isManualOverride)}
                  className="text-xs text-sky-400 hover:text-sky-300 underline font-semibold flex items-center gap-1"
                >
                  <span>{isManualOverride ? 'Hide Coordinate Fine-Tuning' : 'Fine-Tune Coordinates / Manual Adjustment'}</span>
                </button>

                {isManualOverride && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 p-3 bg-[#061222] border border-[#1b3961] rounded-xl">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        Manual Latitude (Decimal Degrees)
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={latitude || ''}
                        onChange={(e) => setLatitude(parseFloat(e.target.value) || null)}
                        placeholder="13.171880"
                        className="w-full px-3 py-1.5 bg-[#091a30] border border-[#1f3f6b] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        Manual Longitude (Decimal Degrees)
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={longitude || ''}
                        onChange={(e) => setLongitude(parseFloat(e.target.value) || null)}
                        placeholder="77.536120"
                        className="w-full px-3 py-1.5 bg-[#091a30] border border-[#1f3f6b] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Location Details & Metadata Form */}
            <form onSubmit={handleSaveLocation} className="p-5 bg-[#0a182b] border border-[#1e3a5f] rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1b3152] pb-2">
                <h3 className="text-sm font-extrabold text-[#d4af37] flex items-center gap-2">
                  <DoorOpen className="w-4 h-4" />
                  3. Room Information & Metadata
                </h3>
                {editingLocationId && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    Editing: {locationCode}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Room Number */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Room Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. DG01, D102, D304"
                    className="w-full px-3 py-2 bg-[#061222] border border-[#1f3f6b] rounded-xl text-xs font-bold text-white uppercase focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Location Code */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Location Code
                  </label>
                  <input
                    type="text"
                    value={locationCode}
                    onChange={(e) => setLocationCode(e.target.value)}
                    placeholder="e.g. DG01"
                    className="w-full px-3 py-2 bg-[#061222] border border-[#1f3f6b] rounded-xl text-xs font-mono text-sky-300 uppercase focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Location Type */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Location Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#061222] border border-[#1f3f6b] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-400"
                  >
                    {LOCATION_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location Full Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Location Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Engineering Mechanics Lab, Robotics Studio"
                  className="w-full px-3 py-2 bg-[#061222] border border-[#1f3f6b] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Department */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#061222] border border-[#1f3f6b] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-400"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Survey Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-[#061222] border border-[#1f3f6b] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="draft">Draft</option>
                    <option value="captured">Captured (Awaiting Verification)</option>
                    <option value="needs_verification">Needs Verification</option>
                    <option value="verified">Verified</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Description & Facilities
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Equipped with universal testing machines, stress-strain analysis rigs."
                  className="w-full px-3 py-2 bg-[#061222] border border-[#1f3f6b] rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Notes for Navigators / Surveyors */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Field Survey Notes / Directions Cue
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ground floor west quadrangle next to main entrance foyer."
                  className="w-full px-3 py-1.5 bg-[#061222] border border-[#1f3f6b] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Instant Verification Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="verifyLocationCheck"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-[#061222] border-[#1f3f6b] focus:ring-emerald-400"
                />
                <label htmlFor="verifyLocationCheck" className="text-xs font-bold text-emerald-400 cursor-pointer">
                  Mark as Verified & Publish Immediately for Student Navigation
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b3152]">
                {editingLocationId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingLocationId ? 'Update Location' : 'Save to MongoDB Atlas'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: SURVEYED DIRECTORY & MANAGEMENT TABLE */}
        {activeTab === 'directory' && (
          <div
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            data-prevent-map-zoom="true"
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain isolate-scroll"
          >
            
            {/* Filter Toolbar */}
            <div className="p-3 bg-[#0a182b] border border-[#1e3a5f] rounded-2xl flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  placeholder="Search room (DG01), name, department..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#061222] border border-[#1b365a] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Building Filter */}
              <select
                value={directoryBuildingFilter}
                onChange={(e) => setDirectoryBuildingFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#061222] border border-[#1b365a] rounded-xl text-xs text-slate-200"
              >
                <option value="all">All Buildings</option>
                {CAMPUS_BUILDINGS.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>

              {/* Floor Filter */}
              <select
                value={directoryFloorFilter}
                onChange={(e) => setDirectoryFloorFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#061222] border border-[#1b365a] rounded-xl text-xs text-slate-200"
              >
                <option value="all">All Floors</option>
                {FLOOR_OPTIONS.map(f => (
                  <option key={f.number} value={String(f.number)}>{f.label}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={directoryTypeFilter}
                onChange={(e) => setDirectoryTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#061222] border border-[#1b365a] rounded-xl text-xs text-slate-200"
              >
                <option value="all">All Types</option>
                {LOCATION_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>

              {/* Verification Status */}
              <select
                value={directoryStatusFilter}
                onChange={(e) => setDirectoryStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#061222] border border-[#1b365a] rounded-xl text-xs text-slate-200"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Needs Verification</option>
              </select>

              <button
                type="button"
                onClick={loadDirectory}
                className="p-2 rounded-xl bg-[#0e223d] hover:bg-[#15345d] text-slate-300 hover:text-white"
                title="Refresh Directory"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingDirectory ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Showing <strong>{filteredDirectory.length}</strong> surveyed locations</span>
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setActiveTab('capture');
                }}
                className="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Location</span>
              </button>
            </div>

            {/* Location Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
              {filteredDirectory.map((loc) => {
                const isExcellent = loc.gpsAccuracy && loc.gpsAccuracy < 5;
                const isModerate = loc.gpsAccuracy && loc.gpsAccuracy > 15;

                return (
                  <div
                    key={loc._id || loc.code}
                    className="p-4 bg-[#0a182b] border border-[#1e3a5f] hover:border-sky-500/50 rounded-2xl shadow-lg flex flex-col justify-between gap-3 transition-all group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40">
                            {loc.code || loc.roomNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {loc.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {loc.verified ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleQuickVerify(loc)}
                              className="px-2 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 transition-colors"
                              title="Click to Verify & Publish"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Name & Hierarchy */}
                      <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {loc.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {loc.building} · {loc.floor} · {loc.department || 'General'}
                      </p>

                      {/* Coordinates & Accuracy */}
                      <div className="mt-2.5 p-2 bg-[#061222] rounded-xl border border-[#182f4d] flex items-center justify-between text-[11px] font-mono">
                        <div className="text-slate-300">
                          {loc.latitude?.toFixed(6)}, {loc.longitude?.toFixed(6)}
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isExcellent
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isModerate
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-teal-500/20 text-teal-300'
                        }`}>
                          ±{loc.gpsAccuracy != null ? `${loc.gpsAccuracy}m` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#182f4d] text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          if (onStartNavigation) {
                            onStartNavigation({
                              name: `${loc.code} - ${loc.name}`,
                              latitude: loc.latitude,
                              longitude: loc.longitude,
                              building: loc.building,
                              floor: loc.floor,
                              floorNumber: loc.floorNumber,
                              roomNumber: loc.roomNumber,
                              code: loc.code,
                              category: 'Classroom'
                            });
                            onClose();
                          }
                        }}
                        className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
                        title="Navigate to classroom"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(loc)}
                          className="p-1.5 rounded-lg bg-[#0e2442] hover:bg-[#15345e] text-slate-300 hover:text-white"
                          title="Edit Location"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLocation(loc)}
                          className="p-1.5 rounded-lg bg-[#2c121e] hover:bg-[#42172a] text-rose-300 hover:text-rose-100"
                          title="Delete Location"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
