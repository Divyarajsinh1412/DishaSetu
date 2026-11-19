import React, { useState, useEffect, useRef } from 'react';
import DishaSetuLogo from './common/DishaSetuLogo';
import {
  Compass,
  Sparkles,
  Navigation,
  ChevronRight,
  MapPin,
  Building2,
  CheckCircle2,
  Layers,
  Coffee,
  Footprints,
  Cpu,
  ShieldCheck,
  Zap,
  Globe2
} from 'lucide-react';

/**
 * DishaSetu Premium Interactive Campus Navigation Splash Screen
 * 
 * - 100% Vector & High-Tech Cybernetic Architectural Visuals (Zero raster photos)
 * - Holographic Campus Radar & Landmark Beacon Visualization
 * - Real-time progress ticker matching Presidency University Campus GIS
 * - Instant tap/click anywhere to enter
 * - Smooth exit transition into the Master Campus Map
 */
export default function SplashScreen({
  isLoading = false,
  onFinish
}) {
  const [progress, setProgress] = useState(18);
  const [activeStep, setActiveStep] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [activeBeacon, setActiveBeacon] = useState('d_block');

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Loading Steps & Status Telemetry
  const loadingSteps = [
    { title: 'Initializing Presidency University Spatial Engine...', detail: 'Calibrating WGS-84 Coordinates (13.1718°N, 77.5362°E)', pct: 28, beacon: 'main_gate' },
    { title: 'Loading Verified Campus Master Map & 35+ Landmarks...', detail: 'Binding SVG Polygons, Gateways & Academic Quadrangles', pct: 54, beacon: 'fountain' },
    { title: 'Building Multi-Floor Indoor Navigation Graph for D Block...', detail: 'DG01–DG06 Ground Floor & 5 Upper Floors Calibrated', pct: 76, beacon: 'd_block' },
    { title: 'Syncing Live Hatti Kappi Cafe & Dining Menus...', detail: 'MongoDB Reviews, Filter Kaapi Specials & Availability Connected', pct: 92, beacon: 'hatti_kappi' },
    { title: 'Presidency University Navigation Ready', detail: 'Launching DishaSetu Intelligent Campus Portal', pct: 100, beacon: 'all' }
  ];

  useEffect(() => {
    const t0 = setTimeout(() => {
      setActiveStep(0);
      setProgress(28);
      setActiveBeacon('main_gate');
    }, 200);

    const t1 = setTimeout(() => {
      setActiveStep(1);
      setProgress(54);
      setActiveBeacon('fountain');
    }, 650);

    const t2 = setTimeout(() => {
      setActiveStep(2);
      setProgress(76);
      setActiveBeacon('d_block');
    }, 1200);

    const t3 = setTimeout(() => {
      setActiveStep(3);
      setProgress(92);
      setActiveBeacon('hatti_kappi');
    }, 1750);

    const t4 = setTimeout(() => {
      setActiveStep(4);
      setProgress(100);
      setActiveBeacon('all');
    }, 2250);

    // Guaranteed dismiss
    const t5 = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        if (typeof onFinishRef.current === 'function') {
          onFinishRef.current();
        }
      }, 500);
    }, 2800);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const handleSkip = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      if (typeof onFinishRef.current === 'function') {
        onFinishRef.current();
      }
    }, 250);
  };

  return (
    <div
      onClick={handleSkip}
      role="banner"
      aria-label="DishaSetu Campus Splash Screen"
      className={`fixed inset-0 z-[9999] bg-[#040C1A] text-white flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-102' : 'opacity-100 scale-100'
      }`}
    >
      {/* ================================================================= */}
      {/* 1. BACKGROUND GEOMETRIC BLUEPRINT MESH & RADIAL GLOWS             */}
      {/* ================================================================= */}
      {/* Architectural Isometric Grid lines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(0, 168, 120, 0.12) 0%, transparent 60%),
            linear-gradient(to right, rgba(56, 189, 248, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 48px 48px, 48px 48px'
        }}
      />

      {/* Atmospheric Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#00A878]/18 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute -bottom-32 -right-32 w-[650px] h-[650px] bg-[#0284C7]/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#06B6D4]/08 rounded-full blur-[160px] pointer-events-none" />

      {/* Floating Constellation Crosshairs */}
      <div className="absolute top-16 left-1/4 text-slate-700 font-mono text-[9px] pointer-events-none hidden sm:block">+ 13°10'18.5"N</div>
      <div className="absolute bottom-20 left-12 text-slate-700 font-mono text-[9px] pointer-events-none hidden sm:block">+ 77°32'10.3"E</div>
      <div className="absolute top-24 right-1/4 text-slate-700 font-mono text-[9px] pointer-events-none hidden sm:block">GRID REF: PU-BLR-01</div>

      {/* ================================================================= */}
      {/* 2. TOP INSTITUTIONAL BAR                                         */}
      {/* ================================================================= */}
      <header className="w-full pt-5 sm:pt-7 px-6 sm:px-12 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 shadow-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00A878] shadow-[0_0_10px_#00A878] animate-ping" />
            <span className="text-[11px] sm:text-xs font-black tracking-[0.2em] text-[#B8D5E8] uppercase">
              Presidency University
            </span>
            <span className="text-slate-500 text-[10px] hidden sm:inline">|</span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">Bengaluru Campus</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[10px] sm:text-[11px] font-mono text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full bg-emerald-950/60 backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-emerald-950/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">GIS NAV · V2.4</span>
          </div>
        </div>
      </header>

      {/* ================================================================= */}
      {/* 3. MAIN CENTER WORKSPACE: SPLIT TWO-COLUMN HERO                  */}
      {/* ================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-12 py-2 sm:py-6 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 z-20">
        
        {/* Left Column: Brand Identity & Highlights (~46%) */}
        <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-6">
          
          {/* Animated Compass Logo */}
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-sky-500/30 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative transform transition-transform duration-500 group-hover:scale-105">
              <DishaSetuLogo size={92} animated={true} />
            </div>
          </div>

          {/* Typography Titles */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] tracking-wider uppercase mb-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Smart Indoor & Outdoor Navigation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
              <span className="text-white">Disha</span>
              <span className="bg-gradient-to-r from-[#00A878] via-[#34D399] to-[#38BDF8] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,168,120,0.6)]">
                Setu
              </span>
            </h1>

            <div className="text-sm sm:text-base font-bold text-slate-300 flex items-center justify-center lg:justify-start gap-2 pt-0.5">
              <span className="text-emerald-400">दिशासेतु</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-medium text-xs sm:text-sm">Smart Campus Transit & GIS</span>
            </div>
          </div>

          {/* Tagline & Core Capabilities */}
          <p className="text-sm sm:text-base text-slate-300 italic font-medium max-w-md">
            &ldquo;Your Campus. Your Direction. Your Way.&rdquo;
          </p>

          {/* 4 Feature Badges Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-md pt-1 text-left">
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md flex items-center gap-2.5 shadow-md hover:border-emerald-500/40 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                <Compass className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">Official 2D Map</div>
                <div className="text-[10px] text-slate-400 truncate">35+ Clickable Landmarks</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md flex items-center gap-2.5 shadow-md hover:border-sky-500/40 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center shrink-0 text-sky-400">
                <Layers className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">D Block Indoor</div>
                <div className="text-[10px] text-slate-400 truncate">6 Distinct Floor Plans</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md flex items-center gap-2.5 shadow-md hover:border-amber-500/40 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
                <Coffee className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">Hatti Kappi Cafe</div>
                <div className="text-[10px] text-slate-400 truncate">Live Menus & 4.8 ★ Ratings</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md flex items-center gap-2.5 shadow-md hover:border-teal-500/40 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0 text-teal-400">
                <Footprints className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">Pedestrian GPS</div>
                <div className="text-[10px] text-slate-400 truncate">Turn-by-Turn Guidance</div>
              </div>
            </div>
          </div>

          {/* Desktop Loading Progress Bar */}
          <div className="w-full max-w-md pt-2 hidden lg:block">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-300 font-semibold truncate pr-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {loadingSteps[activeStep]?.title || 'Calibrating Campus GIS...'}
              </span>
              <span className="text-[#00A878] font-bold text-sm">{progress}%</span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#00A878] via-[#38BDF8] to-[#10B981] rounded-full transition-all duration-300 shadow-[0_0_16px_rgba(0,168,120,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
              {loadingSteps[activeStep]?.detail}
            </div>
          </div>
        </div>

        {/* Right Column: Holographic Vector Campus Twin (Zero Real Image) (~54%) */}
        <div className="w-full lg:w-7/12 flex flex-col items-center justify-center">
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/10] max-h-[380px] sm:max-h-[460px] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#00A878]/40 bg-gradient-to-br from-[#07172C] via-[#051122] to-[#040C1A] p-4 sm:p-6 flex flex-col justify-between group">
            
            {/* Top HUD Telemetry Strip */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-slate-200 backdrop-blur-md shadow-lg">
                <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-bold text-white">PRESIDENCY 3D VECTOR TWIN</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>60+ ACRES ACTIVE</span>
              </div>
            </div>

            {/* Central Holographic Campus Blueprint Vector Canvas */}
            <div className="relative w-full flex-1 flex items-center justify-center my-2">
              <svg
                viewBox="0 0 600 360"
                className="w-full h-full drop-shadow-[0_0_20px_rgba(0,168,120,0.25)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="vectorLawn" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.15" />
                  </linearGradient>

                  <linearGradient id="laserPath" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>

                  <filter id="vectorGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Radar Range Rings (Concentric cartographic guides) */}
                <circle cx="300" cy="190" r="140" stroke="#38BDF8" strokeWidth="0.75" strokeDasharray="3 4" strokeOpacity="0.3" />
                <circle cx="300" cy="190" r="95" stroke="#00A878" strokeWidth="0.75" strokeDasharray="2 3" strokeOpacity="0.35" />
                <circle cx="300" cy="190" r="50" stroke="#38BDF8" strokeWidth="0.5" strokeOpacity="0.25" />

                {/* Grid Crosshairs */}
                <line x1="300" y1="30" x2="300" y2="330" stroke="#38BDF8" strokeWidth="0.5" strokeDasharray="2 4" strokeOpacity="0.2" />
                <line x1="100" y1="190" x2="500" y2="190" stroke="#38BDF8" strokeWidth="0.5" strokeDasharray="2 4" strokeOpacity="0.2" />

                {/* Main Campus Road Network & Walking Avenues */}
                <path
                  d="M 300 45 L 300 130 L 265 190 L 160 210 L 140 310"
                  stroke="#38BDF8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeOpacity="0.35"
                />
                <path
                  d="M 300 130 L 335 190 L 440 220 L 460 300"
                  stroke="#38BDF8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeOpacity="0.35"
                />

                {/* Central Main Lawn Polygon */}
                <polygon
                  points="285,70 315,70 330,170 270,170"
                  fill="url(#vectorLawn)"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                />

                {/* Sports Complex Vector Polygons (Left) */}
                <rect x="80" y="90" width="75" height="50" rx="4" fill="#047857" fillOpacity="0.2" stroke="#10B981" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="117.5" y1="90" x2="117.5" y2="140" stroke="#10B981" strokeWidth="0.75" strokeOpacity="0.5" />
                <circle cx="117.5" cy="115" r="10" stroke="#10B981" strokeWidth="0.75" strokeOpacity="0.5" />

                {/* Academic Blocks Cluster (Left Bottom - D, E, F, L Blocks) */}
                <g className="transition-all duration-300">
                  {/* D Block Building Box */}
                  <rect
                    x="110"
                    y="190"
                    width="65"
                    height="32"
                    rx="5"
                    fill={activeBeacon === 'd_block' || activeBeacon === 'all' ? '#0284C7' : '#0F2744'}
                    fillOpacity={activeBeacon === 'd_block' ? '0.75' : '0.4'}
                    stroke={activeBeacon === 'd_block' ? '#38BDF8' : '#0284C7'}
                    strokeWidth={activeBeacon === 'd_block' ? '2.5' : '1.2'}
                    filter={activeBeacon === 'd_block' ? 'url(#vectorGlow)' : undefined}
                  />
                  <text x="142" y="210" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                    D BLOCK
                  </text>

                  {/* Multi-floor 6-level badge indicator */}
                  <rect x="156" y="185" width="22" height="11" rx="3" fill="#059669" />
                  <text x="167" y="193" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="mono">
                    6 FL
                  </text>

                  {/* E Block */}
                  <rect x="110" y="230" width="65" height="26" rx="4" fill="#0F2744" fillOpacity="0.4" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.5" />
                  <text x="142" y="247" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">E BLOCK</text>

                  {/* F Block */}
                  <rect x="110" y="264" width="65" height="26" rx="4" fill="#0F2744" fillOpacity="0.4" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.5" />
                  <text x="142" y="281" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">F BLOCK</text>
                </g>

                {/* Administrative & Central Blocks (Right Bottom - HR, Library, Auditorium) */}
                <g>
                  {/* HR Block */}
                  <rect x="270" y="220" width="55" height="30" rx="4" fill="#1E1B4B" fillOpacity="0.5" stroke="#6366F1" strokeWidth="1.2" />
                  <text x="297" y="238" fill="#C7D2FE" fontSize="9" fontWeight="bold" textAnchor="middle">HR BLOCK</text>

                  {/* Central Library */}
                  <rect x="335" y="220" width="50" height="26" rx="4" fill="#0F2744" fillOpacity="0.5" stroke="#38BDF8" strokeWidth="1.2" />
                  <text x="360" y="236" fill="#BAE6FD" fontSize="8" fontWeight="bold" textAnchor="middle">LIBRARY</text>

                  {/* Auditorium */}
                  <rect x="420" y="225" width="70" height="32" rx="5" fill="#1E1B4B" fillOpacity="0.5" stroke="#818CF8" strokeWidth="1.2" />
                  <text x="455" y="245" fill="#E0E7FF" fontSize="9" fontWeight="bold" textAnchor="middle">AUDITORIUM</text>
                </g>

                {/* Animated Pedestrian Laser Guidance Route */}
                <path
                  d="M 300 45 L 300 130 L 285 190 L 195 206"
                  stroke="url(#laserPath)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                  className="animate-[dash_1.5s_linear_infinite]"
                  filter="url(#vectorGlow)"
                />

                {/* 1. Beacon: Main Gate (North) */}
                <g transform="translate(300, 45)">
                  <circle r="14" fill="#10B981" fillOpacity="0.2" className="animate-ping" />
                  <circle r="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                  <circle r="3" fill="#FFFFFF" />
                  <rect x="-38" y="-24" width="76" height="16" rx="4" fill="#064E3B" stroke="#10B981" strokeWidth="1" />
                  <text x="0" y="-13" fill="#ECFDF5" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                    MAIN GATE (GPS)
                  </text>
                </g>

                {/* 2. Beacon: Central Fountain (Roundabout) */}
                <g transform="translate(285, 190)">
                  <circle r="18" fill="#38BDF8" fillOpacity="0.15" />
                  <circle r="11" fill="#0284C7" stroke="#38BDF8" strokeWidth="2" />
                  <circle r="4" fill="#FFFFFF" />
                  <text x="0" y="24" fill="#7DD3FC" fontSize="8" fontWeight="bold" textAnchor="middle">
                    FOUNTAIN
                  </text>
                </g>

                {/* 3. Beacon: Hatti Kappi Cafe (PU-CAFE-D-BLOCK) */}
                <g transform="translate(195, 206)">
                  <circle r="14" fill="#F59E0B" fillOpacity="0.25" className="animate-pulse" />
                  <circle r="9" fill="#D97706" stroke="#FDE68A" strokeWidth="2" />
                  {/* Coffee Icon Shape */}
                  <circle r="3.5" fill="#FFFFFF" />
                  
                  {/* Floating Hatti Kappi Pill */}
                  <g transform="translate(0, -22)">
                    <rect x="-36" y="-7" width="72" height="15" rx="4" fill="#451A03" stroke="#F59E0B" strokeWidth="1" />
                    <text x="0" y="4" fill="#FEF3C7" fontSize="8" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">
                      ☕ HATTI KAPPI
                    </text>
                  </g>
                </g>
              </svg>

              {/* Bottom Left Live Landmark Label */}
              <div className="absolute bottom-1 left-2 z-10 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-300 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Navigating to: <strong className="text-white">D Block & Hatti Kappi</strong></span>
              </div>

              {/* Bottom Right Distance HUD */}
              <div className="absolute bottom-1 right-2 z-10 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-emerald-400 backdrop-blur-md font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>210m · 3 MIN WALK</span>
              </div>
            </div>

            {/* Bottom Cyber Status Line */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80 z-10">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>All 12 Blocks & Walkways Verified</span>
              </span>
              <span className="text-sky-400">Dijkstra Shortest Path · Active</span>
            </div>
          </div>

          {/* Mobile Loading Progress Bar (Visible on mobile screens < 1024px) */}
          <div className="w-full max-w-sm pt-4 lg:hidden">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300 font-semibold truncate pr-2 text-[11px]">
                {loadingSteps[activeStep]?.title}
              </span>
              <span className="text-[#00A878] font-bold text-xs">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#00A878] via-[#38BDF8] to-[#10B981] rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(0,168,120,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

      </main>

      {/* ================================================================= */}
      {/* 4. BOTTOM FOOTER & TAP TO SKIP ACTION                             */}
      {/* ================================================================= */}
      <footer className="w-full pb-5 sm:pb-7 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 z-20">
        <div className="flex items-center gap-2 text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#00A878]" />
          <span>Presidency University © 2026 · Bengaluru, Karnataka</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1.5 text-slate-200 hover:text-white font-bold transition-all bg-gradient-to-r from-emerald-600/30 to-sky-600/30 hover:from-emerald-600/50 hover:to-sky-600/50 px-4 py-1.5 rounded-full border border-emerald-500/40 shadow-lg hover:scale-105 active:scale-95"
          >
            <span>Click or Tap Anywhere to Enter</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          </button>
        </div>
      </footer>
    </div>
  );
}
