import { create } from 'zustand';
import { ChatMessage, AIResponse } from '@spatial/types';
import { useSpatialStore } from './useSpatialStore';
import { EXTENDED_ROOMS, EXTENDED_BUILDINGS, EXTENDED_EQUIPMENT, CLASS_TIMETABLE } from '../services/campusData.service';

export interface SpatialAIAction {
  type: 'FOCUS_ROOM' | 'FOCUS_BUILDING' | 'START_ROUTE' | 'TOGGLE_LAYER' | 'SAFETY_MODE' | 'INSPECT_EQUIPMENT';
  label: string;
  payload: any;
}

export interface ExtendedChatMessage extends ChatMessage {
  spatialActions?: SpatialAIAction[];
  spatialExplanation?: {
    distanceSavedMeters?: number;
    elevationNotice?: string;
    highlights: string[];
  };
}

interface AIChatState {
  isOpen: boolean;
  messages: ExtendedChatMessage[];
  isLoading: boolean;
  conversationId: string;
  lastExecutedAction: string | null;

  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  addMessage: (message: ExtendedChatMessage) => void;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

export const useAIChatStore = create<AIChatState>((set, get) => ({
  isOpen: false,
  messages: [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Welcome to the Campus Spatial Operating System. Ask your campus anything:\n• "Where is my next class?"\n• "Navigate to AI Lab 204"\n• "Find an empty classroom"\n• "Show crowded areas"\n• "Show equipment needing maintenance"',
      timestamp: new Date().toISOString(),
      spatialActions: [
        { type: 'FOCUS_ROOM', label: 'View AI Lab 204', payload: 'r-204' },
        { type: 'START_ROUTE', label: 'Route: 101 → 204', payload: { from: 'r-101', to: 'r-204' } },
      ],
    },
  ],
  isLoading: false,
  conversationId: 'conv-' + Date.now(),
  lastExecutedAction: null,

  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearChat: () => set({ messages: [] }),

  sendMessage: async (text: string) => {
    const userMsg: ExtendedChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isLoading: true,
      isOpen: true,
    }));

    const spatialStore = useSpatialStore.getState();
    const query = text.toLowerCase().trim();

    // First attempt to call the real NestJS API server
    try {
      const response = await fetch('http://localhost:4000/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': spatialStore.userRole,
        },
        body: JSON.stringify({
          message: text,
          conversationId: get().conversationId,
        }),
      });

      if (response.ok) {
        const data: AIResponse = await response.json();

        // Process highlight and route sync
        if (data.highlightedEntity) {
          spatialStore.setHighlightedEntityId(data.highlightedEntity.id);
          const matchedRoom = spatialStore.rooms.find(
            (r) => r.id === data.highlightedEntity?.id || r.roomNumber === data.highlightedEntity?.id
          );
          if (matchedRoom) {
            spatialStore.setSelectedRoom(matchedRoom);
            spatialStore.setActiveFloorNumber(matchedRoom.floorNumber);
            spatialStore.setSelectedBuildingView(true);
          }
        }

        const routeAction = data.executedActions?.find((a) => a.actionType === 'CALCULATE_INDOOR_ROUTE');
        if (routeAction && (routeAction.payload as any)?.route) {
          const p = routeAction.payload as any;
          spatialStore.setActiveRoute({
            originName: p.origin?.name || 'Lecture Hall 101',
            destinationName: p.destination?.name || 'AI & Robotics Lab 204',
            totalDistanceMeters: p.route.totalDistanceMeters || 54,
            estimatedMinutes: p.route.estimatedMinutes || 1.8,
            waypoints: p.route.waypoints || [],
            accessible: true,
            reasoning: 'Optimal indoor corridor route avoiding congestion',
          });
        }

        const aiMsg: ExtendedChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, aiMsg],
          isLoading: false,
        }));
        return;
      }
    } catch {
      // Gracefully step down to Spatial AI engine
    }

    // Advanced Spatial AI Natural Query Intelligence Engine
    let reply = '';
    const actions: SpatialAIAction[] = [];
    let explanation: ExtendedChatMessage['spatialExplanation'] | undefined;

    // 1. "Where is my next class?"
    if (query.includes('next class') || query.includes('my class')) {
      const nextSession = CLASS_TIMETABLE[0]; // CS602 in Room 204
      reply = `Your next class is **${nextSession.className}** (${nextSession.classCode}) conducted by ${nextSession.facultyName}. It begins at **${nextSession.startTime}** in **${nextSession.roomName}** (Second Floor, Block B).`;
      
      spatialStore.setActiveBuildingId('b-cse-001');
      spatialStore.setActiveFloorNumber(2);
      spatialStore.setSelectedBuildingView(true);
      const room = spatialStore.rooms.find((r) => r.id === nextSession.roomId);
      if (room) spatialStore.setSelectedRoom(room);

      spatialStore.setActiveRoute({
        originName: 'Lecture Hall 101 (Ground Floor)',
        destinationName: 'AI & Robotics Lab 204 (Floor 2)',
        totalDistanceMeters: 54,
        estimatedMinutes: 1.8,
        waypoints: [],
        accessible: true,
        reasoning: 'Shortest path via Vertical Core Elevator #1',
        steps: [
          { instruction: 'Exit Lecture Hall 101 into Corridor A', distance: '8m', level: 'Floor 1', type: 'DOOR' },
          { instruction: 'Walk along corridor to Vertical Core elevator', distance: '15m', level: 'Floor 1', type: 'WALK' },
          { instruction: 'Take Elevator #1 to Level 2', distance: '10m', level: 'Floor 1 → 2', type: 'ELEVATOR' },
          { instruction: 'Turn right towards North Wing Lab 204', distance: '14m', level: 'Floor 2', type: 'WALK' },
        ],
      });

      actions.push({ type: 'FOCUS_ROOM', label: 'View Room 204', payload: 'r-204' });
    }

    // 2. "Navigate to Room 204" / "Take me to AI Lab 204" / "Route from 101 to 204"
    else if (query.includes('navigate') || query.includes('take me to') || query.includes('route') || query.includes('get from')) {
      reply = `Routing calculated: **Lecture Hall 101 → AI & Robotics Lab 204**. Total distance is **54 meters** (~1.8 min walking speed). The route utilizes Corridor A and the Level 2 Vertical Core.`;
      
      spatialStore.setActiveBuildingId('b-cse-001');
      spatialStore.setActiveFloorNumber(2);
      spatialStore.setSelectedBuildingView(true);
      const room204 = spatialStore.rooms.find((r) => r.roomNumber === '204');
      if (room204) spatialStore.setSelectedRoom(room204);

      spatialStore.setActiveRoute({
        originName: 'Lecture Hall 101',
        destinationName: 'AI & Robotics Lab 204',
        totalDistanceMeters: 54,
        estimatedMinutes: 1.8,
        waypoints: [],
        accessible: !query.includes('stairs'),
        reasoning: 'Avoids staircase congestion; ADA compliant',
        steps: [
          { instruction: 'Exit Room 101 into Main Junction 1', distance: '8m', level: 'Floor 1', type: 'DOOR' },
          { instruction: 'Proceed north to Elevator #1', distance: '15m', level: 'Floor 1', type: 'WALK' },
          { instruction: 'Ascend to Level 2 via Elevator #1', distance: '10m', level: 'Level 1 → 2', type: 'ELEVATOR' },
          { instruction: 'Arrive at AI Lab 204 entrance', distance: '14m', level: 'Floor 2', type: 'WALK' },
        ],
      });

      explanation = {
        distanceSavedMeters: 18,
        elevationNotice: 'Floor 1 to Floor 2 (+4.5m elevation)',
        highlights: ['18m shorter than East Wing corridor', 'Wheelchair & elevator accessible', 'Zero congestion on current path'],
      };
    }

    // 3. "Which labs are free now?" / "Find an empty classroom" / "Available rooms"
    else if (query.includes('empty') || query.includes('free') || query.includes('available')) {
      const freeRoom = spatialStore.rooms.find((r) => r.currentOccupancy === 0) || spatialStore.rooms[1];
      reply = `I found **Seminar Hall 201** (Block B, Floor 2) currently completely available with **0 / 90 occupants**. Air conditioning is active at 21.5°C with optimal air quality index.`;
      
      spatialStore.setActiveBuildingId('b-cse-001');
      spatialStore.setActiveFloorNumber(2);
      spatialStore.setSelectedRoom(freeRoom);
      spatialStore.setHighlightedEntityId(freeRoom.id);
      actions.push({ type: 'FOCUS_ROOM', label: 'Select Seminar Hall 201', payload: freeRoom.id });
    }

    // 4. "Find all robotics labs" / "Robotics"
    else if (query.includes('robotics')) {
      reply = `I identified **2 Robotics Research & AI Centers** on campus:\n• **AI & Robotics Lab 204** (Block B, Floor 2) - 40 seats, UR5e 6-Axis Robot Arm, 18 workstations\n• **Advanced Robotics Research Annex** (Block D, Ground Floor) - Heavy fabrication & testing arena`;
      
      spatialStore.setActiveBuildingId('b-cse-001');
      spatialStore.setActiveFloorNumber(2);
      spatialStore.setHighlightedEntityId('r-204');
      const r204 = spatialStore.rooms.find((r) => r.id === 'r-204');
      if (r204) spatialStore.setSelectedRoom(r204);
      actions.push({ type: 'FOCUS_ROOM', label: 'Highlight Room 204', payload: 'r-204' });
    }

    // 5. "Show crowded areas" / "People density"
    else if (query.includes('crowded') || query.includes('density') || query.includes('people flow')) {
      reply = `Campus Real-Time Density telemetry activated:\n• **Campus Dining & Social Commons**: High density (82% capacity / 205 people)\n• **Block B Ground Floor Corridor**: Moderate density (68% capacity / 54 in 101)\n• **Central Library**: Calm / Quiet zone (63% capacity / 76 people)\n\n*Activated People Density GIS Heatmap layer.*`;
      
      spatialStore.setLayers({ peopleDensity: true });
      spatialStore.setSelectedBuildingView(false); // Switch to macro view to show heatmap across campus
      actions.push({ type: 'TOGGLE_LAYER', label: 'People Density Layer Active', payload: 'peopleDensity' });
    }

    // 6. "Show emergency exits" / "Safety exits" / "Emergency navigation"
    else if (query.includes('emergency') || query.includes('safety') || query.includes('fire exit') || query.includes('exit')) {
      reply = `**EMERGENCY SAFETY MODE ENGAGED**.\n• Nearest Fire Exit: **Fire Exit Staircase B North (40m away)**\n• Primary Safe Assembly Point: **Campus Assembly Lawn (Green Zone A)**\n• Fire Extinguishers & AED marked with illuminated safety beacons.`;
      
      spatialStore.setViewMode('SAFETY');
      spatialStore.setLayers({ fireSafety: true, navigation: true });
      actions.push({ type: 'SAFETY_MODE', label: 'Safety Mode Activated', payload: true });
    }

    // 7. "Which equipment needs maintenance?" / "Equipment status"
    else if (query.includes('maintenance') || query.includes('broken') || query.includes('equipment')) {
      reply = `Active Equipment Alerts:\n• **NVIDIA RTX AI Workstation #02** (Tag: WS-204-02 in Room 204) - Status: **MAINTENANCE** (Ticket #TICK-1001 assigned to Rajesh Kumar)\n• **Auditorium Projector P-101** in Room 101 - Status: Scheduled preventive maintenance in 28 days`;
      
      spatialStore.setActiveBuildingId('b-cse-001');
      spatialStore.setActiveFloorNumber(2);
      const r204 = spatialStore.rooms.find((r) => r.id === 'r-204');
      if (r204) spatialStore.setSelectedRoom(r204);
      actions.push({ type: 'INSPECT_EQUIPMENT', label: 'Inspect Workstation #02', payload: 'ast-ws-02' });
    }

    // 8. "Why should I take this route?"
    else if (query.includes('why') && (query.includes('route') || query.includes('path'))) {
      reply = `**Spatial Route Analysis:**\n• **18 meters shorter** than the outdoor courtyard path.\n• Avoids Staircase A, which currently has heavy descending class change traffic.\n• Elevator #1 is operational with zero wait queue.\n• Completely covered indoors (climate controlled at 22°C).`;
      
      explanation = {
        distanceSavedMeters: 18,
        elevationNotice: 'Avoids 24 stair steps via direct elevator link',
        highlights: ['18m shorter route', 'Zero staircase physical impedance', 'Full indoor air-conditioned passage'],
      };
    }

    // 9. "Show Block B" / "Where is Block B?"
    else if (query.includes('block b') || query.includes('computer science building')) {
      reply = `**Computer Science & AI Block B**:\n• Floors: 3 Levels | Area: 8,400 m²\n• Rooms: 48 | Labs: 12 (including AI & Robotics 204)\n• Current Occupancy: 68% (Healthy)\n• Energy Consumption: 142.5 kWh`;
      
      spatialStore.setActiveBuildingId('b-cse-001');
      spatialStore.setSelectedBuildingView(true);
      actions.push({ type: 'FOCUS_BUILDING', label: 'Explore Block B Floors', payload: 'b-cse-001' });
    }

    // 10. General Spatial Fallback
    else {
      reply = `I parsed your spatial inquiry: "${text}". I can inspect any room, navigate indoor corridors, check real-time sensor telemetry, or show crowd density. Try:\n• "Where is Room 204?"\n• "Navigate to Seminar Hall 201"\n• "Show crowded areas on campus"\n• "Where is the nearest emergency exit?"`;
    }

    const aiMsg: ExtendedChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
      spatialActions: actions,
      spatialExplanation: explanation,
    };

    set((state) => ({
      messages: [...state.messages, aiMsg],
      isLoading: false,
    }));
  },
}));
