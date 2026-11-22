import 'package:flutter/material.dart';
import '../models/building.dart';
import '../models/floor.dart';
import '../services/api_service.dart';
import '../services/indoor_service.dart';

class BuildingBottomSheet extends StatefulWidget {
  final Building building;
  final Function(Room room)? onNavigateToRoom;
  final VoidCallback? onStartNavigation;

  const BuildingBottomSheet({
    super.key,
    required this.building,
    this.onNavigateToRoom,
    this.onStartNavigation,
  });

  static Future<void> show(BuildContext context, {
    required Building building,
    Function(Room room)? onNavigateToRoom,
    VoidCallback? onStartNavigation,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => BuildingBottomSheet(
        building: building,
        onNavigateToRoom: onNavigateToRoom,
        onStartNavigation: onStartNavigation,
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

  Color _getRoomColor(Room room) {
    if (room.isLab) return const Color(0xFF0284C7);
    if (room.isStaffRoom) return const Color(0xFFF59E0B);
    if (room.isOffice) return const Color(0xFF8B5CF6);
    return const Color(0xFF10B981);
  }

  @override
  Widget build(BuildContext context) {
    final isDBlock = widget.building.isDBlock;
    final isEBlock = widget.building.blockLetter.toUpperCase() == 'E';
    final currentFloor = _floors.isNotEmpty
        ? (_floors.firstWhere(
            (f) => f.floorNumber == _selectedFloorLevel,
            orElse: () => _floors[0],
          ))
        : null;

    final rooms = currentFloor?.rooms ?? [];
    final themeColor = isDBlock ? const Color(0xFF0284C7) : const Color(0xFF10B981);

    // E Block Room Slices
    final isGroundFloor = _selectedFloorLevel == 0;
    final topBayRooms = (isEBlock && !isGroundFloor)
        ? rooms.take(3).toList()
        : isGroundFloor && isEBlock
            ? rooms.take(2).toList()
            : rooms.take(3).toList();

    final bottomBayRooms = (isEBlock && !isGroundFloor)
        ? rooms.skip(3).take(3).toList()
        : isGroundFloor && isEBlock
            ? rooms.skip(2).take(1).toList()
            : rooms.skip(3).take(3).toList();

    final oppositeWingRooms = (isEBlock && !isGroundFloor && rooms.length > 6)
        ? rooms.skip(6).toList()
        : <Room>[];

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.90,
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
                    color: themeColor.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: themeColor.withValues(alpha: 0.4)),
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
                              color: themeColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: themeColor.withValues(alpha: 0.35)),
                            ),
                            child: Text(
                              isDBlock ? 'ALL ROOMS ARE LABS' : isEBlock ? 'CLASSROOMS & DEAN OFFICES' : 'ALL ROOMS ARE CLASSROOMS',
                              style: TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w900,
                                color: themeColor,
                                letterSpacing: 0.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.building.name,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          // Schematic Layout Disclaimer
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF78350F).withValues(alpha: 0.25),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.35)),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, size: 14, color: Color(0xFFFBBF24)),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Handwritten Architectural Floor Plan Model • Click any room to inspect and navigate',
                    style: TextStyle(fontSize: 10, color: Color(0xFFFDE68A)),
                  ),
                ),
              ],
            ),
          ),

          // Floor Selector Pills (Dynamic for all floors: Ground to 3rd Floor)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _floors.map((flr) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _buildFloorTab(
                      flr.floorNumber,
                      flr.floorName,
                      'Level ${flr.floorNumber}',
                      themeColor,
                    ),
                  );
                }).toList(),
              ),
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
                          if (topBayRooms.isNotEmpty)
                            _buildRoomsGrid(topBayRooms, isDBlock),

                          // Central Corridor Divider with Orientation Indicators
                          Container(
                            margin: const EdgeInsets.symmetric(vertical: 10),
                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFF181C25),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF334155)),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  isEBlock ? '← F Block' : 'West Wing',
                                  style: const TextStyle(fontSize: 10, color: Colors.white54, fontWeight: FontWeight.bold),
                                ),
                                const Row(
                                  children: [
                                    Icon(Icons.swap_horiz, color: Colors.white70, size: 16),
                                    SizedBox(width: 6),
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
                                Text(
                                  isEBlock ? 'D Block →' : 'East Wing',
                                  style: const TextStyle(fontSize: 10, color: Colors.white54, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),

                          // Bottom Bay of Rooms
                          if (bottomBayRooms.isNotEmpty)
                            _buildRoomsGrid(bottomBayRooms, isDBlock),

                          // Opposite Wing: Staff Rooms & Dean Office (as shown in handwritten sketch)
                          if (oppositeWingRooms.isNotEmpty) ...[
                            const SizedBox(height: 14),
                            Container(
                              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                              decoration: BoxDecoration(
                                border: Border(bottom: BorderSide(color: const Color(0xFFF59E0B).withValues(alpha: 0.4))),
                              ),
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'OPPOSITE WING • FACULTY & DEAN OFFICES',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1.2,
                                      color: Color(0xFFFBBF24),
                                    ),
                                  ),
                                  Text(
                                    'Opposite Side Corridor',
                                    style: TextStyle(fontSize: 9, color: Colors.white38),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),
                            _buildRoomsGrid(oppositeWingRooms, isDBlock),
                          ],
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
                                color: _getRoomColor(_selectedRoom!).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: _getRoomColor(_selectedRoom!).withValues(alpha: 0.4)),
                              ),
                              child: Text(
                                _selectedRoom!.typeLabel,
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: _getRoomColor(_selectedRoom!),
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
                      backgroundColor: _getRoomColor(_selectedRoom!),
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
                      } else if (widget.onStartNavigation != null) {
                        widget.onStartNavigation!();
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
    return GestureDetector(
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
        constraints: const BoxConstraints(minWidth: 92),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
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
    );
  }

  Widget _buildRoomsGrid(List<Room> roomsList, bool isDBlock) {
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
        final roomColor = _getRoomColor(rm);

        return GestureDetector(
          onTap: () => setState(() => _selectedRoom = rm),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isSelected ? roomColor.withValues(alpha: 0.25) : const Color(0xFF181C25),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? roomColor : const Color(0xFF334155),
                width: isSelected ? 2.0 : 1.0,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: roomColor.withValues(alpha: 0.25),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: roomColor.withValues(alpha: 0.4), width: 0.8),
                  ),
                  child: Text(
                    rm.typeLabel,
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                      color: roomColor,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  rm.roomNumber,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: isSelected ? Colors.white : Colors.white.withValues(alpha: 0.9),
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
