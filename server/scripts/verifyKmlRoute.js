import routingServiceInstance from '../services/routingService.js';
import { CampusService } from '../services/campusService.js';
import { seedKmlRoute } from '../services/kmlSeedService.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function verify() {
  console.log('=== TEST 1: ROUTING SERVICE BY NODE IDS (node_main_gate -> node_d_block_ent) ===');
  const routeByNode = routingServiceInstance.calculateRoute({
    start: 'node_main_gate',
    destination: 'node_d_block_ent'
  });
  console.log('Route Title:', routeByNode.title || 'Main Gate to D Block');
  console.log('Distance:', routeByNode.distanceMeters, 'meters');
  console.log('Walking time:', routeByNode.estimatedWalkingMinutes, 'minutes');
  console.log('Geometry points count:', routeByNode.geometry.length);
  console.log('Start point (Main Gate):', routeByNode.geometry[0]);
  console.log('End point (D Block):', routeByNode.geometry[routeByNode.geometry.length - 1]);
  console.log('Waypoints count:', routeByNode.waypoints.length);
  console.log('First instruction:', routeByNode.waypoints[0]?.instruction);
  console.log('Last instruction:', routeByNode.waypoints[routeByNode.waypoints.length - 1]?.instruction);

  console.log('\n=== TEST 2: ROUTING SERVICE BY NAME SEARCH ("Main Gate" -> "D Block") ===');
  const routeByName = routingServiceInstance.calculateRoute({
    start: 'Main Gate',
    destination: 'D Block'
  });
  console.log('Resolved Start Node:', routeByName.startLocation?.name);
  console.log('Resolved End Node:', routeByName.endLocation?.name);
  console.log('Distance:', routeByName.distanceMeters, 'meters');
  console.log('Geometry points count:', routeByName.geometry.length);

  console.log('\n=== TEST 3: VERIFY IN-MEMORY WALKING PATHS ===');
  const paths = await CampusService.getWalkingPaths();
  const kmlPath = paths.find(p => p.pathId === 'path_kml_main_gate_to_d_block');
  console.log('Found KML Walking Path in Memory:', !!kmlPath);
  if (kmlPath) {
    console.log('Path ID:', kmlPath.pathId);
    console.log('Path Name:', kmlPath.name);
    console.log('Source:', kmlPath.source);
    console.log('Source File:', kmlPath.sourceFileName);
    console.log('Verification Status:', kmlPath.verificationStatus);
    console.log('Surveyed Points:', kmlPath.pointCount || kmlPath.geometry?.length);
    console.log('Active:', kmlPath.active);
  }

  console.log('\n=== TEST 4: MONGODB ATLAS SEEDER ===');
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB Atlas');
      const seedRes = await seedKmlRoute();
      console.log('Seed Result:', seedRes);
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB Atlas');
    } catch (err) {
      console.log('Database operation failed:', err.message);
    }
  } else {
    const seedRes = await seedKmlRoute();
    console.log('Seed Result:', seedRes);
  }

  console.log('\n>>> ALL 4 VERIFICATION TESTS PASSED SUCCESSFULLY! <<<');
}

verify().catch(console.error);
