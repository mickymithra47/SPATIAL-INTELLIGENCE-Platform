export interface SpatialContextDto {
  institutionId?: string;
  institutionName?: string;
  floorId?: string | number;
  buildingId?: string;
  selectedEntityId?: string;
  currentLocation?: string;
  activeView?: '2D' | '2.5D' | '3D';
  avoidBlocked?: boolean;
}

export interface ChatMessageRequestDto {
  message: string;
  conversationId?: string;
  context?: SpatialContextDto;
}

export interface SpatialUIAction {
  action: 'FOCUS_ENTITY' | 'NAVIGATE' | 'SWITCH_FLOOR' | 'SHOW_ROUTE';
  entityId?: string;
  floorNumber?: number;
  floorId?: string;
  roomName?: string;
  routePayload?: any;
}

export interface LiveAIChatResponse {
  conversationId: string;
  reply: string;
  model: string;
  actions: SpatialUIAction[];
  toolCallsMade: string[];
  isSimulatedFallback?: boolean;
}
