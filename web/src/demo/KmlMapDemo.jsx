import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  Polygon,
  Polyline,
  Marker,
  Popup,
  Tooltip,
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
  Trees,
  Navigation as NavigationIcon,
  Building2,
  Save,
  HelpCircle
} from 'lucide-react';
import { createCampusFeatureApi } from '../services/api';

// Center reference: Presidency University, Bengaluru
const CAMPUS_DEFAULT_CENTER = [13.169116, 77.535350];
const DEFAULT_ZOOM = 17;

// Geodesic distance formula (Haversine)
function calculateDistanceMeters([lat1, lng1], [lat2, lng2]) {
  const R = 6378137; // Earth radius in meters
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
    // Split line by comma, space, or tab
    const parts = line.split(/[,\s\t]+/).filter(Boolean);
    if (parts.length >= 2) {
      const val1 = parseFloat(parts[0]);
      const val2 = parseFloat(parts[1]);
      if (!isNaN(val1) && !isNaN(val2)) {
        // Auto-detect coordinate order:
        // In India, Longitude is ~77 (greater than 60), Latitude is ~13 (less than 40).
        if (val1 > 50 && val2 < 40) {
          // Input was [lng, lat] (Google Earth standard) -> Convert to [lat, lng] for Leaflet
          parsed.push([val2, val1]);
        } else {
          // Input was already [lat, lng]
          parsed.push([val1, val2]);
        }
      }
    }
  }
  return parsed;
}

// Custom Leaflet Pin Icon generator
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

// Map Event Listener for Cursor Coordinates & Click Capture / Interactive Drawing
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
  // Pure White Canvas Features State (Initially completely empty as requested)
  const [features, setFeatures] = useState(() => {
    try {
      const saved = localStorage.getItem('dishasetu_demo_canvas_features');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist features locally
  useEffect(() => {
    try {
      localStorage.setItem('dishasetu_demo_canvas_features', JSON.stringify(features));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [features]);

  // Live Map Coordinates State
  const [cursorCoords, setCursorCoords] = useState(null);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [copiedNotification, setCopiedNotification] = useState('');

  // Map Controls State
  const [fitTarget, setFitTarget] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showGrid, setShowGrid] = useState(false);

  // Active Modals & Panels
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [showImportKmlModal, setShowImportKmlModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [drawingCategory, setDrawingCategory] = useState('building');

  // Form State for Manual Feature Addition
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('building'); // building, lawn, road, marker
  const [formCoordsText, setFormCoordsText] = useState('');
  const [formColor, setFormColor] = useState('#F59E0B');
  const [formOpacity, setFormOpacity] = useState(0.35);
  const [formStrokeWidth, setFormStrokeWidth] = useState(3);
  const [formDashArray, setFormDashArray] = useState('');

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

  // Canvas Click Handler (for drawing or coordinate capture)
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
      // Auto-close if not closed
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

    // Auto-fit to newly added feature
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

        // Collect all coordinates to fit view
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

  // Export current layers to valid KML file for Google Earth
  const handleExportKml = () => {
    if (features.length === 0) {
      alert('No features drawn yet to export.');
      return;
    }

    let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Presidency University — Demo Map Survey</name>
    <description>Exported from DishaSetu Blank Coordinate Canvas Builder</description>
`;

    features.forEach(f => {
      if (f.type === 'polygon') {
        const coordStr = f.coordinates.map(([lat, lng]) => `${lng},${lat},0`).join('\n          ');
        kmlContent += `
    <Placemark>
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
    </Placemark>`;
      } else if (f.type === 'polyline') {
        const coordStr = f.coordinates.map(([lat, lng]) => `${lng},${lat},0`).join('\n          ');
        kmlContent += `
    <Placemark>
      <name>${f.name}</name>
      <LineString>
        <coordinates>
          ${coordStr}
        </coordinates>
      </LineString>
    </Placemark>`;
      } else if (f.type === 'point') {
        const [lat, lng] = f.coordinates;
        kmlContent += `
    <Placemark>
      <name>${f.name}</name>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
    </Placemark>`;
      }
    });

    kmlContent += `
  </Document>
</kml>`;

    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Presidency_Campus_Map_${Date.now()}.kml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fit all drawn features on canvas
  const handleFitAll = () => {
    const allPoints = [];
    features.filter(f => f.visible).forEach(f => {
      if (f.type === 'point') allPoints.push(f.coordinates);
      else allPoints.push(...f.coordinates);
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

  // Persist single feature to MongoDB Atlas backend
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
              <Crosshair className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  Demo Map Builder — Clean White Canvas
                </h1>
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border uppercase tracking-wider ${
                  features.length === 0
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                }`}>
                  {features.length} {features.length === 1 ? 'Feature' : 'Features'} Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pristine Coordinate Canvas • Google Earth Coordinates • KML Verification
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Add, Draw, Import, Export, Clear */}
        <div className="flex items-center gap-2">
          {/* Add Feature Button */}
          <button
            onClick={() => setShowAddFeatureModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-all text-xs font-bold shadow-sm active:scale-95"
            title="Paste Google Earth Coordinates"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Feature</span>
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
            title="Click directly on white canvas to plot points"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{isDrawingMode ? 'Drawing Active' : 'Draw on Canvas'}</span>
          </button>

          {/* Import KML Button */}
          <button
            onClick={() => setShowImportKmlModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-xs font-semibold active:scale-95"
            title="Upload or paste KML"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Import KML</span>
          </button>

          {/* Export KML Button */}
          {features.length > 0 && (
            <button
              onClick={handleExportKml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-all text-xs font-semibold active:scale-95"
              title="Download as KML"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export KML</span>
            </button>
          )}

          {/* Clear All Canvas */}
          {features.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all user-drawn features and reset back to a clean white canvas?')) {
                  setFeatures([]);
                  setSelectedFeature(null);
                  setShowInspectorModal(false);
                }
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all text-xs active:scale-95"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
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

          {/* Render User-Drawn Features (Polygons, Roads, Markers) */}
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

        {/* Optional Subtle Coordinate Grid Overlay */}
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
        {/* 3. ACTIVE DRAWING BANNER (Appears when user is clicking canvas)    */}
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
        {/* 4. FLOATING LAYER MANAGEMENT PANEL (Top-Left)                     */}
        {/* ================================================================= */}
        <div className="absolute top-4 left-4 z-20 w-80 max-h-[calc(100vh-140px)] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden pointer-events-auto">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              Layer Management
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {features.length} {features.length === 1 ? 'Layer' : 'Layers'}
            </span>
          </div>

          <div className="p-3 overflow-y-auto space-y-2 text-xs flex-1">
            {features.length === 0 ? (
              <div className="text-center py-6 px-2 text-slate-500">
                <Crosshair className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="font-extrabold text-xs text-slate-800">Clean White Canvas Ready</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Zero map content preloaded. Add your campus features one-by-one:
                </p>
                <div className="mt-3 space-y-1.5 text-left text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px]">1</span>
                    <span>Obtain coordinates from Google Earth</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px]">2</span>
                    <span>Click <strong>Add Feature</strong> or <strong>Import KML</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px]">3</span>
                    <span>Verify geometry, save, and proceed</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddFeatureModal(true)}
                  className="mt-3 w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  + Add First Feature
                </button>
              </div>
            ) : (
              features.map((feat) => {
                const count = feat.type === 'point' ? 1 : feat.coordinates?.length || 0;
                return (
                  <div
                    key={feat.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      feat.visible ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: feat.strokeColor || '#0284c7' }}
                        />
                        <span className="font-extrabold text-slate-900 truncate text-xs">
                          {feat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Toggle visibility */}
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(feat.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title={feat.visible ? 'Hide' : 'Show'}
                        >
                          {feat.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        {/* Fit geometry */}
                        {feat.type !== 'point' && (
                          <button
                            type="button"
                            onClick={() => setFitTarget(feat.coordinates)}
                            className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-100"
                            title="Fit View"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Inspect */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFeature(feat);
                            setShowInspectorModal(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                          title="Inspect Geometry"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteFeature(feat.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                          title="Delete Feature"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 pl-5">
                      <span className="uppercase font-semibold tracking-wider">{feat.category}</span>
                      <span>{count} {count === 1 ? 'node' : 'nodes'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 5. FLOATING MAP NAVIGATION & CONTROLS (Top-Right)                 */}
        {/* ================================================================= */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          {/* Fit All Features */}
          <button
            type="button"
            onClick={handleFitAll}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-md transition-all active:scale-95"
            title="Fit All Geometries"
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
      {/* 7. MANUAL COORDINATE FEATURE BUILDER MODAL                          */}
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
      {/* 8. IMPORT KML MODAL                                                 */}
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
      {/* 9. GEOMETRY INSPECTOR MODAL                                         */}
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
