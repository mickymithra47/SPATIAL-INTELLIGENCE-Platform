'use client';

import React, { useState } from 'react';
import { useSpatialStore, ViewMode } from '../../stores/useSpatialStore';
import { useAIChatStore } from '../../stores/useAIChatStore';
import {
  Compass,
  Sparkles,
  Map,
  Navigation,
  Building,
  DoorOpen,
  Calendar,
  FlaskConical,
  Cpu,
  Users,
  Zap,
  ShieldAlert,
  Wrench,
  BarChart3,
  Network,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react';

interface MissionControlSidebarProps {
  onOpenReportModal: () => void;
  onOpenAnalytics: () => void;
  onOpenKnowledgeGraph: () => void;
  onStartDemo: () => void;
}

export function MissionControlSidebar({
  onOpenReportModal,
  onOpenAnalytics,
  onOpenKnowledgeGraph,
  onStartDemo,
}: MissionControlSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { viewMode, setViewMode, setSelectedBuildingView, setActiveBuildingId, setActiveFloorNumber, liveTelemetry } =
    useSpatialStore();
  const { toggleOpen, sendMessage } = useAIChatStore();

  const navItems = [
    {
      group: 'Core Spatial',
      items: [
        {
          id: 'overview',
          label: 'Campus Overview',
          icon: Compass,
          action: () => {
            setViewMode('DIGITAL_TWIN');
            setSelectedBuildingView(false);
          },
          active: viewMode === 'DIGITAL_TWIN',
        },
        {
          id: 'copilot',
          label: 'AI Copilot',
          icon: Sparkles,
          action: () => toggleOpen(),
          badge: 'Live',
        },
        {
          id: 'live_map',
          label: 'Digital Twin Map',
          icon: Map,
          action: () => {
            setViewMode('DIGITAL_TWIN');
            setSelectedBuildingView(true);
            setActiveFloorNumber(2);
          },
        },
        {
          id: 'navigation',
          label: 'Indoor Navigation',
          icon: Navigation,
          action: () => sendMessage('Navigate from Room 101 to Room 204'),
        },
      ],
    },
    {
      group: 'Operations',
      items: [
        {
          id: 'buildings',
          label: 'Buildings Directory',
          icon: Building,
          action: () => {
            setViewMode('DIGITAL_TWIN');
            setSelectedBuildingView(false);
          },
        },
        {
          id: 'rooms',
          label: 'Classrooms & Halls',
          icon: DoorOpen,
          action: () => sendMessage('Find an empty classroom'),
        },
        {
          id: 'classes',
          label: 'Timetables & Classes',
          icon: Calendar,
          action: () => sendMessage('Where is my next class?'),
        },
        {
          id: 'labs',
          label: 'Research Labs',
          icon: FlaskConical,
          action: () => sendMessage('Find all robotics labs'),
        },
        {
          id: 'equipment',
          label: 'Equipment Telemetry',
          icon: Cpu,
          action: () => sendMessage('Which equipment needs maintenance?'),
        },
        {
          id: 'people_flow',
          label: 'People Density Flow',
          icon: Users,
          action: () => sendMessage('Show crowded areas on campus'),
        },
      ],
    },
    {
      group: 'Intelligence & Systems',
      items: [
        {
          id: 'energy',
          label: 'Energy & Microgrid',
          icon: Zap,
          action: () => onOpenAnalytics(),
        },
        {
          id: 'safety',
          label: 'Safety & Emergency',
          icon: ShieldAlert,
          action: () => setViewMode('SAFETY'),
          badge: 'Alert',
        },
        {
          id: 'maintenance',
          label: 'Maintenance Desk',
          icon: Wrench,
          action: () => onOpenReportModal(),
        },
        {
          id: 'analytics',
          label: 'Campus Analytics',
          icon: BarChart3,
          action: () => onOpenAnalytics(),
        },
        {
          id: 'knowledge_graph',
          label: 'Knowledge Graph',
          icon: Network,
          action: () => onOpenKnowledgeGraph(),
        },
      ],
    },
  ];

  return (
    <aside
      className={`relative z-20 flex flex-col bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/90 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Platform Brand */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20 shrink-0">
            S
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-white tracking-wider">CAMPUS OS</span>
              <span className="text-[10px] text-cyan-400 font-medium tracking-tight">Spatial Intelligence</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 1-Click Interactive Demo Button for Presentations */}
      <div className="p-3">
        <button
          onClick={onStartDemo}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all ${
            isCollapsed ? 'p-2' : ''
          }`}
          title="Start Automated Presentation Demo"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {!isCollapsed && <span>START DEMO TOUR</span>}
        </button>
      </div>

      {/* Nav Groups Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-none">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    item.active
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      item.active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        item.badge === 'Alert'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Operational Status Footer */}
      {!isCollapsed && (
        <div className="p-3 m-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Telemetry</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="text-slate-300">
              <span className="font-bold text-white">{liveTelemetry.totalOccupants}</span> Occupants
            </div>
            <div className="text-slate-300">
              <span className="font-bold text-white">{liveTelemetry.onlineBuildings}</span> Buildings
            </div>
            <div className="text-slate-300">
              <span className="font-bold text-amber-400">{liveTelemetry.maintenanceAlerts}</span> Alerts
            </div>
            <div className="text-slate-300">
              <span className="font-bold text-rose-400">{liveTelemetry.safetyAlerts}</span> Safety
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
