import { Injectable } from '@nestjs/common';
import { SEED_DATA } from '@spatial/database/dist/seed-data.js';
import { AStarSpatialRouter, AdjacencyEdge } from '@spatial/spatial-graph';
import { Waypoint } from '@spatial/types';

@Injectable()
export class SpatialDataService {
  private organization = SEED_DATA.organization;
  private campuses = [...SEED_DATA.campuses];
  private buildings = [...SEED_DATA.buildings];
  private floors = [...SEED_DATA.floors];
  private rooms = [...SEED_DATA.rooms];
  private waypoints = [...SEED_DATA.waypoints];
  private routeEdges = [...SEED_DATA.routeEdges];
  private assets = [...SEED_DATA.assets];
  private timetables = [...SEED_DATA.timetables];
  private tickets = [...SEED_DATA.tickets];
  private users = [...SEED_DATA.users];

  private router: AStarSpatialRouter;

  constructor() {
    this.initRouter();
  }

  private initRouter() {
    const waypointMap = new Map<string, Waypoint>();
    for (const wp of this.waypoints) {
      waypointMap.set(wp.id, wp);
    }

    const adjacencyMap = new Map<string, AdjacencyEdge[]>();
    for (const edge of this.routeEdges) {
      const edges = adjacencyMap.get(edge.sourceWaypointId) || [];
      edges.push({
        targetWaypointId: edge.targetWaypointId,
        props: {
          distanceMeters: edge.distanceMeters,
          isAccessible: edge.isAccessible,
          isStair: edge.isStair,
          isElevator: edge.isElevator,
        },
      });
      adjacencyMap.set(edge.sourceWaypointId, edges);
    }

    this.router = new AStarSpatialRouter(waypointMap, adjacencyMap);
  }

  // --- SPATIAL ---
  getCampuses() {
    return this.campuses;
  }

  getBuildings(campusId?: string) {
    if (campusId) {
      return this.buildings.filter((b) => b.campusId === campusId);
    }
    return this.buildings;
  }

  getFloors(buildingId?: string) {
    if (buildingId) {
      return this.floors.filter((f) => f.buildingId === buildingId);
    }
    return this.floors;
  }

  getRooms(floorId?: string) {
    if (floorId) {
      return this.rooms.filter((r) => r.floorId === floorId);
    }
    return this.rooms;
  }

  findRoom(query: string) {
    const q = query.toLowerCase().trim();
    return this.rooms.find(
      (r) =>
        r.roomNumber.toLowerCase() === q ||
        r.name.toLowerCase().includes(q) ||
        r.id === q
    );
  }

  findBuilding(query: string) {
    const q = query.toLowerCase().trim();
    return this.buildings.find(
      (b) =>
        b.code.toLowerCase() === q ||
        b.name.toLowerCase().includes(q) ||
        b.id === q
    );
  }

  getRoomDetails(roomId: string) {
    const room = this.rooms.find((r) => r.id === roomId || r.roomNumber === roomId);
    if (!room) return null;
    const floor = this.floors.find((f) => f.id === room.floorId);
    const building = floor ? this.buildings.find((b) => b.id === floor.buildingId) : null;
    const campus = building ? this.campuses.find((c) => c.id === building.campusId) : null;
    const assets = this.assets.filter((a) => a.roomId === room.id);

    return {
      room,
      floor,
      building,
      campus,
      assets,
    };
  }

  // --- ROUTING ---
  calculateIndoorRoute(originQuery: string, destinationQuery: string, accessibleOnly: boolean = false) {
    const originRoom = this.findRoom(originQuery);
    const destRoom = this.findRoom(destinationQuery);

    if (!originRoom || !destRoom) {
      return {
        success: false,
        error: `Could not resolve rooms: origin=${originQuery}, destination=${destinationQuery}`,
      };
    }

    const originWp = this.waypoints.find((w) => w.connectedRoomId === originRoom.id);
    const destWp = this.waypoints.find((w) => w.connectedRoomId === destRoom.id);

    if (!originWp || !destWp) {
      return {
        success: false,
        error: `Waypoints not mapped for rooms: originWp=${originWp?.id}, destWp=${destWp?.id}`,
      };
    }

    const route = this.router.findRoute(originWp.id, destWp.id, accessibleOnly);
    if (!route) {
      return {
        success: false,
        error: `No viable path found between ${originRoom.name} and ${destRoom.name}`,
      };
    }

    return {
      success: true,
      origin: originRoom,
      destination: destRoom,
      route,
    };
  }

  // --- ASSETS ---
  findAsset(query: string) {
    const q = query.toLowerCase().trim();
    const asset = this.assets.find(
      (a) =>
        a.assetTag.toLowerCase() === q ||
        a.name.toLowerCase().includes(q) ||
        a.id === q
    );
    if (!asset) return null;
    const room = this.rooms.find((r) => r.id === asset.roomId);
    const floor = room ? this.floors.find((f) => f.id === room.floorId) : null;
    const building = floor ? this.buildings.find((b) => b.id === floor.buildingId) : null;

    return {
      asset,
      room,
      floor,
      building,
    };
  }

  getAssetsByRoom(roomId: string) {
    return this.assets.filter((a) => a.roomId === roomId);
  }

  updateAssetStatus(assetId: string, status: string) {
    const asset = this.assets.find((a) => a.id === assetId || a.assetTag === assetId);
    if (asset) {
      asset.status = status;
    }
    return asset;
  }

  // --- TIMETABLES ---
  getRoomSchedule(roomQuery: string) {
    const room = this.findRoom(roomQuery);
    if (!room) return [];
    return this.timetables.filter((t) => t.roomId === room.id);
  }

  // --- MAINTENANCE TICKETS ---
  getTickets() {
    return this.tickets.map((t) => {
      const room = this.rooms.find((r) => r.id === t.roomId);
      const asset = t.assetId ? this.assets.find((a) => a.id === t.assetId) : null;
      return { ...t, room, asset };
    });
  }

  createTicket(data: {
    roomQuery: string;
    assetQuery?: string;
    issueSummary: string;
    priority?: string;
    userId?: string;
  }) {
    const room = this.findRoom(data.roomQuery);
    if (!room) {
      throw new Error(`Room not found: ${data.roomQuery}`);
    }

    let assetId: string | undefined;
    if (data.assetQuery) {
      const assetInfo = this.findAsset(data.assetQuery);
      if (assetInfo) assetId = assetInfo.asset.id;
    }

    const ticketNumber = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      id: `t-${Date.now()}`,
      ticketNumber,
      roomId: room.id,
      assetId,
      reportedByUserId: data.userId || 'usr-student-01',
      issueSummary: data.issueSummary,
      status: 'OPEN',
      priority: data.priority || 'MEDIUM',
      createdAt: new Date().toISOString(),
    };

    this.tickets.unshift(newTicket);
    return {
      ...newTicket,
      room,
      asset: assetId ? this.assets.find((a) => a.id === assetId) : undefined,
    };
  }

  updateTicketStatus(ticketId: string, status: string) {
    const ticket = this.tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (ticket) {
      ticket.status = status;
      if (status === 'RESOLVED' || status === 'CLOSED') {
        ticket.resolvedAt = new Date().toISOString();
      }
    }
    return ticket;
  }
}
