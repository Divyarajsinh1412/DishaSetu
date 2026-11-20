import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Compass,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  MapPin,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
  Footprints,
  Clock,
  Accessibility
} from 'lucide-react';
import { clientRoutingEngine } from '../services/routingEngine';

export default function NavigationGuidanceBar({
  route,
  onClose,
  onRecenter,
  userLocation
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const waypoints = route?.waypoints || [];
  const totalSteps = waypoints.length;
  const currentStep = waypoints[currentStepIndex] || waypoints[0];

  // Speak current instruction when step changes if voice enabled
  useEffect(() => {
    if (voiceEnabled && currentStep) {
      clientRoutingEngine.speakInstruction(currentStep.instruction);
    }
  }, [currentStepIndex, voiceEnabled, currentStep]);

  const toggleVoice = () => {
    if (voiceEnabled) {
      clientRoutingEngine.stopSpeech();
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
      if (currentStep) {
        clientRoutingEngine.speakInstruction(currentStep.instruction);
      }
    }
  };

  const nextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  if (!route) return null;

  // Choose icon based on turnType
  const renderTurnIcon = (type) => {
    switch (type) {
      case 'turn-right':
        return <CornerUpRight className="w-8 h-8 text-white" />;
      case 'turn-left':
        return <CornerUpLeft className="w-8 h-8 text-white" />;
      case 'arrive':
        return <MapPin className="w-8 h-8 text-rose-300" />;
      case 'depart':
      default:
        return <ArrowUp className="w-8 h-8 text-white" />;
    }
  };

  // Calculate ETA arrival time string
  const arrivalTimeStr = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + (route.estimatedWalkingMinutes || 4));
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  })();

  return (
    <>
      {/* 1. TOP GOOGLE MAPS NAVIGATION BANNER (Dark Emerald Green #006039) */}
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        data-prevent-map-zoom="true"
        className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-[460] w-[calc(100%-24px)] max-w-xl bg-[#006039] text-white rounded-3xl shadow-2xl p-3.5 sm:p-4 border border-emerald-400/30 animate-in fade-in slide-in-from-top-4 duration-200 select-none overscroll-contain isolate-scroll"
      >
        <div className="flex items-start gap-3.5">
          {/* Big Maneuver Direction Arrow Box */}
          <div className="w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
            {renderTurnIcon(currentStep?.turnType)}
          </div>

          {/* Navigation Instruction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-emerald-200 text-[11px] font-bold mb-0.5">
              <span>
                {currentStep?.distanceMeters > 0 ? `In ${currentStep.distanceMeters} meters` : 'Current Step'}
              </span>
              <div className="flex items-center gap-2">
                {route.accessible && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-400/40 text-[10px] text-emerald-300 flex items-center gap-1 font-semibold">
                    <Accessibility className="w-3 h-3" /> Step-Free
                  </span>
                )}
                <button
                  type="button"
                  onClick={toggleVoice}
                  className="p-1 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
                  title={voiceEnabled ? 'Mute Audio Guidance' : 'Enable Audio Guidance'}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-emerald-400/60" />}
                </button>
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
              {currentStep?.instruction}
            </h3>

            {/* Next Step Preview */}
            {currentStepIndex + 1 < totalSteps && (
              <p className="text-[11px] text-emerald-200/80 truncate mt-1">
                Then: {waypoints[currentStepIndex + 1]?.instruction}
              </p>
            )}
          </div>

          {/* Close Navigation 'X' */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/25 text-emerald-100 hover:text-white transition-colors shrink-0"
            title="Exit Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. BOTTOM GOOGLE MAPS NAVIGATION FOOTER (ETA, Distance & Step Navigation) */}
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        data-prevent-map-zoom="true"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[460] w-[calc(100%-24px)] max-w-md bg-white dark:bg-[#202124] text-slate-800 dark:text-slate-100 rounded-3xl shadow-gmap-card border border-slate-200/90 dark:border-slate-700/80 p-3 sm:px-4 flex items-center justify-between gap-3 select-none animate-in fade-in slide-in-from-bottom-4 duration-200 overscroll-contain isolate-scroll"
      >
        {/* ETA & Distance Summary */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-[#1e8e3e] dark:text-[#81c995]">
              {route.estimatedWalkingMinutes || 4} min
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              ({route.distanceMeters} m)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Est. Arrival: <span className="font-bold text-slate-700 dark:text-slate-300">{arrivalTimeStr}</span>
          </div>
        </div>

        {/* Step Prev / Next Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 transition-colors"
            title="Previous step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 px-1">
            {currentStepIndex + 1}/{totalSteps}
          </span>

          <button
            type="button"
            onClick={nextStep}
            disabled={currentStepIndex === totalSteps - 1}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 transition-colors"
            title="Next step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Red Circular End Button */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 px-3.5 rounded-full bg-[#d93025] hover:bg-[#b71c1c] text-white text-xs font-extrabold flex items-center gap-1 shadow-md transition-all active:scale-95 shrink-0"
          title="Exit Navigation"
        >
          <X className="w-4 h-4" />
          <span className="hidden xs:inline">Exit</span>
        </button>
      </div>
    </>
  );
}
