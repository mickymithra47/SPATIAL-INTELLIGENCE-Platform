'use client';

import React, { useState } from 'react';
import { useSpatialStore } from '../../stores/useSpatialStore';
import { Network, X, ArrowRight, Compass, Sparkles, Building, Cpu, User, BookOpen } from 'lucide-react';

interface KnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GraphNode {
  id: string;
  label: string;
  category: 'STUDENT' | 'CLASS' | 'FACULTY' | 'ROOM' | 'BUILDING' | 'EQUIPMENT' | 'DEPARTMENT';
  x: number;
  y: number;
  color: string;
  metadata?: any;
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export function KnowledgeGraphModal({ isOpen, onClose }: KnowledgeGraphModalProps) {
  const { setSelectedRoom, setActiveFloorNumber, setActiveBuildingId, setSelectedBuildingView, rooms } =
    useSpatialStore();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  if (!isOpen) return null;

  const nodes: GraphNode[] = [
    { id: 'usr-alex', label: 'Alex Mercer (Student)', category: 'STUDENT', x: 120, y: 220, color: '#38bdf8' },
    { id: 'cls-cs602', label: 'CS602: Deep Learning', category: 'CLASS', x: 280, y: 150, color: '#818cf8' },
    { id: 'fac-reed', label: 'Dr. Evelyn Reed (Faculty)', category: 'FACULTY', x: 280, y: 310, color: '#c084fc' },
    { id: 'dep-ai', label: 'AI & Data Science Dept', category: 'DEPARTMENT', x: 440, y: 310, color: '#f472b6' },
    { id: 'rm-204', label: 'AI & Robotics Lab 204', category: 'ROOM', x: 480, y: 150, color: '#06b6d4' },
    { id: 'bld-b', label: 'Block B (CSE Complex)', category: 'BUILDING', x: 680, y: 150, color: '#3b82f6' },
    { id: 'eq-robot', label: 'UR5e 6-Axis Robot Arm', category: 'EQUIPMENT', x: 480, y: 50, color: '#10b981' },
    { id: 'eq-proj', label: 'Optoma 4K Laser (P-204)', category: 'EQUIPMENT', x: 680, y: 50, color: '#f59e0b' },
  ];

  const edges: GraphEdge[] = [
    { from: 'usr-alex', to: 'cls-cs602', label: 'enrolled in' },
    { from: 'fac-reed', to: 'cls-cs602', label: 'instructs' },
    { from: 'fac-reed', to: 'dep-ai', label: 'belongs to' },
    { from: 'cls-cs602', to: 'rm-204', label: 'scheduled in' },
    { from: 'rm-204', to: 'bld-b', label: 'located within' },
    { from: 'rm-204', to: 'eq-robot', label: 'houses' },
    { from: 'rm-204', to: 'eq-proj', label: 'equipped with' },
    { from: 'dep-ai', to: 'bld-b', label: 'headquartered at' },
  ];

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (node.category === 'ROOM' || node.id === 'rm-204') {
      const room = rooms.find((r) => r.id === 'r-204');
      if (room) {
        setSelectedRoom(room);
        setActiveFloorNumber(2);
        setActiveBuildingId('b-cse-001');
        setSelectedBuildingView(true);
      }
      onClose();
    } else if (node.category === 'BUILDING') {
      setActiveBuildingId('b-cse-001');
      setSelectedBuildingView(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Campus Spatial Knowledge Graph
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Ontology v2.4
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Interactive Multi-Relational Entity Map. Click any node to focus its physical digital twin location.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Graph Canvas */}
        <div className="relative flex-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden min-h-[420px] flex items-center justify-center">
          <svg className="w-full h-full max-w-4xl" viewBox="0 0 850 400">
            {/* Edges */}
            {edges.map((e, idx) => {
              const source = nodes.find((n) => n.id === e.from);
              const target = nodes.find((n) => n.id === e.to);
              if (!source || !target) return null;

              const midX = (source.x + target.x) / 2;
              const midY = (source.y + target.y) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#334155"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="opacity-70"
                  />
                  <rect
                    x={midX - 25}
                    y={midY - 8}
                    width="50"
                    height="16"
                    rx="4"
                    fill="#0f172a"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text x={midX} y={midY + 3} fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">
                    {e.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => handleNodeClick(node)}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? '24' : '18'}
                    fill={node.color}
                    fillOpacity="0.25"
                    stroke={node.color}
                    strokeWidth={isSelected ? '3' : '1.5'}
                    className="transition-all duration-200 group-hover:scale-125"
                  />
                  <circle cx="0" cy="0" r="7" fill={node.color} />
                  <text
                    x="0"
                    y="32"
                    fill="#e2e8f0"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                    className="group-hover:fill-cyan-300"
                  >
                    {node.label}
                  </text>
                  <text x="0" y="44" fill="#64748b" fontSize="9" textAnchor="middle">
                    {node.category}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Helper Badge */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            Tip: Click on <span className="text-cyan-400 font-bold">"AI & Robotics Lab 204"</span> to instantly zoom into
            its 2.5D Digital Twin
          </div>
        </div>
      </div>
    </div>
  );
}
