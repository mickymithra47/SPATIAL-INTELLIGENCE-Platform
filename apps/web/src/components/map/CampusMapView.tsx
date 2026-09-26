'use client';

import React, { useState } from 'react';
import { useSpatialStore } from '../../stores/useSpatialStore';
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Eye,
  Maximize2,
  MapPin,
  Building,
  Flame,
  Radio,
  Video,
  Zap,
  Wind,
  Cpu,
  Accessibility,
  ShieldAlert,
  Car,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowUpRight,
  Globe,
  Sparkles,
} from 'lucide-react';
import { ArcGISMapView } from './esri/ArcGISMapView';

export function CampusMapView() {
  const {
    mapEngine,
    setMapEngine,
    perspective,
    setPerspective,
    zoomLevel,
    setZoomLevel,
    resetCamera,
    activeFloorNumber,
    setActiveFloorNumber,
    activeBuildingId,
    setActiveBuildingId,
    selectedBuildingView,
    setSelectedBuildingView,
    buildings,
    rooms,
    equipment,
    safetyNodes,
    selectedEntity,
    setSelectedRoom,
    setSelectedEntity,
    highlightedEntityId,
    activeRoute,
    setActiveRoute,
    layers,
    toggleLayer,
    viewMode,
  } = useSpatialStore();


  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentBuilding = buildings.find((b) => b.id === activeBuildingId) || buildings[0];

  // Perspective CSS style
  const getTransformStyle = () => {
    if (perspective === '3D_TILT') {
      return {
        transform: `scale(${zoomLevel}) rotateX(32deg) rotateZ(-12deg)`,
        transformStyle: 'preserve-3d' as const,
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      };
    }
    if (perspective === '2.5D_ISOMETRIC') {
      return {
        transform: `scale(${zoomLevel}) rotateX(24deg) rotateZ(-8deg)`,
        transformStyle: 'preserve-3d' as const,
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      };
    }
    return {
      transform: `scale(${zoomLevel})`,
      transition: 'transform 0.3s ease',
    };
  };

  const handleSelectRoom = (room: any) => {
    setSelectedRoom(room);
  };

  const renderDigitalTwin = () => (
    <div
      className={`relative w-full ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-0 h-screen' : 'h-[620px] rounded-3xl'
      } bg-slate-950 border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col select-none`}
    >

      {/* Subtle Grid & Hologram Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #00e5ff 1px, transparent 1px), linear-gradient(to bottom, #00e5ff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* TOP FLOATING CONTROLS HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Building & Context Breadcrumb */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="bg-slate-900/90 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-slate-700/60 shadow-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">{currentBuilding.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {currentBuilding.code}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                <span>{selectedBuildingView ? `Floor Level ${activeFloorNumber}` : 'Campus Overview'}</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Digital Twin Online
                </span>
              </div>
            </div>
          </div>

          {/* 3-Engine Mode Switcher: GIS vs 2.5D Digital Twin vs Dual Split */}
          <div className="bg-slate-900/90 backdrop-blur-xl p-1 rounded-2xl border border-slate-800 flex gap-1 shadow-xl">
            <button
              onClick={() => setMapEngine('ESRI_ARCGIS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mapEngine === 'ESRI_ARCGIS'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Esri GIS</span>
            </button>
            <button
              onClick={() => setMapEngine('DIGITAL_TWIN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mapEngine === 'DIGITAL_TWIN'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>2.5D Twin</span>
            </button>
            <button
              onClick={() => setMapEngine('DUAL_SYNC')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mapEngine === 'DUAL_SYNC'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Dual View</span>
            </button>
          </div>

          {/* Toggle between Macro Campus vs Building Interior */}
          <div className="bg-slate-900/90 backdrop-blur-xl p-1 rounded-2xl border border-slate-800 flex gap-1 shadow-xl">
            <button
              onClick={() => setSelectedBuildingView(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                !selectedBuildingView
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Macro Campus
            </button>
            <button
              onClick={() => setSelectedBuildingView(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedBuildingView
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Building Interior
            </button>
          </div>
        </div>


        {/* Right: Floor Selector & Quick Perspective Pills */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Floor Level Tabs */}
          {selectedBuildingView && (
            <div className="bg-slate-900/90 backdrop-blur-xl p-1 rounded-2xl border border-slate-800 flex gap-1 shadow-xl">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setActiveFloorNumber(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeFloorNumber === lvl
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  L{lvl} {lvl === 1 ? 'Ground' : lvl === 2 ? 'AI Labs' : 'Research'}
                </button>
              ))}
            </div>
          )}

          {/* 2D / 2.5D / 3D Perspective Toggle */}
          <div className="bg-slate-900/90 backdrop-blur-xl p-1 rounded-2xl border border-slate-800 flex gap-1 shadow-xl">
            <button
              onClick={() => setPerspective('2D')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                perspective === '2D' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setPerspective('2.5D_ISOMETRIC')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                perspective === '2.5D_ISOMETRIC' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2.5D
            </button>
            <button
              onClick={() => setPerspective('3D_TILT')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                perspective === '3D_TILT' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              3D
            </button>
          </div>
        </div>
      </div>

      {/* CENTER INTERACTIVE CARTOGRAPHY VIEWPORT */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing">
        <div style={getTransformStyle()} className="origin-center w-full h-full flex items-center justify-center p-8">
          {/* ============================================================ */}
          {/* SCENARIO A: CAMPUS MACRO VIEW (Multiple Buildings, Terrain, Pathways) */}
          {/* ============================================================ */}
          {!selectedBuildingView ? (
            <svg className="w-full h-full max-w-4xl max-h-[500px] drop-shadow-2xl" viewBox="0 0 1000 600">
              <defs>
                {/* Terrain Gradients */}
                <radialGradient id="lawnGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#064e3b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#022c22" stopOpacity="0.1" />
                </radialGradient>
                <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Campus Roads and Ring Arterials */}
              <path
                d="M 50,300 C 250,280 400,320 600,300 C 800,280 950,300 950,300"
                fill="none"
                stroke="#334155"
                strokeWidth="28"
                strokeLinecap="round"
              />
              <path
                d="M 50,300 C 250,280 400,320 600,300 C 800,280 950,300 950,300"
                fill="none"
                stroke="#00e5ff"
                strokeWidth="1.5"
                strokeDasharray="12 8"
                className="opacity-40"
              />

              {/* Crossway Campus Avenue */}
              <line x1="450" y1="50" x2="450" y2="550" stroke="#334155" strokeWidth="20" strokeLinecap="round" />
              <line x1="450" y1="50" x2="450" y2="550" stroke="#00e5ff" strokeWidth="1" strokeDasharray="10 6" className="opacity-30" />

              {/* Central Green Lawn */}
              <ellipse cx="450" cy="300" rx="160" ry="90" fill="url(#lawnGrad)" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
              <text x="400" y="305" fill="#34d399" fontSize="12" fontWeight="600" opacity="0.8">
                Central Technology Lawn
              </text>

              {/* BUILDINGS ON CAMPUS */}
              {buildings.map((b) => {
                const isSelected = activeBuildingId === b.id;
                const coords = b.coordinates || { x: 100, y: 100, width: 180, height: 120 };

                return (
                  <g
                    key={b.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      setActiveBuildingId(b.id);
                      setSelectedBuildingView(true);
                      setSelectedEntity({ type: 'BUILDING', data: b });
                    }}
                  >
                    {/* Building 3D Shadow Volume */}
                    <rect
                      x={coords.x + 12}
                      y={coords.y + 16}
                      width={coords.width}
                      height={coords.height}
                      rx="16"
                      className="fill-cyan-950/20 filter blur-md"
                    />

                    {/* Building Floor Extrusion */}
                    <rect
                      x={coords.x}
                      y={coords.y}
                      width={coords.width}
                      height={coords.height}
                      rx="16"
                      className={`transition-all duration-300 ${
                        isSelected
                          ? 'fill-cyan-950/80 stroke-cyan-400 stroke-3 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                          : 'fill-slate-900/90 stroke-slate-700/80 stroke-1.5 group-hover:stroke-cyan-500/60 group-hover:fill-slate-850'
                      }`}
                    />

                    {/* Building Header Badge */}
                    <rect
                      x={coords.x + 16}
                      y={coords.y + 16}
                      width={coords.width - 32}
                      height={32}
                      rx="8"
                      className="fill-slate-800/60 stroke-slate-700/40 stroke-1"
                    />
                    <text x={coords.x + 24} y={coords.y + 36} fill="#f8fafc" fontSize="12" fontWeight="700">
                      {b.code}
                    </text>
                    <text x={coords.x + 80} y={coords.y + 36} fill="#94a3b8" fontSize="10">
                      {b.totalFloors} Floors • {b.sqMeters} m²
                    </text>

                    {/* Building Name */}
                    <text x={coords.x + 20} y={coords.y + 70} fill="#38bdf8" fontSize="13" fontWeight="600">
                      {b.name}
                    </text>

                    {/* Live Occupancy Gauge & Telemetry Pill */}
                    <g transform={`translate(${coords.x + 20}, ${coords.y + 90})`}>
                      <rect width="130" height="22" rx="6" className="fill-slate-950/80 stroke-slate-800 stroke-1" />
                      <circle
                        cx="12"
                        cy="11"
                        r="4"
                        fill={b.currentOccupancyPercent > 75 ? '#f43f5e' : b.currentOccupancyPercent > 50 ? '#fbbf24' : '#10b981'}
                      />
                      <text x="24" y="15" fill="#cbd5e1" fontSize="10" fontWeight="600">
                        {b.currentOccupancyPercent}% Occupied
                      </text>
                    </g>

                    {/* Energy Draw Badge */}
                    <g transform={`translate(${coords.x + coords.width - 70}, ${coords.y + 90})`}>
                      <rect width="55" height="22" rx="6" className="fill-cyan-950/60 stroke-cyan-500/30 stroke-1" />
                      <text x="6" y="15" fill="#38bdf8" fontSize="10" fontWeight="600">
                        ⚡ {b.energyConsumptionKwh}k
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* People Density GIS Layer on Campus */}
              {layers.peopleDensity && (
                <g className="animate-fade-in pointer-events-none">
                  {/* High Density Zone: Student Commons */}
                  <circle cx="280" cy="380" r="70" fill="#f43f5e" fillOpacity="0.25" className="animate-pulse" />
                  <circle cx="280" cy="380" r="40" fill="#f43f5e" fillOpacity="0.4" />
                  <text x="240" y="385" fill="#fecdd3" fontSize="11" fontWeight="700">
                    High Crowd: 82%
                  </text>

                  {/* Moderate Density Zone: Block B */}
                  <circle cx="520" cy="220" r="60" fill="#fbbf24" fillOpacity="0.25" />
                  <circle cx="520" cy="220" r="30" fill="#fbbf24" fillOpacity="0.35" />

                  {/* Low Density Zone: Central Library */}
                  <circle cx="180" cy="180" r="50" fill="#10b981" fillOpacity="0.2" />
                </g>
              )}

              {/* Parking GIS Layer */}
              {layers.parking && (
                <g transform="translate(740, 420)">
                  <rect width="180" height="90" rx="12" className="fill-slate-900/80 stroke-indigo-500/40 stroke-1" />
                  <text x="16" y="26" fill="#818cf8" fontSize="12" fontWeight="700">
                    P1 • North Faculty Parking
                  </text>
                  <text x="16" y="48" fill="#94a3b8" fontSize="10">
                    Capacity: 120 / 48 Available
                  </text>
                  <text x="16" y="70" fill="#34d399" fontSize="10" fontWeight="600">
                    ⚡ 8 EV Fast Chargers Online
                  </text>
                </g>
              )}
            </svg>
          ) : (
            /* ============================================================ */
            /* SCENARIO B: BUILDING INTERIOR FLOORPLAN (Floor 1 / Floor 2) */
            /* ============================================================ */
            <svg className="w-full h-full max-w-4xl max-h-[500px] drop-shadow-2xl" viewBox="0 0 900 520">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Floor Base Slab (Iso Isometric Perspective 2.5D Depth) */}
              <polygon points="120,80 780,80 840,440 60,440" className="fill-slate-900/90 stroke-cyan-500/40 stroke-2" />

              {/* Floor Depth Thickness Wall */}
              <polygon points="60,440 840,440 840,455 60,455" className="fill-slate-950 stroke-cyan-500/20 stroke-1" />

              {/* Corridors Grid */}
              <polygon points="400,80 480,80 480,440 400,440" className="fill-cyan-500/5 stroke-cyan-500/20 stroke-1 stroke-dasharray-4" />
              <text x="415" y="105" fill="#00e5ff" fontSize="10" opacity="0.6" letterSpacing="2">
                CORRIDOR A
              </text>

              {/* Cross Corridor */}
              <polygon points="120,240 780,240 780,280 120,280" className="fill-cyan-500/5 stroke-cyan-500/20 stroke-1 stroke-dasharray-4" />

              {/* ==================== FLOOR 2 LAYOUT ==================== */}
              {activeFloorNumber === 2 && (
                <>
                  {/* ROOM 204: AI & ROBOTICS LAB */}
                  {(() => {
                    const r204 = rooms.find((r) => r.id === 'r-204');
                    const isSelected = selectedEntity?.type === 'ROOM' && selectedEntity.data.id === 'r-204';
                    const isHighlighted = highlightedEntityId === 'r-204';

                    return (
                      <g className="cursor-pointer group" onClick={() => r204 && handleSelectRoom(r204)}>
                        {/* 3D Room Box Wall */}
                        <polygon
                          points="140,110 380,110 380,240 120,240"
                          className={`transition-all duration-300 ${
                            isSelected || isHighlighted
                              ? 'fill-cyan-500/30 stroke-cyan-400 stroke-3 filter drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                              : 'fill-slate-800/80 stroke-cyan-500/40 stroke-1.5 group-hover:fill-cyan-500/15 group-hover:stroke-cyan-400'
                          }`}
                        />
                        <text x="160" y="150" fill="#38bdf8" fontSize="15" fontWeight="700">
                          AI & Robotics Lab 204
                        </text>
                        <text x="160" y="172" fill="#94a3b8" fontSize="11">
                          Cap: 40 • UR5e Robot Arm • 18 RTX Workstations
                        </text>

                        {/* Room Telemetry Badges */}
                        <g transform="translate(160, 190)">
                          <rect width="65" height="20" rx="5" className="fill-emerald-500/20 stroke-emerald-500/40 stroke-1" />
                          <text x="8" y="14" fill="#34d399" fontSize="10" fontWeight="600">
                            22.8°C • AQI 42
                          </text>

                          <rect x="75" width="80" height="20" rx="5" className="fill-cyan-500/20 stroke-cyan-500/40 stroke-1" />
                          <text x="83" y="14" fill="#38bdf8" fontSize="10" fontWeight="600">
                            27 / 40 Present
                          </text>
                        </g>

                        {/* Equipment Markers inside Room 204 */}
                        {layers.equipment && (
                          <g transform="translate(340, 130)">
                            <circle cx="10" cy="10" r="12" className="fill-indigo-900 stroke-indigo-400 stroke-1.5 animate-pulse" />
                            <text x="6" y="14" fill="#c7d2fe" fontSize="10" fontWeight="bold">
                              🤖
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })()}

                  {/* ROOM 201: SEMINAR HALL */}
                  {(() => {
                    const r201 = rooms.find((r) => r.id === 'r-201');
                    const isSelected = selectedEntity?.type === 'ROOM' && selectedEntity.data.id === 'r-201';
                    const isHighlighted = highlightedEntityId === 'r-201';

                    return (
                      <g className="cursor-pointer group" onClick={() => r201 && handleSelectRoom(r201)}>
                        <polygon
                          points="500,110 740,110 760,240 500,240"
                          className={`transition-all duration-300 ${
                            isSelected || isHighlighted
                              ? 'fill-cyan-500/30 stroke-cyan-400 stroke-3'
                              : 'fill-slate-800/60 stroke-slate-700 stroke-1.5 group-hover:fill-slate-800 group-hover:stroke-cyan-500/40'
                          }`}
                        />
                        <text x="530" y="150" fill="#f1f5f9" fontSize="15" fontWeight="600">
                          Seminar Hall 201
                        </text>
                        <text x="530" y="172" fill="#64748b" fontSize="11">
                          Capacity: 90 seats • Tiered Auditorium
                        </text>

                        {/* Empty Status Badge */}
                        <g transform="translate(530, 190)">
                          <rect width="90" height="20" rx="5" className="fill-emerald-500/10 stroke-emerald-500/30 stroke-1" />
                          <text x="8" y="14" fill="#34d399" fontSize="10" fontWeight="600">
                            ✓ Available (0 / 90)
                          </text>
                        </g>
                      </g>
                    );
                  })()}

                  {/* ROOM 202: FACULTY RESEARCH OFFICE */}
                  {(() => {
                    const r202 = rooms.find((r) => r.id === 'r-202');
                    const isSelected = selectedEntity?.type === 'ROOM' && selectedEntity.data.id === 'r-202';

                    return (
                      <g className="cursor-pointer group" onClick={() => r202 && handleSelectRoom(r202)}>
                        <polygon
                          points="500,280 760,280 780,410 500,410"
                          className={`transition-all ${
                            isSelected
                              ? 'fill-cyan-500/30 stroke-cyan-400 stroke-3'
                              : 'fill-slate-800/40 stroke-slate-700 stroke-1 group-hover:fill-slate-800/80'
                          }`}
                        />
                        <text x="530" y="325" fill="#94a3b8" fontSize="13" fontWeight="500">
                          Faculty Research Office 202
                        </text>
                        <text x="530" y="348" fill="#64748b" fontSize="11">
                          Dr. Evelyn Reed • Prof. Marcus Chen
                        </text>
                      </g>
                    );
                  })()}
                </>
              )}

              {/* ==================== FLOOR 1 LAYOUT ==================== */}
              {activeFloorNumber === 1 && (
                <>
                  {/* ROOM 101: LECTURE HALL */}
                  {(() => {
                    const r101 = rooms.find((r) => r.id === 'r-101');
                    const isSelected = selectedEntity?.type === 'ROOM' && selectedEntity.data.id === 'r-101';

                    return (
                      <g className="cursor-pointer group" onClick={() => r101 && handleSelectRoom(r101)}>
                        <polygon
                          points="140,110 380,110 380,240 120,240"
                          className={`transition-all ${
                            isSelected
                              ? 'fill-cyan-500/30 stroke-cyan-400 stroke-3'
                              : 'fill-slate-800/70 stroke-cyan-500/30 stroke-1.5 group-hover:fill-cyan-500/15'
                          }`}
                        />
                        <text x="160" y="150" fill="#38bdf8" fontSize="15" fontWeight="700">
                          Lecture Hall 101
                        </text>
                        <text x="160" y="172" fill="#94a3b8" fontSize="11">
                          Cap: 60 • Auditorium Projector P-101
                        </text>
                        <g transform="translate(160, 190)">
                          <rect width="90" height="20" rx="5" className="fill-amber-500/20 stroke-amber-500/40 stroke-1" />
                          <text x="8" y="14" fill="#fbbf24" fontSize="10" fontWeight="600">
                            54 / 60 Occupied
                          </text>
                        </g>
                      </g>
                    );
                  })()}

                  {/* ROOM 102: COMPUTING SYSTEMS LAB */}
                  {(() => {
                    const r102 = rooms.find((r) => r.id === 'r-102');
                    const isSelected = selectedEntity?.type === 'ROOM' && selectedEntity.data.id === 'r-102';

                    return (
                      <g className="cursor-pointer group" onClick={() => r102 && handleSelectRoom(r102)}>
                        <polygon
                          points="500,110 740,110 760,240 500,240"
                          className={`transition-all ${
                            isSelected
                              ? 'fill-cyan-500/30 stroke-cyan-400 stroke-3'
                              : 'fill-slate-800/60 stroke-slate-700 stroke-1.5 group-hover:fill-slate-800'
                          }`}
                        />
                        <text x="530" y="150" fill="#f1f5f9" fontSize="15" fontWeight="600">
                          Computing Systems Lab 102
                        </text>
                        <text x="530" y="172" fill="#64748b" fontSize="11">
                          42 High Performance Linux Nodes
                        </text>
                      </g>
                    );
                  })()}
                </>
              )}

              {/* VERTICAL CORE (Staircase A) */}
              <g className="cursor-default">
                <polygon points="120,280 260,280 230,410 90,410" className="fill-indigo-950/60 stroke-indigo-500/50 stroke-1.5" />
                <text x="130" y="330" fill="#a5b4fc" fontSize="12" fontWeight="700">
                  Vertical Core
                </text>
                <text x="120" y="360" fill="#6366f1" fontSize="10">
                  Staircase A (Vertical Circulation)
                </text>
                <circle cx="210" cy="326" r="4" fill="#34d399" className="animate-ping" />
              </g>

              {/* GIS LAYER: People Density Heatmap Overlay */}
              {layers.peopleDensity && (
                <g className="animate-fade-in pointer-events-none">
                  {/* Dense Zone inside Room 204 or 101 */}
                  <circle cx="250" cy="180" r="60" fill="#fbbf24" fillOpacity="0.25" className="animate-pulse" />
                  <circle cx="250" cy="180" r="35" fill="#f43f5e" fillOpacity="0.35" />
                  <text x="210" y="185" fill="#fff" fontSize="10" fontWeight="bold">
                    Density: 68%
                  </text>
                </g>
              )}

              {/* GIS LAYER: WiFi Coverage Waves */}
              {layers.wifiCoverage && (
                <g className="animate-fade-in pointer-events-none" opacity="0.4">
                  <circle cx="440" cy="260" r="120" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="8 6" />
                  <circle cx="440" cy="260" r="70" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="410" y="265" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    WiFi 6 AP-04 (1.2 Gbps)
                  </text>
                </g>
              )}

              {/* GIS LAYER: CCTV Coverage Cones */}
              {layers.cctvCoverage && (
                <g className="animate-fade-in pointer-events-none" opacity="0.35">
                  <polygon points="400,90 320,180 480,180" fill="#00e5ff" />
                  <polygon points="440,300 360,420 520,420" fill="#00e5ff" />
                </g>
              )}

              {/* GIS LAYER: Fire Safety & Emergency Exits */}
              {(layers.fireSafety || viewMode === 'SAFETY') && (
                <g className="animate-fade-in">
                  {safetyNodes
                    .filter((s) => s.floorNumber === activeFloorNumber)
                    .map((node) => (
                      <g
                        key={node.id}
                        transform={`translate(${node.coords.x}, ${node.coords.y})`}
                        className="cursor-pointer"
                        onClick={() => setSelectedEntity({ type: 'SAFETY', data: node })}
                      >
                        <circle cx="0" cy="0" r="14" className="fill-rose-950 stroke-rose-500 stroke-2 animate-pulse" />
                        <text x="-6" y="4" fill="#fda4af" fontSize="11" fontWeight="bold">
                          {node.type === 'EMERGENCY_EXIT' ? '🚪' : node.type === 'FIRE_EXTINGUISHER' ? '🧯' : '⚡'}
                        </text>
                      </g>
                    ))}
                </g>
              )}

              {/* ACTIVE ROUTE ANIMATION */}
              {activeRoute && (
                <g className="animate-fade-in pointer-events-none">
                  {/* Glowing Animated Path Trace */}
                  <polyline
                    points="250,180 440,180 440,330 180,330"
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="5"
                    strokeDasharray="10 6"
                    className="animate-pulse"
                    filter="url(#glow)"
                  />
                  {/* Origin Pulse Marker */}
                  <circle cx="250" cy="180" r="10" fill="#00e5ff" fillOpacity="0.4" className="animate-ping" />
                  <circle cx="250" cy="180" r="6" fill="#00e5ff" stroke="#ffffff" strokeWidth="2" />
                  {/* Destination Pulse Marker */}
                  <circle cx="180" cy="330" r="10" fill="#38bdf8" fillOpacity="0.4" className="animate-ping" />
                  <circle cx="180" cy="330" r="6" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                </g>
              )}
            </svg>
          )}
        </div>

        {/* ACTIVE ROUTE HUD BANNER */}
        {activeRoute && (
          <div className="absolute top-16 left-4 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 z-20 max-w-md animate-in fade-in">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                {activeRoute.originName} → {activeRoute.destinationName}
              </div>
              <div className="text-[11px] text-cyan-300 flex items-center gap-2 mt-0.5">
                <span className="font-semibold">{activeRoute.totalDistanceMeters}m</span>
                <span>•</span>
                <span>~{activeRoute.estimatedMinutes} min walking</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{activeRoute.accessible ? '✓ Accessible' : 'Stairs'}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveRoute(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Clear Route"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* FLOATING MAP TOOLBAR (Right Dock) */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Zoom Controls */}
        <div className="bg-slate-900/95 backdrop-blur-xl p-1 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-1">
          <button
            onClick={() => setZoomLevel(zoomLevel + 0.15)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(zoomLevel - 0.15)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetCamera}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset Camera"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* GIS Layers Toggle Button */}
        <button
          onClick={() => setIsLayersOpen(!isLayersOpen)}
          className={`p-3 rounded-2xl border shadow-2xl transition-all flex items-center justify-center ${
            isLayersOpen
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
              : 'bg-slate-900/95 backdrop-blur-xl text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
          title="GIS Spatial Layers"
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-3 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-800 text-slate-300 hover:text-white shadow-2xl transition-colors"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* GIS LAYERS SLIDE-OUT DRAWER */}
      {isLayersOpen && (
        <div className="absolute bottom-6 right-20 z-30 w-64 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl p-4 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> GIS Spatial Layers
            </span>
            <button onClick={() => setIsLayersOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
            {[
              { key: 'buildings', label: 'Buildings 3D', icon: Building, color: 'text-cyan-400' },
              { key: 'rooms', label: 'Room Enclosures', icon: Eye, color: 'text-indigo-400' },
              { key: 'navigation', label: 'Route Corridors', icon: Navigation, color: 'text-blue-400' },
              { key: 'peopleDensity', label: 'People Density Heatmap', icon: Flame, color: 'text-rose-400' },
              { key: 'wifiCoverage', label: 'WiFi 6 Telemetry', icon: Radio, color: 'text-sky-400' },
              { key: 'cctvCoverage', label: 'CCTV Vision Cones', icon: Video, color: 'text-teal-400' },
              { key: 'energyConsumption', label: 'Energy Draw (kWh)', icon: Zap, color: 'text-amber-400' },
              { key: 'airQuality', label: 'Air Quality / HVAC', icon: Wind, color: 'text-emerald-400' },
              { key: 'equipment', label: 'Equipment & Robotics', icon: Cpu, color: 'text-purple-400' },
              { key: 'accessibility', label: 'Wheelchair / ADA', icon: Accessibility, color: 'text-pink-400' },
              { key: 'fireSafety', label: 'Fire & Emergency Safety', icon: ShieldAlert, color: 'text-red-400' },
              { key: 'parking', label: 'Campus Parking & EV', icon: Car, color: 'text-slate-400' },
            ].map((layerItem) => {
              const Icon = layerItem.icon;
              const isActive = (layers as any)[layerItem.key];

              return (
                <button
                  key={layerItem.key}
                  onClick={() => toggleLayer(layerItem.key as any)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                    isActive ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${layerItem.color}`} />
                    {layerItem.label}
                  </span>
                  <span
                    className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[10px] ${
                      isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'border border-slate-700'
                    }`}
                  >
                    {isActive ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (mapEngine === 'ESRI_ARCGIS') {
    return <ArcGISMapView />;
  }

  if (mapEngine === 'DUAL_SYNC') {
    return (
      <div className="w-full flex flex-col gap-4">
        {/* Top Dual View Status Header */}
        <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">
              Synchronized Spatial Intelligence
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              • Esri ArcGIS (Macro Geographic GIS) ↔ 2.5D Digital Twin (Micro Interior)
            </span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMapEngine('ESRI_ARCGIS')}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Esri Only
            </button>
            <button
              onClick={() => setMapEngine('DIGITAL_TWIN')}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Twin Only
            </button>
            <button
              onClick={() => setMapEngine('DUAL_SYNC')}
              className="px-2.5 py-1 text-[11px] font-bold text-cyan-300 bg-cyan-500/20 rounded-lg border border-cyan-500/30"
            >
              Dual View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
          <ArcGISMapView />
          {renderDigitalTwin()}
        </div>
      </div>
    );
  }

  return renderDigitalTwin();
}

