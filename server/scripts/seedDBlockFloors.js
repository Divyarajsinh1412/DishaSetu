import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Floor from '../models/Floor.js';
import Building from '../models/Building.js';
import IndoorNode from '../models/IndoorNode.js';
import IndoorPath from '../models/IndoorPath.js';
import { D_BLOCK_ALL_FLOORS, generateDBlockGraph, D_BLOCK_BUILDING_INFO } from '../data/dBlockFloorDataset.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const TARGET_DB_NAME = process.env.DB_NAME || 'dishasetu_db';
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

export async function seedDBlockFloors() {
  console.log('================================================================');
  console.log('   DISHASETU: Seeding D Block 6-Floor Indoor Dataset to Atlas   ');
  console.log('   Target Database: ' + TARGET_DB_NAME);
  console.log('================================================================\n');

  if (!MONGO_URI) {
    console.error('[Error] MONGO_URI not found.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: TARGET_DB_NAME,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 20000,
      autoIndex: true
    });
    console.log('[1/4] Connected to MongoDB Atlas host:', mongoose.connection.host);

    // 1. Update D Block in Buildings collection to reflect 6 floors
    console.log('[2/4] Synchronizing D Block building entry...');
    await Building.updateOne(
      { $or: [{ shortCode: 'PU-D-BLOCK' }, { name: 'D Block' }] },
      {
        $set: {
          name: 'D Block',
          shortCode: 'PU-D-BLOCK',
          category: 'Academic',
          description: 'Instructional engineering complex with six multi-tier academic floors, research laboratories, and lecture halls.',
          totalFloors: 6,
          departments: ['Mechanical Engineering', 'Civil Engineering', 'Robotics & Automation'],
          isVerified: true,
          status: 'published',
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    console.log('      D Block building entry verified with 6 floors.');

    // 2. Upsert all 6 floors into `floors` collection
    console.log('[3/4] Seeding 6 floors into "floors" collection...');
    for (const floor of D_BLOCK_ALL_FLOORS) {
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
      console.log(`      ✓ Seeded ${floor.floorName} (Floor ${floor.floorNumber}) with ${floor.rooms.length} rooms`);
    }

    // 3. Upsert Indoor Graph Nodes & Paths
    console.log('[4/4] Seeding indoor graph nodes and walking paths...');
    const graph = generateDBlockGraph();
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
    console.log(`      ✓ Seeded ${graph.nodes.length} indoor navigation nodes`);

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
    console.log(`      ✓ Seeded ${graph.paths.length} indoor walking paths`);

    // Verify count in Atlas
    const finalFloorsCount = await Floor.countDocuments({ buildingShortCode: 'PU-D-BLOCK' });
    console.log(`\n[SUCCESS] All ${finalFloorsCount} D Block floors are live in MongoDB Atlas!`);
    return true;
  } catch (err) {
    console.error('[Error seeding D Block floors]:', err.message);
    return false;
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed cleanly.');
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seedDBlockFloors.js')) {
  seedDBlockFloors().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
