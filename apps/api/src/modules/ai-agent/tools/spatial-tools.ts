import { z } from 'zod';

/**
 * Zod Schemas for LLM Tool Calling Validation
 */

export const ResolveEntitySchema = z.object({
  entityName: z.string().describe('Name or number of the room, lab, or building to locate'),
  campusId: z.string().uuid().optional().describe('Scoped campus UUID'),
});

export const RouteCalculationSchema = z.object({
  originRoomId: z.string().uuid().describe('Starting room UUID'),
  destinationRoomId: z.string().uuid().describe('Target room UUID'),
  accessibleOnly: z.boolean().default(false).describe('Avoid stairs and prioritize elevators'),
});

export const MaintenanceReportSchema = z.object({
  roomId: z.string().uuid().describe('Room where incident occurred'),
  assetId: z.string().uuid().optional().describe('Specific equipment UUID if applicable'),
  issueDescription: z.string().min(5).describe('Summary of the problem observed'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
});

export const RoomAvailabilitySchema = z.object({
  roomId: z.string().uuid().describe('Room UUID to query'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Date in YYYY-MM-DD format'),
});

export type ResolveEntityInput = z.infer<typeof ResolveEntitySchema>;
export type RouteCalculationInput = z.infer<typeof RouteCalculationSchema>;
export type MaintenanceReportInput = z.infer<typeof MaintenanceReportSchema>;
export type RoomAvailabilityInput = z.infer<typeof RoomAvailabilitySchema>;
