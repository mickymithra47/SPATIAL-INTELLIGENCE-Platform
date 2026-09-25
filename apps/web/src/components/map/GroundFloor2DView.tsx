'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  GROUND_FLOOR_ROOMS,
  GroundFloorRoom,
  NavigationWaypoint,
} from '../../services/groundFloorData';
import { Compass, RotateCcw, ZoomIn, ZoomOut, Navigation, Sparkles } from 'lucide-react';

interface GroundFloor2DViewProps {
  perspective: '2D' | '2.5D_ISOMETRIC';
  selectedRoom: GroundFloorRoom | null;
  onSelectRoom: (room: GroundFloorRoom) => void;
  activeRouteWaypoints?: NavigationWaypoint[];
  showOccupancyLayer?: boolean;
}

export function GroundFloor2DView({
  perspective,
  selectedRoom,
  onSelectRoom,
  activeRouteWaypoints = [],
  showOccupancyLayer = false,
}: GroundFloor2DViewProps) {
  // 360° Continuous Rotation Angle (in degrees)
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hoveredRoom, setHoveredRoom] = useState<GroundFloorRoom | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isRotating = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startRotation = useRef(0);
  const startPan = useRef({ x: 0, y: 0 });

  // Center of the floor plan coordinates (500, 480)
  const centerX = 500;
  const centerY = 480;

  // Mouse Drag:
  // If Shift is pressed OR right click OR in 2.5D mode -> Orbit/Rotate
  // Else -> Pan
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
      // 360° continuous rotation based on horizontal drag
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

  // Convert polygon points to SVG path string
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
      className="relative w-full h-full bg-[#060913] cursor-grab active:cursor-grabbing select-none overflow-hidden"
    >
      {/* Subtle Spatial Blueprint Grid Background */}
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

      {/* Floating 2D/2.5D Transform Container */}
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
          viewBox="100 120 780 720"
          className="w-full h-full max-w-[860px] max-h-[760px] transition-transform duration-75"
          style={{
            transform: perspective === '2D' ? `rotate(${rotationDegrees}deg)` : 'none',
            transformOrigin: `${centerX}px ${centerY}px`,
          }}
        >
          <defs>
            {/* Glowing route line filter */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Room selection pulse filter */}
            <filter id="selectionGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Linear gradients for architectural room tiles */}
            <linearGradient id="hubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* 1. Outer Building Envelope Shadow & Outline */}
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

          {/* 2. Architectural Floor Rooms */}
          {GROUND_FLOOR_ROOMS.map((room) => {
            const isSelected = selectedRoom?.id === room.id;
            const isHovered = hoveredRoom?.id === room.id;
            const pathData = getPolygonPath(room.polygon);

            return (
              <g
                key={room.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRoom(room);
                }}
                onMouseEnter={() => setHoveredRoom(room)}
                onMouseLeave={() => setHoveredRoom(null)}
                className="cursor-pointer group"
              >
                {/* 2.5D Wall Depth/Extrusion Effect when in 2.5D */}
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
                  fill={isSelected ? 'rgba(6, 182, 212, 0.25)' : isHovered ? 'rgba(56, 189, 248, 0.18)' : room.color.fill}
                  stroke={isSelected ? '#06b6d4' : isHovered ? '#38bdf8' : room.color.stroke}
                  strokeWidth={isSelected ? '3.5' : isHovered ? '2.5' : '1.8'}
                  filter={isSelected ? 'url(#selectionGlow)' : undefined}
                  className="transition-all duration-200"
                />

                {/* Architectural Features per Room */}
                {room.type === 'CENTRAL_HUB' && (
                  <g pointerEvents="none">
                    {/* Inner Hexagonal Planter & Seating */}
                    <polygon
                      points="475,445 525,445 550,480 525,515 475,515 450,480"
                      fill="#047857"
                      stroke="#10b981"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                    <circle cx="500" cy="480" r="14" fill="#10b981" opacity="0.9" />
                    <text
                      x="500"
                      y="484"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      🌿
                    </text>
                  </g>
                )}

                {room.type === 'SEMINAR_HALL' && (
                  <g pointerEvents="none" opacity="0.6">
                    {/* Curved Amphitheater Seating Arcs */}
                    <path d="M 370 680 Q 440 660 510 680" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="5 4" />
                    <path d="M 360 715 Q 440 690 520 715" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="5 4" />
                    <path d="M 350 750 Q 440 720 530 750" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="5 4" />
                    {/* Stage Box */}
                    <rect x="410" y="625" width="60" height="14" rx="3" fill="#e11d48" opacity="0.8" />
                  </g>
                )}

                {room.type === 'STAIRS' && (
                  <g pointerEvents="none" opacity="0.7">
                    {/* Hatching for Stairs */}
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <line
                        key={idx}
                        x1={room.polygon[0].x + idx * 12}
                        y1={room.polygon[0].y + idx * 8}
                        x2={room.polygon[1].x + idx * 12}
                        y2={room.polygon[1].y + idx * 8}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                      />
                    ))}
                  </g>
                )}

                {/* Counter-Rotated Text Label so it stays upright in 2D mode */}
                <g
                  transform={`translate(${room.position.labelX}, ${room.position.labelY})`}
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
                      fontSize={room.type === 'CENTRAL_HUB' ? '13' : '11'}
                      fontWeight="bold"
                      className="drop-shadow-md tracking-wide"
                    >
                      {room.name}
                    </text>
                    <text
                      textAnchor="middle"
                      y="11"
                      fill={isSelected ? '#93c5fd' : '#94a3b8'}
                      fontSize="9"
                      fontWeight="500"
                    >
                      {room.areaM2} m² • {room.capacity} cap
                    </text>
                  </g>
                </g>
              </g>
            );
          })}

          {/* 3. Door Waypoint Nodes */}
          {GROUND_FLOOR_ROOMS.map((room) => (
            <circle
              key={`door-${room.id}`}
              cx={room.position.entranceX}
              cy={room.position.entranceY}
              r="3.5"
              fill="#38bdf8"
              opacity="0.8"
            />
          ))}

          {/* 4. Active Glowing Indoor Navigation Route */}
          {activeRouteWaypoints.length > 1 && (
            <g pointerEvents="none">
              {/* Outer glow line */}
              <polyline
                points={activeRouteWaypoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#routeGlow)"
                opacity="0.75"
              />

              {/* Animated pulsed core line */}
              <polyline
                points={activeRouteWaypoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeDasharray="8 6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
              />

              {/* Origin Marker */}
              <g transform={`translate(${activeRouteWaypoints[0].x}, ${activeRouteWaypoints[0].y})`}>
                <circle r="7" fill="#06b6d4" />
                <circle r="3" fill="#ffffff" />
              </g>

              {/* Destination Marker */}
              <g
                transform={`translate(${
                  activeRouteWaypoints[activeRouteWaypoints.length - 1].x
                }, ${activeRouteWaypoints[activeRouteWaypoints.length - 1].y})`}
              >
                <circle r="9" fill="#10b981" className="animate-ping" opacity="0.6" />
                <circle r="8" fill="#10b981" />
                <circle r="4" fill="#ffffff" />
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Floating 360° Compass & Orientation Controller */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-2 bg-slate-900/85 backdrop-blur-xl border border-slate-800 p-2.5 rounded-2xl shadow-2xl">
        {/* Interactive Rotatable Compass Ring */}
        <div
          onClick={() => {
            // Step rotate 45 degrees on click
            setRotationDegrees((prev) => (prev + 45) % 360);
          }}
          className="relative w-12 h-12 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center cursor-pointer hover:border-cyan-500/80 transition-all shadow-inner group"
          title="Click to step rotate 45°, or drag the floor plan"
        >
          {/* Compass Rose Markings */}
          <span className="absolute top-0.5 text-[8px] font-black text-cyan-400">N</span>
          <span className="absolute bottom-0.5 text-[8px] font-bold text-slate-500">S</span>
          <span className="absolute left-1 text-[8px] font-bold text-slate-500">W</span>
          <span className="absolute right-1 text-[8px] font-bold text-slate-500">E</span>

          {/* Rotating Compass Needle pointing North */}
          <div
            className="w-1 h-7 rounded-full bg-transparent flex flex-col items-center justify-between transition-transform duration-100 ease-out"
            style={{ transform: `rotate(${-rotationDegrees}deg)` }}
          >
            <div className="w-1.5 h-3.5 bg-red-500 rounded-t-sm" />
            <div className="w-1.5 h-3.5 bg-slate-400 rounded-b-sm" />
          </div>
        </div>

        {/* Degree Display & Reset Orientation Button */}
        <div className="text-[11px] font-mono font-bold text-slate-300">
          {Math.round(rotationDegrees)}°
        </div>

        {rotationDegrees !== 0 && (
          <button
            onClick={resetOrientation}
            className="flex items-center gap-1 px-2 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 rounded-lg transition-all"
            title="Reset Orientation to North-Up"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-xl border border-slate-800 p-1.5 rounded-xl shadow-lg">
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
        <div className="w-px h-4 bg-slate-800 mx-0.5" />
        <button
          onClick={resetOrientation}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset Zoom & Pan"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {/* 360° Drag Rotation Tip */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400">
        <Compass className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>360° Drag Rotation: Hold Shift or Right-Click & Drag</span>
      </div>
    </div>
  );
}
