import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Compass,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Navigation as NavigationIcon,
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
import {
  MASTER_CAMPUS_FEATURES,
  WALKING_ROUTE_MAIN_TO_D_CENTERLINE,
  WALKING_ROUTE_D_TO_E_CENTERLINE
} from '../data/masterMapFeatures.js';
import { fetchCafes } from '../services/api';
import { MAIN_GATE_TO_D_BLOCK_KML } from '../demo/mainGateToDBlockData.js';

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
    case 'Pathway':
    case 'Route': return Footprints;
    case 'Cafe': return Coffee;
    case 'Library': return BookOpen;
    case 'Medical': return HeartPulse;
    case 'Security': return Shield;
    case 'Transport': return NavigationIcon;
    default: return MapPin;
  }
};

// Category badge color helper
const getCategoryStyle = (category) => {
  switch (category) {
    case 'Pathway':
    case 'Route':
      return {
        bg: 'bg-orange-600',
        ring: 'ring-orange-400',
        text: 'text-orange-300',
        stroke: '#c2410c',
        fill: 'rgba(249, 115, 22, 0.70)',
        badge: 'bg-orange-500/20 border-orange-500/30'
      };
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

// Verified multi-block room suggestions across D, E, F, L, N, and M blocks
const CAMPUS_ROOM_SUGGESTIONS = [
  // D Block (All Labs: DGL01.., DFL01.., DSL01..)
  { roomNumber: 'DGL01', name: 'Engineering Mechanics Lab', block: 'D Block', floor: 0, floorName: 'Ground Floor', type: 'Laboratory', buildingId: 'bld_d_block' },
  { roomNumber: 'DGL02', name: 'Robotics & Automation Studio', block: 'D Block', floor: 0, floorName: 'Ground Floor', type: 'Laboratory', buildingId: 'bld_d_block' },
  { roomNumber: 'DGL03', name: 'Materials Testing Lab', block: 'D Block', floor: 0, floorName: 'Ground Floor', type: 'Laboratory', buildingId: 'bld_d_block' },
  { roomNumber: 'DGL04', name: 'Fluid Mechanics & Hydraulics Lab', block: 'D Block', floor: 0, floorName: 'Ground Floor', type: 'Laboratory', buildingId: 'bld_d_block' },
  { roomNumber: 'DFL01', name: 'Thermodynamics & Heat Transfer Lab', block: 'D Block', floor: 1, floorName: 'First Floor', type: 'Laboratory', buildingId: 'bld_d_block' },
  { roomNumber: 'DFL02', name: 'Mechatronics Systems Lab', block: 'D Block', floor: 1, floorName: 'First Floor', type: 'Laboratory', buildingId: 'bld_d_block' },
  { roomNumber: 'DSL01', name: 'Structural Analysis Lab', block: 'D Block', floor: 2, floorName: 'Second Floor', type: 'Laboratory', buildingId: 'bld_d_block' },

  // E Block (All Classrooms: EG01.., EF01.., ES01..)
  { roomNumber: 'EG01', name: 'Computer Science Lecture Classroom 01', block: 'E Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_e_block' },
  { roomNumber: 'EG02', name: 'Data Structures & Algorithms Classroom 02', block: 'E Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_e_block' },
  { roomNumber: 'EG03', name: 'Operating Systems Classroom 03', block: 'E Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_e_block' },
  { roomNumber: 'EG04', name: 'Software Engineering Classroom 04', block: 'E Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_e_block' },
  { roomNumber: 'EF01', name: 'Artificial Intelligence Classroom 101', block: 'E Block', floor: 1, floorName: 'First Floor', type: 'Classroom', buildingId: 'bld_e_block' },
  { roomNumber: 'EF02', name: 'Machine Learning Classroom 102', block: 'E Block', floor: 1, floorName: 'First Floor', type: 'Classroom', buildingId: 'bld_e_block' },
  { roomNumber: 'ES01', name: 'Computer Vision Classroom 201', block: 'E Block', floor: 2, floorName: 'Second Floor', type: 'Classroom', buildingId: 'bld_e_block' },
  { roomNumber: 'ES02', name: 'Distributed Systems Classroom 202', block: 'E Block', floor: 2, floorName: 'Second Floor', type: 'Classroom', buildingId: 'bld_e_block' },

  // F Block (All Classrooms: FG01.., FF01.., FS01..)
  { roomNumber: 'FG01', name: 'Information Systems Classroom 01', block: 'F Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_f_block' },
  { roomNumber: 'FG02', name: 'Object Oriented Programming Classroom 02', block: 'F Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_f_block' },
  { roomNumber: 'FG03', name: 'Discrete Mathematics Classroom 03', block: 'F Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_f_block' },
  { roomNumber: 'FF01', name: 'Information Security Classroom 101', block: 'F Block', floor: 1, floorName: 'First Floor', type: 'Classroom', buildingId: 'bld_f_block' },
  { roomNumber: 'FS01', name: 'Blockchain Technology Classroom 201', block: 'F Block', floor: 2, floorName: 'Second Floor', type: 'Classroom', buildingId: 'bld_f_block' },

  // L Block (All Classrooms: LG01.., LF01.., LS01..)
  { roomNumber: 'LG01', name: 'Foundation Engineering Classroom 01', block: 'L Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_l_block' },
  { roomNumber: 'LG02', name: 'Applied Physics Lecture Classroom 02', block: 'L Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_l_block' },
  { roomNumber: 'LF01', name: 'Differential Equations Classroom 101', block: 'L Block', floor: 1, floorName: 'First Floor', type: 'Classroom', buildingId: 'bld_l_block' },
  { roomNumber: 'LS01', name: 'Complex Analysis Classroom 201', block: 'L Block', floor: 2, floorName: 'Second Floor', type: 'Classroom', buildingId: 'bld_l_block' },

  // N Block (All Classrooms: NG01.., NF01.., NS01..)
  { roomNumber: 'NG01', name: 'Jurisprudence & Legal Theory Classroom 01', block: 'N Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_n_block' },
  { roomNumber: 'NG02', name: 'Constitutional Law Classroom 02', block: 'N Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_n_block' },
  { roomNumber: 'NF01', name: 'Criminal Law Classroom 101', block: 'N Block', floor: 1, floorName: 'First Floor', type: 'Classroom', buildingId: 'bld_n_block' },
  { roomNumber: 'NS01', name: 'Cyber Law & IT Act Classroom 201', block: 'N Block', floor: 2, floorName: 'Second Floor', type: 'Classroom', buildingId: 'bld_n_block' },

  // M Block (All Classrooms: MG01.., MF01.., MS01..)
  { roomNumber: 'MG01', name: 'Principles of Management Classroom 01', block: 'M Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_som_block' },
  { roomNumber: 'MG02', name: 'Financial Accounting Classroom 02', block: 'M Block', floor: 0, floorName: 'Ground Floor', type: 'Classroom', buildingId: 'bld_som_block' },
  { roomNumber: 'MF01', name: 'Corporate Finance Classroom 101', block: 'M Block', floor: 1, floorName: 'First Floor', type: 'Classroom', buildingId: 'bld_som_block' },
  { roomNumber: 'MS01', name: 'Investment Banking Classroom 201', block: 'M Block', floor: 2, floorName: 'Second Floor', type: 'Classroom', buildingId: 'bld_som_block' }
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
  language = 'en',
  isModalOpen = false,
  kmlOverlays = null
}) {
  const containerRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  // Pan, Zoom & Orientation state:
  // Always maintain 0° True-North upright orientation so all text, logos, legend and compass are perfectly horizontal and readable
  const [rotation, setRotation] = useState(0);

  const [scale, setScale] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const baseW = h * MAP_ASPECT_RATIO;
      // Expand across screen width so the map occupies 100% of the screen with zero side gaps
      return Math.max(1.4, (w * 1.04) / baseW);
    }
    return 2.5;
  });

  const [position, setPosition] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const baseW = h * MAP_ASPECT_RATIO;
      const initScale = Math.max(1.4, (w * 1.04) / baseW);
      // Center on campus heart (Academic Quad, Central Fountain & Hatti Kaapi)
      return {
        x: -(0.42 - 0.5) * baseW * initScale,
        y: -(0.58 - 0.5) * h * initScale
      };
    }
    return { x: 0, y: 0 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotateStartAngle, setRotateStartAngle] = useState(0);
  const [initialRotation, setInitialRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [localSelectedFeature, setLocalSelectedFeature] = useState(null);

  // Dynamic Multi-Resolution Base Map Loading (Switches to Ultra-HD 4K at high zoom)
  const baseMapSrc = useMemo(() => {
    if (scale >= 2.0) return '/maps/presidency-campus-master-map-hd.png';
    if (scale >= 1.25) return '/maps/presidency-campus-master-map-2x.png';
    return '/maps/presidency-campus-master-map.png';
  }, [scale]);

  // Preload higher-resolution map tiers in the background for zero-latency zoom transitions
  useEffect(() => {
    const preloads = [
      '/maps/presidency-campus-master-map-2x.png',
      '/maps/presidency-campus-master-map-hd.png'
    ];
    preloads.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Dynamic Cafe Ratings & Reviews from MongoDB
  const [liveCafes, setLiveCafes] = useState(() => (Array.isArray(cafes) && cafes.length > 0 ? cafes : []));
  useEffect(() => {
    if (Array.isArray(cafes) && cafes.length > 0) {
      setLiveCafes(cafes);
      return;
    }
    let isMounted = true;
    fetchCafes().then(data => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setLiveCafes(data);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [cafes?.length]);

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
      const target = activeCategory.toLowerCase();
      list = list.filter(f => {
        const c = (f.category || '').toLowerCase();
        if (target === 'academic') return c === 'academic' || c === 'administrative';
        if (target === 'cafe') return c === 'cafe' || c === 'food' || c === 'dining';
        if (target === 'garden') return c === 'garden' || c === 'outdoor' || c === 'lawn';
        return c === target;
      });
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

    const matchedRooms = CAMPUS_ROOM_SUGGESTIONS
      .filter(r =>
        r.roomNumber.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.block.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map(r => ({
        type: 'room',
        id: r.roomNumber,
        title: `${r.roomNumber} – ${r.name}`,
        subtitle: `${r.block} · ${r.floorName} ${r.type}`,
        item: r
      }));

    return [...matchedRooms, ...matchedFeatures];
  }, [localSearch, allCampusFeatures]);

  // Active Selected item (either from prop or local selection)
  const activeSelected = useMemo(() => {
    if (localSelectedFeature) return localSelectedFeature;
    if (selectedMarker) {
      const match = allCampusFeatures.find(f =>
        f.featureId === selectedMarker.markerId ||
        f.buildingId === selectedMarker.buildingId ||
        f.featureName === selectedMarker.name ||
        f.code === selectedMarker.shortCode
      );
      if (match) return match;
    }
    return null;
  }, [selectedMarker, localSelectedFeature, allCampusFeatures]);

  // Map Active Route sequence to normalized coordinates on official campus map
  const mapRoutePoints = useMemo(() => {
    if (!activeRoute) return [];

    // Special Check: If active route is between Main Gate and D Block, use exact surveyed pathway corridor centerline
    const isMainGateStart = activeRoute.startLocationId === 'node_main_gate' ||
      activeRoute.startNodeId === 'node_main_gate' ||
      activeRoute.startLocation?.locationId === 'loc_main_gate' ||
      (activeRoute.startLocation?.name && /main gate/i.test(activeRoute.startLocation.name));
    const isDBlockEnd = activeRoute.endLocationId === 'node_d_block_ent' ||
      activeRoute.endLocationId === 'bld_d_block' ||
      activeRoute.endNodeId === 'node_d_block_ent' ||
      activeRoute.endLocation?.locationId === 'loc_d_block' ||
      activeRoute.endLocation?.buildingId === 'bld_d_block' ||
      (activeRoute.endLocation?.name && /d block/i.test(activeRoute.endLocation.name));

    if (isMainGateStart && isDBlockEnd) {
      return WALKING_ROUTE_MAIN_TO_D_CENTERLINE;
    }
    const isDBlockStart = activeRoute.startLocationId === 'node_d_block_ent' ||
      activeRoute.startLocationId === 'bld_d_block' ||
      activeRoute.startNodeId === 'node_d_block_ent' ||
      (activeRoute.startLocation?.name && /d block/i.test(activeRoute.startLocation.name));
    const isMainGateEnd = activeRoute.endLocationId === 'node_main_gate' ||
      activeRoute.endNodeId === 'node_main_gate' ||
      (activeRoute.endLocation?.name && /main gate/i.test(activeRoute.endLocation.name));
    if (isDBlockStart && isMainGateEnd) {
      return [...WALKING_ROUTE_MAIN_TO_D_CENTERLINE].reverse();
    }

    // Special Check: If active route is between D Block and E Block
    const isEBlockEnd = activeRoute.endLocationId === 'node_e_block_ent' ||
      activeRoute.endLocationId === 'bld_e_block' ||
      activeRoute.endNodeId === 'node_e_block_ent' ||
      activeRoute.endLocation?.locationId === 'loc_e_block' ||
      activeRoute.endLocation?.buildingId === 'bld_e_block' ||
      (activeRoute.endLocation?.name && /e block/i.test(activeRoute.endLocation.name));

    if (isDBlockStart && isEBlockEnd) {
      return WALKING_ROUTE_D_TO_E_CENTERLINE;
    }

    const isEBlockStart = activeRoute.startLocationId === 'node_e_block_ent' ||
      activeRoute.startLocationId === 'bld_e_block' ||
      activeRoute.startNodeId === 'node_e_block_ent' ||
      (activeRoute.startLocation?.name && /e block/i.test(activeRoute.startLocation.name));

    if (isEBlockStart && isDBlockEnd) {
      return [...WALKING_ROUTE_D_TO_E_CENTERLINE].reverse();
    }

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

  // Helper to compute pointer angle around container center for silky smooth rotation
  const getAngleFromEvent = useCallback((e) => {
    const container = containerRef.current;
    if (!container) return 0;
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
  }, []);

  // Pan Boundary Clamping Engine: Keeps campus map filling the screen with no empty voids
  const clampPosition = useCallback((pos, curScale) => {
    if (!containerRef.current) return pos;
    const containerW = containerRef.current.clientWidth || window.innerWidth;
    const containerH = containerRef.current.clientHeight || window.innerHeight;
    const baseH = containerH;
    const baseW = containerH * MAP_ASPECT_RATIO;

    const curW = baseW * curScale;
    const curH = baseH * curScale;

    // Allowed pan boundaries so the map always covers the screen with smooth elasticity
    const maxPanX = Math.max(0, (curW - containerW) / 2 + 80);
    const maxPanY = Math.max(0, (curH - containerH) / 2 + 100);

    return {
      x: Math.min(Math.max(pos.x, -maxPanX), maxPanX),
      y: Math.min(Math.max(pos.y, -maxPanY), maxPanY)
    };
  }, []);

  // Universal Coordinate Centering Helper (Mathematically exact 0° aspect ratio centering with headroom for header)
  const focusCoordinate = useCallback((nx, ny, reqScale = null) => {
    if (!containerRef.current) return;
    const containerW = containerRef.current.clientWidth || window.innerWidth;
    const containerH = containerRef.current.clientHeight || window.innerHeight;
    const baseH = containerH;
    const baseW = containerH * MAP_ASPECT_RATIO;
    const minScale = Math.max(1.4, (containerW * 1.0) / baseW);
    const targetScale = reqScale ? Math.max(reqScale, minScale) : Math.max(2.4, minScale);

    // Headroom offset: shifts targetY down by 70px so the focused place sits in the open map area below the header
    const targetX = -(nx - 0.5) * baseW * targetScale;
    const targetY = -(ny - 0.5) * baseH * targetScale + 70;
    const clampedPos = clampPosition({ x: targetX, y: targetY }, targetScale);

    setScale(targetScale);
    setPosition(clampedPos);
    setRotation(0);
  }, [clampPosition]);

  // Universal Viewport Fitting Engine (0° Upright True-North Orientation)
  const fitViewport = useCallback((mode = 'wide') => {
    if (!containerRef.current) return;
    const containerW = containerRef.current.clientWidth || window.innerWidth;
    const containerH = containerRef.current.clientHeight || window.innerHeight;
    const baseH = containerH;
    const baseW = containerH * MAP_ASPECT_RATIO;

    let targetScale;
    let targetPos = { x: 0, y: 0 };

    if (mode === 'fit') {
      // Smart Fit Campus: Fill screen width so campus spans the entire viewport without empty side gaps
      targetScale = Math.max(1.4, (containerW * 1.0) / baseW);
      targetPos = {
        x: -(0.45 - 0.5) * baseW * targetScale,
        y: -(0.58 - 0.5) * baseH * targetScale
      };
    } else {
      // 'wide' mode: expand across width to eliminate side gaps, centered on central campus heart
      targetScale = Math.max(1.5, (containerW * 1.04) / baseW);
      targetPos = {
        x: -(0.42 - 0.5) * baseW * targetScale,
        y: -(0.58 - 0.5) * baseH * targetScale
      };
    }

    const clampedPos = clampPosition(targetPos, targetScale);
    setScale(Math.round(targetScale * 1000) / 1000);
    setPosition(clampedPos);
    setRotation(0);
  }, [clampPosition]);

  // Programmatic Viewport Fit for KML Demo targets
  useEffect(() => {
    if (!kmlOverlays?.fitTarget) return;
    if (kmlOverlays.fitTarget === 'main_lawn') {
      focusCoordinate(0.585, 0.420, 2.2);
    } else if (kmlOverlays.fitTarget === 'main_gate_to_d_block') {
      focusCoordinate(0.420, 0.500, 1.8);
    } else if (kmlOverlays.fitTarget === 'all') {
      focusCoordinate(0.480, 0.460, 1.55);
    } else if (kmlOverlays.fitTarget === 'reset') {
      fitViewport('wide');
    }
  }, [kmlOverlays?.fitTarget, kmlOverlays?.fitKey, focusCoordinate, fitViewport]);

  // Quick preset navigation helpers
  const handleResetNorth = useCallback(() => {
    fitViewport('wide');
  }, [fitViewport]);

  const handleWideScreen = useCallback(() => {
    fitViewport('wide');
  }, [fitViewport]);

  const handleFitCampus = useCallback(() => {
    fitViewport('fit');
  }, [fitViewport]);

  const handleFocusMainGate = useCallback(() => {
    focusCoordinate(0.5695, 0.2449, 2.3);
  }, [focusCoordinate]);

  const handleFocusMyLocation = useCallback(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      focusCoordinate(0.5695, 0.2449, 2.3);
    } else {
      handleFocusMainGate();
    }
  }, [userLocation, handleFocusMainGate, focusCoordinate]);

  const handleFocusQuad = useCallback(() => {
    focusCoordinate(0.235, 0.72, 2.5);
  }, [focusCoordinate]);

  // Handle Feature Selection & Auto-Focus (Pops up place name directly above pin on map)
  const handleSelectFeature = useCallback((feature) => {
    setLocalSelectedFeature(feature);

    // Auto-center smoothly on selected feature
    if (containerRef.current) {
      focusCoordinate(feature.normalizedX, feature.normalizedY, Math.max(scale, 1.8));
    }
  }, [focusCoordinate, scale]);

  // Handle Walking Corridor Click
  const handleSelectWalkingArea = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const walkFeat = allCampusFeatures.find(f => f.featureId === 'feat_walking_corridor_main_to_d');
    if (walkFeat) {
      handleSelectFeature(walkFeat);
    }
  }, [allCampusFeatures, handleSelectFeature]);

  // Handle Autocomplete Suggestion Click
  const handleSuggestionClick = (suggestion) => {
    setIsSearchFocused(false);
    setLocalSearch('');

    if (suggestion.type === 'feature') {
      handleSelectFeature(suggestion.item);
    } else if (suggestion.type === 'room') {
      const bId = suggestion.item?.buildingId || 'bld_d_block';
      const targetBld = allCampusFeatures.find(f => f.featureId === bId || f.buildingId === bId || (suggestion.item.block && f.featureName.toLowerCase().includes(suggestion.item.block.toLowerCase()))) || allCampusFeatures.find(f => f.featureId === 'bld_d_block');
      if (targetBld) {
        handleSelectFeature(targetBld);
        if (onOpenIndoorMap) {
          onOpenIndoorMap({
            _id: targetBld.buildingId || targetBld.featureId,
            buildingId: targetBld.buildingId || targetBld.featureId,
            name: targetBld.featureName,
            shortCode: targetBld.code,
            totalFloors: targetBld.totalFloors || 3,
            hasIndoorMap: true,
            selectedFloor: suggestion.item.floor !== undefined ? suggestion.item.floor : 0,
            focusRoom: suggestion.item.roomNumber
          });
        }
      }
    }
  };

  // Focus Selected Building
  const handleFocusSelected = useCallback(() => {
    if (!activeSelected) return;
    focusCoordinate(activeSelected.normalizedX, activeSelected.normalizedY, 2.5);
  }, [activeSelected, focusCoordinate]);

  // 1. Zoom In (Smooth 25% step)
  const handleZoomIn = () => {
    setScale(prev => {
      const next = Math.min(prev * 1.25, 5.5);
      setPosition(pos => clampPosition(pos, next));
      return next;
    });
  };

  // 2. Zoom Out (Clamped so the map never shrinks smaller than the viewport width)
  const handleZoomOut = () => {
    setScale(prev => {
      const containerW = containerRef.current?.clientWidth || window.innerWidth;
      const containerH = containerRef.current?.clientHeight || window.innerHeight;
      const baseW = containerH * MAP_ASPECT_RATIO;
      const minScale = Math.max(1.2, (containerW * 0.98) / baseW);
      const next = Math.max(prev / 1.25, minScale);
      setPosition(pos => clampPosition(pos, next));
      return next;
    });
  };

  // 3. Rotate Left (-15° step)
  const handleRotateLeft = () => {
    setRotation(prev => (Math.round((prev - 15) / 15) * 15 + 360) % 360);
  };

  // 4. Rotate Right (+15° step)
  const handleRotateRight = () => {
    setRotation(prev => (Math.round((prev + 15) / 15) * 15) % 360);
  };

  // Auto-focus selected building / location when clicked or selected from search
  useEffect(() => {
    if (activeSelected && activeSelected.normalizedX != null && activeSelected.normalizedY != null) {
      handleFocusSelected();
    }
  }, [activeSelected?.featureId, handleFocusSelected]);

  // 8. Reset All (Default Expansive View)
  const handleResetView = () => {
    fitViewport('wide');
  };

  // Initial Map Focus: Automatically expand across screen on load & on resize
  useEffect(() => {
    const timer = setTimeout(() => {
      fitViewport('wide');
    }, 60);
    const handleResize = () => {
      fitViewport('wide');
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [fitViewport]);

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
    // 0. If a modal is open, or pointer is over any UI overlay/drawer/panel, ignore wheel zoom
    if (isModalOpen) return;
    const isOverlay = e.target.closest(
      'button, input, select, textarea, aside, dialog, [role="dialog"], [data-panel], [data-prevent-map-zoom], .interactive-overlay, .no-map-zoom, .overscroll-contain, .isolate-scroll, .modal-content, .overflow-y-auto, .overflow-x-auto, .custom-scrollbar'
    );
    if (isOverlay) return;

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
      const containerW = containerRef.current?.clientWidth || window.innerWidth;
      const containerH = containerRef.current?.clientHeight || window.innerHeight;
      const baseW = containerH * MAP_ASPECT_RATIO;
      const minScale = Math.max(1.2, (containerW * 0.98) / baseW);
      const newScale = Math.min(Math.max(prevScale * factor, minScale), 5.5);
      const ratio = newScale / prevScale;

      setPosition(prevPos => {
        const nextPos = {
          x: mouseX - (mouseX - prevPos.x) * ratio,
          y: mouseY - (mouseY - prevPos.y) * ratio
        };
        return clampPosition(nextPos, newScale);
      });

      return newScale;
    });
  };

  // Double click to zoom in at mouse position
  const handleDoubleClick = (e) => {
    if (isModalOpen) return;
    if (e.target.closest('.no-dblclick') || e.target.closest('button, input, select, textarea, aside, dialog, [role="dialog"], [data-panel], [data-prevent-map-zoom], .overscroll-contain, .isolate-scroll')) return;
    setScale(prev => {
      const next = Math.min(prev + 0.5, 5.0);
      setPosition(pos => clampPosition(pos, next));
      return next;
    });
  };

  // Drag & Rotate Mouse handlers
  const handleMouseDown = (e) => {
    if (isModalOpen) return;
    if (
      e.target.closest('.interactive-map-marker') ||
      e.target.closest('.interactive-polygon') ||
      e.target.closest('.no-drag') ||
      e.target.closest('button, input, select, textarea, aside, dialog, [role="dialog"], [data-panel], [data-prevent-map-zoom], .overscroll-contain, .isolate-scroll')
    ) return;

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
      const nextPos = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setPosition(clampPosition(nextPos, scale));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsRotating(false);
  };

  // Touch handlers: 1 finger pan, 2 fingers pinch & twist-to-rotate
  const touchStateRef = useRef({ dist: 0, angle: 0 });

  const handleTouchStart = (e) => {
    if (isModalOpen) return;
    if (
      e.target.closest('button, input, select, textarea, aside, dialog, [role="dialog"], [data-panel], [data-prevent-map-zoom], .interactive-overlay, .no-map-zoom, .overscroll-contain, .isolate-scroll, .modal-content')
    ) return;

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
    if (isModalOpen) return;
    if (
      e.target.closest('button, input, select, textarea, aside, dialog, [role="dialog"], [data-panel], [data-prevent-map-zoom], .interactive-overlay, .no-map-zoom, .overscroll-contain, .isolate-scroll, .modal-content')
    ) return;

    if (e.touches.length === 1 && isDragging) {
      const nextPos = {
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      };
      setPosition(clampPosition(nextPos, scale));
    } else if (e.touches.length === 2 && touchStateRef.current.dist > 0) {
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

      const containerW = containerRef.current?.clientWidth || window.innerWidth;
      const containerH = containerRef.current?.clientHeight || window.innerHeight;
      const baseW = containerH * MAP_ASPECT_RATIO;
      const minScale = Math.max(1.2, (containerW * 0.98) / baseW);

      setScale(prev => {
        const next = Math.min(Math.max(prev + diffDist * 0.005, minScale), 5.5);
        setPosition(pos => clampPosition(pos, next));
        return next;
      });
      setRotation(prev => (prev + diffAngle + 360) % 360);

      touchStateRef.current = { dist, angle };
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Admin Click Handler & Map Background Click Handler (Dismisses popup on empty map click)
  const handleMapImageClick = (e) => {
    if (isAdminEditorActive && onAdminClickMap) {
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
      return;
    }

    // Clicking anywhere on the empty map canvas deselects and closes any open place name popup
    setLocalSelectedFeature(null);
    if (onSelectMarker) {
      onSelectMarker(null);
    }
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
      className={`relative w-full h-full overflow-hidden select-none bg-[#f8fafc] flex items-center justify-center ${
        isRotating ? 'cursor-alias' : isDragging ? 'cursor-grabbing' : isAdminEditorActive ? 'cursor-crosshair' : 'cursor-grab'
      }`}
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(rgba(203, 213, 225, 0.45) 1.2px, transparent 1.2px)',
        backgroundSize: '32px 32px'
      }}
    >
      {/* Floating Quick Navigation Preset Pills (Positioned cleanly below main floating header) */}
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="absolute top-[68px] sm:top-[74px] left-3 sm:left-4 z-30 pointer-events-auto flex items-center gap-1.5 p-1 bg-white/95 dark:bg-[#202124]/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/80 rounded-2xl shadow-gmap-floating text-xs font-bold overflow-x-auto max-w-[calc(100vw-24px)] no-scrollbar touch-pan-x"
      >
        <button
          type="button"
          onClick={handleWideScreen}
          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
          title="Maximize usable map space across screen (Wide View)"
        >
          <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Wide View</span>
        </button>
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 shrink-0" />
        <button
          type="button"
          onClick={handleFitCampus}
          className="px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors flex items-center gap-1.5 shrink-0"
          title="Fit complete campus into viewport"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fit Campus</span>
        </button>
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 shrink-0" />
        <button
          type="button"
          onClick={handleFocusQuad}
          className="px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-amber-600 transition-colors flex items-center gap-1.5 shrink-0"
          title="Focus Academic Quad & Hatti Kaapi"
        >
          <Building2 className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">Academic Quad</span>
          <span className="sm:hidden">Quad</span>
        </button>
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 shrink-0" />
        <button
          type="button"
          onClick={handleFocusMainGate}
          className="px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors flex items-center gap-1.5 shrink-0"
          title="Focus Main Gate Entrance"
        >
          <DoorOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Main Gate</span>
          <span className="sm:hidden">Gate</span>
        </button>
        {activeRoute && (
          <>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 shrink-0" />
            <button
              type="button"
              onClick={onClearRoute}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 font-bold transition-colors flex items-center gap-1 shrink-0"
              title="End Active Navigation Route"
            >
              <X className="w-3.5 h-3.5" />
              <span>End Route ✕</span>
            </button>
          </>
        )}
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
        {/* Master Campus Map Image Wrapper (Expanded to Full Height & Proportional Width) */}
        <div
          ref={imageWrapperRef}
          onClick={handleMapImageClick}
          style={{
            height: '100vh',
            maxHeight: '100vh',
            aspectRatio: `${MAP_ASPECT_RATIO}`
          }}
          className="relative bg-white shadow-none border-0 overflow-hidden select-none"
        >
          {/* Official Presidency University Master Campus Map Base Image (Multi-Resolution) */}
          <img
            src={baseMapSrc}
            alt="Official Presidency University Campus Master Map"
            style={{
              imageRendering: scale > 1.4 ? '-webkit-optimize-contrast' : 'auto'
            }}
            className="w-full h-full object-contain pointer-events-none block transition-opacity duration-200"
            onError={(e) => {
              if (!e.target.dataset.triedFallback) {
                e.target.dataset.triedFallback = 'true';
                e.target.src = '/maps/presidency-campus-master-map.png';
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
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
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

              // Render Polygons for Buildings, Green Zones, and Pathways
              if (feat.polygonCoordinates && feat.polygonCoordinates.length > 2) {
                const isPathway = feat.category === 'Pathway' || feat.category === 'Route';

                // HIDE route by default on normal map: only appear when user is actively navigating
                if (isPathway && !activeRoute) {
                  return null;
                }

                const isLawn = feat.featureId === 'feat_main_lawn' || feat.featureId === 'feat_dsa_lawn';

                const pointsStr = feat.polygonCoordinates
                  .map(([px, py]) => `${(px * 1000).toFixed(1)},${(py * 1422).toFixed(1)}`)
                  .join(' ');

                // Clean architectural map styling:
                // Polygons are transparent by default so the high-resolution illustrated map artwork & text remain 100% visible and unblocked.
                // When hovered or selected, they illuminate with crisp, elegant accents.
                const polyFill = isSelected
                  ? isPathway
                    ? 'rgba(249, 115, 22, 0.85)'
                    : 'rgba(37, 99, 235, 0.28)'
                  : isHovered
                  ? isPathway
                    ? 'rgba(251, 146, 60, 0.75)'
                    : 'rgba(56, 189, 248, 0.20)'
                  : isPathway
                  ? 'rgba(249, 115, 22, 0.70)'
                  : isLawn
                  ? 'rgba(34, 197, 94, 0.22)'
                  : 'rgba(0, 0, 0, 0.001)'; // Invisible hit area for crisp overview

                const polyStroke = isSelected
                  ? isPathway
                    ? '#ea580c'
                    : '#2563eb'
                  : isHovered
                  ? isPathway
                    ? '#f97316'
                    : '#0284c7'
                  : isPathway
                  ? '#c2410c'
                  : isLawn
                  ? '#16a34a'
                  : 'transparent';

                const polyStrokeWidth = isSelected ? '3.5' : isHovered ? '2.5' : isLawn || isPathway ? '1.8' : '0';

                return (
                  <polygon
                    key={feat.featureId}
                    points={pointsStr}
                    fill={polyFill}
                    stroke={polyStroke}
                    strokeWidth={polyStrokeWidth}
                    strokeDasharray={isSelected ? 'none' : isHovered ? '5 2.5' : 'none'}
                    className="interactive-polygon cursor-pointer transition-all duration-150"
                    style={{
                      filter: isSelected ? 'url(#polyGlow)' : 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFeature(feat);
                      const isAcademicBuilding = feat.category === 'Academic' || feat.hasIndoorMap;
                      if (isAcademicBuilding && onOpenBuildingPopup) {
                        onOpenBuildingPopup({
                          _id: feat.buildingId || feat.featureId,
                          buildingId: feat.buildingId || feat.featureId,
                          name: feat.featureName,
                          code: feat.code,
                          shortCode: feat.code,
                          category: feat.category,
                          totalFloors: feat.totalFloors || 3,
                          hasIndoorMap: feat.hasIndoorMap,
                          description: feat.description,
                          departments: feat.departments || []
                        });
                      }
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
                const isFountain = feat.featureId === 'feat_fountain';
                return (
                  <circle
                    key={feat.featureId}
                    cx={feat.normalizedX * 1000}
                    cy={feat.normalizedY * 1422}
                    r={feat.radius * 1000}
                    fill={
                      isSelected
                        ? 'rgba(6, 182, 212, 0.45)'
                        : isHovered
                        ? 'rgba(56, 189, 248, 0.35)'
                        : isFountain
                        ? 'rgba(6, 182, 212, 0.18)'
                        : 'rgba(0, 0, 0, 0.001)'
                    }
                    stroke={
                      isSelected
                        ? '#0891b2'
                        : isHovered
                        ? '#06b6d4'
                        : isFountain
                        ? '#0891b2'
                        : 'transparent'
                    }
                    strokeWidth={isSelected ? '3.5' : isHovered ? '2.5' : isFountain ? '1.5' : '0'}
                    className="interactive-polygon cursor-pointer transition-all duration-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFeature(feat);
                      const isAcademicBuilding = feat.category === 'Academic' || feat.hasIndoorMap;
                      if (isAcademicBuilding && onOpenBuildingPopup) {
                        onOpenBuildingPopup({
                          _id: feat.buildingId || feat.featureId,
                          buildingId: feat.buildingId || feat.featureId,
                          name: feat.featureName,
                          code: feat.code,
                          shortCode: feat.code,
                          category: feat.category,
                          totalFloors: feat.totalFloors || 3,
                          hasIndoorMap: feat.hasIndoorMap,
                          description: feat.description,
                          departments: feat.departments || []
                        });
                      }
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

            {/* KML DEMO GEOMETRIES OVERLAY (Active only in KML Demo modes) */}
            {kmlOverlays && (
              <g className="kml-demo-overlay-layer">
                {/* 1. Campus Boundary (Blue dashed outline) */}
                {kmlOverlays.showCampusBoundary && kmlOverlays.campusBoundaryPoints && (
                  <polygon
                    points={kmlOverlays.campusBoundaryPoints}
                    fill="rgba(56, 189, 248, 0.08)"
                    stroke="#0284c7"
                    strokeWidth="3.5"
                    strokeDasharray="8 5"
                    className="cursor-pointer transition-all hover:stroke-[#38bdf8]"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (kmlOverlays.onSelectPolygon) kmlOverlays.onSelectPolygon('campus_boundary');
                    }}
                  >
                    <title>Presidency University - Campus Boundary (24 GPS Nodes)</title>
                  </polygon>
                )}

                {/* 2. Main Lawn (Green transparent fill with clear green border) */}
                {kmlOverlays.showMainLawn && kmlOverlays.mainLawnPoints && (
                  <g>
                    <polygon
                      points={kmlOverlays.mainLawnPoints}
                      fill="rgba(34, 197, 94, 0.45)"
                      stroke="#15803d"
                      strokeWidth="3.5"
                      className="cursor-pointer transition-all hover:fill-[rgba(34,197,94,0.60)] hover:stroke-[#166534]"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (kmlOverlays.onSelectPolygon) kmlOverlays.onSelectPolygon('main_lawn');
                      }}
                    >
                      <title>Main Lawn (14 Surveyed GPS Nodes, 3.61 Acres)</title>
                    </polygon>
                    {/* Centered Main Lawn Label */}
                    <text
                      x={kmlOverlays.mainLawnCenter ? kmlOverlays.mainLawnCenter[0] : 595}
                      y={kmlOverlays.mainLawnCenter ? kmlOverlays.mainLawnCenter[1] : 590}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#0f172a"
                      fontSize="14"
                      fontWeight="900"
                      letterSpacing="1"
                      className="select-none pointer-events-none drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]"
                    >
                      MAIN LAWN
                    </text>
                  </g>
                )}

                {/* 3. Main Gate → D Block (Orange fill 70%, darker orange border 2.5px) */}
                {kmlOverlays.showMainGateToDBlock && kmlOverlays.mainGateToDBlockPoints && (
                  <g className="kml-main-gate-to-d-block-layer">
                    <polygon
                      points={kmlOverlays.mainGateToDBlockPoints}
                      fill="rgba(249, 115, 22, 0.70)"
                      stroke="#c2410c"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all hover:fill-[rgba(249,115,22,0.85)] hover:stroke-[#9a3412]"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (kmlOverlays.onSelectPolygon) kmlOverlays.onSelectPolygon('main_gate_to_d_block');
                      }}
                    >
                      <title>Main Gate → D Block (100 Surveyed GPS Nodes, 0.765 km)</title>
                    </polygon>
                    {/* Centered Pill Label: Main Gate → D Block */}
                    <g transform={`translate(${kmlOverlays.mainGateToDBlockCenter ? kmlOverlays.mainGateToDBlockCenter[0] : 471}, ${kmlOverlays.mainGateToDBlockCenter ? kmlOverlays.mainGateToDBlockCenter[1] : 712}) rotate(-68)`}>
                      <rect
                        x="-75"
                        y="-12"
                        width="150"
                        height="24"
                        rx="6"
                        fill="rgba(194, 65, 12, 0.95)"
                        stroke="#ea580c"
                        strokeWidth="1.2"
                        className="drop-shadow-md"
                      />
                      <text
                        x="0"
                        y="1"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="800"
                        letterSpacing="0.5"
                        className="select-none pointer-events-none"
                      >
                        Main Gate → D Block
                      </text>
                    </g>
                  </g>
                )}
              </g>
            )}

          </svg>

          {/* ============================================================= */}
          {/* 4. REAL DYNAMIC WALKING ROUTE OVERLAY LAYER                    */}
          {/* ============================================================= */}
          {activeRoute && mapRoutePoints.length > 1 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 1000 1422"
              preserveAspectRatio="none"
              shapeRendering="geometricPrecision"
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
                transform: `translate(-50%, -100%) scale(${1 / scale}) rotate(${-rotation}deg)`,
                transformOrigin: 'bottom center'
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
                transform: `translate(-50%, -100%) scale(${1 / scale}) rotate(${-rotation}deg)`,
                transformOrigin: 'bottom center'
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
            const isPathway = feat.category === 'Pathway' || feat.category === 'Route';

            // HIDE route pin by default: only appear when activeRoute is active
            if (isPathway && !activeRoute) {
              return null;
            }

            // Check if feature is an academic building or has a polygon footprint
            const hasPolygon = Boolean(feat.polygonCoordinates && feat.polygonCoordinates.length > 2);
            const isBuilding = feat.category === 'Academic' || feat.category === 'Administrative' || feat.buildingId || /block/i.test(feat.featureName);

            // Clean architectural map styling:
            // Campus buildings are already drawn and labeled with high-resolution typography on the official campus master map.
            // DO NOT render redundant generic circular pins over buildings by default — this blocks map text and crowds the quad.
            // Only render a pin over a building if:
            // 1. It is explicitly SELECTED by the user (shows pin + detailed place popup)
            // 2. The user has an active search query that matches this specific building
            const hasActiveSearch = Boolean(localSearch || searchQuery);
            if (hasPolygon && isBuilding && !isSelected && !hasActiveSearch) {
              return null;
            }

            // For non-polygon standalone amenities (Cafes, Gates, Central Fountain):
            // Show pin if selected, if searched, if specific category filter is active, or if key landmark
            const isSpecificCategoryFilter = activeCategory && activeCategory !== 'all' && activeCategory.toLowerCase() !== 'academic';
            const isKeyAmenity = feat.code === 'PU-CAFE-D-BLOCK' || feat.featureId === 'feat_fountain' || feat.featureId === 'feat_main_gate';

            const shouldShowPin = isSelected || hasActiveSearch || isSpecificCategoryFilter || isKeyAmenity;
            if (!shouldShowPin) {
              return null;
            }

            const Icon = getCategoryIcon(feat.category);
            const style = getCategoryStyle(feat.category);
            const isHattiKappi = feat.code === 'PU-CAFE-D-BLOCK' || feat.featureId === 'feat_food_d_block' || /hatti kappi/i.test(feat.featureName);
            const ratingData = hattiKappiCafe?.rating || { average: 4.8, count: 4 };
            const showPopupBelow = feat.normalizedY < 0.45;

            return (
              <div
                key={feat.featureId}
                style={{
                  left: `${feat.normalizedX * 100}%`,
                  top: `${feat.normalizedY * 100}%`,
                  transform: `translate(-50%, -50%) scale(${1 / scale}) rotate(${-rotation}deg)`,
                  transformOrigin: 'center center',
                  zIndex: isSelected ? 60 : 25
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectFeature(feat);
                }}
                className="absolute interactive-map-marker cursor-pointer group pointer-events-auto"
              >
                {/* Pulsing ring when selected */}
                {isSelected && (
                  <span className={`absolute -inset-2.5 rounded-full animate-ping opacity-75 ${isHattiKappi ? 'bg-amber-500' : style.bg}`} />
                )}

                {/* Marker Pin Icon: Clean fixed standard badge at 1:1 screen pixel resolution */}
                <div
                  className={`relative flex items-center justify-center rounded-full transition-all duration-150 shadow-md ${
                    isHattiKappi
                      ? isSelected
                        ? 'w-9 h-9 bg-gradient-to-br from-amber-500 to-yellow-700 ring-3 ring-amber-300 text-white scale-110 shadow-amber-600/50'
                        : 'w-7 h-7 bg-gradient-to-br from-amber-600 to-yellow-800 text-amber-100 border-2 border-amber-300/80 hover:scale-110'
                      : isSelected
                      ? `w-9 h-9 ${style.bg} ring-3 ring-white text-white scale-110 shadow-lg`
                      : `w-7 h-7 ${style.bg} text-white border-2 border-white hover:scale-110`
                  }`}
                  title={feat.featureName}
                >
                  <Icon className={isSelected ? 'w-4.5 h-4.5' : 'w-3.5 h-3.5'} />
                </div>

                {/* ============================================================= */}
                {/* PLACE NAME POPUP: POPS UP ONLY AFTER CLICKING THIS PLACE!     */}
                {/* ============================================================= */}
                {isSelected && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in zoom-in-95 fade-in duration-150 ${
                      showPopupBelow ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
                    }`}
                  >
                    <div className="relative bg-white/98 dark:bg-[#1e293b]/98 backdrop-blur-md text-slate-800 dark:text-white rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700/80 p-3 w-[260px] text-left select-text">
                      {/* Close button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalSelectedFeature(null);
                          if (onSelectMarker) onSelectMarker(null);
                        }}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Close"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Place Header: Icon + Name */}
                      <div className="flex items-start gap-2.5 pr-5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isHattiKappi ? 'bg-amber-500' : style.bg} text-white shadow-sm`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-xs leading-tight text-slate-900 dark:text-white line-clamp-1">
                            {feat.featureName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              {feat.category}
                            </span>
                            {feat.code && (
                              <>
                                <span className="text-slate-300 dark:text-slate-600">·</span>
                                <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {feat.code}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Extra detail: e.g. cafe rating or description */}
                      {isHattiKappi && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1 text-amber-500 font-extrabold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{Number(ratingData.average || 4.8).toFixed(1)}</span>
                            <span className="text-slate-400 font-normal text-[10px]">({ratingData.count || 4})</span>
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            Open Now
                          </span>
                        </div>
                      )}

                      {!isHattiKappi && feat.description && (
                        <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {feat.description}
                        </p>
                      )}

                      {/* Action Buttons: Route, Floors, Info */}
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenRoutePlanning) {
                              onOpenRoutePlanning(null, feat.buildingId || feat.featureId || feat.code);
                            }
                          }}
                          className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold transition-all hover:scale-105 flex items-center justify-center gap-1 shadow-sm"
                        >
                          <NavigationIcon className="w-3 h-3" />
                          <span>Route</span>
                        </button>

                        {feat.hasIndoorMap && onOpenIndoorMap && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenIndoorMap({
                                _id: feat.buildingId || feat.featureId,
                                buildingId: feat.buildingId || feat.featureId,
                                name: feat.featureName,
                                shortCode: feat.code,
                                totalFloors: feat.totalFloors || 6,
                                hasIndoorMap: true
                              });
                            }}
                            className="py-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                            title="View Multi-Floor Indoor Maps"
                          >
                            <DoorOpen className="w-3 h-3 text-indigo-500" />
                            <span>Floors</span>
                          </button>
                        )}

                        {(isHattiKappi || isBuilding || feat.description) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectMarker) {
                                onSelectMarker({
                                  markerId: feat.featureId,
                                  buildingId: feat.buildingId,
                                  name: feat.featureName,
                                  shortCode: feat.code,
                                  category: feat.category,
                                  imageX: feat.normalizedX,
                                  imageY: feat.normalizedY,
                                  description: feat.description,
                                  totalFloors: feat.totalFloors,
                                  hasIndoorMap: feat.hasIndoorMap,
                                  departments: feat.departments
                                });
                              }
                              if (isHattiKappi && onOpenCafe) {
                                onOpenCafe({
                                  _id: hattiKappiCafe?._id || 'PU-CAFE-D-BLOCK',
                                  shortCode: 'PU-CAFE-D-BLOCK',
                                  name: 'Hatti Kappi'
                                });
                              } else if (isBuilding && onOpenBuildingPopup) {
                                onOpenBuildingPopup({
                                  _id: feat.buildingId || feat.featureId,
                                  buildingId: feat.buildingId || feat.featureId,
                                  name: feat.featureName,
                                  code: feat.code,
                                  shortCode: feat.code,
                                  category: feat.category,
                                  totalFloors: feat.totalFloors || 4,
                                  hasIndoorMap: feat.hasIndoorMap,
                                  description: feat.description,
                                  departments: feat.departments || []
                                });
                              }
                            }}
                            className="py-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                            title="View Full Information & Reviews"
                          >
                            <Info className="w-3 h-3 text-sky-500" />
                            <span>Info</span>
                          </button>
                        )}
                      </div>

                      {/* Directional pointer triangle pointing to the pin */}
                      {showPopupBelow ? (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white dark:border-b-[#1e293b] filter drop-shadow-[0_-1px_1px_rgba(0,0,0,0.06)]" />
                      ) : (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white dark:border-t-[#1e293b] filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.06)]" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* User GPS Live Location Pin */}
          {userLocation && (
            <div
              style={{
                left: '56.95%',
                top: '24.49%',
                transform: `translate(-50%, -50%) scale(${1 / scale}) rotate(${-rotation}deg)`,
                transformOrigin: 'center center'
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
      <div className="absolute right-2 sm:right-4 bottom-20 sm:bottom-24 z-40 flex flex-col items-center gap-1 sm:gap-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-1 sm:p-1.5 rounded-2xl shadow-2xl no-dblclick scale-90 sm:scale-100 origin-bottom-right max-h-[calc(100vh-130px)] overflow-y-auto no-scrollbar">
        {/* Interactive Calibrated Compass Rose (Always points North, Click to Align North) */}
        <button
          onClick={handleResetNorth}
          className="relative w-11 h-11 rounded-2xl bg-slate-950/90 border border-slate-700 hover:border-emerald-500/80 shadow-inner flex items-center justify-center group transition-all hover:scale-105 active:scale-95 shrink-0"
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
        <div className="flex items-center gap-1 w-full justify-center shrink-0">
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

        <div className="h-px w-8 bg-slate-800 shrink-0" />

        {/* Directions / Wayfinding Route Planner */}
        <button
          onClick={() => onOpenRoutePlanning && onOpenRoutePlanning()}
          className="p-2.5 rounded-xl text-sky-400 hover:text-sky-300 hover:bg-sky-500/20 transition-all hover:scale-110 active:scale-95 font-bold shrink-0"
          title="Campus Wayfinding: Navigate between any two places"
        >
          <NavigationIcon className="w-4 h-4" />
        </button>

        <div className="h-px w-8 bg-slate-800 shrink-0" />

        {/* 1. Zoom In */}
        <button
          onClick={handleZoomIn}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110 active:scale-95 shrink-0"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4 text-sky-400" />
        </button>

        {/* 2. Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110 active:scale-95 shrink-0"
          title="Zoom Out (−)"
        >
          <ZoomOut className="w-4 h-4 text-sky-400" />
        </button>

        <div className="h-px w-8 bg-slate-800 shrink-0" />

        {/* 3. My Location (GPS Position) */}
        <button
          onClick={handleFocusMyLocation}
          className="p-2.5 rounded-xl text-sky-400 hover:text-sky-300 hover:bg-sky-500/20 transition-all hover:scale-110 active:scale-95 font-bold shrink-0"
          title="My Location (GPS Campus Position)"
        >
          <LocateFixed className="w-4 h-4" />
        </button>

        {/* 4. Focus Main Gate (Entrance Focus - Desktop only, on mobile accessible in top pill) */}
        <button
          onClick={handleFocusMainGate}
          className="hidden sm:flex p-2.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 transition-all hover:scale-110 active:scale-95 font-bold shrink-0"
          title="Focus Main Gate (University Entrance Portal)"
        >
          <DoorOpen className="w-4 h-4" />
        </button>

        {/* 5. Fit Entire Campus Overview (Desktop only, on mobile in top pill) */}
        <button
          onClick={handleFitCampus}
          className="hidden sm:flex p-2.5 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-all hover:scale-110 active:scale-95 font-bold shrink-0"
          title="Fit Entire Campus (Show All Facilities)"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* 6. Fit Width / Wide View (Desktop only, on mobile in top pill) */}
        <button
          onClick={handleWideScreen}
          className="hidden sm:flex p-2.5 rounded-xl text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 transition-all hover:scale-110 active:scale-95 font-bold shrink-0"
          title="Wide View (Fill Width & Eliminate Side Gaps)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* 7. Focus Academic Quad (Desktop only, on mobile in top pill) */}
        <button
          onClick={handleFocusQuad}
          className="hidden sm:flex p-2.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 transition-all hover:scale-110 active:scale-95 font-bold shrink-0"
          title="Focus Academic Quad (D-E-F-L Blocks)"
        >
          <Building2 className="w-4 h-4" />
        </button>

        {/* 8. Focus Selected Building */}
        <button
          onClick={handleFocusSelected}
          disabled={!activeSelected}
          className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 shrink-0 ${
            activeSelected
              ? 'text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 cursor-pointer'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Focus Selected Building"
        >
          <Target className="w-4 h-4" />
        </button>

        {/* 9. Reset View & Heading */}
        <button
          onClick={handleResetView}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110 active:scale-95 shrink-0"
          title="Reset View & Heading (Default)"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="h-px w-8 bg-slate-800 shrink-0" />

        {/* 10. Full Screen */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 transition-all hover:scale-110 active:scale-95 shrink-0"
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

    </div>
  );
}
