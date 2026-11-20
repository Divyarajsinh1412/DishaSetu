import React, { useState, useMemo } from 'react';
import {
  Shield,
  Building2,
  BookOpen,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  X,
  Crosshair,
  Navigation as NavigationIcon,
  Accessibility,
  Eye,
  History,
  CheckSquare,
  XCircle,
  Clock,
  Layers,
  Upload,
  Phone,
  Mail,
  User,
  GitBranch,
  Play,
  RotateCcw,
  Sliders,
  Radio,
  FileSpreadsheet,
  LocateFixed
} from 'lucide-react';
import {
  createBuildingApi,
  updateBuildingApi,
  deleteBuildingApi,
  addBuildingEntranceApi,
  deleteBuildingEntranceApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
  reviewApprovalApi,
  updateLocationSurveyApi,
  createWalkingPathApi,
  updateWalkingPathApi,
  deleteWalkingPathApi,
  calculateRouteApi
} from '../../services/api';
import { clientRoutingEngine } from '../../services/routingEngine';
import { NAVIGATION_NODES } from '../../services/pedestrianGraphData';

export default function AdminDashboard({
  isOpen,
  onClose,
  buildings = [],
  departments = [],
  approvals = [],
  auditLogs = [],
  catalog = [],
  walkingPaths = [],
  onRefreshData,
  onStartMapPick,
  pickedCoordinates,
  onOpenIndoorSurvey = null
}) {
  const [activeTab, setActiveTab] = useState('buildings'); // 'buildings' | 'departments' | 'survey' | 'paths' | 'approvals' | 'audit'

  // Current admin token
  const token = localStorage.getItem('dishasetu_admin_token') || 'mock_verified_admin_token';

  // Phase 3A: GPS Survey View State
  const [surveySubTab, setSurveySubTab] = useState('catalog'); // 'catalog' | 'entrances'
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('all');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState('all');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [editingLocationSurvey, setEditingLocationSurvey] = useState(null);
  const [locationSurveyForm, setLocationSurveyForm] = useState({
    lat: '',
    lng: '',
    entranceLat: '',
    entranceLng: '',
    verificationStatus: 'Published',
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.0
  });

  // Phase 3A: Walking Paths Editor State
  const [showPathModal, setShowPathModal] = useState(false);
  const [pathForm, setPathForm] = useState({
    name: '',
    startNode: 'node_main_gate',
    endNode: 'node_d_block_ent',
    distanceMeters: 25,
    accessibility: true,
    pathType: 'secondary_walkway',
    status: 'active'
  });

  // Phase 3A: Route Test Runner State
  const [routeTest, setRouteTest] = useState({
    start: 'node_main_gate',
    dest: 'node_d_block_ent',
    accessible: false,
    result: null,
    error: null,
    loading: false
  });

  const filteredCatalog = useMemo(() => {
    let list = catalog && catalog.length > 0 ? catalog : [];
    if (catalogCategoryFilter !== 'all') {
      list = list.filter(item => item.category?.toLowerCase() === catalogCategoryFilter.toLowerCase());
    }
    if (catalogStatusFilter !== 'all') {
      list = list.filter(item => item.verificationStatus?.toLowerCase() === catalogStatusFilter.toLowerCase());
    }
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.shortCode?.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [catalog, catalogCategoryFilter, catalogStatusFilter, catalogSearch]);

  const catalogStats = useMemo(() => {
    const list = catalog || [];
    return {
      total: list.length,
      published: list.filter(i => i.verificationStatus === 'Published').length,
      verified: list.filter(i => i.verificationStatus === 'Verified').length,
      gpsCaptured: list.filter(i => i.verificationStatus === 'GPS Captured').length,
      pending: list.filter(i => !i.verificationStatus || i.verificationStatus === 'Not Surveyed' || i.verificationStatus === 'Draft').length
    };
  }, [catalog]);

  // Building Form State
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [bldForm, setBldForm] = useState({
    name: '',
    shortCode: '',
    category: 'Academic',
    totalFloors: 3,
    description: '',
    photoUrl: ''
  });

  // Department Form State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    faculty: 'School of Engineering',
    buildingShortCode: '',
    floorNumber: 1,
    headOfDepartment: '',
    contactEmail: '',
    contactPhone: '',
    description: ''
  });

  // Entrance Survey Form State
  const [selectedBuildingForSurvey, setSelectedBuildingForSurvey] = useState(buildings[0]?._id || '');
  const [entranceForm, setEntranceForm] = useState({
    name: 'Main Entrance (East)',
    lat: '',
    lng: '',
    isAccessible: true,
    isPrimary: true,
    hasRamp: true,
    hasElevatorNearby: false,
    notes: ''
  });

  const [formStatus, setFormStatus] = useState({ loading: false, error: '', success: '' });

  // Update entrance coordinates if picked from map
  React.useEffect(() => {
    if (pickedCoordinates) {
      setEntranceForm(prev => ({
        ...prev,
        lat: pickedCoordinates.lat.toFixed(6),
        lng: pickedCoordinates.lng.toFixed(6)
      }));
      setFormStatus({ loading: false, error: '', success: 'Coordinates captured from map click!' });
    }
  }, [pickedCoordinates]);

  if (!isOpen) return null;

  // Handle GPS Capture
  const handleCaptureCurrentGps = () => {
    if (!navigator.geolocation) {
      setFormStatus({ loading: false, error: 'Geolocation not supported by device.', success: '' });
      return;
    }
    setFormStatus({ loading: true, error: '', success: 'Acquiring GPS fix...' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEntranceForm(prev => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6)
        }));
        setFormStatus({
          loading: false,
          error: '',
          success: `GPS Captured! Accuracy: ±${Math.round(pos.coords.accuracy)}m`
        });
      },
      (err) => {
        setFormStatus({ loading: false, error: `GPS Error: ${err.message}`, success: '' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Save Building
  const handleSaveBuilding = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, error: '', success: '' });
    try {
      if (editingBuilding) {
        await updateBuildingApi(editingBuilding._id, bldForm, token);
      } else {
        await createBuildingApi(bldForm, token);
      }
      setShowBuildingModal(false);
      setEditingBuilding(null);
      setBldForm({ name: '', shortCode: '', category: 'Academic', totalFloors: 3, description: '', photoUrl: '' });
      onRefreshData();
    } catch (err) {
      setFormStatus({ loading: false, error: err.message, success: '' });
    }
  };

  // Delete Building
  const handleDeleteBuilding = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campus building?')) return;
    try {
      await deleteBuildingApi(id, token);
      onRefreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Save Department
  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, error: '', success: '' });
    try {
      if (editingDept) {
        await updateDepartmentApi(editingDept._id, deptForm, token);
      } else {
        await createDepartmentApi(deptForm, token);
      }
      setShowDeptModal(false);
      setEditingDept(null);
      onRefreshData();
    } catch (err) {
      setFormStatus({ loading: false, error: err.message, success: '' });
    }
  };

  // Delete Department
  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to remove this department?')) return;
    try {
      await deleteDepartmentApi(id, token);
      onRefreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Save Building Entrance
  const handleSaveEntrance = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, error: '', success: '' });

    const nLat = parseFloat(entranceForm.lat);
    const nLng = parseFloat(entranceForm.lng);

    if (isNaN(nLat) || isNaN(nLng)) {
      setFormStatus({ loading: false, error: 'Please enter valid numerical latitude and longitude.', success: '' });
      return;
    }

    try {
      const res = await addBuildingEntranceApi(selectedBuildingForSurvey, {
        name: entranceForm.name,
        coordinates: { lat: nLat, lng: nLng },
        isAccessible: entranceForm.isAccessible,
        isPrimary: entranceForm.isPrimary,
        hasRamp: entranceForm.hasRamp,
        hasElevatorNearby: entranceForm.hasElevatorNearby,
        notes: entranceForm.notes
      }, token);

      if (res.success) {
        setFormStatus({ loading: false, error: '', success: 'Entrance GPS survey published successfully!' });
        onRefreshData();
      } else {
        setFormStatus({ loading: false, error: res.message || 'Validation failed.', success: '' });
      }
    } catch (err) {
      setFormStatus({ loading: false, error: err.message, success: '' });
    }
  };

  // Delete Entrance
  const handleDeleteEntrance = async (bldId, entId) => {
    if (!window.confirm('Remove this entrance?')) return;
    try {
      await deleteBuildingEntranceApi(bldId, entId, token);
      onRefreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Approve / Reject
  const handleReviewApproval = async (id, decision) => {
    const reason = decision === 'rejected' ? prompt('Reason for rejection:') : '';
    await reviewApprovalApi(id, decision, reason || '', token);
    onRefreshData();
  };

  // Phase 3A: Open Location Survey Modal
  const handleOpenLocationSurvey = (loc) => {
    setEditingLocationSurvey(loc);
    setLocationSurveyForm({
      lat: loc.coordinates?.lat != null ? String(loc.coordinates.lat) : '',
      lng: loc.coordinates?.lng != null ? String(loc.coordinates.lng) : '',
      entranceLat: loc.entranceCoordinates?.lat != null ? String(loc.entranceCoordinates.lat) : (loc.coordinates?.lat != null ? String(loc.coordinates.lat) : ''),
      entranceLng: loc.entranceCoordinates?.lng != null ? String(loc.entranceCoordinates.lng) : (loc.coordinates?.lng != null ? String(loc.coordinates.lng) : ''),
      verificationStatus: loc.verificationStatus || 'Published',
      coordinateSource: loc.coordinateSource || 'Google Maps Manual',
      gpsAccuracy: loc.gpsAccuracy || 2.0
    });
  };

  // Phase 3A: Save Location Survey
  const handleSaveLocationSurvey = async (e) => {
    e.preventDefault();
    if (!editingLocationSurvey) return;
    try {
      const payload = {
        verificationStatus: locationSurveyForm.verificationStatus,
        coordinateSource: locationSurveyForm.coordinateSource,
        gpsAccuracy: Number(locationSurveyForm.gpsAccuracy)
      };
      if (locationSurveyForm.lat && locationSurveyForm.lng) {
        payload.coordinates = {
          lat: parseFloat(locationSurveyForm.lat),
          lng: parseFloat(locationSurveyForm.lng)
        };
      }
      if (locationSurveyForm.entranceLat && locationSurveyForm.entranceLng) {
        payload.entranceCoordinates = {
          lat: parseFloat(locationSurveyForm.entranceLat),
          lng: parseFloat(locationSurveyForm.entranceLng)
        };
      }
      await updateLocationSurveyApi(editingLocationSurvey.locationId, payload, token);
      setEditingLocationSurvey(null);
      onRefreshData();
    } catch (err) {
      alert(`Survey Update Failed: ${err.message}`);
    }
  };

  // Phase 3A: Create Walking Path
  const handleCreateWalkingPath = async (e) => {
    e.preventDefault();
    try {
      await createWalkingPathApi(pathForm, token);
      setShowPathModal(false);
      onRefreshData();
    } catch (err) {
      alert(`Failed to create walking path: ${err.message}`);
    }
  };

  // Phase 3A: Toggle Path Status (active / closed)
  const handleTogglePathStatus = async (path) => {
    try {
      const newStatus = path.status === 'active' ? 'closed' : 'active';
      await updateWalkingPathApi(path.pathId, { status: newStatus }, token);
      onRefreshData();
    } catch (err) {
      alert(`Failed to update path status: ${err.message}`);
    }
  };

  // Phase 3A: Toggle Path Accessibility
  const handleTogglePathAccessibility = async (path) => {
    try {
      await updateWalkingPathApi(path.pathId, { accessibility: !path.accessibility }, token);
      onRefreshData();
    } catch (err) {
      alert(`Failed to update accessibility: ${err.message}`);
    }
  };

  // Phase 3A: Delete Path
  const handleDeletePath = async (pathId) => {
    if (!window.confirm('Delete this walking path from the campus navigation graph?')) return;
    try {
      await deleteWalkingPathApi(pathId, token);
      onRefreshData();
    } catch (err) {
      alert(`Failed to delete path: ${err.message}`);
    }
  };

  // Phase 3A: Run Route Test
  const handleRunRouteTest = async () => {
    setRouteTest(prev => ({ ...prev, loading: true, error: null, result: null }));
    try {
      const res = await calculateRouteApi({
        start: routeTest.start,
        destination: routeTest.dest,
        accessibleOnly: routeTest.accessible
      });
      setRouteTest(prev => ({ ...prev, loading: false, result: res, error: null }));
    } catch (err) {
      try {
        const localRes = clientRoutingEngine.calculateRoute({
          start: routeTest.start,
          destination: routeTest.dest,
          accessibleOnly: routeTest.accessible
        });
        setRouteTest(prev => ({ ...prev, loading: false, result: localRes, error: null }));
      } catch (localErr) {
        setRouteTest(prev => ({ ...prev, loading: false, error: localErr.message }));
      }
    }
  };

  const selectedBuildingData = buildings.find(b => b._id === selectedBuildingForSurvey) || buildings[0];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[90vh] bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-[#0f172a] to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-white">DishaSetu Campus Administration</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-sky-400 border border-blue-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">Presidency University Bengaluru &bull; Master Campus Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-[#0b132b] border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'buildings', label: `Buildings (${buildings.length})`, icon: Building2 },
            { id: 'departments', label: `Departments (${departments.length})`, icon: BookOpen },
            { id: 'survey', label: `GPS Survey (${catalog.length || 38})`, icon: Crosshair },
            { id: 'paths', label: `Walking Paths (${walkingPaths.length || 37})`, icon: GitBranch },
            { id: 'approvals', label: `Pending Approvals (${approvals.length})`, icon: CheckSquare },
            { id: 'audit', label: 'Audit Logs', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dashboard Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0f172a]">
          {/* TAB 1: BUILDINGS MANAGEMENT */}
          {activeTab === 'buildings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Campus Buildings Catalog</h2>
                  <p className="text-xs text-slate-400">
                    Add, edit and manage academic blocks, administrative offices, and facilities.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingBuilding(null);
                    setBldForm({ name: '', shortCode: '', category: 'Academic', totalFloors: 3, description: '', photoUrl: '' });
                    setShowBuildingModal(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Building
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buildings.map((b) => {
                  const entranceCount = b.entrances?.length || 0;
                  return (
                    <div
                      key={b._id || b.shortCode}
                      className="p-4 rounded-xl bg-[#1e293b]/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                              {b.shortCode}
                            </span>
                            <h3 className="font-bold text-sm text-white mt-1">{b.name}</h3>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              entranceCount > 0
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {entranceCount > 0 ? `${entranceCount} Entrance(s)` : 'Survey Pending'}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {b.description || 'No description provided.'}
                        </p>

                        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                          <span>Category: <strong className="text-slate-200">{b.category}</strong></span>
                          <span>Floors: <strong className="text-slate-200">{b.totalFloors}</strong></span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedBuildingForSurvey(b._id);
                            setActiveTab('survey');
                          }}
                          className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                        >
                          <Crosshair className="w-3.5 h-3.5" /> Survey GPS
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingBuilding(b);
                              setBldForm({
                                name: b.name,
                                shortCode: b.shortCode,
                                category: b.category,
                                totalFloors: b.totalFloors,
                                description: b.description || '',
                                photoUrl: b.photos?.[0]?.url || ''
                              });
                              setShowBuildingModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                            title="Edit Building"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBuilding(b._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                            title="Delete Building"
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

          {/* TAB 2: DEPARTMENTS MANAGEMENT */}
          {activeTab === 'departments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">University Departments Catalog</h2>
                  <p className="text-xs text-slate-400">
                    Map university faculties, programs, and administrative offices to campus buildings and floors.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingDept(null);
                    setDeptForm({
                      name: '',
                      code: '',
                      faculty: 'School of Engineering',
                      buildingShortCode: buildings[0]?.shortCode || 'PU-D-BLOCK',
                      floorNumber: 1,
                      headOfDepartment: '',
                      contactEmail: '',
                      contactPhone: '',
                      description: ''
                    });
                    setShowDeptModal(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Department
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((d) => (
                  <div
                    key={d._id || d.code}
                    className="p-4 rounded-xl bg-[#1e293b]/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-400 border border-blue-500/30">
                            {d.code}
                          </span>
                          <h3 className="font-bold text-sm text-white mt-1">{d.name}</h3>
                          <div className="text-[11px] text-indigo-400 font-medium">{d.faculty}</div>
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {d.description}
                      </p>

                      <div className="mt-3 p-2.5 bg-[#0f172a] rounded-lg border border-slate-800 text-xs space-y-1 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Location:</span>
                          <span className="font-semibold text-white">
                            {d.buildingShortCode || 'Pending'} &bull; Floor {d.floorNumber}
                          </span>
                        </div>
                        {d.headOfDepartment && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">HOD:</span>
                            <span>{d.headOfDepartment}</span>
                          </div>
                        )}
                        {d.contactEmail && (
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">Email:</span>
                            <span className="text-sky-400 font-mono">{d.contactEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingDept(d);
                          setDeptForm({ ...d });
                          setShowDeptModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                        title="Edit Department"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(d._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GPS SURVEY & CAMPUS CATALOG */}
          {activeTab === 'survey' && (
            <div className="space-y-6">
              {/* Header and Sub-Tab Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Crosshair className="w-5 h-5 text-sky-400" /> Campus GPS Coordinate Survey
                  </h2>
                  <p className="text-xs text-slate-400">
                    Official survey tool for Presidency University buildings, gates, facilities, and entrances.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-[#0b132b] border border-slate-800 rounded-xl self-start sm:self-auto">
                  <button
                    onClick={() => setSurveySubTab('catalog')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      surveySubTab === 'catalog'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Campus Catalog ({catalog.length || 38})
                  </button>
                  <button
                    onClick={() => setSurveySubTab('entrances')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      surveySubTab === 'entrances'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Building Entrances
                  </button>
                  {onOpenIndoorSurvey && (
                    <button
                      onClick={() => onOpenIndoorSurvey()}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-all flex items-center gap-1.5 shadow"
                      title="Open Indoor Classroom Survey & Coordinate Capture"
                    >
                      <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Indoor Survey & GPS</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              {formStatus.error && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formStatus.error}</span>
                </div>
              )}
              {formStatus.success && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{formStatus.success}</span>
                </div>
              )}

              {/* VIEW 1: COMPLETE CAMPUS CATALOG SURVEY */}
              {surveySubTab === 'catalog' && (
                <div className="space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    <div className="p-3 bg-[#1e293b]/60 border border-slate-800 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Locations</div>
                      <div className="text-lg font-extrabold text-white mt-0.5">{catalogStats.total}</div>
                    </div>
                    <div className="p-3 bg-[#1e293b]/60 border border-slate-800 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-emerald-400">Published</div>
                      <div className="text-lg font-extrabold text-emerald-400 mt-0.5">{catalogStats.published}</div>
                    </div>
                    <div className="p-3 bg-[#1e293b]/60 border border-slate-800 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-sky-400">Verified</div>
                      <div className="text-lg font-extrabold text-sky-400 mt-0.5">{catalogStats.verified}</div>
                    </div>
                    <div className="p-3 bg-[#1e293b]/60 border border-slate-800 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-blue-400">GPS Captured</div>
                      <div className="text-lg font-extrabold text-blue-400 mt-0.5">{catalogStats.gpsCaptured}</div>
                    </div>
                    <div className="p-3 bg-[#1e293b]/60 border border-slate-800 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-amber-400">Pending Survey</div>
                      <div className="text-lg font-extrabold text-amber-400 mt-0.5">{catalogStats.pending}</div>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 bg-[#1e293b]/60 border border-slate-800 rounded-xl">
                    <div className="w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Search location by name or code..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#0b132b] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <select
                        value={catalogCategoryFilter}
                        onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-[#0b132b] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="all">All Categories</option>
                        <option value="Academic">Academic Blocks</option>
                        <option value="Gate">Campus Gates</option>
                        <option value="Facility">Dining & Facilities</option>
                        <option value="Sports">Sports Amenities</option>
                        <option value="Parking">Parking Zones</option>
                        <option value="Outdoor">Outdoor Landscaping</option>
                      </select>

                      <select
                        value={catalogStatusFilter}
                        onChange={(e) => setCatalogStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-[#0b132b] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="all">All Survey Statuses</option>
                        <option value="Published">Published</option>
                        <option value="Verified">Verified</option>
                        <option value="GPS Captured">GPS Captured</option>
                        <option value="Draft">Draft</option>
                        <option value="Not Surveyed">Not Surveyed</option>
                      </select>
                    </div>
                  </div>

                  {/* Catalog Table */}
                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-[#0f172a]">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-[#1e293b] text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Code</th>
                          <th className="px-4 py-3">Location Name</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">GPS Coordinates</th>
                          <th className="px-4 py-3">Source & Accuracy</th>
                          <th className="px-4 py-3">Survey Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {filteredCatalog.map((loc) => {
                          const hasCoords = loc.coordinates && loc.coordinates.lat != null;
                          return (
                            <tr key={loc.locationId} className="hover:bg-slate-800/40 transition-colors">
                              <td className="px-4 py-3 font-mono font-semibold text-sky-400">
                                {loc.shortCode}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-bold text-white">{loc.name}</div>
                                <div className="text-[11px] text-slate-400 line-clamp-1">{loc.description}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-medium">
                                  {loc.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-[11px]">
                                {hasCoords ? (
                                  <span className="text-emerald-300">
                                    {loc.coordinates.lat.toFixed(6)}, {loc.coordinates.lng.toFixed(6)}
                                  </span>
                                ) : (
                                  <span className="text-amber-400 font-sans italic">Pending Survey</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-[11px]">
                                <div className="text-slate-300">{loc.coordinateSource || 'Pending'}</div>
                                {loc.gpsAccuracy && (
                                  <div className="text-[10px] text-slate-500 font-mono">&plusmn;{loc.gpsAccuracy}m</div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  loc.verificationStatus === 'Published'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : loc.verificationStatus === 'Verified'
                                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                                    : loc.verificationStatus === 'GPS Captured'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                }`}>
                                  {loc.verificationStatus || 'Pending'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleOpenLocationSurvey(loc)}
                                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-[11px] transition-colors"
                                >
                                  Update Survey
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 2: BUILDING ENTRANCES SURVEY */}
              {surveySubTab === 'entrances' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Column */}
                <div className="lg:col-span-1 p-5 rounded-2xl bg-[#1e293b]/70 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-sky-400" /> Entrance Survey Form
                  </h3>

                  {/* Target Building Selector */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Target Building</label>
                    <select
                      value={selectedBuildingForSurvey}
                      onChange={(e) => setSelectedBuildingForSurvey(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      {buildings.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name} ({b.shortCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Entrance Name */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Entrance Name / Door Label</label>
                    <input
                      type="text"
                      value={entranceForm.name}
                      onChange={(e) => setEntranceForm({ ...entranceForm, name: e.target.value })}
                      placeholder="e.g. East Main Entrance, Ramp Access (West)"
                      className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Capture Coordinates Methods */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                      <span>Coordinates Capture</span>
                      <span className="text-[10px] text-emerald-400 font-mono">13.16-13.18°N, 77.53-77.54°E</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onStartMapPick && onStartMapPick(selectedBuildingForSurvey);
                          onClose();
                        }}
                        className="py-2 px-3 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-xl text-xs font-semibold text-sky-300 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-sky-400" /> Pick on Map
                      </button>
                      <button
                        type="button"
                        onClick={handleCaptureCurrentGps}
                        className="py-2 px-3 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 rounded-xl text-xs font-semibold text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <NavigationIcon className="w-3.5 h-3.5 text-amber-400" /> Use My GPS
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-0.5">Latitude</label>
                        <input
                          type="text"
                          value={entranceForm.lat}
                          onChange={(e) => setEntranceForm({ ...entranceForm, lat: e.target.value })}
                          placeholder="13.170500"
                          className="w-full px-2.5 py-1.5 bg-[#0f172a] border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-0.5">Longitude</label>
                        <input
                          type="text"
                          value={entranceForm.lng}
                          onChange={(e) => setEntranceForm({ ...entranceForm, lng: e.target.value })}
                          placeholder="77.535800"
                          className="w-full px-2.5 py-1.5 bg-[#0f172a] border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Accessibility & Flags */}
                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entranceForm.isPrimary}
                        onChange={(e) => setEntranceForm({ ...entranceForm, isPrimary: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-blue-600"
                      />
                      <span>Set as Primary Building Entrance</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entranceForm.isAccessible}
                        onChange={(e) => setEntranceForm({ ...entranceForm, isAccessible: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-green-600"
                      />
                      <span>Wheelchair Accessible (Step-free)</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entranceForm.hasRamp}
                        onChange={(e) => setEntranceForm({ ...entranceForm, hasRamp: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-sky-600"
                      />
                      <span>Dedicated Wheelchair Ramp</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entranceForm.hasElevatorNearby}
                        onChange={(e) => setEntranceForm({ ...entranceForm, hasElevatorNearby: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                      />
                      <span>Direct Elevator / Lift Access</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveEntrance}
                    disabled={formStatus.loading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {formStatus.loading ? 'Validating & Publishing...' : 'Validate & Publish Entrance'}
                  </button>
                </div>

                {/* Surveyed Entrances List Column */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-4 rounded-xl bg-[#1e293b]/50 border border-slate-800">
                    <h4 className="font-bold text-sm text-white flex items-center justify-between">
                      <span>Surveyed Entrances for {selectedBuildingData?.name}</span>
                      <span className="text-xs text-sky-400 font-mono">
                        {selectedBuildingData?.entrances?.length || 0} Registered
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedBuildingData?.description}
                    </p>
                  </div>

                  {(!selectedBuildingData?.entrances || selectedBuildingData.entrances.length === 0) ? (
                    <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0b132b]/50">
                      <Crosshair className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <div className="font-semibold text-sm text-slate-300">No Entrance Coordinates Registered</div>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        This building is awaiting ground survey coordinates. Use the form on the left to capture its entrance using GPS or Map Click.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedBuildingData.entrances.map((ent) => (
                        <div
                          key={ent.entranceId}
                          className="p-4 rounded-xl bg-[#1e293b] border border-slate-700/80 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <h5 className="font-bold text-xs text-white">{ent.name}</h5>
                              {ent.isPrimary && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-400 border border-blue-500/30">
                                  Primary
                                </span>
                              )}
                            </div>

                            <div className="mt-2 text-xs font-mono text-emerald-400">
                              {ent.coordinates?.lat?.toFixed(6)}, {ent.coordinates?.lng?.toFixed(6)}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                              {ent.isAccessible && (
                                <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-300">
                                  Accessible
                                </span>
                              )}
                              {ent.hasRamp && (
                                <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300">
                                  Ramp
                                </span>
                              )}
                              {ent.hasElevatorNearby && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                                  Elevator
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-2 border-t border-slate-800 flex justify-end">
                            <button
                              onClick={() => handleDeleteEntrance(selectedBuildingData._id, ent.entranceId)}
                              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove Entrance
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

          {/* TAB 4: APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-white">Pending Approval Requests</h2>
                <p className="text-xs text-slate-400">
                  Review major campus map updates, building deletions, and high-impact changes.
                </p>
              </div>

              {approvals.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0b132b]/50">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
                  <div className="font-semibold text-sm text-slate-300">All Approvals Clear</div>
                  <p className="text-xs text-slate-500 mt-1">There are no pending changes awaiting review.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {approvals.map((req) => (
                    <div key={req.requestId} className="p-4 bg-[#1e293b] border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase text-sky-400">{req.action} {req.resourceType}</span>
                          <span className="text-[11px] text-slate-400">by {req.requestedBy?.name || req.requestedBy?.email}</span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1 font-mono">
                          {JSON.stringify(req.payload)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReviewApproval(req.requestId, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                        >
                          <CheckSquare className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReviewApproval(req.requestId, 'rejected')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WALKING PATHS & PEDESTRIAN GRAPH NETWORK (PHASE 3A) */}
          {activeTab === 'paths' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-sky-400" /> Pedestrian Walking Paths & Graph Network
                  </h2>
                  <p className="text-xs text-slate-400">
                    Manage navigable campus walking edges, toggle temporary construction/event closures, and test shortest-path Dijkstra routing.
                  </p>
                </div>
                <button
                  onClick={() => setShowPathModal(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Add Walking Path
                </button>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-[#1e293b]/60 border border-slate-800 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Graph Nodes</div>
                  <div className="text-lg font-extrabold text-sky-400 mt-0.5">{NAVIGATION_NODES.length}</div>
                </div>
                <div className="p-3 bg-[#1e293b]/60 border border-slate-800 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Walking Path Edges</div>
                  <div className="text-lg font-extrabold text-emerald-400 mt-0.5">{walkingPaths.length || 37}</div>
                </div>
                <div className="p-3 bg-[#1e293b]/60 border border-slate-800 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Active Walkways</div>
                  <div className="text-lg font-extrabold text-white mt-0.5">
                    {walkingPaths.filter(p => p.status === 'active').length || walkingPaths.length}
                  </div>
                </div>
                <div className="p-3 bg-[#1e293b]/60 border border-slate-800 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Wheelchair Accessible</div>
                  <div className="text-lg font-extrabold text-indigo-400 mt-0.5">
                    {walkingPaths.filter(p => p.accessibility !== false).length || walkingPaths.length}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Table of Walking Paths (2 Cols) */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="font-bold text-sm text-white flex items-center justify-between">
                    <span>Verified Path Network</span>
                    <span className="text-xs text-slate-400">Ordered by Campus Spines</span>
                  </h3>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {(walkingPaths.length > 0 ? walkingPaths : []).map((path) => (
                      <div
                        key={path.pathId}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          path.status === 'active'
                            ? 'bg-[#1e293b]/70 border-slate-800'
                            : 'bg-red-950/20 border-red-500/40'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs text-white truncate">{path.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${
                              path.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {path.status}
                            </span>
                            {path.accessibility && (
                              <span className="text-[10px] text-sky-400 flex items-center gap-0.5">
                                <Accessibility className="w-3 h-3" /> Step-free
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                            <span className="font-mono text-slate-300">{path.startNode}</span>
                            <span>&rarr;</span>
                            <span className="font-mono text-slate-300">{path.endNode}</span>
                            <span>&bull;</span>
                            <span className="text-white font-semibold">{path.distanceMeters} m</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleTogglePathStatus(path)}
                            title={path.status === 'active' ? 'Mark as Closed (Maintenance/Event)' : 'Mark as Active'}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                              path.status === 'active'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            }`}
                          >
                            {path.status === 'active' ? 'Close Path' : 'Reopen'}
                          </button>
                          <button
                            onClick={() => handleTogglePathAccessibility(path)}
                            title="Toggle Wheelchair Accessibility"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                          >
                            <Accessibility className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePath(path.pathId)}
                            title="Delete Path"
                            className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Route Test Runner (1 Col) */}
                <div className="p-5 rounded-2xl bg-[#1e293b]/70 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-400" /> Dijkstra Route Test Runner
                  </h3>
                  <p className="text-xs text-slate-400">
                    Simulate real-time walking path calculation across any two campus nodes.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Start Origin Node</label>
                      <select
                        value={routeTest.start}
                        onChange={(e) => setRouteTest({ ...routeTest, start: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#0f172a] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        {NAVIGATION_NODES.map(n => (
                          <option key={n.nodeId} value={n.nodeId}>
                            {n.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">Destination Node</label>
                      <select
                        value={routeTest.dest}
                        onChange={(e) => setRouteTest({ ...routeTest, dest: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#0f172a] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        {NAVIGATION_NODES.map(n => (
                          <option key={n.nodeId} value={n.nodeId}>
                            {n.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={routeTest.accessible}
                        onChange={(e) => setRouteTest({ ...routeTest, accessible: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-sky-500"
                      />
                      <span>Enforce Step-free Accessible Paths</span>
                    </label>

                    <button
                      onClick={handleRunRouteTest}
                      disabled={routeTest.loading}
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {routeTest.loading ? 'Calculating...' : 'Run Dijkstra Route Test'}
                    </button>
                  </div>

                  {routeTest.error && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
                      {routeTest.error}
                    </div>
                  )}

                  {routeTest.result && (
                    <div className="p-3.5 rounded-xl bg-[#0f172a] border border-slate-700 space-y-2 text-xs animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-white font-bold border-b border-slate-800 pb-1.5">
                        <span className="text-emerald-400">Route Test Passed</span>
                        <span>{routeTest.result.distanceMeters} m &bull; ~{routeTest.result.estimatedWalkingMinutes} min</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Total steps: {routeTest.result.waypoints?.length || 0}
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {routeTest.result.waypoints?.map((w, i) => (
                          <div key={i} className="text-[10px] text-slate-300 flex items-start gap-1.5">
                            <span className="text-sky-400 font-bold shrink-0">{i + 1}.</span>
                            <span>{w.instruction}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-white">Administrative Audit History</h2>
                <p className="text-xs text-slate-400">
                  Tamper-evident chronological record of all administrative map modifications, coordinates, and approvals.
                </p>
              </div>

              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log._id} className="p-3 bg-[#1e293b]/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-sky-400 border border-blue-500/20 flex items-center justify-center font-bold">
                        {log.action?.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {log.action} on <span className="text-sky-400">{log.resource}</span> ({log.resourceId || 'N/A'})
                        </div>
                        <div className="text-[11px] text-slate-400">
                          By: {log.performedBy} &bull; Role: {log.userRole}
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Building Add / Edit Modal */}
      {showBuildingModal && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingBuilding ? 'Edit Building' : 'Add New Building'}
              </h3>
              <button onClick={() => setShowBuildingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBuilding} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Building Name</label>
                <input
                  type="text"
                  required
                  value={bldForm.name}
                  onChange={(e) => setBldForm({ ...bldForm, name: e.target.value })}
                  placeholder="e.g. Science & Technology Block"
                  className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Short Code</label>
                  <input
                    type="text"
                    required
                    value={bldForm.shortCode}
                    onChange={(e) => setBldForm({ ...bldForm, shortCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. PU-ST-01"
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={bldForm.category}
                    onChange={(e) => setBldForm({ ...bldForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Facility">Facility</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Total Floors</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={bldForm.totalFloors}
                  onChange={(e) => setBldForm({ ...bldForm, totalFloors: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={bldForm.description}
                  onChange={(e) => setBldForm({ ...bldForm, description: e.target.value })}
                  placeholder="Classroom capacities, departments housed, etc."
                  className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBuildingModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30"
                >
                  Save Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Add / Edit Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Electrical & Electronics Engineering"
                  className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. EEE"
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Faculty / School</label>
                  <select
                    value={deptForm.faculty}
                    onChange={(e) => setDeptForm({ ...deptForm, faculty: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="School of Engineering">School of Engineering</option>
                    <option value="School of Management">School of Management</option>
                    <option value="School of Law">School of Law</option>
                    <option value="School of Design">School of Design</option>
                    <option value="School of Commerce">School of Commerce</option>
                    <option value="School of Basic Sciences">School of Basic Sciences</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Assigned Building</label>
                  <select
                    value={deptForm.buildingShortCode}
                    onChange={(e) => setDeptForm({ ...deptForm, buildingShortCode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    {buildings.map((b) => (
                      <option key={b._id} value={b.shortCode}>
                        {b.name} ({b.shortCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Floor Number</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={deptForm.floorNumber}
                    onChange={(e) => setDeptForm({ ...deptForm, floorNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Head of Dept (HOD)</label>
                  <input
                    type="text"
                    value={deptForm.headOfDepartment}
                    onChange={(e) => setDeptForm({ ...deptForm, headOfDepartment: e.target.value })}
                    placeholder="Prof. Name"
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={deptForm.contactEmail}
                    onChange={(e) => setDeptForm({ ...deptForm, contactEmail: e.target.value })}
                    placeholder="dept@presidencyuniversity.in"
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phase 3A: Location GPS Survey Modal */}
      {editingLocationSurvey && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-sky-400" /> GPS Survey: {editingLocationSurvey.name}
                </h3>
                <span className="text-xs text-sky-400 font-mono">{editingLocationSurvey.shortCode} &bull; {editingLocationSurvey.category}</span>
              </div>
              <button onClick={() => setEditingLocationSurvey(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocationSurvey} className="space-y-4">
              {/* Quick Capture Actions */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Capture Methods</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onStartMapPick && onStartMapPick(editingLocationSurvey.locationId);
                      setEditingLocationSurvey(null);
                      onClose();
                    }}
                    className="py-2 px-3 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-xl text-xs font-semibold text-sky-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-sky-400" /> Click on Map
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        alert('Geolocation not supported by browser.');
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        pos => {
                          setLocationSurveyForm(prev => ({
                            ...prev,
                            lat: pos.coords.latitude.toFixed(6),
                            lng: pos.coords.longitude.toFixed(6),
                            coordinateSource: 'Mobile GPS',
                            gpsAccuracy: Math.round(pos.coords.accuracy)
                          }));
                        },
                        err => alert(`Could not read GPS: ${err.message}`),
                        { enableHighAccuracy: true }
                      );
                    }}
                    className="py-2 px-3 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 rounded-xl text-xs font-semibold text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <NavigationIcon className="w-3.5 h-3.5 text-amber-400" /> Mobile GPS
                  </button>
                </div>
              </div>

              {/* Coordinates Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Centroid Latitude</label>
                  <input
                    type="text"
                    value={locationSurveyForm.lat}
                    onChange={(e) => setLocationSurveyForm({ ...locationSurveyForm, lat: e.target.value })}
                    placeholder="13.170550"
                    required
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Centroid Longitude</label>
                  <input
                    type="text"
                    value={locationSurveyForm.lng}
                    onChange={(e) => setLocationSurveyForm({ ...locationSurveyForm, lng: e.target.value })}
                    placeholder="77.535610"
                    required
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Entrance Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Entrance Latitude</label>
                  <input
                    type="text"
                    value={locationSurveyForm.entranceLat}
                    onChange={(e) => setLocationSurveyForm({ ...locationSurveyForm, entranceLat: e.target.value })}
                    placeholder="13.170550"
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Entrance Longitude</label>
                  <input
                    type="text"
                    value={locationSurveyForm.entranceLng}
                    onChange={(e) => setLocationSurveyForm({ ...locationSurveyForm, entranceLng: e.target.value })}
                    placeholder="77.535610"
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Metadata: Source, Accuracy, Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Source</label>
                  <select
                    value={locationSurveyForm.coordinateSource}
                    onChange={(e) => setLocationSurveyForm({ ...locationSurveyForm, coordinateSource: e.target.value })}
                    className="w-full px-2 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="Google Maps Manual">Google Maps Manual</option>
                    <option value="Ground Survey">Ground Survey</option>
                    <option value="Mobile GPS">Mobile GPS</option>
                    <option value="Satellite Imagery">Satellite Imagery</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Accuracy (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={locationSurveyForm.gpsAccuracy}
                    onChange={(e) => setLocationSurveyForm({ ...locationSurveyForm, gpsAccuracy: e.target.value })}
                    className="w-full px-2 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Status Pipeline</label>
                  <select
                    value={locationSurveyForm.verificationStatus}
                    onChange={(e) => setLocationSurveyForm({ ...locationSurveyForm, verificationStatus: e.target.value })}
                    className="w-full px-2 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white font-bold"
                  >
                    <option value="Draft">Draft</option>
                    <option value="GPS Captured">GPS Captured</option>
                    <option value="Verified">Verified</option>
                    <option value="Published">Published</option>
                    <option value="Not Surveyed">Not Surveyed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingLocationSurvey(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30"
                >
                  Save & Publish Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phase 3A: Add Walking Path Edge Modal */}
      {showPathModal && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400" /> Add Navigable Walking Path Edge
              </h3>
              <button onClick={() => setShowPathModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkingPath} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Path Name</label>
                <input
                  type="text"
                  value={pathForm.name}
                  onChange={(e) => setPathForm({ ...pathForm, name: e.target.value })}
                  placeholder="e.g. Mechanical Lab to Library Walkway"
                  required
                  className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Start Node (Origin)</label>
                  <select
                    value={pathForm.startNode}
                    onChange={(e) => setPathForm({ ...pathForm, startNode: e.target.value })}
                    className="w-full px-2 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    {NAVIGATION_NODES.map(n => (
                      <option key={n.nodeId} value={n.nodeId}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">End Node (Destination)</label>
                  <select
                    value={pathForm.endNode}
                    onChange={(e) => setPathForm({ ...pathForm, endNode: e.target.value })}
                    className="w-full px-2 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    {NAVIGATION_NODES.map(n => (
                      <option key={n.nodeId} value={n.nodeId}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Distance (Meters)</label>
                  <input
                    type="number"
                    min="1"
                    value={pathForm.distanceMeters}
                    onChange={(e) => setPathForm({ ...pathForm, distanceMeters: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Path Type</label>
                  <select
                    value={pathForm.pathType}
                    onChange={(e) => setPathForm({ ...pathForm, pathType: e.target.value })}
                    className="w-full px-2 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="main_avenue">Main Avenue Spine</option>
                    <option value="secondary_walkway">Secondary Walkway</option>
                    <option value="building_access">Building Entrance Walkway</option>
                    <option value="sports_access">Sports Complex Access</option>
                    <option value="gate_access">Gate Access Path</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pathForm.accessibility}
                    onChange={(e) => setPathForm({ ...pathForm, accessibility: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                  />
                  <span>Wheelchair Accessible (Step-free)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPathModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30"
                >
                  Add Path to Network
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
