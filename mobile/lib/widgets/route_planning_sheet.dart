import 'package:flutter/material.dart';
import '../models/campus_location.dart';

class RoutePlanningSheet extends StatefulWidget {
  final List<CampusLocation> locations;
  final CampusLocation? initialStart;
  final CampusLocation? initialDestination;
  final Function(CampusLocation start, CampusLocation destination, bool accessible) onRouteSelected;

  const RoutePlanningSheet({
    super.key,
    required this.locations,
    this.initialStart,
    this.initialDestination,
    required this.onRouteSelected,
  });

  static Future<void> show({
    required BuildContext context,
    required List<CampusLocation> locations,
    CampusLocation? initialStart,
    CampusLocation? initialDestination,
    required Function(CampusLocation start, CampusLocation destination, bool accessible) onRouteSelected,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => RoutePlanningSheet(
        locations: locations,
        initialStart: initialStart,
        initialDestination: initialDestination,
        onRouteSelected: onRouteSelected,
      ),
    );
  }

  @override
  State<RoutePlanningSheet> createState() => _RoutePlanningSheetState();
}

class _RoutePlanningSheetState extends State<RoutePlanningSheet> {
  CampusLocation? _startLocation;
  CampusLocation? _destinationLocation;
  bool _accessibleOnly = false;

  @override
  void initState() {
    super.initState();
    if (widget.locations.isNotEmpty) {
      _startLocation = widget.initialStart ??
          widget.locations.firstWhere(
            (l) => l.shortCode == 'PU-GATE-01' || l.name.contains('Main Gate'),
            orElse: () => widget.locations.first,
          );

      _destinationLocation = widget.initialDestination ??
          widget.locations.firstWhere(
            (l) => l.shortCode == 'PU-D-BLOCK' || l.name.contains('D Block'),
            orElse: () => widget.locations.length > 1 ? widget.locations[1] : widget.locations.first,
          );
    }
  }

  void _swapLocations() {
    setState(() {
      final temp = _startLocation;
      _startLocation = _destinationLocation;
      _destinationLocation = temp;
    });
  }

  void _applyPreset(String startCode, String destCode) {
    setState(() {
      _startLocation = widget.locations.firstWhere(
        (l) => l.shortCode == startCode || l.id == startCode,
        orElse: () => _startLocation ?? widget.locations.first,
      );
      _destinationLocation = widget.locations.firstWhere(
        (l) => l.shortCode == destCode || l.id == destCode,
        orElse: () => _destinationLocation ?? widget.locations.last,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0284C7).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.directions, color: Color(0xFF38BDF8), size: 22),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Route Planning',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Pedestrian Wayfinding Engine',
                        style: TextStyle(color: Colors.white60, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white60),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Start & Destination Pickers with Swap Button
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white10),
            ),
            child: Row(
              children: [
                const Column(
                  children: [
                    Icon(Icons.trip_origin, color: Color(0xFF38BDF8), size: 18),
                    SizedBox(height: 4),
                    SizedBox(
                      height: 26,
                      child: VerticalDivider(color: Colors.white24, thickness: 2),
                    ),
                    SizedBox(height: 4),
                    Icon(Icons.location_on, color: Color(0xFFF43F5E), size: 20),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    children: [
                      // Origin dropdown
                      DropdownButtonHideUnderline(
                        child: DropdownButton<CampusLocation>(
                          isExpanded: true,
                          value: _startLocation,
                          dropdownColor: const Color(0xFF1E293B),
                          hint: const Text('Select Origin', style: TextStyle(color: Colors.white60)),
                          items: widget.locations.map((loc) {
                            return DropdownMenuItem<CampusLocation>(
                              value: loc,
                              child: Text(
                                loc.name,
                                style: const TextStyle(color: Colors.white, fontSize: 13),
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged: (val) => setState(() => _startLocation = val),
                        ),
                      ),
                      const Divider(color: Colors.white12, height: 1),
                      // Destination dropdown
                      DropdownButtonHideUnderline(
                        child: DropdownButton<CampusLocation>(
                          isExpanded: true,
                          value: _destinationLocation,
                          dropdownColor: const Color(0xFF1E293B),
                          hint: const Text('Select Destination', style: TextStyle(color: Colors.white60)),
                          items: widget.locations.map((loc) {
                            return DropdownMenuItem<CampusLocation>(
                              value: loc,
                              child: Text(
                                loc.name,
                                style: const TextStyle(color: Colors.white, fontSize: 13),
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged: (val) => setState(() => _destinationLocation = val),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.swap_vert, color: Color(0xFF38BDF8)),
                  tooltip: 'Swap Origin & Destination',
                  onPressed: _swapLocations,
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Accessible Route Option
          Row(
            children: [
              Checkbox(
                value: _accessibleOnly,
                activeColor: const Color(0xFF0284C7),
                side: const BorderSide(color: Colors.white38),
                onChanged: (val) => setState(() => _accessibleOnly = val ?? false),
              ),
              const Icon(Icons.accessible, size: 16, color: Color(0xFF38BDF8)),
              const SizedBox(width: 6),
              const Text(
                'Prioritize Step-Free & Wheelchair Ramps',
                style: TextStyle(color: Colors.white70, fontSize: 13),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Quick Presets
          const Text(
            'QUICK ROUTE PRESETS',
            style: TextStyle(
              color: Color(0xFF38BDF8),
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 8),

          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildPresetChip('Main Gate → D Block Labs', 'PU-GATE-01', 'PU-D-BLOCK'),
              _buildPresetChip('Main Gate → Central Library', 'PU-GATE-01', 'PU-FAC-LIB'),
              _buildPresetChip('Student Parking → E Block (CSE)', 'PU-PARK-2W', 'PU-E-BLOCK'),
              _buildPresetChip('D Block → E Block Walkway', 'PU-D-BLOCK', 'PU-E-BLOCK'),
              _buildPresetChip('Auditorium → Health Centre', 'PU-AUDITORIUM', 'PU-FAC-MED'),
            ],
          ),

          const SizedBox(height: 20),

          // Start Navigation Action Button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              icon: const Icon(Icons.navigation, color: Colors.white),
              label: const Text(
                'START WALKING NAVIGATION',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0284C7),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 4,
              ),
              onPressed: () {
                if (_startLocation != null && _destinationLocation != null) {
                  Navigator.pop(context);
                  widget.onRouteSelected(
                    _startLocation!,
                    _destinationLocation!,
                    _accessibleOnly,
                  );
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPresetChip(String label, String startCode, String destCode) {
    return ActionChip(
      label: Text(label),
      labelStyle: const TextStyle(fontSize: 11, color: Colors.white70),
      backgroundColor: const Color(0xFF1E293B),
      side: const BorderSide(color: Colors.white12),
      onPressed: () => _applyPreset(startCode, destCode),
    );
  }
}
