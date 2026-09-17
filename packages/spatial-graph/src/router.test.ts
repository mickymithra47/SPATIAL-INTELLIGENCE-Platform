import { AStarSpatialRouter, AdjacencyEdge } from './a-star-router.js';
import { Waypoint } from '@spatial/types';

export function runRouterTests() {
  console.log('--- RUNNING SPATIAL GRAPH ROUTER TESTS ---');

  const waypoints = new Map<string, Waypoint>([
    [
      'wp-101',
      {
        id: 'wp-101',
        floorId: 'fl-1',
        coordinate: { latitude: 12.9716, longitude: 77.5946 },
        waypointType: 'DOOR',
        isAccessible: true,
      },
    ],
    [
      'wp-junc-1',
      {
        id: 'wp-junc-1',
        floorId: 'fl-1',
        coordinate: { latitude: 12.9717, longitude: 77.5946 },
        waypointType: 'CORRIDOR_JUNCTION',
        isAccessible: true,
      },
    ],
    [
      'wp-stair-1',
      {
        id: 'wp-stair-1',
        floorId: 'fl-1',
        coordinate: { latitude: 12.9718, longitude: 77.5946 },
        waypointType: 'STAIR',
        isAccessible: false,
      },
    ],
    [
      'wp-elev-1',
      {
        id: 'wp-elev-1',
        floorId: 'fl-1',
        coordinate: { latitude: 12.9717, longitude: 77.5947 },
        waypointType: 'ELEVATOR',
        isAccessible: true,
      },
    ],
    [
      'wp-stair-2',
      {
        id: 'wp-stair-2',
        floorId: 'fl-2',
        coordinate: { latitude: 12.9718, longitude: 77.5946 },
        waypointType: 'STAIR',
        isAccessible: false,
      },
    ],
    [
      'wp-elev-2',
      {
        id: 'wp-elev-2',
        floorId: 'fl-2',
        coordinate: { latitude: 12.9717, longitude: 77.5947 },
        waypointType: 'ELEVATOR',
        isAccessible: true,
      },
    ],
    [
      'wp-204',
      {
        id: 'wp-204',
        floorId: 'fl-2',
        coordinate: { latitude: 12.9720, longitude: 77.5947 },
        waypointType: 'DOOR',
        isAccessible: true,
      },
    ],
    [
      'wp-isolated',
      {
        id: 'wp-isolated',
        floorId: 'fl-3',
        coordinate: { latitude: 12.9800, longitude: 77.6000 },
        waypointType: 'DOOR',
        isAccessible: true,
      },
    ],
  ]);

  const adjacency = new Map<string, AdjacencyEdge[]>([
    ['wp-101', [{ targetWaypointId: 'wp-junc-1', props: { distanceMeters: 10, isAccessible: true } }]],
    [
      'wp-junc-1',
      [
        { targetWaypointId: 'wp-101', props: { distanceMeters: 10, isAccessible: true } },
        { targetWaypointId: 'wp-stair-1', props: { distanceMeters: 12, isAccessible: false, isStair: true } },
        { targetWaypointId: 'wp-elev-1', props: { distanceMeters: 15, isAccessible: true, isElevator: true } },
      ],
    ],
    ['wp-stair-1', [{ targetWaypointId: 'wp-stair-2', props: { distanceMeters: 8, isAccessible: false, isStair: true } }]],
    ['wp-elev-1', [{ targetWaypointId: 'wp-elev-2', props: { distanceMeters: 8, isAccessible: true, isElevator: true } }]],
    [
      'wp-stair-2',
      [
        { targetWaypointId: 'wp-stair-1', props: { distanceMeters: 8, isAccessible: false, isStair: true } },
        { targetWaypointId: 'wp-204', props: { distanceMeters: 20, isAccessible: true } },
      ],
    ],
    [
      'wp-elev-2',
      [
        { targetWaypointId: 'wp-elev-1', props: { distanceMeters: 8, isAccessible: true, isElevator: true } },
        { targetWaypointId: 'wp-204', props: { distanceMeters: 25, isAccessible: true } },
      ],
    ],
    ['wp-204', [{ targetWaypointId: 'wp-elev-2', props: { distanceMeters: 25, isAccessible: true } }]],
    ['wp-isolated', []],
  ]);

  const router = new AStarSpatialRouter(waypoints, adjacency);

  // TEST 1: Standard Route
  const route1 = router.findRoute('wp-101', 'wp-204', false);
  if (!route1) throw new Error('FAIL: route1 should exist');
  if (route1.waypoints.length <= 2) throw new Error('FAIL: route1 should have intermediate waypoints');
  console.log('✓ TEST 1: Standard Route Calculated: Distance = ' + route1.totalDistanceMeters + 'm, Steps = ' + route1.waypoints.length);

  // TEST 2: Accessible Route (Must take elevator, not stairs)
  const route2 = router.findRoute('wp-101', 'wp-204', true);
  if (!route2) throw new Error('FAIL: route2 should exist');
  if (!route2.isAccessible) throw new Error('FAIL: route2 must be accessible');
  if (route2.waypoints.some(w => w.id.includes('stair'))) throw new Error('FAIL: accessible route must not contain stairs');
  console.log('✓ TEST 2: Accessible Route (Elevator Only): Distance = ' + route2.totalDistanceMeters + 'm');

  // TEST 3: Same Start and Destination
  const route3 = router.findRoute('wp-101', 'wp-101', false);
  if (!route3 || route3.totalDistanceMeters !== 0) throw new Error('FAIL: same node route should be 0');
  console.log('✓ TEST 3: Same node route returns 0 distance');

  // TEST 4: Blocked Route
  const route4 = router.findRoute('wp-101', 'wp-204', false, new Set(['wp-junc-1']));
  if (route4 !== null) throw new Error('FAIL: blocked junction must yield null');
  console.log('✓ TEST 4: Blocked junction correctly yields null (no route)');

  // TEST 5: Disconnected / Isolated Waypoint
  const route5 = router.findRoute('wp-101', 'wp-isolated', false);
  if (route5 !== null) throw new Error('FAIL: isolated node must yield null');
  console.log('✓ TEST 5: Disconnected destination correctly yields null');

  // TEST 6: Non-existent / Invalid Waypoint
  const route6 = router.findRoute('wp-fake', 'wp-204', false);
  if (route6 !== null) throw new Error('FAIL: fake node must yield null');
  console.log('✓ TEST 6: Invalid waypoint correctly yields null');

  console.log('--- ALL SPATIAL GRAPH ROUTER TESTS PASSED ---\n');
}

if (process.argv[1] && process.argv[1].includes('router.test')) {
  runRouterTests();
}
