import * as THREE from 'three';

/**
 * Coordinate Transformation & Architectural Specifications for Presidency University Bengaluru
 * Master Reference: Official Presidency University Campus Master Map
 *
 * Center Origin: Campus Central Fountain (imageX: 0.4666, imageY: 0.5995) -> 3D World (x: 0, z: 0)
 * Scaled and spaced generously to ensure buildings, roads, lawns, and facilities are large,
 * clearly visible, and have ample pedestrian spacing without any overlap.
 */

export const REF_LAT = 13.169277;
export const REF_LNG = 77.534963;

// Calibrated Generous Map World Proportions
export const MAP_CENTER_X = 0.4666;
export const MAP_CENTER_Y = 0.5995;
export const WORLD_SCALE_X = 490; // Increased scale for wide spatial spacing
export const WORLD_SCALE_Z = 670; // Increased scale for long north-south corridor

/**
 * Converts normalized map coordinates (0.0 to 1.0) into 3D World coordinates
 */
export function mapToWorld(imageX, imageY, elevation = 0) {
  if (imageX == null || imageY == null) return new THREE.Vector3(0, elevation, 0);
  const x = (imageX - MAP_CENTER_X) * WORLD_SCALE_X;
  const z = (imageY - MAP_CENTER_Y) * WORLD_SCALE_Z;
  return new THREE.Vector3(x, elevation, z);
}

/**
 * Converts 3D World coordinates back to normalized map coordinates (0.0 to 1.0)
 */
export function worldToMap(x, z) {
  return {
    imageX: (x / WORLD_SCALE_X) + MAP_CENTER_X,
    imageY: (z / WORLD_SCALE_Z) + MAP_CENTER_Y
  };
}

/**
 * Converts GPS (lat, lng) to Three.js World coordinates
 */
export function gpsToWorld(lat, lng, y = 0) {
  if (lat == null || lng == null) return new THREE.Vector3(0, y, 0);
  const METERS_PER_LAT = 111000;
  const METERS_PER_LNG = 108078;
  const x = (lng - REF_LNG) * METERS_PER_LNG;
  const z = -(lat - REF_LAT) * METERS_PER_LAT;
  return new THREE.Vector3(x, y, z);
}

/**
 * Converts Three.js World coordinates back to GPS (lat, lng)
 */
export function worldToGps(x, z) {
  const METERS_PER_LAT = 111000;
  const METERS_PER_LNG = 108078;
  const lat = REF_LAT - (z / METERS_PER_LAT);
  const lng = REF_LNG + (x / METERS_PER_LNG);
  return { lat, lng };
}

/**
 * Full Set of Architectural Specifications for Presidency University Buildings & Facilities
 * Modeled strictly following the Official Campus Master Map layout with enlarged dimensions
 * and generous pedestrian gaps between every single building.
 */
export const CAMPUS_BUILDING_SPECS = {
  // ==========================================
  // WEST ACADEMIC COLUMN (D, E, F, L BLOCKS)
  // Generously spaced along the western perimeter
  // ==========================================
  loc_d_block: {
    id: 'loc_d_block',
    name: 'D Block',
    label: 'D BLOCK',
    shortCode: 'PU-D-BLOCK',
    category: 'Academic',
    imageX: 0.2041,
    imageY: 0.6478,
    centerGps: { lat: 13.17055, lng: 77.53561 },
    dimensions: { width: 54, depth: 26, height: 28, floors: 6 },
    rotation: 0.0,
    color: '#F8FAFC',
    accentColor: '#10B981',
    roofType: 'solar_terrace',
    departments: ['Mechanical Engineering', 'CAD/CAM Labs', 'Robotics & Automation Studio', 'Fluid Dynamics Lab']
  },
  loc_e_block: {
    id: 'loc_e_block',
    name: 'E Block',
    label: 'E BLOCK',
    shortCode: 'PU-E-BLOCK',
    category: 'Academic',
    imageX: 0.2024,
    imageY: 0.6972,
    centerGps: { lat: 13.17005, lng: 77.53542 },
    dimensions: { width: 54, depth: 26, height: 24, floors: 4 },
    rotation: 0.0,
    color: '#F8FAFC',
    accentColor: '#38BDF8',
    roofType: 'solar_terrace',
    departments: ['Electrical & Electronics Eng (EEE)', 'Electronics & Comm Eng (ECE)', 'Embedded Systems Lab', 'VLSI Design Studio']
  },
  loc_f_block: {
    id: 'loc_f_block',
    name: 'F Block',
    label: 'F BLOCK',
    shortCode: 'PU-F-BLOCK',
    category: 'Academic',
    imageX: 0.2024,
    imageY: 0.7491,
    centerGps: { lat: 13.16952, lng: 77.53528 },
    dimensions: { width: 54, depth: 26, height: 24, floors: 4 },
    rotation: 0.0,
    color: '#FFFFFF',
    accentColor: '#6366F1',
    roofType: 'solar_terrace',
    departments: ['School of Computer Science & Engineering (CSE)', 'AI & Machine Learning CoE', 'Cloud Computing Lab', 'Cybersecurity Center']
  },
  loc_l_block: {
    id: 'loc_l_block',
    name: 'L Block',
    label: 'L BLOCK',
    shortCode: 'PU-L-BLOCK',
    category: 'Academic',
    imageX: 0.1990,
    imageY: 0.8022,
    centerGps: { lat: 13.16898, lng: 77.53515 },
    dimensions: { width: 54, depth: 26, height: 24, floors: 4 },
    rotation: 0.0,
    color: '#F1F5F9',
    accentColor: '#EC4899',
    roofType: 'solar_terrace',
    departments: ['School of Design (SOD)', 'Architecture & Interior Design Studios', 'Visual Arts Gallery', 'Foundational Sciences']
  },

  // ==========================================
  // MIDDLE-SOUTH ACADEMIC SPINE
  // Ample separation from the West Column and between each block
  // ==========================================
  loc_admission_register: {
    id: 'loc_admission_register',
    name: 'Admission Block & Register Office',
    label: 'ADMISSIONS & REGISTRAR',
    shortCode: 'PU-ADM-OFFICE',
    category: 'Administrative',
    imageX: 0.3310,
    imageY: 0.6791,
    centerGps: { lat: 13.16922, lng: 77.53482 },
    dimensions: { width: 34, depth: 16, height: 14, floors: 2 },
    rotation: 0.0,
    color: '#FFFBEB',
    accentColor: '#F59E0B',
    roofType: 'canopy_entrance',
    departments: ['Central Admissions Office', 'Registrar Secretariat', 'Student Documentation Desk', 'Counselling Chambers']
  },
  loc_h_block: {
    id: 'loc_h_block',
    name: 'H Block',
    label: 'H BLOCK',
    shortCode: 'PU-H-BLOCK',
    category: 'Academic',
    imageX: 0.3310,
    imageY: 0.7081,
    centerGps: { lat: 13.16898, lng: 77.53482 },
    dimensions: { width: 42, depth: 22, height: 24, floors: 4 },
    rotation: 0.0,
    color: '#FFFFFF',
    accentColor: '#00A878',
    roofType: 'flat_modern',
    departments: ['Department of Humanities', 'Applied Mathematics', 'Physics & Chemistry Research Labs', 'Smart Lecture Halls']
  },
  loc_j_block: {
    id: 'loc_j_block',
    name: 'J Block',
    label: 'J BLOCK',
    shortCode: 'PU-J-BLOCK',
    category: 'Academic',
    imageX: 0.3122,
    imageY: 0.7382,
    centerGps: { lat: 13.16875, lng: 77.53468 },
    dimensions: { width: 22, depth: 18, height: 18, floors: 3 },
    rotation: 0.0,
    color: '#F8FAFC',
    accentColor: '#0EA5E9',
    roofType: 'flat_modern',
    departments: ['Advanced Software Engineering Labs', 'Network Simulator Center', 'Tutorial Rooms']
  },
  loc_k_block: {
    id: 'loc_k_block',
    name: 'K Block',
    label: 'K BLOCK',
    shortCode: 'PU-K-BLOCK',
    category: 'Academic',
    imageX: 0.3431,
    imageY: 0.7575,
    centerGps: { lat: 13.16868, lng: 77.53492 },
    dimensions: { width: 22, depth: 16, height: 18, floors: 3 },
    rotation: 0.0,
    color: '#F8FAFC',
    accentColor: '#38BDF8',
    roofType: 'flat_modern',
    departments: ['Information Science & Technology Labs', 'Software Testing Suites']
  },
  loc_n_block: {
    id: 'loc_n_block',
    name: 'N Block',
    label: 'N BLOCK',
    shortCode: 'PU-N-BLOCK',
    category: 'Academic',
    imageX: 0.3173,
    imageY: 0.7949,
    centerGps: { lat: 13.16828, lng: 77.53480 },
    dimensions: { width: 46, depth: 22, height: 24, floors: 4 },
    rotation: 0.0,
    color: '#FFFFFF',
    accentColor: '#8B5CF6',
    roofType: 'flat_modern',
    departments: ['Postgraduate Research Wing', 'Data Science & Big Data Clusters', 'Faculty Chambers']
  },
  loc_p_block: {
    id: 'loc_p_block',
    name: 'P Block',
    label: 'P BLOCK',
    shortCode: 'PU-P-BLOCK',
    category: 'Academic',
    imageX: 0.3431,
    imageY: 0.8372,
    centerGps: { lat: 13.16798, lng: 77.53492 },
    dimensions: { width: 24, depth: 16, height: 14, floors: 2 },
    rotation: 0.0,
    color: '#F1F5F9',
    accentColor: '#10B981',
    roofType: 'flat_modern',
    departments: ['Academic Research Facilities', 'Interdisciplinary Studies']
  },
  loc_q_block: {
    id: 'loc_q_block',
    name: 'Q Block',
    label: 'Q BLOCK',
    shortCode: 'PU-Q-BLOCK',
    category: 'Academic',
    imageX: 0.3036,
    imageY: 0.8733,
    centerGps: { lat: 13.16768, lng: 77.53468 },
    dimensions: { width: 26, depth: 16, height: 14, floors: 2 },
    rotation: 0.0,
    color: '#F8FAFC',
    accentColor: '#0EA5E9',
    roofType: 'flat_modern',
    departments: ['Undergraduate Classrooms', 'Departmental Staff Rooms']
  },
  loc_r_block: {
    id: 'loc_r_block',
    name: 'R Block',
    label: 'R BLOCK',
    shortCode: 'PU-R-BLOCK',
    category: 'Academic',
    imageX: 0.3310,
    imageY: 0.9011,
    centerGps: { lat: 13.16745, lng: 77.53488 },
    dimensions: { width: 24, depth: 16, height: 14, floors: 2 },
    rotation: 0.0,
    color: '#FFFFFF',
    accentColor: '#14B8A6',
    roofType: 'flat_modern',
    departments: ['Faculty Chambers', 'Conference Suites', 'Student Innovation Labs']
  },
  loc_s_block: {
    id: 'loc_s_block',
    name: 'S Block',
    label: 'S BLOCK',
    shortCode: 'PU-S-BLOCK',
    category: 'Academic',
    imageX: 0.2470,
    imageY: 0.8938,
    centerGps: { lat: 13.16765, lng: 77.53438 },
    dimensions: { width: 20, depth: 26, height: 14, floors: 2 },
    rotation: 0.0,
    color: '#FFFBEB',
    accentColor: '#F97316',
    roofType: 'cafe_pavilion',
    departments: ['South Academic Pavilion', 'South Campus Food Point / Dining', 'Seminar Rooms']
  },
  loc_u_block: {
    id: 'loc_u_block',
    name: 'U Block',
    label: 'U BLOCK',
    shortCode: 'PU-U-BLOCK',
    category: 'Academic',
    imageX: 0.2950,
    imageY: 0.9276,
    centerGps: { lat: 13.16718, lng: 77.53478 },
    dimensions: { width: 38, depth: 16, height: 14, floors: 2 },
    rotation: 0.0,
    color: '#F1F5F9',
    accentColor: '#64748B',
    roofType: 'flat_modern',
    departments: ['South Campus Tutorial Pods', 'Student Project Displays', 'Examination Storage']
  },

  // ==========================================
  // CENTRAL-EAST ACADEMIC & ADMINISTRATIVE CLUSTER
  // Wide open pedestrian avenues and gardens
  // ==========================================
  loc_hr_block: {
    id: 'loc_hr_block',
    name: 'HR Block',
    label: 'HR BLOCK',
    shortCode: 'PU-HR-BLOCK',
    category: 'Administrative',
    imageX: 0.4374,
    imageY: 0.6755,
    centerGps: { lat: 13.16900, lng: 77.53545 },
    dimensions: { width: 42, depth: 24, height: 22, floors: 3 },
    rotation: 0.0,
    color: '#FFFBEB',
    accentColor: '#00A878',
    roofType: 'flat_modern',
    departments: ['Human Resources Directorate', 'Faculty Recruitment Division', 'Corporate Relations & Placement']
  },
  loc_coe: {
    id: 'loc_coe',
    name: 'COE (Controller of Examinations)',
    label: 'COE',
    shortCode: 'PU-COE',
    category: 'Administrative',
    imageX: 0.4786,
    imageY: 0.7093,
    centerGps: { lat: 13.16872, lng: 77.53565 },
    dimensions: { width: 26, depth: 22, height: 18, floors: 2 },
    rotation: 0.0,
    color: '#FFFFFF',
    accentColor: '#EF4444',
    roofType: 'flat_modern',
    departments: ['Controller of Examinations', 'Confidential Evaluation Cell', 'Transcript & Degree Services']
  },
  loc_fee_counter: {
    id: 'loc_fee_counter',
    name: 'Fee Counter & Accounts',
    label: 'FEE COUNTER',
    shortCode: 'PU-FEE-CNTR',
    category: 'Administrative',
    imageX: 0.5232,
    imageY: 0.6659,
    centerGps: { lat: 13.16910, lng: 77.53582 },
    dimensions: { width: 28, depth: 20, height: 18, floors: 2 },
    rotation: 0.0,
    color: '#FFFBEB',
    accentColor: '#F59E0B',
    roofType: 'flat_modern',
    departments: ['Student Accounts Desk', 'Tuition & Fee Collection', 'Scholarship & Financial Aid Helpdesk']
  },
  loc_library: {
    id: 'loc_library',
    name: 'Central University Library',
    label: 'CENTRAL LIBRARY',
    shortCode: 'PU-LIB-MAIN',
    category: 'Library',
    imageX: 0.5626,
    imageY: 0.6755,
    centerGps: { lat: 13.16902, lng: 77.53605 },
    dimensions: { width: 44, depth: 30, height: 28, floors: 4 },
    rotation: 0.0,
    color: '#FFFFFF',
    accentColor: '#38BDF8',
    roofType: 'skylight_atrium',
    departments: ['Digital Reference Library', 'Quiet Study Reading Hall', 'Research Journals & Periodicals', 'E-Learning Computer Center']
  },
  loc_dsa: {
    id: 'loc_dsa',
    name: 'DSA (Directorate of Student Affairs)',
    label: 'DSA',
    shortCode: 'PU-DSA',
    category: 'Administrative',
    imageX: 0.5249,
    imageY: 0.7238,
    centerGps: { lat: 13.16858, lng: 77.53582 },
    dimensions: { width: 20, depth: 16, height: 14, floors: 2 },
    rotation: 0.0,
    color: '#F8FAFC',
    accentColor: '#8B5CF6',
    roofType: 'flat_modern',
    departments: ['Directorate of Student Affairs', 'Student Council Secretariat', 'Cultural & Sports Clubs Headquarters']
  },
  loc_medical_room: {
    id: 'loc_medical_room',
    name: 'Medical Room & Health Centre',
    label: 'MEDICAL ROOM',
    shortCode: 'PU-HEALTH',
    category: 'Medical',
    imageX: 0.5883,
    imageY: 0.6695,
    centerGps: { lat: 13.16908, lng: 77.53622 },
    dimensions: { width: 18, depth: 16, height: 12, floors: 1 },
    rotation: 0.0,
    color: '#FFFFFF',
    accentColor: '#EF4444',
    roofType: 'red_cross_roof',
    departments: ['24/7 Campus Health Clinic', 'Emergency Medical Observation', 'First Aid Center', 'Ambulance Station']
  },
  loc_mba_som_block: {
    id: 'loc_mba_som_block',
    name: 'School of Management (MBA/SOM)',
    label: 'MBA / SOM BLOCK',
    shortCode: 'PU-SOM-BLOCK',
    category: 'Academic',
    imageX: 0.6329,
    imageY: 0.7189,
    centerGps: { lat: 13.16862, lng: 77.53642 },
    dimensions: { width: 56, depth: 26, height: 24, floors: 4 },
    rotation: 0.0,
    color: '#FFFFFF',
    accentColor: '#0284C7',
    roofType: 'solar_terrace',
    departments: ['School of Management (SOM)', 'MBA Executive Classrooms', 'Bloomberg Financial Trading Lab', 'Corporate Case Study Amphitheater']
  },

  // ==========================================
  // EAST SECTOR (AUDITORIUM, HOSTEL MESS, OAT)
  // Grand cultural facilities
  // ==========================================
  loc_auditorium: {
    id: 'loc_auditorium',
    name: 'Presidency Grand Auditorium',
    label: 'AUDITORIUM',
    shortCode: 'PU-AUDI-MAIN',
    category: 'Academic',
    imageX: 0.7221,
    imageY: 0.6815,
    centerGps: { lat: 13.16868, lng: 77.53712 },
    dimensions: { width: 58, depth: 36, height: 26, floors: 3 },
    rotation: 0.0,
    color: '#FFFBEB',
    accentColor: '#F59E0B',
    roofType: 'auditorium_flytower',
    departments: ['Main Auditorium (1,200 Seats)', 'Presidential Banquet Hall', 'Green Rooms & Backstage', 'Audi Food Court']
  },
  loc_hostel_mess: {
    id: 'loc_hostel_mess',
    name: 'Hostel Dining Mess',
    label: 'HOSTEL MESS',
    shortCode: 'PU-MESS-HOSTEL',
    category: 'Cafe',
    imageX: 0.6947,
    imageY: 0.5428,
    centerGps: { lat: 13.16948, lng: 77.53692 },
    dimensions: { width: 28, depth: 22, height: 14, floors: 2 },
    rotation: 0.0,
    color: '#FFFBEB',
    accentColor: '#EA580C',
    roofType: 'cafe_pavilion',
    departments: ['Student Residential Dining Hall', 'Central Steam Kitchen', 'Dietary Services']
  },

  // ==========================================
  // GATES & ARRIVAL PORTALS (NORTH)
  // Monumental and prominent
  // ==========================================
  loc_main_gate: {
    id: 'loc_main_gate',
    name: 'Presidency University – Main Gate',
    label: 'MAIN GATE',
    shortCode: 'PU-GATE-MAIN',
    category: 'Gate',
    imageX: 0.5695,
    imageY: 0.2449,
    centerGps: { lat: 13.1717995, lng: 77.5361915 },
    dimensions: { width: 42, depth: 12, height: 12, floors: 1 },
    rotation: 0.0,
    color: '#0F172A',
    accentColor: '#00A878',
    roofType: 'arch_portal',
    departments: ['Main Security Gatehouse', 'Visitor Passes & Checkpoint']
  },
  loc_gate_2: {
    id: 'loc_gate_2',
    name: 'Gate 2 (East Sector)',
    label: 'GATE 2',
    shortCode: 'PU-GATE-02',
    category: 'Gate',
    imageX: 0.7290,
    imageY: 0.1930,
    centerGps: { lat: 13.17228, lng: 77.53738 },
    dimensions: { width: 32, depth: 10, height: 10, floors: 1 },
    rotation: 0.0,
    color: '#0F172A',
    accentColor: '#38BDF8',
    roofType: 'arch_portal',
    departments: ['Gate 2 Security Control', 'Bus & Service Transport Access']
  }
};

/**
 * Key Non-Building Landmark Features
 */
export const CAMPUS_LANDMARK_SPECS = {
  fountain: {
    id: 'landmark_fountain',
    name: 'Campus Central Fountain',
    label: 'CENTRAL FOUNTAIN',
    category: 'Landmark',
    imageX: 0.4666,
    imageY: 0.5995,
    radius: 15,
    description: 'Magnificent circular decorative fountain roundabout connecting main avenues and academic wings.'
  },
  mainLawn: {
    id: 'landmark_main_lawn',
    name: 'Main Lawn',
    label: 'MAIN LAWN',
    category: 'Garden',
    imageX: 0.5918,
    imageY: 0.4403,
    description: 'Grand manicured central campus green corridor extending from Main Gate to Central Fountain.'
  },
  busBoarding: {
    id: 'landmark_bus_boarding',
    name: 'Bus Boarding Strip',
    label: 'BUS BOARDING',
    category: 'Transport',
    imageX: 0.4940,
    imageY: 0.5127,
    description: 'Dedicated transit staging and passenger boarding avenue for university buses.'
  },
  footballCourt: {
    id: 'landmark_football_court',
    name: 'Football Court',
    label: 'FOOTBALL COURT',
    category: 'Sports',
    imageX: 0.4117,
    imageY: 0.3679,
    width: 48,
    depth: 72,
    description: 'Full-size regulation outdoor green turf football pitch.'
  },
  volleyballNets: {
    id: 'landmark_volleyball_nets',
    name: 'Volleyball Courts',
    label: 'VOLLEYBALL NETS',
    category: 'Sports',
    imageX: 0.3087,
    imageY: 0.4765,
    width: 24,
    depth: 32,
    description: 'Outdoor tournament volleyball courts with sand turf and nets.'
  },
  basketballCourt: {
    id: 'landmark_basketball_court',
    name: 'Basketball Court',
    label: 'BASKETBALL COURT',
    category: 'Sports',
    imageX: 0.1973,
    imageY: 0.5428,
    width: 26,
    depth: 40,
    description: 'FIBA regulation hardcourt with royal blue surface, terracotta key areas, and floodlights.'
  },
  cricketNets: {
    id: 'landmark_cricket_nets',
    name: 'Cricket Practice Nets',
    label: 'CRICKET NETS',
    category: 'Sports',
    imageX: 0.3173,
    imageY: 0.5428,
    width: 20,
    depth: 36,
    description: 'Enclosed outdoor cricket practice batting pitches and bowling nets.'
  },
  oat: {
    id: 'landmark_oat',
    name: 'Open Air Theatre (O.A.T)',
    label: 'O.A.T',
    category: 'Facility',
    imageX: 0.7461,
    imageY: 0.6273,
    radius: 18,
    description: 'Tiered semi-circular open-air amphitheatre for university cultural events and fests.'
  }
};
