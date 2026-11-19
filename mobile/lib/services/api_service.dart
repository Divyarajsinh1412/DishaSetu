import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/campus_location.dart';
import '../models/navigation_route.dart';

class ApiService {
  // Standard Android emulator loopback host for Node.js server
  static const String defaultBaseUrl = 'http://10.0.2.2:5000/api';
  final String baseUrl;

  ApiService({this.baseUrl = defaultBaseUrl});

  /// Fetch official Presidency Master Map Markers (Task 2 & 4)
  Future<List<CampusLocation>> fetchMapMarkers() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/map-markers'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['markers'] != null) {
          final list = data['markers'] as List;
          return list.map((item) => CampusLocation.fromJson(item)).toList();
        }
      }
    } catch (_) {}

    return getOfficialMasterMapMarkersFallback();
  }

  Future<List<CampusLocation>> fetchLocations() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/locations')).timeout(
        const Duration(seconds: 4),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final list = data['data'] as List;
          return list.map((item) => CampusLocation.fromJson(item)).toList();
        }
      }
    } catch (_) {}

    return fetchMapMarkers();
  }

  Future<NavigationRoute?> calculateRoute({
    required String start,
    required String destination,
    bool accessibleOnly = false,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/navigation/route'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'start': start,
              'destination': destination,
              'accessibleOnly': accessibleOnly,
            }),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          return NavigationRoute.fromJson(data['data']);
        }
      }
    } catch (_) {}

    // Default offline route: Main Gate to D Block
    return NavigationRoute(
      routeId: 'route_offline_default',
      startName: 'Presidency University – Main Gate',
      endName: 'D Block',
      distanceMeters: 197,
      estimatedWalkingMinutes: 3,
      accessible: true,
      geometry: [
        [13.1717995, 77.5361915],
        [13.1716861, 77.5361922],
        [13.1713404, 77.5362505],
        [13.1712020, 77.5360316],
        [13.1710208, 77.5360690],
        [13.1709093, 77.5357768],
        [13.1708210, 77.5359618],
        [13.1705630, 77.5355730],
        [13.1705500, 77.5356100],
      ],
      waypoints: [
        RouteWaypoint(
          stepIndex: 1,
          instruction: 'Start at Main Gate, head South along Main Gate Arrival Walkway.',
          distanceMeters: 13,
          bearing: 180,
          turnType: 'depart',
        ),
        RouteWaypoint(
          stepIndex: 2,
          instruction: 'At Avenue Junction, continue straight towards D Block.',
          distanceMeters: 184,
          bearing: 185,
          turnType: 'straight',
        ),
        RouteWaypoint(
          stepIndex: 3,
          instruction: 'Arrive at destination: D Block (Mechanical & Civil).',
          distanceMeters: 0,
          bearing: 185,
          turnType: 'arrive',
        ),
      ],
    );
  }

  /// Campus Dining & Cafes API (Rule 3)
  Future<List<dynamic>> fetchCafes() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/cafes'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['cafes'] as List<dynamic>? ?? [];
      }
    } catch (_) {}
    return [];
  }

  /// Submit Campus Obstacle / Navigation Helpdesk Report (Rule 3)
  Future<Map<String, dynamic>?> submitIssueReport(Map<String, dynamic> reportData) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/issues'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode(reportData),
          )
          .timeout(const Duration(seconds: 5));
      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body) as Map<String, dynamic>;
      }
    } catch (_) {}
    return null;
  }

  /// Calibrated Fallback Markers matching official Presidency University Master Campus Map
  static List<CampusLocation> getOfficialMasterMapMarkersFallback() {
    return [
      CampusLocation(id: 'marker_main_gate', name: 'Main Gate', label: 'MAIN GATE', category: 'Gate', shortCode: 'PU-GATE-MAIN', imageX: 0.5695, imageY: 0.2449, latitude: 13.1717995, longitude: 77.5361915),
      CampusLocation(id: 'marker_entry_exit', name: 'Entry / Exit', label: 'ENTRY / EXIT', category: 'Gate', shortCode: 'PU-GATE-ENTRY', imageX: 0.5077, imageY: 0.2111, latitude: 13.17215, longitude: 77.53605),
      CampusLocation(id: 'marker_gate_2', name: 'Gate 2', label: 'GATE 2', category: 'Gate', shortCode: 'PU-GATE-02', imageX: 0.7290, imageY: 0.1930, latitude: 13.17228, longitude: 77.53738),
      CampusLocation(id: 'marker_main_student_parking', name: 'Main Student Parking', label: 'MAIN STUDENT PARKING', category: 'Parking', shortCode: 'PU-PARK-STU-MAIN', imageX: 0.4631, imageY: 0.1025, latitude: 13.17285, longitude: 77.53595),
      CampusLocation(id: 'marker_student_2w_parking', name: 'Student 2 Wheeler Parking', label: 'STUDENT 2 WHEELER PARKING', category: 'Parking', shortCode: 'PU-PARK-STU-2W', imageX: 0.4974, imageY: 0.2593, latitude: 13.171746, longitude: 77.53554),
      CampusLocation(id: 'marker_visitor_parking', name: 'Visitor Parking', label: 'VISTOR PARKING', category: 'Parking', shortCode: 'PU-PARK-VISITOR', imageX: 0.6432, imageY: 0.2111, latitude: 13.17205, longitude: 77.53675),
      CampusLocation(id: 'marker_main_lawn', name: 'Main Lawn', label: 'MAIN LAWN', category: 'Garden', shortCode: 'PU-LAWN-MAIN', imageX: 0.5918, imageY: 0.4403, latitude: 13.17049, longitude: 77.53632),
      CampusLocation(id: 'marker_fountain', name: 'Campus Central Fountain', label: 'FOUNTAIN', category: 'Landmark', shortCode: 'PU-FOUNTAIN', imageX: 0.4666, imageY: 0.5995, latitude: 13.169277, longitude: 77.534963),
      CampusLocation(id: 'marker_football_court', name: 'Football Court', label: 'FOOT - BALL COURT', category: 'Sports', shortCode: 'PU-FOOTBALL', imageX: 0.4117, imageY: 0.3679, latitude: 13.17095, longitude: 77.53512),
      CampusLocation(id: 'marker_volleyball_nets', name: 'Volley - Ball Nets', label: 'VOLLEY - BALL NETS', category: 'Sports', shortCode: 'PU-VOLLEY', imageX: 0.3087, imageY: 0.4765, latitude: 13.17032, longitude: 77.53455),
      CampusLocation(id: 'marker_basketball_court', name: 'Basket Ball Court', label: 'BASKET BALL COURT', category: 'Sports', shortCode: 'PU-BASKET', imageX: 0.1973, imageY: 0.5428, latitude: 13.16982, longitude: 77.53402),
      CampusLocation(id: 'marker_cricket_nets', name: 'Cricket Nets', label: 'CRICKET NETS', category: 'Sports', shortCode: 'PU-CRICKET', imageX: 0.3173, imageY: 0.5428, latitude: 13.16982, longitude: 77.53462),
      CampusLocation(id: 'marker_d_block', name: 'D Block', label: 'D BLOCK', category: 'Academic', buildingId: 'bld_d_block', shortCode: 'PU-D-BLOCK', imageX: 0.2041, imageY: 0.6478, latitude: 13.17055, longitude: 77.53561),
      CampusLocation(id: 'marker_e_block', name: 'E Block', label: 'E BLOCK', category: 'Academic', buildingId: 'bld_e_block', shortCode: 'PU-E-BLOCK', imageX: 0.2024, imageY: 0.6972, latitude: 13.17005, longitude: 77.53542),
      CampusLocation(id: 'marker_f_block', name: 'F Block', label: 'F BLOCK', category: 'Academic', buildingId: 'bld_f_block', shortCode: 'PU-F-BLOCK', imageX: 0.2024, imageY: 0.7491, latitude: 13.16952, longitude: 77.53528),
      CampusLocation(id: 'marker_l_block', name: 'L Block', label: 'L BLOCK', category: 'Academic', buildingId: 'bld_l_block', shortCode: 'PU-L-BLOCK', imageX: 0.1990, imageY: 0.8022, latitude: 13.16898, longitude: 77.53515),
      CampusLocation(id: 'marker_h_block', name: 'H Block', label: 'H BLOCK', category: 'Academic', buildingId: 'bld_h_block', shortCode: 'PU-H-BLOCK', imageX: 0.3310, imageY: 0.7081, latitude: 13.16898, longitude: 77.53482),
      CampusLocation(id: 'marker_j_block', name: 'J Block', label: 'J BLOCK', category: 'Academic', buildingId: 'bld_j_block', shortCode: 'PU-J-BLOCK', imageX: 0.3122, imageY: 0.7382, latitude: 13.16875, longitude: 77.53468),
      CampusLocation(id: 'marker_k_block', name: 'K Block', label: 'K BLOCK', category: 'Academic', buildingId: 'bld_k_block', shortCode: 'PU-K-BLOCK', imageX: 0.3431, imageY: 0.7575, latitude: 13.16868, longitude: 77.53492),
      CampusLocation(id: 'marker_n_block', name: 'N Block', label: 'N BLOCK', category: 'Academic', buildingId: 'bld_n_block', shortCode: 'PU-N-BLOCK', imageX: 0.3173, imageY: 0.7949, latitude: 13.16828, longitude: 77.53480),
      CampusLocation(id: 'marker_p_block', name: 'P Block', label: 'P BLOCK', category: 'Academic', buildingId: 'bld_p_block', shortCode: 'PU-P-BLOCK', imageX: 0.3431, imageY: 0.8372, latitude: 13.16798, longitude: 77.53492),
      CampusLocation(id: 'marker_q_block', name: 'Q Block', label: 'Q BLOCK', category: 'Academic', buildingId: 'bld_q_block', shortCode: 'PU-Q-BLOCK', imageX: 0.3036, imageY: 0.8733, latitude: 13.16768, longitude: 77.53468),
      CampusLocation(id: 'marker_r_block', name: 'R Block', label: 'R BLOCK', category: 'Academic', buildingId: 'bld_r_block', shortCode: 'PU-R-BLOCK', imageX: 0.3310, imageY: 0.9011, latitude: 13.16745, longitude: 77.53488),
      CampusLocation(id: 'marker_s_block', name: 'S Block', label: 'S BLOCK', category: 'Academic', buildingId: 'bld_s_block', shortCode: 'PU-S-BLOCK', imageX: 0.2470, imageY: 0.8938, latitude: 13.16765, longitude: 77.53438),
      CampusLocation(id: 'marker_u_block', name: 'U Block', label: 'U BLOCK', category: 'Academic', buildingId: 'bld_u_block', shortCode: 'PU-U-BLOCK', imageX: 0.2950, imageY: 0.9276, latitude: 13.16718, longitude: 77.53478),
      CampusLocation(id: 'marker_hr_block', name: 'HR Block', label: 'HR BLOCK', category: 'Academic', buildingId: 'bld_hr_block', shortCode: 'PU-HR-BLOCK', imageX: 0.4374, imageY: 0.6755, latitude: 13.16900, longitude: 77.53545),
      CampusLocation(id: 'marker_coe', name: 'COE', label: 'COE', category: 'Academic', shortCode: 'PU-COE', imageX: 0.4786, imageY: 0.7093, latitude: 13.16872, longitude: 77.53565),
      CampusLocation(id: 'marker_dsa', name: 'DSA', label: 'DSA', category: 'Academic', shortCode: 'PU-DSA', imageX: 0.5249, imageY: 0.7238, latitude: 13.16858, longitude: 77.53582),
      CampusLocation(id: 'marker_mba_som_block', name: 'MBA/SOM Block', label: 'MBA/SOM BLOCK', category: 'Academic', buildingId: 'bld_som_block', shortCode: 'PU-SOM-BLOCK', imageX: 0.6329, imageY: 0.7189, latitude: 13.16862, longitude: 77.53642),
      CampusLocation(id: 'marker_auditorium', name: 'Auditorium', label: 'AUDITORIUM', category: 'Academic', shortCode: 'PU-AUDI-MAIN', imageX: 0.7221, imageY: 0.6815, latitude: 13.16868, longitude: 77.53712),
      CampusLocation(id: 'marker_hatti_kappi', name: 'Hatti Kappi', label: 'HATTI KAPPI', category: 'Cafe', shortCode: 'PU-CAFE-D-BLOCK', imageX: 0.3100, imageY: 0.6180, latitude: 13.16912, longitude: 77.53540, description: 'Authentic Traditional South Indian Filter Kaapi & Tiffin near D Block'),
      CampusLocation(id: 'marker_hostel_mess', name: 'Hostel Mess', label: 'HOSTEL MESS', category: 'Cafe', shortCode: 'PU-MESS-HOSTEL', imageX: 0.6947, imageY: 0.5428, latitude: 13.16948, longitude: 77.53692),
      CampusLocation(id: 'marker_library', name: 'Library', label: 'LIBRARY', category: 'Library', shortCode: 'PU-LIB-MAIN', imageX: 0.5626, imageY: 0.6755, latitude: 13.16902, longitude: 77.53605),
      CampusLocation(id: 'marker_medical_room', name: 'Medical Room', label: 'MEDICAL ROOM', category: 'Medical', shortCode: 'PU-HEALTH', imageX: 0.5883, imageY: 0.6695, latitude: 13.16908, longitude: 77.53622),
    ];
  }
}
