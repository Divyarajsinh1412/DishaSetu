import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../models/panorama_scene.dart';
import '../models/building.dart';
import '../services/indoor_service.dart';
import '../widgets/building_bottom_sheet.dart';

class PanoramaTourScreen extends StatefulWidget {
  const PanoramaTourScreen({super.key});

  @override
  State<PanoramaTourScreen> createState() => _PanoramaTourScreenState();
}

class _PanoramaTourScreenState extends State<PanoramaTourScreen> {
  final List<PanoramaScene> _scenes = PanoramaScene.getPreloadedScenes();
  late PanoramaScene _currentScene;

  double _yaw = 0.0;
  double _pitch = -10.0;
  double _zoom = 1.0;

  @override
  void initState() {
    super.initState();
    _currentScene = _scenes.first;
    _yaw = _currentScene.initialYaw;
    _pitch = _currentScene.initialPitch;
  }

  void _switchScene(PanoramaScene scene) {
    setState(() {
      _currentScene = scene;
      _yaw = scene.initialYaw;
      _pitch = scene.initialPitch;
    });
  }

  void _onPanUpdate(DragUpdateDetails details) {
    setState(() {
      _yaw -= details.delta.dx * 0.25;
      // Clamp pitch between -45 and 45
      _pitch = (_pitch + details.delta.dy * 0.25).clamp(-45.0, 45.0);
    });
  }

  void _zoomIn() {
    setState(() {
      _zoom = (_zoom * 1.25).clamp(0.7, 3.0);
    });
  }

  void _zoomOut() {
    setState(() {
      _zoom = (_zoom / 1.25).clamp(0.7, 3.0);
    });
  }

  void _resetView() {
    setState(() {
      _yaw = _currentScene.initialYaw;
      _pitch = _currentScene.initialPitch;
      _zoom = 1.0;
    });
  }

  void _openBuildingDetails(PanoramaHotspot hotspot) {
    final buildings = IndoorService.getAllCampusBuildings();
    Building? matched;
    for (final b in buildings) {
      if (b.code == hotspot.buildingShortCode || b.id == hotspot.locationId) {
        matched = b;
        break;
      }
    }

    if (matched != null) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: const Color(0xFF0F172A),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        builder: (ctx) => BuildingBottomSheet(
          building: matched!,
          onStartNavigation: () {
            Navigator.pop(ctx);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Starting navigation to ${matched!.name}...'),
                backgroundColor: const Color(0xFF0284C7),
              ),
            );
          },
        ),
      );
    } else {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(hotspot.title, style: const TextStyle(color: Colors.white, fontSize: 16)),
          content: Text(hotspot.description, style: const TextStyle(color: Colors.white70, fontSize: 13)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close', style: TextStyle(color: Color(0xFF38BDF8))),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.panorama_photosphere, color: Color(0xFF38BDF8), size: 18),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('360° Aerial Tour', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                Text(
                  'Presidency University • ${_currentScene.altitudeMeters.toInt()}m Altitude',
                  style: const TextStyle(color: Colors.white60, fontSize: 10),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white70, size: 20),
            tooltip: 'Reset Perspective',
            onPressed: _resetView,
          ),
        ],
      ),
      body: Stack(
        children: [
          // 1. Gesture Controlled Panoramic Sky Sphere View
          GestureDetector(
            onPanUpdate: _onPanUpdate,
            child: ClipRect(
              child: SizedBox.expand(
                child: Transform(
                  alignment: Alignment.center,
                  transform: Matrix4.identity()
                    ..scale(_zoom, _zoom)
                    ..translate(_yaw * 2.5, _pitch * 2.5),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Aerial Campus Photo Backing
                      Image.asset(
                        _currentScene.panoramaAsset,
                        fit: BoxFit.cover,
                        width: size.width * 2.5,
                        height: size.height * 2.5,
                        errorBuilder: (_, __, ___) {
                          return Container(
                            color: const Color(0xFF0F172A),
                            child: const Center(
                              child: Text('360 Aerial Panorama', style: TextStyle(color: Colors.white60)),
                            ),
                          );
                        },
                      ),

                      // Hotspots positioned in angular space
                      ..._currentScene.hotspots.map((hotspot) {
                        // Project hotspot yaw and pitch relative to current camera
                        final relYaw = hotspot.yaw - _yaw;
                        final relPitch = hotspot.pitch - _pitch;
                        final posX = (size.width / 2) + (relYaw * 12);
                        final posY = (size.height / 2) + (relPitch * 12);

                        return Positioned(
                          left: posX - 25,
                          top: posY - 25,
                          child: GestureDetector(
                            onTap: () => _openBuildingDetails(hotspot),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0284C7).withOpacity(0.85),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(0xFF38BDF8).withOpacity(0.5),
                                        blurRadius: 10,
                                        spreadRadius: 2,
                                      ),
                                    ],
                                  ),
                                  child: const Icon(Icons.apartment, color: Colors.white, size: 16),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.75),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.4)),
                                  ),
                                  child: Text(
                                    hotspot.buildingShortCode,
                                    style: const TextStyle(
                                      color: Color(0xFF38BDF8),
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // 2. Compass Orientation Indicator
          Positioned(
            top: 16,
            left: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.65),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white24),
              ),
              child: Row(
                children: [
                  Transform.rotate(
                    angle: (-_yaw * math.pi / 180),
                    child: const Icon(Icons.navigation, color: Color(0xFFF43F5E), size: 14),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'Heading: ${((_yaw % 360 + 360) % 360).toInt()}°',
                    style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),

          // 3. Zoom and View Controls
          Positioned(
            right: 16,
            top: 16,
            child: Column(
              children: [
                _buildMapActionBtn(icon: Icons.add, onPressed: _zoomIn, tooltip: 'Zoom In'),
                const SizedBox(height: 8),
                _buildMapActionBtn(icon: Icons.remove, onPressed: _zoomOut, tooltip: 'Zoom Out'),
                const SizedBox(height: 8),
                _buildMapActionBtn(icon: Icons.explore, onPressed: _resetView, tooltip: 'Level View'),
              ],
            ),
          ),

          // 4. Bottom Scene Selector Carousel
          Positioned(
            bottom: 20,
            left: 0,
            right: 0,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Info banner of current scene
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A).withOpacity(0.85),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: Color(0xFF38BDF8), size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _currentScene.description,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                ),

                // Scene Selector Cards
                SizedBox(
                  height: 64,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    scrollDirection: Axis.horizontal,
                    itemCount: _scenes.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, index) {
                      final scene = _scenes[index];
                      final isSelected = _currentScene.sceneId == scene.sceneId;

                      return GestureDetector(
                        onTap: () => _switchScene(scene),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF0284C7) : const Color(0xFF1E293B).withOpacity(0.9),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF38BDF8) : Colors.white12,
                              width: isSelected ? 1.5 : 1.0,
                            ),
                            boxShadow: [
                              if (isSelected)
                                BoxShadow(
                                  color: const Color(0xFF0284C7).withOpacity(0.5),
                                  blurRadius: 8,
                                ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                scene.sceneName,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${scene.altitudeMeters.toInt()}m Altitude • ${scene.hotspots.length} Hotspots',
                                style: TextStyle(
                                  color: isSelected ? const Color(0xFFE0F2FE) : Colors.white60,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapActionBtn({
    required IconData icon,
    required VoidCallback onPressed,
    required String tooltip,
  }) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withOpacity(0.85),
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white24),
      ),
      child: IconButton(
        icon: Icon(icon, color: Colors.white, size: 18),
        tooltip: tooltip,
        onPressed: onPressed,
      ),
    );
  }
}
