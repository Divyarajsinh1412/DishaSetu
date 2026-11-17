/**
 * DISHASETU: Presidency University Bengaluru
 * Calibrated 360° Aerial Panorama Scenes & Hotspot Graph
 */

export const INITIAL_PANORAMA_SCENES = [
  {
    sceneId: 'scene_central_campus_aerial',
    sceneName: 'Presidency University — Central Campus Overview',
    sceneType: 'aerial_360',
    locationId: 'loc_fountain',
    initialYaw: 10,
    initialPitch: -12,
    initialZoom: 75,
    altitudeMeters: 140,
    description: 'Breathtaking 360° aerial vista overlooking Presidency University academic blocks, Central Fountain, and campus avenues.',
    panoramaImage: '/panoramas/aerial_central_campus.png',
    thumbnail: '/panoramas/thumbs/central_campus.png',
    status: 'published',
    order: 1
  },
  {
    sceneId: 'scene_main_gate_aerial',
    sceneName: 'Main Gate & Arrival Avenue Aerial View',
    sceneType: 'aerial_360',
    locationId: 'loc_main_gate',
    initialYaw: 0,
    initialPitch: -10,
    initialZoom: 75,
    altitudeMeters: 110,
    description: 'High-altitude panoramic view of Presidency University official entrance portal, two-wheeler parking lot, and paved pedestrian avenue.',
    panoramaImage: '/panoramas/aerial_main_gate.png',
    thumbnail: '/panoramas/thumbs/main_gate.png',
    status: 'published',
    order: 2
  },
  {
    sceneId: 'scene_academic_quad_aerial',
    sceneName: 'Academic Quadrangle, SOM & Law School Aerial',
    sceneType: 'aerial_360',
    locationId: 'loc_library',
    initialYaw: -15,
    initialPitch: -10,
    initialZoom: 75,
    altitudeMeters: 125,
    description: 'Panoramic vista across School of Management, School of Law, Moot Court Hall, and Central University Library quadrangle.',
    panoramaImage: '/panoramas/aerial_academic_quad.png',
    thumbnail: '/panoramas/thumbs/academic_quad.png',
    status: 'published',
    order: 3
  },
  {
    sceneId: 'scene_sports_complex_aerial',
    sceneName: 'Sports Pavilion, Gym & Main Green Lawn',
    sceneType: 'aerial_360',
    locationId: 'loc_basketball',
    initialYaw: -10,
    initialPitch: -15,
    initialZoom: 75,
    altitudeMeters: 105,
    description: 'Aerial vista of basketball court, volleyball arena, cricket nets, University Gym, Open Air Theatre (OAT), and lush lawns.',
    panoramaImage: '/panoramas/aerial_sports_complex.png',
    thumbnail: '/panoramas/thumbs/sports_complex.png',
    status: 'published',
    order: 4
  },
  {
    sceneId: 'scene_cafeteria_hub_aerial',
    sceneName: 'Food Court, Cafeteria & Garden Canopy Hub',
    sceneType: 'aerial_360',
    locationId: 'loc_cafeteria',
    initialYaw: 0,
    initialPitch: -12,
    initialZoom: 75,
    altitudeMeters: 95,
    description: 'Aerial hub covering Central Cafeteria, Campus Food Court plaza, dining pavilion, and landscaped student canopy.',
    panoramaImage: '/panoramas/aerial_cafeteria_hub.png',
    thumbnail: '/panoramas/thumbs/cafeteria_hub.png',
    status: 'published',
    order: 5
  }
];

export const INITIAL_PANORAMA_HOTSPOTS = [
  // ==========================================
  // SCENE 1: CENTRAL CAMPUS OVERVIEW HOTSPOTS
  // ==========================================
  {
    hotspotId: 'hs_central_d_block',
    sceneId: 'scene_central_campus_aerial',
    locationId: 'loc_d_block',
    buildingShortCode: 'PU-D-BLOCK',
    yaw: -32,
    pitch: -12,
    title: 'D Block (Mechanical & Civil Engineering)',
    description: 'Workshops, CAD/CAM studios, and heavy engineering laboratories with dedicated East/West entrance doors.',
    hotspotType: 'building',
    color: '#3b82f6'
  },
  {
    hotspotId: 'hs_central_e_block',
    sceneId: 'scene_central_campus_aerial',
    locationId: 'loc_e_block',
    buildingShortCode: 'PU-E-BLOCK',
    yaw: -12,
    pitch: -9,
    title: 'E Block (Computer Science CSE)',
    description: 'High-performance computing labs, software architecture suites, and AI research laboratories.',
    hotspotType: 'building',
    color: '#3b82f6'
  },
  {
    hotspotId: 'hs_central_f_block',
    sceneId: 'scene_central_campus_aerial',
    locationId: 'loc_f_block',
    buildingShortCode: 'PU-F-BLOCK',
    yaw: -48,
    pitch: -8,
    title: 'F Block (EEE & Electronics)',
    description: 'Microprocessor design, power systems, and embedded electronics laboratories.',
    hotspotType: 'building',
    color: '#3b82f6'
  },
  {
    hotspotId: 'hs_central_fountain',
    sceneId: 'scene_central_campus_aerial',
    locationId: 'loc_fountain',
    buildingShortCode: 'PU-FOUNTAIN-01',
    yaw: 2,
    pitch: -22,
    title: 'Campus Central Fountain Plaza',
    description: 'Central decorative aquatic landmark marking the walking avenue terminus and central quadrangle.',
    hotspotType: 'facility',
    color: '#0ea5e9'
  },
  {
    hotspotId: 'hs_central_library',
    sceneId: 'scene_central_campus_aerial',
    locationId: 'loc_library',
    buildingShortCode: 'PU-LIB-01',
    yaw: 32,
    pitch: -11,
    title: 'Central University Library',
    description: 'Comprehensive digital resource archives, study halls, journal repositories, and reading rooms.',
    hotspotType: 'library',
    color: '#8b5cf6'
  },
  {
    hotspotId: 'hs_central_cafeteria',
    sceneId: 'scene_central_campus_aerial',
    locationId: 'loc_cafeteria',
    buildingShortCode: 'PU-CAFE-01',
    yaw: 54,
    pitch: -13,
    title: 'Central Cafeteria & Garden Terrace',
    description: 'Multi-cuisine student dining hall, open-air garden terrace, and bakery counter.',
    hotspotType: 'cafe',
    color: '#f97316'
  },
  {
    hotspotId: 'hs_central_food_court',
    sceneId: 'scene_central_campus_aerial',
    locationId: 'loc_food_court',
    buildingShortCode: 'PU-FOOD-01',
    yaw: 72,
    pitch: -10,
    title: 'Campus Food Court Plaza',
    description: 'Fast food stalls, juice counters, express snack bays, and open seating.',
    hotspotType: 'cafe',
    color: '#f97316'
  },
  {
    hotspotId: 'hs_central_auditorium',
    sceneId: 'scene_central_campus_aerial',
    locationId: 'loc_auditorium',
    buildingShortCode: 'PU-AUD-01',
    yaw: -64,
    pitch: -14,
    title: 'Auditorium Grand Foyer',
    description: 'Multi-tier cultural auditorium, convocation hall, and executive seminar stage.',
    hotspotType: 'facility',
    color: '#ec4899'
  },
  {
    hotspotId: 'hs_central_medical',
    sceneId: 'scene_central_campus_aerial',
    locationId: 'loc_medical',
    buildingShortCode: 'PU-MED-01',
    yaw: -82,
    pitch: -11,
    title: 'Health & Medical Centre',
    description: '24/7 on-campus first aid, triage rooms, qualified nursing staff, and emergency ambulance access.',
    hotspotType: 'facility',
    color: '#ef4444'
  },
  {
    hotspotId: 'hs_portal_to_gate',
    sceneId: 'scene_central_campus_aerial',
    yaw: 178,
    pitch: -8,
    title: 'Fly to Main Gate & Entrance Avenue',
    description: 'View Presidency University official entrance gate and vehicular parking area.',
    hotspotType: 'scene_portal',
    targetSceneId: 'scene_main_gate_aerial',
    color: '#10b981'
  },
  {
    hotspotId: 'hs_portal_to_sports',
    sceneId: 'scene_central_campus_aerial',
    yaw: 105,
    pitch: -9,
    title: 'Fly to Sports Pavilion & Green Lawns',
    description: 'Explore basketball court, cricket nets, and student sports arenas.',
    hotspotType: 'scene_portal',
    targetSceneId: 'scene_sports_complex_aerial',
    color: '#eab308'
  },

  // ==========================================
  // SCENE 2: MAIN GATE & ARRIVAL HOTSPOTS
  // ==========================================
  {
    hotspotId: 'hs_gate_main_portal',
    sceneId: 'scene_main_gate_aerial',
    locationId: 'loc_main_gate',
    buildingShortCode: 'PU-GATE-MAIN',
    yaw: 0,
    pitch: -16,
    title: 'Presidency University — Main Gate',
    description: 'Official entrance portal, security booth, and visitor identity verification desk on Itgalpur Road.',
    hotspotType: 'gate',
    color: '#10b981'
  },
  {
    hotspotId: 'hs_gate_h_block',
    sceneId: 'scene_main_gate_aerial',
    locationId: 'loc_h_block',
    buildingShortCode: 'PU-H-BLOCK',
    yaw: 28,
    pitch: -12,
    title: 'H Block (Admissions Office & Reception)',
    description: 'Visitor welcome center, admissions counselors, fee counters, and administrative reception.',
    hotspotType: 'building',
    color: '#3b82f6'
  },
  {
    hotspotId: 'hs_gate_parking',
    sceneId: 'scene_main_gate_aerial',
    locationId: 'loc_parking_2w',
    buildingShortCode: 'PU-PARK-2W',
    yaw: -58,
    pitch: -15,
    title: 'Two-Wheeler Student & Staff Parking',
    description: 'Paved, covered two-wheeler parking lot with dedicated vehicular access span.',
    hotspotType: 'facility',
    color: '#f97316'
  },
  {
    hotspotId: 'hs_gate_portal_to_central',
    sceneId: 'scene_main_gate_aerial',
    yaw: 8,
    pitch: -7,
    title: 'Fly into Central Campus Vista',
    description: 'Follow the main paved walking avenue into the heart of Presidency University.',
    hotspotType: 'scene_portal',
    targetSceneId: 'scene_central_campus_aerial',
    color: '#38bdf8'
  },

  // ==========================================
  // SCENE 3: ACADEMIC QUADRANGLE HOTSPOTS
  // ==========================================
  {
    hotspotId: 'hs_acad_j_block',
    sceneId: 'scene_academic_quad_aerial',
    locationId: 'loc_j_block',
    buildingShortCode: 'PU-J-BLOCK',
    yaw: -28,
    pitch: -12,
    title: 'J Block (School of Management SOM)',
    description: 'Executive MBA lecture halls, Bloomberg financial analytics terminal, and business incubation hubs.',
    hotspotType: 'building',
    color: '#3b82f6'
  },
  {
    hotspotId: 'hs_acad_k_block',
    sceneId: 'scene_academic_quad_aerial',
    locationId: 'loc_k_block',
    buildingShortCode: 'PU-K-BLOCK',
    yaw: 12,
    pitch: -10,
    title: 'K Block (AI/ML & Data Science)',
    description: 'Deep learning clusters, robotics workshops, and computer vision research suites.',
    hotspotType: 'building',
    color: '#3b82f6'
  },
  {
    hotspotId: 'hs_acad_l_block',
    sceneId: 'scene_academic_quad_aerial',
    locationId: 'loc_l_block',
    buildingShortCode: 'PU-L-BLOCK',
    yaw: 42,
    pitch: -9,
    title: 'L Block (School of Law & Moot Court)',
    description: 'National-standard Moot Court Hall, Legal Aid Clinic, and specialized jurisprudence library.',
    hotspotType: 'building',
    color: '#3b82f6'
  },
  {
    hotspotId: 'hs_acad_n_block',
    sceneId: 'scene_academic_quad_aerial',
    locationId: 'loc_n_block',
    buildingShortCode: 'PU-N-BLOCK',
    yaw: -62,
    pitch: -14,
    title: 'N Block (Basic Sciences & Research)',
    description: 'Physics, Chemistry, and Applied Mathematics laboratories and faculty research rooms.',
    hotspotType: 'building',
    color: '#3b82f6'
  },
  {
    hotspotId: 'hs_acad_portal_to_central',
    sceneId: 'scene_academic_quad_aerial',
    yaw: 172,
    pitch: -8,
    title: 'Return to Central Campus Overview',
    description: 'Overview of central fountain and academic avenue.',
    hotspotType: 'scene_portal',
    targetSceneId: 'scene_central_campus_aerial',
    color: '#38bdf8'
  },

  // ==========================================
  // SCENE 4: SPORTS COMPLEX HOTSPOTS
  // ==========================================
  {
    hotspotId: 'hs_sports_basketball',
    sceneId: 'scene_sports_complex_aerial',
    locationId: 'loc_basketball',
    buildingShortCode: 'PU-SPORTS-BB',
    yaw: -18,
    pitch: -18,
    title: 'Standard Basketball Court',
    description: 'Tournament-spec synthetic turf basketball court with floodlighting.',
    hotspotType: 'sports',
    color: '#eab308'
  },
  {
    hotspotId: 'hs_sports_gym',
    sceneId: 'scene_sports_complex_aerial',
    locationId: 'loc_gym',
    buildingShortCode: 'PU-GYM-01',
    yaw: 36,
    pitch: -11,
    title: 'University Gymnasium & Fitness Suite',
    description: 'Cardio equipment, free weights, resistance machines, and certified fitness trainers.',
    hotspotType: 'sports',
    color: '#eab308'
  },
  {
    hotspotId: 'hs_sports_cricket',
    sceneId: 'scene_sports_complex_aerial',
    locationId: 'loc_cricket_nets',
    buildingShortCode: 'PU-CRICKET-01',
    yaw: -52,
    pitch: -14,
    title: 'Cricket Practice Nets',
    description: 'Enclosed turf practice nets for bowling and batting drills.',
    hotspotType: 'sports',
    color: '#eab308'
  },
  {
    hotspotId: 'hs_sports_volleyball',
    sceneId: 'scene_sports_complex_aerial',
    locationId: 'loc_volleyball',
    buildingShortCode: 'PU-VOLLEY-01',
    yaw: 14,
    pitch: -16,
    title: 'Volleyball Arena',
    description: 'Sand/clay outdoor volleyball court with safety netting.',
    hotspotType: 'sports',
    color: '#eab308'
  },
  {
    hotspotId: 'hs_sports_lawn',
    sceneId: 'scene_sports_complex_aerial',
    locationId: 'loc_main_lawn',
    buildingShortCode: 'PU-LAWN-MAIN',
    yaw: 68,
    pitch: -19,
    title: 'Main Campus Green Lawn',
    description: 'Expansive manicured open lawn for student recreation, relaxation, and university gatherings.',
    hotspotType: 'facility',
    color: '#10b981'
  },
  {
    hotspotId: 'hs_sports_portal_to_central',
    sceneId: 'scene_sports_complex_aerial',
    yaw: 165,
    pitch: -7,
    title: 'Return to Central Campus Overview',
    description: 'Navigate back to Central Campus.',
    hotspotType: 'scene_portal',
    targetSceneId: 'scene_central_campus_aerial',
    color: '#38bdf8'
  },

  // ==========================================
  // SCENE 5: CAFETERIA HUB HOTSPOTS
  // ==========================================
  {
    hotspotId: 'hs_cafe_main',
    sceneId: 'scene_cafeteria_hub_aerial',
    locationId: 'loc_cafeteria',
    buildingShortCode: 'PU-CAFE-01',
    yaw: -12,
    pitch: -17,
    title: 'Central Cafeteria Dining Hall',
    description: 'Spacious multi-counter dining hall serving breakfast, lunch, and evening snacks.',
    hotspotType: 'cafe',
    color: '#f97316'
  },
  {
    hotspotId: 'hs_cafe_food_court',
    sceneId: 'scene_cafeteria_hub_aerial',
    locationId: 'loc_food_court',
    buildingShortCode: 'PU-FOOD-01',
    yaw: 34,
    pitch: -13,
    title: 'Campus Food Court Plaza',
    description: 'Subway, Nescafe, juice bars, chaat counter, and bakery.',
    hotspotType: 'cafe',
    color: '#f97316'
  },
  {
    hotspotId: 'hs_cafe_mess',
    sceneId: 'scene_cafeteria_hub_aerial',
    locationId: 'loc_hostel_mess',
    buildingShortCode: 'PU-MESS-01',
    yaw: 68,
    pitch: -11,
    title: 'Hostel Mess Facility',
    description: 'Residential student dining facility serving hygienic buffet meals.',
    hotspotType: 'cafe',
    color: '#f97316'
  },
  {
    hotspotId: 'hs_cafe_canopy',
    sceneId: 'scene_cafeteria_hub_aerial',
    locationId: 'loc_canopy',
    buildingShortCode: 'PU-CANOPY-01',
    yaw: -44,
    pitch: -15,
    title: 'Canopy Seating Area',
    description: 'Shaded outdoor garden canopy seating for collaborative discussions and dining.',
    hotspotType: 'facility',
    color: '#10b981'
  },
  {
    hotspotId: 'hs_cafe_portal_to_central',
    sceneId: 'scene_cafeteria_hub_aerial',
    yaw: 176,
    pitch: -9,
    title: 'Return to Central Campus Overview',
    description: 'Fly back to Central Campus Overview.',
    hotspotType: 'scene_portal',
    targetSceneId: 'scene_central_campus_aerial',
    color: '#38bdf8'
  }
];
