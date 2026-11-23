import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../models/campus_location.dart';
import '../models/navigation_route.dart';

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

  // 7. DEF BLOCKS BOUNDARY (Exact Surveyed KML Polygon)
  static final CampusPolygonGeometry defBlocks = CampusPolygonGeometry(
    id: 'feat_def_blocks',
    name: 'DEF Blocks',
    label: 'DEF BLOCKS BOUNDARY',
    category: 'boundary',
    center: const LatLng(13.16807639717536, 77.53330040341337),
    areaSqMeters: 41250.0,
    perimeterMeters: 840.0,
    colorHex: 0x40FBC02D, // matching KML PolyStyle 40ffffff / #FBC02D gold
    strokeColorHex: 0xFFFBC02D, // matching KML LineStyle ff2dc0fb (RGB: #FBC02D)
    points: const [
      LatLng(13.16828186104801, 77.53263433547887),
      LatLng(13.168026534086, 77.53317107659311),
      LatLng(13.16677606947738, 77.53263663130764),
      LatLng(13.16651440674394, 77.53344099346141),
      LatLng(13.1691612075576, 77.5345945482777),
      LatLng(13.16969830413923, 77.53332483536148),
      LatLng(13.16828186104801, 77.53263433547887),
    ],
  );

  static const LatLng referenceCenter = LatLng(13.1709, 77.5363);
  static const double initialZoom = 17.5;

  static final List<CampusPolygonGeometry> allPolygons = [
    defBlocks,
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
      LatLng(13.17174576988432, 77.53609409799955),
      LatLng(13.17169863045853, 77.53608210855332),
      LatLng(13.1716383910603, 77.53605042839274),
      LatLng(13.17159359517197, 77.53604282665427),
      LatLng(13.17155101268326, 77.53603556812003),
      LatLng(13.17150754216009, 77.5360266924011),
      LatLng(13.17147941299077, 77.53602121419446),
      LatLng(13.17144588088828, 77.53601171550024),
      LatLng(13.17141548831614, 77.53600297805718),
      LatLng(13.17137149118117, 77.53598567076828),
      LatLng(13.17133931695116, 77.53596697295295),
      LatLng(13.17129818385298, 77.53595081617756),
      LatLng(13.17126896775573, 77.5359411946154),
      LatLng(13.17123972989239, 77.53592854020138),
      LatLng(13.17121308196014, 77.53592266244777),
      LatLng(13.17116699802034, 77.53589854624452),
      LatLng(13.1711155427013, 77.53586947061237),
      LatLng(13.17106666095199, 77.53584975560692),
      LatLng(13.17101448049524, 77.53581892871577),
      LatLng(13.17096051921789, 77.53579461787281),
      LatLng(13.17090689078972, 77.53576844077367),
      LatLng(13.17086562762542, 77.53574429064513),
      LatLng(13.17081162128503, 77.5357160467174),
      LatLng(13.17077800877276, 77.53569572249197),
      LatLng(13.17074490791287, 77.53567244764086),
      LatLng(13.17070499547361, 77.53564837922956),
      LatLng(13.17065386094593, 77.53561271930327),
      LatLng(13.17060860411526, 77.53558093956185),
      LatLng(13.17054935948529, 77.53555036633993),
      LatLng(13.17050113223478, 77.5355247736367),
      LatLng(13.17045012729626, 77.53549435194522),
      LatLng(13.17041064690491, 77.53547015697703),
      LatLng(13.17036640154106, 77.5354482317468),
      LatLng(13.17031826377981, 77.53541890680094),
      LatLng(13.17027002008206, 77.53539640838453),
      LatLng(13.17023498177819, 77.53537430972969),
      LatLng(13.1701820732767, 77.53534727991693),
      LatLng(13.17013954577857, 77.535323185103),
      LatLng(13.17009937034263, 77.5353022563515),
      LatLng(13.170051369734, 77.53527533003101),
      LatLng(13.17000868061955, 77.53524802486159),
      LatLng(13.16997249936164, 77.53523380553656),
      LatLng(13.16993464625497, 77.53521593309777),
      LatLng(13.16988366156734, 77.53518247499464),
      LatLng(13.169870695201, 77.53516452941227),
      LatLng(13.16983919235103, 77.53512610343617),
      LatLng(13.16981046335518, 77.53508194930586),
      LatLng(13.16984171658533, 77.53499372472088),
      LatLng(13.16987083894686, 77.53492970791183),
      LatLng(13.16986296632206, 77.53486744885356),
      LatLng(13.16979586272434, 77.53479484326571),
      LatLng(13.16972675792108, 77.53474772529633),
      LatLng(13.16964474898791, 77.53471726692706),
      LatLng(13.16957497737892, 77.5346907315059),
      LatLng(13.1694851705393, 77.53465797397705),
      LatLng(13.16940533551286, 77.53463137716737),
      LatLng(13.16933242293897, 77.53460062340486),
      LatLng(13.16925010470841, 77.53458177362035),
      LatLng(13.16918752404643, 77.53453792902008),
      LatLng(13.16915625214984, 77.53448600665828),
      LatLng(13.16915107133306, 77.5344453900895),
      LatLng(13.16913915771938, 77.53437656453819),
      LatLng(13.16912708583898, 77.53433825948261),
      LatLng(13.16911315488541, 77.53428686284192),
      LatLng(13.16911541318982, 77.53424813807851),
      LatLng(13.16911466856421, 77.53419928510363),
      LatLng(13.16911420430902, 77.53414280804282),
      LatLng(13.16913034561081, 77.53407626682362),
      LatLng(13.1691503981058, 77.53402067342786),
      LatLng(13.1691532256497, 77.53397599366181),
      LatLng(13.16915320163163, 77.53394490986271),
      LatLng(13.16915723332783, 77.53391962930635),
    ],
  );

  static final CampusPathGeometry dToEPath = CampusPathGeometry(
    id: 'path_d_to_e',
    name: 'D Block → E Block Walkway',
    lengthMeters: 35.7,
    colorHex: 0xFF10B981,
    points: const [
      LatLng(13.16921961010325, 77.53374368525881),
      LatLng(13.16916175269351, 77.53371476009588),
      LatLng(13.16909272541975, 77.53368916371579),
      LatLng(13.16905243962133, 77.53368308758547),
      LatLng(13.16901930916995, 77.5336693526416),
      LatLng(13.16897943341513, 77.5336527021713),
      LatLng(13.16898258842619, 77.53361351579872),
      LatLng(13.16899625259435, 77.53359127757469),
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

  static final CampusPathGeometry mainGateToHrBlock = CampusPathGeometry(
    id: 'path_main_gate_to_hr_block',
    name: 'Main Gate → HR Block Avenue',
    lengthMeters: 348.1,
    colorHex: 0xFF0284C7,
    points: const [
      LatLng(13.17169554298031, 77.5360850549506),
      LatLng(13.17153970016112, 77.53610184567775),
      LatLng(13.17139561800541, 77.53606456966142),
      LatLng(13.17124435793201, 77.53599599137695),
      LatLng(13.17109350020798, 77.53590674280781),
      LatLng(13.17096389548271, 77.53584411908042),
      LatLng(13.17084138574899, 77.53577797368055),
      LatLng(13.17068810682293, 77.53569125548779),
      LatLng(13.17051238972043, 77.53557882374868),
      LatLng(13.17033809142548, 77.53549602921471),
      LatLng(13.17020437354891, 77.53542286545951),
      LatLng(13.17006794753851, 77.5353582296776),
      LatLng(13.16995436346022, 77.53528606704418),
      LatLng(13.16985248647233, 77.53522100362564),
      LatLng(13.16966510316467, 77.53513847534576),
      LatLng(13.16950879654838, 77.53507774322956),
      LatLng(13.16945978765377, 77.53491784902023),
      LatLng(13.16938776571801, 77.53477427429164),
      LatLng(13.16928245784001, 77.53475255915706),
      LatLng(13.16917780710274, 77.53479461390964),
      LatLng(13.16907895226245, 77.53481685972112),
      LatLng(13.16902003202503, 77.5348155778984),
    ],
  );

  static final List<CampusPathGeometry> allPaths = [
    mainGateToDBlock,
    dToEPath,
    eToFPath,
    mainGateToHrBlock,
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
      id: 'bld_adm_block',
      name: 'Admission Block & Registrar Office',
      label: 'ADMISSION BLOCK',
      shortCode: 'PU-ADM-BLOCK',
      category: 'Administrative',
      blockLetter: 'A',
      minX: 0.280,
      maxX: 0.380,
      minY: 0.658,
      maxY: 0.690,
      centerX: 0.3300,
      centerY: 0.6740,
      latitude: 13.170450,
      longitude: 77.536100,
      description:
          'Central University Admissions, Registrar Office, Student Verification, and Academic Records.',
    ),
    BuildingBoundingBox(
      id: 'bld_h_block',
      name: 'H Block',
      label: 'H BLOCK',
      shortCode: 'PU-H-BLOCK',
      category: 'Academic',
      blockLetter: 'H',
      minX: 0.280,
      maxX: 0.380,
      minY: 0.691,
      maxY: 0.726,
      centerX: 0.3300,
      centerY: 0.7085,
      latitude: 13.170220,
      longitude: 77.536100,
      description:
          'School of Electrical Engineering, Power Systems Lab, and Applied Sciences.',
    ),
    BuildingBoundingBox(
      id: 'bld_hr_block',
      name: 'HR Block',
      label: 'HR BLOCK',
      shortCode: 'PU-HR-BLOCK',
      category: 'Administrative',
      blockLetter: 'HR',
      minX: 0.400,
      maxX: 0.495,
      minY: 0.648,
      maxY: 0.726,
      centerX: 0.4475,
      centerY: 0.6870,
      latitude: 13.16902003202503,
      longitude: 77.5348155778984,
      description:
          'Central Administrative Headquarters, Human Resources Directorate, Executive Boardrooms, and Chancellor Secretariat.',
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

  static const List<Offset> mainToHrCenterline = [
    Offset(0.5740, 0.2405), // Main Gate
    Offset(0.5760, 0.2518),
    Offset(0.5790, 0.2637),
    Offset(0.5800, 0.2778),
    Offset(0.5760, 0.2954),
    Offset(0.5660, 0.3200), // Along west of Main Lawn
    Offset(0.5530, 0.3481),
    Offset(0.5400, 0.3762),
    Offset(0.5280, 0.4044),
    Offset(0.5160, 0.4325),
    Offset(0.5060, 0.4606),
    Offset(0.4970, 0.4887),
    Offset(0.4910, 0.5134), // Bus boarding bay
    Offset(0.4860, 0.5345),
    Offset(0.4800, 0.5499),
    Offset(0.4620, 0.5661), // Fountain curve
    Offset(0.4550, 0.5900),
    Offset(0.4480, 0.6200),
    Offset(0.4420, 0.6500),
    Offset(0.4350, 0.6800), // HR Block / Plaza Entrance
  ];

  static const List<Offset> mainToHCenterline = [
    Offset(0.5740, 0.2405), // Main Gate
    Offset(0.5760, 0.2518),
    Offset(0.5790, 0.2637),
    Offset(0.5800, 0.2778),
    Offset(0.5760, 0.2954),
    Offset(0.5660, 0.3200), // Along west of Main Lawn
    Offset(0.5530, 0.3481),
    Offset(0.5400, 0.3762),
    Offset(0.5280, 0.4044),
    Offset(0.5000, 0.4600),
    Offset(0.4600, 0.5400),
    Offset(0.4100, 0.6200),
    Offset(0.3650, 0.6800), // Turn into H Block Avenue
    Offset(0.3350, 0.7050), // H Block Entrance Door
  ];

  /// Convert GPS Coordinates (lat, lng) to normalized Master Map Offset (0..1, 0..1)
  /// using the calibrated affine transformation from Web MasterCampusMap.jsx
  static Offset projectGpsToNormalized(double lat, double lng) {
    // Pinpoint landmark matching
    for (final b in campusBuildings) {
      final dLat = (b.latitude - lat).abs();
      final dLng = (b.longitude - lng).abs();
      if (dLat < 0.00015 && dLng < 0.00015) {
        return Offset(b.centerX, b.centerY);
      }
    }

    // Official Presidency University Master Campus Map projection bounds
    const minLat = 13.1688;
    const maxLat = 13.1720;
    const minLng = 77.5352;
    const maxLng = 77.5372;
    final clampedLat = lat.clamp(minLat, maxLat);
    final clampedLng = lng.clamp(minLng, maxLng);
    final normY = 0.22 + (maxLat - clampedLat) / (maxLat - minLat) * (0.93 - 0.22);
    final normX = 0.18 + (clampedLng - minLng) / (maxLng - minLng) * (0.76 - 0.18);
    return Offset(normX.clamp(0.05, 0.95), normY.clamp(0.05, 0.95));
  }

  /// Project entire NavigationRoute into normalized Master Campus Map points
  /// 100% matched with Web MasterCampusMap.jsx
  static List<Offset> projectRouteToNormalized(NavigationRoute route) {
    final startLower = route.startName.toLowerCase();
    final endLower = route.endName.toLowerCase();

    // 1. Surveyed Main Gate <-> D Block Corridor
    final isMainGateStart = startLower.contains('main gate') || route.routeId.contains('main_gate');
    final isDBlockEnd = endLower.contains('d block') || route.routeId.contains('d_block');
    if (isMainGateStart && isDBlockEnd) {
      return mainToDCenterline;
    }
    if (startLower.contains('d block') && endLower.contains('main gate')) {
      return mainToDCenterline.reversed.toList();
    }

    // 2. Surveyed D Block <-> E Block Walkway
    final isDBlockStart = startLower.contains('d block');
    final isEBlockEnd = endLower.contains('e block');
    if (isDBlockStart && isEBlockEnd) {
      return dToECenterline;
    }
    if (startLower.contains('e block') && endLower.contains('d block')) {
      return dToECenterline.reversed.toList();
    }

    // 3. Surveyed E Block <-> F Block Walkway
    final isEBlockStart = startLower.contains('e block');
    final isFBlockEnd = endLower.contains('f block');
    if (isEBlockStart && isFBlockEnd) {
      return eToFCenterline;
    }
    if (startLower.contains('f block') && endLower.contains('e block')) {
      return eToFCenterline.reversed.toList();
    }

    // 4A. Surveyed Main Gate <-> H Block (School of EE / Direct Campus Schematic Block)
    final isHBlockEnd = (endLower.contains('h block') ||
            endLower.contains('pu-h-block') ||
            route.routeId.contains('h_block')) &&
        !endLower.contains('hr block') &&
        !endLower.contains('hr blocks');
    if (isMainGateStart && isHBlockEnd) {
      return mainToHCenterline;
    }
    final isHBlockStart = (startLower.contains('h block') ||
            startLower.contains('pu-h-block') ||
            route.routeId.contains('h_block')) &&
        !startLower.contains('hr block') &&
        !startLower.contains('hr blocks');
    if (isHBlockStart && endLower.contains('main gate')) {
      return mainToHCenterline.reversed.toList();
    }

    // 4B. Surveyed Main Gate <-> HR Block / Plaza
    final isHrBlockEnd = endLower.contains('hr block') ||
        endLower.contains('hr blocks') ||
        endLower.contains('pu-hr-block') ||
        route.routeId.contains('hr_block');
    if (isMainGateStart && isHrBlockEnd) {
      return mainToHrCenterline;
    }
    final isHrBlockStart = startLower.contains('hr block') ||
        startLower.contains('hr blocks') ||
        startLower.contains('pu-hr-block') ||
        route.routeId.contains('hr_block');
    if (isHrBlockStart && endLower.contains('main gate')) {
      return mainToHrCenterline.reversed.toList();
    }

    // 5. Surveyed Main Gate <-> Central Fountain
    final isFountainEnd = endLower.contains('fountain') || route.routeId.contains('fountain');
    if (isMainGateStart && isFountainEnd) {
      return mainToDCenterline.sublist(0, 16);
    }
    if (startLower.contains('fountain') && endLower.contains('main gate')) {
      return mainToDCenterline.sublist(0, 16).reversed.toList();
    }

    // 6. Project from nodeSequence if available (Exact match with Web MasterCampusMap.jsx)
    final pts = <Offset>[];
    if (route.nodeSequence.isNotEmpty) {
      for (int i = 0; i < route.nodeSequence.length; i++) {
        final nodeId = route.nodeSequence[i];
        if (nodeNormalizedCoords.containsKey(nodeId)) {
          pts.add(nodeNormalizedCoords[nodeId]!);
        } else if (i < route.geometry.length) {
          pts.add(projectGpsToNormalized(route.geometry[i][0], route.geometry[i][1]));
        }
      }
    } else if (route.geometry.isNotEmpty) {
      for (final coord in route.geometry) {
        pts.add(projectGpsToNormalized(coord[0], coord[1]));
      }
    }

    // 7. Fallback between start & destination building centroids
    if (pts.length < 2) {
      final startBld = campusBuildings.firstWhere(
        (b) =>
            startLower.contains(b.name.toLowerCase()) ||
            (b.blockLetter.isNotEmpty &&
                startLower.contains('${b.blockLetter.toLowerCase()} block')),
        orElse: () => campusBuildings.last, // Main Gate
      );
      final endBld = campusBuildings.firstWhere(
        (b) =>
            endLower.contains(b.name.toLowerCase()) ||
            (b.blockLetter.isNotEmpty &&
                endLower.contains('${b.blockLetter.toLowerCase()} block')),
        orElse: () => campusBuildings.first, // D Block
      );

      // Connect via central avenue corridor
      return [
        Offset(startBld.centerX, startBld.centerY),
        const Offset(0.4666, 0.5995), // Central Fountain
        Offset(endBld.centerX, endBld.centerY),
      ];
    }

    return pts;
  }

  /// Get normalized starting point Offset on the Master Campus Map
  static Offset getStartNormalizedPoint(NavigationRoute route) {
    final projected = projectRouteToNormalized(route);
    if (projected.isNotEmpty) return projected.first;
    if (route.startLatitude != null && route.startLongitude != null) {
      return projectGpsToNormalized(route.startLatitude!, route.startLongitude!);
    }
    return const Offset(0.5740, 0.2405); // Default to Main Gate
  }

  /// Get normalized destination point Offset on the Master Campus Map
  static Offset getEndNormalizedPoint(NavigationRoute route) {
    final projected = projectRouteToNormalized(route);
    if (projected.isNotEmpty) return projected.last;
    if (route.endLatitude != null && route.endLongitude != null) {
      return projectGpsToNormalized(route.endLatitude!, route.endLongitude!);
    }
    return const Offset(0.2450, 0.6428); // Default to D Block
  }
}
