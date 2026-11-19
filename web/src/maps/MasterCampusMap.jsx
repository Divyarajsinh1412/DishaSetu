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
  DoorOpen,
  Footprints,
  CheckCircle2,
  Maximize2,
  Star
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

export default function MasterCampusMap({
  markers = [],
  activeCategory = 'all',
  searchQuery = '',
  selectedMarker = null,
  onSelectMarker,
  onStartNavigation,
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

  // Pan & Zoom state: Default scale 1.15 for prominent initial display
  const [scale, setScale] = useState(1.15);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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

  // 1. Zoom In
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.35, 4.5));
  };

  // 2. Zoom Out
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.35, 0.75));
  };

  // 3. Fit Entire Campus
  const handleFitCampus = useCallback(() => {
    setScale(1.0);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 4. Fill Screen / Viewport
  const handleFillViewport = useCallback(() => {
    setScale(1.28);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 5. Focus Selected Building
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

  // 6. Reset View
  const handleResetView = () => {
    setScale(1.15);
    setPosition({ x: 0, y: 0 });
  };

  // 7. Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.0018;
    setScale(prev => Math.min(Math.max(prev + zoomFactor, 0.75), 4.5));
  };

  // Double click to zoom in at mouse position
  const handleDoubleClick = (e) => {
    if (e.target.closest('.no-dblclick') || e.target.closest('button')) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setScale(prev => {
      const newScale = Math.min(prev + 0.6, 4.0);
      return newScale;
    });
  };

  // Drag pan handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.interactive-map-marker') || e.target.closest('.interactive-polygon')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan & pinch-to-zoom
  const touchStateRef = useRef({ dist: 0 });

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      if (e.target.closest('.interactive-map-marker') || e.target.closest('.interactive-polygon')) return;
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
      touchStateRef.current.dist = dist;
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
      const diff = dist - touchStateRef.current.dist;
      setScale(prev => Math.min(Math.max(prev + diff * 0.005, 0.75), 4.5));
      touchStateRef.current.dist = dist;
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
      className={`relative w-full h-full overflow-hidden select-none bg-slate-950 flex items-center justify-center ${
        isDragging ? 'cursor-grabbing' : isAdminEditorActive ? 'cursor-crosshair' : 'cursor-grab'
      }`}
    >
      {/* Subtle Background Radial Grid Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px]"></div>

      {/* ================================================================= */}
      {/* 1. TOP FLOATING GOOGLE MAPS-STYLE SEARCH & STATUS BAR             */}
      {/* ================================================================= */}
      <div className="absolute top-4 left-4 right-4 z-40 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Map Title & Status Pill */}
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl text-slate-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <span>Official Presidency Campus Map</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                Interactive Layer Live
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Presidency University Bengaluru · Itgalpur Campus</div>
          </div>
        </div>

        {/* Center/Right: Unified Search Bar with Autocomplete */}
        <div className="pointer-events-auto relative w-full sm:w-80 md:w-96">
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

      {/* ================================================================= */}
      {/* 2. INTERACTIVE TRANSFORMED CANVAS CONTAINER                        */}
      {/* ================================================================= */}
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
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
          className="relative rounded-2xl shadow-2xl border-4 border-slate-700/80 bg-white overflow-hidden drop-shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
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
          {/* 4. WALKING ROUTE OVERLAY LAYER                                */}
          {/* ============================================================= */}
          {activeRoute && activeRoute.geometry && activeRoute.geometry.length > 1 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.8" />
                </filter>
              </defs>
              <polyline
                points={
                  activeSelected
                    ? `56.95,24.49 49.40,51.27 46.66,59.95 ${activeSelected.normalizedX * 100},${activeSelected.normalizedY * 100}`
                    : '56.95,24.49 49.40,51.27 46.66,59.95 20.41,64.78'
                }
                fill="none"
                stroke="url(#routeGlow)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 2"
                className="animate-[dash_1.5s_linear_infinite]"
                filter="url(#shadowGlow)"
              />
            </svg>
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

                {/* Marker Body */}
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

                {/* Permanent subtle name tag when zoomed in */}
                {scale >= 1.5 && !isHovered && !isSelected && (
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
      {/* 6. RIGHT FLOATING GOOGLE MAPS CONTROLS BOX                        */}
      {/* ================================================================= */}
      <div className="absolute right-4 bottom-24 z-40 flex flex-col gap-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl no-dblclick">
        {/* 1. Zoom In */}
        <button
          onClick={handleZoomIn}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110 active:scale-95"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-sky-400" />
        </button>

        {/* 2. Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110 active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-sky-400" />
        </button>

        <div className="h-px bg-slate-800 mx-1" />

        {/* 3. Fit Entire Campus */}
        <button
          onClick={handleFitCampus}
          className="p-2.5 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-all hover:scale-110 active:scale-95 font-bold"
          title="Fit Campus (Show All Features)"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* 4. Fill Screen / Viewport */}
        <button
          onClick={handleFillViewport}
          className="p-2.5 rounded-xl text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 transition-all hover:scale-110 active:scale-95 font-bold"
          title="Fill Screen (Eliminate side black bars)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* 5. Focus Selected Building */}
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

        {/* 6. Reset View */}
        <button
          onClick={handleResetView}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-110 active:scale-95"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-px bg-slate-800 mx-1" />

        {/* 7. Full Screen */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 transition-all hover:scale-110 active:scale-95"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
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

          {/* Quick Action Button */}
          <div className="flex items-center gap-1.5 shrink-0">
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
