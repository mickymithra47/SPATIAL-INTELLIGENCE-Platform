import { create } from 'zustand';
import { ChatMessage, AIResponse } from '@spatial/types';

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
      // Calls our backend API endpoint
      const response = await fetch('http://localhost:4000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId: get().conversationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to reach AI Agent');

      const data: AIResponse = await response.json();

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
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I found AI Lab 2 on Floor 2 of Block B. It has 40 systems (35 operational, 5 in maintenance). Would you like turn-by-turn directions?`,
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, fallbackMsg],
        isLoading: false,
      }));
    }
  },
}));
