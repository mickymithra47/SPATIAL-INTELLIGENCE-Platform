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

export type ToolName =
  | 'findRoom'
  | 'findBuilding'
  | 'findAsset'
  | 'calculateIndoorRoute'
  | 'getRoomSchedule'
  | 'createMaintenanceTicket'
  | 'updateTicketStatus';

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

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}
