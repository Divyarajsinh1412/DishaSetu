import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import CampusMapMarker from '../models/CampusMapMarker.js';

export const OFFICIAL_MAP_MARKERS = [
  // ==========================================
  // GATES, PARKING & ARRIVAL ZONES
  // ==========================================
  {
    markerId: 'marker_main_student_parking',
    name: 'Main Student Parking',
    label: 'MAIN STUDENT PARKING',
    category: 'Parking',
    imageX: 0.4631,
    imageY: 0.1025,
    latitude: 13.17285,
    longitude: 77.53595,
    shortCode: 'PU-PARK-STU-MAIN',
    description: 'Primary designated parking facility for student vehicles.'
  },
  {
    markerId: 'marker_entry_exit',
    name: 'Entry / Exit',
    label: 'ENTRY / EXIT',
    category: 'Gate',
    imageX: 0.5077,
    imageY: 0.2111,
    latitude: 13.17215,
    longitude: 77.53605,
    shortCode: 'PU-GATE-ENTRY',
    description: 'Main campus vehicular and pedestrian entry/exit checkpoint.'
  },
  {
    markerId: 'marker_main_gate',
    name: 'Main Gate',
    label: 'MAIN GATE',
    category: 'Gate',
    imageX: 0.5695,
    imageY: 0.2449,
    latitude: 13.1717995,
    longitude: 77.5361915,
    shortCode: 'PU-GATE-MAIN',
    description: 'Official ceremonial Main Gate and security arrival portal of Presidency University.'
  },
  {
    markerId: 'marker_student_2w_parking',
    name: 'Student 2 Wheeler Parking',
    label: 'STUDENT 2 WHEELER PARKING',
    category: 'Parking',
    imageX: 0.4974,
    imageY: 0.2593,
    latitude: 13.171746,
    longitude: 77.53554,
    shortCode: 'PU-PARK-STU-2W',
    description: 'Spacious dedicated parking zone for student motorcycles and scooters.'
  },
  {
    markerId: 'marker_frisking_main',
    name: 'Frisking Area (Main)',
    label: 'FRISKING AREA',
    category: 'Security',
    imageX: 0.5352,
    imageY: 0.3016,
    latitude: 13.17135,
    longitude: 77.53585,
    shortCode: 'PU-SEC-FRISK-1',
    description: 'Mandatory identity and security screening station near Main Gate.'
  },
  {
    markerId: 'marker_visitor_parking',
    name: 'Visitor Parking',
    label: 'VISTOR PARKING',
    category: 'Parking',
    imageX: 0.6432,
    imageY: 0.2111,
    latitude: 13.17205,
    longitude: 77.53675,
    shortCode: 'PU-PARK-VISITOR',
    description: 'Designated parking zone for campus visitors, parents, and guests.'
  },
  {
    markerId: 'marker_gate_2',
    name: 'Gate 2',
    label: 'GATE 2',
    category: 'Gate',
    imageX: 0.7290,
    imageY: 0.1930,
    latitude: 13.17228,
    longitude: 77.53738,
    shortCode: 'PU-GATE-02',
    description: 'Secondary campus gate for buses, service vehicles, and East sector access.'
  },
  {
    markerId: 'marker_bus_point_2',
    name: 'Bus Point 2',
    label: 'BUS POINT 2',
    category: 'Transport',
    imageX: 0.7684,
    imageY: 0.2352,
    latitude: 13.17185,
    longitude: 77.53762,
    shortCode: 'PU-BUS-PT2',
    description: 'University fleet transport staging and boarding bay at Gate 2.'
  },
  {
    markerId: 'marker_frisking_gate2',
    name: 'Frisking Area (Gate 2)',
    label: 'FRISKING AREA (GATE 2)',
    category: 'Security',
    imageX: 0.7170,
    imageY: 0.2835,
    latitude: 13.17142,
    longitude: 77.53725,
    shortCode: 'PU-SEC-FRISK-2',
    description: 'Gate 2 security and ID screening checkpoint.'
  },
  {
    markerId: 'marker_4w_parking',
    name: '4 Wheeler Parking',
    label: '4 WHEELER PARKING',
    category: 'Parking',
    imageX: 0.8027,
    imageY: 0.3317,
    latitude: 13.17105,
    longitude: 77.53775,
    shortCode: 'PU-PARK-4W',
    description: 'General 4-wheeler parking bays for campus staff, students, and official cars.'
  },
  {
    markerId: 'marker_faculty_2w_parking',
    name: 'Faculty 2 Wheeler Parking',
    label: 'FACULTY 2 WHEELER PARKING',
    category: 'Parking',
    imageX: 0.7118,
    imageY: 0.4101,
    latitude: 13.17052,
    longitude: 77.53718,
    shortCode: 'PU-PARK-FAC-2W',
    description: 'Reserved faculty two-wheeler parking lot.'
  },
  {
    markerId: 'marker_faculty_4w_parking',
    name: 'Faculty 4 Wheeler Parking',
    label: 'FACULTY 4 WHEELER PARKING',
    category: 'Parking',
    imageX: 0.6947,
    imageY: 0.4825,
    latitude: 13.16998,
    longitude: 77.53698,
    shortCode: 'PU-PARK-FAC-4W',
    description: 'Reserved faculty automobile parking bays.'
  },

  // ==========================================
  // CENTRAL CAMPUS, LAWNS & SPORTS
  // ==========================================
  {
    markerId: 'marker_main_lawn',
    name: 'Main Lawn',
    label: 'MAIN LAWN',
    category: 'Garden',
    imageX: 0.5918,
    imageY: 0.4403,
    latitude: 13.17049,
    longitude: 77.53632,
    shortCode: 'PU-LAWN-MAIN',
    description: 'Iconic manicured central green lawn along Presidency main avenue corridor.'
  },
  {
    markerId: 'marker_bus_boarding',
    name: 'Bus Boarding',
    label: 'BUS BOARDING',
    category: 'Transport',
    imageX: 0.4940,
    imageY: 0.5127,
    latitude: 13.17002,
    longitude: 77.53588,
    shortCode: 'PU-BUS-BOARDING',
    description: 'Evening university bus departure and boarding avenue.'
  },
  {
    markerId: 'marker_fountain',
    name: 'Campus Central Fountain',
    label: 'FOUNTAIN',
    category: 'Landmark',
    imageX: 0.4666,
    imageY: 0.5995,
    latitude: 13.169277,
    longitude: 77.534963,
    shortCode: 'PU-FOUNTAIN',
    description: 'Central circular decorative water fountain rotunda and campus orientation junction.'
  },
  {
    markerId: 'marker_football_court',
    name: 'Football Court',
    label: 'FOOT - BALL COURT',
    category: 'Sports',
    imageX: 0.4117,
    imageY: 0.3679,
    latitude: 13.17095,
    longitude: 77.53512,
    shortCode: 'PU-FOOTBALL',
    description: 'Full-sized outdoor green turf football field and athletic pavilion.'
  },
  {
    markerId: 'marker_volleyball_nets',
    name: 'Volley - Ball Nets',
    label: 'VOLLEY - BALL NETS',
    category: 'Sports',
    imageX: 0.3087,
    imageY: 0.4765,
    latitude: 13.17032,
    longitude: 77.53455,
    shortCode: 'PU-VOLLEY',
    description: 'Twin regulation outdoor volleyball tournament courts.'
  },
  {
    markerId: 'marker_basketball_court',
    name: 'Basket Ball Court',
    label: 'BASKET BALL COURT',
    category: 'Sports',
    imageX: 0.1973,
    imageY: 0.5428,
    latitude: 13.16982,
    longitude: 77.53402,
    shortCode: 'PU-BASKET',
    description: 'FIBA standard synthetic hardcourt basketball facility with floodlights.'
  },
  {
    markerId: 'marker_cricket_nets',
    name: 'Cricket Nets',
    label: 'CRICKET NETS',
    category: 'Sports',
    imageX: 0.3173,
    imageY: 0.5428,
    latitude: 13.16982,
    longitude: 77.53462,
    shortCode: 'PU-CRICKET',
    description: 'Professional outdoor cricket practice nets and bowling pitches.'
  },

  // ==========================================
  // WEST ACADEMIC COMPLEX (BLOCKS D, E, F, L)
  // ==========================================
  {
    markerId: 'marker_d_block',
    name: 'D Block',
    label: 'D BLOCK',
    category: 'Academic',
    imageX: 0.2041,
    imageY: 0.6478,
    latitude: 13.17055,
    longitude: 77.53561,
    buildingId: 'bld_d_block',
    shortCode: 'PU-D-BLOCK',
    description: 'School of Engineering: Mechanical & Civil Engineering labs, CAD/CAM workshops.'
  },
  {
    markerId: 'marker_e_block',
    name: 'E Block',
    label: 'E BLOCK',
    category: 'Academic',
    imageX: 0.2024,
    imageY: 0.6972,
    latitude: 13.17005,
    longitude: 77.53542,
    buildingId: 'bld_e_block',
    shortCode: 'PU-E-BLOCK',
    description: 'Electrical, Electronics & Communication Engineering laboratories and smart classrooms.'
  },
  {
    markerId: 'marker_f_block',
    name: 'F Block',
    label: 'F BLOCK',
    category: 'Academic',
    imageX: 0.2024,
    imageY: 0.7491,
    latitude: 13.16952,
    longitude: 77.53528,
    buildingId: 'bld_f_block',
    shortCode: 'PU-F-BLOCK',
    description: 'School of Computer Science & Engineering (CSE): AI/ML & IoT centers of excellence.'
  },
  {
    markerId: 'marker_l_block',
    name: 'L Block',
    label: 'L BLOCK',
    category: 'Academic',
    imageX: 0.1990,
    imageY: 0.8022,
    latitude: 13.16898,
    longitude: 77.53515,
    buildingId: 'bld_l_block',
    shortCode: 'PU-L-BLOCK',
    description: 'School of Design, Architecture studios, and foundational sciences complex.'
  },

  // ==========================================
  // CENTRAL-SOUTH ACADEMIC BLOCKS (H, J, K, N, P, Q, R, S, U)
  // ==========================================
  {
    markerId: 'marker_admission_register',
    name: 'Admission Block & Register Office',
    label: 'ADMISSION BLOCK & REGISTER OFFICE',
    category: 'Academic',
    imageX: 0.3310,
    imageY: 0.6791,
    latitude: 13.16922,
    longitude: 77.53482,
    shortCode: 'PU-ADM-OFFICE',
    description: 'Central admissions counselling, registrar executive offices, and student documentation.'
  },
  {
    markerId: 'marker_h_block',
    name: 'H Block',
    label: 'H BLOCK',
    category: 'Academic',
    imageX: 0.3310,
    imageY: 0.7081,
    latitude: 13.16898,
    longitude: 77.53482,
    buildingId: 'bld_h_block',
    shortCode: 'PU-H-BLOCK',
    description: 'Department of Humanities, Applied Sciences, and lecture theater halls.'
  },
  {
    markerId: 'marker_j_block',
    name: 'J Block',
    label: 'J BLOCK',
    category: 'Academic',
    imageX: 0.3122,
    imageY: 0.7382,
    latitude: 13.16875,
    longitude: 77.53468,
    buildingId: 'bld_j_block',
    shortCode: 'PU-J-BLOCK',
    description: 'Academic block housing specialized computing classrooms and seminar rooms.'
  },
  {
    markerId: 'marker_k_block',
    name: 'K Block',
    label: 'K BLOCK',
    category: 'Academic',
    imageX: 0.3431,
    imageY: 0.7575,
    latitude: 13.16868,
    longitude: 77.53492,
    buildingId: 'bld_k_block',
    shortCode: 'PU-K-BLOCK',
    description: 'Information Science & Technology specialized software testing laboratories.'
  },
  {
    markerId: 'marker_n_block',
    name: 'N Block',
    label: 'N BLOCK',
    category: 'Academic',
    imageX: 0.3173,
    imageY: 0.7949,
    latitude: 13.16828,
    longitude: 77.53480,
    buildingId: 'bld_n_block',
    shortCode: 'PU-N-BLOCK',
    description: 'Postgraduate research wing, data science clusters, and tutorial rooms.'
  },
  {
    markerId: 'marker_p_block',
    name: 'P Block',
    label: 'P BLOCK',
    category: 'Academic',
    imageX: 0.3431,
    imageY: 0.8372,
    latitude: 13.16798,
    longitude: 77.53492,
    buildingId: 'bld_p_block',
    shortCode: 'PU-P-BLOCK',
    description: 'Academic research facilities and interdisciplinary research centers.'
  },
  {
    markerId: 'marker_q_block',
    name: 'Q Block',
    label: 'Q BLOCK',
    category: 'Academic',
    imageX: 0.3036,
    imageY: 0.8733,
    latitude: 13.16768,
    longitude: 77.53468,
    buildingId: 'bld_q_block',
    shortCode: 'PU-Q-BLOCK',
    description: 'Undergraduate instructional classrooms and departmental staff rooms.'
  },
  {
    markerId: 'marker_r_block',
    name: 'R Block',
    label: 'R BLOCK',
    category: 'Academic',
    imageX: 0.3310,
    imageY: 0.9011,
    latitude: 13.16745,
    longitude: 77.53488,
    buildingId: 'bld_r_block',
    shortCode: 'PU-R-BLOCK',
    description: 'Faculty chambers, conference suites, and student project laboratories.'
  },
  {
    markerId: 'marker_s_block',
    name: 'S Block',
    label: 'S BLOCK',
    category: 'Academic',
    imageX: 0.2470,
    imageY: 0.8938,
    latitude: 13.16765,
    longitude: 77.53438,
    buildingId: 'bld_s_block',
    shortCode: 'PU-S-BLOCK',
    description: 'South academic pavilion with ground-floor dining kiosk and lecture rooms.'
  },
  {
    markerId: 'marker_u_block',
    name: 'U Block',
    label: 'U BLOCK',
    category: 'Academic',
    imageX: 0.2950,
    imageY: 0.9276,
    latitude: 13.16718,
    longitude: 77.53478,
    buildingId: 'bld_u_block',
    shortCode: 'PU-U-BLOCK',
    description: 'South campus block providing seminar rooms, study pods, and administrative storage.'
  },

  // ==========================================
  // ADMINISTRATIVE & CENTRAL SERVICES (EAST OF FOUNTAIN)
  // ==========================================
  {
    markerId: 'marker_plaza',
    name: 'Plaza',
    label: 'PLAZA',
    category: 'Facility',
    imageX: 0.4151,
    imageY: 0.6514,
    latitude: 13.16912,
    longitude: 77.53532,
    shortCode: 'PU-PLAZA',
    description: 'Central pedestrian gathering plaza connecting academic blocks to central services.'
  },
  {
    markerId: 'marker_hr_block',
    name: 'HR Block',
    label: 'HR BLOCK',
    category: 'Academic',
    imageX: 0.4374,
    imageY: 0.6755,
    latitude: 13.16900,
    longitude: 77.53545,
    buildingId: 'bld_hr_block',
    shortCode: 'PU-HR-BLOCK',
    description: 'Human Resources Directorate, faculty recruitment division, and corporate relations.'
  },
  {
    markerId: 'marker_coe',
    name: 'COE (Controller of Examinations)',
    label: 'COE',
    category: 'Academic',
    imageX: 0.4786,
    imageY: 0.7093,
    latitude: 13.16872,
    longitude: 77.53565,
    shortCode: 'PU-COE',
    description: 'Controller of Examinations: Exam evaluation, hall tickets, and degree certification.'
  },
  {
    markerId: 'marker_fee_counter',
    name: 'Fee Counter',
    label: 'FEE COUNTER',
    category: 'Facility',
    imageX: 0.5232,
    imageY: 0.6659,
    latitude: 13.16910,
    longitude: 77.53582,
    shortCode: 'PU-FEE-CNTR',
    description: 'University accounts, student fee collection, and financial aid disbursements.'
  },
  {
    markerId: 'marker_dsa',
    name: 'DSA (Directorate of Student Affairs)',
    label: 'DSA',
    category: 'Academic',
    imageX: 0.5249,
    imageY: 0.7238,
    latitude: 13.16858,
    longitude: 77.53582,
    shortCode: 'PU-DSA',
    description: 'Directorate of Student Affairs: Student clubs, grievances, sports, and cultural affairs.'
  },
  {
    markerId: 'marker_dsa_lawn',
    name: 'DSA Lawn',
    label: 'DSA LAWN',
    category: 'Garden',
    imageX: 0.5575,
    imageY: 0.7045,
    latitude: 13.16878,
    longitude: 77.53602,
    shortCode: 'PU-LAWN-DSA',
    description: 'Lawn adjacent to Student Affairs for club activities and student gatherings.'
  },
  {
    markerId: 'marker_library',
    name: 'Central University Library',
    label: 'LIBRARY',
    category: 'Library',
    imageX: 0.5626,
    imageY: 0.6755,
    latitude: 13.16902,
    longitude: 77.53605,
    shortCode: 'PU-LIB-MAIN',
    description: 'Multi-level university library with digital research repositories, reading halls, and journals.'
  },
  {
    markerId: 'marker_medical_room',
    name: 'Medical Room & Health Centre',
    label: 'MEDICAL ROOM',
    category: 'Medical',
    imageX: 0.5883,
    imageY: 0.6695,
    latitude: 13.16908,
    longitude: 77.53622,
    shortCode: 'PU-HEALTH',
    description: 'Campus emergency medical room, resident doctor, first-aid unit, and 24/7 ambulance bay.'
  },
  {
    markerId: 'marker_mba_som_block',
    name: 'MBA / SOM Block',
    label: 'MBA/SOM BLOCK',
    category: 'Academic',
    imageX: 0.6329,
    imageY: 0.7189,
    latitude: 13.16862,
    longitude: 77.53642,
    buildingId: 'bld_som_block',
    shortCode: 'PU-SOM-BLOCK',
    description: 'School of Management: Executive classrooms, Bloomberg trading terminal, and case study halls.'
  },

  // ==========================================
  // AUDITORIUM, MESS & EAST SERVICES
  // ==========================================
  {
    markerId: 'marker_hostel_mess',
    name: 'Hostel Mess',
    label: 'HOSTEL MESS',
    category: 'Cafe',
    imageX: 0.6947,
    imageY: 0.5428,
    latitude: 13.16948,
    longitude: 77.53692,
    shortCode: 'PU-MESS-HOSTEL',
    description: 'Residential student dining hall serving breakfast, lunch, and dinner.'
  },
  {
    markerId: 'marker_oat',
    name: 'O.A.T (Open Air Theatre)',
    label: 'O.A.T',
    category: 'Facility',
    imageX: 0.7461,
    imageY: 0.6273,
    latitude: 13.16898,
    longitude: 77.53728,
    shortCode: 'PU-OAT',
    description: 'Stepped open-air amphitheatre for university cultural festivals and student performances.'
  },
  {
    markerId: 'marker_auditorium',
    name: 'Auditorium',
    label: 'AUDITORIUM',
    category: 'Academic',
    imageX: 0.7221,
    imageY: 0.6815,
    latitude: 13.16868,
    longitude: 77.53712,
    shortCode: 'PU-AUDI-MAIN',
    description: 'Grand University Auditorium seating 1,200+ guests for convocations and national symposia.'
  },

  // ==========================================
  // CAMPUS FOOD POINTS (ICON MARKERS ON MAP)
  // ==========================================
  {
    markerId: 'marker_food_point_d',
    name: 'Food Point (Near D Block)',
    label: 'FOOD POINTS',
    category: 'Cafe',
    imageX: 0.3053,
    imageY: 0.6128,
    latitude: 13.16935,
    longitude: 77.53445,
    shortCode: 'PU-CAFE-WEST',
    description: 'Outdoor food kiosk and beverage corner serving snacks and refreshments.'
  },
  {
    markerId: 'marker_food_point_j',
    name: 'Food Point (J Block)',
    label: 'FOOD POINTS (J BLOCK)',
    category: 'Cafe',
    imageX: 0.2916,
    imageY: 0.7503,
    latitude: 13.16865,
    longitude: 77.53465,
    shortCode: 'PU-CAFE-J',
    description: 'Student cafeteria serving fresh fruit juices, hot tea, and quick bites.'
  },
  {
    markerId: 'marker_food_point_s',
    name: 'Food Point (S Block)',
    label: 'FOOD POINTS (S BLOCK)',
    category: 'Cafe',
    imageX: 0.2367,
    imageY: 0.8745,
    latitude: 13.16762,
    longitude: 77.53435,
    shortCode: 'PU-CAFE-S',
    description: 'South campus snack outlet serving parathas, sandwiches, and hot coffee.'
  },
  {
    markerId: 'marker_food_point_dsa',
    name: 'Food Point (DSA Plaza)',
    label: 'FOOD POINTS (DSA)',
    category: 'Cafe',
    imageX: 0.5249,
    imageY: 0.6924,
    latitude: 13.16885,
    longitude: 77.53582,
    shortCode: 'PU-CAFE-CENTRAL',
    description: 'Central campus snack station near library and student affairs.'
  },
  {
    markerId: 'marker_food_point_audi',
    name: 'Food Point (Auditorium)',
    label: 'FOOD POINTS (AUDITORIUM)',
    category: 'Cafe',
    imageX: 0.7513,
    imageY: 0.6490,
    latitude: 13.16882,
    longitude: 77.53735,
    shortCode: 'PU-CAFE-AUDI',
    description: 'Event refreshments and cafeteria adjacent to the University Auditorium.'
  },

  // ==========================================
  // CAMPUS ATMS (ICON MARKERS ON MAP)
  // ==========================================
  {
    markerId: 'marker_atm_west',
    name: 'ATM (West Academic Zone)',
    label: 'ATM',
    category: 'Facility',
    imageX: 0.2882,
    imageY: 0.6490,
    latitude: 13.16915,
    longitude: 77.53435,
    shortCode: 'PU-ATM-WEST',
    description: '24/7 Automated Teller Machine (ATM) serving students and faculty in the West sector.'
  },
  {
    markerId: 'marker_atm_central',
    name: 'ATM (Central Campus)',
    label: 'ATM (CENTRAL)',
    category: 'Facility',
    imageX: 0.5420,
    imageY: 0.6695,
    latitude: 13.16905,
    longitude: 77.53592,
    shortCode: 'PU-ATM-CENTRAL',
    description: '24/7 Nationalised Bank ATM located adjacent to the Fee Counter.'
  }
];

async function seedMapMarkers() {
  try {
    await connectDB();
    console.log('[SeedMapMarkers] Connected to MongoDB Atlas...');

    // Clear existing markers and insert full set
    const deleteRes = await CampusMapMarker.deleteMany({});
    console.log(`[SeedMapMarkers] Removed ${deleteRes.deletedCount} existing markers.`);

    const insertRes = await CampusMapMarker.insertMany(OFFICIAL_MAP_MARKERS);
    console.log(`[SeedMapMarkers] Successfully seeded ${insertRes.length} official campus master map markers into Atlas!`);

    await mongoose.connection.close();
    console.log('[SeedMapMarkers] MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[SeedMapMarkers] Error seeding map markers:', error);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seedMapMarkers.js')) {
  seedMapMarkers();
}
