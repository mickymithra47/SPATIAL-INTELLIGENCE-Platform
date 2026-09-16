import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AIResponse } from '@spatial/types';

export class ChatMessageDto {
  message: string;
  conversationId?: string;
  campusId?: string;
  currentRoomId?: string;
}

@Controller('api/v1/ai')
export class AIAgentController {
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async handleChat(@Body() dto: ChatMessageDto): Promise<AIResponse> {
    // Grounded AI Agent Execution Pipeline:
    // 1. Intent Detection
    // 2. Controlled Tool Execution (Spatial Graph / Timetable / Maintenance)
    // 3. Structured Response Formulation
    
    return {
      reply: `I have identified AI Lab 2 in Block B on the second floor. It is currently operational.`,
      conversationId: dto.conversationId || 'conv-sample-101',
      highlightedEntity: {
        type: 'ROOM',
        id: 'r-sample-ai-lab-2',
      },
      executedActions: [
        {
          actionType: 'RESOLVE_SPATIAL_ENTITY',
          summary: 'Located AI Lab 2 in Engineering Block B, Floor 2',
          payload: { roomId: 'r-sample-ai-lab-2', building: 'Block B', floor: 2 },
        },
      ],
    };
  }
}
