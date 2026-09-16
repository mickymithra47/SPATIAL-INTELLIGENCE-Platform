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
