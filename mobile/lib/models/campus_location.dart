class CampusLocation {
  final String id;
  final String name;
  final String? label;
  final String? shortCode;
  final String category;
  final String? description;
  final double latitude;
  final double longitude;
  final double imageX;
  final double imageY;
  final String? buildingId;
  final bool verified;

  CampusLocation({
    required this.id,
    required this.name,
    this.label,
    this.shortCode,
    required this.category,
    this.description,
    required this.latitude,
    required this.longitude,
    this.imageX = 0.5,
    this.imageY = 0.5,
    this.buildingId,
    this.verified = true,
  });

  factory CampusLocation.fromJson(Map<String, dynamic> json) {
    final coords = json['coordinates'] as Map<String, dynamic>? ?? {};
    final lat = (json['latitude'] as num?)?.toDouble() ??
        (coords['lat'] as num?)?.toDouble() ??
        13.1717995;
    final lng = (json['longitude'] as num?)?.toDouble() ??
        (coords['lng'] as num?)?.toDouble() ??
        77.5361915;

    final imgX = (json['imageX'] as num?)?.toDouble() ?? 0.5;
    final imgY = (json['imageY'] as num?)?.toDouble() ?? 0.5;

    return CampusLocation(
      id: json['markerId'] ?? json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      label: json['label'] ?? json['name'] ?? '',
      shortCode: json['shortCode'],
      category: json['category'] ?? 'Academic',
      description: json['description'],
      latitude: lat,
      longitude: lng,
      imageX: imgX,
      imageY: imgY,
      buildingId: json['buildingId'],
      verified: json['verified'] ?? true,
    );
  }
}
