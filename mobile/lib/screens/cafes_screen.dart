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
  final Map<String, String> _activeTabs = {}; // cafeId -> 'menu' or 'reviews'

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

  void _showAddReviewDialog(Cafe cafe) {
    double selectedRating = 5.0;
    final nameCtrl = TextEditingController(text: 'Presidency Student');
    final commentCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(modalCtx).viewInsets.bottom,
              ),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: Color(0xFF0F172A),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  border: Border(top: BorderSide(color: Color(0xFF334155), width: 1.5)),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Review ${cafe.name}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white54, size: 20),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text('Rating', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    Row(
                      children: List.generate(5, (index) {
                        final starVal = index + 1.0;
                        return IconButton(
                          icon: Icon(
                            selectedRating >= starVal ? Icons.star : Icons.star_border,
                            color: const Color(0xFFFBBF24),
                            size: 28,
                          ),
                          onPressed: () => setModalState(() => selectedRating = starVal),
                        );
                      }),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: nameCtrl,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: 'Your Name / Dept',
                        labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: commentCtrl,
                      maxLines: 3,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: 'Write your review...',
                        hintText: 'How was the food, service, or coffee?',
                        hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                        labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: const Icon(Icons.send, size: 16),
                        label: const Text('SUBMIT REVIEW', style: TextStyle(fontWeight: FontWeight.bold)),
                        onPressed: () async {
                          final comment = commentCtrl.text.trim();
                          if (comment.isEmpty) return;

                          Navigator.pop(ctx);
                          final ok = await _apiService.submitCafeReview(
                            cafeId: cafe.cafeId,
                            rating: selectedRating,
                            comment: comment,
                            reviewerName: nameCtrl.text.trim(),
                          );

                          if (ok) {
                            setState(() {
                              cafe.reviews.insert(
                                0,
                                CafeReview(
                                  reviewId: 'rev_${DateTime.now().millisecondsSinceEpoch}',
                                  reviewerName: nameCtrl.text.trim(),
                                  rating: selectedRating,
                                  comment: comment,
                                  createdAt: DateTime.now(),
                                ),
                              );
                              _activeTabs[cafe.cafeId] = 'reviews';
                            });

                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  backgroundColor: Color(0xFF10B981),
                                  content: Text('Thank you! Review published successfully.'),
                                  duration: Duration(seconds: 3),
                                ),
                              );
                            }
                          }
                        },
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
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
                final currentTab = _activeTabs[cafe.cafeId] ?? 'menu';

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

                        const SizedBox(height: 12),

                        // Section Tabs: Menu vs Reviews
                        Row(
                          children: [
                            ChoiceChip(
                              label: const Text('Menu Items'),
                              selected: currentTab == 'menu',
                              selectedColor: isHattiKaapi ? const Color(0xFFD97706) : const Color(0xFF2563EB),
                              backgroundColor: const Color(0xFF1E293B),
                              labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              onSelected: (val) {
                                if (val) setState(() => _activeTabs[cafe.cafeId] = 'menu');
                              },
                            ),
                            const SizedBox(width: 8),
                            ChoiceChip(
                              label: Text('Reviews (${cafe.reviews.length})'),
                              selected: currentTab == 'reviews',
                              selectedColor: const Color(0xFF10B981),
                              backgroundColor: const Color(0xFF1E293B),
                              labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              onSelected: (val) {
                                if (val) setState(() => _activeTabs[cafe.cafeId] = 'reviews');
                              },
                            ),
                            const Spacer(),
                            TextButton.icon(
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                foregroundColor: const Color(0xFF38BDF8),
                              ),
                              icon: const Icon(Icons.rate_review, size: 14),
                              label: const Text('Rate', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              onPressed: () => _showAddReviewDialog(cafe),
                            ),
                          ],
                        ),

                        const SizedBox(height: 8),
                        const Divider(color: Color(0xFF1E293B)),

                        // Tab 1: Menu Items
                        if (currentTab == 'menu') ...[
                          ...cafe.menuItems.map((item) {
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
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item.name,
                                          style: const TextStyle(fontSize: 13, color: Colors.white),
                                        ),
                                        if (item.description.isNotEmpty)
                                          Text(
                                            item.description,
                                            style: const TextStyle(fontSize: 10, color: Colors.white38),
                                          ),
                                      ],
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
                        ],

                        // Tab 2: Reviews List
                        if (currentTab == 'reviews') ...[
                          if (cafe.reviews.isEmpty)
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 12),
                              child: Text(
                                'No reviews yet. Be the first to share your experience!',
                                style: TextStyle(color: Colors.white54, fontSize: 12),
                              ),
                            )
                          else
                            ...cafe.reviews.map((r) {
                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F172A),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: const Color(0xFF1E293B)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          r.reviewerName,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            const Icon(Icons.star, color: Color(0xFFFBBF24), size: 12),
                                            const SizedBox(width: 3),
                                            Text(
                                              r.rating.toStringAsFixed(1),
                                              style: const TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      r.comment,
                                      style: const TextStyle(fontSize: 11, color: Colors.white70),
                                    ),
                                  ],
                                ),
                              );
                            }),
                        ],

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
