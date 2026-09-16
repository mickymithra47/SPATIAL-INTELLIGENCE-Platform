'use client';

import React from 'react';
import { useSpatialStore } from '../../stores/useSpatialStore';
import { Layers, Navigation, AlertTriangle, Monitor } from 'lucide-react';

export function CampusMapView() {
  const { activeFloor, selectedRoom, setSelectedRoom } = useSpatialStore();

  return (
    <div className="relative w-full h-[550px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Map Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60 pointer-events-auto shadow-lg flex items-center gap-3">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">
            Block B • {activeFloor?.name || 'Floor 2 (Computer Science & AI)'}
          </span>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          {['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'].map((lvl, idx) => (
            <button
              key={lvl}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                idx === 1
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-cyan-500/20 shadow-md'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* 2.5D Campus / Floor Graphic Mockup */}
      <div className="flex-1 relative flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <svg className="w-full h-full max-w-2xl max-h-[380px] drop-shadow-2xl" viewBox="0 0 800 450">
          {/* Floor outline */}
          <polygon
            points="120,80 680,80 740,360 60,360"
            className="fill-slate-900/60 stroke-cyan-500/30 stroke-2"
          />

          {/* Central Corridor */}
          <polygon
            points="360,80 440,80 440,360 360,360"
            className="fill-cyan-500/5 stroke-cyan-500/20 stroke-1 stroke-dasharray-4"
          />

          {/* AI Lab 2 (Interactive Room) */}
          <g
            className="cursor-pointer group"
            onClick={() =>
              setSelectedRoom({
                id: 'r-sample-ai-lab-2',
                floorId: 'fl-b-02',
                roomNumber: 'B-204',
                name: 'AI & Robotics Lab 2',
                roomType: 'RESEARCH_LAB',
                capacity: 40,
                isAccessible: true,
              })
            }
          >
            <polygon
              points="140,110 340,110 340,240 120,240"
              className="fill-cyan-500/20 stroke-cyan-400 stroke-2 group-hover:fill-cyan-500/30 transition-all"
            />
            <text x="180" y="170" fill="#38bdf8" fontSize="14" fontWeight="600">
              AI Lab 2 (B-204)
            </text>
            <text x="180" y="195" fill="#94a3b8" fontSize="11">
              40 Workstations • Active
            </text>
          </g>

          {/* Seminar Hall 201 */}
          <g className="cursor-pointer group">
            <polygon
              points="460,110 660,110 680,240 460,240"
              className="fill-slate-800/40 stroke-slate-700 stroke-1 group-hover:fill-slate-800/80 transition-all"
            />
            <text x="500" y="170" fill="#cbd5e1" fontSize="13">
              Seminar Hall 201
            </text>
            <text x="500" y="195" fill="#64748b" fontSize="11">
              Capacity: 90
            </text>
          </g>

          {/* Restrooms & Elevator Waypoint */}
          <polygon
            points="110,260 220,260 190,340 70,340"
            className="fill-slate-800/20 stroke-slate-700/80 stroke-1"
          />
          <text x="110" y="305" fill="#94a3b8" fontSize="11">
            Elevators & Ramps
          </text>
        </svg>

        {/* Selected Room Overlay Badge */}
        {selectedRoom && (
          <div className="absolute bottom-6 left-6 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 shadow-xl max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Room Inspector
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                Available
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">{selectedRoom.name}</h4>
            <p className="text-xs text-slate-400 mb-3">Room {selectedRoom.roomNumber} • Capacity: {selectedRoom.capacity} seats</p>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-all">
                <Navigation className="w-3.5 h-3.5" /> Navigate
              </button>
              <button className="flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-all">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
