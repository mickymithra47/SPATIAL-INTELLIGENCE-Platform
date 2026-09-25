export interface SpatialPoint {
  x: number;
  y: number;
}

export interface GroundFloorRoom {
  id: string;
  code: string;
  name: string;
  refLabel: string;
  floor: string;
  type: 'LABORATORY' | 'SEMINAR_HALL' | 'OFFICE' | 'STAFF_ROOM' | 'MONITORING' | 'EXAM_CELL' | 'EMPTY_SPACE' | 'RESTROOM' | 'STAIRS' | 'CENTRAL_HUB';
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
  // 2D polygon vertices normalized around center (500, 480) on a 1000x900 canvas
  polygon: SpatialPoint[];
  color: {
    fill: string;
    stroke: string;
    glow: string;
    badge: string;
  };
  connectedWaypoints: string[];
}

export interface NavigationWaypoint {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'HUB' | 'CORRIDOR' | 'DOOR' | 'STAIRS' | 'ROOM_CENTER';
}

export interface NavigationEdge {
  from: string;
  to: string;
  distanceMeters: number;
}

// Architectural Ground Floor Spatial Model derived directly from Reference 1 & 2
export const GROUND_FLOOR_ROOMS: GroundFloorRoom[] = [
  {
    id: 'GF-HUB-01',
    code: 'HUB-00',
    name: 'Central Hub / Corridor',
    refLabel: 'Hexagon Hub',
    floor: 'Ground Floor',
    type: 'CENTRAL_HUB',
    areaM2: 200,
    capacity: 100,
    operationalStatus: 'AVAILABLE',
    equipment: ['Interactive Kiosk', 'Hexagonal Seating Ring', 'Biophilic Planter', 'Display Displays'],
    department: 'Campus Central Circulation',
    description: 'Central hexagonal atrium and circulation nexus connecting all academic labs, facilities, and entrances.',
    position: {
      labelX: 500,
      labelY: 480,
      entranceX: 500,
      entranceY: 480,
    },
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
    connectedWaypoints: ['wp-hub-center', 'wp-hub-n', 'wp-hub-ne', 'wp-hub-se', 'wp-hub-s', 'wp-hub-sw', 'wp-hub-nw'],
  },
  {
    id: 'GF-MON-01',
    code: 'CR-01',
    name: 'Monitoring Room',
    refLabel: 'Classroom 1 (Monitor Room)',
    floor: 'Ground Floor',
    type: 'MONITORING',
    areaM2: 80,
    capacity: 20,
    operationalStatus: 'AVAILABLE',
    equipment: ['Campus CCTV Wall', 'IoT Sensor Gateways', 'Network Operations Consoles'],
    department: 'Campus Security & Operations',
    description: 'Central campus telemetry and security monitoring room with video telemetry wall and server racks.',
    position: {
      labelX: 300,
      labelY: 260,
      entranceX: 410,
      entranceY: 340,
    },
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
    connectedWaypoints: ['wp-mon-door'],
  },
  {
    id: 'GF-LAB-01',
    code: 'CR-02',
    name: 'Lab 1',
    refLabel: 'Classroom 2 (Lab 1)',
    floor: 'Ground Floor',
    type: 'LABORATORY',
    areaM2: 70,
    capacity: 40,
    operationalStatus: 'AVAILABLE',
    equipment: ['Robotics Workstations', 'GPU Computing Nodes', 'Soldering Stations', '3D Printers'],
    department: 'Artificial Intelligence & Robotics',
    description: 'Advanced AI and Robotics lab equipped with 40 high-performance workstations and robotics testing mats.',
    position: {
      labelX: 270,
      labelY: 375,
      entranceX: 360,
      entranceY: 420,
    },
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
    connectedWaypoints: ['wp-lab1-door'],
  },
  {
    id: 'GF-STF-01',
    code: 'CR-03',
    name: 'Staff Room',
    refLabel: 'Classroom 3 (Staff Room)',
    floor: 'Ground Floor',
    type: 'STAFF_ROOM',
    areaM2: 45,
    capacity: 15,
    operationalStatus: 'OCCUPIED',
    equipment: ['Faculty Desks', 'Conference Table', 'Coffee Station', 'Resource Library'],
    department: 'Computer Science Faculty',
    description: 'Dedicated faculty office and research discussion room with conference table and secure storage.',
    position: {
      labelX: 255,
      labelY: 475,
      entranceX: 355,
      entranceY: 480,
    },
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
    connectedWaypoints: ['wp-staff-door'],
  },
  {
    id: 'GF-STR-01',
    code: 'STR-W',
    name: 'Stairs (West)',
    refLabel: 'Stairs',
    floor: 'Ground Floor',
    type: 'STAIRS',
    areaM2: 25,
    capacity: 20,
    operationalStatus: 'AVAILABLE',
    equipment: ['Emergency Exit Lighting', 'Handrails', 'Fire Extinguisher'],
    department: 'Vertical Circulation',
    description: 'Western dual-flight concrete staircase leading to First Floor classrooms and labs.',
    position: {
      labelX: 245,
      labelY: 575,
      entranceX: 335,
      entranceY: 555,
    },
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
    connectedWaypoints: ['wp-stairs-w'],
  },
  {
    id: 'GF-GEN-01',
    code: 'RR-GEN',
    name: 'Gents Restroom',
    refLabel: 'Classroom 5 (Gents Restroom)',
    floor: 'Ground Floor',
    type: 'RESTROOM',
    areaM2: 30,
    capacity: 10,
    operationalStatus: 'AVAILABLE',
    equipment: ['Sanitary Stalls', 'Automated Sensor Faucets', 'Ventilation Fan'],
    department: 'Public Amenities',
    description: 'Ground floor male sanitary facility located southwest off the main circular corridor.',
    position: {
      labelX: 275,
      labelY: 675,
      entranceX: 345,
      entranceY: 635,
    },
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
    connectedWaypoints: ['wp-gents-door'],
  },
  {
    id: 'GF-SEM-01',
    code: 'CR-07',
    name: 'Seminar Hall',
    refLabel: 'Classroom 7 (Seminar Hall)',
    floor: 'Ground Floor',
    type: 'SEMINAR_HALL',
    areaM2: 120,
    capacity: 120,
    operationalStatus: 'AVAILABLE',
    equipment: ['4K Laser Projector', 'Dolby Audio Array', 'Tiered Amphitheater Seating', 'Stage Podium'],
    department: 'College Academic Affairs',
    description: 'Iconic curved auditorium with tiered fan-shaped amphitheater seating and state-of-the-art audiovisual systems.',
    position: {
      labelX: 440,
      labelY: 690,
      entranceX: 440,
      entranceY: 615,
    },
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
    connectedWaypoints: ['wp-seminar-door'],
  },
  {
    id: 'GF-LAD-01',
    code: 'RR-LAD',
    name: 'Ladies Restroom',
    refLabel: 'Classroom 6 (Ladies Restroom)',
    floor: 'Ground Floor',
    type: 'RESTROOM',
    areaM2: 30,
    capacity: 10,
    operationalStatus: 'AVAILABLE',
    equipment: ['Sanitary Stalls', 'Vanity Mirror Array', 'Automated Sensor Faucets'],
    department: 'Public Amenities',
    description: 'Ground floor female sanitary facility located southeast off the main circular corridor.',
    position: {
      labelX: 605,
      labelY: 675,
      entranceX: 550,
      entranceY: 635,
    },
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
    connectedWaypoints: ['wp-ladies-door'],
  },
  {
    id: 'GF-OFF-01',
    code: 'CR-08',
    name: 'Office',
    refLabel: 'Classroom 8 (Office)',
    floor: 'Ground Floor',
    type: 'OFFICE',
    areaM2: 60,
    capacity: 12,
    operationalStatus: 'OCCUPIED',
    equipment: ['Administrative Terminals', 'Document Archiving', 'Conference Table', 'Printer / Scanner Hub'],
    department: 'Department Administration',
    description: 'Departmental head and administrative coordinator office with consultation tables.',
    position: {
      labelX: 620,
      labelY: 510,
      entranceX: 575,
      entranceY: 515,
    },
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
    connectedWaypoints: ['wp-office-door'],
  },
  {
    id: 'GF-STR-02',
    code: 'STR-E',
    name: 'Stairs (East)',
    refLabel: 'Stairs',
    floor: 'Ground Floor',
    type: 'STAIRS',
    areaM2: 25,
    capacity: 20,
    operationalStatus: 'AVAILABLE',
    equipment: ['Emergency Exit Signage', 'Stair Lighting', 'First Aid Kit'],
    department: 'Vertical Circulation',
    description: 'Eastern staircase connecting ground level directly to upper research labs and Dean suite.',
    position: {
      labelX: 635,
      labelY: 395,
      entranceX: 580,
      entranceY: 415,
    },
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
    connectedWaypoints: ['wp-stairs-e'],
  },
  {
    id: 'GF-EXM-01',
    code: 'CR-09',
    name: 'Exam Cell',
    refLabel: 'Classroom 9 (Exam Cell)',
    floor: 'Ground Floor',
    type: 'EXAM_CELL',
    areaM2: 40,
    capacity: 10,
    operationalStatus: 'OCCUPIED',
    equipment: ['High-Security Locker', 'Biometric Access', 'Question Paper Vault', 'Monitoring Cam'],
    department: 'Examination Branch',
    description: 'Secure examination cell for confidential record keeping, evaluation coordination, and materials storage.',
    position: {
      labelX: 645,
      labelY: 265,
      entranceX: 595,
      entranceY: 335,
    },
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
    connectedWaypoints: ['wp-exam-door'],
  },
  {
    id: 'GF-EMP-01',
    code: 'CR-10',
    name: 'Empty Space',
    refLabel: 'Classroom 10 (Empty Space)',
    floor: 'Ground Floor',
    type: 'EMPTY_SPACE',
    areaM2: 50,
    capacity: 25,
    operationalStatus: 'AVAILABLE',
    equipment: ['Modular Lounge Seating', 'Acoustic Wall Panels', 'Mobile Whiteboards', 'Natural Light Skylight'],
    department: 'Innovation & Flexible Learning',
    description: 'Open modular collaborative space for informal student hackathons, breakout meetings, and ideation.',
    position: {
      labelX: 545,
      labelY: 255,
      entranceX: 535,
      entranceY: 340,
    },
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
    connectedWaypoints: ['wp-empty-door'],
  },
];

// Indoor Navigation Graph
export const GROUND_FLOOR_WAYPOINTS: NavigationWaypoint[] = [
  // Hub Waypoints
  { id: 'wp-hub-center', name: 'Central Hub Center', x: 500, y: 480, type: 'HUB' },
  { id: 'wp-hub-n', name: 'Hub North Corridor', x: 500, y: 375, type: 'CORRIDOR' },
  { id: 'wp-hub-ne', name: 'Hub Northeast Corridor', x: 580, y: 415, type: 'CORRIDOR' },
  { id: 'wp-hub-se', name: 'Hub Southeast Corridor', x: 560, y: 550, type: 'CORRIDOR' },
  { id: 'wp-hub-s', name: 'Hub South Corridor', x: 450, y: 575, type: 'CORRIDOR' },
  { id: 'wp-hub-sw', name: 'Hub Southwest Corridor', x: 380, y: 550, type: 'CORRIDOR' },
  { id: 'wp-hub-nw', name: 'Hub Northwest Corridor', x: 395, y: 415, type: 'CORRIDOR' },

  // Room Doors & Centers
  { id: 'wp-mon-door', name: 'Monitoring Room Entrance', x: 395, y: 340, type: 'DOOR' },
  { id: 'wp-mon-inside', name: 'Monitoring Room Console', x: 300, y: 260, type: 'ROOM_CENTER' },

  { id: 'wp-lab1-door', name: 'Lab 1 Entrance', x: 360, y: 395, type: 'DOOR' },
  { id: 'wp-lab1-inside', name: 'Lab 1 Robotics Bay', x: 270, y: 380, type: 'ROOM_CENTER' },

  { id: 'wp-staff-door', name: 'Staff Room Entrance', x: 355, y: 480, type: 'DOOR' },
  { id: 'wp-staff-inside', name: 'Staff Room Conference', x: 255, y: 480, type: 'ROOM_CENTER' },

  { id: 'wp-stairs-w', name: 'West Stairs Landing', x: 325, y: 575, type: 'STAIRS' },
  { id: 'wp-gents-door', name: 'Gents Restroom Entrance', x: 340, y: 640, type: 'DOOR' },

  { id: 'wp-seminar-door', name: 'Seminar Hall Stage Entrance', x: 445, y: 625, type: 'DOOR' },
  { id: 'wp-seminar-inside', name: 'Seminar Hall Amphitheater Center', x: 440, y: 710, type: 'ROOM_CENTER' },

  { id: 'wp-ladies-door', name: 'Ladies Restroom Entrance', x: 560, y: 635, type: 'DOOR' },
  { id: 'wp-office-door', name: 'Office Entrance', x: 575, y: 515, type: 'DOOR' },
  { id: 'wp-office-inside', name: 'Office Executive Desk', x: 630, y: 510, type: 'ROOM_CENTER' },

  { id: 'wp-stairs-e', name: 'East Stairs Landing', x: 580, y: 385, type: 'STAIRS' },
  { id: 'wp-exam-door', name: 'Exam Cell Entrance', x: 595, y: 335, type: 'DOOR' },
  { id: 'wp-empty-door', name: 'Empty Space Entrance', x: 535, y: 345, type: 'DOOR' },
  { id: 'wp-empty-inside', name: 'Empty Space Lounge', x: 545, y: 255, type: 'ROOM_CENTER' },
];

export const GROUND_FLOOR_EDGES: NavigationEdge[] = [
  // Hub connections
  { from: 'wp-hub-center', to: 'wp-hub-n', distanceMeters: 8 },
  { from: 'wp-hub-center', to: 'wp-hub-ne', distanceMeters: 7 },
  { from: 'wp-hub-center', to: 'wp-hub-se', distanceMeters: 7 },
  { from: 'wp-hub-center', to: 'wp-hub-s', distanceMeters: 8 },
  { from: 'wp-hub-center', to: 'wp-hub-sw', distanceMeters: 7 },
  { from: 'wp-hub-center', to: 'wp-hub-nw', distanceMeters: 7 },

  // Hub ring
  { from: 'wp-hub-n', to: 'wp-hub-ne', distanceMeters: 9 },
  { from: 'wp-hub-ne', to: 'wp-hub-se', distanceMeters: 10 },
  { from: 'wp-hub-se', to: 'wp-hub-s', distanceMeters: 9 },
  { from: 'wp-hub-s', to: 'wp-hub-sw', distanceMeters: 9 },
  { from: 'wp-hub-sw', to: 'wp-hub-nw', distanceMeters: 10 },
  { from: 'wp-hub-nw', to: 'wp-hub-n', distanceMeters: 9 },

  // Doors & Room Connections
  { from: 'wp-hub-nw', to: 'wp-mon-door', distanceMeters: 6 },
  { from: 'wp-mon-door', to: 'wp-mon-inside', distanceMeters: 8 },

  { from: 'wp-hub-nw', to: 'wp-lab1-door', distanceMeters: 4 },
  { from: 'wp-lab1-door', to: 'wp-lab1-inside', distanceMeters: 7 },

  { from: 'wp-hub-sw', to: 'wp-staff-door', distanceMeters: 5 },
  { from: 'wp-staff-door', to: 'wp-staff-inside', distanceMeters: 7 },

  { from: 'wp-hub-sw', to: 'wp-stairs-w', distanceMeters: 6 },
  { from: 'wp-hub-s', to: 'wp-gents-door', distanceMeters: 6 },

  { from: 'wp-hub-s', to: 'wp-seminar-door', distanceMeters: 4 },
  { from: 'wp-seminar-door', to: 'wp-seminar-inside', distanceMeters: 9 },

  { from: 'wp-hub-se', to: 'wp-ladies-door', distanceMeters: 6 },
  { from: 'wp-hub-se', to: 'wp-office-door', distanceMeters: 5 },
  { from: 'wp-office-door', to: 'wp-office-inside', distanceMeters: 6 },

  { from: 'wp-hub-ne', to: 'wp-stairs-e', distanceMeters: 5 },
  { from: 'wp-hub-ne', to: 'wp-exam-door', distanceMeters: 8 },
  { from: 'wp-hub-n', to: 'wp-empty-door', distanceMeters: 4 },
  { from: 'wp-empty-door', to: 'wp-empty-inside', distanceMeters: 7 },
];

// Helper to compute shortest route between two waypoints using Dijkstra / A*
export function calculateIndoorRoute(originWaypointId: string, destWaypointId: string): {
  path: NavigationWaypoint[];
  distanceMeters: number;
  estimatedSeconds: number;
  steps: { instruction: string; distance: string }[];
} {
  const adj = new Map<string, { to: string; dist: number }[]>();
  GROUND_FLOOR_WAYPOINTS.forEach((wp) => adj.set(wp.id, []));

  GROUND_FLOOR_EDGES.forEach((edge) => {
    adj.get(edge.from)?.push({ to: edge.to, dist: edge.distanceMeters });
    adj.get(edge.to)?.push({ to: edge.from, dist: edge.distanceMeters });
  });

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  GROUND_FLOOR_WAYPOINTS.forEach((wp) => {
    distances.set(wp.id, Infinity);
    previous.set(wp.id, null);
    unvisited.add(wp.id);
  });

  distances.set(originWaypointId, 0);

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

    if (currentId === null || minDist === Infinity || currentId === destWaypointId) {
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

  // Reconstruct path
  const pathIds: string[] = [];
  let curr: string | null = destWaypointId;
  while (curr !== null) {
    pathIds.unshift(curr);
    curr = previous.get(curr) || null;
  }

  const path = pathIds
    .map((id) => GROUND_FLOOR_WAYPOINTS.find((wp) => wp.id === id))
    .filter((wp): wp is NavigationWaypoint => Boolean(wp));

  const totalDistance = distances.get(destWaypointId) ?? 24;
  const estimatedSeconds = Math.round((totalDistance / 1.2)); // average indoor walking pace 1.2 m/s

  const steps = path.slice(0, -1).map((wp, i) => {
    const nextWp = path[i + 1];
    return {
      instruction: `Head from ${wp.name} toward ${nextWp.name}`,
      distance: `${Math.round(Math.hypot(nextWp.x - wp.x, nextWp.y - wp.y) * 0.15)}m`,
    };
  });

  return {
    path,
    distanceMeters: Math.round(totalDistance),
    estimatedSeconds,
    steps: steps.length > 0 ? steps : [{ instruction: 'Proceed directly to destination', distance: '12m' }],
  };
}
