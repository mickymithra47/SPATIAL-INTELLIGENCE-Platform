import { SpatialDataService } from './common/data/spatial-data.service.js';
import { ToolExecutorService } from './modules/ai-agent/services/tool-executor.service.js';
import { AgentService } from './modules/ai-agent/services/agent.service.js';

export async function runV1AcceptanceTests() {
  console.log('====================================================');
  console.log('SPATIAL INTELLIGENCE PLATFORM: V1 ACCEPTANCE TESTS');
  console.log('====================================================\n');

  const spatialData = new SpatialDataService();
  const toolExecutor = new ToolExecutorService(spatialData);
  const agent = new AgentService(toolExecutor);

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${testName}`);
      if (detail) console.error(`   ${detail}`);
      throw new Error(`Test failed: ${testName}`);
    }
    passed++;
    console.log(`✅ PASS: ${testName}`);
    if (detail) console.log(`   ${detail}`);
  }

  // --- ACCEPTANCE TEST 1: Spatial Search ---
  console.log('TEST 1 — Spatial Search: "Where is Room 204?"');
  const res1 = await agent.processMessage('Where is Room 204?', 'conv-test-1', 'STUDENT');
  assert(
    res1.reply.includes('AI & Robotics Lab 204') && res1.reply.includes('Second Floor'),
    'TEST 1: Room 204 Location Resolution',
    `Reply: "${res1.reply.slice(0, 100)}..."`
  );
  assert(
    res1.highlightedEntity?.id === 'r-204',
    'TEST 1: Room entity highlighted',
    `Entity ID: ${res1.highlightedEntity?.id}`
  );

  // --- ACCEPTANCE TEST 2: Indoor Navigation ---
  console.log('\nTEST 2 — Indoor Navigation: "How do I get from Room 101 to Room 204?"');
  const res2 = await agent.processMessage('How do I get from Room 101 to Room 204?', 'conv-test-2', 'STUDENT');
  const routePayload = res2.executedActions?.[0]?.payload as any;
  assert(
    res2.reply.includes('shortest route') && res2.reply.includes('Lecture Hall 101'),
    'TEST 2: Indoor route calculated from Room 101 to Room 204',
    `Reply: "${res2.reply.slice(0, 100)}..."`
  );
  assert(
    routePayload?.route?.waypoints?.length > 2,
    'TEST 2: Multi-step A* waypoint sequence reconstructed',
    `Waypoints: ${routePayload?.route?.waypoints?.length}, Distance: ${routePayload?.route?.totalDistanceMeters}m`
  );

  // --- ACCEPTANCE TEST 3: Asset Intelligence ---
  console.log('\nTEST 3 — Asset Intelligence: "Where is projector P-204?"');
  const res3 = await agent.processMessage('Where is projector P-204?', 'conv-test-3', 'STUDENT');
  assert(
    res3.reply.includes('Optoma 4K Laser') && res3.reply.includes('AI & Robotics Lab 204'),
    'TEST 3: Projector P-204 located in Room 204',
    `Reply: "${res3.reply.slice(0, 100)}..."`
  );

  // --- ACCEPTANCE TEST 4: Timetable Query ---
  console.log('\nTEST 4 — Timetable Query: "What is scheduled in Room 204?"');
  const res4 = await agent.processMessage('What is scheduled in Room 204?', 'conv-test-4', 'STUDENT');
  assert(
    res4.reply.includes('Deep Learning & Neural Architectures') || res4.reply.includes('CS602'),
    'TEST 4: Class sessions resolved for Room 204',
    `Reply: "${res4.reply.slice(0, 100)}..."`
  );

  // --- ACCEPTANCE TEST 5: Maintenance Ticket Dispatch ---
  console.log('\nTEST 5 — Maintenance Incident: "Create a maintenance ticket for the projector in Room 204"');
  const res5 = await agent.processMessage('Create a maintenance ticket for the projector in Room 204', 'conv-test-5', 'STUDENT');
  assert(
    res5.reply.includes('TICK-') && res5.reply.includes('OPEN'),
    'TEST 5: Maintenance ticket created with OPEN status and ID',
    `Reply: "${res5.reply.slice(0, 100)}..."`
  );

  // --- ACCEPTANCE TEST 6: RBAC Security Guard ---
  console.log('\nTEST 6 — RBAC Validation on Privileged Tools');
  let studentBlocked = false;
  try {
    await toolExecutor.executeTool(
      'updateTicketStatus',
      { ticketId: 't-1001', status: 'RESOLVED' },
      'STUDENT'
    );
  } catch (err: any) {
    studentBlocked = err.message.includes('not authorized');
  }
  assert(studentBlocked, 'TEST 6: Student role blocked from updating ticket status');

  const staffAllowed = await toolExecutor.executeTool(
    'updateTicketStatus',
    { ticketId: 't-1001', status: 'RESOLVED' },
    'MAINTENANCE_STAFF'
  );
  assert(staffAllowed.success && staffAllowed.newStatus === 'RESOLVED', 'TEST 6: Maintenance staff allowed to resolve ticket');

  // --- ACCEPTANCE TEST 7: Multi-Tenant Scoping ---
  console.log('\nTEST 7 — Multi-Tenant Data Scoping');
  const campuses = spatialData.getCampuses();
  assert(campuses.length > 0 && campuses[0].organizationId === 'org-nit-001', 'TEST 7: Campuses isolated to tenant organization org-nit-001');

  console.log('\n====================================================');
  console.log(`ALL ${passed}/${total} V1 ACCEPTANCE TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

if (process.argv[1] && process.argv[1].includes('acceptance.test')) {
  runV1AcceptanceTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
