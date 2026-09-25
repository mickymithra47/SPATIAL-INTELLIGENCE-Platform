'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAIChatStore, ExtendedChatMessage } from '../../stores/useAIChatStore';
import { useSpatialStore, UserRole } from '../../stores/useSpatialStore';
import {
  Sparkles,
  Send,
  Plus,
  ArrowLeft,
  Compass,
  Navigation,
  Wrench,
  Calendar,
  Search,
  Bot,
  User,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';

export default function AIChatPage() {
  const { messages, sendMessage, isLoading, clearChat, conversationId } = useAIChatStore();
  const { userRole, setUserRole, rooms, setSelectedRoom, setActiveFloorNumber, setActiveBuildingId, setSelectedBuildingView, setActiveRoute } = useSpatialStore();

  const [input, setInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setErrorMessage(null);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await sendMessage(trimmed);
    } catch (err: any) {
      setErrorMessage('Unable to reach AI backend server. Please verify the backend is running on port 4000.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const samplePrompts = [
    { label: 'Where is Room 204?', icon: Search, text: 'Where is Room 204?' },
    { label: 'Navigate from 101 to 204', icon: Navigation, text: 'How do I get from Room 101 to Room 204?' },
    { label: 'Room 204 Timetable', icon: Calendar, text: 'What is scheduled in Room 204?' },
    { label: 'Report Projector Issue', icon: Wrench, text: 'Create a maintenance ticket for the projector in Room 204' },
  ];

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
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 bg-slate-900/80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col p-4 shrink-0">
        {/* Header & Back Link */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            Back to Campus Map
          </Link>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>

        {/* Start New Chat Button */}
        <button
          onClick={clearChat}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] mb-6"
        >
          <Plus className="w-4 h-4" />
          + New Chat
        </button>

        {/* Role Switcher */}
        <div className="mb-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <label className="text-[11px] font-semibold text-slate-400 block mb-2">User Identity Role:</label>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="MAINTENANCE_STAFF">Maintenance Staff</option>
            <option value="CAMPUS_ADMIN">Campus Admin</option>
          </select>
        </div>

        {/* Quick Sample Prompts Section */}
        <div className="flex-1 overflow-y-auto space-y-2">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">Recommended Prompts</h4>
          {samplePrompts.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                onClick={() => sendMessage(p.text)}
                disabled={isLoading}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-2.5 group"
              >
                <div className="p-1.5 rounded-lg bg-slate-900 group-hover:bg-cyan-500/20 text-cyan-400">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Info */}
        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Spatial AI API v1</span>
          <span>Port 4000</span>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Main Header */}
        <header className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                🤖 AI ASSISTANT / COPILOT
              </h1>
              <p className="text-xs text-slate-400">Connected to Spatial Intelligence Backend (http://localhost:4000)</p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </header>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex gap-3 md:gap-4 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold shadow-md ${
                    isUser
                      ? 'bg-indigo-600 shadow-indigo-500/20'
                      : 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/20'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className={`flex flex-col max-w-[85%] sm:max-w-[75%]`}>
                  {/* Sender Name & Timestamp */}
                  <div className={`flex items-center gap-2 mb-1.5 text-[11px] ${isUser ? 'justify-end text-indigo-300' : 'text-cyan-300'}`}>
                    <span className="font-bold">{isUser ? 'You' : 'AI Assistant'}</span>
                    <span className="text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Message Card */}
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 shadow-xl'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>

                    {/* Spatial Actions if available */}
                    {msg.spatialActions && msg.spatialActions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
                        {msg.spatialActions.map((act, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(act.type, act.payload)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all hover:scale-102"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-4xl mr-auto">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 text-white shadow-md shadow-cyan-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm flex items-center gap-3 shadow-xl">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="font-medium text-xs">AI is thinking... querying backend graph</span>
              </div>
            </div>
          )}

          {/* Friendly Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Box Footer */}
        <footer className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            <div className="relative flex items-end bg-slate-950 border border-slate-800 focus-within:border-cyan-500 rounded-2xl shadow-2xl transition-all p-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message to the AI Assistant... (Press Enter to send, Shift+Enter for new line)"
                rows={1}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-40 px-3 py-2"
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-40 disabled:hover:from-cyan-600 disabled:hover:to-indigo-600 transition-all shrink-0 font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Send</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Enter</kbd> to send</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Shift + Enter</kbd> for line break</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
