import { Module } from '@nestjs/common';
import { SpatialController } from './modules/spatial/spatial.controller.js';
import { AIAgentController } from './modules/ai-agent/ai-agent.controller.js';
import { MaintenanceController } from './modules/operations/maintenance.controller.js';

@Module({
  imports: [],
  controllers: [SpatialController, AIAgentController, MaintenanceController],
  providers: [],
})
export class AppModule {}
