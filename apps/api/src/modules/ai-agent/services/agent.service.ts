import { Injectable } from '@nestjs/common';
import { ToolExecutorService } from './tool-executor.service.js';
import { AIResponse } from '@spatial/types';

@Injectable()
export class AgentService {
  constructor(private toolExecutor: ToolExecutorService) {}

  public async processMessage(
    userMessage: string,
    conversationId: string = 'conv-default',
    userRole: string = 'STUDENT'
  ): Promise<AIResponse> {
    const text = userMessage.trim();
    const lower = text.toLowerCase();

    // Intent 1: Routing / Navigation
    // e.g. "How do I get from Room 101 to Room 204?" or "Navigate from 101 to 204"
    const routeMatch = lower.match(/(?:how do i get from|navigate from|directions from|route from)\s+(?:room\s+)?([a-z0-9-]+)\s+(?:to\s+)(?:room\s+)?([a-z0-9-]+)/i);
    if (routeMatch) {
      const origin = routeMatch[1];
      const destination = routeMatch[2];
      const accessibleOnly = lower.includes('accessible') || lower.includes('elevator') || lower.includes('wheelchair');

      const result = await this.toolExecutor.executeTool(
        'calculateIndoorRoute',
        { origin, destination, accessibleOnly },
        userRole
      );

      if (result.success) {
        return {
          conversationId,
          reply: `Here is the shortest route from ${result.origin.name} to ${result.destination.name}: Total distance is ${result.route.totalDistanceMeters}m (approx. ${result.route.estimatedMinutes} min). Follow the highlighted corridor waypoints.`,
          highlightedEntity: {
            type: 'ROUTE',
            id: `${result.origin.id}->${result.destination.id}`,
          },
          executedActions: [
            {
              actionType: 'CALCULATE_INDOOR_ROUTE',
              summary: `Calculated path from Room ${origin} to Room ${destination}`,
              payload: result,
            },
          ],
        };
      } else {
        return {
          conversationId,
          reply: `I couldn't calculate that route: ${result.error}`,
        };
      }
    }

    // Intent 2: Maintenance Report
    // e.g. "Create a maintenance ticket for the projector in Room 204" or "Report broken projector in Room 204"
    if (lower.includes('maintenance') || lower.includes('ticket') || lower.includes('broken') || lower.includes('report')) {
      const roomMatch = lower.match(/(?:room|lab)\s+([a-z0-9-]+)/i);
      const assetMatch = text.match(/\b([A-Z]+-[0-9]+)\b/) || lower.match(/(projector|workstation|computer|smart board|ac)/i);

      if (roomMatch) {
        const room = roomMatch[1];
        const asset = assetMatch ? assetMatch[1] : undefined;
        const issue = text;

        const ticketResult = await this.toolExecutor.executeTool(
          'createMaintenanceTicket',
          { room, asset, issue, priority: 'MEDIUM' },
          userRole
        );

        return {
          conversationId,
          reply: `I have registered your maintenance ticket: ${ticketResult.ticketNumber} for ${ticketResult.asset} in ${ticketResult.room}. Current status: ${ticketResult.status}. Facilities staff have been notified.`,
          highlightedEntity: {
            type: 'ROOM',
            id: ticketResult.room,
          },
          executedActions: [
            {
              actionType: 'CREATE_MAINTENANCE_TICKET',
              summary: ticketResult.message,
              payload: ticketResult,
            },
          ],
        };
      }
    }

    // Intent 3: Timetable / Room Schedule
    // e.g. "What is scheduled in Room 204?" or "Is Room 204 occupied?"
    if (lower.includes('schedule') || lower.includes('timetable') || lower.includes('class') || lower.includes('occupied')) {
      const roomMatch = lower.match(/(?:room|lab)\s+([a-z0-9-]+)/i);
      if (roomMatch) {
        const roomQuery = roomMatch[1];
        const scheduleResult = await this.toolExecutor.executeTool(
          'getRoomSchedule',
          { roomQuery },
          userRole
        );

        if (scheduleResult.scheduleCount > 0) {
          const list = scheduleResult.schedule
            .map((s: any) => `• ${s.className} (${s.classCode}) by ${s.faculty} on ${s.day} ${s.time}`)
            .join('\n');
          return {
            conversationId,
            reply: `Here are the scheduled sessions in ${scheduleResult.room}:\n${list}`,
            highlightedEntity: {
              type: 'ROOM',
              id: roomQuery,
            },
            executedActions: [
              {
                actionType: 'GET_ROOM_SCHEDULE',
                summary: `Found ${scheduleResult.scheduleCount} classes scheduled in Room ${roomQuery}`,
                payload: scheduleResult,
              },
            ],
          };
        } else {
          return {
            conversationId,
            reply: `There are currently no scheduled classes registered in Room ${roomQuery}. The room is available for open study.`,
          };
        }
      }
    }

    // Intent 4: Asset Lookup
    // e.g. "Where is projector P-204?"
    const assetTagMatch = text.match(/\b([A-Z]+-[0-9]+)\b/) || (lower.includes('projector') && text.match(/\b([pP]-?[0-9]+)\b/));
    if (assetTagMatch) {
      const tag = assetTagMatch[1];
      const assetResult = await this.toolExecutor.executeTool('findAsset', { query: tag }, userRole);

      if (assetResult.found) {
        return {
          conversationId,
          reply: `Asset ${assetResult.asset.name} (${assetResult.asset.assetTag}) is located in ${assetResult.room} on ${assetResult.floor} of ${assetResult.building}. Status: ${assetResult.asset.status}.`,
          highlightedEntity: {
            type: 'ASSET',
            id: assetResult.asset.id,
          },
          executedActions: [
            {
              actionType: 'FIND_ASSET',
              summary: `Located asset ${tag} in ${assetResult.room}`,
              payload: assetResult,
            },
          ],
        };
      }
    }

    // Intent 5: Spatial Search / Room Lookup
    // e.g. "Where is Room 204?" or "Where is AI Lab?"
    const roomLookup = lower.match(/(?:where is|find|locate|show me)\s+(?:room\s+)?([a-z0-9- ]+)/i);
    const target = roomLookup ? roomLookup[1].trim() : lower.replace(/[^a-z0-9]/g, '');

    const roomResult = await this.toolExecutor.executeTool('findRoom', { query: target }, userRole);
    if (roomResult.found) {
      return {
        conversationId,
        reply: `${roomResult.room.name} (Room ${roomResult.room.roomNumber}) is located on ${roomResult.floor} of ${roomResult.building} (${roomResult.campus}). Capacity: ${roomResult.room.capacity} seats. Equipment: ${roomResult.equipment.join(', ') || 'Standard'}.`,
        highlightedEntity: {
          type: 'ROOM',
          id: roomResult.room.id,
        },
        executedActions: [
          {
            actionType: 'FIND_ROOM',
            summary: `Resolved ${roomResult.room.name}`,
            payload: roomResult,
          },
        ],
      };
    }

    // Default conversational guidance
    return {
      conversationId,
      reply: `I can help you navigate the campus. Try asking:\n• "Where is Room 204?"\n• "How do I get from Room 101 to Room 204?"\n• "Where is projector P-204?"\n• "What is scheduled in Room 204?"\n• "Create a maintenance ticket for the projector in Room 204"`,
    };
  }
}
