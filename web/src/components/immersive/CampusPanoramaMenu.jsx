import React, { useState, useMemo } from 'react';
import {
  Compass,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  Navigation,
  Building2,
  BookOpen,
  Coffee,
  Trophy,
  Car,
  Shield,
  Layers,
  Sparkles,
  MapPin,
  X
} from 'lucide-react';

export default function CampusPanoramaMenu({
  scenes = [],
  hotspots = [],
  currentSceneId,
  onSelectScene,
  onFocusHotspot,
  onStartNavigation,
  isOpen = true,
  onToggle
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    aerial: true,
    academic: true,
    facilities: false,
    food: false,
    sports: false,
    parking: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Organize hotspots by functional campus categories
  const categories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filterItem = (item) => {
      if (!q) return true;
      return (
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.buildingShortCode?.toLowerCase().includes(q) ||
        item.sceneName?.toLowerCase().includes(q)
      );
    };

    return {
      aerial: scenes.filter(filterItem),
      academic: hotspots.filter(h =>
        h.hotspotType === 'building' &&
        ['CSE', 'SOM', 'LAW', 'SOD', 'MECH', 'SCI'].includes(h.buildingShortCode)
      ).filter(filterItem),
      facilities: hotspots.filter(h =>
        ['library', 'facility'].includes(h.hotspotType) ||
        ['LIBRARY', 'AUDITORIUM', 'ADMIN'].includes(h.buildingShortCode)
      ).filter(filterItem),
      food: hotspots.filter(h =>
        h.hotspotType === 'cafeteria' ||
        h.title?.toLowerCase().includes('cafe') ||
        h.title?.toLowerCase().includes('food') ||
        h.title?.toLowerCase().includes('nescafe')
      ).filter(filterItem),
      sports: hotspots.filter(h =>
        h.hotspotType === 'sports' ||
        h.title?.toLowerCase().includes('sports') ||
        h.title?.toLowerCase().includes('ground') ||
        h.title?.toLowerCase().includes('court')
      ).filter(filterItem),
      parking: hotspots.filter(h =>
        ['gate', 'parking'].includes(h.hotspotType) ||
        h.title?.toLowerCase().includes('gate') ||
        h.title?.toLowerCase().includes('parking')
      ).filter(filterItem)
    };
  }, [scenes, hotspots, searchQuery]);

  return (
    <>
      {/* Floating Toggle Button (visible when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-sky-400 font-bold text-xs rounded-xl shadow-2xl border border-sky-500/30 backdrop-blur-md transition-all hover:scale-105"
          title="Open Campus 360° Directory"
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Campus 360° Menu</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      )}

      {/* Main Left Accordion Menu Panel */}
      <aside
        className={`absolute top-0 left-0 bottom-0 z-20 w-80 md:w-88 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* University Header Brand */}
        <div className="p-4 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="text-[13px] font-extrabold text-white tracking-wide uppercase">
                Presidency University
              </div>
              <div className="text-[10px] text-sky-400 font-semibold tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                360° Aerial Virtual Campus
              </div>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Collapse Menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-800/60 bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter 360° locations & blocks..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Accordion Directory */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 text-xs custom-scrollbar">
          {/* Section 1: Aerial 360° Vistas */}
          <div className="py-1">
            <button
              onClick={() => toggleSection('aerial')}
              className="w-full px-4 py-2 flex items-center justify-between text-left font-bold text-slate-200 hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-2 text-sky-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="tracking-wide">Aerial 360° Vistas</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                  {categories.aerial.length}
                </span>
              </div>
              {expandedSections.aerial ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {expandedSections.aerial && (
              <div className="px-2 py-1 space-y-1 bg-slate-950/60">
                {categories.aerial.map((scene) => {
                  const isActive = currentSceneId === scene.sceneId;
                  return (
                    <div
                      key={scene.sceneId}
                      onClick={() => onSelectScene(scene.sceneId)}
                      className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? 'bg-sky-600/20 border border-sky-500/40 text-white shadow-sm'
                          : 'hover:bg-slate-900/80 text-slate-300 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-10 h-7 rounded-md overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60 relative">
                          <img
                            src={scene.thumbnail || scene.panoramaImage}
                            alt={scene.sceneName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <div className="truncate">
                          <div className={`text-xs font-semibold truncate ${isActive ? 'text-sky-300' : 'text-slate-200'}`}>
                            {scene.sceneName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Altitude: {scene.altitudeMeters || 120}m · Aerial
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        <span className="p-1 rounded-md bg-slate-800/80 text-slate-300 group-hover:text-sky-400">
                          <Eye className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Academic Blocks */}
          <div className="py-1">
            <button
              onClick={() => toggleSection('academic')}
              className="w-full px-4 py-2 flex items-center justify-between text-left font-bold text-slate-200 hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-2 text-indigo-400">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span className="tracking-wide">Academic Schools & Blocks</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  {categories.academic.length}
                </span>
              </div>
              {expandedSections.academic ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {expandedSections.academic && (
              <div className="px-2 py-1 space-y-1 bg-slate-950/60">
                {categories.academic.map((spot) => (
                  <HotspotMenuItem
                    key={spot.hotspotId}
                    hotspot={spot}
                    onFocus={() => onFocusHotspot(spot)}
                    onNavigate={() => onStartNavigation(spot)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Central Facilities & Libraries */}
          <div className="py-1">
            <button
              onClick={() => toggleSection('facilities')}
              className="w-full px-4 py-2 flex items-center justify-between text-left font-bold text-slate-200 hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-2 text-amber-400">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="tracking-wide">Facilities & Libraries</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {categories.facilities.length}
                </span>
              </div>
              {expandedSections.facilities ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {expandedSections.facilities && (
              <div className="px-2 py-1 space-y-1 bg-slate-950/60">
                {categories.facilities.map((spot) => (
                  <HotspotMenuItem
                    key={spot.hotspotId}
                    hotspot={spot}
                    onFocus={() => onFocusHotspot(spot)}
                    onNavigate={() => onStartNavigation(spot)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Cafeterias & Dining */}
          <div className="py-1">
            <button
              onClick={() => toggleSection('food')}
              className="w-full px-4 py-2 flex items-center justify-between text-left font-bold text-slate-200 hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <Coffee className="w-4 h-4 text-emerald-400" />
                <span className="tracking-wide">Cafeterias & Food Hubs</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {categories.food.length}
                </span>
              </div>
              {expandedSections.food ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {expandedSections.food && (
              <div className="px-2 py-1 space-y-1 bg-slate-950/60">
                {categories.food.map((spot) => (
                  <HotspotMenuItem
                    key={spot.hotspotId}
                    hotspot={spot}
                    onFocus={() => onFocusHotspot(spot)}
                    onNavigate={() => onStartNavigation(spot)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Sports & Athletics */}
          <div className="py-1">
            <button
              onClick={() => toggleSection('sports')}
              className="w-full px-4 py-2 flex items-center justify-between text-left font-bold text-slate-200 hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-2 text-rose-400">
                <Trophy className="w-4 h-4 text-rose-400" />
                <span className="tracking-wide">Sports & Grounds</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                  {categories.sports.length}
                </span>
              </div>
              {expandedSections.sports ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {expandedSections.sports && (
              <div className="px-2 py-1 space-y-1 bg-slate-950/60">
                {categories.sports.map((spot) => (
                  <HotspotMenuItem
                    key={spot.hotspotId}
                    hotspot={spot}
                    onFocus={() => onFocusHotspot(spot)}
                    onNavigate={() => onStartNavigation(spot)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Gates & Parking */}
          <div className="py-1">
            <button
              onClick={() => toggleSection('parking')}
              className="w-full px-4 py-2 flex items-center justify-between text-left font-bold text-slate-200 hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-2 text-cyan-400">
                <Car className="w-4 h-4 text-cyan-400" />
                <span className="tracking-wide">Gates & Parking Areas</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  {categories.parking.length}
                </span>
              </div>
              {expandedSections.parking ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {expandedSections.parking && (
              <div className="px-2 py-1 space-y-1 bg-slate-950/60">
                {categories.parking.map((spot) => (
                  <HotspotMenuItem
                    key={spot.hotspotId}
                    hotspot={spot}
                    onFocus={() => onFocusHotspot(spot)}
                    onNavigate={() => onStartNavigation(spot)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Bengaluru Campus 360° Live</span>
          </div>
          <span className="font-mono text-slate-400">v1.2</span>
        </div>
      </aside>
    </>
  );
}

/**
 * Reusable individual hotspot row item
 */
function HotspotMenuItem({ hotspot, onFocus, onNavigate }) {
  return (
    <div className="group flex items-center justify-between p-2 rounded-xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700 transition-all">
      <div
        onClick={onFocus}
        className="flex-1 min-w-0 pr-2 cursor-pointer flex items-center gap-2.5"
      >
        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 group-hover:border-sky-500/50">
          <MapPin className="w-3.5 h-3.5 text-sky-400" />
        </div>
        <div className="truncate">
          <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
            {hotspot.title}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {hotspot.buildingShortCode ? `[${hotspot.buildingShortCode}] ` : ''}
            {hotspot.description || 'Campus Facility'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onFocus}
          className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-sky-400 hover:bg-slate-700 transition-colors"
          title="Center 360° View"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onNavigate}
          className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
          title="Walk Here (Outdoor Navigation)"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}