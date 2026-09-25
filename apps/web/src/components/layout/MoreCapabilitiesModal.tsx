'use client';

import React, { useState } from 'react';
import {
  X,
  Layers,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Activity,
  RefreshCw,
  BarChart3,
  Network,
  Wrench,
} from 'lucide-react';
import {
  CAMPUS_INSTITUTIONS,
  CampusInstitution,
} from '../../services/campusMultiFloorData';
import {
  SPATIAL_EVENTS,
  SimulationEvent,
  LAB_TELEMETRY,
} from '../../services/simulationEngine';

interface MoreCapabilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInstitution: CampusInstitution;
  setSelectedInstitution: (inst: CampusInstitution) => void;
  activeEvent: SimulationEvent;
  setActiveEvent: (event: SimulationEvent) => void;
  onOpenReportModal: () => void;
  onOpenAnalytics: () => void;
  onOpenKnowledgeGraph: () => void;
}

export function MoreCapabilitiesModal({
  isOpen,
  onClose,
  selectedInstitution,
  setSelectedInstitution,
  activeEvent,
  setActiveEvent,
  onOpenReportModal,
  onOpenAnalytics,
  onOpenKnowledgeGraph,
}: MoreCapabilitiesModalProps) {
  const [activeTab, setActiveTab] = useState<'SIMULATION' | 'TELEMETRY' | 'EVENTS' | 'TOOLS'>('SIMULATION');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 text-xs">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Advanced Spatial Capabilities & Simulation
            </h3>
            <p className="text-[11px] text-slate-400">
              Secondary tools kept off the primary map to maintain clean focus.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('SIMULATION')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
              activeTab === 'SIMULATION' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Institutions
          </button>
          <button
            onClick={() => setActiveTab('TELEMETRY')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
              activeTab === 'TELEMETRY' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lab Telemetry
          </button>
          <button
            onClick={() => setActiveTab('EVENTS')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
              activeTab === 'EVENTS' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Spatial Events
          </button>
          <button
            onClick={() => setActiveTab('TOOLS')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
              activeTab === 'TOOLS' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Diagnostics
          </button>
        </div>

        {/* Tab 1: Multi-Institution Simulation */}
        {activeTab === 'SIMULATION' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-300">
              Demonstrates future capability of monitoring multiple campuses. Simulated institutions generate live building telemetry.
            </div>

            <div className="grid grid-cols-1 gap-2">
              {CAMPUS_INSTITUTIONS.map((inst) => (
                <div
                  key={inst.id}
                  onClick={() => setSelectedInstitution(inst)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedInstitution.id === inst.id
                      ? 'bg-cyan-500/15 border-cyan-500 text-white'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">{inst.name}</span>
                      {inst.isSimulated && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          SIMULATED DATA
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{inst.activeBuilding}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span>Occ: {inst.stats.occupancyPercent}%</span>
                    <span>Labs: {inst.stats.activeLabs}</span>
                    {selectedInstitution.id === inst.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Simulated Lab Telemetry */}
        {activeTab === 'TELEMETRY' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
              <span>IoT & IT Telemetry Simulation:</span>
              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Simulated Lab Telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {Object.values(LAB_TELEMETRY).map((lab) => (
                <div key={lab.labId} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-xs">{lab.labName}</span>
                      <span className="text-[10px] text-slate-400 block">{lab.floor}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ● {lab.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Workstations</span>
                      <strong className="text-white">{lab.systemsOnline}/{lab.totalSystems}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">CPU Load</span>
                      <strong className="text-cyan-400">{lab.cpuLoadPercent}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Temperature</span>
                      <strong className="text-amber-300">{lab.temperatureC}°C</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Bandwidth</span>
                      <strong className="text-emerald-400">{lab.networkThroughputMbps} Mbps</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Spatial Events & Dynamic Re-routing */}
        {activeTab === 'EVENTS' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
              Trigger dynamic spatial events to demonstrate how the A* indoor navigation graph re-routes around physical bottlenecks in real time.
            </div>

            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(SPATIAL_EVENTS) as SimulationEvent[]).map((evtKey) => {
                const evt = SPATIAL_EVENTS[evtKey];
                const isActive = activeEvent === evtKey;
                return (
                  <div
                    key={evtKey}
                    onClick={() => setActiveEvent(evtKey)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{evt.title}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                            evt.severity === 'ALERT'
                              ? 'bg-rose-500/20 text-rose-300'
                              : evt.severity === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {evt.severity}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{evt.description}</p>
                    </div>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Diagnostics & Enterprise Tools */}
        {activeTab === 'TOOLS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              onClick={() => {
                onClose();
                onOpenAnalytics();
              }}
              className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/60 cursor-pointer transition-all"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400 mb-1" />
              <h4 className="font-bold text-white text-xs">Campus Analytics</h4>
              <p className="text-[10px] text-slate-400">Space utilization curves & facility metrics</p>
            </div>

            <div
              onClick={() => {
                onClose();
                onOpenKnowledgeGraph();
              }}
              className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/60 cursor-pointer transition-all"
            >
              <Network className="w-4 h-4 text-purple-400 mb-1" />
              <h4 className="font-bold text-white text-xs">Knowledge Graph</h4>
              <p className="text-[10px] text-slate-400">Multi-relational spatial ontology graph</p>
            </div>

            <div
              onClick={() => {
                onClose();
                onOpenReportModal();
              }}
              className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/60 cursor-pointer transition-all sm:col-span-2"
            >
              <Wrench className="w-4 h-4 text-amber-400 mb-1" />
              <h4 className="font-bold text-white text-xs">Maintenance & Incident Reporting</h4>
              <p className="text-[10px] text-slate-400">Create maintenance tickets tied to spatial entities</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
