import mongoose from 'mongoose';
import Floor from '../models/Floor.js';
import Room from '../models/Room.js';
import IndoorNode from '../models/IndoorNode.js';
import IndoorPath from '../models/IndoorPath.js';
import { getDbStatus } from '../config/db.js';
import syncService from '../services/syncService.js';
import {
  CAMPUS_ALL_FLOORS,
  CAMPUS_BLOCKS_INFO,
  generateCampusIndoorGraph,
  calculateRoomBounds
} from '../data/campusFloorsDataset.js';

const campusGraph = generateCampusIndoorGraph();

// Helper to safely build Floor query without triggering Mongoose CastError on _id
function getFloorQuery(id) {
  if (!id) return { floorId: id };
  return mongoose.isValidObjectId(id) ? { $or: [{ floorId: id }, { _id: id }] } : { floorId: id };
}

// Initial in-memory floor datasets (All 6 blocks: D, E, F, L, N, M)
let memoryFloors = [
  ...CAMPUS_ALL_FLOORS
];

// Initial memory indoor nodes & paths
let memoryIndoorNodes = [
  ...campusGraph.nodes
];
let memoryIndoorPaths = [
  ...campusGraph.paths
];

/**
 * Flexible matching helper for any campus building ID / shortCode / name
 */
function isBuildingMatch(targetKey, queryStr) {
  if (!queryStr) return false;
  const q = String(queryStr).toLowerCase().trim();
  const meta = CAMPUS_BLOCKS_INFO[targetKey];
  if (!meta) return false;

  const bId = meta.buildingId.toLowerCase();
  const sCode = meta.shortCode.toLowerCase();
  const bName = meta.name.toLowerCase();
  const letter = meta.blockLetter.toLowerCase();

  if (q === bId || q === sCode || q === bName || q === letter) return true;
  if (q === `${letter}-block` || q === `${letter}_block` || q === `${letter} block`) return true;
  if (q.includes(`bld_${letter}`)) return true;
  if (letter === 'm' && (q.includes('som') || q.includes('mba'))) return true;
  if (letter === 'd' && q.includes('d-block')) return true;
  return false;
}

// Controller Handlers
export const getFloors = async (req, res) => {
  try {
    const { buildingId } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      let query = {};
      if (buildingId) {
        // Resolve exact building key
        const matchedKey = Object.keys(CAMPUS_BLOCKS_INFO).find(k => isBuildingMatch(k, buildingId));
        if (matchedKey) {
          const meta = CAMPUS_BLOCKS_INFO[matchedKey];
          query = {
            $or: [
              { buildingId: meta.buildingId },
              { buildingShortCode: meta.shortCode },
              { buildingShortCode: meta.shortCode.toUpperCase() }
            ]
          };
          // Also handle SOM/M block alias
          if (meta.blockLetter === 'M') {
            query.$or.push({ buildingId: 'bld_som_block' }, { buildingId: 'bld_m_block' }, { buildingShortCode: 'PU-SOM-BLOCK' }, { buildingShortCode: 'PU-M-BLOCK' });
          }
        } else {
          query = { $or: [{ buildingId }, { buildingShortCode: buildingId }] };
        }
      }

      const floors = await Floor.find(query).sort({ floorNumber: 1 });
      if (floors && floors.length > 0) {
        return res.json({ success: true, count: floors.length, data: floors });
      }
    }

    let list = [...memoryFloors];
    if (buildingId) {
      const matchedKey = Object.keys(CAMPUS_BLOCKS_INFO).find(k => isBuildingMatch(k, buildingId));
      if (matchedKey) {
        const meta = CAMPUS_BLOCKS_INFO[matchedKey];
        list = list.filter(f =>
          f.buildingId === meta.buildingId ||
          f.buildingShortCode === meta.shortCode ||
          (meta.blockLetter === 'M' && (f.buildingId === 'bld_som_block' || f.buildingId === 'bld_m_block'))
        );
      } else {
        list = list.filter(f => f.buildingId === buildingId || f.buildingShortCode === buildingId);
      }
    }
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.json({ success: true, count: memoryFloors.length, data: memoryFloors });
  }
};

export const getFloorById = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const floor = await Floor.findOne(getFloorQuery(id));
      if (floor) return res.json({ success: true, data: floor });
    }

    const mem = memoryFloors.find(f => f.floorId === id || f._id === id);
    if (!mem) return res.status(404).json({ success: false, message: 'Floor not found' });
    res.json({ success: true, data: mem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createFloor = async (req, res) => {
  try {
    const floorData = req.body;
    const floorId = floorData.floorId || `flr_${Date.now()}`;
    const newFloor = { ...floorData, floorId, createdAt: new Date() };

    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      await Floor.create(newFloor);
    }
    memoryFloors.push(newFloor);

    syncService.broadcast('indoor:floor_created', newFloor);
    res.status(201).json({ success: true, data: newFloor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateFloor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const dbStatus = getDbStatus();
    let updated = null;

    if (dbStatus.connected) {
      updated = await Floor.findOneAndUpdate(
        getFloorQuery(id),
        { $set: updates },
        { new: true }
      );
    }

    const idx = memoryFloors.findIndex(f => f.floorId === id || f._id === id);
    if (idx !== -1) {
      memoryFloors[idx] = { ...memoryFloors[idx], ...updates };
      if (!updated) updated = memoryFloors[idx];
    }

    syncService.broadcast('indoor:floor_updated', updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteFloor = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      await Floor.findOneAndDelete(getFloorQuery(id));
    }

    const idx = memoryFloors.findIndex(f => f.floorId === id || f._id === id);
    if (idx !== -1) memoryFloors.splice(idx, 1);

    syncService.broadcast('indoor:floor_deleted', { floorId: id });
    res.json({ success: true, message: `Floor ${id} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin Room Modification APIs: Create, Update, Delete
export const createRoom = async (req, res) => {
  try {
    const { floorId } = req.params;
    const {
      roomNumber,
      name,
      category = 'Classroom',
      type = 'Classroom',
      department,
      capacity = 60,
      isAccessible = true,
      status = 'Operational'
    } = req.body;

    if (!roomNumber) {
      return res.status(400).json({ success: false, message: 'Room number is required.' });
    }

    const dbStatus = getDbStatus();
    let targetFloor = null;

    if (dbStatus.connected) {
      targetFloor = await Floor.findOne(getFloorQuery(floorId));
    }
    if (!targetFloor) {
      targetFloor = memoryFloors.find(f => f.floorId === floorId || f._id === floorId);
    }

    if (!targetFloor) {
      return res.status(404).json({ success: false, message: 'Floor not found' });
    }

    const existingRooms = targetFloor.rooms || [];
    const newIndex = existingRooms.length;
    const { bounds, entrancePoint } = calculateRoomBounds(newIndex + 1, newIndex);

    const newRoom = {
      roomId: `rm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      roomNumber: roomNumber.trim().toUpperCase(),
      name: name ? name.trim() : `${roomNumber} – ${type}`,
      category,
      type,
      department: department || targetFloor.buildingName || 'Academic Quad',
      bounds,
      entrancePoint,
      qrCodeId: `QR-${targetFloor.buildingShortCode || 'BLD'}-${roomNumber}`,
      isAccessible: Boolean(isAccessible),
      capacity: Number(capacity) || 60,
      status
    };

    if (dbStatus.connected) {
      await Floor.findOneAndUpdate(
        getFloorQuery(floorId),
        { $push: { rooms: newRoom } }
      );
    }

    const memFloor = memoryFloors.find(f => f.floorId === floorId || f._id === floorId);
    if (memFloor) {
      if (!memFloor.rooms) memFloor.rooms = [];
      memFloor.rooms.push(newRoom);
    }

    syncService.broadcast('indoor:room_created', { floorId, room: newRoom });
    res.status(201).json({ success: true, data: newRoom });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { floorId, roomId } = req.params;
    const updates = req.body;
    const dbStatus = getDbStatus();
    let updatedFloor = null;

    if (dbStatus.connected) {
      const updateFields = {};
      for (const [key, val] of Object.entries(updates)) {
        updateFields[`rooms.$.${key}`] = val;
      }
      updatedFloor = await Floor.findOneAndUpdate(
        { ...getFloorQuery(floorId), 'rooms.roomId': roomId },
        { $set: updateFields },
        { new: true }
      );
    }

    const flr = memoryFloors.find(f => f.floorId === floorId || f._id === floorId);
    if (flr && flr.rooms) {
      const rm = flr.rooms.find(r => r.roomId === roomId);
      if (rm) {
        Object.assign(rm, updates);
        if (!updatedFloor) updatedFloor = flr;
      }
    }

    syncService.broadcast('indoor:room_updated', { floorId, roomId, updates });
    res.json({ success: true, data: updatedFloor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { floorId, roomId } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      await Floor.findOneAndUpdate(
        getFloorQuery(floorId),
        { $pull: { rooms: { roomId } } }
      );
    }

    const memFloor = memoryFloors.find(f => f.floorId === floorId || f._id === floorId);
    if (memFloor && memFloor.rooms) {
      memFloor.rooms = memFloor.rooms.filter(r => r.roomId !== roomId);
    }

    syncService.broadcast('indoor:room_deleted', { floorId, roomId });
    res.json({ success: true, message: `Room ${roomId} deleted from floor ${floorId}.` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Indoor Graph & Navigation APIs
export const getIndoorGraph = async (req, res) => {
  try {
    const { buildingId, floorNumber } = req.query;
    let nodes = [...memoryIndoorNodes];
    let paths = [...memoryIndoorPaths];

    if (buildingId) {
      const matchedKey = Object.keys(CAMPUS_BLOCKS_INFO).find(k => isBuildingMatch(k, buildingId));
      const targetBldId = matchedKey ? CAMPUS_BLOCKS_INFO[matchedKey].buildingId : buildingId;

      nodes = nodes.filter(n => n.buildingId === targetBldId || (targetBldId === 'bld_som_block' && n.buildingId === 'bld_m_block'));
      paths = paths.filter(p => p.buildingId === targetBldId || (targetBldId === 'bld_som_block' && p.buildingId === 'bld_m_block'));
    }
    if (floorNumber !== undefined) {
      const flNum = parseInt(floorNumber);
      nodes = nodes.filter(n => n.floorNumber === flNum);
      paths = paths.filter(p => p.floorNumber === flNum);
    }

    res.json({
      success: true,
      data: { nodes, paths }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Indoor Graph Dijkstra / A* Routing Engine
 */
export const calculateIndoorRoute = async (req, res) => {
  try {
    const {
      buildingId = 'bld_d_block',
      startNodeId,
      destNodeId,
      startRoomId,
      destRoomId,
      accessibleOnly = false
    } = req.body;

    const matchedKey = Object.keys(CAMPUS_BLOCKS_INFO).find(k => isBuildingMatch(k, buildingId));
    const targetBldId = matchedKey ? CAMPUS_BLOCKS_INFO[matchedKey].buildingId : 'bld_d_block';

    const nodes = memoryIndoorNodes.filter(n => n.buildingId === targetBldId || (targetBldId === 'bld_som_block' && n.buildingId === 'bld_m_block'));
    const paths = memoryIndoorPaths.filter(p => p.buildingId === targetBldId || (targetBldId === 'bld_som_block' && p.buildingId === 'bld_m_block'));

    // Resolve start node
    let startNode = nodes.find(n => n.nodeId === startNodeId);
    if (!startNode && startRoomId) {
      startNode = nodes.find(n => n.linkedRoomId === startRoomId);
    }
    if (!startNode) {
      startNode = nodes.find(n => n.nodeType === 'building_entrance' && n.floorNumber === 0) || nodes[0];
    }

    // Resolve destination node
    let destNode = nodes.find(n => n.nodeId === destNodeId);
    if (!destNode && destRoomId) {
      destNode = nodes.find(n => n.linkedRoomId === destRoomId);
    }
    if (!destNode && destRoomId) {
      destNode = nodes.find(n => n.nodeId.toLowerCase().includes(destRoomId.toLowerCase()));
    }
    if (!destNode) {
      return res.status(400).json({ success: false, message: 'Valid destination node or room required.' });
    }

    // Single-Floor vs Multi-Floor Routing
    const isMultiFloor = startNode.floorNumber !== destNode.floorNumber;

    if (!isMultiFloor) {
      const result = solveIndoorDijkstra(nodes, paths, startNode.nodeId, destNode.nodeId, accessibleOnly);
      if (!result) {
        return res.status(404).json({ success: false, message: 'No indoor path found on this floor.' });
      }

      return res.json({
        success: true,
        data: {
          isMultiFloor: false,
          floorNumber: startNode.floorNumber,
          totalDistanceMeters: Math.round(result.distance * 10) / 10,
          estimatedWalkingMinutes: Math.max(1, Math.ceil(result.distance / 50)),
          nodeSequence: result.nodeSequence,
          instructions: generateIndoorInstructions(result.nodeSequence, nodes)
        }
      });
    } else {
      const startTransitionNode = nodes.find(
        n => n.floorNumber === startNode.floorNumber &&
             (accessibleOnly ? n.nodeType === 'elevator' : (n.nodeType === 'elevator' || n.nodeType === 'staircase'))
      );
      const destTransitionNode = nodes.find(
        n => n.floorNumber === destNode.floorNumber &&
             (n.nodeType === startTransitionNode?.nodeType || n.nodeType === 'elevator' || n.nodeType === 'staircase')
      );

      if (!startTransitionNode || !destTransitionNode) {
        return res.status(404).json({ success: false, message: 'No vertical connection (stairs/elevator) found connecting these floors.' });
      }

      const leg1 = solveIndoorDijkstra(nodes, paths, startNode.nodeId, startTransitionNode.nodeId, accessibleOnly) || { distance: 10, nodeSequence: [startNode.nodeId, startTransitionNode.nodeId] };
      const leg2 = solveIndoorDijkstra(nodes, paths, destTransitionNode.nodeId, destNode.nodeId, accessibleOnly) || { distance: 10, nodeSequence: [destTransitionNode.nodeId, destNode.nodeId] };

      const floorDiff = Math.abs(destNode.floorNumber - startNode.floorNumber);
      const verticalDistance = floorDiff * 8;
      const totalDistance = leg1.distance + leg2.distance + verticalDistance;

      const fullInstructions = [
        ...generateIndoorInstructions(leg1.nodeSequence, nodes),
        `Take ${startTransitionNode.name} to Floor ${destNode.floorNumber} (${floorDiff} level${floorDiff > 1 ? 's' : ''} up/down).`,
        ...generateIndoorInstructions(leg2.nodeSequence, nodes)
      ];

      return res.json({
        success: true,
        data: {
          isMultiFloor: true,
          startFloor: startNode.floorNumber,
          destFloor: destNode.floorNumber,
          totalDistanceMeters: Math.round(totalDistance * 10) / 10,
          estimatedWalkingMinutes: Math.max(2, Math.ceil(totalDistance / 50)),
          legs: [
            { floorNumber: startNode.floorNumber, nodeSequence: leg1.nodeSequence },
            { floorNumber: destNode.floorNumber, nodeSequence: leg2.nodeSequence }
          ],
          instructions: fullInstructions
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function solveIndoorDijkstra(nodes, paths, startId, destId, accessibleOnly = false) {
  const nodeMap = new Map(nodes.map(n => [n.nodeId, n]));
  if (!nodeMap.has(startId) || !nodeMap.has(destId)) return null;

  const adj = new Map();
  nodes.forEach(n => adj.set(n.nodeId, []));

  paths.forEach(p => {
    if (accessibleOnly && !p.isAccessible) return;
    if (adj.has(p.fromNodeId) && adj.has(p.toNodeId)) {
      adj.get(p.fromNodeId).push({ to: p.toNodeId, dist: p.distanceMeters || 5 });
      if (p.isBidirectional !== false) {
        adj.get(p.toNodeId).push({ to: p.fromNodeId, dist: p.distanceMeters || 5 });
      }
    }
  });

  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set(nodes.map(n => n.nodeId));

  nodes.forEach(n => distances.set(n.nodeId, Infinity));
  distances.set(startId, 0);

  while (unvisited.size > 0) {
    let current = null;
    let shortest = Infinity;
    for (const nodeId of unvisited) {
      const d = distances.get(nodeId);
      if (d < shortest) {
        shortest = d;
        current = nodeId;
      }
    }

    if (current === null || shortest === Infinity) break;
    if (current === destId) break;

    unvisited.delete(current);

    const neighbors = adj.get(current) || [];
    for (const edge of neighbors) {
      if (unvisited.has(edge.to)) {
        const alt = distances.get(current) + edge.dist;
        if (alt < distances.get(edge.to)) {
          distances.set(edge.to, alt);
          previous.set(edge.to, current);
        }
      }
    }
  }

  if (distances.get(destId) === Infinity) return null;

  const nodeSequence = [];
  let curr = destId;
  while (curr) {
    nodeSequence.unshift(curr);
    curr = previous.get(curr);
  }

  return {
    distance: distances.get(destId),
    nodeSequence
  };
}

function generateIndoorInstructions(nodeSequence, nodes) {
  if (!nodeSequence || nodeSequence.length < 2) return ['Arrived at destination.'];
  const nodeMap = new Map(nodes.map(n => [n.nodeId, n]));
  const steps = [];

  const first = nodeMap.get(nodeSequence[0]);
  if (first) {
    steps.push(`Start from ${first.name}.`);
  }

  for (let i = 1; i < nodeSequence.length - 1; i++) {
    const curr = nodeMap.get(nodeSequence[i]);
    if (curr && (curr.nodeType === 'corridor_junction' || curr.nodeType === 'elevator' || curr.nodeType === 'staircase')) {
      steps.push(`Continue via ${curr.name}.`);
    }
  }

  const last = nodeMap.get(nodeSequence[nodeSequence.length - 1]);
  if (last) {
    steps.push(`Reach entrance of ${last.name}.`);
  }

  return steps;
}
