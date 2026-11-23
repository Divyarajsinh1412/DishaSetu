import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as ll;
import 'package:geolocator/geolocator.dart';
import '../services/api_service.dart';
import '../models/campus_location.dart';
import '../models/navigation_route.dart';
import '../models/building.dart';
import '../models/floor.dart';
import '../data/campus_geometries.dart';
import '../widgets/building_bottom_sheet.dart';
import '../widgets/navigation_guidance_bar.dart';
import '../widgets/route_planning_sheet.dart';
import 'indoor_navigation_screen.dart';

const double kMapAspectRatio = 583.0 / 829.0;

class CampusMapScreen extends StatefulWidget {
  const CampusMapScreen({super.key});

  @override
  State<CampusMapScreen> createState() => _CampusMapScreenState();
}

class _CampusMapScreenState extends State<CampusMapScreen> {
  final TransformationController _transformController = TransformationController();
  final MapController _mapController = MapController();
  final ApiService _apiService = ApiService();

  List<CampusLocation> _markers = [];
  CampusLocation? _selectedMarker;
  NavigationRoute? _activeRoute;
  Position? _currentGpsPosition;
  bool _isLoading = true;
  bool _useGpsMap = false;
  String _activeCategory = 'all';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  final List<String> _categories = [
    'all',
    'Academic',
    'Gate',
    'Parking',
    'Sports',
    'Garden',
    'Cafe',
    'Library',
    'Medical',
    'Facility'
  ];

  @override
  void initState() {
    super.initState();
    _loadMapMarkers();
    _fetchUserLocation();
  }

  @override
  void dispose() {
    _transformController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchUserLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
        final pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 4),
        );
        setState(() {
          _currentGpsPosition = pos;
        });
      }
    } catch (_) {}
  }

  Future<void> _loadMapMarkers() async {
    setState(() => _isLoading = true);
    final list = await _apiService.fetchMapMarkers();
    setState(() {
      _markers = list;
      _isLoading = false;
    });
  }

  void _resetMapFit() {
    _transformController.value = Matrix4.identity();
  }

  void _zoomIn() {
    final matrix = _transformController.value.clone();
    matrix.scale(1.35, 1.35);
    _transformController.value = matrix;
  }

  void _zoomOut() {
    final matrix = _transformController.value.clone();
    matrix.scale(0.74, 0.74);
    _transformController.value = matrix;
  }

  void _focusSelectedMarker() {
    if (_selectedMarker == null) return;
    final matrix = Matrix4.identity();
    matrix.scale(2.4, 2.4);
    _transformController.value = matrix;
  }

  Future<void> _startNavigationTo(CampusLocation destination) async {
    setState(() => _isLoading = true);
    final startIdentifier = _currentGpsPosition != null
        ? '${_currentGpsPosition!.latitude},${_currentGpsPosition!.longitude}'
        : 'node_main_gate';
    final route = await _apiService.calculateRoute(
      start: startIdentifier,
      destination: destination.shortCode ?? destination.id,
    );
    setState(() {
      _activeRoute = route;
      _selectedMarker = destination;
      _isLoading = false;
    });
  }

  Future<void> _startRoomNavigation(CampusLocation destination, Room room) async {
    setState(() => _isLoading = true);
    final startIdentifier = _currentGpsPosition != null
        ? '${_currentGpsPosition!.latitude},${_currentGpsPosition!.longitude}'
        : 'node_main_gate';
    final route = await _apiService.calculateRoute(
      start: startIdentifier,
      destination: destination.shortCode ?? destination.id,
    );
    setState(() {
      _activeRoute = route;
      _selectedMarker = destination;
      _isLoading = false;
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF065F46),
          content: Text(
            'Navigating to ${room.roomNumber} [${room.typeLabel}] · ${room.name} · ${destination.name}',
            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
          ),
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  void _onBuildingSelected(CampusLocation loc) {
    setState(() {
      _selectedMarker = loc;
    });

    // If it's an Academic building or block, immediately open the comprehensive floor & room browser
    if (loc.category == 'Academic' ||
        loc.name.toLowerCase().contains('block') ||
        loc.shortCode?.contains('BLOCK') == true) {
      BuildingBottomSheet.show(
        context,
        building: Building.fromCampusLocation(loc),
        onNavigateToRoom: (room) {
          _startRoomNavigation(loc, room);
        },
        onStartNavigation: () {
          _startNavigationTo(loc);
        },
      );
    } else if (loc.category == 'Cafe' || loc.shortCode == 'PU-CAFE-D-BLOCK') {
      _showCafeMenuDialog(loc);
    }
  }

  void _showRoutePlanningDialog([CampusLocation? initialDest]) {
    if (_markers.isEmpty) return;
    RoutePlanningSheet.show(
      context: context,
      locations: _markers,
      initialDestination: initialDest,
      onRouteSelected: (start, dest, accessible) async {
        setState(() => _isLoading = true);
        final route = await _apiService.calculateRoute(
          start: start.shortCode ?? start.id,
          destination: dest.shortCode ?? dest.id,
          accessibleOnly: accessible,
        );
        setState(() {
          _activeRoute = route;
          _selectedMarker = dest;
          _isLoading = false;
        });
      },
    );
  }

  Widget _buildGpsMap() {
    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: CampusGeometries.referenceCenter,
        initialZoom: CampusGeometries.initialZoom,
        minZoom: 15.0,
        maxZoom: 19.5,
        onTap: (tapPosition, point) {
          // Check if tapped inside any surveyed polygon
          for (final poly in CampusGeometries.allPolygons) {
            if (poly.contains(point)) {
              final loc = _markers.firstWhere(
                (m) =>
                    m.id == poly.id ||
                    m.name.toLowerCase().contains(poly.name.toLowerCase()),
                orElse: () => CampusLocation(
                  id: poly.id,
                  name: poly.name,
                  label: poly.label,
                  category: poly.category,
                  latitude: poly.center.latitude,
                  longitude: poly.center.longitude,
                ),
              );
              _onBuildingSelected(loc);
              return;
            }
          }

          // Tolerance check near any marker pin
          CampusLocation? closest;
          double minD = 0.0004;
          for (final m in _markers) {
            final d = (m.latitude - point.latitude).abs() +
                (m.longitude - point.longitude).abs();
            if (d < minD) {
              minD = d;
              closest = m;
            }
          }
          if (closest != null) {
            _onBuildingSelected(closest);
          }
        },
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.presidency.dishasetu',
        ),
        // Surveyed KML Polygons
        PolygonLayer(
          polygons: CampusGeometries.kmlPolygons.map((poly) {
            return Polygon(
              points: poly.points,
              color: Color(poly.colorHex),
              borderColor: Color(poly.strokeColorHex),
              borderStrokeWidth: 2.0,
              isFilled: true,
            );
          }).toList(),
        ),
        // Walking paths
        PolylineLayer(
          polylines: [
            ...CampusGeometries.allPaths.map((path) {
              return Polyline(
                points: path.points,
                strokeWidth: 4.0,
                color: Color(path.colorHex),
              );
            }),
            if (_activeRoute != null && _activeRoute!.geometry.isNotEmpty)
              Polyline(
                points: _activeRoute!.geometry
                    .map((pt) => ll.LatLng(pt[0], pt[1]))
                    .toList(),
                strokeWidth: 5.0,
                color: const Color(0xFF10B981),
              ),
          ],
        ),
        // Marker Pins
        MarkerLayer(
          markers: _filteredMarkers.map((marker) {
            final isSelected = _selectedMarker?.id == marker.id;
            final color = _getCategoryColor(marker.category);
            final icon = _getCategoryIcon(marker.category);

            return Marker(
              point: ll.LatLng(marker.latitude, marker.longitude),
              width: isSelected ? 38 : 30,
              height: isSelected ? 38 : 30,
              child: GestureDetector(
                onTap: () {
                  _onBuildingSelected(marker);
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.white,
                      width: isSelected ? 3 : 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: isSelected
                            ? color.withOpacity(0.8)
                            : Colors.black45,
                        blurRadius: isSelected ? 12 : 4,
                        spreadRadius: isSelected ? 3 : 0,
                      ),
                    ],
                  ),
                  child: Icon(
                    icon,
                    size: isSelected ? 18 : 14,
                    color: Colors.white,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  void _showIndoorMapDialog(CampusLocation loc) {
    BuildingBottomSheet.show(
      context,
      building: Building.fromCampusLocation(loc),
      onNavigateToRoom: (Room room) {
        _startNavigationTo(loc);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF0284C7),
            content: Text(
              'Navigating to ${room.name} (${room.roomCode}) · [${room.typeLabel}]',
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
            ),
            duration: const Duration(seconds: 4),
          ),
        );
      },
    );
  }

  void _showIndoorNavDialog(CampusLocation loc) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => IndoorNavigationScreen(
          initialBuilding: Building.fromCampusLocation(loc),
          initialMode: 'blueprint',
        ),
      ),
    );
  }

  List<CampusLocation> get _filteredMarkers {
    return _markers.where((m) {
      final matchesCategory = _activeCategory == 'all' ||
          m.category.toLowerCase() == _activeCategory.toLowerCase();
      final matchesSearch = _searchQuery.isEmpty ||
          m.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (m.shortCode != null &&
              m.shortCode!.toLowerCase().contains(_searchQuery.toLowerCase())) ||
          (m.label != null &&
              m.label!.toLowerCase().contains(_searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    }).toList();
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'Academic':
        return const Color(0xFFF59E0B);
      case 'Gate':
        return const Color(0xFF10B981);
      case 'Parking':
        return const Color(0xFF0284C7);
      case 'Sports':
        return const Color(0xFF16A34A);
      case 'Garden':
        return const Color(0xFF0D9488);
      case 'Cafe':
        return const Color(0xFFEA580C);
      case 'Library':
        return const Color(0xFF4F46E5);
      case 'Medical':
        return const Color(0xFFE11D48);
      case 'Security':
        return const Color(0xFFB91C1C);
      case 'Transport':
        return const Color(0xFF9333EA);
      default:
        return const Color(0xFF64748B);
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'Academic':
        return Icons.school;
      case 'Gate':
        return Icons.meeting_room;
      case 'Parking':
        return Icons.local_parking;
      case 'Sports':
        return Icons.sports_soccer;
      case 'Garden':
        return Icons.park;
      case 'Cafe':
        return Icons.coffee;
      case 'Library':
        return Icons.menu_book;
      case 'Medical':
        return Icons.local_hospital;
      case 'Security':
        return Icons.shield;
      case 'Transport':
        return Icons.directions_bus;
      default:
        return Icons.place;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF071B32),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 2,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF0284C7).withOpacity(0.4)),
              ),
              child: const Icon(Icons.navigation, color: Color(0xFF38BDF8), size: 18),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'DishaSetu',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    _useGpsMap
                        ? 'Live GPS Map (OSM & KML Boundaries)'
                        : 'Presidency Campus Master Map (${_markers.length} Locations)',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.white.withOpacity(0.7),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(
              _useGpsMap ? Icons.map_outlined : Icons.satellite_alt,
              color: const Color(0xFF38BDF8),
            ),
            tooltip: _useGpsMap ? 'Switch to Master Map' : 'Switch to Live GPS Map',
            onPressed: () => setState(() => _useGpsMap = !_useGpsMap),
          ),
          IconButton(
            icon: const Icon(Icons.directions, color: Color(0xFF38BDF8)),
            tooltip: 'Directions',
            onPressed: () => _showRoutePlanningDialog(),
          ),
          IconButton(
            icon: const Icon(Icons.center_focus_strong, color: Color(0xFF10B981)),
            tooltip: 'Fit Campus',
            onPressed: _resetMapFit,
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white70),
            tooltip: 'Reload Markers',
            onPressed: _loadMapMarkers,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Category Chips Header
          Container(
            color: const Color(0xFF0F172A),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Column(
              children: [
                // Search Input
                TextField(
                  controller: _searchController,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search building, gate, cafe, parking...',
                    hintStyle: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13),
                    prefixIcon: const Icon(Icons.search, color: Colors.white60, size: 20),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, color: Colors.white60, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF334155)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF0284C7)),
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                // Category Filter Scroll
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: _categories.map((cat) {
                      final isSelected = _activeCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: FilterChip(
                          label: Text(
                            cat == 'all' ? 'All Locations' : cat,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              color: isSelected ? Colors.white : Colors.white70,
                            ),
                          ),
                          selected: isSelected,
                          onSelected: (_) => setState(() => _activeCategory = cat),
                          backgroundColor: const Color(0xFF1E293B),
                          selectedColor: const Color(0xFF0284C7),
                          checkmarkColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                            side: BorderSide(
                              color: isSelected ? const Color(0xFF38BDF8) : Colors.transparent,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          // Main Interactive Campus Map Viewer
          Expanded(
            child: Stack(
              children: [
                if (_useGpsMap)
                  Positioned.fill(child: _buildGpsMap())
                else
                  InteractiveViewer(
                  transformationController: _transformController,
                  minScale: 0.8,
                  maxScale: 4.5,
                  boundaryMargin: const EdgeInsets.all(200),
                  child: Center(
                    child: AspectRatio(
                      aspectRatio: kMapAspectRatio,
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          final mapWidth = constraints.maxWidth;
                          final mapHeight = constraints.maxHeight;

                          return Stack(
                            clipBehavior: Clip.none,
                            children: [
                              // 1. Original Presidency University Campus Master Map Image
                              Positioned.fill(
                                child: Image.asset(
                                  'assets/maps/presidency-campus-master-map.png',
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Image.asset(
                                      'assets/maps/presidency-campus-master-map.jpg',
                                      fit: BoxFit.contain,
                                    );
                                  },
                                ),
                              ),

                              // 2. Interactive Building Footprints Layer (Every building is directly clickable & highlightable)
                              ...CampusGeometries.campusBuildings.map((b) {
                                final isSelected = _selectedMarker?.id == b.id ||
                                    (_selectedMarker != null &&
                                        b.blockLetter.isNotEmpty &&
                                        _selectedMarker!.name.toLowerCase().contains(
                                            '${b.blockLetter.toLowerCase()} block'));

                                final left = b.minX * mapWidth;
                                final top = b.minY * mapHeight;
                                final width = (b.maxX - b.minX) * mapWidth;
                                final height = (b.maxY - b.minY) * mapHeight;

                                return Positioned(
                                  left: left,
                                  top: top,
                                  width: width,
                                  height: height,
                                  child: GestureDetector(
                                    behavior: HitTestBehavior.opaque,
                                    onTap: () {
                                      final loc = _markers.firstWhere(
                                        (m) =>
                                            m.id == b.id ||
                                            (b.blockLetter.isNotEmpty &&
                                                m.name.toLowerCase().contains(
                                                    '${b.blockLetter.toLowerCase()} block')),
                                        orElse: () => b.toLocation(),
                                      );
                                      _onBuildingSelected(loc);
                                    },
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? const Color(0x380284C7)
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(
                                          color: isSelected
                                              ? const Color(0xFF38BDF8)
                                              : Colors.transparent,
                                          width: isSelected ? 2.5 : 0,
                                        ),
                                        boxShadow: isSelected
                                            ? const [
                                                BoxShadow(
                                                  color: Color(0x660284C7),
                                                  blurRadius: 10,
                                                  spreadRadius: 2,
                                                ),
                                              ]
                                            : null,
                                      ),
                                    ),
                                  ),
                                );
                              }),

                              // 3. Canvas Background Coordinate Tap Fallback
                              Positioned.fill(
                                child: GestureDetector(
                                  behavior: HitTestBehavior.translucent,
                                  onTapUp: (details) {
                                    final normX = details.localPosition.dx / mapWidth;
                                    final normY = details.localPosition.dy / mapHeight;
                                    final building = CampusGeometries.findBuildingAt(normX, normY);
                                    if (building != null) {
                                      final loc = _markers.firstWhere(
                                        (m) =>
                                            m.id == building.id ||
                                            (building.blockLetter.isNotEmpty &&
                                                m.name.toLowerCase().contains(
                                                    '${building.blockLetter.toLowerCase()} block')),
                                        orElse: () => building.toLocation(),
                                      );
                                      _onBuildingSelected(loc);
                                    }
                                  },
                                ),
                              ),

                              // 4. Active Route Polyline Overlay
                              if (_activeRoute != null)
                                CustomPaint(
                                  size: Size(mapWidth, mapHeight),
                                  painter: RouteOverlayPainter(
                                    route: _activeRoute!,
                                    selectedMarker: _selectedMarker,
                                  ),
                                ),

                              // 5. Interactive Building & Facility Markers
                              ..._filteredMarkers.map((marker) {
                                final isSelected = _selectedMarker?.id == marker.id;
                                final posX = marker.imageX * mapWidth;
                                final posY = marker.imageY * mapHeight;
                                final color = _getCategoryColor(marker.category);
                                final icon = _getCategoryIcon(marker.category);

                                return Positioned(
                                  left: posX - 14,
                                  top: posY - 14,
                                  child: GestureDetector(
                                    onTap: () {
                                      _onBuildingSelected(marker);
                                    },
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      width: isSelected ? 34 : 26,
                                      height: isSelected ? 34 : 26,
                                      decoration: BoxDecoration(
                                        color: color,
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: Colors.white,
                                          width: isSelected ? 3 : 2,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: isSelected
                                                ? color.withOpacity(0.8)
                                                : Colors.black45,
                                            blurRadius: isSelected ? 12 : 4,
                                            spreadRadius: isSelected ? 3 : 0,
                                          ),
                                        ],
                                      ),
                                      child: Icon(
                                        icon,
                                        size: isSelected ? 18 : 13,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                );
                              }),

                              // 6. User Live GPS Pin on Master Map
                              if (_currentGpsPosition != null) ...[
                                Builder(builder: (context) {
                                  final norm = CampusGeometries.projectGpsToNormalized(
                                    _currentGpsPosition!.latitude,
                                    _currentGpsPosition!.longitude,
                                  );
                                  return Positioned(
                                    left: norm.dx * mapWidth - 10,
                                    top: norm.dy * mapHeight - 10,
                                    child: Container(
                                      width: 20,
                                      height: 20,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0284C7),
                                        shape: BoxShape.circle,
                                        border: Border.all(color: Colors.white, width: 2.5),
                                        boxShadow: const [
                                          BoxShadow(
                                            color: Color(0xFF38BDF8),
                                            blurRadius: 10,
                                            spreadRadius: 2,
                                          ),
                                        ],
                                      ),
                                      child: const Center(
                                        child: Icon(Icons.my_location, size: 10, color: Colors.white),
                                      ),
                                    ),
                                  );
                                }),
                              ],

                              // 7. Default Entrance/Gate GPS Reference Indicator
                              Positioned(
                                left: 0.5695 * mapWidth - 8,
                                top: 0.2449 * mapHeight - 8,
                                child: Container(
                                  width: 16,
                                  height: 16,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0284C7),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                    boxShadow: const [
                                      BoxShadow(color: Color(0xFF0284C7), blurRadius: 8),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                  ),
                ),

                // Floating Zoom & Fit Controls (Right side)
                Positioned(
                  right: 16,
                  bottom: _selectedMarker != null ? 220 : 30,
                  child: Column(
                    children: [
                      _buildFloatingMapButton(Icons.add, _zoomIn, 'Zoom In'),
                      const SizedBox(height: 8),
                      _buildFloatingMapButton(Icons.remove, _zoomOut, 'Zoom Out'),
                      const SizedBox(height: 8),
                      _buildFloatingMapButton(Icons.crop_free, _resetMapFit, 'Fit Campus'),
                      const SizedBox(height: 8),
                      _buildFloatingMapButton(
                        Icons.my_location,
                        () async {
                          await _fetchUserLocation();
                          if (_currentGpsPosition != null) {
                            if (_useGpsMap) {
                              _mapController.move(
                                ll.LatLng(_currentGpsPosition!.latitude, _currentGpsPosition!.longitude),
                                18.0,
                              );
                            }
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  backgroundColor: const Color(0xFF0284C7),
                                  content: Text(
                                    'GPS Location: ±${_currentGpsPosition!.accuracy.toStringAsFixed(1)}m accuracy',
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  duration: const Duration(seconds: 2),
                                ),
                              );
                            }
                          }
                        },
                        'My Location',
                      ),
                      if (_selectedMarker != null) ...[
                        const SizedBox(height: 8),
                        _buildFloatingMapButton(Icons.center_focus_strong, _focusSelectedMarker, 'Focus Selected'),
                      ],
                    ],
                  ),
                ),

                // Loading Progress Bar
                if (_isLoading)
                  const Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: LinearProgressIndicator(
                      color: Color(0xFF38BDF8),
                      backgroundColor: Colors.transparent,
                      minHeight: 2,
                    ),
                  ),

                // Top Turn-by-Turn Navigation Guidance Bar
                if (_activeRoute != null)
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: NavigationGuidanceBar(
                      route: _activeRoute!,
                      onClose: () => setState(() => _activeRoute = null),
                    ),
                  ),

                // Selected Location Bottom Card (Hidden during active navigation to keep route visible)
                if (_selectedMarker != null && _activeRoute == null)
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 20,
                    child: _buildLocationDetailsCard(_selectedMarker!),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingMapButton(IconData icon, VoidCallback onPressed, String tooltip) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withOpacity(0.9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
        boxShadow: const [
          BoxShadow(color: Colors.black54, blurRadius: 8, offset: Offset(0, 3)),
        ],
      ),
      child: IconButton(
        icon: Icon(icon, color: const Color(0xFF38BDF8), size: 20),
        tooltip: tooltip,
        onPressed: onPressed,
      ),
    );
  }

  Widget _buildLocationDetailsCard(CampusLocation loc) {
    final color = _getCategoryColor(loc.category);
    final icon = _getCategoryIcon(loc.category);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withOpacity(0.96),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF334155)),
        boxShadow: const [
          BoxShadow(color: Colors.black54, blurRadius: 20, offset: Offset(0, 6)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: color.withOpacity(0.4)),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      loc.name,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${loc.category} · ${loc.latitude.toStringAsFixed(5)}°N, ${loc.longitude.toStringAsFixed(5)}°E',
                      style: const TextStyle(fontSize: 11, color: Colors.white60),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white60),
                onPressed: () => setState(() {
                  _selectedMarker = null;
                  _activeRoute = null;
                }),
              ),
            ],
          ),
          if (loc.description != null && loc.description!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              loc.description!,
              style: const TextStyle(fontSize: 12, color: Colors.white70),
            ),
          ],
          const SizedBox(height: 14),
          if (loc.category == 'Academic' || loc.name.contains('Block') || loc.shortCode?.contains('BLOCK') == true) ...[
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.layers, size: 16),
                    label: const Text('Floors & Rooms', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => _showIndoorMapDialog(loc),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.directions_walk, size: 16),
                    label: const Text('Navigate Here', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => _startNavigationTo(loc),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.architecture, color: Color(0xFF38BDF8), size: 18),
                    tooltip: '2D Blueprint',
                    onPressed: () => _showIndoorNavDialog(loc),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
          ],
          if (loc.category == 'Cafe' || loc.shortCode == 'PU-CAFE-D-BLOCK') ...[
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.coffee, size: 16),
                    label: const Text('View Cafe Menu & Specials', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD97706),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => _showCafeMenuDialog(loc),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
          ],
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.directions_walk, size: 18),
                  label: const Text('Start Walking Navigation'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E293B),
                    foregroundColor: const Color(0xFF38BDF8),
                    side: const BorderSide(color: Color(0xFF334155)),
                    padding: const EdgeInsets.symmetric(vertical: 11),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => _startNavigationTo(loc),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showCafeMenuDialog(CampusLocation loc) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD97706).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFD97706).withOpacity(0.4)),
                    ),
                    child: const Icon(Icons.coffee, color: Color(0xFFF59E0B), size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          loc.name,
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 2),
                        const Text('Traditional Filter Kaapi & South Indian Tiffin', style: TextStyle(fontSize: 12, color: Colors.white60)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text('Featured Menu Items', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white70)),
              const SizedBox(height: 8),
              _buildCafeItemRow('Filter Kaapi (Degree Decoction)', '₹25'),
              _buildCafeItemRow('Ghee Podi Thatte Idli (2 Pcs)', '₹50'),
              _buildCafeItemRow('Crispy Medu Vada with Chutney', '₹40'),
              _buildCafeItemRow('Heritage Mysore Strong Coffee', '₹30'),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.directions_walk),
                  label: const Text('Start Walking Navigation to Cafe'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    _startNavigationTo(loc);
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCafeItemRow(String name, String price) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Icon(Icons.circle, size: 8, color: Color(0xFF10B981)),
              const SizedBox(width: 8),
              Text(name, style: const TextStyle(fontSize: 13, color: Colors.white)),
            ],
          ),
          Text(price, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF10B981))),
        ],
      ),
    );
  }
}

/// Custom Painter for Navigation Route Overlays on Master Map
class RouteOverlayPainter extends CustomPainter {
  final NavigationRoute route;
  final CampusLocation? selectedMarker;

  RouteOverlayPainter({required this.route, this.selectedMarker});

  @override
  void paint(Canvas canvas, Size size) {
    final normPoints = CampusGeometries.projectRouteToNormalized(route);
    if (normPoints.length < 2) return;

    final points = normPoints
        .map((p) => Offset(p.dx * size.width, p.dy * size.height))
        .toList();

    // Draw Route Path with Outer Glow & Solid Core
    final glowPaint = Paint()
      ..color = const Color(0xFF10B981).withOpacity(0.35)
      ..strokeWidth = 9.0
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    final linePaint = Paint()
      ..color = const Color(0xFF10B981)
      ..strokeWidth = 4.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    final path = Path()..moveTo(points.first.dx, points.first.dy);
    for (int i = 1; i < points.length; i++) {
      path.lineTo(points[i].dx, points[i].dy);
    }

    canvas.drawPath(path, glowPaint);
    canvas.drawPath(path, linePaint);

    // Draw Start Origin Pin "A"
    final startPt = points.first;
    final startPinBg = Paint()..color = const Color(0xFF059669);
    final borderWhite = Paint()
      ..color = Colors.white
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;
    canvas.drawCircle(startPt, 11, startPinBg);
    canvas.drawCircle(startPt, 11, borderWhite);

    final textPainterA = TextPainter(
      text: const TextSpan(
        text: 'A',
        style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    textPainterA.paint(canvas, Offset(startPt.dx - 4.5, startPt.dy - 7));

    // Draw End Destination Pin "B"
    final endPt = points.last;
    final endPinBg = Paint()..color = const Color(0xFFE11D48);
    canvas.drawCircle(endPt, 11, endPinBg);
    canvas.drawCircle(endPt, 11, borderWhite);

    final textPainterB = TextPainter(
      text: const TextSpan(
        text: 'B',
        style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    textPainterB.paint(canvas, Offset(endPt.dx - 4.5, endPt.dy - 7));
  }

  @override
  bool shouldRepaint(covariant RouteOverlayPainter oldDelegate) {
    return oldDelegate.route != route || oldDelegate.selectedMarker != selectedMarker;
  }
}
