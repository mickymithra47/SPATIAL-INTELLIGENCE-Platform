import { Waypoint } from '@spatial/types';
import { GraphEdgeProperties } from './ontology.js';

export interface AdjacencyEdge {
  targetWaypointId: string;
  props: GraphEdgeProperties;
}

export type SpatialGraphAdjacencyMap = Map<string, AdjacencyEdge[]>;

export interface RouteResult {
  waypoints: Waypoint[];
  totalDistanceMeters: number;
  estimatedMinutes: number;
  floorTransitions: {
    fromFloorId: string;
    toFloorId: string;
    transitionType: 'STAIRS' | 'ELEVATOR' | 'RAMP';
    waypointId: string;
  }[];
  isAccessible: boolean;
}

/**
 * Multimodal A* Router for Indoor & Multi-Floor Campus Wayfinding
 */
export class AStarSpatialRouter {
  constructor(
    private waypoints: Map<string, Waypoint>,
    private adjacencyList: SpatialGraphAdjacencyMap
  ) {}

  /**
   * Euclidean distance heuristic between two physical waypoints
   */
  private heuristic(a: Waypoint, b: Waypoint): number {
    const latDiff = (a.coordinate.latitude - b.coordinate.latitude) * 111000;
    const lngDiff = (a.coordinate.longitude - b.coordinate.longitude) * 111000;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  }

  /**
   * Finds the optimal path between origin and destination waypoints.
   * Respects accessibility constraints (excludes stairs if accessibleOnly is set).
   */
  public findRoute(
    originId: string,
    destinationId: string,
    accessibleOnly: boolean = false,
    blockedWaypointIds: Set<string> = new Set()
  ): RouteResult | null {
    const startWp = this.waypoints.get(originId);
    const endWp = this.waypoints.get(destinationId);

    if (!startWp || !endWp) return null;
    if (blockedWaypointIds.has(originId) || blockedWaypointIds.has(destinationId)) return null;

    if (originId === destinationId) {
      return {
        waypoints: [startWp],
        totalDistanceMeters: 0,
        estimatedMinutes: 0,
        floorTransitions: [],
        isAccessible: true,
      };
    }

    const openSet = new Set<string>([originId]);
    const cameFrom = new Map<string, string>();

    const gScore = new Map<string, number>();
    gScore.set(originId, 0);

    const fScore = new Map<string, number>();
    fScore.set(originId, this.heuristic(startWp, endWp));

    while (openSet.size > 0) {
      // Find node in openSet with lowest fScore
      let currentId = Array.from(openSet).reduce((lowest, node) => {
        return (fScore.get(node) ?? Infinity) < (fScore.get(lowest) ?? Infinity) ? node : lowest;
      });

      if (currentId === destinationId) {
        // Reconstruct path
        const path: Waypoint[] = [];
        let curr: string | undefined = currentId;
        while (curr) {
          const wp = this.waypoints.get(curr);
          if (wp) path.unshift(wp);
          curr = cameFrom.get(curr);
        }

        const totalDist = gScore.get(destinationId) ?? 0;
        
        // Detect floor transitions along the path
        const transitions: RouteResult['floorTransitions'] = [];
        for (let i = 0; i < path.length - 1; i++) {
          const w1 = path[i];
          const w2 = path[i + 1];
          if (w1.floorId !== w2.floorId) {
            transitions.push({
              fromFloorId: w1.floorId,
              toFloorId: w2.floorId,
              transitionType: w1.waypointType === 'ELEVATOR' ? 'ELEVATOR' : 'STAIRS',
              waypointId: w1.id,
            });
          }
        }

        // Standard walking speed: ~1.2 m/s (72 m/min) + 1 min penalty per vertical transition
        const walkingMinutes = totalDist / 72;
        const transitionMinutes = transitions.length * 1.0;
        const estimatedMinutes = Math.max(1, Math.round((walkingMinutes + transitionMinutes) * 10) / 10);

        return {
          waypoints: path,
          totalDistanceMeters: Math.round(totalDist * 10) / 10,
          estimatedMinutes,
          floorTransitions: transitions,
          isAccessible: !path.some((wp) => !wp.isAccessible),
        };
      }

      openSet.delete(currentId);
      const neighbors = this.adjacencyList.get(currentId) || [];

      for (const edge of neighbors) {
        if (blockedWaypointIds.has(edge.targetWaypointId)) {
          continue;
        }

        // Filter out non-accessible edges if accessible routing is requested
        if (accessibleOnly && edge.props.isStair) {
          continue;
        }

        const edgeCost = edge.props.distanceMeters ?? 10;
        const tentativeGScore = (gScore.get(currentId) ?? Infinity) + edgeCost;

        if (tentativeGScore < (gScore.get(edge.targetWaypointId) ?? Infinity)) {
          cameFrom.set(edge.targetWaypointId, currentId);
          gScore.set(edge.targetWaypointId, tentativeGScore);

          const neighborWp = this.waypoints.get(edge.targetWaypointId);
          if (neighborWp) {
            fScore.set(edge.targetWaypointId, tentativeGScore + this.heuristic(neighborWp, endWp));
            openSet.add(edge.targetWaypointId);
          }
        }
      }
    }

    return null; // Route not found
  }
}
