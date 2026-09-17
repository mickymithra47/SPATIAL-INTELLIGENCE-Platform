'use client';

import React from 'react';
import { useSpatialStore } from '../../stores/useSpatialStore';
import { Layers, Navigation, AlertTriangle, Building, Compass, CheckCircle2, X } from 'lucide-react';

export function CampusMapView() {
  const {
    activeFloorNumber,
    setActiveFloorNumber,
    activeBuildingId,
    setActiveBuildingId,
    buildings,
    selectedRoom,
    setSelectedRoom,
    highlightedEntityId,
    activeRoute,
    setActiveRoute,
  } = useSpatialStore();

  const currentBuilding = buildings.find((b) => b.id === activeBuildingId) || buildings[0];

  return (
    <div className="relative w-full h-[580px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Map Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Building & Campus Badge */}
        <div className="bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60 pointer-events-auto shadow-lg flex items-center gap-3">
          <Building className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-wide">
              {currentBuilding.name}
            </span>
            <span className="text-[10px] text-slate-400">
              Level {activeFloorNumber} • {activeFloorNumber === 1 ? 'Ground Floor (Lecture Halls & Labs)' : 'Second Floor (AI Research & Seminars)'}
            </span>
          </div>
        </div>

        {/* Building & Floor Switcher Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 flex gap-1">
            <button
              onClick={() => setActiveBuildingId('b-cse-001')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeBuildingId === 'b-cse-001'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Block B (CSE)
            </button>
            <button
              onClick={() => setActiveBuildingId('b-admin-002')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeBuildingId === 'b-admin-002'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Block A (Admin)
            </button>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 flex gap-1">
            {[1, 2].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveFloorNumber(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeFloorNumber === lvl
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Floor {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2.5D Interactive Cartography Canvas */}
      <div className="flex-1 relative flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <svg className="w-full h-full max-w-3xl max-h-[420px] drop-shadow-2xl" viewBox="0 0 800 450">
          {/* Main Floor Geometry Boundary */}
          <polygon
            points="100,70 700,70 760,370 40,370"
            className="fill-slate-900/80 stroke-cyan-500/30 stroke-2"
          />

          {/* Central Corridor */}
          <polygon
            points="360,70 440,70 440,370 360,370"
            className="fill-cyan-500/5 stroke-cyan-500/20 stroke-1 stroke-dasharray-4"
          />

          {/* FLOOR 2 ROOMS */}
          {activeFloorNumber === 2 && (
            <>
              {/* Room 204 (AI & Robotics Lab 2) */}
              <g
                className="cursor-pointer group"
                onClick={() =>
                  setSelectedRoom({
                    id: 'r-204',
                    floorId: 'fl-b-02',
                    roomNumber: '204',
                    name: 'AI & Robotics Lab 204',
                    roomType: 'RESEARCH_LAB',
                    capacity: 40,
                    isAccessible: true,
                  })
                }
              >
                <polygon
                  points="130,100 340,100 340,230 110,230"
                  className={`transition-all ${
                    highlightedEntityId === 'r-204' || selectedRoom?.roomNumber === '204'
                      ? 'fill-cyan-500/30 stroke-cyan-400 stroke-3 animate-pulse'
                      : 'fill-slate-800/60 stroke-cyan-500/40 stroke-1 group-hover:fill-cyan-500/20'
                  }`}
                />
                <text x="160" y="155" fill="#38bdf8" fontSize="14" fontWeight="700">
                  AI Lab 204
                </text>
                <text x="160" y="180" fill="#94a3b8" fontSize="11">
                  P-204 Projector • 40 Workstations
                </text>
              </g>

              {/* Room 201 (Seminar Hall) */}
              <g
                className="cursor-pointer group"
                onClick={() =>
                  setSelectedRoom({
                    id: 'r-201',
                    floorId: 'fl-b-02',
                    roomNumber: '201',
                    name: 'Seminar Hall 201',
                    roomType: 'CLASSROOM',
                    capacity: 90,
                    isAccessible: true,
                  })
                }
              >
                <polygon
                  points="460,100 670,100 690,230 460,230"
                  className={`transition-all ${
                    highlightedEntityId === 'r-201' || selectedRoom?.roomNumber === '201'
                      ? 'fill-cyan-500/30 stroke-cyan-400 stroke-3'
                      : 'fill-slate-800/40 stroke-slate-700 stroke-1 group-hover:fill-slate-800/80'
                  }`}
                />
                <text x="500" y="155" fill="#cbd5e1" fontSize="14" fontWeight="600">
                  Seminar Hall 201
                </text>
                <text x="500" y="180" fill="#64748b" fontSize="11">
                  Capacity: 90 seats • Tiered
                </text>
              </g>

              {/* Room 202 (Faculty Office) */}
              <g
                className="cursor-pointer group"
                onClick={() =>
                  setSelectedRoom({
                    id: 'r-202',
                    floorId: 'fl-b-02',
                    roomNumber: '202',
                    name: 'Faculty Room 202',
                    roomType: 'FACULTY_OFFICE',
                    capacity: 15,
                    isAccessible: true,
                  })
                }
              >
                <polygon
                  points="460,250 690,250 710,340 460,340"
                  className="fill-slate-800/30 stroke-slate-700 stroke-1 group-hover:fill-slate-800/60 transition-all"
                />
                <text x="510" y="300" fill="#94a3b8" fontSize="12" fontWeight="500">
                  Faculty Office 202
                </text>
              </g>
            </>
          )}

          {/* FLOOR 1 ROOMS */}
          {activeFloorNumber === 1 && (
            <>
              {/* Room 101 (Lecture Hall 101) */}
              <g
                className="cursor-pointer group"
                onClick={() =>
                  setSelectedRoom({
                    id: 'r-101',
                    floorId: 'fl-b-01',
                    roomNumber: '101',
                    name: 'Lecture Hall 101',
                    roomType: 'CLASSROOM',
                    capacity: 60,
                    isAccessible: true,
                  })
                }
              >
                <polygon
                  points="130,100 340,100 340,230 110,230"
                  className={`transition-all ${
                    highlightedEntityId === 'r-101' || selectedRoom?.roomNumber === '101'
                      ? 'fill-cyan-500/30 stroke-cyan-400 stroke-3 animate-pulse'
                      : 'fill-slate-800/60 stroke-cyan-500/40 stroke-1 group-hover:fill-cyan-500/20'
                  }`}
                />
                <text x="160" y="155" fill="#38bdf8" fontSize="14" fontWeight="700">
                  Lecture Hall 101
                </text>
                <text x="160" y="180" fill="#94a3b8" fontSize="11">
                  P-101 Projector • 60 seats
                </text>
              </g>

              {/* Room 102 (Computing Systems Lab) */}
              <g
                className="cursor-pointer group"
                onClick={() =>
                  setSelectedRoom({
                    id: 'r-102',
                    floorId: 'fl-b-01',
                    roomNumber: '102',
                    name: 'Computing Systems Lab 102',
                    roomType: 'COMPUTER_LAB',
                    capacity: 40,
                    isAccessible: true,
                  })
                }
              >
                <polygon
                  points="460,100 670,100 690,230 460,230"
                  className="fill-slate-800/40 stroke-slate-700 stroke-1 group-hover:fill-slate-800/80 transition-all"
                />
                <text x="490" y="155" fill="#cbd5e1" fontSize="14" fontWeight="600">
                  Computing Lab 102
                </text>
                <text x="490" y="180" fill="#64748b" fontSize="11">
                  40 High-Performance Nodes
                </text>
              </g>
            </>
          )}

          {/* Elevators and Staircase Waypoints */}
          <g className="cursor-default">
            <polygon
              points="110,250 230,250 200,340 70,340"
              className="fill-indigo-950/40 stroke-indigo-500/40 stroke-1"
            />
            <text x="110" y="295" fill="#818cf8" fontSize="12" fontWeight="600">
              Vertical Core
            </text>
            <text x="105" y="315" fill="#6366f1" fontSize="10">
              Elevator #1 + Stair A
            </text>
          </g>

          {/* ACTIVE ROUTE OVERLAY */}
          {activeRoute && (
            <g className="animate-fade-in">
              {/* Waypoint Connection Line */}
              <polyline
                points="230,170 400,170 400,300 160,300"
                fill="none"
                stroke="#00e5ff"
                strokeWidth="4"
                strokeDasharray="8 4"
                className="animate-pulse"
              />
              <circle cx="230" cy="170" r="7" fill="#00e5ff" className="animate-ping" />
              <circle cx="230" cy="170" r="5" fill="#ffffff" />
              <circle cx="160" cy="300" r="7" fill="#38bdf8" />
              <circle cx="160" cy="300" r="5" fill="#ffffff" />
            </g>
          )}
        </svg>

        {/* Active Route HUD Banner */}
        {activeRoute && (
          <div className="absolute top-16 left-4 bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-3 shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                Active Route: {activeRoute.originName} → {activeRoute.destinationName}
              </div>
              <div className="text-[11px] text-cyan-300">
                {activeRoute.totalDistanceMeters}m • ~{activeRoute.estimatedMinutes} min walking
              </div>
            </div>
            <button
              onClick={() => setActiveRoute(null)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              title="Clear Route"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Selected Room Overlay Badge */}
        {selectedRoom && (
          <div className="absolute bottom-6 left-6 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 shadow-xl max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> Room Inspector
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Operational
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">{selectedRoom.name}</h4>
            <p className="text-xs text-slate-400 mb-3">
              Room {selectedRoom.roomNumber} • Capacity: {selectedRoom.capacity} seats • Accessible Entrance
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  useSpatialStore.getState().setActiveRoute({
                    originName: 'Current Waypoint',
                    destinationName: selectedRoom.name,
                    totalDistanceMeters: 54,
                    estimatedMinutes: 1.8,
                    waypoints: [],
                  });
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-all"
              >
                <Navigation className="w-3.5 h-3.5" /> Start Navigation
              </button>
              <button
                onClick={() => {
                  alert(`Maintenance request dialog opened for ${selectedRoom.name}`);
                }}
                className="flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-all"
                title="Report Issue"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
