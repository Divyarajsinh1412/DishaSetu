import 'package:flutter/material.dart';
import '../models/navigation_route.dart';

class NavigationGuidanceBar extends StatefulWidget {
  final NavigationRoute route;
  final VoidCallback onClose;
  final VoidCallback? onRecenter;

  const NavigationGuidanceBar({
    super.key,
    required this.route,
    required this.onClose,
    this.onRecenter,
  });

  @override
  State<NavigationGuidanceBar> createState() => _NavigationGuidanceBarState();
}

class _NavigationGuidanceBarState extends State<NavigationGuidanceBar> {
  int _currentStepIndex = 0;
  bool _voiceEnabled = true;

  @override
  Widget build(BuildContext context) {
    final waypoints = widget.route.waypoints;
    final totalSteps = waypoints.length;
    final currentStep = totalSteps > 0 && _currentStepIndex < totalSteps
        ? waypoints[_currentStepIndex]
        : null;
    final nextStep = totalSteps > 0 && _currentStepIndex + 1 < totalSteps
        ? waypoints[_currentStepIndex + 1]
        : null;

    final estimatedMinutes = widget.route.estimatedWalkingMinutes;
    final distanceMeters = widget.route.totalDistanceMeters;

    return SafeArea(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF006039), // Standard Google Maps dark emerald
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: const Color(0xFF34D399).withOpacity(0.35)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.4),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Direction Turn Icon Box
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.25),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white.withOpacity(0.25)),
                  ),
                  child: Icon(
                    _getTurnIcon(currentStep?.turnType),
                    color: Colors.white,
                    size: 26,
                  ),
                ),
                const SizedBox(width: 12),

                // Step Instructions
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            currentStep != null && currentStep.distanceMeters > 0
                                ? 'In ${currentStep.distanceMeters} meters'
                                : 'Current Step',
                            style: const TextStyle(
                              color: Color(0xFFA7F3D0),
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          Row(
                            children: [
                              if (widget.route.accessible)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 6, vertical: 2),
                                  margin: const EdgeInsets.only(right: 6),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF064E3B),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                        color: const Color(0xFF34D399)
                                            .withOpacity(0.4)),
                                  ),
                                  child: const Row(
                                    children: [
                                      Icon(Icons.accessible,
                                          size: 11, color: Color(0xFF6EE7B7)),
                                      SizedBox(width: 3),
                                      Text(
                                        'Step-Free',
                                        style: TextStyle(
                                          color: Color(0xFF6EE7B7),
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              InkWell(
                                onTap: () {
                                  setState(() => _voiceEnabled = !_voiceEnabled);
                                },
                                borderRadius: BorderRadius.circular(20),
                                child: Padding(
                                  padding: const EdgeInsets.all(4),
                                  child: Icon(
                                    _voiceEnabled
                                        ? Icons.volume_up
                                        : Icons.volume_off,
                                    size: 16,
                                    color: const Color(0xFFA7F3D0),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        currentStep?.instruction ?? 'Proceed along indicated campus walkway',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          height: 1.25,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (nextStep != null) ...[
                        const SizedBox(height: 3),
                        Text(
                          'Then: ${nextStep.instruction}',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.75),
                            fontSize: 11,
                            fontStyle: FontStyle.italic,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),

                // Close Button
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: widget.onClose,
                ),
              ],
            ),

            const SizedBox(height: 10),
            const Divider(color: Colors.white24, height: 1),
            const SizedBox(height: 8),

            // Bottom Navigation Stats Strip & Step Switcher
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // ETA & Total Distance
                Row(
                  children: [
                    const Icon(Icons.directions_walk,
                        color: Color(0xFFA7F3D0), size: 16),
                    const SizedBox(width: 4),
                    Text(
                      '$estimatedMinutes min ($distanceMeters m)',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),

                // Step switcher controls
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chevron_left,
                          color: Colors.white, size: 22),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: _currentStepIndex > 0
                          ? () => setState(() => _currentStepIndex--)
                          : null,
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Text(
                        'Step ${_currentStepIndex + 1}/$totalSteps',
                        style: const TextStyle(
                          color: Color(0xFFA7F3D0),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.chevron_right,
                          color: Colors.white, size: 22),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: _currentStepIndex < totalSteps - 1
                          ? () => setState(() => _currentStepIndex++)
                          : null,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  IconData _getTurnIcon(String? turnType) {
    switch (turnType) {
      case 'turn-right':
        return Icons.turn_right;
      case 'turn-left':
        return Icons.turn_left;
      case 'arrive':
        return Icons.pin_drop;
      case 'depart':
      default:
        return Icons.straight;
    }
  }
}
