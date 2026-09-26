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
import {
  runCopilotPipeline,
  classifyIntent,
  extractTargetEntity,
  filterRoomData,
} from '../../../../services/campusCopilotEngine';

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
    model: geminiModel || openaiModel || 'campus-copilot-engine',
  };
}

const SYSTEM_PROMPT = `You are the Campus AI Copilot for the Campus Spatial Intelligence Platform.
Your role is to behave as a reliable, natural campus assistant ("ChatGPT for my campus").

============================================================
CORE PRINCIPLE: STRICT RELEVANCE & NO DATABASE DUMPS
============================================================
The database contains internal knowledge: room names, room IDs, floor, coordinates, capacity, area, equipment, accessibility, description.
You must answer the USER'S ACTUAL QUESTION with ONLY the information required.
Never expose internal database fields, technical IDs, or unrequested attributes.

RESPONSE CONTRACT:
1. Answer the question first.
2. Keep the answer concise (1–3 sentences for simple questions).
3. Do not add unrelated information (Do NOT say "Additionally...", "Also...", "Furthermore...", "Other details include...").
4. Never expose technical GIS terminology (spatial entity, node ID, coordinates, graph edge, GIS polygon, database record).
5. Never invent capacity, locations, routes, or facilities.
6. Maintain conversational context and resolve pronouns naturally.

EXACT BEHAVIOR PER INTENT:
1. LOCATION (e.g. "Where is classroom 101?", "Where is the seminar hall?"):
   - Required: Name, floor, landmark/relative direction.
   - STRICTLY FORBIDDEN: Capacity, area, equipment, coordinates, accessibility, internal IDs.
   - Example: "Classroom 101 is on the First Floor. I've highlighted it on the map."
   - Example: "The Seminar Hall is on the Ground Floor, just south of the Central Hexagon. I've highlighted it on the map."

2. CAPACITY (e.g. "How many students can classroom 101 accommodate?", "How many people can the seminar hall accommodate?"):
   - Required: Name, seating/student capacity.
   - STRICTLY FORBIDDEN: Floor, area, equipment, coordinates, routes.
   - Example: "Classroom 101 can accommodate up to 75 students."
   - Example: "The Seminar Hall can accommodate up to 120 people."

3. COMBINED LOCATION + CAPACITY (e.g. "Where is classroom 101 and how many students can it hold?"):
   - Answer only the two requested pieces in one concise sentence.
   - Example: "Classroom 101 is on the First Floor and can accommodate up to 75 students."

4. EQUIPMENT (e.g. "What equipment does the seminar hall have?"):
   - Required: Requested equipment only.
   - Example: "The Seminar Hall has a 4K laser projector, Dolby audio system and a stage podium."

5. ROOM OVERVIEW (e.g. "Tell me about the seminar hall."):
   - Provide a concise overview: location, capacity, primary use.
   - Example: "The Seminar Hall (CR-07) is on the Ground Floor, south of the Central Hexagon. It can accommodate up to 120 people and is used for seminars, presentations and campus events."

6. NAVIGATION (e.g. "How do I get to the seminar hall?"):
   - If starting point is known: provide the route.
   - If starting point is not known: ask "Where are you starting from?" (NEVER invent a starting location).

7. FLOOR AGGREGATE CAPACITY (e.g. "How many students can the first floor accommodate?"):
   - Retrieve total capacity from the floor capacity tool.
   - Example: "The classrooms on the First Floor can accommodate a total of 270 students."

8. GREETING (e.g. "Hi", "Hello"):
   - "Hi! 👋 I'm your Campus AI Copilot. I can help you find rooms, navigate the campus, and answer questions about campus facilities."`;

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
      name: 'get_entity_location',
      description: 'Retrieve the verified location, floor, and landmark for a room or facility without unasked fields.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Room name or identifier (e.g. "Seminar Hall", "Classroom 101")' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_entity_equipment',
      description: 'Retrieve installed audiovisual and laboratory equipment for a specific room.',
      parameters: {
        type: 'object',
        properties: {
          roomId: { type: 'string', description: 'Room name or identifier (e.g. "Seminar Hall", "Lab 1")' },
        },
        required: ['roomId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_route',
      description: 'Calculate an indoor route between two rooms. Only call if the user provided or confirmed a starting point.',
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
];

async function executeServerTool(name: string, args: any, context: any, actions: any[]): Promise<any> {
  switch (name) {
    case 'get_room_capacity': {
      const q = String(args.roomId || '').trim();
      const room = findRoomByIdOrName(q);
      if (room) {
        return {
          room: room.name,
          capacity: room.capacity,
          seatingCapacity: room.capacity,
          studentCapacity: room.capacity,
        };
      }
      return { error: `Room '${q}' not found in campus database.` };
    }

    case 'get_floor_capacity': {
      const q = String(args.floor || '').trim();
      const data = getFloorCapacity(q);
      return {
        floor: data.floorName,
        totalCapacity: data.totalCapacity,
        totalClassrooms: data.totalClassrooms,
      };
    }

    case 'get_entity_location': {
      const q = String(args.query || '').trim();
      const room = findRoomByIdOrName(q);
      if (room) {
        actions.push({
          action: 'FOCUS_ENTITY',
          entityId: room.id,
          roomName: room.name,
          floor: room.floor,
        });

        const filtered = filterRoomData(room, 'LOCATION');
        return filtered;
      }
      return { error: `Location '${q}' not found.` };
    }

    case 'get_entity_equipment': {
      const q = String(args.roomId || '').trim();
      const room = findRoomByIdOrName(q);
      if (room) {
        const filtered = filterRoomData(room, 'EQUIPMENT');
        return filtered;
      }
      return { error: `Room '${q}' not found.` };
    }

    case 'calculate_route': {
      if (!args.startEntityId && !context?.currentLocation) {
        return {
          needsStartingPoint: true,
          message: 'Starting point is required. Ask user where they are starting from.',
        };
      }

      const start = findRoomByIdOrName(args.startEntityId) || findRoomByIdOrName(context?.selectedEntityId);
      const end = findRoomByIdOrName(args.destinationEntityId);
      if (!start || !end) {
        return { error: 'Origin or destination could not be identified.' };
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
        origin: start.name,
        destination: end.name,
        distanceMeters: route.distanceMeters,
        landmarks: 'Central Hexagon corridor',
      };
    }

    default:
      return { error: `Tool ${name} not recognized.` };
  }
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

    // 1. Run local authoritative pipeline first to determine intent, target entity, and verified data
    const pipelineResult = runCopilotPipeline(message, history, context);

    // If local pipeline has high confidence for deterministic campus queries (e.g. tests 1–9, greetings, etc.),
    // or if AI provider is not configured or offline, return pipeline result directly
    if (
      aiConfig.provider === 'none' ||
      !aiConfig.apiKey ||
      pipelineResult.confidence >= 0.95
    ) {
      return NextResponse.json({
        reply: pipelineResult.answer,
        conversationId: conversationId || `conv-${Date.now()}`,
        model: 'campus-copilot-engine',
        actions: pipelineResult.mapAction && pipelineResult.mapAction.action !== 'NONE' ? [pipelineResult.mapAction] : [],
        internal: pipelineResult,
        toolCallsMade: [],
        isConfigured: true,
      });
    }

    // Otherwise, attempt LLM call with strict data filtering
    const openai = new OpenAI({
      apiKey: aiConfig.apiKey,
      baseURL: aiConfig.baseURL,
    });

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

    messages.push({ role: 'user', content: message });

    const toolCallsMade: string[] = [];
    const triggeredActions: any[] = [];
    let finalReply = '';

    let currentMsgs = [...messages];
    for (let turn = 0; turn < 3; turn++) {
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
        finalReply = resMsg.content || pipelineResult.answer;
        break;
      }
    }

    return NextResponse.json({
      reply: finalReply || pipelineResult.answer,
      conversationId: conversationId || `conv-${Date.now()}`,
      model: aiConfig.model,
      actions: triggeredActions.length > 0 ? triggeredActions : (pipelineResult.mapAction ? [pipelineResult.mapAction] : []),
      internal: pipelineResult,
      toolCallsMade,
      isConfigured: true,
    });
  } catch (err: any) {
    // Graceful error handling: NEVER expose raw HTTP 429, quota errors, or stack traces
    const fallbackResult = runCopilotPipeline(message, history, context);
    return NextResponse.json({
      reply: fallbackResult.answer,
      conversationId: conversationId || `conv-${Date.now()}`,
      model: 'campus-copilot-engine',
      actions: fallbackResult.mapAction && fallbackResult.mapAction.action !== 'NONE' ? [fallbackResult.mapAction] : [],
      internal: fallbackResult,
      toolCallsMade: [],
      isConfigured: true,
    });
  }
}
