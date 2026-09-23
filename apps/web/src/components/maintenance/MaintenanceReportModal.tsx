'use client';

import React, { useState, useEffect } from 'react';
import { useSpatialStore } from '../../stores/useSpatialStore';
import { useAIChatStore } from '../../stores/useAIChatStore';
import { AlertTriangle, X, CheckCircle2, Send, Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function MaintenanceReportModal({ isOpen, onClose }: Props) {
  const { selectedEntity, rooms } = useSpatialStore();
  const { sendMessage } = useAIChatStore();

  const [roomId, setRoomId] = useState('r-204');
  const [category, setCategory] = useState('Equipment');
  const [assetName, setAssetName] = useState('P-204 (Ceiling Projector)');
  const [issueSummary, setIssueSummary] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (selectedEntity && selectedEntity.type === 'ROOM') {
      setRoomId(selectedEntity.data.id);
      setAssetName(`${selectedEntity.data.name} Facility`);
    }
  }, [selectedEntity, isOpen]);

  if (!isOpen) return null;

  const categories = [
    'Electrical',
    'Network',
    'Furniture',
    'Equipment',
    'HVAC',
    'Water',
    'Safety',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueSummary.trim()) return;

    const targetRoom = rooms.find((r) => r.id === roomId) || rooms[0];
    const prompt = `Create a maintenance ticket for [${category}] ${assetName} in Room ${targetRoom?.roomNumber || '204'}: ${issueSummary} (Priority: ${priority})`;
    sendMessage(prompt);

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Ticket Dispatched</h3>
            <p className="text-xs text-slate-400">
              Your maintenance ticket has been registered in the spatial operations ledger and assigned to facilities technicians.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Report Campus Facility Incident</h3>
                <p className="text-[11px] text-slate-400">Spatially mapped to current room location</p>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Issue Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      category === cat
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Target Room Location
                </label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} ({r.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Affected Equipment
                </label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g. Laser Projector, RTX Node #02"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Observed Issue Description
              </label>
              <textarea
                value={issueSummary}
                onChange={(e) => setIssueSummary(e.target.value)}
                placeholder="Describe the failure, error codes, physical damage, or unusual telemetry..."
                rows={3}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['LOW', 'MEDIUM', 'HIGH'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      priority === lvl
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!issueSummary.trim()}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Send className="w-3.5 h-3.5" /> Submit Ticket
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
