'use client';

import React, { useState } from 'react';
import { CleanTopBar } from '../components/layout/CleanTopBar';
import { CompactSidebar } from '../components/layout/CompactSidebar';
import { CampusDigitalTwin } from '../components/map/CampusDigitalTwin';
import { CampusAICopilotPanel } from '../components/ai/CampusAICopilotPanel';
import { HackathonDemoModal } from '../components/demo/HackathonDemoModal';
import { MoreCapabilitiesModal } from '../components/layout/MoreCapabilitiesModal';
import { MaintenanceReportModal } from '../components/maintenance/MaintenanceReportModal';
import { CampusAnalyticsView } from '../components/intelligence/CampusAnalyticsView';
import { KnowledgeGraphModal } from '../components/intelligence/KnowledgeGraphModal';
import {
  FloorLevel,
  CampusRoomEntity,
  MultiFloorWaypoint,
  ALL_CAMPUS_ENTITIES,
  CAMPUS_INSTITUTIONS,
  CampusInstitution,
  calculateMultiFloorRoute,
} from '../services/campusMultiFloorData';
import {
  SPATIAL_EVENTS,
  SimulationEvent,
} from '../services/simulationEngine';

export default function SpatialIntelligencePlatformPage() {
  // Navigation & Spatial State
  const [activeSidebarTab, setActiveSidebarTab] = useState<'CAMPUS' | 'DIGITAL_TWIN' | 'NAVIGATE' | 'AI_COPILOT'>('DIGITAL_TWIN');
  const [perspective, setPerspective] = useState<'2D' | '2.5D_ISOMETRIC' | '3D_TILT'>('2D');
  const [activeFloor, setActiveFloor] = useState<FloorLevel>('GROUND');
  const [selectedEntity, setSelectedEntity] = useState<CampusRoomEntity | null>(null);

  // Institution State
  const [selectedInstitution, setSelectedInstitution] = useState<CampusInstitution>(CAMPUS_INSTITUTIONS[0]);

  // Spatial Simulation Event State
  const [activeEvent, setActiveEvent] = useState<SimulationEvent>('NORMAL');

  // Multi-Floor 3D Stacked View
  const [viewAllFloorsStacked, setViewAllFloorsStacked] = useState(false);

  // Active Indoor Navigation Route State
  const [activeRoute, setActiveRoute] = useState<{
    origin: string;
    destination: string;
    distanceMeters: number;
    estimatedSeconds: number;
    waypoints: MultiFloorWaypoint[];
    floorTransitions: { fromFloor: FloorLevel; toFloor: FloorLevel; via: 'STAIRS' | 'ELEVATOR' }[];
    steps: { instruction: string; distance: string; floor: FloorLevel }[];
  } | null>(null);

  // Visualization Toggles (Layers)
  const [showSpatialNodes, setShowSpatialNodes] = useState(true);

  // AI Copilot Panel State (Compact by default, expandable/collapsible)
  const [isCopilotExpanded, setIsCopilotExpanded] = useState(false);
  const [isCopilotMinimized, setIsCopilotMinimized] = useState(false);

  // Modals
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState(false);

  const blockedWaypoints = SPATIAL_EVENTS[activeEvent].blockedWaypoints;

  // Start route to any entity on any floor
  const handleStartRouteToEntity = (entity: CampusRoomEntity) => {
    setSelectedEntity(entity);
    setActiveFloor(entity.floor);

    const originWpId = activeFloor === 'GROUND' ? 'wp-gf-entrance' : `wp-${activeFloor.toLowerCase()}-hub`;
    const targetWpId = entity.connectedWaypoints[0] || 'wp-gf-hub';
    const route = calculateMultiFloorRoute(originWpId, targetWpId, blockedWaypoints);

    setActiveRoute({
      origin: activeFloor === 'GROUND' ? 'Main Entrance' : `${activeFloor} Floor Atrium`,
      destination: entity.name,
      distanceMeters: route.distanceMeters,
      estimatedSeconds: route.estimatedSeconds,
      waypoints: route.path,
      floorTransitions: route.floorTransitions,
      steps: route.steps,
    });
  };

  return (
    <div className="h-screen w-screen bg-[#030712] text-slate-100 flex flex-col overflow-hidden selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* 1. COMPACT TOP BAR */}
      <CleanTopBar
        perspective={perspective}
        setPerspective={setPerspective}
        activeFloor={activeFloor}
        setActiveFloor={setActiveFloor}
        selectedInstitution={selectedInstitution}
        setSelectedInstitution={setSelectedInstitution}
        onSelectEntity={(ent) => {
          setSelectedEntity(ent);
          setActiveFloor(ent.floor);
          setActiveSidebarTab('DIGITAL_TWIN');
        }}
        onStartDemo={() => setIsDemoModalOpen(true)}
        showSpatialNodes={showSpatialNodes}
        setShowSpatialNodes={setShowSpatialNodes}
        viewAllFloorsStacked={viewAllFloorsStacked}
        setViewAllFloorsStacked={setViewAllFloorsStacked}
        onOpenMore={() => setIsMoreModalOpen(true)}
      />

      {/* Dynamic Spatial Event Alert Banner (if active) */}
      {activeEvent !== 'NORMAL' && (
        <div className="w-full bg-amber-500/20 border-b border-amber-500/30 px-4 py-1 flex items-center justify-between text-[11px] text-amber-200 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <strong>Spatial Alert: {SPATIAL_EVENTS[activeEvent].title}</strong>
            <span className="text-amber-300/80 hidden sm:inline">— {SPATIAL_EVENTS[activeEvent].description}</span>
          </div>
          <button
            onClick={() => setActiveEvent('NORMAL')}
            className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30"
          >
            Clear Event
          </button>
        </div>
      )}

      {/* 2. MAIN THREE-PART BODY (DIGITAL TWIN IS HERO: 75–80%) */}
      <div className="flex-1 flex w-full relative overflow-hidden">
        {/* Compact Sidebar */}
        <CompactSidebar
          activeTab={activeSidebarTab}
          setActiveTab={setActiveSidebarTab}
          onOpenLayers={() => setIsMoreModalOpen(true)}
          onOpenMore={() => setIsMoreModalOpen(true)}
          onStartNavigatePrompt={() => {
            const lab1 = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'GF-LAB-01');
            if (lab1) handleStartRouteToEntity(lab1);
          }}
          onFocusAICopilot={() => {
            setIsCopilotMinimized(false);
            setIsCopilotExpanded(true);
          }}
        />

        {/* Central Workspace: Digital Twin Map as Primary Interface */}
        <main className="flex-1 h-full p-2 relative overflow-hidden flex flex-col">
          <CampusDigitalTwin
            perspective={perspective}
            setPerspective={setPerspective}
            activeFloor={activeFloor}
            setActiveFloor={setActiveFloor}
            selectedEntity={selectedEntity}
            setSelectedEntity={setSelectedEntity}
            activeRoute={activeRoute}
            setActiveRoute={setActiveRoute}
            onAskAIAboutRoom={(ent) => {
              setSelectedEntity(ent);
              setIsCopilotMinimized(false);
            }}
            blockedWaypoints={blockedWaypoints}
            viewAllFloorsStacked={viewAllFloorsStacked}
          />
        </main>

        {/* Compact Right Docked AI Copilot Panel */}
        <CampusAICopilotPanel
          activeFloor={activeFloor}
          setActiveFloor={setActiveFloor}
          selectedEntity={selectedEntity}
          onSelectEntity={(ent) => setSelectedEntity(ent)}
          onStartRoute={handleStartRouteToEntity}
          isExpanded={isCopilotExpanded}
          setIsExpanded={setIsCopilotExpanded}
          isMinimized={isCopilotMinimized}
          setIsMinimized={setIsCopilotMinimized}
        />
      </div>

      {/* ======================================================== */}
      {/* SECONDARY MODALS (OFF-SCREEN UNTIL TRIGGERED)            */}
      {/* ======================================================== */}
      <HackathonDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        setPerspective={setPerspective}
        setActiveFloor={setActiveFloor}
        onSelectEntity={(ent) => setSelectedEntity(ent)}
        onStartRoute={handleStartRouteToEntity}
        onClearRoute={() => setActiveRoute(null)}
        setActiveEvent={setActiveEvent}
        setViewAllFloorsStacked={setViewAllFloorsStacked}
      />

      <MoreCapabilitiesModal
        isOpen={isMoreModalOpen}
        onClose={() => setIsMoreModalOpen(false)}
        selectedInstitution={selectedInstitution}
        setSelectedInstitution={setSelectedInstitution}
        activeEvent={activeEvent}
        setActiveEvent={setActiveEvent}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenKnowledgeGraph={() => setIsKnowledgeGraphOpen(true)}
      />

      <MaintenanceReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <CampusAnalyticsView
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <KnowledgeGraphModal
        isOpen={isKnowledgeGraphOpen}
        onClose={() => setIsKnowledgeGraphOpen(false)}
      />
    </div>
  );
}
