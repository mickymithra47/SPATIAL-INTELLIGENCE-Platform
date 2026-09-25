export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

export interface AIResponse {
  reply: string;
  conversationId: string;
  executedActions?: {
    actionType: string;
    summary: string;
    payload: Record<string, unknown>;
  }[];
  highlightedEntity?: {
    type: 'ROOM' | 'BUILDING' | 'ASSET' | 'ROUTE' | 'SIMULATION' | 'GEOSPATIAL_BUFFER';
    id: string;
  };
}
