import React, { useState, useEffect, useRef } from 'react';
import DishaSetuLogo from './common/DishaSetuLogo';
import { Compass, Sparkles, Navigation, ChevronRight, MapPin, Building2, CheckCircle2 } from 'lucide-react';
import aerialCampusImg from '../assets/pu_aerial_central_campus.jpg';

/**
 * DishaSetu Premium Professional Splash Screen
 * 
 * Guarantee:
 * - Content is ALWAYS VISIBLE from frame 0 (never blank or stuck in opacity-0)
 * - Uses imported local asset + public path fallback + attractive vector gradient fallback
 * - Auto-dismisses in 2.5–2.8 seconds regardless of network/API state
 * - Tap anywhere to skip instantly
 * - Error resilient: no unhandled exceptions
 */
export default function SplashScreen({
  isLoading = false,
  onFinish
}) {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing Presidency Campus GIS Engine...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    // Stage 1: Fast start progress (200ms)
    const t1 = setTimeout(() => {
      setProgress(40);
      setStatusText('Syncing Verified Academic Blocks & Entrances...');
    }, 300);

    // Stage 2: Middle progress (800ms)
    const t2 = setTimeout(() => {
      setProgress(70);
      setStatusText('Calibrating Pedestrian Dijkstra Routing Engine...');
    }, 850);

    // Stage 3: Near complete (1500ms)
    const t3 = setTimeout(() => {
      setProgress(95);
      setStatusText('Presidency University Campus Ready');
    }, 1500);

    // Stage 4: 100% ready (2200ms)
    const t4 = setTimeout(() => {
      setProgress(100);
      setStatusText('Launching DishaSetu...');
    }, 2100);

    // Stage 5: Guaranteed auto-dismissal (2600ms) - Never waits indefinitely!
    const t5 = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        if (typeof onFinishRef.current === 'function') {
          onFinishRef.current();
        }
      }, 500); // 500ms exit fade
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []); // Run ONCE on mount

  // Instant skip on click/tap
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
      className={`fixed inset-0 z-[9999] bg-[#071B32] text-white flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-102' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ambient Radial Glows */}
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-[#00A878]/15 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-[#38BDF8]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#071B32] pointer-events-none" />

      {/* Top University Identity Bar */}
      <header className="w-full pt-6 sm:pt-8 px-6 sm:px-12 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-[#00A878] shadow-[0_0_8px_#00A878] animate-ping" />
          <div className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#B8D5E8] uppercase">
            Presidency University Bengaluru
          </div>
        </div>

        <div className="text-[10px] sm:text-[11px] font-mono text-emerald-400/90 border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-950/40 backdrop-blur-md flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Campus GIS · Live</span>
        </div>
      </header>

      {/* Main Center Area: Split Responsive Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-12 py-4 sm:py-6 flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-14 z-20">
        
        {/* Left Brand Column (~45% on desktop) */}
        <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-6">
          
          {/* Compass Logo Icon with Gyroscope Ring */}
          <div className="transform transition-transform duration-500 hover:scale-105">
            <DishaSetuLogo size={84} animated={true} />
          </div>

          {/* DishaSetu Wordmark */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
              <span className="text-white">Disha</span>
              <span className="text-[#00A878] drop-shadow-[0_0_30px_rgba(0,168,120,0.6)]">Setu</span>
            </h1>
            <div className="text-xs sm:text-sm font-semibold tracking-wider text-[#B8D5E8] uppercase mt-2">
              Smart Campus Navigation System
            </div>
          </div>

          {/* Tagline & Supporting Pillars */}
          <div className="space-y-2.5">
            <p className="text-base sm:text-lg lg:text-xl font-medium text-slate-200 tracking-wide italic">
              &ldquo;Your Campus. Your Direction. Your Way.&rdquo;
            </p>
            <div className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#00A878] uppercase flex items-center justify-center lg:justify-start gap-2.5">
              <span>Explore</span>
              <span className="text-slate-500">•</span>
              <span>Discover</span>
              <span className="text-slate-500">•</span>
              <span>Navigate</span>
            </div>
          </div>

          {/* Desktop Loading Status & Progress Bar */}
          <div className="w-full max-w-sm pt-2 hidden lg:block">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-mono">
              <span className="truncate pr-2">{statusText}</span>
              <span className="text-[#00A878] font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#00A878] via-[#38BDF8] to-[#10B981] rounded-full transition-all duration-300 shadow-[0_0_14px_rgba(0,168,120,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Aerial Campus Card (~55% on desktop, central on mobile) */}
        <div className="w-full lg:w-7/12 flex flex-col items-center justify-center">
          <div className="relative w-full aspect-[16/9] sm:aspect-[16/10] max-h-[360px] sm:max-h-[440px] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#00A878]/30 bg-slate-900 group">
            
            {/* Visual Image / High-End Fallback */}
            {!imageFailed ? (
              <img
                src={aerialCampusImg || '/panoramas/pu_aerial_central_campus.jpg'}
                alt="Presidency University Bengaluru Aerial Campus View"
                className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-7000 ease-out brightness-95 contrast-105"
                onError={() => setImageFailed(true)}
              />
            ) : (
              /* Premium Gradient Fallback if image path is unavailable */
              <div className="w-full h-full bg-gradient-to-br from-[#0B2447] via-[#071B32] to-[#0A192F] flex flex-col items-center justify-center p-8 text-center relative">
                <div className="w-20 h-20 rounded-2xl bg-[#00A878]/20 border border-[#00A878]/40 flex items-center justify-center mb-4 text-[#00A878]">
                  <Building2 className="w-10 h-10" />
                </div>
                <div className="text-xl font-bold text-white mb-1">Presidency University Bengaluru</div>
                <div className="text-xs text-[#B8D5E8] font-mono">Itgalpur, Rajanakunte Campus · 60+ Acres</div>
              </div>
            )}

            {/* Gradient Overlays for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#071B32] via-transparent to-[#071B32]/30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071B32]/40 via-transparent to-[#071B32]/40 pointer-events-none" />

            {/* Aerial Badge Top Left */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 bg-[#071B32]/90 backdrop-blur-md rounded-xl border border-slate-700/80 text-xs font-semibold text-slate-100 shadow-xl">
              <MapPin className="w-3.5 h-3.5 text-[#00A878]" />
              <span>Presidency Central Quad Aerial</span>
            </div>

            {/* Coordinates Badge Bottom Right */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-3 py-1 bg-[#071B32]/90 backdrop-blur-md rounded-xl border border-slate-700/80 text-[11px] font-mono text-[#B8D5E8] shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Bengaluru · 13.1718°N, 77.5362°E</span>
            </div>
          </div>

          {/* Mobile Loading Indicator Bar (Visible on mobile screens) */}
          <div className="w-full max-w-sm pt-4 lg:hidden">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-mono">
              <span className="truncate pr-2 text-[11px]">{statusText}</span>
              <span className="text-[#00A878] font-bold text-[11px]">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-[#00A878] via-[#38BDF8] to-[#10B981] rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(0,168,120,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Footer Info & Tap to Skip Hint */}
      <footer className="w-full pb-5 sm:pb-7 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-slate-400 z-20">
        <div className="flex items-center gap-2 text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#00A878]" />
          <span>Presidency University © 2026 · Bengaluru, Karnataka</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 hover:text-white font-medium transition-colors bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
          <span>Tap anywhere to continue</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#00A878] animate-pulse" />
        </div>
      </footer>
    </div>
  );
}
