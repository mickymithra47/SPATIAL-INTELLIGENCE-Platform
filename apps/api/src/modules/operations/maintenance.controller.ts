import { Controller, Get, Post, Patch, Body, Param, NotFoundException } from '@nestjs/common';
import { SpatialDataService } from '../../common/data/spatial-data.service.js';

export class CreateTicketDto {
  room: string;
  asset?: string;
  issue: string;
  priority?: string;
}

@Controller('api/v1/maintenance')
export class MaintenanceController {
  constructor(private spatialData: SpatialDataService) {}

  @Get('tickets')
  async getTickets() {
    return this.spatialData.getTickets();
  }

  @Post('tickets')
  async createTicket(@Body() dto: CreateTicketDto) {
    return this.spatialData.createTicket({
      roomQuery: dto.room,
      assetQuery: dto.asset,
      issueSummary: dto.issue,
      priority: dto.priority,
    });
  }

  @Patch('tickets/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    const updated = this.spatialData.updateTicketStatus(id, status);
    if (!updated) throw new NotFoundException(`Ticket '${id}' not found`);
    return updated;
  }
}
