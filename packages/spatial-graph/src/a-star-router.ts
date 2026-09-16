import { Waypoint, NavigationRoute } from '@spatial/types';
import { GraphEdgeProperties } from './ontology.js';

export interface AdjacencyEdge {
  targetWaypointId: string;
  props: GraphEdgeProperties;
}

export type SpatialGraphAdjacencyMap = Map<string, AdjacencyEdge[]>;

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
    accessibleOnly: boolean = false
  ): { waypoints: Waypoint[]; totalDistanceMeters: number } | null {
    const openSet = new Set<string>([originId]);
    const cameFrom = new Map<string, string>();

    const gScore = new Map<string, number>();
    gScore.set(originId, 0);

    const fScore = new Map<string, number>();
    const startWp = this.waypoints.get(originId);
    const endWp = this.waypoints.get(destinationId);

    if (!startWp || !endWp) return null;

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
        return {
          waypoints: path,
          totalDistanceMeters: gScore.get(destinationId) ?? 0,
        };
      }

      openSet.delete(currentId);
      const neighbors = this.adjacencyList.get(currentId) || [];

      for (const edge of neighbors) {
        // Filter out non-accessible edges if accessible routing is requested
        if (accessibleOnly && edge.props.isStair) {
          continue;
        }

        const tentativeGScore = (gScore.get(currentId) ?? Infinity) + (edge.props.distanceMeters ?? 10);

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
