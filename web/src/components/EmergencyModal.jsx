import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Phone,
  Shield,
  HeartPulse,
  Send,
  CheckCircle2,
  MapPin
} from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose }) {
  const [sosSent, setSosSent] = useState(false);
  const [emergencyType, setEmergencyType] = useState('Medical');

  if (!isOpen) return null;

  const handleSendSOS = () => {
    setSosSent(true);
    setTimeout(() => {
      // Auto reset after feedback
    }, 4000);
  };

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      data-prevent-map-zoom="true"
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        data-prevent-map-zoom="true"
        className="w-full max-w-lg bg-[#0f172a] border border-rose-500/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 overscroll-contain isolate-scroll"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border-b border-rose-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">Campus Emergency & SOS</h2>
              <p className="text-xs text-rose-300">Presidency University Security Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {sosSent ? (
            <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-center space-y-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-base text-white">Emergency Alert Dispatched!</h3>
              <p className="text-xs text-emerald-200 leading-relaxed">
                Your emergency signal has been received by Presidency University Security HQ and the Medical Centre. A quick response team is navigating to your campus coordinates.
              </p>
            </div>
          ) : (
            <>
              {/* Type Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Select Emergency Type:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Medical', 'Security', 'General SOS'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setEmergencyType(t)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        emergencyType === t
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                          : 'bg-[#1e293b] text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instant SOS Dispatch Button */}
              <button
                onClick={handleSendSOS}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-rose-950/50 transition-all border border-rose-400/40"
              >
                <Send className="w-4 h-4" /> BROADCAST INSTANT SOS SIGNAL
              </button>
            </>
          )}

          {/* Emergency Directory Contacts */}
          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Direct Helpline Directory
            </div>

            <div className="p-3 bg-[#1e293b]/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Campus Security Headquarters</div>
                  <div className="text-[10px] text-slate-400">Main Gate Security Office &bull; 24x7</div>
                </div>
              </div>
              <a
                href="tel:+918049255555"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
              >
                <Phone className="w-3 h-3" /> Call
              </a>
            </div>

            <div className="p-3 bg-[#1e293b]/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="text-xs font-semibold text-white">University Medical Centre</div>
                  <div className="text-[10px] text-slate-400">Emergency First Aid & Ambulance</div>
                </div>
              </div>
              <a
                href="tel:+918049255566"
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
              >
                <Phone className="w-3 h-3" /> Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
