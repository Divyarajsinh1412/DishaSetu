/**
 * D Block (Engineering & Labs) Multi-Floor Indoor Dataset
 * Institution: Presidency University, Bengaluru
 *
 * Rules:
 * - All rooms are LABS (Laboratory)
 * - Ground Floor: DGL01, DGL02, DGL03, DGL04...
 * - First Floor: DFL01, DFL02, DFL03...
 * - Second Floor: DSL01, DSL02, DSL03...
 */

import {
  generateAllFloorsForBuilding,
  generateBlockFloor,
  generateBlockIndoorGraph,
  CAMPUS_BLOCKS_INFO
} from './campusFloorsDataset.js';

export const D_BLOCK_BUILDING_INFO = CAMPUS_BLOCKS_INFO.bld_d_block;

export function generateDBlockFloor(floorNumber) {
  return generateBlockFloor('bld_d_block', floorNumber);
}

export function generateDBlockGraph() {
  return generateBlockIndoorGraph('bld_d_block');
}

export const D_BLOCK_ALL_FLOORS = generateAllFloorsForBuilding('bld_d_block');

export default D_BLOCK_ALL_FLOORS;
