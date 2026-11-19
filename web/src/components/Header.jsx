import React from 'react';
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
  Map,
  Crosshair,
  Box,
  Utensils,
  HelpCircle,
  Languages,
  DoorOpen
} from 'lucide-react';
import { getTranslation } from '../services/localization';

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
  locations = [],
  viewMode = 'immersive',
  onViewModeChange,
  language = 'en',
  onLanguageChange
}) {
  const t = (key) => getTranslation(language, key);

  const categories = [
    { id: 'all', label: t('overview') || 'All', icon: MapPin },
    { id: 'Gate', label: 'Gates', icon: Compass },
    { id: 'Academic', label: t('buildings') || 'Academic', icon: Building2 },
    { id: 'Cafe', label: t('foodDining') || 'Food & Dining', icon: Coffee },
    { id: 'Medical', label: t('medicalCare') || 'Medical', icon: HeartPulse },
    { id: 'Library', label: t('library') || 'Library', icon: BookOpen },
    { id: 'Parking', label: t('parking') || 'Parking', icon: Car },
    { id: 'Sports', label: t('sportsArena') || 'Sports', icon: Trophy },
    { id: 'Garden', label: t('gardens') || 'Gardens', icon: Trees },
    { id: 'Landmark', label: t('landmarks') || 'Landmarks', icon: Compass }
  ];

  return (
    <header className="bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 z-30 shrink-0 shadow-lg">
      <div className="h-16 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Brand & University Identifier */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b132b] rounded-[10px] flex items-center justify-center">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                {t('appName')}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-400 border border-blue-500/30">
                Presidency GIS
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[170px] lg:max-w-none">
              {t('universityName')}
            </div>
          </div>
        </div>

        {/* Central Search Bar */}
        <div className="flex-1 max-w-md lg:max-w-xl relative min-w-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-[#1e293b]/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* View Mode Switcher Pill */}
        <div className="hidden md:flex items-center p-1 bg-[#1e293b]/90 border border-slate-700/80 rounded-xl shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('master')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'master'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden xl:inline">Official Map</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('3d')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden xl:inline">{t('view3D')}</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('immersive')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'immersive'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden xl:inline">{t('viewAerial')}</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('map')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden xl:inline">{t('view2D')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onViewModeChange) onViewModeChange('indoor');
              if (onOpenIndoor) onOpenIndoor();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'indoor'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60'
            }`}
            title="Open D Block & Academic Indoor Navigation"
          >
            <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Indoor Plan</span>
          </button>
        </div>

        {/* Directions / Route Planning Button */}
        <button
          onClick={onOpenRoutePlanning}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-black rounded-xl shadow-md border border-sky-400/50 transition-all hover:scale-105 active:scale-95 shrink-0"
          title="Campus Wayfinding: Navigate from one place to another place"
        >
          <Navigation className="w-3.5 h-3.5 text-sky-200" />
          <span className="hidden sm:inline">Directions</span>
        </button>

        {/* Campus Survey Trigger */}
        <button
          onClick={onOpenSurvey}
          className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-md border border-amber-300 transition-all hover:scale-105 active:scale-95 shrink-0"
          title="Open Guided GPS Field Survey Checklist"
        >
          <Crosshair className="w-3.5 h-3.5 text-slate-950 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="hidden xl:inline">{t('startSurvey')}</span>
          <span className="xl:hidden">SURVEY</span>
        </button>

        {/* Feature Action Buttons: Dining, Partner Portal, Helpdesk */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Cafes & Dining Button (Rule 3) */}
          <button
            onClick={onOpenCafes}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1e293b] hover:bg-amber-600/20 hover:border-amber-500/50 text-slate-200 hover:text-amber-400 text-xs font-semibold rounded-xl border border-slate-700 shadow-sm transition-all"
            title="View Campus Cafes & Daily Menus"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">{t('foodDining')}</span>
          </button>

          {/* Cafe Owner Dashboard Button (Rule 2) */}
          <button
            onClick={onOpenCafeOwner}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1e293b] hover:bg-orange-600/20 hover:border-orange-500/50 text-slate-200 hover:text-orange-400 text-xs font-semibold rounded-xl border border-slate-700 shadow-sm transition-all"
            title="Cafe Partner Menu Management Portal (Rule 2)"
          >
            <Utensils className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden 2xl:inline">Dining Partner</span>
          </button>

          {/* Helpdesk Issue Report Button (Rule 3) */}
          <button
            onClick={onOpenIssueReport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1e293b] hover:bg-sky-600/20 hover:border-sky-500/50 text-slate-200 hover:text-sky-300 text-xs font-semibold rounded-xl border border-slate-700 shadow-sm transition-all"
            title="Report Campus Navigation Issue or Obstacle"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden 2xl:inline">{t('reportIssue')}</span>
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-900/30 border border-rose-500/30 transition-all hover:scale-105 active:scale-95 animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span className="hidden md:inline">SOS</span>
          </button>

          {/* Trilingual Language Selector */}
          <div className="flex items-center bg-[#1e293b] border border-slate-700 rounded-xl p-0.5 text-xs font-bold text-slate-300">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-1.5 py-1 rounded-lg transition-all ${
                language === 'en' ? 'bg-sky-600 text-white shadow-sm' : 'hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('kn')}
              className={`px-1.5 py-1 rounded-lg transition-all ${
                language === 'kn' ? 'bg-sky-600 text-white shadow-sm' : 'hover:text-white'
              }`}
              title="ಕನ್ನಡ (Kannada)"
            >
              ಕನ್ನ
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-1.5 py-1 rounded-lg transition-all ${
                language === 'hi' ? 'bg-sky-600 text-white shadow-sm' : 'hover:text-white'
              }`}
              title="हिंदी (Hindi)"
            >
              हिं
            </button>
          </div>

          {/* Admin Map Editor Trigger (Task 5) */}
          <button
            onClick={onOpenMapEditor}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1e293b] hover:bg-emerald-600/20 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-400 text-xs font-semibold rounded-xl border border-slate-700 shadow-sm transition-all"
            title="Edit Map Markers on Official Campus Map (Rule 1)"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden 2xl:inline">Map Editor</span>
          </button>

          {/* Admin Portal Button (Rule 1) */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 shadow-md transition-all hover:scale-105 active:scale-95"
            title="University GIS Administrator Portal (Rule 1)"
          >
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xl:inline">Admin</span>
          </button>
        </div>
      </div>

      {/* Quick Category Chips Bar */}
      <div className="px-4 py-1.5 bg-[#0b132b]/80 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm'
                  : 'bg-[#1e293b]/60 text-slate-400 hover:text-slate-200 hover:bg-[#1e293b] border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
