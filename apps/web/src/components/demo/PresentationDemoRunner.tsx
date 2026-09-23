'use client';

import React, { useEffect, useRef } from 'react';
import { useSpatialStore } from '../../stores/useSpatialStore';
import { useAIChatStore } from '../../stores/useAIChatStore';
import { Play, Pause, SkipForward, Square, CheckCircle2, Sparkles, Navigation, ShieldAlert, BarChart3 } from 'lucide-react';

interface PresentationDemoRunnerProps {
  onOpenAnalytics: () => void;
  onOpenKnowledgeGraph: () => void;
}

export function PresentationDemoRunner({ onOpenAnalytics, onOpenKnowledgeGraph }: PresentationDemoRunnerProps) {
  const {
    isDemoRunning,
    setDemoRunning,
    demoStepIndex,
    setDemoStepIndex,
    setSelectedBuildingView,
    setActiveBuildingId,
    setActiveFloorNumber,
    setSelectedRoom,
    setActiveRoute,
    setLayers,
    setViewMode,
    rooms,
    buildings,
  } = useSpatialStore();

  const { sendMessage } = useAIChatStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const demoSteps = [
    {
      title: '1. Campus Macro Overview',
      desc: 'Showcasing the multi-building campus layout, roads, central lawn, and live telemetry.',
      action: () => {
        setViewMode('DIGITAL_TWIN');
        setSelectedBuildingView(false);
      },
    },
    {
      title: '2. Conversational Spatial AI Copilot',
      desc: 'Natural language spatial query: "Where is my next class?"',
      action: () => {
        sendMessage('Where is my next class?');
      },
    },
    {
      title: '3. Focus Computer Science Block B',
      desc: 'Selecting Block B and highlighting building engineering metrics.',
      action: () => {
        setActiveBuildingId('b-cse-001');
        setSelectedBuildingView(true);
      },
    },
    {
      title: '4. Level 2 Floorplan Inspection',
      desc: 'Ascending to Floor 2 (AI Research Labs and Seminar Halls).',
      action: () => {
        setActiveFloorNumber(2);
      },
    },
    {
      title: '5. Room 204 Digital Twin Telemetry',
      desc: 'Inspecting AI Lab 204: live occupancy, 22.8°C temp, AQI, and equipment inventory.',
      action: () => {
        const r204 = rooms.find((r) => r.id === 'r-204');
        if (r204) setSelectedRoom(r204);
      },
    },
    {
      title: '6. Indoor Corridor Pathfinding',
      desc: 'Computing shortest ADA accessible route from Lecture Hall 101 to AI Lab 204 via Elevator #1.',
      action: () => {
        setActiveRoute({
          originName: 'Lecture Hall 101',
          destinationName: 'AI & Robotics Lab 204',
          totalDistanceMeters: 54,
          estimatedMinutes: 1.8,
          waypoints: [],
          accessible: true,
          reasoning: 'Shortest indoor accessible corridor via elevator',
          steps: [
            { instruction: 'Exit Room 101 into Corridor A', distance: '8m', level: 'Floor 1', type: 'DOOR' },
            { instruction: 'Walk to Vertical Core Elevator #1', distance: '15m', level: 'Floor 1', type: 'WALK' },
            { instruction: 'Ascend to Level 2', distance: '10m', level: 'Level 1 → 2', type: 'ELEVATOR' },
            { instruction: 'Arrive at AI Lab 204', distance: '14m', level: 'Floor 2', type: 'WALK' },
          ],
        });
      },
    },
    {
      title: '7. People Density Heatmap GIS Layer',
      desc: 'Activating real-time people flow and crowd density GIS layer.',
      action: () => {
        setLayers({ peopleDensity: true });
        setSelectedBuildingView(false);
      },
    },
    {
      title: '8. Equipment & Robotics Telemetry',
      desc: 'Tracking UR5e 6-Axis Robot Arm & NVIDIA RTX AI Workstations status.',
      action: () => {
        setSelectedBuildingView(true);
        setActiveFloorNumber(2);
        setLayers({ equipment: true });
      },
    },
    {
      title: '9. Safety & Emergency Evacuation Mode',
      desc: 'Engaging high-contrast emergency HUD with nearest safe fire exits and assembly lawns.',
      action: () => {
        setViewMode('SAFETY');
        setLayers({ fireSafety: true });
      },
    },
    {
      title: '10. Campus Knowledge Graph Ontology',
      desc: 'Displaying multi-relational graph: Student → Class → Faculty → Room → Equipment.',
      action: () => {
        setViewMode('DIGITAL_TWIN');
        onOpenKnowledgeGraph();
      },
    },
    {
      title: '11. Executive Analytics & Telemetry',
      desc: 'Displaying space utilization curves and smart grid energy draw.',
      action: () => {
        onOpenAnalytics();
      },
    },
    {
      title: '12. Tour Complete • Ready for Questions',
      desc: 'Spatial Intelligence Platform demonstration concluded successfully.',
      action: () => {
        setViewMode('DIGITAL_TWIN');
        setSelectedBuildingView(true);
      },
    },
  ];

  const currentStep = demoSteps[demoStepIndex] || demoSteps[0];

  const nextStep = () => {
    if (demoStepIndex < demoSteps.length - 1) {
      const nextIdx = demoStepIndex + 1;
      setDemoStepIndex(nextIdx);
      demoSteps[nextIdx].action();
    } else {
      setDemoRunning(false);
      setDemoStepIndex(0);
    }
  };

  const stopDemo = () => {
    setDemoRunning(false);
    setDemoStepIndex(0);
  };

  if (!isDemoRunning) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900/95 backdrop-blur-2xl border-2 border-amber-500/60 rounded-3xl p-4 shadow-[0_0_40px_rgba(245,158,11,0.3)] flex flex-col gap-3">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
              PRESENTATION DEMO MODE
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Step {demoStepIndex + 1} of {demoSteps.length}
          </span>
        </div>

        {/* Narrative Description */}
        <div>
          <h4 className="text-sm font-bold text-white">{currentStep.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5">{currentStep.desc}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={stopDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <Square className="w-3.5 h-3.5" /> Exit Tour
          </button>

          <button
            onClick={nextStep}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg transition-all hover:scale-105"
          >
            <span>{demoStepIndex === demoSteps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <SkipForward className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
