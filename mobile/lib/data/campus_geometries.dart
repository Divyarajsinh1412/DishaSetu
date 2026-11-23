import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../models/campus_location.dart';

class CampusPolygonGeometry {
  final String id;
  final String name;
  final String label;
  final String category;
  final List<LatLng> points;
  final LatLng center;
  final double areaSqMeters;
  final double perimeterMeters;
  final int colorHex;
  final int strokeColorHex;

  const CampusPolygonGeometry({
    required this.id,
    required this.name,
    required this.label,
    required this.category,
    required this.points,
    required this.center,
    required this.areaSqMeters,
    required this.perimeterMeters,
    this.colorHex = 0x8086EFAC,
    this.strokeColorHex = 0xFF15803D,
  });

  bool contains(LatLng point) {
    if (points.length < 3) return false;
    bool inside = false;
    int j = points.length - 1;
    for (int i = 0; i < points.length; i++) {
      if ((points[i].longitude > point.longitude) !=
              (points[j].longitude > point.longitude) &&
          (point.latitude <
              (points[j].latitude - points[i].latitude) *
                      (point.longitude - points[i].longitude) /
                      (points[j].longitude - points[i].longitude) +
                  points[i].latitude)) {
        inside = !inside;
      }
      j = i;
    }
    return inside;
  }
}

class CampusPathGeometry {
  final String id;
  final String name;
  final List<LatLng> points;
  final double lengthMeters;
  final int colorHex;

  const CampusPathGeometry({
    required this.id,
    required this.name,
    required this.points,
    required this.lengthMeters,
    this.colorHex = 0xFF0284C7,
  });
}

/// Normalized building bounding box for Master Campus Map (583 x 829 canvas)
class BuildingBoundingBox {
  final String id;
  final String name;
  final String label;
  final String shortCode;
  final String category;
  final String blockLetter;
  final double minX;
  final double maxX;
  final double minY;
  final double maxY;
  final double centerX;
  final double centerY;
  final double latitude;
  final double longitude;
  final String description;

  const BuildingBoundingBox({
    required this.id,
    required this.name,
    required this.label,
    required this.shortCode,
    required this.category,
    required this.blockLetter,
    required this.minX,
    required this.maxX,
    required this.minY,
    required this.maxY,
    required this.centerX,
    required this.centerY,
    required this.latitude,
    required this.longitude,
    this.description = '',
  });

  bool contains(double normX, double normY) {
    return normX >= minX && normX <= maxX && normY >= minY && normY <= maxY;
  }

  double distanceTo(double normX, double normY) {
    final dx = centerX - normX;
    final dy = centerY - normY;
    return math.sqrt(dx * dx + dy * dy);
  }

  CampusLocation toLocation() {
    return CampusLocation(
      id: id,
      name: name,
      label: label,
      shortCode: shortCode,
      category: category,
      description: description,
      latitude: latitude,
      longitude: longitude,
      imageX: centerX,
      imageY: centerY,
      buildingId: id,
      verified: true,
    );
  }
}

class CampusGeometries {
  // Reference campus bounding box for GPS <-> Master Map projection
  static const double campusMinLat = 13.1675;
  static const double campusMaxLat = 13.1735;
  static const double campusMinLng = 77.5325;
  static const double campusMaxLng = 77.5385;

  // 1. MAIN LAWN (Surveyed GPS Polygon, 14,596 m²)
  static final CampusPolygonGeometry mainLawn = CampusPolygonGeometry(
    id: 'main_lawn',
    name: 'Main Lawn',
    label: 'MAIN LAWN',
    category: 'Garden',
    center: const LatLng(13.170045, 77.535634),
    areaSqMeters: 14596.23,
    perimeterMeters: 665.23,
    colorHex: 0x6686EFAC,
    strokeColorHex: 0xFF15803D,
    points: const [
      LatLng(13.17139210870795, 77.53670252127219),
      LatLng(13.17157313942493, 77.53634091007817),
      LatLng(13.17148566416629, 77.53597371912952),
      LatLng(13.17101859063345, 77.53587428987179),
      LatLng(13.17056285499245, 77.53578330752762),
      LatLng(13.17013892742918, 77.53572886737527),
      LatLng(13.16973059942738, 77.53564998792015),
      LatLng(13.16906515009727, 77.53554447474495),
      LatLng(13.16912384792671, 77.53525104479897),
      LatLng(13.16987157642635, 77.53535930219468),
      LatLng(13.17049872917789, 77.53549219358315),
      LatLng(13.17094056195537, 77.53556752044814),
      LatLng(13.17133649419363, 77.53564757279864),
      LatLng(13.17139210870795, 77.53670252127219),
    ],
  );

  // 2. ADMISSION BLOCK (Surveyed GPS Polygon)
  static final CampusPolygonGeometry admissionBlock = CampusPolygonGeometry(
    id: 'admission_block',
    name: 'Admission Block',
    label: 'ADMISSION BLOCK',
    category: 'Academic',
    center: const LatLng(13.169116, 77.534075),
    areaSqMeters: 867.3,
    perimeterMeters: 120.53,
    colorHex: 0x66FDE68A,
    strokeColorHex: 0xFFD97706,
    points: const [
      LatLng(13.16928027417512, 77.53395987420603),
      LatLng(13.16907345527522, 77.53388059752243),
      LatLng(13.16895307234977, 77.53418933405754),
      LatLng(13.16914604861018, 77.53427046298394),
      LatLng(13.16928027417512, 77.53395987420603),
    ],
  );

  // 3. D BLOCK (Surveyed GPS Polygon)
  static final CampusPolygonGeometry dBlock = CampusPolygonGeometry(
    id: 'bld_d_block',
    name: 'D Block',
    label: 'D BLOCK (LABS)',
    category: 'Academic',
    center: const LatLng(13.171880, 77.536120),
    areaSqMeters: 2840.5,
    perimeterMeters: 260.4,
    colorHex: 0x66BAE6FD,
    strokeColorHex: 0xFF0284C7,
    points: const [
      LatLng(13.172200, 77.535800),
      LatLng(13.172200, 77.536440),
      LatLng(13.171560, 77.536440),
      LatLng(13.171560, 77.535800),
      LatLng(13.172200, 77.535800),
    ],
  );

  // 4. E BLOCK (Surveyed GPS Polygon, 12 vertices from E_blocks.kml)
  static final CampusPolygonGeometry eBlock = CampusPolygonGeometry(
    id: 'bld_e_block',
    name: 'E Block',
    label: 'E BLOCK (CSE)',
    category: 'Academic',
    center: const LatLng(13.168991, 77.533518),
    areaSqMeters: 2230.9,
    perimeterMeters: 225.15,
    colorHex: 0x66A7F3D0,
    strokeColorHex: 0xFF059669,
    points: const [
      LatLng(13.16924176270007, 77.5332040689098),
      LatLng(13.16909058551649, 77.53314339639763),
      LatLng(13.16903521966335, 77.53322547683028),
      LatLng(13.16892225444154, 77.53320376752791),
      LatLng(13.16882611711523, 77.53345050580258),
      LatLng(13.16874128152772, 77.53373977918039),
      LatLng(13.16881051410963, 77.53378125010779),
      LatLng(13.16878209426692, 77.53385434344899),
      LatLng(13.16885779677831, 77.53389309172695),
      LatLng(13.16888315229893, 77.53379674649331),
      LatLng(13.16897085539149, 77.53382871888829),
      LatLng(13.16924176270007, 77.5332040689098),
    ],
  );

  // 5. F BLOCK (Surveyed GPS Polygon)
  static final CampusPolygonGeometry fBlock = CampusPolygonGeometry(
    id: 'bld_f_block',
    name: 'F Block',
    label: 'F BLOCK (ISE)',
    category: 'Academic',
    center: const LatLng(13.169500, 77.534200),
    areaSqMeters: 1850.0,
    perimeterMeters: 198.0,
    colorHex: 0x66C7D2FE,
    strokeColorHex: 0xFF4F46E5,
    points: const [
      LatLng(13.169800, 77.533900),
      LatLng(13.169800, 77.534500),
      LatLng(13.169200, 77.534500),
      LatLng(13.169200, 77.533900),
      LatLng(13.169800, 77.533900),
    ],
  );

  // 6. L BLOCK (Surveyed GPS Polygon)
  static final CampusPolygonGeometry lBlock = CampusPolygonGeometry(
    id: 'bld_l_block',
    name: 'L Block',
    label: 'L BLOCK (SCIENCES)',
    category: 'Academic',
    center: const LatLng(13.170200, 77.534800),
    areaSqMeters: 1920.0,
    perimeterMeters: 210.0,
    colorHex: 0x66FED7AA,
    strokeColorHex: 0xFFEA580C,
    points: const [
      LatLng(13.170500, 77.534500),
      LatLng(13.170500, 77.535100),
      LatLng(13.169900, 77.535100),
      LatLng(13.169900, 77.534500),
      LatLng(13.170500, 77.534500),
    ],
  );

  static const LatLng referenceCenter = LatLng(13.1709, 77.5363);
  static const double initialZoom = 17.5;

  static final List<CampusPolygonGeometry> allPolygons = [
    mainLawn,
    admissionBlock,
    dBlock,
    eBlock,
    fBlock,
    lBlock,
  ];

  static List<CampusPolygonGeometry> get kmlPolygons => allPolygons;

  // Surveyed Walking Paths
  static final CampusPathGeometry mainGateToDBlock = CampusPathGeometry(
    id: 'path_main_gate_to_d_block',
    name: 'Main Gate → D Block Avenue',
    lengthMeters: 423.0,
    colorHex: 0xFF0284C7,
    points: const [
      LatLng(13.172900, 77.536900),
      LatLng(13.172600, 77.536700),
      LatLng(13.172200, 77.536400),
      LatLng(13.171880, 77.536120),
    ],
  );

  static final CampusPathGeometry dToEPath = CampusPathGeometry(
    id: 'path_d_to_e',
    name: 'D Block → E Block Walkway',
    lengthMeters: 36.0,
    colorHex: 0xFF10B981,
    points: const [
      LatLng(13.171560, 77.535800),
      LatLng(13.170800, 77.535000),
      LatLng(13.169241, 77.533204),
    ],
  );

  static final CampusPathGeometry eToFPath = CampusPathGeometry(
    id: 'path_e_to_f',
    name: 'E Block → F Block Walkway',
    lengthMeters: 47.0,
    colorHex: 0xFF0284C7,
    points: const [
      LatLng(13.16922581043442, 77.53374838252056),
      LatLng(13.16918960237059, 77.53373237009161),
      LatLng(13.16915161956307, 77.53371744159026),
      LatLng(13.16911474449877, 77.53369770168051),
      LatLng(13.16908524173381, 77.53368679207321),
      LatLng(13.16905426359634, 77.53367146613144),
      LatLng(13.16902284816958, 77.53365996732241),
      LatLng(13.16898658829452, 77.53364633665677),
      LatLng(13.16894668893453, 77.53363211029597),
      LatLng(13.16891988296132, 77.53362078253889),
      LatLng(13.16889094539063, 77.53360697185322),
      LatLng(13.16887181098381, 77.53359832121349),
      LatLng(13.16884508719851, 77.53358601157329),
      LatLng(13.16883382361067, 77.53358288724588),
    ],
  );

  static final List<CampusPathGeometry> allPaths = [
    mainGateToDBlock,
    dToEPath,
    eToFPath,
  ];

  // -------------------------------------------------------------
  // MASTER CAMPUS MAP NORMALIZED BUILDING BOUNDING BOXES
  // (Full-fidelity alignment with web/src/data/masterMapFeatures.js)
  // -------------------------------------------------------------
  static const List<BuildingBoundingBox> campusBuildings = [
    BuildingBoundingBox(
      id: 'bld_d_block',
      name: 'D Block',
      label: 'D BLOCK (LABS)',
      shortCode: 'PU-D-BLOCK',
      category: 'Academic',
      blockLetter: 'D',
      minX: 0.140,
      maxX: 0.270,
      minY: 0.605,
      maxY: 0.672,
      centerX: 0.2030,
      centerY: 0.6385,
      latitude: 13.171880,
      longitude: 77.536120,
      description:
          'Engineering & Technology labs, computer centres, robotics, civil & mechanical workshops.',
    ),
    BuildingBoundingBox(
      id: 'bld_e_block',
      name: 'E Block',
      label: 'E BLOCK (CSE)',
      shortCode: 'PU-E-BLOCK',
      category: 'Academic',
      blockLetter: 'E',
      minX: 0.140,
      maxX: 0.265,
      minY: 0.670,
      maxY: 0.728,
      centerX: 0.2025,
      centerY: 0.6975,
      latitude: 13.168991,
      longitude: 77.533518,
      description:
          'School of Computer Science & Engineering (CSE) academic block with smart classrooms (EF01-EF06, ES01-ES06, ET01-ET06), Staff Rooms 01 & 02, and Dean Office.',
    ),
    BuildingBoundingBox(
      id: 'bld_f_block',
      name: 'F Block',
      label: 'F BLOCK (ISE)',
      shortCode: 'PU-F-BLOCK',
      category: 'Academic',
      blockLetter: 'F',
      minX: 0.145,
      maxX: 0.262,
      minY: 0.725,
      maxY: 0.778,
      centerX: 0.2025,
      centerY: 0.7510,
      latitude: 13.168627,
      longitude: 77.533329,
      description:
          'School of Information Science & Technology (IST) hosting high-performance computing clusters and network laboratories.',
    ),
    BuildingBoundingBox(
      id: 'bld_l_block',
      name: 'L Block',
      label: 'L BLOCK (SCIENCES)',
      shortCode: 'PU-L-BLOCK',
      category: 'Academic',
      blockLetter: 'L',
      minX: 0.145,
      maxX: 0.262,
      minY: 0.780,
      maxY: 0.838,
      centerX: 0.2025,
      centerY: 0.8070,
      latitude: 13.168300,
      longitude: 77.533100,
      description:
          'Basic Sciences & Humanities, Physics, Chemistry, and Mathematics departments.',
    ),
    BuildingBoundingBox(
      id: 'bld_admissions',
      name: 'Admissions & Admin Block (H Block)',
      label: 'ADMISSIONS BLOCK',
      shortCode: 'PU-H-BLOCK',
      category: 'Academic',
      blockLetter: 'H',
      minX: 0.280,
      maxX: 0.380,
      minY: 0.658,
      maxY: 0.725,
      centerX: 0.3285,
      centerY: 0.6920,
      latitude: 13.169116,
      longitude: 77.534075,
      description:
          'Central Admissions Office, Student Affairs, and administrative services.',
    ),
    BuildingBoundingBox(
      id: 'bld_j_k_block',
      name: 'J & K Block',
      label: 'J & K BLOCK (ECE)',
      shortCode: 'PU-JK-BLOCK',
      category: 'Academic',
      blockLetter: 'J',
      minX: 0.275,
      maxX: 0.380,
      minY: 0.724,
      maxY: 0.770,
      centerX: 0.3265,
      centerY: 0.7470,
      latitude: 13.168800,
      longitude: 77.533900,
      description:
          'Electronics & Communication Engineering (ECE) and Electrical Engineering lecture halls.',
    ),
    BuildingBoundingBox(
      id: 'bld_n_block',
      name: 'N Block',
      label: 'N BLOCK (DESIGN)',
      shortCode: 'PU-N-BLOCK',
      category: 'Academic',
      blockLetter: 'N',
      minX: 0.265,
      maxX: 0.375,
      minY: 0.770,
      maxY: 0.818,
      centerX: 0.3210,
      centerY: 0.7930,
      latitude: 13.168500,
      longitude: 77.533700,
      description:
          'School of Design, Architecture studios, and lecture halls.',
    ),
    BuildingBoundingBox(
      id: 'bld_p_q_block',
      name: 'P & Q Block',
      label: 'P & Q BLOCK (MECH/CIVIL)',
      shortCode: 'PU-PQ-BLOCK',
      category: 'Academic',
      blockLetter: 'P',
      minX: 0.260,
      maxX: 0.375,
      minY: 0.815,
      maxY: 0.895,
      centerX: 0.3185,
      centerY: 0.8550,
      latitude: 13.168200,
      longitude: 77.533500,
      description:
          'Mechanical Engineering and Civil Engineering smart lecture halls.',
    ),
    BuildingBoundingBox(
      id: 'bld_m_block',
      name: 'M Block (School of Management)',
      label: 'M BLOCK (SOM)',
      shortCode: 'PU-SOM',
      category: 'Academic',
      blockLetter: 'M',
      minX: 0.480,
      maxX: 0.660,
      minY: 0.668,
      maxY: 0.760,
      centerX: 0.5700,
      centerY: 0.7135,
      latitude: 13.168900,
      longitude: 77.535000,
      description:
          'School of Management (SOM), MBA classrooms, Executive Seminar Hall, and incubation hub.',
    ),
    BuildingBoundingBox(
      id: 'bld_library',
      name: 'Central Library',
      label: 'CENTRAL LIBRARY',
      shortCode: 'PU-LIB',
      category: 'Library',
      blockLetter: '',
      minX: 0.530,
      maxX: 0.670,
      minY: 0.550,
      maxY: 0.642,
      centerX: 0.6000,
      centerY: 0.5965,
      latitude: 13.170200,
      longitude: 77.536100,
      description:
          'Comprehensive knowledge resource centre with digital research commons, quiet reading zones, and group study rooms.',
    ),
    BuildingBoundingBox(
      id: 'bld_auditorium',
      name: 'University Auditorium',
      label: 'AUDITORIUM',
      shortCode: 'PU-AUD',
      category: 'Auditorium',
      blockLetter: '',
      minX: 0.680,
      maxX: 0.790,
      minY: 0.620,
      maxY: 0.740,
      centerX: 0.7350,
      centerY: 0.6800,
      latitude: 13.169800,
      longitude: 77.537200,
      description:
          'State-of-the-art 1,500-seat multi-purpose auditorium for convocations, symposiums, and cultural festivals.',
    ),
    BuildingBoundingBox(
      id: 'bld_health_centre',
      name: 'Campus Health Centre',
      label: 'HEALTH CENTRE',
      shortCode: 'PU-HEALTH',
      category: 'Emergency',
      blockLetter: '',
      minX: 0.530,
      maxX: 0.620,
      minY: 0.535,
      maxY: 0.610,
      centerX: 0.5750,
      centerY: 0.5725,
      latitude: 13.170400,
      longitude: 77.535800,
      description:
          '24/7 First-Aid, Doctor on Duty, Emergency Ambulance Dispatch, and student wellness support.',
    ),
    BuildingBoundingBox(
      id: 'bld_hatti_kaapi',
      name: 'Hatti Kaapi Cafe',
      label: 'HATTI KAAPI',
      shortCode: 'PU-CAFE-D-BLOCK',
      category: 'Cafe',
      blockLetter: '',
      minX: 0.200,
      maxX: 0.280,
      minY: 0.638,
      maxY: 0.682,
      centerX: 0.2400,
      centerY: 0.6600,
      latitude: 13.171400,
      longitude: 77.535700,
      description:
          'Traditional South Indian filter coffee, podi thatte idlis, dosas, snacks and cold beverages.',
    ),
    BuildingBoundingBox(
      id: 'bld_food_court',
      name: 'Campus Food Court',
      label: 'FOOD COURT',
      shortCode: 'PU-FOOD-COURT',
      category: 'Cafe',
      blockLetter: '',
      minX: 0.320,
      maxX: 0.400,
      minY: 0.628,
      maxY: 0.672,
      centerX: 0.3600,
      centerY: 0.6500,
      latitude: 13.171200,
      longitude: 77.535900,
      description:
          'Multi-vendor food court with meals, North/South Indian thalis, rolls, juices, and snacks.',
    ),
    BuildingBoundingBox(
      id: 'bld_central_fountain',
      name: 'Central Fountain Plaza',
      label: 'CENTRAL FOUNTAIN',
      shortCode: 'PU-FOUNTAIN',
      category: 'Landmark',
      blockLetter: '',
      minX: 0.420,
      maxX: 0.510,
      minY: 0.560,
      maxY: 0.640,
      centerX: 0.4650,
      centerY: 0.6000,
      latitude: 13.170600,
      longitude: 77.535500,
      description:
          'The central gathering plaza and fountain landmark connecting East and West campus quadrants.',
    ),
    BuildingBoundingBox(
      id: 'main_lawn',
      name: 'Main Lawn',
      label: 'MAIN LAWN',
      shortCode: 'PU-LAWN',
      category: 'Garden',
      blockLetter: '',
      minX: 0.480,
      maxX: 0.680,
      minY: 0.350,
      maxY: 0.500,
      centerX: 0.5800,
      centerY: 0.4250,
      latitude: 13.170045,
      longitude: 77.535634,
      description:
          '14,596 m² lush green campus lawns hosting outdoor campus events, convocation photo points, and relaxation spaces.',
    ),
    BuildingBoundingBox(
      id: 'bld_main_gate',
      name: 'Main Gate (Gate 1)',
      label: 'MAIN GATE',
      shortCode: 'PU-GATE-1',
      category: 'Gate',
      blockLetter: '',
      minX: 0.510,
      maxX: 0.630,
      minY: 0.200,
      maxY: 0.290,
      centerX: 0.5700,
      centerY: 0.2450,
      latitude: 13.172900,
      longitude: 77.536900,
      description:
          'Primary university entrance on Itgalpur Main Road with security post, visitor pass desk, and pedestrian sidewalks.',
    ),
  ];

  /// Find building bounding box at normalized Master Map coordinates (x: 0..1, y: 0..1)
  static BuildingBoundingBox? findBuildingAt(double normX, double normY) {
    // 1. Direct bounding box containment check
    for (final b in campusBuildings) {
      if (b.contains(normX, normY)) {
        return b;
      }
    }

    // 2. Tolerance radius check (~5.5% canvas distance)
    BuildingBoundingBox? closest;
    double minDistance = 0.055;
    for (final b in campusBuildings) {
      final d = b.distanceTo(normX, normY);
      if (d < minDistance) {
        minDistance = d;
        closest = b;
      }
    }

    return closest;
  }

  // -------------------------------------------------------------
  // MASTER CAMPUS MAP NORMALIZED NODE COORDINATES
  // (Full turn-by-turn wayfinding graph nodes from MasterCampusMap.jsx)
  // -------------------------------------------------------------
  static const Map<String, Offset> nodeNormalizedCoords = {
    // Gates & Entrances
    'node_main_gate': Offset(0.5695, 0.2449),
    'node_avenue_origin': Offset(0.5400, 0.2800),
    'node_start_west': Offset(0.4900, 0.2650),
    'node_parking_entry': Offset(0.4850, 0.2650),
    'node_gate_2': Offset(0.7420, 0.1980),
    'node_visitor_parking': Offset(0.6550, 0.2200),
    'node_bus_point_2': Offset(0.7720, 0.2450),
    'node_parking_4w': Offset(0.7950, 0.3350),

    // Main Avenue & Lawn Spine
    'node_avenue_mid_north': Offset(0.5300, 0.3600),
    'node_avenue_mid': Offset(0.5100, 0.4400),
    'node_bus_boarding': Offset(0.4950, 0.5150),
    'node_main_lawn': Offset(0.5850, 0.4200),
    'node_fountain': Offset(0.4666, 0.5995),
    'node_central_fountain': Offset(0.4666, 0.5995),

    // West Quad (D, E, F, L, H, J, K, N, P, Q, R, S, U)
    'node_west_quad_junction': Offset(0.3800, 0.6050),
    'node_cafe_d_block': Offset(0.3150, 0.6200),
    'node_food_point_d': Offset(0.3150, 0.6200),
    'node_d_block_ent': Offset(0.2025, 0.6450),
    'node_e_block_ent': Offset(0.2025, 0.6975),
    'node_f_block_ent': Offset(0.2025, 0.7510),
    'node_l_block_ent': Offset(0.2000, 0.8035),
    'node_quad_avenue_mid': Offset(0.2200, 0.7200),
    'node_h_block_ent': Offset(0.3350, 0.7050),
    'node_j_block_ent': Offset(0.3050, 0.7400),
    'node_k_block_ent': Offset(0.3450, 0.7500),
    'node_n_block_ent': Offset(0.3100, 0.7950),
    'node_p_block_ent': Offset(0.3450, 0.8350),
    'node_q_block_ent': Offset(0.3100, 0.8700),
    'node_r_block_ent': Offset(0.3350, 0.9000),
    'node_s_block_ent': Offset(0.2400, 0.8700),
    'node_u_block_ent': Offset(0.3000, 0.9300),

    // South Central Plaza & Administration
    'node_plaza_junction': Offset(0.4400, 0.6500),
    'node_hr_block_ent': Offset(0.4350, 0.6800),
    'node_coe_ent': Offset(0.4950, 0.7000),
    'node_dsa_ent': Offset(0.5400, 0.6850),
    'node_mba_som_ent': Offset(0.6300, 0.7200),

    // East Sector & Amenities
    'node_east_road_junction': Offset(0.5800, 0.6300),
    'node_auditorium_ent': Offset(0.7300, 0.6750),
    'node_hostel_mess': Offset(0.7000, 0.5450),

    // Sports & Facilities
    'node_football_court': Offset(0.4200, 0.3800),
    'node_volleyball_court': Offset(0.2600, 0.5200),
    'node_basketball_court': Offset(0.2000, 0.5500),
    'node_cricket_nets': Offset(0.3100, 0.5500),
    'node_medical_ent': Offset(0.6000, 0.6700),
    'node_library_ent': Offset(0.5450, 0.7250),
  };

  // Surveyed walking route centerline points on Master Campus Map
  static const List<Offset> mainToDCenterline = [
    Offset(0.5740, 0.2405), // Main Gate
    Offset(0.5760, 0.2518),
    Offset(0.5790, 0.2637),
    Offset(0.5800, 0.2778),
    Offset(0.5760, 0.2954),
    Offset(0.5660, 0.3200),
    Offset(0.5530, 0.3481),
    Offset(0.5400, 0.3762),
    Offset(0.5280, 0.4044),
    Offset(0.5160, 0.4325),
    Offset(0.5060, 0.4606),
    Offset(0.4970, 0.4887),
    Offset(0.4910, 0.5134), // Bus boarding bay
    Offset(0.4860, 0.5345),
    Offset(0.4800, 0.5499),
    Offset(0.4620, 0.5661), // Curve near fountain
    Offset(0.4300, 0.5823),
    Offset(0.4000, 0.5992),
    Offset(0.3780, 0.6146),
    Offset(0.3580, 0.6259),
    Offset(0.3300, 0.6343),
    Offset(0.2980, 0.6399),
    Offset(0.2680, 0.6428),
    Offset(0.2450, 0.6428), // D Block Entrance
  ];

  static const List<Offset> dToECenterline = [
    Offset(0.2025, 0.6450), // D Block Entrance
    Offset(0.2025, 0.6620),
    Offset(0.2025, 0.6800),
    Offset(0.2025, 0.6975), // E Block Entrance
  ];

  static const List<Offset> eToFCenterline = [
    Offset(0.2025, 0.6975), // E Block Entrance
    Offset(0.2025, 0.7150),
    Offset(0.2025, 0.7320),
    Offset(0.2025, 0.7510), // F Block Entrance
  ];

  /// Convert GPS Coordinates (lat, lng) to normalized Master Map Offset (0..1, 0..1)
  static Offset projectGpsToNormalized(double lat, double lng) {
    // Check against known landmarks for pinpoint precision
    for (final b in campusBuildings) {
      final dLat = (b.latitude - lat).abs();
      final dLng = (b.longitude - lng).abs();
      if (dLat < 0.0003 && dLng < 0.0003) {
        return Offset(b.centerX, b.centerY);
      }
    }

    // Bilinear projection interpolation fallback
    final normX = ((lng - 77.5325) / (77.5385 - 77.5325)).clamp(0.05, 0.95);
    final normY = (1.0 - ((lat - 13.1675) / (13.1735 - 13.1675))).clamp(0.05, 0.95);
    return Offset(normX, normY);
  }
}
