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
  type:
    | 'LABORATORY'
    | 'SEMINAR_HALL'
    | 'OFFICE'
    | 'STAFF_ROOM'
    | 'MONITORING'
    | 'EXAM_CELL'
    | 'EMPTY_SPACE'
    | 'RESTROOM'
    | 'STAIRS'
    | 'LIFT'
    | 'CENTRAL_HUB'
    | 'CIRCULATION';
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
}

export interface NavigationWaypoint {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'HUB' | 'CORRIDOR' | 'DOOR' | 'STAIRS' | 'ROOM_CENTER' | 'ENTRANCE';
}

export interface NavigationEdge {
  from: string;
  to: string;
  distanceMeters: number;
}

// Authoritative Irregular Pentagonal Outer Building Footprint for ESEC Main Block
export const OUTER_PENTAGON_FOOTPRINT: SpatialPoint[] = [
  { x: 500, y: 830 }, // Bottom South Entrance vertex
  { x: 740, y: 780 }, // Lower-Right CCTV Monitoring Room vertex
  { x: 810, y: 460 }, // Right Gents Toilet & Upstairs vertex
  { x: 770, y: 160 }, // Upper-Right Main Block Seminar Hall vertex
  { x: 230, y: 160 }, // Upper-Left Ladies Toilet vertex
  { x: 160, y: 550 }, // Left COE Hall vertex
  { x: 260, y: 780 }, // Lower-Left vertex
];

// ESEC Ground Floor Spatial Model (Exact Regular Hexagon Corridor + ESEC Room Layout)
export const GROUND_FLOOR_ROOMS: GroundFloorRoom[] = [
  {
    id: 'GF-COR-01',
    code: 'HUB-00',
    name: 'Central Corridor',
    refLabel: 'CENTRAL CORRIDOR',
    floor: 'Ground Floor',
    type: 'CENTRAL_HUB',
    areaM2: 250,
    capacity: 120,
    operationalStatus: 'AVAILABLE',
    equipment: ['Interactive Campus Kiosk', 'Directional Signage Array', 'Hexagonal Atrium Planter'],
    department: 'Campus Central Circulation',
    description: 'Central regular hexagonal atrium hub connecting to North, East, West, and South circulation corridors.',
    position: {
      labelX: 500,
      labelY: 475,
      entranceX: 500,
      entranceY: 475,
    },
    polygon: [
      { x: 500, y: 400 },
      { x: 565, y: 435 },
      { x: 565, y: 515 },
      { x: 500, y: 550 },
      { x: 435, y: 515 },
      { x: 435, y: 435 },
    ],
    color: {
      fill: 'rgba(59, 71, 89, 0.65)',
      stroke: 'rgba(148, 163, 184, 0.95)',
      glow: 'rgba(148, 163, 184, 0.5)',
      badge: '#94a3b8',
    },
    connectedWaypoints: ['wp-gf-corridor'],
  },
  {
    id: 'GF-ENT-01',
    code: 'ENT-00',
    name: 'Main Entrance',
    refLabel: 'Main Entrance',
    floor: 'Ground Floor',
    type: 'CIRCULATION',
    areaM2: 85,
    capacity: 60,
    operationalStatus: 'AVAILABLE',
    equipment: ['Turnstile Gateways', 'Security Desk', 'Campus Map Directory'],
    department: 'Main Entry Security',
    description: 'Main southern entrance gate providing entry (IN ↑) directly into the Central Hexagonal Corridor.',
    position: {
      labelX: 500,
      labelY: 700,
      entranceX: 500,
      entranceY: 550,
    },
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
    refLabel: 'COE Hall',
    floor: 'Ground Floor',
    type: 'SEMINAR_HALL',
    areaM2: 160,
    capacity: 85,
    operationalStatus: 'AVAILABLE',
    equipment: ['Smart Telepresence Console', 'Acoustic Wall Paneling', 'Dual 4K Displays'],
    department: 'Centre of Excellence',
    description: 'COE Hall located on the left side of the Central Hexagonal Corridor.',
    position: {
      labelX: 275,
      labelY: 530,
      entranceX: 410,
      entranceY: 485,
    },
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
    connectedWaypoints: ['wp-gf-coe-door', 'wp-gf-coe-center'],
  },
  {
    id: 'GF-LAD-01',
    code: 'RR-LAD',
    name: 'Ladies Toilet',
    refLabel: 'Ladies Toilet',
    floor: 'Ground Floor',
    type: 'RESTROOM',
    areaM2: 50,
    capacity: 15,
    operationalStatus: 'AVAILABLE',
    equipment: ['Automated Sensor Faucets', 'Vanity Mirror Array', 'Ventilation System'],
    department: 'Public Amenities',
    description: 'Ladies Toilet located on the upper-left side connecting to the Central Hexagonal Corridor.',
    position: {
      labelX: 365,
      labelY: 270,
      entranceX: 450,
      entranceY: 375,
    },
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
    connectedWaypoints: ['wp-gf-ladies-door', 'wp-gf-ladies-center'],
  },
  {
    id: 'GF-SEM-01',
    code: 'SEM-01',
    name: 'Main Block Seminar Hall',
    refLabel: 'Main Block Seminar Hall',
    floor: 'Ground Floor',
    type: 'SEMINAR_HALL',
    areaM2: 220,
    capacity: 160,
    operationalStatus: 'AVAILABLE',
    equipment: ['4K Laser Auditorium Projector', 'Dolby Surround Sound System', 'Tiered Amphitheater Seating', 'Stage Podium'],
    department: 'Main Block Academic Affairs',
    description: 'Main Block Seminar Hall positioned on the upper-right side of the Central Hexagonal Corridor.',
    position: {
      labelX: 635,
      labelY: 270,
      entranceX: 550,
      entranceY: 375,
    },
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
    connectedWaypoints: ['wp-gf-seminar-door', 'wp-gf-seminar-center'],
  },
  {
    id: 'GF-GEN-01',
    code: 'RR-GEN',
    name: 'Gents Toilet',
    refLabel: 'Gents Toilet',
    floor: 'Ground Floor',
    type: 'RESTROOM',
    areaM2: 43,
    capacity: 15,
    operationalStatus: 'AVAILABLE',
    equipment: ['Sensor Urinals & Stalls', 'Automated Soap Dispensers', 'Exhaust Ventilation'],
    department: 'Public Amenities',
    description: 'Gents Toilet positioned on the right side beside the Main Block Seminar Hall.',
    position: {
      labelX: 710,
      labelY: 425,
      entranceX: 600,
      entranceY: 445,
    },
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
    connectedWaypoints: ['wp-gf-gents-door', 'wp-gf-gents-center'],
  },
  {
    id: 'GF-LFT-01',
    code: 'LFT-01',
    name: 'Central Lift Core',
    refLabel: 'Elevator Core',
    floor: 'Ground Floor',
    type: 'LIFT',
    areaM2: 15,
    capacity: 8,
    operationalStatus: 'AVAILABLE',
    equipment: ['ADA Braille Panel', 'Emergency Call System', 'Sensor Doors'],
    department: 'Vertical Accessibility',
    description: 'Central elevator shaft core connecting Ground Floor, First Floor, Second Floor, and Terrace Penthouse.',
    position: {
      labelX: 625,
      labelY: 468,
      entranceX: 600,
      entranceY: 468,
    },
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
    refLabel: 'Upstairs',
    floor: 'Ground Floor',
    type: 'STAIRS',
    areaM2: 35,
    capacity: 30,
    operationalStatus: 'AVAILABLE',
    equipment: ['Emergency Lighting', 'Tactile Handrails', 'Upward Signage'],
    department: 'Vertical Circulation',
    description: 'Staircase positioned near CCTV Monitoring Room, connecting Ground Floor to First Floor (UP ↑).',
    position: {
      labelX: 690,
      labelY: 520,
      entranceX: 600,
      entranceY: 512,
    },
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
    connectedWaypoints: ['wp-gf-stairs-door', 'wp-gf-stairs-center'],
  },
  {
    id: 'GF-CCTV-01',
    code: 'CCTV-01',
    name: 'CCTV Monitoring Room',
    refLabel: 'CCTV Monitoring Room',
    floor: 'Ground Floor',
    type: 'MONITORING',
    areaM2: 110,
    capacity: 25,
    operationalStatus: 'AVAILABLE',
    equipment: ['High-Definition CCTV Telemetry Wall', 'Security Gateway Servers', 'Emergency Command Consoles'],
    department: 'Campus Safety & Operations',
    description: 'CCTV Monitoring Room located on the lower-right side of the Central Hexagonal Corridor beside the Upstairs staircase.',
    position: {
      labelX: 645,
      labelY: 675,
      entranceX: 600,
      entranceY: 535,
    },
    polygon: [
      { x: 600, y: 535 },
      { x: 785, y: 555 },
      { x: 735, y: 775 },
      { x: 510, y: 810 },
      { x: 575, y: 810 },
    ],
    color: {
      fill: 'rgba(15, 74, 77, 0.65)',
      stroke: 'rgba(31, 184, 196, 0.9)',
      glow: 'rgba(31, 184, 196, 0.5)',
      badge: '#38bdf8',
    },
    connectedWaypoints: ['wp-gf-cctv-door', 'wp-gf-cctv-center'],
  },
];

// Indoor Navigation Graph for ESEC Main Block Ground Floor
export const GROUND_FLOOR_WAYPOINTS: NavigationWaypoint[] = [
  { id: 'wp-gf-entrance', name: 'Main Entrance (IN ↑)', x: 500, y: 700, type: 'ENTRANCE' },
  { id: 'wp-gf-corridor', name: 'Central Hexagonal Corridor', x: 500, y: 475, type: 'HUB' },

  { id: 'wp-gf-coe-door', name: 'COE Hall Entrance', x: 410, y: 485, type: 'DOOR' },
  { id: 'wp-gf-coe-center', name: 'COE Hall Center', x: 275, y: 530, type: 'ROOM_CENTER' },

  { id: 'wp-gf-ladies-door', name: 'Ladies Toilet Entrance', x: 450, y: 375, type: 'DOOR' },
  { id: 'wp-gf-ladies-center', name: 'Ladies Toilet Facility', x: 365, y: 270, type: 'ROOM_CENTER' },

  { id: 'wp-gf-seminar-door', name: 'Seminar Hall Entrance', x: 550, y: 375, type: 'DOOR' },
  { id: 'wp-gf-seminar-center', name: 'Main Block Seminar Hall Center', x: 635, y: 270, type: 'ROOM_CENTER' },

  { id: 'wp-gf-gents-door', name: 'Gents Toilet Entrance', x: 600, y: 445, type: 'DOOR' },
  { id: 'wp-gf-gents-center', name: 'Gents Toilet Facility', x: 710, y: 425, type: 'ROOM_CENTER' },

  { id: 'wp-gf-lift', name: 'Elevator Core Entrance', x: 600, y: 468, type: 'STAIRS' },

  { id: 'wp-gf-stairs-door', name: 'Upstairs Staircase Entrance', x: 600, y: 512, type: 'STAIRS' },
  { id: 'wp-gf-stairs-center', name: 'Upstairs Landing (To 1st Floor)', x: 690, y: 520, type: 'STAIRS' },

  { id: 'wp-gf-cctv-door', name: 'CCTV Monitoring Room Entrance', x: 600, y: 535, type: 'DOOR' },
  { id: 'wp-gf-cctv-center', name: 'CCTV Telemetry Wall', x: 645, y: 675, type: 'ROOM_CENTER' },
];

export const GROUND_FLOOR_EDGES: NavigationEdge[] = [
  { from: 'wp-gf-entrance', to: 'wp-gf-corridor', distanceMeters: 10 },

  { from: 'wp-gf-corridor', to: 'wp-gf-coe-door', distanceMeters: 7 },
  { from: 'wp-gf-coe-door', to: 'wp-gf-coe-center', distanceMeters: 6 },

  { from: 'wp-gf-corridor', to: 'wp-gf-ladies-door', distanceMeters: 6 },
  { from: 'wp-gf-ladies-door', to: 'wp-gf-ladies-center', distanceMeters: 5 },

  { from: 'wp-gf-corridor', to: 'wp-gf-seminar-door', distanceMeters: 6 },
  { from: 'wp-gf-seminar-door', to: 'wp-gf-seminar-center', distanceMeters: 8 },
  { from: 'wp-gf-seminar-door', to: 'wp-gf-gents-door', distanceMeters: 4 },
  { from: 'wp-gf-gents-door', to: 'wp-gf-gents-center', distanceMeters: 4 },

  { from: 'wp-gf-corridor', to: 'wp-gf-stairs-door', distanceMeters: 5 },
  { from: 'wp-gf-stairs-door', to: 'wp-gf-stairs-center', distanceMeters: 5 },

  { from: 'wp-gf-corridor', to: 'wp-gf-cctv-door', distanceMeters: 5 },
  { from: 'wp-gf-cctv-door', to: 'wp-gf-cctv-center', distanceMeters: 5 },
  { from: 'wp-gf-cctv-door', to: 'wp-gf-stairs-door', distanceMeters: 3 },
];

// Helper to compute shortest route between two waypoints using Dijkstra algorithm
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

  const totalDistance = distances.get(destWaypointId) ?? 20;
  const estimatedSeconds = Math.round(totalDistance / 1.2);

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
    steps: steps.length > 0 ? steps : [{ instruction: 'Proceed directly to destination', distance: '10m' }],
  };
}
