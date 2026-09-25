'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FloorLevel,
  CampusRoomEntity,
  ALL_CAMPUS_ENTITIES,
  CAMPUS_INSTITUTIONS,
  CampusInstitution,
} from '../../services/campusMultiFloorData';
import {
  Building2,
  ChevronDown,
  Search,
  Layers,
  Sparkles,
  Play,
  Check,
  X,
  Compass,
  Boxes,
} from 'lucide-react';

interface CleanTopBarProps {
  perspective: '2D' | '2.5D_ISOMETRIC' | '3D_TILT';
  setPerspective: (p: '2D' | '2.5D_ISOMETRIC' | '3D_TILT') => void;
  activeFloor: FloorLevel;
  setActiveFloor: (floor: FloorLevel) => void;
  selectedInstitution: CampusInstitution;
  setSelectedInstitution: (inst: CampusInstitution) => void;
  onSelectEntity: (entity: CampusRoomEntity) => void;
  onStartDemo: () => void;
  showSpatialNodes: boolean;
  setShowSpatialNodes: (show: boolean) => void;
  viewAllFloorsStacked: boolean;
  setViewAllFloorsStacked: (stacked: boolean) => void;
  onOpenMore: () => void;
}

export function CleanTopBar({
  perspective,
  setPerspective,
  activeFloor,
  setActiveFloor,
  selectedInstitution,
  setSelectedInstitution,
  onSelectEntity,
  onStartDemo,
  showSpatialNodes,
  setShowSpatialNodes,
  viewAllFloorsStacked,
  setViewAllFloorsStacked,
  onOpenMore,
}: CleanTopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isInstitutionDropdownOpen, setIsInstitutionDropdownOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const instRef = useRef<HTMLDivElement>(null);

  const floors: { label: string; value: FloorLevel }[] = [
    { label: 'Ground', value: 'GROUND' },
    { label: '1st', value: 'FIRST' },
    { label: '2nd', value: 'SECOND' },
    { label: 'Terrace', value: 'TERRACE' },
  ];

  const filteredEntities = searchQuery.trim()
    ? ALL_CAMPUS_ENTITIES.filter(
        (e) =>
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (layersRef.current && !layersRef.current.contains(e.target as Node)) {
        setIsLayersOpen(false);
      }
      if (instRef.current && !instRef.current.contains(e.target as Node)) {
        setIsInstitutionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full h-14 bg-slate-950 border-b border-slate-800/80 px-3 md:px-5 flex items-center justify-between z-30 select-none text-xs">
      {/* Left: Institution Selector & Campus Badge */}
      <div className="flex items-center gap-3">
        {/* Brand Icon */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
            SI
          </div>

          {/* Institution Dropdown */}
          <div ref={instRef} className="relative">
            <button
              onClick={() => setIsInstitutionDropdownOpen(!isInstitutionDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-200 transition-colors"
            >
              <span className="font-bold text-white tracking-wide truncate max-w-[140px] md:max-w-none">
                {selectedInstitution?.code || 'ESEC'} CAMPUS
              </span>
              {selectedInstitution?.isSimulated && (
                <span className="text-[9px] font-mono px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 hidden sm:inline">
                  SIMULATED
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isInstitutionDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50">
                <span className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider block">
                  Select Environment
                </span>
                {CAMPUS_INSTITUTIONS.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => {
                      setSelectedInstitution(inst);
                      setIsInstitutionDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{inst.name}</span>
                        {inst.isSimulated && (
                          <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-300">
                            SIM
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{inst.activeBuilding}</span>
                    </div>
                    {selectedInstitution.id === inst.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        {/* Compact Floor Selector: [ Ground ] [ 1st ] [ 2nd ] [ Terrace ] */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          {floors.map((fl) => (
            <button
              key={fl.value}
              onClick={() => setActiveFloor(fl.value)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeFloor === fl.value
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {fl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center: 2D / 2.5D / 3D Mode Switcher */}
      <div className="flex items-center gap-1">
        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setPerspective('2D')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              perspective === '2D' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => setPerspective('2.5D_ISOMETRIC')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              perspective === '2.5D_ISOMETRIC' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            2.5D
          </button>
          <button
            onClick={() => setPerspective('3D_TILT')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              perspective === '3D_TILT' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D
          </button>
        </div>

        {perspective === '3D_TILT' && (
          <button
            onClick={() => setViewAllFloorsStacked(!viewAllFloorsStacked)}
            className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all hidden md:flex items-center gap-1 ${
              viewAllFloorsStacked
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Stack all 4 floors in 3D"
          >
            <Boxes className="w-3 h-3" />
            <span>Stacked</span>
          </button>
        )}
      </div>

      {/* Right: Search, Layers, Demo Mode, More */}
      <div className="flex items-center gap-2">
        {/* Global Spatial Search */}
        <div ref={searchRef} className="relative hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Search room, lab, floor..."
              className="bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-1 text-xs text-white placeholder-slate-500 w-44 lg:w-56 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 text-slate-500">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {isSearchOpen && filteredEntities.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              {filteredEntities.map((ent) => (
                <div
                  key={ent.id}
                  onClick={() => {
                    setActiveFloor(ent.floor);
                    onSelectEntity(ent);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 hover:bg-slate-800 cursor-pointer border-b border-slate-800/60 last:border-0 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white block">{ent.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {ent.floor} Floor • {ent.areaM2} m²
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800 text-cyan-400">
                    {ent.code}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clean Layers Menu (Visualization Toggles ONLY) */}
        <div ref={layersRef} className="relative">
          <button
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
              isLayersOpen ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Layers</span>
          </button>

          {isLayersOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-2.5 z-50 space-y-1.5 text-xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Visualization Layers
              </span>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input type="checkbox" defaultChecked disabled className="rounded text-cyan-500" />
                <span>Rooms & Boundaries</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input type="checkbox" defaultChecked disabled className="rounded text-cyan-500" />
                <span>Corridors & Hubs</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSpatialNodes}
                  onChange={(e) => setShowSpatialNodes(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span>Spatial Graph Nodes</span>
              </label>
            </div>
          )}
        </div>

        {/* Demo Mode Button */}
        <button
          onClick={onStartDemo}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm"
        >
          <Play className="w-3 h-3 fill-current" />
          <span className="hidden sm:inline">Demo</span>
        </button>

        {/* More Menu Button */}
        <button
          onClick={onOpenMore}
          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          More
        </button>
      </div>
    </header>
  );
}
