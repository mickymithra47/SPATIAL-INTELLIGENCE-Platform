'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FloorLevel,
  CampusRoomEntity,
  ALL_CAMPUS_ENTITIES,
  getEntitiesForFloor,
} from '../../services/campusMultiFloorData';
import {
  Sparkles,
  Send,
  Navigation,
  MapPin,
  Maximize2,
  Minimize2,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

interface CopilotMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  spatialAction?: {
    type: 'HIGHLIGHT_ROOM' | 'START_ROUTE' | 'CHANGE_FLOOR';
    floor?: FloorLevel;
    roomId?: string;
    roomName?: string;
  };
}

interface CampusAICopilotPanelProps {
  activeFloor: FloorLevel;
  setActiveFloor: (floor: FloorLevel) => void;
  selectedEntity: CampusRoomEntity | null;
  onSelectEntity: (entity: CampusRoomEntity) => void;
  onStartRoute: (entity: CampusRoomEntity) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (minimized: boolean) => void;
}

export function CampusAICopilotPanel({
  activeFloor,
  setActiveFloor,
  selectedEntity,
  onSelectEntity,
  onStartRoute,
  isExpanded,
  setIsExpanded,
  isMinimized,
  setIsMinimized,
}: CampusAICopilotPanelProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'I am your Campus Spatial AI Copilot. Ask about any classroom, lab, route, or facility across Ground, 1st, 2nd, and Terrace floors.',
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQueries = [
    'Where is Lab 1?',
    'Find nearest restroom',
    'Navigate to Seminar Hall',
    'Show available rooms',
    'How do I reach the first floor?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const processSpatialQuery = (userQuery: string) => {
    const q = userQuery.toLowerCase().trim();

    // 1. Where is Lab 1?
    if (q.includes('lab 1') || q.includes('lab1')) {
      const room = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'GF-LAB-01')!;
      setActiveFloor('GROUND');
      onSelectEntity(room);
      return {
        text: 'Lab 1 (CR-02) is on the Ground Floor, west perimeter connecting directly to Central Hub corridor. 70 m², 40 workstations with live robotics telemetry.',
        spatialAction: { type: 'HIGHLIGHT_ROOM' as const, floor: 'GROUND' as const, roomId: room.id, roomName: room.name },
      };
    }

    // 2. Restrooms
    if (q.includes('restroom') || q.includes('washroom') || q.includes('toilet')) {
      const room = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'GF-GEN-01')!;
      setActiveFloor('GROUND');
      onSelectEntity(room);
      return {
        text: 'Restrooms are along the southern corridor on Ground Floor: Gents Restroom (southwest, 30 m²) and Ladies Restroom (southeast, 30 m²).',
        spatialAction: { type: 'HIGHLIGHT_ROOM' as const, floor: 'GROUND' as const, roomId: room.id, roomName: room.name },
      };
    }

    // 3. Navigate to Seminar Hall
    if (q.includes('navigate') && (q.includes('seminar') || q.includes('hall'))) {
      const room = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'GF-SEM-01')!;
      setActiveFloor('GROUND');
      onSelectEntity(room);
      onStartRoute(room);
      return {
        text: 'Route to Seminar Hall calculated: From Central Hub → South Corridor → Seminar Hall Stage. Distance: 18m, Est. Time: 22s.',
        spatialAction: { type: 'START_ROUTE' as const, floor: 'GROUND' as const, roomId: room.id, roomName: room.name },
      };
    }

    // 4. Show available / empty rooms
    if (q.includes('empty') || q.includes('available') || q.includes('vacant')) {
      const room = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'GF-EMP-01')!;
      setActiveFloor('GROUND');
      onSelectEntity(room);
      return {
        text: 'Empty Space (CR-10) is currently AVAILABLE on the northeast wing (50 m², 25 cap). On Terrace, Open Classroom Studios 1 & 2 are also free.',
        spatialAction: { type: 'HIGHLIGHT_ROOM' as const, floor: 'GROUND' as const, roomId: room.id, roomName: room.name },
      };
    }

    // 5. How do I reach the first floor?
    if (q.includes('first floor') || q.includes('1st floor') || q.includes('stairs')) {
      setActiveFloor('FIRST');
      const lift = ALL_CAMPUS_ENTITIES.find((r) => r.id === '1F-LIFT-01')!;
      onSelectEntity(lift);
      return {
        text: 'Take either Stairs (West) or Central Lift from Ground Floor up to First Floor. Switched Digital Twin to First Floor.',
        spatialAction: { type: 'CHANGE_FLOOR' as const, floor: 'FIRST' as const },
      };
    }

    // 6. Second Floor / Terrace
    if (q.includes('second floor') || q.includes('2nd floor')) {
      setActiveFloor('SECOND');
      return {
        text: 'Switched to Second Floor: Featuring Robotics Lab 4, Innovation Studio 201, and Campus Startup Incubator.',
        spatialAction: { type: 'CHANGE_FLOOR' as const, floor: 'SECOND' as const },
      };
    }
    if (q.includes('terrace') || q.includes('roof')) {
      setActiveFloor('TERRACE');
      return {
        text: 'Switched to Terrace: Contains Open Classroom Studios 1 & 2, Lift Penthouse, and 240 m² Solar Observation Deck.',
        spatialAction: { type: 'CHANGE_FLOOR' as const, floor: 'TERRACE' as const },
      };
    }

    return {
      text: `Analyzing spatial graph for "${userQuery}". You can navigate across Ground, 1st, 2nd, and Terrace floors, or check telemetry.`,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationId: 'copilot-panel',
          context: {
            institutionName: 'ESEC Campus',
            floorId: activeFloor,
            selectedEntityId: selectedEntity?.id,
            activeView: '2.5D',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsTyping(false);

        // Process any returned spatial actions
        if (Array.isArray(data.actions)) {
          for (const act of data.actions) {
            if (act.floor) {
              setActiveFloor(act.floor);
            }
            if (act.entityId) {
              const matched = ALL_CAMPUS_ENTITIES.find(
                (e) => e.id === act.entityId || e.name.toLowerCase().includes((act.roomName || '').toLowerCase())
              );
              if (matched) {
                onSelectEntity(matched);
                if (act.action === 'NAVIGATE') {
                  onStartRoute(matched);
                }
              }
            }
          }
        }

        const aiMsg: CopilotMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: 'Just now',
        };

        setMessages((prev) => [...prev, aiMsg]);
        return;
      }
    } catch {
      // Gracefully fall back to local spatial knowledge engine
    }

    // Offline fallback mode
    setTimeout(() => {
      const response = processSpatialQuery(query);
      const aiMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `[Offline Fallback Mode]\n\n${response.text}`,
        timestamp: 'Just now',
        spatialAction: response.spatialAction,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 400);
  };

  // If minimized, display a floating pill trigger
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-40 p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-2xl flex items-center gap-2 hover:scale-105 transition-all"
        title="Open Campus AI Copilot"
      >
        <Sparkles className="w-5 h-5 fill-current" />
        <span className="text-xs font-black">Campus AI</span>
      </button>
    );
  }

  return (
    <aside
      className={`h-full flex flex-col bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800/90 text-slate-100 shadow-2xl transition-all duration-200 z-30 ${
        isExpanded ? 'w-80 md:w-96' : 'w-64 md:w-72'
      }`}
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1">
              ✦ Campus AI Copilot
            </h3>
            <p className="text-[10px] text-cyan-400 font-medium">Spatially Grounded</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-white"
            title={isExpanded ? 'Collapse width' : 'Expand width'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Minimize Copilot"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spatial Grounding Focus Badge */}
      {selectedEntity && (
        <div className="px-3 py-1.5 bg-cyan-950/40 border-b border-cyan-800/30 flex items-center justify-between text-[11px]">
          <span className="text-cyan-300 truncate max-w-[170px]">
            Focused: <strong>{selectedEntity.name}</strong>
          </span>
          <button
            onClick={() => onStartRoute(selectedEntity)}
            className="text-[10px] font-bold text-cyan-400 hover:underline"
          >
            Route
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-2.5 rounded-xl max-w-[92%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-sm'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/70 rounded-tl-none shadow-sm'
              }`}
            >
              <p className="text-[11px]">{msg.text}</p>

              {msg.spatialAction?.type === 'START_ROUTE' && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-700/60 flex items-center gap-1 text-[10px] text-cyan-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Route active on Digital Twin</span>
                </div>
              )}
            </div>
            <span className="text-[8px] text-slate-500 mt-0.5 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1 p-2 rounded-xl bg-slate-800 text-slate-400 w-16">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-950/60">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Suggested Queries
        </span>
        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
          {suggestedQueries.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="text-[9.5px] text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/70 px-2 py-0.5 rounded-md transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Minimal Input */}
      <div className="p-2 border-t border-slate-800 bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Campus AI..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-2.5 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-1 p-1 rounded-md bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-30"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </aside>
  );
}
