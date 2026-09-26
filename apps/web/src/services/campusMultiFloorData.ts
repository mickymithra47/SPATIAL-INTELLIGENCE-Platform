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
// GROUND FLOOR (ESEC Blueprint + Open Corridor Hallway Setbacks)
// -------------------------------------------------------------
export const GROUND_FLOOR_ENTITIES: CampusRoomEntity[] = [
  {
    id: 'GF-COR-01',
    code: 'HUB-00',
    name: 'Central Corridor',
    refLabel: 'CENTRAL CORRIDOR',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'CENTRAL_HUB',
    areaM2: 250,
    capacity: 120,
    operationalStatus: 'AVAILABLE',
    equipment: ['Interactive Campus Kiosk', 'Directional Signage Array', 'Hexagonal Atrium Planter'],
    department: 'Campus Central Circulation',
    description: 'Central regular hexagonal atrium hub connecting to North, East, West, and South circulation corridors.',
    position: { labelX: 500, labelY: 475, entranceX: 500, entranceY: 475 },
    polygon: [
      { x: 500, y: 400 },
      { x: 565, y: 435 },
      { x: 565, y: 515 },
      { x: 500, y: 550 },
      { x: 435, y: 515 },
      { x: 435, y: 435 },
    ],
    color: {
      fill: 'rgba(30, 41, 59, 0.75)',
      stroke: 'rgba(56, 189, 248, 0.95)',
      glow: 'rgba(56, 189, 248, 0.5)',
      badge: '#38bdf8',
    },
    connectedWaypoints: ['wp-gf-corridor'],
  },
  {
    id: 'GF-ENT-01',
    code: 'ENT-00',
    name: 'Main Entrance',
    refLabel: 'MAIN ENTRANCE',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'CIRCULATION',
    areaM2: 85,
    capacity: 60,
    operationalStatus: 'AVAILABLE',
    equipment: ['Turnstile Gateways', 'Security Desk', 'Campus Map Directory'],
    department: 'Main Entry Security',
    description: 'Main southern entrance foyer and corridor providing access (IN ⇑) to the Central Corridor.',
    position: { labelX: 500, labelY: 700, entranceX: 500, entranceY: 550 },
    polygon: [
      { x: 435, y: 515 },
      { x: 500, y: 550 },
      { x: 565, y: 515 },
      { x: 560, y: 810 },
      { x: 440, y: 810 },
    ],
    color: {
      fill: 'rgba(18, 76, 64, 0.65)',
      stroke: 'rgba(30, 200, 159, 0.9)',
      glow: 'rgba(30, 200, 159, 0.5)',
      badge: '#10b981',
    },
    connectedWaypoints: ['wp-gf-entrance'],
  },
  {
    id: 'GF-COE-01',
    code: 'COE-01',
    name: 'COE Hall',
    refLabel: 'COE HALL',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'SEMINAR_HALL',
    areaM2: 160,
    capacity: 85,
    operationalStatus: 'AVAILABLE',
    equipment: ['Smart Telepresence Console', 'Acoustic Wall Paneling', 'Dual 4K Displays'],
    department: 'Centre of Excellence',
    description: 'COE Hall located on the western wing, separated from Central Hub by a 25px wide West Corridor hallway.',
    position: { labelX: 275, labelY: 530, entranceX: 410, entranceY: 485 },
    polygon: [
      { x: 410, y: 440 },
      { x: 410, y: 530 },
      { x: 420, y: 810 },
      { x: 250, y: 770 },
      { x: 160, y: 550 },
      { x: 230, y: 180 },
      { x: 330, y: 380 },
    ],
    color: {
      fill: 'rgba(70, 36, 92, 0.65)',
      stroke: 'rgba(148, 70, 200, 0.9)',
      glow: 'rgba(148, 70, 200, 0.5)',
      badge: '#a855f7',
    },
    connectedWaypoints: ['wp-gf-coe-door'],
  },
  {
    id: 'GF-LAD-01',
    code: 'RR-LAD',
    name: 'Ladies Toilet',
    refLabel: 'LADIES TOILET',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'RESTROOM',
    areaM2: 50,
    capacity: 15,
    operationalStatus: 'AVAILABLE',
    equipment: ['Automated Sensor Faucets', 'Vanity Mirror Array', 'Ventilation System'],
    department: 'Public Amenities',
    description: 'Ladies Toilet on the upper-western wing, accessible via North Corridor hallway.',
    position: { labelX: 365, labelY: 270, entranceX: 450, entranceY: 375 },
    polygon: [
      { x: 490, y: 375 },
      { x: 415, y: 415 },
      { x: 335, y: 360 },
      { x: 235, y: 175 },
      { x: 490, y: 175 },
    ],
    color: {
      fill: 'rgba(84, 45, 78, 0.65)',
      stroke: 'rgba(168, 80, 157, 0.9)',
      glow: 'rgba(168, 80, 157, 0.5)',
      badge: '#ec4899',
    },
    connectedWaypoints: ['wp-gf-ladies-door'],
  },
  {
    id: 'GF-SEM-01',
    code: 'SEM-01',
    name: 'Main Block Seminar Hall',
    refLabel: 'MAIN BLOCK SEMINAR HALL',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'SEMINAR_HALL',
    areaM2: 220,
    capacity: 120,
    operationalStatus: 'AVAILABLE',
    equipment: ['4K Laser Auditorium Projector', 'Dolby Surround Sound System', 'Tiered Amphitheater Seating', 'Stage Podium'],
    department: 'Main Block Academic Affairs',
    description: 'Main Block Seminar Hall on the upper-eastern wing, accessible via North Corridor hallway.',
    position: { labelX: 635, labelY: 270, entranceX: 550, entranceY: 375 },
    polygon: [
      { x: 510, y: 375 },
      { x: 585, y: 415 },
      { x: 665, y: 360 },
      { x: 785, y: 360 },
      { x: 750, y: 175 },
      { x: 510, y: 175 },
    ],
    color: {
      fill: 'rgba(97, 28, 38, 0.65)',
      stroke: 'rgba(200, 56, 77, 0.9)',
      glow: 'rgba(200, 56, 77, 0.5)',
      badge: '#f43f5e',
    },
    connectedWaypoints: ['wp-gf-seminar-door'],
  },
  {
    id: 'GF-GEN-01',
    code: 'RR-GEN',
    name: 'Gents Toilet',
    refLabel: 'GENTS TOILET',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'RESTROOM',
    areaM2: 43,
    capacity: 15,
    operationalStatus: 'AVAILABLE',
    equipment: ['Sensor Urinals & Stalls', 'Automated Soap Dispensers', 'Exhaust Ventilation'],
    department: 'Public Amenities',
    description: 'Gents Toilet on the eastern wing, accessible via 35px wide East Corridor hallway.',
    position: { labelX: 710, labelY: 425, entranceX: 600, entranceY: 445 },
    polygon: [
      { x: 600, y: 400 },
      { x: 665, y: 365 },
      { x: 785, y: 365 },
      { x: 785, y: 485 },
      { x: 650, y: 485 },
      { x: 650, y: 445 },
      { x: 600, y: 445 },
    ],
    color: {
      fill: 'rgba(27, 58, 96, 0.65)',
      stroke: 'rgba(59, 122, 200, 0.9)',
      glow: 'rgba(59, 122, 200, 0.5)',
      badge: '#3b82f6',
    },
    connectedWaypoints: ['wp-gf-gents-door'],
  },
  {
    id: 'GF-LFT-01',
    code: 'LFT-01',
    name: 'Central Lift Core',
    refLabel: 'ELEVATOR CORE',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'LIFT',
    areaM2: 15,
    capacity: 8,
    operationalStatus: 'AVAILABLE',
    equipment: ['ADA Braille Panel', 'Emergency Call System', 'Sensor Doors'],
    department: 'Vertical Accessibility',
    description: 'Central elevator core sitting off East Corridor hallway with 35px open pedestrian circulation space.',
    position: { labelX: 625, labelY: 468, entranceX: 600, entranceY: 468 },
    polygon: [
      { x: 600, y: 445 },
      { x: 650, y: 445 },
      { x: 650, y: 490 },
      { x: 600, y: 490 },
    ],
    color: {
      fill: 'rgba(6, 182, 212, 0.45)',
      stroke: 'rgba(6, 182, 212, 0.95)',
      glow: 'rgba(6, 182, 212, 0.6)',
      badge: '#06b6d4',
    },
    connectedWaypoints: ['wp-gf-lift'],
  },
  {
    id: 'GF-STR-01',
    code: 'STR-UP',
    name: 'Upstairs Staircase',
    refLabel: 'UPSTAIRS',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'STAIRS',
    areaM2: 35,
    capacity: 30,
    operationalStatus: 'AVAILABLE',
    equipment: ['Emergency Lighting', 'Tactile Handrails', 'Upward Signage'],
    department: 'Vertical Circulation',
    description: 'Upstairs staircase core sitting off East Corridor hallway with 35px open pedestrian circulation space.',
    position: { labelX: 690, labelY: 520, entranceX: 600, entranceY: 512 },
    polygon: [
      { x: 600, y: 495 },
      { x: 785, y: 495 },
      { x: 765, y: 545 },
      { x: 600, y: 525 },
    ],
    color: {
      fill: 'rgba(96, 75, 28, 0.65)',
      stroke: 'rgba(192, 152, 56, 0.9)',
      glow: 'rgba(192, 152, 56, 0.5)',
      badge: '#f59e0b',
    },
    connectedWaypoints: ['wp-gf-str-e'],
  },
  {
    id: 'GF-CCTV-01',
    code: 'CCTV-01',
    name: 'CCTV Monitoring Room',
    refLabel: 'CCTV MONITORING ROOM',
    floor: 'GROUND',
    floorNumber: 0,
    type: 'MONITORING',
    areaM2: 110,
    capacity: 25,
    operationalStatus: 'AVAILABLE',
    equipment: ['High-Definition CCTV Telemetry Wall', 'Security Gateway Servers', 'Emergency Command Consoles'],
    department: 'Campus Safety & Operations',
    description: 'CCTV Monitoring Room on the lower-eastern wing, accessible via East Corridor hallway.',
    position: { labelX: 645, labelY: 675, entranceX: 600, entranceY: 535 },
    polygon: [
      { x: 600, y: 535 },
      { x: 785, y: 555 },
      { x: 735, y: 775 },
      { x: 510, y: 810 },
      { x: 575, y: 810 },
    ],
    color: {
      fill: 'rgba(24, 76, 110, 0.65)',
      stroke: 'rgba(56, 189, 248, 0.9)',
      glow: 'rgba(56, 189, 248, 0.5)',
      badge: '#38bdf8',
    },
    connectedWaypoints: ['wp-gf-cctv-door'],
  },
];

// -------------------------------------------------------------
// FIRST FLOOR ENTITIES (Classrooms 101-105 + Open Corridor Setbacks)
// -------------------------------------------------------------
export const FIRST_FLOOR_ENTITIES: CampusRoomEntity[] = [
  {
    id: '1F-HUB-01',
    code: '1F-HUB',
    name: 'First Floor Central Atrium',
    refLabel: 'ATRIUM LEVEL 1',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'CENTRAL_HUB',
    areaM2: 180,
    capacity: 80,
    operationalStatus: 'AVAILABLE',
    equipment: ['Digital Notice Boards', 'Study Bar Stools', 'WiFi 6 Access Points'],
    department: 'First Floor Common Circulation',
    description: 'Central circular gallery looking down into Ground Floor hexagonal atrium.',
    position: { labelX: 500, labelY: 475, entranceX: 500, entranceY: 475 },
    polygon: [
      { x: 500, y: 400 },
      { x: 565, y: 435 },
      { x: 565, y: 515 },
      { x: 500, y: 550 },
      { x: 435, y: 515 },
      { x: 435, y: 435 },
    ],
    color: {
      fill: 'rgba(56, 189, 248, 0.12)',
      stroke: 'rgba(56, 189, 248, 0.7)',
      glow: 'rgba(56, 189, 248, 0.4)',
      badge: '#38bdf8',
    },
    connectedWaypoints: ['wp-1f-hub'],
  },
  {
    id: '1F-ENT-01',
    code: '1F-ENT',
    name: 'Main Foyer 1F',
    refLabel: 'FOYER LEVEL 1',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'CIRCULATION',
    areaM2: 85,
    capacity: 60,
    operationalStatus: 'AVAILABLE',
    equipment: ['Upper Foyer Seating', 'Notice Display'],
    department: 'First Floor Circulation',
    description: 'Southern circulation foyer above Main Entrance.',
    position: { labelX: 500, labelY: 700, entranceX: 500, entranceY: 550 },
    polygon: [
      { x: 435, y: 515 },
      { x: 500, y: 550 },
      { x: 565, y: 515 },
      { x: 560, y: 810 },
      { x: 440, y: 810 },
    ],
    color: {
      fill: 'rgba(16, 185, 129, 0.12)',
      stroke: 'rgba(16, 185, 129, 0.7)',
      glow: 'rgba(16, 185, 129, 0.4)',
      badge: '#10b981',
    },
    connectedWaypoints: ['wp-1f-foyer'],
  },
  {
    id: '1F-CR-101',
    code: '1F-CR-101',
    name: 'Classroom 101',
    refLabel: 'CLASSROOM 101',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'CLASSROOM',
    areaM2: 160,
    capacity: 75,
    operationalStatus: 'AVAILABLE',
    equipment: ['Smart Board Array', 'Ergonomic Student Benches', 'High-Speed WiFi 6'],
    department: 'Computer Science & Engineering',
    description: 'Spacious academic classroom on West Wing.',
    position: { labelX: 275, labelY: 530, entranceX: 410, entranceY: 485 },
    polygon: [
      { x: 410, y: 440 },
      { x: 410, y: 530 },
      { x: 420, y: 810 },
      { x: 250, y: 770 },
      { x: 160, y: 550 },
      { x: 230, y: 180 },
      { x: 330, y: 380 },
    ],
    color: {
      fill: 'rgba(99, 102, 241, 0.18)',
      stroke: 'rgba(99, 102, 241, 0.85)',
      glow: 'rgba(99, 102, 241, 0.5)',
      badge: '#6366f1',
    },
    connectedWaypoints: ['wp-1f-lab2-door'],
  },
  {
    id: '1F-CR-102',
    code: '1F-CR-102',
    name: 'Classroom 102',
    refLabel: 'CLASSROOM 102',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'CLASSROOM',
    areaM2: 50,
    capacity: 40,
    operationalStatus: 'AVAILABLE',
    equipment: ['Interactive Screen', 'Air Conditioning', 'Audio System'],
    department: 'Computer Science & Engineering',
    description: 'Academic classroom on Upper-West Wing.',
    position: { labelX: 365, labelY: 270, entranceX: 450, entranceY: 375 },
    polygon: [
      { x: 490, y: 375 },
      { x: 415, y: 415 },
      { x: 335, y: 360 },
      { x: 235, y: 175 },
      { x: 490, y: 175 },
    ],
    color: {
      fill: 'rgba(34, 197, 94, 0.18)',
      stroke: 'rgba(34, 197, 94, 0.85)',
      glow: 'rgba(34, 197, 94, 0.5)',
      badge: '#22c55e',
    },
    connectedWaypoints: ['wp-1f-fac-door'],
  },
  {
    id: '1F-CR-103',
    code: '1F-CR-103',
    name: 'Classroom 103',
    refLabel: 'CLASSROOM 103',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'CLASSROOM',
    areaM2: 220,
    capacity: 60,
    operationalStatus: 'AVAILABLE',
    equipment: ['Dual Laser Projectors', 'Tiered Seating', 'Surround Sound'],
    department: 'Computer Science & Engineering',
    description: 'Large lecture classroom on Upper-East Wing.',
    position: { labelX: 635, labelY: 270, entranceX: 550, entranceY: 375 },
    polygon: [
      { x: 510, y: 375 },
      { x: 585, y: 415 },
      { x: 665, y: 360 },
      { x: 785, y: 360 },
      { x: 750, y: 175 },
      { x: 510, y: 175 },
    ],
    color: {
      fill: 'rgba(236, 72, 153, 0.18)',
      stroke: 'rgba(236, 72, 153, 0.85)',
      glow: 'rgba(236, 72, 153, 0.5)',
      badge: '#ec4899',
    },
    connectedWaypoints: ['wp-1f-theatre-door'],
  },
  {
    id: '1F-CR-104',
    code: '1F-CR-104',
    name: 'Classroom 104',
    refLabel: 'CLASSROOM 104',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'CLASSROOM',
    areaM2: 45,
    capacity: 35,
    operationalStatus: 'AVAILABLE',
    equipment: ['Digital Display Panel', 'Modular Study Desks'],
    department: 'Computer Science & Engineering',
    description: 'Academic classroom on East Wing.',
    position: { labelX: 710, labelY: 425, entranceX: 600, entranceY: 445 },
    polygon: [
      { x: 600, y: 400 },
      { x: 665, y: 365 },
      { x: 785, y: 365 },
      { x: 785, y: 485 },
      { x: 650, y: 485 },
      { x: 650, y: 445 },
      { x: 600, y: 445 },
    ],
    color: {
      fill: 'rgba(14, 165, 233, 0.18)',
      stroke: 'rgba(14, 165, 233, 0.85)',
      glow: 'rgba(14, 165, 233, 0.5)',
      badge: '#0ea5e9',
    },
    connectedWaypoints: ['wp-1f-lib-door'],
  },
  {
    id: '1F-LFT-01',
    code: 'LFT-1F',
    name: 'Central Lift Core',
    refLabel: 'ELEVATOR CORE',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'LIFT',
    areaM2: 15,
    capacity: 8,
    operationalStatus: 'AVAILABLE',
    equipment: ['Braille Call Panel', 'Safety Sensor Door'],
    department: 'Vertical Accessibility',
    description: 'Elevator lobby and shaft core on First Floor.',
    position: { labelX: 625, labelY: 468, entranceX: 600, entranceY: 468 },
    polygon: [
      { x: 600, y: 445 },
      { x: 650, y: 445 },
      { x: 650, y: 490 },
      { x: 600, y: 490 },
    ],
    color: {
      fill: 'rgba(6, 182, 212, 0.45)',
      stroke: 'rgba(6, 182, 212, 0.95)',
      glow: 'rgba(6, 182, 212, 0.6)',
      badge: '#06b6d4',
    },
    connectedWaypoints: ['wp-1f-lift'],
  },
  {
    id: '1F-STR-01',
    code: 'STR-1F',
    name: 'Upstairs Staircase',
    refLabel: 'UPSTAIRS',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'STAIRS',
    areaM2: 35,
    capacity: 30,
    operationalStatus: 'AVAILABLE',
    equipment: ['Emergency Lighting', 'Tactile Handrails', 'Upward Signage'],
    department: 'Vertical Circulation',
    description: 'First Floor staircase landing vertically aligned with Ground Floor.',
    position: { labelX: 690, labelY: 520, entranceX: 600, entranceY: 512 },
    polygon: [
      { x: 600, y: 495 },
      { x: 785, y: 495 },
      { x: 765, y: 545 },
      { x: 600, y: 525 },
    ],
    color: {
      fill: 'rgba(96, 75, 28, 0.65)',
      stroke: 'rgba(192, 152, 56, 0.9)',
      glow: 'rgba(192, 152, 56, 0.5)',
      badge: '#f59e0b',
    },
    connectedWaypoints: ['wp-1f-str-e'],
  },
  {
    id: '1F-CR-105',
    code: '1F-CR-105',
    name: 'Classroom 105',
    refLabel: 'CLASSROOM 105',
    floor: 'FIRST',
    floorNumber: 1,
    type: 'CLASSROOM',
    areaM2: 110,
    capacity: 60,
    operationalStatus: 'AVAILABLE',
    equipment: ['Interactive Smart Board', 'Ergonomic Benches'],
    department: 'Computer Science & Engineering',
    description: 'Academic classroom on Lower-East Wing.',
    position: { labelX: 645, labelY: 675, entranceX: 600, entranceY: 535 },
    polygon: [
      { x: 600, y: 535 },
      { x: 785, y: 555 },
      { x: 735, y: 775 },
      { x: 510, y: 810 },
      { x: 575, y: 810 },
    ],
    color: {
      fill: 'rgba(16, 185, 129, 0.18)',
      stroke: 'rgba(16, 185, 129, 0.85)',
      glow: 'rgba(16, 185, 129, 0.5)',
      badge: '#10b981',
    },
    connectedWaypoints: ['wp-1f-cr102-door'],
  },
];

// -------------------------------------------------------------
// SECOND FLOOR ENTITIES (Classrooms 201-205 + Open Corridor Setbacks)
// -------------------------------------------------------------
export const SECOND_FLOOR_ENTITIES: CampusRoomEntity[] = [
  {
    id: '2F-HUB-01',
    code: '2F-HUB',
    name: 'Second Floor Innovation Gallery',
    refLabel: 'GALLERY LEVEL 2',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'CENTRAL_HUB',
    areaM2: 180,
    capacity: 80,
    operationalStatus: 'AVAILABLE',
    equipment: ['Exhibition Monitors', 'Open Seating Cubes', 'Power Nodes'],
    department: 'Campus Central Circulation',
    description: 'Upper gallery circulation atrium.',
    position: { labelX: 500, labelY: 475, entranceX: 500, entranceY: 475 },
    polygon: [
      { x: 500, y: 400 },
      { x: 565, y: 435 },
      { x: 565, y: 515 },
      { x: 500, y: 550 },
      { x: 435, y: 515 },
      { x: 435, y: 435 },
    ],
    color: {
      fill: 'rgba(168, 85, 247, 0.12)',
      stroke: 'rgba(168, 85, 247, 0.7)',
      glow: 'rgba(168, 85, 247, 0.4)',
      badge: '#a855f7',
    },
    connectedWaypoints: ['wp-2f-hub'],
  },
  {
    id: '2F-ENT-01',
    code: '2F-ENT',
    name: 'Gallery South Foyer 2F',
    refLabel: 'FOYER LEVEL 2',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'CIRCULATION',
    areaM2: 85,
    capacity: 60,
    operationalStatus: 'AVAILABLE',
    equipment: ['Upper Foyer Seating', 'Interactive Kiosk'],
    department: 'Second Floor Circulation',
    description: 'Southern circulation foyer above First Floor foyer.',
    position: { labelX: 500, labelY: 700, entranceX: 500, entranceY: 550 },
    polygon: [
      { x: 435, y: 515 },
      { x: 500, y: 550 },
      { x: 565, y: 515 },
      { x: 560, y: 810 },
      { x: 440, y: 810 },
    ],
    color: {
      fill: 'rgba(168, 85, 247, 0.12)',
      stroke: 'rgba(168, 85, 247, 0.7)',
      glow: 'rgba(168, 85, 247, 0.4)',
      badge: '#a855f7',
    },
    connectedWaypoints: ['wp-2f-foyer'],
  },
  {
    id: '2F-CR-201',
    code: '2F-CR-201',
    name: 'Classroom 201',
    refLabel: 'CLASSROOM 201',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'CLASSROOM',
    areaM2: 160,
    capacity: 75,
    operationalStatus: 'AVAILABLE',
    equipment: ['High-Def Projection Unit', 'Air Conditioning', 'Collaborative Seating'],
    department: 'Information Technology',
    description: 'Academic classroom on West Wing.',
    position: { labelX: 275, labelY: 530, entranceX: 410, entranceY: 485 },
    polygon: [
      { x: 410, y: 440 },
      { x: 410, y: 530 },
      { x: 420, y: 810 },
      { x: 250, y: 770 },
      { x: 160, y: 550 },
      { x: 230, y: 180 },
      { x: 330, y: 380 },
    ],
    color: {
      fill: 'rgba(239, 68, 68, 0.18)',
      stroke: 'rgba(239, 68, 68, 0.85)',
      glow: 'rgba(239, 68, 68, 0.5)',
      badge: '#ef4444',
    },
    connectedWaypoints: ['wp-2f-lab4-door'],
  },
  {
    id: '2F-CR-202',
    code: '2F-CR-202',
    name: 'Classroom 202',
    refLabel: 'CLASSROOM 202',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'CLASSROOM',
    areaM2: 50,
    capacity: 40,
    operationalStatus: 'AVAILABLE',
    equipment: ['Interactive Screen', 'Digital Podium'],
    department: 'Information Technology',
    description: 'Academic classroom on Upper-West Wing.',
    position: { labelX: 365, labelY: 270, entranceX: 450, entranceY: 375 },
    polygon: [
      { x: 490, y: 375 },
      { x: 415, y: 415 },
      { x: 335, y: 360 },
      { x: 235, y: 175 },
      { x: 490, y: 175 },
    ],
    color: {
      fill: 'rgba(16, 185, 129, 0.18)',
      stroke: 'rgba(16, 185, 129, 0.85)',
      glow: 'rgba(16, 185, 129, 0.5)',
      badge: '#10b981',
    },
    connectedWaypoints: ['wp-2f-inc-door'],
  },
  {
    id: '2F-CR-203',
    code: '2F-CR-203',
    name: 'Classroom 203',
    refLabel: 'CLASSROOM 203',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'CLASSROOM',
    areaM2: 220,
    capacity: 60,
    operationalStatus: 'AVAILABLE',
    equipment: ['Dual Displays', 'Surround Sound', 'Ergonomic Desks'],
    department: 'Information Technology',
    description: 'Large lecture classroom on Upper-East Wing.',
    position: { labelX: 635, labelY: 270, entranceX: 550, entranceY: 375 },
    polygon: [
      { x: 510, y: 375 },
      { x: 585, y: 415 },
      { x: 665, y: 360 },
      { x: 785, y: 360 },
      { x: 750, y: 175 },
      { x: 510, y: 175 },
    ],
    color: {
      fill: 'rgba(217, 70, 239, 0.18)',
      stroke: 'rgba(217, 70, 239, 0.85)',
      glow: 'rgba(217, 70, 239, 0.5)',
      badge: '#d946ef',
    },
    connectedWaypoints: ['wp-2f-sem-door'],
  },
  {
    id: '2F-CR-204',
    code: '2F-CR-204',
    name: 'Classroom 204',
    refLabel: 'CLASSROOM 204',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'CLASSROOM',
    areaM2: 45,
    capacity: 35,
    operationalStatus: 'AVAILABLE',
    equipment: ['Smart Whiteboard', 'Power Outlets'],
    department: 'Information Technology',
    description: 'Academic classroom on East Wing.',
    position: { labelX: 710, labelY: 425, entranceX: 600, entranceY: 445 },
    polygon: [
      { x: 600, y: 400 },
      { x: 665, y: 365 },
      { x: 785, y: 365 },
      { x: 785, y: 485 },
      { x: 650, y: 485 },
      { x: 650, y: 445 },
      { x: 600, y: 445 },
    ],
    color: {
      fill: 'rgba(20, 184, 166, 0.18)',
      stroke: 'rgba(20, 184, 166, 0.85)',
      glow: 'rgba(20, 184, 166, 0.5)',
      badge: '#14b8a6',
    },
    connectedWaypoints: ['wp-2f-res-door'],
  },
  {
    id: '2F-LFT-01',
    code: 'LFT-2F',
    name: 'Central Lift Core',
    refLabel: 'ELEVATOR CORE',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'LIFT',
    areaM2: 15,
    capacity: 8,
    operationalStatus: 'AVAILABLE',
    equipment: ['Floor Indicator Screen'],
    department: 'Vertical Accessibility',
    description: 'Second Floor elevator lobby and shaft core.',
    position: { labelX: 625, labelY: 468, entranceX: 600, entranceY: 468 },
    polygon: [
      { x: 600, y: 445 },
      { x: 650, y: 445 },
      { x: 650, y: 490 },
      { x: 600, y: 490 },
    ],
    color: {
      fill: 'rgba(6, 182, 212, 0.45)',
      stroke: 'rgba(6, 182, 212, 0.95)',
      glow: 'rgba(6, 182, 212, 0.6)',
      badge: '#06b6d4',
    },
    connectedWaypoints: ['wp-2f-lift'],
  },
  {
    id: '2F-STR-01',
    code: 'STR-2F',
    name: 'Upstairs Staircase',
    refLabel: 'UPSTAIRS',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'STAIRS',
    areaM2: 35,
    capacity: 30,
    operationalStatus: 'AVAILABLE',
    equipment: ['Handrails', 'Emergency Signage'],
    department: 'Vertical Circulation',
    description: 'Second Floor staircase landing vertically aligned with Ground & 1st Floor.',
    position: { labelX: 690, labelY: 520, entranceX: 600, entranceY: 512 },
    polygon: [
      { x: 600, y: 495 },
      { x: 785, y: 495 },
      { x: 765, y: 545 },
      { x: 600, y: 525 },
    ],
    color: {
      fill: 'rgba(96, 75, 28, 0.65)',
      stroke: 'rgba(192, 152, 56, 0.9)',
      glow: 'rgba(192, 152, 56, 0.5)',
      badge: '#f59e0b',
    },
    connectedWaypoints: ['wp-2f-str-e'],
  },
  {
    id: '2F-CR-205',
    code: '2F-CR-205',
    name: 'Classroom 205',
    refLabel: 'CLASSROOM 205',
    floor: 'SECOND',
    floorNumber: 2,
    type: 'CLASSROOM',
    areaM2: 110,
    capacity: 60,
    operationalStatus: 'OCCUPIED',
    equipment: ['Projector', 'Air Conditioned'],
    department: 'Information Technology',
    description: 'Academic classroom on Lower-East Wing.',
    position: { labelX: 645, labelY: 675, entranceX: 600, entranceY: 535 },
    polygon: [
      { x: 600, y: 535 },
      { x: 785, y: 555 },
      { x: 735, y: 775 },
      { x: 510, y: 810 },
      { x: 575, y: 810 },
    ],
    color: {
      fill: 'rgba(20, 184, 166, 0.18)',
      stroke: 'rgba(20, 184, 166, 0.85)',
      glow: 'rgba(20, 184, 166, 0.5)',
      badge: '#14b8a6',
    },
    connectedWaypoints: ['wp-2f-cr202-door'],
  },
];

// -------------------------------------------------------------
// TERRACE ENTITIES (Classrooms 301-305 + Open Corridor Setbacks)
// -------------------------------------------------------------
export const TERRACE_ENTITIES: CampusRoomEntity[] = [
  {
    id: 'TR-DK-01',
    code: 'TR-DECK',
    name: 'Terrace Open Deck & Atrium Hub',
    refLabel: 'TERRACE ATRIUM HUB',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'TERRACE_DECK',
    areaM2: 250,
    capacity: 80,
    operationalStatus: 'AVAILABLE',
    equipment: ['50kW Rooftop Solar Array', 'Perimeter Parapet Glass', 'Weather Station Mast'],
    department: 'Campus Facilities & Green Energy',
    description: 'Central rooftop observation atrium hub.',
    position: { labelX: 500, labelY: 475, entranceX: 500, entranceY: 475 },
    polygon: [
      { x: 500, y: 400 },
      { x: 565, y: 435 },
      { x: 565, y: 515 },
      { x: 500, y: 550 },
      { x: 435, y: 515 },
      { x: 435, y: 435 },
    ],
    color: {
      fill: 'rgba(14, 165, 233, 0.12)',
      stroke: 'rgba(14, 165, 233, 0.7)',
      glow: 'rgba(14, 165, 233, 0.4)',
      badge: '#0ea5e9',
    },
    connectedWaypoints: ['wp-tr-deck'],
  },
  {
    id: 'TR-ENT-01',
    code: 'TR-ENT',
    name: 'Rooftop Skydeck Foyer',
    refLabel: 'ROOFTOP SKYDECK',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'CIRCULATION',
    areaM2: 85,
    capacity: 60,
    operationalStatus: 'AVAILABLE',
    equipment: ['Safety Barriers', 'Observation Deck Seating'],
    department: 'Rooftop Facilities',
    description: 'Southern rooftop skydeck entrance foyer.',
    position: { labelX: 500, labelY: 700, entranceX: 500, entranceY: 550 },
    polygon: [
      { x: 435, y: 515 },
      { x: 500, y: 550 },
      { x: 565, y: 515 },
      { x: 560, y: 810 },
      { x: 440, y: 810 },
    ],
    color: {
      fill: 'rgba(14, 165, 233, 0.12)',
      stroke: 'rgba(14, 165, 233, 0.7)',
      glow: 'rgba(14, 165, 233, 0.4)',
      badge: '#0ea5e9',
    },
    connectedWaypoints: ['wp-tr-skydeck'],
  },
  {
    id: 'TR-CR-301',
    code: 'TR-CR-301',
    name: 'Classroom 301',
    refLabel: 'CLASSROOM 301',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'CLASSROOM',
    areaM2: 160,
    capacity: 75,
    operationalStatus: 'AVAILABLE',
    equipment: ['Tensile Canopy Roof', 'All-Weather Desks', 'Solar Power Outlets'],
    department: 'Architectural & Open Air Learning',
    description: 'Covered rooftop classroom studio on West Terrace.',
    position: { labelX: 275, labelY: 530, entranceX: 410, entranceY: 485 },
    polygon: [
      { x: 410, y: 440 },
      { x: 410, y: 530 },
      { x: 420, y: 810 },
      { x: 250, y: 770 },
      { x: 160, y: 550 },
      { x: 230, y: 180 },
      { x: 330, y: 380 },
    ],
    color: {
      fill: 'rgba(16, 185, 129, 0.18)',
      stroke: 'rgba(16, 185, 129, 0.85)',
      glow: 'rgba(16, 185, 129, 0.5)',
      badge: '#10b981',
    },
    connectedWaypoints: ['wp-tr-cr1-door'],
  },
  {
    id: 'TR-CR-302',
    code: 'TR-CR-302',
    name: 'Classroom 302',
    refLabel: 'CLASSROOM 302',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'CLASSROOM',
    areaM2: 50,
    capacity: 40,
    operationalStatus: 'AVAILABLE',
    equipment: ['Weatherproof Whiteboards', 'Breeze Circulation Fans'],
    department: 'Architectural & Open Air Learning',
    description: 'Rooftop classroom studio on Upper-West Terrace.',
    position: { labelX: 365, labelY: 270, entranceX: 450, entranceY: 375 },
    polygon: [
      { x: 490, y: 375 },
      { x: 415, y: 415 },
      { x: 335, y: 360 },
      { x: 235, y: 175 },
      { x: 490, y: 175 },
    ],
    color: {
      fill: 'rgba(56, 189, 248, 0.18)',
      stroke: 'rgba(56, 189, 248, 0.85)',
      glow: 'rgba(56, 189, 248, 0.5)',
      badge: '#38bdf8',
    },
    connectedWaypoints: ['wp-tr-cr2-door'],
  },
  {
    id: 'TR-CR-303',
    code: 'TR-CR-303',
    name: 'Classroom 303',
    refLabel: 'CLASSROOM 303',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'CLASSROOM',
    areaM2: 220,
    capacity: 60,
    operationalStatus: 'AVAILABLE',
    equipment: ['Solar Powered Presentation Screen', 'Shaded Canopy'],
    department: 'Architectural & Open Air Learning',
    description: 'Rooftop classroom studio on Upper-East Terrace.',
    position: { labelX: 635, labelY: 270, entranceX: 550, entranceY: 375 },
    polygon: [
      { x: 510, y: 375 },
      { x: 585, y: 415 },
      { x: 665, y: 360 },
      { x: 785, y: 360 },
      { x: 750, y: 175 },
      { x: 510, y: 175 },
    ],
    color: {
      fill: 'rgba(234, 179, 8, 0.18)',
      stroke: 'rgba(234, 179, 8, 0.85)',
      glow: 'rgba(234, 179, 8, 0.5)',
      badge: '#eab308',
    },
    connectedWaypoints: ['wp-tr-solar'],
  },
  {
    id: 'TR-CR-304',
    code: 'TR-CR-304',
    name: 'Classroom 304',
    refLabel: 'CLASSROOM 304',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'CLASSROOM',
    areaM2: 45,
    capacity: 35,
    operationalStatus: 'AVAILABLE',
    equipment: ['Weather Sensors', 'Outdoor Desks'],
    department: 'Architectural & Open Air Learning',
    description: 'Rooftop classroom studio on East Terrace.',
    position: { labelX: 710, labelY: 425, entranceX: 600, entranceY: 445 },
    polygon: [
      { x: 600, y: 400 },
      { x: 665, y: 365 },
      { x: 785, y: 365 },
      { x: 785, y: 485 },
      { x: 650, y: 485 },
      { x: 650, y: 445 },
      { x: 600, y: 445 },
    ],
    color: {
      fill: 'rgba(14, 165, 233, 0.18)',
      stroke: 'rgba(14, 165, 233, 0.85)',
      glow: 'rgba(14, 165, 233, 0.5)',
      badge: '#0ea5e9',
    },
    connectedWaypoints: ['wp-tr-wth-door'],
  },
  {
    id: 'TR-LFT-01',
    code: 'LFT-TR',
    name: 'Lift Penthouse Core',
    refLabel: 'ELEVATOR PENTHOUSE',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'LIFT',
    areaM2: 15,
    capacity: 8,
    operationalStatus: 'AVAILABLE',
    equipment: ['Traction Motor Host', 'Maintenance Access Hatch'],
    department: 'Vertical Accessibility',
    description: 'Elevator penthouse and machine core servicing full height of building.',
    position: { labelX: 625, labelY: 468, entranceX: 600, entranceY: 468 },
    polygon: [
      { x: 600, y: 445 },
      { x: 650, y: 445 },
      { x: 650, y: 490 },
      { x: 600, y: 490 },
    ],
    color: {
      fill: 'rgba(6, 182, 212, 0.45)',
      stroke: 'rgba(6, 182, 212, 0.95)',
      glow: 'rgba(6, 182, 212, 0.6)',
      badge: '#06b6d4',
    },
    connectedWaypoints: ['wp-tr-lift'],
  },
  {
    id: 'TR-STR-01',
    code: 'STR-TR',
    name: 'Staircase Headhouse',
    refLabel: 'STAIR HEADHOUSE',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'STAIRS',
    areaM2: 35,
    capacity: 15,
    operationalStatus: 'AVAILABLE',
    equipment: ['Weatherproof Door', 'Panic Push Bar'],
    department: 'Vertical Circulation',
    description: 'Rooftop staircase headhouse door connecting downward through all floors.',
    position: { labelX: 690, labelY: 520, entranceX: 600, entranceY: 512 },
    polygon: [
      { x: 600, y: 495 },
      { x: 785, y: 495 },
      { x: 765, y: 545 },
      { x: 600, y: 525 },
    ],
    color: {
      fill: 'rgba(96, 75, 28, 0.65)',
      stroke: 'rgba(192, 152, 56, 0.9)',
      glow: 'rgba(192, 152, 56, 0.5)',
      badge: '#f59e0b',
    },
    connectedWaypoints: ['wp-tr-str-e'],
  },
  {
    id: 'TR-CR-305',
    code: 'TR-CR-305',
    name: 'Classroom 305',
    refLabel: 'CLASSROOM 305',
    floor: 'TERRACE',
    floorNumber: 3,
    type: 'CLASSROOM',
    areaM2: 110,
    capacity: 60,
    operationalStatus: 'AVAILABLE',
    equipment: ['Environmental Lab Consoles', 'Weatherproof Seating'],
    department: 'Architectural & Open Air Learning',
    description: 'Rooftop classroom studio on Lower-East Terrace.',
    position: { labelX: 645, labelY: 675, entranceX: 600, entranceY: 535 },
    polygon: [
      { x: 600, y: 535 },
      { x: 785, y: 555 },
      { x: 735, y: 775 },
      { x: 510, y: 810 },
      { x: 575, y: 810 },
    ],
    color: {
      fill: 'rgba(71, 85, 105, 0.45)',
      stroke: 'rgba(148, 163, 184, 0.8)',
      glow: 'rgba(148, 163, 184, 0.5)',
      badge: '#94a3b8',
    },
    connectedWaypoints: ['wp-tr-hvac-door'],
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
  const raw = query.toLowerCase().trim();
  const clean = raw.replace(/^(classroom|room|hall|cr|lecture hall|lab|laboratory)\s+/i, '').trim();

  // Alias special cases
  if (raw === 'seminar' || raw === 'seminar hall' || raw === 'cr-07' || raw === 'cr07') {
    const sem = ALL_CAMPUS_ENTITIES.find((e) => e.id === 'GF-SEM-01');
    if (sem) return sem;
  }

  return (
    ALL_CAMPUS_ENTITIES.find(
      (e) =>
        e.id.toLowerCase() === raw ||
        (e.code && e.code.toLowerCase() === raw) ||
        e.name.toLowerCase() === raw ||
        (clean && e.code && e.code.toLowerCase().includes(clean)) ||
        (clean && e.id.toLowerCase().includes(clean))
    ) ||
    ALL_CAMPUS_ENTITIES.find(
      (e) =>
        e.name.toLowerCase().includes(raw) ||
        (e.refLabel && e.refLabel.toLowerCase().includes(raw)) ||
        (clean && e.name.toLowerCase().includes(clean))
    )
  );
}

export function getFloorCapacity(floorQuery: FloorLevel | string) {
  let fl: FloorLevel = 'GROUND';
  const q = String(floorQuery || '').toUpperCase().trim();
  if (q.includes('1') || q.includes('FIRST') || q === '1F') fl = 'FIRST';
  else if (q.includes('2') || q.includes('SECOND') || q === '2F') fl = 'SECOND';
  else if (q.includes('3') || q.includes('TERRACE') || q === '3F' || q.includes('THIRD')) fl = 'TERRACE';
  else if (q.includes('0') || q.includes('GROUND') || q === 'GF') fl = 'GROUND';

  const entities = getEntitiesForFloor(fl);
  const classrooms = entities.filter((e) => e.type === 'CLASSROOM' || e.type === 'SEMINAR_HALL');
  const totalCapacity = classrooms.reduce((sum, c) => sum + c.capacity, 0);
  const sorted = [...classrooms].sort((a, b) => b.capacity - a.capacity);

  const floorNumber = fl === 'GROUND' ? 0 : fl === 'FIRST' ? 1 : fl === 'SECOND' ? 2 : 3;
  const floorName = fl === 'GROUND' ? 'Ground Floor' : fl === 'FIRST' ? 'First Floor' : fl === 'SECOND' ? 'Second Floor' : 'Terrace';

  return {
    success: true,
    floor: fl,
    floorName,
    floorNumber,
    totalClassrooms: classrooms.length,
    totalCapacity,
    classrooms,
    highestCapacity: sorted[0] || null,
    lowestCapacity: sorted[sorted.length - 1] || null,
  };
}

// -------------------------------------------------------------
// MULTI-FLOOR NAVIGATION WAYPOINTS (Vertically Aligned Cores)
// -------------------------------------------------------------
export const ALL_CAMPUS_WAYPOINTS: MultiFloorWaypoint[] = [
  // Ground Floor Waypoints
  { id: 'wp-gf-entrance', floor: 'GROUND', name: 'Main Entrance Gate', x: 500, y: 700, type: 'ENTRANCE' },
  { id: 'wp-gf-hub', floor: 'GROUND', name: 'Central Hexagonal Corridor', x: 500, y: 480, type: 'HUB' },
  { id: 'wp-gf-coe-door', floor: 'GROUND', name: 'COE Hall Entrance', x: 422, y: 480, type: 'DOOR' },
  { id: 'wp-gf-ladies-door', floor: 'GROUND', name: 'Ladies Toilet Entrance', x: 461, y: 412, type: 'DOOR' },
  { id: 'wp-gf-seminar-door', floor: 'GROUND', name: 'Main Block Seminar Hall Entrance', x: 539, y: 412, type: 'DOOR' },
  { id: 'wp-gf-gents-door', floor: 'GROUND', name: 'Gents Toilet Entrance', x: 578, y: 445, type: 'DOOR' },
  { id: 'wp-gf-lift', floor: 'GROUND', name: 'Ground Floor Lift Core', x: 578, y: 475, type: 'LIFT' },
  { id: 'wp-gf-str-e', floor: 'GROUND', name: 'Ground Floor Upstairs Landing', x: 578, y: 510, type: 'STAIRS' },
  { id: 'wp-gf-cctv-door', floor: 'GROUND', name: 'CCTV Monitoring Room Entrance', x: 578, y: 530, type: 'DOOR' },

  // First Floor Waypoints
  { id: 'wp-1f-hub', floor: 'FIRST', name: 'First Floor Central Atrium', x: 500, y: 480, type: 'HUB' },
  { id: 'wp-1f-foyer', floor: 'FIRST', name: 'First Floor Main Foyer', x: 500, y: 700, type: 'CORRIDOR' },
  { id: 'wp-1f-lab2-door', floor: 'FIRST', name: 'AI Research Lab Entrance', x: 422, y: 480, type: 'DOOR' },
  { id: 'wp-1f-fac-door', floor: 'FIRST', name: 'Faculty Suite 1F Entrance', x: 461, y: 412, type: 'DOOR' },
  { id: 'wp-1f-theatre-door', floor: 'FIRST', name: 'Smart Theatre 101 Entrance', x: 539, y: 412, type: 'DOOR' },
  { id: 'wp-1f-lib-door', floor: 'FIRST', name: 'Digital Library Entrance', x: 578, y: 445, type: 'DOOR' },
  { id: 'wp-1f-lift', floor: 'FIRST', name: 'First Floor Lift Core', x: 578, y: 475, type: 'LIFT' },
  { id: 'wp-1f-str-e', floor: 'FIRST', name: 'First Floor Upstairs Landing', x: 578, y: 510, type: 'STAIRS' },
  { id: 'wp-1f-cr102-door', floor: 'FIRST', name: 'Classroom 102 Entrance', x: 578, y: 530, type: 'DOOR' },

  // Second Floor Waypoints
  { id: 'wp-2f-hub', floor: 'SECOND', name: 'Second Floor Central Gallery', x: 500, y: 480, type: 'HUB' },
  { id: 'wp-2f-foyer', floor: 'SECOND', name: 'Second Floor Main Foyer', x: 500, y: 700, type: 'CORRIDOR' },
  { id: 'wp-2f-lab4-door', floor: 'SECOND', name: 'Robotics Lab Entrance', x: 422, y: 480, type: 'DOOR' },
  { id: 'wp-2f-inc-door', floor: 'SECOND', name: 'Incubator Suite Entrance', x: 461, y: 412, type: 'DOOR' },
  { id: 'wp-2f-sem-door', floor: 'SECOND', name: 'Executive Seminar Room Entrance', x: 539, y: 412, type: 'DOOR' },
  { id: 'wp-2f-res-door', floor: 'SECOND', name: 'Senior Research Suite Entrance', x: 578, y: 445, type: 'DOOR' },
  { id: 'wp-2f-lift', floor: 'SECOND', name: 'Second Floor Lift Core', x: 578, y: 475, type: 'LIFT' },
  { id: 'wp-2f-str-e', floor: 'SECOND', name: 'Second Floor Upstairs Landing', x: 578, y: 510, type: 'STAIRS' },
  { id: 'wp-2f-cr202-door', floor: 'SECOND', name: 'Classroom 202 Entrance', x: 578, y: 530, type: 'DOOR' },

  // Terrace Waypoints
  { id: 'wp-tr-deck', floor: 'TERRACE', name: 'Terrace Central Atrium Deck', x: 500, y: 480, type: 'HUB' },
  { id: 'wp-tr-skydeck', floor: 'TERRACE', name: 'Terrace Skydeck Foyer', x: 500, y: 700, type: 'CORRIDOR' },
  { id: 'wp-tr-cr1-door', floor: 'TERRACE', name: 'Open Studio 1 Entrance', x: 422, y: 480, type: 'DOOR' },
  { id: 'wp-tr-cr2-door', floor: 'TERRACE', name: 'Open Studio 2 Entrance', x: 461, y: 412, type: 'DOOR' },
  { id: 'wp-tr-solar', floor: 'TERRACE', name: 'Rooftop Solar Deck', x: 539, y: 412, type: 'DOOR' },
  { id: 'wp-tr-wth-door', floor: 'TERRACE', name: 'Weather Station Door', x: 578, y: 445, type: 'DOOR' },
  { id: 'wp-tr-lift', floor: 'TERRACE', name: 'Terrace Lift Penthouse', x: 578, y: 475, type: 'LIFT' },
  { id: 'wp-tr-str-e', floor: 'TERRACE', name: 'Terrace Staircase Headhouse', x: 578, y: 510, type: 'STAIRS' },
  { id: 'wp-tr-hvac-door', floor: 'TERRACE', name: 'HVAC Plant Room Door', x: 578, y: 530, type: 'DOOR' },
];

// Multi-Floor Navigation Edges (Horizontal + Aligned Vertical Shafts)
export const ALL_CAMPUS_EDGES: MultiFloorEdge[] = [
  // Ground Floor Horizontal
  { from: 'wp-gf-entrance', to: 'wp-gf-hub', distanceMeters: 8 },
  { from: 'wp-gf-hub', to: 'wp-gf-coe-door', distanceMeters: 7 },
  { from: 'wp-gf-hub', to: 'wp-gf-ladies-door', distanceMeters: 6 },
  { from: 'wp-gf-hub', to: 'wp-gf-seminar-door', distanceMeters: 6 },
  { from: 'wp-gf-hub', to: 'wp-gf-gents-door', distanceMeters: 7 },
  { from: 'wp-gf-hub', to: 'wp-gf-lift', distanceMeters: 5 },
  { from: 'wp-gf-hub', to: 'wp-gf-str-e', distanceMeters: 7 },
  { from: 'wp-gf-hub', to: 'wp-gf-cctv-door', distanceMeters: 8 },

  // First Floor Horizontal
  { from: 'wp-1f-hub', to: 'wp-1f-foyer', distanceMeters: 8 },
  { from: 'wp-1f-hub', to: 'wp-1f-lab2-door', distanceMeters: 7 },
  { from: 'wp-1f-hub', to: 'wp-1f-fac-door', distanceMeters: 6 },
  { from: 'wp-1f-hub', to: 'wp-1f-theatre-door', distanceMeters: 6 },
  { from: 'wp-1f-hub', to: 'wp-1f-lib-door', distanceMeters: 7 },
  { from: 'wp-1f-hub', to: 'wp-1f-lift', distanceMeters: 5 },
  { from: 'wp-1f-hub', to: 'wp-1f-str-e', distanceMeters: 7 },
  { from: 'wp-1f-hub', to: 'wp-1f-cr102-door', distanceMeters: 8 },

  // Second Floor Horizontal
  { from: 'wp-2f-hub', to: 'wp-2f-foyer', distanceMeters: 8 },
  { from: 'wp-2f-hub', to: 'wp-2f-lab4-door', distanceMeters: 7 },
  { from: 'wp-2f-hub', to: 'wp-2f-inc-door', distanceMeters: 6 },
  { from: 'wp-2f-hub', to: 'wp-2f-sem-door', distanceMeters: 6 },
  { from: 'wp-2f-hub', to: 'wp-2f-res-door', distanceMeters: 7 },
  { from: 'wp-2f-hub', to: 'wp-2f-lift', distanceMeters: 5 },
  { from: 'wp-2f-hub', to: 'wp-2f-str-e', distanceMeters: 7 },
  { from: 'wp-2f-hub', to: 'wp-2f-cr202-door', distanceMeters: 8 },

  // Terrace Horizontal
  { from: 'wp-tr-deck', to: 'wp-tr-skydeck', distanceMeters: 8 },
  { from: 'wp-tr-deck', to: 'wp-tr-cr1-door', distanceMeters: 7 },
  { from: 'wp-tr-deck', to: 'wp-tr-cr2-door', distanceMeters: 6 },
  { from: 'wp-tr-deck', to: 'wp-tr-solar', distanceMeters: 6 },
  { from: 'wp-tr-deck', to: 'wp-tr-wth-door', distanceMeters: 7 },
  { from: 'wp-tr-deck', to: 'wp-tr-lift', distanceMeters: 5 },
  { from: 'wp-tr-deck', to: 'wp-tr-str-e', distanceMeters: 7 },
  { from: 'wp-tr-deck', to: 'wp-tr-hvac-door', distanceMeters: 8 },

  // =========================================================
  // VERTICAL SHAFT CONNECTIVITY (ELEVATOR CORE + STAIRCASE)
  // =========================================================
  { from: 'wp-gf-lift', to: 'wp-1f-lift', distanceMeters: 10, isElevator: true },
  { from: 'wp-1f-lift', to: 'wp-2f-lift', distanceMeters: 10, isElevator: true },
  { from: 'wp-2f-lift', to: 'wp-tr-lift', distanceMeters: 10, isElevator: true },

  { from: 'wp-gf-str-e', to: 'wp-1f-str-e', distanceMeters: 12, isStair: true },
  { from: 'wp-1f-str-e', to: 'wp-2f-str-e', distanceMeters: 12, isStair: true },
  { from: 'wp-2f-str-e', to: 'wp-tr-str-e', distanceMeters: 12, isStair: true },
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
