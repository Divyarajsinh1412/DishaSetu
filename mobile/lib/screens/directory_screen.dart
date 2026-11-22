import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/indoor_service.dart';
import '../models/campus_location.dart';
import '../models/building.dart';
import '../widgets/building_bottom_sheet.dart';

class DirectoryScreen extends StatefulWidget {
  final Function(CampusLocation location)? onNavigateTo;

  const DirectoryScreen({super.key, this.onNavigateTo});

  @override
  State<DirectoryScreen> createState() => _DirectoryScreenState();
}

class _DirectoryScreenState extends State<DirectoryScreen> {
  final ApiService _apiService = ApiService();
  List<CampusLocation> _allLocations = [];
  List<Building> _buildings = [];
  List<CampusLocation> _filteredLocations = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Academic',
    'Cafe',
    'Gate',
    'Library',
    'Medical',
    'Garden',
    'Sports',
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final locs = await _apiService.fetchLocations();
    final blds = await _apiService.fetchBuildings();
    setState(() {
      _allLocations = locs;
      _buildings = blds.isNotEmpty ? blds : IndoorService.getAllCampusBuildings();
      _filterList();
      _isLoading = false;
    });
  }

  void _filterList() {
    setState(() {
      _filteredLocations = _allLocations.where((loc) {
        final matchesCat = _selectedCategory == 'All' ||
            loc.category.toLowerCase() == _selectedCategory.toLowerCase();
        final matchesSearch = _searchQuery.isEmpty ||
            loc.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            (loc.shortCode != null && loc.shortCode!.toLowerCase().contains(_searchQuery.toLowerCase())) ||
            (loc.description != null && loc.description!.toLowerCase().contains(_searchQuery.toLowerCase()));
        return matchesCat && matchesSearch;
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF071B32),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          'Campus Directory & Explore',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF38BDF8)),
            onPressed: _loadData,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Search blocks, classrooms, labs, cafes...',
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF38BDF8), size: 20),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFF38BDF8), width: 1.5),
                ),
              ),
              onChanged: (val) {
                _searchQuery = val;
                _filterList();
              },
            ),
          ),

          // Categories Horizontal List
          SizedBox(
            height: 42,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _categories.length,
              itemBuilder: (context, idx) {
                final cat = _categories[idx];
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: FilterChip(
                    label: Text(cat),
                    labelStyle: TextStyle(
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? Colors.white : Colors.white70,
                    ),
                    selected: isSelected,
                    onSelected: (val) {
                      setState(() {
                        _selectedCategory = cat;
                        _filterList();
                      });
                    },
                    backgroundColor: const Color(0xFF1E293B),
                    selectedColor: const Color(0xFF2563EB),
                    checkmarkColor: Colors.white,
                    side: BorderSide(
                      color: isSelected ? const Color(0xFF38BDF8) : const Color(0xFF334155),
                    ),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),

          // List of Locations & Buildings
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF38BDF8)))
                : _filteredLocations.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.search_off, color: Colors.white38, size: 48),
                            SizedBox(height: 12),
                            Text('No campus places found.', style: TextStyle(color: Colors.white54)),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: _filteredLocations.length,
                        itemBuilder: (context, index) {
                          final loc = _filteredLocations[index];
                          final isBuilding = loc.category.toLowerCase() == 'academic' ||
                              (loc.shortCode != null && loc.shortCode!.contains('BLOCK')) ||
                              loc.name.contains('Block');

                          final matchedBuilding = _buildings.firstWhere(
                            (b) => b.shortCode.toLowerCase() == loc.shortCode?.toLowerCase() ||
                                b.name.toLowerCase() == loc.name.toLowerCase() ||
                                b.buildingId == loc.buildingId,
                            orElse: () => Building(
                              buildingId: loc.buildingId ?? 'bld_${loc.name.toLowerCase().replaceAll(' ', '_')}',
                              name: loc.name,
                              shortCode: loc.shortCode ?? 'PU-BLD',
                              blockLetter: loc.name.replaceAll(RegExp(r'[^A-Za-z]'), '').take(1).toUpperCase(),
                            ),
                          );

                          return Card(
                            color: const Color(0xFF131D31),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: const BorderSide(color: Color(0xFF1E293B)),
                            ),
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF2563EB).withOpacity(0.18),
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: Icon(
                                          _getCategoryIcon(loc.category),
                                          color: const Color(0xFF38BDF8),
                                          size: 20,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              loc.name,
                                              style: const TextStyle(
                                                fontSize: 15,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.white,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Row(
                                              children: [
                                                Text(
                                                  loc.category,
                                                  style: const TextStyle(fontSize: 11, color: Colors.white60),
                                                ),
                                                if (loc.shortCode != null) ...[
                                                  const Text(' · ', style: TextStyle(color: Colors.white38)),
                                                  Text(
                                                    loc.shortCode!,
                                                    style: const TextStyle(
                                                      fontSize: 10,
                                                      fontFamily: 'monospace',
                                                      fontWeight: FontWeight.bold,
                                                      color: Color(0xFF10B981),
                                                    ),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (loc.description != null && loc.description!.isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    Text(
                                      loc.description!,
                                      style: const TextStyle(fontSize: 12, color: Colors.white70),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      if (isBuilding)
                                        Expanded(
                                          child: OutlinedButton.icon(
                                            style: OutlinedButton.styleFrom(
                                              foregroundColor: const Color(0xFF38BDF8),
                                              side: const BorderSide(color: Color(0xFF0284C7)),
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                              padding: const EdgeInsets.symmetric(vertical: 8),
                                            ),
                                            icon: const Icon(Icons.layers, size: 16),
                                            label: const Text('VIEW FLOORS & ROOMS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                            onPressed: () {
                                              BuildingBottomSheet.show(
                                                context,
                                                building: matchedBuilding,
                                                onNavigateToRoom: (rm) {
                                                  if (widget.onNavigateTo != null) {
                                                    widget.onNavigateTo!(loc);
                                                  }
                                                },
                                              );
                                            },
                                          ),
                                        ),
                                      if (isBuilding) const SizedBox(width: 8),
                                      ElevatedButton.icon(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF2563EB),
                                          foregroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                        ),
                                        icon: const Icon(Icons.navigation, size: 15),
                                        label: const Text('NAVIGATE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                        onPressed: () {
                                          if (widget.onNavigateTo != null) {
                                            widget.onNavigateTo!(loc);
                                          }
                                        },
                                      ),
                                    ],
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
    );
  }

  IconData _getCategoryIcon(String cat) {
    switch (cat.toLowerCase()) {
      case 'academic': return Icons.school;
      case 'cafe': return Icons.coffee;
      case 'gate': return Icons.door_sliding;
      case 'library': return Icons.menu_book;
      case 'medical': return Icons.local_hospital;
      case 'garden': return Icons.park;
      case 'sports': return Icons.sports_tennis;
      default: return Icons.place;
    }
  }
}

extension StringTake on String {
  String take(int n) => length <= n ? this : substring(0, n);
}
