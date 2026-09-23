import { create } from 'zustand';
import { Campus, Floor, Waypoint } from '@spatial/types';
import {
  ExtendedBuilding,
  ExtendedRoom,
  EquipmentItem,
  SafetyNode,
  EXTENDED_BUILDINGS,
  EXTENDED_ROOMS,
  EXTENDED_EQUIPMENT,
  SAFETY_NODES,
} from '../services/campusData.service';

export type ViewMode = 'DIGITAL_TWIN' | 'ANALYTICS' | 'KNOWLEDGE_GRAPH' | 'SAFETY' | 'MAINTENANCE';
export type MapPerspective = '2D' | '2.5D_ISOMETRIC' | '3D_TILT';
export type UserRole = 'STUDENT' | 'FACULTY' | 'MAINTENANCE_STAFF' | 'CAMPUS_ADMIN';

export interface SpatialLayers {
  buildings: boolean;
  rooms: boolean;
  navigation: boolean;
  peopleDensity: boolean;
  wifiCoverage: boolean;
  cctvCoverage: boolean;
  energyConsumption: boolean;
  airQuality: boolean;
  equipment: boolean;
  accessibility: boolean;
  fireSafety: boolean;
  parking: boolean;
}

export interface ActiveRoute {
  originName: string;
  destinationName: string;
  totalDistanceMeters: number;
  estimatedMinutes: number;
  waypoints: Waypoint[];
  accessible: boolean;
  reasoning?: string;
  steps?: {
    instruction: string;
    distance: string;
    level: string;
    type: 'WALK' | 'STAIR' | 'ELEVATOR' | 'DOOR';
  }[];
}

export type SelectedEntity =
  | { type: 'ROOM'; data: ExtendedRoom }
  | { type: 'BUILDING'; data: ExtendedBuilding }
  | { type: 'EQUIPMENT'; data: EquipmentItem }
  | { type: 'SAFETY'; data: SafetyNode }
  | null;

interface SpatialState {
  // Navigation & View Mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Perspective & Camera Controls
  perspective: MapPerspective;
  setPerspective: (perspective: MapPerspective) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number }) => void;
  resetCamera: () => void;

  // User Context
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Data Collections
  campuses: Campus[];
  buildings: ExtendedBuilding[];
  rooms: ExtendedRoom[];
  equipment: EquipmentItem[];
  safetyNodes: SafetyNode[];

  // Active Selections
  activeCampusId: string;
  activeBuildingId: string;
  activeFloorNumber: number;
  selectedEntity: SelectedEntity;
  highlightedEntityId: string | null;
  activeRoute: ActiveRoute | null;
  selectedBuildingView: boolean; // true = building interior floorplan, false = campus macro view

  // Spatial GIS Layers
  layers: SpatialLayers;
  toggleLayer: (layerName: keyof SpatialLayers) => void;
  setLayers: (layers: Partial<SpatialLayers>) => void;

  // Live Campus Metrics Counters
  liveTelemetry: {
    totalOccupants: number;
    activeRooms: number;
    onlineBuildings: number;
    maintenanceAlerts: number;
    equipmentWarnings: number;
    safetyAlerts: number;
  };

  // Demo Runner State
  isDemoRunning: boolean;
  demoStepIndex: number;
  setDemoRunning: (running: boolean) => void;
  setDemoStepIndex: (index: number) => void;

  // Actions
  setActiveCampusId: (id: string) => void;
  setActiveBuildingId: (id: string) => void;
  setActiveFloorNumber: (floorNum: number) => void;
  setSelectedEntity: (entity: SelectedEntity) => void;
  setSelectedRoom: (room: ExtendedRoom | null) => void;
  setHighlightedEntityId: (id: string | null) => void;
  setActiveRoute: (route: ActiveRoute | null) => void;
  setSelectedBuildingView: (interior: boolean) => void;
}

export const useSpatialStore = create<SpatialState>((set, get) => ({
  viewMode: 'DIGITAL_TWIN',
  setViewMode: (mode) => {
    set({ viewMode: mode });
    if (mode === 'SAFETY') {
      get().setLayers({ fireSafety: true, navigation: true, peopleDensity: false });
    }
  },

  perspective: '2.5D_ISOMETRIC',
  setPerspective: (perspective) => set({ perspective }),
  zoomLevel: 1,
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.6, Math.min(2.2, zoom)) }),
  panOffset: { x: 0, y: 0 },
  setPanOffset: (panOffset) => set({ panOffset }),
  resetCamera: () => set({ zoomLevel: 1, panOffset: { x: 0, y: 0 }, perspective: '2.5D_ISOMETRIC' }),

  userRole: 'STUDENT',
  setUserRole: (userRole) => set({ userRole }),

  campuses: [
    {
      id: 'c-main-001',
      organizationId: 'org-nit-001',
      name: 'Main Technology Campus',
      code: 'MAIN',
      centerCoordinates: { latitude: 12.9716, longitude: 77.5946 },
    },
  ],
  buildings: EXTENDED_BUILDINGS,
  rooms: EXTENDED_ROOMS,
  equipment: EXTENDED_EQUIPMENT,
  safetyNodes: SAFETY_NODES,

  activeCampusId: 'c-main-001',
  activeBuildingId: 'b-cse-001',
  activeFloorNumber: 2,
  selectedBuildingView: true,

  selectedEntity: {
    type: 'ROOM',
    data: EXTENDED_ROOMS[0], // Room 204
  },
  highlightedEntityId: 'r-204',
  activeRoute: null,

  layers: {
    buildings: true,
    rooms: true,
    navigation: true,
    peopleDensity: false,
    wifiCoverage: false,
    cctvCoverage: false,
    energyConsumption: false,
    airQuality: false,
    equipment: true,
    accessibility: false,
    fireSafety: false,
    parking: true,
  },

  toggleLayer: (layerName) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layerName]: !state.layers[layerName],
      },
    })),

  setLayers: (layerUpdates) =>
    set((state) => ({
      layers: {
        ...state.layers,
        ...layerUpdates,
      },
    })),

  liveTelemetry: {
    totalOccupants: 1240,
    activeRooms: 84,
    onlineBuildings: 12,
    maintenanceAlerts: 18,
    equipmentWarnings: 4,
    safetyAlerts: 2,
  },

  isDemoRunning: false,
  demoStepIndex: 0,
  setDemoRunning: (isDemoRunning) => set({ isDemoRunning }),
  setDemoStepIndex: (demoStepIndex) => set({ demoStepIndex }),

  setActiveCampusId: (id) => set({ activeCampusId: id }),
  setActiveBuildingId: (id) => {
    const building = get().buildings.find((b) => b.id === id);
    set({
      activeBuildingId: id,
      selectedBuildingView: true,
      selectedEntity: building ? { type: 'BUILDING', data: building } : null,
    });
  },
  setActiveFloorNumber: (floorNum) => set({ activeFloorNumber: floorNum }),
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  setSelectedRoom: (room) =>
    set({
      selectedEntity: room ? { type: 'ROOM', data: room } : null,
      highlightedEntityId: room ? room.id : null,
    }),
  setHighlightedEntityId: (id) => set({ highlightedEntityId: id }),
  setActiveRoute: (route) => set({ activeRoute: route }),
  setSelectedBuildingView: (interior) => set({ selectedBuildingView: interior }),
}));
