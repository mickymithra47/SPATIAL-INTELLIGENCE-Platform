'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSpatialStore, UserRole } from '../../stores/useSpatialStore';
import { useAIChatStore } from '../../stores/useAIChatStore';

import {
  Building,
  Bell,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Layers,
  Wrench,
  UserCheck,
  Activity,
  Play,
} from 'lucide-react';

interface TopHeaderBarProps {
  onOpenReportModal: () => void;
  onStartDemo: () => void;
}

export function TopHeaderBar({ onOpenReportModal, onStartDemo }: TopHeaderBarProps) {
  const {
    activeBuildingId,
    setActiveBuildingId,
    buildings,
    campuses,
    userRole,
    setUserRole,
    liveTelemetry,
  } = useSpatialStore();
  const { toggleOpen } = useAIChatStore();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'AI Lab 204 Workstation WS-02 Issue', time: '10 min ago', type: 'MAINTENANCE' },
    { id: 2, title: 'Block B Elevator #1 Operational', time: '25 min ago', type: 'SYSTEM' },
    { id: 3, title: 'Seminar Hall 201 Available for study', time: '1 hr ago', type: 'AVAILABILITY' },
    { id: 4, title: 'Fire Drill Scheduled for Friday 11:00', time: '2 hr ago', type: 'SAFETY' },
  ];

  const roles: UserRole[] = ['STUDENT', 'FACULTY', 'MAINTENANCE_STAFF', 'CAMPUS_ADMIN'];

  return (
    <header className="w-full h-16 bg-slate-900/90 backdrop-blur-2xl border-b border-slate-800/90 px-6 flex items-center justify-between z-30">
      {/* Left: Campus & Building Switcher */}
      <div className="flex items-center gap-4">
        {/* Campus Badge */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">NIT Main Technology Campus</span>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        {/* Building Dropdown Selector */}
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-cyan-400" />
          <select
            value={activeBuildingId}
            onChange={(e) => setActiveBuildingId(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Live Telemetry, Notifications, Demo Launcher, Role Selector */}
      <div className="flex items-center gap-3">
        {/* Real-time Health Monitor */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5" />
          <span>Spatial Graph: 100% Online</span>
        </div>

        {/* 1-Click Presentation Demo Button */}
        <button
          onClick={onStartDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-md"
        >
          <Play className="w-3 h-3 fill-current" /> Demo Mode
        </button>

        {/* Quick Report Issue Button */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Report Issue</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl p-4 shadow-2xl z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Campus Alerts & Telemetry</span>
                <span className="text-[10px] font-semibold text-cyan-400">{notifications.length} New</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div className="font-semibold text-slate-200">{n.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{n.time}</span>
                      <span className="text-cyan-400">{n.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Copilot Quick Drawer Toggle */}
        <button
          onClick={toggleOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Fullscreen AI Chat Application Link */}
        <Link
          href="/chat"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white border border-cyan-400/30 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Chat</span>
        </Link>


        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-white transition-all shadow-md"
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{userRole.replace('_', ' ')}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Switch Persona</div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setUserRole(r);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    userRole === r ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
