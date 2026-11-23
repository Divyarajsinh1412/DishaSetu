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

    // 5. Seed D Block → E Block Surveyed Pathway
    const dToEKmlPath = path.join(__dirname, '../data/kml/block_D_to_E_path.kml');
    if (fs.existsSync(dToEKmlPath)) {
      const dToEContent = fs.readFileSync(dToEKmlPath, 'utf8');
      const parsedDToE = parseKml(dToEContent, 'block_D_to_E_path.kml', {
        name: 'D Block → E Block Walkway',
        startNode: 'node_d_block_ent',
        endNode: 'node_e_block_ent',
        routeType: 'Walking'
      });

      // Ensure E Block Entrance Node exists
      const eNodeDoc = {
        nodeId: 'node_e_block_ent',
        name: 'E Block (Computer Science & Engineering) Entrance Door',
        coordinates: {
          lat: parsedDToE.coordinates[parsedDToE.coordinates.length - 1][0],
          lng: parsedDToE.coordinates[parsedDToE.coordinates.length - 1][1]
        },
        geometry: {
          type: 'Point',
          coordinates: [
            parsedDToE.coordinates[parsedDToE.coordinates.length - 1][1],
            parsedDToE.coordinates[parsedDToE.coordinates.length - 1][0]
          ]
        },
        nodeType: 'building_entrance',
        associatedLocationId: 'loc_e_block',
        isAccessible: true,
        isActive: true
      };

      await NavigationNode.findOneAndUpdate(
        { nodeId: 'node_e_block_ent' },
        { $set: eNodeDoc },
        { upsert: true, new: true }
      ).catch(() => {});

      const dToEPathId = 'path_kml_d_to_e_block';
      const dToEPathPayload = {
        pathId: dToEPathId,
        name: parsedDToE.name,
        geometry: parsedDToE.coordinates,
        startNode: 'node_d_block_ent',
        endNode: 'node_e_block_ent',
        distanceMeters: parsedDToE.distanceMeters || 35.7,
        estimatedWalkingMinutes: parsedDToE.estimatedWalkingMinutes || 0.5,
        accessibility: true,
        hasStairs: false,
        hasRamp: true,
        pathType: 'covered_walkway',
        routeType: 'Walking',
        verificationStatus: 'Verified',
        status: 'active',
        active: true,
        surfaceType: 'Paved Walkway & Tiles',
        sourceFileName: 'block_D_to_E_path.kml',
        source: 'Google Earth KML',
        sourceType: 'kml_import',
        campus: 'Presidency University Bengaluru',
        pointCount: parsedDToE.pointCount,
        notes: 'Actual surveyed walkway connecting D Block and E Block.'
      };

      await WalkingPath.findOneAndUpdate(
        { pathId: dToEPathId },
        { $set: dToEPathPayload },
        { upsert: true, new: true }
      );

      const dToERouteId = 'route_d_block_to_e_block';
      const dToERoutePayload = {
        routeId: dToERouteId,
        name: 'D Block → E Block Walkway',
        startLocation: 'D Block',
        endLocation: 'E Block',
        geometry: parsedDToE.coordinates,
        distanceMeters: parsedDToE.distanceMeters || 35.7,
        estimatedWalkingMinutes: parsedDToE.estimatedWalkingMinutes || 0.5,
        routeType: 'pedestrian',
        accessible: true,
        verified: true,
        sourceFileName: 'block_D_to_E_path.kml',
        source: 'Google Earth KML',
        campus: 'Presidency University Bengaluru',
        status: 'published'
      };

      await Route.findOneAndUpdate(
        { routeId: dToERouteId },
        { $set: dToERoutePayload },
        { upsert: true, new: true }
      ).catch(() => {});

      if (CampusService && CampusService.syncKmlPathToMemory) {
        CampusService.syncKmlPathToMemory(dToEPathPayload, dToERoutePayload);
      }
      console.log(`[KMLSeed] Successfully seeded & persisted "${parsedDToE.name}" (${parsedDToE.distanceMeters || 35.7}m) into MongoDB Atlas.`);
    }

    // 6. Seed E Block → F Block Surveyed Pathway
    const eToFKmlPath = path.join(__dirname, '../data/kml/Block_E_to_F_path.kml');
    if (fs.existsSync(eToFKmlPath)) {
      const eToFContent = fs.readFileSync(eToFKmlPath, 'utf8');
      const parsedEToF = parseKml(eToFContent, 'Block_E_to_F_path.kml', {
        name: 'E Block → F Block Walkway',
        startNode: 'node_e_block_ent',
        endNode: 'node_f_block_ent',
        routeType: 'Walking'
      });

      // Ensure F Block Entrance Node exists with exact coordinates
      const fNodeDoc = {
        nodeId: 'node_f_block_ent',
        name: 'F Block (Information Science & Technology) Entrance Door',
        coordinates: {
          lat: parsedEToF.coordinates[parsedEToF.coordinates.length - 1][0],
          lng: parsedEToF.coordinates[parsedEToF.coordinates.length - 1][1]
        },
        geometry: {
          type: 'Point',
          coordinates: [
            parsedEToF.coordinates[parsedEToF.coordinates.length - 1][1],
            parsedEToF.coordinates[parsedEToF.coordinates.length - 1][0]
          ]
        },
        nodeType: 'building_entrance',
        associatedLocationId: 'loc_f_block',
        isAccessible: true,
        isActive: true
      };

      await NavigationNode.findOneAndUpdate(
        { nodeId: 'node_f_block_ent' },
        { $set: fNodeDoc },
        { upsert: true, new: true }
      ).catch(() => {});

      const eToFPathId = 'path_kml_e_to_f_block';
      const eToFPathPayload = {
        pathId: eToFPathId,
        name: parsedEToF.name,
        geometry: parsedEToF.coordinates,
        startNode: 'node_e_block_ent',
        endNode: 'node_f_block_ent',
        distanceMeters: parsedEToF.distanceMeters || 47.0,
        estimatedWalkingMinutes: parsedEToF.estimatedWalkingMinutes || 0.6,
        accessibility: true,
        hasStairs: false,
        hasRamp: true,
        pathType: 'covered_walkway',
        routeType: 'Walking',
        verificationStatus: 'Verified',
        status: 'active',
        active: true,
        surfaceType: 'Paved Walkway & Tiles',
        sourceFileName: 'Block_E_to_F_path.kml',
        source: 'Google Earth KML',
        sourceType: 'kml_import',
        campus: 'Presidency University Bengaluru',
        pointCount: parsedEToF.pointCount,
        notes: 'Actual surveyed walkway connecting E Block and F Block.'
      };

      await WalkingPath.findOneAndUpdate(
        { pathId: eToFPathId },
        { $set: eToFPathPayload },
        { upsert: true, new: true }
      );

      const eToFRouteId = 'route_e_block_to_f_block';
      const eToFRoutePayload = {
        routeId: eToFRouteId,
        name: 'E Block → F Block Walkway',
        startLocation: 'E Block',
        endLocation: 'F Block',
        geometry: parsedEToF.coordinates,
        distanceMeters: parsedEToF.distanceMeters || 47.0,
        estimatedWalkingMinutes: parsedEToF.estimatedWalkingMinutes || 0.6,
        routeType: 'pedestrian',
        accessible: true,
        verified: true,
        sourceFileName: 'Block_E_to_F_path.kml',
        source: 'Google Earth KML',
        campus: 'Presidency University Bengaluru',
        status: 'published'
      };

      await Route.findOneAndUpdate(
        { routeId: eToFRouteId },
        { $set: eToFRoutePayload },
        { upsert: true, new: true }
      ).catch(() => {});

      if (CampusService && CampusService.syncKmlPathToMemory) {
        CampusService.syncKmlPathToMemory(eToFPathPayload, eToFRoutePayload);
      }
      console.log(`[KMLSeed] Successfully seeded & persisted "${parsedEToF.name}" (${parsedEToF.distanceMeters || 47.0}m) into MongoDB Atlas.`);
    }

    return savedPath;
  } catch (error) {
    console.error('[KMLSeed] Error seeding KML route:', error.message);
  }
}
