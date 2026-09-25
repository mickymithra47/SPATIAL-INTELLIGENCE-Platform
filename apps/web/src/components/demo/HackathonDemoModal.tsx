'use client';

import React, { useState, useEffect } from 'react';
import {
  FloorLevel,
  CampusRoomEntity,
  ALL_CAMPUS_ENTITIES,
} from '../../services/campusMultiFloorData';
import { SimulationEvent } from '../../services/simulationEngine';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  X,
  Sparkles,
  Navigation,
  Box,
  Compass,
  Layers,
} from 'lucide-react';

interface HackathonDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  setPerspective: (p: '2D' | '2.5D_ISOMETRIC' | '3D_TILT') => void;
  setActiveFloor: (floor: FloorLevel) => void;
  onSelectEntity: (entity: CampusRoomEntity | null) => void;
  onStartRoute: (entity: CampusRoomEntity) => void;
  onClearRoute: () => void;
  setActiveEvent: (event: SimulationEvent) => void;
  setViewAllFloorsStacked: (stacked: boolean) => void;
}

export function HackathonDemoModal({
  isOpen,
  onClose,
  setPerspective,
  setActiveFloor,
  onSelectEntity,
  onStartRoute,
  onClearRoute,
  setActiveEvent,
  setViewAllFloorsStacked,
}: HackathonDemoModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = [
    {
      step: 1,
      title: 'Architectural Ground Floor (2D)',
      description: 'Authentic CAD blueprint of Ground Floor: Main entrance, COE Hall, CCTV Monitoring, Central Hexagon Hub, Lab 1, Seminar Hall, and Restrooms.',
      action: () => {
        setPerspective('2D');
        setActiveFloor('GROUND');
        setViewAllFloorsStacked(false);
        setActiveEvent('NORMAL');
        onSelectEntity(null);
        onClearRoute();
      },
    },
    {
      step: 2,
      title: 'Spatial Selection: Lab 1 & Live Telemetry',
      description: 'Selecting Lab 1 (CR-02, 70 m²). Digital Twin surfaces structured spatial metadata and simulated IoT telemetry (36/40 systems online, 22.4°C).',
      action: () => {
        const lab1 = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'GF-LAB-01')!;
        setActiveFloor('GROUND');
        onSelectEntity(lab1);
      },
    },
    {
      step: 3,
      title: 'Indoor Navigation from Main Entrance',
      description: 'A* algorithm calculates optimal indoor walking path: Main Entrance → North Corridor → Central Hub → Lab 1 (18m, 16s).',
      action: () => {
        const lab1 = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'GF-LAB-01')!;
        setActiveFloor('GROUND');
        onStartRoute(lab1);
      },
    },
    {
      step: 4,
      title: 'Vertical Transition: First Floor',
      description: 'Switching to First Floor: AI Research & Neural Systems Lab, Cloud IoT Lab, and Smart Lecture Theatre 101 with stairs & lift landings.',
      action: () => {
        setActiveFloor('FIRST');
        const lab2 = ALL_CAMPUS_ENTITIES.find((r) => r.id === '1F-LAB-02')!;
        onSelectEntity(lab2);
      },
    },
    {
      step: 5,
      title: 'Second Floor: Robotics & Incubator',
      description: 'Second Floor houses Advanced Robotics & Cyber-Physical Systems Lab, Innovation Studio 201, and Campus Startup Incubator.',
      action: () => {
        setActiveFloor('SECOND');
        const lab4 = ALL_CAMPUS_ENTITIES.find((r) => r.id === '2F-LAB-04')!;
        onSelectEntity(lab4);
      },
    },
    {
      step: 6,
      title: 'Terrace: Rooftop Classrooms & Solar Deck',
      description: 'Rooftop level with Open Classroom Studios 1 & 2, Lift Penthouse, and 240 m² Solar Observation Deck.',
      action: () => {
        setActiveFloor('TERRACE');
        const cr1 = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'TR-CR-01')!;
        onSelectEntity(cr1);
      },
    },
    {
      step: 7,
      title: '3D WebGL Digital Twin & 360° Orbit',
      description: 'Extruded Three.js 3D building with full 360-degree free orbital camera, floating holographic labels, and architectural features.',
      action: () => {
        setPerspective('3D_TILT');
        setViewAllFloorsStacked(false);
      },
    },
    {
      step: 8,
      title: 'Stacked 3D Multi-Floor Building Model',
      description: 'Visualizing all 4 floors stacked in 3D: Ground, 1st, 2nd, and Terrace aligned along vertical circulation shafts.',
      action: () => {
        setPerspective('3D_TILT');
        setViewAllFloorsStacked(true);
      },
    },
    {
      step: 9,
      title: 'Dynamic Spatial Event & A* Rerouting',
      description: 'Simulating West Corridor Maintenance: Navigation automatically detects blockage and reroutes through the Atrium.',
      action: () => {
        setActiveFloor('GROUND');
        setPerspective('2D');
        setViewAllFloorsStacked(false);
        setActiveEvent('CORRIDOR_MAINTENANCE');
        const lab1 = ALL_CAMPUS_ENTITIES.find((r) => r.id === 'GF-LAB-01')!;
        onStartRoute(lab1);
      },
    },
    {
      step: 10,
      title: 'AI Spatial Reasoning & Multi-Campus Ready',
      description: 'Campus AI Copilot explains dynamic bottlenecks and coordinates across multiple simulated institutions.',
      action: () => {
        setActiveEvent('NORMAL');
      },
    },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && isOpen) {
      timer = setTimeout(() => {
        if (currentStep < demoSteps.length) {
          executeStep(currentStep + 1);
        } else {
          setIsPlaying(false);
        }
      }, 4200);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, isOpen]);

  const executeStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    const stepObj = demoSteps.find((s) => s.step === stepNumber);
    if (stepObj) stepObj.action();
  };

  if (!isOpen) return null;

  const currentStepData = demoSteps[currentStep - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 text-xs">
      <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">Hackathon Pitch Tour</h3>
              <p className="text-[10px] text-cyan-400">
                Step {currentStep} of {demoSteps.length}: {currentStepData.title}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-1">
          {demoSteps.map((s) => (
            <button
              key={s.step}
              onClick={() => executeStep(s.step)}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s.step === currentStep
                  ? 'bg-cyan-400 shadow-md shadow-cyan-500/50'
                  : s.step < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Current Step Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
              STEP {currentStep} / {demoSteps.length}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
              Autonomous Demo
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">{currentStepData.title}</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">{currentStepData.description}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>
            <button
              onClick={() => executeStep(1)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              title="Restart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentStep === 1}
              onClick={() => executeStep(currentStep - 1)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (currentStep < demoSteps.length) executeStep(currentStep + 1);
                else onClose();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs"
            >
              <span>{currentStep === demoSteps.length ? 'Finish' : 'Next'}</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
