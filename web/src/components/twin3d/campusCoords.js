import * as THREE from 'three';

/**
 * GPS to 3D World Transformation Engine for Presidency University Bengaluru
 * Reference Origin: Central Quadrangle / Admin Roundabout (13.1706°N, 77.5358°E)
 */
export const REF_LAT = 13.1706;
export const REF_LNG = 77.5358;
export const METERS_PER_LAT = 111000;
export const METERS_PER_LNG = 108078; // 111000 * cos(13.17°)

/**
 * Converts GPS (lat, lng) to Three.js World coordinates
 * Three.js coordinate system:
 * - X: East (+X) / West (-X)
 * - Y: Elevation / Height Up (+Y)
 * - Z: South (+Z) / North (-Z)
 */
export function gpsToWorld(lat, lng, y = 0) {
  if (lat == null || lng == null) return new THREE.Vector3(0, 0, 0);
  const x = (lng - REF_LNG) * METERS_PER_LNG;
  const z = -(lat - REF_LAT) * METERS_PER_LAT;
  return new THREE.Vector3(x, y, z);
}

/**
 * Converts Three.js World coordinates back to GPS (lat, lng)
 */
export function worldToGps(x, z) {
  const lat = REF_LAT - (z / METERS_PER_LAT);
  const lng = REF_LNG + (x / METERS_PER_LNG);
  return { lat, lng };
}

/**
 * Calibrated Geometric Specifications for Presidency University Buildings
 * Modeled from actual drone photography and verified layout.
 */
export const CAMPUS_BUILDING_SPECS = {
  // 1. Engineering Mega-Complex (East Wing - Blocks C, D, E, F)
  loc_engineering_complex: {
    id: 'loc_engineering_complex',
    name: 'School of Engineering Mega-Complex',
    shortCode: 'PU-ENG-MEGA',
    category: 'Academic',
    centerGps: { lat: 13.17085, lng: 77.53635 },
    dimensions: { width: 75, depth: 45, height: 24, floors: 5 },
    rotation: -0.15, // slight campus alignment angle
    color: '#FFFFFF',
    accentColor: '#38BDF8',
    roofType: 'mega_stepped',
    entranceOffset: { x: -35, z: 5 },
    departments: ['Computer Science', 'AI & Machine Learning', 'Electronics & Comm', 'Mechanical', 'Civil Eng']
  },

  // 2. Central Administration, Admissions & Boardroom (Behind Fountain)
  loc_h_block: {
    id: 'loc_h_block',
    name: 'H Block (Admin, Admissions & Registrar)',
    shortCode: 'PU-H-BLOCK',
    category: 'Administrative',
    centerGps: { lat: 13.17134, lng: 77.536251 },
    dimensions: { width: 50, depth: 32, height: 18, floors: 4 },
    rotation: -0.12,
    color: '#F8FAFC',
    accentColor: '#00A878',
    roofType: 'solar_canopy',
    entranceOffset: { x: -22, z: 0 },
    departments: ['Admissions Office', 'Vice Chancellor Secretariat', 'Registrar', 'Student Accounts']
  },

  // 3. School of Management (SOM) & West Academic Wing
  loc_som_block: {
    id: 'loc_som_block',
    name: 'School of Management & Commerce (SOM)',
    shortCode: 'PU-SOM-BLOCK',
    category: 'Academic',
    centerGps: { lat: 13.17060, lng: 77.53540 },
    dimensions: { width: 65, depth: 30, height: 20, floors: 4 },
    rotation: -0.12,
    color: '#FFFFFF',
    accentColor: '#0284C7',
    roofType: 'blue_fascia',
    entranceOffset: { x: 28, z: 0 },
    departments: ['MBA Programs', 'BBA & Commerce', 'Executive Education', 'Fintech Studio']
  },

  // 4. D Block (Engineering Studios & Laboratories)
  loc_d_block: {
    id: 'loc_d_block',
    name: 'D Block (Engineering Studios & CAD/CAM)',
    shortCode: 'PU-D-BLOCK',
    category: 'Academic',
    centerGps: { lat: 13.170563, lng: 77.535573 },
    dimensions: { width: 45, depth: 26, height: 18, floors: 4 },
    rotation: -0.12,
    color: '#F1F5F9',
    accentColor: '#10B981',
    roofType: 'flat_solar',
    entranceOffset: { x: 18, z: 0 },
    departments: ['Robotics Lab', 'Fluid Mechanics', 'Strength of Materials', 'IoT Studio']
  },

  // 5. Central University Library & Research Center
  loc_library: {
    id: 'loc_library',
    name: 'Central University Library',
    shortCode: 'PU-LIB-01',
    category: 'Library',
    centerGps: { lat: 13.170408, lng: 77.535742 },
    dimensions: { width: 38, depth: 32, height: 16, floors: 3 },
    rotation: -0.12,
    color: '#FFFFFF',
    accentColor: '#F59E0B',
    roofType: 'glass_skylight',
    entranceOffset: { x: 0, z: -14 },
    departments: ['Digital Reference', 'Periodicals', 'Quiet Reading Hall', 'Research Archives']
  },

  // 6. Central Cafeteria, Dining & Student Food Court
  loc_cafeteria: {
    id: 'loc_cafeteria',
    name: 'University Food Court & Student Center',
    shortCode: 'PU-CAFE-01',
    category: 'Cafe',
    centerGps: { lat: 13.16980, lng: 77.53620 },
    dimensions: { width: 48, depth: 34, height: 12, floors: 2 },
    rotation: -0.12,
    color: '#F8FAFC',
    accentColor: '#F97316',
    roofType: 'curved_barrel',
    entranceOffset: { x: -18, z: 0 },
    departments: ['Central Cafeteria', 'Juice Lounge', 'Bakery Corner', 'Faculty Dining']
  },

  // 7. University Auditorium & Cultural Convention Center
  loc_auditorium: {
    id: 'loc_auditorium',
    name: 'Presidency Grand Auditorium',
    shortCode: 'PU-AUD-01',
    category: 'Auditorium',
    centerGps: { lat: 13.16960, lng: 77.53480 },
    dimensions: { width: 42, depth: 36, height: 16, floors: 2 },
    rotation: -0.12,
    color: '#E2E8F0',
    accentColor: '#8B5CF6',
    roofType: 'curved_barrel',
    entranceOffset: { x: 16, z: 0 },
    departments: ['Main Auditorium (1,500 seats)', 'Seminar Halls', 'Green Rooms', 'Media Suite']
  },

  // 8. Mechanical Workshops & Heavy Machinery Labs (Parallel Sheds from Image 2)
  loc_workshops: {
    id: 'loc_workshops',
    name: 'Engineering Workshops & Testing Sheds',
    shortCode: 'PU-WSHOP-01',
    category: 'Laboratories',
    centerGps: { lat: 13.16930, lng: 77.53470 },
    dimensions: { width: 55, depth: 28, height: 10, floors: 1 },
    rotation: -0.12,
    color: '#94A3B8',
    accentColor: '#64748B',
    roofType: 'corrugated_pitched',
    entranceOffset: { x: 20, z: 0 },
    departments: ['Welding Shop', 'Foundry', 'CNC Machining Lab', 'Automotive Lab']
  },

  // 9. West Academic Blocks (J, K, L, N, P, Q Blocks extending south)
  loc_west_wing_south: {
    id: 'loc_west_wing_south',
    name: 'South Academic Block (J, K & L Blocks)',
    shortCode: 'PU-SOUTH-ACAD',
    category: 'Academic',
    centerGps: { lat: 13.16975, lng: 77.53540 },
    dimensions: { width: 50, depth: 24, height: 18, floors: 4 },
    rotation: -0.12,
    color: '#FFFFFF',
    accentColor: '#0EA5E9',
    roofType: 'flat_solar',
    entranceOffset: { x: 20, z: 0 },
    departments: ['School of Law', 'School of Design', 'Media Studies', 'Lecture Halls']
  },

  // 10. University Health & Medical Center
  loc_medical_center: {
    id: 'loc_medical_center',
    name: 'Campus Health & Medical Center',
    shortCode: 'PU-MED-01',
    category: 'Medical',
    centerGps: { lat: 13.17020, lng: 77.53670 },
    dimensions: { width: 26, depth: 20, height: 10, floors: 2 },
    rotation: -0.12,
    color: '#FFFFFF',
    accentColor: '#EF4444',
    roofType: 'flat_white',
    entranceOffset: { x: -10, z: 0 },
    departments: ['24/7 Outpatient Clinic', 'Pharmacy', 'Emergency Trauma Room', 'Ambulance Bay']
  },

  // 11. Student Hostels & Residential Blocks (North-East Campus)
  loc_hostel_blocks: {
    id: 'loc_hostel_blocks',
    name: 'Student Hostels & Residences',
    shortCode: 'PU-HOSTEL-01',
    category: 'Hostel',
    centerGps: { lat: 13.17140, lng: 77.53690 },
    dimensions: { width: 45, depth: 32, height: 22, floors: 6 },
    rotation: -0.12,
    color: '#F1F5F9',
    accentColor: '#6366F1',
    roofType: 'flat_white',
    entranceOffset: { x: -15, z: 0 },
    departments: ['Boys Hostel Wing', 'Girls Hostel Wing', 'Wardens Office', 'Common Recreation']
  },

  // 12. Main Campus Entrance Portal (North Gate)
  loc_main_gate: {
    id: 'loc_main_gate',
    name: 'Presidency University – Main Gate',
    shortCode: 'PU-GATE-01',
    category: 'Gate',
    centerGps: { lat: 13.1717995, lng: 77.5361915 },
    dimensions: { width: 36, depth: 10, height: 9, floors: 1 },
    rotation: -0.12,
    color: '#0F172A',
    accentColor: '#00A878',
    roofType: 'gate_arch',
    entranceOffset: { x: 0, z: 0 },
    departments: ['Main Security Gatehouse', 'Visitor Registration & Pass Desk']
  }
};
