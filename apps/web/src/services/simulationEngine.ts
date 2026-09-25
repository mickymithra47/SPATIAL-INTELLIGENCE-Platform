'use client';

export type SimulationEvent =
  | 'NORMAL'
  | 'CORRIDOR_MAINTENANCE'
  | 'LIFT_OUT_OF_SERVICE'
  | 'HIGH_OCCUPANCY_SEMINAR';

export interface SpatialEventState {
  type: SimulationEvent;
  title: string;
  description: string;
  affectedFloor: 'GROUND' | 'FIRST' | 'SECOND' | 'TERRACE' | 'ALL';
  blockedWaypoints: string[];
  severity: 'INFO' | 'WARNING' | 'ALERT';
}

export const SPATIAL_EVENTS: Record<SimulationEvent, SpatialEventState> = {
  NORMAL: {
    type: 'NORMAL',
    title: 'Standard Operations',
    description: 'All corridors, elevators, and stairs are operating normally with clear accessibility.',
    affectedFloor: 'ALL',
    blockedWaypoints: [],
    severity: 'INFO',
  },
  CORRIDOR_MAINTENANCE: {
    type: 'CORRIDOR_MAINTENANCE',
    title: 'West Corridor Maintenance',
    description: 'Floor resurfacing at West Corridor (wp-gf-hub-sw). Indoor routing automatically detours via Atrium Central Hub.',
    affectedFloor: 'GROUND',
    blockedWaypoints: ['wp-gf-hub-sw'],
    severity: 'WARNING',
  },
  LIFT_OUT_OF_SERVICE: {
    type: 'LIFT_OUT_OF_SERVICE',
    title: 'Central Lift Maintenance',
    description: 'Central elevator is temporarily out of service. Vertical circulation routes diverted to West & East Staircases.',
    affectedFloor: 'ALL',
    blockedWaypoints: ['wp-gf-lift', 'wp-1f-lift', 'wp-2f-lift', 'wp-tr-lift'],
    severity: 'ALERT',
  },
  HIGH_OCCUPANCY_SEMINAR: {
    type: 'HIGH_OCCUPANCY_SEMINAR',
    title: 'High Density: Seminar in Progress',
    description: 'Ground Floor Seminar Hall is at peak capacity (120/120 occupants). South corridor flow restricted.',
    affectedFloor: 'GROUND',
    blockedWaypoints: [],
    severity: 'WARNING',
  },
};

export interface LabTelemetryData {
  labId: string;
  labName: string;
  floor: string;
  systemsOnline: number;
  totalSystems: number;
  cpuLoadPercent: number;
  memoryUsagePercent: number;
  temperatureC: number;
  networkThroughputMbps: number;
  activeOccupancy: number;
  maxCapacity: number;
  airQualityPpm: number;
  status: 'ONLINE' | 'MAINTENANCE' | 'WARNING';
}

export const LAB_TELEMETRY: Record<string, LabTelemetryData> = {
  'GF-LAB-01': {
    labId: 'GF-LAB-01',
    labName: 'Lab 1 (Robotics & AI)',
    floor: 'Ground Floor',
    systemsOnline: 36,
    totalSystems: 40,
    cpuLoadPercent: 24,
    memoryUsagePercent: 48,
    temperatureC: 22.4,
    networkThroughputMbps: 1250,
    activeOccupancy: 24,
    maxCapacity: 40,
    airQualityPpm: 460,
    status: 'ONLINE',
  },
  '1F-LAB-02': {
    labId: '1F-LAB-02',
    labName: 'AI Research & Neural Systems Lab',
    floor: 'First Floor',
    systemsOnline: 39,
    totalSystems: 40,
    cpuLoadPercent: 68,
    memoryUsagePercent: 82,
    temperatureC: 21.8,
    networkThroughputMbps: 3400,
    activeOccupancy: 35,
    maxCapacity: 40,
    airQualityPpm: 520,
    status: 'ONLINE',
  },
  '2F-LAB-04': {
    labId: '2F-LAB-04',
    labName: 'Robotics & Cyber-Physical Lab',
    floor: 'Second Floor',
    systemsOnline: 32,
    totalSystems: 35,
    cpuLoadPercent: 44,
    memoryUsagePercent: 61,
    temperatureC: 22.1,
    networkThroughputMbps: 1800,
    activeOccupancy: 28,
    maxCapacity: 35,
    airQualityPpm: 480,
    status: 'ONLINE',
  },
};
