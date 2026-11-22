import 'package:flutter/material.dart';
import '../models/building.dart';
import '../models/floor.dart';
import '../services/api_service.dart';
import '../services/indoor_service.dart';

class BuildingBottomSheet extends StatefulWidget {
  final Building building;
  final Function(Room room)? onNavigateToRoom;

  const BuildingBottomSheet({
    super.key,
    required this.building,
    this.onNavigateToRoom,
  });

  static Future<void> show(BuildContext context, {
    required Building building,
    Function(Room room)? onNavigateToRoom,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => BuildingBottomSheet(
        building: building,
        onNavigateToRoom: onNavigateToRoom,
      ),
    );
  }

  @override
  State<BuildingBottomSheet> createState() => _BuildingBottomSheetState();
}

class _BuildingBottomSheetState extends State<BuildingBottomSheet> {
  final ApiService _apiService = ApiService();
  List<Floor> _floors = [];
  int _selectedFloorLevel = 0;
  Room? _selectedRoom;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFloors();
  }

  Future<void> _loadFloors() async {
    setState(() => _isLoading = true);
    final list = await _apiService.fetchIndoorFloors(widget.building.buildingId);
    setState(() {
      _floors = list.isNotEmpty
          ? list
          : IndoorService.getBuildingFloorsFallback(widget.building.buildingId);
      _selectedFloorLevel = 0;
      if (_floors.isNotEmpty && _floors[0].rooms.isNotEmpty) {
        _selectedRoom = _floors[0].rooms[0];
      }
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDBlock = widget.building.isDBlock;
    final currentFloor = _floors.isNotEmpty
        ? (_floors.firstWhere(
            (f) => f.floorNumber == _selectedFloorLevel,
            orElse: () => _floors[0],
          ))
        : null;

    final rooms = currentFloor?.rooms ?? [];
    final themeColor = isDBlock ? const Color(0xFF0284C7) : const Color(0xFF10B981);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF0D111A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(top: BorderSide(color: Color(0xFF334155), width: 1.5)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag Handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
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
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: themeColor.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: themeColor.withOpacity(0.4)),
                  ),
                  child: Icon(
                    isDBlock ? Icons.science : Icons.school,
                    color: themeColor,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFF475569)),
                            ),
                            child: Text(
                              widget.building.shortCode,
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                                color: Color(0xFF94A3B8),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: themeColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: themeColor.withOpacity(0.3)),
                            ),
                            child: Text(
                              isDBlock ? 'ALL LABS' : 'ALL CLASSROOMS',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: themeColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${widget.building.name} (${isDBlock ? "Labs" : "Classrooms"})',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          // Unverified Layout Banner
          Container(
            width: double.infinity,
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF451A03).withOpacity(0.6),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFD97706).withOpacity(0.5)),
            ),
            child: Row(
              children: const [
                Icon(Icons.warning_amber_rounded, color: Color(0xFFF59E0B), size: 16),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Schematic Floor Layout • Unverified Architectural Reference. Standardized corridor bay model.',
                    style: TextStyle(fontSize: 10, color: Color(0xFFFDE68A)),
                  ),
                ),
              ],
            ),
          ),

          // Floor Selector Pills
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildFloorTab(0, 'Ground Floor', 'Level 0', themeColor),
                const SizedBox(width: 8),
                _buildFloorTab(1, 'First Floor', 'Level 1', themeColor),
                const SizedBox(width: 8),
                _buildFloorTab(2, 'Second Floor', 'Level 2', themeColor),
              ],
            ),
          ),

          // Floor Rooms Grid
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: themeColor))
                : rooms.isEmpty
                    ? const Center(
                        child: Text(
                          'No rooms mapped for this level.',
                          style: TextStyle(color: Colors.white54, fontSize: 13),
                        ),
                      )
                    : ListView(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        children: [
                          Center(
                            child: Text(
                              '${widget.building.name.toUpperCase()} – ${currentFloor?.floorName.toUpperCase() ?? "LEVEL $_selectedFloorLevel"}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.2,
                                color: Colors.white70,
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),

                          // Top Bay of Rooms
                          _buildRoomsGrid(rooms.take(3).toList(), themeColor, isDBlock),

                          // Central Corridor Divider
                          Container(
                            margin: const EdgeInsets.symmetric(vertical: 10),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF181C25),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF334155)),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(Icons.swap_horiz, color: Colors.white54, size: 16),
                                SizedBox(width: 8),
                                Text(
                                  'CENTRAL CORRIDOR',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 1.5,
                                    color: Colors.white70,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Bottom Bay of Rooms
                          _buildRoomsGrid(rooms.skip(3).take(3).toList(), themeColor, isDBlock),
                        ],
                      ),
          ),

          // Bottom Selected Room Bar
          if (_selectedRoom != null)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFF131722),
                border: Border(top: BorderSide(color: Color(0xFF334155))),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          children: [
                            Text(
                              'Selected: ${_selectedRoom!.roomNumber}',
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                              decoration: BoxDecoration(
                                color: themeColor.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: themeColor.withOpacity(0.4)),
                              ),
                              child: Text(
                                _selectedRoom!.typeLabel,
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: themeColor,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _selectedRoom!.name,
                          style: const TextStyle(fontSize: 12, color: Colors.white70),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: themeColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    icon: const Icon(Icons.navigation, size: 16),
                    label: const Text('NAVIGATE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    onPressed: () {
                      Navigator.pop(context);
                      if (widget.onNavigateToRoom != null) {
                        widget.onNavigateToRoom!(_selectedRoom!);
                      }
                    },
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildFloorTab(int level, String title, String subtitle, Color themeColor) {
    final isSelected = _selectedFloorLevel == level;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedFloorLevel = level;
            final currentFloor = _floors.firstWhere(
              (f) => f.floorNumber == level,
              orElse: () => _floors[0],
            );
            if (currentFloor.rooms.isNotEmpty) {
              _selectedRoom = currentFloor.rooms[0];
            }
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? themeColor : const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? themeColor : const Color(0xFF334155),
              width: 1.5,
            ),
          ),
          child: Column(
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : Colors.white70,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 9,
                  color: isSelected ? Colors.white70 : Colors.white38,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoomsGrid(List<Room> roomsList, Color themeColor, bool isDBlock) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: roomsList.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 1.05,
      ),
      itemBuilder: (context, idx) {
        final rm = roomsList[idx];
        final isSelected = _selectedRoom?.roomId == rm.roomId;

        return GestureDetector(
          onTap: () => setState(() => _selectedRoom = rm),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isSelected ? themeColor.withOpacity(0.25) : const Color(0xFF181C25),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? themeColor : const Color(0xFF334155),
                width: isSelected ? 2.0 : 1.0,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: isDBlock ? const Color(0xFF0369A1).withOpacity(0.3) : const Color(0xFF065F46).withOpacity(0.4),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    rm.typeLabel,
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                      color: isDBlock ? const Color(0xFF38BDF8) : const Color(0xFF34D399),
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  rm.roomNumber,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: isSelected ? Colors.white : Colors.white.withOpacity(0.9),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  rm.name,
                  style: const TextStyle(fontSize: 8.5, color: Colors.white54),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
