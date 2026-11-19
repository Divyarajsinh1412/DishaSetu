/**
 * D Block (Engineering & Lecture Halls) Multi-Floor Indoor Dataset
 * Institution: Presidency University, Bengaluru
 *
 * Sourced according to official architectural reference:
 * 6 Floors: Ground, 1st, 2nd, 3rd, 4th, 5th.
 * Each floor initially features the standardized 6-room rectangular layout
 * separated by a continuous horizontal Central Corridor.
 *
 * Coordinates are normalized / architectural grid units (Canvas viewBox 0 0 960 540)
 */

export const D_BLOCK_BUILDING_INFO = {
  buildingId: 'bld_d_block',
  shortCode: 'PU-D-BLOCK',
  name: 'D Block',
  category: 'Academic',
  description: 'Instructional engineering complex, lecture halls, and design laboratories.',
  totalFloors: 6,
  departments: ['Mechanical Engineering', 'Civil Engineering', 'Robotics & Automation'],
  status: 'published'
};

const ROOM_CATEGORIES = [
  'Laboratory',
  'Laboratory',
  'Laboratory',
  'Laboratory',
  'Faculty room',
  'Classroom'
];

const DEFAULT_NAMES = {
  0: ['Engineering Mechanics Lab', 'Robotics & Automation Studio', 'Materials Testing Lab', 'Fluid Mechanics Lab', 'Faculty Consultation Room', 'Computer-Aided Design Studio'],
  1: ['Thermodynamics & Heat Transfer Lab', 'Mechatronics Systems Lab', 'Kinematics Research Lab', 'Additive Manufacturing Lab', 'Faculty Cubicles 105', 'Smart Lecture Hall 106'],
  2: ['Structural Analysis Lab', 'Environmental Engineering Lab', 'Hydraulics & Water Resources Lab', 'Geotechnical Engineering Lab', 'Department Office 205', 'Multimedia Lecture Hall 206'],
  3: ['Sensors & Instrumentation Lab', 'Advanced Manufacturing Center', 'Autonomous Systems Lab', 'Renewable Energy Lab', 'Faculty Cubicles 305', 'Interactive Seminar Room 306'],
  4: ['Computational Simulation Lab', 'Aerodynamics Testing Center', 'Vibration & Acoustics Lab', 'Product Prototyping Facility', 'Senior Faculty Lounge 405', 'Engineering Lecture Hall 406'],
  5: ['Nanotechnology Research Lab', 'Drone & Aerial Robotics Lab', 'Specialized Projects Studio', 'Innovation & Incubation Workspace', 'Dean & HoD Executive Office', 'High-Capacity Seminar Hall 506']
};

/**
 * Generates the standardized 6-room floor plan for any given floor level of D Block
 */
export function generateDBlockFloor(floorNumber) {
  const isGround = floorNumber === 0;
  const floorCodePrefix = isGround ? 'DG' : `D${floorNumber}`;
  const floorName = isGround
    ? 'Ground Floor'
    : floorNumber === 1
    ? 'First Floor'
    : floorNumber === 2
    ? 'Second Floor'
    : floorNumber === 3
    ? 'Third Floor'
    : floorNumber === 4
    ? 'Fourth Floor'
    : 'Fifth Floor';

  const floorId = `flr_d_${floorNumber}`;
  const names = DEFAULT_NAMES[floorNumber] || DEFAULT_NAMES[0];

  // Room geometry: 3 top row, central corridor, 3 bottom row
  const rooms = [
    // Top Row: DG01 / D101 / D201...
    {
      roomId: `rm_d_${floorNumber}01`,
      roomNumber: `${floorCodePrefix}01`,
      name: `${floorCodePrefix}01 – ${names[0]}`,
      category: ROOM_CATEGORIES[0],
      department: 'Mechanical Engineering',
      bounds: { x: 60, y: 50, width: 260, height: 160 },
      entrancePoint: { x: 190, y: 235 }, // Door opens into central corridor
      qrCodeId: `QR-D-${floorCodePrefix}01`,
      isAccessible: true,
      status: 'Operational'
    },
    // Top Row: DG02 / D102 / D202...
    {
      roomId: `rm_d_${floorNumber}02`,
      roomNumber: `${floorCodePrefix}02`,
      name: `${floorCodePrefix}02 – ${names[1]}`,
      category: ROOM_CATEGORIES[1],
      department: 'Robotics & Automation',
      bounds: { x: 350, y: 50, width: 260, height: 160 },
      entrancePoint: { x: 480, y: 235 },
      qrCodeId: `QR-D-${floorCodePrefix}02`,
      isAccessible: true,
      status: 'Operational'
    },
    // Top Row: DG03 / D103 / D203...
    {
      roomId: `rm_d_${floorNumber}03`,
      roomNumber: `${floorCodePrefix}03`,
      name: `${floorCodePrefix}03 – ${names[2]}`,
      category: ROOM_CATEGORIES[2],
      department: 'Mechanical Engineering',
      bounds: { x: 640, y: 50, width: 260, height: 160 },
      entrancePoint: { x: 770, y: 235 },
      qrCodeId: `QR-D-${floorCodePrefix}03`,
      isAccessible: true,
      status: 'Operational'
    },
    // Bottom Row: DG04 / D104 / D204...
    {
      roomId: `rm_d_${floorNumber}04`,
      roomNumber: `${floorCodePrefix}04`,
      name: `${floorCodePrefix}04 – ${names[3]}`,
      category: ROOM_CATEGORIES[3],
      department: 'Mechanical Engineering',
      bounds: { x: 60, y: 330, width: 260, height: 160 },
      entrancePoint: { x: 190, y: 305 }, // Door opens north into central corridor
      qrCodeId: `QR-D-${floorCodePrefix}04`,
      isAccessible: true,
      status: 'Operational'
    },
    // Bottom Row: DG05 / D105 / D205...
    {
      roomId: `rm_d_${floorNumber}05`,
      roomNumber: `${floorCodePrefix}05`,
      name: `${floorCodePrefix}05 – ${names[4]}`,
      category: ROOM_CATEGORIES[4],
      department: 'Faculty Affairs',
      bounds: { x: 350, y: 330, width: 260, height: 160 },
      entrancePoint: { x: 480, y: 305 },
      qrCodeId: `QR-D-${floorCodePrefix}05`,
      isAccessible: true,
      status: 'Operational'
    },
    // Bottom Row: DG06 / D106 / D206...
    {
      roomId: `rm_d_${floorNumber}06`,
      roomNumber: `${floorCodePrefix}06`,
      name: `${floorCodePrefix}06 – ${names[5]}`,
      category: ROOM_CATEGORIES[5],
      department: 'Civil & Mechanical',
      bounds: { x: 640, y: 330, width: 260, height: 160 },
      entrancePoint: { x: 770, y: 305 },
      qrCodeId: `QR-D-${floorCodePrefix}06`,
      isAccessible: true,
      status: 'Operational'
    }
  ];

  const staircases = [
    {
      stairId: `stair_d_east_${floorNumber}`,
      name: 'East Main Staircase',
      x: 915,
      y: 270,
      connectsFloors: [0, 1, 2, 3, 4, 5],
      isEmergencyExit: false
    },
    {
      stairId: `stair_d_west_${floorNumber}`,
      name: 'West Wing Fire Exit Staircase',
      x: 45,
      y: 270,
      connectsFloors: [0, 1, 2, 3, 4, 5],
      isEmergencyExit: true
    }
  ];

  const elevators = [
    {
      elevatorId: `lift_d_central_${floorNumber}`,
      name: 'Central High-Speed Elevator',
      x: 885,
      y: 270,
      connectsFloors: [0, 1, 2, 3, 4, 5],
      isAccessible: true
    }
  ];

  const emergencyExits = isGround
    ? [
        {
          exitId: 'exit_d_g_main',
          name: 'D Block Main Entrance & Frisking Portal',
          x: 480,
          y: 495,
          leadsToOutdoor: true
        }
      ]
    : [];

  return {
    floorId,
    buildingId: D_BLOCK_BUILDING_INFO.buildingId,
    buildingShortCode: D_BLOCK_BUILDING_INFO.shortCode,
    floorNumber,
    floorName,
    planImageUrl: null,
    dimensions: { widthMeters: 72, heightMeters: 36, scalePixelsPerMeter: 13.3 },
    corridor: {
      name: 'CENTRAL CORRIDOR',
      x: 40,
      y: 235,
      width: 880,
      height: 70
    },
    rooms,
    staircases,
    elevators,
    emergencyExits,
    status: 'published'
  };
}

/**
 * All six floors of D Block
 */
export const D_BLOCK_ALL_FLOORS = [
  generateDBlockFloor(0),
  generateDBlockFloor(1),
  generateDBlockFloor(2),
  generateDBlockFloor(3),
  generateDBlockFloor(4),
  generateDBlockFloor(5)
];

/**
 * Generates graph nodes and walking paths for D Block (all 6 floors)
 */
export function generateDBlockGraph() {
  const nodes = [];
  const paths = [];

  for (let f = 0; f <= 5; f++) {
    const isGround = f === 0;
    const floorCodePrefix = isGround ? 'DG' : `D${f}`;
    const prefix = floorCodePrefix;

    // Corridor junctions along horizontal corridor (y = 270)
    const corWest = {
      nodeId: `in_d_${f}_cor_west`,
      buildingId: 'bld_d_block',
      floorId: `flr_d_${f}`,
      floorNumber: f,
      name: `Floor ${f} West Corridor Junction`,
      nodeType: 'corridor_junction',
      coordinates: { x: 50, y: 270 },
      isAccessible: true,
      active: true
    };
    const corMidWest = {
      nodeId: `in_d_${f}_cor_mid_west`,
      buildingId: 'bld_d_block',
      floorId: `flr_d_${f}`,
      floorNumber: f,
      name: `Floor ${f} Corridor (Rooms ${prefix}01 & ${prefix}04)`,
      nodeType: 'corridor_junction',
      coordinates: { x: 190, y: 270 },
      isAccessible: true,
      active: true
    };
    const corCenter = {
      nodeId: `in_d_${f}_cor_center`,
      buildingId: 'bld_d_block',
      floorId: `flr_d_${f}`,
      floorNumber: f,
      name: `Floor ${f} Central Corridor Hub`,
      nodeType: 'corridor_junction',
      coordinates: { x: 480, y: 270 },
      isAccessible: true,
      active: true
    };
    const corMidEast = {
      nodeId: `in_d_${f}_cor_mid_east`,
      buildingId: 'bld_d_block',
      floorId: `flr_d_${f}`,
      floorNumber: f,
      name: `Floor ${f} Corridor (Rooms ${prefix}03 & ${prefix}06)`,
      nodeType: 'corridor_junction',
      coordinates: { x: 770, y: 270 },
      isAccessible: true,
      active: true
    };
    const corEast = {
      nodeId: `in_d_${f}_cor_east`,
      buildingId: 'bld_d_block',
      floorId: `flr_d_${f}`,
      floorNumber: f,
      name: `Floor ${f} East Corridor Junction`,
      nodeType: 'corridor_junction',
      coordinates: { x: 910, y: 270 },
      isAccessible: true,
      active: true
    };

    nodes.push(corWest, corMidWest, corCenter, corMidEast, corEast);

    // Corridor spine horizontal paths
    paths.push(
      { pathId: `ip_d_${f}_w_mw`, buildingId: 'bld_d_block', floorNumber: f, fromNodeId: corWest.nodeId, toNodeId: corMidWest.nodeId, distanceMeters: 10.5, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
      { pathId: `ip_d_${f}_mw_c`, buildingId: 'bld_d_block', floorNumber: f, fromNodeId: corMidWest.nodeId, toNodeId: corCenter.nodeId, distanceMeters: 21.7, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
      { pathId: `ip_d_${f}_c_me`, buildingId: 'bld_d_block', floorNumber: f, fromNodeId: corCenter.nodeId, toNodeId: corMidEast.nodeId, distanceMeters: 21.7, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
      { pathId: `ip_d_${f}_me_e`, buildingId: 'bld_d_block', floorNumber: f, fromNodeId: corMidEast.nodeId, toNodeId: corEast.nodeId, distanceMeters: 10.5, isAccessible: true, isBidirectional: true, pathType: 'corridor' }
    );

    // Vertical connections: Elevator & Staircases
    const liftNode = {
      nodeId: `in_d_${f}_lift`,
      buildingId: 'bld_d_block',
      floorId: `flr_d_${f}`,
      floorNumber: f,
      name: `Central Elevator (Floor ${f})`,
      nodeType: 'elevator',
      coordinates: { x: 885, y: 270 },
      connectsFloors: [0, 1, 2, 3, 4, 5],
      isAccessible: true,
      active: true
    };
    const stairEast = {
      nodeId: `in_d_${f}_stair_east`,
      buildingId: 'bld_d_block',
      floorId: `flr_d_${f}`,
      floorNumber: f,
      name: `East Main Staircase (Floor ${f})`,
      nodeType: 'staircase',
      coordinates: { x: 915, y: 270 },
      connectsFloors: [0, 1, 2, 3, 4, 5],
      isAccessible: false,
      active: true
    };
    const stairWest = {
      nodeId: `in_d_${f}_stair_west`,
      buildingId: 'bld_d_block',
      floorId: `flr_d_${f}`,
      floorNumber: f,
      name: `West Fire Exit Staircase (Floor ${f})`,
      nodeType: 'staircase',
      coordinates: { x: 45, y: 270 },
      connectsFloors: [0, 1, 2, 3, 4, 5],
      isAccessible: false,
      active: true
    };

    nodes.push(liftNode, stairEast, stairWest);

    paths.push(
      { pathId: `ip_d_${f}_lift_conn`, buildingId: 'bld_d_block', floorNumber: f, fromNodeId: corEast.nodeId, toNodeId: liftNode.nodeId, distanceMeters: 2.0, isAccessible: true, isBidirectional: true, pathType: 'corridor' },
      { pathId: `ip_d_${f}_steast_conn`, buildingId: 'bld_d_block', floorNumber: f, fromNodeId: corEast.nodeId, toNodeId: stairEast.nodeId, distanceMeters: 1.5, isAccessible: false, isBidirectional: true, pathType: 'stairs' },
      { pathId: `ip_d_${f}_stwest_conn`, buildingId: 'bld_d_block', floorNumber: f, fromNodeId: corWest.nodeId, toNodeId: stairWest.nodeId, distanceMeters: 1.5, isAccessible: false, isBidirectional: true, pathType: 'stairs' }
    );

    // Ground Floor Main Entrance
    if (isGround) {
      const mainEnt = {
        nodeId: 'in_d_0_main_entrance',
        buildingId: 'bld_d_block',
        floorId: 'flr_d_0',
        floorNumber: 0,
        name: 'D Block Main Entrance',
        nodeType: 'building_entrance',
        coordinates: { x: 480, y: 495 },
        linkedOutdoorNodeId: 'node_d_block_entrance',
        isAccessible: true,
        active: true
      };
      nodes.push(mainEnt);
      paths.push({
        pathId: 'ip_d_0_ent_to_cor',
        buildingId: 'bld_d_block',
        floorNumber: 0,
        fromNodeId: mainEnt.nodeId,
        toNodeId: corCenter.nodeId,
        distanceMeters: 12.0,
        isAccessible: true,
        isBidirectional: true,
        pathType: 'corridor'
      });
    }

    // Room Entrance Nodes (6 per floor)
    const roomConfigs = [
      { id: `${floorCodePrefix}01`, x: 190, y: 235, corNode: corMidWest.nodeId },
      { id: `${floorCodePrefix}02`, x: 480, y: 235, corNode: corCenter.nodeId },
      { id: `${floorCodePrefix}03`, x: 770, y: 235, corNode: corMidEast.nodeId },
      { id: `${floorCodePrefix}04`, x: 190, y: 305, corNode: corMidWest.nodeId },
      { id: `${floorCodePrefix}05`, x: 480, y: 305, corNode: corCenter.nodeId },
      { id: `${floorCodePrefix}06`, x: 770, y: 305, corNode: corMidEast.nodeId }
    ];

    roomConfigs.forEach(rc => {
      const rmNode = {
        nodeId: `in_d_${f}_door_${rc.id.toLowerCase()}`,
        buildingId: 'bld_d_block',
        floorId: `flr_d_${f}`,
        floorNumber: f,
        name: `Door ${rc.id}`,
        nodeType: 'room_entrance',
        coordinates: { x: rc.x, y: rc.y },
        linkedRoomId: `rm_d_${f}${rc.id.slice(-2)}`,
        isAccessible: true,
        active: true
      };
      nodes.push(rmNode);
      paths.push({
        pathId: `ip_d_${f}_door_${rc.id.toLowerCase()}`,
        buildingId: 'bld_d_block',
        floorNumber: f,
        fromNodeId: rc.corNode,
        toNodeId: rmNode.nodeId,
        distanceMeters: 2.5,
        isAccessible: true,
        isBidirectional: true,
        pathType: 'corridor'
      });
    });
  }

  return { nodes, paths };
}
