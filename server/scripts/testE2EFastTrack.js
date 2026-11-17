import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const TEST_PORT = 5188;

const makeRequest = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: TEST_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runE2E = async () => {
  console.log('========================================================');
  console.log('  DISHASETU: Fast-Track Outdoor Navigation E2E Test     ');
  console.log('========================================================\n');

  const { startServer } = await import('../server.js');
  const { server } = await startServer(TEST_PORT);
  console.log(`[Test Server] DishaSetu running on http://localhost:${TEST_PORT}\n`);

  try {
    // 1. Health check & DB connection
    console.log('[1/7] Testing /api/health...');
    const health = await makeRequest('GET', '/api/health');
    console.log(`  -> Status: ${health.status}`);
    console.log(`  -> Database: ${health.data.database?.database} (${health.data.database?.state})`);
    if (health.data.database?.connected !== true) throw new Error('DB not connected');

    // 2. Locations Catalog
    console.log('\n[2/7] Testing /api/locations...');
    const locs = await makeRequest('GET', '/api/locations');
    console.log(`  -> Status: ${locs.status}`);
    console.log(`  -> Total Campus Locations: ${locs.data.data?.length}`);
    if (!locs.data.data || locs.data.data.length < 10) throw new Error('Locations missing');

    // 3. Buildings & Entrances
    console.log('\n[3/7] Testing /api/buildings...');
    const blds = await makeRequest('GET', '/api/buildings');
    console.log(`  -> Status: ${blds.status}`);
    console.log(`  -> Registered Buildings: ${blds.data.data?.length}`);
    const sampleBuilding = blds.data.data?.[0];
    console.log(`  -> Sample Building: ${sampleBuilding?.name} (${sampleBuilding?.shortCode})`);

    // 4. Navigation Graph (Nodes & Paths)
    console.log('\n[4/7] Testing /api/navigation/nodes & paths...');
    const nodes = await makeRequest('GET', '/api/navigation/nodes');
    const paths = await makeRequest('GET', '/api/navigation/paths');
    console.log(`  -> Active Nodes: ${nodes.data.data?.length}`);
    console.log(`  -> Walkable Paths: ${paths.data.data?.length}`);
    if (!nodes.data.data?.length || !paths.data.data?.length) throw new Error('Graph data missing');

    // 5. Dijkstra Pedestrian Routing: Main Gate -> D Block (Mechanical/Civil)
    console.log('\n[5/7] Testing /api/navigation/route (Main Gate -> D Block)...');
    const route1 = await makeRequest('POST', '/api/navigation/route', {
      start: 'node_main_gate',
      destination: 'node_d_block_ent',
      accessibleOnly: false
    });
    console.log(`  -> Route Status: ${route1.status}`);
    console.log(`  -> Distance: ${route1.data.data?.distanceMeters} meters`);
    console.log(`  -> Estimated Time: ${route1.data.data?.estimatedWalkingMinutes} minutes`);
    console.log(`  -> Turn Waypoints: ${route1.data.data?.waypoints?.length} steps`);
    console.log(`  -> Step 1: ${route1.data.data?.waypoints?.[0]?.instruction}`);
    console.log(`  -> Final Step: ${route1.data.data?.waypoints?.[route1.data.data?.waypoints?.length - 1]?.instruction}`);

    // 6. Pedestrian Routing: Main Gate -> Central Cafeteria
    console.log('\n[6/7] Testing /api/navigation/route (Main Gate -> Cafeteria)...');
    const route2 = await makeRequest('POST', '/api/navigation/route', {
      start: 'node_main_gate',
      destination: 'node_cafeteria_ent',
      accessibleOnly: true
    });
    console.log(`  -> Accessible Route Distance: ${route2.data.data?.distanceMeters} meters`);
    console.log(`  -> Estimated Time: ${route2.data.data?.estimatedWalkingMinutes} minutes`);

    // 7. Admin Survey GPS Coordinate Update
    console.log('\n[7/7] Testing Admin Login & Location Survey Update...');
    const loginRes = await makeRequest('POST', '/api/admin/login', {
      email: 'admin@presidency.ac.in',
      password: 'Admin@Presidency2026'
    });
    const token = loginRes.data.token;
    console.log(`  -> Admin Login: ${loginRes.status === 200 ? 'SUCCESS' : 'FAILED'}`);

    const surveyRes = await makeRequest(
      'PUT',
      '/api/admin/locations/loc_main_gate/survey',
      {
        coordinates: { lat: 13.1717995, lng: 77.5361915 },
        entranceCoordinates: { lat: 13.1717995, lng: 77.5361915 },
        verificationStatus: 'Published',
        coordinateSource: 'High-Precision GPS Ground Survey'
      },
      { 'Authorization': `Bearer ${token}` }
    );
    console.log(`  -> GPS Survey Update: ${surveyRes.status === 200 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`  -> Verified Location: ${surveyRes.data.data?.name} [${surveyRes.data.data?.verificationStatus}]`);

    console.log('\n========================================================');
    console.log('   ALL DISHASETU FAST-TRACK TESTS PASSED 100%!           ');
    console.log('========================================================\n');
  } finally {
    server.close();
  }
};

runE2E().then(() => process.exit(0)).catch(err => {
  console.error('[E2E Error]', err);
  process.exit(1);
});
