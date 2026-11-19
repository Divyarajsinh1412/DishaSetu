import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Compass,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Navigation,
  MapPin,
  Building2,
  Coffee,
  HeartPulse,
  BookOpen,
  Car,
  Trophy,
  Trees,
  Shield,
  Layers,
  Crosshair,
  ArrowRight,
  Info,
  X,
  Sparkles,
  Eye,
  RefreshCw,
  LocateFixed,
  Target,
  RotateCcw,
  RotateCw,
  DoorOpen,
  Footprints,
  CheckCircle2,
  Maximize2,
  Star,
  Sliders
} from 'lucide-react';
import { getTranslation } from '../services/localization';
import { MASTER_CAMPUS_FEATURES } from '../data/masterMapFeatures.js';
import { fetchCafes } from '../services/api';

const MAP_ASPECT_RATIO = 583 / 829; // Official Presidency Master Map width / height

// Category icon helper
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Academic': return Building2;
    case 'Administrative': return Layers;
    case 'Gate': return Compass;
    case 'Parking': return Car;
    case 'Sports': return Trophy;
    case 'Garden': return Trees;
    case 'Cafe': return Coffee;
    case 'Library': return BookOpen;
    case 'Medical': return HeartPulse;
    case 'Security': return Shield;
    case 'Transport': return Navigation;
    default: return MapPin;
  }
};

// Category badge color helper
const getCategoryStyle = (category) => {
  switch (category) {
    case 'Academic':
      return {
        bg: 'bg-amber-500',
        ring: 'ring-amber-400',
        text: 'text-amber-300',
        stroke: '#f59e0b',
        fill: 'rgba(245, 158, 11, 0.22)',
        badge: 'bg-amber-500/20 border-amber-500/30'
      };
    case 'Administrative':
      return {
        bg: 'bg-indigo-600',
        ring: 'ring-indigo-400',
        text: 'text-indigo-300',
        stroke: '#6366f1',
        fill: 'rgba(99, 102, 241, 0.22)',
        badge: 'bg-indigo-500/20 border-indigo-500/30'
      };
    case 'Gate':
      return {
        bg: 'bg-emerald-600',
        ring: 'ring-emerald-400',
        text: 'text-emerald-300',
        stroke: '#10b981',
        fill: 'rgba(16, 185, 129, 0.22)',
        badge: 'bg-emerald-500/20 border-emerald-500/30'
      };
    case 'Parking':
      return {
        bg: 'bg-sky-600',
        ring: 'ring-sky-400',
        text: 'text-sky-300',
        stroke: '#0ea5e9',
        fill: 'rgba(14, 165, 233, 0.22)',
        badge: 'bg-sky-500/20 border-sky-500/30'
      };
    case 'Sports':
      return {
        bg: 'bg-green-600',
        ring: 'ring-green-400',
        text: 'text-green-300',
        stroke: '#22c55e',
        fill: 'rgba(34, 197, 94, 0.22)',
        badge: 'bg-green-500/20 border-green-500/30'
      };
    case 'Garden':
      return {
        bg: 'bg-teal-600',
        ring: 'ring-teal-400',
        text: 'text-teal-300',
        stroke: '#14b8a6',
        fill: 'rgba(20, 184, 166, 0.25)',
        badge: 'bg-teal-500/20 border-teal-500/30'
      };
    case 'Cafe':
      return {
        bg: 'bg-orange-600',
        ring: 'ring-orange-400',
        text: 'text-orange-300',
        stroke: '#f97316',
        fill: 'rgba(249, 115, 22, 0.22)',
        badge: 'bg-orange-500/20 border-orange-500/30'
      };
    case 'Library':
      return {
        bg: 'bg-indigo-600',
        ring: 'ring-indigo-400',
        text: 'text-indigo-300',
        stroke: '#818cf8',
        fill: 'rgba(129, 140, 248, 0.22)',
        badge: 'bg-indigo-500/20 border-indigo-500/30'
      };
    case 'Medical':
      return {
        bg: 'bg-rose-600',
        ring: 'ring-rose-400',
        text: 'text-rose-300',
        stroke: '#f43f5e',
        fill: 'rgba(244, 63, 94, 0.22)',
        badge: 'bg-rose-500/20 border-rose-500/30'
      };
    case 'Security':
      return {
        bg: 'bg-red-700',
        ring: 'ring-red-400',
        text: 'text-red-300',
        stroke: '#ef4444',
        fill: 'rgba(239, 68, 68, 0.22)',
        badge: 'bg-red-500/20 border-red-500/30'
      };
    case 'Transport':
      return {
        bg: 'bg-purple-600',
        ring: 'ring-purple-400',
        text: 'text-purple-300',
        stroke: '#a855f7',
        fill: 'rgba(168, 85, 247, 0.22)',
        badge: 'bg-purple-500/20 border-purple-500/30'
      };
    default:
      return {
        bg: 'bg-slate-700',
        ring: 'ring-slate-400',
        text: 'text-slate-300',
        stroke: '#94a3b8',
        fill: 'rgba(148, 163, 184, 0.15)',
        badge: 'bg-slate-700/40 border-slate-600'
      };
  }
};

// D Block 6-room list for search room matching
const D_BLOCK_ROOM_SUGGESTIONS = [
  { roomNumber: 'DG01', name: 'Fluid Mechanics & Hydraulics Laboratory', floor: 0, buildingId: 'bld_d_block' },
  { roomNumber: 'DG02', name: 'Material Testing & Strength of Materials Lab', floor: 0, buildingId: 'bld_d_block' },
  { roomNumber: 'DG03', name: 'Computer-Aided Design & Simulation Studio', floor: 0, buildingId: 'bld_d_block' },
  { roomNumber: 'DG04', name: 'Mechatronics & Embedded Robotics Workshop', floor: 0, buildingId: 'bld_d_block' },
  { roomNumber: 'DG05', name: 'Internal Combustion Engines & Thermal Lab', floor: 0, buildingId: 'bld_d_block' },
  { roomNumber: 'DG06', name: 'Metrology, Instrumentation & Quality Lab', floor: 0, buildingId: 'bld_d_block' }
];

// Master Campus Map Node Normalized Coordinate System for Turn-by-Turn Wayfinding
const MASTER_MAP_NODE_COORDS = {
  // Gates & Entrances
  'node_main_gate': { x: 0.5695, y: 0.2449 },
  'node_avenue_origin': { x: 0.5400, y: 0.2800 },
  'node_start_west': { x: 0.4900, y: 0.2650 },
  'node_parking_entry': { x: 0.4850, y: 0.2650 },
  'node_gate_2': { x: 0.7420, y: 0.1980 },
  'node_visitor_parking': { x: 0.6550, y: 0.2200 },
  'node_bus_point_2': { x: 0.7720, y: 0.2450 },
  'node_parking_4w': { x: 0.7950, y: 0.3350 },

  // Main Avenue & Lawn Spine
  'node_avenue_mid_north': { x: 0.5300, y: 0.3600 },
  'node_avenue_mid': { x: 0.5100, y: 0.4400 },
  'node_bus_boarding': { x: 0.4950, y: 0.5150 },
  'node_main_lawn': { x: 0.5850, y: 0.4200 },
  'node_fountain': { x: 0.4666, y: 0.5995 },
  'node_central_fountain': { x: 0.4666, y: 0.5995 },

  // West Quad (D, E, F, L, H, J, K, N, P, Q, R, S, U)
  'node_west_quad_junction': { x: 0.3800, y: 0.6050 },
  'node_cafe_d_block': { x: 0.3150, y: 0.6200 },
  'node_food_point_d': { x: 0.3150, y: 0.6200 },
  'node_d_block_ent': { x: 0.2025, y: 0.6450 },
  'node_e_block_ent': { x: 0.2025, y: 0.6975 },
  'node_f_block_ent': { x: 0.2025, y: 0.7510 },
  'node_l_block_ent': { x: 0.2000, y: 0.8035 },
  'node_quad_avenue_mid': { x: 0.2200, y: 0.7200 },
  'node_h_block_ent': { x: 0.3350, y: 0.7050 },
  'node_j_block_ent': { x: 0.3050, y: 0.7400 },
  'node_k_block_ent': { x: 0.3450, y: 0.7500 },
  'node_n_block_ent': { x: 0.3100, y: 0.7950 },
  'node_p_block_ent': { x: 0.3450, y: 0.8350 },
  'node_q_block_ent': { x: 0.3100, y: 0.8700 },
  'node_r_block_ent': { x: 0.3350, y: 0.9000 },
  'node_s_block_ent': { x: 0.2400, y: 0.8700 },
  'node_u_block_ent': { x: 0.3000, y: 0.9300 },

  // South Central Plaza & Administration
  'node_plaza_junction': { x: 0.4400, y: 0.6500 },
  'node_hr_block_ent': { x: 0.4350, y: 0.6800 },
  'node_coe_ent': { x: 0.4950, y: 0.7000 },
  'node_dsa_ent': { x: 0.5400, y: 0.6850 },
  'node_mba_som_ent': { x: 0.6300, y: 0.7200 },

  // East Sector & Amenities
  'node_east_road_junction': { x: 0.5800, y: 0.6300 },
  'node_auditorium_ent': { x: 0.7300, y: 0.6750 },
  'node_hostel_mess': { x: 0.7000, y: 0.5450 },

  // Sports & Facilities
  'node_football_court': { x: 0.4200, y: 0.3800 },
  'node_volleyball_court': { x: 0.2600, y: 0.5200 },
  'node_basketball_court': { x: 0.2000, y: 0.5500 },
  'node_cricket_nets': { x: 0.3100, y: 0.5500 },
  'node_medical_ent': { x: 0.6000, y: 0.6700 },
  'node_library_ent': { x: 0.5450, y: 0.7250 }
};

export default function MasterCampusMap({
  markers = [],
  activeCategory = 'all',
  searchQuery = '',
  selectedMarker = null,
  onSelectMarker,
  onStartNavigation,
  onOpenRoutePlanning,
  onClearRoute,
  onOpenIndoor,
  onOpenBuildingPopup,
  onOpenIndoorMap,
  onStartIndoorNavigation,
  onOpenCafe,
  cafes = [],
  activeRoute = null,
  userLocation = null,
  onAdminClickMap = null,
  isAdminEditorActive = false,
  language = 'en'
}) {
  const containerRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  // Pan & Zoom state: Default scale 1.35 for a generous, spacious presentation
  const [scale, setScale] = useState(1.35);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0 to 360 degrees
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotateStartAngle, setRotateStartAngle] = useState(0);
  const [initialRotation, setInitialRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [localSelectedFeature, setLocalSelectedFeature] = useState(null);

  // Dynamic Cafe Ratings & Reviews from MongoDB
  const [liveCafes, setLiveCafes] = useState([]);
  useEffect(() => {
    let isMounted = true;
    fetchCafes().then(data => {
      if (isMounted && Array.isArray(data)) {
        setLiveCafes(data);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [cafes]);

  const hattiKappiCafe = useMemo(() => {
    return liveCafes.find(c => c.shortCode === 'PU-CAFE-D-BLOCK' || c.name === 'Hatti Kappi');
  }, [liveCafes]);

  // Unified Search Bar State
  const [localSearch, setLocalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const t = (k) => getTranslation(language, k);

  // Combine MASTER_CAMPUS_FEATURES with any custom markers from props
  const allCampusFeatures = useMemo(() => {
    return MASTER_CAMPUS_FEATURES;
  }, []);

  // Filter features based on Category & Search Query
  const filteredFeatures = useMemo(() => {
    let list = allCampusFeatures;
    if (activeCategory && activeCategory !== 'all') {
      list = list.filter(f => f.category.toLowerCase() === activeCategory.toLowerCase());
    }
    const query = (localSearch || searchQuery || '').trim().toLowerCase();
    if (query) {
      list = list.filter(f =>
        f.featureName.toLowerCase().includes(query) ||
        (f.code && f.code.toLowerCase().includes(query)) ||
        (f.description && f.description.toLowerCase().includes(query)) ||
        (f.departments && f.departments.some(d => d.toLowerCase().includes(query)))
      );
    }
    return list;
  }, [allCampusFeatures, activeCategory, localSearch, searchQuery]);

  // Autocomplete search suggestions (Features + D Block Rooms)
  const searchSuggestions = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    if (!q) return [];

    const matchedFeatures = allCampusFeatures
      .filter(f =>
        f.featureName.toLowerCase().includes(q) ||
        (f.code && f.code.toLowerCase().includes(q)) ||
        (f.category && f.category.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map(f => ({
        type: 'feature',
        id: f.featureId,
        title: f.featureName,
        subtitle: `${f.category} · ${f.code || 'Campus'}`,
        item: f
      }));

    const matchedRooms = D_BLOCK_ROOM_SUGGESTIONS
      .filter(r => r.roomNumber.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map(r => ({
        type: 'room',
        id: r.roomNumber,
        title: `${r.roomNumber} - ${r.name}`,
        subtitle: `D Block · Ground Floor Lab`,
        item: r
      }));

    return [...matchedRooms, ...matchedFeatures];
  }, [localSearch, allCampusFeatures]);

  // Active Selected item (either from prop or local selection)
  const activeSelected = useMemo(() => {
    if (selectedMarker) {
      const match = allCampusFeatures.find(f =>
        f.featureId === selectedMarker.markerId ||
        f.buildingId === selectedMarker.buildingId ||
        f.featureName === selectedMarker.name ||
        f.code === selectedMarker.shortCode
      );
      if (match) return match;
    }
    return localSelectedFeature;
  }, [selectedMarker, localSelectedFeature, allCampusFeatures]);

  // Map Active Route sequence to normalized coordinates on official campus map
  const mapRoutePoints = useMemo(() => {
    if (!activeRoute) return [];

    const resolveNormalizedPoint = (nodeId, coords = null) => {
      if (nodeId && MASTER_MAP_NODE_COORDS[nodeId]) {
        return MASTER_MAP_NODE_COORDS[nodeId];
      }
      if (nodeId) {
        const feat = MASTER_CAMPUS_FEATURES.find(
          f => f.featureId === nodeId ||
               f.buildingId === nodeId ||
               f.code === nodeId ||
               (f.associatedLocationId && f.associatedLocationId === nodeId)
        );
        if (feat) return { x: feat.normalizedX, y: feat.normalizedY };
      }
      if (coords) {
        const lat = Array.isArray(coords) ? coords[0] : coords.lat;
        const lng = Array.isArray(coords) ? coords[1] : coords.lng;
        if (lat != null && lng != null) {
          const minLat = 13.1688, maxLat = 13.1720;
          const minLng = 77.5352, maxLng = 77.5372;
          const clampedLat = Math.min(Math.max(lat, minLat), maxLat);
          const clampedLng = Math.min(Math.max(lng, minLng), maxLng);
          const normY = 0.22 + (maxLat - clampedLat) / (maxLat - minLat) * (0.93 - 0.22);
          const normX = 0.18 + (clampedLng - minLng) / (maxLng - minLng) * (0.76 - 0.18);
          return { x: normX, y: normY };
        }
      }
      return null;
    };

    const pts = [];
    if (activeRoute.nodeSequence && activeRoute.nodeSequence.length > 0) {
      activeRoute.nodeSequence.forEach((nodeId, idx) => {
        const geomCoord = activeRoute.geometry ? activeRoute.geometry[idx] : null;
        const pt = resolveNormalizedPoint(nodeId, geomCoord);
        if (pt) pts.push(pt);
      });
    } else if (activeRoute.geometry && activeRoute.geometry.length > 0) {
      activeRoute.geometry.forEach(coord => {
        const pt = resolveNormalizedPoint(null, coord);
        if (pt) pts.push(pt);
      });
    }

    if (pts.length < 2 && activeRoute.startLocation && activeRoute.endLocation) {
      const p1 = resolveNormalizedPoint(null, [activeRoute.startLocation.lat, activeRoute.startLocation.lng]);
      const p2 = resolveNormalizedPoint(null, [activeRoute.endLocation.lat, activeRoute.endLocation.lng]);
      if (p1 && p2) return [p1, p2];
    }

    return pts;
  }, [activeRoute]);

  // Auto-frame route when active
  useEffect(() => {
    if (!activeRoute || mapRoutePoints.length < 2 || !containerRef.current) return;
    const xs = mapRoutePoints.map(p => p.x);
    const ys = mapRoutePoints.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;
    const targetScale = 1.65;
    setScale(targetScale);
    const targetX = -(midX - 0.5) * (containerW * 0.75) * targetScale;
    const targetY = -(midY - 0.5) * (containerH * 0.95) * targetScale;
    setPosition({ x: targetX, y: targetY });
  }, [activeRoute, mapRoutePoints]);

  // Handle Feature Selection & Auto-Focus
  const handleSelectFeature = useCallback((feature) => {
    setLocalSelectedFeature(feature);
    if (onSelectMarker) {
      onSelectMarker({
        markerId: feature.featureId,
        buildingId: feature.buildingId,
        name: feature.featureName,
        shortCode: feature.code,
        category: feature.category,
        imageX: feature.normalizedX,
        imageY: feature.normalizedY,
        description: feature.description,
        totalFloors: feature.totalFloors,
        hasIndoorMap: feature.hasIndoorMap,
        departments: feature.departments
      });
    }

    // Check if it's an academic or administrative building to open the Building Popup
    const isBuilding =
      feature.category === 'Academic' ||
      feature.category === 'Administrative' ||
      feature.buildingId ||
      /block/i.test(feature.featureName) ||
      /office/i.test(feature.featureName);

    if (isBuilding && onOpenBuildingPopup) {
      onOpenBuildingPopup({
        _id: feature.buildingId || feature.featureId,
        buildingId: feature.buildingId || feature.featureId,
        name: feature.featureName,
        code: feature.code,
        shortCode: feature.code,
        category: feature.category,
        totalFloors: feature.totalFloors || 4,
        hasIndoorMap: feature.hasIndoorMap,
        description: feature.description,
        departments: feature.departments || [],
        latitude: feature.latitude,
        longitude: feature.longitude,
        status: feature.status
      });
    }

    // Check if it's a cafe (especially Hatti Kappi) to open Cafe Details Modal
    const isCafe =
      feature.code === 'PU-CAFE-D-BLOCK' ||
      feature.category === 'Cafe' ||
      /hatti kappi/i.test(feature.featureName) ||
      /cafe/i.test(feature.featureName) ||
      /food point/i.test(feature.featureName);

    if (isCafe && onOpenCafe) {
      onOpenCafe({
        _id: hattiKappiCafe?._id || feature.buildingId || feature.code || 'PU-CAFE-D-BLOCK',
        shortCode: feature.code || 'PU-CAFE-D-BLOCK',
        name: feature.featureName,
        rating: hattiKappiCafe?.rating || { average: 0, count: 0, isNew: true },
        coordinates: { lat: feature.latitude, lng: feature.longitude }
      });
    }

    // Auto-center on selected feature
    if (containerRef.current) {
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;
      const targetScale = 2.4;
      setScale(targetScale);
      const targetX = -(feature.normalizedX - 0.5) * (containerW * 0.75) * targetScale;
      const targetY = -(feature.normalizedY - 0.5) * (containerH * 0.95) * targetScale;
      setPosition({ x: targetX, y: targetY });
    }
  }, [onSelectMarker, onOpenBuildingPopup, onOpenCafe, hattiKappiCafe]);

  // Handle Autocomplete Suggestion Click
  const handleSuggestionClick = (suggestion) => {
    setIsSearchFocused(false);
    setLocalSearch('');

    if (suggestion.type === 'feature') {
      handleSelectFeature(suggestion.item);
    } else if (suggestion.type === 'room') {
      const dBlock = allCampusFeatures.find(f => f.featureId === 'bld_d_block');
      if (dBlock) {
        handleSelectFeature(dBlock);
        if (onOpenIndoorMap) {
          onOpenIndoorMap({
            _id: 'bld_d_block',
            buildingId: 'bld_d_block',
            name: 'D Block',
            shortCode: 'PU-D-BLOCK',
            totalFloors: 6,
            hasIndoorMap: true,
            focusRoom: suggestion.item.roomNumber
          });
        }
      }
    }
  };

  // Helper to compute pointer angle around container center for silky smooth rotation
  const getAngleFromEvent = useCallback((e) => {
    const container = containerRef.current;
    if (!container) return 0;
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
  }, []);

  // 1. Zoom In (Smooth 25% step)
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.25, 5.0));
  };

  // 2. Zoom Out (Smooth 25% step)
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.25, 0.65));
  };

  // 3. Rotate Left (-15° step)
  const handleRotateLeft = () => {
    setRotation(prev => (Math.round((prev - 15) / 15) * 15 + 360) % 360);
  };

  // 4. Rotate Right (+15° step)
  const handleRotateRight = () => {
    setRotation(prev => (Math.round((prev + 15) / 15) * 15) % 360);
  };

  // 5. Reset to True North (0°)
  const handleResetNorth = () => {
    setRotation(0);
  };

  // 6. Fit Entire Campus (Overview)
  const handleFitCampus = useCallback(() => {
    setScale(1.0);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  // 7. Fit Width (Wide View - Eliminates side black dead space)
  const handleFitWidth = useCallback(() => {
    setScale(1.6);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 8. Fill Entire Screen Viewport
  const handleFillViewport = useCallback(() => {
    setScale(1.9);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 9. Focus Academic Quad (D, E, F, L, H, J, K blocks)
  const handleFocusQuad = useCallback(() => {
    setScale(2.2);
    setPosition({ x: 220, y: -150 });
  }, []);

  // 10. Focus Selected Building
  const handleFocusSelected = useCallback(() => {
    if (!activeSelected || !containerRef.current) return;
    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;
    const targetScale = 2.4;
    setScale(targetScale);
    const targetX = -(activeSelected.normalizedX - 0.5) * (containerW * 0.75) * targetScale;
    const targetY = -(activeSelected.normalizedY - 0.5) * (containerH * 0.95) * targetScale;
    setPosition({ x: targetX, y: targetY });
  }, [activeSelected]);

  // 11. Reset All (Default Clean View)
  const handleResetView = () => {
    setScale(1.35);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  // 12. Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Mouse wheel: Shift+Wheel rotates; normal wheel zooms smoothly toward cursor coordinate
  const handleWheel = (e) => {
    e.preventDefault();

    // 1. Shift or Alt held -> Rotate in 5° / 15° steps
    if (e.shiftKey || e.altKey) {
      const step = e.altKey ? 15 : 5;
      const rotDelta = e.deltaY > 0 ? step : -step;
      setRotation(prev => (Math.round((prev + rotDelta) / step) * step + 360) % 360);
      return;
    }

    // 2. Cursor-Centric Smooth Zoom
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const mouseX = e.clientX - (rect.left + rect.width / 2);
    const mouseY = e.clientY - (rect.top + rect.height / 2);

    const zoomSensitivity = 0.0016;
    const factor = Math.exp(-e.deltaY * zoomSensitivity);

    setScale(prevScale => {
      const newScale = Math.min(Math.max(prevScale * factor, 0.65), 5.0);
      const ratio = newScale / prevScale;

      setPosition(prevPos => ({
        x: mouseX - (mouseX - prevPos.x) * ratio,
        y: mouseY - (mouseY - prevPos.y) * ratio
      }));

      return newScale;
    });
  };

  // Double click to zoom in at mouse position
  const handleDoubleClick = (e) => {
    if (e.target.closest('.no-dblclick') || e.target.closest('button')) return;
    setScale(prev => Math.min(prev + 0.5, 4.5));
  };

  // Drag & Rotate Mouse handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.interactive-map-marker') || e.target.closest('.interactive-polygon') || e.target.closest('.no-drag')) return;

    // Right-Click (e.button === 2) OR Left-Click with Shift Key -> Start Free Rotation!
    if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsRotating(true);
      setRotateStartAngle(getAngleFromEvent(e));
      setInitialRotation(rotation);
      return;
    }

    // Normal Left Click (e.button === 0) -> Start Smooth Pan Drag
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isRotating) {
      const currentAngle = getAngleFromEvent(e);
      const angleDelta = currentAngle - rotateStartAngle;
      const newRotation = (initialRotation + angleDelta + 360) % 360;
      setRotation(Math.round(newRotation * 10) / 10);
      return;
    }

    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsRotating(false);
  };

  // Touch handlers: 1 finger pan, 2 fingers pinch & twist-to-rotate
  const touchStateRef = useRef({ dist: 0, angle: 0 });

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      if (e.target.closest('.interactive-map-marker') || e.target.closest('.interactive-polygon') || e.target.closest('.no-drag')) return;
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const angle = Math.atan2(
        e.touches[1].clientY - e.touches[0].clientY,
        e.touches[1].clientX - e.touches[0].clientX
      ) * (180 / Math.PI);

      touchStateRef.current = { dist, angle };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const angle = Math.atan2(
        e.touches[1].clientY - e.touches[0].clientY,
        e.touches[1].clientX - e.touches[0].clientX
      ) * (180 / Math.PI);

      const diffDist = dist - touchStateRef.current.dist;
      const diffAngle = angle - touchStateRef.current.angle;

      setScale(prev => Math.min(Math.max(prev + diffDist * 0.005, 0.65), 5.0));
      setRotation(prev => (prev + diffAngle + 360) % 360);

      touchStateRef.current = { dist, angle };
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Admin Click Handler
  const handleMapImageClick = (e) => {
    if (!isAdminEditorActive || !onAdminClickMap) return;
    const rect = imageWrapperRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const normX = Math.min(Math.max(clickX / rect.width, 0), 1);
    const normY = Math.min(Math.max(clickY / rect.height, 0), 1);

    onAdminClickMap({
      imageX: Number(normX.toFixed(4)),
      imageY: Number(normY.toFixed(4))
    });
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative w-full h-full overflow-hidden select-none bg-gradient-to-b from-[#070b16] via-[#0b1328] to-[#050811] flex items-center justify-center ${
        isRotating ? 'cursor-alias' : isDragging ? 'cursor-grabbing' : isAdminEditorActive ? 'cursor-crosshair' : 'cursor-grab'
      }`}
    >
      {/* High-Precision Architectural Coordinate Grid Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1.2px,transparent_1.2px)] [background-size:32px_32px]"></div>

      {/* Soft Ambient Radial Vignette behind Map */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,rgba(56,189,248,0.04)_40%,transparent_75%)]"></div>

      {/* ================================================================= */}
      {/* 1. TOP FLOATING GOOGLE MAPS-STYLE SEARCH & STATUS BAR             */}
      {/* ================================================================= */}
      <div className="absolute top-4 left-4 right-4 z-40 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Map Title & Status Pill with Heading Telemetry */}
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl text-slate-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-xs font-black text-white flex items-center gap-1.5 flex-wrap">
              <span>Official Presidency Campus Map</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                Interactive Layer Live
              </span>
              {Math.round((rotation % 360 + 360) % 360) !== 0 && (
                <button
                  onClick={handleResetNorth}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/40 hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                  title="Click to reset North"
                >
                  <span>{Math.round((rotation % 360 + 360) % 360)}°</span>
                  <span className="text-[9px] underline">Reset North</span>
                </button>
              )}
              {activeRoute && (
                <button
                  onClick={onClearRoute}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/40 hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                  title="Clear Active Walking Route"
                >
                  <span>Active Route</span>
                  <span className="text-[9px] font-black underline">End ✕</span>
                </button>
              )}
            </div>
            <div className="text-[10px] text-slate-400">Presidency University Bengaluru · Itgalpur Campus</div>
          </div>
        </div>

        {/* Center: Quick GIS View Mode Presets */}
        <div className="pointer-events-auto hidden lg:flex items-center gap-1.5 px-2 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl">
          <button
            onClick={handleFitCampus}
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1"
            title="Fit Entire Campus in View"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fit Campus</span>
          </button>
          <div className="w-px h-3.5 bg-slate-700/60" />
          <button
            onClick={handleFitWidth}
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1"
            title="Fit Canvas Width (Eliminate Side Gaps)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Wide View</span>
          </button>
          <div className="w-px h-3.5 bg-slate-700/60" />
          <button
            onClick={handleFocusQuad}
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1"
            title="Focus Academic Quad (D-E-F-L Blocks)"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Academic Quad</span>
          </button>
        </div>

        {/* Right: Wayfinding Directions & Unified Search Bar */}
        <div className="pointer-events-auto flex items-center gap-2 w-full sm:w-auto">
          {/* Main Navigation Directions Button */}
          <button
            onClick={() => onOpenRoutePlanning && onOpenRoutePlanning()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-2xl font-black text-xs shadow-xl shadow-sky-600/30 border border-sky-400/50 transition-all hover:scale-105 active:scale-95 shrink-0"
            title="Directions: Select place and navigate from one place to another place"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-200" />
            <span>Directions</span>
          </button>

          <div className="relative w-full sm:w-72 md:w-80">
            <div className="relative flex items-center bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl shadow-2xl focus-within:border-emerald-400 transition-colors">
              <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search buildings, rooms (DG01), facilities..."
                className="w-full py-2.5 pl-2.5 pr-8 bg-transparent text-xs text-white placeholder-slate-400 outline-none font-medium"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="p-1 mr-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 space-y-1">
                {searchSuggestions.map((sug) => (
                  <button
                    key={sug.id}
                    onMouseDown={() => handleSuggestionClick(sug)}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20">
                        {sug.type === 'room' ? (
                          <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-sky-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                          {sug.title}
                        </div>
                        <div className="text-[10px] text-slate-400">{sug.subtitle}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* ================================================================= */}
      {/* 2. INTERACTIVE TRANSFORMED CANVAS CONTAINER (PAN, ZOOM, ROTATE)   */}
      {/* ================================================================= */}
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
          transformOrigin: 'center center',
          transition: (isDragging || isRotating) ? 'none' : 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="relative will-change-transform flex items-center justify-center"
      >
        {/* Master Campus Map Image Wrapper */}
        <div
          ref={imageWrapperRef}
          onClick={handleMapImageClick}
          style={{
            height: '92vh',
            maxWidth: '96vw',
            aspectRatio: `${MAP_ASPECT_RATIO}`
          }}
          className="relative rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(56,189,248,0.12)] border-2 border-slate-700/70 bg-white overflow-hidden drop-shadow-2xl"
        >
          {/* Official Presidency University Master Campus Map Base Image */}
          <img
            src="/maps/presidency-campus-master-map.png"
            alt="Official Presidency University Campus Master Map"
            className="w-full h-full object-contain pointer-events-none block"
            onError={(e) => {
              if (!e.target.dataset.triedJpg) {
                e.target.dataset.triedJpg = 'true';
                e.target.src = '/maps/presidency-campus-master-map.jpg';
              }
            }}
          />

          {/* ============================================================= */}
          {/* 3. INTERACTIVE SVG POLYGON OVERLAY LAYER                      */}
          {/* ============================================================= */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-auto z-15"
            viewBox="0 0 1000 1422"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="polyGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {filteredFeatures.map((feat) => {
              const isSelected = activeSelected?.featureId === feat.featureId;
              const isHovered = hoveredFeature?.featureId === feat.featureId;
              const style = getCategoryStyle(feat.category);

              // Render Polygons for Buildings and Zones
              if (feat.polygonCoordinates && feat.polygonCoordinates.length > 2) {
                const pointsStr = feat.polygonCoordinates
                  .map(([px, py]) => `${(px * 1000).toFixed(1)},${(py * 1422).toFixed(1)}`)
                  .join(' ');

                return (
                  <polygon
                    key={feat.featureId}
                    points={pointsStr}
                    fill={isSelected ? 'rgba(16, 185, 129, 0.42)' : isHovered ? 'rgba(56, 189, 248, 0.32)' : style.fill}
                    stroke={isSelected ? '#10b981' : isHovered ? '#38bdf8' : style.stroke}
                    strokeWidth={isSelected ? '4' : isHovered ? '3.5' : '1.8'}
                    strokeDasharray={isSelected ? 'none' : isHovered ? '6 3' : 'none'}
                    className="interactive-polygon cursor-pointer transition-all duration-150"
                    style={{
                      filter: isSelected ? 'url(#polyGlow)' : 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFeature(feat);
                    }}
                    onMouseEnter={() => setHoveredFeature(feat)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <title>{`${feat.featureName} (${feat.category})`}</title>
                  </polygon>
                );
              }

              // Circular Region (e.g. Fountain)
              if (feat.radius) {
                return (
                  <circle
                    key={feat.featureId}
                    cx={feat.normalizedX * 1000}
                    cy={feat.normalizedY * 1422}
                    r={feat.radius * 1000}
                    fill={isSelected ? 'rgba(6, 182, 212, 0.45)' : isHovered ? 'rgba(56, 189, 248, 0.35)' : style.fill}
                    stroke={isSelected ? '#06b6d4' : isHovered ? '#38bdf8' : style.stroke}
                    strokeWidth={isSelected ? '4' : isHovered ? '3.5' : '2'}
                    className="interactive-polygon cursor-pointer transition-all duration-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFeature(feat);
                    }}
                    onMouseEnter={() => setHoveredFeature(feat)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <title>{feat.featureName}</title>
                  </circle>
                );
              }

              return null;
            })}
          </svg>

          {/* ============================================================= */}
          {/* 4. REAL DYNAMIC WALKING ROUTE OVERLAY LAYER                    */}
          {/* ============================================================= */}
          {activeRoute && mapRoutePoints.length > 1 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 1000 1422"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <filter id="routeShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#10b981" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Glowing Background Pathway */}
              <polyline
                points={mapRoutePoints.map(pt => `${(pt.x * 1000).toFixed(1)},${(pt.y * 1422).toFixed(1)}`).join(' ')}
                fill="none"
                stroke="#047857"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4"
              />

              {/* Animated Foreground Walking Dashed Ribbon */}
              <polyline
                points={mapRoutePoints.map(pt => `${(pt.x * 1000).toFixed(1)},${(pt.y * 1422).toFixed(1)}`).join(' ')}
                fill="none"
                stroke="url(#routeGlow)"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="12 6"
                className="animate-[dash_1.5s_linear_infinite]"
                filter="url(#routeShadow)"
              />
            </svg>
          )}

          {/* Start Origin Marker Pin (A) */}
          {activeRoute && mapRoutePoints.length > 0 && (
            <div
              style={{
                left: `${mapRoutePoints[0].x * 100}%`,
                top: `${mapRoutePoints[0].y * 100}%`,
                transform: 'translate(-50%, -100%)'
              }}
              className="absolute z-35 pointer-events-auto flex flex-col items-center animate-bounce"
            >
              <div className="px-2.5 py-0.5 rounded-full bg-emerald-950/95 border border-emerald-400 text-[10px] font-black text-emerald-300 shadow-xl whitespace-nowrap mb-1">
                A · {activeRoute.startLocation?.name || 'Start'}
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs ring-4 ring-emerald-500/40">
                A
              </div>
            </div>
          )}

          {/* End Destination Marker Pin (B) */}
          {activeRoute && mapRoutePoints.length > 1 && (
            <div
              style={{
                left: `${mapRoutePoints[mapRoutePoints.length - 1].x * 100}%`,
                top: `${mapRoutePoints[mapRoutePoints.length - 1].y * 100}%`,
                transform: 'translate(-50%, -100%)'
              }}
              className="absolute z-35 pointer-events-auto flex flex-col items-center"
            >
              <div className="px-2.5 py-0.5 rounded-full bg-rose-950/95 border border-rose-400 text-[10px] font-black text-rose-300 shadow-xl whitespace-nowrap mb-1 animate-pulse">
                B · {activeRoute.endLocation?.name || 'Destination'}
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs ring-4 ring-rose-500/40">
                B
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* 5. CLICKABLE MARKER PINS OVER KEY BUILDINGS & FACILITIES     */}
          {/* ============================================================= */}
          {filteredFeatures.map((feat) => {
            const isSelected = activeSelected?.featureId === feat.featureId;
            const isHovered = hoveredFeature?.featureId === feat.featureId;
            const Icon = getCategoryIcon(feat.category);
            const style = getCategoryStyle(feat.category);

            // Distinctive Hatti Kappi Cafe Marker (PU-CAFE-D-BLOCK)
            const isHattiKappi = feat.code === 'PU-CAFE-D-BLOCK' || feat.featureId === 'feat_food_d_block' || /hatti kappi/i.test(feat.featureName);

            if (isHattiKappi) {
              const ratingData = hattiKappiCafe?.rating || { average: 0, count: 0, isNew: true };
              const isNew = ratingData.isNew || !ratingData.count || ratingData.average === 0;

              return (
                <div
                  key={feat.featureId}
                  style={{
                    left: `${feat.normalizedX * 100}%`,
                    top: `${feat.normalizedY * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectFeature(feat);
                    if (onOpenCafe) {
                      onOpenCafe({
                        _id: hattiKappiCafe?._id || 'PU-CAFE-D-BLOCK',
                        shortCode: 'PU-CAFE-D-BLOCK',
                        name: 'Hatti Kappi'
                      });
                    }
                  }}
                  onMouseEnter={() => setHoveredFeature(feat)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="absolute z-28 interactive-map-marker cursor-pointer group pointer-events-auto"
                >
                  {/* Pulsing ring when selected */}
                  {isSelected && (
                    <span className="absolute -inset-4 rounded-full animate-ping opacity-75 bg-amber-500" />
                  )}

                  {/* Rating Stars & Cafe Name Floating Pill (Prominently shown when zoomed in scale >= 1.35 OR hovered/selected) */}
                  {(scale >= 1.35 || isHovered || isSelected) && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFeature(feat);
                        if (onOpenCafe) {
                          onOpenCafe({
                            _id: hattiKappiCafe?._id || 'PU-CAFE-D-BLOCK',
                            shortCode: 'PU-CAFE-D-BLOCK',
                            name: 'Hatti Kappi'
                          });
                        }
                      }}
                      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-xl bg-slate-950/95 backdrop-blur-md border border-amber-500/70 shadow-2xl flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 z-40 ${
                        isHovered || isSelected ? 'scale-110 shadow-amber-500/30' : 'scale-100'
                      }`}
                    >
                      <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px] font-extrabold text-white">Hatti Kappi</span>
                      <span className="text-slate-600 text-[10px]">·</span>
                      {isNew ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          New
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-400 font-mono">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{Number(ratingData.average).toFixed(1)}</span>
                          <span className="text-[9px] text-slate-400 font-normal">({ratingData.count})</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Marker Body - Distinctive Artisan Amber Coffee Badge */}
                  <div
                    className={`relative flex items-center justify-center rounded-full transition-all duration-200 shadow-2xl ${
                      isSelected
                        ? 'w-10 h-10 bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-800 ring-4 ring-amber-300 text-white scale-125 z-30 shadow-amber-600/50'
                        : isHovered
                        ? 'w-9 h-9 bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-800 ring-2 ring-amber-300 text-white scale-115 z-20 shadow-amber-600/40'
                        : 'w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-600 to-yellow-800 text-amber-100 border-2 border-amber-300/80 hover:scale-120 shadow-md shadow-amber-900/40'
                    }`}
                    title="Hatti Kappi - Authentic Traditional Filter Kaapi & Tiffin (PU-CAFE-D-BLOCK)"
                  >
                    <Coffee className={`${isSelected ? 'w-5 h-5 text-amber-200' : 'w-4 h-4 text-amber-200'}`} />
                  </div>
                </div>
              );
            }

            // Smart Level-of-Detail (LOD): De-clutter dense academic & administrative blocks in overview mode
            const isAcademic = feat.category === 'Academic' || feat.category === 'Administrative';
            const isCompactLOD = isAcademic && scale < 1.4 && !isSelected && !isHovered;

            return (
              <div
                key={feat.featureId}
                style={{
                  left: `${feat.normalizedX * 100}%`,
                  top: `${feat.normalizedY * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectFeature(feat);
                }}
                onMouseEnter={() => setHoveredFeature(feat)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="absolute z-25 interactive-map-marker cursor-pointer group pointer-events-auto"
              >
                {/* Pulsing ring when selected */}
                {isSelected && (
                  <span className={`absolute -inset-3.5 rounded-full animate-ping opacity-80 ${style.bg}`} />
                )}

                {/* Marker Body: Sleek glowing micro-dot in overview mode, full interactive badge when zoomed/hovered */}
                {isCompactLOD ? (
                  <div
                    className="relative w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white/80 shadow-sm shadow-amber-500/60 group-hover:scale-150 transition-all duration-150"
                    title={feat.featureName}
                  />
                ) : (
                  <div
                    className={`relative flex items-center justify-center rounded-full transition-all duration-200 shadow-2xl ${
                      isSelected
                        ? `w-9 h-9 ${style.bg} ring-4 ring-white text-white scale-125 z-30 shadow-2xl`
                        : isHovered
                        ? `w-8 h-8 ${style.bg} ring-2 ring-white text-white scale-115 z-20`
                        : `w-6 h-6 sm:w-7 sm:h-7 ${style.bg} text-white border-2 border-white hover:scale-120`
                    }`}
                    title={feat.featureName}
                  >
                    <Icon className={`${isSelected ? 'w-4.5 h-4.5' : 'w-3.5 h-3.5'}`} />
                  </div>
                )}

                {/* Permanent subtle name tag when zoomed in close */}
                {scale >= 1.6 && !isHovered && !isSelected && !isCompactLOD && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-[9px] font-bold text-white border border-slate-700 pointer-events-none whitespace-nowrap shadow-md">
                    {feat.code || feat.featureName}
                  </div>
                )}

                {/* Hover / Selected Detail Pill */}
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl whitespace-nowrap pointer-events-none transition-all duration-200 z-30 ${
                    isHovered || isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-1'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                    <span>{feat.featureName}</span>
                    {feat.code && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${style.badge}`}>
                        {feat.code}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {feat.category} · Click to open details &amp; indoor navigation
                  </div>
                </div>
              </div>
            );
          })}

          {/* User GPS Live Location Pin */}
          {userLocation && (
            <div
              style={{
                left: '56.95%',
                top: '24.49%',
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute z-30 pointer-events-none"
            >
              <div className="w-5 h-5 rounded-full bg-sky-500 ring-4 ring-sky-300/40 animate-pulse flex items-center justify-center shadow-lg shadow-sky-500/50">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 6. RIGHT FLOATING GOOGLE MAPS & COMPASS CONTROLS BOX              */}
      {/* ================================================================= */}
      <div className="absolute right-4 bottom-24 z-40 flex flex-col items-center gap-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl no-dblclick">
        {/* Interactive Calibrated Compass Rose (Always points North, Click to Align North) */}
        <button
          onClick={handleResetNorth}
          className="relative w-11 h-11 rounded-2xl bg-slate-950/90 border border-slate-700 hover:border-emerald-500/80 shadow-inner flex items-center justify-center group transition-all hover:scale-105 active:scale-95"
          title={`Heading: ${Math.round((rotation % 360 + 360) % 360)}° · Click to Align True North`}
        >
          {/* Compass Dial Rotating Counter to Map */}
          <div
            style={{ transform: `rotate(${-rotation}deg)` }}
            className="relative w-7 h-7 flex items-center justify-center transition-transform duration-100 ease-out pointer-events-none"
          >
            {/* North Red Needle */}
            <div className="absolute top-0 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[12px] border-b-rose-500 filter drop-shadow-[0_1px_2px_rgba(244,63,94,0.7)]" />
            {/* South Silver Needle */}
            <div className="absolute bottom-0 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[12px] border-t-slate-400" />
            {/* Pivot Center Pin */}
            <div className="w-1.5 h-1.5 rounded-full bg-white ring-1 ring-slate-800 z-10 shadow" />
            {/* North Letter */}
            <span className="absolute -top-1.5 text-[7px] font-black text-rose-400 font-mono">N</span>
          </div>
          {/* Degree badge if rotated */}
          {Math.round((rotation % 360 + 360) % 360) !== 0 && (
            <span className="absolute -bottom-1 px-1 py-0.2 rounded-full bg-rose-600 text-white text-[7px] font-mono font-bold shadow-md">
              {Math.round((rotation % 360 + 360) % 360)}°
            </span>
          )}
        </button>

        {/* Quick Rotate Left & Right Buttons */}
        <div className="flex items-center gap-1 w-full justify-center">
          <button
            onClick={handleRotateLeft}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110 active:scale-95"
            title="Rotate Left 15° (↺)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
          </button>
          <button
            onClick={handleRotateRight}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110 active:scale-95"
            title="Rotate Right 15° (↻)"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>

        <div className="h-px w-8 bg-slate-800" />

        {/* Directions / Wayfinding Route Planner */}
        <button
          onClick={() => onOpenRoutePlanning && onOpenRoutePlanning()}
          className="p-2.5 rounded-xl text-sky-400 hover:text-sky-300 hover:bg-sky-500/20 transition-all hover:scale-110 active:scale-95 font-bold"
          title="Campus Wayfinding: Navigate between any two places"
        >
          <Navigation className="w-4 h-4" />
        </button>

        <div className="h-px w-8 bg-slate-800" />

        {/* 1. Zoom In */}
        <button
          onClick={handleZoomIn}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110 active:scale-95"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4 text-sky-400" />
        </button>

        {/* 2. Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110 active:scale-95"
          title="Zoom Out (−)"
        >
          <ZoomOut className="w-4 h-4 text-sky-400" />
        </button>

        <div className="h-px w-8 bg-slate-800" />

        {/* 3. Fit Entire Campus Overview */}
        <button
          onClick={handleFitCampus}
          className="p-2.5 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-all hover:scale-110 active:scale-95 font-bold"
          title="Fit Entire Campus (Show All Facilities)"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* 4. Fit Width / Wide View */}
        <button
          onClick={handleFitWidth}
          className="p-2.5 rounded-xl text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 transition-all hover:scale-110 active:scale-95 font-bold"
          title="Wide View (Fill Width & Eliminate Side Gaps)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* 5. Focus Academic Quad */}
        <button
          onClick={handleFocusQuad}
          className="p-2.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 transition-all hover:scale-110 active:scale-95 font-bold"
          title="Focus Academic Quad (D-E-F-L Blocks)"
        >
          <Building2 className="w-4 h-4" />
        </button>

        {/* 6. Focus Selected Building */}
        <button
          onClick={handleFocusSelected}
          disabled={!activeSelected}
          className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${
            activeSelected
              ? 'text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 cursor-pointer'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Focus Selected Building"
        >
          <Target className="w-4 h-4" />
        </button>

        {/* 7. Reset View & Heading */}
        <button
          onClick={handleResetView}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110 active:scale-95"
          title="Reset View & Heading (Default)"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="h-px w-8 bg-slate-800" />

        {/* 8. Full Screen */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 transition-all hover:scale-110 active:scale-95"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Gesture Helper Tip */}
      <div className="absolute bottom-4 right-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-400 text-[10px] pointer-events-none z-30 shadow-lg">
        <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
        <span>Right-Click or Shift+Drag to Rotate 360° · Shift+Scroll to Spin · Wheel to Zoom</span>
      </div>

      {/* ================================================================= */}
      {/* 7. BOTTOM DYNAMIC SELECTED FEATURE PREVIEW CARD                   */}
      {/* ================================================================= */}
      {activeSelected && (
        <div className="absolute bottom-4 left-4 right-20 sm:right-auto sm:max-w-md z-40 bg-[#0e1730]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              activeSelected.code === 'PU-CAFE-D-BLOCK'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            }`}>
              {activeSelected.code === 'PU-CAFE-D-BLOCK' ? (
                <Coffee className="w-5 h-5 text-amber-400" />
              ) : (
                <Building2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">
                  {activeSelected.featureName}
                </span>
                {activeSelected.code && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    activeSelected.code === 'PU-CAFE-D-BLOCK'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  }`}>
                    {activeSelected.code}
                  </span>
                )}
                {activeSelected.code === 'PU-CAFE-D-BLOCK' && (
                  (hattiKappiCafe?.rating?.isNew || !hattiKappiCafe?.rating?.count) ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      New
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-400 font-mono">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{Number(hattiKappiCafe?.rating?.average || 0).toFixed(1)}</span>
                    </span>
                  )
                )}
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1">
                {activeSelected.description || `${activeSelected.category} at Presidency University`}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Route To Here Trigger */}
            <button
              onClick={() => onOpenRoutePlanning && onOpenRoutePlanning(null, activeSelected.buildingId || activeSelected.featureId || activeSelected.code)}
              className="py-2 px-2.5 bg-slate-850 hover:bg-sky-600/90 text-sky-300 hover:text-white border border-slate-700 hover:border-sky-400 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105 flex items-center gap-1"
              title="Navigate to this location"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Route</span>
            </button>

            {activeSelected.code === 'PU-CAFE-D-BLOCK' ? (
              <button
                onClick={() => {
                  if (onOpenCafe) {
                    onOpenCafe({
                      _id: hattiKappiCafe?._id || 'PU-CAFE-D-BLOCK',
                      shortCode: 'PU-CAFE-D-BLOCK',
                      name: 'Hatti Kappi'
                    });
                  }
                }}
                className="py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-1.5"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>View Cafe</span>
              </button>
            ) : (
              <button
                onClick={() => handleSelectFeature(activeSelected)}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105 shrink-0 flex items-center gap-1.5"
              >
                <span>Open</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
