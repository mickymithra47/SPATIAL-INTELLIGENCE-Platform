import { Injectable } from '@nestjs/common';
import { ToolExecutorService } from './tool-executor.service.js';
import { AIResponse } from '@spatial/types';

interface SessionContext {
  lastMentionedEntity?: {
    id: string;
    code: string;
    name: string;
    floor: string;
    distanceMeters: number;
    description?: string;
  };
  lastQuery?: string;
}

@Injectable()
export class AgentService {
  private sessions = new Map<string, SessionContext>();

  constructor(private toolExecutor: ToolExecutorService) {}

  public async processMessage(
    userMessage: string,
    conversationId: string = 'conv-default',
    userRole: string = 'STUDENT'
  ): Promise<AIResponse> {
    const text = userMessage.trim();
    const lower = text.toLowerCase();
    const clean = lower.replace(/[?!.,;:'"()]/g, '').trim();

    // Get or initialize session context for follow-up questions
    let context = this.sessions.get(conversationId);
    if (!context) {
      context = {};
      this.sessions.set(conversationId, context);
    }

    // ---------------------------------------------------------
    // 1. GREETINGS (Section 3)
    // ---------------------------------------------------------
    if (
      clean === 'hi' ||
      clean === 'hey' ||
      clean === 'hello' ||
      clean === 'heyy' ||
      clean === 'hiya' ||
      clean === 'howdy' ||
      clean === 'greetings' ||
      clean.startsWith('hi ') ||
      clean.startsWith('hey ') ||
      clean.startsWith('hello ')
    ) {
      let greeting = "Hi! 👋 I'm your Campus AI Assistant. How can I help you today?";
      if (clean.includes('hello')) {
        greeting = "Hello! 👋 What would you like to find on campus?";
      } else if (clean.includes('hey')) {
        greeting = "Hey! How can I help you around campus?";
      }
      return { conversationId, reply: greeting };
    }

    if (clean.startsWith('good morning')) {
      return { conversationId, reply: "Good morning! ☀️ How can I assist you on campus today?" };
    }
    if (clean.startsWith('good afternoon')) {
      return { conversationId, reply: "Good afternoon! 👋 How can I help you around campus today?" };
    }
    if (clean.startsWith('good evening')) {
      return { conversationId, reply: "Good evening! 🌙 How can I assist you with the campus tonight?" };
    }

    // ---------------------------------------------------------
    // 2. CAPABILITY QUESTIONS (Section 4)
    // ---------------------------------------------------------
    if (
      clean.includes('what can you do') ||
      clean.includes('how can you help me') ||
      clean.includes('what are your features') ||
      clean.includes('what do you do') ||
      clean.includes('what can i ask') ||
      clean === 'help' ||
      clean === 'help me'
    ) {
      return {
        conversationId,
        reply: "I can help you explore the campus, find rooms and labs, locate facilities, check available spaces, and guide you to destinations. You can simply ask me something like 'Where is Lab 1?' or 'How do I get to the Seminar Hall?'",
      };
    }

    // ---------------------------------------------------------
    // 3. NORMAL CONVERSATION (Section 5)
    // ---------------------------------------------------------
    if (
      clean.includes('how are you') ||
      clean.includes('how r u') ||
      clean.includes("how're you") ||
      clean.includes('how are u')
    ) {
      return {
        conversationId,
        reply: "I'm doing great! 😊 I'm ready to help you find your way around campus.",
      };
    }

    if (clean.includes('who are you') || clean.includes('what are you')) {
      return {
        conversationId,
        reply: "I'm your Campus AI Assistant. I can help you find places, navigate the campus, and answer questions about available spaces.",
      };
    }

    if (clean.includes('thank you') || clean.includes('thanks') || clean.includes('thx') || clean === 'ty') {
      return {
        conversationId,
        reply: "You're very welcome! 😊 Let me know if you need anything else.",
      };
    }

    if (clean.includes('bye') || clean.includes('goodbye') || clean.includes('see you') || clean.includes('cya') || clean.includes('have a good day')) {
      return {
        conversationId,
        reply: "Goodbye! 👋 Have a great day!",
      };
    }

    // ---------------------------------------------------------
    // 4. UNRELATED QUESTIONS (Section 12)
    // ---------------------------------------------------------
    if (
      clean.includes('weather') ||
      clean.includes('temperature tomorrow') ||
      clean.includes('rain tomorrow') ||
      clean.includes('joke') ||
      clean.includes('who is the president') ||
      clean.includes('stock market') ||
      clean.includes('bitcoin')
    ) {
      return {
        conversationId,
        reply: "I don't currently have weather information available. I can help you with campus locations, navigation, rooms, facilities, and available spaces.",
      };
    }

    // ---------------------------------------------------------
    // 5. FOLLOW-UP QUESTIONS & CONTEXT AWARENESS (Section 10)
    // ---------------------------------------------------------
    // Follow-up: "how far is it?", "what is the distance?", "how far is that?"
    if (clean.includes('how far') || clean === 'distance' || clean.includes('how far is it') || clean.includes('how far is that')) {
      if (context.lastMentionedEntity) {
        return {
          conversationId,
          reply: `${context.lastMentionedEntity.name} is about ${context.lastMentionedEntity.distanceMeters} m from the Central Hub.`,
          highlightedEntity: {
            type: 'ROOM',
            id: context.lastMentionedEntity.id,
          },
        };
      }
      return {
        conversationId,
        reply: "Which location or room would you like to check the distance for?",
      };
    }

    // Follow-up: "how do I get there?", "take me there", "navigate there"
    if (
      clean === 'how do i get there' ||
      clean.includes('how do i get there') ||
      clean === 'take me there' ||
      clean.includes('take me there') ||
      clean === 'navigate there' ||
      clean.includes('navigate there') ||
      clean === 'show me the way'
    ) {
      if (context.lastMentionedEntity) {
        return {
          conversationId,
          reply: `I can guide you there. I've highlighted the route from the Central Hub on the map.`,
          highlightedEntity: {
            type: 'ROUTE',
            id: context.lastMentionedEntity.id,
          },
          executedActions: [
            {
              actionType: 'CALCULATE_INDOOR_ROUTE',
              summary: `Navigating to ${context.lastMentionedEntity.name}`,
              payload: { destinationId: context.lastMentionedEntity.id },
            },
          ],
        };
      }
      // Section 11: If no previous destination: "Of course. Where would you like to go?"
      return {
        conversationId,
        reply: "Of course. Where would you like to go?",
      };
    }

    // ---------------------------------------------------------
    // 6. AMBIGUOUS QUESTIONS (Section 11)
    // ---------------------------------------------------------
    // "Where is the lab?" (Ambiguous, without specifying which lab)
    if (clean === 'where is the lab' || clean === 'find the lab' || clean === 'where is lab' || clean === 'locate the lab') {
      return {
        conversationId,
        reply: "Sure! Which lab are you looking for? We have Lab 1 (Robotics), Computing Systems Lab 102, and AI & Robotics Lab 204.",
      };
    }

    // ---------------------------------------------------------
    // 7. SPECIFIC CAMPUS QUESTIONS & NATURAL VARIATIONS (Section 6, 7, 8, 9, 13)
    // ---------------------------------------------------------
    // Lab 1 (and variations: "Where is Lab 1?", "Can you find Lab 1?", "Help me locate Lab 1", "Show me Lab 1", "Take me to Lab 1")
    if (clean.includes('lab 1') || clean.includes('lab1') || clean.includes('cr-02')) {
      context.lastMentionedEntity = {
        id: 'GF-LAB-01',
        code: 'CR-02',
        name: 'Lab 1',
        floor: 'GROUND',
        distanceMeters: 18,
      };

      if (clean.includes('navigate') || clean.includes('take me') || clean.includes('how do i get')) {
        return {
          conversationId,
          reply: "Sure! Lab 1 is on the Ground Floor, about 18 m from the Central Hub. I've highlighted the route on the map for you.",
          highlightedEntity: {
            type: 'ROUTE',
            id: 'GF-LAB-01',
          },
        };
      }

      return {
        conversationId,
        reply: "Lab 1 (CR-02) is on the Ground Floor, near the Central Hub corridor. It has 40 workstations. Would you like me to show you the route?",
        highlightedEntity: {
          type: 'ROOM',
          id: 'GF-LAB-01',
        },
        executedActions: [
          {
            actionType: 'FIND_ROOM',
            summary: 'Located Lab 1 on Ground Floor',
            payload: { roomId: 'GF-LAB-01', name: 'Lab 1', code: 'CR-02', floor: 'GROUND' },
          },
        ],
      };
    }

    // Restroom search (and variations: "Where is the nearest restroom?", "Find a restroom", "Is there a restroom nearby?", "washroom", "toilet")
    if (clean.includes('restroom') || clean.includes('washroom') || clean.includes('toilet')) {
      context.lastMentionedEntity = {
        id: 'GF-GEN-01',
        code: 'RESTROOM',
        name: 'the Restrooms',
        floor: 'GROUND',
        distanceMeters: 22,
      };

      return {
        conversationId,
        reply: "I found two restrooms nearby. The closest options are the Gents Restroom and Ladies Restroom along the southern corridor on the Ground Floor. I've highlighted them on the map.",
        highlightedEntity: {
          type: 'ROOM',
          id: 'GF-GEN-01',
        },
        executedActions: [
          {
            actionType: 'FIND_ROOM',
            summary: 'Located Restrooms on Ground Floor',
            payload: { roomId: 'GF-GEN-01', floor: 'GROUND' },
          },
        ],
      };
    }

    // Seminar Hall (and variations: "Take me to the Seminar Hall", "How do I get to the Seminar Hall?", "Navigate me to Seminar Hall")
    if (clean.includes('seminar hall') || (clean.includes('seminar') && (clean.includes('hall') || clean.includes('stage')))) {
      context.lastMentionedEntity = {
        id: 'GF-SEM-01',
        code: 'SEM-01',
        name: 'the Seminar Hall',
        floor: 'GROUND',
        distanceMeters: 18,
      };

      return {
        conversationId,
        reply: "Sure! The Seminar Hall is about an 18 m walk from the Central Hub via the South Corridor. I've highlighted the route on the map for you.",
        highlightedEntity: {
          type: 'ROUTE',
          id: 'GF-SEM-01',
        },
        executedActions: [
          {
            actionType: 'CALCULATE_INDOOR_ROUTE',
            summary: 'Route to Seminar Hall',
            payload: { roomId: 'GF-SEM-01', floor: 'GROUND', distanceMeters: 18 },
          },
        ],
      };
    }

    // Lift / Elevator ("Where is the lift?", "Find a lift", "Is there a lift nearby?", "Where can I find an elevator?")
    if (clean.includes('lift') || clean.includes('elevator')) {
      context.lastMentionedEntity = {
        id: '1F-LIFT-01',
        code: 'LIFT-01',
        name: 'the Central Lift',
        floor: 'GROUND',
        distanceMeters: 12,
      };

      return {
        conversationId,
        reply: "The Central Lift is located right next to the Central Hub and Vertical Core on the Ground Floor, with elevator access to all floors. I've highlighted it on the map for you.",
        highlightedEntity: {
          type: 'ROOM',
          id: '1F-LIFT-01',
        },
      };
    }

    // Available Rooms / Spaces ("What rooms are available?", "Show available rooms", "Is there an available classroom?", "Find an empty room")
    if (clean.includes('available') || clean.includes('empty') || clean.includes('vacant')) {
      context.lastMentionedEntity = {
        id: 'GF-EMP-01',
        code: 'CR-10',
        name: 'Empty Space (CR-10)',
        floor: 'GROUND',
        distanceMeters: 25,
      };

      return {
        conversationId,
        reply: "I found a few available spaces on the Terrace Floor. Would you like me to show them on the map?",
        highlightedEntity: {
          type: 'ROOM',
          id: 'GF-EMP-01',
        },
      };
    }

    // How do I reach the first floor? / stairs
    if (clean.includes('first floor') || clean.includes('1st floor')) {
      context.lastMentionedEntity = {
        id: '1F-LIFT-01',
        code: '1F-LIFT-01',
        name: 'First Floor',
        floor: 'FIRST',
        distanceMeters: 15,
      };

      return {
        conversationId,
        reply: "You can use the nearest stairs or lift. Take either the West Stairs or Central Lift from the Ground Floor up to the First Floor. I've switched your view to the First Floor!",
        highlightedEntity: {
          type: 'ROOM',
          id: '1F-LIFT-01',
        },
      };
    }

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

    // =========================================================
    // SPATIAL INTELLIGENCE & ESRI / SIMULATION INTENTS (Sections 14, 18, 19)
    // =========================================================

    // Intent 6: Simulation / What-If Analysis
    // e.g. "Simulate an emergency evacuation from Building B" or "What happens if the main entrance is closed?"
    if (lower.includes('simulate') || lower.includes('evacuation') || lower.includes('what happens if') || lower.includes('closed') || lower.includes('blocked')) {
      const isEvacuation = lower.includes('evacuation') || lower.includes('emergency');
      const isClosure = lower.includes('closed') || lower.includes('blocked') || lower.includes('what happens');

      const simType = isEvacuation ? 'EMERGENCY_EVACUATION' : 'WHAT_IF_CLOSURE';
      const blockedIds = lower.includes('entrance') ? ['ent-main-gate'] : lower.includes('exit') ? ['exit-east'] : ['r-101'];

      const simResult = await this.toolExecutor.executeTool(
        'simulateSpatialScenario',
        {
          type: simType,
          environmentId: 'b-cse-001',
          blockedEntityIds: blockedIds,
          occupancyLoad: 420,
        },
        userRole
      );

      const r = simResult.result;
      return {
        conversationId,
        reply: `[Spatial Simulation Result] ${r.summary}\n\nKey Recommendations:\n${r.recommendations.map((rec: string) => `• ${rec}`).join('\n')}`,
        highlightedEntity: {
          type: 'SIMULATION',
          id: r.scenarioId,
        },
        executedActions: [
          {
            actionType: 'SIMULATE_SPATIAL_SCENARIO',
            summary: r.summary,
            payload: r,
          },
        ],
      };
    }

    // Intent 7: Geospatial Buffer / Proximity Query
    // e.g. "What buildings are within 500 meters of the main entrance?" or "Find facilities near main gate"
    if (lower.includes('within') || lower.includes('meters') || lower.includes('near') || lower.includes('nearby')) {
      const radiusMatch = lower.match(/(\d+)\s*(?:m|meters)/);
      const radiusMeters = radiusMatch ? parseInt(radiusMatch[1], 10) : 500;
      const entityMatch = lower.includes('entrance') || lower.includes('gate') ? 'ent-main-gate' : 'b-cse-001';

      const bufferResult = await this.toolExecutor.executeTool(
        'findNearbyEntities',
        {
          entityQuery: entityMatch,
          radiusMeters,
        },
        userRole
      );

      if (bufferResult.success && bufferResult.entities.length > 0) {
        const entityList = bufferResult.entities
          .slice(0, 5)
          .map((e: any) => `• ${e.name} (${e.type}) — ${e.distanceMeters}m away`)
          .join('\n');

        return {
          conversationId,
          reply: `Here are the spatial entities located within ${radiusMeters}m of ${entityMatch}:\n${entityList}`,
          highlightedEntity: {
            type: 'GEOSPATIAL_BUFFER',
            id: entityMatch,
          },
          executedActions: [
            {
              actionType: 'QUERY_SPATIAL_BUFFER',
              summary: `Found ${bufferResult.count} entities within ${radiusMeters}m`,
              payload: bufferResult,
            },
          ],
        };
      }
    }

    // Default friendly conversational guidance
    return {
      conversationId,
      reply: "I'm here to help you around campus! You can ask me to find rooms and labs (e.g. \"Where is Lab 1?\" or \"Where is Room 204?\"), navigate between spaces, locate restrooms, or check available rooms. What would you like to explore?",
    };

  }
}
