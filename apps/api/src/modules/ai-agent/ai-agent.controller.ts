import { Controller, Post, Body, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { AgentService } from './services/agent.service.js';
import { ToolExecutorService, ToolName } from './services/tool-executor.service.js';
import { AIResponse } from '@spatial/types';

export class ChatMessageDto {
  message: string;
  conversationId?: string;
  campusId?: string;
  currentRoomId?: string;
}

export class ExecuteToolDto {
  toolName: ToolName;
  arguments: Record<string, unknown>;
}

@Controller('api/v1/ai')
export class AIAgentController {
  constructor(
    private agentService: AgentService,
    private toolExecutor: ToolExecutorService
  ) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async handleChat(
    @Body() dto: ChatMessageDto,
    @Headers('x-user-role') roleHeader?: string
  ): Promise<AIResponse> {
    const userRole = roleHeader || 'STUDENT';
    return this.agentService.processMessage(dto.message, dto.conversationId, userRole);
  }

  @Post('tool')
  @HttpCode(HttpStatus.OK)
  async handleTool(
    @Body() dto: ExecuteToolDto,
    @Headers('x-user-role') roleHeader?: string
  ) {
    const userRole = roleHeader || 'STUDENT';
    return this.toolExecutor.executeTool(dto.toolName, dto.arguments, userRole);
  }
}

@Controller('api')
export class APIChatAliasController {
  constructor(private agentService: AgentService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async handleChat(
    @Body() dto: ChatMessageDto,
    @Headers('x-user-role') roleHeader?: string
  ): Promise<AIResponse> {
    const userRole = roleHeader || 'STUDENT';
    return this.agentService.processMessage(dto.message, dto.conversationId, userRole);
  }
}

