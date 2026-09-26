import { Campus, Building, Floor, Room, Asset, MaintenanceTicket, Waypoint } from '@spatial/types';

export interface EnvironmentalMetrics {
  temperatureC: number;
  humidityPercent: number;
  co2Ppm: number;
  airQualityStatus: 'OPTIMAL' | 'MODERATE' | 'POOR';
  noiseDb: number;
  energyDrawKw: number;
}

export interface ExtendedRoom extends Room {
  department: string;
  floorNumber: number;
  buildingId: string;
  buildingName: string;
  currentOccupancy: number;
  operationalStatus: 'OPERATIONAL' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  environmental: EnvironmentalMetrics;
  equipmentCount: number;
  safetyRating: 'A' | 'B' | 'C';
  wifiSignalPercent: number;
  cctvCovered: boolean;
  hasEmergencyExit: boolean;
}

export interface ExtendedBuilding extends Building {
  sqMeters: number;
  currentOccupancyPercent: number;
  energyConsumptionKwh: number;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  activeAlertsCount: number;
  floorsCount: number;
  roomsCount: number;
  labsCount: number;
  coordinates: { x: number; y: number; width: number; height: number };
}

export interface EquipmentItem {
  id: string;
  roomId: string;
  roomName: string;
  buildingName: string;
  name: string;
  assetTag: string;
  category: 'ROBOTICS' | 'COMPUTING' | 'OPTICS' | 'FABRICATION' | 'HVAC' | 'POWER';
  healthScore: number; // 0 - 100
  usagePercent: number;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'WARNING' | 'CRITICAL';
  lastServiced: string;
  nextScheduledService: string;
  powerWatts: number;
  assignedTechnician?: string;
}

export interface SafetyNode {
  id: string;
  type: 'EMERGENCY_EXIT' | 'FIRE_EXTINGUISHER' | 'FIRE_ALARM' | 'DEFIBRILLATOR' | 'ASSEMBLY_POINT' | 'FIRST_AID';
  label: string;
  location: string;
  buildingId: string;
  floorNumber: number;
  coords: { x: number; y: number };
  status: 'READY' | 'INSPECTED' | 'WARNING';
}

export interface ClassSession {
  id: string;
  roomId: string;
  roomNumber: string;
  roomName: string;
  classCode: string;
  className: string;
  facultyName: string;
  day: string;
  startTime: string;
  endTime: string;
  studentCount: number;
  department: string;
}

// Rich Campus Data Repository
export const EXTENDED_BUILDINGS: ExtendedBuilding[] = [
  {
    id: 'b-cse-001',
    campusId: 'c-main-001',
    name: 'Computer Science & AI Block B',
    code: 'BLOCK_B',
    totalFloors: 3,
    sqMeters: 8400,
    currentOccupancyPercent: 68,
    energyConsumptionKwh: 142.5,
    status: 'ONLINE',
    activeAlertsCount: 2,
    floorsCount: 3,
    roomsCount: 48,
    labsCount: 12,
    coordinates: { x: 380, y: 150, width: 280, height: 180 },
  },
  {
    id: 'b-admin-002',
    campusId: 'c-main-001',
    name: 'Central Administration & Library',
    code: 'BLOCK_A',
    totalFloors: 2,
    sqMeters: 6200,
    currentOccupancyPercent: 44,
    energyConsumptionKwh: 98.2,
    status: 'ONLINE',
    activeAlertsCount: 0,
    floorsCount: 2,
    roomsCount: 32,
    labsCount: 4,
    coordinates: { x: 80, y: 120, width: 220, height: 160 },
  },
  {
    id: 'b-student-003',
    campusId: 'c-main-001',
    name: 'Student Hub & Innovation Commons',
    code: 'BLOCK_C',
    totalFloors: 2,
    sqMeters: 4800,
    currentOccupancyPercent: 82,
    energyConsumptionKwh: 110.8,
    status: 'ONLINE',
    activeAlertsCount: 1,
    floorsCount: 2,
    roomsCount: 24,
    labsCount: 6,
    coordinates: { x: 180, y: 320, width: 240, height: 140 },
  },
  {
    id: 'b-research-004',
    campusId: 'c-main-001',
    name: 'Advanced Robotics Research Annex',
    code: 'BLOCK_D',
    totalFloors: 1,
    sqMeters: 3100,
    currentOccupancyPercent: 55,
    energyConsumptionKwh: 86.4,
    status: 'ONLINE',
    activeAlertsCount: 0,
    floorsCount: 1,
    roomsCount: 16,
    labsCount: 8,
    coordinates: { x: 480, y: 350, width: 200, height: 120 },
  },
];

export const EXTENDED_ROOMS: ExtendedRoom[] = [
  {
    id: 'GF-COE-01',
    floorId: 'fl-b-01',
    roomNumber: 'COE-01',
    name: 'COE Hall',
    roomType: 'RESEARCH_LAB',
    capacity: 85,
    currentOccupancy: 32,
    operationalStatus: 'OCCUPIED',
    isAccessible: true,
    department: 'Centre of Excellence',
    floorNumber: 0,
    buildingId: 'b-cse-001',
    buildingName: 'Main Block / IT Block',
    equipmentCount: 14,
    safetyRating: 'A',
    wifiSignalPercent: 98,
    cctvCovered: true,
    hasEmergencyExit: true,
    environmental: {
      temperatureC: 22.0,
      humidityPercent: 45,
      co2Ppm: 520,
      airQualityStatus: 'OPTIMAL',
      noiseDb: 38,
      energyDrawKw: 12.5,
    },
  },
  {
    id: 'GF-SEM-01',
    floorId: 'fl-b-01',
    roomNumber: 'SEM-01',
    name: 'Main Block Seminar Hall',
    roomType: 'AUDITORIUM',
    capacity: 160,
    currentOccupancy: 110,
    operationalStatus: 'OCCUPIED',
    isAccessible: true,
    department: 'Main Block Academic Affairs',
    floorNumber: 0,
    buildingId: 'b-cse-001',
    buildingName: 'Main Block / IT Block',
    equipmentCount: 16,
    safetyRating: 'A',
    wifiSignalPercent: 96,
    cctvCovered: true,
    hasEmergencyExit: true,
    environmental: {
      temperatureC: 21.8,
      humidityPercent: 48,
      co2Ppm: 580,
      airQualityStatus: 'OPTIMAL',
      noiseDb: 46,
      energyDrawKw: 18.2,
    },
  },
  {
    id: 'GF-CCTV-01',
    floorId: 'fl-b-01',
    roomNumber: 'CCTV-01',
    name: 'CCTV Monitoring Room',
    roomType: 'ADMIN_OFFICE',
    capacity: 25,
    currentOccupancy: 8,
    operationalStatus: 'OCCUPIED',
    isAccessible: true,
    department: 'Campus Safety & Operations',
    floorNumber: 0,
    buildingId: 'b-cse-001',
    buildingName: 'Main Block / IT Block',
    equipmentCount: 22,
    safetyRating: 'A',
    wifiSignalPercent: 99,
    cctvCovered: true,
    hasEmergencyExit: false,
    environmental: {
      temperatureC: 20.5,
      humidityPercent: 42,
      co2Ppm: 460,
      airQualityStatus: 'OPTIMAL',
      noiseDb: 30,
      energyDrawKw: 24.0,
    },
  },
  {
    id: 'GF-LAD-01',
    floorId: 'fl-b-01',
    roomNumber: 'LAD-01',
    name: 'Ladies Toilet',
    roomType: 'RESTROOM',
    capacity: 15,
    currentOccupancy: 3,
    operationalStatus: 'OPERATIONAL',
    isAccessible: true,
    department: 'Public Amenities',
    floorNumber: 0,
    buildingId: 'b-cse-001',
    buildingName: 'Main Block / IT Block',
    equipmentCount: 6,
    safetyRating: 'A',
    wifiSignalPercent: 88,
    cctvCovered: false,
    hasEmergencyExit: false,
    environmental: {
      temperatureC: 23.0,
      humidityPercent: 52,
      co2Ppm: 600,
      airQualityStatus: 'OPTIMAL',
      noiseDb: 25,
      energyDrawKw: 2.1,
    },
  },
  {
    id: 'GF-GEN-01',
    floorId: 'fl-b-01',
    roomNumber: 'GEN-01',
    name: 'Gents Toilet',
    roomType: 'RESTROOM',
    capacity: 15,
    currentOccupancy: 4,
    operationalStatus: 'OPERATIONAL',
    isAccessible: true,
    department: 'Public Amenities',
    floorNumber: 0,
    buildingId: 'b-cse-001',
    buildingName: 'Main Block / IT Block',
    equipmentCount: 6,
    safetyRating: 'A',
    wifiSignalPercent: 88,
    cctvCovered: false,
    hasEmergencyExit: false,
    environmental: {
      temperatureC: 23.2,
      humidityPercent: 50,
      co2Ppm: 610,
      airQualityStatus: 'OPTIMAL',
      noiseDb: 26,
      energyDrawKw: 2.1,
    },
  },
  {
    id: 'r-204',
    floorId: 'fl-b-02',
    roomNumber: '204',
    name: 'AI & Robotics Lab 204',
    roomType: 'RESEARCH_LAB',
    capacity: 40,
    currentOccupancy: 27,
    operationalStatus: 'OCCUPIED',
    isAccessible: true,
    department: 'Artificial Intelligence',
    floorNumber: 2,
    buildingId: 'b-cse-001',
    buildingName: 'Computer Science & AI Block B',
    equipmentCount: 18,
    safetyRating: 'A',
    wifiSignalPercent: 94,
    cctvCovered: true,
    hasEmergencyExit: false,
    environmental: {
      temperatureC: 22.8,
      humidityPercent: 48,
      co2Ppm: 560,
      airQualityStatus: 'OPTIMAL',
      noiseDb: 42,
      energyDrawKw: 14.8,
    },
  },
  {
    id: 'r-201',
    floorId: 'fl-b-02',
    roomNumber: '201',
    name: 'Seminar Hall 201',
    roomType: 'CLASSROOM',
    capacity: 90,
    currentOccupancy: 0,
    operationalStatus: 'OPERATIONAL',
    isAccessible: true,
    department: 'Computer Science',
    floorNumber: 2,
    buildingId: 'b-cse-001',
    buildingName: 'Computer Science & AI Block B',
    equipmentCount: 6,
    safetyRating: 'A',
    wifiSignalPercent: 88,
    cctvCovered: true,
    hasEmergencyExit: true,
    environmental: {
      temperatureC: 21.5,
      humidityPercent: 45,
      co2Ppm: 480,
      airQualityStatus: 'OPTIMAL',
      noiseDb: 28,
      energyDrawKw: 3.2,
    },
  },
  {
    id: 'r-202',
    floorId: 'fl-b-02',
    roomNumber: '202',
    name: 'Faculty Research Office 202',
    roomType: 'FACULTY_OFFICE',
    capacity: 15,
    currentOccupancy: 8,
    operationalStatus: 'OCCUPIED',
    isAccessible: true,
    department: 'Computer Science',
    floorNumber: 2,
    buildingId: 'b-cse-001',
    buildingName: 'Computer Science & AI Block B',
    equipmentCount: 8,
    safetyRating: 'B',
    wifiSignalPercent: 92,
    cctvCovered: false,
    hasEmergencyExit: false,
    environmental: {
      temperatureC: 23.2,
      humidityPercent: 50,
      co2Ppm: 620,
      airQualityStatus: 'OPTIMAL',
      noiseDb: 35,
      energyDrawKw: 4.1,
    },
  },
  {
    id: 'r-101',
    floorId: 'fl-b-01',
    roomNumber: '101',
    name: 'Lecture Hall 101',
    roomType: 'CLASSROOM',
    capacity: 60,
    currentOccupancy: 54,
    operationalStatus: 'OCCUPIED',
    isAccessible: true,
    department: 'Computer Science',
    floorNumber: 1,
    buildingId: 'b-cse-001',
    buildingName: 'Computer Science & AI Block B',
    equipmentCount: 5,
    safetyRating: 'A',
    wifiSignalPercent: 96,
    cctvCovered: true,
    hasEmergencyExit: true,
    environmental: {
      temperatureC: 24.1,
      humidityPercent: 54,
      co2Ppm: 710,
      airQualityStatus: 'MODERATE',
      noiseDb: 58,
      energyDrawKw: 9.6,
    },
  },
  {
    id: 'r-102',
    floorId: 'fl-b-01',
    roomNumber: '102',
    name: 'Computing Systems Lab 102',
    roomType: 'COMPUTER_LAB',
    capacity: 40,
    currentOccupancy: 36,
    operationalStatus: 'OCCUPIED',
    isAccessible: true,
    department: 'Computer Science',
    floorNumber: 1,
    buildingId: 'b-cse-001',
    buildingName: 'Computer Science & AI Block B',
    equipmentCount: 42,
    safetyRating: 'A',
    wifiSignalPercent: 98,
    cctvCovered: true,
    hasEmergencyExit: true,
    environmental: {
      temperatureC: 22.0,
      humidityPercent: 44,
      co2Ppm: 590,
      airQualityStatus: 'OPTIMAL',
      noiseDb: 52,
      energyDrawKw: 22.4,
    },
  },
  {
    id: 'r-lib-01',
    floorId: 'fl-a-01',
    roomNumber: 'LIB-01',
    name: 'Central Digital Twin & Media Center',
    roomType: 'LIBRARY',
    capacity: 120,
    currentOccupancy: 76,
    operationalStatus: 'OCCUPIED',
    isAccessible: true,
    department: 'Library Services',
    floorNumber: 1,
    buildingId: 'b-admin-002',
    buildingName: 'Central Administration & Library',
    equipmentCount: 24,
    safetyRating: 'A',
    wifiSignalPercent: 99,
    cctvCovered: true,
    hasEmergencyExit: true,
    environmental: {
      temperatureC: 21.0,
      humidityPercent: 46,
      co2Ppm: 510,
      airQualityStatus: 'OPTIMAL',
      noiseDb: 30,
      energyDrawKw: 12.0,
    },
  },
  {
    id: 'r-caf-01',
    floorId: 'fl-c-01',
    roomNumber: 'CAF-01',
    name: 'Campus Dining & Social Commons',
    roomType: 'CAFETERIA',
    capacity: 250,
    currentOccupancy: 205,
    operationalStatus: 'OCCUPIED',
    isAccessible: true,
    department: 'Student Affairs',
    floorNumber: 1,
    buildingId: 'b-student-003',
    buildingName: 'Student Hub & Innovation Commons',
    equipmentCount: 12,
    safetyRating: 'A',
    wifiSignalPercent: 90,
    cctvCovered: true,
    hasEmergencyExit: true,
    environmental: {
      temperatureC: 23.5,
      humidityPercent: 55,
      co2Ppm: 780,
      airQualityStatus: 'MODERATE',
      noiseDb: 68,
      energyDrawKw: 28.5,
    },
  },
];

export const EXTENDED_EQUIPMENT: EquipmentItem[] = [
  {
    id: 'ast-p204',
    roomId: 'r-204',
    roomName: 'AI & Robotics Lab 204',
    buildingName: 'Computer Science & AI Block B',
    assetTag: 'P-204',
    name: 'Optoma 4K Laser Ceiling Projector',
    category: 'OPTICS',
    healthScore: 98,
    usagePercent: 64,
    status: 'OPERATIONAL',
    lastServiced: '2026-08-15',
    nextScheduledService: '2026-11-15',
    powerWatts: 420,
    assignedTechnician: 'Rajesh Kumar',
  },
  {
    id: 'ast-ws-01',
    roomId: 'r-204',
    roomName: 'AI & Robotics Lab 204',
    buildingName: 'Computer Science & AI Block B',
    assetTag: 'WS-204-01',
    name: 'NVIDIA RTX AI Workstation #01',
    category: 'COMPUTING',
    healthScore: 95,
    usagePercent: 88,
    status: 'OPERATIONAL',
    lastServiced: '2026-09-01',
    nextScheduledService: '2026-12-01',
    powerWatts: 750,
    assignedTechnician: 'Rajesh Kumar',
  },
  {
    id: 'ast-ws-02',
    roomId: 'r-204',
    roomName: 'AI & Robotics Lab 204',
    buildingName: 'Computer Science & AI Block B',
    assetTag: 'WS-204-02',
    name: 'NVIDIA RTX AI Workstation #02',
    category: 'COMPUTING',
    healthScore: 42,
    usagePercent: 0,
    status: 'MAINTENANCE',
    lastServiced: '2026-09-10',
    nextScheduledService: '2026-09-24',
    powerWatts: 0,
    assignedTechnician: 'Rajesh Kumar',
  },
  {
    id: 'ast-rob-01',
    roomId: 'r-204',
    roomName: 'AI & Robotics Lab 204',
    buildingName: 'Computer Science & AI Block B',
    assetTag: 'R-ARM-204',
    name: 'Universal Robots UR5e 6-Axis Collaborative Arm',
    category: 'ROBOTICS',
    healthScore: 91,
    usagePercent: 73,
    status: 'OPERATIONAL',
    lastServiced: '2026-08-28',
    nextScheduledService: '2026-11-28',
    powerWatts: 350,
    assignedTechnician: 'Rajesh Kumar',
  },
  {
    id: 'ast-p101',
    roomId: 'r-101',
    roomName: 'Lecture Hall 101',
    buildingName: 'Computer Science & AI Block B',
    assetTag: 'P-101',
    name: 'Epson High-Lumen Auditorium Projector',
    category: 'OPTICS',
    healthScore: 92,
    usagePercent: 80,
    status: 'OPERATIONAL',
    lastServiced: '2026-07-20',
    nextScheduledService: '2026-10-20',
    powerWatts: 580,
  },
];

export const SAFETY_NODES: SafetyNode[] = [
  {
    id: 'sft-exit-01',
    type: 'EMERGENCY_EXIT',
    label: 'Fire Exit Staircase B North',
    location: 'Block B Ground Floor North Wing',
    buildingId: 'b-cse-001',
    floorNumber: 1,
    coords: { x: 40, y: 370 },
    status: 'READY',
  },
  {
    id: 'sft-exit-02',
    type: 'EMERGENCY_EXIT',
    label: 'Fire Exit Staircase B South',
    location: 'Block B Ground Floor South Wing',
    buildingId: 'b-cse-001',
    floorNumber: 1,
    coords: { x: 760, y: 370 },
    status: 'READY',
  },
  {
    id: 'sft-ext-01',
    type: 'FIRE_EXTINGUISHER',
    label: 'CO2 Dry Chemical Fire Extinguisher #12',
    location: 'Adjacent to Room 204 AI Lab',
    buildingId: 'b-cse-001',
    floorNumber: 2,
    coords: { x: 345, y: 170 },
    status: 'INSPECTED',
  },
  {
    id: 'sft-aed-01',
    type: 'DEFIBRILLATOR',
    label: 'Automated External Defibrillator (AED)',
    location: 'Central Corridor Vertical Core Level 2',
    buildingId: 'b-cse-001',
    floorNumber: 2,
    coords: { x: 230, y: 250 },
    status: 'READY',
  },
  {
    id: 'sft-muster-01',
    type: 'ASSEMBLY_POINT',
    label: 'Primary Campus Assembly Lawn (Green Zone A)',
    location: 'Central Lawn between Block A & Block B',
    buildingId: 'b-cse-001',
    floorNumber: 1,
    coords: { x: 350, y: 240 },
    status: 'READY',
  },
];

export const CLASS_TIMETABLE: ClassSession[] = [
  {
    id: 'tt-01',
    roomId: 'r-204',
    roomNumber: '204',
    roomName: 'AI & Robotics Lab 204',
    classCode: 'CS602',
    className: 'Deep Learning & Neural Architectures',
    facultyName: 'Dr. Evelyn Reed',
    day: 'Tuesday',
    startTime: '10:00',
    endTime: '12:00',
    studentCount: 38,
    department: 'Artificial Intelligence',
  },
  {
    id: 'tt-02',
    roomId: 'r-204',
    roomNumber: '204',
    roomName: 'AI & Robotics Lab 204',
    classCode: 'CS704',
    className: 'Robotics Perception & Spatial AI',
    facultyName: 'Prof. Marcus Chen',
    day: 'Wednesday',
    startTime: '14:00',
    endTime: '16:30',
    studentCount: 32,
    department: 'Artificial Intelligence',
  },
  {
    id: 'tt-03',
    roomId: 'r-101',
    roomNumber: '101',
    roomName: 'Lecture Hall 101',
    classCode: 'CS201',
    className: 'Data Structures and Algorithms',
    facultyName: 'Dr. Sarah Jenkins',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    studentCount: 56,
    department: 'Computer Science',
  },
  {
    id: 'tt-04',
    roomId: 'r-102',
    roomNumber: '102',
    roomName: 'Computing Systems Lab 102',
    classCode: 'CS401',
    className: 'Operating Systems & Distributed Computing',
    facultyName: 'Prof. Ananya Roy',
    day: 'Thursday',
    startTime: '11:00',
    endTime: '13:00',
    studentCount: 38,
    department: 'Computer Science',
  },
];

export class CampusDataService {
  private static apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  public static async fetchCampuses(): Promise<Campus[]> {
    try {
      const res = await fetch(`${this.apiUrl}/spatial/campuses`);
      if (res.ok) return await res.json();
    } catch {
      // Return local seed data fallback
    }
    return [
      {
        id: 'c-main-001',
        organizationId: 'org-nit-001',
        name: 'Main Technology Campus',
        code: 'MAIN',
        centerCoordinates: { latitude: 12.9716, longitude: 77.5946 },
      },
    ];
  }

  public static async fetchBuildings(campusId?: string): Promise<ExtendedBuilding[]> {
    try {
      const url = campusId
        ? `${this.apiUrl}/spatial/campuses/${campusId}/buildings`
        : `${this.apiUrl}/spatial/campuses/c-main-001/buildings`;
      const res = await fetch(url);
      if (res.ok) {
        const rawBuildings: Building[] = await res.json();
        // Merge with extended metrics
        return rawBuildings.map((rb) => {
          const ext = EXTENDED_BUILDINGS.find((b) => b.id === rb.id || b.code === rb.code);
          return ext ? { ...ext, ...rb } : (EXTENDED_BUILDINGS[0] as ExtendedBuilding);
        });
      }
    } catch {
      // Return local fallback
    }
    return EXTENDED_BUILDINGS;
  }

  public static async fetchRoomDetails(roomId: string): Promise<ExtendedRoom | null> {
    try {
      const res = await fetch(`${this.apiUrl}/spatial/rooms/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        const base = EXTENDED_ROOMS.find((r) => r.id === roomId || r.roomNumber === roomId);
        if (base) return { ...base, ...data.room };
      }
    } catch {
      // Fallback
    }
    return EXTENDED_ROOMS.find((r) => r.id === roomId || r.roomNumber === roomId) || null;
  }

  public static async fetchTickets(): Promise<MaintenanceTicket[]> {
    try {
      const res = await fetch(`${this.apiUrl}/maintenance/tickets`);
      if (res.ok) return await res.json();
    } catch {
      // Return mock tickets
    }
    return [
      {
        id: 't-1001',
        ticketNumber: 'TICK-1001',
        roomId: 'r-204',
        assetId: 'ast-ws-02',
        reportedByUserId: 'usr-student-01',
        assignedToUserId: 'usr-maint-01',
        issueSummary: 'GPU power rail failure during CUDA training run in AI Lab 204',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        createdAt: '2026-09-15T09:30:00Z',
      },
      {
        id: 't-1002',
        ticketNumber: 'TICK-1002',
        roomId: 'r-101',
        assetId: 'ast-p101',
        reportedByUserId: 'usr-faculty-01',
        issueSummary: 'Projector HDMI port 2 loose connection in Lecture Hall 101',
        status: 'OPEN',
        priority: 'MEDIUM',
        createdAt: '2026-09-22T14:15:00Z',
      },
    ];
  }
}
