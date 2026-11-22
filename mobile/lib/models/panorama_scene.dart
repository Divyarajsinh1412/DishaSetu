class PanoramaHotspot {
  final String hotspotId;
  final String sceneId;
  final String locationId;
  final String buildingShortCode;
  final double yaw;
  final double pitch;
  final String title;
  final String description;
  final String hotspotType;
  final String colorHex;

  const PanoramaHotspot({
    required this.hotspotId,
    required this.sceneId,
    required this.locationId,
    required this.buildingShortCode,
    required this.yaw,
    required this.pitch,
    required this.title,
    required this.description,
    this.hotspotType = 'building',
    this.colorHex = '#38bdf8',
  });

  factory PanoramaHotspot.fromJson(Map<String, dynamic> json) {
    return PanoramaHotspot(
      hotspotId: json['hotspotId'] ?? '',
      sceneId: json['sceneId'] ?? '',
      locationId: json['locationId'] ?? '',
      buildingShortCode: json['buildingShortCode'] ?? '',
      yaw: (json['yaw'] as num?)?.toDouble() ?? 0.0,
      pitch: (json['pitch'] as num?)?.toDouble() ?? 0.0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      hotspotType: json['hotspotType'] ?? 'building',
      colorHex: json['color'] ?? '#38bdf8',
    );
  }
}

class PanoramaScene {
  final String sceneId;
  final String sceneName;
  final String sceneType;
  final String locationId;
  final double initialYaw;
  final double initialPitch;
  final double altitudeMeters;
  final String description;
  final String panoramaAsset;
  final List<PanoramaHotspot> hotspots;

  const PanoramaScene({
    required this.sceneId,
    required this.sceneName,
    this.sceneType = 'aerial_360',
    required this.locationId,
    this.initialYaw = 0.0,
    this.initialPitch = -10.0,
    required this.altitudeMeters,
    required this.description,
    required this.panoramaAsset,
    this.hotspots = const [],
  });

  static List<PanoramaScene> getPreloadedScenes() {
    return const [
      PanoramaScene(
        sceneId: 'scene_central_campus_aerial',
        sceneName: 'Central Campus Overview',
        locationId: 'loc_fountain',
        initialYaw: 10,
        initialPitch: -12,
        altitudeMeters: 140,
        description: 'Breathtaking 360° aerial vista overlooking Presidency University academic blocks, Central Fountain, and campus avenues.',
        panoramaAsset: 'assets/aerial_central_campus.png',
        hotspots: [
          PanoramaHotspot(
            hotspotId: 'hs_central_d_block',
            sceneId: 'scene_central_campus_aerial',
            locationId: 'loc_d_block',
            buildingShortCode: 'PU-D-BLOCK',
            yaw: -32,
            pitch: -12,
            title: 'D Block (Mechanical & Civil Labs)',
            description: 'Engineering Mechanics, CAD/CAM, Robotics and Materials Testing Labs across Ground, First and Second floors.',
          ),
          PanoramaHotspot(
            hotspotId: 'hs_central_e_block',
            sceneId: 'scene_central_campus_aerial',
            locationId: 'loc_e_block',
            buildingShortCode: 'PU-E-BLOCK',
            yaw: -12,
            pitch: -9,
            title: 'E Block (School of CSE & AI)',
            description: 'Computer Science & AI classroom suites, 4 verified levels, Staff Rooms and Dean Office.',
          ),
          PanoramaHotspot(
            hotspotId: 'hs_central_f_block',
            sceneId: 'scene_central_campus_aerial',
            locationId: 'loc_f_block',
            buildingShortCode: 'PU-F-BLOCK',
            yaw: -48,
            pitch: -8,
            title: 'F Block (EEE & Electronics)',
            description: 'Electronics, Power Systems, Microprocessors, and advanced lecture halls.',
          ),
          PanoramaHotspot(
            hotspotId: 'hs_central_l_block',
            sceneId: 'scene_central_campus_aerial',
            locationId: 'loc_l_block',
            buildingShortCode: 'PU-L-BLOCK',
            yaw: 28,
            pitch: -14,
            title: 'L Block (Classrooms & Foundation)',
            description: 'Undergraduate core engineering classrooms and foundation sciences wing.',
          ),
          PanoramaHotspot(
            hotspotId: 'hs_central_fountain',
            sceneId: 'scene_central_campus_aerial',
            locationId: 'feat_fountain',
            buildingShortCode: 'PU-LM-FOUNTAIN',
            yaw: 0,
            pitch: -18,
            title: 'Central Fountain & Quadrangle',
            description: 'The iconic central roundabout and meeting hub connecting academic walkways.',
          ),
          PanoramaHotspot(
            hotspotId: 'hs_central_lawn',
            sceneId: 'scene_central_campus_aerial',
            locationId: 'feat_main_lawn',
            buildingShortCode: 'PU-LM-LAWN',
            yaw: 15,
            pitch: -15,
            title: 'Main Lawn',
            description: 'Lush green campus centerpiece surveyed with high-precision KML boundaries.',
          ),
        ],
      ),
      PanoramaScene(
        sceneId: 'scene_main_gate_aerial',
        sceneName: 'Main Gate & Arrival Avenue',
        locationId: 'loc_main_gate',
        initialYaw: 0,
        initialPitch: -10,
        altitudeMeters: 110,
        description: 'High-altitude panoramic view of Presidency University official entrance portal, two-wheeler parking lot, and paved pedestrian avenue.',
        panoramaAsset: 'assets/aerial_central_campus.png',
        hotspots: [
          PanoramaHotspot(
            hotspotId: 'hs_gate_entry',
            sceneId: 'scene_main_gate_aerial',
            locationId: 'node_main_gate',
            buildingShortCode: 'PU-GATE-01',
            yaw: 0,
            pitch: -20,
            title: 'Main Gate Upper Entrance',
            description: 'Primary vehicular and pedestrian access gateway to Presidency University.',
          ),
          PanoramaHotspot(
            hotspotId: 'hs_gate_parking',
            sceneId: 'scene_main_gate_aerial',
            locationId: 'node_parking_entry',
            buildingShortCode: 'PU-PARK-2W',
            yaw: 35,
            pitch: -15,
            title: 'Student 2-Wheeler Parking',
            description: 'Covered parking bays for student scooters and motorbikes.',
          ),
        ],
      ),
      PanoramaScene(
        sceneId: 'scene_academic_quad_aerial',
        sceneName: 'Academic Quadrangle & Library',
        locationId: 'loc_library',
        initialYaw: -15,
        initialPitch: -10,
        altitudeMeters: 125,
        description: 'Panoramic vista across School of Management, School of Law, Moot Court Hall, and Central University Library quadrangle.',
        panoramaAsset: 'assets/aerial_central_campus.png',
        hotspots: [
          PanoramaHotspot(
            hotspotId: 'hs_quad_library',
            sceneId: 'scene_academic_quad_aerial',
            locationId: 'feat_library',
            buildingShortCode: 'PU-FAC-LIB',
            yaw: -10,
            pitch: -15,
            title: 'Central University Library',
            description: 'Multi-storey knowledge centre with reading halls, digital repository and journal archives.',
          ),
          PanoramaHotspot(
            hotspotId: 'hs_quad_som',
            sceneId: 'scene_academic_quad_aerial',
            locationId: 'bld_mba_som',
            buildingShortCode: 'PU-MBA-SOM',
            yaw: 25,
            pitch: -12,
            title: 'School of Management (SOM)',
            description: 'Executive MBA lecture theatres, seminar rooms and conference suites.',
          ),
        ],
      ),
      PanoramaScene(
        sceneId: 'scene_sports_complex_aerial',
        sceneName: 'Sports Pavilion & Arena',
        locationId: 'loc_basketball',
        initialYaw: -10,
        initialPitch: -15,
        altitudeMeters: 105,
        description: 'Aerial vista of basketball court, volleyball arena, cricket nets, University Gym, Open Air Theatre (OAT), and lush lawns.',
        panoramaAsset: 'assets/aerial_central_campus.png',
        hotspots: [
          PanoramaHotspot(
            hotspotId: 'hs_sports_bb',
            sceneId: 'scene_sports_complex_aerial',
            locationId: 'feat_basketball',
            buildingShortCode: 'PU-SPORT-BB',
            yaw: -15,
            pitch: -18,
            title: 'Basketball Court',
            description: 'Standard FIBA outdoor floodlit court.',
          ),
          PanoramaHotspot(
            hotspotId: 'hs_sports_fb',
            sceneId: 'scene_sports_complex_aerial',
            locationId: 'feat_football',
            buildingShortCode: 'PU-SPORT-FB',
            yaw: 20,
            pitch: -14,
            title: 'Football Field & Cricket Pitch',
            description: 'Full-size football ground and practice turf wickets.',
          ),
        ],
      ),
      PanoramaScene(
        sceneId: 'scene_cafeteria_hub_aerial',
        sceneName: 'Food Court & Dining Plaza',
        locationId: 'loc_cafeteria',
        initialYaw: 0,
        initialPitch: -12,
        altitudeMeters: 95,
        description: 'Aerial hub covering Central Cafeteria, Campus Food Court plaza, dining pavilion, and landscaped student canopy.',
        panoramaAsset: 'assets/aerial_central_campus.png',
        hotspots: [
          PanoramaHotspot(
            hotspotId: 'hs_cafe_central',
            sceneId: 'scene_cafeteria_hub_aerial',
            locationId: 'feat_food_point_main',
            buildingShortCode: 'PU-CAFE-01',
            yaw: 0,
            pitch: -15,
            title: 'Central Food Court',
            description: 'South Indian breakfast, Thalis, fresh juices, and grab-and-go kiosk.',
          ),
          PanoramaHotspot(
            hotspotId: 'hs_cafe_hatti',
            sceneId: 'scene_cafeteria_hub_aerial',
            locationId: 'feat_food_d_block',
            buildingShortCode: 'PU-CAFE-D-BLOCK',
            yaw: -30,
            pitch: -14,
            title: 'Hatti Kaapi (D Block)',
            description: 'Authentic filter coffee, tea, and quick bites next to Engineering labs.',
          ),
        ],
      ),
    ];
  }
}
