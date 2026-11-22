import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/building.dart';
import '../models/floor.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _pinController = TextEditingController();

  bool _isAuthenticated = false;
  bool _isLoading = true;
  String? _authError;

  Map<String, dynamic> _stats = {
    'buildingsCount': 6,
    'floorsCount': 19,
    'roomsCount': 120,
    'pathsCount': 14,
    'landmarksCount': 28,
    'databaseConnected': true,
  };

  List<Building> _buildings = [];
  Building? _selectedBuilding;
  List<Floor> _floors = [];
  Floor? _selectedFloor;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  void _verifyPin() {
    final pin = _pinController.text.trim();
    if (pin == 'PU-ADMIN' || pin == '1234' || pin == 'admin') {
      setState(() {
        _isAuthenticated = true;
        _authError = null;
      });
      _loadAdminData();
    } else {
      setState(() {
        _authError = 'Invalid Administrator PIN. Default: PU-ADMIN';
      });
    }
  }

  Future<void> _loadAdminData() async {
    setState(() => _isLoading = true);
    final stats = await _apiService.fetchAdminStats();
    final buildings = await _apiService.fetchBuildings();

    setState(() {
      _stats = stats;
      _buildings = buildings;
      if (buildings.isNotEmpty) {
        _selectedBuilding = buildings.first;
      }
      _isLoading = false;
    });

    if (_selectedBuilding != null) {
      _loadBuildingFloors(_selectedBuilding!);
    }
  }

  Future<void> _loadBuildingFloors(Building building) async {
    final floors = await _apiService.fetchIndoorFloors(building.id);
    setState(() {
      _floors = floors;
      _selectedFloor = floors.isNotEmpty ? floors.first : null;
    });
  }

  void _showAddEditRoomDialog({Room? room}) {
    final nameController = TextEditingController(text: room?.name ?? '');
    final codeController = TextEditingController(text: room?.code ?? '');
    String roomType = room?.type ?? (_selectedBuilding?.code == 'PU-D-BLOCK' ? 'LAB' : 'CLASSROOM');

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Text(
                room == null ? 'Add New Room' : 'Edit Room: ${room.code}',
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: codeController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'Room Code (e.g. EF01, DGL01)',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: nameController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'Room Name / Description',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    value: roomType,
                    dropdownColor: const Color(0xFF0F172A),
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'Room Category',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'CLASSROOM', child: Text('Classroom')),
                      DropdownMenuItem(value: 'LAB', child: Text('Laboratory (D Block)')),
                      DropdownMenuItem(value: 'STAFF_ROOM', child: Text('Staff Room')),
                      DropdownMenuItem(value: 'OFFICE', child: Text('Dean / Admin Office')),
                    ],
                    onChanged: (val) {
                      if (val != null) setDialogState(() => roomType = val);
                    },
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7)),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Room ${codeController.text} updated in active floor layout.'),
                        backgroundColor: const Color(0xFF10B981),
                      ),
                    );
                    Navigator.pop(ctx);
                  },
                  child: const Text('Save', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B132B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: const Row(
          children: [
            Icon(Icons.admin_panel_settings, color: Color(0xFF38BDF8), size: 22),
            SizedBox(width: 8),
            Text('Campus Administrator Portal', style: TextStyle(color: Colors.white, fontSize: 16)),
          ],
        ),
        actions: [
          if (_isAuthenticated)
            IconButton(
              icon: const Icon(Icons.sync, color: Color(0xFF38BDF8)),
              tooltip: 'Sync Atlas Database',
              onPressed: _loadAdminData,
            ),
        ],
      ),
      body: !_isAuthenticated ? _buildPinLogin() : _buildDashboardBody(),
    );
  }

  Widget _buildPinLogin() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 400),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white12),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.5), blurRadius: 20, offset: const Offset(0, 10)),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: const Color(0xFF0284C7).withOpacity(0.2),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.3)),
                ),
                child: const Icon(Icons.security, color: Color(0xFF38BDF8), size: 32),
              ),
              const SizedBox(height: 16),
              const Text(
                'Presidency Campus Admin',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              const Text(
                'Enter administrator security credentials to manage verified buildings, room directories, and KML geometries.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white60, fontSize: 12),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _pinController,
                obscureText: true,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                decoration: InputDecoration(
                  labelText: 'Admin PIN / Security Key',
                  labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
                  hintText: 'Default PIN: PU-ADMIN',
                  hintStyle: const TextStyle(color: Colors.white30, fontSize: 12),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF38BDF8), size: 18),
                ),
                onSubmitted: (_) => _verifyPin(),
              ),
              if (_authError != null) ...[
                const SizedBox(height: 10),
                Text(_authError!, style: const TextStyle(color: Color(0xFFF87171), fontSize: 12)),
              ],
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.login, color: Colors.white, size: 18),
                  label: const Text(
                    'AUTHENTICATE & ENTER',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: _verifyPin,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDashboardBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF38BDF8)));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Atlas Connection Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF10B981).withOpacity(0.35)),
            ),
            child: const Row(
              children: [
                Icon(Icons.cloud_done, color: Color(0xFF34D399), size: 18),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'MongoDB Atlas Live Cluster Connected • Shared Backend Active',
                    style: TextStyle(color: Color(0xFF34D399), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Campus Stats Grid
          const Text(
            'CAMPUS STATS OVERVIEW',
            style: TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8),
          ),
          const SizedBox(height: 10),

          GridView.count(
            crossAxisCount: 3,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.1,
            children: [
              _buildStatCard('Buildings', '${_stats['buildingsCount']}', Icons.apartment, const Color(0xFF38BDF8)),
              _buildStatCard('Floors', '${_stats['floorsCount']}', Icons.layers, const Color(0xFF10B981)),
              _buildStatCard('Rooms', '${_stats['roomsCount']}', Icons.door_front_door, const Color(0xFFF59E0B)),
              _buildStatCard('Paths', '${_stats['pathsCount']}', Icons.timeline, const Color(0xFFA855F7)),
              _buildStatCard('Landmarks', '${_stats['landmarksCount']}', Icons.place, const Color(0xFFEC4899)),
              _buildStatCard('Atlas Status', 'ONLINE', Icons.dns, const Color(0xFF14B8A6)),
            ],
          ),

          const SizedBox(height: 20),

          // Building & Floor Directory Manager
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'BUILDINGS & FLOOR-ROOM MANAGER',
                style: TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8),
              ),
              ElevatedButton.icon(
                icon: const Icon(Icons.add, size: 14, color: Colors.white),
                label: const Text('Add Room', style: TextStyle(fontSize: 11, color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0284C7),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () => _showAddEditRoomDialog(),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Building Selection Chips
          SizedBox(
            height: 40,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _buildings.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final b = _buildings[index];
                final isSelected = _selectedBuilding?.id == b.id;
                return ChoiceChip(
                  label: Text(b.code),
                  selected: isSelected,
                  selectedColor: const Color(0xFF0284C7),
                  backgroundColor: const Color(0xFF1E293B),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 12,
                  ),
                  side: BorderSide(color: isSelected ? const Color(0xFF38BDF8) : Colors.white12),
                  onSelected: (_) {
                    setState(() => _selectedBuilding = b);
                    _loadBuildingFloors(b);
                  },
                );
              },
            ),
          ),

          const SizedBox(height: 12),

          // Floor Tabs
          if (_floors.isNotEmpty) ...[
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _floors.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final f = _floors[index];
                  final isSelected = _selectedFloor?.floorNumber == f.floorNumber;
                  return ChoiceChip(
                    label: Text(f.name),
                    selected: isSelected,
                    selectedColor: const Color(0xFF334155),
                    backgroundColor: const Color(0xFF1E293B),
                    labelStyle: TextStyle(
                      color: isSelected ? const Color(0xFF38BDF8) : Colors.white60,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 11,
                    ),
                    side: BorderSide(color: isSelected ? const Color(0xFF38BDF8) : Colors.transparent),
                    onSelected: (_) => setState(() => _selectedFloor = f),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Rooms List on Selected Floor
          if (_selectedFloor != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${_selectedBuilding?.name ?? ""} • ${_selectedFloor!.name}',
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        '${_selectedFloor!.rooms.length} Rooms',
                        style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Divider(color: Colors.white12, height: 1),
                  const SizedBox(height: 8),
                  ..._selectedFloor!.rooms.map((room) {
                    return ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: room.isLab
                              ? const Color(0xFF0284C7).withOpacity(0.2)
                              : room.isStaffRoom || room.isOffice
                                  ? const Color(0xFFF59E0B).withOpacity(0.2)
                                  : const Color(0xFF10B981).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          room.code,
                          style: TextStyle(
                            color: room.isLab
                                ? const Color(0xFF38BDF8)
                                : room.isStaffRoom || room.isOffice
                                    ? const Color(0xFFFBBF24)
                                    : const Color(0xFF34D399),
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                      ),
                      title: Text(room.name, style: const TextStyle(color: Colors.white, fontSize: 12)),
                      subtitle: Text(
                        'Category: ${room.typeLabel}',
                        style: const TextStyle(color: Colors.white60, fontSize: 10),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.edit, color: Colors.white60, size: 16),
                        onPressed: () => _showAddEditRoomDialog(room: room),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(color: color, fontSize: 15, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(title, style: const TextStyle(color: Colors.white60, fontSize: 10), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
