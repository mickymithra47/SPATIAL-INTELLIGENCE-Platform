import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { SpatialDataService } from '../../common/data/spatial-data.service.js';
import { Campus, Building, Floor, Room } from '@spatial/types';

@Controller('api/v1/spatial')
export class SpatialController {
  constructor(private spatialData: SpatialDataService) {}

  @Get('campuses')
  async getCampuses(): Promise<Campus[]> {
    return this.spatialData.getCampuses();
  }

  @Get('campuses/:campusId/buildings')
  async getBuildings(@Param('campusId') campusId: string): Promise<Building[]> {
    return this.spatialData.getBuildings(campusId);
  }

  @Get('buildings/:buildingId/floors')
  async getFloors(@Param('buildingId') buildingId: string): Promise<Floor[]> {
    return this.spatialData.getFloors(buildingId);
  }

  @Get('floors/:floorId/rooms')
  async getRooms(@Param('floorId') floorId: string): Promise<Room[]> {
    return this.spatialData.getRooms(floorId);
  }

  @Get('rooms/search')
  async searchRooms(@Query('q') query: string) {
    if (!query) return [];
    const room = this.spatialData.findRoom(query);
    if (!room) return [];
    return [this.spatialData.getRoomDetails(room.id)];
  }

  @Get('rooms/:id')
  async getRoom(@Param('id') id: string) {
    const details = this.spatialData.getRoomDetails(id);
    if (!details) throw new NotFoundException(`Room '${id}' not found`);
    return details;
  }

  @Get('navigation/route')
  async getRoute(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('accessible') accessible?: string
  ) {
    const isAccessible = accessible === 'true' || accessible === '1';
    return this.spatialData.calculateIndoorRoute(origin, destination, isAccessible);
  }

  @Get('assets/search')
  async searchAssets(@Query('q') query: string) {
    if (!query) return null;
    return this.spatialData.findAsset(query);
  }

  @Get('rooms/:id/schedule')
  async getRoomSchedule(@Param('id') id: string) {
    return this.spatialData.getRoomSchedule(id);
  }
}
