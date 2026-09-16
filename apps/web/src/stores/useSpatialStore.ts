import { create } from 'zustand';
import { Campus, Building, Floor, Room } from '@spatial/types';

interface SpatialState {
  activeCampus: Campus | null;
  activeBuilding: Building | null;
  activeFloor: Floor | null;
  selectedRoom: Room | null;
  highlightedEntityId: string | null;

  setActiveCampus: (campus: Campus | null) => void;
  setActiveBuilding: (building: Building | null) => void;
  setActiveFloor: (floor: Floor | null) => void;
  setSelectedRoom: (room: Room | null) => void;
  setHighlightedEntityId: (id: string | null) => void;
}

export const useSpatialStore = create<SpatialState>((set) => ({
  activeCampus: null,
  activeBuilding: null,
  activeFloor: null,
  selectedRoom: null,
  highlightedEntityId: null,

  setActiveCampus: (campus) => set({ activeCampus: campus }),
  setActiveBuilding: (building) => set({ activeBuilding: building }),
  setActiveFloor: (floor) => set({ activeFloor: floor }),
  setSelectedRoom: (room) => set({ selectedRoom: room }),
  setHighlightedEntityId: (id) => set({ highlightedEntityId: id }),
}));
