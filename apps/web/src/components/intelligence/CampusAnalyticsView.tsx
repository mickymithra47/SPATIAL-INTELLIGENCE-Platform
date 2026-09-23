'use client';

import React from 'react';
import { BarChart3, X, Zap, Users, Clock, Cpu, ArrowUpRight, TrendingUp, CheckCircle2 } from 'lucide-react';

interface CampusAnalyticsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CampusAnalyticsView({ isOpen, onClose }: CampusAnalyticsViewProps) {
  if (!isOpen) return null;

  const hourlyUtilization = [
    { time: '08:00', percent: 45, label: 'Early Arrival' },
    { time: '10:00', percent: 91, label: 'Peak Lectures' },
    { time: '12:00', percent: 64, label: 'Lunch / Commons' },
    { time: '14:00', percent: 82, label: 'Lab Sessions' },
    { time: '16:00', percent: 76, label: 'Research & Study' },
    { time: '18:00', percent: 38, label: 'Evening Classes' },
  ];

  const buildingEnergy = [
    { name: 'Block B (CSE)', kwh: 142.5, percent: 84, color: 'bg-cyan-500' },
    { name: 'Student Commons', kwh: 110.8, percent: 68, color: 'bg-indigo-500' },
    { name: 'Central Library', kwh: 98.2, percent: 55, color: 'bg-emerald-500' },
    { name: 'Robotics Annex', kwh: 86.4, percent: 48, color: 'bg-purple-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Campus Analytics & Operational Intelligence</h2>
              <p className="text-xs text-slate-400">Live Space Utilization, Smart Energy Metrics & Equipment Health</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> Avg Campus Occupancy
            </span>
            <span className="text-2xl font-black text-white mt-1">68.4%</span>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +4.2% vs yesterday
            </span>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Total Power Draw
            </span>
            <span className="text-2xl font-black text-white mt-1">437.9 kW</span>
            <span className="text-[10px] text-cyan-400 font-semibold mt-1">Optimal energy band</span>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Maintenance MTTR
            </span>
            <span className="text-2xl font-black text-white mt-1">4.2 hrs</span>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1">94% resolved &lt; 24h</span>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Asset Health Score
            </span>
            <span className="text-2xl font-black text-white mt-1">94.8 / 100</span>
            <span className="text-[10px] text-slate-400 mt-1">1 active maintenance ticket</span>
          </div>
        </div>

        {/* Middle Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chart 1: Hourly Room Utilization Curve */}
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-3xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hourly Room Utilization (%)</h4>
              <span className="text-[10px] text-slate-400 font-medium">Monday Schedule</span>
            </div>
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {hourlyUtilization.map((slot) => (
                <div key={slot.time} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      {slot.time} <span className="text-slate-500 font-normal">({slot.label})</span>
                    </span>
                    <span className="font-bold text-cyan-400">{slot.percent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-850 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-700"
                      style={{ width: `${slot.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Energy Consumption by Facility */}
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-3xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Facility Energy Intensity</h4>
              <span className="text-[10px] text-slate-400 font-medium">Smart Metering</span>
            </div>
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {buildingEnergy.map((b) => (
                <div key={b.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{b.name}</span>
                    <span className="font-bold text-white">{b.kwh} kWh</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-850 overflow-hidden">
                    <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
