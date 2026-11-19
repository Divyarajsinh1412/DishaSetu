import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import { getTranslation } from '../services/localization';
import { COMPLETE_CAMPUS_CATALOG } from '../services/campusCatalog';
import { MASTER_CAMPUS_FEATURES } from '../data/masterMapFeatures';

export default function Header({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategorySelect,
  onOpenSOS,
  onOpenAdmin,
  onOpenSurvey,
  onOpenIndoor,
  onOpenCafes,
  onOpenCafeOwner,
  onOpenIssueReport,
  onOpenMapEditor,
  onOpenRoutePlanning,
  onSelectLocation,
  locations = [],
  viewMode = 'master',
  onViewModeChange,
  language = 'en',
  onLanguageChange
}) {
  const t = (key) => getTranslation(language, key);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const moreMenuRef = useRef(null);

  // Close search suggestions and more menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Official Institutional Campus Categories
  const categories = [
    { id: 'all', label: 'Campus Overview', icon: MapPin },
    { id: 'Gate', label: 'Gates', icon: Compass },
    { id: 'Academic', label: 'Academic Buildings', icon: Building2 },
    { id: 'Department', label: 'Departments', icon: Building2 },
    { id: 'Library', label: 'Libraries', icon: BookOpen },
    { id: 'Cafe', label: 'Food & Dining', icon: Coffee },
    { id: 'Medical', label: 'Medical Care', icon: HeartPulse },
    { id: 'Parking', label: 'Parking', icon: Car },
    { id: 'Sports', label: 'Sports', icon: Trophy },
    { id: 'Garden', label: 'Gardens & Quads', icon: Trees },
    { id: 'Facility', label: 'Facilities', icon: Layers },
    { id: 'Landmark', label: 'Landmarks', icon: Compass }
  ];

  // Comprehensive Instant Search Engine
  const searchResults = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q || q.length < 2) return [];

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

    return hits.slice(0, 10);
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

  return (
    <header className="bg-[#0b1a30]/95 backdrop-blur-md border-b border-[#1b3152] z-40 shrink-0 shadow-lg text-slate-100">
      {/* Primary Top Bar */}
      <div className="h-16 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* University Brand Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1d4ed8] via-[#0f3460] to-[#b48c26] p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-[#08172c] rounded-[10px] flex items-center justify-center">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-sm sm:text-base tracking-tight text-white">
                DishaSetu
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#1e3a8a]/40 text-[#93c5fd] border border-[#2563eb]/40 font-mono">
                Presidency GIS
              </span>
            </div>
            <div className="text-[10.5px] text-slate-300 font-medium truncate max-w-[170px] sm:max-w-none">
              Presidency University Bengaluru
            </div>
          </div>
        </div>

        {/* Central Search Bar with Instant Results Dropdown */}
        <div ref={searchContainerRef} className="flex-1 max-w-md lg:max-w-xl relative min-w-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search buildings, rooms (DG01), departments, cafes, gates..."
              className="w-full pl-9 pr-8 py-2 bg-[#081528] border border-[#1e385c] rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Instant Search Suggestions Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#081528]/98 backdrop-blur-2xl border border-[#23426e] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2.5 border-b border-[#1b3152] flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Campus Directory Matches ({searchResults.length})</span>
                <span className="text-[10px] text-slate-500 font-normal">Press Esc to close</span>
              </div>
              <div className="max-h-72 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                {searchResults.map((hit) => (
                  <div
                    key={hit.id}
                    onClick={() => handleSelectSearchResult(hit)}
                    className="w-full p-2.5 rounded-xl text-left flex items-center justify-between hover:bg-[#132847] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-[#0e213d] border border-[#23426e] flex items-center justify-center shrink-0 text-[#93c5fd] group-hover:text-[#d4af37] group-hover:border-[#d4af37]/40 transition-colors">
                        {hit.category === 'Academic' ? <Building2 className="w-4 h-4" /> :
                         hit.category === 'Cafe' ? <Coffee className="w-4 h-4" /> :
                         hit.category === 'Gate' ? <Compass className="w-4 h-4" /> :
                         hit.category === 'Library' ? <BookOpen className="w-4 h-4" /> :
                         hit.category === 'Medical' ? <HeartPulse className="w-4 h-4" /> :
                         <MapPin className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-[#93c5fd] truncate">
                            {hit.name}
                          </span>
                          {hit.code && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#0b1b33] text-slate-300 border border-[#1b3152]">
                              {hit.code}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {hit.category} · {hit.description || 'Presidency University Campus'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={(e) => handleDirectNavigate(hit, e)}
                        className="px-2.5 py-1 rounded-lg bg-[#1e3a8a]/70 hover:bg-[#2563eb] text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all"
                        title="Navigate here"
                      >
                        <NavigationIcon className="w-3 h-3 text-sky-200" />
                        <span>Navigate</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View Mode Switcher Toolbar */}
        <div className="hidden lg:flex items-center p-1 bg-[#081528] border border-[#1b3152] rounded-xl shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('master')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'master'
                ? 'bg-[#1e3a8a] text-white shadow-md border border-[#3b82f6]/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-sky-300" />
            <span>Official Map</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '3d'
                ? 'bg-[#1e3a8a] text-white shadow-md border border-[#3b82f6]/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-sky-300" />
            <span>3D Campus</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('immersive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'immersive'
                ? 'bg-[#1e3a8a] text-white shadow-md border border-[#3b82f6]/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>360° Aerial</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-[#1e3a8a] text-white shadow-md border border-[#3b82f6]/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-sky-300" />
            <span>2D GPS Map</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onViewModeChange) onViewModeChange('indoor');
              if (onOpenIndoor) onOpenIndoor();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'indoor'
                ? 'bg-[#1e3a8a] text-white shadow-md border border-[#3b82f6]/40'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Indoor Navigation</span>
          </button>
        </div>

        {/* Primary Action Buttons: Directions, Dining, Survey, More */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Directions / Wayfinding Route Planner */}
          <button
            type="button"
            onClick={() => onOpenRoutePlanning && onOpenRoutePlanning()}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-gradient-to-r from-[#1d4ed8] to-[#1e40af] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white text-xs font-black rounded-xl shadow-md border border-[#3b82f6]/50 transition-all hover:scale-105 active:scale-95 shrink-0"
            title="Campus Wayfinding: Navigate from one place to another place"
          >
            <NavigationIcon className="w-3.5 h-3.5 text-sky-200" />
            <span className="hidden sm:inline">Directions</span>
          </button>

          {/* Food & Dining Modal Trigger */}
          <button
            type="button"
            onClick={onOpenCafes}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#0e223d] hover:bg-[#15345d] text-slate-200 hover:text-[#d4af37] text-xs font-semibold rounded-xl border border-[#1b365c] shadow-sm transition-all"
            title="Campus Cafeteria, Hatti Kappi & Menus"
          >
            <Coffee className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden md:inline">Food & Dining</span>
          </button>

          {/* Campus Field Survey Trigger */}
          <button
            type="button"
            onClick={onOpenSurvey}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-[#0e223d] hover:bg-[#15345d] text-slate-200 hover:text-emerald-300 text-xs font-semibold rounded-xl border border-[#1b365c] shadow-sm transition-all"
            title="Campus GPS Field Survey Checklist"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>Campus Survey</span>
          </button>

          {/* More Options / Institutional Tools Dropdown */}
          <div ref={moreMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-2 rounded-xl bg-[#0e223d] hover:bg-[#15345d] border border-[#1b365c] text-slate-300 hover:text-white transition-all shadow-sm"
              title="More University Services & Settings"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#081528]/98 backdrop-blur-2xl border border-[#23426e] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Institutional Tools
                </div>

                <button
                  type="button"
                  onClick={() => { onOpenAdmin(); setIsMoreMenuOpen(false); }}
                  className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-[#132847] flex items-center gap-2.5 transition-colors"
                >
                  <Shield className="w-4 h-4 text-sky-400" />
                  <span>Admin GIS Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onOpenMapEditor(); setIsMoreMenuOpen(false); }}
                  className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-[#132847] flex items-center gap-2.5 transition-colors"
                >
                  <Crosshair className="w-4 h-4 text-emerald-400" />
                  <span>Map Marker Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onOpenCafeOwner(); setIsMoreMenuOpen(false); }}
                  className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-[#132847] flex items-center gap-2.5 transition-colors"
                >
                  <Utensils className="w-4 h-4 text-amber-400" />
                  <span>Dining Partner Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onOpenIssueReport(); setIsMoreMenuOpen(false); }}
                  className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-[#132847] flex items-center gap-2.5 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-sky-400" />
                  <span>Report Obstacle / Issue</span>
                </button>

                <div className="h-px bg-[#1b3152] my-1" />

                {/* Language Switcher */}
                <div className="px-2.5 py-1.5">
                  <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <Languages className="w-3 h-3 text-[#d4af37]" />
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
                            ? 'bg-[#1e3a8a] text-white shadow-sm'
                            : 'bg-[#0e223d] text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-[#1b3152] my-1" />

                {/* Emergency SOS */}
                <button
                  type="button"
                  onClick={() => { onOpenSOS(); setIsMoreMenuOpen(false); }}
                  className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold text-rose-300 hover:bg-rose-950/60 flex items-center gap-2.5 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Emergency Directory (SOS)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Campus Category Pills Bar */}
      <div className="px-3 sm:px-4 py-1.5 bg-[#081528]/90 border-t border-[#162a45] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-[#1e3a8a] text-[#d4af37] border border-[#3b82f6]/50 shadow-sm'
                  : 'bg-[#0d1f38]/70 text-slate-300 hover:text-white hover:bg-[#132c4f] border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#d4af37]' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
