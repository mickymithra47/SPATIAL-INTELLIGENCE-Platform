import { Module } from '@nestjs/common';
import { SpatialController } from './modules/spatial/spatial.controller.js';
import { AIAgentController, APIChatAliasController, DedicatedAIAgentController } from './modules/ai-agent/ai-agent.controller.js';
import { MaintenanceController } from './modules/operations/maintenance.controller.js';
import { SpatialDataService } from './common/data/spatial-data.service.js';
import { ToolExecutorService } from './modules/ai-agent/services/tool-executor.service.js';
import { AgentService } from './modules/ai-agent/services/agent.service.js';
import { LiveAIAgentService } from './modules/ai-agent/ai-agent.service.js';

@Module({
  imports: [],
  controllers: [
    SpatialController,
    AIAgentController,
    APIChatAliasController,
    DedicatedAIAgentController,
    MaintenanceController,
  ],
  providers: [SpatialDataService, ToolExecutorService, AgentService, LiveAIAgentService],
  exports: [SpatialDataService, ToolExecutorService, AgentService, LiveAIAgentService],
})
export class AppModule {}
