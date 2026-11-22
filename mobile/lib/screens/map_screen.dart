import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as ll;
import '../services/api_service.dart';
import '../models/campus_location.dart';
import '../models/navigation_route.dart';
import '../models/building.dart';
import '../models/floor.dart';
import '../data/campus_geometries.dart';
import '../widgets/building_bottom_sheet.dart';
import '../widgets/navigation_guidance_bar.dart';
import '../widgets/route_planning_sheet.dart';

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
  }

  @override
  void dispose() {
    _transformController.dispose();
    _searchController.dispose();
    super.dispose();
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
    final route = await _apiService.calculateRoute(
      start: 'node_main_gate',
      destination: destination.shortCode ?? destination.id,
    );
    setState(() {
      _activeRoute = route;
      _selectedMarker = destination;
      _isLoading = false;
    });
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
                  setState(() => _selectedMarker = marker);
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
    _showIndoorMapDialog(loc);
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

                              // 2. Active Route Polyline Overlay
                              if (_activeRoute != null && _selectedMarker != null)
                                CustomPaint(
                                  size: Size(mapWidth, mapHeight),
                                  painter: RouteOverlayPainter(
                                    destX: _selectedMarker!.imageX * mapWidth,
                                    destY: _selectedMarker!.imageY * mapHeight,
                                  ),
                                ),

                              // 3. Interactive Building & Facility Markers
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
                                      setState(() => _selectedMarker = marker);
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

                              // 4. Default Entrance/Gate GPS Reference Indicator
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
                      if (_selectedMarker != null) ...[
                        const SizedBox(height: 8),
                        _buildFloatingMapButton(Icons.my_location, _focusSelectedMarker, 'Focus Selected'),
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

                // Selected Location Bottom Card
                if (_selectedMarker != null)
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
                    icon: const Icon(Icons.map, size: 16),
                    label: const Text('Open Indoor Map', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => _showIndoorMapDialog(loc),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.navigation, size: 16),
                    label: const Text('Indoor Nav', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
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
                  label: const Text('Walk to Building (GPS)'),
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
  final double destX;
  final double destY;

  RouteOverlayPainter({required this.destX, required this.destY});

  @override
  void paint(Canvas canvas, Size size) {
    // Start at Main Gate (normalized ~0.5695, 0.2449)
    final startX = size.width * 0.5695;
    final startY = size.height * 0.2449;

    final paint = Paint()
      ..color = const Color(0xFF10B981)
      ..strokeWidth = 4.0
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final shadowPaint = Paint()
      ..color = const Color(0xFF10B981).withOpacity(0.4)
      ..strokeWidth = 8.0
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final path = Path()
      ..moveTo(startX, startY)
      // Avenue midpoint near Fountain
      ..lineTo(size.width * 0.4940, size.height * 0.5127)
      ..lineTo(size.width * 0.4666, size.height * 0.5995)
      ..lineTo(destX, destY);

    canvas.drawPath(path, shadowPaint);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant RouteOverlayPainter oldDelegate) {
    return oldDelegate.destX != destX || oldDelegate.destY != destY;
  }
}
