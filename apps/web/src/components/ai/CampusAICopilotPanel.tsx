'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FloorLevel,
  CampusRoomEntity,
  ALL_CAMPUS_ENTITIES,
  getEntitiesForFloor,
  findRoomByIdOrName,
} from '../../services/campusMultiFloorData';
import { runCopilotPipeline } from '../../services/campusCopilotEngine';
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
      text: "Hi! 👋 I'm your Campus AI Copilot. I can help you find rooms, navigate the campus, and answer questions about campus facilities.",
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQueries = [
    'Where is the seminar hall?',
    'How many people can the seminar hall accommodate?',
    'Where is classroom 101?',
    'What equipment does the seminar hall have?',
    'How many students can the first floor accommodate?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const conversationIdRef = useRef<string>('conv-' + Date.now());
  const localContextRef = useRef<{ lastEntity?: CampusRoomEntity; lastDistanceMeters?: number }>({});

  /**
   * RESPONSE HANDLING LAYER:
   * 1. Query Backend API (with conversationId for session context awareness)
   * 2. Fall back to local spatial & conversational intelligence if backend is unavailable
   */
  const processSpatialQuery = async (userQuery: string): Promise<{
    text: string;
    spatialAction?: CopilotMessage['spatialAction'];
  }> => {
    const formattedHistory = messages.slice(-6).map((m) => ({
      role: (m.sender === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.text,
    }));

    const spatialContext = {
      institutionName: 'ESEC Campus',
      floorId: activeFloor,
      selectedEntityId: selectedEntity?.id || localContextRef.current.lastEntity?.id,
      currentLocation: selectedEntity?.name || localContextRef.current.lastEntity?.name,
      hasUserLocation: Boolean(selectedEntity),
    };

    // -------------------------------------------------------------
    // ATTEMPT 1: CALL PRIMARY COPILOT ROUTE (/api/ai/chat)
    // -------------------------------------------------------------
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userQuery,
          conversationId: conversationIdRef.current,
          context: spatialContext,
          history: formattedHistory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        let action: CopilotMessage['spatialAction'];

        if (Array.isArray(data.actions)) {
          for (const act of data.actions) {
            if (act.action === 'FOCUS_ENTITY') {
              const matched = findRoomByIdOrName(act.entityId) || findRoomByIdOrName(act.roomName);
              if (matched) {
                localContextRef.current.lastEntity = matched;
                setActiveFloor(matched.floor);
                onSelectEntity(matched);
                action = {
                  type: 'HIGHLIGHT_ROOM',
                  floor: matched.floor,
                  roomId: matched.id,
                  roomName: matched.name,
                };
              }
            } else if (act.action === 'NAVIGATE') {
              const matched = findRoomByIdOrName(act.entityId) || findRoomByIdOrName(act.roomName);
              if (matched) {
                localContextRef.current.lastEntity = matched;
                setActiveFloor(matched.floor);
                onSelectEntity(matched);
                onStartRoute(matched);
                action = {
                  type: 'START_ROUTE',
                  floor: matched.floor,
                  roomId: matched.id,
                  roomName: matched.name,
                };
              }
            } else if (act.action === 'SWITCH_FLOOR' && act.floor) {
              setActiveFloor(act.floor as FloorLevel);
              action = {
                type: 'CHANGE_FLOOR',
                floor: act.floor as FloorLevel,
              };
            }
          }
        }

        if (data.reply) {
          return { text: data.reply, spatialAction: action };
        }
      }
    } catch {
      // Backend temporarily offline; gracefully continue to local conversational engine
    }

    // -------------------------------------------------------------
    // ATTEMPT 2: LOCAL 8-STEP PIPELINE EXECUTION (Offline Fallback)
    // -------------------------------------------------------------
    const localResult = runCopilotPipeline(userQuery, formattedHistory, spatialContext);
    let localAction: CopilotMessage['spatialAction'];

    if (localResult.mapAction && localResult.mapAction.action !== 'NONE') {
      const act = localResult.mapAction;
      if (act.action === 'FOCUS_ENTITY' && act.entityId) {
        const matched = findRoomByIdOrName(act.entityId) || findRoomByIdOrName(act.roomName);
        if (matched) {
          localContextRef.current.lastEntity = matched;
          setActiveFloor(matched.floor);
          onSelectEntity(matched);
          localAction = {
            type: 'HIGHLIGHT_ROOM',
            floor: matched.floor,
            roomId: matched.id,
            roomName: matched.name,
          };
        }
      } else if (act.action === 'NAVIGATE' && act.entityId) {
        const matched = findRoomByIdOrName(act.entityId) || findRoomByIdOrName(act.roomName);
        if (matched) {
          localContextRef.current.lastEntity = matched;
          setActiveFloor(matched.floor);
          onSelectEntity(matched);
          onStartRoute(matched);
          localAction = {
            type: 'START_ROUTE',
            floor: matched.floor,
            roomId: matched.id,
            roomName: matched.name,
          };
        }
      } else if (act.action === 'SWITCH_FLOOR' && act.floor) {
        setActiveFloor(act.floor as FloorLevel);
        localAction = {
          type: 'CHANGE_FLOOR',
          floor: act.floor as FloorLevel,
        };
      }
    }

    if (localResult.confidence >= 0.8) {
      return { text: localResult.answer, spatialAction: localAction };
    }

    const raw = userQuery.trim().toLowerCase();
    const clean = raw.replace(/[?!.,;:'"()]/g, '').trim();

    // 1. Greetings
    if (
      clean === 'hi' ||
      clean === 'hey' ||
      clean === 'hello' ||
      clean === 'heyy' ||
      clean === 'hiya' ||
      clean === 'howdy' ||
      clean === 'greetings' ||
      clean.startsWith('hi ') ||
      clean.startsWith('hey ') ||
      clean.startsWith('hello ')
    ) {
      if (clean.includes('hello')) {
        return { text: "Hello! 👋 What would you like to find on campus?" };
      }
      if (clean.includes('hey')) {
        return { text: "Hey! How can I help you around campus?" };
      }
      return { text: "Hi! 👋 I'm your Campus AI Assistant. How can I help you today?" };
    }

    if (clean.startsWith('good morning')) {
      return { text: "Good morning! ☀️ How can I assist you on campus today?" };
    }
    if (clean.startsWith('good afternoon')) {
      return { text: "Good afternoon! 👋 How can I help you around campus today?" };
    }
    if (clean.startsWith('good evening')) {
      return { text: "Good evening! 🌙 How can I assist you with the campus tonight?" };
    }

    // 2. Capabilities
    if (
      clean.includes('what can you do') ||
      clean.includes('how can you help me') ||
      clean.includes('what are your features') ||
      clean.includes('what do you do') ||
      clean.includes('what can i ask') ||
      clean === 'help' ||
      clean === 'help me'
    ) {
      return {
        text: "I can help you explore the campus, find rooms and labs, locate facilities, check available spaces, and guide you to destinations. You can simply ask me something like 'Where is Lab 1?' or 'How do I get to the Seminar Hall?'",
      };
    }

    // 3. Normal conversation
    if (
      clean.includes('how are you') ||
      clean.includes('how r u') ||
      clean.includes("how're you") ||
      clean.includes('how are u')
    ) {
      return { text: "I'm doing great! 😊 I'm ready to help you find your way around campus." };
    }

    if (clean.includes('who are you') || clean.includes('what are you')) {
      return { text: "I'm your Campus AI Assistant. I can help you find places, navigate the campus, and answer questions about available spaces." };
    }

    if (clean.includes('thank you') || clean.includes('thanks') || clean.includes('thx') || clean === 'ty') {
      return { text: "You're very welcome! 😊 Let me know if you need anything else." };
    }

    if (clean.includes('bye') || clean.includes('goodbye') || clean.includes('see you') || clean.includes('cya')) {
      return { text: "Goodbye! 👋 Have a great day!" };
    }

    // 4. Unrelated questions
    if (
      clean.includes('weather') ||
      clean.includes('rain tomorrow') ||
      clean.includes('joke') ||
      clean.includes('who is the president')
    ) {
      return {
        text: "I don't currently have weather information available. I can help you with campus locations, navigation, rooms, facilities, and available spaces.",
      };
    }

    // 5. Follow-up questions & context resolution
    if (clean.includes('how far') || clean === 'distance') {
      if (localContextRef.current.lastEntity) {
        const ent = localContextRef.current.lastEntity;
        const dist = localContextRef.current.lastDistanceMeters || 18;
        return {
          text: `${ent.name} is about ${dist} m from the Central Hub.`,
        };
      }
      return { text: "Which location or room would you like to check the distance for?" };
    }

    if (
      clean === 'how do i get there' ||
      clean.includes('how do i get there') ||
      clean === 'take me there' ||
      clean.includes('take me there') ||
      clean === 'navigate there' ||
      clean.includes('navigate there')
    ) {
      if (localContextRef.current.lastEntity) {
        const ent = localContextRef.current.lastEntity;
        setActiveFloor(ent.floor);
        onSelectEntity(ent);
        onStartRoute(ent);
        return {
          text: `I can guide you there. I've highlighted the route from the Central Hub on the map.`,
          spatialAction: { type: 'START_ROUTE', floor: ent.floor, roomId: ent.id, roomName: ent.name },
        };
      }
      return { text: "Of course. Where would you like to go?" };
    }

    // 6. Ambiguous questions
    if (clean === 'where is the lab' || clean === 'find the lab' || clean === 'locate the lab') {
      return {
        text: "Sure! Which lab are you looking for? We have Lab 1 (Robotics), Computing Systems Lab 102, and AI & Robotics Lab 204.",
      };
    }

    // 7. Campus landmark queries
    // Lab 1
    if (clean.includes('lab 1') || clean.includes('lab1') || clean.includes('cr-02')) {
      const room = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'GF-LAB-01');
      if (room) {
        localContextRef.current.lastEntity = room;
        localContextRef.current.lastDistanceMeters = 18;
        setActiveFloor('GROUND');
        onSelectEntity(room);
        return {
          text: 'Lab 1 (CR-02) is on the Ground Floor, near the Central Hub corridor. It has 40 workstations. Would you like me to show you the route?',
          spatialAction: { type: 'HIGHLIGHT_ROOM', floor: 'GROUND', roomId: room.id, roomName: room.name },
        };
      }
    }

    // Restrooms
    if (clean.includes('restroom') || clean.includes('washroom') || clean.includes('toilet')) {
      const room = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'GF-GEN-01');
      if (room) {
        localContextRef.current.lastEntity = room;
        localContextRef.current.lastDistanceMeters = 22;
        setActiveFloor('GROUND');
        onSelectEntity(room);
        return {
          text: "I found two restrooms nearby. The closest options are the Gents Restroom and Ladies Restroom along the southern corridor on the Ground Floor. I've highlighted them on the map.",
          spatialAction: { type: 'HIGHLIGHT_ROOM', floor: 'GROUND', roomId: room.id, roomName: room.name },
        };
      }
    }

    // Seminar Hall
    if (clean.includes('seminar hall') || (clean.includes('seminar') && clean.includes('hall'))) {
      const room = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'GF-SEM-01');
      if (room) {
        localContextRef.current.lastEntity = room;
        localContextRef.current.lastDistanceMeters = 18;
        setActiveFloor('GROUND');
        onSelectEntity(room);
        onStartRoute(room);
        return {
          text: "Sure! The Seminar Hall is about an 18 m walk from the Central Hub via the South Corridor. I've highlighted the route on the map for you.",
          spatialAction: { type: 'START_ROUTE', floor: 'GROUND', roomId: room.id, roomName: room.name },
        };
      }
    }

    // Lift
    if (clean.includes('lift') || clean.includes('elevator')) {
      const lift = ALL_CAMPUS_ENTITIES.find((r) => r.id === '1F-LIFT-01');
      if (lift) {
        localContextRef.current.lastEntity = lift;
        localContextRef.current.lastDistanceMeters = 12;
        setActiveFloor('GROUND');
        onSelectEntity(lift);
        return {
          text: "The Central Lift is located right next to the Central Hub and Vertical Core on the Ground Floor, with elevator access to all floors. I've highlighted it on the map for you.",
          spatialAction: { type: 'HIGHLIGHT_ROOM', floor: 'GROUND', roomId: lift.id, roomName: lift.name },
        };
      }
    }

    // Available Rooms
    if (clean.includes('available') || clean.includes('empty') || clean.includes('vacant')) {
      const room = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'GF-EMP-01');
      if (room) {
        localContextRef.current.lastEntity = room;
        localContextRef.current.lastDistanceMeters = 25;
        setActiveFloor('GROUND');
        onSelectEntity(room);
        return {
          text: "I found a few available spaces on the Terrace Floor. Would you like me to show them on the map?",
          spatialAction: { type: 'HIGHLIGHT_ROOM', floor: 'GROUND', roomId: room.id, roomName: room.name },
        };
      }
    }

    // First Floor
    if (clean.includes('first floor') || clean.includes('1st floor')) {
      setActiveFloor('FIRST');
      const lift = ALL_CAMPUS_ENTITIES.find((r) => r.id === '1F-LIFT-01');
      if (lift) onSelectEntity(lift);
      return {
        text: "You can use the nearest stairs or lift. Take either the West Stairs or Central Lift from the Ground Floor up to the First Floor. I've switched your view to the First Floor!",
        spatialAction: { type: 'CHANGE_FLOOR', floor: 'FIRST' },
      };
    }

    // Default friendly conversational response
    return {
      text: "Hi! 👋 How can I help you today? You can ask me about rooms, labs, navigation, available spaces, or campus information.",
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
      const response = await processSpatialQuery(query);
      const aiMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: 'Just now',
        spatialAction: response.spatialAction,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "I'm having a little trouble connecting to the campus server right now, but I can still help you navigate using local campus maps. Please feel free to ask again!",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/60 text-slate-300 w-fit">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-[10px] text-cyan-300 font-medium">Thinking...</span>
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
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask Campus AI (Enter to send)..."
            rows={1}
            className="w-full resize-none bg-slate-950 border border-slate-800 rounded-lg pl-2.5 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 min-h-[34px] max-h-[80px]"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-1.5 p-1.5 rounded-md bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-30 transition-colors"
            title="Send Message"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </aside>
  );
}
