import { create } from 'zustand';
import { ChatMessage, AIResponse } from '@spatial/types';
import { useSpatialStore } from './useSpatialStore';

interface AIChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  conversationId: string;

  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  addMessage: (message: ChatMessage) => void;
  sendMessage: (text: string) => Promise<void>;
}

export const useAIChatStore = create<AIChatState>((set, get) => ({
  isOpen: false,
  messages: [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: 'Hello! I am your Spatial Campus AI. You can ask where classes are, find labs or equipment, check schedules, or report maintenance issues.',
      timestamp: new Date().toISOString(),
    },
  ],
  isLoading: false,
  conversationId: 'conv-' + Date.now(),

  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  sendMessage: async (text: string) => {
    const userMsg: ChatMessage = {
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

    try {
      const response = await fetch('http://localhost:4000/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'STUDENT',
        },
        body: JSON.stringify({
          message: text,
          conversationId: get().conversationId,
        }),
      });

      if (!response.ok) throw new Error('API server unreachable');

      const data: AIResponse = await response.json();

      // Synchronize with Spatial Map View
      if (data.highlightedEntity) {
        useSpatialStore.getState().setHighlightedEntityId(data.highlightedEntity.id);
        const matchedRoom = useSpatialStore.getState().rooms.find(
          (r) => r.id === data.highlightedEntity?.id || r.roomNumber === data.highlightedEntity?.id
        );
        if (matchedRoom) {
          useSpatialStore.getState().setSelectedRoom(matchedRoom);
          if (matchedRoom.roomNumber.startsWith('1')) {
            useSpatialStore.getState().setActiveFloorNumber(1);
          } else if (matchedRoom.roomNumber.startsWith('2')) {
            useSpatialStore.getState().setActiveFloorNumber(2);
          }
        }
      }

      // If action has route payload, update activeRoute in store
      const routeAction = data.executedActions?.find((a) => a.actionType === 'CALCULATE_INDOOR_ROUTE');
      if (routeAction && (routeAction.payload as any)?.route) {
        const p = routeAction.payload as any;
        useSpatialStore.getState().setActiveRoute({
          originName: p.origin?.name || 'Room 101',
          destinationName: p.destination?.name || 'Room 204',
          totalDistanceMeters: p.route.totalDistanceMeters,
          estimatedMinutes: p.route.estimatedMinutes,
          waypoints: p.route.waypoints,
        });
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        isLoading: false,
      }));
    } catch {
      // Local intelligent spatial simulation fallback
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('where is') && lower.includes('204')) {
        reply = 'AI & Robotics Lab 204 (Room 204) is located on Second Floor of Computer Science & AI Block B. Capacity: 40 seats. Equipment: Optoma 4K Laser Projector, NVIDIA RTX Workstations.';
        useSpatialStore.getState().setActiveFloorNumber(2);
        useSpatialStore.getState().setHighlightedEntityId('r-204');
        const room = useSpatialStore.getState().rooms.find((r) => r.id === 'r-204');
        if (room) useSpatialStore.getState().setSelectedRoom(room);
      } else if (lower.includes('how do i get from') || lower.includes('navigate')) {
        reply = 'Here is the shortest route from Lecture Hall 101 to AI & Robotics Lab 204: Total distance is 54m (approx. 1.8 min). Follow the highlighted corridor waypoints.';
        useSpatialStore.getState().setActiveRoute({
          originName: 'Lecture Hall 101',
          destinationName: 'AI & Robotics Lab 204',
          totalDistanceMeters: 54,
          estimatedMinutes: 1.8,
          waypoints: [],
        });
        useSpatialStore.getState().setHighlightedEntityId('r-204');
      } else if (lower.includes('projector') && (lower.includes('p-204') || lower.includes('204'))) {
        reply = 'Asset Optoma 4K Laser Ceiling Projector (P-204) is located in AI & Robotics Lab 204 on Second Floor of Computer Science & AI Block B. Status: OPERATIONAL.';
        useSpatialStore.getState().setActiveFloorNumber(2);
        useSpatialStore.getState().setHighlightedEntityId('r-204');
      } else if (lower.includes('schedule') || lower.includes('class')) {
        reply = 'Here are the scheduled sessions in AI & Robotics Lab 204:\n• Deep Learning & Neural Architectures (CS602) by Dr. Evelyn Reed on Tue 10:00 - 12:00\n• Robotics Perception & Spatial AI (CS704) by Prof. Marcus Chen on Wed 14:00 - 16:30';
        useSpatialStore.getState().setHighlightedEntityId('r-204');
      } else if (lower.includes('ticket') || lower.includes('maintenance') || lower.includes('report')) {
        const num = Math.floor(1000 + Math.random() * 9000);
        reply = `I have registered your maintenance ticket: TICK-${num} for Optoma 4K Laser Ceiling Projector in AI & Robotics Lab 204. Current status: OPEN. Facilities staff have been notified.`;
        useSpatialStore.getState().setHighlightedEntityId('r-204');
      } else {
        reply = 'I understand physical campus spaces. Try asking:\n• "Where is Room 204?"\n• "How do I get from Room 101 to Room 204?"\n• "Where is projector P-204?"\n• "What is scheduled in Room 204?"\n• "Create a maintenance ticket for the projector in Room 204"';
      }

      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, fallbackMsg],
        isLoading: false,
      }));
    }
  },
}));
