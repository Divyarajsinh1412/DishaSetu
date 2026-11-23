/**
 * Presidency University Multi-Floor Campus Indoor Dataset
 * D, E, F, L, N, and M Blocks
 * 
 * Rules:
 * - D Block: ALL rooms are LABS (DGL01.., DFL01.., DSL01..)
 * - E, F, L, N, M Blocks: ALL rooms are CLASSROOMS
 *   - Ground: BG01..
 *   - First: BF01..
 *   - Second: BS01..
 * (where B is the block letter: E, F, L, N, M)
 */

export const CAMPUS_BLOCKS_INFO = {
  bld_d_block: {
    buildingId: 'bld_d_block',
    shortCode: 'PU-D-BLOCK',
    name: 'D Block',
    blockLetter: 'D',
    category: 'Academic',
    description: 'Engineering instructional complex, research laboratories, and design studios.',
    totalFloors: 3,
    roomType: 'Laboratory',
    roomCategory: 'Laboratory',
    departments: ['Mechanical Engineering', 'Civil Engineering', 'Robotics & Automation'],
    status: 'published'
  },
  bld_e_block: {
    buildingId: 'bld_e_block',
    shortCode: 'PU-E-BLOCK',
    name: 'E Block',
    blockLetter: 'E',
    category: 'Academic',
    description: 'Computer Science & Engineering lecture suites, faculty staff rooms, and Dean offices.',
    totalFloors: 4,
    roomType: 'Classroom',
    roomCategory: 'Classroom',
    departments: ['Computer Science & Engineering', 'Artificial Intelligence & Machine Learning'],
    status: 'published'
  },
  bld_f_block: {
    buildingId: 'bld_f_block',
    shortCode: 'PU-F-BLOCK',
    name: 'F Block',
    blockLetter: 'F',
    category: 'Academic',
    description: 'Information Science & Engineering and Software Development lecture complex.',
    totalFloors: 3,
    roomType: 'Classroom',
    roomCategory: 'Classroom',
    departments: ['Information Science & Technology', 'Computer Applications'],
    status: 'published'
  },
  bld_l_block: {
    buildingId: 'bld_l_block',
    shortCode: 'PU-L-BLOCK',
    name: 'L Block',
    blockLetter: 'L',
    category: 'Academic',
    description: 'Basic Sciences, Applied Physics, Mathematics, and Humanities classrooms.',
    totalFloors: 3,
    roomType: 'Classroom',
    roomCategory: 'Classroom',
    departments: ['Mathematics', 'Physics', 'Chemistry', 'Humanities'],
    status: 'published'
  },
  bld_n_block: {
    buildingId: 'bld_n_block',
    shortCode: 'PU-N-BLOCK',
    name: 'N Block',
    blockLetter: 'N',
    category: 'Academic',
    description: 'School of Law lecture halls, legal jurisprudence classrooms, and seminar rooms.',
    totalFloors: 3,
    roomType: 'Classroom',
    roomCategory: 'Classroom',
    departments: ['School of Law', 'Legal Studies & Moot Court Complex'],
    status: 'published'
  },
  bld_som_block: {
    buildingId: 'bld_som_block',
    shortCode: 'PU-M-BLOCK',
    name: 'M Block',
    blockLetter: 'M',
    category: 'Academic',
    description: 'School of Management (SOM) MBA lecture amphitheaters and executive case study halls.',
    totalFloors: 3,
    roomType: 'Classroom',
    roomCategory: 'Classroom',
    departments: ['School of Management (SOM)', 'MBA Programs', 'Business Analytics'],
    status: 'published'
  },
  bld_h_block: {
    buildingId: 'bld_h_block',
    shortCode: 'PU-H-BLOCK',
    name: 'H Block',
    blockLetter: 'H',
    category: 'Academic',
    description: 'School of Electrical Engineering, Power Systems Lab, and Applied Sciences.',
    totalFloors: 3,
    roomType: 'Classroom',
    roomCategory: 'Classroom',
    departments: ['Electrical Engineering', 'Power Systems', 'Applied Sciences'],
    status: 'published'
  },
  bld_adm_block: {
    buildingId: 'bld_adm_block',
    shortCode: 'PU-ADM-BLOCK',
    name: 'Admission Block & Registrar Office',
    blockLetter: 'A',
    category: 'Administrative',
    description: 'Central University Admissions, Registrar Office, Student Verification, and Academic Records.',
    totalFloors: 2,
    roomType: 'Office',
    roomCategory: 'Office',
    departments: ['University Admissions', 'Office of the Registrar', 'Student Document Verification'],
    status: 'published'
  }
};

// Also alias bld_m_block to bld_som_block
CAMPUS_BLOCKS_INFO.bld_m_block = {
  ...CAMPUS_BLOCKS_INFO.bld_som_block,
  buildingId: 'bld_m_block'
};

/**
 * Standard Room Names per Block & Floor
 */
const BLOCK_ROOM_NAMES = {
  D: {
    0: [
      'Engineering Mechanics Lab',
      'Robotics & Automation Studio',
      'Materials Testing Lab',
      'Fluid Mechanics & Hydraulics Lab',
      'Computer Aided Design (CAD) Lab',
      'Manufacturing Technology Lab'
    ],
    1: [
      'Thermodynamics & Heat Transfer Lab',
      'Mechatronics Systems Lab',
      'Kinematics Research Lab',
      'Additive Manufacturing Lab',
      'Sensors & Instrumentation Lab',
      'Automotive Systems Lab'
    ],
    2: [
      'Structural Analysis Lab',
      'Environmental Engineering Lab',
      'Hydraulics & Water Resources Lab',
      'Geotechnical Engineering Lab',
      'Concrete & Highway Materials Lab',
      'Surveying & Geomatics Lab'
    ]
  },
  E: {
    0: [
      'Staff Room 1 – Faculty Workstation Suite',
      'Staff Room 2 – Senior Faculty & Research Mentors',
      'Dean Office – School of Computer Science & Engineering'
    ],
    1: [
      'Artificial Intelligence Classroom 101',
      'Machine Learning Classroom 102',
      'Cloud Computing Classroom 103',
      'Cyber Security Classroom 104',
      'Big Data Analytics Classroom 105',
      'Web Technologies Classroom 106'
    ],
    2: [
      'Computer Vision Classroom 201',
      'Distributed Systems Classroom 202',
      'High Performance Computing Classroom 203',
      'Mobile Application Dev Classroom 204',
      'Quantum Computing Classroom 205',
      'Internet of Things (IoT) Classroom 206'
    ],
    3: [
      'Advanced Robotics & Cyber-Physical Systems 301',
      'Deep Learning & Neural Networks 302',
      'Cloud Architecture & Microservices 303',
      'Blockchain & Distributed Ledgers 304',
      'Natural Language Processing 305',
      'Edge Computing & Embedded Systems 306'
    ]
  },
  F: {
    0: [
      'Information Systems Classroom 01',
      'Object Oriented Programming Classroom 02',
      'Discrete Mathematics Classroom 03',
      'System Architecture Classroom 04',
      'Web Application Dev Classroom 05',
      'Enterprise Systems Classroom 06'
    ],
    1: [
      'Information Security Classroom 101',
      'Mobile Systems Classroom 102',
      'UI & UX Design Classroom 103',
      'Cloud Architecture Classroom 104',
      'Software Quality Assurance Classroom 105',
      'Business Intelligence Classroom 106'
    ],
    2: [
      'Blockchain Technology Classroom 201',
      'Agile Development Classroom 202',
      'Digital Forensics Classroom 203',
      'Cognitive Systems Classroom 204',
      'Information Retrieval Classroom 205',
      'Advanced Seminar Classroom 206'
    ]
  },
  L: {
    0: [
      'Foundation Engineering Classroom 01',
      'Applied Physics Lecture Classroom 02',
      'Engineering Chemistry Classroom 03',
      'Calculus & Linear Algebra Classroom 04',
      'Professional Communication Classroom 05',
      'Environmental Sciences Classroom 06'
    ],
    1: [
      'Differential Equations Classroom 101',
      'Materials Science Classroom 102',
      'Numerical Methods Classroom 103',
      'Ethics & Constitution Classroom 104',
      'Design Thinking Classroom 105',
      'Technical Presentation Classroom 106'
    ],
    2: [
      'Complex Analysis Classroom 201',
      'Solid State Physics Classroom 202',
      'Probability & Statistics Classroom 203',
      'Life Sciences for Engineers Classroom 204',
      'Research Methodology Classroom 205',
      'Interdisciplinary Studies Classroom 206'
    ]
  },
  N: {
    0: [
      'Jurisprudence & Legal Theory Classroom 01',
      'Constitutional Law Classroom 02',
      'Law of Contracts Classroom 03',
      'Law of Torts Classroom 04',
      'Family Law Classroom 05',
      'Legal Methods & Research Classroom 06'
    ],
    1: [
      'Criminal Law Classroom 101',
      'Corporate & Commercial Law Classroom 102',
      'Administrative Law Classroom 103',
      'Intellectual Property Rights Classroom 104',
      'Public International Law Classroom 105',
      'Property Law Classroom 106'
    ],
    2: [
      'Cyber Law & IT Act Classroom 201',
      'Banking & Insurance Law Classroom 202',
      'Environmental Law Classroom 203',
      'Alternative Dispute Resolution (ADR) Classroom 204',
      'Taxation Law Classroom 205',
      'Advocacy & Legal Drafting Classroom 206'
    ]
  },
  M: {
    0: [
      'Principles of Management Classroom 01',
      'Financial Accounting Classroom 02',
      'Marketing Management Classroom 03',
      'Organizational Behavior Classroom 04',
      'Managerial Economics Classroom 05',
      'Business Communication Classroom 06'
    ],
    1: [
      'Corporate Finance Classroom 101',
      'Human Resource Management Classroom 102',
      'Operations & Supply Chain Classroom 103',
      'Business Analytics Classroom 104',
      'Digital Marketing Strategy Classroom 105',
      'Strategic Management Classroom 106'
    ],
    2: [
      'Investment Banking Classroom 201',
      'International Business Strategy Classroom 202',
      'Venture Capital & Incubation Classroom 203',
      'Corporate Governance Classroom 204',
      'FinTech & Financial Modeling Classroom 205',
      'Executive Leadership Classroom 206'
    ]
  },
  H: {
    0: [
      'Electrical Machines Lab',
      'Power Systems & Circuits Lab',
      'Measurements & Instrumentation Studio',
      'Renewable Energy & Solar Research Lab',
      'Faculty Workstations Suite',
      'Department Seminar Hall'
    ],
    1: [
      'Control Systems Classroom 101',
      'Digital Signal Processing Classroom 102',
      'Power Electronics Classroom 103',
      'High Voltage Engineering Classroom 104',
      'Microprocessors & Embedded Classroom 105',
      'Interactive Lecture Hall 106'
    ],
    2: [
      'Smart Grid Technology Classroom 201',
      'Electric Vehicle Systems Classroom 202',
      'Applied Electromagnetics Classroom 203',
      'Energy Management Classroom 204',
      'Research Scholar Workstations 205',
      'Conference & Defense Room 206'
    ]
  },
  A: {
    0: [
      'Central Admissions Counter 01',
      'Document Verification Desk 02',
      'Registrar Reception Desk 03',
      'Student Affairs Enquiry 04',
      'Academic Records Section 05',
      'Visitor Waiting Lounge 06'
    ],
    1: [
      'Office of Dean of Admissions 101',
      'Registrar Executive Suite 102',
      'Admissions Operations War Room 103',
      'Confidential Records Archive 104',
      'Administrative Boardroom 105',
      'Executive Committee Conference 106'
    ]
  }
};

/**
 * Generates room prefix according to exact user rules:
 * - D Block: Ground `DGL`, First `DFL`, Second `DSL`
 * - Other blocks: Ground `${B}G`, First `${B}F`, Second `${B}S`
 */
export function getRoomCodePrefix(blockLetter, floorNumber) {
  const b = blockLetter.toUpperCase();
  if (b === 'D') {
    if (floorNumber === 0) return 'DGL';
    if (floorNumber === 1) return 'DFL';
    if (floorNumber === 2) return 'DSL';
    if (floorNumber === 3) return 'DTL';
    return `D${floorNumber}L`;
  }
  const floorChar = floorNumber === 0 ? 'G' : floorNumber === 1 ? 'F' : floorNumber === 2 ? 'S' : floorNumber === 3 ? 'T' : `${floorNumber}`;
  return `${b}${floorChar}`;
}

/**
 * Floor Name Resolver
 */
export function getFloorName(floorNumber) {
  switch (floorNumber) {
    case 0: return 'Ground Floor';
    case 1: return 'First Floor';
    case 2: return 'Second Floor';
    case 3: return 'Third Floor';
    case 4: return 'Fourth Floor';
    case 5: return 'Fifth Floor';
    default: return `Floor ${floorNumber}`;
  }
}

/**
 * Dynamic Symmetrical Schematic Layout Engine
 * Calculates non-overlapping bounds for any number of rooms (N >= 1)
 * Canvas ViewBox: 0 0 960 540
 */
export function calculateRoomBounds(totalRooms, roomIndex) {
  const topCount = Math.ceil(totalRooms / 2);
  const bottomCount = Math.floor(totalRooms / 2);
  const isTopRow = roomIndex < topCount;

  const totalWidth = 840;
  const startX = 60;
  const spacing = 18;

  if (isTopRow) {
    const width = Math.max(120, (totalWidth - (topCount - 1) * spacing) / topCount);
    const x = startX + roomIndex * (width + spacing);
    const y = 50;
    const height = 160;
    return {
      bounds: { x: Math.round(x), y, width: Math.round(width), height },
      entrancePoint: { x: Math.round(x + width / 2), y: 220 }
    };
  } else {
    const bottomIndex = roomIndex - topCount;
    const width = Math.max(120, (totalWidth - (bottomCount - 1) * spacing) / Math.max(1, bottomCount));
    const x = startX + bottomIndex * (width + spacing);
    const y = 330;
    const height = 160;
    return {
      bounds: { x: Math.round(x), y, width: Math.round(width), height },
      entrancePoint: { x: Math.round(x + width / 2), y: 320 }
    };
  }
}

/**
 * Generate E Block Floor (Exact matching user's handwritten architectural floor plan)
 * - Ground Floor: ONLY Staff Room 1, Staff Room 2, and Dean Office
 * - First Floor: EF01..EF06 classrooms + Opposite side Staff Room 1, Staff Room 2, Dean Office
 * - Second Floor: ES01..ES06 classrooms + Opposite side Staff Room 1, Staff Room 2, Dean Office
 * - Third Floor: ET01..ET06 classrooms + Opposite side Staff Room 1, Staff Room 2, Dean Office
 */
export function generateEBlockFloor(floorNumber) {
  const meta = CAMPUS_BLOCKS_INFO.bld_e_block;
  const floorName = getFloorName(floorNumber);
  const floorId = `flr_e_${floorNumber}`;
  const rooms = [];

  if (floorNumber === 0) {
    // Ground Floor: ONLY Staff Room 1, Staff Room 2, and Dean Office
    rooms.push({
      roomId: 'rm_e_0_sr01',
      roomNumber: 'Staff Room 1',
      code: 'Staff Room 1',
      name: 'Staff Room 1 – Faculty Workstation Suite',
      category: 'Staff Room',
      type: 'Staff Room',
      roomType: 'staff_room',
      department: 'Computer Science & Engineering',
      bounds: { x: 120, y: 140, width: 220, height: 220 },
      entrancePoint: { x: 230, y: 360 },
      qrCodeId: 'QR-PU-E-BLOCK-SR01',
      isAccessible: true,
      capacity: 25,
      status: 'Operational'
    });

    rooms.push({
      roomId: 'rm_e_0_sr02',
      roomNumber: 'Staff Room 2',
      code: 'Staff Room 2',
      name: 'Staff Room 2 – Senior Faculty & Research Mentors',
      category: 'Staff Room',
      type: 'Staff Room',
      roomType: 'staff_room',
      department: 'Computer Science & Engineering',
      bounds: { x: 380, y: 140, width: 220, height: 220 },
      entrancePoint: { x: 490, y: 360 },
      qrCodeId: 'QR-PU-E-BLOCK-SR02',
      isAccessible: true,
      capacity: 25,
      status: 'Operational'
    });

    rooms.push({
      roomId: 'rm_e_0_dean',
      roomNumber: 'Dean Office',
      code: 'Dean Office',
      name: 'Dean Office – School of Computer Science & Engineering',
      category: 'Office',
      type: 'Office',
      roomType: 'office',
      department: 'Dean & Leadership Directorate',
      bounds: { x: 640, y: 110, width: 240, height: 280 },
      entrancePoint: { x: 760, y: 390 },
      qrCodeId: 'QR-PU-E-BLOCK-DEAN',
      isAccessible: true,
      capacity: 15,
      status: 'Operational'
    });
  } else {
    // Floors 1, 2, 3: Two rows of 3 classrooms + Staff Rooms & Dean Office on opposite wing
    const prefix = floorNumber === 1 ? 'EF' : floorNumber === 2 ? 'ES' : 'ET';
    const classTitles = BLOCK_ROOM_NAMES.E[floorNumber] || [];

    // Classroom Side: Top row (01, 02, 03)
    for (let i = 0; i < 3; i++) {
      const numStr = String(i + 1).padStart(2, '0');
      const rNum = `${prefix}${numStr}`;
      const title = classTitles[i] || `Classroom ${numStr}`;
      const bounds = { x: 60 + i * 175, y: 50, width: 160, height: 160 };
      rooms.push({
        roomId: `rm_e_${floorNumber}${numStr}`,
        roomNumber: rNum,
        code: rNum,
        name: `${rNum} – ${title}`,
        category: 'Classroom',
        type: 'Classroom',
        roomType: 'classroom',
        department: 'Computer Science & Engineering',
        bounds,
        entrancePoint: { x: bounds.x + 80, y: 220 },
        qrCodeId: `QR-PU-E-BLOCK-${rNum}`,
        isAccessible: true,
        capacity: 60,
        status: 'Operational'
      });
    }

    // Classroom Side: Bottom row (04, 05, 06)
    // As shown in sketch: EF06 is opposite EF01, EF05 opposite EF02, EF04 opposite EF03
    const bottomRoomIndices = [4, 5, 6];
    for (let i = 0; i < 3; i++) {
      const num = bottomRoomIndices[i];
      const numStr = String(num).padStart(2, '0');
      const rNum = `${prefix}${numStr}`;
      const title = classTitles[num - 1] || `Classroom ${numStr}`;
      const bounds = { x: 60 + i * 175, y: 310, width: 160, height: 160 };
      rooms.push({
        roomId: `rm_e_${floorNumber}${numStr}`,
        roomNumber: rNum,
        code: rNum,
        name: `${rNum} – ${title}`,
        category: 'Classroom',
        type: 'Classroom',
        roomType: 'classroom',
        department: 'Computer Science & Engineering',
        bounds,
        entrancePoint: { x: bounds.x + 80, y: 300 },
        qrCodeId: `QR-PU-E-BLOCK-${rNum}`,
        isAccessible: true,
        capacity: 60,
        status: 'Operational'
      });
    }

    // Opposite Wing: Staff Rooms & Dean Office
    rooms.push({
      roomId: `rm_e_${floorNumber}_sr01`,
      roomNumber: `${prefix}-SR01`,
      code: 'Staff Room 1',
      name: `Staff Room 1 – Faculty Office (Level ${floorNumber})`,
      category: 'Staff Room',
      type: 'Staff Room',
      roomType: 'staff_room',
      department: 'Computer Science & Engineering',
      bounds: { x: 610, y: 50, width: 140, height: 160 },
      entrancePoint: { x: 680, y: 220 },
      qrCodeId: `QR-PU-E-BLOCK-${prefix}-SR01`,
      isAccessible: true,
      capacity: 20,
      status: 'Operational'
    });

    rooms.push({
      roomId: `rm_e_${floorNumber}_sr02`,
      roomNumber: `${prefix}-SR02`,
      code: 'Staff Room 2',
      name: `Staff Room 2 – Systems & Networks Faculty (Level ${floorNumber})`,
      category: 'Staff Room',
      type: 'Staff Room',
      roomType: 'staff_room',
      department: 'Computer Science & Engineering',
      bounds: { x: 770, y: 50, width: 140, height: 160 },
      entrancePoint: { x: 840, y: 220 },
      qrCodeId: `QR-PU-E-BLOCK-${prefix}-SR02`,
      isAccessible: true,
      capacity: 20,
      status: 'Operational'
    });

    rooms.push({
      roomId: `rm_e_${floorNumber}_dean`,
      roomNumber: `${prefix}-DEAN`,
      code: 'Dean Office',
      name: `Dean Office – Executive Directorate (Level ${floorNumber})`,
      category: 'Office',
      type: 'Office',
      roomType: 'office',
      department: 'Dean & Leadership Directorate',
      bounds: { x: 610, y: 310, width: 300, height: 160 },
      entrancePoint: { x: 760, y: 300 },
      qrCodeId: `QR-PU-E-BLOCK-${prefix}-DEAN`,
      isAccessible: true,
      capacity: 15,
      status: 'Operational'
    });
  }

  const staircases = [
    {
      stairId: `stair_e_east_${floorNumber}`,
      name: 'East Main Staircase (Towards D Block)',
      x: 935,
      y: 270,
      connectsFloors: [0, 1, 2, 3]
    },
    {
      stairId: `stair_e_west_${floorNumber}`,
      name: 'West Wing Staircase (Towards F Block)',
      x: 25,
      y: 270,
      connectsFloors: [0, 1, 2, 3],
      isEmergencyExit: true
    }
  ];

  const elevators = [
    {
      elevatorId: `elev_e_central_${floorNumber}`,
      name: 'Central Accessible Elevator',
      x: 580,
      y: 270,
      connectsFloors: [0, 1, 2, 3],
      isAccessible: true
    }
  ];

  const emergencyExits = [
    {
      exitId: `exit_e_west_${floorNumber}`,
      name: 'West Emergency Fire Exit',
      x: 10,
      y: 270
    }
  ];

  return {
    floorId,
    buildingId: meta.buildingId,
    buildingShortCode: meta.shortCode,
    buildingName: meta.name,
    floorNumber,
    floorName,
    dimensions: {
      widthMeters: 80,
      heightMeters: 50,
      scalePixelsPerMeter: 12
    },
    rooms,
    staircases,
    elevators,
    emergencyExits,
    status: 'published'
  };
}

/**
 * Generate a complete Floor object with its rooms
 */
export function generateBlockFloor(buildingKey, floorNumber, customRoomCount = null) {
  const meta = CAMPUS_BLOCKS_INFO[buildingKey] || CAMPUS_BLOCKS_INFO.bld_d_block;
  if (meta.blockLetter === 'E') {
    return generateEBlockFloor(floorNumber);
  }
  const blockLetter = meta.blockLetter;
  const bLower = blockLetter.toLowerCase();
  const floorName = getFloorName(floorNumber);
  const prefix = getRoomCodePrefix(blockLetter, floorNumber);
  const floorId = `flr_${bLower}_${floorNumber}`;

  const defaultNamesList = BLOCK_ROOM_NAMES[blockLetter]?.[floorNumber] || [
    'Room 01', 'Room 02', 'Room 03', 'Room 04', 'Room 05', 'Room 06'
  ];
  const count = customRoomCount || defaultNamesList.length;

  const rooms = [];
  for (let i = 0; i < count; i++) {
    const roomSeq = String(i + 1).padStart(2, '0');
    const roomNumber = `${prefix}${roomSeq}`;
    const nameStr = defaultNamesList[i]
      ? `${roomNumber} – ${defaultNamesList[i]}`
      : `${roomNumber} – ${meta.roomType} ${roomSeq}`;

    const { bounds, entrancePoint } = calculateRoomBounds(count, i);

    rooms.push({
      roomId: `rm_${bLower}_${floorNumber}${roomSeq}`,
      roomNumber,
      name: nameStr,
      category: meta.roomCategory, // 'Laboratory' for D Block, 'Classroom' for others
      type: meta.roomType,
      roomType: meta.blockLetter === 'D' ? 'lab' : 'classroom',
      department: meta.departments[0] || 'Academic Quad',
      bounds,
      entrancePoint,
      qrCodeId: `QR-${meta.shortCode}-${roomNumber}`,
      isAccessible: true,
      capacity: meta.blockLetter === 'D' ? 35 : 60,
      status: 'Operational'
    });
  }

  const staircases = [
    {
      stairId: `stair_${bLower}_east_${floorNumber}`,
      name: 'East Main Staircase',
      x: 915,
      y: 270,
      connectsFloors: [0, 1, 2]
    },
    {
      stairId: `stair_${bLower}_west_${floorNumber}`,
      name: 'West Wing Fire Exit Staircase',
      x: 45,
      y: 270,
      connectsFloors: [0, 1, 2],
      isEmergencyExit: true
    }
  ];

  const elevators = [
    {
      elevatorId: `elev_${bLower}_central_${floorNumber}`,
      name: 'Central Accessible Elevator',
      x: 480,
      y: 270,
      connectsFloors: [0, 1, 2],
      isAccessible: true
    }
  ];

  const emergencyExits = [
    {
      exitId: `exit_${bLower}_west_${floorNumber}`,
      name: 'West Emergency Exit',
      x: 20,
      y: 270,
      leadsToOutdoor: floorNumber === 0
    }
  ];

  return {
    floorId,
    buildingId: meta.buildingId,
    buildingShortCode: meta.shortCode,
    buildingName: meta.name,
    floorNumber,
    floorName,
    dimensions: {
      widthMeters: 80,
      heightMeters: 50,
      scalePixelsPerMeter: 12
    },
    rooms,
    staircases,
    elevators,
    emergencyExits,
    status: 'published'
  };
}

/**
 * Generate all floors for a specific building
 */
export function generateAllFloorsForBuilding(buildingKey) {
  const meta = CAMPUS_BLOCKS_INFO[buildingKey] || CAMPUS_BLOCKS_INFO.bld_d_block;
  const floors = [];
  for (let f = 0; f < meta.totalFloors; f++) {
    floors.push(generateBlockFloor(buildingKey, f));
  }
  return floors;
}

export function resolveBuildingKey(buildingIdOrCode) {
  if (!buildingIdOrCode) return 'bld_d_block';
  const str = String(buildingIdOrCode).toLowerCase().trim();

  // Exact key match
  if (CAMPUS_BLOCKS_INFO[str]) return str;

  // Search through all 6 blocks
  for (const [key, meta] of Object.entries(CAMPUS_BLOCKS_INFO)) {
    const letter = meta.blockLetter.toLowerCase();
    if (
      str === key.toLowerCase() ||
      str === meta.buildingId.toLowerCase() ||
      str === meta.shortCode.toLowerCase() ||
      str === meta.name.toLowerCase() ||
      str === letter ||
      str.includes(`${letter}-block`) ||
      str.includes(`${letter}_block`) ||
      str.includes(`${letter} block`) ||
      str.includes(`bld_${letter}`) ||
      (letter === 'h' && (str.includes('electrical') || str.includes('h-block') || str.includes('h block'))) ||
      (letter === 'a' && (str.includes('adm') || str.includes('admission') || str.includes('registrar'))) ||
      (letter === 'm' && (str.includes('som') || str.includes('mba'))) ||
      (letter === 'd' && str.includes('engineering')) ||
      (letter === 'e' && str.includes('computer science')) ||
      (letter === 'f' && str.includes('information')) ||
      (letter === 'l' && str.includes('science')) ||
      (letter === 'n' && str.includes('law')) ||
      (letter === 'm' && str.includes('management'))
    ) {
      return key;
    }
  }

  return 'bld_d_block';
}

export function getBuildingFloorsFallback(buildingIdOrCode) {
  const targetKey = resolveBuildingKey(buildingIdOrCode);
  return generateAllFloorsForBuilding(targetKey);
}

/**
 * Complete set of all floors across campus blocks
 */
export const CAMPUS_ALL_FLOORS = [
  ...generateAllFloorsForBuilding('bld_d_block'),
  ...generateAllFloorsForBuilding('bld_e_block'),
  ...generateAllFloorsForBuilding('bld_f_block'),
  ...generateAllFloorsForBuilding('bld_l_block'),
  ...generateAllFloorsForBuilding('bld_n_block'),
  ...generateAllFloorsForBuilding('bld_som_block'),
  ...generateAllFloorsForBuilding('bld_h_block'),
  ...generateAllFloorsForBuilding('bld_adm_block')
];

/**
 * Generate Complete Indoor Navigation Graph for any block
 */
export function generateBlockIndoorGraph(buildingKey) {
  const meta = CAMPUS_BLOCKS_INFO[buildingKey] || CAMPUS_BLOCKS_INFO.bld_d_block;
  const bLower = meta.blockLetter.toLowerCase();
  const floors = generateAllFloorsForBuilding(buildingKey);

  const nodes = [];
  const paths = [];

  floors.forEach((floor) => {
    const fn = floor.floorNumber;
    const fId = floor.floorId;

    // Corridor spine nodes
    const cWest = {
      nodeId: `node_${bLower}_flr${fn}_c_west`,
      buildingId: meta.buildingId,
      floorId: fId,
      floorNumber: fn,
      name: `${floor.floorName} West Corridor`,
      nodeType: 'corridor_junction',
      coordinates: { x: 190, y: 270 }
    };
    const cMid = {
      nodeId: `node_${bLower}_flr${fn}_c_mid`,
      buildingId: meta.buildingId,
      floorId: fId,
      floorNumber: fn,
      name: `${floor.floorName} Central Lobby`,
      nodeType: 'corridor_junction',
      coordinates: { x: 480, y: 270 }
    };
    const cEast = {
      nodeId: `node_${bLower}_flr${fn}_c_east`,
      buildingId: meta.buildingId,
      floorId: fId,
      floorNumber: fn,
      name: `${floor.floorName} East Corridor`,
      nodeType: 'corridor_junction',
      coordinates: { x: 770, y: 270 }
    };

    nodes.push(cWest, cMid, cEast);

    // Corridor spine paths
    paths.push({
      pathId: `path_${bLower}_flr${fn}_c1`,
      buildingId: meta.buildingId,
      floorId: fId,
      floorNumber: fn,
      name: 'West-Central Corridor',
      fromNodeId: cWest.nodeId,
      toNodeId: cMid.nodeId,
      distanceMeters: 29.0,
      isAccessible: true,
      isBidirectional: true,
      pathType: 'corridor'
    });
    paths.push({
      pathId: `path_${bLower}_flr${fn}_c2`,
      buildingId: meta.buildingId,
      floorId: fId,
      floorNumber: fn,
      name: 'Central-East Corridor',
      fromNodeId: cMid.nodeId,
      toNodeId: cEast.nodeId,
      distanceMeters: 29.0,
      isAccessible: true,
      isBidirectional: true,
      pathType: 'corridor'
    });

    // Building entrance node on Ground Floor
    if (fn === 0) {
      const bldEntNode = {
        nodeId: `node_${bLower}_flr0_entrance`,
        buildingId: meta.buildingId,
        floorId: fId,
        floorNumber: 0,
        name: `${meta.name} Main Entrance Foyer`,
        nodeType: 'building_entrance',
        coordinates: { x: 480, y: 490 },
        linkedOutdoorNodeId: `node_${bLower}_block_ent`
      };
      nodes.push(bldEntNode);

      paths.push({
        pathId: `path_${bLower}_flr0_ent_to_mid`,
        buildingId: meta.buildingId,
        floorId: fId,
        floorNumber: 0,
        name: 'Entrance to Central Corridor',
        fromNodeId: bldEntNode.nodeId,
        toNodeId: cMid.nodeId,
        distanceMeters: 22.0,
        isAccessible: true,
        isBidirectional: true,
        pathType: 'corridor'
      });
    }

    // Elevator node
    const elevNode = {
      nodeId: `node_${bLower}_flr${fn}_elev`,
      buildingId: meta.buildingId,
      floorId: fId,
      floorNumber: fn,
      name: `${floor.floorName} Elevator`,
      nodeType: 'elevator',
      coordinates: { x: 480, y: 225 },
      connectsFloors: [0, 1, 2]
    };
    nodes.push(elevNode);

    paths.push({
      pathId: `path_${bLower}_flr${fn}_elev_c`,
      buildingId: meta.buildingId,
      floorId: fId,
      floorNumber: fn,
      name: 'Elevator Access',
      fromNodeId: elevNode.nodeId,
      toNodeId: cMid.nodeId,
      distanceMeters: 4.5,
      isAccessible: true,
      isBidirectional: true,
      pathType: 'elevator'
    });

    // Staircase node
    const stairNode = {
      nodeId: `node_${bLower}_flr${fn}_stair`,
      buildingId: meta.buildingId,
      floorId: fId,
      floorNumber: fn,
      name: `${floor.floorName} East Staircase`,
      nodeType: 'staircase',
      coordinates: { x: 915, y: 270 },
      connectsFloors: [0, 1, 2]
    };
    nodes.push(stairNode);

    paths.push({
      pathId: `path_${bLower}_flr${fn}_stair_c`,
      buildingId: meta.buildingId,
      floorId: fId,
      floorNumber: fn,
      name: 'Staircase Access',
      fromNodeId: cEast.nodeId,
      toNodeId: stairNode.nodeId,
      distanceMeters: 14.5,
      isAccessible: false,
      isBidirectional: true,
      pathType: 'stairs'
    });

    // Room Entrance Nodes and links to Corridor
    floor.rooms.forEach((room) => {
      const rmNode = {
        nodeId: `node_${bLower}_flr${fn}_${room.roomNumber}`,
        buildingId: meta.buildingId,
        floorId: fId,
        floorNumber: fn,
        name: room.name,
        nodeType: 'room_entrance',
        coordinates: room.entrancePoint,
        linkedRoomId: room.roomId
      };
      nodes.push(rmNode);

      // Connect to nearest corridor junction
      const nearestJunction =
        room.entrancePoint.x < 330
          ? cWest
          : room.entrancePoint.x > 620
          ? cEast
          : cMid;

      const dist = Math.hypot(
        room.entrancePoint.x - nearestJunction.coordinates.x,
        room.entrancePoint.y - nearestJunction.coordinates.y
      ) / 10;

      paths.push({
        pathId: `path_${bLower}_flr${fn}_to_${room.roomNumber}`,
        buildingId: meta.buildingId,
        floorId: fId,
        floorNumber: fn,
        name: `Doorway to ${room.roomNumber}`,
        fromNodeId: nearestJunction.nodeId,
        toNodeId: rmNode.nodeId,
        distanceMeters: Math.round(dist * 10) / 10,
        isAccessible: true,
        isBidirectional: true,
        pathType: 'doorway'
      });
    });
  });

  // Vertical transitions between floors (Elevator & Stairs)
  for (let f = 0; f < meta.totalFloors - 1; f++) {
    const nextF = f + 1;
    // Elevator connection
    paths.push({
      pathId: `path_${bLower}_v_elev_${f}_${nextF}`,
      buildingId: meta.buildingId,
      floorId: `flr_${bLower}_${f}`,
      floorNumber: f,
      name: `Elevator Shaft: Floor ${f} ↔ Floor ${nextF}`,
      fromNodeId: `node_${bLower}_flr${f}_elev`,
      toNodeId: `node_${bLower}_flr${nextF}_elev`,
      distanceMeters: 4.0,
      isAccessible: true,
      isBidirectional: true,
      pathType: 'elevator'
    });

    // Staircase connection
    paths.push({
      pathId: `path_${bLower}_v_stair_${f}_${nextF}`,
      buildingId: meta.buildingId,
      floorId: `flr_${bLower}_${f}`,
      floorNumber: f,
      name: `Stair Flight: Floor ${f} ↔ Floor ${nextF}`,
      fromNodeId: `node_${bLower}_flr${f}_stair`,
      toNodeId: `node_${bLower}_flr${nextF}_stair`,
      distanceMeters: 6.0,
      isAccessible: false,
      isBidirectional: true,
      pathType: 'stairs'
    });
  }

  return { nodes, paths };
}

/**
 * Generate Unified Campus Indoor Graph across all 6 blocks
 */
export function generateCampusIndoorGraph() {
  const allNodes = [];
  const allPaths = [];
  const keys = ['bld_d_block', 'bld_e_block', 'bld_f_block', 'bld_l_block', 'bld_n_block', 'bld_som_block', 'bld_h_block', 'bld_adm_block'];

  keys.forEach((key) => {
    const g = generateBlockIndoorGraph(key);
    allNodes.push(...g.nodes);
    allPaths.push(...g.paths);
  });

  return { nodes: allNodes, paths: allPaths };
}
