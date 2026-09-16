/**
 * Canonical Spatial Knowledge Graph Ontology
 * Formalizes node labels, properties, and directed edge relationships.
 */

export enum NodeLabel {
  ORGANIZATION = 'Organization',
  CAMPUS = 'Campus',
  BUILDING = 'Building',
  FLOOR = 'Floor',
  ROOM = 'Room',
  WAYPOINT = 'Waypoint',
  ASSET = 'Asset',
  PERSON = 'Person',
  DEPARTMENT = 'Department',
  CLASS_SESSION = 'ClassSession',
}

export enum RelationshipType {
  // Spatial containment & hierarchy
  OWNS = 'OWNS',                               // (:Organization)-[:OWNS]->(:Campus)
  CONTAINS_BUILDING = 'CONTAINS_BUILDING',     // (:Campus)-[:CONTAINS_BUILDING]->(:Building)
  HAS_FLOOR = 'HAS_FLOOR',                     // (:Building)-[:HAS_FLOOR]->(:Floor)
  CONTAINS_ROOM = 'CONTAINS_ROOM',             // (:Floor)-[:CONTAINS_ROOM]->(:Room)
  HOUSES_ASSET = 'HOUSES_ASSET',               // (:Room)-[:HOUSES_ASSET]->(:Asset)
  HAS_ENTRANCE = 'HAS_ENTRANCE',               // (:Room)-[:HAS_ENTRANCE]->(:Waypoint)

  // Wayfinding & topology
  CONNECTS_TO = 'CONNECTS_TO',                 // (:Waypoint)-[:CONNECTS_TO]->(:Waypoint)
  
  // Operational relationships
  SCHEDULED_IN = 'SCHEDULED_IN',               // (:ClassSession)-[:SCHEDULED_IN]->(:Room)
  ENROLLED_IN = 'ENROLLED_IN',                 // (:Person)-[:ENROLLED_IN]->(:ClassSession)
  MANAGES_ROOM = 'MANAGES_ROOM',               // (:Department)-[:MANAGES_ROOM]->(:Room)
  MAINTAINS_FACILITY = 'MAINTAINS_FACILITY',   // (:Person)-[:MAINTAINS_FACILITY]->(:Building)
}

export interface GraphEdgeProperties {
  distanceMeters?: number;
  isAccessible?: boolean;
  isStair?: boolean;
  isElevator?: boolean;
  transitCost?: number;
}
