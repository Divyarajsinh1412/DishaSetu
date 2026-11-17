/**
 * Official Presidency University Campus Buildings and Facilities Catalog
 * 
 * Sourced directly from Presidency University Bengaluru official campus directory.
 * Unsurveyed coordinates remain explicitly null or flagged as pending field verification.
 */

export const PRESIDENCY_BUILDINGS_CATALOG = [
  // Academic Blocks
  {
    name: 'D Block',
    code: 'PU-D-BLOCK',
    category: 'Academic',
    description: 'Lecture halls, engineering classrooms, and laboratories.',
    totalFloors: 4,
    departments: ['Mechanical Engineering', 'Civil Engineering'],
    isVerified: false,
    status: 'pending_gps_survey'
  },
  {
    name: 'E Block',
    code: 'PU-E-BLOCK',
    category: 'Academic',
    description: 'Classrooms, faculty cubicles, and seminar rooms.',
    totalFloors: 4,
    departments: ['Computer Science & Engineering', 'Data Science'],
    isVerified: false,
    status: 'pending_gps_survey'
  },
  {
    name: 'F Block',
    code: 'PU-F-BLOCK',
    category: 'Academic',
    description: 'Engineering instructional complex and specialized lecture halls.',
    totalFloors: 4,
    departments: ['Electrical & Electronics Engineering'],
    isVerified: false,
    status: 'pending_gps_survey'
  },
  {
    name: 'H Block (Admission & Registrar Office)',
    code: 'PU-H-BLOCK',
    category: 'Administrative',
    description: 'Central administrative hub housing university admissions, registrar office, and lecture halls.',
    totalFloors: 3,
    departments: ['Admissions', 'Registrar', 'Student Affairs', 'Finance'],
    isVerified: false,
    status: 'pending_gps_survey'
  },
  {
    name: 'J Block',
    code: 'PU-J-BLOCK',
    category: 'Academic',
    description: 'Classrooms and faculty offices situated adjacent to the student cafeteria zone.',
    totalFloors: 3,
    departments: ['School of Management', 'Commerce'],
    isVerified: false,
    status: 'pending_gps_survey'
  },
  {
    name: 'K Block',
    code: 'PU-K-BLOCK',
    category: 'Academic',
    description: 'Academic block featuring high-performance computer laboratories and tutorial spaces.',
    totalFloors: 3,
    departments: ['Information Science', 'AI & Machine Learning'],
    isVerified: false,
    status: 'pending_gps_survey'
  },
  {
    name: 'L Block',
    code: 'PU-L-BLOCK',
    category: 'Academic',
    description: 'Large academic complex located at the south-western wing of the campus.',
    totalFloors: 4,
    departments: ['School of Law', 'School of Design'],
    isVerified: false,
    status: 'pending_gps_survey'
  },
  {
    name: 'N Block',
    code: 'PU-N-BLOCK',
    category: 'Academic',
    description: 'Academic lecture halls and laboratory block in the central-south zone.',
    totalFloors: 3,
    departments: ['Basic Sciences', 'Humanities'],
    isVerified: false,
    status: 'pending_gps_survey'
  },
  {
    name: 'Central Library',
    code: 'PU-LIB-01',
    category: 'Facility',
    description: 'Multi-floor university library featuring digital reference resources, journal archives, and study halls.',
    totalFloors: 3,
    departments: ['Library Services'],
    isVerified: false,
    status: 'pending_gps_survey'
  },
  {
    name: 'Central Cafeteria & Food Court',
    code: 'PU-CAFE-01',
    category: 'Cafe',
    description: 'Campus multi-cuisine dining hall, bakery, and food outlet pavilion.',
    totalFloors: 2,
    departments: ['Dining Services'],
    isVerified: false,
    status: 'pending_gps_survey'
  },
  {
    name: 'Campus Health & Medical Centre',
    code: 'PU-MED-01',
    category: 'Medical',
    description: 'Emergency first-aid, primary clinical consultation, and 24x7 student ambulance bay.',
    totalFloors: 1,
    departments: ['Health Services'],
    isVerified: false,
    status: 'pending_gps_survey'
  },
  {
    name: 'Campus Security Headquarters',
    code: 'PU-SEC-01',
    category: 'Security',
    description: 'Main campus security monitoring control room, visitor registration, and lost & found.',
    totalFloors: 1,
    departments: ['Campus Security'],
    isVerified: false,
    status: 'pending_gps_survey'
  }
];
