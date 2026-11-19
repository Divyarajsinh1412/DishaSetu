/**
 * D Block (Engineering & Lecture Halls) Multi-Floor Indoor Dataset Fallback
 * Institution: Presidency University, Bengaluru
 *
 * 6 Floors: Ground (0), First (1), Second (2), Third (3), Fourth (4), Fifth (5)
 * Standardized 6-room rectangular layout with Central Corridor.
 */

export const D_BLOCK_INFO = {
  buildingId: 'bld_d_block',
  shortCode: 'PU-D-BLOCK',
  name: 'D Block',
  category: 'Academic',
  description: 'Instructional engineering complex, research laboratories, and smart lecture halls.',
  totalFloors: 6,
  departments: ['Mechanical Engineering', 'Civil Engineering', 'Robotics & Automation']
};

const DEFAULT_ROOM_NAMES = {
  0: ['Engineering Mechanics Lab', 'Robotics & Automation Studio', 'Materials Testing Lab', 'Fluid Mechanics Lab', 'Faculty Consultation Room', 'Computer-Aided Design Studio'],
  1: ['Thermodynamics & Heat Transfer Lab', 'Mechatronics Systems Lab', 'Kinematics Research Lab', 'Additive Manufacturing Lab', 'Faculty Cubicles 105', 'Smart Lecture Hall 106'],
  2: ['Structural Analysis Lab', 'Environmental Engineering Lab', 'Hydraulics & Water Resources Lab', 'Geotechnical Engineering Lab', 'Department Office 205', 'Multimedia Lecture Hall 206'],
  3: ['Sensors & Instrumentation Lab', 'Advanced Manufacturing Center', 'Autonomous Systems Lab', 'Renewable Energy Lab', 'Faculty Cubicles 305', 'Interactive Seminar Room 306'],
  4: ['Computational Simulation Lab', 'Aerodynamics Testing Center', 'Vibration & Acoustics Lab', 'Product Prototyping Facility', 'Senior Faculty Lounge 405', 'Engineering Lecture Hall 406'],
  5: ['Nanotechnology Research Lab', 'Drone & Aerial Robotics Lab', 'Specialized Projects Studio', 'Innovation & Incubation Workspace', 'Dean & HoD Executive Office', 'High-Capacity Seminar Hall 506']
};

const CATEGORIES = [
  'Laboratory',
  'Laboratory',
  'Laboratory',
  'Laboratory',
  'Faculty room',
  'Classroom'
];

export function generateFallbackDBlockFloors() {
  const floors = [];

  for (let f = 0; f <= 5; f++) {
    const isGround = f === 0;
    const prefix = isGround ? 'DG' : `D${f}`;
    const floorName = isGround
      ? 'Ground Floor'
      : f === 1
      ? 'First Floor'
      : f === 2
      ? 'Second Floor'
      : f === 3
      ? 'Third Floor'
      : f === 4
      ? 'Fourth Floor'
      : 'Fifth Floor';

    const names = DEFAULT_ROOM_NAMES[f] || DEFAULT_ROOM_NAMES[0];

    // Standardized 6-room layout matching drawing
    const rooms = [
      // Top Row (3 rooms)
      {
        roomId: `rm_d_${f}01`,
        roomNumber: `${prefix}01`,
        name: `${prefix}01 – ${names[0]}`,
        category: CATEGORIES[0],
        department: 'Mechanical Engineering',
        bounds: { x: 60, y: 50, width: 260, height: 160 },
        entrancePoint: { x: 190, y: 235 },
        qrCodeId: `QR-D-${prefix}01`,
        isAccessible: true,
        status: 'Operational'
      },
      {
        roomId: `rm_d_${f}02`,
        roomNumber: `${prefix}02`,
        name: `${prefix}02 – ${names[1]}`,
        category: CATEGORIES[1],
        department: 'Robotics & Automation',
        bounds: { x: 350, y: 50, width: 260, height: 160 },
        entrancePoint: { x: 480, y: 235 },
        qrCodeId: `QR-D-${prefix}02`,
        isAccessible: true,
        status: 'Operational'
      },
      {
        roomId: `rm_d_${f}03`,
        roomNumber: `${prefix}03`,
        name: `${prefix}03 – ${names[2]}`,
        category: CATEGORIES[2],
        department: 'Mechanical Engineering',
        bounds: { x: 640, y: 50, width: 260, height: 160 },
        entrancePoint: { x: 770, y: 235 },
        qrCodeId: `QR-D-${prefix}03`,
        isAccessible: true,
        status: 'Operational'
      },

      // Bottom Row (3 rooms)
      {
        roomId: `rm_d_${f}04`,
        roomNumber: `${prefix}04`,
        name: `${prefix}04 – ${names[3]}`,
        category: CATEGORIES[3],
        department: 'Mechanical Engineering',
        bounds: { x: 60, y: 330, width: 260, height: 160 },
        entrancePoint: { x: 190, y: 305 },
        qrCodeId: `QR-D-${prefix}04`,
        isAccessible: true,
        status: 'Operational'
      },
      {
        roomId: `rm_d_${f}05`,
        roomNumber: `${prefix}05`,
        name: `${prefix}05 – ${names[4]}`,
        category: CATEGORIES[4],
        department: 'Faculty Affairs',
        bounds: { x: 350, y: 330, width: 260, height: 160 },
        entrancePoint: { x: 480, y: 305 },
        qrCodeId: `QR-D-${prefix}05`,
        isAccessible: true,
        status: 'Operational'
      },
      {
        roomId: `rm_d_${f}06`,
        roomNumber: `${prefix}06`,
        name: `${prefix}06 – ${names[5]}`,
        category: CATEGORIES[5],
        department: 'Civil & Mechanical',
        bounds: { x: 640, y: 330, width: 260, height: 160 },
        entrancePoint: { x: 770, y: 305 },
        qrCodeId: `QR-D-${prefix}06`,
        isAccessible: true,
        status: 'Operational'
      }
    ];

    const staircases = [
      {
        stairId: `stair_d_east_${f}`,
        name: 'East Main Staircase',
        x: 915,
        y: 270,
        connectsFloors: [0, 1, 2, 3, 4, 5]
      },
      {
        stairId: `stair_d_west_${f}`,
        name: 'West Wing Fire Exit Staircase',
        x: 45,
        y: 270,
        connectsFloors: [0, 1, 2, 3, 4, 5],
        isEmergencyExit: true
      }
    ];

    const elevators = [
      {
        elevatorId: `lift_d_central_${f}`,
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
            name: 'D Block Main Entrance Portal',
            x: 480,
            y: 495,
            leadsToOutdoor: true
          }
        ]
      : [];

    floors.push({
      floorId: `flr_d_${f}`,
      buildingId: D_BLOCK_INFO.buildingId,
      buildingShortCode: D_BLOCK_INFO.shortCode,
      floorNumber: f,
      floorName,
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
    });
  }

  return floors;
}

export const D_BLOCK_FALLBACK_FLOORS = generateFallbackDBlockFloors();
