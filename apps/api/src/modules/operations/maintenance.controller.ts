import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { MaintenanceTicket } from '@spatial/types';

export class CreateTicketDto {
  roomId: string;
  assetId?: string;
  issueSummary: string;
  details?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

@Controller('api/v1/maintenance')
export class MaintenanceController {
  @Get('tickets')
  async getTickets(): Promise<MaintenanceTicket[]> {
    return [
      {
        id: 't-1001',
        ticketNumber: 'TICK-4821',
        roomId: 'r-sample-ai-lab-2',
        assetId: 'eq-proj-01',
        reportedByUserId: 'usr-student-01',
        issueSummary: 'Projector ceiling mount HDMI signal loss',
        status: 'OPEN',
        priority: 'MEDIUM',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  @Post('tickets')
  async createTicket(@Body() dto: CreateTicketDto): Promise<MaintenanceTicket> {
    return {
      id: `t-${Date.now()}`,
      ticketNumber: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      roomId: dto.roomId,
      assetId: dto.assetId,
      reportedByUserId: 'usr-current',
      issueSummary: dto.issueSummary,
      details: dto.details,
      status: 'OPEN',
      priority: dto.priority || 'MEDIUM',
      createdAt: new Date().toISOString(),
    };
  }

  @Patch('tickets/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: MaintenanceTicket['status']
  ) {
    return { ticketId: id, status, updated: true };
  }
}
