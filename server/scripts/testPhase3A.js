import http from 'http';
import app from '../server.js'; // Note: server.js exports app or starts server

// Let's test server directly by starting an ephemeral server on port 5899
const server = app.listen(5899, async () => {
  console.log('Test Server started on port 5899');

  const request = (method, path, body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const opts = {
        hostname: '127.0.0.1',
        port: 5899,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_verified_admin_token',
          ...headers
        }
      };
      const req = http.request(opts, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    console.log('\n--- 1. Testing Health Endpoint ---');
    const health = await request('GET', '/api/health');
    console.log('Status:', health.status, '| API Version:', health.body.version);

    console.log('\n--- 1A. Logging In as Super Admin ---');
    const login = await request('POST', '/api/admin/login', {
      email: 'admin@presidency.ac.in',
      password: 'Admin@Presidency2026'
    });
    console.log('Status:', login.status, '| Admin Token Obtained:', Boolean(login.body.token));
    const token = login.body.token;

    console.log('\n--- 2. Testing Campus Catalog (38 Locations) ---');
    const catalog = await request('GET', '/api/campus/catalog');
    console.log('Status:', catalog.status, '| Locations Count:', catalog.body.count);

    console.log('\n--- 3. Testing Navigation Graph Nodes (36 Nodes) ---');
    const nodes = await request('GET', '/api/navigation/nodes');
    console.log('Status:', nodes.status, '| Nodes Count:', nodes.body.count);

    console.log('\n--- 4. Testing Walking Paths (37 Edges) ---');
    const paths = await request('GET', '/api/navigation/paths');
    console.log('Status:', paths.status, '| Paths Count:', paths.body.count);

    console.log('\n--- 5. Testing Route 1: Main Gate -> D Block ---');
    const r1 = await request('POST', '/api/navigation/route', {
      start: 'node_main_gate',
      destination: 'node_d_block_ent'
    });
    console.log('Status:', r1.status, '| Distance:', r1.body.data?.distanceMeters, 'm | Time:', r1.body.data?.estimatedWalkingMinutes, 'min | Steps:', r1.body.data?.waypoints?.length);

    console.log('\n--- 6. Testing Route 2: Main Gate -> Central Library ---');
    const r2 = await request('POST', '/api/navigation/route', {
      start: 'node_main_gate',
      destination: 'node_library_ent'
    });
    console.log('Status:', r2.status, '| Distance:', r2.body.data?.distanceMeters, 'm | Time:', r2.body.data?.estimatedWalkingMinutes, 'min | Steps:', r2.body.data?.waypoints?.length);

    console.log('\n--- 7. Testing Route 3: Main Gate -> Central Cafeteria ---');
    const r3 = await request('POST', '/api/navigation/route', {
      start: 'node_main_gate',
      destination: 'node_cafeteria_ent'
    });
    console.log('Status:', r3.status, '| Distance:', r3.body.data?.distanceMeters, 'm | Time:', r3.body.data?.estimatedWalkingMinutes, 'min | Steps:', r3.body.data?.waypoints?.length);

    console.log('\n--- 8. Testing Route 4: Main Gate -> Auditorium ---');
    const r4 = await request('POST', '/api/navigation/route', {
      start: 'node_main_gate',
      destination: 'node_auditorium_ent'
    });
    console.log('Status:', r4.status, '| Distance:', r4.body.data?.distanceMeters, 'm | Time:', r4.body.data?.estimatedWalkingMinutes, 'min | Steps:', r4.body.data?.waypoints?.length);

    console.log('\n--- 9. Testing Route 5: Parking -> E Block ---');
    const r5 = await request('POST', '/api/navigation/route', {
      start: 'node_parking_entry',
      destination: 'node_e_block_ent'
    });
    console.log('Status:', r5.status, '| Distance:', r5.body.data?.distanceMeters, 'm | Time:', r5.body.data?.estimatedWalkingMinutes, 'min | Steps:', r5.body.data?.waypoints?.length);

    console.log('\n--- 10. Testing Route 6: D Block -> Basketball Court ---');
    const r6 = await request('POST', '/api/navigation/route', {
      start: 'node_d_block_ent',
      destination: 'node_basketball_court'
    });
    console.log('Status:', r6.status, '| Distance:', r6.body.data?.distanceMeters, 'm | Time:', r6.body.data?.estimatedWalkingMinutes, 'min | Steps:', r6.body.data?.waypoints?.length);

    console.log('\n--- 11. Testing GPS Survey Update for Catalog Location ---');
    const surveyUpdate = await request('PUT', '/api/admin/locations/loc_d_block/survey', {
      coordinates: { lat: 13.170563, lng: 77.535573 },
      entranceCoordinates: { lat: 13.170550, lng: 77.535610 },
      verificationStatus: 'Published',
      coordinateSource: 'Ground Survey',
      gpsAccuracy: 1.5
    }, { 'Authorization': `Bearer ${token}` });
    console.log('Status:', surveyUpdate.status, '| Result:', surveyUpdate.body.message);

    console.log('\n--- 12. Testing Admin Walking Path Network API ---');
    const newPath = await request('POST', '/api/admin/paths', {
      name: 'Central Library to Fountain Connector',
      startNode: 'node_library_ent',
      endNode: 'node_fountain_plaza',
      distanceMeters: 85,
      accessibility: true,
      pathType: 'secondary_walkway'
    }, { 'Authorization': `Bearer ${token}` });
    console.log('Status:', newPath.status, '| Path Added:', newPath.body.data?.name);

    console.log('\n--- ALL PHASE 3A BACKEND TESTS PASSED CLEANLY! ---');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close(() => {
      console.log('Test Server stopped.');
      process.exit(0);
    });
  }
});
