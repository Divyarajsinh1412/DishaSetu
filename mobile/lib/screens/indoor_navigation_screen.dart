import 'package:flutter/material.dart';
import '../models/building.dart';
import '../models/floor.dart';
import '../services/api_service.dart';
import '../services/indoor_service.dart';
import 'staff_room_screen.dart';

class IndoorNavigationScreen extends StatefulWidget {
  final Building? initialBuilding;
  final int initialFloor;
  final String? initialRoomCode;
  final String initialMode; // 'card' | 'blueprint'

  const IndoorNavigationScreen({
    super.key,
    this.initialBuilding,
    this.initialFloor = 0,
    this.initialRoomCode,
    this.initialMode = 'card',
  });

  @override
  State<IndoorNavigationScreen> createState() => _IndoorNavigationScreenState();
}

class _IndoorNavigationScreenState extends State<IndoorNavigationScreen> {
  final ApiService _apiService = ApiService();
  late List<Building> _allBuildings;
  late Building _selectedBuilding;
  List<Floor> _floors = [];
  int _selectedFloorLevel = 0;
  Room? _selectedRoom;
  String _startPoint = 'entrance'; // 'entrance', 'stairs', 'elevator'
  String _layoutMode = 'card'; // 'card' or 'blueprint'
  final TextEditingController _searchController = TextEditingController();
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _allBuildings = IndoorService.getAllCampusBuildings();
    _selectedBuilding = widget.initialBuilding ?? _allBuildings.firstWhere(
      (b) => b.buildingId == 'bld_e_block',
      orElse: () => _allBuildings.first,
    );
    _selectedFloorLevel = widget.initialFloor;
    _layoutMode = widget.initialMode;
    _loadFloors();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadFloors() async {
    setState(() => _isLoading = true);
    final list = await _apiService.fetchIndoorFloors(_selectedBuilding.buildingId);
    setState(() {
      _floors = list.isNotEmpty
          ? list
          : IndoorService.getBuildingFloorsFallback(_selectedBuilding.buildingId);
      
      final currentFloorObj = _floors.firstWhere(
        (f) => f.floorNumber == _selectedFloorLevel,
        orElse: () => _floors.isNotEmpty
            ? _floors[0]
            : Floor(
                floorId: 'flr_0',
                buildingId: _selectedBuilding.buildingId,
                buildingName: _selectedBuilding.name,
                buildingShortCode: _selectedBuilding.shortCode,
                floorNumber: 0,
                floorName: 'Ground Floor',
                rooms: [],
              ),
      );

      if (widget.initialRoomCode != null) {
        final matches = currentFloorObj.rooms.where(
          (r) => r.roomCode.toLowerCase() == widget.initialRoomCode!.toLowerCase(),
        );
        _selectedRoom = matches.isNotEmpty
            ? matches.first
            : (currentFloorObj.rooms.isNotEmpty ? currentFloorObj.rooms[0] : null);
      } else if (currentFloorObj.rooms.isNotEmpty) {
        _selectedRoom = currentFloorObj.rooms[0];
      } else {
        _selectedRoom = null;
      }

      _isLoading = false;
    });
  }

  void _onSearch(String query) {
    if (query.trim().isEmpty) return;
    final q = query.toLowerCase().trim();

    for (final flr in _floors) {
      for (final r in flr.rooms) {
        if (r.roomCode.toLowerCase().contains(q) ||
            r.name.toLowerCase().contains(q) ||
            r.roomId.toLowerCase().contains(q)) {
          setState(() {
            _selectedFloorLevel = flr.floorNumber;
            _selectedRoom = r;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFF0284C7),
              content: Text('Located ${r.name} (${r.roomCode}) on ${flr.floorName}'),
              duration: const Duration(seconds: 2),
            ),
          );
          return;
        }
      }
    }
  }

  Color _getRoomColor(Room room) {
    if (room.isLab) return const Color(0xFF0284C7);
    if (room.isStaffRoom) return const Color(0xFFF59E0B);
    if (room.isOffice) return const Color(0xFF8B5CF6);
    return const Color(0xFF10B981);
  }

  @override
  Widget build(BuildContext context) {
    final isDBlock = _selectedBuilding.isDBlock;
    final isEBlock = _selectedBuilding.blockLetter.toUpperCase() == 'E';
    final themeColor = isDBlock ? const Color(0xFF0284C7) : const Color(0xFF10B981);

    final currentFloor = _floors.isNotEmpty
        ? _floors.firstWhere(
            (f) => f.floorNumber == _selectedFloorLevel,
            orElse: () => _floors[0],
          )
        : null;

    final rooms = currentFloor?.rooms ?? [];
    final isGroundFloor = _selectedFloorLevel == 0;

    // Split rooms into rows
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

    return Scaffold(
      backgroundColor: const Color(0xFF0B101D),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        titleSpacing: 0,
        title: DropdownButtonHideUnderline(
          child: DropdownButton<Building>(
            value: _allBuildings.firstWhere(
              (b) => b.buildingId == _selectedBuilding.buildingId,
              orElse: () => _allBuildings.first,
            ),
            dropdownColor: const Color(0xFF1E293B),
            icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF38BDF8)),
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            onChanged: (Building? newBuilding) {
              if (newBuilding != null && newBuilding.buildingId != _selectedBuilding.buildingId) {
                setState(() {
                  _selectedBuilding = newBuilding;
                  _selectedFloorLevel = 0;
                });
                _loadFloors();
              }
            },
            items: _allBuildings.map((b) {
              return DropdownMenuItem<Building>(
                value: b,
                child: Text('${b.name} (${b.shortCode})'),
              );
            }).toList(),
          ),
        ),
        actions: [
          // View Mode Switcher: Card Layout vs Blueprint/Route
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                InkWell(
                  onTap: () => setState(() => _layoutMode = 'card'),
                  borderRadius: const BorderRadius.horizontal(left: Radius.circular(9)),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
                    decoration: BoxDecoration(
                      color: _layoutMode == 'card' ? themeColor : Colors.transparent,
                      borderRadius: const BorderRadius.horizontal(left: Radius.circular(9)),
                    ),
                    child: Text(
                      'Card',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: _layoutMode == 'card' ? Colors.white : Colors.white60,
                      ),
                    ),
                  ),
                ),
                InkWell(
                  onTap: () => setState(() => _layoutMode = 'blueprint'),
                  borderRadius: const BorderRadius.horizontal(right: Radius.circular(9)),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
                    decoration: BoxDecoration(
                      color: _layoutMode == 'blueprint' ? themeColor : Colors.transparent,
                      borderRadius: const BorderRadius.horizontal(right: Radius.circular(9)),
                    ),
                    child: Text(
                      'Blueprint',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: _layoutMode == 'blueprint' ? Colors.white : Colors.white60,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white70, size: 20),
            onPressed: _loadFloors,
          ),
        ],
      ),
      body: Column(
        children: [
          // Unverified Layout Banner / Disclaimer
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            color: const Color(0xFF78350F).withValues(alpha: 0.35),
            child: Row(
              children: [
                const Icon(Icons.info_outline, size: 13, color: Color(0xFFFBBF24)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '⚠️ Schematic Floor Layout • Standardized corridor model for ${_selectedBuilding.name}',
                    style: const TextStyle(fontSize: 10, color: Color(0xFFFDE68A)),
                  ),
                ),
              ],
            ),
          ),

          // Search & Filter Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 6),
            child: TextField(
              controller: _searchController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF131D31),
                hintText: 'Search classroom, lab, staff room (e.g. EF03, FS01, DG01)...',
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF38BDF8), size: 18),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 16, color: Colors.white54),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {});
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF1E293B)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF1E293B)),
                ),
              ),
              onSubmitted: _onSearch,
            ),
          ),

          // Floor Selector Pills (Ground, 1st, 2nd, 3rd)
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            child: Row(
              children: _floors.map((flr) {
                final isSelected = flr.floorNumber == _selectedFloorLevel;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(flr.floorName),
                    selected: isSelected,
                    selectedColor: themeColor,
                    backgroundColor: const Color(0xFF1E293B),
                    labelStyle: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : Colors.white70,
                    ),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    onSelected: (val) {
                      if (val) {
                        setState(() {
                          _selectedFloorLevel = flr.floorNumber;
                          if (flr.rooms.isNotEmpty) {
                            _selectedRoom = flr.rooms[0];
                          }
                        });
                      }
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Main Interactive Body: Card Layout or Blueprint View
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: themeColor))
                : _layoutMode == 'card'
                    ? _buildCardLayout(isDBlock, isEBlock, isGroundFloor, topBayRooms, bottomBayRooms, oppositeWingRooms, themeColor)
                    : _buildBlueprintLayout(currentFloor, rooms, themeColor),
          ),

          // Selected Room & Route Guidance Footer
          if (_selectedRoom != null) _buildSelectedRoomFooter(themeColor),
        ],
      ),
    );
  }

  /// 1. Card Layout matching handwritten layout
  Widget _buildCardLayout(
    bool isDBlock,
    bool isEBlock,
    bool isGroundFloor,
    List<Room> topBayRooms,
    List<Room> bottomBayRooms,
    List<Room> oppositeWingRooms,
    Color themeColor,
  ) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      children: [
        // E Block Ground Floor Staff Room 01 Quick Launch
        if (isEBlock && isGroundFloor)
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF064E3B), Color(0xFF0F766E)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF34D399), width: 1.2),
            ),
            child: Row(
              children: [
                const Icon(Icons.people_alt, color: Color(0xFF6EE7B7), size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'E Block Staff Room 01 Cabins',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      Text(
                        '10 Faculty Cabins • Live Availability • Dean Office',
                        style: TextStyle(color: Color(0xFFA7F3D0), fontSize: 10),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => StaffRoomScreen(
                          staffRoomId: 'sr_e_block_01',
                          buildingName: _selectedBuilding.name,
                          onSwitchFloor: (flr) {
                            setState(() => _selectedFloorLevel = flr);
                          },
                        ),
                      ),
                    );
                  },
                  child: const Text('OPEN MAP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),

        // Top Bay Rooms
        if (topBayRooms.isNotEmpty) _buildRoomsRow(topBayRooms),

        // Central Corridor Divider
        Container(
          margin: const EdgeInsets.symmetric(vertical: 10),
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 14),
          decoration: BoxDecoration(
            color: const Color(0xFF181C25),
            borderRadius: BorderRadius.circular(10),
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

        // Bottom Bay Rooms
        if (bottomBayRooms.isNotEmpty) _buildRoomsRow(bottomBayRooms),

        // Opposite Wing: Staff Rooms & Dean Office
        if (oppositeWingRooms.isNotEmpty) ...[
          const SizedBox(height: 12),
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
                    letterSpacing: 1.1,
                    color: Color(0xFFFBBF24),
                  ),
                ),
                Text('Opposite Side Corridor', style: TextStyle(fontSize: 9, color: Colors.white38)),
              ],
            ),
          ),
          const SizedBox(height: 8),
          _buildRoomsRow(oppositeWingRooms),
        ],
      ],
    );
  }

  Widget _buildRoomsRow(List<Room> roomsList) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: roomsList.length,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: roomsList.length > 2 ? 3 : 2,
        childAspectRatio: 1.25,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemBuilder: (context, idx) {
        final room = roomsList[idx];
        final isSelected = _selectedRoom?.roomId == room.roomId;
        final roomColor = _getRoomColor(room);

        return InkWell(
          onTap: () {
            setState(() => _selectedRoom = room);
            if (room.isStaffRoom && _selectedBuilding.blockLetter.toUpperCase() == 'E') {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => StaffRoomScreen(
                    staffRoomId: room.roomId,
                    buildingName: _selectedBuilding.name,
                    onSwitchFloor: (flr) {
                      setState(() => _selectedFloorLevel = flr);
                    },
                  ),
                ),
              );
            }
          },
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isSelected ? roomColor.withValues(alpha: 0.25) : const Color(0xFF131D31),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? roomColor : const Color(0xFF1E293B),
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: roomColor.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    room.typeLabel.toUpperCase(),
                    style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: roomColor),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  room.roomCode,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  room.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 9.5, color: Colors.white60),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  /// 2. Architectural Blueprint / Route Canvas
  Widget _buildBlueprintLayout(Floor? currentFloor, List<Room> rooms, Color themeColor) {
    return Column(
      children: [
        // Route Configuration Selectors
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          color: const Color(0xFF0F172A),
          child: Row(
            children: [
              // Start Point Selector
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('FROM', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white54)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          isExpanded: true,
                          value: _startPoint,
                          dropdownColor: const Color(0xFF1E293B),
                          style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold),
                          items: const [
                            DropdownMenuItem(value: 'entrance', child: Text('Main Entrance')),
                            DropdownMenuItem(value: 'stairs', child: Text('Central Stairs')),
                            DropdownMenuItem(value: 'elevator', child: Text('Elevator Bay')),
                          ],
                          onChanged: (val) {
                            if (val != null) setState(() => _startPoint = val);
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                child: Icon(Icons.arrow_forward, color: Color(0xFF38BDF8), size: 16),
              ),
              // Destination Room Selector
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('TO', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white54)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          isExpanded: true,
                          value: _selectedRoom?.roomId,
                          dropdownColor: const Color(0xFF1E293B),
                          style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold),
                          items: rooms.map((r) {
                            return DropdownMenuItem<String>(
                              value: r.roomId,
                              child: Text('${r.roomCode} - ${r.name}'),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              final found = rooms.firstWhere((r) => r.roomId == val);
                              setState(() => _selectedRoom = found);
                            }
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Interactive 2D Blueprint Schematic Canvas
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Container(
                color: const Color(0xFF040D1A),
                child: CustomPaint(
                  size: Size.infinite,
                  painter: ArchitecturalBlueprintPainter(
                    rooms: rooms,
                    selectedRoom: _selectedRoom,
                    startPoint: _startPoint,
                    themeColor: themeColor,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  /// Selected Room Bottom Information Card
  Widget _buildSelectedRoomFooter(Color themeColor) {
    final room = _selectedRoom!;
    final roomColor = _getRoomColor(room);
    final distanceMeters = 18 + (_selectedFloorLevel * 12);
    final walkingMinutes = 0.5 + (_selectedFloorLevel * 0.4);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        border: Border(top: BorderSide(color: Color(0xFF1E293B), width: 1.5)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: roomColor.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: roomColor.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    room.roomCode,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      color: roomColor,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    room.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Level $_selectedFloorLevel',
                    style: const TextStyle(fontSize: 10, color: Colors.white70),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),

            // Turn-by-Turn Guidance Text
            Row(
              children: [
                const Icon(Icons.directions_walk, size: 14, color: Color(0xFF38BDF8)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Walk along Central Corridor (${distanceMeters}m · ~${walkingMinutes.toStringAsFixed(1)} min) to ${room.roomCode}',
                    style: const TextStyle(fontSize: 11, color: Color(0xFF38BDF8)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Action Buttons
            Row(
              children: [
                if (room.isStaffRoom && _selectedBuilding.blockLetter.toUpperCase() == 'E') ...[
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFF59E0B),
                        side: const BorderSide(color: Color(0xFFF59E0B)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.people_alt, size: 16),
                      label: const Text('CABINS & FACULTY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => StaffRoomScreen(
                              staffRoomId: room.roomId,
                              buildingName: _selectedBuilding.name,
                              onSwitchFloor: (flr) {
                                setState(() => _selectedFloorLevel = flr);
                              },
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: themeColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.navigation, size: 16),
                    label: Text(
                      'NAVIGATE TO ${room.roomCode}',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () {
                      Navigator.pop(context, room);
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Custom 2D Architectural Floor Plan Painter
class ArchitecturalBlueprintPainter extends CustomPainter {
  final List<Room> rooms;
  final Room? selectedRoom;
  final String startPoint;
  final Color themeColor;

  ArchitecturalBlueprintPainter({
    required this.rooms,
    required this.selectedRoom,
    required this.startPoint,
    required this.themeColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()..color = const Color(0xFF040D1A);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // Architectural Grid Lines
    final gridPaint = Paint()
      ..color = const Color(0xFF0E223D)
      ..strokeWidth = 0.8;
    for (double x = 0; x < size.width; x += 24) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += 24) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    final margin = 20.0;
    final buildingRect = Rect.fromLTWH(margin, margin, size.width - margin * 2, size.height - margin * 2);

    // Building Boundary
    final wallPaint = Paint()
      ..color = const Color(0xFF38BDF8).withValues(alpha: 0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;
    canvas.drawRRect(RRect.fromRectAndRadius(buildingRect, const Radius.circular(8)), wallPaint);

    // Central Corridor
    final corridorY = buildingRect.top + (buildingRect.height * 0.45);
    final corridorHeight = buildingRect.height * 0.16;
    final corridorRect = Rect.fromLTWH(buildingRect.left + 8, corridorY, buildingRect.width - 16, corridorHeight);

    final corridorPaint = Paint()
      ..color = const Color(0xFF0A1E36)
      ..style = PaintingStyle.fill;
    canvas.drawRect(corridorRect, corridorPaint);

    final corridorBorderPaint = Paint()
      ..color = const Color(0xFF1E3A5F)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawRect(corridorRect, corridorBorderPaint);

    // Room Layout Calculations
    final topRooms = rooms.take(3).toList();
    final bottomRooms = rooms.skip(3).take(3).toList();

    Offset? targetRoomDoorOffset;

    // Draw Top Bay Rooms
    if (topRooms.isNotEmpty) {
      final roomWidth = (buildingRect.width - 24) / topRooms.length;
      final roomHeight = corridorY - buildingRect.top - 12;

      for (int i = 0; i < topRooms.length; i++) {
        final r = topRooms[i];
        final rx = buildingRect.left + 12 + (i * roomWidth);
        final ry = buildingRect.top + 8;
        final rRect = Rect.fromLTWH(rx, ry, roomWidth - 6, roomHeight);
        final isSelected = selectedRoom?.roomId == r.roomId;

        _drawRoom(canvas, r, rRect, isSelected);

        if (isSelected) {
          targetRoomDoorOffset = Offset(rRect.center.dx, rRect.bottom);
        }
      }
    }

    // Draw Bottom Bay Rooms
    if (bottomRooms.isNotEmpty) {
      final roomWidth = (buildingRect.width - 24) / bottomRooms.length;
      final roomY = corridorRect.bottom + 8;
      final roomHeight = buildingRect.bottom - roomY - 8;

      for (int i = 0; i < bottomRooms.length; i++) {
        final r = bottomRooms[i];
        final rx = buildingRect.left + 12 + (i * roomWidth);
        final rRect = Rect.fromLTWH(rx, roomY, roomWidth - 6, roomHeight);
        final isSelected = selectedRoom?.roomId == r.roomId;

        _drawRoom(canvas, r, rRect, isSelected);

        if (isSelected) {
          targetRoomDoorOffset = Offset(rRect.center.dx, rRect.top);
        }
      }
    }

    // Start Waypoint
    Offset startOffset;
    if (startPoint == 'stairs') {
      startOffset = Offset(corridorRect.right - 24, corridorRect.center.dy);
    } else if (startPoint == 'elevator') {
      startOffset = Offset(corridorRect.center.dx, corridorRect.center.dy);
    } else {
      // Main entrance (West side)
      startOffset = Offset(corridorRect.left + 24, corridorRect.center.dy);
    }

    // Draw Start Waypoint Icon
    final startPaint = Paint()..color = const Color(0xFF10B981);
    canvas.drawCircle(startOffset, 8, startPaint);
    final startBorderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawCircle(startOffset, 8, startBorderPaint);

    // Draw Navigation Polyline Route Path
    if (targetRoomDoorOffset != null) {
      final routePath = Path();
      routePath.moveTo(startOffset.dx, startOffset.dy);

      // Walk along central corridor
      routePath.lineTo(targetRoomDoorOffset.dx, corridorRect.center.dy);
      // Turn into room door
      routePath.lineTo(targetRoomDoorOffset.dx, targetRoomDoorOffset.dy);

      final routePaint = Paint()
        ..color = const Color(0xFF38BDF8)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.5
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round;

      canvas.drawPath(routePath, routePaint);

      // Target Pin
      final targetPaint = Paint()..color = const Color(0xFFEF4444);
      canvas.drawCircle(targetRoomDoorOffset, 9, targetPaint);
      final targetInnerPaint = Paint()..color = Colors.white;
      canvas.drawCircle(targetRoomDoorOffset, 4, targetInnerPaint);
    }
  }

  void _drawRoom(Canvas canvas, Room room, Rect rect, bool isSelected) {
    Color fillColor = isSelected
        ? const Color(0xFF0284C7).withValues(alpha: 0.35)
        : const Color(0xFF0A1B30);

    final roomPaint = Paint()
      ..color = fillColor
      ..style = PaintingStyle.fill;
    canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(6)), roomPaint);

    final borderPaint = Paint()
      ..color = isSelected ? const Color(0xFF38BDF8) : const Color(0xFF1E3A5F)
      ..style = PaintingStyle.stroke
      ..strokeWidth = isSelected ? 2.0 : 1.0;
    canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(6)), borderPaint);

    // Room Text Label
    final textPainter = TextPainter(
      text: TextSpan(
        text: room.roomCode,
        style: TextStyle(
          color: isSelected ? Colors.white : Colors.white70,
          fontWeight: FontWeight.bold,
          fontSize: 10,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(rect.center.dx - (textPainter.width / 2), rect.center.dy - (textPainter.height / 2)),
    );
  }

  @override
  bool shouldRepaint(covariant ArchitecturalBlueprintPainter oldDelegate) {
    return oldDelegate.selectedRoom?.roomId != selectedRoom?.roomId ||
        oldDelegate.startPoint != startPoint;
  }
}
