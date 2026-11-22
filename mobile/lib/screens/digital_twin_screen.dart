import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../models/building.dart';
import '../services/indoor_service.dart';
import '../widgets/building_bottom_sheet.dart';

class DigitalTwinScreen extends StatefulWidget {
  const DigitalTwinScreen({super.key});

  @override
  State<DigitalTwinScreen> createState() => _DigitalTwinScreenState();
}

class _DigitalTwinScreenState extends State<DigitalTwinScreen> {
  double _azimuth = 45.0; // Horizontal rotation
  double _pitch = 35.0;   // Vertical tilt (isometric 35 deg)
  double _zoom = 1.0;

  final List<Building> _buildings = IndoorService.getAllCampusBuildings();

  final List<Map<String, dynamic>> _twinEntities = const [
    {
      'code': 'PU-D-BLOCK',
      'name': 'D Block (Labs)',
      'x': -90.0,
      'y': 40.0,
      'width': 65.0,
      'length': 85.0,
      'height': 50.0,
      'color': Color(0xFF0284C7),
      'label': 'D BLOCK\n(LABS)',
      'type': 'Labs',
    },
    {
      'code': 'PU-E-BLOCK',
      'name': 'E Block (CSE & AI)',
      'x': -30.0,
      'y': -60.0,
      'width': 70.0,
      'length': 90.0,
      'height': 60.0,
      'color': Color(0xFF0EA5E9),
      'label': 'E BLOCK\n(4 FLOORS)',
      'type': 'Classrooms',
    },
    {
      'code': 'PU-F-BLOCK',
      'name': 'F Block (EEE & IS)',
      'x': -110.0,
      'y': -60.0,
      'width': 60.0,
      'length': 80.0,
      'height': 45.0,
      'color': Color(0xFF6366F1),
      'label': 'F BLOCK\n(CLASSROOMS)',
      'type': 'Classrooms',
    },
    {
      'code': 'PU-L-BLOCK',
      'name': 'L Block (Foundation)',
      'x': 50.0,
      'y': -60.0,
      'width': 60.0,
      'length': 80.0,
      'height': 45.0,
      'color': Color(0xFF38BDF8),
      'label': 'L BLOCK\n(CLASSROOMS)',
      'type': 'Classrooms',
    },
    {
      'code': 'PU-N-BLOCK',
      'name': 'N Block (Law)',
      'x': 50.0,
      'y': 40.0,
      'width': 60.0,
      'length': 75.0,
      'height': 45.0,
      'color': Color(0xFF10B981),
      'label': 'N BLOCK\n(CLASSROOMS)',
      'type': 'Classrooms',
    },
    {
      'code': 'PU-M-BLOCK',
      'name': 'M Block (Management)',
      'x': 110.0,
      'y': 40.0,
      'width': 60.0,
      'length': 75.0,
      'height': 45.0,
      'color': Color(0xFFF59E0B),
      'label': 'M BLOCK\n(CLASSROOMS)',
      'type': 'Classrooms',
    },
    {
      'code': 'PU-LM-FOUNTAIN',
      'name': 'Central Fountain',
      'x': -20.0,
      'y': 20.0,
      'width': 35.0,
      'length': 35.0,
      'height': 15.0,
      'color': Color(0xFF06B6D4),
      'label': 'FOUNTAIN',
      'type': 'Landmark',
    },
    {
      'code': 'PU-LM-LAWN',
      'name': 'Main Lawn (KML Green)',
      'x': -20.0,
      'y': 90.0,
      'width': 100.0,
      'length': 60.0,
      'height': 6.0,
      'color': Color(0xFF15803D),
      'label': 'MAIN LAWN',
      'type': 'Greenery',
    },
  ];

  void _onPanUpdate(DragUpdateDetails details) {
    setState(() {
      _azimuth += details.delta.dx * 0.4;
      _pitch = (_pitch - details.delta.dy * 0.3).clamp(15.0, 75.0);
    });
  }

  void _resetCamera() {
    setState(() {
      _azimuth = 45.0;
      _pitch = 35.0;
      _zoom = 1.0;
    });
  }

  void _openBuilding(String code) {
    Building? matched;
    for (final b in _buildings) {
      if (b.code == code) {
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
                content: Text('Starting walking route to ${matched!.name}...'),
                backgroundColor: const Color(0xFF0284C7),
              ),
            );
          },
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
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
              child: const Icon(Icons.view_in_ar, color: Color(0xFF38BDF8), size: 18),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Campus Digital Twin 3D',
                  style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                ),
                Text(
                  'Presidency University Interactive Isometric Model',
                  style: TextStyle(color: Colors.white60, fontSize: 10),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.layers_clear, color: Colors.white70, size: 20),
            tooltip: 'Reset Camera Angle',
            onPressed: _resetCamera,
          ),
        ],
      ),
      body: Stack(
        children: [
          // 1. Interactive 3D Model Canvas
          GestureDetector(
            onPanUpdate: _onPanUpdate,
            child: ClipRect(
              child: SizedBox.expand(
                child: CustomPaint(
                  painter: _DigitalTwinPainter(
                    azimuth: _azimuth,
                    pitch: _pitch,
                    zoom: _zoom,
                    entities: _twinEntities,
                  ),
                ),
              ),
            ),
          ),

          // 2. Camera Orientation HUD
          Positioned(
            top: 16,
            left: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withOpacity(0.85),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.screen_rotation, color: Color(0xFF38BDF8), size: 14),
                  const SizedBox(width: 6),
                  Text(
                    'Rot: ${_azimuth.toInt() % 360}° • Tilt: ${_pitch.toInt()}°',
                    style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),

          // 3. Zoom Controls
          Positioned(
            top: 16,
            right: 16,
            child: Column(
              children: [
                _buildActionBtn(
                  icon: Icons.add,
                  onPressed: () => setState(() => _zoom = (_zoom * 1.2).clamp(0.6, 3.0)),
                  tooltip: 'Zoom In',
                ),
                const SizedBox(height: 8),
                _buildActionBtn(
                  icon: Icons.remove,
                  onPressed: () => setState(() => _zoom = (_zoom / 1.2).clamp(0.6, 3.0)),
                  tooltip: 'Zoom Out',
                ),
                const SizedBox(height: 8),
                _buildActionBtn(
                  icon: Icons.center_focus_strong,
                  onPressed: _resetCamera,
                  tooltip: 'Reset Isometric View',
                ),
              ],
            ),
          ),

          // 4. Quick Building Selector Bar
          Positioned(
            bottom: 20,
            left: 0,
            right: 0,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A).withOpacity(0.9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.touch_app, color: Color(0xFF38BDF8), size: 14),
                      SizedBox(width: 6),
                      Text(
                        'Tap a building block to inspect floors, rooms, or navigate',
                        style: TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 48,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    scrollDirection: Axis.horizontal,
                    itemCount: _buildings.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final b = _buildings[index];
                      return ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1E293B),
                          foregroundColor: Colors.white,
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: const BorderSide(color: Color(0xFF38BDF8), width: 1),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                        ),
                        onPressed: () => _openBuilding(b.code),
                        child: Text(
                          b.code,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
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

  Widget _buildActionBtn({
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

class _DigitalTwinPainter extends CustomPainter {
  final double azimuth;
  final double pitch;
  final double zoom;
  final List<Map<String, dynamic>> entities;

  _DigitalTwinPainter({
    required this.azimuth,
    required this.pitch,
    required this.zoom,
    required this.entities,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final centerX = size.width / 2;
    final centerY = size.height / 2;

    final radAzimuth = azimuth * math.pi / 180.0;
    final radPitch = pitch * math.pi / 180.0;

    // Draw Campus Base Plinth
    final plinthPaint = Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.fill;
    final plinthBorder = Paint()
      ..color = const Color(0xFF38BDF8).withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final plinthRadius = 180.0 * zoom;
    canvas.drawCircle(Offset(centerX, centerY + 20), plinthRadius, plinthPaint);
    canvas.drawCircle(Offset(centerX, centerY + 20), plinthRadius, plinthBorder);

    // Draw Road Grid / Paved Walkways
    final roadPaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12.0 * zoom;

    canvas.drawLine(
      Offset(centerX - 140 * zoom, centerY),
      Offset(centerX + 140 * zoom, centerY),
      roadPaint,
    );
    canvas.drawLine(
      Offset(centerX, centerY - 140 * zoom),
      Offset(centerX, centerY + 140 * zoom),
      roadPaint,
    );

    // Sort entities from back to front for proper 3D isometric occlusion
    final sorted = List<Map<String, dynamic>>.from(entities);
    sorted.sort((a, b) {
      final aDepth = (a['x'] as double) * math.sin(radAzimuth) + (a['y'] as double) * math.cos(radAzimuth);
      final bDepth = (b['x'] as double) * math.sin(radAzimuth) + (b['y'] as double) * math.cos(radAzimuth);
      return aDepth.compareTo(bDepth);
    });

    for (final ent in sorted) {
      final wx = ent['x'] as double;
      final wy = ent['y'] as double;
      final wWidth = (ent['width'] as double) * zoom;
      final wLength = (ent['length'] as double) * zoom;
      final wHeight = (ent['height'] as double) * zoom;
      final color = ent['color'] as Color;
      final label = ent['label'] as String;

      // Project world coords to screen
      final rx = (wx * math.cos(radAzimuth) - wy * math.sin(radAzimuth)) * zoom;
      final ry = (wx * math.sin(radAzimuth) + wy * math.cos(radAzimuth)) * math.sin(radPitch) * zoom;

      final sx = centerX + rx;
      final sy = centerY + ry;

      // Draw 3D Box (Front, Side, Top faces)
      final topPaint = Paint()..color = color;
      final frontPaint = Paint()..color = color.withOpacity(0.55);

      final halfW = wWidth / 2;
      final halfL = wLength / 2;

      // Base footprint
      final topRect = Rect.fromCenter(
        center: Offset(sx, sy - wHeight),
        width: halfW * 2,
        height: halfL,
      );

      // Sides
      final sidePath = Path()
        ..moveTo(sx - halfW, sy)
        ..lineTo(sx - halfW, sy - wHeight)
        ..lineTo(sx + halfW, sy - wHeight)
        ..lineTo(sx + halfW, sy)
        ..close();
      canvas.drawPath(sidePath, frontPaint);

      // Top Roof Face
      canvas.drawRRect(
        RRect.fromRectAndRadius(topRect, const Radius.circular(4)),
        topPaint,
      );

      // Building Outline
      final outlinePaint = Paint()
        ..color = Colors.white.withOpacity(0.4)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.0;
      canvas.drawRRect(
        RRect.fromRectAndRadius(topRect, const Radius.circular(4)),
        outlinePaint,
      );

      // Building Text Label
      final textSpan = TextSpan(
        text: label,
        style: TextStyle(
          color: Colors.white,
          fontSize: (9.0 * zoom).clamp(7.0, 12.0),
          fontWeight: FontWeight.bold,
          shadows: const [
            Shadow(color: Colors.black, blurRadius: 4),
          ],
        ),
      );
      final textPainter = TextPainter(
        text: textSpan,
        textAlign: TextAlign.center,
        textDirection: TextDirection.ltr,
      )..layout();

      textPainter.paint(
        canvas,
        Offset(sx - (textPainter.width / 2), sy - wHeight - (textPainter.height / 2)),
      );
    }
  }

  @override
  bool shouldRepaint(covariant _DigitalTwinPainter oldDelegate) {
    return oldDelegate.azimuth != azimuth ||
        oldDelegate.pitch != pitch ||
        oldDelegate.zoom != zoom;
  }
}
