class Room {
  final String roomId;
  final String roomNumber;
  final String name;
  final String category; // 'Classroom' or 'Laboratory'
  final String type;
  final String department;
  final int capacity;
  final String status;

  Room({
    required this.roomId,
    required this.roomNumber,
    required this.name,
    required this.category,
    this.type = 'Classroom',
    this.department = '',
    this.capacity = 60,
    this.status = 'Operational',
  });

  bool get isLab =>
      category.toLowerCase() == 'laboratory' ||
      type.toLowerCase() == 'laboratory' ||
      roomNumber.startsWith('D');

  bool get isStaffRoom =>
      category.toLowerCase().contains('staff') ||
      type.toLowerCase().contains('staff') ||
      name.toLowerCase().contains('staff') ||
      roomNumber.toLowerCase().contains('sr') ||
      roomNumber.toLowerCase().contains('staff');

  bool get isOffice =>
      category.toLowerCase().contains('office') ||
      type.toLowerCase().contains('office') ||
      name.toLowerCase().contains('dean') ||
      roomNumber.toLowerCase().contains('dean');

  String get typeLabel {
    if (isLab) return 'LAB';
    if (isStaffRoom) return 'STAFF ROOM';
    if (isOffice) return 'OFFICE';
    return 'CLASSROOM';
  }

  String get roomCode => roomNumber;

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      roomId: json['roomId'] ?? json['_id'] ?? json['roomNumber'] ?? '',
      roomNumber: json['roomNumber'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? 'Classroom',
      type: json['type'] ?? json['category'] ?? 'Classroom',
      department: json['department'] ?? '',
      capacity: (json['capacity'] as num?)?.toInt() ?? 60,
      status: json['status'] ?? 'Operational',
    );
  }
}

class Floor {
  final String floorId;
  final String buildingId;
  final String buildingShortCode;
  final String buildingName;
  final int floorNumber;
  final String floorName;
  final List<Room> rooms;

  Floor({
    required this.floorId,
    required this.buildingId,
    required this.buildingShortCode,
    required this.buildingName,
    required this.floorNumber,
    required this.floorName,
    required this.rooms,
  });

  factory Floor.fromJson(Map<String, dynamic> json) {
    final rawRooms = json['rooms'] as List? ?? [];
    final roomsList = rawRooms
        .map((r) => Room.fromJson(r as Map<String, dynamic>))
        .toList();

    return Floor(
      floorId: json['floorId'] ?? json['_id'] ?? '',
      buildingId: json['buildingId'] ?? '',
      buildingShortCode: json['buildingShortCode'] ?? '',
      buildingName: json['buildingName'] ?? '',
      floorNumber: (json['floorNumber'] as num?)?.toInt() ?? 0,
      floorName: json['floorName'] ?? 'Floor ${json['floorNumber'] ?? 0}',
      rooms: roomsList,
    );
  }
}

