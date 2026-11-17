import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  MapPin,
  Crosshair,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  Building2,
  Layers,
  Camera,
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  X,
  ExternalLink,
  Save,
  Check,
  Send,
  Navigation
} from 'lucide-react';
import {
  fetchSurveyChecklist,
  captureGpsSurveyApi,
  verifySurveyRecordApi,
  publishSurveyRecordApi,
  exportSurveyChecklistUrl
} from '../../services/api';

export default function SurveyChecklistModal({
  isOpen,
  onClose,
  onStartMapPick,
  pickedCoordinates,
  onSelectDestination
}) {
  const [checklist, setChecklist] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    verified: 0,
    gpsCaptured: 0,
    pending: 0,
    percentComplete: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeItem, setActiveItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Survey Form States
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [googleMapsText, setGoogleMapsText] = useState('');
  const [surveyorName, setSurveyorName] = useState(() => localStorage.getItem('dishasetu_surveyor_name') || 'Field Administrator');
  const [surveyNotes, setSurveyNotes] = useState('');
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [secondaryEntrances, setSecondaryEntrances] = useState([]);
  const [saveMessage, setSaveMessage] = useState('');

  // Load survey checklist
  const loadChecklist = async () => {
    setIsLoading(true);
    try {
      const res = await fetchSurveyChecklist({
        status: selectedStatus,
        category: selectedCategory,
        search: searchQuery
      });
      if (res && res.data) {
        setChecklist(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (e) {
      console.warn('Failed to load survey checklist:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadChecklist();
    }
  }, [isOpen, selectedStatus, selectedCategory, searchQuery]);

  // Handle picked coordinates from map
  useEffect(() => {
    if (pickedCoordinates && activeItem) {
      setFormLat(pickedCoordinates.lat.toFixed(7));
      setFormLng(pickedCoordinates.lng.toFixed(7));
      setSaveMessage('Coordinates picked from interactive map.');
    }
  }, [pickedCoordinates]);

  // Open item editor
  const handleSelectItem = (item) => {
    setActiveItem(item);
    setFormLat(item.coordinates?.lat ? item.coordinates.lat.toString() : '');
    setFormLng(item.coordinates?.lng ? item.coordinates.lng.toString() : '');
    setGoogleMapsText('');
    setSurveyNotes(item.surveyNotes || '');
    setGpsAccuracy(item.gpsAccuracy || null);
    setSecondaryEntrances(item.entrances ? [...item.entrances] : []);
    setSaveMessage('');
  };

  // Parse Google Maps string: e.g. "13.1718, 77.5362" or "13°10'18.5"N 77°32'10.3"E"
  const handleParseGoogleMapsString = (text) => {
    setGoogleMapsText(text);
    if (!text) return;
    const match = text.trim().match(/([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)/);
    if (match) {
      setFormLat(parseFloat(match[1]).toFixed(7));
      setFormLng(parseFloat(match[2]).toFixed(7));
      setSaveMessage('Parsed decimal coordinates from Google Maps format.');
    }
  };

  // High-precision Mobile Device GPS capture
  const handleCaptureMobileGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser or device.');
      return;
    }

    setIsCapturingGps(true);
    setSaveMessage('Acquiring high-accuracy satellite GPS fix...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;

        setFormLat(lat.toFixed(7));
        setFormLng(lng.toFixed(7));
        setGpsAccuracy(Math.round(acc * 10) / 10);
        setIsCapturingGps(false);
        setSaveMessage(`GPS captured with ±${Math.round(acc * 10) / 10}m accuracy!`);
      },
      (err) => {
        setIsCapturingGps(false);
        alert(`GPS Acquisition Error (${err.code}): ${err.message}. Ensure location permissions are granted.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  // Add Secondary Entrance to current record
  const handleAddSecondaryEntrance = () => {
    const newEnt = {
      entranceId: `ent_${Date.now()}`,
      name: `Secondary Entrance ${secondaryEntrances.length + 1}`,
      coordinates: {
        lat: formLat ? parseFloat(formLat) : 13.1718,
        lng: formLng ? parseFloat(formLng) : 77.5362
      },
      isAccessible: true,
      isPrimary: false
    };
    setSecondaryEntrances([...secondaryEntrances, newEnt]);
  };

  // Save Survey Coordinates
  const handleSaveSurvey = async (markPublished = false) => {
    if (!activeItem) return;
    if (!formLat || !formLng || isNaN(parseFloat(formLat)) || isNaN(parseFloat(formLng))) {
      alert('Please enter or capture valid numeric latitude and longitude coordinates.');
      return;
    }

    const token = localStorage.getItem('dishasetu_admin_token');
    try {
      const res = await captureGpsSurveyApi({
        locationId: activeItem.locationId,
        lat: parseFloat(formLat),
        lng: parseFloat(formLng),
        gpsAccuracy,
        surveyorName,
        surveyNotes,
        entrances: secondaryEntrances,
        surveyMethod: gpsAccuracy ? 'mobile_gps' : 'manual_entry'
      }, token);

      if (res.success) {
        if (markPublished) {
          await publishSurveyRecordApi(activeItem.locationId, token);
        }
        localStorage.setItem('dishasetu_surveyor_name', surveyorName);
        setSaveMessage(markPublished ? 'Record published to live campus map!' : 'GPS coordinates saved as Captured!');
        loadChecklist();
        setTimeout(() => {
          // Advance to next pending item in checklist if available
          const nextPending = checklist.find(i => i.locationId !== activeItem.locationId && (!i.coordinates || i.verificationStatus !== 'Published'));
          if (nextPending) {
            handleSelectItem(nextPending);
          } else {
            setActiveItem(null);
          }
        }, 800);
      } else {
        alert(res.message || 'Failed to save survey.');
      }
    } catch (e) {
      alert('Error saving survey: ' + e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">Tomorrow's Campus GPS Survey</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Checklist Mode
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Presidency University Bengaluru · Field Survey Protocol
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Export CSV */}
            <a
              href={exportSurveyChecklistUrl('csv')}
              download="Presidency_Campus_Survey_Checklist.csv"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all hover:scale-105"
              title="Download CSV Checklist for Offline Mobile Entry"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>

            {/* Bulk Export JSON */}
            <a
              href={exportSurveyChecklistUrl('json')}
              download="Presidency_Campus_Survey_Checklist.json"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all hover:scale-105"
              title="Download Complete JSON Catalog"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Export JSON</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Survey Mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Survey Progress Analytics Card */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Total Locations</div>
              <div className="text-lg font-extrabold text-white font-mono">{stats.total}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-emerald-400 font-medium">Published & Live</div>
              <div className="text-lg font-extrabold text-emerald-400 font-mono">{stats.published}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-sky-400 font-medium">GPS Captured</div>
              <div className="text-lg font-extrabold text-sky-400 font-mono">{stats.gpsCaptured}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-amber-400 font-medium">Awaiting Survey</div>
              <div className="text-lg font-extrabold text-amber-400 font-mono">{stats.pending}</div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-indigo-400 font-medium">Survey Completion</div>
              <div className="text-lg font-extrabold text-indigo-400 font-mono">{stats.percentComplete}%</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.percentComplete}%` }}
            />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search building, block (D, E, F, H, J, K, L, N, P, Q, R, S, U), facility, gate..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Verified">Verified</option>
            <option value="GPS Captured">GPS Captured</option>
            <option value="Awaiting Survey">Awaiting Survey / Pending</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Categories</option>
            <option value="Academic">Academic Blocks</option>
            <option value="Building">Other Buildings</option>
            <option value="Facility">Facilities & Offices</option>
            <option value="Food">Food & Cafeterias</option>
            <option value="Sports">Sports & Grounds</option>
            <option value="Parking">Parking & Transit</option>
            <option value="Gate">Campus Gates</option>
          </select>
        </div>

        {/* Master Workspace: Left Checklist List + Right Interactive Survey Form */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Checklist List */}
          <div className="w-full md:w-1/2 border-r border-slate-800 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
            {checklist.map((item) => {
              const isSelected = activeItem?.locationId === item.locationId;
              const hasGps = item.coordinates && item.coordinates.lat && item.coordinates.lng;
              const isPublished = item.verificationStatus === 'Published';
              const isCaptured = item.verificationStatus === 'GPS Captured';

              return (
                <div
                  key={item.locationId}
                  onClick={() => handleSelectItem(item)}
                  className={`p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-950/40 border-l-4 border-sky-400'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{item.name}</span>
                          {item.shortCode && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                              {item.shortCode}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[280px]">
                          {item.category} · {item.description || 'Campus Record'}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPublished
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isCaptured
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.verificationStatus || 'Awaiting Survey'}
                      </span>
                    </div>
                  </div>

                  {/* Survey Details Row */}
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {hasGps ? (
                        <span>
                          {item.coordinates.lat.toFixed(5)}, {item.coordinates.lng.toFixed(5)}
                        </span>
                      ) : (
                        <span className="text-amber-400/80 font-sans italic">Coordinates Pending Physical Survey</span>
                      )}
                    </div>
                    <div>
                      {item.entrances?.length || 1} Entrance(s)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Interactive Survey Form */}
          <div className="hidden md:flex flex-1 flex-col overflow-y-auto bg-slate-950/40 p-4 custom-scrollbar">
            {activeItem ? (
              <div className="space-y-4">
                {/* Target Header */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between">
                  <div>
                    <div className="text-xs font-mono text-sky-400 uppercase tracking-wider">
                      Selected Survey Record
                    </div>
                    <div className="text-base font-extrabold text-white mt-0.5">
                      {activeItem.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      ID: {activeItem.locationId} · {activeItem.category}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                      activeItem.verificationStatus === 'Published'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {activeItem.verificationStatus || 'Awaiting Survey'}
                  </span>
                </div>

                {/* 1. Mobile High-Precision GPS Capture Card */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Crosshair className="w-4 h-4 text-emerald-400" />
                      <span>Option A: Live Mobile GPS Capture</span>
                    </div>
                    {gpsAccuracy && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Accuracy: ±{gpsAccuracy}m
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Stand directly in front of the building entrance and capture coordinates using your device's GPS antenna.
                  </p>

                  <button
                    onClick={handleCaptureMobileGps}
                    disabled={isCapturingGps}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    <Crosshair className={`w-4 h-4 ${isCapturingGps ? 'animate-spin' : ''}`} />
                    <span>{isCapturingGps ? 'Locking Satellite Fix...' : 'Capture Current Location GPS'}</span>
                  </button>
                </div>

                {/* 2. Google Maps Paste or Manual Entry */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    <span>Option B: Google Maps Paste or Manual Coordinates</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-medium block mb-1">
                      Paste from Google Maps (e.g. 13.1718, 77.5362):
                    </label>
                    <input
                      type="text"
                      value={googleMapsText}
                      onChange={(e) => handleParseGoogleMapsString(e.target.value)}
                      placeholder="Paste 13.1717995, 77.5361915"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-medium block mb-1">
                        Latitude (Decimal Degrees):
                      </label>
                      <input
                        type="text"
                        value={formLat}
                        onChange={(e) => setFormLat(e.target.value)}
                        placeholder="13.1718000"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-medium block mb-1">
                        Longitude (Decimal Degrees):
                      </label>
                      <input
                        type="text"
                        value={formLng}
                        onChange={(e) => setFormLng(e.target.value)}
                        placeholder="77.5362000"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Pick on Map Trigger */}
                  <button
                    onClick={() => {
                      onStartMapPick(activeItem.locationId);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Select Point Directly on 2D Campus Map</span>
                  </button>
                </div>

                {/* 3. Secondary Entrances Management */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Secondary Building Entrances</span>
                    <button
                      onClick={handleAddSecondaryEntrance}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-sky-600/30 text-sky-300 hover:bg-sky-600 hover:text-white transition-colors"
                    >
                      + Add Entrance
                    </button>
                  </div>

                  {secondaryEntrances.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic">
                      No secondary entrances registered. Only primary main entrance configured.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {secondaryEntrances.map((ent, idx) => (
                        <div key={ent.entranceId || idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-slate-200">{ent.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {ent.coordinates?.lat?.toFixed(5)}, {ent.coordinates?.lng?.toFixed(5)}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSecondaryEntrances(secondaryEntrances.filter((_, i) => i !== idx));
                            }}
                            className="text-rose-400 hover:text-rose-300 text-xs p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Surveyor Metadata & Notes */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-white">Survey Notes & Surveyor Name</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Surveyed By:</label>
                      <input
                        type="text"
                        value={surveyorName}
                        onChange={(e) => setSurveyorName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Survey Notes:</label>
                      <input
                        type="text"
                        value={surveyNotes}
                        onChange={(e) => setSurveyNotes(e.target.value)}
                        placeholder="Ramp present, double glass door..."
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {saveMessage && (
                  <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/40 text-xs text-sky-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{saveMessage}</span>
                  </div>
                )}

                {/* Save & Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleSaveSurvey(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save as Captured</span>
                  </button>

                  <button
                    onClick={() => handleSaveSurvey(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Verify & Publish Live</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Compass className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                <div className="text-sm font-bold text-slate-200">Select a Location from the Checklist</div>
                <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                  Select any building or outdoor point to capture GPS coordinates, add secondary entrances, and publish to the live campus map.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}