import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Search,
  X,
  Send,
  MapPin,
  Building2,
  Coffee,
  HeartPulse,
  BookOpen,
  Car,
  Trophy,
  Compass,
  DoorOpen,
  ArrowRight,
  Bot,
  User,
  Footprints,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { COMPLETE_CAMPUS_CATALOG } from '../../services/campusCatalog';
import { MASTER_CAMPUS_FEATURES } from '../../data/masterMapFeatures';
import { D_BLOCK_FALLBACK_FLOORS } from '../../data/dBlockFloorsFallback';
import { clientRoutingEngine } from '../../services/routingEngine';

const QUICK_PROMPTS = [
  { label: '🚶 Main Gate to D Block', query: 'How do I reach D Block from Main Gate?' },
  { label: '📖 Central Library', query: 'Where is the library?' },
  { label: '☕ Nearest Cafeteria', query: 'Find the nearest cafeteria' },
  { label: '🚪 Room DG01 Lab', query: 'Where is room DG01?' },
  { label: '🏥 Medical Centre', query: 'Where is the medical room?' },
  { label: '🅿️ Student Parking', query: 'Show two wheeler parking' }
];

export default function CampusAIAssistantModal({
  isOpen,
  onClose,
  onStartNavigation,
  onLocateOnMap,
  onOpenIndoorRoom,
  onOpenCafe
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your DishaSetu Campus Assistant for Presidency University Bengaluru. How can I help you navigate campus today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Find Central Library', 'Directions to D Block', 'Where is Hatti Kappi?']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  // Process Natural Language Query against verified campus registry
  const processQuery = (rawText) => {
    const q = rawText.trim().toLowerCase();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Directions Route Query (e.g. "reach D Block from Main Gate", "directions to library")
    const isRouteQuery =
      (q.includes('from') && q.includes('to')) ||
      q.includes('how do i reach') ||
      q.includes('how to reach') ||
      q.includes('directions to') ||
      q.includes('way to') ||
      q.includes('route to');

    if (isRouteQuery) {
      let startId = 'node_main_gate';
      let destId = 'node_d_block_ent';
      let startName = 'Main Gate';
      let destName = 'D Block';

      if (q.includes('library')) {
        destId = 'node_library_ent';
        destName = 'Central University Library';
      } else if (q.includes('cafe') || q.includes('hatti') || q.includes('coffee') || q.includes('food')) {
        destId = 'node_cafe_d_block';
        destName = 'Hatti Kappi (D Block)';
      } else if (q.includes('medical') || q.includes('health') || q.includes('hospital')) {
        destId = 'node_medical_ent';
        destName = 'Health & Medical Centre';
      } else if (q.includes('auditorium')) {
        destId = 'node_auditorium_ent';
        destName = 'Auditorium Grand Foyer';
      } else if (q.includes('e block') || q.includes('cse')) {
        destId = 'node_e_block_ent';
        destName = 'E Block (School of CSE)';
      } else if (q.includes('f block')) {
        destId = 'node_f_block_ent';
        destName = 'F Block (EEE & Science)';
      } else if (q.includes('l block')) {
        destId = 'node_l_block_ent';
        destName = 'L Block (Robotics)';
      } else if (q.includes('hostel')) {
        destId = 'node_hostel_mess';
        destName = 'Hostel Mess & Dining';
      }

      try {
        const route = clientRoutingEngine.calculateRoute({
          start: startId,
          destination: destId,
          startName,
          destName
        });

        return {
          id: String(Date.now()),
          sender: 'assistant',
          text: `Here is the verified pedestrian route from ${startName} to ${destName}. The route follows established university walkways avoiding restricted zones.`,
          timestamp: timeNow,
          routeData: {
            route,
            startName,
            destName,
            distance: route.distanceMeters,
            eta: route.estimatedMinutes,
            turnCount: route.turnInstructions?.length || 0
          }
        };
      } catch (err) {
        return {
          id: String(Date.now()),
          sender: 'assistant',
          text: `I found ${destName}, but could not calculate an obstacle-free walking path at this moment. You can view its location on the master campus map.`,
          timestamp: timeNow
        };
      }
    }

    // 2. Classroom or Room Query (e.g. "DG01", "room", "lab")
    const roomMatch = q.match(/dg\s*0?([1-6])/i) || q.match(/room\s*dg\s*0?([1-6])/i);
    if (roomMatch || q.includes('dg0') || q.includes('classroom')) {
      const roomNum = roomMatch ? `DG0${roomMatch[1]}` : 'DG01';
      const groundFloor = D_BLOCK_FALLBACK_FLOORS[0];
      const matchedRoom = groundFloor.rooms.find(r => r.roomNumber.toLowerCase() === roomNum.toLowerCase()) || groundFloor.rooms[0];

      return {
        id: String(Date.now()),
        sender: 'assistant',
        text: `Found room ${matchedRoom.roomNumber} (${matchedRoom.name}) located on the Ground Floor of D Block.`,
        timestamp: timeNow,
        roomData: {
          buildingName: 'D Block (Engineering)',
          floorName: 'Ground Floor',
          roomNumber: matchedRoom.roomNumber,
          roomName: matchedRoom.name,
          category: matchedRoom.category,
          status: matchedRoom.status
        }
      };
    }

    // 3. Cafe / Food / Dining Query
    if (q.includes('food') || q.includes('cafe') || q.includes('coffee') || q.includes('hatti') || q.includes('dining') || q.includes('canteen')) {
      return {
        id: String(Date.now()),
        sender: 'assistant',
        text: `Presidency University has verified food and dining options on campus:`,
        timestamp: timeNow,
        locationsList: [
          {
            id: 'feat_food_d_block',
            name: 'Hatti Kappi',
            category: 'Cafe',
            location: 'Near D Block Ground Floor',
            description: 'Authentic South Indian Filter Coffee, Snacks & Beverages. Mon-Sat: 8:00 AM - 7:00 PM.',
            actionType: 'cafe'
          },
          {
            id: 'feat_food_point_main',
            name: 'Central Food Point & Refreshments',
            category: 'Dining',
            location: 'Central Plaza',
            description: 'Meals, refreshments, juices and quick snacks.',
            actionType: 'location'
          }
        ]
      };
    }

    // 4. Library Query
    if (q.includes('library') || q.includes('books') || q.includes('study')) {
      return {
        id: String(Date.now()),
        sender: 'assistant',
        text: `The Central University Library is located at the center of the campus overlooking the Central Green Lawn.`,
        timestamp: timeNow,
        singleLocation: {
          id: 'feat_library',
          name: 'Central University Library',
          category: 'Library',
          location: 'Central Quadrangle',
          description: 'Multidisciplinary academic journals, digital resource labs, reading rooms and university archives.',
          code: 'PU-FAC-LIB'
        }
      };
    }

    // 5. Medical / Health Centre Query
    if (q.includes('medical') || q.includes('health') || q.includes('doctor') || q.includes('first aid') || q.includes('emergency')) {
      return {
        id: String(Date.now()),
        sender: 'assistant',
        text: `The University Health & Medical Centre is fully operational with on-campus nursing staff and emergency response.`,
        timestamp: timeNow,
        singleLocation: {
          id: 'feat_medical',
          name: 'Health & Medical Centre',
          category: 'Medical',
          location: 'Central Service Quad',
          description: 'General OPD, first-aid response, emergency stabilization and 24/7 campus ambulance liaison.',
          code: 'PU-FAC-MED'
        }
      };
    }

    // 6. Parking Query
    if (q.includes('parking') || q.includes('bike') || q.includes('car') || q.includes('vehicle')) {
      return {
        id: String(Date.now()),
        sender: 'assistant',
        text: `Presidency University Bengaluru provides dedicated vehicle parking zones:`,
        timestamp: timeNow,
        locationsList: [
          {
            id: 'node_parking_entry',
            name: 'Student 2-Wheeler Parking',
            category: 'Parking',
            location: 'Near Gate 1 & East Boundary',
            description: 'Designated parking for student motorcycles, scooters and bicycles.'
          },
          {
            id: 'node_parking_4w',
            name: '4-Wheeler & Faculty Parking',
            category: 'Parking',
            location: 'West Campus Wing',
            description: 'Reserved parking for staff, university transport and faculty automobiles.'
          }
        ]
      };
    }

    // 7. General Keyword Search across Catalog
    const matches = COMPLETE_CAMPUS_CATALOG.filter(item => {
      const name = (item.name || '').toLowerCase();
      const code = (item.shortCode || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      return name.includes(q) || code.includes(q) || desc.includes(q);
    }).slice(0, 3);

    if (matches.length > 0) {
      return {
        id: String(Date.now()),
        sender: 'assistant',
        text: `I found ${matches.length} matching location(s) in the Presidency University verified registry:`,
        timestamp: timeNow,
        locationsList: matches.map(m => ({
          id: m.locationId,
          name: m.name,
          category: m.category,
          location: m.departments?.join(', ') || m.description || 'Presidency University',
          description: m.description,
          code: m.shortCode
        }))
      };
    }

    // 8. Fallback helpful guidance
    return {
      id: String(Date.now()),
      sender: 'assistant',
      text: `I could not find "${rawText}" in the verified campus registry. You can try asking about specific academic blocks (e.g. D Block, E Block), facilities (Library, Medical Room, Parking), classrooms (DG01), or food points (Hatti Kappi).`,
      timestamp: timeNow,
      suggestions: ['How to reach D Block?', 'Find Medical Centre', 'Hatti Kappi timings']
    };
  };

  const handleSend = () => {
    const q = inputQuery.trim();
    if (!q) return;

    const userMsg = {
      id: String(Date.now()),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processQuery(q);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[88vh] max-h-[720px] bg-[#07172c] border border-[#1b3459] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0b1d38] to-[#07172c] border-b border-[#1b3459] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1e40af] to-[#3b82f6] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  DishaSetu Campus AI Assistant
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1e3a8a] text-[#d4af37] border border-[#3b82f6]/40">
                  Verified GIS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Presidency University Bengaluru · Institutional Navigation Intelligence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 bg-[#091b33]/90 border-b border-[#162e4f] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-[#d4af37]" /> Quick:
          </span>
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputQuery(p.query);
                setTimeout(() => handleSend(), 50);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#0f284a] text-slate-300 hover:text-[#d4af37] hover:bg-[#153a6b] border border-[#1b3d6c] whitespace-nowrap transition-all shrink-0 active:scale-95"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-[#1e3a8a] flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-[#d4af37]" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-[#1d4ed8] to-[#1e40af] text-white shadow-md'
                  : 'bg-[#0d213d] border border-[#1b375f] text-slate-200'
              }`}>
                <div>{msg.text}</div>

                {/* Route Recommendation Card */}
                {msg.routeData && (
                  <div className="mt-3 p-3 bg-[#08172c] rounded-xl border border-[#1b3861] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span className="flex items-center gap-1 text-[#d4af37]">
                        <Footprints className="w-3.5 h-3.5" />
                        {msg.routeData.distance} m ({msg.routeData.eta} min walk)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {msg.routeData.turnCount} turns
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">{msg.routeData.startName}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-sky-300 font-bold">{msg.routeData.destName}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onStartNavigation(msg.routeData.route);
                        onClose();
                      }}
                      className="w-full mt-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] hover:from-[#2563eb] hover:to-[#3b82f6] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                    >
                      <Footprints className="w-3.5 h-3.5" />
                      <span>Start Walking Navigation</span>
                    </button>
                  </div>
                )}

                {/* Room Details Card */}
                {msg.roomData && (
                  <div className="mt-3 p-3 bg-[#08172c] rounded-xl border border-[#1b3861] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
                        {msg.roomData.roomNumber} – {msg.roomData.roomName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                        {msg.roomData.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {msg.roomData.buildingName} · {msg.roomData.floorName} · {msg.roomData.category}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenIndoorRoom) onOpenIndoorRoom(msg.roomData.roomNumber);
                        onClose();
                      }}
                      className="w-full mt-1 py-1.5 px-3 rounded-lg bg-[#1e3a8a] hover:bg-[#2563eb] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Open 2D Indoor Floor Plan</span>
                    </button>
                  </div>
                )}

                {/* Single Location Card */}
                {msg.singleLocation && (
                  <div className="mt-3 p-3 bg-[#08172c] rounded-xl border border-[#1b3861] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">
                        {msg.singleLocation.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold border border-sky-500/30">
                        {msg.singleLocation.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {msg.singleLocation.description}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onLocateOnMap) onLocateOnMap(msg.singleLocation.id);
                          onClose();
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Locate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const route = clientRoutingEngine.calculateRoute({
                            start: 'node_main_gate',
                            destination: msg.singleLocation.id,
                            startName: 'Main Gate',
                            destName: msg.singleLocation.name
                          });
                          onStartNavigation(route);
                          onClose();
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#1d4ed8] hover:bg-[#2563eb] text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Footprints className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Multiple Locations List */}
                {msg.locationsList && (
                  <div className="mt-3 space-y-2">
                    {msg.locationsList.map((loc) => (
                      <div
                        key={loc.id}
                        className="p-2.5 bg-[#08172c] rounded-xl border border-[#1b3861] flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{loc.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1e3a8a]/60 text-[#d4af37] border border-[#3b82f6]/30">
                              {loc.category}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">
                            {loc.location}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (loc.actionType === 'cafe' && onOpenCafe) {
                              onOpenCafe({ name: loc.name, shortCode: 'PU-CAFE-D-BLOCK' });
                            } else {
                              const route = clientRoutingEngine.calculateRoute({
                                start: 'node_main_gate',
                                destination: loc.id,
                                startName: 'Main Gate',
                                destName: loc.name
                              });
                              onStartNavigation(route);
                            }
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#1d4ed8] hover:bg-[#2563eb] text-white text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all"
                        >
                          <span>{loc.actionType === 'cafe' ? 'Menu' : 'Go'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-1 text-[9px] text-slate-500 text-right">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#1d4ed8] flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
              <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
              <span>Analyzing campus GIS registry...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#081528] border-t border-[#1b3459] flex items-center gap-2 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask anything: 'Where is the library?', 'Directions to D Block'..."
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#0e223d] border border-[#1b365c] text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#3b82f6] transition-colors"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputQuery.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#1d4ed8] to-[#1e40af] hover:from-[#2563eb] hover:to-[#1d4ed8] disabled:opacity-40 text-white font-bold transition-all shadow-md active:scale-95"
            title="Send Query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
