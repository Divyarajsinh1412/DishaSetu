import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Compass,
  Search,
  AlertTriangle,
  Shield,
  MapPin,
  Building2,
  Car,
  Trees,
  Coffee,
  HeartPulse,
  BookOpen,
  Trophy,
  Globe,
  Map as MapIcon,
  Crosshair,
  Box,
  Utensils,
  Footprints,
  HelpCircle,
  Languages,
  DoorOpen,
  Navigation as NavigationIcon,
  X,
  ChevronDown,
  Layers,
  ArrowRight,
  Sparkles,
  MoreVertical,
  Check,
  Calendar,
  Menu,
  ChevronRight,
  LocateFixed,
  CornerUpRight,
  Eye,
  SlidersHorizontal,
  Smartphone,
  RotateCcw,
  FileCode
} from 'lucide-react';
import { getTranslation } from '../services/localization';
import { COMPLETE_CAMPUS_CATALOG } from '../services/campusCatalog';
import { MASTER_CAMPUS_FEATURES } from '../data/masterMapFeatures';
import { CAMPUS_ALL_FLOORS } from '../data/campusFloorsDataset';

export default function Header({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategorySelect,
  onOpenSOS,
  onOpenAdmin,
  onOpenSurvey,
  onOpenIndoorSurvey,
  onOpenIndoor,
  onOpenCafes,
  onOpenCafeOwner,
  onOpenIssueReport,
  onOpenMapEditor,
  onOpenRoutePlanning,
  onOpenAIAssistant,
  onOpenEvents,
  onOpenFlutterApp,
  onSelectLocation,
  locations = [],
  viewMode = 'map',
  onViewModeChange,
  mapType = 'google_roadmap',
  onMapTypeChange,
  language = 'en',
  onLanguageChange,
  onToggleSidebar
}) {
  const t = (key) => getTranslation(language, key);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const moreMenuRef = useRef(null);
  const layersMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const categoryButtonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 70, left: 16, width: 440 });

  // Update dynamic position for the portaled dropdown
  useEffect(() => {
    if (!isCategoryMenuOpen) return;
    const updatePos = () => {
      if (!categoryButtonRef.current) return;
      const rect = categoryButtonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        setDropdownPos({
          top: Math.max(12, rect.bottom + 8),
          left: 12,
          width: Math.min(window.innerWidth - 24, 440)
        });
      } else {
        const panelWidth = 440;
        const maxLeft = window.innerWidth - panelWidth - 16;
        const left = Math.max(16, Math.min(rect.left, maxLeft));
        setDropdownPos({
          top: rect.bottom + 8,
          left,
          width: panelWidth
        });
      }
    };
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [isCategoryMenuOpen]);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCategoryMenuOpen(false);
        setIsLayersMenuOpen(false);
        setIsMoreMenuOpen(false);
        setIsSearchFocused(false);
      }
    };
    const handleOutsideClick = (e) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(e.target) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(e.target)
      ) {
        setIsCategoryMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setIsMoreMenuOpen(false);
      }
      if (layersMenuRef.current && !layersMenuRef.current.contains(e.target)) {
        setIsLayersMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Official Institutional Campus Categories
  const categories = [
    {
      id: 'all',
      label: 'All Places',
      icon: MapPin,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60'
    },
    {
      id: 'Cafe',
      label: 'Cafeterias & Food',
      icon: Coffee,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60'
    },
    {
      id: 'Academic',
      label: 'Academic Blocks',
      icon: Building2,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60'
    },
    {
      id: 'Parking',
      label: 'Parking Lots',
      icon: Car,
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60'
    },
    {
      id: 'Library',
      label: 'Libraries',
      icon: BookOpen,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60'
    },
    {
      id: 'Medical',
      label: 'Health Center',
      icon: HeartPulse,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
    },
    {
      id: 'Gate',
      label: 'Gates & Entrances',
      icon: Compass,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'Sports',
      label: 'Sports Complex',
      icon: Trophy,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/60'
    },
    {
      id: 'Garden',
      label: 'Gardens & Lawns',
      icon: Trees,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60'
    },
    {
      id: 'Pathway',
      label: 'Walkways & Routes',
      icon: Footprints,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/60'
    }
  ];

  // Dynamic location counts for each category
  const categoryCounts = useMemo(() => {
    const counts = { all: MASTER_CAMPUS_FEATURES.length };
    MASTER_CAMPUS_FEATURES.forEach((feat) => {
      let cat = feat.category;
      if (cat === 'Administrative') cat = 'Academic';
      if (cat === 'Food' || cat === 'Dining') cat = 'Cafe';
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, []);

  const activeCatObj = categories.find(c => c.id === activeCategory) || categories[0];
  const isFiltered = activeCategory && activeCategory !== 'all';
  const ActiveIcon = isFiltered ? activeCatObj.icon : Compass;

  // Comprehensive Instant Search Engine
  const searchResults = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q || q.length < 1) return [];

    const hits = [];
    const seenIds = new Set();

    // 1. Search Catalog (Buildings, Labs, Rooms, Cafes, Gates)
    COMPLETE_CAMPUS_CATALOG.forEach(item => {
      const matchName = item.name && item.name.toLowerCase().includes(q);
      const matchCode = item.shortCode && item.shortCode.toLowerCase().includes(q);
      const matchCat = item.category && item.category.toLowerCase().includes(q);
      const matchDesc = item.description && item.description.toLowerCase().includes(q);

      if (matchName || matchCode || matchCat || matchDesc) {
        if (!seenIds.has(item.locationId)) {
          seenIds.add(item.locationId);
          hits.push({
            id: item.locationId,
            name: item.name,
            code: item.shortCode,
            category: item.category,
            description: item.description,
            raw: item
          });
        }
      }
    });

    // 2. Search Master Features
    MASTER_CAMPUS_FEATURES.forEach(feat => {
      const matchName = feat.featureName && feat.featureName.toLowerCase().includes(q);
      const matchCode = feat.code && feat.code.toLowerCase().includes(q);
      if (matchName || matchCode) {
        if (!seenIds.has(feat.featureId)) {
          seenIds.add(feat.featureId);
          hits.push({
            id: feat.featureId,
            name: feat.featureName,
            code: feat.code,
            category: feat.category,
            description: feat.description,
            raw: feat
          });
        }
      }
    });

    // 3. Search Verified Rooms across all 6 blocks (D, E, F, L, N, M)
    for (const flr of CAMPUS_ALL_FLOORS) {
      if (flr.rooms) {
        for (const rm of flr.rooms) {
          const rNum = rm.roomNumber ? rm.roomNumber.toLowerCase() : '';
          const rName = rm.name ? rm.name.toLowerCase() : '';
          if (rNum.includes(q) || rName.includes(q)) {
            const key = `room_${rm.roomId}`;
            if (!seenIds.has(key)) {
              seenIds.add(key);
              const isLab = rm.category === 'Laboratory' || flr.buildingShortCode === 'PU-D-BLOCK';
              hits.push({
                id: key,
                name: `${rm.roomNumber} – ${rm.name.replace(/^.*?–\s*/, '')}`,
                code: rm.roomNumber,
                category: isLab ? 'Lab' : 'Classroom',
                description: `${flr.buildingName} · ${flr.floorName}`,
                isRoom: true,
                buildingId: flr.buildingId,
                buildingShortCode: flr.buildingShortCode,
                buildingName: flr.buildingName,
                floorNumber: flr.floorNumber,
                raw: {
                  ...rm,
                  buildingId: flr.buildingId,
                  buildingName: flr.buildingName,
                  shortCode: flr.buildingShortCode,
                  name: flr.buildingName,
                  focusRoom: rm.roomNumber
                }
              });
            }
          }
        }
      }
    }

    return hits.slice(0, 8);
  }, [searchQuery]);

  const handleSelectSearchResult = (hit) => {
    setIsSearchFocused(false);
    if (onSelectLocation) {
      onSelectLocation(hit.raw || hit);
    }
  };

  const handleDirectNavigate = (hit, e) => {
    e.stopPropagation();
    setIsSearchFocused(false);
    if (onOpenRoutePlanning) {
      onOpenRoutePlanning(null, hit.id || hit.code);
    }
  };

  // View modes for the Google Maps Layers panel
  const viewModes = [
    {
      id: 'master',
      mode: 'master',
      title: 'Campus Master Map',
      subtitle: 'Official High-Res Illustrated Map',
      icon: MapIcon,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40'
    },
    {
      id: 'map_roadmap',
      mode: 'map',
      mapType: 'google_roadmap',
      title: 'Google Map (Geographic)',
      subtitle: 'Real Roads, Streets & Surrounding Area',
      icon: Compass,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
    },
    {
      id: 'map_satellite',
      mode: 'map',
      mapType: 'google_satellite',
      title: 'Satellite Hybrid',
      subtitle: 'Aerial Imagery & Street Labels',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40'
    },
    {
      id: 'map_terrain',
      mode: 'map',
      mapType: 'google_terrain',
      title: 'Terrain Map',
      subtitle: 'Topography & Elevations',
      icon: Compass,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
    },
    {
      id: '3d',
      mode: '3d',
      title: '3D Campus Twin',
      subtitle: 'Photorealistic Digital Twin',
      icon: Box,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40'
    },
    {
      id: 'immersive',
      mode: 'immersive',
      title: '360° Aerial Tour',
      subtitle: 'Spherical Campus Panoramas',
      icon: Globe,
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40'
    },
    {
      id: 'indoor',
      mode: 'indoor',
      title: 'Indoor Floorplans',
      subtitle: 'D Block Multi-Floor Navigator',
      icon: DoorOpen,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
    },
    {
      id: 'main-lawn-demo',
      mode: 'main-lawn-demo',
      title: 'Main Lawn Demo',
      subtitle: 'Authoritative 14-Node GPS Polygon',
      icon: Trees,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
    },
    {
      id: 'kml-demo',
      mode: 'kml-demo',
      title: 'Demo Map Canvas',
      subtitle: 'Clean White Coordinate Map Builder',
      icon: Crosshair,
      color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40'
    }
  ];

  const currentView = viewModes.find(v =>
    v.mode === 'map' ? (viewMode === 'map' && mapType === v.mapType) : (viewMode === v.mode)
  );
  const currentViewLabel = currentView?.title || 'Map View';

  return (
    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-[420] pointer-events-none flex flex-col gap-2">
      {/* Top Floating Row: Search Bar (Left) + Explore Campus Dropdown + Quick Actions (Right) */}
      <div className="flex items-start justify-between gap-2 sm:gap-3 pointer-events-none w-full">
        
        {/* Left Cluster: Search Bar + Compact "Explore Campus" Category Dropdown */}
        <div className="flex items-center gap-2 pointer-events-auto flex-1 sm:flex-initial min-w-0">
          
          {/* 1. AUTHENTIC GOOGLE MAPS FLOATING SEARCH BAR */}
          <div ref={searchContainerRef} className="flex-1 sm:flex-initial sm:w-[350px] md:w-[380px] relative min-w-0">
            <div className="h-11 sm:h-12 bg-white dark:bg-[#202124] text-slate-800 dark:text-slate-100 rounded-2xl sm:rounded-3xl shadow-gmap-search border border-slate-200/90 dark:border-slate-700/80 flex items-center px-2 sm:px-3 gap-1 sm:gap-1.5 transition-all focus-within:shadow-xl focus-within:border-blue-500">
              {/* Menu Drawer Toggle Button */}
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 transition-colors"
                title="Open Campus Directory & Navigation Drawer"
              >
                <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              </button>

              {/* University Logo Badge Icon */}
              <div className="hidden xs:flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-black text-[11px] shadow-sm select-none" title="DishaSetu - Presidency University">
                D
              </div>

              {/* Input Search Field */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search Presidency University..."
                className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 font-medium outline-none min-w-0"
              />

              {/* Clear Input Button (when text exists) */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Clear Search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

              {/* Search Magnifier Action */}
              <button
                type="button"
                onClick={() => setIsSearchFocused(true)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-400 transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Blue Google Maps Directions Button */}
              <button
                type="button"
                onClick={() => onOpenRoutePlanning && onOpenRoutePlanning()}
                className="w-8 h-8 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center shadow-md shadow-blue-500/25 active:scale-95 transition-all shrink-0 group"
                title="Directions & Turn-by-Turn Wayfinding"
              >
                <CornerUpRight className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* =============================================================== */}
            {/* INSTANT GOOGLE MAPS AUTOCOMPLETE SUGGESTIONS POPUP              */}
            {/* =============================================================== */}
            {isSearchFocused && searchResults.length > 0 && (
              <div
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                data-prevent-map-zoom="true"
                className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#202124] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 overscroll-contain isolate-scroll"
              >
                <div className="px-3 py-2 bg-slate-50 dark:bg-[#2a2b2e] border-b border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span>Presidency Campus Matches ({searchResults.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Click to view location</span>
                </div>
                <div
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  data-prevent-map-zoom="true"
                  className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar overscroll-contain isolate-scroll"
                >
                  {searchResults.map((hit) => (
                    <div
                      key={hit.id}
                      onClick={() => handleSelectSearchResult(hit)}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 truncate mr-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                          {hit.category === 'Academic' ? <Building2 className="w-4 h-4" /> :
                           hit.category === 'Cafe' ? <Coffee className="w-4 h-4" /> :
                           hit.category === 'Gate' ? <Compass className="w-4 h-4" /> :
                           hit.category === 'Library' ? <BookOpen className="w-4 h-4" /> :
                           hit.category === 'Medical' ? <HeartPulse className="w-4 h-4" /> :
                           <MapPin className="w-4 h-4" />}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                              {hit.name}
                            </span>
                            {hit.code && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {hit.code}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {hit.category} · {hit.description || 'Presidency University Bengaluru'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDirectNavigate(hit, e)}
                        className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 transition-colors"
                        title="Direct directions to this location"
                      >
                        <CornerUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. COMPACT "EXPLORE CAMPUS" CATEGORY SELECTOR DROPDOWN */}
          <div className="relative shrink-0">
            <button
              ref={categoryButtonRef}
              type="button"
              onClick={() => {
                setIsCategoryMenuOpen(!isCategoryMenuOpen);
                setIsLayersMenuOpen(false);
                setIsMoreMenuOpen(false);
                setIsSearchFocused(false);
              }}
              className={`h-11 sm:h-12 px-2.5 sm:px-3.5 rounded-2xl sm:rounded-3xl border shadow-gmap-search flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold transition-all active:scale-95 group shrink-0 ${
                isFiltered
                  ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-400 dark:border-blue-600/80 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-[#202124] text-slate-800 dark:text-slate-100 border-slate-200/90 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-[#282a2d] hover:border-blue-400 dark:hover:border-blue-500/50'
              }`}
              title={isFiltered ? `Filtered by ${activeCatObj.label} (Click to change)` : 'Explore Campus Categories'}
            >
              {/* Category Icon */}
              <ActiveIcon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isFiltered ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500'
                }`}
              />

              {/* Label */}
              <span className="truncate max-w-[110px] sm:max-w-[150px]">
                {isFiltered ? activeCatObj.label : 'Explore Campus'}
              </span>

              {/* Quick Reset X Button when a category is active */}
              {isFiltered && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategorySelect('all');
                    setIsCategoryMenuOpen(false);
                  }}
                  className="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/60 text-blue-500 hover:text-blue-700 dark:text-blue-300 transition-colors"
                  title="Clear category filter (Show All Places)"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              )}

              {/* Dropdown Chevron Arrow */}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isCategoryMenuOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                }`}
              />
            </button>

            {/* Dropdown Popover Panel via React Portal */}
            {isCategoryMenuOpen && typeof document !== 'undefined' && createPortal(
              <div className="fixed inset-0 z-[9999] pointer-events-auto">
                {/* Clickable Backdrop to close dropdown on outside click */}
                <div
                  className="fixed inset-0 bg-black/25 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-150"
                  onClick={() => setIsCategoryMenuOpen(false)}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                />

                {/* Popover Dropdown Panel */}
                <div
                  ref={categoryMenuRef}
                  style={{
                    position: 'fixed',
                    top: `${dropdownPos.top}px`,
                    left: `${dropdownPos.left}px`,
                    width: `${dropdownPos.width}px`
                  }}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  data-prevent-map-zoom="true"
                  className="bg-white/98 dark:bg-[#1e293b]/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-700/80 p-3.5 animate-in fade-in zoom-in-95 duration-150 select-none max-h-[75vh] overflow-y-auto custom-scrollbar overscroll-contain isolate-scroll pointer-events-auto"
                >
                  {/* Popover Header */}
                  <div className="flex items-center justify-between px-2 pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                          Explore Campus
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          Select a category to filter locations on the map
                        </div>
                      </div>
                    </div>

                    {isFiltered && (
                      <button
                        type="button"
                        onClick={() => {
                          onCategorySelect('all');
                          setIsCategoryMenuOpen(false);
                        }}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>All Places</span>
                      </button>
                    )}
                  </div>

                  {/* Categories Grid (2-column on desktop, 1-column on mobile) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = activeCategory === cat.id;
                      const count = categoryCounts[cat.id];

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            onCategorySelect(cat.id);
                            setIsCategoryMenuOpen(false);
                          }}
                          className={`p-2.5 rounded-2xl text-left flex items-center gap-2.5 transition-all group ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/30'
                              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60'
                          }`}
                        >
                          {/* Category Icon Badge */}
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : cat.color
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Category Name & Count */}
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                              {cat.label}
                            </div>
                            {count != null && (
                              <div className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                {count} {count === 1 ? 'place' : 'places'}
                              </div>
                            )}
                          </div>

                          {/* Checkmark when active */}
                          {isActive && (
                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Popover Footer */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1">
                    <span>{MASTER_CAMPUS_FEATURES.length} Verified Facilities</span>
                    <span className="font-mono">Presidency University GIS</span>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. TOP-RIGHT GOOGLE MAPS ACTION BUTTONS CLUSTER                   */}
        {/* ================================================================= */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* LAYERS & VIEW SWITCHER (Google Maps Square Layers Button) */}
          <div ref={layersMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
              className="h-10 sm:h-11 px-2.5 sm:px-3 bg-white dark:bg-[#202124] text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl shadow-gmap-search border border-slate-200/90 dark:border-slate-700/80 flex items-center gap-1 sm:gap-1.5 text-xs font-bold transition-all active:scale-95 group shrink-0"
              title="Campus Views & Layers"
            >
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden md:inline">{currentViewLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Google Maps Layer Selection Popover */}
            {isLayersMenuOpen && (
              <div
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                data-prevent-map-zoom="true"
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#202124] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 overscroll-contain isolate-scroll"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Campus View Modes
                </div>
                <div className="space-y-1">
                  {viewModes.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = mode.mode === 'map'
                      ? (viewMode === 'map' && mapType === mode.mapType)
                      : (viewMode === mode.mode);
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          if (mode.mode === 'map') {
                            if (onMapTypeChange && mode.mapType) onMapTypeChange(mode.mapType);
                            if (onViewModeChange) onViewModeChange('map');
                          } else {
                            if (onViewModeChange) onViewModeChange(mode.mode);
                            if (mode.id === 'indoor' && onOpenIndoor) onOpenIndoor();
                          }
                          setIsLayersMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${mode.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 truncate">
                          <div className="text-xs font-bold leading-tight">{mode.title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{mode.subtitle}</div>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* AI Campus Assistant Floating Pill */}
          <button
            type="button"
            onClick={onOpenAIAssistant}
            className="h-11 px-3 bg-white dark:bg-[#202124] text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 rounded-2xl shadow-gmap-search border border-slate-200/90 dark:border-slate-700/80 flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 group"
            title="Ask DishaSetu AI: Smart Campus Guide"
          >
            <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-115 transition-transform" />
            <span className="hidden lg:inline">AI Guide</span>
          </button>

          {/* Campus Events Calendar */}
          <button
            type="button"
            onClick={onOpenEvents}
            className="hidden sm:flex h-11 px-3 bg-white dark:bg-[#202124] text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 rounded-2xl shadow-gmap-search border border-slate-200/90 dark:border-slate-700/80 items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
            title="Campus Events & Happenings"
          >
            <Calendar className="w-4 h-4 text-sky-500" />
            <span className="hidden xl:inline">Events</span>
          </button>

          {/* Flutter Mobile App Info Button */}
          {onOpenFlutterApp && (
            <button
              type="button"
              onClick={onOpenFlutterApp}
              className="hidden lg:flex h-11 px-3 bg-white dark:bg-[#202124] text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl shadow-gmap-search border border-slate-200/90 dark:border-slate-700/80 items-center gap-1.5 text-xs font-bold transition-all active:scale-95 group shrink-0"
              title="DishaSetu Mobile App (Flutter Native)"
            >
              <Smartphone className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="hidden 2xl:inline">Flutter App</span>
            </button>
          )}

          {/* Emergency SOS Button (Google Maps Alert Red) */}
          <button
            type="button"
            onClick={onOpenSOS}
            className="h-10 sm:h-11 px-2.5 sm:px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-gmap-search flex items-center gap-1 sm:gap-1.5 text-xs font-black transition-all active:scale-95 shrink-0"
            title="Campus Emergency Directory & SOS"
          >
            <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
            <span className="hidden xs:inline">SOS</span>
          </button>

          {/* More Options / Settings Dropdown */}
          <div ref={moreMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="h-10 w-10 sm:h-11 sm:w-11 bg-white dark:bg-[#202124] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-2xl shadow-gmap-search border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-center transition-all active:scale-95 shrink-0"
              title="More University Services & Settings"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <div
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                data-prevent-map-zoom="true"
                className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#202124] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1 overscroll-contain isolate-scroll"
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Institutional Tools
                </div>

                <button
                  type="button"
                  onClick={() => { onOpenAdmin(); setIsMoreMenuOpen(false); }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Admin GIS Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onOpenMapEditor(); setIsMoreMenuOpen(false); }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <Crosshair className="w-4 h-4 text-emerald-600" />
                  <span>Map Marker Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onViewModeChange) onViewModeChange('main-lawn-demo');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-bold"
                >
                  <Trees className="w-4 h-4 text-emerald-500" />
                  <span>Main Lawn Demo (14-Node Preview)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onViewModeChange) onViewModeChange('kml-demo');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-bold"
                >
                  <Crosshair className="w-4 h-4 text-cyan-500" />
                  <span>Demo Map (Clean White Canvas Builder)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { if (onOpenIndoorSurvey) onOpenIndoorSurvey(); setIsMoreMenuOpen(false); }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-bold"
                >
                  <LocateFixed className="w-4 h-4 text-emerald-600" />
                  <span>Indoor GPS Survey</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onOpenCafeOwner(); setIsMoreMenuOpen(false); }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <Utensils className="w-4 h-4 text-amber-500" />
                  <span>Dining Partner Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onOpenIssueReport(); setIsMoreMenuOpen(false); }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>Report Obstacle / Issue</span>
                </button>

                {onOpenFlutterApp && (
                  <button
                    type="button"
                    onClick={() => { onOpenFlutterApp(); setIsMoreMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-bold"
                  >
                    <Smartphone className="w-4 h-4 text-blue-500" />
                    <span>Flutter Mobile App</span>
                  </button>
                )}

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />

                {/* Language Switcher */}
                <div className="px-3 py-1.5">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-blue-600" />
                    <span>Language</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'kn', label: 'ಕನ್ನಡ' },
                      { code: 'hi', label: 'हिंदी' }
                    ].map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => onLanguageChange(lang.code)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          language === lang.code
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
