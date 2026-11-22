import '../models/floor.dart';
import '../models/building.dart';

class IndoorService {
  /// Generate offline fallback floors & rooms for any building block
  static List<Floor> getBuildingFloorsFallback(String buildingIdOrCode) {
    final bLetter = _resolveBlockLetter(buildingIdOrCode);
    final isDBlock = bLetter == 'D';
    final buildingName = '$bLetter Block';
    final shortCode = 'PU-$bLetter-BLOCK';
    final buildingId = 'bld_${bLetter.toLowerCase()}_block';

    final List<Floor> floors = [];

    for (int floorNum = 0; floorNum < 3; floorNum++) {
      final floorName = floorNum == 0
          ? 'Ground Floor'
          : floorNum == 1
              ? 'First Floor'
              : 'Second Floor';

      final prefix = _getRoomCodePrefix(bLetter, floorNum);
      final roomCategory = isDBlock ? 'Laboratory' : 'Classroom';
      final roomType = isDBlock ? 'Laboratory' : 'Classroom';

      final List<Room> rooms = [];
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
      return 'D${floor}L';
    }
    final fChar = floor == 0 ? 'G' : floor == 1 ? 'F' : floor == 2 ? 'S' : '$floor';
    return '$blockLetter$fChar';
  }

  static String _getDepartment(String blockLetter) {
    switch (blockLetter) {
      case 'D': return 'Mechanical & Civil Engineering';
      case 'E': return 'Computer Science & Engineering';
      case 'F': return 'Information Science & AI';
      case 'L': return 'Basic Sciences & Humanities';
      case 'N': return 'School of Law (SOL)';
      case 'M': return 'School of Management (SOM)';
      default: return 'Academic Affairs';
    }
  }

  static String _getRoomName(String blockLetter, int floor, int index) {
    final titles = {
      'D': {
        0: ['Engineering Mechanics Lab', 'Robotics & Automation Studio', 'Materials Testing Lab', 'Fluid Mechanics Lab', 'CAD Studio', 'Manufacturing Tech Lab'],
        1: ['Thermodynamics Lab', 'Mechatronics Systems Lab', 'Kinematics Lab', 'Additive Manufacturing Lab', 'Sensors Lab', 'Automotive Lab'],
        2: ['Structural Analysis Lab', 'Environmental Engg Lab', 'Hydraulics Lab', 'Geotechnical Lab', 'Concrete Materials Lab', 'Surveying Lab'],
      },
      'E': {
        0: ['CS Lecture Hall 01', 'Data Structures Classroom 02', 'Operating Systems Classroom 03', 'Software Engg Classroom 04', 'Computer Networks 05', 'DBMS Classroom 06'],
        1: ['Artificial Intelligence 101', 'Machine Learning 102', 'Cloud Computing 103', 'Cyber Security 104', 'Big Data Analytics 105', 'Web Technologies 106'],
        2: ['Computer Vision 201', 'Distributed Systems 202', 'HPC Classroom 203', 'Mobile App Dev 204', 'Quantum Computing 205', 'IoT Classroom 206'],
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
        2: ['Investment Banking 201', 'International Business 202', 'Venture Capital 203', 'Corporate Governance 204', 'FinTech Modeling 205', 'Executive Leadership 206'],
      }
    };

    final blockDict = titles[blockLetter] ?? titles['D']!;
    final floorDict = blockDict[floor] ?? blockDict[0]!;
    if (index - 1 < floorDict.length) {
      return floorDict[index - 1];
    }
    return '$blockLetter Block Room $index';
  }

  static List<Building> getAllCampusBuildings() {
    return [
      Building(
        buildingId: 'bld_d_block',
        name: 'D Block',
        shortCode: 'PU-D-BLOCK',
        blockLetter: 'D',
        category: 'Academic',
        roomType: 'Laboratory',
        totalFloors: 3,
        description: 'Engineering Laboratories & Workshops complex equipped with Robotics, Fluid Mechanics, CAD/CAM, and Material Testing Suites.',
        departments: ['Mechanical Engineering', 'Civil Engineering', 'Mechatronics & Robotics'],
        latitude: 13.170550,
        longitude: 77.535610,
      ),
      Building(
        buildingId: 'bld_e_block',
        name: 'E Block',
        shortCode: 'PU-E-BLOCK',
        blockLetter: 'E',
        category: 'Academic',
        roomType: 'Classroom',
        totalFloors: 3,
        description: 'School of Computer Science & Engineering instructional smart lecture amphitheaters and AI research hubs.',
        departments: ['Computer Science & Engineering', 'AI & Machine Learning', 'Data Science'],
        latitude: 13.170880,
        longitude: 77.535850,
      ),
      Building(
        buildingId: 'bld_f_block',
        name: 'F Block',
        shortCode: 'PU-F-BLOCK',
        blockLetter: 'F',
        category: 'Academic',
        roomType: 'Classroom',
        totalFloors: 3,
        description: 'Information Science & Technology lecture suites, software project workspaces, and high-performance computing centers.',
        departments: ['Information Science & Engineering', 'Cyber Security', 'Cloud Computing'],
        latitude: 13.171120,
        longitude: 77.535780,
      ),
      Building(
        buildingId: 'bld_l_block',
        name: 'L Block',
        shortCode: 'PU-L-BLOCK',
        blockLetter: 'L',
        category: 'Academic',
        roomType: 'Classroom',
        totalFloors: 3,
        description: 'Basic Sciences, Applied Physics, Mathematics, and Humanities foundational lecture halls.',
        departments: ['Mathematics', 'Physics', 'Chemistry', 'Humanities'],
        latitude: 13.170250,
        longitude: 77.536100,
      ),
      Building(
        buildingId: 'bld_n_block',
        name: 'N Block',
        shortCode: 'PU-N-BLOCK',
        blockLetter: 'N',
        category: 'Academic',
        roomType: 'Classroom',
        totalFloors: 3,
        description: 'School of Law (SOL) lecture halls, legal jurisprudence classrooms, and Moot Court training suites.',
        departments: ['School of Law', 'Legal Studies & Moot Court Complex'],
        latitude: 13.169520,
        longitude: 77.536100,
      ),
      Building(
        buildingId: 'bld_som_block',
        name: 'M Block',
        shortCode: 'PU-M-BLOCK',
        blockLetter: 'M',
        category: 'Academic',
        roomType: 'Classroom',
        totalFloors: 3,
        description: 'School of Management (SOM) MBA lecture amphitheaters and executive case study halls.',
        departments: ['School of Management (SOM)', 'MBA Programs', 'Business Analytics'],
        latitude: 13.170150,
        longitude: 77.536800,
      ),
    ];
  }
}
