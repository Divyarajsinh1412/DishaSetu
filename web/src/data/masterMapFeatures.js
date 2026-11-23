/**
 * DishaSetu: Official Presidency University Master Campus Map Features
 * High-Precision Normalized SVG Polygon Boundaries & Clickable Regions
 * Normalized coordinate space: X (0.0 to 1.0), Y (0.0 to 1.0) on 583 x 829 Master Reference Map.
 */

export const MASTER_CAMPUS_FEATURES = [
  // ==============================================================
  // 1. ACADEMIC & ADMINISTRATIVE BUILDINGS (CLICKABLE POLYGONS)
  // ==============================================================
  {
    featureId: 'bld_d_block',
    featureName: 'D Block',
    code: 'PU-D-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.2025,
    normalizedY: 0.6450,
    polygonCoordinates: [
      [0.150, 0.625],
      [0.258, 0.625],
      [0.258, 0.666],
      [0.150, 0.666]
    ],
    buildingId: 'bld_d_block',
    totalFloors: 6,
    hasIndoorMap: true,
    description: 'Premier Academic Block housing Mechanical Engineering, Civil Engineering, and specialized engineering laboratories across 6 fully surveyed floors.',
    departments: ['Mechanical Engineering', 'Civil Engineering', 'Material Science Lab', 'Fluid Mechanics Lab', 'CAD/CAM Centre'],
    latitude: 13.169369,
    longitude: 77.533523,
    gpsBounds: [
      [13.169134, 77.533219],
      [13.169604, 77.533826]
    ],
    gpsCoordinates: [
      [13.169604, 77.533343],
      [13.169320, 77.533219],
      [13.169134, 77.533686],
      [13.169412, 77.533826],
      [13.169604, 77.533343]
    ],
    status: 'Verified'
  },
  {
    featureId: 'bld_e_block',
    featureName: 'E Block',
    code: 'PU-E-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.2025,
    normalizedY: 0.6975,
    polygonCoordinates: [
      [0.150, 0.675],
      [0.258, 0.675],
      [0.258, 0.720],
      [0.150, 0.720]
    ],
    buildingId: 'bld_e_block',
    totalFloors: 3,
    hasIndoorMap: true,
    description: 'School of Computer Science & Engineering (CSE) academic block with programming studios, smart classrooms, and AI research labs.',
    departments: ['Computer Science & Engineering', 'Artificial Intelligence', 'Data Science Studio', 'Software Engineering Lab'],
    latitude: 13.168992,
    longitude: 77.533518,
    gpsBounds: [
      [13.168741, 77.533143],
      [13.169242, 77.533893]
    ],
    gpsCoordinates: [
      [13.169242, 77.533204],
      [13.169091, 77.533143],
      [13.169035, 77.533225],
      [13.168922, 77.533204],
      [13.168826, 77.533451],
      [13.168741, 77.533740],
      [13.168811, 77.533781],
      [13.168782, 77.533854],
      [13.168858, 77.533893],
      [13.168883, 77.533797],
      [13.168971, 77.533829],
      [13.169242, 77.533204]
    ],
    status: 'Verified'
  },
  {
    featureId: 'bld_f_block',
    featureName: 'F Block',
    code: 'PU-F-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.2025,
    normalizedY: 0.7510,
    polygonCoordinates: [
      [0.148, 0.728],
      [0.258, 0.728],
      [0.258, 0.774],
      [0.148, 0.774]
    ],
    buildingId: 'bld_f_block',
    totalFloors: 3,
    hasIndoorMap: true,
    description: 'School of Information Science & Technology (IST) hosting high-performance computing clusters and network laboratories.',
    departments: ['Information Science', 'Cybersecurity Center', 'Cloud Computing Lab', 'Network Systems'],
    latitude: 13.168627,
    longitude: 77.533329,
    gpsBounds: [
      [13.168373, 77.532983],
      [13.168881, 77.533676]
    ],
    gpsCoordinates: [
      [13.168881, 77.533110],
      [13.168602, 77.532983],
      [13.168478, 77.533287],
      [13.168373, 77.533601],
      [13.168618, 77.533676],
      [13.168881, 77.533110]
    ],
    status: 'Verified'
  },
  {
    featureId: 'bld_l_block',
    featureName: 'L Block',
    code: 'PU-L-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.2000,
    normalizedY: 0.8035,
    polygonCoordinates: [
      [0.145, 0.782],
      [0.252, 0.782],
      [0.252, 0.825],
      [0.145, 0.825]
    ],
    buildingId: 'bld_l_block',
    totalFloors: 3,
    hasIndoorMap: true,
    description: 'School of Electronics & Communication Engineering (ECE) with VLSI design suites, robotics arena, and embedded systems labs.',
    departments: ['Electronics & Communication', 'VLSI Design Lab', 'Embedded Systems', 'IoT Research Studio'],
    latitude: 13.168327,
    longitude: 77.533096,
    gpsBounds: [
      [13.168091, 77.532796],
      [13.168562, 77.533395]
    ],
    gpsCoordinates: [
      [13.168562, 77.532913],
      [13.168283, 77.532796],
      [13.168091, 77.533278],
      [13.168361, 77.533395],
      [13.168562, 77.532913]
    ],
    status: 'Verified'
  },
  {
    featureId: 'bld_admission_register',
    featureName: 'Admission Block & Register Office',
    code: 'PU-ADM-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.3325,
    normalizedY: 0.6800,
    polygonCoordinates: [
      [0.295, 0.670],
      [0.370, 0.670],
      [0.370, 0.690],
      [0.295, 0.690]
    ],
    buildingId: 'bld_adm_block',
    totalFloors: 2,
    hasIndoorMap: false,
    description: 'Central University Admissions Headquarters, Registrar Office, Student Verification, and Academic Records department.',
    departments: ['University Admissions', 'Office of the Registrar', 'Student Document Verification', 'Enrollment Desk'],
    latitude: 13.17045,
    longitude: 77.53610,
    status: 'Verified'
  },
  {
    featureId: 'bld_h_block',
    featureName: 'H Block',
    code: 'PU-H-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.3325,
    normalizedY: 0.7080,
    polygonCoordinates: [
      [0.295, 0.692],
      [0.370, 0.692],
      [0.370, 0.724],
      [0.295, 0.724]
    ],
    buildingId: 'bld_h_block',
    totalFloors: 3,
    hasIndoorMap: false,
    description: 'School of Electrical Engineering and applied sciences featuring power systems, electrical machines, and physics labs.',
    departments: ['Electrical Engineering', 'Power Systems Lab', 'Renewable Energy Research', 'Applied Sciences'],
    latitude: 13.17022,
    longitude: 77.53610,
    status: 'Survey Pending'
  },
  {
    featureId: 'bld_j_block',
    featureName: 'J Block',
    code: 'PU-J-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.2990,
    normalizedY: 0.7405,
    polygonCoordinates: [
      [0.278, 0.726],
      [0.320, 0.726],
      [0.320, 0.755],
      [0.278, 0.755]
    ],
    buildingId: 'bld_j_block',
    totalFloors: 3,
    hasIndoorMap: false,
    description: 'Specialized computing classrooms, multimedia laboratories, and tutorial seminar rooms.',
    departments: ['Multimedia Labs', 'Specialized Computing', 'Faculty Chambers'],
    latitude: 13.16998,
    longitude: 77.53600,
    status: 'Survey Pending'
  },
  {
    featureId: 'bld_k_block',
    featureName: 'K Block',
    code: 'PU-K-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.3450,
    normalizedY: 0.7530,
    polygonCoordinates: [
      [0.322, 0.738],
      [0.368, 0.738],
      [0.368, 0.768],
      [0.322, 0.768]
    ],
    buildingId: 'bld_k_block',
    totalFloors: 3,
    hasIndoorMap: false,
    description: 'Engineering seminar halls, student collaboration project spaces, and faculty research cubicles.',
    departments: ['Research Project Labs', 'Faculty Chambers', 'Conference Rooms'],
    latitude: 13.16988,
    longitude: 77.53625,
    status: 'Survey Pending'
  },
  {
    featureId: 'bld_n_block',
    featureName: 'N Block',
    code: 'PU-N-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.3150,
    normalizedY: 0.7960,
    polygonCoordinates: [
      [0.270, 0.780],
      [0.360, 0.780],
      [0.360, 0.812],
      [0.270, 0.812]
    ],
    buildingId: 'bld_n_block',
    totalFloors: 3,
    hasIndoorMap: true,
    description: 'School of Design (SOD) and Department of Architecture with drafting studios, modeling shops, and exhibition galleries.',
    departments: ['School of Design (SOD)', 'Architecture Studios', 'Visual Arts Gallery', 'Industrial Design Workshop'],
    latitude: 13.16952,
    longitude: 77.53610,
    status: 'Survey Pending'
  },
  {
    featureId: 'bld_p_block',
    featureName: 'P Block',
    code: 'PU-P-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.3475,
    normalizedY: 0.8330,
    polygonCoordinates: [
      [0.325, 0.818],
      [0.370, 0.818],
      [0.370, 0.848],
      [0.325, 0.848]
    ],
    buildingId: 'bld_p_block',
    totalFloors: 3,
    hasIndoorMap: false,
    description: 'Academic block accommodating postgraduate lecture halls, PhD scholar workstations, and research libraries.',
    departments: ['Postgraduate Studies', 'Doctoral Research Hub', 'Language & Communication Lab'],
    latitude: 13.16922,
    longitude: 77.53630,
    status: 'Survey Pending'
  },
  {
    featureId: 'bld_q_block',
    featureName: 'Q Block',
    code: 'PU-Q-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.2900,
    normalizedY: 0.8680,
    polygonCoordinates: [
      [0.265, 0.852],
      [0.315, 0.852],
      [0.315, 0.884],
      [0.265, 0.884]
    ],
    buildingId: 'bld_q_block',
    totalFloors: 3,
    hasIndoorMap: false,
    description: 'Classroom suites, smart interactive learning pods, and foundational sciences instruction rooms.',
    departments: ['Basic Sciences', 'Mathematics & Analytics', 'Foundational Engineering'],
    latitude: 13.16895,
    longitude: 77.53605,
    status: 'Survey Pending'
  },
  {
    featureId: 'bld_r_block',
    featureName: 'R Block',
    code: 'PU-R-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.3300,
    normalizedY: 0.8970,
    polygonCoordinates: [
      [0.305, 0.882],
      [0.355, 0.882],
      [0.355, 0.912],
      [0.305, 0.912]
    ],
    buildingId: 'bld_r_block',
    totalFloors: 3,
    hasIndoorMap: false,
    description: 'South campus instructional block housing specialized humanities, student leadership rooms, and seminar halls.',
    departments: ['Humanities & Social Sciences', 'Student Club Rooms', 'Discussion Hub'],
    latitude: 13.16875,
    longitude: 77.53625,
    status: 'Survey Pending'
  },
  {
    featureId: 'bld_s_block',
    featureName: 'S Block',
    code: 'PU-S-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.2375,
    normalizedY: 0.8875,
    polygonCoordinates: [
      [0.215, 0.850],
      [0.260, 0.850],
      [0.260, 0.925],
      [0.215, 0.925]
    ],
    buildingId: 'bld_s_block',
    totalFloors: 3,
    hasIndoorMap: false,
    description: 'School of Law & Humanities South wing, accompanied by court-trial simulation rooms, student lounge, and dining pavilion.',
    departments: ['Moot Court', 'Legal Studies', 'Student Dining Pavilion', 'Faculty Chambers'],
    latitude: 13.16880,
    longitude: 77.53560,
    status: 'Survey Pending'
  },
  {
    featureId: 'bld_u_block',
    featureName: 'U Block',
    code: 'PU-U-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.3050,
    normalizedY: 0.9230,
    polygonCoordinates: [
      [0.258, 0.906],
      [0.352, 0.906],
      [0.352, 0.940],
      [0.258, 0.940]
    ],
    buildingId: 'bld_u_block',
    totalFloors: 3,
    hasIndoorMap: false,
    description: 'South campus block providing seminar rooms, study pods, student innovation incubator, and administrative storage.',
    departments: ['Student Innovation Hub', 'Incubation Center', 'Study Pods'],
    latitude: 13.16855,
    longitude: 77.53600,
    status: 'Survey Pending'
  },
  {
    featureId: 'bld_hr_block',
    featureName: 'Plaza & HR Block',
    code: 'PU-HR-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.4475,
    normalizedY: 0.6870,
    polygonCoordinates: [
      [0.400, 0.648],
      [0.495, 0.648],
      [0.495, 0.726],
      [0.400, 0.726]
    ],
    buildingId: 'bld_hr_block',
    totalFloors: 4,
    hasIndoorMap: false,
    description: 'Central Administrative Headquarters, Human Resources Directorate, Executive Boardrooms, and Chancellor Secretariat.',
    departments: ['Human Resources Department', 'Executive Boardroom', 'Chancellor Secretariat', 'Staff Affairs'],
    latitude: 13.17035,
    longitude: 77.53670,
    status: 'Verified'
  },
  {
    featureId: 'bld_coe',
    featureName: 'COE (Controller of Examinations)',
    code: 'PU-COE',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.4925,
    normalizedY: 0.7140,
    polygonCoordinates: [
      [0.475, 0.698],
      [0.510, 0.698],
      [0.510, 0.730],
      [0.475, 0.730]
    ],
    buildingId: 'bld_coe',
    totalFloors: 2,
    hasIndoorMap: false,
    description: 'Controller of Examinations building overseeing all university semester examinations, evaluations, grade transcripts, and convocation rosters.',
    departments: ['Examination Evaluation Wing', 'Transcript Services', 'Confidential Records', 'Degree Certificates'],
    latitude: 13.17015,
    longitude: 77.53685,
    status: 'Verified'
  },
  {
    featureId: 'bld_fee_counter',
    featureName: 'Fee Counter & Finance Office',
    code: 'PU-FEE-COUNTER',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.5200,
    normalizedY: 0.6665,
    polygonCoordinates: [
      [0.490, 0.655],
      [0.550, 0.655],
      [0.550, 0.678],
      [0.490, 0.678]
    ],
    buildingId: 'bld_fee_counter',
    totalFloors: 2,
    hasIndoorMap: false,
    description: 'Official student fee collection counters, scholarship disbursal desk, cashier, and university financial services.',
    departments: ['Tuition Fee Cashier', 'Scholarship Helpdesk', 'Education Loan Assistance', 'Finance Department'],
    latitude: 13.17048,
    longitude: 77.53700,
    status: 'Verified'
  },
  {
    featureId: 'bld_dsa',
    featureName: 'DSA (Directorate of Student Affairs)',
    code: 'PU-DSA',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.5330,
    normalizedY: 0.7200,
    polygonCoordinates: [
      [0.518, 0.710],
      [0.548, 0.710],
      [0.548, 0.730],
      [0.518, 0.730]
    ],
    buildingId: 'bld_dsa',
    totalFloors: 2,
    hasIndoorMap: false,
    description: 'Directorate of Student Affairs coordinating cultural events, student welfare, extracurricular clubs, and sports organizations.',
    departments: ['Student Welfare Council', 'Clubs & Societies Hub', 'Campus Life Events', 'Grievance Redressal'],
    latitude: 13.17005,
    longitude: 77.53710,
    status: 'Verified'
  },
  {
    featureId: 'bld_som_block',
    featureName: 'M Block (MBA / SOM)',
    code: 'PU-M-BLOCK',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.6325,
    normalizedY: 0.7200,
    polygonCoordinates: [
      [0.575, 0.702],
      [0.690, 0.702],
      [0.690, 0.738],
      [0.575, 0.738]
    ],
    buildingId: 'bld_som_block',
    totalFloors: 3,
    hasIndoorMap: true,
    description: 'School of Management (SOM) featuring Harvard-style corporate amphitheaters, trading simulation rooms, and case study suites.',
    departments: ['School of Management (SOM)', 'Financial Analytics Lab', 'Corporate Boardrooms', 'Management Studies'],
    latitude: 13.17010,
    longitude: 77.53745,
    status: 'Verified'
  },
  {
    featureId: 'bld_auditorium',
    featureName: 'Auditorium',
    code: 'PU-AUDITORIUM',
    category: 'Academic',
    type: 'polygon',
    normalizedX: 0.7315,
    normalizedY: 0.6790,
    polygonCoordinates: [
      [0.685, 0.658],
      [0.778, 0.658],
      [0.778, 0.700],
      [0.685, 0.700]
    ],
    buildingId: 'bld_auditorium',
    totalFloors: 3,
    hasIndoorMap: false,
    description: 'Grand University Auditorium seating 1,200+ guests with acoustically-treated auditorium, balcony, backstage wings, and gala foyers.',
    departments: ['Main Grand Hall (1,200 seats)', 'Backstage VIP Suites', 'Audio-Visual Control Booth', 'Exhibition Foyer'],
    latitude: 13.17025,
    longitude: 77.53815,
    status: 'Verified'
  },
  {
    featureId: 'bld_hostel_mess',
    featureName: 'Hostel Mess & Dining Hall',
    code: 'PU-HOSTEL-MESS',
    category: 'Cafe',
    type: 'polygon',
    normalizedX: 0.6930,
    normalizedY: 0.5450,
    polygonCoordinates: [
      [0.668, 0.520],
      [0.718, 0.520],
      [0.718, 0.570],
      [0.668, 0.570]
    ],
    buildingId: 'bld_hostel_mess',
    totalFloors: 2,
    hasIndoorMap: false,
    description: 'Central student residential mess and dining hall serving hygienic multi-cuisine meals for campus resident students.',
    departments: ['Main Student Dining Hall', 'Resident Cafeteria', 'Nutritional Kitchen'],
    latitude: 13.17115,
    longitude: 77.53785,
    status: 'Verified'
  },

  // ==============================================================
  // 2. CENTRAL GREEN & WATER LANDMARKS (POLYGONS & CIRCLES)
  // ==============================================================
  {
    featureId: 'feat_main_lawn',
    featureName: 'Main Lawn',
    code: 'PU-MAIN-LAWN',
    category: 'Garden',
    type: 'polygon',
    normalizedX: 0.5900,
    normalizedY: 0.4150,
    polygonCoordinates: [
      [0.5969, 0.2569], // Top-Left corner (near Main Gate avenue)
      [0.6810, 0.2786], // Top-Right corner (near Frisking Area road)
      [0.6192, 0.5392], // Bottom-Right corner (opposite Faculty Parking)
      [0.5695, 0.5392], // Bottom notch (cross-road junction)
      [0.4871, 0.5778]  // Bottom-Left corner (opposite Bus Boarding / Fountain road)
    ],
    description: 'Lush expansive central campus green lawn providing peaceful student relaxation, garden paths, and grand ceremonial avenue view.',
    latitude: 13.17032,
    longitude: 77.53605,
    status: 'Verified'
  },
  {
    featureId: 'feat_fountain',
    featureName: 'Central Fountain',
    code: 'PU-FOUNTAIN',
    category: 'Landmark',
    type: 'circle',
    normalizedX: 0.4666,
    normalizedY: 0.6120,
    radius: 0.042,
    description: 'Iconic illuminated circular architectural water fountain serving as the primary directional roundabout and meeting hub.',
    latitude: 13.17075,
    longitude: 77.53635,
    status: 'Verified'
  },
  {
    featureId: 'feat_dsa_lawn',
    featureName: 'DSA Lawn',
    code: 'PU-DSA-LAWN',
    category: 'Garden',
    type: 'polygon',
    normalizedX: 0.5675,
    normalizedY: 0.7000,
    polygonCoordinates: [
      [0.550, 0.690],
      [0.585, 0.690],
      [0.585, 0.710],
      [0.550, 0.710]
    ],
    description: 'Landscaped student quad situated adjacent to Directorate of Student Affairs for student club meets and open-air discussions.',
    latitude: 13.17015,
    longitude: 77.53725,
    status: 'Verified'
  },
  {
    featureId: 'feat_oat',
    featureName: 'O.A.T. (Open Air Theatre)',
    code: 'PU-OAT',
    category: 'Landmark',
    type: 'marker',
    normalizedX: 0.7500,
    normalizedY: 0.6380,
    description: 'Terraced open-air amphitheater for evening cultural performances, acoustic music sessions, and theatrical showcases.',
    latitude: 13.17055,
    longitude: 77.53835,
    status: 'Verified'
  },

  // ==============================================================
  // 3. SPORTS COMPLEX & ARENAS (POLYGONS)
  // ==============================================================
  {
    featureId: 'feat_football_court',
    featureName: 'Football Court',
    code: 'PU-FOOTBALL-COURT',
    category: 'Sports',
    type: 'polygon',
    normalizedX: 0.4200,
    normalizedY: 0.3750,
    polygonCoordinates: [
      [0.355, 0.315],
      [0.485, 0.315],
      [0.485, 0.435],
      [0.355, 0.435]
    ],
    description: 'Regulation standard outdoor turf football field with goal posts, match lighting, and spectator boundary.',
    latitude: 13.17170,
    longitude: 77.53540,
    status: 'Verified'
  },
  {
    featureId: 'feat_volleyball_nets',
    featureName: 'Volleyball Nets',
    code: 'PU-VOLLEYBALL-NETS',
    category: 'Sports',
    type: 'polygon',
    normalizedX: 0.3065,
    normalizedY: 0.4765,
    polygonCoordinates: [
      [0.258, 0.448],
      [0.355, 0.448],
      [0.355, 0.505],
      [0.258, 0.505]
    ],
    description: 'Outdoor sand volleyball courts equipped with professional tournament-grade nets and perimeter fencing.',
    latitude: 13.17135,
    longitude: 77.53510,
    status: 'Verified'
  },
  {
    featureId: 'feat_basketball_court',
    featureName: 'Basketball Court',
    code: 'PU-BASKETBALL-COURT',
    category: 'Sports',
    type: 'polygon',
    normalizedX: 0.2015,
    normalizedY: 0.5375,
    polygonCoordinates: [
      [0.145, 0.495],
      [0.258, 0.495],
      [0.258, 0.580],
      [0.145, 0.580]
    ],
    description: 'Competition synthetic acrylic basketball court with pro spring-action backboards and floodlight towers.',
    latitude: 13.17110,
    longitude: 77.53480,
    status: 'Verified'
  },
  {
    featureId: 'feat_cricket_nets',
    featureName: 'Cricket Nets',
    code: 'PU-CRICKET-NETS',
    category: 'Sports',
    type: 'polygon',
    normalizedX: 0.3065,
    normalizedY: 0.5425,
    polygonCoordinates: [
      [0.258, 0.505],
      [0.355, 0.505],
      [0.355, 0.580],
      [0.258, 0.580]
    ],
    description: 'Dual-strip netted cricket practice pitch with astroturf mats for batting and bowling training.',
    latitude: 13.17105,
    longitude: 77.53520,
    status: 'Verified'
  },

  // ==============================================================
  // 4. GATES, ENTRANCES, SECURITY & PEDESTRIAN PATHWAYS
  // ==============================================================
  {
    featureId: 'feat_walking_corridor_main_to_d',
    featureName: 'Main Gate → D Block Pathway',
    code: 'PU-PATH-MAIN-D',
    category: 'Pathway',
    type: 'polygon',
    normalizedX: 0.5280,
    normalizedY: 0.4040,
    polygonCoordinates: [
      [0.5680, 0.2410],
      [0.5701, 0.2524],
      [0.5730, 0.2642],
      [0.5740, 0.2775],
      [0.5702, 0.2944],
      [0.5603, 0.3187],
      [0.5473, 0.3468],
      [0.5343, 0.3750],
      [0.5223, 0.4031],
      [0.5102, 0.4314],
      [0.5002, 0.4596],
      [0.4911, 0.4879],
      [0.4851, 0.5127],
      [0.4801, 0.5336],
      [0.4747, 0.5479],
      [0.4579, 0.5630],
      [0.4264, 0.5789],
      [0.3960, 0.5960],
      [0.3740, 0.6115],
      [0.3550, 0.6222],
      [0.3281, 0.6303],
      [0.2969, 0.6358],
      [0.2675, 0.6385],
      [0.2450, 0.6385],
      [0.2450, 0.6470],
      [0.2685, 0.6470],
      [0.2991, 0.6441],
      [0.3319, 0.6383],
      [0.3610, 0.6295],
      [0.3820, 0.6178],
      [0.4040, 0.6023],
      [0.4336, 0.5856],
      [0.4661, 0.5692],
      [0.4853, 0.5519],
      [0.4919, 0.5353],
      [0.4969, 0.5141],
      [0.5029, 0.4896],
      [0.5118, 0.4616],
      [0.5218, 0.4336],
      [0.5337, 0.4056],
      [0.5457, 0.3775],
      [0.5587, 0.3494],
      [0.5717, 0.3212],
      [0.5818, 0.2963],
      [0.5860, 0.2781],
      [0.5850, 0.2633],
      [0.5819, 0.2511],
      [0.5800, 0.2400]
    ],
    description: 'Official university surveyed walking route connecting Main Gate to D Block entrance via Central Promenade, Bus Boarding, and Central Fountain roundabout.',
    departments: ['Main Gate Portal', 'Central Promenade', 'Bus Boarding', 'Central Fountain Roundabout', 'D Block Academic Core'],
    latitude: 13.17036,
    longitude: 77.53517,
    status: 'Verified'
  },
  {
    featureId: 'feat_main_gate',
    featureName: 'Main Gate',
    code: 'PU-GATE-MAIN',
    category: 'Gate',
    type: 'marker',
    normalizedX: 0.5695,
    normalizedY: 0.2449,
    description: 'Official ceremonial Main Entrance Gate and primary security portal of Presidency University Bengaluru.',
    latitude: 13.1717995,
    longitude: 77.5361915,
    status: 'Verified'
  },
  {
    featureId: 'feat_entry_exit',
    featureName: 'Entry / Exit Point',
    code: 'PU-GATE-ENTRY-EXIT',
    category: 'Gate',
    type: 'marker',
    normalizedX: 0.5077,
    normalizedY: 0.2111,
    description: 'Main vehicular approach driveway and security boom barrier checkpoint.',
    latitude: 13.17215,
    longitude: 77.53605,
    status: 'Verified'
  },
  {
    featureId: 'feat_gate_2',
    featureName: 'Gate 2',
    code: 'PU-GATE-2',
    category: 'Gate',
    type: 'marker',
    normalizedX: 0.7450,
    normalizedY: 0.1900,
    description: 'East perimeter campus gate serving university bus fleet, visitor vehicles, and delivery logistics.',
    latitude: 13.17235,
    longitude: 77.53765,
    status: 'Verified'
  },
  {
    featureId: 'feat_frisking_area_1',
    featureName: 'Security Frisking Area (West Gate)',
    code: 'PU-SEC-FRISK-1',
    category: 'Security',
    type: 'marker',
    normalizedX: 0.5400,
    normalizedY: 0.3000,
    description: 'Student electronic RFID ID check and security metal detector scan point.',
    latitude: 13.17165,
    longitude: 77.53620,
    status: 'Verified'
  },
  {
    featureId: 'feat_frisking_area_2',
    featureName: 'Security Frisking Area (East Gate)',
    code: 'PU-SEC-FRISK-2',
    category: 'Security',
    type: 'marker',
    normalizedX: 0.7200,
    normalizedY: 0.2850,
    description: 'Secondary security frisking station for visitors and east sector bus commuters.',
    latitude: 13.17180,
    longitude: 77.53745,
    status: 'Verified'
  },

  // ==============================================================
  // 5. PARKING SECTORS & BUS TRANSPORTATION
  // ==============================================================
  {
    featureId: 'feat_main_student_parking',
    featureName: 'Main Student Parking',
    code: 'PU-PARK-STU-MAIN',
    category: 'Parking',
    type: 'marker',
    normalizedX: 0.4631,
    normalizedY: 0.1025,
    description: 'Large designated student multi-tier parking grounds accommodating two-wheelers and registered four-wheelers.',
    latitude: 13.17285,
    longitude: 77.53595,
    status: 'Verified'
  },
  {
    featureId: 'feat_student_2w_parking',
    featureName: 'Student 2 Wheeler Parking',
    code: 'PU-PARK-2W-STU',
    category: 'Parking',
    type: 'marker',
    normalizedX: 0.4950,
    normalizedY: 0.2650,
    description: 'Paved, shaded two-wheeler motorcycle and scooter parking zone located immediately beside Main Entrance.',
    latitude: 13.17185,
    longitude: 77.53585,
    status: 'Verified'
  },
  {
    featureId: 'feat_visitor_parking',
    featureName: 'Visitor Parking',
    code: 'PU-PARK-VISITOR',
    category: 'Parking',
    type: 'marker',
    normalizedX: 0.6550,
    normalizedY: 0.2150,
    description: 'Designated parking for prospective students, guest lecturers, parents, and campus visitors.',
    latitude: 13.17210,
    longitude: 77.53715,
    status: 'Verified'
  },
  {
    featureId: 'feat_4w_parking',
    featureName: '4 Wheeler Parking',
    code: 'PU-PARK-4W',
    category: 'Parking',
    type: 'marker',
    normalizedX: 0.8120,
    normalizedY: 0.3320,
    description: 'East campus parking grounds dedicated to university administrative cars and four-wheelers.',
    latitude: 13.17155,
    longitude: 77.53835,
    status: 'Verified'
  },
  {
    featureId: 'feat_faculty_2w_parking',
    featureName: 'Faculty 2 Wheeler Parking',
    code: 'PU-PARK-2W-FACULTY',
    category: 'Parking',
    type: 'marker',
    normalizedX: 0.7180,
    normalizedY: 0.4180,
    description: 'Reserved faculty two-wheeler sheltered parking bays.',
    latitude: 13.17130,
    longitude: 77.53760,
    status: 'Verified'
  },
  {
    featureId: 'feat_faculty_4w_parking',
    featureName: 'Faculty 4 Wheeler Parking',
    code: 'PU-PARK-4W-FACULTY',
    category: 'Parking',
    type: 'marker',
    normalizedX: 0.7050,
    normalizedY: 0.4950,
    description: 'Reserved designated car bays for Deans, professors, and faculty members.',
    latitude: 13.17105,
    longitude: 77.53765,
    status: 'Verified'
  },
  {
    featureId: 'feat_bus_point_2',
    featureName: 'Bus Point 2',
    code: 'PU-BUS-POINT-2',
    category: 'Transport',
    type: 'marker',
    normalizedX: 0.7680,
    normalizedY: 0.2450,
    description: 'East campus bus terminal for inter-city student and staff shuttle coaches.',
    latitude: 13.17215,
    longitude: 77.53795,
    status: 'Verified'
  },
  {
    featureId: 'feat_bus_boarding',
    featureName: 'Bus Boarding Bay',
    code: 'PU-BUS-BOARDING',
    category: 'Transport',
    type: 'marker',
    normalizedX: 0.4940,
    normalizedY: 0.5127,
    description: 'Main campus bus boarding line alongside the walking avenue with clearly marked departure bays.',
    latitude: 13.17120,
    longitude: 77.53630,
    status: 'Verified'
  },

  // ==============================================================
  // 6. SPECIALIZED CAMPUS FACILITIES (LIBRARY, FOOD, MEDICAL, ATM)
  // ==============================================================
  {
    featureId: 'feat_central_library',
    featureName: 'Central Library',
    code: 'PU-LIBRARY-CENTRAL',
    category: 'Library',
    type: 'marker',
    normalizedX: 0.6450,
    normalizedY: 0.6550,
    description: 'State-of-the-art Central University Library housing 65,000+ volumes, IEEE digital repositories, thesis archives, quiet reading rooms, and audio-visual pods.',
    operatingHours: '08:00 AM – 09:00 PM (Monday to Saturday)',
    latitude: 13.17045,
    longitude: 77.53750,
    status: 'Verified'
  },
  {
    featureId: 'feat_food_d_block',
    featureName: 'Hatti Kappi',
    code: 'PU-CAFE-D-BLOCK',
    category: 'Cafe',
    brand: 'Hatti Kappi',
    type: 'marker',
    normalizedX: 0.3100,
    normalizedY: 0.6180,
    description: 'Authentic South Indian traditional filter coffee brewed from freshly ground roasted beans, signature Mysore filter coffee, hot regional tiffin, crispy vadas, and traditional snacks near D Block.',
    operatingHours: '07:30 AM – 08:30 PM (Daily)',
    latitude: 13.17085,
    longitude: 77.53590,
    status: 'Verified'
  },
  {
    featureId: 'feat_food_j_block',
    featureName: 'Food Point (J Block Courtyard)',
    code: 'PU-CAFE-J-BLOCK',
    category: 'Cafe',
    type: 'marker',
    normalizedX: 0.2980,
    normalizedY: 0.7520,
    description: 'Courtyard cafe serving hot meals, tea, bakery items, and quick lunch snacks.',
    latitude: 13.16985,
    longitude: 77.53595,
    status: 'Verified'
  },
  {
    featureId: 'feat_food_s_block',
    featureName: 'Food Point (S Block Law Pavilion)',
    code: 'PU-CAFE-S-BLOCK',
    category: 'Cafe',
    type: 'marker',
    normalizedX: 0.2450,
    normalizedY: 0.8800,
    description: 'Outdoor shaded cafeteria with student seating, cold beverages, and daily regional specials.',
    latitude: 13.16890,
    longitude: 77.53550,
    status: 'Verified'
  },
  {
    featureId: 'feat_food_dsa',
    featureName: 'Food Point (DSA Plaza)',
    code: 'PU-CAFE-DSA',
    category: 'Cafe',
    type: 'marker',
    normalizedX: 0.5280,
    normalizedY: 0.6920,
    description: 'Popular student central plaza cafe serving milkshakes, wraps, pizzas, and bakery fresh pastries.',
    latitude: 13.17025,
    longitude: 77.53705,
    status: 'Verified'
  },
  {
    featureId: 'feat_food_auditorium',
    featureName: 'Food Point (Auditorium Concourse)',
    code: 'PU-CAFE-AUDITORIUM',
    category: 'Cafe',
    type: 'marker',
    normalizedX: 0.7600,
    normalizedY: 0.6550,
    description: 'Event refreshments and cafeteria adjacent to the University Auditorium.',
    latitude: 13.17040,
    longitude: 77.53830,
    status: 'Verified'
  },
  {
    featureId: 'feat_medical_room',
    featureName: 'Campus Medical Health Centre',
    code: 'PU-MED-CENTRE',
    category: 'Medical',
    type: 'marker',
    normalizedX: 0.6020,
    normalizedY: 0.6650,
    description: 'Full-time campus medical clinic with registered nurse, physician on call, emergency first-aid beds, and basic diagnostics.',
    operatingHours: '24/7 Emergency Care with Campus Ambulance Support',
    latitude: 13.17042,
    longitude: 77.53730,
    status: 'Verified'
  },
  {
    featureId: 'feat_atm_plaza',
    featureName: 'Campus Bank ATM (HR Block)',
    code: 'PU-ATM-PLAZA',
    category: 'Facility',
    type: 'marker',
    normalizedX: 0.2920,
    normalizedY: 0.6550,
    description: '24-hour National Bank ATM and digital cash deposit kiosk situated at the academic pathway junction.',
    operatingHours: '24/7 Continuous Service',
    latitude: 13.17065,
    longitude: 77.53585,
    status: 'Verified'
  },
  {
    featureId: 'feat_path_d_to_e',
    featureName: 'D Block → E Block Walkway',
    code: 'PU-PATH-D-E',
    category: 'Pathway',
    type: 'polyline',
    normalizedX: 0.2025,
    normalizedY: 0.6710,
    pathCoordinates: [
      [0.2025, 0.6450],
      [0.2025, 0.6620],
      [0.2025, 0.6800],
      [0.2025, 0.6975]
    ],
    description: 'Surveyed covered academic corridor connecting D Block (Mechanical & Civil Engineering) to E Block (Computer Science & Engineering).',
    departments: ['Academic Quad Corridor', 'D Block Portal', 'E Block Portal'],
    latitude: 13.16910,
    longitude: 77.53366,
    distanceMeters: 35.7,
    status: 'Verified'
  },
  {
    featureId: 'feat_path_e_to_f',
    featureName: 'E Block → F Block Walkway',
    code: 'PU-PATH-E-F',
    category: 'Pathway',
    type: 'polyline',
    normalizedX: 0.2040,
    normalizedY: 0.6550,
    pathCoordinates: [
      [0.2040, 0.6975],
      [0.2040, 0.6750],
      [0.2040, 0.6550],
      [0.2040, 0.6350]
    ],
    description: 'Surveyed academic corridor connecting E Block (Computer Science) to F Block (Information Science & Technology).',
    departments: ['Academic Quad Corridor', 'E Block Portal', 'F Block Portal'],
    latitude: 13.16904,
    longitude: 77.53366,
    distanceMeters: 47.0,
    status: 'Verified'
  }
];

export const WALKING_ROUTE_MAIN_TO_D_CENTERLINE = [
  { x: 0.5740, y: 0.2405 }, // Main Gate (ENTRY / EXIT)
  { x: 0.5760, y: 0.2518 },
  { x: 0.5790, y: 0.2637 },
  { x: 0.5800, y: 0.2778 },
  { x: 0.5760, y: 0.2954 },
  { x: 0.5660, y: 0.3200 }, // Along west of Main Lawn
  { x: 0.5530, y: 0.3481 },
  { x: 0.5400, y: 0.3762 },
  { x: 0.5280, y: 0.4044 },
  { x: 0.5160, y: 0.4325 },
  { x: 0.5060, y: 0.4606 },
  { x: 0.4970, y: 0.4887 },
  { x: 0.4910, y: 0.5134 }, // Bus Boarding bay
  { x: 0.4860, y: 0.5345 },
  { x: 0.4800, y: 0.5499 },
  { x: 0.4620, y: 0.5661 }, // Outer road curve around Central Fountain
  { x: 0.4300, y: 0.5823 },
  { x: 0.4000, y: 0.5992 },
  { x: 0.3780, y: 0.6146 },
  { x: 0.3580, y: 0.6259 },
  { x: 0.3300, y: 0.6343 }, // East-West avenue to D Block
  { x: 0.2980, y: 0.6399 },
  { x: 0.2680, y: 0.6428 },
  { x: 0.2450, y: 0.6428 }  // D Block Entrance ("WAY TO A-K BLOCKS")
];

export const WALKING_ROUTE_D_TO_E_CENTERLINE = [
  { x: 0.2025, y: 0.6450 }, // D Block Entrance
  { x: 0.2025, y: 0.6620 },
  { x: 0.2025, y: 0.6800 },
  { x: 0.2025, y: 0.6975 }  // E Block Entrance
];

export default MASTER_CAMPUS_FEATURES;
