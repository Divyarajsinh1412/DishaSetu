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
  final String? startNodeId;
  final String? endNodeId;
  final String? startLocationId;
  final String? endLocationId;
  final List<double>? startCoordinates;
  final List<double>? endCoordinates;
  final int distanceMeters;
  final int estimatedWalkingMinutes;
  final bool accessible;
  final List<List<double>> geometry;
  final List<String> nodeSequence;
  final List<RouteWaypoint> waypoints;

  NavigationRoute({
    required this.routeId,
    required this.startName,
    required this.endName,
    this.startNodeId,
    this.endNodeId,
    this.startLocationId,
    this.endLocationId,
    this.startCoordinates,
    this.endCoordinates,
    required this.distanceMeters,
    required this.estimatedWalkingMinutes,
    required this.accessible,
    required this.geometry,
    this.nodeSequence = const [],
    required this.waypoints,
  });

  int get totalDistanceMeters => distanceMeters;

  double? get startLatitude => startCoordinates != null && startCoordinates!.isNotEmpty
      ? startCoordinates![0]
      : (geometry.isNotEmpty ? geometry.first[0] : null);

  double? get startLongitude => startCoordinates != null && startCoordinates!.length > 1
      ? startCoordinates![1]
      : (geometry.isNotEmpty ? geometry.first[1] : null);

  double? get endLatitude => endCoordinates != null && endCoordinates!.isNotEmpty
      ? endCoordinates![0]
      : (geometry.isNotEmpty ? geometry.last[0] : null);

  double? get endLongitude => endCoordinates != null && endCoordinates!.length > 1
      ? endCoordinates![1]
      : (geometry.isNotEmpty ? geometry.last[1] : null);

  factory NavigationRoute.fromJson(Map<String, dynamic> json) {
    final rawGeom = json['geometry'] as List? ?? [];
    final geomList = rawGeom.map((item) {
      if (item is List && item.length >= 2) {
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
    final startNode = json['startNode'] as Map<String, dynamic>? ?? {};
    final endNode = json['endNode'] as Map<String, dynamic>? ?? {};

    // Extract start coordinates from startNode, startLocation, or geometry[0]
    List<double>? startCoords;
    if (startNode['coordinates'] != null) {
      final c = startNode['coordinates'];
      if (c is List && c.length >= 2) {
        startCoords = [(c[0] as num).toDouble(), (c[1] as num).toDouble()];
      } else if (c is Map && c['lat'] != null && c['lng'] != null) {
        startCoords = [(c['lat'] as num).toDouble(), (c['lng'] as num).toDouble()];
      }
    } else if (startLoc['coordinates'] != null) {
      final c = startLoc['coordinates'];
      if (c is Map && c['lat'] != null && c['lng'] != null) {
        startCoords = [(c['lat'] as num).toDouble(), (c['lng'] as num).toDouble()];
      } else if (c is List && c.length >= 2) {
        startCoords = [(c[0] as num).toDouble(), (c[1] as num).toDouble()];
      }
    }
    if (startCoords == null && geomList.isNotEmpty) {
      startCoords = geomList.first;
    }

    // Extract end coordinates from endNode, endLocation, or geometry.last
    List<double>? endCoords;
    if (endNode['coordinates'] != null) {
      final c = endNode['coordinates'];
      if (c is List && c.length >= 2) {
        endCoords = [(c[0] as num).toDouble(), (c[1] as num).toDouble()];
      } else if (c is Map && c['lat'] != null && c['lng'] != null) {
        endCoords = [(c['lat'] as num).toDouble(), (c['lng'] as num).toDouble()];
      }
    } else if (endLoc['coordinates'] != null) {
      final c = endLoc['coordinates'];
      if (c is Map && c['lat'] != null && c['lng'] != null) {
        endCoords = [(c['lat'] as num).toDouble(), (c['lng'] as num).toDouble()];
      } else if (c is List && c.length >= 2) {
        endCoords = [(c[0] as num).toDouble(), (c[1] as num).toDouble()];
      }
    }
    if (endCoords == null && geomList.isNotEmpty) {
      endCoords = geomList.last;
    }

    final rawNodes = json['nodeSequence'] as List? ?? [];
    final nodesList = rawNodes.map((n) => n.toString()).toList();

    return NavigationRoute(
      routeId: json['routeId'] ?? '',
      startName: startLoc['name'] ?? startNode['name'] ?? 'Start',
      endName: endLoc['name'] ?? endNode['name'] ?? 'Destination',
      startNodeId: startNode['nodeId']?.toString(),
      endNodeId: endNode['nodeId']?.toString(),
      startLocationId: json['startLocationId']?.toString(),
      endLocationId: json['endLocationId']?.toString(),
      startCoordinates: startCoords,
      endCoordinates: endCoords,
      distanceMeters: json['distanceMeters'] ?? 0,
      estimatedWalkingMinutes: json['estimatedWalkingMinutes'] ?? 1,
      accessible: json['accessible'] ?? true,
      geometry: geomList,
      nodeSequence: nodesList,
      waypoints: stepsList,
    );
  }
}
