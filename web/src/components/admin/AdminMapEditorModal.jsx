import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Crosshair,
  Save,
  Compass,
  AlertCircle,
  Building2,
  Car,
  Coffee,
  HeartPulse,
  BookOpen,
  Trophy,
  Shield,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Navigation,
  RefreshCw
} from 'lucide-react';
import {
  fetchMapMarkersApi,
  createMapMarkerApi,
  updateMapMarkerApi,
  deleteMapMarkerApi
} from '../../services/api';

const CATEGORIES = [
  'Academic',
  'Gate',
  'Parking',
  'Sports',
  'Garden',
  'Landmark',
  'Cafe',
  'Library',
  'Medical',
  'Facility',
  'Transport',
  'Security'
];

export default function AdminMapEditorModal({
  isOpen,
  onClose,
  buildings = [],
  onRefreshMarkers
}) {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [clickCoord, setClickCoord] = useState(null); // { imageX, imageY }
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    category: 'Academic',
    imageX: 0.5,
    imageY: 0.5,
    latitude: 13.1706,
    longitude: 77.5358,
    shortCode: '',
    description: '',
    buildingId: '',
    visible: true,
    verified: true
  });

  const imageRef = useRef(null);
  const token = localStorage.getItem('dishasetu_admin_token');

  // Load existing markers from API
  const loadMarkers = async () => {
    try {
      setIsLoading(true);
      const res = await fetchMapMarkersApi();
      if (res && res.markers) {
        setMarkers(res.markers);
      }
    } catch (err) {
      console.error('Failed to load map markers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMarkers();
    }
  }, [isOpen]);

  // Handle click on map image to capture (imageX, imageY)
  const handleMapClick = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const normX = Number(Math.min(Math.max(clickX / rect.width, 0), 1).toFixed(4));
    const normY = Number(Math.min(Math.max(clickY / rect.height, 0), 1).toFixed(4));

    setClickCoord({ x: normX, y: normY });
    setFormData(prev => ({
      ...prev,
      imageX: normX,
      imageY: normY
    }));
  };

  // Capture current GPS position from device
  const handleCaptureDeviceGps = () => {
    if (!navigator.geolocation) {
      setStatusMessage({ type: 'error', text: 'Geolocation is not supported by this browser.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6))
        }));
        setStatusMessage({
          type: 'success',
          text: `Captured GPS: ${pos.coords.latitude.toFixed(6)}°N, ${pos.coords.longitude.toFixed(6)}°E (Acc: ±${Math.round(pos.coords.accuracy)}m)`
        });
      },
      (err) => {
        setStatusMessage({ type: 'error', text: `GPS Error: ${err.message}` });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Submit create or edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatusMessage({ type: 'error', text: 'Location name is required.' });
      return;
    }

    try {
      setIsLoading(true);
      if (selectedMarker && !isAddingNew) {
        // Update existing marker
        await updateMapMarkerApi(selectedMarker._id, formData, token);
        setStatusMessage({ type: 'success', text: `Updated "${formData.name}" successfully!` });
      } else {
        // Create new marker
        await createMapMarkerApi(formData, token);
        setStatusMessage({ type: 'success', text: `Created "${formData.name}" successfully!` });
      }

      await loadMarkers();
      if (onRefreshMarkers) onRefreshMarkers();
      setIsAddingNew(false);
      setSelectedMarker(null);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Operation failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete marker
  const handleDelete = async (markerId, name) => {
    if (!window.confirm(`Are you sure you want to delete marker "${name}"?`)) return;
    try {
      setIsLoading(true);
      await deleteMapMarkerApi(markerId, token);
      setStatusMessage({ type: 'success', text: `Deleted marker "${name}".` });
      await loadMarkers();
      if (onRefreshMarkers) onRefreshMarkers();
      setSelectedMarker(null);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete' });
    } finally {
      setIsLoading(false);
    }
  };

  // Select marker to edit
  const handleSelectMarkerForEdit = (m) => {
    setSelectedMarker(m);
    setIsAddingNew(false);
    setClickCoord({ x: m.imageX, y: m.imageY });
    setFormData({
      name: m.name,
      label: m.label || m.name,
      category: m.category,
      imageX: m.imageX,
      imageY: m.imageY,
      latitude: m.latitude,
      longitude: m.longitude,
      shortCode: m.shortCode || '',
      description: m.description || '',
      buildingId: m.buildingId || '',
      visible: m.visible !== false,
      verified: m.verified !== false
    });
  };

  // Start new marker
  const handleStartNewMarker = () => {
    setIsAddingNew(true);
    setSelectedMarker(null);
    setFormData({
      name: '',
      label: '',
      category: 'Academic',
      imageX: clickCoord?.x || 0.5,
      imageY: clickCoord?.y || 0.5,
      latitude: 13.1706,
      longitude: 77.5358,
      shortCode: '',
      description: '',
      buildingId: '',
      visible: true,
      verified: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Official Campus Master Map Marker Editor
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Rule 1: Admin Exclusive
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Click map to place or reposition pins · Calibrate normalized image coords & GPS datum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartNewMarker}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Marker</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border-b border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border-b border-rose-800 text-rose-300'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Body: Map on Left, Form/List on Right */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left: Interactive Original Map View */}
          <div className="flex-1 bg-slate-950 p-4 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-3 left-4 z-10 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs text-slate-300 flex items-center gap-2 shadow-lg">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              <span>Click anywhere on the map to set pin position</span>
            </div>

            <div
              ref={imageRef}
              onClick={handleMapClick}
              style={{
                aspectRatio: `${583 / 829}`,
                maxHeight: '75vh',
                maxWidth: '100%'
              }}
              className="relative rounded-2xl border-2 border-slate-700 bg-white overflow-hidden shadow-2xl cursor-crosshair group"
            >
              {/* Official Master Map Image */}
              <img
                src="/maps/presidency-campus-master-map.png"
                alt="Presidency Campus Map"
                className="w-full h-full object-contain pointer-events-none block"
              />

              {/* Render Existing Markers */}
              {markers.map((m) => {
                const isSelected = selectedMarker?._id === m._id;
                return (
                  <div
                    key={m._id}
                    style={{
                      left: `${m.imageX * 100}%`,
                      top: `${m.imageY * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectMarkerForEdit(m);
                    }}
                    className={`absolute z-10 w-4 h-4 rounded-full border-2 border-white cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400 scale-150 ring-4 ring-amber-300 z-30'
                        : 'bg-emerald-600 hover:scale-125'
                    }`}
                    title={`${m.name} (${m.category})`}
                  />
                );
              })}

              {/* Active Selection / Click Reticle */}
              {clickCoord && (
                <div
                  style={{
                    left: `${clickCoord.x * 100}%`,
                    top: `${clickCoord.y * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute z-20 pointer-events-none"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-rose-500 animate-spin" />
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              )}
            </div>
          </div>

          {/* Right: Marker Edit Form & Directory Sidebar */}
          <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 sm:p-5 flex flex-col overflow-y-auto">
            
            {/* Form Section */}
            {(isAddingNew || selectedMarker) ? (
              <form onSubmit={handleSubmit} className="space-y-3.5 pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {isAddingNew ? 'Create New Map Marker' : 'Edit Selected Marker'}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setSelectedMarker(null); setIsAddingNew(false); }}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. D Block (Mechanical & Civil)"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Short Code
                    </label>
                    <input
                      type="text"
                      value={formData.shortCode}
                      onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                      placeholder="PU-D-BLOCK"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Normalized Image Coordinates */}
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Normalized Image Coords</span>
                    <span className="text-emerald-400 font-mono">0.0 – 1.0</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Image X:</span>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        max="1"
                        value={formData.imageX}
                        onChange={(e) => setFormData({ ...formData, imageX: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Image Y:</span>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        max="1"
                        value={formData.imageY}
                        onChange={(e) => setFormData({ ...formData, imageY: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Outdoor GPS Datum */}
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Real Outdoor GPS Datum</span>
                    <button
                      type="button"
                      onClick={handleCaptureDeviceGps}
                      className="text-emerald-400 hover:text-emerald-300 text-[10px] font-semibold flex items-center gap-1"
                      title="Use device GPS location"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Capture GPS</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Latitude:</span>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Longitude:</span>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Building Link (Optional)
                  </label>
                  <select
                    value={formData.buildingId}
                    onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="">None / Outdoor Facility</option>
                    {buildings.map(b => (
                      <option key={b.buildingId || b._id} value={b.buildingId || b._id}>
                        {b.buildingName || b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                      className="rounded border-slate-700 text-emerald-500"
                    />
                    <span>Visible on Map</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  {selectedMarker && !isAddingNew && (
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedMarker._id, selectedMarker.name)}
                      className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isAddingNew ? 'Create Marker' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            ) : null}

            {/* List of Current Markers */}
            <div className="flex-1 overflow-y-auto mt-3 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider">
                  Campus Markers ({markers.length})
                </span>
                <button
                  onClick={loadMarkers}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Refresh marker list"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {markers.map((m) => (
                <div
                  key={m._id}
                  onClick={() => handleSelectMarkerForEdit(m)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    selectedMarker?._id === m._id
                      ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-950 hover:text-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{m.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span className="capitalize">{m.category}</span>
                      <span>·</span>
                      <span className="font-mono">X: {m.imageX.toFixed(2)}, Y: {m.imageY.toFixed(2)}</span>
                    </div>
                  </div>

                  <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
