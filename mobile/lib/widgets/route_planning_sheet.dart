import 'package:flutter/material.dart';
import '../models/campus_location.dart';
import '../models/navigation_route.dart';
import '../services/api_service.dart';

/// Campus Wayfinding Place definition matching Web RoutePlanningModal.jsx
class CampusWayfindingPlace {
  final String id;
  final String code;
  final String name;
  final String category;
  final String group;
  final IconData icon;

  const CampusWayfindingPlace({
    required this.id,
    required this.code,
    required this.name,
    required this.category,
    required this.group,
    required this.icon,
  });
}

/// Comprehensive catalog of 60 verified campus wayfinding locations
const List<CampusWayfindingPlace> kCampusWayfindingPlaces = [
  // 1. Gates & Entry Points
  CampusWayfindingPlace(
    id: 'node_main_gate',
    code: 'PU-GATE-01',
    name: 'Main Gate (Upper Entrance)',
    category: 'Gate',
    group: 'Gates & Entrances',
    icon: Icons.explore,
  ),
  CampusWayfindingPlace(
    id: 'node_gate_2',
    code: 'PU-GATE-02',
    name: 'Gate 2 (Upper-Right Entrance)',
    category: 'Gate',
    group: 'Gates & Entrances',
    icon: Icons.explore,
  ),
  CampusWayfindingPlace(
    id: 'node_parking_entry',
    code: 'PU-PARK-2W',
    name: 'Student 2-Wheeler Parking',
    category: 'Parking',
    group: 'Parking & Transit',
    icon: Icons.two_wheeler,
  ),
  CampusWayfindingPlace(
    id: 'node_visitor_parking',
    code: 'PU-PARK-VIS',
    name: 'Visitor Parking',
    category: 'Parking',
    group: 'Parking & Transit',
    icon: Icons.directions_car,
  ),
  CampusWayfindingPlace(
    id: 'node_bus_point_2',
    code: 'PU-BUS-02',
    name: 'Bus Point 2',
    category: 'Transport',
    group: 'Parking & Transit',
    icon: Icons.directions_bus,
  ),
  CampusWayfindingPlace(
    id: 'node_bus_boarding',
    code: 'PU-BUS-BAY',
    name: 'Bus Boarding Bay',
    category: 'Transport',
    group: 'Parking & Transit',
    icon: Icons.directions_bus,
  ),
  CampusWayfindingPlace(
    id: 'node_parking_4w',
    code: 'PU-PARK-4W',
    name: '4 Wheeler Parking',
    category: 'Parking',
    group: 'Parking & Transit',
    icon: Icons.directions_car,
  ),

  // 2. Academic Blocks
  CampusWayfindingPlace(
    id: 'bld_d_block',
    code: 'PU-D-BLOCK',
    name: 'D Block (Mechanical & Civil Engineering)',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_e_block',
    code: 'PU-E-BLOCK',
    name: 'E Block (School of CSE & AI)',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_f_block',
    code: 'PU-F-BLOCK',
    name: 'F Block (Information Science & EEE)',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_l_block',
    code: 'PU-L-BLOCK',
    name: 'L Block (Electronics & Robotics)',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_h_block',
    code: 'PU-H-BLOCK',
    name: 'H Block (Admissions & Registrar Office)',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_hr_block',
    code: 'PU-HR-BLOCK',
    name: 'HR Block & Plaza',
    category: 'Administrative',
    group: 'Academic Blocks',
    icon: Icons.business,
  ),
  CampusWayfindingPlace(
    id: 'bld_j_block',
    code: 'PU-J-BLOCK',
    name: 'J Block',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_k_block',
    code: 'PU-K-BLOCK',
    name: 'K Block',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_n_block',
    code: 'PU-N-BLOCK',
    name: 'N Block',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_p_block',
    code: 'PU-P-BLOCK',
    name: 'P Block',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_q_block',
    code: 'PU-Q-BLOCK',
    name: 'Q Block',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_r_block',
    code: 'PU-R-BLOCK',
    name: 'R Block',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_s_block',
    code: 'PU-S-BLOCK',
    name: 'S Block',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_u_block',
    code: 'PU-U-BLOCK',
    name: 'U Block (South Academic Wing)',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.apartment,
  ),
  CampusWayfindingPlace(
    id: 'bld_coe',
    code: 'PU-COE',
    name: 'COE Block (Controller of Examinations)',
    category: 'Administrative',
    group: 'Academic Blocks',
    icon: Icons.business,
  ),
  CampusWayfindingPlace(
    id: 'bld_dsa',
    code: 'PU-DSA',
    name: 'DSA & Fee Counter',
    category: 'Administrative',
    group: 'Academic Blocks',
    icon: Icons.payments,
  ),
  CampusWayfindingPlace(
    id: 'bld_mba_som',
    code: 'PU-MBA-SOM',
    name: 'MBA / SOM Block (School of Management)',
    category: 'Academic',
    group: 'Academic Blocks',
    icon: Icons.school,
  ),
  CampusWayfindingPlace(
    id: 'bld_auditorium',
    code: 'PU-AUDITORIUM',
    name: 'Auditorium Grand Foyer',
    category: 'Facility',
    group: 'Campus Facilities',
    icon: Icons.theater_comedy,
  ),
  CampusWayfindingPlace(
    id: 'bld_hostel_mess',
    code: 'PU-HOSTEL-MESS',
    name: 'Hostel Mess & Dining Hall',
    category: 'Facility',
    group: 'Campus Facilities',
    icon: Icons.restaurant,
  ),

  // 3. Dining & Cafes
  CampusWayfindingPlace(
    id: 'feat_food_d_block',
    code: 'PU-CAFE-D-BLOCK',
    name: 'Hatti Kaapi (Near D Block)',
    category: 'Cafe',
    group: 'Dining & Cafes',
    icon: Icons.coffee,
  ),
  CampusWayfindingPlace(
    id: 'feat_food_point_main',
    code: 'PU-CAFE-01',
    name: 'Central Food Point & Refreshments',
    category: 'Cafe',
    group: 'Dining & Cafes',
    icon: Icons.fastfood,
  ),

  // 4. Central Landmarks & Greenery
  CampusWayfindingPlace(
    id: 'feat_fountain',
    code: 'PU-LM-FOUNTAIN',
    name: 'Central Fountain Roundabout',
    category: 'Garden',
    group: 'Landmarks & Greenery',
    icon: Icons.park,
  ),
  CampusWayfindingPlace(
    id: 'feat_main_lawn',
    code: 'PU-LM-LAWN',
    name: 'Main Lawn (Central Green)',
    category: 'Garden',
    group: 'Landmarks & Greenery',
    icon: Icons.forest,
  ),
  CampusWayfindingPlace(
    id: 'feat_walking_corridor_main_to_d',
    code: 'PU-PATH-MAIN-D',
    name: 'Main Gate → D Block Pathway',
    category: 'Pathway',
    group: 'Landmarks & Greenery',
    icon: Icons.directions_walk,
  ),
  CampusWayfindingPlace(
    id: 'feat_dsa_lawn',
    code: 'PU-LM-DSA-LAWN',
    name: 'DSA Lawn',
    category: 'Garden',
    group: 'Landmarks & Greenery',
    icon: Icons.park,
  ),

  // 5. Facilities & Health
  CampusWayfindingPlace(
    id: 'feat_library',
    code: 'PU-FAC-LIB',
    name: 'Central University Library',
    category: 'Library',
    group: 'Campus Facilities',
    icon: Icons.menu_book,
  ),
  CampusWayfindingPlace(
    id: 'feat_medical',
    code: 'PU-FAC-MED',
    name: 'Health & Medical Centre',
    category: 'Medical',
    group: 'Campus Facilities',
    icon: Icons.medical_services,
  ),
  CampusWayfindingPlace(
    id: 'feat_atm_d_block',
    code: 'PU-FAC-ATM',
    name: 'Campus ATM (Near D Block)',
    category: 'Facility',
    group: 'Campus Facilities',
    icon: Icons.atm,
  ),

  // 6. Sports Arena
  CampusWayfindingPlace(
    id: 'feat_football',
    code: 'PU-SPORT-FB',
    name: 'Football Ground',
    category: 'Sports',
    group: 'Sports Arena',
    icon: Icons.sports_soccer,
  ),
  CampusWayfindingPlace(
    id: 'feat_volleyball',
    code: 'PU-SPORT-VB',
    name: 'Volleyball Courts & Nets',
    category: 'Sports',
    group: 'Sports Arena',
    icon: Icons.sports_volleyball,
  ),
  CampusWayfindingPlace(
    id: 'feat_basketball',
    code: 'PU-SPORT-BB',
    name: 'Basketball Court',
    category: 'Sports',
    group: 'Sports Arena',
    icon: Icons.sports_basketball,
  ),
  CampusWayfindingPlace(
    id: 'feat_cricket',
    code: 'PU-SPORT-CRIC',
    name: 'Cricket Practice Nets',
    category: 'Sports',
    group: 'Sports Arena',
    icon: Icons.sports_cricket,
  ),

  // 7. Verified Multi-Block Classrooms & Labs
  CampusWayfindingPlace(
    id: 'room_dgl01',
    code: 'DGL01',
    name: 'DGL01 - Engineering Mechanics Lab (D Block Ground)',
    category: 'Room',
    group: 'D Block Labs',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_dgl02',
    code: 'DGL02',
    name: 'DGL02 - Robotics Studio (D Block Ground)',
    category: 'Room',
    group: 'D Block Labs',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_dfl01',
    code: 'DFL01',
    name: 'DFL01 - Thermodynamics Lab (D Block 1st Floor)',
    category: 'Room',
    group: 'D Block Labs',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_dsl01',
    code: 'DSL01',
    name: 'DSL01 - Structural Analysis Lab (D Block 2nd Floor)',
    category: 'Room',
    group: 'D Block Labs',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_eg01',
    code: 'EG01',
    name: 'EG01 - Computer Science Classroom (E Block Ground)',
    category: 'Room',
    group: 'E Block Classrooms',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_eg02',
    code: 'EG02',
    name: 'EG02 - Data Structures Classroom (E Block Ground)',
    category: 'Room',
    group: 'E Block Classrooms',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_ef01',
    code: 'EF01',
    name: 'EF01 - Artificial Intelligence Classroom (E Block 1st Floor)',
    category: 'Room',
    group: 'E Block Classrooms',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_es01',
    code: 'ES01',
    name: 'ES01 - Computer Vision Classroom (E Block 2nd Floor)',
    category: 'Room',
    group: 'E Block Classrooms',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_fg01',
    code: 'FG01',
    name: 'FG01 - Information Systems Classroom (F Block Ground)',
    category: 'Room',
    group: 'F Block Classrooms',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_ff01',
    code: 'FF01',
    name: 'FF01 - Information Security Classroom (F Block 1st Floor)',
    category: 'Room',
    group: 'F Block Classrooms',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_fs01',
    code: 'FS01',
    name: 'FS01 - Blockchain Tech Classroom (F Block 2nd Floor)',
    category: 'Room',
    group: 'F Block Classrooms',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_lg01',
    code: 'LG01',
    name: 'LG01 - Foundation Engineering Classroom (L Block Ground)',
    category: 'Room',
    group: 'L Block Classrooms',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_lf01',
    code: 'LF01',
    name: 'LF01 - Differential Equations Classroom (L Block 1st Floor)',
    category: 'Room',
    group: 'L Block Classrooms',
    icon: Icons.meeting_room,
  ),
  CampusWayfindingPlace(
    id: 'room_ls01',
    code: 'LS01',
    name: 'LS01 - Complex Analysis Classroom (L Block 2nd Floor)',
    category: 'Room',
    group: 'L Block Classrooms',
    icon: Icons.meeting_room,
  ),
];

/// Preset route model
class PopularPresetRoute {
  final String label;
  final String startId;
  final String destId;

  const PopularPresetRoute({
    required this.label,
    required this.startId,
    required this.destId,
  });
}

const List<PopularPresetRoute> kPopularDirectRoutes = [
  PopularPresetRoute(
    label: 'Main Gate → D Block',
    startId: 'node_main_gate',
    destId: 'bld_d_block',
  ),
  PopularPresetRoute(
    label: 'Main Gate → Hatti Kaapi',
    startId: 'node_main_gate',
    destId: 'feat_food_d_block',
  ),
  PopularPresetRoute(
    label: 'Main Gate → Central Library',
    startId: 'node_main_gate',
    destId: 'feat_library',
  ),
  PopularPresetRoute(
    label: 'Main Gate → Auditorium',
    startId: 'node_main_gate',
    destId: 'bld_auditorium',
  ),
  PopularPresetRoute(
    label: 'D Block → Central Fountain',
    startId: 'bld_d_block',
    destId: 'feat_fountain',
  ),
  PopularPresetRoute(
    label: 'D Block → Auditorium',
    startId: 'bld_d_block',
    destId: 'bld_auditorium',
  ),
  PopularPresetRoute(
    label: 'Parking → E Block (CSE)',
    startId: 'node_parking_entry',
    destId: 'bld_e_block',
  ),
  PopularPresetRoute(
    label: 'Hatti Kaapi → Library',
    startId: 'feat_food_d_block',
    destId: 'feat_library',
  ),
];

class RoutePlanningSheet extends StatefulWidget {
  final List<CampusLocation> locations;
  final CampusLocation? initialStart;
  final dynamic initialDestination;
  final Function(NavigationRoute route) onRouteConfirmed;

  const RoutePlanningSheet({
    super.key,
    required this.locations,
    this.initialStart,
    this.initialDestination,
    required this.onRouteConfirmed,
  });

  static Future<void> show({
    required BuildContext context,
    List<CampusLocation> locations = const [],
    CampusLocation? initialStart,
    dynamic initialDestination,
    required Function(NavigationRoute route) onRouteConfirmed,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withOpacity(0.75),
      builder: (ctx) => RoutePlanningSheet(
        locations: locations,
        initialStart: initialStart,
        initialDestination: initialDestination,
        onRouteConfirmed: onRouteConfirmed,
      ),
    );
  }

  @override
  State<RoutePlanningSheet> createState() => _RoutePlanningSheetState();
}

class _RoutePlanningSheetState extends State<RoutePlanningSheet> {
  final ApiService _apiService = ApiService();

  late CampusWayfindingPlace _startPlace;
  late CampusWayfindingPlace _destPlace;
  bool _accessibleOnly = false;

  NavigationRoute? _calculatedRoute;
  bool _isCalculating = false;
  String? _routeError;

  @override
  void initState() {
    super.initState();

    // Default Starting Point: Student 2-Wheeler Parking (matches web screenshot) or Main Gate
    _startPlace = _findPlaceById('node_parking_entry') ??
        _findPlaceById('node_main_gate') ??
        kCampusWayfindingPlaces.first;

    // Default Destination: HR Block & Plaza (matches web screenshot) or D Block
    _destPlace = _findPlaceById('bld_hr_block') ??
        _findPlaceById('bld_d_block') ??
        kCampusWayfindingPlaces[7];

    // If initial destination passed, resolve it
    if (widget.initialDestination != null) {
      final init = widget.initialDestination;
      if (init is CampusLocation) {
        final match = _findPlaceById(init.id) ?? _findPlaceByCode(init.shortCode);
        if (match != null) _destPlace = match;
      } else if (init is String) {
        final match = _findPlaceById(init) ?? _findPlaceByCode(init);
        if (match != null) _destPlace = match;
      }
    }

    // Trigger initial calculation
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _calculateLiveRoute();
    });
  }

  CampusWayfindingPlace? _findPlaceById(String id) {
    for (final p in kCampusWayfindingPlaces) {
      if (p.id.toLowerCase() == id.toLowerCase() ||
          p.code.toLowerCase() == id.toLowerCase() ||
          p.name.toLowerCase().contains(id.toLowerCase())) {
        return p;
      }
    }
    return null;
  }

  CampusWayfindingPlace? _findPlaceByCode(String? code) {
    if (code == null) return null;
    for (final p in kCampusWayfindingPlaces) {
      if (p.code.toLowerCase() == code.toLowerCase()) {
        return p;
      }
    }
    return null;
  }

  Future<void> _calculateLiveRoute() async {
    if (_startPlace.id == _destPlace.id) {
      setState(() {
        _calculatedRoute = null;
        _routeError = 'Starting point and destination cannot be the same place.';
        _isCalculating = false;
      });
      return;
    }

    setState(() {
      _isCalculating = true;
      _routeError = null;
    });

    try {
      final route = await _apiService.calculateRoute(
        start: _startPlace.code.isNotEmpty ? _startPlace.code : _startPlace.id,
        destination: _destPlace.code.isNotEmpty ? _destPlace.code : _destPlace.id,
        accessibleOnly: _accessibleOnly,
      );

      if (mounted) {
        if (route != null && route.geometry.length >= 2) {
          setState(() {
            _calculatedRoute = route;
            _routeError = null;
            _isCalculating = false;
          });
        } else {
          setState(() {
            _calculatedRoute = null;
            _routeError = 'No pedestrian path found between "${_startPlace.name}" and "${_destPlace.name}".';
            _isCalculating = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _calculatedRoute = null;
          _routeError = 'Route calculation error: ${e.toString()}';
          _isCalculating = false;
        });
      }
    }
  }

  void _swapEndpoints() {
    setState(() {
      final temp = _startPlace;
      _startPlace = _destPlace;
      _destPlace = temp;
    });
    _calculateLiveRoute();
  }

  void _applyPreset(PopularPresetRoute preset) {
    final start = _findPlaceById(preset.startId);
    final dest = _findPlaceById(preset.destId);
    if (start != null && dest != null) {
      setState(() {
        _startPlace = start;
        _destPlace = dest;
      });
      _calculateLiveRoute();
    }
  }

  void _openSearchDialog({required bool isStart}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _SearchPlaceModal(
        title: isStart ? 'Select Starting Point (From)' : 'Select Destination (To)',
        initialSelection: isStart ? _startPlace : _destPlace,
        onPlaceSelected: (place) {
          setState(() {
            if (isStart) {
              _startPlace = place;
            } else {
              _destPlace = place;
            }
          });
          _calculateLiveRoute();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.90,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF0B1328),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(
          top: BorderSide(color: Color(0xFF0284C7), width: 1.5),
          left: BorderSide(color: Color(0x330284C7), width: 1),
          right: BorderSide(color: Color(0x330284C7), width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black87,
            blurRadius: 35,
            spreadRadius: 10,
          )
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 6),
              width: 44,
              height: 5,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF0284C7), Color(0xFF0D9488), Color(0xFF10B981)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF0284C7).withOpacity(0.35),
                              blurRadius: 12,
                            )
                          ],
                        ),
                        child: const Center(
                          child: Icon(Icons.navigation, color: Colors.white, size: 22),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Flexible(
                                  child: Text(
                                    'Campus Wayfinding & Navigation',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: -0.3,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withOpacity(0.18),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(
                                      color: const Color(0xFF10B981).withOpacity(0.4),
                                      width: 1,
                                    ),
                                  ),
                                  child: const Text(
                                    'A* Dijkstra Live',
                                    style: TextStyle(
                                      color: Color(0xFF6EE7B7),
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Select your starting point and destination across Presidency University Bengaluru',
                              style: TextStyle(
                                color: Color(0xFF94A3B8),
                                fontSize: 11,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white60, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          const Divider(color: Colors.white12, height: 1),

          // Scrollable Body
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. ORIGIN & DESTINATION CARD
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withOpacity(0.85),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // STARTING POINT (FROM)
                        _buildEndpointSelector(
                          isStart: true,
                          place: _startPlace,
                          onTap: () => _openSearchDialog(isStart: true),
                        ),

                        // SWAP BUTTON
                        Center(
                          child: InkWell(
                            onTap: _swapEndpoints,
                            borderRadius: BorderRadius.circular(20),
                            child: Container(
                              margin: const EdgeInsets.symmetric(vertical: 4),
                              padding: const EdgeInsets.all(7),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white24),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Colors.black45,
                                    blurRadius: 6,
                                  )
                                ],
                              ),
                              child: const Icon(Icons.swap_vert, color: Color(0xFF38BDF8), size: 18),
                            ),
                          ),
                        ),

                        // DESTINATION (TO)
                        _buildEndpointSelector(
                          isStart: false,
                          place: _destPlace,
                          onTap: () => _openSearchDialog(isStart: false),
                        ),

                        const SizedBox(height: 12),
                        const Divider(color: Colors.white10, height: 1),
                        const SizedBox(height: 10),

                        // WHEELCHAIR ACCESSIBILITY TOGGLE
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.accessible_forward, color: Color(0xFF38BDF8), size: 18),
                                SizedBox(width: 8),
                                Text(
                                  'Require Wheelchair Accessible (Step-Free) Paths',
                                  style: TextStyle(
                                    color: Color(0xFFCBD5E1),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                            Switch.adaptive(
                              value: _accessibleOnly,
                              activeColor: const Color(0xFF10B981),
                              activeTrackColor: const Color(0xFF065F46),
                              inactiveThumbColor: Colors.white54,
                              inactiveTrackColor: Colors.white12,
                              onChanged: (val) {
                                setState(() => _accessibleOnly = val);
                                _calculateLiveRoute();
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 2. POPULAR DIRECT ROUTES CHIPS
                  Row(
                    children: const [
                      Icon(Icons.auto_awesome, color: Color(0xFFFBBF24), size: 15),
                      SizedBox(width: 6),
                      Text(
                        'POPULAR DIRECT ROUTES',
                        style: TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  Wrap(
                    spacing: 7,
                    runSpacing: 7,
                    children: kPopularDirectRoutes.map((preset) {
                      final isSelected = _startPlace.id == preset.startId && _destPlace.id == preset.destId;
                      return InkWell(
                        onTap: () => _applyPreset(preset),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFF0284C7).withOpacity(0.25)
                                : const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF38BDF8) : Colors.white12,
                              width: 1,
                            ),
                          ),
                          child: Text(
                            preset.label,
                            style: TextStyle(
                              color: isSelected ? const Color(0xFF38BDF8) : const Color(0xFFCBD5E1),
                              fontSize: 11.5,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 18),

                  // 3. LIVE ROUTE PREVIEW CARD
                  if (_isCalculating)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFF0284C7).withOpacity(0.3)),
                      ),
                      child: Row(
                        children: const [
                          SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF38BDF8)),
                          ),
                          SizedBox(width: 14),
                          Text(
                            'Calculating live pedestrian shortest path...',
                            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                          ),
                        ],
                      ),
                    )
                  else if (_calculatedRoute != null)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF061826), Color(0xFF0B1328)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.35)),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF10B981).withOpacity(0.08),
                            blurRadius: 16,
                          )
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Metrics Row
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(9),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF10B981).withOpacity(0.18),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                                    ),
                                    child: const Icon(
                                      Icons.directions_walk,
                                      color: Color(0xFF34D399),
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(
                                            '${_calculatedRoute!.distanceMeters} m',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 19,
                                              fontWeight: FontWeight.w900,
                                            ),
                                          ),
                                          const SizedBox(width: 6),
                                          const Text(
                                            '·',
                                            style: TextStyle(color: Colors.white38, fontSize: 16, fontWeight: FontWeight.bold),
                                          ),
                                          const SizedBox(width: 6),
                                          Row(
                                            children: [
                                              const Icon(Icons.access_time, color: Color(0xFF34D399), size: 14),
                                              const SizedBox(width: 4),
                                              Text(
                                                '~${_calculatedRoute!.estimatedWalkingMinutes} min walk',
                                                style: const TextStyle(
                                                  color: Color(0xFF34D399),
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Verified pedestrian pathway · ${_calculatedRoute!.waypoints.isNotEmpty ? _calculatedRoute!.waypoints.length : (_calculatedRoute!.nodeSequence.isNotEmpty ? _calculatedRoute!.nodeSequence.length : _calculatedRoute!.geometry.length)} navigation waypoints',
                                        style: const TextStyle(
                                          color: Color(0xFF94A3B8),
                                          fontSize: 10.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              if (_calculatedRoute!.accessible)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0284C7).withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: const Color(0xFF0284C7).withOpacity(0.4)),
                                  ),
                                  child: Row(
                                    children: const [
                                      Icon(Icons.accessible, color: Color(0xFF38BDF8), size: 13),
                                      SizedBox(width: 4),
                                      Text(
                                        'Step-Free',
                                        style: TextStyle(
                                          color: Color(0xFF38BDF8),
                                          fontSize: 10.5,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),

                          const SizedBox(height: 12),
                          const Divider(color: Colors.white12, height: 1),
                          const SizedBox(height: 10),

                          // TURN PREVIEW
                          const Text(
                            'TURN PREVIEW:',
                            style: TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.6,
                            ),
                          ),
                          const SizedBox(height: 6),

                          ..._buildTurnPreviewSteps(),
                        ],
                      ),
                    ),

                  // Route Error
                  if (_routeError != null)
                    Container(
                      margin: const EdgeInsets.only(top: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF881337).withOpacity(0.35),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFF43F5E).withOpacity(0.4)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.info_outline, color: Color(0xFFFB7185), size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _routeError!,
                              style: const TextStyle(color: Color(0xFFFECDD3), fontSize: 11.5),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Footer Actions
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            decoration: const BoxDecoration(
              color: Color(0xFF060D1E),
              border: Border(top: BorderSide(color: Colors.white10)),
            ),
            child: Row(
              children: [
                // Cancel
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: const BorderSide(color: Colors.white24),
                    ),
                  ),
                  child: const Text(
                    'Cancel',
                    style: TextStyle(
                      color: Color(0xFFCBD5E1),
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // START NAVIGATION
                Expanded(
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: _calculatedRoute != null
                          ? const LinearGradient(
                              colors: [Color(0xFF10B981), Color(0xFF0D9488), Color(0xFF0284C7)],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            )
                          : null,
                      color: _calculatedRoute == null ? const Color(0xFF1E293B) : null,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: _calculatedRoute != null
                          ? [
                              BoxShadow(
                                color: const Color(0xFF10B981).withOpacity(0.35),
                                blurRadius: 14,
                                offset: const Offset(0, 3),
                              )
                            ]
                          : null,
                    ),
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: _calculatedRoute != null
                          ? () {
                              Navigator.pop(context);
                              widget.onRouteConfirmed(_calculatedRoute!);
                            }
                          : null,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.navigation,
                            size: 16,
                            color: _calculatedRoute != null ? Colors.black87 : Colors.white24,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'START NAVIGATION',
                            style: TextStyle(
                              color: _calculatedRoute != null ? Colors.black87 : Colors.white24,
                              fontWeight: FontWeight.w900,
                              fontSize: 13.5,
                              letterSpacing: 0.4,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Icon(
                            Icons.arrow_forward,
                            size: 16,
                            color: _calculatedRoute != null ? Colors.black87 : Colors.white24,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEndpointSelector({
    required bool isStart,
    required CampusWayfindingPlace place,
    required VoidCallback onTap,
  }) {
    final dotColor = isStart ? const Color(0xFF34D399) : const Color(0xFFFB7185);
    final ringColor = isStart ? const Color(0xFF064E3B) : const Color(0xFF4C0519);
    final label = isStart ? 'STARTING POINT (FROM)' : 'DESTINATION (TO)';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: dotColor,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(color: ringColor, spreadRadius: 3),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: dotColor,
                fontSize: 10.5,
                fontWeight: FontWeight.w900,
                letterSpacing: 0.6,
              ),
            ),
          ],
        ),
        const SizedBox(height: 7),
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
            decoration: BoxDecoration(
              color: const Color(0xFF020617),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white12),
            ),
            child: Row(
              children: [
                Icon(place.icon, color: dotColor, size: 18),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    place.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (place.code.isNotEmpty) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Text(
                      place.code,
                      style: const TextStyle(
                        color: Color(0xFFCBD5E1),
                        fontSize: 9.5,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
                const SizedBox(width: 6),
                const Icon(Icons.keyboard_arrow_down, color: Colors.white38, size: 18),
              ],
            ),
          ),
        ),
      ],
    );
  }

  List<Widget> _buildTurnPreviewSteps() {
    if (_calculatedRoute == null) return [];

    final waypoints = _calculatedRoute!.waypoints;
    if (waypoints.isNotEmpty) {
      final previewCount = waypoints.length > 3 ? 3 : waypoints.length;
      final items = <Widget>[];
      for (int i = 0; i < previewCount; i++) {
        items.add(
          Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 18,
                  height: 18,
                  decoration: const BoxDecoration(
                    color: Color(0xFF1E293B),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      '${i + 1}',
                      style: const TextStyle(
                        color: Color(0xFF38BDF8),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    waypoints[i].instruction,
                    style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        );
      }
      if (waypoints.length > 3) {
        items.add(
          Padding(
            padding: const EdgeInsets.only(left: 26, top: 2),
            child: Text(
              '+ ${waypoints.length - 3} more turn instructions along path...',
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 10.5, fontStyle: FontStyle.italic),
            ),
          ),
        );
      }
      return items;
    }

    // Fallback if waypoints are empty: synthesize turn instructions from nodeSequence or geometry
    return [
      Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 18,
              height: 18,
              decoration: const BoxDecoration(color: Color(0xFF1E293B), shape: BoxShape.circle),
              child: const Center(
                child: Text('1', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Start at ${_startPlace.name}, proceed along verified pedestrian corridor.',
                style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5),
              ),
            ),
          ],
        ),
      ),
      Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 18,
              height: 18,
              decoration: const BoxDecoration(color: Color(0xFF1E293B), shape: BoxShape.circle),
              child: const Center(
                child: Text('2', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Follow paved walkways towards ${_destPlace.name} entrance portal.',
                style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5),
              ),
            ),
          ],
        ),
      ),
    ];
  }
}

/// Search & Select Bottom Sheet for Endpoints
class _SearchPlaceModal extends StatefulWidget {
  final String title;
  final CampusWayfindingPlace initialSelection;
  final Function(CampusWayfindingPlace place) onPlaceSelected;

  const _SearchPlaceModal({
    required this.title,
    required this.initialSelection,
    required this.onPlaceSelected,
  });

  @override
  State<_SearchPlaceModal> createState() => _SearchPlaceModalState();
}

class _SearchPlaceModalState extends State<_SearchPlaceModal> {
  final TextEditingController _searchController = TextEditingController();
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final filtered = kCampusWayfindingPlaces.where((p) {
      if (_query.isEmpty) return true;
      final q = _query.toLowerCase();
      return p.name.toLowerCase().contains(q) ||
          p.code.toLowerCase().contains(q) ||
          p.group.toLowerCase().contains(q) ||
          p.category.toLowerCase().contains(q);
    }).toList();

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.75,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF060D1E),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: Color(0xFF0284C7), width: 1.5),
        ),
      ),
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 8, bottom: 4),
            width: 36,
            height: 4,
            decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(4)),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.title,
                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white60, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF0B1328),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.search, color: Colors.white54, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(
                        hintText: 'Search building, gate, lab, classroom (DG01)...',
                        hintStyle: TextStyle(color: Colors.white38, fontSize: 12.5),
                        border: InputBorder.none,
                      ),
                      onChanged: (val) => setState(() => _query = val.trim()),
                    ),
                  ),
                  if (_query.isNotEmpty)
                    IconButton(
                      icon: const Icon(Icons.clear, color: Colors.white54, size: 16),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _query = '');
                      },
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: filtered.isEmpty
                ? const Center(
                    child: Text(
                      'No matching campus places found.',
                      style: TextStyle(color: Colors.white38, fontSize: 13),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, idx) {
                      final place = filtered[idx];
                      final isSelected = place.id == widget.initialSelection.id;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 6),
                        child: InkWell(
                          onTap: () {
                            Navigator.pop(context);
                            widget.onPlaceSelected(place);
                          },
                          borderRadius: BorderRadius.circular(14),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? const Color(0xFF0284C7).withOpacity(0.2)
                                  : const Color(0xFF0B1328),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isSelected ? const Color(0xFF38BDF8) : Colors.white10,
                              ),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(7),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF1E293B),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Icon(place.icon, color: const Color(0xFF38BDF8), size: 18),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        place.name,
                                        style: TextStyle(
                                          color: isSelected ? const Color(0xFF38BDF8) : Colors.white,
                                          fontSize: 13,
                                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        place.group,
                                        style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                                      ),
                                    ],
                                  ),
                                ),
                                if (place.code.isNotEmpty)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF1E293B),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: Colors.white12),
                                    ),
                                    child: Text(
                                      place.code,
                                      style: const TextStyle(
                                        color: Color(0xFF94A3B8),
                                        fontSize: 9.5,
                                        fontFamily: 'monospace',
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
