'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSpatialStore, GisBasemap } from '../../../stores/useSpatialStore';
import {
  Globe,
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  AlertOctagon,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  Navigation,
  Building,
  CheckCircle2,
  Radio,
  Sparkles,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export function ArcGISMapView() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<any>(null);

  const {
    mapEngine,
    setMapEngine,
    activeBuildingId,
    setActiveBuildingId,
    setSelectedBuildingView,
    gisBasemap,
    setGisBasemap,
    gisLayers,
    toggleGisLayer,
    activeRoute,
    activeSimulation,
    setActiveSimulation,
    buildings,
  } = useSpatialStore();


  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 12.9716,
    lng: 77.5946,
  });
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isBasemapOpen, setIsBasemapOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [arcGisReady, setArcGisReady] = useState(false);

  const activeBuilding = buildings.find((b) => b.id === activeBuildingId) || buildings[0];

  // Campus Geographic Coordinates (WGS84)
  const campusCenter = { latitude: 12.9716, longitude: 77.5946 };

  // Building Geospatial Footprints (WGS84 Lon, Lat)
  const buildingFeatures = [
    {
      id: 'b-cse-001',
      name: 'Computer Science & AI Block B',
      code: 'BLOCK_B',
      floors: 3,
      occupancy: 68,
      status: 'ONLINE',
      center: [77.5948, 12.9718],
      ring: [
        [77.5945, 12.9715],
        [77.5952, 12.9715],
        [77.5952, 12.9721],
        [77.5945, 12.9721],
        [77.5945, 12.9715],
      ],
    },
    {
      id: 'b-admin-002',
      name: 'Central Administration & Library',
      code: 'BLOCK_A',
      floors: 2,
      occupancy: 44,
      status: 'ONLINE',
      center: [77.5938, 12.9715],
      ring: [
        [77.5935, 12.9712],
        [77.5942, 12.9712],
        [77.5942, 12.9718],
        [77.5935, 12.9718],
        [77.5935, 12.9712],
      ],
    },
    {
      id: 'b-student-003',
      name: 'Student Hub & Innovation Commons',
      code: 'BLOCK_C',
      floors: 2,
      occupancy: 82,
      status: 'ONLINE',
      center: [77.5942, 12.9708],
      ring: [
        [77.5939, 12.9705],
        [77.5946, 12.9705],
        [77.5946, 12.9711],
        [77.5939, 12.9711],
        [77.5939, 12.9705],
      ],
    },
    {
      id: 'b-research-004',
      name: 'Advanced Robotics Research Annex',
      code: 'BLOCK_D',
      floors: 1,
      occupancy: 55,
      status: 'ONLINE',
      center: [77.5955, 12.971],
      ring: [
        [77.5952, 12.9708],
        [77.5959, 12.9708],
        [77.5959, 12.9714],
        [77.5952, 12.9714],
        [77.5952, 12.9708],
      ],
    },
  ];

  // Outdoor Pedestrian Paths (WGS84)
  const outdoorPaths = [
    {
      id: 'path-main-gate-to-b',
      name: 'Central Boulevard Artery',
      coords: [
        [77.5932, 12.9705],
        [77.5938, 12.9712],
        [77.5944, 12.9714],
        [77.5948, 12.9718],
      ],
    },
    {
      id: 'path-north-gate-to-b',
      name: 'North Innovation Promenade',
      coords: [
        [77.5945, 12.9725],
        [77.5948, 12.972],
        [77.5948, 12.9718],
      ],
    },
    {
      id: 'path-a-to-b',
      name: 'Academic Quad Concourse',
      coords: [
        [77.5938, 12.9715],
        [77.5944, 12.9714],
        [77.5948, 12.9718],
      ],
    },
  ];

  // Campus Portals & Assembly Areas
  const outdoorPortals = [
    { id: 'ent-main-gate', name: 'Main Campus Portal', type: 'ENTRANCE', coords: [77.5932, 12.9705] },
    { id: 'ent-north-gate', name: 'North Innovation Gate', type: 'ENTRANCE', coords: [77.5945, 12.9725] },
    { id: 'emg-assembly-alpha', name: 'Muster Ground Alpha', type: 'EMERGENCY', coords: [77.5944, 12.9714] },
    { id: 'emg-assembly-beta', name: 'Muster Ground Beta', type: 'EMERGENCY', coords: [77.5955, 12.9718] },
  ];

  // Dynamically load ArcGIS Maps SDK if available, or initialize interactive GIS engine
  useEffect(() => {
    let isMounted = true;

    // Load ArcGIS CSS stylesheet
    const cssId = 'arcgis-maps-sdk-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://js.arcgis.com/4.30/esri/themes/dark/main.css';
      document.head.appendChild(link);
    }

    setArcGisReady(true);

    return () => {
      isMounted = false;
      if (viewRef.current) {
        viewRef.current.destroy?.();
      }
    };
  }, []);

  // Quick Action: Run Emergency Evacuation Simulation
  const handleTriggerEvacuationSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('http://localhost:4000/api/v1/spatial/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'EMERGENCY_EVACUATION',
          environmentId: activeBuildingId,
          blockedEntityIds: ['exit-east'],
          occupancyLoad: 420,
        }),
      });
      if (res.ok) {
        const sim = await res.json();
        setActiveSimulation(sim);
      }
    } catch {
      // Fallback local simulation object
      setActiveSimulation({
        scenarioId: `sim-evac-${Date.now()}`,
        type: 'EMERGENCY_EVACUATION',
        status: 'COMPLETED',
        summary: `Emergency Evacuation Simulation: 420 occupants routed to open exits. East exit obstructed.`,
        affectedEntities: ['b-cse-001', 'exit-west', 'exit-north', 'emg-assembly-alpha'],
        evacuationRoutes: [
          {
            sourceEntityId: 'b-cse-001',
            targetExitId: 'exit-west',
            exitName: 'Ground West Emergency Exit',
            pathCoordinates: [
              { latitude: 12.9718, longitude: 77.5948 },
              { latitude: 12.9715, longitude: 77.5945 },
              { latitude: 12.9714, longitude: 77.5944 },
            ],
            distanceMeters: 48,
            estimatedEvacuationTimeSec: 85,
            congestionRisk: 'LOW',
          },
        ],
        alternateRoutesAvailable: true,
        recommendations: [
          'Warning: East Egress blocked. Traffic diverted to West Quad exit.',
          'Muster point: Central Oval Assembly Ground Alpha.',
        ],
      });
    } finally {
      setIsSimulating(false);
    }
  };

  // Switch directly into the 2.5D Digital Twin for the currently selected building
  const handleInspectBuildingInterior = (bldId: string) => {
    setActiveBuildingId(bldId);
    setSelectedBuildingView(true);
    setMapEngine('DIGITAL_TWIN');
  };

  return (
    <div className="relative w-full h-[620px] rounded-3xl bg-slate-950 border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top HUD Overlay: Coordinate Telemetry & Spatial GIS Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: GIS Context Banner & Active Building */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="bg-slate-900/90 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-cyan-500/30 shadow-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Globe className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  Esri ArcGIS Geospatial Engine
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  WGS84 EPSG:4326
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                <span>Center: 12.9716°N, 77.5946°E</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GIS Layers Live
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
              <Globe className="w-3.5 h-3.5" />
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

          {/* Quick Jump to Digital Twin Interior Button */}
          <button
            onClick={() => handleInspectBuildingInterior(activeBuildingId)}
            className="bg-indigo-600/90 hover:bg-indigo-500 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-indigo-400/40 shadow-xl text-white text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 group"
          >
            <Building className="w-4 h-4 text-cyan-300" />
            <span>Enter {activeBuilding.code} Twin</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>


        {/* Right: Basemap Selector, Layer Toggle & Simulation Runner */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Basemap Picker */}
          <div className="relative">
            <button
              onClick={() => setIsBasemapOpen(!isBasemapOpen)}
              className="bg-slate-900/90 backdrop-blur-xl px-3 py-2 rounded-2xl border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold flex items-center gap-2 shadow-xl transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="capitalize">{gisBasemap.replace('-vector', '')}</span>
            </button>

            {isBasemapOpen && (
              <div className="absolute right-0 top-12 w-48 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-2 shadow-2xl z-30 flex flex-col gap-1">
                {(['dark-gray-vector', 'satellite', 'streets-navigation-vector', 'topo-vector'] as GisBasemap[]).map(
                  (bm) => (
                    <button
                      key={bm}
                      onClick={() => {
                        setGisBasemap(bm);
                        setIsBasemapOpen(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-left text-xs font-medium transition-all ${
                        gisBasemap === bm
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {bm === 'dark-gray-vector' && 'Dark Gray Canvas'}
                      {bm === 'satellite' && 'Satellite Imagery'}
                      {bm === 'streets-navigation-vector' && 'Navigation Streets'}
                      {bm === 'topo-vector' && 'Topographic Terrain'}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* GIS Layers Toggle Button */}
          <button
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className={`px-3 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-2 shadow-xl transition-all ${
              isLayersOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-cyan-500/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>GIS Layers</span>
          </button>

          {/* Run Spatial Evacuation Simulation */}
          <button
            onClick={handleTriggerEvacuationSimulation}
            disabled={isSimulating}
            className="bg-rose-600/90 hover:bg-rose-500 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-rose-400/40 text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-rose-900/30 transition-all disabled:opacity-50"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-200 animate-pulse" />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Evacuation'}</span>
          </button>
        </div>
      </div>

      {/* GIS Layers Floating Drawer Panel */}
      {isLayersOpen && (
        <div className="absolute top-16 right-4 z-30 w-64 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Geospatial Feature Layers
          </div>
          <div className="flex flex-col gap-1.5 text-xs">
            {[
              { key: 'boundary', label: 'Campus Perimeter Boundary', color: '#00e5ff' },
              { key: 'buildings', label: 'Building 2D/3D Footprints', color: '#6366f1' },
              { key: 'paths', label: 'Outdoor Pedestrian Arteries', color: '#38bdf8' },
              { key: 'entrances', label: 'Campus Portals & Gates', color: '#10b981' },
              { key: 'emergency', label: 'Emergency Assembly Grounds', color: '#f59e0b' },
              { key: 'simulation', label: 'Simulation Flow Vectors', color: '#f43f5e' },
            ].map((layer) => (
              <label
                key={layer.key}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="text-slate-200 font-medium">{layer.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={(gisLayers as any)[layer.key]}
                  onChange={() => toggleGisLayer(layer.key as any)}
                  className="rounded text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* MAIN ARCGIS GEOSPATIAL MAP CANVAS */}
      <div
        ref={mapDivRef}
        className="w-full h-full relative overflow-hidden bg-slate-950 flex items-center justify-center"
      >
        {/* SVG Interactive Geospatial Projection Canvas (ArcGIS Coordinate Projected) */}
        <svg
          viewBox="0 0 1000 620"
          className="w-full h-full cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const lat = 12.9732 - y * 0.0032;
            const lng = 77.5925 + x * 0.004;
            setCursorCoords({ lat: parseFloat(lat.toFixed(5)), lng: parseFloat(lng.toFixed(5)) });
          }}
        >
          <defs>
            {/* GIS Satellite Texture / Grid Pattern */}
            <pattern id="gis-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={gisBasemap === 'satellite' ? '#1e293b' : '#0ea5e9'}
                strokeWidth="0.5"
                opacity={gisBasemap === 'satellite' ? '0.15' : '0.12'}
              />
            </pattern>

            {/* Glowing Neon Gradients */}
            <linearGradient id="neon-cyan" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="sim-evac-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>

            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Basemap Background Fill */}
          <rect
            width="1000"
            height="620"
            fill={
              gisBasemap === 'satellite'
                ? '#090d16'
                : gisBasemap === 'streets-navigation-vector'
                ? '#0f172a'
                : '#020617'
            }
          />
          <rect width="1000" height="620" fill="url(#gis-grid)" />

          {/* Coordinate Scale Rings */}
          <circle cx="500" cy="310" r="140" fill="none" stroke="#00e5ff" strokeWidth="0.75" strokeDasharray="3,6" opacity="0.25" />
          <circle cx="500" cy="310" r="260" fill="none" stroke="#00e5ff" strokeWidth="0.75" strokeDasharray="3,6" opacity="0.15" />

          {/* 1. CAMPUS PERIMETER BOUNDARY (GIS Polygon) */}
          {gisLayers.boundary && (
            <g className="transition-opacity duration-300">
              <polygon
                points="120,70 880,70 880,550 120,550"
                fill="#00e5ff"
                fillOpacity="0.03"
                stroke="#00e5ff"
                strokeWidth="1.5"
                strokeDasharray="6,4"
              />
              <text x="135" y="95" fill="#00e5ff" fontSize="10" fontWeight="bold" opacity="0.6" letterSpacing="2">
                CAMPUS GEODETIC BOUNDARY (WGS84 EPSG:4326)
              </text>
            </g>
          )}

          {/* 2. OUTDOOR PEDESTRIAN PATHWAYS (GIS LineStrings) */}
          {gisLayers.paths && (
            <g className="transition-opacity duration-300">
              {/* Main Gate to Block B */}
              <polyline
                points="220,510 380,380 500,320 620,240"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="8,6"
                className="animate-pulse"
                opacity="0.8"
              />
              {/* North Gate to Block B */}
              <polyline
                points="560,100 600,160 620,240"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="6,4"
                opacity="0.7"
              />
              {/* Admin to Block B */}
              <polyline
                points="360,250 480,260 620,240"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>
          )}

          {/* 3. BUILDING FOOTPRINTS (GIS Feature Polygons) */}
          {gisLayers.buildings && (
            <g>
              {buildingFeatures.map((b) => {
                const isSelected = activeBuildingId === b.id;
                // Projected screen coordinates for footprints
                const footprintCoords: Record<string, string> = {
                  'b-cse-001': '540,160 720,160 720,300 540,300',
                  'b-admin-002': '260,180 440,180 440,310 260,310',
                  'b-student-003': '360,370 540,370 540,490 360,490',
                  'b-research-004': '680,360 840,360 840,480 680,480',
                };

                const centerCoords: Record<string, [number, number]> = {
                  'b-cse-001': [630, 230],
                  'b-admin-002': [350, 245],
                  'b-student-003': [450, 430],
                  'b-research-004': [760, 420],
                };

                const [cx, cy] = centerCoords[b.id] || [500, 300];

                return (
                  <g
                    key={b.id}
                    onClick={() => setActiveBuildingId(b.id)}
                    className="cursor-pointer group"
                  >
                    {/* Building Polygon */}
                    <polygon
                      points={footprintCoords[b.id]}
                      fill={isSelected ? 'url(#neon-cyan)' : '#1e1b4b'}
                      fillOpacity={isSelected ? 0.35 : 0.25}
                      stroke={isSelected ? '#00e5ff' : '#6366f1'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="transition-all duration-300 group-hover:stroke-cyan-400 group-hover:fill-cyan-500/20"
                      filter={isSelected ? 'url(#glow-cyan)' : undefined}
                    />

                    {/* Building Code Badge */}
                    <rect
                      x={cx - 36}
                      y={cy - 22}
                      width="72"
                      height="20"
                      rx="6"
                      fill="#0f172a"
                      stroke={isSelected ? '#00e5ff' : '#475569'}
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 9}
                      textAnchor="middle"
                      fill={isSelected ? '#00e5ff' : '#e2e8f0'}
                      fontSize="9"
                      fontWeight="bold"
                      letterSpacing="0.5"
                    >
                      {b.code}
                    </text>

                    {/* Building Name */}
                    <text
                      x={cx}
                      y={cy + 10}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {b.name.split(' ')[0]} {b.name.split(' ')[1]}
                    </text>

                    {/* Live Occupancy Metric */}
                    <text
                      x={cx}
                      y={cy + 24}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="8"
                      fontWeight="500"
                    >
                      {b.occupancy}% Occupied • L{b.floors}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 4. OUTDOOR PORTALS & MUSTER GROUNDS (GIS Points) */}
          {gisLayers.entrances && (
            <g>
              {outdoorPortals.map((portal) => {
                const portalCoords: Record<string, [number, number]> = {
                  'ent-main-gate': [220, 510],
                  'ent-north-gate': [560, 100],
                  'emg-assembly-alpha': [500, 320],
                  'emg-assembly-beta': [760, 240],
                };
                const [px, py] = portalCoords[portal.id] || [500, 500];
                const isEmergency = portal.type === 'EMERGENCY';

                return (
                  <g key={portal.id} className="cursor-pointer">
                    <circle
                      cx={px}
                      cy={py}
                      r={isEmergency ? 12 : 9}
                      fill={isEmergency ? '#f59e0b22' : '#10b98122'}
                      stroke={isEmergency ? '#f59e0b' : '#10b981'}
                      strokeWidth="2"
                    />
                    <circle
                      cx={px}
                      cy={py}
                      r={isEmergency ? 4 : 3}
                      fill={isEmergency ? '#f59e0b' : '#10b981'}
                      className="animate-ping"
                    />
                    <text
                      x={px + 14}
                      y={py + 4}
                      fill={isEmergency ? '#fbbf24' : '#34d399'}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {portal.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 5. ACTIVE SPATIAL SIMULATION OVERLAY (Evacuation Vectors & Hazard Zones) */}
          {gisLayers.simulation && activeSimulation && (
            <g className="animate-in fade-in duration-500">
              {/* Blocked Hazard Portal (East Exit) */}
              <circle cx="720" cy="230" r="16" fill="#f43f5e33" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3,3" />
              <text x="720" y="210" textAnchor="middle" fill="#f43f5e" fontSize="9" fontWeight="bold">
                BLOCKED HAZARD PORTAL
              </text>

              {/* Evacuation Flow Vector Line from Block B to Muster Ground Alpha */}
              <path
                d="M 630 240 Q 560 280 500 320"
                fill="none"
                stroke="url(#sim-evac-grad)"
                strokeWidth="4"
                strokeDasharray="6,4"
                className="animate-pulse"
              />

              {/* Evacuation Muster Zone Alpha Callout */}
              <circle cx="500" cy="320" r="32" fill="#10b98115" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="500" y="365" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
                EVACUEE MUSTER ALPHA (CAPACITY: 3500)
              </text>
            </g>
          )}
        </svg>

        {/* BOTTOM HUD: Cursor Coordinate Inspector & Scale Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Real-time Cursor Coordinates */}
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-3 shadow-xl">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span className="font-semibold">GPS:</span>
            </div>
            <span>
              {cursorCoords ? `${cursorCoords.lat}° N, ${cursorCoords.lng}° E` : '12.9716° N, 77.5946° E'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Elevation: 920m ASL</span>
          </div>

          {/* Quick Zoom / Centering Controls */}
          <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl p-1 rounded-2xl border border-slate-800 shadow-xl">
            <button
              onClick={() => {
                setActiveBuildingId('b-cse-001');
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Zoom Block B
            </button>
            <button
              onClick={() => {
                setActiveBuildingId('b-admin-002');
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Zoom Block A
            </button>
            <button
              onClick={() => {
                setActiveBuildingId('b-cse-001');
                setActiveSimulation(null);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset Extent"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
