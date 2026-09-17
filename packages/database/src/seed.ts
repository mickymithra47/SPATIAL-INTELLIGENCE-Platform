import { PrismaClient } from '@prisma/client';
import { SEED_DATA } from './seed-data.js';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('Seeding database with realistic campus data...');

  // Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: SEED_DATA.organization.slug },
    update: {},
    create: SEED_DATA.organization,
  });

  // Create Campus
  for (const c of SEED_DATA.campuses) {
    await prisma.campus.upsert({
      where: {
        organizationId_code: {
          organizationId: org.id,
          code: c.code,
        },
      },
      update: {},
      create: c,
    });
  }

  // Create Buildings
  for (const b of SEED_DATA.buildings) {
    await prisma.building.upsert({
      where: {
        campusId_code: {
          campusId: b.campusId,
          code: b.code,
        },
      },
      update: {},
      create: b,
    });
  }

  // Create Floors
  for (const fl of SEED_DATA.floors) {
    await prisma.floor.upsert({
      where: {
        buildingId_floorNumber: {
          buildingId: fl.buildingId,
          floorNumber: fl.floorNumber,
        },
      },
      update: {},
      create: fl,
    });
  }

  // Create Rooms
  for (const r of SEED_DATA.rooms) {
    const { department, latitude, longitude, ...roomData } = r;
    await prisma.room.upsert({
      where: {
        floorId_roomNumber: {
          floorId: r.floorId,
          roomNumber: r.roomNumber,
        },
      },
      update: {},
      create: roomData,
    });
  }

  // Create Equipment
  for (const ast of SEED_DATA.assets) {
    await prisma.equipment.upsert({
      where: { assetTag: ast.assetTag },
      update: {},
      create: {
        id: ast.id,
        roomId: ast.roomId,
        assetTag: ast.assetTag,
        name: ast.name,
        category: ast.category,
        modelNumber: ast.modelNumber,
        status: ast.status,
        specifications: ast.specifications,
        lastServicedAt: ast.lastServicedAt ? new Date(ast.lastServicedAt) : null,
      },
    });
  }

  console.log('✓ Database seeded successfully!');
}

if (process.argv[1] && process.argv[1].includes('seed.ts')) {
  seedDatabase()
    .catch((err) => {
      console.warn('Note: Seed skipped or deferred if database connection is offline:', err.message);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
