'use client';

import React from 'react';
import {
  Compass,
  Map,
  Navigation,
  Sparkles,
  Layers,
  MoreHorizontal,
  Flame,
  Wrench,
  BarChart3,
  Network,
} from 'lucide-react';

interface CompactSidebarProps {
  activeTab: 'CAMPUS' | 'DIGITAL_TWIN' | 'NAVIGATE' | 'AI_COPILOT';
  setActiveTab: (tab: 'CAMPUS' | 'DIGITAL_TWIN' | 'NAVIGATE' | 'AI_COPILOT') => void;
  onOpenLayers: () => void;
  onOpenMore: () => void;
  onStartNavigatePrompt: () => void;
  onFocusAICopilot: () => void;
}

export function CompactSidebar({
  activeTab,
  setActiveTab,
  onOpenLayers,
  onOpenMore,
  onStartNavigatePrompt,
  onFocusAICopilot,
}: CompactSidebarProps) {
  return (
    <aside className="w-16 md:w-20 bg-slate-950 border-r border-slate-800/80 flex flex-col items-center py-5 justify-between select-none z-20">
      {/* Top Core Navigation Items */}
      <div className="flex flex-col items-center gap-6 w-full px-2">
        {/* Logo / Brand Icon */}
        <div
          onClick={() => setActiveTab('DIGITAL_TWIN')}
          className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center cursor-pointer hover:border-cyan-500/80 transition-all shadow-md group"
          title="Campus Spatial OS"
        >
          <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
        </div>

        <div className="w-8 h-px bg-slate-800/80" />

        {/* Core Nav Group */}
        <nav className="flex flex-col items-center gap-3 w-full">
          {/* 1. Campus */}
          <button
            onClick={() => setActiveTab('CAMPUS')}
            className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === 'CAMPUS'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Campus Overview"
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px] font-semibold tracking-tight">Campus</span>
          </button>

          {/* 2. Digital Twin (Primary) */}
          <button
            onClick={() => setActiveTab('DIGITAL_TWIN')}
            className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === 'DIGITAL_TWIN'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Interactive Digital Twin Floor Plan"
          >
            <Map className="w-4 h-4" />
            <span className="text-[10px] tracking-tight">Digital Twin</span>
          </button>

          {/* 3. Navigate */}
          <button
            onClick={() => {
              setActiveTab('NAVIGATE');
              onStartNavigatePrompt();
            }}
            className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === 'NAVIGATE'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Indoor Route Calculation"
          >
            <Navigation className="w-4 h-4" />
            <span className="text-[10px] font-semibold tracking-tight">Navigate</span>
          </button>

          {/* 4. AI Copilot */}
          <button
            onClick={() => {
              setActiveTab('AI_COPILOT');
              onFocusAICopilot();
            }}
            className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === 'AI_COPILOT'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Campus AI Copilot"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-semibold tracking-tight">Copilot</span>
          </button>
        </nav>
      </div>

      {/* Bottom Optional Layers & More */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        <button
          onClick={onOpenLayers}
          className="w-full py-2 rounded-xl flex flex-col items-center gap-1 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Toggle Layers"
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px]">Layers</span>
        </button>

        <button
          onClick={onOpenMore}
          className="w-full py-2 rounded-xl flex flex-col items-center gap-1 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="More Facilities & Future Capabilities"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </aside>
  );
}
