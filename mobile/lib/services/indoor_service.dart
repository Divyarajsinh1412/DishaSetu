import '../models/floor.dart';
import '../models/building.dart';

class IndoorService {
  /// All 6 verified academic blocks in Presidency University
  static List<Building> getAllCampusBuildings() {
    return [
      Building(
        buildingId: 'bld_d_block',
        name: 'D Block',
        shortCode: 'PU-D-BLOCK',
        blockLetter: 'D',
        category: 'Academic',
        description: 'Engineering instructional complex, research laboratories, and design studios.',
        totalFloors: 3,
        roomType: 'Laboratory',
        departments: const ['Mechanical Engineering', 'Civil Engineering', 'Robotics & Automation'],
        latitude: 13.171880,
        longitude: 77.536120,
      ),
      Building(
        buildingId: 'bld_e_block',
        name: 'E Block',
        shortCode: 'PU-E-BLOCK',
        blockLetter: 'E',
        category: 'Academic',
        description: 'Computer Science & Engineering lecture suites, faculty staff rooms, and Dean offices.',
        totalFloors: 4,
        roomType: 'Classroom',
        departments: const ['Computer Science & Engineering', 'Artificial Intelligence', 'Dean Directorate'],
        latitude: 13.168990,
        longitude: 77.533518,
      ),
      Building(
        buildingId: 'bld_f_block',
        name: 'F Block',
        shortCode: 'PU-F-BLOCK',
        blockLetter: 'F',
        category: 'Academic',
        description: 'Information Science & Engineering and Software Development lecture complex.',
        totalFloors: 3,
        roomType: 'Classroom',
        departments: const ['Information Science & Technology', 'Computer Applications'],
        latitude: 13.169500,
        longitude: 77.534200,
      ),
      Building(
        buildingId: 'bld_l_block',
        name: 'L Block',
        shortCode: 'PU-L-BLOCK',
        blockLetter: 'L',
        category: 'Academic',
        description: 'Basic Sciences, Applied Physics, Mathematics, and Humanities classrooms.',
        totalFloors: 3,
        roomType: 'Classroom',
        departments: const ['Mathematics', 'Physics', 'Chemistry', 'Humanities'],
        latitude: 13.170200,
        longitude: 77.534800,
      ),
      Building(
        buildingId: 'bld_n_block',
        name: 'N Block',
        shortCode: 'PU-N-BLOCK',
        blockLetter: 'N',
        category: 'Academic',
        description: 'School of Law lecture halls, legal jurisprudence classrooms, and seminar rooms.',
        totalFloors: 3,
        roomType: 'Classroom',
        departments: const ['School of Law', 'Legal Studies & Moot Court Complex'],
        latitude: 13.171200,
        longitude: 77.535500,
      ),
      Building(
        buildingId: 'bld_som_block',
        name: 'M Block',
        shortCode: 'PU-M-BLOCK',
        blockLetter: 'M',
        category: 'Academic',
        description: 'School of Management (SOM) MBA lecture amphitheaters and executive case study halls.',
        totalFloors: 3,
        roomType: 'Classroom',
        departments: const ['School of Management (SOM)', 'MBA Programs', 'Business Analytics'],
        latitude: 13.172500,
        longitude: 77.536800,
      ),
    ];
  }

  /// Generate offline fallback floors & rooms for any building block
  static List<Floor> getBuildingFloorsFallback(String buildingIdOrCode) {
    final bLetter = _resolveBlockLetter(buildingIdOrCode);
    final isDBlock = bLetter == 'D';
    final isEBlock = bLetter == 'E';
    final buildingName = '$bLetter Block';
    final shortCode = 'PU-$bLetter-BLOCK';
    final buildingId = 'bld_${bLetter.toLowerCase()}_block';

    final totalFloors = isEBlock ? 4 : (bLetter == 'A' ? 2 : 3);
    final List<Floor> floors = [];

    for (int floorNum = 0; floorNum < totalFloors; floorNum++) {
      final floorName = floorNum == 0
          ? 'Ground Floor'
          : floorNum == 1
              ? 'First Floor'
              : floorNum == 2
                  ? 'Second Floor'
                  : 'Third Floor';

      final List<Room> rooms = [];

      if (isEBlock && floorNum == 0) {
        // Ground Floor of E Block: ONLY Staff Room 1, Staff Room 2, and Dean Office
        rooms.add(Room(
          roomId: 'rm_e_0_sr01',
          roomNumber: 'Staff Room 1',
          name: 'Staff Room 1 – Faculty Workstation Suite',
          category: 'Staff Room',
          type: 'Staff Room',
          department: 'Computer Science & Engineering',
          capacity: 25,
        ));
        rooms.add(Room(
          roomId: 'rm_e_0_sr02',
          roomNumber: 'Staff Room 2',
          name: 'Staff Room 2 – Senior Faculty & Research Mentors',
          category: 'Staff Room',
          type: 'Staff Room',
          department: 'Computer Science & Engineering',
          capacity: 25,
        ));
        rooms.add(Room(
          roomId: 'rm_e_0_dean',
          roomNumber: 'Dean Office',
          name: 'Dean Office – School of Computer Science & Engineering',
          category: 'Office',
          type: 'Office',
          department: 'Dean & Leadership Directorate',
          capacity: 15,
        ));
      } else if (isEBlock) {
        // First, Second, Third Floors of E Block: 6 Classrooms + Opposite side Staff Rooms & Dean Office
        final prefix = floorNum == 1 ? 'EF' : floorNum == 2 ? 'ES' : 'ET';
        for (int i = 1; i <= 6; i++) {
          final pad = i.toString().padLeft(2, '0');
          final rNumber = '$prefix$pad';
          final rName = _getRoomName(bLetter, floorNum, i);

          rooms.add(Room(
            roomId: 'rm_e_$floorNum$pad',
            roomNumber: rNumber,
            name: rName,
            category: 'Classroom',
            type: 'Classroom',
            department: 'Computer Science & Engineering',
            capacity: 60,
          ));
        }

        // Opposite Wing: Staff Rooms and Dean Office
        rooms.add(Room(
          roomId: 'rm_e_${floorNum}_sr01',
          roomNumber: '$prefix-SR01',
          name: 'Staff Room 1 – Faculty Office (Level $floorNum)',
          category: 'Staff Room',
          type: 'Staff Room',
          department: 'Computer Science & Engineering',
          capacity: 20,
        ));
        rooms.add(Room(
          roomId: 'rm_e_${floorNum}_sr02',
          roomNumber: '$prefix-SR02',
          name: 'Staff Room 2 – Systems & Networks Faculty (Level $floorNum)',
          category: 'Staff Room',
          type: 'Staff Room',
          department: 'Computer Science & Engineering',
          capacity: 20,
        ));
        rooms.add(Room(
          roomId: 'rm_e_${floorNum}_dean',
          roomNumber: '$prefix-DEAN',
          name: 'Dean Office – Executive Suite (Level $floorNum)',
          category: 'Office',
          type: 'Office',
          department: 'Dean & Leadership Directorate',
          capacity: 15,
        ));
      } else {
        // D, F, L, N, M Blocks
        final prefix = _getRoomCodePrefix(bLetter, floorNum);
        final roomCategory = isDBlock ? 'Laboratory' : 'Classroom';
        final roomType = isDBlock ? 'Laboratory' : 'Classroom';

        for (int i = 1; i <= 6; i++) {
          final pad = i.toString().padLeft(2, '0');
          final rNumber = '$prefix$pad';
          final rName = _getRoomName(bLetter, floorNum, i);

          rooms.add(Room(
            roomId: 'rm_${bLetter.toLowerCase()}_${floorNum}_$i',
            roomNumber: rNumber,
            name: rName,
            category: roomCategory,
            type: roomType,
            department: _getDepartment(bLetter),
            capacity: isDBlock ? 45 : 60,
          ));
        }
      }

      floors.add(Floor(
        floorId: 'flr_${bLetter.toLowerCase()}_$floorNum',
        buildingId: buildingId,
        buildingShortCode: shortCode,
        buildingName: buildingName,
        floorNumber: floorNum,
        floorName: floorName,
        rooms: rooms,
      ));
    }

    return floors;
  }

  static String _resolveBlockLetter(String idOrCode) {
    final s = idOrCode.toUpperCase();
    if (s.contains('ADM') || s.contains('REGISTRAR')) return 'A';
    if (s.contains('H') || s.contains('ELECTRICAL')) return 'H';
    if (s.contains('D') || s.contains('ENGG')) return 'D';
    if (s.contains('E') || s.contains('COMP')) return 'E';
    if (s.contains('F') || s.contains('INFO')) return 'F';
    if (s.contains('L') || s.contains('SCIENCE')) return 'L';
    if (s.contains('N') || s.contains('LAW')) return 'N';
    if (s.contains('M') || s.contains('SOM') || s.contains('MANAGEMENT')) return 'M';
    return 'D';
  }

  static String _getRoomCodePrefix(String blockLetter, int floor) {
    if (blockLetter == 'D') {
      if (floor == 0) return 'DGL';
      if (floor == 1) return 'DFL';
      if (floor == 2) return 'DSL';
      if (floor == 3) return 'DTL';
      return 'D${floor}L';
    }
    final fChar = floor == 0 ? 'G' : floor == 1 ? 'F' : floor == 2 ? 'S' : floor == 3 ? 'T' : '$floor';
    return '$blockLetter$fChar';
  }

  static String _getDepartment(String blockLetter) {
    switch (blockLetter) {
      case 'D': return 'Mechanical & Civil Engineering';
      case 'E': return 'Computer Science & Engineering';
      case 'F': return 'Information Science & AI';
      case 'H': return 'School of Electrical Engineering';
      case 'A': return 'University Admissions & Registrar Office';
      case 'L': return 'Basic Sciences & Humanities';
      case 'N': return 'School of Law (SOL)';
      case 'M': return 'School of Management (SOM)';
      default: return 'Academic Affairs';
    }
  }

  static String _getRoomName(String blockLetter, int floor, int index) {
    final titles = {
      'H': {
        0: ['Electrical Machines Lab', 'Power Systems Lab', 'Measurements Studio', 'Renewable Energy Lab', 'Faculty Workstations', 'Seminar Hall'],
        1: ['Control Systems 101', 'Digital Signal Processing 102', 'Power Electronics 103', 'High Voltage Engineering 104', 'Microprocessors 105', 'Lecture Hall 106'],
        2: ['Smart Grid Tech 201', 'Electric Vehicle Systems 202', 'Applied Electromagnetics 203', 'Energy Management 204', 'Research Workstations 205', 'Conference Room 206'],
      },
      'A': {
        0: ['Admissions Counter 01', 'Document Verification 02', 'Registrar Reception 03', 'Student Enquiry 04', 'Academic Records 05', 'Waiting Lounge 06'],
        1: ['Dean Admissions 101', 'Registrar Suite 102', 'Operations War Room 103', 'Records Archive 104', 'Boardroom 105', 'Committee Conference 106'],
      },
      'D': {
        0: ['Engineering Mechanics Lab', 'Robotics & Automation Studio', 'Materials Testing Lab', 'Fluid Mechanics Lab', 'CAD Studio', 'Manufacturing Tech Lab'],
        1: ['Thermodynamics Lab', 'Mechatronics Systems Lab', 'Kinematics Lab', 'Additive Manufacturing Lab', 'Sensors Lab', 'Automotive Lab'],
        2: ['Structural Analysis Lab', 'Environmental Engg Lab', 'Hydraulics Lab', 'Geotechnical Lab', 'Concrete Materials Lab', 'Surveying Lab'],
      },
      'E': {
        0: ['Staff Room 1', 'Staff Room 2', 'Dean Office'],
        1: ['Artificial Intelligence 101', 'Machine Learning 102', 'Cloud Computing 103', 'Cyber Security 104', 'Big Data Analytics 105', 'Web Technologies 106'],
        2: ['Computer Vision 201', 'Distributed Systems 202', 'High Performance Computing 203', 'Mobile App Dev 204', 'Quantum Computing 205', 'IoT Classroom 206'],
        3: ['Advanced Robotics 301', 'Deep Learning 302', 'Cloud Architecture 303', 'Blockchain 304', 'Natural Language Processing 305', 'Edge Computing 306'],
      },
      'F': {
        0: ['Information Systems 01', 'OOP Classroom 02', 'Discrete Math 03', 'System Architecture 04', 'Web Applications 05', 'Enterprise Systems 06'],
        1: ['Information Security 101', 'DevOps & CI/CD 102', 'Natural Language Processing 103', 'Data Mining 104', 'Full Stack Dev 105', 'Network Security 106'],
        2: ['Blockchain Tech 201', 'Agile Dev Classroom 202', 'Digital Forensics 203', 'Cognitive Systems 204', 'Info Retrieval 205', 'Advanced Seminar 206'],
      },
      'L': {
        0: ['Foundation Engg 01', 'Applied Physics 02', 'Engineering Chemistry 03', 'Calculus Lecture 04', 'Linear Algebra 05', 'Technical English 06'],
        1: ['Differential Equations 101', 'Modern Physics 102', 'Organic Chemistry 103', 'Probability & Stats 104', 'Environmental Science 105', 'Professional Ethics 106'],
        2: ['Complex Analysis 201', 'Numerical Methods 202', 'Materials Science 203', 'Operations Research 204', 'Nanotechnology 205', 'Interdisciplinary Seminar 206'],
      },
      'N': {
        0: ['Jurisprudence Classroom 01', 'Constitutional Law 02', 'Law of Contracts 03', 'Family Law 04', 'Legal History 05', 'Moot Preparation 06'],
        1: ['Criminal Law 101', 'Law of Torts 102', 'Corporate Law 103', 'Property Law 104', 'International Law 105', 'Human Rights 106'],
        2: ['Cyber Law & IT Act 201', 'Intellectual Property 202', 'Environmental Law 203', 'Taxation Law 204', 'Labour Laws 205', 'Legal Drafting 206'],
      },
      'M': {
        0: ['Principles of Management 01', 'Financial Accounting 02', 'Marketing Management 03', 'Organizational Behavior 04', 'Managerial Economics 05', 'Business Comm 06'],
        1: ['Corporate Finance 101', 'HR Management 102', 'Supply Chain 103', 'Business Analytics 104', 'Digital Marketing 105', 'Strategic Management 106'],
        2: ['Investment Banking 201', 'International Business 202', 'Venture Capital 203', 'Corporate Governance 204', 'FinTech 205', 'Executive Leadership 206'],
      },
    };

    final list = titles[blockLetter]?[floor];
    if (list != null && index >= 1 && index <= list.length) {
      return list[index - 1];
    }
    return 'Room $index';
  }
}
