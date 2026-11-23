import 'package:latlong2/latlong.dart';

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

class CampusGeometries {
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

  // All campus surveyed polygon geometries
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
}
