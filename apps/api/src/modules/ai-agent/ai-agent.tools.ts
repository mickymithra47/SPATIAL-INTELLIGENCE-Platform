import type { OpenAI } from 'openai';

export const SPATIAL_OPENAI_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_spatial_entities',
      description: 'Search campus rooms, laboratories, facilities, buildings, corridors, and amenities by keyword or type.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Name, code, or keyword to search (e.g. "Lab 1", "Restroom", "Server Room")' },
          floorId: { type: 'string', description: 'Optional floor filter ("0" for Ground, "1" for 1st, "2" for 2nd, "3" for Terrace)' },
          entityType: { type: 'string', description: 'Optional entity type filter (e.g. ROOM, LAB, RESTROOM, FACILITY, BUILDING)' },
          institutionId: { type: 'string', description: 'Optional institution ID' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_entity_details',
      description: 'Retrieve authoritative details about a specific room, lab, or campus entity.',
      parameters: {
        type: 'object',
        properties: {
          entityId: { type: 'string', description: 'Entity ID or room number (e.g. "GF-LAB-01", "204", "r-101")' },
        },
        required: ['entityId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_nearest',
      description: 'Find the nearest entity (e.g. restroom, elevator, stairs, exit, lab) relative to the user\'s current room or location.',
      parameters: {
        type: 'object',
        properties: {
          entityType: { type: 'string', description: 'Entity category to locate (RESTROOM, ELEVATOR, STAIR, EXIT, LAB)' },
          fromEntityId: { type: 'string', description: 'Starting room or entity ID (defaults to current selected room)' },
        },
        required: ['entityType'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_route',
      description: 'Calculate an indoor route using the spatial graph and A* pathfinding algorithm. Returns distance, time, and step-by-step corridor directions.',
      parameters: {
        type: 'object',
        properties: {
          startEntityId: { type: 'string', description: 'Origin room ID or room name (optional; defaults to user current room)' },
          destinationEntityId: { type: 'string', description: 'Destination room ID or room name' },
          accessibility: { type: 'boolean', description: 'Whether to require wheelchair-accessible elevator route avoiding stairs' },
          avoidBlocked: { type: 'boolean', description: 'Whether to route around simulated corridor blockages' },
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
          floorId: { type: 'string', description: 'Floor identifier ("0" for Ground, "1" for 1st, "2" for 2nd, "3" for Terrace)' },
        },
        required: ['floorId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_current_spatial_context',
      description: 'Retrieve the active spatial context: selected institution, active building, current floor, selected room, and map view.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_lab_status',
      description: 'Get simulated telemetry and operational status for a lab or room (power load, temperature, active workstations, occupancy).',
      parameters: {
        type: 'object',
        properties: {
          labId: { type: 'string', description: 'Room or lab ID (e.g. "GF-LAB-01", "204")' },
        },
        required: ['labId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_simulation_events',
      description: 'Retrieve active simulated spatial and environmental events (e.g. corridor blockages, elevator maintenance) affecting campus navigation.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_institution_info',
      description: 'Get information about the current or specified campus institution.',
      parameters: {
        type: 'object',
        properties: {
          institutionId: { type: 'string', description: 'Institution code or ID (e.g. "ESEC", "COLLEGE_A")' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to_entity',
      description: 'Execute a Digital Twin action to visually focus on a room, switch the 3D/2D floor view, or initiate step-by-step navigation.',
      parameters: {
        type: 'object',
        properties: {
          entityId: { type: 'string', description: 'Target room or facility ID' },
          actionType: { type: 'string', enum: ['FOCUS', 'NAVIGATE', 'SWITCH_FLOOR'], description: 'Type of UI action to trigger' },
        },
        required: ['entityId'],
      },
    },
  },
];
