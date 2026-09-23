'use client';

import React, { useState } from 'react';
import { TopHeaderBar } from '../components/layout/TopHeaderBar';
import { MissionControlSidebar } from '../components/layout/MissionControlSidebar';
import { CampusMapView } from '../components/map/CampusMapView';
import { ContextInspector } from '../components/inspector/ContextInspector';
import { GlobalAIChatBar } from '../components/ai/GlobalAIChatBar';
import { AIChatDrawer } from '../components/ai/AIChatDrawer';
import { SafetyEmergencyHUD } from '../components/safety/SafetyEmergencyHUD';
import { KnowledgeGraphModal } from '../components/intelligence/KnowledgeGraphModal';
import { CampusAnalyticsView } from '../components/intelligence/CampusAnalyticsView';
import { PresentationDemoRunner } from '../components/demo/PresentationDemoRunner';
import { MaintenanceReportModal } from '../components/maintenance/MaintenanceReportModal';
import { useSpatialStore } from '../stores/useSpatialStore';

export default function CampusOperatingSystemPage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState(false);

  const { setDemoRunning, setDemoStepIndex, viewMode } = useSpatialStore();

  const handleStartDemo = () => {
    setDemoStepIndex(0);
    setDemoRunning(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header Bar */}
      <TopHeaderBar
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onStartDemo={handleStartDemo}
      />

      {/* Main Mission Control Layout Body */}
      <div className="flex-1 flex w-full relative overflow-hidden">
        {/* Left Mission Control Sidebar */}
        <MissionControlSidebar
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          onOpenKnowledgeGraph={() => setIsKnowledgeGraphOpen(true)}
          onStartDemo={handleStartDemo}
        />

        {/* Central Workspace Stage: Digital Twin Map as Primary Interface */}
        <main className="flex-1 flex flex-col p-4 md:p-6 gap-4 overflow-y-auto">
          {/* Omnipresent Floating AI Copilot Prompt */}
          <div className="w-full max-w-5xl mx-auto">
            <GlobalAIChatBar />
          </div>

          {/* Core Central Workspace: 2.5D Digital Twin Map & Context Inspector */}
          <div className="flex-1 flex flex-col lg:flex-row gap-5 items-start w-full">
            {/* The Campus Is The Interface: Full Digital Twin Cartography Canvas */}
            <div className="flex-1 w-full min-h-[580px] flex flex-col">
              <CampusMapView />
            </div>

            {/* Right Context-Aware Spatial Intelligence Inspector */}
            <ContextInspector onOpenReportModal={() => setIsReportModalOpen(true)} />
          </div>
        </main>
      </div>

      {/* Emergency Mode High-Visibility HUD */}
      <SafetyEmergencyHUD />

      {/* Slide-out AI Copilot Drawer */}
      <AIChatDrawer />

      {/* Campus Analytics Modal */}
      <CampusAnalyticsView
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* Multi-Relational Knowledge Graph Modal */}
      <KnowledgeGraphModal
        isOpen={isKnowledgeGraphOpen}
        onClose={() => setIsKnowledgeGraphOpen(false)}
      />

      {/* Incident / Maintenance Report Modal */}
      <MaintenanceReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* 1-Click Automated Presentation Tour Runner */}
      <PresentationDemoRunner
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenKnowledgeGraph={() => setIsKnowledgeGraphOpen(true)}
      />
    </div>
  );
}
