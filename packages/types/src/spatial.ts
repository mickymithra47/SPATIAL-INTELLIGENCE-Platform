export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planTier: 'PILOT' | 'STANDARD' | 'ENTERPRISE';
  createdAt: string;
}

export interface Campus {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  centerCoordinates: GeoPoint;
  boundingPolygon?: GeoPoint[];
}

export interface Building {
  id: string;
  campusId: string;
  name: string;
  code: string;
  totalFloors: number;
  footprint?: GeoPoint[];
}

export interface Floor {
  id: string;
  buildingId: string;
  floorNumber: number;
  name: string;
  elevationMeters: number;
  floorPlanSvgUrl?: string;
}

export type RoomType = 
  | 'CLASSROOM'
  | 'COMPUTER_LAB'
  | 'RESEARCH_LAB'
  | 'FACULTY_OFFICE'
  | 'ADMIN_OFFICE'
  | 'LIBRARY'
  | 'AUDITORIUM'
  | 'RESTROOM'
  | 'CAFETERIA'
  | 'UTILITY';

export interface Room {
  id: string;
  floorId: string;
  roomNumber: string;
  name: string;
  roomType: RoomType;
  capacity: number;
  isAccessible: boolean;
  departmentId?: string;
  polygonCoordinates?: GeoPoint[];
}

export interface Waypoint {
  id: string;
  floorId: string;
  coordinate: GeoPoint;
  waypointType: 'DOOR' | 'CORRIDOR_JUNCTION' | 'ELEVATOR' | 'STAIR' | 'EMERGENCY_EXIT';
  isAccessible: boolean;
}

export interface NavigationRoute {
  originRoomId: string;
  destinationRoomId: string;
  totalDistanceMeters: number;
  estimatedMinutes: number;
  waypoints: Waypoint[];
  floorTransitions: {
    fromFloorId: string;
    toFloorId: string;
    transitionType: 'STAIRS' | 'ELEVATOR' | 'RAMP';
    waypointId: string;
  }[];
  isAccessible: boolean;
}

// ---------------------------------------------------------
// UNIFIED SPATIAL ENTITY MODEL (Section 6)
// ---------------------------------------------------------

export type SpatialEntityType =
  | 'CAMPUS'
  | 'BUILDING'
  | 'FLOOR'
  | 'ROOM'
  | 'LAB'
  | 'CORRIDOR'
  | 'DOOR'
  | 'STAIR'
  | 'ELEVATOR'
  | 'ENTRANCE'
  | 'EXIT'
  | 'EQUIPMENT'
  | 'PARKING'
  | 'EMERGENCY_POINT'
  | 'SERVICE_POINT';

export interface SpatialGeometry {
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
  coordinates: any;
}

export interface SpatialEntityRelationship {
  targetEntityId: string;
  relationshipType: string;
  metadata?: Record<string, unknown>;
}

export interface SpatialEntity {
  id: string;
  type: SpatialEntityType;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  geometry?: SpatialGeometry;
  buildingId?: string;
  floorId?: string;
  parentId?: string;
  accessibility?: {
    isWheelchairAccessible: boolean;
    hasElevatorAccess: boolean;
    hasRamp: boolean;
  };
  capacity?: number;
  metadata?: Record<string, unknown>;
  relationships?: SpatialEntityRelationship[];
}

// ---------------------------------------------------------
// SPATIAL SIMULATION ENGINE MODELS (Section 17, 18, 19)
// ---------------------------------------------------------

export type SimulationType =
  | 'EMERGENCY_EVACUATION'
  | 'WHAT_IF_CLOSURE'
  | 'ACCESSIBILITY_AUDIT'
  | 'CROWD_CONGESTION';

export interface SimulationScenario {
  id: string;
  name: string;
  type: SimulationType;
  environmentId: string;
  blockedEntityIds: string[];
  affectedZoneIds?: string[];
  occupancyLoad?: number;
  startTime?: string;
  durationMinutes?: number;
  params?: Record<string, unknown>;
}

export interface EvacuationRouteFlow {
  sourceEntityId: string;
  targetExitId: string;
  exitName: string;
  pathCoordinates: GeoPoint[];
  distanceMeters: number;
  estimatedEvacuationTimeSec: number;
  congestionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ExitUtilizationMetric {
  exitId: string;
  exitName: string;
  loadCount: number;
  capacityPercent: number;
  status: 'OPTIMAL' | 'CONGESTED' | 'BLOCKED';
}

export interface SimulationResult {
  scenarioId: string;
  type: SimulationType;
  status: 'COMPLETED' | 'FAILED';
  summary: string;
  affectedEntities: string[];
  evacuationRoutes?: EvacuationRouteFlow[];
  exitUtilization?: ExitUtilizationMetric[];
  alternateRoutesAvailable: boolean;
  recommendations: string[];
  impactMetrics?: {
    totalEvacuees?: number;
    avgEvacuationSeconds?: number;
    bottleNeckCount?: number;
    reroutedOccupants?: number;
  };
}

// ---------------------------------------------------------
// OUTDOOR + INDOOR MULTIMODAL ROUTING (Section 11, 12)
// ---------------------------------------------------------

export interface MultimodalRouteSegment {
  segmentType: 'OUTDOOR_GIS' | 'CAMPUS_ENTRANCE' | 'INDOOR_CORRIDOR' | 'VERTICAL_TRANSITION';
  title: string;
  instruction: string;
  distanceMeters: number;
  transitionType?: 'STAIRS' | 'ELEVATOR' | 'RAMP' | 'WALK';
  level?: string;
  pathCoordinates: GeoPoint[];
}

export interface MultimodalRoute {
  origin: { id: string; name: string; type: 'OUTDOOR_POINT' | 'ROOM'; coordinate: GeoPoint };
  destination: { id: string; name: string; type: 'OUTDOOR_POINT' | 'ROOM'; coordinate: GeoPoint };
  totalDistanceMeters: number;
  estimatedMinutes: number;
  isAccessible: boolean;
  segments: MultimodalRouteSegment[];
  waypoints: Waypoint[];
}

// ---------------------------------------------------------
// GEOJSON FEATURE COLLECTION TYPES (Section 8)
// ---------------------------------------------------------

export interface GeoJSONFeature {
  type: 'Feature';
  id?: string | number;
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
  properties: {
    id: string;
    name: string;
    entityType: SpatialEntityType;
    buildingId?: string;
    floorNumber?: number;
    capacity?: number;
    status?: string;
    isAccessible?: boolean;
    [key: string]: any;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

