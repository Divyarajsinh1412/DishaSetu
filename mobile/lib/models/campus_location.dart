class CampusLocation {
  final String id;
  final String name;
  final String? shortCode;
  final String category;
  final String? description;
  final double latitude;
  final double longitude;
  final bool verified;

  CampusLocation({
    required this.id,
    required this.name,
    this.shortCode,
    required this.category,
    this.description,
    required this.latitude,
    required this.longitude,
    this.verified = true,
  });

  factory CampusLocation.fromJson(Map<String, dynamic> json) {
    final coords = json['coordinates'] as Map<String, dynamic>? ?? {};
    return CampusLocation(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      shortCode: json['shortCode'],
      category: json['category'] ?? 'General',
      description: json['description'],
      latitude: (coords['lat'] as num?)?.toDouble() ?? 13.1717995,
      longitude: (coords['lng'] as num?)?.toDouble() ?? 77.5361915,
      verified: json['verified'] ?? true,
    );
  }
}
