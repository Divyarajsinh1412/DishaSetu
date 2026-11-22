import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Floor from '../models/Floor.js';
import Building from '../models/Building.js';
import IndoorNode from '../models/IndoorNode.js';
import IndoorPath from '../models/IndoorPath.js';
import {
  CAMPUS_BLOCKS_INFO,
  CAMPUS_ALL_FLOORS,
  generateCampusIndoorGraph
} from '../data/campusFloorsDataset.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const TARGET_DB_NAME = process.env.DB_NAME || 'dishasetu_db';
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

export async function seedCampusFloors() {
  console.log('================================================================');
  console.log('   DISHASETU: Seeding Multi-Floor Rooms to Atlas (D,E,F,L,N,M)   ');
  console.log('================================================================');

  const isConnected = mongoose.connection && mongoose.connection.readyState === 1;

  if (!isConnected && MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI, {
        dbName: TARGET_DB_NAME,
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 20000,
        autoIndex: true
      });
      console.log('[CampusFloorsSeed] Connected to MongoDB Atlas host:', mongoose.connection.host);
    } catch (err) {
      console.warn('[CampusFloorsSeed] MongoDB connection warning:', err.message);
      return;
    }
  } else if (!isConnected) {
    console.warn('[CampusFloorsSeed] No active database connection; maintaining memory state.');
    return;
  }

  try {
    // 1. Synchronize Building metadata for D, E, F, L, N, and M blocks
    console.log('[CampusFloorsSeed] 1/3 Synchronizing 6 campus building entities...');
    for (const [key, meta] of Object.entries(CAMPUS_BLOCKS_INFO)) {
      if (key === 'bld_m_block') continue; // Handled via bld_som_block alias

      await Building.updateOne(
        { $or: [{ shortCode: meta.shortCode }, { name: meta.name }] },
        {
          $set: {
            name: meta.name,
            shortCode: meta.shortCode,
            category: meta.category,
            description: meta.description,
            totalFloors: meta.totalFloors,
            departments: meta.departments,
            isVerified: true,
            status: 'published',
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );
    }

    // 2. Upsert floors and rooms for all 6 blocks
    console.log('[CampusFloorsSeed] 2/3 Seeding floor and room structures...');
    let totalFloorsCount = 0;
    let totalRoomsCount = 0;

    for (const floor of CAMPUS_ALL_FLOORS) {
      await Floor.updateOne(
        { floorId: floor.floorId },
        {
          $set: {
            ...floor,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );
      totalFloorsCount++;
      totalRoomsCount += (floor.rooms ? floor.rooms.length : 0);
    }
    console.log(`[CampusFloorsSeed] Successfully seeded ${totalFloorsCount} floors with ${totalRoomsCount} rooms into MongoDB Atlas.`);

    // 3. Upsert Indoor Graph Nodes and Paths
    console.log('[CampusFloorsSeed] 3/3 Synchronizing indoor navigation graph...');
    const graph = generateCampusIndoorGraph();
    for (const node of graph.nodes) {
      await IndoorNode.updateOne(
        { nodeId: node.nodeId },
        {
          $set: { ...node, updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );
    }

    for (const pathDoc of graph.paths) {
      await IndoorPath.updateOne(
        { pathId: pathDoc.pathId },
        {
          $set: { ...pathDoc, updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );
    }
    console.log(`[CampusFloorsSeed] Seeded ${graph.nodes.length} indoor nodes & ${graph.paths.length} indoor walking paths.`);
    console.log('[CampusFloorsSeed] Floor-wise room setup complete for D, E, F, L, N, and M blocks!\n');
  } catch (err) {
    console.error('[CampusFloorsSeed] Error during seeding:', err.message);
  }
}

// Auto-run if executed directly as script
if (process.argv[1] && process.argv[1].endsWith('seedCampusFloors.js')) {
  seedCampusFloors()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export default seedCampusFloors;
