/**
 * D Block (Engineering & Labs) Multi-Floor Indoor Dataset Fallback
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
  CAMPUS_BLOCKS_INFO
} from './campusFloorsDataset';

export const D_BLOCK_INFO = CAMPUS_BLOCKS_INFO.bld_d_block;

export function generateFallbackDBlockFloors() {
  return generateAllFloorsForBuilding('bld_d_block');
}

export const D_BLOCK_FALLBACK_FLOORS = generateFallbackDBlockFloors();

export default D_BLOCK_FALLBACK_FLOORS;
