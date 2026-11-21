import React from 'react';
import { Smartphone, Download, CheckCircle2, ShieldCheck, WifiOff, Zap, X, Terminal, Cpu } from 'lucide-react';

export default function FlutterAppModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold leading-tight">DishaSetu Mobile App</h2>
              <p className="text-xs text-blue-100">Official Flutter & Dart Native Client</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar overscroll-contain">
          
          {/* Key Native Features */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">60fps Gestures</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  Native pinch, pan & rotation powered by Flutter Impeller.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2.5">
              <WifiOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">100% Offline Ready</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  Embedded campus fallback table keeps you moving anywhere.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="rounded-2xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-900 dark:text-blue-300">
              <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>How to Run the Mobile App on Your Machine</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">Open mobile directory:</span>
                  <pre className="mt-1 p-2 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] select-all">cd mobile</pre>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">Launch on Android Emulator or Phone:</span>
                  <pre className="mt-1 p-2 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] select-all">flutter run</pre>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">Build Production APK for Android:</span>
                  <pre className="mt-1 p-2 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] select-all">flutter build apk --release</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Status */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-900 dark:text-emerald-200">Platforms Generated: </span>
              <span className="text-emerald-700 dark:text-emerald-300">Android, iOS, Web, and Windows are fully scaffolded in <code className="font-mono bg-emerald-100 dark:bg-emerald-900/40 px-1 py-0.5 rounded">mobile/</code></span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
