import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { message, type = 'info' } = toast;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      accent: 'bg-emerald-500'
    },
    error: {
      bg: 'bg-rose-950/95 border-rose-500/50 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      accent: 'bg-rose-500'
    },
    warning: {
      bg: 'bg-amber-950/95 border-amber-500/50 text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      accent: 'bg-amber-500'
    },
    info: {
      bg: 'bg-slate-900/95 border-sky-500/50 text-sky-200',
      icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
      accent: 'bg-sky-500'
    }
  }[type] || {
    bg: 'bg-slate-900/95 border-slate-700 text-slate-200',
    icon: <Info className="w-5 h-5 text-slate-400 shrink-0" />,
    accent: 'bg-slate-500'
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`relative flex items-center gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${typeConfig.bg}`}>
        <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-full ${typeConfig.accent} opacity-60`} />
        {typeConfig.icon}
        <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed pr-2">
          {message}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
