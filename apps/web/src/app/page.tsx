import React from 'react';
import { GlobalAIChatBar } from '../components/ai/GlobalAIChatBar';
import { CampusMapView } from '../components/map/CampusMapView';
import { Navigation, Calendar, Wrench, ShieldCheck, Compass, Cpu } from 'lucide-react';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6">
      {/* Top Header */}
      <header className="w-full max-w-6xl flex items-center justify-between py-4 border-b border-slate-900 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            S
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">SPATIAL INTELLIGENCE</h1>
            <p className="text-[11px] text-slate-400">Campus Operating System • Main Campus</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Knowledge Graph Live
          </span>
        </div>
      </header>

      {/* Main Core View */}
      <div className="w-full max-w-6xl flex flex-col gap-6">
        {/* Global AI Chat Bar */}
        <GlobalAIChatBar />

        {/* Quick Operational Actions Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Next Class', icon: Calendar, color: 'text-cyan-400' },
            { label: 'Find Room', icon: Compass, color: 'text-indigo-400' },
            { label: 'Indoor Route', icon: Navigation, color: 'text-blue-400' },
            { label: 'Lab Machines', icon: Cpu, color: 'text-emerald-400' },
            { label: 'Report Issue', icon: Wrench, color: 'text-amber-400' },
            { label: 'Safety Exits', icon: ShieldCheck, color: 'text-rose-400' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
              >
                <Icon className={`w-4 h-4 ${action.color} group-hover:scale-110 transition-transform`} />
                <span className="text-xs font-medium text-slate-200">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2.5D Interactive Cartography Canvas */}
        <CampusMapView />
      </div>
    </main>
  );
}
