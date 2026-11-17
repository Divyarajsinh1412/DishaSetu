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
        return <CornerUpRight className="w-6 h-6 text-sky-400" />;
      case 'turn-left':
        return <CornerUpLeft className="w-6 h-6 text-sky-400" />;
      case 'arrive':
        return <MapPin className="w-6 h-6 text-rose-400" />;
      case 'depart':
      default:
        return <ArrowUp className="w-6 h-6 text-emerald-400" />;
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[450] w-[95%] max-w-xl bg-[#0f172a]/95 backdrop-blur-xl border border-sky-500/30 rounded-2xl shadow-2xl p-4 text-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Live Outdoor Navigation
          </span>
          {route.accessible && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] text-emerald-400 flex items-center gap-1">
              <Accessibility className="w-3 h-3" /> Step-Free
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoice}
            className={`p-1.5 rounded-lg border transition-colors ${
              voiceEnabled
                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={voiceEnabled ? 'Mute Voice Guidance' : 'Enable Voice Guidance'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="End Navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Instruction Card */}
      <div className="mt-3 flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
          {renderTurnIcon(currentStep?.turnType)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
            <span>Step {currentStepIndex + 1} of {totalSteps}</span>
            {currentStep?.distanceMeters > 0 && (
              <span className="font-semibold text-slate-300">{currentStep.distanceMeters} meters</span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
            {currentStep?.instruction}
          </h3>

          {/* Next Step Preview */}
          {currentStepIndex + 1 < totalSteps && (
            <p className="text-[11px] text-slate-400 truncate mt-1">
              Then: {waypoints[currentStepIndex + 1]?.instruction}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Metrics & Step Controls */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
        {/* Distance & Time summary */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Footprints className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold text-white">{route.distanceMeters} m</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white">~{route.estimatedWalkingMinutes} min</span>
          </div>
        </div>

        {/* Step Prev / Next Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 transition-colors"
            title="Previous Turn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextStep}
            disabled={currentStepIndex === totalSteps - 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 transition-colors"
            title="Next Turn"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {onRecenter && (
            <button
              onClick={onRecenter}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors ml-1 shadow-md"
              title="Recenter Map on Active Route"
            >
              <Compass className="w-3.5 h-3.5" /> Recenter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
