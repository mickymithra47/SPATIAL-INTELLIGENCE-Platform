import { Controller, Post, Body, HttpCode, HttpStatus, Headers, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AgentService } from './services/agent.service.js';
import { ToolExecutorService, ToolName } from './services/tool-executor.service.js';
import { LiveAIAgentService } from './ai-agent.service.js';
import { ChatMessageRequestDto, LiveAIChatResponse } from './ai-agent.types.js';
import { AIResponse } from '@spatial/types';

export class ChatMessageDto {
  message: string;
  conversationId?: string;
  campusId?: string;
  currentRoomId?: string;
  context?: any;
}

export class ExecuteToolDto {
  toolName: ToolName;
  arguments: Record<string, unknown>;
}

@Controller('api/v1/ai')
export class AIAgentController {
  constructor(
    private liveAgentService: LiveAIAgentService,
    private agentService: AgentService,
    private toolExecutor: ToolExecutorService
  ) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async handleChat(
    @Body() dto: ChatMessageRequestDto,
    @Headers('x-user-role') roleHeader?: string
  ): Promise<LiveAIChatResponse | AIResponse> {
    const userRole = roleHeader || 'STUDENT';

    // If OpenAI is configured, process with full Live OpenAI Spatial Copilot
    if (this.liveAgentService.isConfigured()) {
      return this.liveAgentService.processChat(dto, userRole);
    }

    // Otherwise use existing AgentService
    const fallback = await this.agentService.processMessage(dto.message, dto.conversationId, userRole);
    return {
      conversationId: fallback.conversationId,
      reply: fallback.reply,
      model: this.liveAgentService.getModelName(),
      actions: fallback.highlightedEntity ? [{
        action: 'FOCUS_ENTITY',
        entityId: fallback.highlightedEntity.id,
      }] : [],
      toolCallsMade: fallback.executedActions?.map(a => a.actionType) || [],
      isSimulatedFallback: true,
    };
  }

  @Post('stream')
  async handleChatStream(
    @Body() dto: ChatMessageRequestDto,
    @Res() res: Response,
    @Headers('x-user-role') roleHeader?: string
  ) {
    const userRole = roleHeader || 'STUDENT';
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`data: ${JSON.stringify({ type: 'start', model: this.liveAgentService.getModelName() })}\n\n`);

    const result = await (this.liveAgentService.isConfigured()
      ? this.liveAgentService.processChat(dto, userRole)
      : this.agentService.processMessage(dto.message, dto.conversationId, userRole).then((f) => ({
          conversationId: f.conversationId,
          reply: f.reply,
          model: this.liveAgentService.getModelName(),
          actions: [],
          toolCallsMade: [],
          isSimulatedFallback: true,
        })));

    // Emit tokens in chunks
    const words = result.reply.split(' ');
    for (const word of words) {
      res.write(`data: ${JSON.stringify({ type: 'token', content: word + ' ' })}\n\n`);
      await new Promise((r) => setTimeout(r, 15));
    }

    // Emit actions and completion
    if ('actions' in result && result.actions && result.actions.length > 0) {
      for (const act of result.actions) {
        res.write(`data: ${JSON.stringify({ type: 'action', action: act })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done', fullResponse: result })}\n\n`);
    res.end();
  }

  @Post('message')
  @HttpCode(HttpStatus.OK)
  async handleMessage(
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

@Controller('ai-agent')
export class DedicatedAIAgentController {
  constructor(private liveAgentService: LiveAIAgentService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async handleChat(
    @Body() dto: ChatMessageRequestDto,
    @Headers('x-user-role') roleHeader?: string
  ): Promise<LiveAIChatResponse> {
    const userRole = roleHeader || 'STUDENT';
    return this.liveAgentService.processChat(dto, userRole);
  }
}

@Controller('api')
export class APIChatAliasController {
  constructor(private liveAgentService: LiveAIAgentService, private agentService: AgentService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async handleChat(
    @Body() dto: ChatMessageRequestDto,
    @Headers('x-user-role') roleHeader?: string
  ): Promise<any> {
    const userRole = roleHeader || 'STUDENT';
    if (this.liveAgentService.isConfigured()) {
      return this.liveAgentService.processChat(dto, userRole);
    }
    return this.agentService.processMessage(dto.message, dto.conversationId, userRole);
  }
}
