import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/campus_event.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  final ApiService _apiService = ApiService();
  List<CampusEvent> _events = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    setState(() => _isLoading = true);
    final list = await _apiService.fetchEvents();
    setState(() {
      _events = list;
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
          'University Campus Events',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF38BDF8)),
            onPressed: _loadEvents,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF38BDF8)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _events.length,
              itemBuilder: (context, idx) {
                final evt = _events[idx];
                return Card(
                  color: const Color(0xFF131D31),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                    side: const BorderSide(color: Color(0xFF1E293B)),
                  ),
                  margin: const EdgeInsets.only(bottom: 14),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF2563EB).withOpacity(0.18),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFF2563EB).withOpacity(0.4)),
                              ),
                              child: Column(
                                children: [
                                  const Icon(Icons.event, color: Color(0xFF38BDF8), size: 18),
                                  const SizedBox(height: 2),
                                  Text(
                                    evt.category.toUpperCase(),
                                    style: const TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF38BDF8),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    evt.title,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    evt.organizer,
                                    style: const TextStyle(fontSize: 11, color: Colors.white60),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 12),
                        Text(
                          evt.description,
                          style: const TextStyle(fontSize: 12, color: Colors.white70),
                        ),

                        const SizedBox(height: 12),
                        const Divider(color: Color(0xFF1E293B)),
                        const SizedBox(height: 6),

                        Row(
                          children: [
                            const Icon(Icons.calendar_today, size: 13, color: Color(0xFF10B981)),
                            const SizedBox(width: 5),
                            Text(
                              evt.date,
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            const SizedBox(width: 12),
                            const Icon(Icons.access_time, size: 13, color: Color(0xFF38BDF8)),
                            const SizedBox(width: 5),
                            Text(
                              evt.time,
                              style: const TextStyle(fontSize: 11, color: Colors.white70),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.location_on, size: 13, color: Color(0xFFF59E0B)),
                            const SizedBox(width: 5),
                            Expanded(
                              child: Text(
                                evt.venue,
                                style: const TextStyle(fontSize: 11, color: Colors.white70),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
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
