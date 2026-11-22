class Building {
  final String buildingId;
  final String name;
  final String shortCode;
  final String blockLetter;
  final String category;
  final String description;
  final int totalFloors;
  final String roomType; // 'Laboratory' for D block, 'Classroom' for others
  final List<String> departments;
  final double latitude;
  final double longitude;

  Building({
    required this.buildingId,
    required this.name,
    required this.shortCode,
    required this.blockLetter,
    this.category = 'Academic',
    this.description = '',
    this.totalFloors = 3,
    this.roomType = 'Classroom',
    this.departments = const [],
    this.latitude = 13.170600,
    this.longitude = 77.535800,
  });

  bool get isDBlock => blockLetter.toUpperCase() == 'D' || buildingId.contains('d_block');
  String get id => buildingId;
  String get code => shortCode;

  factory Building.fromCampusLocation(dynamic loc) {
    final String name = loc.name ?? '';
    final String sCode = loc.shortCode ?? 'PU-BLD';
    final String bId = loc.buildingId ?? loc.id ?? 'bld_${name.toLowerCase().replaceAll(' ', '_')}';

    String bLetter = 'D';
    final match = RegExp(r'([A-Za-z])\s*[-_]?\s*block', caseSensitive: false).firstMatch(name);
    if (match != null) {
      bLetter = match.group(1)!.toUpperCase();
    } else if (sCode.contains('D-BLOCK')) {
      bLetter = 'D';
    } else if (sCode.contains('E-BLOCK')) {
      bLetter = 'E';
    } else if (sCode.contains('F-BLOCK')) {
      bLetter = 'F';
    } else if (sCode.contains('L-BLOCK')) {
      bLetter = 'L';
    } else if (sCode.contains('N-BLOCK')) {
      bLetter = 'N';
    } else if (sCode.contains('M-BLOCK') || sCode.contains('SOM')) {
      bLetter = 'M';
    }

    final isLab = bLetter == 'D';
    final totalFloors = bLetter == 'E' ? 4 : 3;

    return Building(
      buildingId: bId,
      name: name,
      shortCode: sCode,
      blockLetter: bLetter,
      category: loc.category ?? 'Academic',
      description: loc.description ?? '',
      totalFloors: totalFloors,
      roomType: isLab ? 'Laboratory' : 'Classroom',
      departments: isLab
          ? ['Engineering & Technology Labs']
          : bLetter == 'E'
              ? ['Computer Science & Engineering', 'Dean Directorate']
              : ['Lecture & Seminar Classrooms'],
      latitude: loc.latitude,
      longitude: loc.longitude,
    );
  }

  factory Building.fromJson(Map<String, dynamic> json) {
    final rawDepts = json['departments'] as List? ?? [];
    final deptsList = rawDepts.map((d) => d.toString()).toList();

    final bId = json['buildingId'] ?? json['_id'] ?? json['id'] ?? 'bld_d_block';
    final name = json['name'] ?? json['featureName'] ?? 'Academic Block';
    final sCode = json['shortCode'] ?? json['code'] ?? 'PU-BLD';

    String bLetter = json['blockLetter'] ?? '';
    if (bLetter.isEmpty) {
      final match = RegExp(r'([A-Za-z])\s*[-_]?\s*block', caseSensitive: false).firstMatch(name);
      if (match != null) {
        bLetter = match.group(1)!.toUpperCase();
      } else {
        bLetter = 'D';
      }
    }

    final isLab = bLetter == 'D' || (json['roomType'] == 'Laboratory');

    return Building(
      buildingId: bId,
      name: name,
      shortCode: sCode,
      blockLetter: bLetter,
      category: json['category'] ?? 'Academic',
      description: json['description'] ?? '',
      totalFloors: (json['totalFloors'] as num?)?.toInt() ?? 3,
      roomType: isLab ? 'Laboratory' : 'Classroom',
      departments: deptsList,
      latitude: (json['latitude'] as num?)?.toDouble() ?? 13.170600,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 77.535800,
    );
  }
}

