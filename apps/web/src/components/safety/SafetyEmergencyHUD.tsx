'use client';

import React from 'react';
import { useSpatialStore } from '../../stores/useSpatialStore';
import { ShieldAlert, Navigation, PhoneCall, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

export function SafetyEmergencyHUD() {
  const { viewMode, setViewMode, setActiveRoute, setLayers } = useSpatialStore();

  if (viewMode !== 'SAFETY') return null;

  const handleEvacuateNow = () => {
    setActiveRoute({
      originName: 'Your Current Location (Room 204)',
      destinationName: 'Primary Safe Assembly Lawn (Green Zone A)',
      totalDistanceMeters: 40,
      estimatedMinutes: 0.6,
      waypoints: [],
      accessible: true,
      reasoning: 'Emergency egress path via Staircase B North to Central Lawn',
      steps: [
        { instruction: 'Evacuate Room 204 into Corridor A', distance: '5m', level: 'Floor 2', type: 'DOOR' },
        { instruction: 'Head North to Emergency Exit Staircase B', distance: '12m', level: 'Floor 2', type: 'WALK' },
        { instruction: 'Descend to Ground Floor Exit Door', distance: '10m', level: 'Level 2 → 1', type: 'STAIR' },
        { instruction: 'Proceed to Central Assembly Lawn', distance: '13m', level: 'Ground', type: 'WALK' },
      ],
    });
  };

  const handleDismiss = () => {
    setViewMode('DIGITAL_TWIN');
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 p-4 flex justify-center animate-in slide-in-from-top duration-300 pointer-events-none">
      <div className="w-full max-w-4xl bg-rose-950/95 backdrop-blur-2xl border-2 border-rose-500 rounded-3xl p-5 shadow-[0_0_50px_rgba(244,63,94,0.4)] pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Alert Badge */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-lg shadow-rose-600/50 animate-pulse shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-ping">
                CRITICAL
              </span>
              <h2 className="text-base font-black text-white tracking-wide uppercase">
                EMERGENCY SAFETY & EVACUATION ACTIVE
              </h2>
            </div>
            <p className="text-xs text-rose-200 mt-0.5">
              Nearest Safe Exit: <span className="font-bold text-white">Staircase B North (40m)</span> • Assembly Point:{' '}
              <span className="font-bold text-white">Green Zone Lawn A</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleEvacuateNow}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-rose-950 font-black text-xs uppercase tracking-wider shadow-xl transition-all hover:scale-105"
          >
            <Navigation className="w-4 h-4 text-rose-600 fill-current" />
            SHOW EVACUATION ROUTE
          </button>

          <a
            href="tel:911"
            className="flex items-center justify-center p-2.5 rounded-xl bg-rose-900 hover:bg-rose-800 text-white transition-colors"
            title="Call Campus Security Dispatch"
          >
            <PhoneCall className="w-4 h-4" />
          </a>

          <button
            onClick={handleDismiss}
            className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
            title="Dismiss Emergency Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
