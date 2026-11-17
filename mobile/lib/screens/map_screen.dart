import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../services/api_service.dart';
import '../models/campus_location.dart';
import '../models/navigation_route.dart';

class CampusMapScreen extends StatefulWidget {
  const CampusMapScreen({super.key});

  @override
  State<CampusMapScreen> createState() => _CampusMapScreenState();
}

class _CampusMapScreenState extends State<CampusMapScreen> {
  final MapController _mapController = MapController();
  final ApiService _apiService = ApiService();

  // Presidency University Main Gate coordinates
  static const LatLng _mainGateCoords = LatLng(13.1717995, 77.5361915);
  static const LatLng _campusCenter = LatLng(13.1705, 77.5358);

  List<CampusLocation> _locations = [];
  CampusLocation? _selectedLocation;
  NavigationRoute? _activeRoute;
  bool _isLoading = true;
  bool _isNavigating = false;
  String _activeCategory = 'all';

  @override
  void initState() {
    super.initState();
    _loadLocations();
  }

  Future<void> _loadLocations() async {
    setState(() => _isLoading = true);
    final list = await _apiService.fetchLocations();
    setState(() {
      _locations = list;
      _isLoading = false;
    });
  }

  Future<void> _startRouteTo(CampusLocation loc) async {
    setState(() => _isLoading = true);
    final route = await _apiService.calculateRoute(
      start: 'node_main_gate',
      destination: loc.shortCode ?? loc.id,
    );
    setState(() {
      _activeRoute = route;
      _selectedLocation = loc;
      _isNavigating = true;
      _isLoading = false;
    });

    if (route != null && route.geometry.isNotEmpty) {
      final points = route.geometry.map((p) => LatLng(p[0], p[1])).toList();
      final bounds = LatLngBounds.fromPoints(points);
      _mapController.fitCamera(
        CameraFit.bounds(
          bounds: bounds,
          padding: const EdgeInsets.all(50),
        ),
      );
    }
  }

  void _fitCampus() {
    _mapController.move(_campusCenter, 17.5);
  }

  void _focusMainGate() {
    _mapController.move(_mainGateCoords, 18.5);
  }

  List<CampusLocation> get _filteredLocations {
    if (_activeCategory == 'all') return _locations;
    return _locations.where((l) => l.category.toLowerCase() == _activeCategory.toLowerCase()).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B132B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'DishaSetu Campus GIS',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
            ),
            Text(
              'Presidency University Bengaluru',
              style: TextStyle(fontSize: 11, color: Color(0xFF38BDF8)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF38BDF8)),
            onPressed: _loadLocations,
            tooltip: 'Sync Campus Data',
          ),
        ],
      ),
      body: Stack(
        children: [
          // FlutterMap Tile & Overlay Layer
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _mainGateCoords,
              initialZoom: 18.0,
              minZoom: 15.0,
              maxZoom: 20.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.presidency.dishasetu',
              ),

              // Active Walking Route Polyline
              if (_activeRoute != null && _activeRoute!.geometry.isNotEmpty)
                PolylineLayer(
                  polylines: [
                    // Outer glow
                    Polyline(
                      points: _activeRoute!.geometry
                          .map((p) => LatLng(p[0], p[1]))
                          .toList(),
                      color: const Color(0xFF0284C7).withOpacity(0.5),
                      strokeWidth: 9.0,
                    ),
                    // Inner route path
                    Polyline(
                      points: _activeRoute!.geometry
                          .map((p) => LatLng(p[0], p[1]))
                          .toList(),
                      color: const Color(0xFF38BDF8),
                      strokeWidth: 4.5,
                    ),
                  ],
                ),

              // Campus POI Markers Layer
              MarkerLayer(
                markers: [
                  // Main Gate Base Marker
                  Marker(
                    point: _mainGateCoords,
                    width: 40,
                    height: 40,
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        boxShadow: const [
                          BoxShadow(color: Color(0xFF10B981), blurRadius: 10),
                        ],
                      ),
                      child: const Icon(Icons.meeting_room, color: Colors.white, size: 20),
                    ),
                  ),

                  // Dynamic Location Markers
                  ..._filteredLocations.map((loc) {
                    final isDest = _selectedLocation?.id == loc.id;
                    Color markerColor = const Color(0xFF38BDF8);
                    IconData iconData = Icons.place;

                    if (loc.category == 'Gate') {
                      markerColor = const Color(0xFF10B981);
                      iconData = Icons.door_sliding;
                    } else if (loc.category == 'Cafe') {
                      markerColor = const Color(0xFFF59E0B);
                      iconData = Icons.coffee;
                    } else if (loc.category == 'Medical') {
                      markerColor = const Color(0xFFEF4444);
                      iconData = Icons.medical_services;
                    } else if (loc.category == 'Library') {
                      markerColor = const Color(0xFF6366F1);
                      iconData = Icons.menu_book;
                    } else if (loc.category == 'Parking') {
                      markerColor = const Color(0xFFF97316);
                      iconData = Icons.local_parking;
                    }

                    return Marker(
                      point: LatLng(loc.latitude, loc.longitude),
                      width: isDest ? 44 : 36,
                      height: isDest ? 44 : 36,
                      child: GestureDetector(
                        onTap: () {
                          setState(() => _selectedLocation = loc);
                          _showLocationDetails(loc);
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: isDest ? const Color(0xFFF43F5E) : markerColor,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                            boxShadow: [
                              BoxShadow(
                                color: (isDest ? const Color(0xFFF43F5E) : markerColor).withOpacity(0.6),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                          child: Icon(
                            isDest ? Icons.flag : iconData,
                            color: Colors.white,
                            size: isDest ? 22 : 18,
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ],
          ),

          // Top Category Filter Chips
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildCategoryChip('all', 'All Places', Icons.explore),
                  _buildCategoryChip('Gate', 'Gates', Icons.meeting_room),
                  _buildCategoryChip('Academic', 'Academic', Icons.school),
                  _buildCategoryChip('Cafe', 'Cafeterias', Icons.restaurant),
                  _buildCategoryChip('Medical', 'Health', Icons.local_hospital),
                  _buildCategoryChip('Library', 'Library', Icons.menu_book),
                  _buildCategoryChip('Parking', 'Parking', Icons.local_parking),
                ],
              ),
            ),
          ),

          // Floating Action Controls (Fit Campus, Main Gate)
          Positioned(
            right: 16,
            bottom: _isNavigating ? 190 : 80,
            child: Column(
              children: [
                FloatingActionButton.small(
                  heroTag: 'fit_campus',
                  backgroundColor: const Color(0xFF1E293B),
                  onPressed: _fitCampus,
                  tooltip: 'Fit Campus Overview',
                  child: const Icon(Icons.fullscreen, color: Color(0xFF38BDF8)),
                ),
                const SizedBox(height: 8),
                FloatingActionButton.small(
                  heroTag: 'main_gate',
                  backgroundColor: const Color(0xFF1E293B),
                  onPressed: _focusMainGate,
                  tooltip: 'Focus Main Gate',
                  child: const Icon(Icons.door_front_door, color: Color(0xFF10B981)),
                ),
              ],
            ),
          ),

          // Active Navigation Guidance Sheet
          if (_isNavigating && _activeRoute != null)
            Positioned(
              left: 12,
              right: 12,
              bottom: 16,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withOpacity(0.96),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.4)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.5),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'WALKING NAVIGATION ACTIVE',
                                style: TextStyle(
                                  color: Color(0xFF38BDF8),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.2,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _selectedLocation?.name ?? _activeRoute!.endName,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.grey, size: 20),
                          onPressed: () {
                            setState(() {
                              _isNavigating = false;
                              _activeRoute = null;
                            });
                          },
                        ),
                      ],
                    ),
                    const Divider(color: Color(0xFF334155), height: 16),
                    Row(
                      children: [
                        const Icon(Icons.directions_walk, color: Color(0xFF10B981), size: 18),
                        const SizedBox(width: 6),
                        Text(
                          '${_activeRoute!.distanceMeters} meters',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Icon(Icons.schedule, color: Color(0xFFF59E0B), size: 18),
                        const SizedBox(width: 6),
                        Text(
                          '~${_activeRoute!.estimatedWalkingMinutes} min walk',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    if (_activeRoute!.waypoints.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.navigation, color: Color(0xFF38BDF8), size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _activeRoute!.waypoints.first.instruction,
                                style: const TextStyle(color: Colors.white, fontSize: 12),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String catId, String label, IconData icon) {
    final isSelected = _activeCategory == catId;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        avatar: Icon(
          icon,
          size: 14,
          color: isSelected ? Colors.white : const Color(0xFF38BDF8),
        ),
        label: Text(label),
        labelStyle: TextStyle(
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? Colors.white : Colors.grey[300],
        ),
        selected: isSelected,
        selectedColor: const Color(0xFF2563EB),
        backgroundColor: const Color(0xFF1E293B).withOpacity(0.9),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: isSelected ? const Color(0xFF38BDF8) : const Color(0xFF334155),
          ),
        ),
        onSelected: (_) {
          setState(() => _activeCategory = catId);
        },
      ),
    );
  }

  void _showLocationDetails(CampusLocation loc) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2563EB).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.4)),
                    ),
                    child: Text(
                      loc.category.toUpperCase(),
                      style: const TextStyle(
                        color: Color(0xFF38BDF8),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Text(
                    loc.shortCode ?? '',
                    style: const TextStyle(color: Colors.grey, fontSize: 11, fontFamily: 'monospace'),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                loc.name,
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              Text(
                loc.description ?? 'Official campus destination at Presidency University.',
                style: const TextStyle(color: Colors.grey, fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.directions_walk, color: Colors.white),
                  label: const Text('Start Walking Navigation'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    _startRouteTo(loc);
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
