'use client';

import React, { useState, useRef } from 'react';
import {
  FloorLevel,
  CampusRoomEntity,
  MultiFloorWaypoint,
  getEntitiesForFloor,
} from '../../services/campusMultiFloorData';
import { OUTER_PENTAGON_FOOTPRINT } from '../../services/groundFloorData';
import { Compass, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface MultiFloor2DViewProps {
  perspective: '2D' | '2.5D_ISOMETRIC';
  activeFloor: FloorLevel;
  selectedEntity: CampusRoomEntity | null;
  onSelectEntity: (entity: CampusRoomEntity) => void;
  activeRouteWaypoints?: MultiFloorWaypoint[];
  blockedWaypoints?: string[];
  showSpatialNodes?: boolean;
}

export function MultiFloor2DView({
  perspective,
  activeFloor,
  selectedEntity,
  onSelectEntity,
  activeRouteWaypoints = [],
  blockedWaypoints = [],
  showSpatialNodes = true,
}: MultiFloor2DViewProps) {
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hoveredEntity, setHoveredEntity] = useState<CampusRoomEntity | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isRotating = useRef(false);
  const hasDragged = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startRotation = useRef(0);
  const startPan = useRef({ x: 0, y: 0 });

  const centerX = 500;
  const centerY = 480;

  const floorEntities = getEntitiesForFloor(activeFloor);
  const floorRouteWaypoints = activeRouteWaypoints.filter((wp) => wp.floor === activeFloor);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
    hasDragged.current = false;
    startPan.current = { ...panOffset };
    startRotation.current = rotationDegrees;

    if (e.button === 2 || e.shiftKey || perspective === '2.5D_ISOMETRIC') {
      isRotating.current = true;
    } else {
      isDragging.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    if (Math.hypot(dx, dy) > 4) {
      hasDragged.current = true;
    }

    if (isRotating.current) {
      const newDeg = (startRotation.current + dx * 0.65) % 360;
      setRotationDegrees(newDeg < 0 ? newDeg + 360 : newDeg);
    } else if (isDragging.current) {
      setPanOffset({
        x: startPan.current.x + dx,
        y: startPan.current.y + dy,
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isRotating.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.0012;
    setZoomLevel((prev) => Math.max(0.65, Math.min(2.5, prev + zoomDelta)));
  };

  const resetOrientation = () => {
    setRotationDegrees(0);
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1);
  };

  const getPolygonPath = (pts: { x: number; y: number }[]) => {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full bg-[#030712] cursor-grab active:cursor-grabbing select-none overflow-hidden"
    >
      {/* Subtle blueprint grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #38bdf8 1px, transparent 1px),
            linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating 2D / 2.5D Transform Container */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel}) ${
            perspective === '2.5D_ISOMETRIC'
              ? 'perspective(1000px) rotateX(28deg) rotateZ(' + rotationDegrees + 'deg)'
              : ''
          }`,
          transformStyle: 'preserve-3d',
        }}
      >
        <svg
          viewBox="90 90 820 780"
          className="w-full h-full max-w-[880px] max-h-[780px] transition-transform duration-75"
          style={{
            transform: perspective === '2D' ? `rotate(${rotationDegrees}deg)` : 'none',
            transformOrigin: `${centerX}px ${centerY}px`,
          }}
        >
          <defs>
            <filter id="multiRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="multiSelectionGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Perimeter Footprint - Mandatory Architectural Outline on ALL Floors */}
          <g pointerEvents="none">
            <path
              d={getPolygonPath(OUTER_PENTAGON_FOOTPRINT)}
              fill="#090d1a"
              stroke="#1b2538"
              strokeWidth="7"
              className="drop-shadow-2xl"
            />
            <path
              d={getPolygonPath(OUTER_PENTAGON_FOOTPRINT)}
              fill="none"
              stroke="#2a3a54"
              strokeWidth="2.5"
              opacity="0.9"
            />
            {/* Outer Window Slits */}
            <g stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" opacity="0.9">
              <line x1="300" y1="160" x2="340" y2="160" />
              <line x1="380" y1="160" x2="420" y2="160" />
              <line x1="580" y1="160" x2="620" y2="160" />
              <line x1="660" y1="160" x2="700" y2="160" />
              <line x1="790" y1="260" x2="800" y2="300" />
              <line x1="805" y1="360" x2="810" y2="400" />
              <line x1="775" y1="620" x2="760" y2="660" />
              <line x1="320" y1="800" x2="360" y2="810" />
              <line x1="450" y1="830" x2="480" y2="830" />
              <line x1="520" y1="830" x2="550" y2="830" />
              <line x1="640" y1="805" x2="680" y2="795" />
              <line x1="190" y1="350" x2="210" y2="250" />
              <line x1="175" y1="450" x2="168" y2="490" />
              <line x1="180" y1="600" x2="210" y2="670" />
            </g>
          </g>

          {/* Rooms on this floor */}
          {floorEntities.map((entity) => {
            const isSelected = selectedEntity?.id === entity.id;
            const isHovered = hoveredEntity?.id === entity.id;
            const pathData = getPolygonPath(entity.polygon);

            return (
              <g
                key={entity.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasDragged.current) {
                    onSelectEntity(entity);
                  }
                }}
                onMouseEnter={() => setHoveredEntity(entity)}
                onMouseLeave={() => setHoveredEntity(null)}
                className="cursor-pointer group"
              >
                {/* 2.5D Depth Extrusion */}
                {perspective === '2.5D_ISOMETRIC' && (
                  <path
                    d={pathData}
                    fill="#020617"
                    stroke="#0f172a"
                    strokeWidth="4"
                    transform="translate(0, 10)"
                    opacity="0.9"
                  />
                )}

                {/* Main Room Base Polygon */}
                <path
                  d={pathData}
                  fill={
                    isSelected
                      ? 'rgba(6, 182, 212, 0.35)'
                      : isHovered
                      ? 'rgba(56, 189, 248, 0.25)'
                      : entity.color.fill
                  }
                  stroke={isSelected ? '#06b6d4' : isHovered ? '#38bdf8' : entity.color.stroke}
                  strokeWidth={isSelected ? '4' : isHovered ? '3' : '2.5'}
                  filter={isSelected ? 'url(#multiSelectionGlow)' : undefined}
                  className="transition-all duration-200"
                />

                {/* Specific ESEC Ground Floor Architectural Features */}
                {entity.id === 'GF-ENT-01' && (
                  <g pointerEvents="none">
                    <path d="M 488 740 L 500 715 L 512 740 M 500 760 L 500 715" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                    <text x="500" y="780" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="900" letterSpacing="1">
                      IN
                    </text>
                  </g>
                )}

                {(entity.id === 'GF-STR-01' || entity.type === 'STAIRS') && (
                  <g pointerEvents="none" opacity="0.85">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <line
                        key={idx}
                        x1={605 + idx * 24}
                        y1={500}
                        x2={605 + idx * 24}
                        y2={535}
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                    ))}
                    <text x="755" y="522" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
                      UP ↑
                    </text>
                  </g>
                )}

                {entity.type === 'LIFT' && (
                  <g pointerEvents="none">
                    <rect
                      x={Math.min(...entity.polygon.map(p => p.x)) + 4}
                      y={Math.min(...entity.polygon.map(p => p.y)) + 4}
                      width={Math.max(...entity.polygon.map(p => p.x)) - Math.min(...entity.polygon.map(p => p.x)) - 8}
                      height={Math.max(...entity.polygon.map(p => p.y)) - Math.min(...entity.polygon.map(p => p.y)) - 8}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={(Math.min(...entity.polygon.map(p => p.x)) + Math.max(...entity.polygon.map(p => p.x))) / 2}
                      y={(Math.min(...entity.polygon.map(p => p.y)) + Math.max(...entity.polygon.map(p => p.y))) / 2 + 3}
                      textAnchor="middle"
                      fill="#06b6d4"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      LFT
                    </text>
                  </g>
                )}

                {/* Counter-Rotated Text Label */}
                <g
                  transform={`translate(${entity.position.labelX}, ${entity.position.labelY})`}
                  pointerEvents="none"
                >
                  <g
                    transform={perspective === '2D' ? `rotate(${-rotationDegrees})` : undefined}
                    className="transition-transform duration-75"
                  >
                    <text
                      textAnchor="middle"
                      y="-4"
                      fill={isSelected ? '#38bdf8' : '#ffffff'}
                      fontSize={entity.type === 'CENTRAL_HUB' ? '13' : '11'}
                      fontWeight="700"
                      className="drop-shadow-md tracking-wide"
                    >
                      {entity.refLabel || entity.name}
                    </text>
                    <text
                      textAnchor="middle"
                      y="12"
                      fill={isSelected ? '#93c5fd' : '#cbd5e1'}
                      fontSize="9"
                      fontWeight="500"
                      opacity="0.9"
                    >
                      ({entity.areaM2} m² · {entity.capacity} cap)
                    </text>
                  </g>
                </g>
              </g>
            );
          })}

          {/* Hexagonal Double Door Swing Arcs for Ground Floor */}
          {activeFloor === 'GROUND' && (
            <g pointerEvents="none" stroke="#e2e8f0" strokeWidth="2" fill="none" opacity="0.95">
              <path d="M 475 580 A 15 15 0 0 1 490 565" />
              <path d="M 525 580 A 15 15 0 0 0 510 565" />
              <line x1="475" y1="580" x2="475" y2="565" strokeWidth="1.5" />
              <line x1="525" y1="580" x2="525" y2="565" strokeWidth="1.5" />
              <path d="M 445 410 A 12 12 0 0 1 455 398" />
              <line x1="445" y1="410" x2="455" y2="398" />
              <path d="M 545 410 A 12 12 0 0 0 555 422" />
              <line x1="545" y1="410" x2="555" y2="422" />
              <path d="M 413 460 A 15 15 0 0 1 428 475" />
              <path d="M 413 500 A 15 15 0 0 0 428 485" />
              <path d="M 587 450 A 12 12 0 0 0 575 460" />
              <path d="M 565 545 A 12 12 0 0 1 555 558" />
            </g>
          )}

          {/* Spatial Node Connection Points */}
          {showSpatialNodes &&
            floorEntities.map((entity) => (
              <circle
                key={`wp-${entity.id}`}
                cx={entity.position.entranceX}
                cy={entity.position.entranceY}
                r="3"
                fill="#38bdf8"
                opacity="0.8"
              />
            ))}

          {/* Blocked Waypoints (Spatial Event Simulation) */}
          {blockedWaypoints.map((bId) => (
            <g key={`blocked-${bId}`} transform="translate(380, 550)" pointerEvents="none">
              <circle r="9" fill="#ef4444" opacity="0.3" className="animate-ping" />
              <circle r="7" fill="#ef4444" />
              <text textAnchor="middle" y="3" fill="#ffffff" fontSize="9" fontWeight="bold">
                ✕
              </text>
            </g>
          ))}

          {/* Floor Navigation Path on Current Floor */}
          {floorRouteWaypoints.length > 1 && (
            <g pointerEvents="none">
              <polyline
                points={floorRouteWaypoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#multiRouteGlow)"
                opacity="0.8"
              />
              <polyline
                points={floorRouteWaypoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeDasharray="8 6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
              />
              {/* Markers */}
              <circle cx={floorRouteWaypoints[0].x} cy={floorRouteWaypoints[0].y} r="6" fill="#06b6d4" />
              <circle
                cx={floorRouteWaypoints[floorRouteWaypoints.length - 1].x}
                cy={floorRouteWaypoints[floorRouteWaypoints.length - 1].y}
                r="8"
                fill="#10b981"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Floating 360° Compass */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-1.5 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-2 rounded-2xl shadow-2xl">
        <div
          onClick={() => setRotationDegrees((prev) => (prev + 45) % 360)}
          className="relative w-10 h-10 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center cursor-pointer hover:border-cyan-500/80 transition-all shadow-inner group"
          title="Click to rotate 45°, or hold Shift and drag"
        >
          <span className="absolute top-0.5 text-[7px] font-black text-cyan-400">N</span>
          <span className="absolute bottom-0.5 text-[7px] font-bold text-slate-500">S</span>
          <div
            className="w-1 h-6 rounded-full bg-transparent flex flex-col items-center justify-between transition-transform duration-100 ease-out"
            style={{ transform: `rotate(${-rotationDegrees}deg)` }}
          >
            <div className="w-1.5 h-3 bg-red-500 rounded-t-sm" />
            <div className="w-1.5 h-3 bg-slate-400 rounded-b-sm" />
          </div>
        </div>
        <div className="text-[10px] font-mono font-bold text-slate-300">{Math.round(rotationDegrees)}°</div>
        {rotationDegrees !== 0 && (
          <button
            onClick={resetOrientation}
            className="px-1.5 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-[9px] font-bold text-cyan-300 rounded border border-cyan-500/30"
          >
            Reset
          </button>
        )}
      </div>

      {/* Bottom Right Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-1.5 rounded-xl shadow-lg">
        <button
          onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.65, z - 0.2))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-3.5 bg-slate-800 mx-0.5" />
        <button
          onClick={resetOrientation}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>
    </div>
  );
}
