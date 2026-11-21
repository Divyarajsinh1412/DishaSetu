/**
 * DISHASETU: KML Route Auto-Seed Service
 * Presidency University Bengaluru
 * 
 * Ensures the verified Google Earth KML route (Main Gate → D Block)
 * is permanently stored in MongoDB Atlas WalkingPath & Route collections.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import WalkingPath from '../models/WalkingPath.js';
import Route from '../models/Route.js';
import NavigationNode from '../models/NavigationNode.js';
import { parseKml } from '../utils/kmlParser.js';
import routingServiceInstance from './routingService.js';
import { CampusService } from './campusService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedKmlRoute() {
  try {
    const kmlFilePath = path.join(__dirname, '../data/kml/Untitled_map_project.kml');
    if (!fs.existsSync(kmlFilePath)) {
      console.warn('[KMLSeed] KML file not found at:', kmlFilePath);
      return;
    }

    const kmlContent = fs.readFileSync(kmlFilePath, 'utf8');
    const parsed = parseKml(kmlContent, 'Untitled map project.kml', {
      name: 'Main Gate → D Block',
      startNode: 'node_main_gate',
      endNode: 'node_d_block_ent',
      routeType: 'Walking'
    });

    console.log(`[KMLSeed] Parsed verified KML route: "${parsed.name}" (${parsed.pointCount} points, ${parsed.distanceMeters}m).`);

    // 1. Ensure Navigation Nodes exist with exact surveyed coordinates
    const startNodeDoc = {
      nodeId: 'node_main_gate',
      name: 'Presidency University – Main Gate Entrance Portal',
      coordinates: { lat: parsed.coordinates[0][0], lng: parsed.coordinates[0][1] },
      geometry: {
        type: 'Point',
        coordinates: [parsed.coordinates[0][1], parsed.coordinates[0][0]]
      },
      nodeType: 'gate',
      associatedLocationId: 'loc_main_gate',
      isAccessible: true,
      isActive: true
    };

    const endNodeDoc = {
      nodeId: 'node_d_block_ent',
      name: 'D Block (Mechanical & Civil Engineering) Entrance Door',
      coordinates: {
        lat: parsed.coordinates[parsed.coordinates.length - 1][0],
        lng: parsed.coordinates[parsed.coordinates.length - 1][1]
      },
      geometry: {
        type: 'Point',
        coordinates: [
          parsed.coordinates[parsed.coordinates.length - 1][1],
          parsed.coordinates[parsed.coordinates.length - 1][0]
        ]
      },
      nodeType: 'building_entrance',
      associatedLocationId: 'loc_d_block',
      isAccessible: true,
      isActive: true
    };

    await NavigationNode.findOneAndUpdate(
      { nodeId: 'node_main_gate' },
      { $set: startNodeDoc },
      { upsert: true, new: true }
    ).catch(() => {});

    await NavigationNode.findOneAndUpdate(
      { nodeId: 'node_d_block_ent' },
      { $set: endNodeDoc },
      { upsert: true, new: true }
    ).catch(() => {});

    // 2. Upsert WalkingPath in MongoDB
    const pathId = 'path_kml_main_gate_to_d_block';
    const walkingPathPayload = {
      pathId,
      name: parsed.name,
      geometry: parsed.coordinates,
      startNode: 'node_main_gate',
      endNode: 'node_d_block_ent',
      distanceMeters: parsed.distanceMeters,
      estimatedWalkingMinutes: parsed.estimatedWalkingMinutes,
      accessibility: true,
      hasStairs: false,
      hasRamp: true,
      pathType: 'main_avenue',
      routeType: 'Walking',
      verificationStatus: 'Verified',
      status: 'active',
    active: true,
      surfaceType: 'Paved Walkway & Tiles',
      sourceFileName: parsed.sourceFileName,
      source: 'Google Earth KML',
      sourceType: 'kml_import',
      campus: 'Presidency University Bengaluru',
      startLocation: parsed.startLocation,
      endLocation: parsed.endLocation,
      pointCount: parsed.pointCount,
      active: true,
      notes: 'Actual surveyed walking path from Presidency University Main Gate to D Block imported from Google Earth KML.'
    };

    const savedPath = await WalkingPath.findOneAndUpdate(
      { pathId },
      { $set: walkingPathPayload },
      { upsert: true, new: true }
    );

    // 3. Upsert direct Route in MongoDB
    const routeId = 'route_main_gate_to_d_block';
    const routePayload = {
      routeId,
      name: 'Main Gate → D Block',
      startLocation: parsed.startLocation,
      endLocation: parsed.endLocation,
      geometry: parsed.coordinates,
      distanceMeters: parsed.distanceMeters,
      estimatedWalkingMinutes: parsed.estimatedWalkingMinutes,
      routeType: 'pedestrian',
      accessible: true,
      verified: true,
      sourceFileName: parsed.sourceFileName,
      source: 'Google Earth KML',
      campus: 'Presidency University Bengaluru',
      status: 'published'
    };

    await Route.findOneAndUpdate(
      { routeId },
      { $set: routePayload },
      { upsert: true, new: true }
    ).catch(() => {});

    // 4. Update in-memory graph
    if (CampusService && CampusService.syncKmlPathToMemory) {
      CampusService.syncKmlPathToMemory(walkingPathPayload, routePayload);
    }

    console.log(`[KMLSeed] Successfully seeded & persisted "${parsed.name}" (${parsed.distanceMeters}m) into MongoDB Atlas.`);
    return savedPath;
  } catch (error) {
    console.error('[KMLSeed] Error seeding KML route:', error.message);
  }
}
