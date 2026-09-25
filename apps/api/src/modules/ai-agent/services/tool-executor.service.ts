import { Injectable, ForbiddenException } from '@nestjs/common';
import { z } from 'zod';
import { SpatialDataService } from '../../../common/data/spatial-data.service.js';

// Schemas for Controlled Tool Execution
export const FindRoomSchema = z.object({
  query: z.string().min(1).describe('Room number or room name'),
});

export const FindBuildingSchema = z.object({
  query: z.string().min(1).describe('Building code or building name'),
});

export const FindAssetSchema = z.object({
  query: z.string().min(1).describe('Asset tag (e.g. P-204) or asset name'),
});

export const CalculateIndoorRouteSchema = z.object({
  origin: z.string().min(1).describe('Origin room number or name'),
  destination: z.string().min(1).describe('Destination room number or name'),
  accessibleOnly: z.boolean().default(false).describe('Whether to require wheelchair/elevator accessible path'),
});

export const GetRoomScheduleSchema = z.object({
  roomQuery: z.string().min(1).describe('Room number or name'),
});

export const CreateMaintenanceTicketSchema = z.object({
  room: z.string().min(1).describe('Room where problem is observed'),
  asset: z.string().optional().describe('Asset tag or name if equipment is affected'),
  issue: z.string().min(5).describe('Description of the issue'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
});

export const UpdateTicketStatusSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
});

export const SearchSpatialEntitiesSchema = z.object({
  query: z.string().optional().describe('Name, code or keyword to search'),
  type: z
    .enum([
      'CAMPUS',
      'BUILDING',
      'FLOOR',
      'ROOM',
      'LAB',
      'CORRIDOR',
      'DOOR',
      'STAIR',
      'ELEVATOR',
      'ENTRANCE',
      'EXIT',
      'EQUIPMENT',
      'PARKING',
      'EMERGENCY_POINT',
      'SERVICE_POINT',
    ])
    .optional()
    .describe('Spatial entity type filter'),
});

export const FindNearbyEntitiesSchema = z.object({
  entityQuery: z.string().optional().describe('Center entity name or ID (e.g. "main entrance", "Block B")'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radiusMeters: z.number().default(500).describe('Search radius in meters'),
  typeFilter: z.string().optional().describe('Entity type filter'),
});

export const CalculateMultimodalRouteSchema = z.object({
  origin: z.string().min(1).describe('Outdoor gate/entrance or indoor room'),
  destination: z.string().min(1).describe('Target indoor room or facility'),
  accessibleOnly: z.boolean().default(false).describe('Avoid stairs / require elevator'),
});

export const SimulateSpatialScenarioSchema = z.object({
  type: z.enum(['EMERGENCY_EVACUATION', 'WHAT_IF_CLOSURE', 'ACCESSIBILITY_AUDIT', 'CROWD_CONGESTION']),
  name: z.string().optional(),
  environmentId: z.string().default('b-cse-001'),
  blockedEntityIds: z.array(z.string()).default([]),
  occupancyLoad: z.number().optional(),
});

export type ToolName =
  | 'findRoom'
  | 'findBuilding'
  | 'findAsset'
  | 'calculateIndoorRoute'
  | 'getRoomSchedule'
  | 'createMaintenanceTicket'
  | 'updateTicketStatus'
  | 'searchSpatialEntities'
  | 'findNearbyEntities'
  | 'calculateMultimodalRoute'
  | 'simulateSpatialScenario';


@Injectable()
export class ToolExecutorService {
  constructor(private spatialData: SpatialDataService) {}

  public async executeTool(
    toolName: ToolName,
    args: Record<string, unknown>,
    userRole: string = 'STUDENT'
  ): Promise<any> {
    // RBAC validation on tool execution
    if (toolName === 'updateTicketStatus') {
      if (!['MAINTENANCE_STAFF', 'CAMPUS_ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        throw new ForbiddenException(`Role ${userRole} is not authorized to execute tool ${toolName}`);
      }
    }

    switch (toolName) {
      case 'findRoom': {
        const validated = FindRoomSchema.parse(args);
        const details = this.spatialData.getRoomDetails(validated.query);
        if (!details) {
          return { found: false, message: `Room '${validated.query}' not found.` };
        }
        return {
          found: true,
          room: details.room,
          floor: details.floor?.name,
          floorNumber: details.floor?.floorNumber,
          building: details.building?.name,
          buildingCode: details.building?.code,
          campus: details.campus?.name,
          equipmentCount: details.assets.length,
          equipment: details.assets.map((a) => `${a.name} (${a.assetTag}) - ${a.status}`),
        };
      }

      case 'findBuilding': {
        const validated = FindBuildingSchema.parse(args);
        const building = this.spatialData.findBuilding(validated.query);
        if (!building) {
          return { found: false, message: `Building '${validated.query}' not found.` };
        }
        const floors = this.spatialData.getFloors(building.id);
        return {
          found: true,
          building,
          totalFloors: building.totalFloors,
          floors: floors.map((f) => f.name),
        };
      }

      case 'findAsset': {
        const validated = FindAssetSchema.parse(args);
        const assetInfo = this.spatialData.findAsset(validated.query);
        if (!assetInfo) {
          return { found: false, message: `Asset '${validated.query}' not found.` };
        }
        return {
          found: true,
          asset: assetInfo.asset,
          room: assetInfo.room?.name,
          roomNumber: assetInfo.room?.roomNumber,
          floor: assetInfo.floor?.name,
          building: assetInfo.building?.name,
        };
      }

      case 'calculateIndoorRoute': {
        const validated = CalculateIndoorRouteSchema.parse(args);
        const routeResult = this.spatialData.calculateIndoorRoute(
          validated.origin,
          validated.destination,
          validated.accessibleOnly
        );
        return routeResult;
      }

      case 'getRoomSchedule': {
        const validated = GetRoomScheduleSchema.parse(args);
        const schedule = this.spatialData.getRoomSchedule(validated.roomQuery);
        const room = this.spatialData.findRoom(validated.roomQuery);
        return {
          room: room?.name || validated.roomQuery,
          scheduleCount: schedule.length,
          schedule: schedule.map((s) => ({
            classCode: s.classCode,
            className: s.className,
            faculty: s.facultyName,
            time: `${s.startTime} - ${s.endTime}`,
            day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][s.dayOfWeek - 1],
          })),
        };
      }

      case 'createMaintenanceTicket': {
        const validated = CreateMaintenanceTicketSchema.parse(args);
        const ticket = this.spatialData.createTicket({
          roomQuery: validated.room,
          assetQuery: validated.asset,
          issueSummary: validated.issue,
          priority: validated.priority,
        });
        return {
          success: true,
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          status: ticket.status,
          room: ticket.room?.name,
          asset: ticket.asset?.name || validated.asset || 'Room Facility',
          priority: ticket.priority,
          message: `Maintenance ticket ${ticket.ticketNumber} successfully created with status ${ticket.status}.`,
        };
      }

      case 'updateTicketStatus': {
        const validated = UpdateTicketStatusSchema.parse(args);
        const updated = this.spatialData.updateTicketStatus(validated.ticketId, validated.status);
        if (!updated) {
          return { success: false, message: `Ticket ${validated.ticketId} not found.` };
        }
        return {
          success: true,
          ticketId: updated.id,
          ticketNumber: updated.ticketNumber,
          newStatus: updated.status,
          resolvedAt: updated.resolvedAt,
        };
      }

      case 'searchSpatialEntities': {
        const validated = SearchSpatialEntitiesSchema.parse(args);
        let entities = this.spatialData.getUnifiedEntities(validated.type as any);
        if (validated.query) {
          const q = validated.query.toLowerCase().trim();
          entities = entities.filter(
            (e) =>
              e.name.toLowerCase().includes(q) ||
              e.id.toLowerCase().includes(q) ||
              e.type.toLowerCase().includes(q)
          );
        }
        return {
          success: true,
          count: entities.length,
          entities: entities.slice(0, 10),
        };
      }

      case 'findNearbyEntities': {
        const validated = FindNearbyEntitiesSchema.parse(args);
        let lat = validated.latitude || 12.9716;
        let lng = validated.longitude || 77.5946;

        if (validated.entityQuery) {
          const center = this.spatialData.getEntityById(validated.entityQuery);
          if (center) {
            lat = center.latitude;
            lng = center.longitude;
          }
        }

        const nearby = this.spatialData.findNearbyEntities(
          lat,
          lng,
          validated.radiusMeters,
          validated.typeFilter as any
        );

        return {
          success: true,
          centerCoordinates: { latitude: lat, longitude: lng },
          radiusMeters: validated.radiusMeters,
          count: nearby.length,
          entities: nearby.map((e) => ({
            id: e.id,
            name: e.name,
            type: e.type,
            distanceMeters: e.distanceMeters,
            isAccessible: e.accessibility?.isWheelchairAccessible,
          })),
        };
      }

      case 'calculateMultimodalRoute': {
        const validated = CalculateMultimodalRouteSchema.parse(args);
        const route = this.spatialData.calculateMultimodalRoute(
          validated.origin,
          validated.destination,
          validated.accessibleOnly
        );
        return {
          success: !('error' in route),
          ...route,
        };
      }

      case 'simulateSpatialScenario': {
        const validated = SimulateSpatialScenarioSchema.parse(args);
        const scenario = {
          id: `scenario-${Date.now()}`,
          name: validated.name || `Simulation: ${validated.type}`,
          type: validated.type,
          environmentId: validated.environmentId,
          blockedEntityIds: validated.blockedEntityIds,
          occupancyLoad: validated.occupancyLoad,
        };
        const result = this.spatialData.runSimulation(scenario as any);
        return {
          success: true,
          result,
        };
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

