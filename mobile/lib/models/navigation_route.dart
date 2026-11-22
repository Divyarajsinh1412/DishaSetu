class RouteWaypoint {
  final int stepIndex;
  final String instruction;
  final int distanceMeters;
  final int bearing;
  final String turnType;
  final String? landmark;

  RouteWaypoint({
    required this.stepIndex,
    required this.instruction,
    required this.distanceMeters,
    required this.bearing,
    required this.turnType,
    this.landmark,
  });

  factory RouteWaypoint.fromJson(Map<String, dynamic> json) {
    return RouteWaypoint(
      stepIndex: json['stepIndex'] ?? 1,
      instruction: json['instruction'] ?? '',
      distanceMeters: json['distanceMeters'] ?? 0,
      bearing: json['bearing'] ?? 0,
      turnType: json['turnType'] ?? 'straight',
      landmark: json['landmark'],
    );
  }
}

class NavigationRoute {
  final String routeId;
  final String startName;
  final String endName;
  final int distanceMeters;
  final int estimatedWalkingMinutes;
  final bool accessible;
  final List<List<double>> geometry;
  final List<RouteWaypoint> waypoints;

  NavigationRoute({
    required this.routeId,
    required this.startName,
    required this.endName,
    required this.distanceMeters,
    required this.estimatedWalkingMinutes,
    required this.accessible,
    required this.geometry,
    required this.waypoints,
  });

  int get totalDistanceMeters => distanceMeters;

  factory NavigationRoute.fromJson(Map<String, dynamic> json) {
    final rawGeom = json['geometry'] as List? ?? [];
    final geomList = rawGeom.map((item) {
      if (item is List) {
        return [(item[0] as num).toDouble(), (item[1] as num).toDouble()];
      }
      return [13.1717995, 77.5361915];
    }).toList();

    final rawSteps = json['waypoints'] as List? ?? [];
    final stepsList = rawSteps
        .map((item) => RouteWaypoint.fromJson(item as Map<String, dynamic>))
        .toList();

    final startLoc = json['startLocation'] as Map<String, dynamic>? ?? {};
    final endLoc = json['endLocation'] as Map<String, dynamic>? ?? {};

    return NavigationRoute(
      routeId: json['routeId'] ?? '',
      startName: startLoc['name'] ?? 'Start',
      endName: endLoc['name'] ?? 'Destination',
      distanceMeters: json['distanceMeters'] ?? 0,
      estimatedWalkingMinutes: json['estimatedWalkingMinutes'] ?? 1,
      accessible: json['accessible'] ?? true,
      geometry: geomList,
      waypoints: stepsList,
    );
  }
}
