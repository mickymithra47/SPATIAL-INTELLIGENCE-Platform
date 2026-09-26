'use client';

import React, { useState } from 'react';
import { MultiFloor2DView } from './MultiFloor2DView';
import { MultiFloor3DView } from './MultiFloor3DView';
import {
  FloorLevel,
  CampusRoomEntity,
  MultiFloorWaypoint,
  calculateMultiFloorRoute,
} from '../../services/campusMultiFloorData';
import {
  Navigation,
  CheckCircle2,
  X,
  Maximize2,
  Minimize2,
  Clock,
  Compass,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
} from 'lucide-react';

interface CampusDigitalTwinProps {
  perspective: '2D' | '2.5D_ISOMETRIC' | '3D_TILT';
  setPerspective: (p: '2D' | '2.5D_ISOMETRIC' | '3D_TILT') => void;
  activeFloor: FloorLevel;
  setActiveFloor: (floor: FloorLevel) => void;
  selectedEntity: CampusRoomEntity | null;
  setSelectedEntity: (entity: CampusRoomEntity | null) => void;
  activeRoute: {
    origin: string;
    destination: string;
    distanceMeters: number;
    estimatedSeconds: number;
    waypoints: MultiFloorWaypoint[];
    floorTransitions: { fromFloor: FloorLevel; toFloor: FloorLevel; via: 'STAIRS' | 'ELEVATOR' }[];
    steps: { instruction: string; distance: string; floor: FloorLevel }[];
  } | null;
  setActiveRoute: (route: any | null) => void;
  onAskAIAboutRoom: (entity: CampusRoomEntity) => void;
  blockedWaypoints?: string[];
  viewAllFloorsStacked?: boolean;
}

export function CampusDigitalTwin({
  perspective,
  setPerspective,
  activeFloor,
  setActiveFloor,
  selectedEntity,
  setSelectedEntity,
  activeRoute,
  setActiveRoute,
  onAskAIAboutRoom,
  blockedWaypoints = [],
  viewAllFloorsStacked = false,
}: CampusDigitalTwinProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRouteCardCollapsed, setIsRouteCardCollapsed] = useState(false);
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);

  const handleStartRouteToEntity = (entity: CampusRoomEntity, originEntity?: CampusRoomEntity | null) => {
    const originId = originEntity ? originEntity.id : (activeFloor === 'GROUND' ? 'wp-gf-entrance' : `wp-${activeFloor.toLowerCase()}-hub`);
    const targetWpId = entity.id;
    const route = calculateMultiFloorRoute(originId, targetWpId, blockedWaypoints);

    if (route.isValid && route.path.length > 0) {
      const startFloor = originEntity ? originEntity.floor : route.path[0].floor;
      setActiveFloor(startFloor);

      setActiveRoute({
        origin: originEntity ? originEntity.name : (activeFloor === 'GROUND' ? 'Main Entrance' : `${activeFloor} Floor Atrium`),
        destination: entity.name,
        distanceMeters: route.distanceMeters,
        estimatedSeconds: route.estimatedSeconds,
        waypoints: route.path,
        floorTransitions: route.floorTransitions,
        steps: route.steps,
      });
    }
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Top Left Embedded Banner (Very compact) */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-800 flex items-center gap-1.5 shadow-md">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold text-white tracking-wide">
            {activeFloor} FLOOR
          </span>
          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1 py-0.5 rounded border border-cyan-500/20">
            {perspective === '3D_TILT' ? '3D' : perspective === '2.5D_ISOMETRIC' ? '2.5D' : '2D'}
          </span>
        </div>
      </div>

      {/* Top Right Fullscreen */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 pointer-events-auto">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-white transition-colors shadow-md"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Digital Twin Canvas Stage */}
      <div className="relative flex-1 w-full h-full">
        {perspective === '3D_TILT' ? (
          <MultiFloor3DView
            activeFloor={activeFloor}
            selectedEntity={selectedEntity}
            onSelectEntity={setSelectedEntity}
            activeRouteWaypoints={activeRoute?.waypoints || []}
            blockedWaypoints={blockedWaypoints}
            viewAllFloorsStacked={viewAllFloorsStacked}
          />
        ) : (
          <MultiFloor2DView
            perspective={perspective}
            activeFloor={activeFloor}
            selectedEntity={selectedEntity}
            onSelectEntity={setSelectedEntity}
            activeRouteWaypoints={activeRoute?.waypoints || []}
            blockedWaypoints={blockedWaypoints}
            showSpatialNodes={true}
          />
        )}
      </div>

      {/* ======================================================== */}
      {/* COMPACT CONTEXTUAL FACILITY CARD (Max 240px, Section 5) */}
      {/* ======================================================== */}
      {selectedEntity && (
        <div className="absolute bottom-4 left-4 z-30 w-[230px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl p-3 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150 text-xs">
          <div className="flex items-start justify-between pb-1.5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono font-bold text-cyan-400">{selectedEntity.code}</span>
                <span className="text-[9px] px-1 py-0.2 rounded font-bold uppercase bg-emerald-500/15 text-emerald-400">
                  {selectedEntity.operationalStatus}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate max-w-[170px] mt-0.5">
                {selectedEntity.name}
              </h4>
            </div>
            <button
              onClick={() => {
                setSelectedEntity(null);
                setShowDetailedInfo(false);
              }}
              className="p-0.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-300 py-1.5">
            <span>Area: <strong>{selectedEntity.areaM2} m²</strong></span>
            <span>Cap: <strong>{selectedEntity.capacity}</strong></span>
          </div>

          {/* Simulated Lab Telemetry Pill if available */}
          {selectedEntity.telemetry && (
            <div className="mb-2 p-1.5 rounded-lg bg-slate-950/70 border border-cyan-500/20 text-[10px]">
              <div className="flex items-center justify-between text-cyan-300">
                <span>● {selectedEntity.telemetry.systemsOnline}/{selectedEntity.telemetry.totalSystems} Online</span>
                <span>{selectedEntity.telemetry.temperatureC}°C</span>
              </div>
            </div>
          )}

          {showDetailedInfo && (
            <div className="pb-2 text-[10px] text-slate-400 border-t border-slate-800 pt-1">
              <p className="leading-snug">{selectedEntity.description}</p>
            </div>
          )}

          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800">
            <button
              onClick={() => handleStartRouteToEntity(selectedEntity)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-[11px] shadow-sm transition-all active:scale-95"
            >
              <Navigation className="w-3 h-3 fill-current" />
              <span>Navigate</span>
            </button>
            <button
              onClick={() => onAskAIAboutRoom(selectedEntity)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700"
              title="Ask AI Copilot"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* COMPACT INDOOR ROUTE CARD (Max 240px, Section 5)         */}
      {/* ======================================================== */}
      {activeRoute && (
        <div className="absolute top-14 left-4 z-30 w-[240px] bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-2.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <div className="flex items-center gap-1.5 min-w-0">
              <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="min-w-0 truncate">
                <span className="text-[10px] font-bold text-white block truncate">
                  To: {activeRoute.destination}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  From: {activeRoute.origin}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <button
                onClick={() => setIsRouteCardCollapsed(!isRouteCardCollapsed)}
                className="text-slate-400 hover:text-white"
                title={isRouteCardCollapsed ? 'Expand' : 'Collapse'}
              >
                {isRouteCardCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setActiveRoute(null)}
                className="text-slate-400 hover:text-white"
                title="Clear Route"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-300 py-1">
            <span>Dist: <strong className="text-white">{activeRoute.distanceMeters}m</strong></span>
            <span>Time: <strong className="text-emerald-400">{activeRoute.estimatedSeconds}s</strong></span>
          </div>

          {/* Multi-Floor Quick Floor Switcher */}
          {activeRoute.floorTransitions && activeRoute.floorTransitions.length > 0 && (
            <div className="flex items-center gap-1 py-1 border-t border-slate-800/80">
              <span className="text-[9px] text-cyan-400 font-semibold mr-0.5">Floor:</span>
              {(['GROUND', 'FIRST', 'SECOND', 'TERRACE'] as FloorLevel[])
                .filter((fl) => activeRoute.waypoints.some((w) => w.floor === fl))
                .map((fl) => (
                  <button
                    key={fl}
                    onClick={() => setActiveFloor(fl)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                      activeFloor === fl
                        ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {fl === 'GROUND' ? 'GF' : fl === 'FIRST' ? '1F' : fl === 'SECOND' ? '2F' : '3F'}
                  </button>
                ))}
            </div>
          )}

          {!isRouteCardCollapsed && activeRoute.steps && (
            <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 space-y-1 max-h-28 overflow-y-auto pr-0.5">
              {activeRoute.steps.map((st, i) => (
                <div key={i} className="flex items-start gap-1 leading-tight">
                  <span className="text-cyan-400 font-bold shrink-0">{i + 1}.</span>
                  <span className="text-slate-300">{st.instruction}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
