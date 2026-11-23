/**
 * DISHASETU: Client-Side Routing & Navigation Engine
 * Presidency University Bengaluru
 */

import {
  NAVIGATION_NODES,
  WALKING_PATHS,
  haversineDistance,
  calculateBearing,
  getCompassDirection,
  getTurnInstruction
} from './pedestrianGraphData';
import { COMPLETE_CAMPUS_CATALOG } from './campusCatalog';

export class ClientRoutingEngine {
  constructor(nodes = NAVIGATION_NODES, paths = WALKING_PATHS) {
    this.nodes = [...nodes];
    this.paths = [...paths];
    this.nodeMap = new Map();
    this.nodes.forEach(n => this.nodeMap.set(n.nodeId, n));
    this.speechSynth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  }

  updateGraph(nodes, paths) {
    if (nodes) {
      this.nodes = [...nodes];
      this.nodeMap.clear();
      this.nodes.forEach(n => this.nodeMap.set(n.nodeId, n));
    }
    if (paths) {
      this.paths = [...paths];
    }
  }

  findNearestNode(coords, accessibleOnly = false) {
    if (!coords) return null;
    const lat = Array.isArray(coords) ? coords[0] : (coords.lat != null ? coords.lat : coords.latitude);
    const lng = Array.isArray(coords) ? coords[1] : (coords.lng != null ? coords.lng : coords.longitude);

    let nearest = null;
    let minDistance = Infinity;

    for (const node of this.nodes) {
      if (accessibleOnly && !node.isAccessible) continue;
      const dist = haversineDistance([lat, lng], node.coordinates);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { ...node, snapDistanceMeters: dist };
      }
    }
    return nearest;
  }

  resolveNode(target, fallbackCoords = null, accessibleOnly = false) {
    if (!target && !fallbackCoords) return null;

    // 0. Coordinate string match e.g. "13.1717995,77.5361915"
    if (typeof target === 'string' && target.includes(',')) {
      const parts = target.split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const nearest = this.findNearestNode(parts[0], parts[1], accessibleOnly);
        if (nearest) return nearest;
      }
    }

    if (typeof target === 'string' && this.nodeMap.has(target)) {
      return this.nodeMap.get(target);
    }

    // 2. Associated Location ID & Building ID match
    if (typeof target === 'string') {
      const normalizedTarget = target.trim();
      const locId = normalizedTarget.startsWith('bld_')
          ? normalizedTarget.replace('bld_', 'loc_')
          : (normalizedTarget.startsWith('feat_') ? normalizedTarget.replace('feat_', 'loc_') : normalizedTarget);
      const byLoc = this.nodes.find(n => n.associatedLocationId === locId || n.associatedLocationId === normalizedTarget);
      if (byLoc) return byLoc;

      // Check node entrance pattern e.g. bld_d_block -> node_d_block_ent
      const entNodeId = normalizedTarget.startsWith('bld_')
          ? normalizedTarget.replace('bld_', 'node_') + '_ent'
          : `node_${normalizedTarget}_ent`;
      if (this.nodeMap.has(entNodeId)) return this.nodeMap.get(entNodeId);

      // Check common building block & campus keywords
      const lower = normalizedTarget.toLowerCase();
      if (lower.includes('d_block') || lower.includes('d-block') || lower === 'd block' || lower === 'pu-d-block') {
        const n = this.nodeMap.get('node_d_block_ent');
        if (n) return n;
      }
      if (lower.includes('e_block') || lower.includes('e-block') || lower === 'e block' || lower === 'pu-e-block') {
        const n = this.nodeMap.get('node_e_block_ent');
        if (n) return n;
      }
      if (lower.includes('f_block') || lower.includes('f-block') || lower === 'f block' || lower === 'pu-f-block') {
        const n = this.nodeMap.get('node_f_block_ent');
        if (n) return n;
      }
      if (lower.includes('l_block') || lower.includes('l-block') || lower === 'l block' || lower === 'pu-l-block') {
        const n = this.nodeMap.get('node_l_block_ent');
        if (n) return n;
      }
      if (lower.includes('n_block') || lower.includes('n-block') || lower === 'n block' || lower === 'pu-n-block') {
        const n = this.nodeMap.get('node_n_block_ent');
        if (n) return n;
      }
      if (lower.includes('som') || lower.includes('m_block') || lower.includes('m-block') || lower === 'm block' || lower === 'pu-m-block') {
        const n = this.nodeMap.get('node_j_block_ent');
        if (n) return n;
      }
      if (lower.includes('gate') || lower.includes('main_gate') || lower.includes('pu-gate-01')) {
        const n = this.nodeMap.get('node_main_gate');
        if (n) return n;
      }
      if (lower.includes('hr_block') || lower.includes('hr-block') || lower.includes('hr block') || lower.includes('hr blocks') || lower === 'hr' || lower === 'pu-hr-block') {
        const n = this.nodeMap.get('node_hr_block_ent');
        if (n) return n;
      }
      if (lower.includes('h_block') || lower.includes('h-block') || lower === 'h block' || lower === 'pu-h-block' || lower === 'bld_h_block' || lower === 'loc_h_block') {
        const n = this.nodeMap.get('node_h_block_ent');
        if (n) return n;
      }
      if (lower.includes('admission') || lower.includes('registrar') || lower === 'bld_admission_register') {
        const n = this.nodeMap.get('node_h_block_ent');
        if (n) return n;
      }
      if (lower.includes('cafe') || lower.includes('hatti') || lower.includes('pu-cafe')) {
        const n = this.nodeMap.get('node_cafeteria_ent') || this.nodeMap.get('node_d_block_ent');
        if (n) return n;
      }
      if (lower.includes('food_court') || lower.includes('food court')) {
        const n = this.nodeMap.get('node_food_court_ent');
        if (n) return n;
      }
      if (lower.includes('auditorium')) {
        const n = this.nodeMap.get('node_auditorium_ent');
        if (n) return n;
      }
      if (lower.includes('library')) {
        const n = this.nodeMap.get('node_library_ent');
        if (n) return n;
      }
      if (lower.includes('health') || lower.includes('medical')) {
        const n = this.nodeMap.get('node_medical_ent');
        if (n) return n;
      }
      if (lower.includes('fountain')) {
        const n = this.nodeMap.get('node_fountain_plaza');
        if (n) return n;
      }
      if (lower.includes('lawn')) {
        const n = this.nodeMap.get('node_avenue_mid') || this.nodeMap.get('node_fountain_plaza');
        if (n) return n;
      }
    }

    if (typeof target === 'string') {
      const catItem = COMPLETE_CAMPUS_CATALOG.find(
        c => c.shortCode?.toLowerCase() === target.toLowerCase() ||
             c.locationId?.toLowerCase() === target.toLowerCase() ||
             c.name?.toLowerCase().includes(target.toLowerCase())
      );
      if (catItem) {
        const byCatLoc = this.nodes.find(n => n.associatedLocationId === catItem.locationId);
        if (byCatLoc) return byCatLoc;
        if (catItem.entranceCoordinates || catItem.coordinates) {
          return this.findNearestNode(catItem.entranceCoordinates || catItem.coordinates, accessibleOnly);
        }
      }
    }

    if (typeof target === 'object' && target !== null) {
      if (target.nodeId && this.nodeMap.has(target.nodeId)) {
        return this.nodeMap.get(target.nodeId);
      }
      if (target.coordinates) {
        return this.findNearestNode(target.coordinates, accessibleOnly);
      }
      if (target.lat != null && target.lng != null) {
        return this.findNearestNode(target, accessibleOnly);
      }
    }

    if (fallbackCoords) {
      return this.findNearestNode(fallbackCoords, accessibleOnly);
    }

    return null;
  }

  calculateRoute({
    start,
    destination,
    accessibleOnly = false,
    startCoords = null,
    destCoords = null,
    startName = null,
    destName = null
  }) {
    const startNode = this.resolveNode(start, startCoords, accessibleOnly);
    const endNode = this.resolveNode(destination, destCoords, accessibleOnly);

    if (!startNode) {
      throw new Error(`Start origin could not be resolved to a campus navigation node.`);
    }
    if (!endNode) {
      throw new Error(`Destination could not be resolved to a campus navigation node.`);
    }

    if (startNode.nodeId === endNode.nodeId) {
      return {
        routeId: `route_${Date.now()}`,
        startNode,
        endNode,
        startLocation: { name: startName || startNode.name, coordinates: startNode.coordinates },
        endLocation: { name: destName || endNode.name, coordinates: endNode.coordinates },
        distanceMeters: 0,
        estimatedWalkingMinutes: 0,
        accessible: true,
        geometry: [startNode.coordinates],
        waypoints: [
          {
            stepIndex: 1,
            instruction: `You are already at ${destName || endNode.name}.`,
            distanceMeters: 0,
            turnType: 'arrive',
            landmark: endNode.name
          }
        ]
      };
    }

    const adj = new Map();
    this.nodes.forEach(n => adj.set(n.nodeId, []));

    for (const path of this.paths) {
      if (path.status !== 'active') continue;
      if (accessibleOnly && path.accessibility === false) continue;

      if (adj.has(path.startNode) && adj.has(path.endNode)) {
        const dist = path.distanceMeters || haversineDistance(
          this.nodeMap.get(path.startNode).coordinates,
          this.nodeMap.get(path.endNode).coordinates
        );

        adj.get(path.startNode).push({
          neighbor: path.endNode,
          weight: dist,
          path,
          forward: true
        });
        adj.get(path.endNode).push({
          neighbor: path.startNode,
          weight: dist,
          path,
          forward: false
        });
      }
    }

    const distances = new Map();
    const previous = new Map();
    const visited = new Set();

    this.nodes.forEach(n => distances.set(n.nodeId, Infinity));
    distances.set(startNode.nodeId, 0);

    while (visited.size < this.nodes.length) {
      let currentId = null;
      let smallestDist = Infinity;

      for (const [nodeId, dist] of distances.entries()) {
        if (!visited.has(nodeId) && dist < smallestDist) {
          smallestDist = dist;
          currentId = nodeId;
        }
      }

      if (currentId === null || smallestDist === Infinity) break;
      if (currentId === endNode.nodeId) break;

      visited.add(currentId);

      const neighbors = adj.get(currentId) || [];
      for (const edge of neighbors) {
        if (visited.has(edge.neighbor)) continue;
        const alt = distances.get(currentId) + edge.weight;
        if (alt < distances.get(edge.neighbor)) {
          distances.set(edge.neighbor, alt);
          previous.set(edge.neighbor, {
            nodeId: currentId,
            edge
          });
        }
      }
    }

    if (!previous.has(endNode.nodeId) && startNode.nodeId !== endNode.nodeId) {
      throw new Error(`No pedestrian path found between "${startNode.name}" and "${endNode.name}"${accessibleOnly ? ' with wheelchair accessibility enabled.' : '.'}`);
    }

    const nodeSequence = [];
    const edgeSequence = [];
    let curr = endNode.nodeId;

    while (curr !== startNode.nodeId) {
      nodeSequence.unshift(this.nodeMap.get(curr));
      const prevStep = previous.get(curr);
      edgeSequence.unshift(prevStep.edge);
      curr = prevStep.nodeId;
    }
    nodeSequence.unshift(startNode);

    const fullGeometry = [];
    for (let i = 0; i < edgeSequence.length; i++) {
      const { path, forward } = edgeSequence[i];
      let geom = path.geometry && path.geometry.length > 0
        ? [...path.geometry]
        : [this.nodeMap.get(path.startNode).coordinates, this.nodeMap.get(path.endNode).coordinates];

      if (!forward) {
        geom.reverse();
      }

      if (fullGeometry.length > 0 && geom.length > 0) {
        fullGeometry.push(...geom.slice(1));
      } else {
        fullGeometry.push(...geom);
      }
    }

    const totalDistanceMeters = distances.get(endNode.nodeId);
    const estimatedWalkingMinutes = Math.max(1, Math.round(totalDistanceMeters / 78));

    const waypoints = [];
    let currentBearing = null;

    for (let i = 0; i < edgeSequence.length; i++) {
      const fromNode = nodeSequence[i];
      const toNode = nodeSequence[i + 1];
      const edge = edgeSequence[i];
      const stepBearing = calculateBearing(fromNode.coordinates, toNode.coordinates);
      const dist = edge.weight;

      let instruction = '';
      let turnType = 'straight';

      if (i === 0) {
        const compass = getCompassDirection(stepBearing);
        instruction = `Start at ${startName || fromNode.name}, head ${compass} along ${edge.path.name}.`;
        turnType = 'depart';
      } else {
        const turnText = getTurnInstruction(currentBearing, stepBearing);
        instruction = `At ${fromNode.name}, ${turnText.toLowerCase()} onto ${edge.path.name}.`;
        if (turnText.includes('right')) turnType = 'turn-right';
        else if (turnText.includes('left')) turnType = 'turn-left';
        else turnType = 'straight';
      }

      waypoints.push({
        stepIndex: i + 1,
        instruction,
        distanceMeters: dist,
        bearing: Math.round(stepBearing),
        turnType,
        fromNode: fromNode.name,
        toNode: toNode.name,
        pathName: edge.path.name,
        landmark: toNode.name
      });

      currentBearing = stepBearing;
    }

    waypoints.push({
      stepIndex: waypoints.length + 1,
      instruction: `Arrive at destination: ${destName || endNode.name}.`,
      distanceMeters: 0,
      bearing: Math.round(currentBearing || 0),
      turnType: 'arrive',
      landmark: endNode.name
    });

    return {
      routeId: `route_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      startNode: {
        nodeId: startNode.nodeId,
        name: startName || startNode.name,
        coordinates: startNode.coordinates
      },
      endNode: {
        nodeId: endNode.nodeId,
        name: destName || endNode.name,
        coordinates: endNode.coordinates
      },
      startLocation: {
        name: startName || startNode.name,
        lat: startNode.coordinates[0],
        lng: startNode.coordinates[1]
      },
      endLocation: {
        name: destName || endNode.name,
        lat: endNode.coordinates[0],
        lng: endNode.coordinates[1]
      },
      distanceMeters: totalDistanceMeters,
      estimatedWalkingMinutes,
      accessible: edgeSequence.every(e => e.path.accessibility),
      geometry: fullGeometry,
      nodeSequence: nodeSequence.map(n => n.nodeId),
      waypoints
    };
  }

  speakInstruction(text) {
    if (!this.speechSynth || !text) return;
    try {
      this.speechSynth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN'; // Indian English cadence for Presidency University
      this.speechSynth.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
    }
  }

  stopSpeech() {
    if (this.speechSynth) {
      try {
        this.speechSynth.cancel();
      } catch {}
    }
  }
}

export const clientRoutingEngine = new ClientRoutingEngine();
export default clientRoutingEngine;
