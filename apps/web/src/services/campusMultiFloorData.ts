export type FloorLevel = 'GROUND' | 'FIRST' | 'SECOND' | 'TERRACE';

export interface SpatialPoint {
  x: number;
  y: number;
}

export interface CampusRoomEntity {
  id: string;
  code: string;
  name: string;
  refLabel: string;
  floor: FloorLevel;
  floorNumber: number;
  type:
    | 'LABORATORY'
    | 'SEMINAR_HALL'
    | 'CLASSROOM'
    | 'OFFICE'
    | 'STAFF_ROOM'
    | 'MONITORING'
    | 'EXAM_CELL'
    | 'EMPTY_SPACE'
    | 'RESTROOM'
    | 'STAIRS'
    | 'LIFT'
    | 'CIRCULATION'
    | 'CENTRAL_HUB'
    | 'TERRACE_DECK';
  areaM2: number;
  capacity: number;
  operationalStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  equipment: string[];
  department: string;
  description: string;
  position: {
    labelX: number;
    labelY: number;
    entranceX: number;
    entranceY: number;
  };
  polygon: SpatialPoint[];
  color: {
    fill: string;
    stroke: string;
    glow: string;
    badge: string;
  };
  connectedWaypoints: string[];
  telemetry?: {
    systemsOnline: number;
    totalSystems: number;
    cpuLoadPercent: number;
    temperatureC: number;
    networkStatus: 'OPTIMAL' | 'DEGRADED' | 'NORMAL';
  };
}

export interface MultiFloorWaypoint {
  id: string;
  floor: FloorLevel;
  name: string;
  x: number;
  y: number;
  type: 'HUB' | 'CORRIDOR' | 'DOOR' | 'STAIRS' | 'LIFT' | 'ROOM_CENTER' | 'ENTRANCE';
  isBlocked?: boolean;
}

export interface MultiFloorEdge {
  from: string;
  to: string;
  distanceMeters: number;
  isStair?: boolean;
  isElevator?: boolean;
  isBlocked?: boolean;
}

// -------------------------------------------------------------
// INSTITUTIONS (ESEC REAL + SIMULATED DEMO ENVIRONMENTS)
// -------------------------------------------------------------
export interface CampusInstitution {
  id: string;
  name: string;
  code: string;
  isSimulated: boolean;
  activeBuilding: string;
  stats: {
    occupancyPercent: number;
    activeLabs: number;
    systemAlerts: number;
  };
}

export const CAMPUS_INSTITUTIONS: CampusInstitution[] = [
  {
    id: 'inst-esec',
    name: 'ESEC Campus (Main Architecture)',
    code: 'ESEC',
    isSimulated: false,
    activeBuilding: 'Computer Science & AI Block',
    stats: { occupancyPercent: 64, activeLabs: 6, systemAlerts: 0 },
  },
  {
    id: 'inst-demo-a',
    name: 'Demo College A (Simulated)',
    code: 'DEMO-A',
    isSimulated: true,
    activeBuilding: 'Science & Robotics Block',
    stats: { occupancyPercent: 78, activeLabs: 4, systemAlerts: 2 },
  },
  {
    id: 'inst-demo-b',
    name: 'Demo College B (Simulated)',
    code: 'DEMO-B',
    isSimulated: true,
    activeBuilding: 'Innovation Pavilion',
    stats: { occupancyPercent: 42, activeLabs: 5, systemAlerts: 1 },
  },
];

// -------------------------------------------------------------
// GROUND FLOOR (Preserved from Reference 1 & 2 + Entrance Structure)
// -------------------------------------------------------------
export const GROUND_FLOOR_ENTITIES: CampusRoomEntity[] = [
  {
    id: 'GF-HUB-01',
    code: 'HUB-00',
    name: 'Central Hub / Corridor',
    refLabel: 'Hexagon Hub',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'CENTRAL_HUB',
    areaM2: 200,
    capacity: 100,
    operationalStatus: 'AVAILABLE',
    equipment: ['Interactive Spatial Kiosk', 'Hexagonal Seating Ring', 'Biophilic Planter', 'Directional Display'],
    department: 'Campus Central Circulation',
    description: 'Central hexagonal atrium connecting all ground floor labs, facilities, stairs, and elevator.',
    position: { labelX: 500, labelY: 480, entranceX: 500, entranceY: 480 },
    polygon: [
      { x: 450, y: 345 },
      { x: 550, y: 345 },
      { x: 625, y: 475 },
      { x: 550, y: 605 },
      { x: 450, y: 605 },
      { x: 375, y: 475 },
    ],
    color: {
      fill: 'rgba(241, 245, 249, 0.08)',
      stroke: 'rgba(148, 163, 184, 0.5)',
      glow: 'rgba(148, 163, 184, 0.4)',
      badge: '#94a3b8',
    },
    connectedWaypoints: ['wp-gf-hub', 'wp-gf-hub-n', 'wp-gf-hub-ne', 'wp-gf-hub-se', 'wp-gf-hub-s', 'wp-gf-hub-sw', 'wp-gf-hub-nw'],
  },
  {
    id: 'GF-COE-01',
    code: 'COE-01',
    name: 'COE Hall',
    refLabel: 'Centre of Excellence Hall',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'SEMINAR_HALL',
    areaM2: 65,
    capacity: 45,
    operationalStatus: 'AVAILABLE',
    equipment: ['Smart Presentation Display', 'Conference Tables', 'Video Telepresence'],
    department: 'Centre of Excellence',
    description: 'COE Hall located to the left of the main entrance for special presentations and institutional meetings.',
    position: { labelX: 250, labelY: 175, entranceX: 340, entranceY: 215 },
    polygon: [
      { x: 180, y: 140 },
      { x: 320, y: 135 },
      { x: 335, y: 215 },
      { x: 195, y: 220 },
    ],
    color: {
      fill: 'rgba(147, 51, 234, 0.12)',
      stroke: 'rgba(147, 51, 234, 0.7)',
      glow: 'rgba(147, 51, 234, 0.4)',
      badge: '#a855f7',
    },
    connectedWaypoints: ['wp-gf-coe-door'],
  },
  {
    id: 'GF-MON-01',
    code: 'CR-01',
    name: 'CCTV Monitoring Room',
    refLabel: 'Classroom 1 (Monitor Room)',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'MONITORING',
    areaM2: 80,
    capacity: 20,
    operationalStatus: 'AVAILABLE',
    equipment: ['Campus CCTV Wall', 'IoT Sensor Gateways', 'Security Terminals'],
    department: 'Campus Security & Operations',
    description: 'Central CCTV security monitoring room to the right of the main entrance with video wall telemetry.',
    position: { labelX: 300, labelY: 260, entranceX: 410, entranceY: 340 },
    polygon: [
      { x: 205, y: 220 },
      { x: 405, y: 205 },
      { x: 420, y: 340 },
      { x: 345, y: 345 },
      { x: 195, y: 325 },
    ],
    color: {
      fill: 'rgba(56, 189, 248, 0.12)',
      stroke: 'rgba(56, 189, 248, 0.7)',
      glow: 'rgba(56, 189, 248, 0.5)',
      badge: '#38bdf8',
    },
    connectedWaypoints: ['wp-gf-mon-door'],
  },
  {
    id: 'GF-LAB-01',
    code: 'CR-02',
    name: 'Lab 1',
    refLabel: 'Classroom 2 (Lab 1)',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'LABORATORY',
    areaM2: 70,
    capacity: 40,
    operationalStatus: 'AVAILABLE',
    equipment: ['Robotics Workstations', 'GPU Computing Nodes', 'Soldering Stations', '3D Printers'],
    department: 'Artificial Intelligence & Robotics',
    description: 'Premier AI and robotics laboratory with 40 workstation bays and live telemetry monitoring.',
    position: { labelX: 270, labelY: 375, entranceX: 360, entranceY: 420 },
    polygon: [
      { x: 195, y: 330 },
      { x: 345, y: 350 },
      { x: 370, y: 435 },
      { x: 180, y: 435 },
    ],
    color: {
      fill: 'rgba(251, 191, 36, 0.12)',
      stroke: 'rgba(251, 191, 36, 0.7)',
      glow: 'rgba(251, 191, 36, 0.5)',
      badge: '#fbbf24',
    },
    connectedWaypoints: ['wp-gf-lab1-door'],
    telemetry: {
      systemsOnline: 36,
      totalSystems: 40,
      cpuLoadPercent: 24,
      temperatureC: 22.4,
      networkStatus: 'OPTIMAL',
    },
  },
  {
    id: 'GF-STF-01',
    code: 'CR-03',
    name: 'Staff Room',
    refLabel: 'Classroom 3 (Staff Room)',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'STAFF_ROOM',
    areaM2: 45,
    capacity: 15,
    operationalStatus: 'OCCUPIED',
    equipment: ['Faculty Desks', 'Conference Table', 'Faculty Lounge'],
    department: 'Computer Science Faculty',
    description: 'Faculty office and consultation space along the western corridor.',
    position: { labelX: 255, labelY: 475, entranceX: 355, entranceY: 480 },
    polygon: [
      { x: 180, y: 440 },
      { x: 370, y: 440 },
      { x: 350, y: 525 },
      { x: 165, y: 535 },
    ],
    color: {
      fill: 'rgba(52, 211, 153, 0.12)',
      stroke: 'rgba(52, 211, 153, 0.7)',
      glow: 'rgba(52, 211, 153, 0.5)',
      badge: '#34d399',
    },
    connectedWaypoints: ['wp-gf-staff-door'],
  },
  {
    id: 'GF-STR-01',
    code: 'STR-W',
    name: 'Stairs (West)',
    refLabel: 'Stairs',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'STAIRS',
    areaM2: 25,
    capacity: 20,
    operationalStatus: 'AVAILABLE',
    equipment: ['Handrails', 'Emergency Exit Lights'],
    department: 'Vertical Circulation',
    description: 'Western concrete staircase leading upward to First Floor, Second Floor, and Terrace.',
    position: { labelX: 245, labelY: 575, entranceX: 335, entranceY: 555 },
    polygon: [
      { x: 165, y: 540 },
      { x: 345, y: 530 },
      { x: 320, y: 610 },
      { x: 230, y: 645 },
      { x: 160, y: 575 },
    ],
    color: {
      fill: 'rgba(245, 158, 11, 0.12)',
      stroke: 'rgba(245, 158, 11, 0.7)',
      glow: 'rgba(245, 158, 11, 0.5)',
      badge: '#f59e0b',
    },
    connectedWaypoints: ['wp-gf-str-w'],
  },
  {
    id: 'GF-LIFT-01',
    code: 'LFT-01',
    name: 'Central Lift',
    refLabel: 'Elevator Shaft',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'LIFT',
    areaM2: 12,
    capacity: 8,
    operationalStatus: 'AVAILABLE',
    equipment: ['Wheelchair Accessible Call Button', 'Voice Annunciator'],
    department: 'Vertical Accessibility',
    description: 'Accessible passenger elevator servicing Ground, First, Second Floors and Terrace.',
    position: { labelX: 475, labelY: 330, entranceX: 480, entranceY: 350 },
    polygon: [
      { x: 460, y: 310 },
      { x: 495, y: 310 },
      { x: 495, y: 345 },
      { x: 460, y: 345 },
    ],
    color: {
      fill: 'rgba(6, 182, 212, 0.15)',
      stroke: 'rgba(6, 182, 212, 0.8)',
      glow: 'rgba(6, 182, 212, 0.6)',
      badge: '#06b6d4',
    },
    connectedWaypoints: ['wp-gf-lift'],
  },
  {
    id: 'GF-GEN-01',
    code: 'RR-GEN',
    name: 'Gents Restroom',
    refLabel: 'Classroom 5 (Gents Restroom)',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'RESTROOM',
    areaM2: 30,
    capacity: 10,
    operationalStatus: 'AVAILABLE',
    equipment: ['Sanitary Stalls', 'Automated Sensor Faucets'],
    department: 'Public Amenities',
    description: 'Southwestern male sanitary facility off the central circular corridor.',
    position: { labelX: 275, labelY: 675, entranceX: 345, entranceY: 635 },
    polygon: [
      { x: 230, y: 650 },
      { x: 320, y: 615 },
      { x: 350, y: 685 },
      { x: 310, y: 735 },
      { x: 220, y: 675 },
    ],
    color: {
      fill: 'rgba(96, 165, 250, 0.12)',
      stroke: 'rgba(96, 165, 250, 0.7)',
      glow: 'rgba(96, 165, 250, 0.5)',
      badge: '#60a5fa',
    },
    connectedWaypoints: ['wp-gf-gents-door'],
  },
  {
    id: 'GF-SEM-01',
    code: 'CR-07',
    name: 'Seminar Hall',
    refLabel: 'Classroom 7 (Seminar Hall)',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'SEMINAR_HALL',
    areaM2: 120,
    capacity: 120,
    operationalStatus: 'AVAILABLE',
    equipment: ['4K Laser Projector', 'Dolby Audio Array', 'Tiered Amphitheater Seating', 'Stage Podium'],
    department: 'College Academic Affairs',
    description: 'Large curved auditorium with tiered fan-shaped amphitheater seating and stage podium.',
    position: { labelX: 440, labelY: 690, entranceX: 440, entranceY: 615 },
    polygon: [
      { x: 355, y: 615 },
      { x: 535, y: 615 },
      { x: 550, y: 795 },
      { x: 340, y: 795 },
    ],
    color: {
      fill: 'rgba(244, 63, 94, 0.12)',
      stroke: 'rgba(244, 63, 94, 0.7)',
      glow: 'rgba(244, 63, 94, 0.5)',
      badge: '#f43f5e',
    },
    connectedWaypoints: ['wp-gf-seminar-door'],
  },
  {
    id: 'GF-LAD-01',
    code: 'RR-LAD',
    name: 'Ladies Restroom',
    refLabel: 'Classroom 6 (Ladies Restroom)',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'RESTROOM',
    areaM2: 30,
    capacity: 10,
    operationalStatus: 'AVAILABLE',
    equipment: ['Sanitary Stalls', 'Vanity Mirror Array'],
    department: 'Public Amenities',
    description: 'Southeastern female sanitary facility off the central circular corridor.',
    position: { labelX: 605, labelY: 675, entranceX: 550, entranceY: 635 },
    polygon: [
      { x: 540, y: 615 },
      { x: 645, y: 630 },
      { x: 675, y: 695 },
      { x: 565, y: 760 },
      { x: 540, y: 690 },
    ],
    color: {
      fill: 'rgba(192, 132, 252, 0.12)',
      stroke: 'rgba(192, 132, 252, 0.7)',
      glow: 'rgba(192, 132, 252, 0.5)',
      badge: '#c084fc',
    },
    connectedWaypoints: ['wp-gf-ladies-door'],
  },
  {
    id: 'GF-OFF-01',
    code: 'CR-08',
    name: 'Office',
    refLabel: 'Classroom 8 (Office)',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'OFFICE',
    areaM2: 60,
    capacity: 12,
    operationalStatus: 'OCCUPIED',
    equipment: ['Administrative Terminals', 'Document Archiving', 'Conference Table'],
    department: 'Department Administration',
    description: 'Administrative coordinator office and faculty consultation tables on the eastern wing.',
    position: { labelX: 620, labelY: 510, entranceX: 575, entranceY: 515 },
    polygon: [
      { x: 555, y: 445 },
      { x: 710, y: 445 },
      { x: 715, y: 585 },
      { x: 645, y: 625 },
      { x: 570, y: 555 },
    ],
    color: {
      fill: 'rgba(45, 212, 191, 0.12)',
      stroke: 'rgba(45, 212, 191, 0.7)',
      glow: 'rgba(45, 212, 191, 0.5)',
      badge: '#2dd4bf',
    },
    connectedWaypoints: ['wp-gf-office-door'],
  },
  {
    id: 'GF-STR-02',
    code: 'STR-E',
    name: 'Stairs (East)',
    refLabel: 'Stairs',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'STAIRS',
    areaM2: 25,
    capacity: 20,
    operationalStatus: 'AVAILABLE',
    equipment: ['Emergency Exit Signage', 'Stair Lighting'],
    department: 'Vertical Circulation',
    description: 'Eastern dual-flight staircase connecting Ground Floor to upper research laboratories.',
    position: { labelX: 635, labelY: 395, entranceX: 580, entranceY: 415 },
    polygon: [
      { x: 560, y: 355 },
      { x: 690, y: 315 },
      { x: 705, y: 435 },
      { x: 560, y: 435 },
    ],
    color: {
      fill: 'rgba(245, 158, 11, 0.12)',
      stroke: 'rgba(245, 158, 11, 0.7)',
      glow: 'rgba(245, 158, 11, 0.5)',
      badge: '#f59e0b',
    },
    connectedWaypoints: ['wp-gf-str-e'],
  },
  {
    id: 'GF-EXM-01',
    code: 'CR-09',
    name: 'Exam Cell',
    refLabel: 'Classroom 9 (Exam Cell)',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'EXAM_CELL',
    areaM2: 40,
    capacity: 10,
    operationalStatus: 'OCCUPIED',
    equipment: ['High-Security Locker', 'Biometric Access', 'Question Paper Vault'],
    department: 'Examination Branch',
    description: 'Secure examination repository and confidential evaluation coordination office.',
    position: { labelX: 645, labelY: 265, entranceX: 595, entranceY: 335 },
    polygon: [
      { x: 595, y: 195 },
      { x: 695, y: 185 },
      { x: 700, y: 305 },
      { x: 595, y: 345 },
    ],
    color: {
      fill: 'rgba(167, 139, 250, 0.12)',
      stroke: 'rgba(167, 139, 250, 0.7)',
      glow: 'rgba(167, 139, 250, 0.5)',
      badge: '#a78bfa',
    },
    connectedWaypoints: ['wp-gf-exam-door'],
  },
  {
    id: 'GF-EMP-01',
    code: 'CR-10',
    name: 'Empty Space',
    refLabel: 'Classroom 10 (Empty Space)',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'EMPTY_SPACE',
    areaM2: 50,
    capacity: 25,
    operationalStatus: 'AVAILABLE',
    equipment: ['Modular Lounge Seating', 'Acoustic Panels', 'Mobile Whiteboards'],
    department: 'Innovation & Flexible Learning',
    description: 'Open collaborative space for breakout sessions, ideation, and student group work.',
    position: { labelX: 545, labelY: 255, entranceX: 535, entranceY: 340 },
    polygon: [
      { x: 500, y: 190 },
      { x: 590, y: 195 },
      { x: 590, y: 345 },
      { x: 480, y: 345 },
      { x: 480, y: 285 },
    ],
    color: {
      fill: 'rgba(14, 165, 233, 0.12)',
      stroke: 'rgba(14, 165, 233, 0.7)',
      glow: 'rgba(14, 165, 233, 0.5)',
      badge: '#0ea5e9',
    },
    connectedWaypoints: ['wp-gf-empty-door'],
  },
];

// -------------------------------------------------------------
// FIRST FLOOR ENTITIES
// -------------------------------------------------------------
export const FIRST_FLOOR_ENTITIES: CampusRoomEntity[] = [
  {
    id: '1F-HUB-01',
    code: '1F-HUB',
    name: 'First Floor Central Atrium',
    refLabel: 'Atrium Level 1',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'CENTRAL_HUB',
    areaM2: 180,
    capacity: 80,
    operationalStatus: 'AVAILABLE',
    equipment: ['Digital Notice Boards', 'Study Bar Stools', 'WiFi 6 Access Points'],
    department: 'First Floor Common Circulation',
    description: 'Central circular gallery on the First Floor looking down into the Ground Floor hexagon atrium.',
    position: { labelX: 500, labelY: 480, entranceX: 500, entranceY: 480 },
    polygon: [
      { x: 450, y: 355 },
      { x: 550, y: 355 },
      { x: 620, y: 475 },
      { x: 550, y: 595 },
      { x: 450, y: 595 },
      { x: 380, y: 475 },
    ],
    color: {
      fill: 'rgba(56, 189, 248, 0.08)',
      stroke: 'rgba(56, 189, 248, 0.5)',
      glow: 'rgba(56, 189, 248, 0.4)',
      badge: '#38bdf8',
    },
    connectedWaypoints: ['wp-1f-hub', 'wp-1f-hub-w', 'wp-1f-hub-e', 'wp-1f-lift'],
  },
  {
    id: '1F-LAB-02',
    code: '1F-CR-01',
    name: 'AI Research & Neural Systems Lab',
    refLabel: 'Lab 2 (First Floor)',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'LABORATORY',
    areaM2: 85,
    capacity: 40,
    operationalStatus: 'AVAILABLE',
    equipment: ['Deep Learning Server Pods', '40 Dual-Monitor Desks', 'Robotics Testing Track'],
    department: 'Artificial Intelligence & Data Science',
    description: 'Advanced research lab for neural networks and machine learning model training.',
    position: { labelX: 285, labelY: 280, entranceX: 400, entranceY: 350 },
    polygon: [
      { x: 200, y: 215 },
      { x: 410, y: 200 },
      { x: 425, y: 345 },
      { x: 340, y: 350 },
      { x: 190, y: 330 },
    ],
    color: {
      fill: 'rgba(99, 102, 241, 0.12)',
      stroke: 'rgba(99, 102, 241, 0.7)',
      glow: 'rgba(99, 102, 241, 0.5)',
      badge: '#6366f1',
    },
    connectedWaypoints: ['wp-1f-lab2-door'],
    telemetry: {
      systemsOnline: 39,
      totalSystems: 40,
      cpuLoadPercent: 68,
      temperatureC: 21.8,
      networkStatus: 'OPTIMAL',
    },
  },
  {
    id: '1F-LAB-03',
    code: '1F-CR-02',
    name: 'Cloud Computing & IoT Lab',
    refLabel: 'Lab 3 (First Floor)',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'LABORATORY',
    areaM2: 75,
    capacity: 40,
    operationalStatus: 'OCCUPIED',
    equipment: ['Edge IoT Gateways', 'Kubernetes Node Cluster', 'Embedded Sensor Kits'],
    department: 'Computer Science & Engineering',
    description: 'Specialized lab for cloud infrastructure deployment and microservices architecture.',
    position: { labelX: 270, labelY: 380, entranceX: 360, entranceY: 420 },
    polygon: [
      { x: 190, y: 335 },
      { x: 340, y: 355 },
      { x: 370, y: 440 },
      { x: 175, y: 440 },
    ],
    color: {
      fill: 'rgba(234, 179, 8, 0.12)',
      stroke: 'rgba(234, 179, 8, 0.7)',
      glow: 'rgba(234, 179, 8, 0.5)',
      badge: '#eab308',
    },
    connectedWaypoints: ['wp-1f-lab3-door'],
  },
  {
    id: '1F-FAC-01',
    code: '1F-CR-03',
    name: 'Faculty Research Suite',
    refLabel: 'Staff Cabin 1F',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'STAFF_ROOM',
    areaM2: 50,
    capacity: 18,
    operationalStatus: 'AVAILABLE',
    equipment: ['Faculty Workstations', 'Meeting Area', 'Research Library'],
    department: 'CSE Research Council',
    description: 'Faculty research and consultation room on the First Floor west side.',
    position: { labelX: 255, labelY: 475, entranceX: 355, entranceY: 480 },
    polygon: [
      { x: 175, y: 445 },
      { x: 370, y: 445 },
      { x: 350, y: 530 },
      { x: 160, y: 535 },
    ],
    color: {
      fill: 'rgba(34, 197, 94, 0.12)',
      stroke: 'rgba(34, 197, 94, 0.7)',
      glow: 'rgba(34, 197, 94, 0.5)',
      badge: '#22c55e',
    },
    connectedWaypoints: ['wp-1f-fac-door'],
  },
  {
    id: '1F-STR-01',
    code: 'STR-W-1F',
    name: 'Stairs (West) Landing',
    refLabel: 'Stairs Landing',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'STAIRS',
    areaM2: 25,
    capacity: 20,
    operationalStatus: 'AVAILABLE',
    equipment: ['Fire Extinguisher', 'Emergency Exit'],
    department: 'Vertical Circulation',
    description: 'West staircase landing connecting to Ground Floor and Second Floor.',
    position: { labelX: 245, labelY: 575, entranceX: 335, entranceY: 555 },
    polygon: [
      { x: 160, y: 540 },
      { x: 345, y: 535 },
      { x: 320, y: 615 },
      { x: 230, y: 650 },
      { x: 155, y: 580 },
    ],
    color: {
      fill: 'rgba(245, 158, 11, 0.12)',
      stroke: 'rgba(245, 158, 11, 0.7)',
      glow: 'rgba(245, 158, 11, 0.5)',
      badge: '#f59e0b',
    },
    connectedWaypoints: ['wp-1f-str-w'],
  },
  {
    id: '1F-LIFT-01',
    code: 'LFT-1F',
    name: 'Central Lift Landing',
    refLabel: 'Elevator Lobby',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'LIFT',
    areaM2: 12,
    capacity: 8,
    operationalStatus: 'AVAILABLE',
    equipment: ['Braille Call Panel', 'Safety Sensor Door'],
    department: 'Vertical Accessibility',
    description: 'Elevator lobby on the First Floor.',
    position: { labelX: 475, labelY: 330, entranceX: 480, entranceY: 350 },
    polygon: [
      { x: 460, y: 310 },
      { x: 495, y: 310 },
      { x: 495, y: 345 },
      { x: 460, y: 345 },
    ],
    color: {
      fill: 'rgba(6, 182, 212, 0.15)',
      stroke: 'rgba(6, 182, 212, 0.8)',
      glow: 'rgba(6, 182, 212, 0.6)',
      badge: '#06b6d4',
    },
    connectedWaypoints: ['wp-1f-lift'],
  },
  {
    id: '1F-THE-01',
    code: '1F-CR-07',
    name: 'Smart Lecture Theatre 101',
    refLabel: 'Theatre 101',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'SEMINAR_HALL',
    areaM2: 120,
    capacity: 90,
    operationalStatus: 'AVAILABLE',
    equipment: ['Motorized Dropdown Screen', 'Acoustic Soundproofing', 'Tiered Desks'],
    department: 'CSE Academics',
    description: 'First Floor smart lecture theatre directly above the Ground Floor Seminar Hall.',
    position: { labelX: 440, labelY: 690, entranceX: 440, entranceY: 615 },
    polygon: [
      { x: 355, y: 615 },
      { x: 535, y: 615 },
      { x: 550, y: 795 },
      { x: 340, y: 795 },
    ],
    color: {
      fill: 'rgba(236, 72, 153, 0.12)',
      stroke: 'rgba(236, 72, 153, 0.7)',
      glow: 'rgba(236, 72, 153, 0.5)',
      badge: '#ec4899',
    },
    connectedWaypoints: ['wp-1f-theatre-door'],
  },
  {
    id: '1F-CR-102',
    code: '1F-CR-08',
    name: 'Classroom 102',
    refLabel: 'Classroom 102',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'CLASSROOM',
    areaM2: 60,
    capacity: 50,
    operationalStatus: 'AVAILABLE',
    equipment: ['Interactive Smart Board', 'Ergonomic Benches'],
    department: 'Computer Science',
    description: 'High-tech academic classroom on the east wing of First Floor.',
    position: { labelX: 620, labelY: 510, entranceX: 575, entranceY: 515 },
    polygon: [
      { x: 555, y: 445 },
      { x: 710, y: 445 },
      { x: 715, y: 585 },
      { x: 645, y: 625 },
      { x: 570, y: 555 },
    ],
    color: {
      fill: 'rgba(16, 185, 129, 0.12)',
      stroke: 'rgba(16, 185, 129, 0.7)',
      glow: 'rgba(16, 185, 129, 0.5)',
      badge: '#10b981',
    },
    connectedWaypoints: ['wp-1f-cr102-door'],
  },
  {
    id: '1F-STR-02',
    code: 'STR-E-1F',
    name: 'Stairs (East) Landing',
    refLabel: 'Stairs Landing',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'STAIRS',
    areaM2: 25,
    capacity: 20,
    operationalStatus: 'AVAILABLE',
    equipment: ['Safety Rails'],
    department: 'Vertical Circulation',
    description: 'East staircase landing connecting to Ground Floor and Second Floor.',
    position: { labelX: 635, labelY: 395, entranceX: 580, entranceY: 415 },
    polygon: [
      { x: 560, y: 355 },
      { x: 690, y: 315 },
      { x: 705, y: 435 },
      { x: 560, y: 435 },
    ],
    color: {
      fill: 'rgba(245, 158, 11, 0.12)',
      stroke: 'rgba(245, 158, 11, 0.7)',
      glow: 'rgba(245, 158, 11, 0.5)',
      badge: '#f59e0b',
    },
    connectedWaypoints: ['wp-1f-str-e'],
  },
  {
    id: '1F-LIB-01',
    code: '1F-CR-10',
    name: 'Department Digital Library',
    refLabel: 'E-Library 1F',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'EMPTY_SPACE',
    areaM2: 70,
    capacity: 35,
    operationalStatus: 'AVAILABLE',
    equipment: ['Research Terminals', 'IEEE / ACM Digital Access Kiosks', 'Study Pods'],
    department: 'Library Sciences & CSE',
    description: 'Quiet study and research digital library with online journal access.',
    position: { labelX: 575, labelY: 260, entranceX: 550, entranceY: 340 },
    polygon: [
      { x: 500, y: 190 },
      { x: 695, y: 190 },
      { x: 700, y: 345 },
      { x: 480, y: 345 },
      { x: 480, y: 285 },
    ],
    color: {
      fill: 'rgba(14, 165, 233, 0.12)',
      stroke: 'rgba(14, 165, 233, 0.7)',
      glow: 'rgba(14, 165, 233, 0.5)',
      badge: '#0ea5e9',
    },
    connectedWaypoints: ['wp-1f-lib-door'],
  },
];

// -------------------------------------------------------------
// SECOND FLOOR ENTITIES
// -------------------------------------------------------------
export const SECOND_FLOOR_ENTITIES: CampusRoomEntity[] = [
  {
    id: '2F-HUB-01',
    code: '2F-HUB',
    name: 'Second Floor Innovation Gallery',
    refLabel: 'Gallery Level 2',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'CENTRAL_HUB',
    areaM2: 180,
    capacity: 80,
    operationalStatus: 'AVAILABLE',
    equipment: ['Exhibition Monitors', 'Open Seating Cubes', 'Power Nodes'],
    department: 'Campus Central Circulation',
    description: 'Upper gallery circulation connecting senior research labs and incubator suites.',
    position: { labelX: 500, labelY: 480, entranceX: 500, entranceY: 480 },
    polygon: [
      { x: 450, y: 355 },
      { x: 550, y: 355 },
      { x: 620, y: 475 },
      { x: 550, y: 595 },
      { x: 450, y: 595 },
      { x: 380, y: 475 },
    ],
    color: {
      fill: 'rgba(168, 85, 247, 0.08)',
      stroke: 'rgba(168, 85, 247, 0.5)',
      glow: 'rgba(168, 85, 247, 0.4)',
      badge: '#a855f7',
    },
    connectedWaypoints: ['wp-2f-hub', 'wp-2f-hub-w', 'wp-2f-hub-e', 'wp-2f-lift'],
  },
  {
    id: '2F-LAB-04',
    code: '2F-CR-01',
    name: 'Robotics & Cyber-Physical Lab',
    refLabel: 'Robotics Lab 2F',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'LABORATORY',
    areaM2: 85,
    capacity: 35,
    operationalStatus: 'AVAILABLE',
    equipment: ['Robotic Arms', 'Quadcopter Test Cage', 'LiDAR & SLAM Sensor Benches'],
    department: 'Robotics & Autonomous Systems',
    description: 'High-precision research laboratory for autonomous robotics and cyber-physical systems.',
    position: { labelX: 285, labelY: 280, entranceX: 400, entranceY: 350 },
    polygon: [
      { x: 200, y: 215 },
      { x: 410, y: 200 },
      { x: 425, y: 345 },
      { x: 340, y: 350 },
      { x: 190, y: 330 },
    ],
    color: {
      fill: 'rgba(239, 68, 68, 0.12)',
      stroke: 'rgba(239, 68, 68, 0.7)',
      glow: 'rgba(239, 68, 68, 0.5)',
      badge: '#ef4444',
    },
    connectedWaypoints: ['wp-2f-lab4-door'],
    telemetry: {
      systemsOnline: 32,
      totalSystems: 35,
      cpuLoadPercent: 44,
      temperatureC: 22.1,
      networkStatus: 'OPTIMAL',
    },
  },
  {
    id: '2F-CR-201',
    code: '2F-CR-02',
    name: 'Innovation Studio 201',
    refLabel: 'Studio 201',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'CLASSROOM',
    areaM2: 75,
    capacity: 45,
    operationalStatus: 'AVAILABLE',
    equipment: ['Design Thinking Whiteboard Walls', 'Mobile Work Desks', 'Touchscreen Consoles'],
    department: 'Student Innovation Center',
    description: 'Flexible workshop space designed for hackathons, prototyping, and team collaboration.',
    position: { labelX: 270, labelY: 380, entranceX: 360, entranceY: 420 },
    polygon: [
      { x: 190, y: 335 },
      { x: 340, y: 355 },
      { x: 370, y: 440 },
      { x: 175, y: 440 },
    ],
    color: {
      fill: 'rgba(59, 130, 246, 0.12)',
      stroke: 'rgba(59, 130, 246, 0.7)',
      glow: 'rgba(59, 130, 246, 0.5)',
      badge: '#3b82f6',
    },
    connectedWaypoints: ['wp-2f-cr201-door'],
  },
  {
    id: '2F-INC-01',
    code: '2F-CR-03',
    name: 'Campus Startup Incubator',
    refLabel: 'Incubation Hub',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'OFFICE',
    areaM2: 50,
    capacity: 25,
    operationalStatus: 'AVAILABLE',
    equipment: ['Pitch Stage', 'Mentor Meeting Pods', 'High-Speed Fiber'],
    department: 'Industry Relations & Startups',
    description: 'Incubation suite supporting student tech ventures and university patent commercialization.',
    position: { labelX: 255, labelY: 475, entranceX: 355, entranceY: 480 },
    polygon: [
      { x: 175, y: 445 },
      { x: 370, y: 445 },
      { x: 350, y: 530 },
      { x: 160, y: 535 },
    ],
    color: {
      fill: 'rgba(16, 185, 129, 0.12)',
      stroke: 'rgba(16, 185, 129, 0.7)',
      glow: 'rgba(16, 185, 129, 0.5)',
      badge: '#10b981',
    },
    connectedWaypoints: ['wp-2f-inc-door'],
  },
  {
    id: '2F-STR-01',
    code: 'STR-W-2F',
    name: 'Stairs (West) Landing',
    refLabel: 'Stairs Landing',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'STAIRS',
    areaM2: 25,
    capacity: 20,
    operationalStatus: 'AVAILABLE',
    equipment: ['Handrails', 'Emergency Signage'],
    department: 'Vertical Circulation',
    description: 'West staircase landing connecting First Floor to Second Floor and Terrace.',
    position: { labelX: 245, labelY: 575, entranceX: 335, entranceY: 555 },
    polygon: [
      { x: 160, y: 540 },
      { x: 345, y: 535 },
      { x: 320, y: 615 },
      { x: 230, y: 650 },
      { x: 155, y: 580 },
    ],
    color: {
      fill: 'rgba(245, 158, 11, 0.12)',
      stroke: 'rgba(245, 158, 11, 0.7)',
      glow: 'rgba(245, 158, 11, 0.5)',
      badge: '#f59e0b',
    },
    connectedWaypoints: ['wp-2f-str-w'],
  },
  {
    id: '2F-LIFT-01',
    code: 'LFT-2F',
    name: 'Central Lift Landing',
    refLabel: 'Elevator Lobby',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'LIFT',
    areaM2: 12,
    capacity: 8,
    operationalStatus: 'AVAILABLE',
    equipment: ['Floor Indicator Screen'],
    department: 'Vertical Accessibility',
    description: 'Second Floor elevator lobby.',
    position: { labelX: 475, labelY: 330, entranceX: 480, entranceY: 350 },
    polygon: [
      { x: 460, y: 310 },
      { x: 495, y: 310 },
      { x: 495, y: 345 },
      { x: 460, y: 345 },
    ],
    color: {
      fill: 'rgba(6, 182, 212, 0.15)',
      stroke: 'rgba(6, 182, 212, 0.8)',
      glow: 'rgba(6, 182, 212, 0.6)',
      badge: '#06b6d4',
    },
    connectedWaypoints: ['wp-2f-lift'],
  },
  {
    id: '2F-SEM-201',
    code: '2F-CR-07',
    name: 'Executive Seminar Room 201',
    refLabel: 'Executive Hall',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'SEMINAR_HALL',
    areaM2: 120,
    capacity: 85,
    operationalStatus: 'AVAILABLE',
    equipment: ['Dual 85-inch UHD Displays', 'Surround Array', 'Microphone Stations'],
    department: 'Academic Executive Council',
    description: 'Second Floor seminar room for faculty research symposia and visiting scholars.',
    position: { labelX: 440, labelY: 690, entranceX: 440, entranceY: 615 },
    polygon: [
      { x: 355, y: 615 },
      { x: 535, y: 615 },
      { x: 550, y: 795 },
      { x: 340, y: 795 },
    ],
    color: {
      fill: 'rgba(217, 70, 239, 0.12)',
      stroke: 'rgba(217, 70, 239, 0.7)',
      glow: 'rgba(217, 70, 239, 0.5)',
      badge: '#d946ef',
    },
    connectedWaypoints: ['wp-2f-sem-door'],
  },
  {
    id: '2F-CR-202',
    code: '2F-CR-08',
    name: 'Classroom 202',
    refLabel: 'Classroom 202',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'CLASSROOM',
    areaM2: 60,
    capacity: 45,
    operationalStatus: 'OCCUPIED',
    equipment: ['Projector', 'Air Conditioned'],
    department: 'Computer Science',
    description: 'Senior undergraduate classroom on the east wing of Second Floor.',
    position: { labelX: 620, labelY: 510, entranceX: 575, entranceY: 515 },
    polygon: [
      { x: 555, y: 445 },
      { x: 710, y: 445 },
      { x: 715, y: 585 },
      { x: 645, y: 625 },
      { x: 570, y: 555 },
    ],
    color: {
      fill: 'rgba(20, 184, 166, 0.12)',
      stroke: 'rgba(20, 184, 166, 0.7)',
      glow: 'rgba(20, 184, 166, 0.5)',
      badge: '#14b8a6',
    },
    connectedWaypoints: ['wp-2f-cr202-door'],
  },
  {
    id: '2F-STR-02',
    code: 'STR-E-2F',
    name: 'Stairs (East) Landing',
    refLabel: 'Stairs Landing',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'STAIRS',
    areaM2: 25,
    capacity: 20,
    operationalStatus: 'AVAILABLE',
    equipment: ['Safety Rails'],
    department: 'Vertical Circulation',
    description: 'East staircase landing connecting First Floor to Second Floor and Terrace.',
    position: { labelX: 635, labelY: 395, entranceX: 580, entranceY: 415 },
    polygon: [
      { x: 560, y: 355 },
      { x: 690, y: 315 },
      { x: 705, y: 435 },
      { x: 560, y: 435 },
    ],
    color: {
      fill: 'rgba(245, 158, 11, 0.12)',
      stroke: 'rgba(245, 158, 11, 0.7)',
      glow: 'rgba(245, 158, 11, 0.5)',
      badge: '#f59e0b',
    },
    connectedWaypoints: ['wp-2f-str-e'],
  },
];

// -------------------------------------------------------------
// TERRACE ENTITIES (2 Classrooms + Lift Penthouse + Solar Deck)
// -------------------------------------------------------------
export const TERRACE_ENTITIES: CampusRoomEntity[] = [
  {
    id: 'TR-DK-01',
    code: 'TR-DECK',
    name: 'Terrace Open Deck & Solar Farm',
    refLabel: 'Terrace Circulation',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'TERRACE_DECK',
    areaM2: 240,
    capacity: 80,
    operationalStatus: 'AVAILABLE',
    equipment: ['50kW Rooftop Solar Array', 'Perimeter Parapet Glass', 'Weather Station Mast'],
    department: 'Campus Facilities & Green Energy',
    description: 'Open rooftop observation deck and solar energy installation with unobstructed campus views.',
    position: { labelX: 500, labelY: 480, entranceX: 500, entranceY: 480 },
    polygon: [
      { x: 380, y: 345 },
      { x: 620, y: 345 },
      { x: 690, y: 475 },
      { x: 620, y: 645 },
      { x: 380, y: 645 },
      { x: 310, y: 475 },
    ],
    color: {
      fill: 'rgba(14, 165, 233, 0.08)',
      stroke: 'rgba(14, 165, 233, 0.5)',
      glow: 'rgba(14, 165, 233, 0.4)',
      badge: '#0ea5e9',
    },
    connectedWaypoints: ['wp-tr-deck', 'wp-tr-lift', 'wp-tr-str-w', 'wp-tr-str-e'],
  },
  {
    id: 'TR-CR-01',
    code: 'TR-CR-01',
    name: 'Open Classroom Studio 1',
    refLabel: 'Rooftop Classroom 1',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'CLASSROOM',
    areaM2: 50,
    capacity: 30,
    operationalStatus: 'AVAILABLE',
    equipment: ['Tensile Canopy Roof', 'All-Weather Desks', 'Solar Charging Stations'],
    department: 'Architectural & Open Air Learning',
    description: 'Covered open-air studio on the western terrace for outdoor design critique and collaborative workshops.',
    position: { labelX: 285, labelY: 340, entranceX: 360, entranceY: 380 },
    polygon: [
      { x: 200, y: 280 },
      { x: 360, y: 280 },
      { x: 360, y: 420 },
      { x: 200, y: 420 },
    ],
    color: {
      fill: 'rgba(16, 185, 129, 0.15)',
      stroke: 'rgba(16, 185, 129, 0.8)',
      glow: 'rgba(16, 185, 129, 0.5)',
      badge: '#10b981',
    },
    connectedWaypoints: ['wp-tr-cr1-door'],
  },
  {
    id: 'TR-CR-02',
    code: 'TR-CR-02',
    name: 'Open Classroom Studio 2',
    refLabel: 'Rooftop Classroom 2',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'CLASSROOM',
    areaM2: 50,
    capacity: 30,
    operationalStatus: 'AVAILABLE',
    equipment: ['Weatherproof Whiteboards', 'Solar Powered Lighting', 'Breeze Circulation Fans'],
    department: 'Architectural & Open Air Learning',
    description: 'Covered open-air studio on the eastern terrace for seminar discussions and group breakout sessions.',
    position: { labelX: 715, labelY: 340, entranceX: 640, entranceY: 380 },
    polygon: [
      { x: 640, y: 280 },
      { x: 800, y: 280 },
      { x: 800, y: 420 },
      { x: 640, y: 420 },
    ],
    color: {
      fill: 'rgba(56, 189, 248, 0.15)',
      stroke: 'rgba(56, 189, 248, 0.8)',
      glow: 'rgba(56, 189, 248, 0.5)',
      badge: '#38bdf8',
    },
    connectedWaypoints: ['wp-tr-cr2-door'],
  },
  {
    id: 'TR-LIFT-01',
    code: 'LFT-TR',
    name: 'Lift Headroom & Penthouse',
    refLabel: 'Elevator Machine Room',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'LIFT',
    areaM2: 25,
    capacity: 8,
    operationalStatus: 'AVAILABLE',
    equipment: ['Traction Motor Host', 'Maintenance Access Hatch'],
    department: 'Vertical Accessibility',
    description: 'Elevator penthouse and machinery room servicing the full vertical height of the building.',
    position: { labelX: 475, labelY: 330, entranceX: 480, entranceY: 360 },
    polygon: [
      { x: 450, y: 300 },
      { x: 505, y: 300 },
      { x: 505, y: 360 },
      { x: 450, y: 360 },
    ],
    color: {
      fill: 'rgba(6, 182, 212, 0.18)',
      stroke: 'rgba(6, 182, 212, 0.9)',
      glow: 'rgba(6, 182, 212, 0.6)',
      badge: '#06b6d4',
    },
    connectedWaypoints: ['wp-tr-lift'],
  },
  {
    id: 'TR-STR-01',
    code: 'STR-W-TR',
    name: 'Stairs (West) Headroom',
    refLabel: 'Rooftop West Exit',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'STAIRS',
    areaM2: 20,
    capacity: 15,
    operationalStatus: 'AVAILABLE',
    equipment: ['Weatherproof Door', 'Panic Push Bar'],
    department: 'Vertical Circulation',
    description: 'Western roof access door connecting downward through all floors.',
    position: { labelX: 250, labelY: 560, entranceX: 335, entranceY: 550 },
    polygon: [
      { x: 190, y: 520 },
      { x: 330, y: 520 },
      { x: 330, y: 600 },
      { x: 190, y: 600 },
    ],
    color: {
      fill: 'rgba(245, 158, 11, 0.15)',
      stroke: 'rgba(245, 158, 11, 0.8)',
      glow: 'rgba(245, 158, 11, 0.5)',
      badge: '#f59e0b',
    },
    connectedWaypoints: ['wp-tr-str-w'],
  },
  {
    id: 'TR-STR-02',
    code: 'STR-E-TR',
    name: 'Stairs (East) Headroom',
    refLabel: 'Rooftop East Exit',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'STAIRS',
    areaM2: 20,
    capacity: 15,
    operationalStatus: 'AVAILABLE',
    equipment: ['Weatherproof Door', 'Emergency Exit'],
    department: 'Vertical Circulation',
    description: 'Eastern roof access door connecting downward through all floors.',
    position: { labelX: 680, labelY: 560, entranceX: 600, entranceY: 550 },
    polygon: [
      { x: 600, y: 520 },
      { x: 740, y: 520 },
      { x: 740, y: 600 },
      { x: 600, y: 600 },
    ],
    color: {
      fill: 'rgba(245, 158, 11, 0.15)',
      stroke: 'rgba(245, 158, 11, 0.8)',
      glow: 'rgba(245, 158, 11, 0.5)',
      badge: '#f59e0b',
    },
    connectedWaypoints: ['wp-tr-str-e'],
  },
];

// Combine all floors
export const ALL_CAMPUS_ENTITIES: CampusRoomEntity[] = [
  ...GROUND_FLOOR_ENTITIES,
  ...FIRST_FLOOR_ENTITIES,
  ...SECOND_FLOOR_ENTITIES,
  ...TERRACE_ENTITIES,
];

export function getEntitiesForFloor(floor: FloorLevel): CampusRoomEntity[] {
  switch (floor) {
    case 'GROUND':
      return GROUND_FLOOR_ENTITIES;
    case 'FIRST':
      return FIRST_FLOOR_ENTITIES;
    case 'SECOND':
      return SECOND_FLOOR_ENTITIES;
    case 'TERRACE':
      return TERRACE_ENTITIES;
    default:
      return GROUND_FLOOR_ENTITIES;
  }
}

export function findRoomByIdOrName(query?: string): CampusRoomEntity | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase().trim();
  return ALL_CAMPUS_ENTITIES.find(
    (e) => e.id.toLowerCase() === q || e.name.toLowerCase().includes(q) || (e.code && e.code.toLowerCase() === q)
  );
}

// -------------------------------------------------------------
// MULTI-FLOOR NAVIGATION WAYPOINTS
// -------------------------------------------------------------
export const ALL_CAMPUS_WAYPOINTS: MultiFloorWaypoint[] = [
  // Ground Floor Waypoints
  { id: 'wp-gf-entrance', floor: 'GROUND', name: 'Main Campus Gate Entrance', x: 500, y: 150, type: 'ENTRANCE' },
  { id: 'wp-gf-coe-door', floor: 'GROUND', name: 'COE Hall Entrance', x: 330, y: 215, type: 'DOOR' },
  { id: 'wp-gf-hub', floor: 'GROUND', name: 'Ground Floor Central Hub', x: 500, y: 480, type: 'HUB' },
  { id: 'wp-gf-hub-n', floor: 'GROUND', name: 'Ground Hub North Corridor', x: 500, y: 375, type: 'CORRIDOR' },
  { id: 'wp-gf-hub-ne', floor: 'GROUND', name: 'Ground Hub Northeast Corridor', x: 580, y: 415, type: 'CORRIDOR' },
  { id: 'wp-gf-hub-se', floor: 'GROUND', name: 'Ground Hub Southeast Corridor', x: 560, y: 550, type: 'CORRIDOR' },
  { id: 'wp-gf-hub-s', floor: 'GROUND', name: 'Ground Hub South Corridor', x: 450, y: 575, type: 'CORRIDOR' },
  { id: 'wp-gf-hub-sw', floor: 'GROUND', name: 'Ground Hub Southwest Corridor', x: 380, y: 550, type: 'CORRIDOR' },
  { id: 'wp-gf-hub-nw', floor: 'GROUND', name: 'Ground Hub Northwest Corridor', x: 395, y: 415, type: 'CORRIDOR' },
  { id: 'wp-gf-mon-door', floor: 'GROUND', name: 'Monitoring Room Entrance', x: 395, y: 340, type: 'DOOR' },
  { id: 'wp-gf-lab1-door', floor: 'GROUND', name: 'Lab 1 Entrance', x: 360, y: 395, type: 'DOOR' },
  { id: 'wp-gf-staff-door', floor: 'GROUND', name: 'Staff Room Entrance', x: 355, y: 480, type: 'DOOR' },
  { id: 'wp-gf-str-w', floor: 'GROUND', name: 'Ground West Stairs Landing', x: 325, y: 575, type: 'STAIRS' },
  { id: 'wp-gf-lift', floor: 'GROUND', name: 'Ground Central Lift', x: 480, y: 345, type: 'LIFT' },
  { id: 'wp-gf-gents-door', floor: 'GROUND', name: 'Gents Restroom Entrance', x: 340, y: 640, type: 'DOOR' },
  { id: 'wp-gf-seminar-door', floor: 'GROUND', name: 'Seminar Hall Stage Entrance', x: 445, y: 625, type: 'DOOR' },
  { id: 'wp-gf-ladies-door', floor: 'GROUND', name: 'Ladies Restroom Entrance', x: 560, y: 635, type: 'DOOR' },
  { id: 'wp-gf-office-door', floor: 'GROUND', name: 'Office Entrance', x: 575, y: 515, type: 'DOOR' },
  { id: 'wp-gf-str-e', floor: 'GROUND', name: 'Ground East Stairs Landing', x: 580, y: 385, type: 'STAIRS' },
  { id: 'wp-gf-exam-door', floor: 'GROUND', name: 'Exam Cell Entrance', x: 595, y: 335, type: 'DOOR' },
  { id: 'wp-gf-empty-door', floor: 'GROUND', name: 'Empty Space Entrance', x: 535, y: 345, type: 'DOOR' },

  // First Floor Waypoints
  { id: 'wp-1f-hub', floor: 'FIRST', name: 'First Floor Central Atrium', x: 500, y: 480, type: 'HUB' },
  { id: 'wp-1f-hub-w', floor: 'FIRST', name: 'First Floor West Corridor', x: 380, y: 480, type: 'CORRIDOR' },
  { id: 'wp-1f-hub-e', floor: 'FIRST', name: 'First Floor East Corridor', x: 580, y: 480, type: 'CORRIDOR' },
  { id: 'wp-1f-str-w', floor: 'FIRST', name: 'First Floor West Stairs Landing', x: 325, y: 575, type: 'STAIRS' },
  { id: 'wp-1f-str-e', floor: 'FIRST', name: 'First Floor East Stairs Landing', x: 580, y: 385, type: 'STAIRS' },
  { id: 'wp-1f-lift', floor: 'FIRST', name: 'First Floor Central Lift', x: 480, y: 345, type: 'LIFT' },
  { id: 'wp-1f-lab2-door', floor: 'FIRST', name: 'AI Research Lab 2 Entrance', x: 400, y: 350, type: 'DOOR' },
  { id: 'wp-1f-lab3-door', floor: 'FIRST', name: 'IoT Lab 3 Entrance', x: 360, y: 420, type: 'DOOR' },
  { id: 'wp-1f-fac-door', floor: 'FIRST', name: 'Faculty Suite 1F Entrance', x: 355, y: 480, type: 'DOOR' },
  { id: 'wp-1f-theatre-door', floor: 'FIRST', name: 'Smart Theatre 101 Entrance', x: 445, y: 625, type: 'DOOR' },
  { id: 'wp-1f-cr102-door', floor: 'FIRST', name: 'Classroom 102 Entrance', x: 575, y: 515, type: 'DOOR' },
  { id: 'wp-1f-lib-door', floor: 'FIRST', name: 'Digital Library Entrance', x: 540, y: 345, type: 'DOOR' },

  // Second Floor Waypoints
  { id: 'wp-2f-hub', floor: 'SECOND', name: 'Second Floor Central Gallery', x: 500, y: 480, type: 'HUB' },
  { id: 'wp-2f-hub-w', floor: 'SECOND', name: 'Second Floor West Corridor', x: 380, y: 480, type: 'CORRIDOR' },
  { id: 'wp-2f-hub-e', floor: 'SECOND', name: 'Second Floor East Corridor', x: 580, y: 480, type: 'CORRIDOR' },
  { id: 'wp-2f-str-w', floor: 'SECOND', name: 'Second Floor West Stairs Landing', x: 325, y: 575, type: 'STAIRS' },
  { id: 'wp-2f-str-e', floor: 'SECOND', name: 'Second Floor East Stairs Landing', x: 580, y: 385, type: 'STAIRS' },
  { id: 'wp-2f-lift', floor: 'SECOND', name: 'Second Floor Central Lift', x: 480, y: 345, type: 'LIFT' },
  { id: 'wp-2f-lab4-door', floor: 'SECOND', name: 'Robotics Lab 4 Entrance', x: 400, y: 350, type: 'DOOR' },
  { id: 'wp-2f-cr201-door', floor: 'SECOND', name: 'Studio 201 Entrance', x: 360, y: 420, type: 'DOOR' },
  { id: 'wp-2f-inc-door', floor: 'SECOND', name: 'Incubator Suite Entrance', x: 355, y: 480, type: 'DOOR' },
  { id: 'wp-2f-sem-door', floor: 'SECOND', name: 'Seminar Room 201 Entrance', x: 445, y: 625, type: 'DOOR' },
  { id: 'wp-2f-cr202-door', floor: 'SECOND', name: 'Classroom 202 Entrance', x: 575, y: 515, type: 'DOOR' },

  // Terrace Waypoints
  { id: 'wp-tr-deck', floor: 'TERRACE', name: 'Terrace Open Central Deck', x: 500, y: 480, type: 'HUB' },
  { id: 'wp-tr-lift', floor: 'TERRACE', name: 'Terrace Elevator Penthouse', x: 480, y: 360, type: 'LIFT' },
  { id: 'wp-tr-str-w', floor: 'TERRACE', name: 'Terrace West Stairs Exit', x: 330, y: 550, type: 'STAIRS' },
  { id: 'wp-tr-str-e', floor: 'TERRACE', name: 'Terrace East Stairs Exit', x: 600, y: 550, type: 'STAIRS' },
  { id: 'wp-tr-cr1-door', floor: 'TERRACE', name: 'Open Classroom 1 Entrance', x: 360, y: 380, type: 'DOOR' },
  { id: 'wp-tr-cr2-door', floor: 'TERRACE', name: 'Open Classroom 2 Entrance', x: 640, y: 380, type: 'DOOR' },
];

// Multi-Floor Navigation Edges (Horizontal corridors + Vertical stairs & lifts)
export const ALL_CAMPUS_EDGES: MultiFloorEdge[] = [
  // Ground Floor Horizontal
  { from: 'wp-gf-entrance', to: 'wp-gf-hub-n', distanceMeters: 10 },
  { from: 'wp-gf-entrance', to: 'wp-gf-coe-door', distanceMeters: 6 },
  { from: 'wp-gf-hub', to: 'wp-gf-hub-n', distanceMeters: 8 },
  { from: 'wp-gf-hub', to: 'wp-gf-hub-ne', distanceMeters: 7 },
  { from: 'wp-gf-hub', to: 'wp-gf-hub-se', distanceMeters: 7 },
  { from: 'wp-gf-hub', to: 'wp-gf-hub-s', distanceMeters: 8 },
  { from: 'wp-gf-hub', to: 'wp-gf-hub-sw', distanceMeters: 7 },
  { from: 'wp-gf-hub', to: 'wp-gf-hub-nw', distanceMeters: 7 },
  { from: 'wp-gf-hub-n', to: 'wp-gf-lift', distanceMeters: 5 },
  { from: 'wp-gf-hub-nw', to: 'wp-gf-mon-door', distanceMeters: 6 },
  { from: 'wp-gf-hub-nw', to: 'wp-gf-lab1-door', distanceMeters: 4 },
  { from: 'wp-gf-hub-sw', to: 'wp-gf-staff-door', distanceMeters: 5 },
  { from: 'wp-gf-hub-sw', to: 'wp-gf-str-w', distanceMeters: 6 },
  { from: 'wp-gf-hub-s', to: 'wp-gf-gents-door', distanceMeters: 6 },
  { from: 'wp-gf-hub-s', to: 'wp-gf-seminar-door', distanceMeters: 4 },
  { from: 'wp-gf-hub-se', to: 'wp-gf-ladies-door', distanceMeters: 6 },
  { from: 'wp-gf-hub-se', to: 'wp-gf-office-door', distanceMeters: 5 },
  { from: 'wp-gf-hub-ne', to: 'wp-gf-str-e', distanceMeters: 5 },
  { from: 'wp-gf-hub-ne', to: 'wp-gf-exam-door', distanceMeters: 8 },
  { from: 'wp-gf-hub-n', to: 'wp-gf-empty-door', distanceMeters: 4 },

  // First Floor Horizontal
  { from: 'wp-1f-hub', to: 'wp-1f-hub-w', distanceMeters: 8 },
  { from: 'wp-1f-hub', to: 'wp-1f-hub-e', distanceMeters: 8 },
  { from: 'wp-1f-hub', to: 'wp-1f-lift', distanceMeters: 6 },
  { from: 'wp-1f-hub-w', to: 'wp-1f-lab2-door', distanceMeters: 6 },
  { from: 'wp-1f-hub-w', to: 'wp-1f-lab3-door', distanceMeters: 5 },
  { from: 'wp-1f-hub-w', to: 'wp-1f-fac-door', distanceMeters: 5 },
  { from: 'wp-1f-hub-w', to: 'wp-1f-str-w', distanceMeters: 7 },
  { from: 'wp-1f-hub', to: 'wp-1f-theatre-door', distanceMeters: 7 },
  { from: 'wp-1f-hub-e', to: 'wp-1f-cr102-door', distanceMeters: 6 },
  { from: 'wp-1f-hub-e', to: 'wp-1f-str-e', distanceMeters: 6 },
  { from: 'wp-1f-hub-e', to: 'wp-1f-lib-door', distanceMeters: 6 },

  // Second Floor Horizontal
  { from: 'wp-2f-hub', to: 'wp-2f-hub-w', distanceMeters: 8 },
  { from: 'wp-2f-hub', to: 'wp-2f-hub-e', distanceMeters: 8 },
  { from: 'wp-2f-hub', to: 'wp-2f-lift', distanceMeters: 6 },
  { from: 'wp-2f-hub-w', to: 'wp-2f-lab4-door', distanceMeters: 6 },
  { from: 'wp-2f-hub-w', to: 'wp-2f-cr201-door', distanceMeters: 5 },
  { from: 'wp-2f-hub-w', to: 'wp-2f-inc-door', distanceMeters: 5 },
  { from: 'wp-2f-hub-w', to: 'wp-2f-str-w', distanceMeters: 7 },
  { from: 'wp-2f-hub', to: 'wp-2f-sem-door', distanceMeters: 7 },
  { from: 'wp-2f-hub-e', to: 'wp-2f-cr202-door', distanceMeters: 6 },
  { from: 'wp-2f-hub-e', to: 'wp-2f-str-e', distanceMeters: 6 },

  // Terrace Horizontal
  { from: 'wp-tr-deck', to: 'wp-tr-lift', distanceMeters: 6 },
  { from: 'wp-tr-deck', to: 'wp-tr-str-w', distanceMeters: 9 },
  { from: 'wp-tr-deck', to: 'wp-tr-str-e', distanceMeters: 9 },
  { from: 'wp-tr-deck', to: 'wp-tr-cr1-door', distanceMeters: 8 },
  { from: 'wp-tr-deck', to: 'wp-tr-cr2-door', distanceMeters: 8 },

  // =========================================================
  // VERTICAL TRANSITIONS: WEST STAIRS
  // =========================================================
  { from: 'wp-gf-str-w', to: 'wp-1f-str-w', distanceMeters: 12, isStair: true },
  { from: 'wp-1f-str-w', to: 'wp-2f-str-w', distanceMeters: 12, isStair: true },
  { from: 'wp-2f-str-w', to: 'wp-tr-str-w', distanceMeters: 12, isStair: true },

  // =========================================================
  // VERTICAL TRANSITIONS: EAST STAIRS
  // =========================================================
  { from: 'wp-gf-str-e', to: 'wp-1f-str-e', distanceMeters: 12, isStair: true },
  { from: 'wp-1f-str-e', to: 'wp-2f-str-e', distanceMeters: 12, isStair: true },
  { from: 'wp-2f-str-e', to: 'wp-tr-str-e', distanceMeters: 12, isStair: true },

  // =========================================================
  // VERTICAL TRANSITIONS: ELEVATOR SHAFT
  // =========================================================
  { from: 'wp-gf-lift', to: 'wp-1f-lift', distanceMeters: 10, isElevator: true },
  { from: 'wp-1f-lift', to: 'wp-2f-lift', distanceMeters: 10, isElevator: true },
  { from: 'wp-2f-lift', to: 'wp-tr-lift', distanceMeters: 10, isElevator: true },
];

// Helper to compute shortest route between any two waypoints across any floor
export function calculateMultiFloorRoute(
  originWpId: string,
  destWpId: string,
  blockedEdgeOrNodeIds?: string[]
): {
  path: MultiFloorWaypoint[];
  distanceMeters: number;
  estimatedSeconds: number;
  floorTransitions: { fromFloor: FloorLevel; toFloor: FloorLevel; via: 'STAIRS' | 'ELEVATOR' }[];
  steps: { instruction: string; distance: string; floor: FloorLevel }[];
} {
  const blockedSet = new Set(blockedEdgeOrNodeIds || []);
  const adj = new Map<string, { to: string; dist: number; isStair?: boolean; isElevator?: boolean }[]>();

  ALL_CAMPUS_WAYPOINTS.forEach((wp) => adj.set(wp.id, []));

  ALL_CAMPUS_EDGES.forEach((edge) => {
    if (blockedSet.has(edge.from) || blockedSet.has(edge.to)) return;

    adj.get(edge.from)?.push({
      to: edge.to,
      dist: edge.distanceMeters,
      isStair: edge.isStair,
      isElevator: edge.isElevator,
    });
    adj.get(edge.to)?.push({
      to: edge.from,
      dist: edge.distanceMeters,
      isStair: edge.isStair,
      isElevator: edge.isElevator,
    });
  });

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  ALL_CAMPUS_WAYPOINTS.forEach((wp) => {
    distances.set(wp.id, Infinity);
    previous.set(wp.id, null);
    if (!blockedSet.has(wp.id)) {
      unvisited.add(wp.id);
    }
  });

  distances.set(originWpId, 0);

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let minDist = Infinity;
    unvisited.forEach((id) => {
      const d = distances.get(id)!;
      if (d < minDist) {
        minDist = d;
        currentId = id;
      }
    });

    if (currentId === null || minDist === Infinity || currentId === destWpId) {
      break;
    }

    unvisited.delete(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.to)) continue;
      const alt = minDist + neighbor.dist;
      if (alt < distances.get(neighbor.to)!) {
        distances.set(neighbor.to, alt);
        previous.set(neighbor.to, currentId);
      }
    }
  }

  const pathIds: string[] = [];
  let curr: string | null = destWpId;
  while (curr !== null) {
    pathIds.unshift(curr);
    curr = previous.get(curr) || null;
  }

  const path = pathIds
    .map((id) => ALL_CAMPUS_WAYPOINTS.find((wp) => wp.id === id))
    .filter((wp): wp is MultiFloorWaypoint => Boolean(wp));

  const totalDistance = distances.get(destWpId) ?? 24;
  const estimatedSeconds = Math.round(totalDistance / 1.1);

  // Detect floor transitions
  const floorTransitions: { fromFloor: FloorLevel; toFloor: FloorLevel; via: 'STAIRS' | 'ELEVATOR' }[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    if (path[i].floor !== path[i + 1].floor) {
      const isElev = path[i].type === 'LIFT' || path[i + 1].type === 'LIFT';
      floorTransitions.push({
        fromFloor: path[i].floor,
        toFloor: path[i + 1].floor,
        via: isElev ? 'ELEVATOR' : 'STAIRS',
      });
    }
  }

  const steps = path.slice(0, -1).map((wp, i) => {
    const nextWp = path[i + 1];
    let instruction = `Walk from ${wp.name} to ${nextWp.name}`;
    if (wp.floor !== nextWp.floor) {
      const via = wp.type === 'LIFT' ? 'Elevator' : 'Stairs';
      instruction = `Take ${via} from ${wp.floor} Floor to ${nextWp.floor} Floor`;
    }
    return {
      instruction,
      distance: `${Math.round(Math.hypot(nextWp.x - wp.x, nextWp.y - wp.y) * 0.12 + 4)}m`,
      floor: wp.floor,
    };
  });

  return {
    path,
    distanceMeters: Math.round(totalDistance),
    estimatedSeconds,
    floorTransitions,
    steps: steps.length > 0 ? steps : [{ instruction: 'Proceed directly to destination', distance: '12m', floor: 'GROUND' }],
  };
}
