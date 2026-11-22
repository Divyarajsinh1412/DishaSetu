class LectureSlot {
  final String day;
  final String subject;
  final String building;
  final String floor;
  final String room;
  final String startTime;
  final String endTime;

  const LectureSlot({
    required this.day,
    required this.subject,
    this.building = 'E Block',
    this.floor = 'First Floor',
    required this.room,
    required this.startTime,
    required this.endTime,
  });

  factory LectureSlot.fromJson(Map<String, dynamic> json) {
    return LectureSlot(
      day: json['day'] ?? 'Monday',
      subject: json['subject'] ?? '',
      building: json['building'] ?? 'E Block',
      floor: json['floor'] ?? 'First Floor',
      room: json['room'] ?? '',
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
    );
  }
}

class Faculty {
  final String facultyId;
  final String name;
  final String designation;
  final String department;
  final String staffRoomId;
  final String cabinId;
  final String cabinNumber;
  final String currentStatus; // 'Available' | 'Unavailable'
  final String currentActivity;
  final String currentLocation;
  final String? currentClassLocation;
  final String? currentLectureTime;
  final String? currentSubject;
  final String nextAvailability;
  final String avatar;
  final List<LectureSlot> timetable;

  const Faculty({
    required this.facultyId,
    required this.name,
    this.designation = 'Assistant Professor',
    this.department = 'Computer Science & Engineering',
    this.staffRoomId = 'sr_e_block_01',
    required this.cabinId,
    required this.cabinNumber,
    this.currentStatus = 'Available',
    this.currentActivity = 'In Cabin',
    this.currentLocation = 'Staff Room 01',
    this.currentClassLocation,
    this.currentLectureTime,
    this.currentSubject,
    this.nextAvailability = 'Available Now',
    this.avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    this.timetable = const [],
  });

  bool get isAvailable => currentStatus == 'Available';

  factory Faculty.fromJson(Map<String, dynamic> json) {
    final rawTimetable = json['timetable'] as List? ?? [];
    return Faculty(
      facultyId: json['facultyId'] ?? '',
      name: json['name'] ?? '',
      designation: json['designation'] ?? 'Assistant Professor',
      department: json['department'] ?? 'Computer Science & Engineering',
      staffRoomId: json['staffRoomId'] ?? 'sr_e_block_01',
      cabinId: json['cabinId'] ?? '',
      cabinNumber: json['cabinNumber'] ?? json['cabinId'] ?? '',
      currentStatus: json['currentStatus'] ?? 'Available',
      currentActivity: json['currentActivity'] ?? 'In Cabin',
      currentLocation: json['currentLocation'] ?? 'Staff Room 01',
      currentClassLocation: json['currentClassLocation'],
      currentLectureTime: json['currentLectureTime'],
      currentSubject: json['currentSubject'],
      nextAvailability: json['nextAvailability'] ?? 'Available Now',
      avatar: json['avatar'] ?? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      timetable: rawTimetable.map((s) => LectureSlot.fromJson(s as Map<String, dynamic>)).toList(),
    );
  }
}

class StaffRoomCabin {
  final String cabinId;
  final String cabinNumber;
  final String? facultyId;
  final String? facultyName;
  final int row;
  final int col;
  final String type; // 'cabin', 'walking_area', 'dean_office', 'lounge_entry'
  final String status; // 'Available', 'Unavailable'
  final Faculty? faculty;

  const StaffRoomCabin({
    required this.cabinId,
    required this.cabinNumber,
    this.facultyId,
    this.facultyName,
    required this.row,
    required this.col,
    this.type = 'cabin',
    this.status = 'Available',
    this.faculty,
  });

  bool get isAvailable => status == 'Available';
  bool get isWalkingArea => type == 'walking_area';
  bool get isDeanOffice => type == 'dean_office';
  bool get isLoungeEntry => type == 'lounge_entry';

  factory StaffRoomCabin.fromJson(Map<String, dynamic> json) {
    return StaffRoomCabin(
      cabinId: json['cabinId'] ?? '',
      cabinNumber: json['cabinNumber'] ?? '',
      facultyId: json['facultyId'],
      facultyName: json['facultyName'],
      row: (json['row'] as num?)?.toInt() ?? 1,
      col: (json['col'] as num?)?.toInt() ?? 1,
      type: json['type'] ?? 'cabin',
      status: json['status'] ?? 'Available',
      faculty: json['faculty'] != null ? Faculty.fromJson(json['faculty']) : null,
    );
  }
}

class StaffRoom {
  final String staffRoomId;
  final String name;
  final String buildingId;
  final String buildingName;
  final int floorNumber;
  final String floorName;
  final int totalCabins;
  final List<StaffRoomCabin> cabins;

  const StaffRoom({
    required this.staffRoomId,
    required this.name,
    required this.buildingId,
    this.buildingName = 'E Block',
    this.floorNumber = 0,
    this.floorName = 'Ground Floor',
    this.totalCabins = 10,
    required this.cabins,
  });

  factory StaffRoom.fromJson(Map<String, dynamic> json) {
    final rawCabins = json['cabins'] as List? ?? [];
    return StaffRoom(
      staffRoomId: json['staffRoomId'] ?? 'sr_e_block_01',
      name: json['name'] ?? 'Staff Room 01',
      buildingId: json['buildingId'] ?? 'bld_e_block',
      buildingName: json['buildingName'] ?? 'E Block',
      floorNumber: (json['floorNumber'] as num?)?.toInt() ?? 0,
      floorName: json['floorName'] ?? 'Ground Floor',
      totalCabins: (json['totalCabins'] as num?)?.toInt() ?? 10,
      cabins: rawCabins.map((c) => StaffRoomCabin.fromJson(c as Map<String, dynamic>)).toList(),
    );
  }

  static StaffRoom getVerifiedFallback() {
    return const StaffRoom(
      staffRoomId: 'sr_e_block_01',
      name: 'Staff Room 01',
      buildingId: 'bld_e_block',
      buildingName: 'E Block',
      floorNumber: 0,
      floorName: 'Ground Floor',
      totalCabins: 10,
      cabins: [
        // Row 1
        StaffRoomCabin(
          cabinId: 'SR-01',
          cabinNumber: 'SR-01',
          facultyId: 'fac_shah',
          facultyName: 'Dr. R. Shah',
          row: 1,
          col: 1,
          status: 'Available',
          faculty: Faculty(
            facultyId: 'fac_shah',
            name: 'Dr. R. Shah',
            cabinId: 'SR-01',
            cabinNumber: 'SR-01',
            currentStatus: 'Available',
            currentActivity: 'In Cabin',
            currentLocation: 'Staff Room 01',
            nextAvailability: 'Available Now',
          ),
        ),
        StaffRoomCabin(
          cabinId: 'SR-02',
          cabinNumber: 'SR-02',
          facultyId: 'fac_mehta',
          facultyName: 'Prof. K. Mehta',
          row: 1,
          col: 2,
          status: 'Available',
          faculty: Faculty(
            facultyId: 'fac_mehta',
            name: 'Prof. K. Mehta',
            cabinId: 'SR-02',
            cabinNumber: 'SR-02',
            currentStatus: 'Available',
            currentActivity: 'In Cabin',
            currentLocation: 'Staff Room 01',
            nextAvailability: 'Available Now',
          ),
        ),
        StaffRoomCabin(
          cabinId: 'WALK-01',
          cabinNumber: 'Walking Area',
          row: 1,
          col: 3,
          type: 'walking_area',
        ),
        StaffRoomCabin(
          cabinId: 'SR-03',
          cabinNumber: 'SR-03',
          facultyId: 'fac_faizan',
          facultyName: 'Faizan Anwar Khan',
          row: 1,
          col: 4,
          status: 'Unavailable',
          faculty: Faculty(
            facultyId: 'fac_faizan',
            name: 'Faizan Anwar Khan',
            cabinId: 'SR-03',
            cabinNumber: 'SR-03',
            currentStatus: 'Unavailable',
            currentActivity: 'Taking Lecture',
            currentLocation: 'E Block – EF03',
            currentClassLocation: 'E Block – EF03',
            currentLectureTime: '10:00 AM – 11:00 AM',
            currentSubject: 'Machine Learning',
            nextAvailability: '11:00 AM',
            timetable: [
              LectureSlot(day: 'Monday', subject: 'Machine Learning', room: 'EF03', startTime: '10:00 AM', endTime: '11:00 AM'),
              LectureSlot(day: 'Tuesday', subject: 'Deep Learning Seminar', room: 'ES01', startTime: '11:15 AM', endTime: '12:15 PM'),
              LectureSlot(day: 'Thursday', subject: 'Pattern Recognition', room: 'EF04', startTime: '09:00 AM', endTime: '10:00 AM'),
            ],
          ),
        ),
        StaffRoomCabin(
          cabinId: 'SR-04',
          cabinNumber: 'SR-04',
          facultyId: 'fac_joshi',
          facultyName: 'Prof. P. Joshi',
          row: 1,
          col: 5,
          status: 'Available',
          faculty: Faculty(
            facultyId: 'fac_joshi',
            name: 'Prof. P. Joshi',
            cabinId: 'SR-04',
            cabinNumber: 'SR-04',
            currentStatus: 'Available',
            currentActivity: 'In Cabin',
            currentLocation: 'Staff Room 01',
            nextAvailability: 'Available Now',
          ),
        ),

        // Row 2
        StaffRoomCabin(
          cabinId: 'SR-05',
          cabinNumber: 'SR-05',
          facultyId: 'fac_patel',
          facultyName: 'Prof. A. Patel',
          row: 2,
          col: 1,
          status: 'Available',
          faculty: Faculty(
            facultyId: 'fac_patel',
            name: 'Prof. A. Patel',
            cabinId: 'SR-05',
            cabinNumber: 'SR-05',
            currentStatus: 'Available',
            currentActivity: 'In Cabin',
            currentLocation: 'Staff Room 01',
          ),
        ),
        StaffRoomCabin(
          cabinId: 'SR-06',
          cabinNumber: 'SR-06',
          facultyId: 'fac_desai',
          facultyName: 'Dr. M. Desai',
          row: 2,
          col: 2,
          status: 'Unavailable',
          faculty: Faculty(
            facultyId: 'fac_desai',
            name: 'Dr. M. Desai',
            cabinId: 'SR-06',
            cabinNumber: 'SR-06',
            currentStatus: 'Unavailable',
            currentActivity: 'Taking Lecture',
            currentLocation: 'E Block – EF01',
            currentClassLocation: 'E Block – EF01',
            currentLectureTime: '10:00 AM – 11:30 AM',
            currentSubject: 'Database Systems',
            nextAvailability: '11:30 AM',
          ),
        ),
        StaffRoomCabin(
          cabinId: 'WALK-02',
          cabinNumber: 'Walking Area',
          row: 2,
          col: 3,
          type: 'walking_area',
        ),
        StaffRoomCabin(
          cabinId: 'SR-07',
          cabinNumber: 'SR-07',
          facultyId: 'fac_dinesh',
          facultyName: 'Dinesh Sir',
          row: 2,
          col: 4,
          status: 'Available',
          faculty: Faculty(
            facultyId: 'fac_dinesh',
            name: 'Dinesh Sir',
            cabinId: 'SR-07',
            cabinNumber: 'SR-07',
            currentStatus: 'Available',
            currentActivity: 'In Cabin',
            currentLocation: 'Staff Room 01',
          ),
        ),
        StaffRoomCabin(
          cabinId: 'SR-08',
          cabinNumber: 'SR-08',
          facultyId: 'fac_verma',
          facultyName: 'Dr. N. Verma',
          row: 2,
          col: 5,
          status: 'Available',
          faculty: Faculty(
            facultyId: 'fac_verma',
            name: 'Dr. N. Verma',
            cabinId: 'SR-08',
            cabinNumber: 'SR-08',
            currentStatus: 'Available',
            currentActivity: 'In Cabin',
            currentLocation: 'Staff Room 01',
          ),
        ),

        // Row 3
        StaffRoomCabin(
          cabinId: 'ENTRY-LOUNGE',
          cabinNumber: 'Entry & Lounge',
          row: 3,
          col: 1,
          type: 'lounge_entry',
        ),
        StaffRoomCabin(
          cabinId: 'SR-09',
          cabinNumber: 'SR-09',
          facultyId: 'fac_rao',
          facultyName: 'Prof. D. Rao',
          row: 3,
          col: 2,
          status: 'Available',
          faculty: Faculty(
            facultyId: 'fac_rao',
            name: 'Prof. D. Rao',
            cabinId: 'SR-09',
            cabinNumber: 'SR-09',
            currentStatus: 'Available',
            currentActivity: 'In Cabin',
            currentLocation: 'Staff Room 01',
          ),
        ),
        StaffRoomCabin(
          cabinId: 'SR-10',
          cabinNumber: 'SR-10',
          facultyId: 'fac_nagma',
          facultyName: 'Nagma Mam',
          row: 3,
          col: 3,
          status: 'Unavailable',
          faculty: Faculty(
            facultyId: 'fac_nagma',
            name: 'Nagma Mam',
            cabinId: 'SR-10',
            cabinNumber: 'SR-10',
            currentStatus: 'Unavailable',
            currentActivity: 'Taking Lecture',
            currentLocation: 'E Block – EF05',
            currentClassLocation: 'E Block – EF05',
            currentLectureTime: '09:30 AM – 11:00 AM',
            currentSubject: 'Software Engineering',
            nextAvailability: '11:00 AM',
          ),
        ),
        StaffRoomCabin(
          cabinId: 'DEAN-OFFICE',
          cabinNumber: 'Dean Office',
          facultyId: 'fac_kulkarni',
          facultyName: 'Dr. V. Kulkarni',
          row: 3,
          col: 4,
          type: 'dean_office',
          status: 'Available',
          faculty: Faculty(
            facultyId: 'fac_kulkarni',
            name: 'Dr. V. Kulkarni',
            designation: 'Dean, School of Engineering & Computing',
            department: 'School of CSE & Information Science',
            cabinId: 'DEAN-OFFICE',
            cabinNumber: 'Dean Office',
            currentStatus: 'Available',
            currentActivity: 'In Executive Office',
            currentLocation: 'Dean Office (E Block Ground)',
          ),
        ),
      ],
    );
  }
}
