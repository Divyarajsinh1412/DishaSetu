import 'dart:async';
import 'package:flutter/material.dart';
import '../main.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _logoScale;
  late Animation<double> _fadeElements;
  late Animation<double> _progressAnim;

  int _stepIndex = 0;
  final List<String> _loadingSteps = [
    'Initializing Presidency Campus GIS Engine...',
    'Syncing Verified Academic Blocks & Entrances...',
    'Calibrating Pedestrian Dijkstra Routing...',
    'DishaSetu Ready',
  ];

  Timer? _stepTimer;
  Timer? _navigationTimer;

  @override
  void initState() {
    super.initState();

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2600),
    );

    _logoScale = CurvedAnimation(
      parent: _animController,
      curve: const Interval(0.0, 0.45, curve: Curves.easeOutBack),
    );

    _fadeElements = CurvedAnimation(
      parent: _animController,
      curve: const Interval(0.2, 0.8, curve: Curves.easeOut),
    );

    _progressAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animController,
        curve: const Interval(0.1, 0.95, curve: Curves.easeInOut),
      ),
    );

    _animController.forward();

    // Rotate loading text
    _stepTimer = Timer.periodic(const Duration(milliseconds: 650), (timer) {
      if (!mounted) return;
      if (_stepIndex < _loadingSteps.length - 1) {
        setState(() {
          _stepIndex++;
        });
      } else {
        timer.cancel();
      }
    });

    // Auto-navigate after duration
    _navigationTimer = Timer(const Duration(milliseconds: 3200), () {
      _navigateToMain();
    });
  }

  void _navigateToMain() {
    if (!mounted) return;
    _stepTimer?.cancel();
    _navigationTimer?.cancel();
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const MainNavigationShell(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  @override
  void dispose() {
    _stepTimer?.cancel();
    _navigationTimer?.cancel();
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF071B32), // Deep Navy background
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _navigateToMain, // Tap to skip
        child: SafeArea(
          child: AnimatedBuilder(
            animation: _animController,
            builder: (context, child) {
              return Stack(
                children: [
                  // Background Ambient Glows
                  Positioned(
                    top: -60,
                    left: -60,
                    child: Container(
                      width: 240,
                      height: 240,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF00A878).withOpacity(0.08),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: -80,
                    right: -80,
                    child: Container(
                      width: 280,
                      height: 280,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFFB8D5E8).withOpacity(0.06),
                      ),
                    ),
                  ),

                  // Main Content Layout
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        // Top Section: University Badge & DishaSetu Logo
                        Column(
                          children: [
                            const SizedBox(height: 12),
                            // University Identifier
                            FadeTransition(
                              opacity: _fadeElements,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0B2447).withOpacity(0.8),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: const Color(0xFFB8D5E8).withOpacity(0.2),
                                    width: 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.school,
                                      size: 14,
                                      color: Color(0xFF00A878),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'PRESIDENCY UNIVERSITY BENGALURU',
                                      style: TextStyle(
                                        color: const Color(0xFFB8D5E8),
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 1.2,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Vector Compass Logo with Scale
                            ScaleTransition(
                              scale: _logoScale,
                              child: const _DishaSetuCompassLogo(size: 96),
                            ),
                            const SizedBox(height: 16),

                            // DishaSetu Wordmark
                            FadeTransition(
                              opacity: _fadeElements,
                              child: RichText(
                                text: const TextSpan(
                                  style: TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: -0.5,
                                  ),
                                  children: [
                                    TextSpan(
                                      text: 'Disha',
                                      style: TextStyle(color: Colors.white),
                                    ),
                                    TextSpan(
                                      text: 'Setu',
                                      style: TextStyle(
                                        color: Color(0xFF00A878), // Emerald Green
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 6),

                            // Tagline
                            FadeTransition(
                              opacity: _fadeElements,
                              child: Text(
                                '"Your Campus. Your Direction. Your Way."',
                                style: TextStyle(
                                  color: const Color(0xFFB8D5E8).withOpacity(0.9),
                                  fontSize: 13,
                                  fontStyle: FontStyle.italic,
                                  fontWeight: FontWeight.w500,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                        ),

                        // Middle Section: Aerial Campus Photograph Card
                        FadeTransition(
                          opacity: _fadeElements,
                          child: Container(
                            constraints: const BoxConstraints(
                              maxHeight: 220,
                              maxWidth: 360,
                            ),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(
                                color: const Color(0xFF00A878).withOpacity(0.3),
                                width: 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.4),
                                  blurRadius: 20,
                                  offset: const Offset(0, 10),
                                ),
                              ],
                            ),
                            clipBehavior: Clip.antiAlias,
                            child: Stack(
                              fit: StackFit.expand,
                              children: [
                                Image.asset(
                                  'assets/aerial_central_campus.png',
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      decoration: const BoxDecoration(
                                        gradient: LinearGradient(
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                          colors: [
                                            Color(0xFF0B2447),
                                            Color(0xFF071B32),
                                          ],
                                        ),
                                      ),
                                      child: const Center(
                                        child: Icon(
                                          Icons.apartment,
                                          size: 48,
                                          color: Color(0xFF00A878),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                                // Gradient Overlay for text contrast & polish
                                Container(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                      colors: [
                                        Colors.transparent,
                                        const Color(0xFF071B32).withOpacity(0.85),
                                      ],
                                      stops: const [0.55, 1.0],
                                    ),
                                  ),
                                ),
                                // Pill badge at bottom of aerial image
                                Positioned(
                                  bottom: 12,
                                  left: 14,
                                  right: 14,
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Container(
                                            width: 8,
                                            height: 8,
                                            decoration: const BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: Color(0xFF00A878),
                                            ),
                                          ),
                                          const SizedBox(width: 6),
                                          const Text(
                                            'Itgalpur Campus',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ],
                                      ),
                                      Text(
                                        '13.1718°N, 77.5362°E',
                                        style: TextStyle(
                                          color: const Color(0xFFB8D5E8).withOpacity(0.85),
                                          fontSize: 10,
                                          fontFamily: 'monospace',
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Bottom Section: Supporting Pillars, Progress Bar, Skip hint
                        Column(
                          children: [
                            // Supporting text: "Explore • Discover • Navigate"
                            FadeTransition(
                              opacity: _fadeElements,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Explore',
                                    style: TextStyle(
                                      color: const Color(0xFFB8D5E8).withOpacity(0.8),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 8.0),
                                    child: Icon(
                                      Icons.circle,
                                      size: 4,
                                      color: Color(0xFF00A878),
                                    ),
                                  ),
                                  Text(
                                    'Discover',
                                    style: TextStyle(
                                      color: const Color(0xFFB8D5E8).withOpacity(0.8),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 8.0),
                                    child: Icon(
                                      Icons.circle,
                                      size: 4,
                                      color: Color(0xFF00A878),
                                    ),
                                  ),
                                  Text(
                                    'Navigate',
                                    style: TextStyle(
                                      color: const Color(0xFFB8D5E8).withOpacity(0.8),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 18),

                            // Progress Bar
                            Container(
                              width: 240,
                              height: 3,
                              decoration: BoxDecoration(
                                color: const Color(0xFF0B2447),
                                borderRadius: BorderRadius.circular(2),
                              ),
                              child: Align(
                                alignment: Alignment.centerLeft,
                                child: Container(
                                  width: 240 * _progressAnim.value,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(2),
                                    gradient: const LinearGradient(
                                      colors: [
                                        Color(0xFF00A878),
                                        Color(0xFFB8D5E8),
                                      ],
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(0xFF00A878).withOpacity(0.5),
                                        blurRadius: 6,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),

                            // Loading Step Text
                            Text(
                              _loadingSteps[_stepIndex],
                              style: TextStyle(
                                color: const Color(0xFFB8D5E8).withOpacity(0.7),
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Tap to skip notice
                            Text(
                              'Tap anywhere to skip',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.3),
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

/// Custom Precision Compass Logo for DishaSetu
class _DishaSetuCompassLogo extends StatelessWidget {
  final double size;
  const _DishaSetuCompassLogo({required this.size});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _CompassLogoPainter(),
      ),
    );
  }
}

class _CompassLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // 1. Outer Gyroscope / Compass Ring
    final ringPaint = Paint()
      ..color = const Color(0xFFB8D5E8).withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawCircle(center, radius - 4, ringPaint);

    // Outer Glow Ring
    final glowRingPaint = Paint()
      ..color = const Color(0xFF00A878).withOpacity(0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawCircle(center, radius - 1, glowRingPaint);

    // Cardinal ticks (N, S, E, W)
    final tickPaint = Paint()
      ..color = const Color(0xFF00A878)
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;

    final tickLength = 5.0;
    // North tick
    canvas.drawLine(
      Offset(center.dx, center.dy - radius + 4),
      Offset(center.dx, center.dy - radius + 4 + tickLength),
      tickPaint,
    );
    // South tick
    canvas.drawLine(
      Offset(center.dx, center.dy + radius - 4),
      Offset(center.dx, center.dy + radius - 4 - tickLength),
      tickPaint,
    );
    // East tick
    canvas.drawLine(
      Offset(center.dx + radius - 4, center.dy),
      Offset(center.dx + radius - 4 - tickLength, center.dy),
      tickPaint,
    );
    // West tick
    canvas.drawLine(
      Offset(center.dx - radius - 4, center.dy),
      Offset(center.dx - radius - 4 + tickLength, center.dy),
      tickPaint,
    );

    // 2. Inner Shield Background
    final innerShieldPaint = Paint()
      ..color = const Color(0xFF0B2447).withOpacity(0.7)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius - 12, innerShieldPaint);

    // 3. Faceted Navigation Needle / Pointer Arrow
    // North Pointer (Emerald Green)
    final northPointer = Path();
    northPointer.moveTo(center.dx, center.dy - radius + 14); // Tip
    northPointer.lineTo(center.dx - 10, center.dy); // Left flank
    northPointer.lineTo(center.dx, center.dy - 3); // Notch
    northPointer.close();

    final northPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF00A878), Color(0xFF059669)],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));
    canvas.drawPath(northPointer, northPaint);

    // North Pointer Right Facet (Lighter Emerald)
    final northRightFacet = Path();
    northRightFacet.moveTo(center.dx, center.dy - radius + 14); // Tip
    northRightFacet.lineTo(center.dx + 10, center.dy); // Right flank
    northRightFacet.lineTo(center.dx, center.dy - 3); // Notch
    northRightFacet.close();

    final northRightPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF34D399), Color(0xFF00A878)],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));
    canvas.drawPath(northRightFacet, northRightPaint);

    // South Pointer (Light Blue / Navy Slate)
    final southLeftFacet = Path();
    southLeftFacet.moveTo(center.dx, center.dy + radius - 14); // Bottom tip
    southLeftFacet.lineTo(center.dx - 10, center.dy);
    southLeftFacet.lineTo(center.dx, center.dy + 3);
    southLeftFacet.close();

    final southLeftPaint = Paint()
      ..color = const Color(0xFFB8D5E8).withOpacity(0.5);
    canvas.drawPath(southLeftFacet, southLeftPaint);

    final southRightFacet = Path();
    southRightFacet.moveTo(center.dx, center.dy + radius - 14);
    southRightFacet.lineTo(center.dx + 10, center.dy);
    southRightFacet.lineTo(center.dx, center.dy + 3);
    southRightFacet.close();

    final southRightPaint = Paint()
      ..color = const Color(0xFFB8D5E8).withOpacity(0.8);
    canvas.drawPath(southRightFacet, southRightPaint);

    // 4. Central Pivot Core
    final corePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, 4, corePaint);

    final coreGlow = Paint()
      ..color = const Color(0xFF00A878)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawCircle(center, 6, coreGlow);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
