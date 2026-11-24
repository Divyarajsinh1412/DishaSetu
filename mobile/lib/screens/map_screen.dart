import 'dart:math' as math;
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
  bool _showDefBlocksLayer = true;
  bool _showBuildingsLayer = true;
  bool _showWalkingPathsLayer = true;
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

  void _autoFitActiveRoute(NavigationRoute route) {
    if (_useGpsMap) {
      if (route.geometry.length >= 2) {
        final bounds = LatLngBounds.fromPoints(
          route.geometry.map((pt) => ll.LatLng(pt[0], pt[1])).toList(),
        );
        _mapController.fitCamera(
          CameraFit.bounds(
            bounds: bounds,
            padding: const EdgeInsets.only(top: 140, bottom: 230, left: 60, right: 60),
          ),
        );
      }
    } else {
      final normPoints = CampusGeometries.projectRouteToNormalized(route);
      if (normPoints.length >= 2) {
        final xs = normPoints.map((p) => p.dx).toList();
        final ys = normPoints.map((p) => p.dy).toList();
        final minX = xs.reduce(math.min);
        final maxX = xs.reduce(math.max);
        final minY = ys.reduce(math.min);
        final maxY = ys.reduce(math.max);
        final midX = (minX + maxX) / 2;
        final midY = (minY + maxY) / 2;

        const targetScale = 1.65;
        final matrix = Matrix4.identity()
          ..scale(targetScale, targetScale)
          ..translate(-(midX - 0.5) * 400, -(midY - 0.5) * 568);
        _transformController.value = matrix;
      }
    }
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

    if (route == null || route.geometry.length < 2) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFFE11D48),
            content: Text(
              'Unable to calculate walking route to ${destination.name}. Please ensure destination is connected to campus walking paths.',
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),
        );
      }
      setState(() => _isLoading = false);
      return;
    }

    setState(() {
      _activeRoute = route;
      _selectedMarker = destination;
      _isLoading = false;
    });
    _autoFitActiveRoute(route);
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

    if (route == null || route.geometry.length < 2) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFFE11D48),
            content: Text(
              'Unable to calculate walking route to ${room.roomNumber} (${destination.name}).',
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),
        );
      }
      setState(() => _isLoading = false);
      return;
    }

    setState(() {
      _activeRoute = route;
      _selectedMarker = destination;
      _isLoading = false;
    });
    _autoFitActiveRoute(route);

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

    // If DEF Blocks boundary selected, show details card directly
    if (loc.id == 'feat_def_blocks' || loc.category == 'boundary') {
      return;
    }

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

  void _showRoutePlanningDialog([dynamic initialDest]) {
    RoutePlanningSheet.show(
      context: context,
      locations: _markers,
      initialDestination: initialDest,
      onRouteConfirmed: (route) {
        setState(() {
          _activeRoute = route;
          _isLoading = false;
        });
        _autoFitActiveRoute(route);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFF0D9488),
              content: Row(
                children: [
                  const Icon(Icons.navigation, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Navigating to ${route.endName} (${route.distanceMeters}m · ~${route.estimatedWalkingMinutes} min)',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              duration: const Duration(seconds: 3),
            ),
          );
        }
      },
    );
  }

  void _showLayersSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Row(
                    children: [
                      Icon(Icons.layers, color: Color(0xFF38BDF8), size: 22),
                      SizedBox(width: 10),
                      Text(
                        'Campus Map Layers',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Toggle surveyed KML boundaries, buildings, and walking networks.',
                    style: TextStyle(color: Colors.white60, fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  // DEF Blocks Layer Toggle
                  Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _showDefBlocksLayer
                            ? const Color(0xFFFBC02D).withValues(alpha: 0.5)
                            : Colors.transparent,
                      ),
                    ),
                    child: SwitchListTile(
                      activeColor: const Color(0xFFFBC02D),
                      title: const Text(
                        'DEF Blocks Boundary',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      subtitle: const Text(
                        'Exact Surveyed Boundary • D, E, F Blocks Complex',
                        style: TextStyle(color: Colors.white60, fontSize: 11),
                      ),
                      value: _showDefBlocksLayer,
                      onChanged: (val) {
                        setState(() => _showDefBlocksLayer = val);
                        setSheetState(() {});
                      },
                    ),
                  ),
                  // Building Footprints
                  Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _showBuildingsLayer
                            ? const Color(0xFF0284C7).withValues(alpha: 0.5)
                            : Colors.transparent,
                      ),
                    ),
                    child: SwitchListTile(
                      activeColor: const Color(0xFF0284C7),
                      title: const Text(
                        'Building Footprints',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      subtitle: const Text(
                        'Academic Blocks (D, E, F, L, N, M), Offices & Facilities',
                        style: TextStyle(color: Colors.white60, fontSize: 11),
                      ),
                      value: _showBuildingsLayer,
                      onChanged: (val) {
                        setState(() => _showBuildingsLayer = val);
                        setSheetState(() {});
                      },
                    ),
                  ),
                  // Walking Paths & Networks
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _showWalkingPathsLayer
                            ? const Color(0xFF10B981).withValues(alpha: 0.5)
                            : Colors.transparent,
                      ),
                    ),
                    child: SwitchListTile(
                      activeColor: const Color(0xFF10B981),
                      title: const Text(
                        'Walking Paths & Corridors',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      subtitle: const Text(
                        'Pedestrian Centerlines, Covered Walkways & Portals',
                        style: TextStyle(color: Colors.white60, fontSize: 11),
                      ),
                      value: _showWalkingPathsLayer,
                      onChanged: (val) {
                        setState(() => _showWalkingPathsLayer = val);
                        setSheetState(() {});
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
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
            if (poly.id == 'feat_def_blocks' && !_showDefBlocksLayer) continue;
            if (poly.id != 'feat_def_blocks' && !_showBuildingsLayer) continue;
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
                  description: poly.id == 'feat_def_blocks'
                      ? 'Exact surveyed boundary polygon for DEF Blocks complex extracted from Google Earth KML.'
                      : null,
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
        // Surveyed KML Polygons & Boundaries
        PolygonLayer(
          polygons: CampusGeometries.kmlPolygons
              .where((poly) {
                if (poly.id == 'feat_def_blocks') return _showDefBlocksLayer;
                return _showBuildingsLayer;
              })
              .map((poly) {
                final isDef = poly.id == 'feat_def_blocks';
                return Polygon(
                  points: poly.points,
                  color: isDef ? const Color(0x40FBC02D) : Color(poly.colorHex),
                  borderColor: isDef ? const Color(0xFFFBC02D) : Color(poly.strokeColorHex),
                  borderStrokeWidth: isDef ? 3.5 : 2.0,
                  isFilled: true,
                );
              }).toList(),
        ),
        // Walking paths
        if (_showWalkingPathsLayer)
          PolylineLayer(
            polylines: [
              ...CampusGeometries.allPaths.map((path) {
                return Polyline(
                  points: path.points,
                  strokeWidth: 4.0,
                  color: Color(path.colorHex),
                );
              }),
            ],
          ),
        // Active Navigation Route Polyline Layer (Always visible during active navigation)
        if (_activeRoute != null && _activeRoute!.geometry.isNotEmpty)
          PolylineLayer(
            polylines: [
              // Outer glow line
              Polyline(
                points: _activeRoute!.geometry
                    .map((pt) => ll.LatLng(pt[0], pt[1]))
                    .toList(),
                strokeWidth: 9.0,
                color: const Color(0x6010B981),
              ),
              // Inner solid emerald line
              Polyline(
                points: _activeRoute!.geometry
                    .map((pt) => ll.LatLng(pt[0], pt[1]))
                    .toList(),
                strokeWidth: 5.0,
                color: const Color(0xFF10B981),
              ),
            ],
          ),
        // Marker Pins Layer
        MarkerLayer(
          markers: [
            // 1. Campus building and facility markers
            ..._filteredMarkers.map((marker) {
              final isSelected = _selectedMarker?.id == marker.id;
              final isDimmed = _activeRoute != null && !isSelected;
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
                  child: Opacity(
                    opacity: isDimmed ? 0.45 : 1.0,
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
                ),
              );
            }),
            // 2. Dedicated START Marker (🟢 START)
            if (_activeRoute != null &&
                _activeRoute!.startLatitude != null &&
                _activeRoute!.startLongitude != null)
              Marker(
                point: ll.LatLng(
                  _activeRoute!.startLatitude!,
                  _activeRoute!.startLongitude!,
                ),
                width: 140,
                height: 72,
                alignment: Alignment.topCenter,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF064E3B), // Dark Emerald
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF34D399), width: 1.5),
                        boxShadow: const [
                          BoxShadow(color: Colors.black54, blurRadius: 6, offset: Offset(0, 2)),
                        ],
                      ),
                      child: Text(
                        '🟢 START · ${_activeRoute!.startName}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Color(0xFFA7F3D0),
                          fontSize: 9.5,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2.5),
                        boxShadow: const [
                          BoxShadow(color: Color(0x8010B981), blurRadius: 10, spreadRadius: 3),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          'A',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            // 3. Dedicated DESTINATION Marker (🔴 DESTINATION)
            if (_activeRoute != null &&
                _activeRoute!.endLatitude != null &&
                _activeRoute!.endLongitude != null)
              Marker(
                point: ll.LatLng(
                  _activeRoute!.endLatitude!,
                  _activeRoute!.endLongitude!,
                ),
                width: 160,
                height: 72,
                alignment: Alignment.topCenter,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF881337), // Dark Rose
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFB7185), width: 1.5),
                        boxShadow: const [
                          BoxShadow(color: Colors.black54, blurRadius: 6, offset: Offset(0, 2)),
                        ],
                      ),
                      child: Text(
                        '🔴 DESTINATION · ${_activeRoute!.endName}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Color(0xFFFECDD3),
                          fontSize: 9.5,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE11D48),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2.5),
                        boxShadow: const [
                          BoxShadow(color: Color(0x80E11D48), blurRadius: 10, spreadRadius: 3),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          'B',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            // 4. Current GPS location marker
            if (_currentGpsPosition != null)
              Marker(
                point: ll.LatLng(
                  _currentGpsPosition!.latitude,
                  _currentGpsPosition!.longitude,
                ),
                width: 26,
                height: 26,
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF38BDF8),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2.5),
                    boxShadow: const [
                      BoxShadow(color: Color(0x8038BDF8), blurRadius: 8, spreadRadius: 2),
                    ],
                  ),
                ),
              ),
          ],
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
            icon: const Icon(Icons.layers_outlined, color: Color(0xFFFBC02D)),
            tooltip: 'Map Layers (DEF Blocks, Footprints, Paths)',
            onPressed: _showLayersSheet,
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
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: ActionChip(
                          avatar: const Icon(Icons.directions, color: Color(0xFF38BDF8), size: 16),
                          label: const Text(
                            'Wayfinding',
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF38BDF8),
                            ),
                          ),
                          backgroundColor: const Color(0xFF0284C7).withOpacity(0.18),
                          side: const BorderSide(color: Color(0xFF38BDF8), width: 1),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          onPressed: () => _showRoutePlanningDialog(),
                        ),
                      ),
                      ..._categories.map((cat) {
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
                      }),
                    ],
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

                              // 1b. DEF Blocks Boundary Layer (Surveyed KML Boundary)
                              if (_showDefBlocksLayer) ...[
                                Builder(builder: (context) {
                                  final isDefSelected = _selectedMarker?.id == 'feat_def_blocks';
                                  // Bounds spanning D, E, F blocks cleanly: minX 0.115, maxX 0.280, minY 0.590, maxY 0.815
                                  final left = 0.115 * mapWidth;
                                  final top = 0.590 * mapHeight;
                                  final width = 0.165 * mapWidth;
                                  final height = 0.225 * mapHeight;

                                  return Stack(
                                    clipBehavior: Clip.none,
                                    children: [
                                      // Clean outline boundary box (Transparent fill so D, E, F blocks remain 100% visible)
                                      Positioned(
                                        left: left,
                                        top: top,
                                        width: width,
                                        height: height,
                                        child: GestureDetector(
                                          behavior: HitTestBehavior.translucent,
                                          onTap: () {
                                            final loc = CampusLocation(
                                              id: 'feat_def_blocks',
                                              name: 'DEF Blocks',
                                              label: 'DEF BLOCKS BOUNDARY',
                                              category: 'boundary',
                                              latitude: 13.168076,
                                              longitude: 77.533300,
                                              description:
                                                  'Exact surveyed boundary polygon for DEF Blocks complex extracted from Google Earth KML.',
                                            );
                                            _onBuildingSelected(loc);
                                          },
                                          child: Container(
                                            decoration: BoxDecoration(
                                              color: isDefSelected
                                                  ? const Color(0x28FBC02D)
                                                  : const Color(0x08FBC02D),
                                              borderRadius: BorderRadius.circular(16),
                                              border: Border.all(
                                                color: const Color(0xFFFBC02D),
                                                width: isDefSelected ? 2.5 : 1.6,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),

                                      // Unobtrusive Top Boundary Tag (Never wraps, never obscures D or E block)
                                      Positioned(
                                        left: left + 10,
                                        top: top - 9,
                                        child: IgnorePointer(
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF0F172A),
                                              borderRadius: BorderRadius.circular(4),
                                              border: Border.all(color: const Color(0xFFFBC02D), width: 1),
                                              boxShadow: const [
                                                BoxShadow(color: Colors.black54, blurRadius: 4),
                                              ],
                                            ),
                                            child: const Text(
                                              'DEF BLOCKS COMPLEX',
                                              maxLines: 1,
                                              softWrap: false,
                                              style: TextStyle(
                                                fontSize: 8,
                                                fontWeight: FontWeight.w900,
                                                color: Color(0xFFFDE68A),
                                                letterSpacing: 0.6,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  );
                                }),
                              ],

                              // 2. Interactive Building Footprints Layer (Every building is directly clickable & highlightable)
                              if (_showBuildingsLayer)
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
                                );                              }),

                              // 6. Dedicated START and DESTINATION Markers on Master Map
                              if (_activeRoute != null) ...[
                                Builder(builder: (context) {
                                  final startNorm = CampusGeometries.getStartNormalizedPoint(_activeRoute!);
                                  final endNorm = CampusGeometries.getEndNormalizedPoint(_activeRoute!);
                                  final startX = startNorm.dx * mapWidth;
                                  final startY = startNorm.dy * mapHeight;
                                  final endX = endNorm.dx * mapWidth;
                                  final endY = endNorm.dy * mapHeight;

                                  return Stack(
                                    clipBehavior: Clip.none,
                                    children: [
                                      // 🟢 START Marker (Layer 6)
                                      Positioned(
                                        left: startX - 70,
                                        top: startY - 62,
                                        width: 140,
                                        child: Column(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF064E3B), // Dark Emerald
                                                borderRadius: BorderRadius.circular(12),
                                                border: Border.all(color: const Color(0xFF34D399), width: 1.5),
                                                boxShadow: const [
                                                  BoxShadow(color: Colors.black54, blurRadius: 6, offset: Offset(0, 2)),
                                                ],
                                              ),
                                              child: Text(
                                                '🟢 START · ${_activeRoute!.startName}',
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                  color: Color(0xFFA7F3D0),
                                                  fontSize: 9.5,
                                                  fontWeight: FontWeight.w900,
                                                ),
                                              ),
                                            ),
                                            const SizedBox(height: 3),
                                            Container(
                                              width: 32,
                                              height: 32,
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF059669),
                                                shape: BoxShape.circle,
                                                border: Border.all(color: Colors.white, width: 2.5),
                                                boxShadow: const [
                                                  BoxShadow(color: Color(0x8010B981), blurRadius: 10, spreadRadius: 3),
                                                ],
                                              ),
                                              child: const Center(
                                                child: Text(
                                                  'A',
                                                  style: TextStyle(
                                                    color: Colors.white,
                                                    fontWeight: FontWeight.w900,
                                                    fontSize: 13,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      // 🔴 DESTINATION Marker (Layer 7)
                                      Positioned(
                                        left: endX - 80,
                                        top: endY - 62,
                                        width: 160,
                                        child: Column(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF881337), // Dark Rose
                                                borderRadius: BorderRadius.circular(12),
                                                border: Border.all(color: const Color(0xFFFB7185), width: 1.5),
                                                boxShadow: const [
                                                  BoxShadow(color: Colors.black54, blurRadius: 6, offset: Offset(0, 2)),
                                                ],
                                              ),
                                              child: Text(
                                                '🔴 DESTINATION · ${_activeRoute!.endName}',
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                  color: Color(0xFFFECDD3),
                                                  fontSize: 9.5,
                                                  fontWeight: FontWeight.w900,
                                                ),
                                              ),
                                            ),
                                            const SizedBox(height: 3),
                                            Container(
                                              width: 32,
                                              height: 32,
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFE11D48),
                                                shape: BoxShape.circle,
                                                border: Border.all(color: Colors.white, width: 2.5),
                                                boxShadow: const [
                                                  BoxShadow(color: Color(0x80E11D48), blurRadius: 10, spreadRadius: 3),
                                                ],
                                              ),
                                              child: const Center(
                                                child: Text(
                                                  'B',
                                                  style: TextStyle(
                                                    color: Colors.white,
                                                    fontWeight: FontWeight.w900,
                                                    fontSize: 13,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  );
                                }),
                              ],

                              // 8. User Live GPS Pin on Master Map
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
                  bottom: (_activeRoute != null || _selectedMarker != null) ? 190 : 30,
                  child: Column(
                    children: [
                      _buildFloatingMapButton(Icons.directions, () => _showRoutePlanningDialog(), 'Wayfinding & Routes'),
                      const SizedBox(height: 8),
                      _buildFloatingMapButton(Icons.add, _zoomIn, 'Zoom In'),
                      const SizedBox(height: 8),
                      _buildFloatingMapButton(Icons.remove, _zoomOut, 'Zoom Out'),
                      const SizedBox(height: 8),
                      _buildFloatingMapButton(Icons.layers_outlined, _showLayersSheet, 'Map Layers'),
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

                // Floating Wayfinding Pill (Bottom Left)
                if (_activeRoute == null && _selectedMarker == null)
                  Positioned(
                    left: 16,
                    bottom: 30,
                    child: InkWell(
                      onTap: () => _showRoutePlanningDialog(),
                      borderRadius: BorderRadius.circular(24),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF0284C7), Color(0xFF0D9488), Color(0xFF10B981)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF0284C7).withValues(alpha: 0.4),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            )
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(Icons.directions, color: Colors.white, size: 18),
                            SizedBox(width: 8),
                            Text(
                              'Wayfinding & Routes',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 13,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ],
                        ),
                      ),
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

                                // Active Navigation Control Card
                if (_activeRoute != null)
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 20,
                    child: _buildActiveNavigationBottomCard(_activeRoute!),
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


  Widget _buildActiveNavigationBottomCard(NavigationRoute route) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withOpacity(0.96),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF334155)),
        boxShadow: const [
          BoxShadow(color: Colors.black54, blurRadius: 16, offset: Offset(0, 4)),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.directions_walk, color: Color(0xFF10B981), size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${route.distanceMeters} meters · ~${route.estimatedWalkingMinutes} min walk',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${route.startName} → ${route.endName}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.center_focus_strong, color: Color(0xFF38BDF8)),
                tooltip: 'Fit Route',
                onPressed: () => _autoFitActiveRoute(route),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white70),
                tooltip: 'Stop Navigation',
                onPressed: () {
                  setState(() => _activeRoute = null);
                },
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _autoFitActiveRoute(route),
                  icon: const Icon(Icons.my_location, size: 16),
                  label: const Text('Recenter Route'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E293B),
                    foregroundColor: const Color(0xFF38BDF8),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: const BorderSide(color: Color(0xFF334155)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    setState(() => _activeRoute = null);
                  },
                  icon: const Icon(Icons.stop_circle_outlined, size: 16),
                  label: const Text('Stop Navigation'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE11D48),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ),
            ],
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
