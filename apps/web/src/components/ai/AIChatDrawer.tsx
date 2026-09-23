'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAIChatStore } from '../../stores/useAIChatStore';
import { useSpatialStore } from '../../stores/useSpatialStore';
import { X, Sparkles, Send, Compass, ArrowRight, ShieldCheck, CheckCircle2, Navigation, Trash2 } from 'lucide-react';

export function AIChatDrawer() {
  const { isOpen, setIsOpen, messages, sendMessage, isLoading, clearChat } = useAIChatStore();
  const { setSelectedRoom, setActiveFloorNumber, setActiveBuildingId, setSelectedBuildingView, setActiveRoute, setViewMode, rooms } =
    useSpatialStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleActionClick = (actionType: string, payload: any) => {
    if (actionType === 'FOCUS_ROOM') {
      const room = rooms.find((r) => r.id === payload || r.roomNumber === payload);
      if (room) {
        setSelectedRoom(room);
        setActiveFloorNumber(room.floorNumber);
        setActiveBuildingId(room.buildingId);
        setSelectedBuildingView(true);
      }
    } else if (actionType === 'START_ROUTE') {
      setActiveRoute({
        originName: 'Lecture Hall 101',
        destinationName: 'AI & Robotics Lab 204',
        totalDistanceMeters: 54,
        estimatedMinutes: 1.8,
        waypoints: [],
        accessible: true,
        reasoning: 'Shortest indoor accessible corridor via elevator',
      });
      setActiveFloorNumber(2);
      setSelectedBuildingView(true);
    } else if (actionType === 'SAFETY_MODE') {
      setViewMode('SAFETY');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col transition-all animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Campus AI Copilot
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">Spatially Grounded Natural Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-lg'
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Spatial Explanation Card if available */}
              {msg.spatialExplanation && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 bg-slate-950/60 rounded-xl p-2.5">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> Spatial Decision Reasoning
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {msg.spatialExplanation.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400">✓</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Spatial Action Triggers */}
              {msg.spatialActions && msg.spatialActions.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {msg.spatialActions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(act.type, act.payload)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30 transition-all hover:scale-102"
                    >
                      <ArrowRight className="w-3 h-3" />
                      {act.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs text-slate-400 font-medium">Resolving spatial graph & sensor telemetry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your campus anything..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
