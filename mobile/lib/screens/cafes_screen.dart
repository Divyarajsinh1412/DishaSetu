import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/cafe.dart';
import '../models/campus_location.dart';

class CafesScreen extends StatefulWidget {
  final Function(CampusLocation location)? onNavigateTo;

  const CafesScreen({super.key, this.onNavigateTo});

  @override
  State<CafesScreen> createState() => _CafesScreenState();
}

class _CafesScreenState extends State<CafesScreen> {
  final ApiService _apiService = ApiService();
  List<Cafe> _cafes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCafes();
  }

  Future<void> _loadCafes() async {
    setState(() => _isLoading = true);
    final list = await _apiService.fetchCafes();
    setState(() {
      _cafes = list;
      _isLoading = false;
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
          'Campus Cafeterias & Dining',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF38BDF8)),
            onPressed: _loadCafes,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF38BDF8)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _cafes.length,
              itemBuilder: (context, idx) {
                final cafe = _cafes[idx];
                final isHattiKaapi = cafe.code == 'PU-CAFE-D-BLOCK' || cafe.name.toLowerCase().contains('hatti');

                return Card(
                  color: const Color(0xFF131D31),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isHattiKaapi ? const Color(0xFFD97706) : const Color(0xFF1E293B),
                      width: isHattiKaapi ? 1.5 : 1.0,
                    ),
                  ),
                  margin: const EdgeInsets.only(bottom: 16),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Cafe Header
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isHattiKaapi ? const Color(0xFFD97706).withOpacity(0.2) : const Color(0xFF2563EB).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isHattiKaapi ? const Color(0xFFD97706) : const Color(0xFF2563EB),
                                ),
                              ),
                              child: Icon(
                                Icons.coffee,
                                color: isHattiKaapi ? const Color(0xFFF59E0B) : const Color(0xFF38BDF8),
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
                                      Expanded(
                                        child: Text(
                                          cafe.name,
                                          style: const TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w900,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF065F46).withOpacity(0.3),
                                          borderRadius: BorderRadius.circular(6),
                                          border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            const Icon(Icons.star, color: Color(0xFFFBBF24), size: 12),
                                            const SizedBox(width: 4),
                                            Text(
                                              cafe.ratingAverage.toStringAsFixed(1),
                                              style: const TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${cafe.locationName} · ${cafe.openingHours}',
                                    style: const TextStyle(fontSize: 11, color: Colors.white60),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 14),
                        const Divider(color: Color(0xFF1E293B)),
                        const SizedBox(height: 6),

                        // Popular Menu Highlights
                        const Text(
                          'FEATURED SPECIALTIES & MENU',
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                            color: Colors.white54,
                          ),
                        ),
                        const SizedBox(height: 8),

                        ...cafe.menuItems.take(4).map((item) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 5),
                            child: Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(
                                    color: item.isVeg ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    item.name,
                                    style: const TextStyle(fontSize: 13, color: Colors.white),
                                  ),
                                ),
                                Text(
                                  '₹${item.price.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF38BDF8),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),

                        const SizedBox(height: 12),

                        // Navigate Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isHattiKaapi ? const Color(0xFFD97706) : const Color(0xFF2563EB),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                            ),
                            icon: const Icon(Icons.navigation, size: 16),
                            label: Text(
                              'NAVIGATE TO ${cafe.name.toUpperCase()}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            onPressed: () {
                              if (widget.onNavigateTo != null) {
                                widget.onNavigateTo!(CampusLocation(
                                  id: cafe.cafeId,
                                  name: cafe.name,
                                  shortCode: cafe.code,
                                  category: 'Cafe',
                                  description: cafe.locationName,
                                  latitude: 13.170420,
                                  longitude: 77.535720,
                                  imageX: 0.235,
                                  imageY: 0.665,
                                ));
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
