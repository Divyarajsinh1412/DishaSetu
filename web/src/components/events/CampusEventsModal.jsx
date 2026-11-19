import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  BookOpen,
  Sparkles,
  X,
  ChevronRight,
  Navigation,
  ArrowRight,
  Filter,
  Plus
} from 'lucide-react';
import { clientRoutingEngine } from '../../services/routingEngine';

const INITIAL_EVENTS = [
  {
    id: 'evt_techfest_2026',
    title: 'PULSE 2026: National Tech Symposium & Hackathon',
    category: 'Academic',
    date: 'Dec 4 - Dec 5, 2026',
    time: '9:30 AM - 5:30 PM',
    venue: 'Auditorium Grand Foyer',
    targetPlaceId: 'bld_auditorium',
    organizer: 'School of Computer Science & Engineering',
    description: '48-hour prototype hackathon, AI robotics exhibitions, and technical paper presentations with industry tech leaders.'
  },
  {
    id: 'evt_cad_workshop',
    title: 'Advanced Generative Design & FEA Simulation Workshop',
    category: 'Workshop',
    date: 'Nov 28, 2026',
    time: '10:00 AM - 1:00 PM',
    venue: 'D Block · DG03 CAD & Simulation Studio',
    targetPlaceId: 'room_dg03',
    organizer: 'Department of Mechanical Engineering',
    description: 'Hands-on architectural CAD modelling, ANSYS stress analysis, and additive manufacturing prototyping.'
  },
  {
    id: 'evt_championship_football',
    title: 'Presidency Premier League (PPL) Inter-School Football Cup',
    category: 'Sports',
    date: 'Dec 12 - Dec 14, 2026',
    time: '3:30 PM - 6:30 PM',
    venue: 'Main Campus Football Ground',
    targetPlaceId: 'feat_football',
    organizer: 'Presidency Department of Physical Education',
    description: 'Annual inter-department football tournament featuring all university schools and faculty exhibition match.'
  },
  {
    id: 'evt_cultural_fest',
    title: 'Dhwani: Annual University Cultural & Music Fest',
    category: 'Cultural',
    date: 'Jan 16, 2027',
    time: '4:00 PM - 9:00 PM',
    venue: 'Central Quadrangle Lawn',
    targetPlaceId: 'feat_main_lawn',
    organizer: 'Presidency Student Affairs Council',
    description: 'Celebration of music, contemporary dance, acoustic performances, and university cultural clubs.'
  },
  {
    id: 'evt_library_orientation',
    title: 'IEEE Xplore & Digital Repository Research Workshop',
    category: 'Academic',
    date: 'Dec 2, 2026',
    time: '11:00 AM - 12:30 PM',
    venue: 'Central University Library (Level 2 Digital Lab)',
    targetPlaceId: 'feat_library',
    organizer: 'University Library Committee',
    description: 'Orientation for postgraduate and undergraduate scholars on accessing digital subscriptions and publication repositories.'
  }
];

export default function CampusEventsModal({
  isOpen,
  onClose,
  onStartNavigation
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [eventsList] = useState(INITIAL_EVENTS);

  if (!isOpen) return null;

  const categories = ['All', 'Academic', 'Workshop', 'Sports', 'Cultural'];

  const filteredEvents = selectedCategory === 'All'
    ? eventsList
    : eventsList.filter(e => e.category === selectedCategory);

  const handleNavigateToEvent = (evt) => {
    try {
      const route = clientRoutingEngine.calculateRoute({
        start: 'node_main_gate',
        destination: evt.targetPlaceId,
        startName: 'Main Gate',
        destName: evt.venue
      });
      onStartNavigation(route);
      onClose();
    } catch (err) {
      console.warn('Event navigation calculation:', err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[85vh] max-h-[700px] bg-[#07172c] border border-[#1b3459] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0b1d38] to-[#07172c] border-b border-[#1b3459] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#0369a1] flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Calendar className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  Presidency University Campus Events
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1e3a8a] text-[#d4af37] border border-[#3b82f6]/40">
                  Live Calendar
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Symposia, Workshops, Competitions & Venue Wayfinding
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Events"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-5 py-2.5 bg-[#091b33]/90 border-b border-[#162e4f] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1e3a8a] text-[#d4af37] border border-[#3b82f6]/50 shadow-sm'
                  : 'bg-[#0f284a] text-slate-300 hover:text-white hover:bg-[#143966] border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-4 rounded-2xl bg-[#091b33] border border-[#1b3459] hover:border-[#2d568f] transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    evt.category === 'Academic'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      : evt.category === 'Sports'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : evt.category === 'Cultural'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {evt.category}
                  </span>

                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {evt.date}
                  </span>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {evt.time}
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-white group-hover:text-sky-300 transition-colors">
                  {evt.title}
                </h4>

                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {evt.description}
                </p>

                <div className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  <span className="text-[#d4af37] font-semibold">{evt.venue}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400 text-[10px]">{evt.organizer}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNavigateToEvent(evt)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#1d4ed8] to-[#1e40af] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <span>Navigate to Venue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
