'use client';

import React from 'react';
import { useSpatialStore } from '../../stores/useSpatialStore';
import { useAIChatStore } from '../../stores/useAIChatStore';
import {
  Compass,
  Navigation,
  Wrench,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Building,
  Thermometer,
  Wind,
  Droplets,
  Cpu,
  ShieldCheck,
  Zap,
  Users,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { CLASS_TIMETABLE } from '../../services/campusData.service';

interface ContextInspectorProps {
  onOpenReportModal: () => void;
}

export function ContextInspector({ onOpenReportModal }: ContextInspectorProps) {
  const { selectedEntity, setSelectedEntity, setActiveRoute, setActiveFloorNumber, setSelectedBuildingView } =
    useSpatialStore();
  const { sendMessage } = useAIChatStore();

  if (!selectedEntity) return null;

  return (
    <div className="w-full lg:w-80 bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 transition-all animate-in fade-in slide-in-from-right-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          {selectedEntity.type === 'ROOM'
            ? 'Room Inspector'
            : selectedEntity.type === 'BUILDING'
            ? 'Building Intelligence'
            : selectedEntity.type === 'EQUIPMENT'
            ? 'Equipment Telemetry'
            : 'Safety Asset'}
        </span>
        <button
          onClick={() => setSelectedEntity(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* TYPE 1: ROOM INSPECTOR */}
      {/* ========================================================= */}
      {selectedEntity.type === 'ROOM' && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-400">
                Room {selectedEntity.data.roomNumber} • Level {selectedEntity.data.floorNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                  selectedEntity.data.operationalStatus === 'OCCUPIED'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {selectedEntity.data.operationalStatus}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">{selectedEntity.data.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{selectedEntity.data.department}</p>
          </div>

          {/* Occupancy Progress Bar */}
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Current Occupancy
              </span>
              <span className="text-white font-bold">
                {selectedEntity.data.currentOccupancy} / {selectedEntity.data.capacity}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                style={{
                  width: `${(selectedEntity.data.currentOccupancy / selectedEntity.data.capacity) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Environmental Sensors Micro-Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl flex flex-col items-center text-center">
              <Thermometer className="w-3.5 h-3.5 text-rose-400 mb-1" />
              <span className="text-xs font-bold text-slate-100">{selectedEntity.data.environmental.temperatureC}°C</span>
              <span className="text-[9px] text-slate-500 uppercase">Temp</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl flex flex-col items-center text-center">
              <Wind className="w-3.5 h-3.5 text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-slate-100">{selectedEntity.data.environmental.co2Ppm} ppm</span>
              <span className="text-[9px] text-slate-500 uppercase">CO2 / AQI</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl flex flex-col items-center text-center">
              <Droplets className="w-3.5 h-3.5 text-cyan-400 mb-1" />
              <span className="text-xs font-bold text-slate-100">{selectedEntity.data.environmental.humidityPercent}%</span>
              <span className="text-[9px] text-slate-500 uppercase">Humidity</span>
            </div>
          </div>

          {/* Upcoming Class Schedule */}
          {(() => {
            const classSession = CLASS_TIMETABLE.find(
              (c) => c.roomId === selectedEntity.data.id || c.roomNumber === selectedEntity.data.roomNumber
            );
            if (!classSession) return null;

            return (
              <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" /> Scheduled Class
                </div>
                <div className="text-xs font-bold text-white">{classSession.className}</div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  {classSession.facultyName} • {classSession.day} {classSession.startTime} - {classSession.endTime}
                </div>
              </div>
            );
          })()}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setActiveRoute({
                  originName: 'Lecture Hall 101',
                  destinationName: selectedEntity.data.name,
                  totalDistanceMeters: 54,
                  estimatedMinutes: 1.8,
                  waypoints: [],
                  accessible: true,
                  reasoning: 'Shortest indoor accessible corridor via elevator',
                });
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Navigation className="w-3.5 h-3.5" /> Navigate to Room
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => sendMessage(`Is ${selectedEntity.data.name} available for study reservation?`)}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
              >
                Reserve Slot
              </button>
              <button
                onClick={onOpenReportModal}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-medium transition-colors"
              >
                <Wrench className="w-3.5 h-3.5" /> Report Issue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TYPE 2: BUILDING INTELLIGENCE */}
      {/* ========================================================= */}
      {selectedEntity.type === 'BUILDING' && (
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-[11px] font-semibold text-cyan-400">{selectedEntity.data.code}</span>
            <h3 className="text-base font-bold text-white tracking-tight">{selectedEntity.data.name}</h3>
            <p className="text-xs text-slate-400">{selectedEntity.data.sqMeters} m² Gross Area</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400">Total Floors</span>
              <div className="text-lg font-bold text-white mt-0.5">{selectedEntity.data.floorsCount} Levels</div>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400">Active Rooms</span>
              <div className="text-lg font-bold text-white mt-0.5">{selectedEntity.data.roomsCount} Rooms</div>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400">Occupancy</span>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{selectedEntity.data.currentOccupancyPercent}%</div>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400">Energy Draw</span>
              <div className="text-lg font-bold text-cyan-400 mt-0.5">{selectedEntity.data.energyConsumptionKwh} kWh</div>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedBuildingView(true);
              setActiveFloorNumber(2);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-all"
          >
            Explore Floorplan Interior <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TYPE 3: SAFETY NODE */}
      {/* ========================================================= */}
      {selectedEntity.type === 'SAFETY' && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-rose-500/20 text-rose-400 text-xs font-bold">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-rose-400">{selectedEntity.data.type}</span>
            </div>
            <h3 className="text-base font-bold text-white">{selectedEntity.data.label}</h3>
            <p className="text-xs text-slate-400 mt-1">{selectedEntity.data.location}</p>
          </div>

          <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-xs text-rose-200">
            <span className="font-bold">Status:</span> {selectedEntity.data.status} • Regular inspection verified.
          </div>

          <button
            onClick={() => {
              setActiveRoute({
                originName: 'Your Location',
                destinationName: selectedEntity.data.label,
                totalDistanceMeters: 40,
                estimatedMinutes: 0.6,
                waypoints: [],
                accessible: true,
                reasoning: 'Emergency evacuation direct line to safe exit',
              });
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-500/20 transition-all"
          >
            <Navigation className="w-3.5 h-3.5" /> Emergency Evacuation Path
          </button>
        </div>
      )}
    </div>
  );
}
