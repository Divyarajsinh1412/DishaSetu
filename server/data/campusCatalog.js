/**
 * DISHASETU: Complete Presidency University Campus Location Catalog
 * Phase 3A: Outdoor Campus Navigation
 * 
 * Sourced from Presidency University Bengaluru official campus layout (preMap1.pdf p.5)
 * and 360 Virtual Tour reference catalog.
 */

export const COMPLETE_CAMPUS_CATALOG = [
  // ==========================================
  // 1. CAMPUS GATES & MAIN ENTRANCES
  // ==========================================
  {
    locationId: 'loc_main_gate',
    name: 'Presidency University – Main Gate',
    shortCode: 'PU-GATE-01',
    category: 'Gate',
    description: 'Main university entrance gate and official visitor/student arrival portal on Itgalpur Road.',
    coordinates: { lat: 13.1717995, lng: 77.5361915 },
    entranceCoordinates: { lat: 13.1717995, lng: 77.5361915 },
    entrances: [
      {
        entranceId: 'ent_main_gate_west',
        name: 'Main Gate West Span',
        coordinates: { lat: 13.171733, lng: 77.535971 },
        isAccessible: true,
        isPrimary: true
      },
      {
        entranceId: 'ent_main_gate_east',
        name: 'Main Gate East Span',
        coordinates: { lat: 13.171866, lng: 77.536412 },
        isAccessible: true,
        isPrimary: false
      }
    ],
    coordinateSource: 'Ground Survey',
    gpsAccuracy: 1.5,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_gate_2',
    name: 'Gate 2 (Secondary Campus Entrance)',
    shortCode: 'PU-GATE-02',
    category: 'Gate',
    description: 'Secondary vehicular and service entrance gate providing direct access to south parking and bus boarding bays.',
    coordinates: { lat: 13.169120, lng: 77.536850 },
    entranceCoordinates: { lat: 13.169120, lng: 77.536850 },
    entrances: [
      {
        entranceId: 'ent_gate_2_main',
        name: 'Gate 2 Vehicle & Pedestrian Portal',
        coordinates: { lat: 13.169120, lng: 77.536850 },
        isAccessible: true,
        isPrimary: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },

  // ==========================================
  // 2. ACADEMIC BUILDINGS & BLOCKS
  // ==========================================
  {
    locationId: 'loc_d_block',
    name: 'D Block',
    shortCode: 'PU-D-BLOCK',
    category: 'Academic',
    description: 'Engineering instructional complex, CAD/CAM mechanical studios, civil hydraulics labs, and smart lecture theaters.',
    coordinates: { lat: 13.16915723332783, lng: 77.53391962930635 },
    entranceCoordinates: { lat: 13.16915723332783, lng: 77.53391962930635 },
    entrances: [
      {
        entranceId: 'ent_d_block_main',
        name: 'D Block Main Entrance (Surveyed)',
        coordinates: { lat: 13.16915723332783, lng: 77.53391962930635 },
        isAccessible: true,
        isPrimary: true,
        hasRamp: true
      }
    ],
    coordinateSource: 'Google Earth KML Survey',
    gpsAccuracy: 2.5,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_e_block',
    name: 'E Block',
    shortCode: 'PU-E-BLOCK',
    category: 'Academic',
    description: 'Computer Science & Engineering department suites, algorithm testing labs, and faculty seminar rooms.',
    coordinates: { lat: 13.170821, lng: 77.535962 },
    entranceCoordinates: { lat: 13.170840, lng: 77.535920 },
    entrances: [
      {
        entranceId: 'ent_e_block_main',
        name: 'E Block Avenue Entrance',
        coordinates: { lat: 13.170840, lng: 77.535920 },
        isAccessible: true,
        isPrimary: true,
        hasRamp: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_f_block',
    name: 'F Block',
    shortCode: 'PU-F-BLOCK',
    category: 'Academic',
    description: 'Electrical & Electronics Engineering laboratories, embedded systems labs, and power engineering workbenches.',
    coordinates: { lat: 13.171021, lng: 77.536069 },
    entranceCoordinates: { lat: 13.171030, lng: 77.536020 },
    entrances: [
      {
        entranceId: 'ent_f_block_main',
        name: 'F Block Main Entrance',
        coordinates: { lat: 13.171030, lng: 77.536020 },
        isAccessible: true,
        isPrimary: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.5,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_h_block',
    name: 'H Block (Admissions Office & Registrar)',
    shortCode: 'PU-H-BLOCK',
    category: 'Administrative',
    description: 'Central administrative and admissions headquarters, student affairs counseling, and fee payment desks.',
    coordinates: { lat: 13.171340, lng: 77.536251 },
    entranceCoordinates: { lat: 13.171320, lng: 77.536210 },
    entrances: [
      {
        entranceId: 'ent_h_block_main',
        name: 'H Block Main Entrance & Admissions Lobby',
        coordinates: { lat: 13.171320, lng: 77.536210 },
        isAccessible: true,
        isPrimary: true,
        hasRamp: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 1.8,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_j_block',
    name: 'J Block',
    shortCode: 'PU-J-BLOCK',
    category: 'Academic',
    description: 'School of Management lecture rooms, commerce tutorial halls, and case study pods.',
    coordinates: { lat: 13.170160, lng: 77.535578 },
    entranceCoordinates: { lat: 13.170140, lng: 77.535530 },
    entrances: [
      {
        entranceId: 'ent_j_block_main',
        name: 'J Block South Avenue Entrance',
        coordinates: { lat: 13.170140, lng: 77.535530 },
        isAccessible: true,
        isPrimary: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_k_block',
    name: 'K Block',
    shortCode: 'PU-K-BLOCK',
    category: 'Academic',
    description: 'Artificial Intelligence & Machine Learning laboratories, GPU clusters, and data science research studios.',
    coordinates: { lat: 13.169925, lng: 77.535476 },
    entranceCoordinates: { lat: 13.169910, lng: 77.535430 },
    entrances: [
      {
        entranceId: 'ent_k_block_main',
        name: 'K Block Main Entrance',
        coordinates: { lat: 13.169910, lng: 77.535430 },
        isAccessible: true,
        isPrimary: true,
        hasRamp: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_l_block',
    name: 'L Block',
    shortCode: 'PU-L-BLOCK',
    category: 'Academic',
    description: 'School of Law, Moot Court hall, School of Design studios, and multidisciplinary seminar suites.',
    coordinates: { lat: 13.169716, lng: 77.535346 },
    entranceCoordinates: { lat: 13.169690, lng: 77.535310 },
    entrances: [
      {
        entranceId: 'ent_l_block_main',
        name: 'L Block Main Entrance',
        coordinates: { lat: 13.169690, lng: 77.535310 },
        isAccessible: true,
        isPrimary: true,
        hasRamp: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.2,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_n_block',
    name: 'N Block',
    shortCode: 'PU-N-BLOCK',
    category: 'Academic',
    description: 'Basic Sciences, Physics and Chemistry laboratories, and undergraduate foundation classrooms.',
    coordinates: { lat: 13.169461, lng: 77.535267 },
    entranceCoordinates: { lat: 13.169440, lng: 77.535240 },
    entrances: [
      {
        entranceId: 'ent_n_block_main',
        name: 'N Block Garden Entrance',
        coordinates: { lat: 13.169440, lng: 77.535240 },
        isAccessible: true,
        isPrimary: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_p_block',
    name: 'P Block',
    shortCode: 'PU-P-BLOCK',
    category: 'Academic',
    description: 'Postgraduate lecture halls and research scholar computing workstations.',
    coordinates: { lat: 13.169310, lng: 77.535329 },
    entranceCoordinates: null,
    entrances: [],
    coordinateSource: 'Not Surveyed',
    verificationStatus: 'Not Surveyed',
    approvalStatus: 'Pending',
    active: true
  },
  {
    locationId: 'loc_q_block',
    name: 'Q Block',
    shortCode: 'PU-Q-BLOCK',
    category: 'Academic',
    description: 'Multidisciplinary tutorial and seminar block in south wing.',
    coordinates: { lat: 13.169128, lng: 77.535329 },
    entranceCoordinates: null,
    entrances: [],
    coordinateSource: 'Not Surveyed',
    verificationStatus: 'Not Surveyed',
    approvalStatus: 'Pending',
    active: true
  },
  {
    locationId: 'loc_r_block',
    name: 'R Block',
    shortCode: 'PU-R-BLOCK',
    category: 'Academic',
    description: 'Academic block featuring engineering workshops and material testing equipment.',
    coordinates: null,
    entranceCoordinates: null,
    entrances: [],
    coordinateSource: 'Not Surveyed',
    verificationStatus: 'Not Surveyed',
    approvalStatus: 'Pending',
    active: true
  },
  {
    locationId: 'loc_s_block',
    name: 'S Block',
    shortCode: 'PU-S-BLOCK',
    category: 'Academic',
    description: 'Specialized science laboratories and tutorial spaces.',
    coordinates: null,
    entranceCoordinates: null,
    entrances: [],
    coordinateSource: 'Not Surveyed',
    verificationStatus: 'Not Surveyed',
    approvalStatus: 'Pending',
    active: true
  },
  {
    locationId: 'loc_u_block',
    name: 'U Block',
    shortCode: 'PU-U-BLOCK',
    category: 'Academic',
    description: 'University instructional block and multimedia seminar rooms.',
    coordinates: null,
    entranceCoordinates: null,
    entrances: [],
    coordinateSource: 'Not Surveyed',
    verificationStatus: 'Not Surveyed',
    approvalStatus: 'Pending',
    active: true
  },
  {
    locationId: 'loc_hr_block',
    name: 'HR Block',
    shortCode: 'PU-HR-BLOCK',
    category: 'Administrative',
    description: 'Human Resources, faculty recruitment, and institutional governance offices.',
    coordinates: null,
    entranceCoordinates: null,
    entrances: [],
    coordinateSource: 'Not Surveyed',
    verificationStatus: 'Not Surveyed',
    approvalStatus: 'Pending',
    active: true
  },
  {
    locationId: 'loc_coe',
    name: 'COE (Controller of Examinations)',
    shortCode: 'PU-COE',
    category: 'Administrative',
    description: 'Central examination cell, confidential evaluation office, and transcript services.',
    coordinates: null,
    entranceCoordinates: null,
    entrances: [],
    coordinateSource: 'Not Surveyed',
    verificationStatus: 'Not Surveyed',
    approvalStatus: 'Pending',
    active: true
  },
  {
    locationId: 'loc_som_block',
    name: 'MBA / SOM Block',
    shortCode: 'PU-SOM-BLOCK',
    category: 'Academic',
    description: 'School of Management executive education suites and seminar halls.',
    coordinates: null,
    entranceCoordinates: null,
    entrances: [],
    coordinateSource: 'Not Surveyed',
    verificationStatus: 'Not Surveyed',
    approvalStatus: 'Pending',
    active: true
  },
  {
    locationId: 'loc_auditorium',
    name: 'Presidency University Central Auditorium',
    shortCode: 'PU-AUD-01',
    category: 'Facility',
    description: 'Grand indoor acoustic auditorium hosting convocation ceremonies, national conferences, and cultural symposiums.',
    coordinates: { lat: 13.170909, lng: 77.535777 },
    entranceCoordinates: { lat: 13.170920, lng: 77.535740 },
    entrances: [
      {
        entranceId: 'ent_aud_main',
        name: 'Auditorium Grand Foyer Entrance',
        coordinates: { lat: 13.170920, lng: 77.535740 },
        isAccessible: true,
        isPrimary: true,
        hasRamp: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },

  // ==========================================
  // 3. UNIVERSITY CENTRAL FACILITIES
  // ==========================================
  {
    locationId: 'loc_reception',
    name: 'Main Reception & Helpdesk',
    shortCode: 'PU-REC-01',
    category: 'Facility',
    description: 'Primary campus visitor registration, campus map guides, and general inquiry desk located near entrance canopy.',
    coordinates: { lat: 13.171686, lng: 77.536192 },
    entranceCoordinates: { lat: 13.171686, lng: 77.536192 },
    entrances: [
      {
        entranceId: 'ent_rec_main',
        name: 'Reception Front Counter',
        coordinates: { lat: 13.171686, lng: 77.536192 },
        isAccessible: true,
        isPrimary: true
      }
    ],
    coordinateSource: 'Ground Survey',
    gpsAccuracy: 1.5,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_library',
    name: 'Central University Library',
    shortCode: 'PU-LIB-01',
    category: 'Library',
    description: 'Comprehensive digital library, book lending stacks, quiet study cubicles, IEEE/ACM journals, and research reading halls.',
    coordinates: { lat: 13.170408, lng: 77.535742 },
    entranceCoordinates: { lat: 13.170420, lng: 77.535710 },
    entrances: [
      {
        entranceId: 'ent_lib_main',
        name: 'Central Library Main Glass Entrance',
        coordinates: { lat: 13.170420, lng: 77.535710 },
        isAccessible: true,
        isPrimary: true,
        hasRamp: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 1.8,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_food_court',
    name: 'Campus Food Court & Dining Pavilion',
    shortCode: 'PU-FC-01',
    category: 'Cafe',
    description: 'Multi-vendor food court serving hot meals, south & north Indian snacks, beverages, and bakery delights.',
    coordinates: { lat: 13.170114, lng: 77.535310 },
    entranceCoordinates: { lat: 13.170120, lng: 77.535280 },
    entrances: [
      {
        entranceId: 'ent_food_court_main',
        name: 'Food Court Plaza Entrance',
        coordinates: { lat: 13.170120, lng: 77.535280 },
        isAccessible: true,
        isPrimary: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_cafeteria',
    name: 'Central Student Cafeteria',
    shortCode: 'PU-CAFE-01',
    category: 'Cafe',
    description: 'Spacious student cafeteria with indoor and garden terrace seating, coffee kiosks, and daily meal service.',
    coordinates: { lat: 13.169807, lng: 77.535131 },
    entranceCoordinates: { lat: 13.169810, lng: 77.535100 },
    entrances: [
      {
        entranceId: 'ent_cafe_main',
        name: 'Cafeteria Garden Terrace Entrance',
        coordinates: { lat: 13.169810, lng: 77.535100 },
        isAccessible: true,
        isPrimary: true,
        hasRamp: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_hostel_mess',
    name: 'Hostel Dining Mess',
    shortCode: 'PU-MESS-01',
    category: 'Cafe',
    description: 'Resident student dining mess serving breakfast, lunch, and dinner to on-campus hostel boarders.',
    coordinates: null,
    entranceCoordinates: null,
    entrances: [],
    coordinateSource: 'Not Surveyed',
    verificationStatus: 'Not Surveyed',
    approvalStatus: 'Pending',
    active: true
  },
  {
    locationId: 'loc_gym',
    name: 'University Gymnasium & Fitness Center',
    shortCode: 'PU-GYM-01',
    category: 'Sports',
    description: 'Modern fitness suite equipped with strength training equipment, treadmills, cardio machines, and sports trainers.',
    coordinates: { lat: 13.169054, lng: 77.535275 },
    entranceCoordinates: { lat: 13.169060, lng: 77.535260 },
    entrances: [
      {
        entranceId: 'ent_gym_main',
        name: 'Gymnasium Entrance',
        coordinates: { lat: 13.169060, lng: 77.535260 },
        isAccessible: true,
        isPrimary: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.5,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_medical',
    name: 'Campus Health & Medical Centre',
    shortCode: 'PU-MED-01',
    category: 'Medical',
    description: '24x7 emergency medical post, primary nursing consultation, first-aid ward, and ambulance dispatch bay.',
    coordinates: { lat: 13.171178, lng: 77.536174 },
    entranceCoordinates: { lat: 13.171190, lng: 77.536140 },
    entrances: [
      {
        entranceId: 'ent_med_main',
        name: 'Medical Centre Emergency Entry',
        coordinates: { lat: 13.171190, lng: 77.536140 },
        isAccessible: true,
        isPrimary: true,
        hasRamp: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 1.8,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_moot_court',
    name: 'Moot Court Hall (School of Law)',
    shortCode: 'PU-LAW-MC',
    category: 'Facility',
    description: 'Simulated legal courtroom for law students, trial advocacy competitions, and constitutional mooting.',
    coordinates: { lat: 13.169690, lng: 77.535310 },
    entranceCoordinates: { lat: 13.169690, lng: 77.535310 },
    entrances: [],
    coordinateSource: 'Draft',
    verificationStatus: 'Draft',
    approvalStatus: 'Pending',
    active: true
  },
  {
    locationId: 'loc_board_room',
    name: 'Executive Board Room',
    shortCode: 'PU-BR-01',
    category: 'Facility',
    description: 'High-level academic council and chancellor conference boardroom.',
    coordinates: null,
    entranceCoordinates: null,
    entrances: [],
    coordinateSource: 'Not Surveyed',
    verificationStatus: 'Not Surveyed',
    approvalStatus: 'Pending',
    active: true
  },
  {
    locationId: 'loc_atm',
    name: 'Campus ATM & Banking Kiosk',
    shortCode: 'PU-ATM-01',
    category: 'Facility',
    description: '24x7 automated teller machine providing instant cash withdrawal and digital banking services.',
    coordinates: { lat: 13.171650, lng: 77.535972 },
    entranceCoordinates: { lat: 13.171650, lng: 77.535972 },
    entrances: [
      {
        entranceId: 'ent_atm_kiosk',
        name: 'ATM Entrance Kiosk',
        coordinates: { lat: 13.171650, lng: 77.535972 },
        isAccessible: true,
        isPrimary: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 1.5,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },

  // ==========================================
  // 4. OUTDOOR & SPORTS FACILITIES
  // ==========================================
  {
    locationId: 'loc_fountain',
    name: 'Campus Central Fountain',
    shortCode: 'PU-FOUNTAIN-01',
    category: 'Landmark',
    description: 'Central decorative water fountain landmark located at the avenue south termination.',
    coordinates: { lat: 13.169277162668132, lng: 77.53496327115832 },
    entranceCoordinates: { lat: 13.169277162668132, lng: 77.53496327115832 },
    entrances: [
      {
        entranceId: 'ent_fountain_plaza',
        name: 'Fountain Plaza Access',
        coordinates: { lat: 13.169277162668132, lng: 77.53496327115832 },
        isAccessible: true,
        isPrimary: true
      }
    ],
    coordinateSource: 'Ground Survey',
    gpsAccuracy: 1.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_main_lawn',
    name: 'Main Academic Lawn',
    shortCode: 'PU-LAWN-MAIN',
    category: 'Outdoor',
    description: 'Manicured green lawn amphitheatre facing academic blocks, used for open-air study and student recreation.',
    coordinates: { lat: 13.170493, lng: 77.535787 },
    entranceCoordinates: { lat: 13.170493, lng: 77.535787 },
    entrances: [],
    coordinateSource: 'Ground Survey',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_dsa_lawn',
    name: 'DSA Lawn (Student Affairs)',
    shortCode: 'PU-LAWN-DSA',
    category: 'Outdoor',
    description: 'Open green lawns fronting Directorate of Student Affairs for university club activities.',
    coordinates: { lat: 13.171381, lng: 77.536701 },
    entranceCoordinates: { lat: 13.171381, lng: 77.536701 },
    entrances: [],
    coordinateSource: 'Ground Survey',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_oat',
    name: 'O.A.T (Open Air Theatre)',
    shortCode: 'PU-OAT-01',
    category: 'Outdoor',
    description: 'Stepped open-air amphitheatre with central acoustic stage for cultural drama, music festivals, and student debate.',
    coordinates: { lat: 13.169561, lng: 77.535797 },
    entranceCoordinates: { lat: 13.169561, lng: 77.535797 },
    entrances: [
      {
        entranceId: 'ent_oat_steps',
        name: 'OAT North Steps',
        coordinates: { lat: 13.169561, lng: 77.535797 },
        isAccessible: true,
        isPrimary: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_basketball',
    name: 'Basketball Court',
    shortCode: 'PU-SPORT-BB',
    category: 'Sports',
    description: 'Standard synthetic surface floodlit basketball court with tournament hoops.',
    coordinates: { lat: 13.169045, lng: 77.535592 },
    entranceCoordinates: { lat: 13.169073, lng: 77.535471 },
    entrances: [
      {
        entranceId: 'ent_bb_gate',
        name: 'Basketball Court Gate',
        coordinates: { lat: 13.169073, lng: 77.535471 },
        isAccessible: true,
        isPrimary: true
      }
    ],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_volleyball',
    name: 'Volleyball Court',
    shortCode: 'PU-SPORT-VB',
    category: 'Sports',
    description: 'Outdoor sand/clay court for intramural volleyball tournaments.',
    coordinates: { lat: 13.169281, lng: 77.535718 },
    entranceCoordinates: { lat: 13.169281, lng: 77.535718 },
    entrances: [],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.5,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_cricket_nets',
    name: 'Cricket Practice Nets',
    shortCode: 'PU-SPORT-CRIC',
    category: 'Sports',
    description: 'Enclosed batting and bowling practice nets with synthetic astroturf turf pitches.',
    coordinates: { lat: 13.169497, lng: 77.535793 },
    entranceCoordinates: { lat: 13.169497, lng: 77.535793 },
    entrances: [],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.5,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_football',
    name: 'University Football Turf Ground',
    shortCode: 'PU-SPORT-FB',
    category: 'Sports',
    description: 'Regulation-size natural grass football pitch with perimeter running track.',
    coordinates: null,
    entranceCoordinates: null,
    entrances: [],
    coordinateSource: 'Not Surveyed',
    verificationStatus: 'Not Surveyed',
    approvalStatus: 'Pending',
    active: true
  },

  // ==========================================
  // 5. PARKING & VEHICULAR TRANSIT
  // ==========================================
  {
    locationId: 'loc_parking_2w',
    name: 'Two-Wheeler Student & Staff Parking',
    shortCode: 'PU-PARK-2W',
    category: 'Parking',
    description: 'Designated paved surface parking area for student and staff scooters and motorcycles.',
    coordinates: { lat: 13.171746, lng: 77.535540 },
    entranceCoordinates: { lat: 13.171746, lng: 77.535540 },
    entrances: [
      {
        entranceId: 'ent_park_2w_span',
        name: 'Two-Wheeler Parking Gate',
        coordinates: { lat: 13.171746, lng: 77.535540 },
        isAccessible: true,
        isPrimary: true
      }
    ],
    coordinateSource: 'Ground Survey',
    gpsAccuracy: 1.5,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_parking_main',
    name: 'Main Student Four-Wheeler Parking',
    shortCode: 'PU-PARK-MAIN',
    category: 'Parking',
    description: 'Large surface car parking zone located near campus western boundary.',
    coordinates: { lat: 13.171183, lng: 77.535313 },
    entranceCoordinates: { lat: 13.171183, lng: 77.535313 },
    entrances: [],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.5,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_parking_visitor',
    name: 'Visitor & Guest Parking',
    shortCode: 'PU-PARK-VISITOR',
    category: 'Parking',
    description: 'Dedicated parking slots for official guests, parents, and prospective student families near Main Gate.',
    coordinates: { lat: 13.171650, lng: 77.535972 },
    entranceCoordinates: { lat: 13.171650, lng: 77.535972 },
    entrances: [],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.0,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_parking_faculty',
    name: 'Faculty & Executive Parking',
    shortCode: 'PU-PARK-FACULTY',
    category: 'Parking',
    description: 'Reserved shaded parking bays for university professors, deans, and administrative staff.',
    coordinates: null,
    entranceCoordinates: null,
    entrances: [],
    coordinateSource: 'Not Surveyed',
    verificationStatus: 'Not Surveyed',
    approvalStatus: 'Pending',
    active: true
  },
  {
    locationId: 'loc_bus_boarding',
    name: 'University Bus Boarding Terminal 1',
    shortCode: 'PU-BUS-BAY-01',
    category: 'Parking',
    description: 'Fleet transport boarding bay for scheduled Bangalore city student and staff bus shuttles.',
    coordinates: { lat: 13.169150, lng: 77.536700 },
    entranceCoordinates: { lat: 13.169150, lng: 77.536700 },
    entrances: [],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.5,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  },
  {
    locationId: 'loc_bus_point_2',
    name: 'Bus Point 2 (South Disembarkation)',
    shortCode: 'PU-BUS-BAY-02',
    category: 'Parking',
    description: 'Secondary student shuttle drop-off shelter situated near Gate 2.',
    coordinates: { lat: 13.169200, lng: 77.536800 },
    entranceCoordinates: { lat: 13.169200, lng: 77.536800 },
    entrances: [],
    coordinateSource: 'Google Maps Manual',
    gpsAccuracy: 2.5,
    surveyDate: '2026-11-17',
    surveyedBy: 'Presidency GIS Survey Team',
    verificationStatus: 'Published',
    approvalStatus: 'Approved',
    active: true
  }
];
