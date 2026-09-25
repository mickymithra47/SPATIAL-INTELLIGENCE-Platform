'use client';

import React, { useState, useRef } from 'react';
import {
  FloorLevel,
  CampusRoomEntity,
  MultiFloorWaypoint,
  getEntitiesForFloor,
} from '../../services/campusMultiFloorData';
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
  const dragStart = useRef({ x: 0, y: 0 });
  const startRotation = useRef(0);
  const startPan = useRef({ x: 0, y: 0 });

  const centerX = 500;
  const centerY = 480;

  const floorEntities = getEntitiesForFloor(activeFloor);
  const floorRouteWaypoints = activeRouteWaypoints.filter((wp) => wp.floor === activeFloor);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
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
          viewBox="120 120 760 720"
          className="w-full h-full max-w-[860px] max-h-[760px] transition-transform duration-75"
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

          {/* Outer Perimeter Footprint */}
          <ellipse
            cx={centerX}
            cy={centerY}
            rx="370"
            ry="330"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            opacity="0.4"
          />

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
                  onSelectEntity(entity);
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
                      ? 'rgba(6, 182, 212, 0.28)'
                      : isHovered
                      ? 'rgba(56, 189, 248, 0.18)'
                      : entity.color.fill
                  }
                  stroke={isSelected ? '#06b6d4' : isHovered ? '#38bdf8' : entity.color.stroke}
                  strokeWidth={isSelected ? '3.5' : isHovered ? '2.5' : '1.8'}
                  filter={isSelected ? 'url(#multiSelectionGlow)' : undefined}
                  className="transition-all duration-200"
                />

                {/* Specific Architectural Geometry Enhancements */}
                {entity.type === 'CENTRAL_HUB' && activeFloor === 'GROUND' && (
                  <g pointerEvents="none">
                    <polygon
                      points="475,445 525,445 550,480 525,515 475,515 450,480"
                      fill="#047857"
                      stroke="#10b981"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                    <circle cx="500" cy="480" r="14" fill="#10b981" opacity="0.9" />
                    <text x="500" y="484" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      🌿
                    </text>
                  </g>
                )}

                {entity.type === 'SEMINAR_HALL' && (
                  <g pointerEvents="none" opacity="0.6">
                    <path d="M 370 680 Q 440 660 510 680" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="5 4" />
                    <path d="M 360 715 Q 440 690 520 715" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="5 4" />
                    <path d="M 350 750 Q 440 720 530 750" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="5 4" />
                    <rect x="410" y="625" width="60" height="14" rx="3" fill="#e11d48" opacity="0.8" />
                  </g>
                )}

                {entity.type === 'STAIRS' && (
                  <g pointerEvents="none" opacity="0.7">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <line
                        key={idx}
                        x1={entity.polygon[0].x + idx * 12}
                        y1={entity.polygon[0].y + idx * 8}
                        x2={entity.polygon[1].x + idx * 12}
                        y2={entity.polygon[1].y + idx * 8}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                      />
                    ))}
                  </g>
                )}

                {entity.type === 'LIFT' && (
                  <g pointerEvents="none">
                    <rect
                      x={entity.polygon[0].x + 4}
                      y={entity.polygon[0].y + 4}
                      width={entity.polygon[1].x - entity.polygon[0].x - 8}
                      height={entity.polygon[2].y - entity.polygon[0].y - 8}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={(entity.polygon[0].x + entity.polygon[1].x) / 2}
                      y={(entity.polygon[0].y + entity.polygon[2].y) / 2 + 3}
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
                      fill={isSelected ? '#38bdf8' : '#f8fafc'}
                      fontSize={entity.type === 'CENTRAL_HUB' ? '12' : '10.5'}
                      fontWeight="bold"
                      className="drop-shadow-md tracking-wide"
                    >
                      {entity.name}
                    </text>
                    <text
                      textAnchor="middle"
                      y="10"
                      fill={isSelected ? '#93c5fd' : '#94a3b8'}
                      fontSize="8.5"
                      fontWeight="500"
                    >
                      {entity.areaM2} m² • {entity.capacity} cap
                    </text>
                  </g>
                </g>
              </g>
            );
          })}

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
