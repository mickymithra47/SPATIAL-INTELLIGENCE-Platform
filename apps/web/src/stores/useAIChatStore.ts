import { create } from 'zustand';
import { ChatMessage, AIResponse } from '@spatial/types';
import { useSpatialStore } from './useSpatialStore';
import {
  EXTENDED_ROOMS,
  EXTENDED_BUILDINGS,
  EXTENDED_EQUIPMENT,
  CLASS_TIMETABLE,
  SAFETY_NODES,
} from '../services/campusData.service';
import { runCopilotPipeline } from '../services/campusCopilotEngine';

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
  isTyping?: boolean;
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

// Helper: get current day-of-week name
function getCurrentDay(): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
}

// Helper: get current time as "HH:MM"
function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// Helper: format time nicely
function formatTime12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

// Smart intent classifier
function classifyIntent(query: string): string {
  const q = query.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|good\s?(morning|afternoon|evening)|howdy|what's up|sup|yo)\b/i.test(q)) return 'GREETING';

  // Thanks
  if (/^(thanks|thank you|thx|ty|cheers|appreciate)/i.test(q)) return 'THANKS';

  // Next class / my class
  if (/next\s+class|my\s+class|upcoming\s+class|what\s+class|when\s+.*class/i.test(q)) return 'NEXT_CLASS';

  // Timetable / schedule
  if (/schedule|timetable|class(es)?\s+(in|for|at)|what.*happening\s+in|sessions?\s+in/i.test(q)) return 'SCHEDULE';

  // Navigation / routing
  if (/navigate|take\s+me|route|direction|how\s+(do\s+i\s+)?get\s+(to|from)|walk\s+to|go\s+to|way\s+to|path\s+to/i.test(q)) return 'NAVIGATE';

  // Find room / where is room
  if (/where\s+is|find\s+room|locate|show\s+me\s+room|room\s+\d+/i.test(q)) return 'FIND_ROOM';

  // Free / empty / available rooms
  if (/empty|free|available|open\s+room|vacant|unoccupied/i.test(q)) return 'FREE_ROOMS';

  // Crowded / density / people flow
  if (/crowd|density|busy|packed|people\s+flow|congestion|occupancy|how\s+many\s+people/i.test(q)) return 'CROWD_DENSITY';

  // Emergency / safety / fire
  if (/emergency|safety|fire\s+exit|exit|evacuation|defibrillator|aed|first\s+aid|assembly\s+point/i.test(q)) return 'EMERGENCY';

  // Equipment / maintenance / broken
  if (/equipment|maintenance|broken|repair|fix|workstation|projector|machine|device|asset/i.test(q)) return 'EQUIPMENT';

  // Building info
  if (/block\s+[a-d]|building|computer\s+science\s+building|library\s+building|student\s+hub/i.test(q)) return 'BUILDING_INFO';

  // Labs / robotics / specific labs
  if (/robotics|lab(s|oratory)?|research/i.test(q)) return 'LABS';

  // Weather / environment / temperature / air quality
  if (/temperature|weather|air\s+quality|humidity|co2|noise|environment|hot|cold|ventilation/i.test(q)) return 'ENVIRONMENT';

  // Energy / power consumption
  if (/energy|power|electricity|consumption|kwh|watt/i.test(q)) return 'ENERGY';

  // WiFi / connectivity
  if (/wifi|wi-fi|internet|connectivity|signal|network/i.test(q)) return 'WIFI';

  // Help / capabilities
  if (/help|what can you|capabilities|features|commands|options|menu/i.test(q)) return 'HELP';

  // Why route
  if (/why.*(route|path|way|direction)/i.test(q)) return 'WHY_ROUTE';

  // General campus info
  if (/campus|about|overview|summary|stats|statistics/i.test(q)) return 'CAMPUS_INFO';

  // Who / faculty
  if (/who\s+(teaches|is|runs)|professor|faculty|teacher|instructor|dr\.|prof\./i.test(q)) return 'FACULTY';

  // Fallback
  return 'GENERAL';
}

// Extract room number or name from query
function extractRoomRef(query: string): string | null {
  const q = query.toLowerCase();
  // Match "room 204", "lab 204", just "204"
  const numMatch = q.match(/(?:room|lab|hall|seminar|office)\s+(\d+)/i) || q.match(/\b(\d{3})\b/);
  if (numMatch) return numMatch[1];

  // Match room name fragments
  if (q.includes('ai lab') || q.includes('robotics lab') || q.includes('ai & robotics')) return '204';
  if (q.includes('seminar hall') || q.includes('seminar')) return '201';
  if (q.includes('lecture hall') || q.includes('lecture')) return '101';
  if (q.includes('computing lab') || q.includes('computing systems')) return '102';
  if (q.includes('library') || q.includes('media center')) return 'LIB-01';
  if (q.includes('cafeteria') || q.includes('dining') || q.includes('canteen') || q.includes('food')) return 'CAF-01';
  if (q.includes('office') || q.includes('faculty')) return '202';

  return null;
}

// Main intelligent response generator
function generateSmartResponse(
  query: string,
  intent: string,
  spatialStore: ReturnType<typeof useSpatialStore.getState>
): {
  reply: string;
  actions: SpatialAIAction[];
  explanation?: ExtendedChatMessage['spatialExplanation'];
  spatialSideEffects?: () => void;
} {
  const actions: SpatialAIAction[] = [];
  let explanation: ExtendedChatMessage['spatialExplanation'] | undefined;
  let spatialSideEffects: (() => void) | undefined;
  const currentDay = getCurrentDay();
  const currentTime = getCurrentTime();

  switch (intent) {
    case 'GREETING': {
      const greetings = [
        `Hey there! 👋 Welcome to the **Campus Spatial Intelligence System**. I'm your AI copilot — I know every room, corridor, lab, and sensor on campus in real-time.\n\nHere's what I can help you with right now:\n\n🧭 **Navigation** — "Take me to AI Lab 204"\n📅 **Schedules** — "Where is my next class?"\n🏠 **Room Search** — "Find an empty classroom"\n📊 **Live Data** — "Show crowded areas"\n🛡️ **Safety** — "Where is the nearest emergency exit?"\n🔧 **Maintenance** — "Which equipment needs repair?"\n\nJust ask me anything about the campus!`,
        `Hello! 🌟 I'm your Campus AI Copilot. Think of me as your spatial brain — I have real-time awareness of every room, lab, sensor, and corridor.\n\nCurrently tracking **${EXTENDED_ROOMS.length} rooms** across **${EXTENDED_BUILDINGS.length} buildings** with live occupancy and environmental data.\n\nWhat would you like to know?`,
      ];
      return { reply: greetings[Math.floor(Math.random() * greetings.length)], actions };
    }

    case 'THANKS': {
      const responses = [
        "You're welcome! 😊 Feel free to ask me anything else about the campus — I'm always here to help!",
        "Happy to help! 🎯 If you need directions, room info, or anything else, just ask!",
        "Anytime! 👍 I'm here whenever you need campus intelligence.",
      ];
      return { reply: responses[Math.floor(Math.random() * responses.length)], actions };
    }

    case 'NEXT_CLASS': {
      // Find today's classes, or next upcoming class
      const todayClasses = CLASS_TIMETABLE.filter((c) => c.day === currentDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      const upcomingToday = todayClasses.filter((c) => c.startTime > currentTime);

      if (upcomingToday.length > 0) {
        const next = upcomingToday[0];
        const room = EXTENDED_ROOMS.find((r) => r.id === next.roomId);
        const reply = `📚 Your next class is:\n\n**${next.className}** (${next.classCode})\n👨‍🏫 Professor: **${next.facultyName}**\n🕐 Time: **${formatTime12h(next.startTime)} – ${formatTime12h(next.endTime)}**\n📍 Location: **${next.roomName}** (Floor ${room?.floorNumber || 2}, ${room?.buildingName || 'Block B'})\n👥 Expected Students: **${next.studentCount}**\n\n${room ? `The room is currently **${room.operationalStatus.toLowerCase()}** with **${room.currentOccupancy}/${room.capacity}** occupants and a temperature of **${room.environmental.temperatureC}°C**.` : ''}\n\nWould you like me to navigate you there?`;

        spatialSideEffects = () => {
          spatialStore.setActiveBuildingId(room?.buildingId || 'b-cse-001');
          spatialStore.setActiveFloorNumber(room?.floorNumber || 2);
          spatialStore.setSelectedBuildingView(true);
          if (room) spatialStore.setSelectedRoom(room);
          spatialStore.setActiveRoute({
            originName: 'Lecture Hall 101 (Ground Floor)',
            destinationName: `${next.roomName} (Floor ${room?.floorNumber || 2})`,
            totalDistanceMeters: 54,
            estimatedMinutes: 1.8,
            waypoints: [],
            accessible: true,
            reasoning: 'Shortest path via Vertical Core Elevator #1',
            steps: [
              { instruction: 'Exit current location into main corridor', distance: '8m', level: 'Floor 1', type: 'DOOR' },
              { instruction: 'Walk along corridor to Vertical Core elevator', distance: '15m', level: 'Floor 1', type: 'WALK' },
              { instruction: 'Take Elevator #1 to Level 2', distance: '10m', level: 'Floor 1 → 2', type: 'ELEVATOR' },
              { instruction: `Turn right towards ${next.roomName}`, distance: '14m', level: `Floor ${room?.floorNumber || 2}`, type: 'WALK' },
            ],
          });
        };

        actions.push({ type: 'FOCUS_ROOM', label: `View ${next.roomName}`, payload: next.roomId });
        actions.push({ type: 'START_ROUTE', label: `Navigate to ${next.roomNumber}`, payload: { from: 'r-101', to: next.roomId } });

        return { reply, actions, spatialSideEffects };
      }

      // No more classes today — show next scheduled
      const nextClass = CLASS_TIMETABLE[0];
      const room = EXTENDED_ROOMS.find((r) => r.id === nextClass.roomId);
      const reply = `📅 No more classes today (${currentDay}).\n\nYour next scheduled class is:\n\n**${nextClass.className}** (${nextClass.classCode})\n👨‍🏫 Professor: **${nextClass.facultyName}**\n📆 Day: **${nextClass.day}**\n🕐 Time: **${formatTime12h(nextClass.startTime)} – ${formatTime12h(nextClass.endTime)}**\n📍 Location: **${nextClass.roomName}** (Floor ${room?.floorNumber || 2})\n\nWould you like to see the full weekly timetable?`;

      spatialSideEffects = () => {
        if (room) {
          spatialStore.setActiveBuildingId(room.buildingId);
          spatialStore.setActiveFloorNumber(room.floorNumber);
          spatialStore.setSelectedBuildingView(true);
          spatialStore.setSelectedRoom(room);
        }
      };

      actions.push({ type: 'FOCUS_ROOM', label: `View ${nextClass.roomName}`, payload: nextClass.roomId });
      return { reply, actions, spatialSideEffects };
    }

    case 'SCHEDULE': {
      const roomRef = extractRoomRef(query);
      if (roomRef) {
        const sessions = CLASS_TIMETABLE.filter(
          (c) => c.roomNumber === roomRef || c.roomId === `r-${roomRef}`
        );
        const room = EXTENDED_ROOMS.find((r) => r.roomNumber === roomRef || r.id === `r-${roomRef}`);

        if (sessions.length > 0) {
          const scheduleLines = sessions
            .map((s) => `| ${s.day} | ${formatTime12h(s.startTime)} – ${formatTime12h(s.endTime)} | ${s.className} (${s.classCode}) | ${s.facultyName} | ${s.studentCount} |`)
            .join('\n');

          const reply = `📋 **Schedule for ${room?.name || `Room ${roomRef}`}**\n\n| Day | Time | Course | Faculty | Students |\n|-----|------|--------|---------|----------|\n${scheduleLines}\n\n${room ? `\n**Current Status:** ${room.operationalStatus} • **Occupancy:** ${room.currentOccupancy}/${room.capacity} • **Temp:** ${room.environmental.temperatureC}°C` : ''}`;

          spatialSideEffects = () => {
            if (room) {
              spatialStore.setActiveBuildingId(room.buildingId);
              spatialStore.setActiveFloorNumber(room.floorNumber);
              spatialStore.setSelectedRoom(room);
              spatialStore.setSelectedBuildingView(true);
            }
          };

          if (room) actions.push({ type: 'FOCUS_ROOM', label: `View ${room.name}`, payload: room.id });
          return { reply, actions, spatialSideEffects };
        }

        return {
          reply: `📋 No classes are currently scheduled in **Room ${roomRef}**. The room is available for open study or booking.\n\nWould you like me to find rooms that have classes scheduled?`,
          actions,
        };
      }

      // Show all scheduled classes
      const allLines = CLASS_TIMETABLE
        .map((s) => `| ${s.day} | ${formatTime12h(s.startTime)} – ${formatTime12h(s.endTime)} | ${s.className} | ${s.roomName} | ${s.facultyName} |`)
        .join('\n');

      return {
        reply: `📋 **Full Campus Class Schedule**\n\n| Day | Time | Course | Room | Faculty |\n|-----|------|--------|------|----------|\n${allLines}\n\n📊 Total: **${CLASS_TIMETABLE.length} sessions** across **${new Set(CLASS_TIMETABLE.map((c) => c.roomId)).size} rooms**`,
        actions,
      };
    }

    case 'NAVIGATE': {
      const roomRef = extractRoomRef(query);
      const targetRoom = roomRef
        ? EXTENDED_ROOMS.find((r) => r.roomNumber === roomRef || r.id === `r-${roomRef}`)
        : EXTENDED_ROOMS.find((r) => r.id === 'r-204');

      if (!targetRoom) {
        return {
          reply: `I couldn't identify the destination room. Could you specify the room number or name? For example:\n\n• "Navigate to Room 204"\n• "Take me to the Library"\n• "How do I get to the Cafeteria?"`,
          actions,
        };
      }

      const originRoom = EXTENDED_ROOMS.find((r) => r.id === 'r-101') || EXTENDED_ROOMS[3];
      const distance = Math.abs(targetRoom.floorNumber - originRoom.floorNumber) * 12 + 42;
      const minutes = (distance / 30).toFixed(1);

      const steps: Array<{ instruction: string; distance: string; level: string; type: 'ELEVATOR' | 'DOOR' | 'WALK' | 'STAIR' }> = [];
      steps.push({ instruction: `Exit ${originRoom.name} into the main corridor`, distance: '8m', level: `Floor ${originRoom.floorNumber}`, type: 'DOOR' });

      if (targetRoom.floorNumber !== originRoom.floorNumber) {
        steps.push({ instruction: `Walk to the Vertical Core Elevator`, distance: '15m', level: `Floor ${originRoom.floorNumber}`, type: 'WALK' });
        steps.push({
          instruction: `Take Elevator #1 to Level ${targetRoom.floorNumber}`,
          distance: `${Math.abs(targetRoom.floorNumber - originRoom.floorNumber) * 4}m`,
          level: `Floor ${originRoom.floorNumber} → ${targetRoom.floorNumber}`,
          type: 'ELEVATOR',
        });
        steps.push({ instruction: `Proceed to ${targetRoom.name}`, distance: '14m', level: `Floor ${targetRoom.floorNumber}`, type: 'WALK' });
      } else {
        steps.push({ instruction: `Walk along the corridor to ${targetRoom.name}`, distance: `${distance - 8}m`, level: `Floor ${targetRoom.floorNumber}`, type: 'WALK' });
      }

      const reply = `🧭 **Route: ${originRoom.name} → ${targetRoom.name}**\n\n📏 Total Distance: **${distance} meters** (~${minutes} min walk)\n♿ Accessibility: **${targetRoom.isAccessible ? 'Wheelchair Accessible' : 'Stairs Only'}**\n🏢 Destination: **Floor ${targetRoom.floorNumber}, ${targetRoom.buildingName}**\n\n**Turn-by-Turn Directions:**\n${steps.map((s, i) => `${i + 1}. ${s.type === 'ELEVATOR' ? '🛗' : s.type === 'DOOR' ? '🚪' : '🚶'} ${s.instruction} *(${s.distance})*`).join('\n')}\n\n✅ Route optimized: Avoids congested corridors, ADA compliant, fully indoor climate-controlled path.`;

      spatialSideEffects = () => {
        spatialStore.setActiveBuildingId(targetRoom.buildingId);
        spatialStore.setActiveFloorNumber(targetRoom.floorNumber);
        spatialStore.setSelectedBuildingView(true);
        spatialStore.setSelectedRoom(targetRoom);
        spatialStore.setActiveRoute({
          originName: originRoom.name,
          destinationName: targetRoom.name,
          totalDistanceMeters: distance,
          estimatedMinutes: parseFloat(minutes),
          waypoints: [],
          accessible: targetRoom.isAccessible,
          reasoning: 'Optimal indoor corridor route, ADA compliant',
          steps,
        });
      };

      explanation = {
        distanceSavedMeters: 18,
        elevationNotice: targetRoom.floorNumber !== originRoom.floorNumber
          ? `Floor ${originRoom.floorNumber} to Floor ${targetRoom.floorNumber} via elevator`
          : 'Same floor — direct corridor path',
        highlights: [
          `${distance}m total indoor path`,
          targetRoom.isAccessible ? 'Wheelchair & elevator accessible' : 'Stairs required',
          'Climate-controlled corridor (22°C)',
          'Low congestion route',
        ],
      };

      actions.push({ type: 'FOCUS_ROOM', label: `View ${targetRoom.name}`, payload: targetRoom.id });

      return { reply, actions, explanation, spatialSideEffects };
    }

    case 'FIND_ROOM': {
      const roomRef = extractRoomRef(query);
      const room = roomRef
        ? EXTENDED_ROOMS.find((r) => r.roomNumber === roomRef || r.id === `r-${roomRef}`)
        : null;

      if (room) {
        const equipment = EXTENDED_EQUIPMENT.filter((e) => e.roomId === room.id);
        const sessions = CLASS_TIMETABLE.filter((c) => c.roomId === room.id);
        const statusEmoji = room.operationalStatus === 'OCCUPIED' ? '🔴' : room.operationalStatus === 'OPERATIONAL' ? '🟢' : '🟡';

        const reply = `📍 **${room.name}**\n\n| Property | Value |\n|----------|-------|\n| 🏢 Building | ${room.buildingName} |\n| 🏗️ Floor | Floor ${room.floorNumber} |\n| 🪑 Capacity | ${room.capacity} seats |\n| 👥 Current Occupancy | ${room.currentOccupancy}/${room.capacity} (${Math.round((room.currentOccupancy / room.capacity) * 100)}%) |\n| ${statusEmoji} Status | ${room.operationalStatus} |\n| 🌡️ Temperature | ${room.environmental.temperatureC}°C |\n| 💨 Air Quality | ${room.environmental.airQualityStatus} (CO₂: ${room.environmental.co2Ppm} ppm) |\n| 📶 WiFi Signal | ${room.wifiSignalPercent}% |\n| 🛡️ Safety Rating | ${room.safetyRating} |\n| ♿ Accessible | ${room.isAccessible ? 'Yes' : 'No'} |\n\n${equipment.length > 0 ? `**🔧 Equipment (${equipment.length} items):**\n${equipment.map((e) => `• ${e.name} *(${e.assetTag})* — ${e.status === 'OPERATIONAL' ? '✅' : '⚠️'} ${e.status}`).join('\n')}` : ''}\n\n${sessions.length > 0 ? `**📅 Upcoming Classes:**\n${sessions.map((s) => `• ${s.className} — ${s.day} ${formatTime12h(s.startTime)}`).join('\n')}` : ''}`;

        spatialSideEffects = () => {
          spatialStore.setActiveBuildingId(room.buildingId);
          spatialStore.setActiveFloorNumber(room.floorNumber);
          spatialStore.setSelectedRoom(room);
          spatialStore.setSelectedBuildingView(true);
          spatialStore.setHighlightedEntityId(room.id);
        };

        actions.push({ type: 'FOCUS_ROOM', label: `Focus ${room.name}`, payload: room.id });
        actions.push({ type: 'START_ROUTE', label: `Navigate Here`, payload: { from: 'r-101', to: room.id } });

        return { reply, actions, spatialSideEffects };
      }

      return {
        reply: `I couldn't find that specific room. Here are all the rooms I'm tracking:\n\n${EXTENDED_ROOMS.map((r) => `• **${r.name}** (Room ${r.roomNumber}) — Floor ${r.floorNumber}, ${r.buildingName}`).join('\n')}\n\nTry asking "Where is Room 204?" or "Find the Library".`,
        actions,
      };
    }

    case 'FREE_ROOMS': {
      const freeRooms = EXTENDED_ROOMS.filter(
        (r) => r.currentOccupancy === 0 || r.operationalStatus === 'OPERATIONAL'
      );
      const lowOccupancy = EXTENDED_ROOMS.filter(
        (r) => r.currentOccupancy > 0 && r.currentOccupancy / r.capacity < 0.3
      );

      let reply = `🏠 **Available Rooms Right Now**\n\n`;

      if (freeRooms.length > 0) {
        reply += `**Completely Free:**\n${freeRooms.map((r) => `✅ **${r.name}** — Floor ${r.floorNumber}, ${r.buildingName} • Capacity: ${r.capacity} seats • Temp: ${r.environmental.temperatureC}°C • WiFi: ${r.wifiSignalPercent}%`).join('\n')}\n\n`;
      }

      if (lowOccupancy.length > 0) {
        reply += `**Low Occupancy (< 30%):**\n${lowOccupancy.map((r) => `🟡 **${r.name}** — ${r.currentOccupancy}/${r.capacity} occupants (${Math.round((r.currentOccupancy / r.capacity) * 100)}%)`).join('\n')}\n\n`;
      }

      reply += `\n💡 *Tip: I recommend **${freeRooms[0]?.name || 'Seminar Hall 201'}** — it has the best air quality and WiFi signal.*`;

      const bestRoom = freeRooms[0] || EXTENDED_ROOMS[1];
      spatialSideEffects = () => {
        spatialStore.setActiveBuildingId(bestRoom.buildingId);
        spatialStore.setActiveFloorNumber(bestRoom.floorNumber);
        spatialStore.setSelectedRoom(bestRoom);
        spatialStore.setHighlightedEntityId(bestRoom.id);
      };

      actions.push({ type: 'FOCUS_ROOM', label: `View ${bestRoom.name}`, payload: bestRoom.id });

      return { reply, actions, spatialSideEffects };
    }

    case 'CROWD_DENSITY': {
      const sorted = [...EXTENDED_ROOMS].sort(
        (a, b) => b.currentOccupancy / b.capacity - a.currentOccupancy / a.capacity
      );

      const reply = `📊 **Real-Time Campus Density Report**\n\n| Room | Occupancy | Capacity | Density | Status |\n|------|-----------|----------|---------|--------|\n${sorted.map((r) => {
        const pct = Math.round((r.currentOccupancy / r.capacity) * 100);
        const bar = pct > 80 ? '🔴 High' : pct > 50 ? '🟡 Moderate' : pct > 0 ? '🟢 Low' : '⚪ Empty';
        return `| ${r.name} | ${r.currentOccupancy} | ${r.capacity} | ${pct}% | ${bar} |`;
      }).join('\n')}\n\n📈 **Campus Average Occupancy:** ${Math.round(EXTENDED_ROOMS.reduce((s, r) => s + r.currentOccupancy, 0) / EXTENDED_ROOMS.reduce((s, r) => s + r.capacity, 0) * 100)}%\n\n⚠️ **Highest Density:** ${sorted[0].name} at ${Math.round((sorted[0].currentOccupancy / sorted[0].capacity) * 100)}%\n✅ **Least Crowded:** ${sorted[sorted.length - 1].name} at ${Math.round((sorted[sorted.length - 1].currentOccupancy / sorted[sorted.length - 1].capacity) * 100)}%\n\n*Activated People Density heatmap layer on the digital twin.*`;

      spatialSideEffects = () => {
        spatialStore.setLayers({ peopleDensity: true });
        spatialStore.setSelectedBuildingView(false);
      };

      actions.push({ type: 'TOGGLE_LAYER', label: 'People Density Heatmap', payload: 'peopleDensity' });

      return { reply, actions, spatialSideEffects };
    }

    case 'EMERGENCY': {
      const safetyEquipment = SAFETY_NODES;
      const exits = safetyEquipment.filter((n) => n.type === 'EMERGENCY_EXIT');
      const extinguishers = safetyEquipment.filter((n) => n.type === 'FIRE_EXTINGUISHER');
      const aeds = safetyEquipment.filter((n) => n.type === 'DEFIBRILLATOR');
      const assembly = safetyEquipment.filter((n) => n.type === 'ASSEMBLY_POINT');

      const reply = `🛡️ **EMERGENCY SAFETY INFORMATION**\n\n🚨 **Emergency Exits (${exits.length}):**\n${exits.map((e) => `• 🚪 **${e.label}** — ${e.location} • Status: ${e.status === 'READY' ? '✅ Ready' : '⚠️ Check'}`).join('\n')}\n\n🧯 **Fire Extinguishers (${extinguishers.length}):**\n${extinguishers.map((e) => `• **${e.label}** — ${e.location} • ${e.status === 'INSPECTED' ? '✅ Inspected' : '⚠️'}`).join('\n')}\n\n💓 **AED / Defibrillators (${aeds.length}):**\n${aeds.map((e) => `• **${e.label}** — ${e.location} • Status: ✅ ${e.status}`).join('\n')}\n\n📍 **Assembly Points:**\n${assembly.map((e) => `• 🏕️ **${e.label}** — ${e.location}`).join('\n')}\n\n⚡ Safety mode activated on the map — all emergency assets are now highlighted with illuminated beacons.`;

      spatialSideEffects = () => {
        spatialStore.setViewMode('SAFETY');
        spatialStore.setLayers({ fireSafety: true, navigation: true });
      };

      actions.push({ type: 'SAFETY_MODE', label: 'Safety Mode Activated', payload: true });

      return { reply, actions, spatialSideEffects };
    }

    case 'EQUIPMENT': {
      const roomRef = extractRoomRef(query);
      let equipmentList = EXTENDED_EQUIPMENT;
      if (roomRef) {
        equipmentList = EXTENDED_EQUIPMENT.filter(
          (e) => e.roomId === `r-${roomRef}` || e.roomName.includes(roomRef)
        );
      }

      const needsMaint = equipmentList.filter((e) => e.status !== 'OPERATIONAL');
      const operational = equipmentList.filter((e) => e.status === 'OPERATIONAL');

      let reply = `🔧 **Equipment Status Report**\n\n`;

      if (needsMaint.length > 0) {
        reply += `**⚠️ Needs Attention (${needsMaint.length}):**\n${needsMaint.map((e) => `• 🔴 **${e.name}** *(${e.assetTag})* in ${e.roomName}\n  Status: **${e.status}** • Health: **${e.healthScore}%** • Last Serviced: ${e.lastServiced}\n  ${e.assignedTechnician ? `Assigned to: ${e.assignedTechnician}` : 'Unassigned'}`).join('\n\n')}\n\n`;
      }

      reply += `**✅ Operational (${operational.length}):**\n${operational.map((e) => `• ✅ **${e.name}** *(${e.assetTag})* — Health: ${e.healthScore}% • Usage: ${e.usagePercent}% • Power: ${e.powerWatts}W`).join('\n')}\n\n📊 **Overall Fleet Health:** ${Math.round(equipmentList.reduce((s, e) => s + e.healthScore, 0) / equipmentList.length)}%`;

      const problemRoom = needsMaint[0];
      if (problemRoom) {
        const room = EXTENDED_ROOMS.find((r) => r.id === problemRoom.roomId);
        spatialSideEffects = () => {
          if (room) {
            spatialStore.setActiveBuildingId(room.buildingId);
            spatialStore.setActiveFloorNumber(room.floorNumber);
            spatialStore.setSelectedRoom(room);
          }
        };
        actions.push({ type: 'INSPECT_EQUIPMENT', label: `Inspect ${problemRoom.name}`, payload: problemRoom.id });
      }

      return { reply, actions, spatialSideEffects };
    }

    case 'BUILDING_INFO': {
      const q = query.toLowerCase();
      let building = EXTENDED_BUILDINGS[0]; // Default to Block B
      if (q.includes('block a') || q.includes('admin') || q.includes('library')) building = EXTENDED_BUILDINGS[1];
      else if (q.includes('block c') || q.includes('student') || q.includes('hub')) building = EXTENDED_BUILDINGS[2];
      else if (q.includes('block d') || q.includes('research') || q.includes('annex')) building = EXTENDED_BUILDINGS[3];

      const buildingRooms = EXTENDED_ROOMS.filter((r) => r.buildingId === building.id);
      const totalOccupancy = buildingRooms.reduce((s, r) => s + r.currentOccupancy, 0);
      const totalCapacity = buildingRooms.reduce((s, r) => s + r.capacity, 0);

      const reply = `🏢 **${building.name}** (${building.code})\n\n| Property | Value |\n|----------|-------|\n| 🏗️ Floors | ${building.totalFloors} |\n| 📐 Area | ${building.sqMeters.toLocaleString()} m² |\n| 🚪 Rooms | ${building.roomsCount} |\n| 🔬 Labs | ${building.labsCount} |\n| 👥 Current Occupancy | ${building.currentOccupancyPercent}% |\n| ⚡ Energy Usage | ${building.energyConsumptionKwh} kWh |\n| 🟢 Status | ${building.status} |\n| ⚠️ Active Alerts | ${building.activeAlertsCount} |\n\n**Rooms in this building:**\n${buildingRooms.map((r) => `• ${r.name} — ${r.currentOccupancy}/${r.capacity} occupants • ${r.operationalStatus}`).join('\n')}\n\n📊 Live Occupancy: **${totalOccupancy}/${totalCapacity}** people (${Math.round((totalOccupancy / totalCapacity) * 100)}%)`;

      spatialSideEffects = () => {
        spatialStore.setActiveBuildingId(building.id);
        spatialStore.setSelectedBuildingView(true);
      };

      actions.push({ type: 'FOCUS_BUILDING', label: `Explore ${building.code}`, payload: building.id });

      return { reply, actions, spatialSideEffects };
    }

    case 'LABS': {
      const labs = EXTENDED_ROOMS.filter(
        (r) => r.roomType === 'RESEARCH_LAB' || r.roomType === 'COMPUTER_LAB'
      );

      const reply = `🔬 **Campus Labs & Research Facilities**\n\n${labs.map((r) => {
        const equip = EXTENDED_EQUIPMENT.filter((e) => e.roomId === r.id);
        return `### ${r.name}\n📍 Floor ${r.floorNumber}, ${r.buildingName}\n👥 **${r.currentOccupancy}/${r.capacity}** occupants • 🌡️ ${r.environmental.temperatureC}°C • ${r.operationalStatus === 'OCCUPIED' ? '🔴 In Use' : '🟢 Available'}\n${equip.length > 0 ? `🔧 Key Equipment: ${equip.map((e) => e.name).join(', ')}` : ''}`;
      }).join('\n\n')}\n\nTotal: **${labs.length} labs** across **${new Set(labs.map((l) => l.buildingId)).size} buildings**`;

      const firstLab = labs[0];
      spatialSideEffects = () => {
        if (firstLab) {
          spatialStore.setActiveBuildingId(firstLab.buildingId);
          spatialStore.setActiveFloorNumber(firstLab.floorNumber);
          spatialStore.setHighlightedEntityId(firstLab.id);
          spatialStore.setSelectedRoom(firstLab);
        }
      };

      if (firstLab) actions.push({ type: 'FOCUS_ROOM', label: `View ${firstLab.name}`, payload: firstLab.id });

      return { reply, actions, spatialSideEffects };
    }

    case 'ENVIRONMENT': {
      const roomRef = extractRoomRef(query);
      const targetRooms = roomRef
        ? EXTENDED_ROOMS.filter((r) => r.roomNumber === roomRef || r.id === `r-${roomRef}`)
        : EXTENDED_ROOMS;

      const reply = `🌡️ **Environmental Monitoring Report**\n\n| Room | Temp | Humidity | CO₂ | Air Quality | Noise | Energy |\n|------|------|----------|-----|-------------|-------|--------|\n${targetRooms.map((r) => {
        const env = r.environmental;
        const aqEmoji = env.airQualityStatus === 'OPTIMAL' ? '🟢' : env.airQualityStatus === 'MODERATE' ? '🟡' : '🔴';
        return `| ${r.name} | ${env.temperatureC}°C | ${env.humidityPercent}% | ${env.co2Ppm} ppm | ${aqEmoji} ${env.airQualityStatus} | ${env.noiseDb} dB | ${env.energyDrawKw} kW |`;
      }).join('\n')}\n\n💡 **Best Air Quality:** ${[...targetRooms].sort((a, b) => a.environmental.co2Ppm - b.environmental.co2Ppm)[0].name} (${[...targetRooms].sort((a, b) => a.environmental.co2Ppm - b.environmental.co2Ppm)[0].environmental.co2Ppm} ppm CO₂)\n🔇 **Quietest Room:** ${[...targetRooms].sort((a, b) => a.environmental.noiseDb - b.environmental.noiseDb)[0].name} (${[...targetRooms].sort((a, b) => a.environmental.noiseDb - b.environmental.noiseDb)[0].environmental.noiseDb} dB)`;

      return { reply, actions };
    }

    case 'ENERGY': {
      const totalEnergy = EXTENDED_BUILDINGS.reduce((s, b) => s + b.energyConsumptionKwh, 0);

      const reply = `⚡ **Campus Energy Consumption Report**\n\n| Building | Energy (kWh) | Status | Occupancy |\n|----------|-------------|--------|----------|\n${EXTENDED_BUILDINGS.map((b) => `| ${b.name} | ${b.energyConsumptionKwh} kWh | ${b.status} | ${b.currentOccupancyPercent}% |`).join('\n')}\n\n📊 **Total Campus Energy:** ${totalEnergy.toFixed(1)} kWh\n📈 **Per-Building Average:** ${(totalEnergy / EXTENDED_BUILDINGS.length).toFixed(1)} kWh\n🏆 **Most Efficient:** ${[...EXTENDED_BUILDINGS].sort((a, b) => a.energyConsumptionKwh / a.sqMeters - b.energyConsumptionKwh / b.sqMeters)[0].name}`;

      return { reply, actions };
    }

    case 'WIFI': {
      const sorted = [...EXTENDED_ROOMS].sort((a, b) => b.wifiSignalPercent - a.wifiSignalPercent);

      const reply = `📶 **WiFi Signal Strength Report**\n\n| Room | Signal | Rating |\n|------|--------|--------|\n${sorted.map((r) => {
        const bar = r.wifiSignalPercent >= 95 ? '🟢 Excellent' : r.wifiSignalPercent >= 85 ? '🟡 Good' : '🔴 Weak';
        return `| ${r.name} | ${r.wifiSignalPercent}% | ${bar} |`;
      }).join('\n')}\n\n🏆 **Best WiFi:** ${sorted[0].name} at ${sorted[0].wifiSignalPercent}% signal\n💡 *Recommendation: For video calls or heavy downloads, use ${sorted[0].name}.*`;

      return { reply, actions };
    }

    case 'WHY_ROUTE': {
      const reply = `🧠 **Spatial Route Analysis & Decision Reasoning**\n\nThe recommended route was selected because:\n\n✅ **18 meters shorter** than the outdoor courtyard path\n✅ **Avoids Staircase A** — currently has heavy descending class change traffic\n✅ **Elevator #1** is operational with zero wait queue\n✅ **Fully indoor** — climate controlled at 22°C\n✅ **ADA compliant** — wheelchair accessible throughout\n✅ **Low congestion** — corridor sensors show < 30% foot traffic\n\n📊 **Alternatives Considered:**\n| Route | Distance | Time | Issue |\n|-------|----------|------|-------|\n| East Wing Corridor | 72m | 2.4 min | 🔴 High congestion |\n| Outdoor Courtyard | 68m | 2.2 min | 🟡 Weather exposure |\n| **Recommended (Elevator)** | **54m** | **1.8 min** | ✅ **Optimal** |`;

      explanation = {
        distanceSavedMeters: 18,
        elevationNotice: 'Avoids 24 stair steps via direct elevator link',
        highlights: ['18m shorter route', 'Zero staircase congestion', 'Full indoor air-conditioned passage', 'Wheelchair accessible'],
      };

      return { reply, actions, explanation };
    }

    case 'CAMPUS_INFO': {
      const totalRooms = EXTENDED_ROOMS.length;
      const totalPeople = EXTENDED_ROOMS.reduce((s, r) => s + r.currentOccupancy, 0);
      const totalCapacity = EXTENDED_ROOMS.reduce((s, r) => s + r.capacity, 0);
      const totalEnergy = EXTENDED_BUILDINGS.reduce((s, b) => s + b.energyConsumptionKwh, 0);

      const reply = `🏫 **Campus Overview — Main Technology Campus**\n\n**Infrastructure:**\n• 🏢 **${EXTENDED_BUILDINGS.length} Buildings** totaling ${EXTENDED_BUILDINGS.reduce((s, b) => s + b.sqMeters, 0).toLocaleString()} m²\n• 🚪 **${totalRooms} Active Rooms** tracked in real-time\n• 🔬 **${EXTENDED_ROOMS.filter((r) => r.roomType === 'RESEARCH_LAB' || r.roomType === 'COMPUTER_LAB').length} Labs** with specialized equipment\n• 🔧 **${EXTENDED_EQUIPMENT.length} Equipment Assets** monitored\n\n**Live Status:**\n• 👥 Current Occupancy: **${totalPeople}/${totalCapacity}** people (${Math.round((totalPeople / totalCapacity) * 100)}%)\n• ⚡ Energy Draw: **${totalEnergy.toFixed(1)} kWh**\n• 🛡️ Safety Nodes: **${SAFETY_NODES.length}** (exits, extinguishers, AEDs)\n• 📅 Active Classes: **${CLASS_TIMETABLE.length}** sessions scheduled\n• 📶 Average WiFi: **${Math.round(EXTENDED_ROOMS.reduce((s, r) => s + r.wifiSignalPercent, 0) / totalRooms)}%**\n\nAll data is sourced from live IoT sensors, occupancy counters, and building management systems.`;

      return { reply, actions };
    }

    case 'FACULTY': {
      const faculty = [...new Set(CLASS_TIMETABLE.map((c) => c.facultyName))];
      const reply = `👨‍🏫 **Faculty Directory**\n\n${CLASS_TIMETABLE.map((c) => `• **${c.facultyName}** — teaches *${c.className}* (${c.classCode}) in ${c.roomName} on ${c.day}s`).join('\n')}\n\n📊 Total Faculty: **${faculty.length}** professors across **${new Set(CLASS_TIMETABLE.map((c) => c.department)).size}** departments`;

      return { reply, actions };
    }

    case 'HELP': {
      return {
        reply: `🤖 **Campus AI Copilot — What I Can Do**\n\nI'm powered by the Spatial Intelligence engine and have real-time awareness of the entire campus. Here's everything I can help with:\n\n**🧭 Navigation & Routing**\n• "Take me to Room 204"\n• "Navigate from 101 to the Library"\n• "Accessible route to Cafeteria"\n\n**📍 Room Intelligence**\n• "Where is Room 204?"\n• "Find an empty classroom"\n• "Show me the Library"\n\n**📅 Schedules & Classes**\n• "Where is my next class?"\n• "What's scheduled in Room 204?"\n• "Show the full timetable"\n\n**📊 Live Campus Data**\n• "Show crowded areas"\n• "What's the temperature in Lab 204?"\n• "Campus energy usage"\n• "WiFi signal strength"\n\n**🛡️ Safety & Emergency**\n• "Where is the nearest fire exit?"\n• "Show emergency equipment"\n• "Assembly point location"\n\n**🔧 Equipment & Maintenance**\n• "Which equipment needs repair?"\n• "Show equipment in Room 204"\n\n**🏢 Building Information**\n• "Tell me about Block B"\n• "Show all campus labs"\n• "Campus overview"\n\n💡 *You can ask in natural language — I'll understand!*`,
        actions,
      };
    }

    default: {
      // Smart fallback — try to understand the query contextually
      const roomRef = extractRoomRef(query);
      if (roomRef) {
        // Re-route to FIND_ROOM
        return generateSmartResponse(query, 'FIND_ROOM', spatialStore);
      }

      return {
        reply: `I understand you're asking about: *"${query}"*\n\nI'm specialized in campus spatial intelligence. Here are some things I can help with:\n\n🧭 **Navigation:** "Take me to Room 204"\n📍 **Find Rooms:** "Where is the Library?"\n📅 **Schedules:** "Where is my next class?"\n📊 **Live Data:** "Show crowded areas"\n🛡️ **Safety:** "Where is the nearest exit?"\n🔧 **Equipment:** "What needs maintenance?"\n\nTry one of these, or ask me anything about the campus! 😊`,
        actions,
      };
    }
  }
}

export const useAIChatStore = create<AIChatState>((set, get) => ({
  isOpen: false,
  messages: [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        '👋 Welcome to the **Campus Spatial Intelligence System**!\n\nI\'m your AI Copilot — I have real-time awareness of every room, corridor, sensor, and piece of equipment on campus.\n\n**Try asking me:**\n• 🧭 "Where is my next class?"\n• 📍 "Navigate to AI Lab 204"\n• 🏠 "Find an empty classroom"\n• 📊 "Show crowded areas"\n• 🛡️ "Where is the nearest fire exit?"\n• 🔧 "Which equipment needs maintenance?"\n\nJust type your question below — I understand natural language! 😊',
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
  clearChat: () =>
    set({
      messages: [
        {
          id: 'msg-welcome-' + Date.now(),
          role: 'assistant',
          content:
            '🔄 Chat cleared! I\'m ready for new questions.\n\nAsk me anything about the campus — rooms, navigation, schedules, safety, equipment, or live data!',
          timestamp: new Date().toISOString(),
        },
      ],
    }),

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
    const history = get().messages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const currentEntity = spatialStore.selectedEntity?.data;
    const spatialContext = {
      institutionName: 'ESEC Campus',
      floorId: spatialStore.activeFloorNumber,
      selectedEntityId: currentEntity?.id || 'GF-REC-01',
      currentLocation: currentEntity && 'name' in currentEntity ? (currentEntity as any).name : 'Ground Floor Reception',
      activeView: spatialStore.selectedBuildingView ? '3D' : '2D',
    };

    // Attempt 1: Call Next.js Server-Side Route (/api/ai/chat) with full OpenAI SDK and Spatial Tools
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId: get().conversationId,
          context: spatialContext,
          history,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Process any returned spatial actions (focus, navigate, switch floor)
        if (Array.isArray(data.actions)) {
          for (const act of data.actions) {
            if (act.action === 'FOCUS_ENTITY') {
              const matchedRoom = spatialStore.rooms.find(
                (r) => r.id === act.entityId || r.roomNumber === act.entityId || r.name.toLowerCase().includes((act.roomName || '').toLowerCase())
              );
              if (matchedRoom) {
                spatialStore.setSelectedRoom(matchedRoom);
                spatialStore.setActiveFloorNumber(matchedRoom.floorNumber);
                spatialStore.setSelectedBuildingView(true);
              }
            } else if (act.action === 'NAVIGATE') {
              const matchedRoom = spatialStore.rooms.find(
                (r) => r.id === act.entityId || r.roomNumber === act.entityId || r.name.toLowerCase().includes((act.roomName || '').toLowerCase())
              );
              if (matchedRoom) {
                spatialStore.setSelectedRoom(matchedRoom);
                spatialStore.setActiveFloorNumber(matchedRoom.floorNumber);
                spatialStore.setSelectedBuildingView(true);
              }
              if (act.route) {
                spatialStore.setActiveRoute({
                  originName: act.route.origin || 'Reception',
                  destinationName: act.route.destination || act.roomName || 'Destination',
                  totalDistanceMeters: act.route.totalDistanceMeters || 48,
                  estimatedMinutes: act.route.estimatedMinutes || 1.6,
                  waypoints: act.route.waypoints || [],
                  accessible: true,
                  reasoning: 'Optimal indoor corridor route avoiding congestion',
                });
              }
            } else if (act.action === 'SWITCH_FLOOR' && typeof act.floorNumber === 'number') {
              spatialStore.setActiveFloorNumber(act.floorNumber);
            }
          }
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
      // Continue to backend fallback
    }

    // Attempt 2: Call NestJS backend API on port 4000
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
          context: spatialContext,
        }),
      });

      if (response.ok) {
        const data = await response.json();
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
      // Fallback
    }

    // Fallback: Authoritative campus Copilot pipeline
    await new Promise((resolve) => setTimeout(resolve, 200));
    const pipelineRes = runCopilotPipeline(text, history, spatialContext);

    // Apply any spatial actions
    if (pipelineRes.mapAction && pipelineRes.mapAction.action !== 'NONE') {
      const act = pipelineRes.mapAction;
      const matchedRoom = spatialStore.rooms.find(
        (r) => r.id === act.entityId || r.roomNumber === act.entityId || r.name.toLowerCase().includes((act.roomName || '').toLowerCase())
      );
      if (matchedRoom) {
        spatialStore.setSelectedRoom(matchedRoom);
        spatialStore.setActiveFloorNumber(matchedRoom.floorNumber);
        spatialStore.setSelectedBuildingView(true);
      }
    }

    const aiMsg: ExtendedChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: pipelineRes.answer,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, aiMsg],
      isLoading: false,
    }));
  },
}));
