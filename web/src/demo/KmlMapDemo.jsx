import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  Polygon,
  Polyline,
  Marker,
  Popup,
  Tooltip,
  Circle,
  CircleMarker,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  Plus,
  FileCode,
  Download,
  Trash2,
  Maximize2,
  RotateCcw,
  Info,
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  PenTool,
  Upload,
  Crosshair,
  Grid,
  MapPin,
  Building2,
  Save,
  Footprints,
  School,
  Compass,
  LocateFixed,
  Play,
  Pause,
  Square,
  RefreshCw,
  Sliders,
  Edit3,
  AlertTriangle,
  FileText,
  ChevronRight,
  Search
} from 'lucide-react';
import {
  createCampusFeatureApi,
  saveSurveyedClassroomApi,
  fetchSurveyedClassroomsApi,
  deleteSurveyedClassroomApi,
  saveSurveyedWalkingPathApi,
  fetchSurveyedWalkingPathsApi,
  deleteSurveyedWalkingPathApi,
  fetchAllSurveyDataApi
} from '../services/api';

// Center reference: Presidency University, Bengaluru
const CAMPUS_DEFAULT_CENTER = [13.169116, 77.535350];
const DEFAULT_ZOOM = 17;

// Building options at Presidency University
const CAMPUS_BUILDINGS = [
  'D Block',
  'E Block',
  'F Block',
  'H Block',
  'Admissions Block',
  'L Block',
  'J Block',
  'K Block',
  'N Block',
  'P Block',
  'Q Block',
  'R Block',
  'S Block',
  'U Block',
  'Library Block',
  'Student Affairs Cell',
  'Central Amenities / Food Court',
  'Main Gate Security Complex',
  'Other'
];

const FLOOR_OPTIONS = [
  'Ground Floor',
  'First Floor',
  'Second Floor',
  'Third Floor',
  'Fourth Floor',
  'Basement'
];

const ROOM_TYPE_OPTIONS = [
  'Classroom',
  'Laboratory',
  'Staff Room',
  'Faculty Cabin',
  'HOD Office',
  'Dean / Director Office',
  'Seminar Hall',
  'Auditorium',
  'Computer Center',
  'Restroom',
  'Cafeteria / Canteen',
  'Security / Control Room',
  'Store / Utility Room',
  'Other'
];

const PATH_TYPE_OPTIONS = [
  'Main Walking Path',
  'Campus Road',
  'Footpath',
  'Corridor',
  'Entrance Path',
  'Indoor Walking Path',
  'Accessible Path',
  'Other'
];

// Geodesic distance formula (Haversine)
function calculateDistanceMeters([lat1, lng1], [lat2, lng2]) {
  const R = 6378137;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Geodesic polygon surface area in square meters (spherical excess)
function calculatePolygonAreaM2(coords) {
  if (!coords || coords.length < 3) return 0;
  const R = 6378137;
  let total = 0;
  for (let i = 0; i < coords.length; i++) {
    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[(i + 1) % coords.length];
    total +=
      ((lng2 * Math.PI) / 180 - (lng1 * Math.PI) / 180) *
      (2 + Math.sin((lat1 * Math.PI) / 180) + Math.sin((lat2 * Math.PI) / 180));
  }
  return Math.abs((total * R * R) / 2);
}

// Total perimeter or polyline length in meters
function calculatePerimeterMeters(coords) {
  if (!coords || coords.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += calculateDistanceMeters(coords[i], coords[i + 1]);
  }
  return total;
}

// Format meters to m or km
function formatDistance(meters) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters * 10) / 10} m`;
}

// Format seconds into MM:SS
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Accuracy badge metadata helper
function getAccuracyBadge(accuracy) {
  if (accuracy === null || accuracy === undefined || accuracy === 0) {
    return {
      label: 'Unknown',
      sub: 'No GPS Fix',
      color: 'bg-slate-100 text-slate-600 border-slate-300',
      dot: 'bg-slate-400',
      status: 'unknown'
    };
  }
  if (accuracy < 5) {
    return {
      label: `±${accuracy.toFixed(1)}m`,
      sub: 'High Accuracy',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      dot: 'bg-emerald-500',
      status: 'high'
    };
  }
  if (accuracy <= 15) {
    return {
      label: `±${accuracy.toFixed(1)}m`,
      sub: 'Medium Accuracy',
      color: 'bg-amber-50 text-amber-700 border-amber-300',
      dot: 'bg-amber-500',
      status: 'medium'
    };
  }
  return {
    label: `±${accuracy.toFixed(1)}m`,
    sub: 'Low Accuracy',
    color: 'bg-rose-50 text-rose-700 border-rose-300',
    dot: 'bg-rose-500',
    status: 'low'
  };
}

// Parse free-form coordinates from Google Earth / KML text
function parseCoordinatesInput(rawText) {
  if (!rawText || !rawText.trim()) return [];
  const lines = rawText
    .trim()
    .split(/[\r\n]+/)
    .map(l => l.trim())
    .filter(Boolean);

  const parsed = [];
  for (const line of lines) {
    const parts = line.split(/[,\s\t]+/).filter(Boolean);
    if (parts.length >= 2) {
      const val1 = parseFloat(parts[0]);
      const val2 = parseFloat(parts[1]);
      if (!isNaN(val1) && !isNaN(val2)) {
        // Auto-detect coordinate order (India: Lng ~77, Lat ~13)
        if (val1 > 50 && val2 < 40) {
          parsed.push([val2, val1]);
        } else {
          parsed.push([val1, val2]);
        }
      }
    }
  }
  return parsed;
}

// Custom Leaflet Pin Icon generator for generic markers
function createPinIcon(color = '#0284C7', label = '') {
  return L.divIcon({
    className: 'custom-demo-marker-pin',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
        <div style="width:26px;height:26px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
        </div>
        ${label ? `<div style="position:absolute;top:28px;left:50%;transform:translateX(-50%);background:#1e293b;color:white;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);">${label}</div>` : ''}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}

// Classroom Pin Icon with room code and building badge
function createRoomPinIcon(roomNumber = 'Room', building = 'Block') {
  return L.divIcon({
    className: 'custom-classroom-pin',
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <div style="display:flex;align-items:center;gap:4px;background:#0f172a;color:#ffffff;padding:3px 8px;border-radius:9999px;box-shadow:0 4px 12px rgba(15,23,42,0.4);border:1.5px solid #38bdf8;">
          <span style="width:7px;height:7px;background:#38bdf8;border-radius:50%;box-shadow:0 0 6px #38bdf8;"></span>
          <span style="font-size:10px;font-weight:800;letter-spacing:-0.2px;">${roomNumber}</span>
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #0f172a;margin-top:-1px;"></div>
      </div>
    `,
    iconSize: [80, 32],
    iconAnchor: [40, 32]
  });
}

// Path Endpoint Pin Icon (Start / End)
function createPathEndpointIcon(label = 'Start', isStart = true) {
  const bg = isStart ? '#10B981' : '#EF4444';
  return L.divIcon({
    className: 'custom-path-endpoint-pin',
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="background:${bg};color:#ffffff;padding:2px 6px;border-radius:6px;font-size:9px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:1.5px solid white;">
          ${label}
        </div>
        <div style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid ${bg};margin-top:-1px;"></div>
      </div>
    `,
    iconSize: [40, 26],
    iconAnchor: [20, 26]
  });
}

// Live Surveyor Pulse Marker Icon
function createSurveyorLiveIcon() {
  return L.divIcon({
    className: 'custom-surveyor-live-icon',
    html: `
      <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:24px;height:24px;background:#0284c7;opacity:0.35;border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="width:14px;height:14px;background:#0284c7;border:2.5px solid #ffffff;border-radius:50%;box-shadow:0 0 10px rgba(2,132,199,0.8);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

// Controller component for programmatic Map Actions (fitBounds, resetView)
function MapActionController({ fitTarget, resetTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (resetTrigger) {
      map.setView(CAMPUS_DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true });
    }
  }, [resetTrigger, map]);

  useEffect(() => {
    if (fitTarget && fitTarget.length > 0) {
      const bounds = L.latLngBounds(fitTarget);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 20, animate: true });
      }
    }
  }, [fitTarget, map]);

  return null;
}

// Map Event Listener for Cursor Coordinates & Click Capture
function MapEventListener({ onCursorMove, onCanvasClick }) {
  useMapEvents({
    mousemove(e) {
      onCursorMove?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    click(e) {
      onCanvasClick?.([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

export default function KmlMapDemo({ onExit }) {
  // 1. Pure White Canvas Features State (Initially empty)
  const [features, setFeatures] = useState(() => {
    try {
      const saved = localStorage.getItem('dishasetu_demo_canvas_features');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 2. Surveyed Classrooms State
  const [surveyedClassrooms, setSurveyedClassrooms] = useState(() => {
    try {
      const saved = localStorage.getItem('dishasetu_surveyed_classrooms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 3. Surveyed Walking Paths State
  const [surveyedWalkingPaths, setSurveyedWalkingPaths] = useState(() => {
    try {
      const saved = localStorage.getItem('dishasetu_surveyed_walking_paths');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist states locally
  useEffect(() => {
    try {
      localStorage.setItem('dishasetu_demo_canvas_features', JSON.stringify(features));
    } catch (e) {
      console.warn('Failed to save features to localStorage', e);
    }
  }, [features]);

  useEffect(() => {
    try {
      localStorage.setItem('dishasetu_surveyed_classrooms', JSON.stringify(surveyedClassrooms));
    } catch (e) {
      console.warn('Failed to save classrooms to localStorage', e);
    }
  }, [surveyedClassrooms]);

  useEffect(() => {
    try {
      localStorage.setItem('dishasetu_surveyed_walking_paths', JSON.stringify(surveyedWalkingPaths));
    } catch (e) {
      console.warn('Failed to save walking paths to localStorage', e);
    }
  }, [surveyedWalkingPaths]);

  // Sync with MongoDB Atlas on component mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [remoteClassrooms, remotePaths] = await Promise.all([
          fetchSurveyedClassroomsApi(),
          fetchSurveyedWalkingPathsApi()
        ]);
        if (isMounted) {
          if (Array.isArray(remoteClassrooms) && remoteClassrooms.length > 0) {
            setSurveyedClassrooms(prev => {
              const ids = new Set(prev.map(c => c.locationId));
              const merged = [...prev];
              remoteClassrooms.forEach(rc => {
                if (!ids.has(rc.locationId)) merged.push(rc);
              });
              return merged;
            });
          }
          if (Array.isArray(remotePaths) && remotePaths.length > 0) {
            setSurveyedWalkingPaths(prev => {
              const ids = new Set(prev.map(p => p.pathId));
              const merged = [...prev];
              remotePaths.forEach(rp => {
                if (!ids.has(rp.pathId)) merged.push(rp);
              });
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Survey sync notice:', err.message);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Live Map Coordinates State
  const [cursorCoords, setCursorCoords] = useState(null);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [copiedNotification, setCopiedNotification] = useState('');

  // Map Controls State
  const [fitTarget, setFitTarget] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showGrid, setShowGrid] = useState(false);

  // Modals & Panels
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [showImportKmlModal, setShowImportKmlModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [showSavedSurveysDrawer, setShowSavedSurveysDrawer] = useState(false);
  const [savedSurveysTab, setSavedSurveysTab] = useState('classrooms'); // 'classrooms' | 'paths' | 'canvas'
  const [savedSearchQuery, setSavedSearchQuery] = useState('');

  // Interactive Drawing Mode
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [drawingCategory, setDrawingCategory] = useState('building');

  // Form State for Manual Feature Addition
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('building');
  const [formCoordsText, setFormCoordsText] = useState('');
  const [formColor, setFormColor] = useState('#F59E0B');
  const [formOpacity, setFormOpacity] = useState(0.35);
  const [formStrokeWidth, setFormStrokeWidth] = useState(3);
  const [formDashArray, setFormDashArray] = useState('');

  // =========================================================================
  // FEATURE 1: 📍 QUICK GPS CAPTURE TOOL & ACCURACY AVERAGER STATE
  // =========================================================================
  const [showGpsModal, setShowGpsModal] = useState(false);
  const [isGpsCapturing, setIsGpsCapturing] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState('');
  const [gpsCurrentReading, setGpsCurrentReading] = useState(null);
  const [gpsCapturesHistory, setGpsCapturesHistory] = useState([]);
  const [gpsSelectedMode, setGpsSelectedMode] = useState('best'); // 'best' | 'average' | 'latest'
  const [gpsPointName, setGpsPointName] = useState('');
  const [gpsManualLat, setGpsManualLat] = useState('');
  const [gpsManualLng, setGpsManualLng] = useState('');

  // =========================================================================
  // FEATURE 2: 🏫 ADD CLASSROOM / ROOM LOCATION STATE
  // =========================================================================
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [roomBuilding, setRoomBuilding] = useState('D Block');
  const [roomFloor, setRoomFloor] = useState('Ground Floor');
  const [roomType, setRoomType] = useState('Classroom');
  const [roomName, setRoomName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomLat, setRoomLat] = useState('');
  const [roomLng, setRoomLng] = useState('');
  const [roomAccuracy, setRoomAccuracy] = useState(null);
  const [roomDescription, setRoomDescription] = useState('');
  const [isRoomGpsCapturing, setIsRoomGpsCapturing] = useState(false);
  const [roomCapturesHistory, setRoomCapturesHistory] = useState([]);

  // =========================================================================
  // FEATURE 3: 🚶 WALKING PATH SURVEY MODE STATE
  // =========================================================================
  const [isWalkingSurveyActive, setIsWalkingSurveyActive] = useState(false);
  const [isWalkingSurveyPaused, setIsWalkingSurveyPaused] = useState(false);
  const [walkingSurveyPoints, setWalkingSurveyPoints] = useState([]);
  const [walkingSurveyDistance, setWalkingSurveyDistance] = useState(0);
  const [walkingSurveyDuration, setWalkingSurveyDuration] = useState(0);
  const [currentSurveyorLocation, setCurrentSurveyorLocation] = useState(null);
  const [showSavePathModal, setShowSavePathModal] = useState(false);
  const [savePathName, setSavePathName] = useState('');
  const [savePathStartLoc, setSavePathStartLoc] = useState('');
  const [savePathDestLoc, setSavePathDestLoc] = useState('');
  const [savePathType, setSavePathType] = useState('Main Walking Path');
  const [savePathDesc, setSavePathDesc] = useState('');

  // Walking survey refs
  const watchIdRef = useRef(null);
  const surveyTimerRef = useRef(null);
  const lastPointRef = useRef(null);

  // Timer effect for Walking Survey
  useEffect(() => {
    if (isWalkingSurveyActive && !isWalkingSurveyPaused) {
      surveyTimerRef.current = setInterval(() => {
        setWalkingSurveyDuration(d => d + 1);
      }, 1000);
    } else {
      if (surveyTimerRef.current) clearInterval(surveyTimerRef.current);
    }
    return () => {
      if (surveyTimerRef.current) clearInterval(surveyTimerRef.current);
    };
  }, [isWalkingSurveyActive, isWalkingSurveyPaused]);

  // Color preset options
  const COLOR_PRESETS = [
    { label: 'Building Gold', color: '#F59E0B' },
    { label: 'Emerald Lawn', color: '#10B981' },
    { label: 'Academic Blue', color: '#0284C7' },
    { label: 'Slate Road', color: '#475569' },
    { label: 'Crimson Landmark', color: '#EF4444' },
    { label: 'Purple Directorate', color: '#8B5CF6' }
  ];

  // Parsed coordinates preview for manual input
  const parsedFormCoords = parseCoordinatesInput(formCoordsText);
  const isFormClosed =
    parsedFormCoords.length >= 3 &&
    parsedFormCoords[0][0] === parsedFormCoords[parsedFormCoords.length - 1][0] &&
    parsedFormCoords[0][1] === parsedFormCoords[parsedFormCoords.length - 1][1];

  const formAreaM2 = formCategory !== 'road' && formCategory !== 'marker' ? calculatePolygonAreaM2(parsedFormCoords) : 0;
  const formPerimeterM = calculatePerimeterMeters(parsedFormCoords);

  // Auto-close open polygon
  const handleAutoCloseForm = () => {
    if (parsedFormCoords.length >= 3 && !isFormClosed) {
      const first = parsedFormCoords[0];
      const appended = `${formCoordsText.trim()}\n${first[1].toFixed(8)}, ${first[0].toFixed(8)}`;
      setFormCoordsText(appended);
    }
  };

  // Canvas Click Handler
  const handleCanvasClick = (pt) => {
    setClickedCoords(pt);
    if (isDrawingMode) {
      setDrawingPoints(prev => [...prev, pt]);
    }
  };

  // Finish Interactive Canvas Drawing
  const handleFinishDrawing = () => {
    if (drawingPoints.length < 2) {
      alert('Please click at least 2 points on the canvas.');
      return;
    }

    let finalPoints = [...drawingPoints];
    if (drawingCategory !== 'road' && drawingCategory !== 'marker' && finalPoints.length >= 3) {
      const first = finalPoints[0];
      const last = finalPoints[finalPoints.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        finalPoints.push([first[0], first[1]]);
      }
    }

    const newFeature = {
      id: `feat_${Date.now()}`,
      name: `Surveyed ${drawingCategory === 'building' ? 'Building' : drawingCategory === 'lawn' ? 'Lawn' : 'Path'} #${features.length + 1}`,
      category: drawingCategory,
      type: drawingCategory === 'marker' ? 'point' : drawingCategory === 'road' ? 'polyline' : 'polygon',
      coordinates: drawingCategory === 'marker' ? finalPoints[0] : finalPoints,
      strokeColor: drawingCategory === 'lawn' ? '#10B981' : drawingCategory === 'building' ? '#F59E0B' : '#0284C7',
      fillColor: drawingCategory === 'lawn' ? '#10B981' : drawingCategory === 'building' ? '#F59E0B' : '#0284C7',
      fillOpacity: drawingCategory === 'road' ? 0 : 0.35,
      strokeWidth: 3,
      dashArray: null,
      visible: true,
      createdAt: new Date().toISOString()
    };

    setFeatures(prev => [...prev, newFeature]);
    setDrawingPoints([]);
    setIsDrawingMode(false);
  };

  // Add Feature from Form
  const handleAddFeatureFromForm = () => {
    if (!formName.trim()) {
      alert('Please enter a feature name.');
      return;
    }

    if (formCategory === 'marker') {
      if (parsedFormCoords.length === 0) {
        alert('Please specify at least 1 coordinate point for the marker.');
        return;
      }
    } else if (parsedFormCoords.length < 2) {
      alert('Please provide at least 2 coordinate points.');
      return;
    }

    let coords = [...parsedFormCoords];
    if (formCategory !== 'road' && formCategory !== 'marker' && coords.length >= 3) {
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push([first[0], first[1]]);
      }
    }

    const newFeat = {
      id: `feat_${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      type: formCategory === 'marker' ? 'point' : formCategory === 'road' ? 'polyline' : 'polygon',
      coordinates: formCategory === 'marker' ? coords[0] : coords,
      strokeColor: formColor,
      fillColor: formColor,
      fillOpacity: formCategory === 'road' ? 0 : formOpacity,
      strokeWidth: Number(formStrokeWidth) || 3,
      dashArray: formDashArray ? formDashArray : null,
      visible: true,
      createdAt: new Date().toISOString()
    };

    setFeatures(prev => [...prev, newFeat]);
    setFormName('');
    setFormCoordsText('');
    setShowAddFeatureModal(false);

    if (formCategory !== 'marker') {
      setFitTarget(coords);
    }
  };

  // KML File Import Handler
  const handleKmlFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const xmlText = event.target?.result;
      if (typeof xmlText === 'string') {
        parseAndLoadKml(xmlText, file.name);
      }
    };
    reader.readAsText(file);
  };

  // Raw KML text parser
  const parseAndLoadKml = (xmlString, sourceFileName = 'Imported KML') => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const placemarks = xmlDoc.getElementsByTagName('Placemark');

      const importedFeatures = [];

      for (let i = 0; i < placemarks.length; i++) {
        const pm = placemarks[i];
        const name = pm.getElementsByTagName('name')[0]?.textContent?.trim() || `${sourceFileName} Feature ${i + 1}`;

        // 1. Polygon
        const polygonNode = pm.getElementsByTagName('Polygon')[0];
        if (polygonNode) {
          const coordStr = polygonNode.getElementsByTagName('coordinates')[0]?.textContent;
          if (coordStr) {
            const rawCoords = parseCoordinatesInput(coordStr);
            if (rawCoords.length >= 3) {
              importedFeatures.push({
                id: `feat_kml_${Date.now()}_${i}`,
                name,
                category: 'building',
                type: 'polygon',
                coordinates: rawCoords,
                strokeColor: '#F59E0B',
                fillColor: '#F59E0B',
                fillOpacity: 0.3,
                strokeWidth: 3,
                dashArray: null,
                visible: true,
                source: sourceFileName
              });
            }
          }
          continue;
        }

        // 2. LineString (Road / Path)
        const lineNode = pm.getElementsByTagName('LineString')[0];
        if (lineNode) {
          const coordStr = lineNode.getElementsByTagName('coordinates')[0]?.textContent;
          if (coordStr) {
            const rawCoords = parseCoordinatesInput(coordStr);
            if (rawCoords.length >= 2) {
              importedFeatures.push({
                id: `feat_kml_${Date.now()}_${i}`,
                name,
                category: 'road',
                type: 'polyline',
                coordinates: rawCoords,
                strokeColor: '#0284C7',
                fillColor: '#0284C7',
                fillOpacity: 0,
                strokeWidth: 4,
                dashArray: null,
                visible: true,
                source: sourceFileName
              });
            }
          }
          continue;
        }

        // 3. Point (Marker)
        const pointNode = pm.getElementsByTagName('Point')[0];
        if (pointNode) {
          const coordStr = pointNode.getElementsByTagName('coordinates')[0]?.textContent;
          if (coordStr) {
            const rawCoords = parseCoordinatesInput(coordStr);
            if (rawCoords.length >= 1) {
              importedFeatures.push({
                id: `feat_kml_${Date.now()}_${i}`,
                name,
                category: 'marker',
                type: 'point',
                coordinates: rawCoords[0],
                strokeColor: '#EF4444',
                fillColor: '#EF4444',
                fillOpacity: 1,
                strokeWidth: 2,
                dashArray: null,
                visible: true,
                source: sourceFileName
              });
            }
          }
        }
      }

      if (importedFeatures.length > 0) {
        setFeatures(prev => [...prev, ...importedFeatures]);
        setShowImportKmlModal(false);

        const allPoints = [];
        importedFeatures.forEach(f => {
          if (f.type === 'point') allPoints.push(f.coordinates);
          else allPoints.push(...f.coordinates);
        });
        if (allPoints.length > 0) {
          setFitTarget(allPoints);
        }
      } else {
        alert('No valid Polygon, LineString, or Point found in KML.');
      }
    } catch (err) {
      alert(`Error parsing KML: ${err.message}`);
    }
  };

  // =========================================================================
  // GPS FIELD CAPTURE LOGIC (FEATURE 1)
  // =========================================================================
  const handlePerformGpsCapture = () => {
    if (!navigator.geolocation) {
      setGpsErrorMsg('Geolocation is not supported by your browser or device.');
      return;
    }

    setIsGpsCapturing(true);
    setGpsErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsCapturing(false);
        const reading = {
          id: `cap_${Date.now()}`,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          timestamp: new Date().toISOString()
        };

        setGpsCurrentReading(reading);
        setGpsCapturesHistory(prev => [...prev, reading]);
        setGpsManualLat(pos.coords.latitude.toFixed(7));
        setGpsManualLng(pos.coords.longitude.toFixed(7));
      },
      (err) => {
        setIsGpsCapturing(false);
        let msg = 'Failed to acquire GPS fix.';
        if (err.code === 1) msg = 'Location permission was denied. Please allow location access.';
        else if (err.code === 2) msg = 'Location unavailable. Ensure device GPS is turned on.';
        else if (err.code === 3) msg = 'GPS acquisition timed out. Try again.';
        setGpsErrorMsg(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Compute Active Coordinate for GPS Modal based on selected Mode
  const getComputedGpsCoordinate = () => {
    if (gpsCapturesHistory.length === 0) {
      if (gpsManualLat && gpsManualLng) {
        return {
          lat: parseFloat(gpsManualLat),
          lng: parseFloat(gpsManualLng),
          accuracy: 0,
          method: 'manual'
        };
      }
      return null;
    }

    if (gpsSelectedMode === 'best') {
      const best = [...gpsCapturesHistory].sort((a, b) => a.accuracy - b.accuracy)[0];
      return { ...best, method: 'best_gps_capture' };
    }

    if (gpsSelectedMode === 'average') {
      const avgLat = gpsCapturesHistory.reduce((s, c) => s + c.lat, 0) / gpsCapturesHistory.length;
      const avgLng = gpsCapturesHistory.reduce((s, c) => s + c.lng, 0) / gpsCapturesHistory.length;
      const avgAcc = gpsCapturesHistory.reduce((s, c) => s + c.accuracy, 0) / gpsCapturesHistory.length;
      return {
        lat: avgLat,
        lng: avgLng,
        accuracy: avgAcc,
        method: 'multi_gps_average',
        timestamp: new Date().toISOString()
      };
    }

    // Default: latest reading
    const latest = gpsCapturesHistory[gpsCapturesHistory.length - 1];
    return { ...latest, method: 'phone_gps' };
  };

  // Save Captured GPS Point to Demo Map Canvas
  const handleSaveGpsPointToCanvas = () => {
    const coord = getComputedGpsCoordinate();
    if (!coord || isNaN(coord.lat) || isNaN(coord.lng)) {
      alert('Please capture or enter valid coordinates.');
      return;
    }

    const lat = parseFloat(gpsManualLat) || coord.lat;
    const lng = parseFloat(gpsManualLng) || coord.lng;
    const name = gpsPointName.trim() || `GPS Point #${features.length + 1}`;

    const newFeature = {
      id: `feat_gps_${Date.now()}`,
      name,
      category: 'marker',
      type: 'point',
      coordinates: [lat, lng],
      strokeColor: '#0284C7',
      fillColor: '#0284C7',
      fillOpacity: 1,
      strokeWidth: 2,
      accuracy: coord.accuracy,
      surveyDate: new Date().toISOString(),
      surveyMethod: coord.method,
      visible: true
    };

    setFeatures(prev => [...prev, newFeature]);
    setShowGpsModal(false);
    setFitTarget([[lat, lng]]);
    copyToClipboard(`${lat.toFixed(7)}, ${lng.toFixed(7)}`, `Point "${name}" saved and plotted on canvas!`);
  };

  // =========================================================================
  // CLASSROOM GPS SURVEY LOGIC (FEATURE 2)
  // =========================================================================
  const handleCaptureRoomGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsRoomGpsCapturing(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsRoomGpsCapturing(false);
        const capture = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          timestamp: new Date().toISOString()
        };

        setRoomLat(pos.coords.latitude.toFixed(7));
        setRoomLng(pos.coords.longitude.toFixed(7));
        setRoomAccuracy(pos.coords.accuracy);
        setRoomCapturesHistory(prev => [...prev, capture]);
      },
      (err) => {
        setIsRoomGpsCapturing(false);
        alert(`GPS acquisition failed: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Save Classroom Location
  const handleSaveClassroom = async (andNext = false) => {
    if (!roomName.trim()) {
      alert('Please enter a room name (e.g. AI/ML Lab).');
      return;
    }
    if (!roomNumber.trim()) {
      alert('Please enter a room number (e.g. DGL01).');
      return;
    }

    const lat = parseFloat(roomLat);
    const lng = parseFloat(roomLng);
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please capture or enter valid room GPS coordinates.');
      return;
    }

    const locationId = `cls_${roomBuilding.replace(/\s+/g, '_').toLowerCase()}_${roomNumber.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    const payload = {
      locationId,
      building: roomBuilding,
      floor: roomFloor,
      roomType,
      roomName: roomName.trim(),
      roomNumber: roomNumber.trim().toUpperCase(),
      coordinates: { lat, lng },
      gpsAccuracy: roomAccuracy || 0,
      description: roomDescription.trim(),
      surveyDate: new Date().toISOString(),
      surveyMethod: roomCapturesHistory.length > 1 ? 'multi_gps_average' : 'phone_gps',
      capturesHistory: roomCapturesHistory,
      status: 'surveyed'
    };

    // 1. Save in local state
    setSurveyedClassrooms(prev => [payload, ...prev.filter(r => r.locationId !== locationId)]);

    // 2. Persist to MongoDB Atlas backend
    try {
      await saveSurveyedClassroomApi(payload);
    } catch (e) {
      console.warn('Backend persistence error:', e.message);
    }

    // 3. Auto-fit on map
    setFitTarget([[lat, lng]]);
    setCopiedNotification(`Classroom ${payload.roomNumber} saved!`);
    setTimeout(() => setCopiedNotification(''), 3000);

    if (andNext) {
      // Clear specific room fields, keep building and floor selected for sequence workflow
      setRoomName('');
      setRoomNumber('');
      setRoomLat('');
      setRoomLng('');
      setRoomAccuracy(null);
      setRoomDescription('');
      setRoomCapturesHistory([]);
    } else {
      setShowClassroomModal(false);
      setRoomName('');
      setRoomNumber('');
      setRoomLat('');
      setRoomLng('');
      setRoomAccuracy(null);
      setRoomDescription('');
      setRoomCapturesHistory([]);
    }
  };

  // Delete Surveyed Classroom
  const handleDeleteClassroom = async (locationId) => {
    if (window.confirm('Delete this surveyed classroom?')) {
      setSurveyedClassrooms(prev => prev.filter(c => c.locationId !== locationId));
      try {
        await deleteSurveyedClassroomApi(locationId);
      } catch (e) {
        console.warn('Backend delete error:', e.message);
      }
    }
  };

  // =========================================================================
  // WALKING PATH SURVEY LOGIC (FEATURE 3)
  // =========================================================================
  const handleStartWalkingSurvey = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    // Reset survey state
    setWalkingSurveyPoints([]);
    setWalkingSurveyDistance(0);
    setWalkingSurveyDuration(0);
    lastPointRef.current = null;
    setIsWalkingSurveyActive(true);
    setIsWalkingSurveyPaused(false);

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy, altitude } = pos.coords;
        setCurrentSurveyorLocation({ lat, lng, accuracy, altitude });

        setWalkingSurveyPoints(prev => {
          let delta = 0;
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            delta = calculateDistanceMeters([last.lat, last.lng], [lat, lng]);

            // Filter out minor GPS jitter if stationary (< 1.0m) unless first points
            if (delta < 1.0 && prev.length > 2) {
              return prev;
            }
          }

          const newPt = {
            lat,
            lng,
            accuracy,
            altitude,
            timestamp: new Date().toISOString(),
            distanceDelta: delta
          };

          setWalkingSurveyDistance(dist => dist + delta);
          return [...prev, newPt];
        });
      },
      (err) => {
        console.warn('Walking Survey GPS watch error:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleTogglePauseWalkingSurvey = () => {
    setIsWalkingSurveyPaused(prev => !prev);
  };

  const handleFinishWalkingSurvey = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (walkingSurveyPoints.length < 2) {
      alert('You have recorded less than 2 points. Walk further to record a valid walking path.');
      return;
    }

    setIsWalkingSurveyActive(false);
    setShowSavePathModal(true);
    setSavePathName(`Walking Path #${surveyedWalkingPaths.length + 1}`);
  };

  const handleDiscardWalkingSurvey = () => {
    if (window.confirm('Discard current walking path survey? All captured points will be removed.')) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsWalkingSurveyActive(false);
      setIsWalkingSurveyPaused(false);
      setWalkingSurveyPoints([]);
      setWalkingSurveyDistance(0);
      setWalkingSurveyDuration(0);
    }
  };

  // Save Surveyed Walking Path to DB & Local State
  const handleSaveWalkingPath = async () => {
    if (!savePathName.trim()) {
      alert('Please enter a path name.');
      return;
    }

    const pathId = `path_${Date.now()}`;
    const payload = {
      pathId,
      pathName: savePathName.trim(),
      startLocation: savePathStartLoc.trim(),
      destination: savePathDestLoc.trim(),
      pathType: savePathType,
      description: savePathDesc.trim(),
      points: walkingSurveyPoints,
      totalDistanceMeters: Math.round(walkingSurveyDistance * 10) / 10,
      durationSeconds: walkingSurveyDuration,
      surveyDate: new Date().toISOString(),
      surveyorName: 'Presidency Field Surveyor',
      status: 'surveyed'
    };

    // 1. Save in state
    setSurveyedWalkingPaths(prev => [payload, ...prev]);

    // 2. Persist to MongoDB Atlas
    try {
      await saveSurveyedWalkingPathApi(payload);
    } catch (e) {
      console.warn('Backend walking path save notice:', e.message);
    }

    setShowSavePathModal(false);
    setWalkingSurveyPoints([]);
    setWalkingSurveyDistance(0);
    setWalkingSurveyDuration(0);

    // Auto fit path on map
    if (payload.points.length > 0) {
      setFitTarget(payload.points.map(p => [p.lat, p.lng]));
    }

    setCopiedNotification(`Walking path "${payload.pathName}" saved!`);
    setTimeout(() => setCopiedNotification(''), 3000);
  };

  // Delete Surveyed Walking Path
  const handleDeleteWalkingPath = async (pathId) => {
    if (window.confirm('Delete this surveyed walking path?')) {
      setSurveyedWalkingPaths(prev => prev.filter(p => p.pathId !== pathId));
      try {
        await deleteSurveyedWalkingPathApi(pathId);
      } catch (e) {
        console.warn('Backend delete error:', e.message);
      }
    }
  };

  // =========================================================================
  // EXPORT KML & GEOJSON (FEATURE 4)
  // =========================================================================
  const handleExportAllKml = () => {
    const totalItems = features.length + surveyedClassrooms.length + surveyedWalkingPaths.length;
    if (totalItems === 0) {
      alert('No surveyed classrooms, walking paths, or canvas features to export.');
      return;
    }

    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Presidency University — GPS Field Survey &amp; Walking Paths</name>
    <description>Field surveyed coordinates, classrooms, and walking paths exported from DishaSetu</description>
`;

    // 1. Classrooms
    if (surveyedClassrooms.length > 0) {
      kml += `    <Folder>\n      <name>Surveyed Classrooms &amp; Rooms</name>\n`;
      surveyedClassrooms.forEach(c => {
        kml += `      <Placemark>
        <name>${c.roomNumber} - ${c.roomName}</name>
        <description>Building: ${c.building} | Floor: ${c.floor} | Type: ${c.roomType} | Accuracy: ±${c.gpsAccuracy}m</description>
        <ExtendedData>
          <Data name="Building"><value>${c.building}</value></Data>
          <Data name="Floor"><value>${c.floor}</value></Data>
          <Data name="RoomType"><value>${c.roomType}</value></Data>
          <Data name="RoomNumber"><value>${c.roomNumber}</value></Data>
          <Data name="GPSAccuracy"><value>${c.gpsAccuracy}</value></Data>
        </ExtendedData>
        <Point>
          <coordinates>${c.coordinates.lng},${c.coordinates.lat},0</coordinates>
        </Point>
      </Placemark>\n`;
      });
      kml += `    </Folder>\n`;
    }

    // 2. Walking Paths
    if (surveyedWalkingPaths.length > 0) {
      kml += `    <Folder>\n      <name>Surveyed Walking Paths</name>\n`;
      surveyedWalkingPaths.forEach(p => {
        const coordStr = p.points.map(pt => `${pt.lng},${pt.lat},${pt.altitude || 0}`).join('\n          ');
        kml += `      <Placemark>
        <name>${p.pathName}</name>
        <description>Type: ${p.pathType} | Distance: ${p.totalDistanceMeters}m | Points: ${p.points.length}</description>
        <LineString>
          <coordinates>
          ${coordStr}
          </coordinates>
        </LineString>
      </Placemark>\n`;
      });
      kml += `    </Folder>\n`;
    }

    // 3. Canvas Features (Polygons / Lines / Markers)
    if (features.length > 0) {
      kml += `    <Folder>\n      <name>Canvas Geometries &amp; Polygons</name>\n`;
      features.forEach(f => {
        if (f.type === 'polygon') {
          const coordStr = f.coordinates.map(([lat, lng]) => `${lng},${lat},0`).join('\n          ');
          kml += `      <Placemark>
        <name>${f.name}</name>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>
              ${coordStr}
              </coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>\n`;
        } else if (f.type === 'polyline') {
          const coordStr = f.coordinates.map(([lat, lng]) => `${lng},${lat},0`).join('\n          ');
          kml += `      <Placemark>
        <name>${f.name}</name>
        <LineString>
          <coordinates>
          ${coordStr}
          </coordinates>
        </LineString>
      </Placemark>\n`;
        } else if (f.type === 'point') {
          const [lat, lng] = f.coordinates;
          kml += `      <Placemark>
        <name>${f.name}</name>
        <Point>
          <coordinates>${lng},${lat},0</coordinates>
        </Point>
      </Placemark>\n`;
        }
      });
      kml += `    </Folder>\n`;
    }

    kml += `  </Document>\n</kml>`;

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Presidency_Campus_Survey_${Date.now()}.kml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAllGeoJson = () => {
    const featureList = [];

    // Classrooms
    surveyedClassrooms.forEach(c => {
      featureList.push({
        type: 'Feature',
        id: c.locationId,
        properties: {
          category: 'classroom',
          roomNumber: c.roomNumber,
          roomName: c.roomName,
          building: c.building,
          floor: c.floor,
          roomType: c.roomType,
          gpsAccuracy: c.gpsAccuracy,
          surveyDate: c.surveyDate
        },
        geometry: {
          type: 'Point',
          coordinates: [c.coordinates.lng, c.coordinates.lat]
        }
      });
    });

    // Walking Paths
    surveyedWalkingPaths.forEach(p => {
      featureList.push({
        type: 'Feature',
        id: p.pathId,
        properties: {
          category: 'walking_path',
          pathName: p.pathName,
          pathType: p.pathType,
          totalDistanceMeters: p.totalDistanceMeters,
          durationSeconds: p.durationSeconds,
          pointCount: p.points.length
        },
        geometry: {
          type: 'LineString',
          coordinates: p.points.map(pt => [pt.lng, pt.lat])
        }
      });
    });

    // Features
    features.forEach(f => {
      if (f.type === 'polygon') {
        featureList.push({
          type: 'Feature',
          id: f.id,
          properties: { name: f.name, category: f.category },
          geometry: {
            type: 'Polygon',
            coordinates: [f.coordinates.map(([lat, lng]) => [lng, lat])]
          }
        });
      } else if (f.type === 'polyline') {
        featureList.push({
          type: 'Feature',
          id: f.id,
          properties: { name: f.name, category: f.category },
          geometry: {
            type: 'LineString',
            coordinates: f.coordinates.map(([lat, lng]) => [lng, lat])
          }
        });
      } else if (f.type === 'point') {
        featureList.push({
          type: 'Feature',
          id: f.id,
          properties: { name: f.name, category: f.category },
          geometry: {
            type: 'Point',
            coordinates: [f.coordinates[1], f.coordinates[0]]
          }
        });
      }
    });

    const geoJson = {
      type: 'FeatureCollection',
      name: 'Presidency University Survey Dataset',
      features: featureList
    };

    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Presidency_Campus_Survey_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fit all items on canvas
  const handleFitAll = () => {
    const allPoints = [];

    // Features
    features.filter(f => f.visible).forEach(f => {
      if (f.type === 'point') allPoints.push(f.coordinates);
      else allPoints.push(...f.coordinates);
    });

    // Classrooms
    surveyedClassrooms.forEach(c => {
      if (c.coordinates?.lat && c.coordinates?.lng) {
        allPoints.push([c.coordinates.lat, c.coordinates.lng]);
      }
    });

    // Walking Paths
    surveyedWalkingPaths.forEach(p => {
      p.points?.forEach(pt => allPoints.push([pt.lat, pt.lng]));
    });

    if (allPoints.length > 0) {
      setFitTarget(allPoints);
    } else {
      setResetTrigger(prev => prev + 1);
    }
  };

  // Toggle Feature Visibility
  const handleToggleVisibility = (id) => {
    setFeatures(prev =>
      prev.map(f => (f.id === id ? { ...f, visible: !f.visible } : f))
    );
  };

  // Delete Feature
  const handleDeleteFeature = (id) => {
    setFeatures(prev => prev.filter(f => f.id !== id));
    if (selectedFeature?.id === id) {
      setSelectedFeature(null);
      setShowInspectorModal(false);
    }
  };

  // Copy coordinate text
  const copyToClipboard = (text, message = 'Coordinates Copied!') => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(message);
    setTimeout(() => setCopiedNotification(''), 2500);
  };

  // Save single feature to MongoDB Atlas backend
  const handleSaveToDatabase = async (feat) => {
    try {
      const payload = {
        featureId: feat.id,
        name: feat.name,
        category: feat.category,
        type: feat.type,
        coordinates: feat.coordinates,
        color: feat.strokeColor,
        status: 'Surveyed'
      };
      await createCampusFeatureApi(payload);
      alert(`Successfully saved "${feat.name}" permanently to MongoDB Atlas!`);
    } catch (err) {
      alert(`Saved in local session. (Backend response: ${err.message})`);
    }
  };

  // Active items counts
  const totalSurveyCount = surveyedClassrooms.length + surveyedWalkingPaths.length + features.length;

  return (
    <div className="relative w-full h-full min-h-screen bg-white text-slate-800 flex flex-col overflow-hidden font-sans select-none">
      
      {/* =================================================================== */}
      {/* 1. TOP HEADER / CONTROL NAVIGATION BAR                              */}
      {/* =================================================================== */}
      <header className="relative z-30 flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all text-xs font-semibold border border-slate-700 active:scale-95 shadow-sm"
              title="Return to Main Campus Master Map"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Campus Map</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  GPS Survey &amp; Walking Path Tracker
                </h1>
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border uppercase tracking-wider ${
                  totalSurveyCount === 0
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                }`}>
                  {totalSurveyCount} Saved {totalSurveyCount === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Presidency University Bengaluru • Clean Coordinate Canvas • Live Mobile GPS
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: GPS Capture, Classroom, Walking Survey, Saved Surveys, Draw, KML */}
        <div className="flex items-center gap-2">
          {/* 📍 Quick GPS Capture Button */}
          <button
            onClick={() => {
              setShowGpsModal(true);
              handlePerformGpsCapture();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white transition-all text-xs font-bold shadow-sm active:scale-95"
            title="Capture current phone GPS location"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>Capture GPS</span>
          </button>

          {/* 🏫 Add Classroom / Room Button */}
          <button
            onClick={() => {
              setShowClassroomModal(true);
              handleCaptureRoomGps();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all text-xs font-bold shadow-sm active:scale-95"
            title="Survey and pin a classroom, lab, or office"
          >
            <School className="w-3.5 h-3.5" />
            <span>Add Classroom</span>
          </button>

          {/* 🚶 Walking Path Survey Button */}
          <button
            onClick={() => {
              if (isWalkingSurveyActive) {
                handleFinishWalkingSurvey();
              } else {
                handleStartWalkingSurvey();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-bold shadow-sm active:scale-95 border ${
              isWalkingSurveyActive
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 border-amber-300 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
            }`}
            title="Walk campus paths and record live continuous GPS route"
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>{isWalkingSurveyActive ? 'Finish Walking Survey' : 'Walking Survey'}</span>
          </button>

          {/* 📋 Saved Surveys Drawer Button */}
          <button
            onClick={() => setShowSavedSurveysDrawer(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold active:scale-95 ${
              showSavedSurveysDrawer
                ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Open Saved Survey Data drawer"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Saved Data ({totalSurveyCount})</span>
          </button>

          {/* Draw on Canvas Button */}
          <button
            onClick={() => {
              setIsDrawingMode(prev => !prev);
              if (isDrawingMode) setDrawingPoints([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-bold shadow-sm active:scale-95 border ${
              isDrawingMode
                ? 'bg-amber-500 border-amber-400 text-slate-900 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Click directly on white canvas to draw polygon or line"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{isDrawingMode ? 'Drawing Active' : 'Draw'}</span>
          </button>

          {/* Import KML Button */}
          <button
            onClick={() => setShowImportKmlModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-xs font-semibold active:scale-95"
            title="Upload or paste KML"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Import KML</span>
          </button>

          {/* Export KML Button */}
          {totalSurveyCount > 0 && (
            <button
              onClick={handleExportAllKml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-all text-xs font-semibold active:scale-95"
              title="Download full survey as KML"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export KML</span>
            </button>
          )}
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. PURE WHITE COORDINATE CANVAS (ZERO TILES, ZERO PRELOADED MAPS)    */}
      {/* =================================================================== */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-white">
        
        {/* Leaflet MapContainer with pure white background and no TileLayer */}
        <MapContainer
          center={CAMPUS_DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          minZoom={14}
          maxZoom={22}
          zoomControl={false}
          attributionControl={false}
          style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}
          className="demo-map-pure-white-canvas"
        >
          {/* Controllers */}
          <MapActionController fitTarget={fitTarget} resetTrigger={resetTrigger} />
          <MapEventListener onCursorMove={setCursorCoords} onCanvasClick={handleCanvasClick} />

          {/* 1. Render Surveyed Classrooms Markers */}
          {surveyedClassrooms.map((c) => {
            if (!c.coordinates?.lat || !c.coordinates?.lng) return null;
            const badge = getAccuracyBadge(c.gpsAccuracy);
            return (
              <Marker
                key={c.locationId || c._id}
                position={[c.coordinates.lat, c.coordinates.lng]}
                icon={createRoomPinIcon(c.roomNumber, c.building)}
              >
                <Popup className="custom-demo-map-popup">
                  <div className="p-2 min-w-[200px] text-slate-800">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-xs font-black text-slate-900">{c.roomNumber}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="py-1.5 space-y-1">
                      <div className="font-extrabold text-xs text-slate-900">{c.roomName}</div>
                      <div className="text-[11px] text-slate-600">
                        {c.building} • {c.floor}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Type: {c.roomType}
                      </div>
                      {c.description && (
                        <p className="text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-200 mt-1">
                          "{c.description}"
                        </p>
                      )}
                      <div className="text-[10px] font-mono text-slate-500 pt-1">
                        GPS: {c.coordinates.lat.toFixed(6)}, {c.coordinates.lng.toFixed(6)}
                      </div>
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`${c.coordinates.lat.toFixed(7)}, ${c.coordinates.lng.toFixed(7)}`, `Classroom ${c.roomNumber} Coordinates Copied!`)}
                        className="text-sky-600 hover:text-sky-700 font-bold text-[11px] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy GPS
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClassroom(c.locationId)}
                        className="text-rose-600 hover:text-rose-700 font-bold text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* 2. Render Surveyed Walking Paths */}
          {surveyedWalkingPaths.map((path) => {
            if (!path.points || path.points.length < 2) return null;
            const positions = path.points.map(pt => [pt.lat, pt.lng]);
            const startPt = positions[0];
            const endPt = positions[positions.length - 1];

            return (
              <React.Fragment key={path.pathId || path._id}>
                {/* Path Polyline */}
                <Polyline
                  positions={positions}
                  pathOptions={{
                    color: '#0284C7',
                    weight: 4.5,
                    opacity: 0.95
                  }}
                >
                  <Tooltip sticky>
                    <div className="text-xs font-bold text-slate-900">{path.pathName}</div>
                    <div className="text-[10px] text-slate-600">
                      {formatDistance(path.totalDistanceMeters)} • {path.points.length} GPS points • {path.pathType}
                    </div>
                  </Tooltip>
                </Polyline>

                {/* Start Marker */}
                <Marker position={startPt} icon={createPathEndpointIcon('START', true)}>
                  <Popup>
                    <div className="p-1 text-xs font-sans">
                      <div className="font-bold text-emerald-700">Origin: {path.startLocation || 'Survey Start'}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{path.pathName}</div>
                    </div>
                  </Popup>
                </Marker>

                {/* End Marker */}
                <Marker position={endPt} icon={createPathEndpointIcon('DEST', false)}>
                  <Popup>
                    <div className="p-1 text-xs font-sans">
                      <div className="font-bold text-rose-700">Destination: {path.destination || 'Survey End'}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{path.pathName} ({formatDistance(path.totalDistanceMeters)})</div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

          {/* 3. Live Walking Survey Polyline & Surveyor Pulse Marker */}
          {isWalkingSurveyActive && walkingSurveyPoints.length > 0 && (
            <>
              {/* Recorded Polyline */}
              <Polyline
                positions={walkingSurveyPoints.map(p => [p.lat, p.lng])}
                pathOptions={{
                  color: '#0284C7',
                  weight: 5,
                  opacity: 1.0,
                  dashArray: '8, 6'
                }}
              />

              {/* Individual recorded nodes */}
              {walkingSurveyPoints.map((pt, idx) => (
                <CircleMarker
                  key={idx}
                  center={[pt.lat, pt.lng]}
                  radius={4}
                  pathOptions={{
                    color: '#0284C7',
                    fillColor: '#FFFFFF',
                    fillOpacity: 1,
                    weight: 2
                  }}
                />
              ))}
            </>
          )}

          {/* Live Surveyor Marker with Accuracy Circle */}
          {currentSurveyorLocation && (
            <>
              <Marker
                position={[currentSurveyorLocation.lat, currentSurveyorLocation.lng]}
                icon={createSurveyorLiveIcon()}
              />
              {currentSurveyorLocation.accuracy && currentSurveyorLocation.accuracy < 50 && (
                <Circle
                  center={[currentSurveyorLocation.lat, currentSurveyorLocation.lng]}
                  radius={currentSurveyorLocation.accuracy}
                  pathOptions={{
                    color: '#0284c7',
                    fillColor: '#0284c7',
                    fillOpacity: 0.12,
                    weight: 1.5,
                    dashArray: '4, 4'
                  }}
                />
              )}
            </>
          )}

          {/* 4. Render User-Drawn Features (Polygons, Roads, Markers) */}
          {features.filter(f => f.visible).map(feat => {
            if (feat.type === 'polygon' && Array.isArray(feat.coordinates) && feat.coordinates.length >= 3) {
              return (
                <Polygon
                  key={feat.id}
                  positions={feat.coordinates}
                  pathOptions={{
                    color: feat.strokeColor || '#F59E0B',
                    fillColor: feat.fillColor || feat.strokeColor || '#F59E0B',
                    fillOpacity: feat.fillOpacity ?? 0.35,
                    weight: feat.strokeWidth || 3,
                    dashArray: feat.dashArray || null
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedFeature(feat);
                      setShowInspectorModal(true);
                    }
                  }}
                >
                  <Tooltip sticky>
                    <div className="text-xs font-bold text-slate-900">{feat.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{feat.category} • {feat.coordinates.length} nodes</div>
                  </Tooltip>
                </Polygon>
              );
            }

            if (feat.type === 'polyline' && Array.isArray(feat.coordinates) && feat.coordinates.length >= 2) {
              return (
                <Polyline
                  key={feat.id}
                  positions={feat.coordinates}
                  pathOptions={{
                    color: feat.strokeColor || '#0284C7',
                    weight: feat.strokeWidth || 4,
                    dashArray: feat.dashArray || null
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedFeature(feat);
                      setShowInspectorModal(true);
                    }
                  }}
                >
                  <Tooltip sticky>
                    <div className="text-xs font-bold text-slate-900">{feat.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase">Road/Path • {feat.coordinates.length} nodes</div>
                  </Tooltip>
                </Polyline>
              );
            }

            if (feat.type === 'point' && Array.isArray(feat.coordinates) && feat.coordinates.length === 2) {
              return (
                <Marker
                  key={feat.id}
                  position={feat.coordinates}
                  icon={createPinIcon(feat.strokeColor || '#EF4444', feat.name)}
                  eventHandlers={{
                    click: () => {
                      setSelectedFeature(feat);
                      setShowInspectorModal(true);
                    }
                  }}
                >
                  <Popup>
                    <div className="p-1">
                      <h4 className="font-bold text-xs text-slate-900">{feat.name}</h4>
                      <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                        {feat.coordinates[0].toFixed(6)}, {feat.coordinates[1].toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            }

            return null;
          })}

          {/* Interactive Click-to-Draw Preview Line */}
          {isDrawingMode && drawingPoints.length > 0 && (
            <>
              <Polyline
                positions={drawingPoints}
                pathOptions={{ color: '#0284C7', weight: 2.5, dashArray: '6, 6' }}
              />
              {drawingPoints.map((pt, idx) => (
                <CircleMarker
                  key={idx}
                  center={pt}
                  radius={5}
                  pathOptions={{
                    color: '#0284C7',
                    fillColor: '#FFFFFF',
                    fillOpacity: 1,
                    weight: 2
                  }}
                />
              ))}
            </>
          )}
        </MapContainer>

        {/* Optional Coordinate Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-30"
            style={{
              backgroundImage: 'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        )}

        {/* ================================================================= */}
        {/* 3. LIVE WALKING SURVEY HUD (FLOATING IN BOTTOM-CENTER OR TOP)     */}
        {/* ================================================================= */}
        {isWalkingSurveyActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-sky-500/80 flex items-center gap-5 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
              <span className={`w-3.5 h-3.5 rounded-full ${isWalkingSurveyPaused ? 'bg-amber-400' : 'bg-rose-500 animate-ping'}`} />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Status</span>
                <span className="text-xs font-black text-white">
                  {isWalkingSurveyPaused ? 'SURVEY PAUSED' : 'RECORDING GPS'}
                </span>
              </div>
            </div>

            {/* Distance */}
            <div className="text-center pr-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance</span>
              <span className="text-sm font-extrabold font-mono text-sky-400">
                {formatDistance(walkingSurveyDistance)}
              </span>
            </div>

            {/* Duration */}
            <div className="text-center pr-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Duration</span>
              <span className="text-sm font-extrabold font-mono text-emerald-400">
                {formatDuration(walkingSurveyDuration)}
              </span>
            </div>

            {/* Points count */}
            <div className="text-center pr-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">GPS Points</span>
              <span className="text-sm font-extrabold font-mono text-white">
                {walkingSurveyPoints.length}
              </span>
            </div>

            {/* Live Accuracy */}
            {currentSurveyorLocation && (
              <div className="text-center pr-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Accuracy</span>
                {(() => {
                  const badge = getAccuracyBadge(currentSurveyorLocation.accuracy);
                  return (
                    <span className={`inline-flex items-center gap-1 text-xs font-extrabold ${
                      badge.status === 'high' ? 'text-emerald-400' : badge.status === 'medium' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2 pl-2">
              <button
                type="button"
                onClick={handleTogglePauseWalkingSurvey}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                title={isWalkingSurveyPaused ? 'Resume Recording' : 'Pause Recording'}
              >
                {isWalkingSurveyPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={handleFinishWalkingSurvey}
                disabled={walkingSurveyPoints.length < 2}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-sky-600/30 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Finish &amp; Save</span>
              </button>

              <button
                type="button"
                onClick={handleDiscardWalkingSurvey}
                className="p-2 rounded-xl hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-xs transition-all"
                title="Discard Walking Survey"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. ACTIVE DRAWING BANNER (Appears when user is clicking canvas)    */}
        {/* ================================================================= */}
        {isDrawingMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-amber-500/80 flex items-center gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-bold">
                Drawing Active: {drawingPoints.length} {drawingPoints.length === 1 ? 'Point' : 'Points'} Plotted
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <select
                value={drawingCategory}
                onChange={(e) => setDrawingCategory(e.target.value)}
                className="bg-slate-800 text-white rounded-lg px-2 py-1 text-xs border border-slate-700"
              >
                <option value="building">Building Polygon</option>
                <option value="lawn">Lawn / Open Area</option>
                <option value="road">Road / Walking Path</option>
                <option value="marker">Pinpoint Marker</option>
              </select>

              {drawingPoints.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDrawingPoints(prev => prev.slice(0, -1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Undo Point
                </button>
              )}

              <button
                type="button"
                onClick={handleFinishDrawing}
                disabled={drawingPoints.length < (drawingCategory === 'marker' ? 1 : 2)}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold"
              >
                Finish &amp; Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setDrawingPoints([]);
                  setIsDrawingMode(false);
                }}
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-400 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 5. FLOATING MAP NAVIGATION & CONTROLS (Top-Right)                 */}
        {/* ================================================================= */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          {/* Fit All Features */}
          <button
            type="button"
            onClick={handleFitAll}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-md transition-all active:scale-95"
            title="Fit All Geometries & Classrooms"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Reset View */}
          <button
            type="button"
            onClick={() => setResetTrigger(prev => prev + 1)}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-md transition-all active:scale-95"
            title="Reset to Campus Center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Toggle Grid */}
          <button
            type="button"
            onClick={() => setShowGrid(prev => !prev)}
            className={`p-2.5 rounded-xl border shadow-md transition-all active:scale-95 ${
              showGrid ? 'bg-sky-50 border-sky-400 text-sky-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Toggle Spatial Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* 6. FLOATING BOTTOM BAR: LIVE COORDINATES DISPLAY & CAPTURE        */}
        {/* ================================================================= */}
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex items-center justify-between">
          {/* Live Cursor Coordinates Pill */}
          <div className="pointer-events-auto bg-slate-900/90 text-white px-3.5 py-1.5 rounded-full shadow-lg border border-slate-800 text-xs font-mono flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              <span>
                {cursorCoords
                  ? `Lat: ${cursorCoords.lat.toFixed(6)} | Lng: ${cursorCoords.lng.toFixed(6)}`
                  : 'Move cursor on canvas to inspect coordinates'}
              </span>
            </div>

            {clickedCoords && (
              <button
                type="button"
                onClick={() => copyToClipboard(`${clickedCoords[0].toFixed(8)}, ${clickedCoords[1].toFixed(8)}`, 'Point Copied!')}
                className="pl-3 border-l border-slate-700 text-sky-300 hover:text-sky-200 flex items-center gap-1 text-[11px] font-sans font-semibold"
                title="Copy Last Clicked Coordinate"
              >
                <Copy className="w-3 h-3" />
                <span>Clicked: {clickedCoords[0].toFixed(4)}, {clickedCoords[1].toFixed(4)}</span>
              </button>
            )}
          </div>

          {/* Copied Feedback Toast */}
          {copiedNotification && (
            <div className="pointer-events-auto bg-emerald-600 text-white px-3 py-1 rounded-full shadow-lg text-xs font-bold animate-in fade-in slide-in-from-bottom duration-150">
              ✓ {copiedNotification}
            </div>
          )}

          {/* Campus Reference Center Pill */}
          <div className="pointer-events-auto bg-white/90 text-slate-700 px-3 py-1 rounded-full shadow border border-slate-200 text-[11px] font-medium hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Presidency University Center: 13.169116, 77.535350</span>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 7. QUICK GPS CAPTURE & ACCURACY AVERAGER MODAL (FEATURE 1)          */}
      {/* =================================================================== */}
      {showGpsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600">
                  <LocateFixed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">📍 Capture GPS Location</h3>
                  <p className="text-xs text-slate-500">Live phone GPS receiver &amp; multi-capture accuracy tool</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGpsModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {gpsErrorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{gpsErrorMsg}</span>
              </div>
            )}

            {/* Current Reading Display Card */}
            {gpsCurrentReading ? (
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-300">Active GPS Fix</span>
                  </div>
                  {(() => {
                    const badge = getAccuracyBadge(gpsCurrentReading.accuracy);
                    return (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badge.color}`}>
                        {badge.label} • {badge.sub}
                      </span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Latitude</span>
                    <span className="text-sm font-extrabold font-mono text-sky-300">
                      {gpsCurrentReading.lat.toFixed(7)}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Longitude</span>
                    <span className="text-sm font-extrabold font-mono text-sky-300">
                      {gpsCurrentReading.lng.toFixed(7)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Timestamp: {new Date(gpsCurrentReading.timestamp).toLocaleTimeString()}</span>
                  <span>Captures: {gpsCapturesHistory.length} readings</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                <LocateFixed className="w-8 h-8 text-sky-500 mx-auto mb-2 animate-bounce" />
                <div className="font-bold text-xs text-slate-800">Acquiring GPS Signal...</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Please allow location access on your phone</p>
              </div>
            )}

            {/* Multi-Reading History & Selection */}
            {gpsCapturesHistory.length > 1 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Multi-Capture Refinement ({gpsCapturesHistory.length} reads):</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setGpsSelectedMode('best')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        gpsSelectedMode === 'best' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Use Best Capture
                    </button>
                    <button
                      type="button"
                      onClick={() => setGpsSelectedMode('average')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        gpsSelectedMode === 'average' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Calculate Centroid
                    </button>
                  </div>
                </div>

                <div className="max-h-28 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  {gpsCapturesHistory.map((cap, i) => {
                    const badge = getAccuracyBadge(cap.accuracy);
                    return (
                      <div key={cap.id} className="flex items-center justify-between py-0.5 border-b border-slate-100">
                        <span className="font-bold text-slate-600">Capture #{i + 1}</span>
                        <span className="font-mono">{cap.lat.toFixed(6)}, {cap.lng.toFixed(6)}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manual Edit Inputs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Point Name &amp; Manual Verification</label>
              <input
                type="text"
                placeholder="Point Label (e.g. D Block Main Entrance)"
                value={gpsPointName}
                onChange={(e) => setGpsPointName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Latitude</span>
                  <input
                    type="number"
                    step="any"
                    value={gpsManualLat}
                    onChange={(e) => setGpsManualLat(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Longitude</span>
                  <input
                    type="number"
                    step="any"
                    value={gpsManualLng}
                    onChange={(e) => setGpsManualLng(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handlePerformGpsCapture}
                disabled={isGpsCapturing}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGpsCapturing ? 'animate-spin' : ''}`} />
                <span>{isGpsCapturing ? 'Acquiring...' : 'Capture Again'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveGpsPointToCanvas}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/30 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Point to Map</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 8. ADD CLASSROOM / ROOM LOCATION MODAL (FEATURE 2)                  */}
      {/* =================================================================== */}
      {showClassroomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Add Classroom / Room Location</h3>
                  <p className="text-xs text-slate-500">Record classroom GPS coordinates inside the room</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClassroomModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Building & Floor Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Building / Block</label>
                <select
                  value={roomBuilding}
                  onChange={(e) => setRoomBuilding(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {CAMPUS_BUILDINGS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Floor Level</label>
                <select
                  value={roomFloor}
                  onChange={(e) => setRoomFloor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {FLOOR_OPTIONS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room Type, Name, Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Room Type</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {ROOM_TYPE_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Room Name</label>
                <input
                  type="text"
                  placeholder="e.g. AI/ML Lab"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Room Number / Code</label>
                <input
                  type="text"
                  placeholder="e.g. DGL01"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            {/* GPS Acquisition Card inside Modal */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <LocateFixed className="w-4 h-4 text-emerald-600" />
                  Room Coordinates Fix
                </span>
                {roomAccuracy !== null && (
                  (() => {
                    const badge = getAccuracyBadge(roomAccuracy);
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.color}`}>
                        {badge.label} • {badge.sub}
                      </span>
                    );
                  })()
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Latitude</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="13.169xxx"
                    value={roomLat}
                    onChange={(e) => setRoomLat(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Longitude</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="77.537xxx"
                    value={roomLng}
                    onChange={(e) => setRoomLng(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCaptureRoomGps}
                disabled={isRoomGpsCapturing}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <LocateFixed className={`w-3.5 h-3.5 ${isRoomGpsCapturing ? 'animate-spin' : ''}`} />
                <span>{isRoomGpsCapturing ? 'Capturing Phone GPS...' : '📍 Capture Current GPS Inside Room'}</span>
              </button>
            </div>

            {/* Room Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Equipped with 60 GPU workstations, interactive projector, faculty podium."
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Action Buttons: Save & Add Next Room */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClassroomModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveClassroom(true)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save &amp; Add Next Room</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveClassroom(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save Room &amp; Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 9. FINISH WALKING PATH SURVEY MODAL                                 */}
      {/* =================================================================== */}
      {showSavePathModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600">
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Save Surveyed Walking Path</h3>
                  <p className="text-xs text-slate-500">Continuous GPS track captured with {walkingSurveyPoints.length} points</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSavePathModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Summary Card */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance</span>
                <span className="text-sm font-extrabold font-mono text-sky-600">
                  {formatDistance(walkingSurveyDistance)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Time</span>
                <span className="text-sm font-extrabold font-mono text-emerald-600">
                  {formatDuration(walkingSurveyDuration)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">GPS Nodes</span>
                <span className="text-sm font-extrabold font-mono text-slate-900">
                  {walkingSurveyPoints.length}
                </span>
              </div>
            </div>

            {/* Path Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Path Name</label>
                <input
                  type="text"
                  placeholder="e.g. E Block to F Block Walkway"
                  value={savePathName}
                  onChange={(e) => setSavePathName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Starting Location</label>
                  <input
                    type="text"
                    placeholder="e.g. E Block West Gate"
                    value={savePathStartLoc}
                    onChange={(e) => setSavePathStartLoc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination Location</label>
                  <input
                    type="text"
                    placeholder="e.g. F Block Entrance"
                    value={savePathDestLoc}
                    onChange={(e) => setSavePathDestLoc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Path Type</label>
                <select
                  value={savePathType}
                  onChange={(e) => setSavePathType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
                >
                  {PATH_TYPE_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paved pedestrian corridor with tactile indicators and shade trees."
                  value={savePathDesc}
                  onChange={(e) => setSavePathDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSavePathModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWalkingPath}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Walking Path to Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 10. SAVED SURVEY DATA DRAWER / PANEL (FEATURE 5)                    */}
      {/* =================================================================== */}
      {showSavedSurveysDrawer && (
        <div className="fixed top-0 right-0 bottom-0 z-40 w-96 max-w-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-extrabold">Saved Survey Data</h3>
                <p className="text-[10px] text-slate-400">Classrooms, Walking Paths &amp; Campus Geometries</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSavedSurveysDrawer(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSavedSurveysTab('classrooms')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
                savedSurveysTab === 'classrooms'
                  ? 'border-emerald-600 text-emerald-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Rooms ({surveyedClassrooms.length})
            </button>

            <button
              type="button"
              onClick={() => setSavedSurveysTab('paths')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
                savedSurveysTab === 'paths'
                  ? 'border-sky-600 text-sky-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Paths ({surveyedWalkingPaths.length})
            </button>

            <button
              type="button"
              onClick={() => setSavedSurveysTab('canvas')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
                savedSurveysTab === 'canvas'
                  ? 'border-amber-500 text-amber-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Canvas ({features.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search survey records..."
                value={savedSearchQuery}
                onChange={(e) => setSavedSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
            {/* Tab: Classrooms */}
            {savedSurveysTab === 'classrooms' && (
              surveyedClassrooms.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <School className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold">No classrooms surveyed yet.</p>
                  <p className="text-[11px] mt-0.5">Click "Add Classroom" to record your first room.</p>
                </div>
              ) : (
                surveyedClassrooms
                  .filter(c => {
                    if (!savedSearchQuery) return true;
                    const q = savedSearchQuery.toLowerCase();
                    return (
                      (c.roomNumber || '').toLowerCase().includes(q) ||
                      (c.roomName || '').toLowerCase().includes(q) ||
                      (c.building || '').toLowerCase().includes(q)
                    );
                  })
                  .map(c => {
                    const badge = getAccuracyBadge(c.gpsAccuracy);
                    return (
                      <div key={c.locationId} className="p-3 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900">{c.roomNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="font-bold text-slate-800">{c.roomName}</div>
                        <div className="text-[11px] text-slate-500">
                          {c.building} • {c.floor} • {c.roomType}
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setFitTarget([[c.coordinates.lat, c.coordinates.lng]])}
                            className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                          >
                            <Maximize2 className="w-3 h-3" /> View on Map
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClassroom(c.locationId)}
                            className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
              )
            )}

            {/* Tab: Walking Paths */}
            {savedSurveysTab === 'paths' && (
              surveyedWalkingPaths.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Footprints className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold">No walking paths recorded yet.</p>
                  <p className="text-[11px] mt-0.5">Click "Walking Survey" to walk and record a path.</p>
                </div>
              ) : (
                surveyedWalkingPaths
                  .filter(p => {
                    if (!savedSearchQuery) return true;
                    const q = savedSearchQuery.toLowerCase();
                    return (
                      (p.pathName || '').toLowerCase().includes(q) ||
                      (p.pathType || '').toLowerCase().includes(q)
                    );
                  })
                  .map(p => (
                    <div key={p.pathId} className="p-3 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">{p.pathName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          {formatDistance(p.totalDistanceMeters)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.startLocation || 'Start'} ➔ {p.destination || 'End'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.points?.length || 0} GPS nodes • {p.pathType} • {formatDuration(p.durationSeconds || 0)}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setFitTarget(p.points.map(pt => [pt.lat, pt.lng]))}
                          className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                        >
                          <Maximize2 className="w-3 h-3" /> Fit Path
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWalkingPath(p.pathId)}
                          className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
              )
            )}

            {/* Tab: Canvas Geometries */}
            {savedSurveysTab === 'canvas' && (
              features.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold">No canvas features drawn.</p>
                  <p className="text-[11px] mt-0.5">Use "Draw on Canvas" or "Import KML" to add polygons.</p>
                </div>
              ) : (
                features.map(feat => (
                  <div key={feat.id} className="p-3 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: feat.strokeColor || '#0284c7' }} />
                        <span className="font-extrabold text-slate-900">{feat.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{feat.category}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          if (feat.type === 'point') setFitTarget([feat.coordinates]);
                          else setFitTarget(feat.coordinates);
                        }}
                        className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                      >
                        <Maximize2 className="w-3 h-3" /> Fit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeature(feat.id)}
                        className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>

          {/* Footer Export & Sync Toolbar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportAllKml}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export KML</span>
              </button>

              <button
                type="button"
                onClick={handleExportAllGeoJson}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Export GeoJSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 11. MANUAL COORDINATE FEATURE BUILDER MODAL                         */}
      {/* =================================================================== */}
      {showAddFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Add Campus Feature</h3>
                  <p className="text-xs text-slate-500">Paste Google Earth coordinates or configure geometry</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddFeatureModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feature Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Feature Name</label>
                <input
                  type="text"
                  placeholder="e.g. D Block / Main Lawn"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Feature Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    setFormCategory(e.target.value);
                    if (e.target.value === 'lawn') setFormColor('#10B981');
                    else if (e.target.value === 'building') setFormColor('#F59E0B');
                    else if (e.target.value === 'road') setFormColor('#0284C7');
                    else if (e.target.value === 'marker') setFormColor('#EF4444');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  <option value="building">🏢 Building Polygon</option>
                  <option value="lawn">🌿 Lawn / Open Area</option>
                  <option value="road">🛣️ Road / Walking Path</option>
                  <option value="marker">📍 Landmark Marker</option>
                </select>
              </div>
            </div>

            {/* Coordinates Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Google Earth Coordinates List ({parsedFormCoords.length} points detected)
                </label>
                {parsedFormCoords.length >= 3 && !isFormClosed && formCategory !== 'road' && formCategory !== 'marker' && (
                  <button
                    type="button"
                    onClick={handleAutoCloseForm}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline"
                  >
                    Auto-Close Polygon Ring
                  </button>
                )}
              </div>
              <textarea
                rows={5}
                placeholder={`Paste Google Earth coordinates here (one per line or comma separated):\n77.5326343, 13.1682818\n77.5331710, 13.1680265\n...`}
                value={formCoordsText}
                onChange={(e) => setFormCoordsText(e.target.value)}
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Accepts both [lng, lat] (Google Earth standard) and [lat, lng]. Coordinates are automatically verified.
              </p>
            </div>

            {/* Geometry Verification Live Preview Badge */}
            {parsedFormCoords.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="font-extrabold text-slate-800 flex items-center justify-between">
                  <span>Geometry Verification:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isFormClosed || formCategory === 'road' || formCategory === 'marker'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {formCategory === 'marker'
                      ? 'Pinpoint Marker'
                      : formCategory === 'road'
                      ? 'Valid Polyline'
                      : isFormClosed
                      ? '✓ Closed Ring'
                      : 'Open Path'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Points</span>
                    <span className="font-mono font-bold text-slate-900">{parsedFormCoords.length} nodes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Perimeter</span>
                    <span className="font-mono font-bold text-slate-900">{Math.round(formPerimeterM)} m</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Surface Area</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formAreaM2 > 0 ? `${(formAreaM2 / 4046.86).toFixed(2)} acres` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Color & Styling Options */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Color &amp; Styling</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setFormColor(p.color)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      formColor === p.color ? 'ring-2 ring-sky-500 border-transparent' : 'border-slate-200'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-700">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddFeatureModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddFeatureFromForm}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30"
              >
                Add Feature to Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 12. IMPORT KML MODAL                                                */}
      {/* =================================================================== */}
      {showImportKmlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Import KML File</h3>
                  <p className="text-xs text-slate-500">Upload or paste Google Earth KML data</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportKmlModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-6 text-center transition-colors">
              <FileCode className="w-10 h-10 text-sky-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">Choose a .kml file from your computer</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Supports Placemarks, Polygons, and LineStrings</p>
              <input
                type="file"
                accept=".kml"
                onChange={handleKmlFileUpload}
                className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowImportKmlModal(false)}
              className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 13. GEOMETRY INSPECTOR MODAL                                        */}
      {/* =================================================================== */}
      {showInspectorModal && selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-4 h-4 rounded-full border border-black/10"
                  style={{ backgroundColor: selectedFeature.strokeColor || '#0284c7' }}
                />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedFeature.name}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    {selectedFeature.category} • {selectedFeature.type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInspectorModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Points / Nodes</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {selectedFeature.type === 'point' ? 1 : selectedFeature.coordinates?.length || 0}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Closure</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>

            {/* Coordinate Node List */}
            {selectedFeature.type !== 'point' && Array.isArray(selectedFeature.coordinates) && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">
                    Coordinates ({selectedFeature.coordinates.length} Nodes)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = selectedFeature.coordinates
                        .map(([lat, lng], i) => `#${i + 1}: ${lat.toFixed(8)}, ${lng.toFixed(8)}`)
                        .join('\n');
                      copyToClipboard(text);
                    }}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy All</span>
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] space-y-1 text-slate-700">
                  {selectedFeature.coordinates.map(([lat, lng], idx) => (
                    <div key={idx} className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="font-bold text-slate-400">#{idx + 1}</span>
                      <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                      <span className="text-[9px] text-slate-400">
                        {idx === 0 ? 'Start' : idx === selectedFeature.coordinates.length - 1 ? 'End' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSaveToDatabase(selectedFeature)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save to MongoDB Atlas</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteFeature(selectedFeature.id);
                }}
                className="py-2.5 px-4 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
