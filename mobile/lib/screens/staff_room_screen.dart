import 'dart:async';
import 'package:flutter/material.dart';
import '../models/staff_room.dart';
import '../services/api_service.dart';

class StaffRoomScreen extends StatefulWidget {
  final String staffRoomId;
  final String buildingName;
  final Function(int floorNumber)? onSwitchFloor;

  const StaffRoomScreen({
    super.key,
    this.staffRoomId = 'sr_e_block_01',
    this.buildingName = 'E Block',
    this.onSwitchFloor,
  });

  @override
  State<StaffRoomScreen> createState() => _StaffRoomScreenState();
}

class _StaffRoomScreenState extends State<StaffRoomScreen> {
  final ApiService _apiService = ApiService();
  StaffRoom? _staffRoom;
  StaffRoomCabin? _selectedCabin;
  Faculty? _selectedFaculty;
  bool _isLoading = true;
  bool _isUpdating = false;
  String _currentTime = '';
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _updateClock();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _updateClock());
    _loadStaffRoomData();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _updateClock() {
    final now = DateTime.now();
    final hour = now.hour > 12 ? now.hour - 12 : (now.hour == 0 ? 12 : now.hour);
    final minute = now.minute.toString().padLeft(2, '0');
    final ampm = now.hour >= 12 ? 'PM' : 'AM';
    if (mounted) {
      setState(() => _currentTime = '$hour:$minute $ampm');
    }
  }

  Future<void> _loadStaffRoomData() async {
    setState(() => _isLoading = true);
    final room = await _apiService.fetchStaffRoom(widget.staffRoomId);
    setState(() {
      _staffRoom = room;
      _isLoading = false;
      // Default select SR-03 (Faizan Anwar Khan) to match reference mockup
      if (_selectedCabin == null && room.cabins.isNotEmpty) {
        _selectedCabin = room.cabins.firstWhere(
          (c) => c.cabinId == 'SR-03',
          orElse: () => room.cabins.first,
        );
        _selectedFaculty = _selectedCabin?.faculty;
      }
    });
  }

  void _onCabinTapped(StaffRoomCabin cabin) {
    if (cabin.isWalkingArea || cabin.isLoungeEntry) return;
    setState(() {
      _selectedCabin = cabin;
      _selectedFaculty = cabin.faculty;
    });
  }

  Future<void> _toggleFacultyStatus() async {
    if (_selectedFaculty == null) return;
    setState(() => _isUpdating = true);

    final newStatus = _selectedFaculty!.isAvailable ? 'Unavailable' : 'Available';
    final success = await _apiService.updateFacultyStatus(_selectedFaculty!.facultyId, newStatus);

    if (success) {
      await _loadStaffRoomData();
      if (_selectedFaculty != null) {
        setState(() {
          _selectedFaculty = Faculty(
            facultyId: _selectedFaculty!.facultyId,
            name: _selectedFaculty!.name,
            designation: _selectedFaculty!.designation,
            department: _selectedFaculty!.department,
            cabinId: _selectedFaculty!.cabinId,
            cabinNumber: _selectedFaculty!.cabinNumber,
            currentStatus: newStatus,
            currentActivity: newStatus == 'Available' ? 'In Cabin' : 'Taking Lecture',
            currentLocation: newStatus == 'Available' ? 'Staff Room 01' : (_selectedFaculty!.currentClassLocation ?? 'E Block – EF03'),
            currentClassLocation: _selectedFaculty!.currentClassLocation,
            currentLectureTime: _selectedFaculty!.currentLectureTime,
            currentSubject: _selectedFaculty!.currentSubject,
            nextAvailability: newStatus == 'Available' ? 'Available Now' : 'Check Schedule',
            avatar: _selectedFaculty!.avatar,
            timetable: _selectedFaculty!.timetable,
          );
        });
      }
    }

    setState(() => _isUpdating = false);
  }

  void _showTimetableDialog() {
    if (_selectedFaculty == null) return;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.calendar_month, color: Color(0xFF38BDF8), size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                '${_selectedFaculty!.name} — Timetable',
                style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: _selectedFaculty!.timetable.isEmpty
              ? const Padding(
                  padding: EdgeInsets.all(20),
                  child: Text('No weekly timetable registered.', style: TextStyle(color: Colors.white60)),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  itemCount: _selectedFaculty!.timetable.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, idx) {
                    final slot = _selectedFaculty!.timetable[idx];
                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${slot.day} • ${slot.subject}',
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${slot.building} — ${slot.room} (${slot.floor})',
                                style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11),
                              ),
                            ],
                          ),
                          Text(
                            '${slot.startTime}\n${slot.endTime}',
                            textAlign: TextAlign.right,
                            style: const TextStyle(color: Colors.white70, fontSize: 11),
                          ),
                        ],
                      ),
                    );
                  },
                ),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7)),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cabins = _staffRoom?.cabins ?? StaffRoom.getVerifiedFallback().cabins;
    final row1 = cabins.where((c) => c.row == 1).toList();
    final row2 = cabins.where((c) => c.row == 2).toList();
    final row3 = cabins.where((c) => c.row == 3).toList();

    final availableCount = cabins.where((c) => c.type == 'cabin' && c.isAvailable).length;
    final unavailableCount = cabins.where((c) => c.type == 'cabin' && !c.isAvailable).length;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), // Light architectural blueprint tone
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFE0E7FF),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.apartment, color: Color(0xFF4338CA), size: 18),
            ),
            const SizedBox(width: 8),
            Text(
              '${widget.buildingName} › Staff Room 01',
              style: const TextStyle(
                color: Color(0xFF0F172A),
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          // Live status badge
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: Row(
              children: [
                const Icon(Icons.circle, color: Color(0xFF10B981), size: 8),
                const SizedBox(width: 5),
                Text(
                  'Live Status • $_currentTime',
                  style: const TextStyle(
                    color: Color(0xFF065F46),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0284C7)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  // 1. Live Availability Stats Summary Bar
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFA7F3D0)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.circle, color: Color(0xFF10B981), size: 10),
                                  SizedBox(width: 8),
                                  Text(
                                    'Available (In Cabin)',
                                    style: TextStyle(color: Color(0xFF065F46), fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              Text(
                                '$availableCount',
                                style: const TextStyle(color: Color(0xFF047857), fontSize: 16, fontWeight: FontWeight.w900),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF1F2),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFFECDD3)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.circle, color: Color(0xFFF43F5E), size: 10),
                                  SizedBox(width: 8),
                                  Text(
                                    'Unavailable (In Lecture)',
                                    style: TextStyle(color: Color(0xFF9F1239), fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              Text(
                                '$unavailableCount',
                                style: const TextStyle(color: Color(0xFFBE123C), fontSize: 16, fontWeight: FontWeight.w900),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Room Label Header Pill
                  Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: const [
                          BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2)),
                        ],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.group, color: Color(0xFF38BDF8), size: 14),
                          SizedBox(width: 6),
                          Text(
                            'Staff Room 01',
                            style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 10),

                  // 2. THE ARCHITECTURAL FLOOR PLAN CONTAINER
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF1E293B), width: 3),
                      boxShadow: const [
                        BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, 4)),
                      ],
                    ),
                    child: Column(
                      children: [
                        // Row 1
                        _buildCabinsRow(row1),

                        const SizedBox(height: 6),

                        // Walking Corridor 1
                        _buildWalkingCorridor('W A L K I N G   A R E A'),

                        const SizedBox(height: 6),

                        // Row 2
                        _buildCabinsRow(row2),

                        const SizedBox(height: 6),

                        // Walking Corridor 2
                        _buildWalkingCorridor('W A L K I N G   A R E A'),

                        const SizedBox(height: 6),

                        // Row 3 (Entry Lounge + SR-09 + SR-10 + Dean Office)
                        _buildRow3(row3),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  // 3. SELECTED FACULTY DETAIL CARD
                  if (_selectedFaculty != null) _buildFacultyDetailCard(),

                  const SizedBox(height: 14),

                  // 4. BOTTOM FLOOR SWITCHER
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFloorChip(
                          label: 'Ground Floor (Staff & Offices)',
                          isActive: true,
                          onTap: () {},
                        ),
                        const SizedBox(width: 8),
                        _buildFloorChip(
                          label: 'First Floor (Classrooms)',
                          isActive: false,
                          onTap: () {
                            Navigator.pop(context);
                            widget.onSwitchFloor?.call(1);
                          },
                        ),
                        const SizedBox(width: 8),
                        _buildFloorChip(
                          label: 'Second Floor (Classrooms)',
                          isActive: false,
                          onTap: () {
                            Navigator.pop(context);
                            widget.onSwitchFloor?.call(2);
                          },
                        ),
                        const SizedBox(width: 8),
                        _buildFloorChip(
                          label: 'Third Floor (Classrooms)',
                          isActive: false,
                          onTap: () {
                            Navigator.pop(context);
                            widget.onSwitchFloor?.call(3);
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildWalkingCorridor(String label) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0xFFCBD5E1)),
      ),
      child: Center(
        child: Text(
          label,
          style: const TextStyle(
            color: Color(0xFF64748B),
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 2.0,
          ),
        ),
      ),
    );
  }

  Widget _buildCabinsRow(List<StaffRoomCabin> rowCabins) {
    return Row(
      children: rowCabins.map((cabin) {
        if (cabin.isWalkingArea) {
          return Expanded(
            flex: 1,
            child: Container(
              height: 76,
              margin: const EdgeInsets.symmetric(horizontal: 2),
              decoration: BoxDecoration(
                color: const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF94A3B8)),
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.directions_walk, size: 16, color: Color(0xFF64748B)),
                  SizedBox(height: 2),
                  Text(
                    'Walking\nArea',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF64748B), fontSize: 8, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          );
        }

        return Expanded(
          flex: 1,
          child: _buildCabinBox(cabin),
        );
      }).toList(),
    );
  }

  Widget _buildRow3(List<StaffRoomCabin> row3) {
    final sr09 = row3.firstWhere((c) => c.cabinId == 'SR-09', orElse: () => row3[1]);
    final sr10 = row3.firstWhere((c) => c.cabinId == 'SR-10', orElse: () => row3[2]);
    final dean = row3.firstWhere((c) => c.isDeanOffice, orElse: () => row3.last);

    return Row(
      children: [
        // Entry & Visitor Lounge (Width 1.5x)
        Expanded(
          flex: 2,
          child: Container(
            height: 76,
            margin: const EdgeInsets.symmetric(horizontal: 2),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFCBD5E1), width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Text('↑', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black)),
                    SizedBox(width: 4),
                    Text('Entry', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black87)),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(width: 5, height: 16, decoration: BoxDecoration(color: Colors.grey.shade400, borderRadius: BorderRadius.circular(2))),
                    const SizedBox(width: 4),
                    Container(
                      width: 20,
                      height: 10,
                      decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(3), border: Border.all(color: const Color(0xFFF59E0B))),
                      child: Center(child: Container(width: 4, height: 4, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle))),
                    ),
                    const SizedBox(width: 4),
                    Container(width: 5, height: 16, decoration: BoxDecoration(color: Colors.grey.shade400, borderRadius: BorderRadius.circular(2))),
                  ],
                ),
                const Center(
                  child: Text('Lounge', style: TextStyle(fontSize: 8, color: Colors.grey, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ),

        // SR-09
        Expanded(flex: 1, child: _buildCabinBox(sr09)),

        // SR-10
        Expanded(flex: 1, child: _buildCabinBox(sr10)),

        // Dean Office
        Expanded(flex: 1, child: _buildCabinBox(dean)),
      ],
    );
  }

  Widget _buildCabinBox(StaffRoomCabin cabin) {
    final isSelected = _selectedCabin?.cabinId == cabin.cabinId;
    final isAvail = cabin.isAvailable;
    final isDean = cabin.isDeanOffice;

    Color bg = isDean
        ? const Color(0xFFFAF5FF)
        : isAvail
            ? const Color(0xFFF0FDF4)
            : const Color(0xFFFFF1F2);

    Color border = isSelected
        ? (isDean ? const Color(0xFFA855F7) : (isAvail ? const Color(0xFF10B981) : const Color(0xFFF43F5E)))
        : (isDean ? const Color(0xFFE9D5FF) : (isAvail ? const Color(0xFFBBF7D0) : const Color(0xFFFECDD3)));

    return GestureDetector(
      onTap: () => _onCabinTapped(cabin),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        height: 76,
        margin: const EdgeInsets.symmetric(horizontal: 2),
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: border, width: isSelected ? 2.2 : 1.2),
          boxShadow: [
            if (isSelected)
              BoxShadow(color: border.withValues(alpha: 0.4), blurRadius: 6, offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Top: Indicator + Code
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.circle,
                      size: 7,
                      color: isDean
                          ? const Color(0xFF9333EA)
                          : isAvail
                              ? const Color(0xFF10B981)
                              : const Color(0xFFF43F5E),
                    ),
                    const SizedBox(width: 3),
                    Text(
                      cabin.cabinNumber,
                      style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                    ),
                  ],
                ),
                if (isDean)
                  const Icon(Icons.business_center, size: 10, color: Color(0xFF9333EA)),
              ],
            ),

            // Faculty Name
            Text(
              cabin.facultyName ?? 'Vacant',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), height: 1.1),
            ),

            // Desk & Chair CAD Graphic
            Center(
              child: Column(
                children: [
                  Container(width: 6, height: 3, decoration: const BoxDecoration(color: Color(0xFF475569), borderRadius: BorderRadius.vertical(top: Radius.circular(2)))),
                  Container(width: 18, height: 4, decoration: BoxDecoration(color: const Color(0xFFB45309), borderRadius: BorderRadius.circular(2))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFacultyDetailCard() {
    final fac = _selectedFaculty!;
    final isAvail = fac.isAvailable;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Avatar + Name + Cabin + Status Pill
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Image.network(
                  fac.avatar,
                  width: 50,
                  height: 50,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 50,
                    height: 50,
                    color: const Color(0xFFE0E7FF),
                    child: const Icon(Icons.person, color: Color(0xFF4338CA)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fac.name,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text(
                          'Cabin: ${fac.cabinNumber}',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: isAvail ? const Color(0xFFDCFCE7) : const Color(0xFFFFE4E6),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: isAvail ? const Color(0xFF86EFAC) : const Color(0xFFFECDD3)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.circle, size: 6, color: isAvail ? const Color(0xFF16A34A) : const Color(0xFFE11D48)),
                              const SizedBox(width: 4),
                              Text(
                                fac.currentStatus,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isAvail ? const Color(0xFF15803D) : const Color(0xFFBE123C),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),
          const Divider(color: Color(0xFFF1F5F9), height: 1),
          const SizedBox(height: 10),

          // Detail Rows
          _buildInfoRow(Icons.work_outline, 'Current Activity', fac.currentActivity),
          const SizedBox(height: 6),
          _buildInfoRow(
            Icons.pin_drop_outlined,
            'Class Location',
            fac.currentClassLocation ?? fac.currentLocation,
            isHighlight: true,
          ),
          const SizedBox(height: 6),
          _buildInfoRow(Icons.schedule, 'Time', fac.currentLectureTime ?? 'Available Now'),
          const SizedBox(height: 6),
          _buildInfoRow(Icons.menu_book, 'Subject', fac.currentSubject ?? fac.department),
          const SizedBox(height: 6),
          _buildInfoRow(Icons.check_circle_outline, 'Next Availability', fac.nextAvailability, isSuccess: true),

          const SizedBox(height: 14),

          // Action Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.calendar_month, size: 16),
                  label: const Text('View Full Timetable', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF4338CA),
                    side: const BorderSide(color: Color(0xFFC7D2FE)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  onPressed: _showTimetableDialog,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  icon: _isUpdating
                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.sync, size: 16),
                  label: Text(
                    isAvail ? 'Mark In Lecture' : 'Mark In Cabin',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  onPressed: _isUpdating ? null : _toggleFacultyStatus,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value, {bool isHighlight = false, bool isSuccess = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, size: 14, color: const Color(0xFF94A3B8)),
            const SizedBox(width: 6),
            Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
          ],
        ),
        Text(
          value,
          style: TextStyle(
            color: isHighlight
                ? const Color(0xFF4338CA)
                : isSuccess
                    ? const Color(0xFF15803D)
                    : const Color(0xFF0F172A),
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildFloorChip({required String label, required bool isActive, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF0284C7) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isActive ? const Color(0xFF0284C7) : const Color(0xFFCBD5E1)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.white : const Color(0xFF475569),
            fontSize: 11,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
