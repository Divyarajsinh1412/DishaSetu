/**
 * Presidency University Multi-Floor Campus Indoor Dataset (Web Frontend)
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
  }
};

CAMPUS_BLOCKS_INFO.bld_m_block = {
  ...CAMPUS_BLOCKS_INFO.bld_som_block,
  buildingId: 'bld_m_block'
};

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
  }
};

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

export function generateAllFloorsForBuilding(buildingKey) {
  const meta = CAMPUS_BLOCKS_INFO[buildingKey] || CAMPUS_BLOCKS_INFO.bld_d_block;
  const floors = [];
  for (let f = 0; f < meta.totalFloors; f++) {
    floors.push(generateBlockFloor(buildingKey, f));
  }
  return floors;
}

export const CAMPUS_ALL_FLOORS = [
  ...generateAllFloorsForBuilding('bld_d_block'),
  ...generateAllFloorsForBuilding('bld_e_block'),
  ...generateAllFloorsForBuilding('bld_f_block'),
  ...generateAllFloorsForBuilding('bld_l_block'),
  ...generateAllFloorsForBuilding('bld_n_block'),
  ...generateAllFloorsForBuilding('bld_som_block')
];

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
