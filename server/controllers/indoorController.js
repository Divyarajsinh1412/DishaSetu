import Floor from '../models/Floor.js';
import Room from '../models/Room.js';
import IndoorNode from '../models/IndoorNode.js';
import IndoorPath from '../models/IndoorPath.js';
import { getDbStatus } from '../config/db.js';
import syncService from '../services/syncService.js';

// In-memory initial floor datasets
let memoryFloors = [
  {
    floorId: 'flr_cse_g',
    buildingId: 'bld_cse',
    buildingShortCode: 'CSE',
    floorNumber: 0,
    floorName: 'Ground Floor (Level 0)',
    planImageUrl: null,
    dimensions: { widthMeters: 80, heightMeters: 50, scalePixelsPerMeter: 10 },
    rooms: [
      { roomId: 'rm_cse_g01', roomNumber: 'G-01', name: 'Computer Architecture Lab', category: 'Laboratory', department: 'Computer Science', bounds: { x: 50, y: 50, width: 140, height: 100 }, entrancePoint: { x: 120, y: 150 }, qrCodeId: 'QR-CSE-G01', isAccessible: true },
      { roomId: 'rm_cse_g02', roomNumber: 'G-02', name: 'Data Structures & Algorithms Lab', category: 'Laboratory', department: 'Computer Science', bounds: { x: 210, y: 50, width: 140, height: 100 }, entrancePoint: { x: 280, y: 150 }, qrCodeId: 'QR-CSE-G02', isAccessible: true },
      { roomId: 'rm_cse_g03', roomNumber: 'G-03', name: 'Department Head (HOD) Office', category: 'Faculty Office', department: 'Computer Science', bounds: { x: 370, y: 50, width: 120, height: 100 }, entrancePoint: { x: 430, y: 150 }, qrCodeId: 'QR-CSE-G03', isAccessible: true },
      { roomId: 'rm_cse_g04', roomNumber: 'G-04', name: 'Lecture Hall 1 (Multimedia)', category: 'Classroom', department: 'Computer Science', bounds: { x: 510, y: 50, width: 160, height: 100 }, entrancePoint: { x: 590, y: 150 }, qrCodeId: 'QR-CSE-G04', isAccessible: true }
    ],
    staircases: [
      { stairId: 'stair_cse_east', name: 'East Wing Main Staircase', x: 700, y: 150, connectsFloors: [0, 1, 2, 3] },
      { stairId: 'stair_cse_west', name: 'West Wing Fire Exit Staircase', x: 30, y: 150, connectsFloors: [0, 1, 2, 3], isEmergencyExit: true }
    ],
    elevators: [
      { elevatorId: 'lift_cse_central', name: 'Central Passenger Elevator', x: 350, y: 220, connectsFloors: [0, 1, 2, 3], isAccessible: true }
    ],
    emergencyExits: [
      { exitId: 'exit_cse_g_main', name: 'Ground Floor Main Quad Exit', x: 350, y: 260, leadsToOutdoor: true }
    ],
    status: 'published'
  },
  {
    floorId: 'flr_cse_1',
    buildingId: 'bld_cse',
    buildingShortCode: 'CSE',
    floorNumber: 1,
    floorName: 'First Floor (Level 1)',
    planImageUrl: null,
    dimensions: { widthMeters: 80, heightMeters: 50, scalePixelsPerMeter: 10 },
    rooms: [
      { roomId: 'rm_cse_101', roomNumber: '101', name: 'AI & Machine Learning Innovation Lab', category: 'Laboratory', department: 'Computer Science', bounds: { x: 50, y: 50, width: 150, height: 100 }, entrancePoint: { x: 125, y: 150 }, qrCodeId: 'QR-CSE-101', isAccessible: true },
      { roomId: 'rm_cse_102', roomNumber: '102', name: 'Cloud Computing & Cyber Security Lab', category: 'Laboratory', department: 'Computer Science', bounds: { x: 220, y: 50, width: 150, height: 100 }, entrancePoint: { x: 295, y: 150 }, qrCodeId: 'QR-CSE-102', isAccessible: true },
      { roomId: 'rm_cse_103', roomNumber: '103', name: 'Faculty Cabin & Research Area', category: 'Faculty Office', department: 'Computer Science', bounds: { x: 390, y: 50, width: 130, height: 100 }, entrancePoint: { x: 455, y: 150 }, qrCodeId: 'QR-CSE-103', isAccessible: true },
      { roomId: 'rm_cse_104', roomNumber: '104', name: 'Interactive Seminar Room 104', category: 'Seminar Hall', department: 'Computer Science', bounds: { x: 540, y: 50, width: 140, height: 100 }, entrancePoint: { x: 610, y: 150 }, qrCodeId: 'QR-CSE-104', isAccessible: true }
    ],
    staircases: [
      { stairId: 'stair_cse_east', name: 'East Wing Main Staircase', x: 700, y: 150, connectsFloors: [0, 1, 2, 3] },
      { stairId: 'stair_cse_west', name: 'West Wing Fire Exit Staircase', x: 30, y: 150, connectsFloors: [0, 1, 2, 3], isEmergencyExit: true }
    ],
    elevators: [
      { elevatorId: 'lift_cse_central', name: 'Central Passenger Elevator', x: 350, y: 220, connectsFloors: [0, 1, 2, 3], isAccessible: true }
    ],
    emergencyExits: [],
    status: 'published'
  }
];

// Initial memory indoor nodes
let memoryIndoorNodes = [
  // Ground Floor Nodes
  { nodeId: 'in_cse_g_ent', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, name: 'Main Ground Entrance', nodeType: 'building_entrance', coordinates: { x: 350, y: 260 }, linkedOutdoorNodeId: 'node_d_block_entrance', connectsFloors: [], isAccessible: true, active: true },
  { nodeId: 'in_cse_g_cor_center', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, name: 'Central Corridor Hub', nodeType: 'corridor_junction', coordinates: { x: 350, y: 150 }, linkedOutdoorNodeId: null, connectsFloors: [], isAccessible: true, active: true },
  { nodeId: 'in_cse_g_lift', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, name: 'Central Elevator G', nodeType: 'elevator', coordinates: { x: 350, y: 220 }, linkedOutdoorNodeId: null, connectsFloors: [0, 1, 2, 3], isAccessible: true, active: true },
  { nodeId: 'in_cse_g_stair_east', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, name: 'East Staircase G', nodeType: 'staircase', coordinates: { x: 700, y: 150 }, linkedOutdoorNodeId: null, connectsFloors: [0, 1, 2, 3], isAccessible: false, active: true },
  { nodeId: 'in_cse_g_rm_g01', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, name: 'Door G-01 Computer Arch', nodeType: 'room_entrance', coordinates: { x: 120, y: 150 }, linkedRoomId: 'rm_cse_g01', connectsFloors: [], isAccessible: true, active: true },
  { nodeId: 'in_cse_g_rm_g02', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, name: 'Door G-02 DSA Lab', nodeType: 'room_entrance', coordinates: { x: 280, y: 150 }, linkedRoomId: 'rm_cse_g02', connectsFloors: [], isAccessible: true, active: true },
  { nodeId: 'in_cse_g_rm_g03', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, name: 'Door G-03 HOD Office', nodeType: 'room_entrance', coordinates: { x: 430, y: 150 }, linkedRoomId: 'rm_cse_g03', connectsFloors: [], isAccessible: true, active: true },
  { nodeId: 'in_cse_g_rm_g04', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, name: 'Door G-04 Lecture Hall', nodeType: 'room_entrance', coordinates: { x: 590, y: 150 }, linkedRoomId: 'rm_cse_g04', connectsFloors: [], isAccessible: true, active: true },

  // Floor 1 Nodes
  { nodeId: 'in_cse_1_cor_center', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, name: 'First Floor Corridor Hub', nodeType: 'corridor_junction', coordinates: { x: 350, y: 150 }, linkedOutdoorNodeId: null, connectsFloors: [], isAccessible: true, active: true },
  { nodeId: 'in_cse_1_lift', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, name: 'Central Elevator 1st Floor', nodeType: 'elevator', coordinates: { x: 350, y: 220 }, linkedOutdoorNodeId: null, connectsFloors: [0, 1, 2, 3], isAccessible: true, active: true },
  { nodeId: 'in_cse_1_stair_east', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, name: 'East Staircase 1st Floor', nodeType: 'staircase', coordinates: { x: 700, y: 150 }, linkedOutdoorNodeId: null, connectsFloors: [0, 1, 2, 3], isAccessible: false, active: true },
  { nodeId: 'in_cse_1_rm_101', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, name: 'Door 101 AI/ML Lab', nodeType: 'room_entrance', coordinates: { x: 125, y: 150 }, linkedRoomId: 'rm_cse_101', connectsFloors: [], isAccessible: true, active: true },
  { nodeId: 'in_cse_1_rm_102', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, name: 'Door 102 Cloud Lab', nodeType: 'room_entrance', coordinates: { x: 295, y: 150 }, linkedRoomId: 'rm_cse_102', connectsFloors: [], isAccessible: true, active: true },
  { nodeId: 'in_cse_1_rm_103', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, name: 'Door 103 Faculty Cabin', nodeType: 'room_entrance', coordinates: { x: 455, y: 150 }, linkedRoomId: 'rm_cse_103', connectsFloors: [], isAccessible: true, active: true },
  { nodeId: 'in_cse_1_rm_104', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, name: 'Door 104 Seminar Room', nodeType: 'room_entrance', coordinates: { x: 610, y: 150 }, linkedRoomId: 'rm_cse_104', connectsFloors: [], isAccessible: true, active: true }
];

// Initial memory indoor paths
let memoryIndoorPaths = [
  // Ground Floor Connections
  { pathId: 'ip_g_ent_hub', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, fromNodeId: 'in_cse_g_ent', toNodeId: 'in_cse_g_lift', distanceMeters: 4.0, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
  { pathId: 'ip_g_lift_hub', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, fromNodeId: 'in_cse_g_lift', toNodeId: 'in_cse_g_cor_center', distanceMeters: 7.0, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
  { pathId: 'ip_g_hub_g02', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, fromNodeId: 'in_cse_g_cor_center', toNodeId: 'in_cse_g_rm_g02', distanceMeters: 7.0, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
  { pathId: 'ip_g_g02_g01', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, fromNodeId: 'in_cse_g_rm_g02', toNodeId: 'in_cse_g_rm_g01', distanceMeters: 16.0, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
  { pathId: 'ip_g_hub_g03', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, fromNodeId: 'in_cse_g_cor_center', toNodeId: 'in_cse_g_rm_g03', distanceMeters: 8.0, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
  { pathId: 'ip_g_g03_g04', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, fromNodeId: 'in_cse_g_rm_g03', toNodeId: 'in_cse_g_rm_g04', distanceMeters: 16.0, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
  { pathId: 'ip_g_g04_stair', buildingId: 'bld_cse', floorId: 'flr_cse_g', floorNumber: 0, fromNodeId: 'in_cse_g_rm_g04', toNodeId: 'in_cse_g_stair_east', distanceMeters: 11.0, isAccessible: true, isBidirectional: true, pathType: 'corridor' },

  // First Floor Connections
  { pathId: 'ip_1_lift_hub', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, fromNodeId: 'in_cse_1_lift', toNodeId: 'in_cse_1_cor_center', distanceMeters: 7.0, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
  { pathId: 'ip_1_hub_102', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, fromNodeId: 'in_cse_1_cor_center', toNodeId: 'in_cse_1_rm_102', distanceMeters: 5.5, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
  { pathId: 'ip_1_102_101', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, fromNodeId: 'in_cse_1_rm_102', toNodeId: 'in_cse_1_rm_101', distanceMeters: 17.0, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
  { pathId: 'ip_1_hub_103', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, fromNodeId: 'in_cse_1_cor_center', toNodeId: 'in_cse_1_rm_103', distanceMeters: 10.5, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
  { pathId: 'ip_1_103_104', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, fromNodeId: 'in_cse_1_rm_103', toNodeId: 'in_cse_1_rm_104', distanceMeters: 15.5, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
  { pathId: 'ip_1_104_stair', buildingId: 'bld_cse', floorId: 'flr_cse_1', floorNumber: 1, fromNodeId: 'in_cse_1_rm_104', toNodeId: 'in_cse_1_stair_east', distanceMeters: 9.0, isAccessible: true, isBidirectional: true, pathType: 'corridor' }
];

// Controller Handlers
export const getFloors = async (req, res) => {
  try {
    const { buildingId } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const query = {};
      if (buildingId) query.buildingId = buildingId;
      const floors = await Floor.find(query).sort({ floorNumber: 1 });
      if (floors && floors.length > 0) {
        return res.json({ success: true, count: floors.length, data: floors });
      }
    }

    let list = [...memoryFloors];
    if (buildingId) list = list.filter(f => f.buildingId === buildingId);
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
      const floor = await Floor.findOne({ $or: [{ floorId: id }, { _id: id }] });
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
        { $or: [{ floorId: id }, { _id: id }] },
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
      await Floor.findOneAndDelete({ $or: [{ floorId: id }, { _id: id }] });
    }

    const idx = memoryFloors.findIndex(f => f.floorId === id || f._id === id);
    if (idx !== -1) memoryFloors.splice(idx, 1);

    syncService.broadcast('indoor:floor_deleted', { floorId: id });
    res.json({ success: true, message: `Floor ${id} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Indoor Graph & Navigation APIs
export const getIndoorGraph = async (req, res) => {
  try {
    const { buildingId, floorNumber } = req.query;
    let nodes = [...memoryIndoorNodes];
    let paths = [...memoryIndoorPaths];

    if (buildingId) {
      nodes = nodes.filter(n => n.buildingId === buildingId);
      paths = paths.filter(p => p.buildingId === buildingId);
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
 * PHASE 8 & 10: Indoor Graph Dijkstra / A* Routing Engine
 * Supports room-to-room, entrance-to-room, and multi-floor elevator/staircase routing.
 */
export const calculateIndoorRoute = async (req, res) => {
  try {
    const {
      buildingId,
      startNodeId,
      destNodeId,
      startRoomId,
      destRoomId,
      accessibleOnly = false
    } = req.body;

    const nodes = memoryIndoorNodes.filter(n => !buildingId || n.buildingId === buildingId);
    const paths = memoryIndoorPaths.filter(p => !buildingId || p.buildingId === buildingId);

    // Resolve start node
    let startNode = nodes.find(n => n.nodeId === startNodeId);
    if (!startNode && startRoomId) {
      startNode = nodes.find(n => n.linkedRoomId === startRoomId);
    }
    if (!startNode) {
      // Default to ground floor entrance
      startNode = nodes.find(n => n.nodeType === 'building_entrance') || nodes[0];
    }

    // Resolve destination node
    let destNode = nodes.find(n => n.nodeId === destNodeId);
    if (!destNode && destRoomId) {
      destNode = nodes.find(n => n.linkedRoomId === destRoomId);
    }
    if (!destNode) {
      return res.status(400).json({ success: false, message: 'Valid destination node or room required.' });
    }

    // Single-Floor vs Multi-Floor Routing
    const isMultiFloor = startNode.floorNumber !== destNode.floorNumber;

    if (!isMultiFloor) {
      // Direct Single-Floor Dijkstra
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
      // Multi-Floor Routing via Elevator or Staircase
      const transitionType = accessibleOnly ? 'elevator' : 'elevator'; // prefer elevator/stairs
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

      // Leg 1: Start floor -> Stair/Elevator
      const leg1 = solveIndoorDijkstra(nodes, paths, startNode.nodeId, startTransitionNode.nodeId, accessibleOnly) || { distance: 5, nodeSequence: [startNode.nodeId, startTransitionNode.nodeId] };
      // Leg 2: Stair/Elevator on dest floor -> Destination
      const leg2 = solveIndoorDijkstra(nodes, paths, destTransitionNode.nodeId, destNode.nodeId, accessibleOnly) || { distance: 5, nodeSequence: [destTransitionNode.nodeId, destNode.nodeId] };

      const totalDistance = leg1.distance + leg2.distance + 15; // +15m vertical transition cost
      const fullInstructions = [
        ...generateIndoorInstructions(leg1.nodeSequence, nodes),
        `Take ${startTransitionNode.name} to Floor ${destNode.floorNumber}.`,
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

// Dijkstra Indoor Graph Solver
function solveIndoorDijkstra(nodes, paths, startId, destId, accessibleOnly = false) {
  const adj = {};
  nodes.forEach(n => { adj[n.nodeId] = []; });

  paths.forEach(p => {
    if (!p.active) return;
    if (accessibleOnly && !p.isAccessible) return;

    if (adj[p.fromNodeId]) {
      adj[p.fromNodeId].push({ to: p.toNodeId, weight: p.distanceMeters });
    }
    if (p.isBidirectional && adj[p.toNodeId]) {
      adj[p.toNodeId].push({ to: p.fromNodeId, weight: p.distanceMeters });
    }
  });

  const distances = {};
  const prev = {};
  const unvisited = new Set(nodes.map(n => n.nodeId));

  nodes.forEach(n => { distances[n.nodeId] = Infinity; });
  distances[startId] = 0;

  while (unvisited.size > 0) {
    let curr = null;
    let shortest = Infinity;
    for (const u of unvisited) {
      if (distances[u] < shortest) {
        shortest = distances[u];
        curr = u;
      }
    }

    if (curr === null || distances[curr] === Infinity) break;
    if (curr === destId) break;

    unvisited.delete(curr);

    const neighbors = adj[curr] || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.to)) continue;
      const alt = distances[curr] + neighbor.weight;
      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        prev[neighbor.to] = curr;
      }
    }
  }

  if (distances[destId] === Infinity) return null;

  const seq = [];
  let u = destId;
  while (u) {
    seq.unshift(u);
    u = prev[u];
  }

  return {
    distance: distances[destId],
    nodeSequence: seq
  };
}

function generateIndoorInstructions(nodeSeq, nodes) {
  if (!nodeSeq || nodeSeq.length === 0) return [];
  const instructions = [];
  const nodeMap = Object.fromEntries(nodes.map(n => [n.nodeId, n]));

  const start = nodeMap[nodeSeq[0]];
  instructions.push(`Depart from ${start ? start.name : 'Starting Point'}.`);

  for (let i = 1; i < nodeSeq.length - 1; i++) {
    const n = nodeMap[nodeSeq[i]];
    if (n) {
      if (n.nodeType === 'corridor_junction') {
        instructions.push(`Follow corridor past ${n.name}.`);
      } else if (n.nodeType === 'staircase' || n.nodeType === 'elevator') {
        instructions.push(`Proceed to ${n.name}.`);
      }
    }
  }

  const end = nodeMap[nodeSeq[nodeSeq.length - 1]];
  instructions.push(`Arrive at destination: ${end ? end.name : 'Destination'}.`);

  return instructions;
}
