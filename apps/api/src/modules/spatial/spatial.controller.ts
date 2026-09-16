import { Controller, Get, Param, Query } from '@nestjs/common';
import { Campus, Building, Floor, Room } from '@spatial/types';

@Controller('api/v1/spatial')
export class SpatialController {
  @Get('campuses')
  async getCampuses(): Promise<Campus[]> {
    return [
      {
        id: 'c-main-001',
        organizationId: 'org-nit-001',
        name: 'Main Technology Campus',
        code: 'MAIN',
        centerCoordinates: { latitude: 12.9716, longitude: 77.5946 },
      },
    ];
  }

  @Get('campuses/:campusId/buildings')
  async getBuildings(@Param('campusId') campusId: string): Promise<Building[]> {
    return [
      {
        id: 'b-block-b-001',
        campusId,
        name: 'Computer Science & AI Block B',
        code: 'BLOCK_B',
        totalFloors: 4,
      },
      {
        id: 'b-block-a-002',
        campusId,
        name: 'Administration & Central Library',
        code: 'BLOCK_A',
        totalFloors: 3,
      },
    ];
  }

  @Get('buildings/:buildingId/floors')
  async getFloors(@Param('buildingId') buildingId: string): Promise<Floor[]> {
    return [
      {
        id: 'fl-b-01',
        buildingId,
        floorNumber: 1,
        name: 'Ground Floor',
        elevationMeters: 0,
      },
      {
        id: 'fl-b-02',
        buildingId,
        floorNumber: 2,
        name: 'Second Floor',
        elevationMeters: 4.5,
      },
    ];
  }

  @Get('floors/:floorId/rooms')
  async getRooms(@Param('floorId') floorId: string): Promise<Room[]> {
    return [
      {
        id: 'r-sample-ai-lab-2',
        floorId,
        roomNumber: 'B-204',
        name: 'AI & Robotics Lab 2',
        roomType: 'RESEARCH_LAB',
        capacity: 45,
        isAccessible: true,
      },
      {
        id: 'r-sample-classroom-201',
        floorId,
        roomNumber: 'B-201',
        name: 'Seminar Hall 201',
        roomType: 'CLASSROOM',
        capacity: 90,
        isAccessible: true,
      },
    ];
  }
}
