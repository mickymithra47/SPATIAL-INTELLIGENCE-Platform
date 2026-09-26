import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import {
  ALL_CAMPUS_ENTITIES,
  findRoomByIdOrName,
  calculateMultiFloorRoute,
  getEntitiesForFloor,
  getFloorCapacity,
  FloorLevel,
} from '../../../../services/campusMultiFloorData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ServerAIConfig {
  provider: 'gemini' | 'openai' | 'none';
  apiKey: string;
  model: string;
  baseURL?: string;
}

function getServerAIConfig(): ServerAIConfig {
  let geminiKey = process.env.GEMINI_API_KEY || '';
  let openaiKey = process.env.OPENAI_API_KEY || '';
  let providerEnv = (process.env.LLM_PROVIDER || '').toLowerCase();
  let geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  let openaiModel = process.env.OPENAI_MODEL || 'gpt-5.6-luna';

  // Read .env server-side if not populated
  const candidatePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), 'apps/web/.env'),
    path.resolve(process.cwd(), 'apps/web/.env.local'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(process.cwd(), '../../.env.local'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('GEMINI_API_KEY=')) {
            const val = trimmed.replace('GEMINI_API_KEY=', '').replace(/['"]/g, '').trim();
            if (val) geminiKey = val;
          }
          if (trimmed.startsWith('OPENAI_API_KEY=')) {
            const val = trimmed.replace('OPENAI_API_KEY=', '').replace(/['"]/g, '').trim();
            if (val) openaiKey = val;
          }
          if (trimmed.startsWith('LLM_PROVIDER=')) {
            const val = trimmed.replace('LLM_PROVIDER=', '').replace(/['"]/g, '').trim();
            if (val) providerEnv = val.toLowerCase();
          }
          if (trimmed.startsWith('GEMINI_MODEL=')) {
            const val = trimmed.replace('GEMINI_MODEL=', '').replace(/['"]/g, '').trim();
            if (val) geminiModel = val;
          }
          if (trimmed.startsWith('OPENAI_MODEL=')) {
            const val = trimmed.replace('OPENAI_MODEL=', '').replace(/['"]/g, '').trim();
            if (val) openaiModel = val;
          }
        }
      } catch {
        // ignore read error
      }
    }
  }

  if (geminiKey && (!providerEnv || providerEnv === 'gemini' || !openaiKey)) {
    return {
      provider: 'gemini',
      apiKey: geminiKey,
      model: geminiModel,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    };
  }

  if (openaiKey) {
    return {
      provider: 'openai',
      apiKey: openaiKey,
      model: openaiModel,
    };
  }

  return {
    provider: 'none',
    apiKey: '',
    model: geminiModel || openaiModel || 'local-spatial-engine',
  };
}

const SYSTEM_PROMPT = `You are the Campus Spatial AI Copilot for the Campus Spatial Intelligence Platform.
Your purpose is to help students, faculty, and visitors understand and interact with the campus naturally.

==================================================
CORE PRINCIPLE: UNDERSTAND INTENT FIRST
==================================================
NEVER automatically dump all available database fields (capacity, coordinates, equipment, room IDs) unless explicitly asked.

1. LOCATION QUESTIONS (e.g. "Where is classroom 101?", "Where is the seminar hall?"):
   - State the floor and location simply.
   - Example: "Classroom 101 is on the First Floor."
   - Example: "The Seminar Hall is on the Ground Floor, just south of the Central Hexagon."
   - DO NOT append capacity, equipment, or area unless requested.

2. CAPACITY QUESTIONS (e.g. "How many students can classroom 101 accommodate?", "What is the capacity of seminar hall?"):
   - Retrieve capacity through the appropriate capacity tool.
   - Example: "Classroom 101 can accommodate up to 75 students."
   - Example: "The Seminar Hall can accommodate up to 120 students."
   - DO NOT represent capacity as live occupancy. Every classroom's seating capacity equals maximum student capacity.

3. COMBINED QUESTIONS (e.g. "Where is classroom 101 and how many students can it hold?"):
   - Answer both concisely in one sentence.
   - Example: "Classroom 101 is on the First Floor and can accommodate up to 75 students."

4. FLOOR AGGREGATE CAPACITY (e.g. "Total capacity on the first floor?", "Highest capacity room on 2F?"):
   - Use the get_floor_capacity tool to answer accurately.

5. NAVIGATION (e.g. "How do I get to seminar hall?"):
   - Provide clear, concise step-by-step directions using the calculate_route tool.`;

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_room_capacity',
      description: 'Retrieve official seating and student capacity of a classroom or seminar hall through the campus database API.',
      parameters: {
        type: 'object',
        properties: {
          roomId: { type: 'string', description: 'Room number or name (e.g. "101", "Classroom 101", "CR-07", "Seminar Hall")' },
        },
        required: ['roomId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_floor_capacity',
      description: 'Retrieve aggregated classroom seating capacity for a floor (Ground, First, Second, Terrace) from the backend API.',
      parameters: {
        type: 'object',
        properties: {
          floor: { type: 'string', description: 'Floor name or identifier (e.g. "First Floor", "1F", "Ground Floor", "2F", "Terrace")' },
        },
        required: ['floor'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_spatial_entities',
      description: 'Search campus rooms, laboratories, facilities, and amenities by keyword or type.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Name, code, or keyword to search (e.g. "Lab 1", "Restroom", "AI Lab")' },
          floorId: { type: 'string', description: 'Optional floor filter ("GROUND", "FIRST", "SECOND", "TERRACE")' },
          entityType: { type: 'string', description: 'Optional category (LAB, CLASSROOM, RESTROOM, OFFICE, AMENITY)' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_entity_details',
      description: 'Retrieve authoritative details about a specific room or laboratory.',
      parameters: {
        type: 'object',
        properties: {
          entityId: { type: 'string', description: 'Room ID or room name (e.g. "GF-LAB-01", "Lab 1", "204")' },
        },
        required: ['entityId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_nearest',
      description: 'Find the nearest facility (e.g. RESTROOM, ELEVATOR, STAIR, LAB) relative to current location.',
      parameters: {
        type: 'object',
        properties: {
          entityType: { type: 'string', description: 'Entity category to locate (RESTROOM, ELEVATOR, STAIR, LAB)' },
          fromEntityId: { type: 'string', description: 'Starting room or entity ID' },
        },
        required: ['entityType'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_route',
      description: 'Calculate an indoor route using the spatial graph and A* pathfinding. Returns distance, time, and step-by-step directions.',
      parameters: {
        type: 'object',
        properties: {
          startEntityId: { type: 'string', description: 'Origin room ID or room name' },
          destinationEntityId: { type: 'string', description: 'Destination room ID or room name' },
          accessibility: { type: 'boolean', description: 'Whether to require wheelchair-accessible elevator route' },
        },
        required: ['destinationEntityId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_floor_entities',
      description: 'List all rooms, labs, and facilities located on a specific floor.',
      parameters: {
        type: 'object',
        properties: {
          floorId: { type: 'string', description: 'Floor level ("GROUND", "FIRST", "SECOND", "TERRACE")' },
        },
        required: ['floorId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to_entity',
      description: 'Trigger a Digital Twin UI action to focus on a room or initiate turn-by-turn navigation.',
      parameters: {
        type: 'object',
        properties: {
          entityId: { type: 'string', description: 'Target room or facility ID/name' },
          actionType: { type: 'string', enum: ['FOCUS', 'NAVIGATE', 'SWITCH_FLOOR'] },
        },
        required: ['entityId'],
      },
    },
  },
];

async function executeServerTool(name: string, args: any, context: any, actions: any[]): Promise<any> {
  switch (name) {
    case 'get_room_capacity': {
      const q = String(args.roomId || '').trim();
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(`${apiUrl}/spatial/rooms/${encodeURIComponent(q)}/capacity`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          return { success: true, ...data };
        }
      } catch {}

      // Local fallback
      const room = findRoomByIdOrName(q);
      if (room) {
        return {
          success: true,
          room: room.name,
          roomId: room.code || room.id,
          floor: room.floor === 'GROUND' ? 'Ground Floor' : `${room.floor} Floor`,
          capacity: room.capacity,
          seatingCapacity: room.capacity,
          studentCapacity: room.capacity,
        };
      }
      return { success: false, error: `Room '${q}' not found` };
    }

    case 'get_floor_capacity': {
      const q = String(args.floor || '').trim();
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(`${apiUrl}/spatial/floors/${encodeURIComponent(q)}/capacity`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          return { success: true, ...data };
        }
      } catch {}

      return getFloorCapacity(q);
    }

    case 'search_spatial_entities': {
      const q = (args.query || '').toLowerCase().trim();
      const matches = ALL_CAMPUS_ENTITIES.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          (e.code && e.code.toLowerCase().includes(q)) ||
          (e.refLabel && e.refLabel.toLowerCase().includes(q))
      );
      if (matches.length > 0 && !actions.some((a) => a.action === 'FOCUS_ENTITY')) {
        actions.push({
          action: 'FOCUS_ENTITY',
          entityId: matches[0].id,
          roomName: matches[0].name,
          floor: matches[0].floor,
        });
      }
      return {
        count: matches.length,
        results: matches.slice(0, 6).map((m) => ({
          id: m.id,
          name: m.name,
          code: m.code,
          refLabel: m.refLabel,
          type: m.type,
          floor: m.floor,
          description: m.description,
          capacity: m.capacity,
        })),
      };
    }

    case 'get_entity_details': {
      const entity = findRoomByIdOrName(args.entityId);
      if (!entity) return { found: false, message: `Entity '${args.entityId}' not found.` };
      return {
        found: true,
        entity: {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          floor: entity.floor,
          areaM2: entity.areaM2,
          capacity: entity.capacity,
          description: entity.description,
          isAccessible: entity.type !== 'STAIRS',
        },
      };
    }

    case 'find_nearest': {
      const targetType = (args.entityType || '').toUpperCase();
      const match =
        ALL_CAMPUS_ENTITIES.find(
          (e) => e.type.toUpperCase() === targetType || (targetType === 'RESTROOM' && e.type === 'RESTROOM')
        ) || ALL_CAMPUS_ENTITIES.find((e) => e.type === 'RESTROOM');

      if (match) {
        actions.push({ action: 'FOCUS_ENTITY', entityId: match.id, roomName: match.name, floor: match.floor });
        return {
          found: true,
          entity: { id: match.id, name: match.name, floor: match.floor, type: match.type },
        };
      }
      return { found: false, message: `No ${targetType} found nearby.` };
    }

    case 'calculate_route': {
      let start = findRoomByIdOrName(args.startEntityId);
      if (!start) {
        start = findRoomByIdOrName(context?.selectedEntityId) || ALL_CAMPUS_ENTITIES[0];
      }
      const end = findRoomByIdOrName(args.destinationEntityId);
      if (!end) {
        return { success: false, message: `Destination '${args.destinationEntityId}' not found.` };
      }

      const route = calculateMultiFloorRoute(start.id, end.id, args.accessibility);
      actions.push({
        action: 'NAVIGATE',
        entityId: end.id,
        roomName: end.name,
        floor: end.floor,
        route,
      });

      return {
        success: true,
        origin: start.name,
        destination: end.name,
        distanceMeters: route.distanceMeters,
        estimatedMinutes: (route.estimatedSeconds / 60).toFixed(1),
        steps: route.steps,
        floorsTraversed: route.floorTransitions,
      };
    }

    case 'get_floor_entities': {
      let fl: FloorLevel = 'GROUND';
      const f = String(args.floorId || '').toUpperCase();
      if (f.includes('1') || f.includes('FIRST')) fl = 'FIRST';
      else if (f.includes('2') || f.includes('SECOND')) fl = 'SECOND';
      else if (f.includes('3') || f.includes('TERRACE')) fl = 'TERRACE';

      const entities = getEntitiesForFloor(fl);
      return {
        floor: fl,
        count: entities.length,
        entities: entities.map((e) => ({ id: e.id, name: e.name, type: e.type, capacity: e.capacity })),
      };
    }

    case 'navigate_to_entity': {
      const target = findRoomByIdOrName(args.entityId);
      if (target) {
        actions.push({
          action: args.actionType === 'FOCUS' ? 'FOCUS_ENTITY' : 'NAVIGATE',
          entityId: target.id,
          roomName: target.name,
          floor: target.floor,
        });
        return {
          success: true,
          action: args.actionType || 'NAVIGATE',
          entityName: target.name,
          floor: target.floor,
        };
      }
      return { success: false, message: `Room '${args.entityId}' not found.` };
    }

    default:
      return { error: `Tool ${name} not recognized.` };
  }
}

function extractRoomQuery(text: string): string | null {
  const q = text.toLowerCase();
  if (q.includes('seminar hall') || q.includes('seminar') || q.includes('cr-07') || q.includes('cr07')) {
    return 'GF-SEM-01';
  }
  const match = q.match(/(?:classroom|room|hall|lab|cr)\s*([0-9a-z-]+)/i) || q.match(/\b([1-3]0[1-5])\b/i);
  if (match) return match[1];
  return null;
}

// =========================================================
// INTENT-AWARE LOCAL SPATIAL ENGINE (OFFLINE/FALLBACK)
// =========================================================
function generateIntentAwareFallback(message: string, context: any, history: any[]): { reply: string; actions: any[] } {
  const q = (message || '').toLowerCase().trim();
  const actions: any[] = [];

  // 1. Conversational greetings
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening))\b/i.test(q)) {
    return {
      reply: 'Hello! I am your Campus Spatial AI Copilot. How can I help you find classrooms, check room capacities, or navigate around the campus today?',
      actions: [],
    };
  }

  // Helper to extract room query or resolve pronouns
  let targetQuery: string | null = extractRoomQuery(q);
  if (!targetQuery && /\b(it|this room|that room|here)\b/i.test(q) && Array.isArray(history) && history.length > 0) {
    // Pronoun resolution from conversation history
    for (let i = history.length - 1; i >= 0; i--) {
      const prev = String(history[i]?.content || '');
      const prevFound = extractRoomQuery(prev);
      if (prevFound) {
        targetQuery = prevFound;
        break;
      }
    }
  }

  const room = targetQuery ? findRoomByIdOrName(targetQuery) : null;
  const isAskingCapacity = /capacity|how many (students|seats)|accommodate|hold|seat count|how many.*can/i.test(q);
  const isAskingLocation = /where is|locate|find|position/i.test(q);
  const isAskingRoute = /how (do I|to) get to|navigate to|route to|directions? to/i.test(q);
  const isAskingFloorAggregate = /floor/i.test(q) && (isAskingCapacity || /total|highest|lowest/i.test(q));

  // 2. Floor aggregate capacity
  if (isAskingFloorAggregate) {
    let fl: FloorLevel = 'GROUND';
    if (q.includes('first') || q.includes('1st') || q.includes('1f')) fl = 'FIRST';
    else if (q.includes('second') || q.includes('2nd') || q.includes('2f')) fl = 'SECOND';
    else if (q.includes('terrace') || q.includes('3rd') || q.includes('3f')) fl = 'TERRACE';

    const capData = getFloorCapacity(fl);
    if (/highest/i.test(q) && capData.highestCapacity) {
      return {
        reply: `On the ${capData.floorName}, ${capData.highestCapacity.name} has the highest capacity with ${capData.highestCapacity.capacity} seats.`,
        actions: [],
      };
    }
    if (/lowest/i.test(q) && capData.lowestCapacity) {
      return {
        reply: `On the ${capData.floorName}, ${capData.lowestCapacity.name} has the lowest capacity with ${capData.lowestCapacity.capacity} seats.`,
        actions: [],
      };
    }
    return {
      reply: `The total seating capacity on the ${capData.floorName} is ${capData.totalCapacity} students across ${capData.totalClassrooms} classrooms.`,
      actions: [],
    };
  }

  // 3. Navigation
  if (isAskingRoute && room) {
    const start = findRoomByIdOrName(context?.selectedEntityId) || ALL_CAMPUS_ENTITIES[0];
    const route = calculateMultiFloorRoute(start.id, room.id);
    actions.push({ action: 'NAVIGATE', entityId: room.id, roomName: room.name, floor: room.floor, route });
    const firstStep = route.steps[0]?.instruction || `Head towards ${room.name}`;
    return {
      reply: `To get to ${room.name}, follow the route on the map (${route.distanceMeters}m, ~${route.estimatedSeconds}s). Step 1: ${firstStep}.`,
      actions,
    };
  }

  // 4. Combined: Location AND Capacity
  if (isAskingLocation && isAskingCapacity && room) {
    actions.push({ action: 'FOCUS_ENTITY', entityId: room.id, roomName: room.name, floor: room.floor });
    const floorLabel = room.floor === 'GROUND' ? 'Ground Floor' : `${room.floor.charAt(0) + room.floor.slice(1).toLowerCase()} Floor`;
    return {
      reply: `${room.name} is on the ${floorLabel} and can accommodate up to ${room.capacity} students.`,
      actions,
    };
  }

  // 5. Only Capacity
  if (isAskingCapacity && room) {
    return {
      reply: `${room.name} can accommodate up to ${room.capacity} students.`,
      actions,
    };
  }

  // 6. Only Location
  if (isAskingLocation && room) {
    actions.push({ action: 'FOCUS_ENTITY', entityId: room.id, roomName: room.name, floor: room.floor });
    if (room.id === 'GF-SEM-01') {
      return {
        reply: 'The Seminar Hall is on the Ground Floor, just south of the Central Hexagon.',
        actions,
      };
    }
    const floorLabel = room.floor === 'GROUND' ? 'Ground Floor' : `${room.floor.charAt(0) + room.floor.slice(1).toLowerCase()} Floor`;
    return {
      reply: `${room.name} is on the ${floorLabel}.`,
      actions,
    };
  }

  // 7. General Room lookup
  if (room) {
    actions.push({ action: 'FOCUS_ENTITY', entityId: room.id, roomName: room.name, floor: room.floor });
    if (room.id === 'GF-SEM-01') {
      return {
        reply: 'The Seminar Hall is on the Ground Floor, just south of the Central Hexagon.',
        actions,
      };
    }
    const floorLabel = room.floor === 'GROUND' ? 'Ground Floor' : `${room.floor.charAt(0) + room.floor.slice(1).toLowerCase()} Floor`;
    return {
      reply: `${room.name} is located on the ${floorLabel}.`,
      actions,
    };
  }

  return {
    reply: "I am your Campus Spatial AI Copilot. You can ask me where any room is (e.g. 'Where is classroom 101?'), check capacity ('How many students can classroom 101 accommodate?'), or request directions ('How do I get to seminar hall?').",
    actions: [],
  };
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const { message = '', conversationId, context, history = [] } = body;

  try {
    const aiConfig = getServerAIConfig();

    // If no provider or key, use the local spatial engine directly
    if (aiConfig.provider === 'none' || !aiConfig.apiKey) {
      const fallback = generateIntentAwareFallback(message, context, history);
      return NextResponse.json({
        reply: fallback.reply,
        conversationId: conversationId || `conv-${Date.now()}`,
        model: 'local-spatial-engine',
        actions: fallback.actions,
        toolCallsMade: [],
        isConfigured: true,
      });
    }

    const openai = new OpenAI({
      apiKey: aiConfig.apiKey,
      baseURL: aiConfig.baseURL,
    });

    // Prepare message history
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h.role === 'user' || h.role === 'assistant') {
          messages.push({ role: h.role, content: h.content });
        }
      }
    }

    let promptText = message;
    if (context) {
      promptText = `[User Context: Institution="${context.institutionName || 'ESEC Campus'}", ActiveFloor="${context.floorId || 'GROUND'}", CurrentRoom="${context.selectedEntityId || 'Ground Floor Reception'}", View="${context.activeView || '2D'}"]\n${message}`;
    }
    messages.push({ role: 'user', content: promptText });

    const toolCallsMade: string[] = [];
    const triggeredActions: any[] = [];
    let finalReply = '';

    // LLM tool calling loop
    let currentMsgs = [...messages];
    for (let turn = 0; turn < 4; turn++) {
      const completion = await openai.chat.completions.create({
        model: aiConfig.model,
        messages: currentMsgs,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.1,
      });

      const choice = completion.choices[0];
      const resMsg = choice.message;

      if (resMsg.tool_calls && resMsg.tool_calls.length > 0) {
        currentMsgs.push(resMsg);
        for (const tc of resMsg.tool_calls) {
          toolCallsMade.push(tc.function.name);
          let parsedArgs = {};
          try {
            parsedArgs = JSON.parse(tc.function.arguments);
          } catch {}

          const result = await executeServerTool(tc.function.name, parsedArgs, context, triggeredActions);
          currentMsgs.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          });
        }
      } else {
        finalReply = resMsg.content || 'I have analyzed your spatial request.';
        break;
      }
    }

    return NextResponse.json({
      reply: finalReply,
      conversationId: conversationId || `conv-${Date.now()}`,
      model: aiConfig.model,
      actions: triggeredActions,
      toolCallsMade,
      isConfigured: true,
    });
  } catch (err: any) {
    // Graceful fallback to local spatial engine
    const fallback = generateIntentAwareFallback(message, context, history);
    return NextResponse.json({
      reply: fallback.reply,
      conversationId: conversationId || `conv-${Date.now()}`,
      model: 'local-spatial-engine-fallback',
      actions: fallback.actions,
      toolCallsMade: [],
      isConfigured: true,
    });
  }
}
