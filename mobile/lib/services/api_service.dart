import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/campus_location.dart';
import '../models/navigation_route.dart';

class ApiService {
  // Standard Android emulator loopback host for Node.js server
  static const String defaultBaseUrl = 'http://10.0.2.2:5000/api';
  final String baseUrl;

  ApiService({this.baseUrl = defaultBaseUrl});

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
    } catch (_) {
      // Fallback handled below
    }

    // Verified offline fallback dataset (Presidency University)
    return [
      CampusLocation(
        id: 'main_gate',
        name: 'Presidency University – Main Gate',
        shortCode: 'PU-GATE-MAIN',
        category: 'Gate',
        description: 'Main campus entrance gate and arrival portal.',
        latitude: 13.1717995,
        longitude: 77.5361915,
      ),
      CampusLocation(
        id: 'fountain',
        name: 'Campus Central Fountain',
        shortCode: 'PU-FOUNTAIN-01',
        category: 'Landmark',
        description: 'Central decorative water fountain landmark.',
        latitude: 13.169277162668132,
        longitude: 77.53496327115832,
      ),
      CampusLocation(
        id: 'parking_entry',
        name: 'Two-Wheeler Parking Entry',
        shortCode: 'PU-PARK-2W',
        category: 'Parking',
        description: 'Designated vehicular access span for student two-wheelers.',
        latitude: 13.171746,
        longitude: 77.53554,
      ),
      CampusLocation(
        id: 'campus_garden',
        name: 'Presidency Campus Central Garden',
        shortCode: 'PU-GARDEN-01',
        category: 'Garden',
        description: 'Lush landscaped green garden along the avenue corridor.',
        latitude: 13.17049286550813,
        longitude: 77.53578670581075,
      ),
    ];
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
    } catch (_) {
      // Fallback handled below
    }

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

  /// Tomorrow's Field GPS Survey Mobile Capture API
  Future<bool> captureGpsSurvey({
    required String locationId,
    required double lat,
    required double lng,
    double? gpsAccuracy,
    String surveyorName = 'Field Mobile Surveyor',
    String surveyNotes = '',
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/survey/capture'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'locationId': locationId,
              'lat': lat,
              'lng': lng,
              'gpsAccuracy': gpsAccuracy,
              'surveyorName': surveyorName,
              'surveyNotes': surveyNotes,
              'surveyMethod': 'mobile_gps',
            }),
          )
          .timeout(const Duration(seconds: 5));

      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Multi-Floor Indoor Navigation Route API
  Future<Map<String, dynamic>?> calculateIndoorRoute({
    required String buildingId,
    String? startNodeId,
    String? destRoomId,
    bool accessibleOnly = false,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/indoor/route'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'buildingId': buildingId,
              'startNodeId': startNodeId,
              'destRoomId': destRoomId,
              'accessibleOnly': accessibleOnly,
            }),
          )
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['data'] as Map<String, dynamic>;
        }
      }
    } catch (_) {
      // Handled gracefully
    }
    return null;
  }
}
