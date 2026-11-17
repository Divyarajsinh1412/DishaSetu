import React, { useState, useEffect } from 'react';
import DishaSetuLogo from './common/DishaSetuLogo';
import { Compass, Sparkles, Navigation, ChevronRight, MapPin } from 'lucide-react';

export default function SplashScreen({
  isLoading = false,
  onFinish
}) {
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState('Initializing Presidency Campus GIS Engine...');
  const [stage, setStage] = useState(0); // 0 = start, 1 = logo, 2 = title, 3 = image, 4 = tagline, 5 = ready
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Stage 1: Logo & University ID (100ms)
    const t1 = setTimeout(() => {
      setStage(1);
      setProgress(25);
    }, 100);

    // Stage 2: Title Wordmark (400ms)
    const t2 = setTimeout(() => {
      setStage(2);
      setProgress(50);
      setStatusText('Syncing Verified Academic Blocks & Walking Paths...');
    }, 400);

    // Stage 3: Aerial Image Reveal (700ms)
    const t3 = setTimeout(() => {
      setStage(3);
      setProgress(75);
      setStatusText('Calibrating Pedestrian Dijkstra Routing Engine...');
    }, 700);

    // Stage 4: Tagline & Supporting text (1100ms)
    const t4 = setTimeout(() => {
      setStage(4);
      setProgress(95);
      setStatusText('Presidency University Campus Ready.');
    }, 1100);

    // Stage 5: Finalize and trigger fade-out (2200ms)
    const t5 = setTimeout(() => {
      setProgress(100);
      setStage(5);
      // Wait for any remaining data loading or at least 2.4s
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 600); // 600ms fade transition
      }, 300);
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onFinish]);

  // Instant skip on user tap
  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[1000] bg-[#071B32] text-white flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-opacity duration-700 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle Background Radial Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#00A878]/15 via-[#38BDF8]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#00A878]/10 via-[#071B32] to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top University Identity Bar */}
      <header className="w-full pt-8 sm:pt-10 px-6 sm:px-12 flex items-center justify-between z-20">
        <div className={`flex items-center gap-2.5 transition-all duration-700 ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <div className="w-2 h-2 rounded-full bg-[#00A878] animate-pulse" />
          <div className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#B8D5E8] uppercase">
            Presidency University Bengaluru
          </div>
        </div>

        <div className={`text-[10px] sm:text-[11px] font-mono text-slate-400 border border-slate-700/60 px-2.5 py-1 rounded-full bg-slate-900/50 backdrop-blur-md transition-all duration-700 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          Smart Campus GIS · v1.2
        </div>
      </header>

      {/* Main Center Area: Split Responsive Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-12 py-4 sm:py-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 z-20">
        {/* Left Brand Column (40–45% on desktop) */}
        <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-6">
          {/* Compass Logo Icon with Glow */}
          <div className={`transition-all duration-700 ease-out transform ${stage >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'}`}>
            <DishaSetuLogo size={80} animated={true} />
          </div>

          {/* DishaSetu Wordmark */}
          <div className={`transition-all duration-700 delay-100 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span className="text-white">Disha</span>
              <span className="text-[#00A878] drop-shadow-[0_0_25px_rgba(0,168,120,0.5)]">Setu</span>
            </h1>
            <div className="text-xs sm:text-sm font-semibold tracking-wider text-[#B8D5E8] uppercase mt-1">
              Smart Campus Navigation System
            </div>
          </div>

          {/* Taglines */}
          <div className={`space-y-2 transition-all duration-700 delay-200 ${stage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-base sm:text-lg lg:text-xl font-medium text-slate-200 tracking-wide italic">
              &ldquo;Your Campus. Your Direction. Your Way.&rdquo;
            </p>
            <div className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#00A878] uppercase flex items-center justify-center lg:justify-start gap-2">
              <span>Explore</span>
              <span className="text-slate-500">•</span>
              <span>Discover</span>
              <span className="text-slate-500">•</span>
              <span>Navigate</span>
            </div>
          </div>

          {/* Desktop Minimal Loading Status & Bar */}
          <div className="w-full max-w-sm pt-4 hidden lg:block">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span className="truncate pr-2">{statusText}</span>
              <span className="text-[#00A878] font-bold">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-[#00A878] via-[#38BDF8] to-[#10B981] rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(0,168,120,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Aerial Photograph Column (55–60% on desktop, central on mobile) */}
        <div className={`w-full lg:w-7/12 flex flex-col items-center justify-center transition-all duration-1000 ease-out transform ${
          stage >= 3 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-6'
        }`}>
          <div className="relative w-full aspect-[16/9] sm:aspect-[16/10] max-h-[380px] sm:max-h-[460px] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-900 group">
            {/* Actual University Aerial Photograph */}
            <img
              src="/panoramas/aerial_central_campus.png"
              alt="Presidency University Bengaluru Aerial Campus"
              className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-10000 ease-out brightness-95 contrast-105"
              onError={(e) => {
                // Refined navy gradient visual fallback
                e.target.style.display = 'none';
              }}
            />

            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#071B32] via-transparent to-[#071B32]/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071B32]/60 via-transparent to-[#071B32]/60 pointer-events-none" />

            {/* Aerial Badge Overlay */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 bg-[#071B32]/85 backdrop-blur-md rounded-xl border border-slate-700/70 text-xs font-semibold text-slate-200 shadow-xl">
              <MapPin className="w-3.5 h-3.5 text-[#00A878]" />
              <span>Presidency University Campus Aerial</span>
            </div>

            {/* Bottom Caption Pill */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-3 py-1 bg-[#071B32]/85 backdrop-blur-md rounded-xl border border-slate-700/70 text-[11px] font-mono text-[#B8D5E8]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Bengaluru · 13.1718°N, 77.5362°E</span>
            </div>
          </div>
        </div>

        {/* Mobile Loading Indicator Bar (Visible below image on small screens) */}
        <div className="w-full max-w-sm pt-2 lg:hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
            <span className="truncate pr-2 text-[11px]">{statusText}</span>
            <span className="text-[#00A878] font-bold text-[11px]">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-[#00A878] via-[#38BDF8] to-[#10B981] rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(0,168,120,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </main>

      {/* Bottom Footer Info & Tap to Enter */}
      <footer className="w-full pb-6 sm:pb-8 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 z-20">
        <div>
          Presidency University © 2026 · Rajanakunte, Yelahanka, Bengaluru
        </div>

        <div className="flex items-center gap-2 text-slate-400 hover:text-white font-medium transition-colors">
          <span>Tap anywhere to enter</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#00A878] animate-pulse" />
        </div>
      </footer>
    </div>
  );
}
