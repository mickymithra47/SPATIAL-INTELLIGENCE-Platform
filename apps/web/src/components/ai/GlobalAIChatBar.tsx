'use client';

import React, { useState } from 'react';
import { useAIChatStore } from '../../stores/useAIChatStore';
import { useSpatialStore } from '../../stores/useSpatialStore';
import { Sparkles, ArrowRight, Compass, Navigation, Users, ShieldAlert, Cpu, Wrench } from 'lucide-react';

export function GlobalAIChatBar() {
  const { sendMessage, isLoading, toggleOpen } = useAIChatStore();
  const { userRole } = useSpatialStore();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const samplePrompts = [
    { label: 'Next Class', icon: Compass, text: 'Where is my next class?' },
    { label: 'Navigate to 204', icon: Navigation, text: 'Navigate to AI Lab 204' },
    { label: 'Free Labs', icon: Sparkles, text: 'Which labs are free now?' },
    { label: 'Crowded Areas', icon: Users, text: 'Show crowded areas on campus' },
    { label: 'Emergency Exits', icon: ShieldAlert, text: 'Where is the nearest emergency exit?' },
    { label: 'Equipment Issues', icon: Cpu, text: 'Which equipment needs maintenance?' },
  ];

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Omnipresent Floating AI Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400/60 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-2xl shadow-2xl transition-all p-1.5"
      >
        <div className="flex items-center justify-center pl-3.5 pr-2 text-cyan-400">
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
          </div>
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask your campus anything... (e.g. "Where is Room 204?", "Take me to AI Lab", "Show crowded areas")`}
          className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none px-2 py-2 tracking-wide font-normal"
        />

        <div className="flex items-center gap-2 pr-1.5">
          <button
            type="button"
            onClick={toggleOpen}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-medium text-slate-300 border border-slate-700 transition-colors"
          >
            History
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 group"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </form>

      {/* Quick Prompts Carousel Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] pl-1 shrink-0">
          Quick Queries:
        </span>
        {samplePrompts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => sendMessage(item.text)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800/80 hover:border-cyan-500/40 transition-all shrink-0 font-medium"
            >
              <Icon className="w-3 h-3 text-cyan-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
