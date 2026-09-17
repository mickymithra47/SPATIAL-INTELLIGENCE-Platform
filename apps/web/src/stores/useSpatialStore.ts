import { create } from 'zustand';
import { Campus, Building, Floor, Room, Waypoint } from '@spatial/types';

export interface ActiveRoute {
  originName: string;
  destinationName: string;
  totalDistanceMeters: number;
  estimatedMinutes: number;
  waypoints: Waypoint[];
}

interface SpatialState {
  campuses: Campus[];
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];

  activeCampusId: string;
  activeBuildingId: string;
  activeFloorNumber: number;
  selectedRoom: Room | null;
  highlightedEntityId: string | null;
  activeRoute: ActiveRoute | null;

  setActiveCampusId: (id: string) => void;
  setActiveBuildingId: (id: string) => void;
  setActiveFloorNumber: (floorNum: number) => void;
  setSelectedRoom: (room: Room | null) => void;
  setHighlightedEntityId: (id: string | null) => void;
  setActiveRoute: (route: ActiveRoute | null) => void;
}

export const useSpatialStore = create<SpatialState>((set) => ({
  campuses: [
    {
      id: 'c-main-001',
      organizationId: 'org-nit-001',
      name: 'Main Technology Campus',
      code: 'MAIN',
      centerCoordinates: { latitude: 12.9716, longitude: 77.5946 },
    },
  ],
  buildings: [
    {
      id: 'b-cse-001',
      campusId: 'c-main-001',
      name: 'Computer Science & AI Block B',
      code: 'BLOCK_B',
      totalFloors: 3,
    },
    {
      id: 'b-admin-002',
      campusId: 'c-main-001',
      name: 'Central Administration & Library',
      code: 'BLOCK_A',
      totalFloors: 2,
    },
  ],
  floors: [
    {
      id: 'fl-b-01',
      buildingId: 'b-cse-001',
      floorNumber: 1,
      name: 'Ground Floor',
      elevationMeters: 0,
    },
    {
      id: 'fl-b-02',
      buildingId: 'b-cse-001',
      floorNumber: 2,
      name: 'Second Floor',
      elevationMeters: 4.5,
    },
  ],
  rooms: [
    {
      id: 'r-101',
      floorId: 'fl-b-01',
      roomNumber: '101',
      name: 'Lecture Hall 101',
      roomType: 'CLASSROOM',
      capacity: 60,
      isAccessible: true,
    },
    {
      id: 'r-102',
      floorId: 'fl-b-01',
      roomNumber: '102',
      name: 'Computing Systems Lab 102',
      roomType: 'COMPUTER_LAB',
      capacity: 40,
      isAccessible: true,
    },
    {
      id: 'r-201',
      floorId: 'fl-b-02',
      roomNumber: '201',
      name: 'Seminar Hall 201',
      roomType: 'CLASSROOM',
      capacity: 90,
      isAccessible: true,
    },
    {
      id: 'r-202',
      floorId: 'fl-b-02',
      roomNumber: '202',
      name: 'Faculty Room 202',
      roomType: 'FACULTY_OFFICE',
      capacity: 15,
      isAccessible: true,
    },
    {
      id: 'r-204',
      floorId: 'fl-b-02',
      roomNumber: '204',
      name: 'AI & Robotics Lab 204',
      roomType: 'RESEARCH_LAB',
      capacity: 40,
      isAccessible: true,
    },
  ],

  activeCampusId: 'c-main-001',
  activeBuildingId: 'b-cse-001',
  activeFloorNumber: 2,
  selectedRoom: {
    id: 'r-204',
    floorId: 'fl-b-02',
    roomNumber: '204',
    name: 'AI & Robotics Lab 204',
    roomType: 'RESEARCH_LAB',
    capacity: 40,
    isAccessible: true,
  },
  highlightedEntityId: 'r-204',
  activeRoute: null,

  setActiveCampusId: (id) => set({ activeCampusId: id }),
  setActiveBuildingId: (id) => set({ activeBuildingId: id }),
  setActiveFloorNumber: (floorNum) => set({ activeFloorNumber: floorNum }),
  setSelectedRoom: (room) => set({ selectedRoom: room }),
  setHighlightedEntityId: (id) => set({ highlightedEntityId: id }),
  setActiveRoute: (route) => set({ activeRoute: route }),
}));
