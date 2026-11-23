import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/campus_event.dart';
import '../models/campus_location.dart';

class EventsScreen extends StatefulWidget {
  final Function(CampusLocation location)? onNavigateTo;

  const EventsScreen({super.key, this.onNavigateTo});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  final ApiService _apiService = ApiService();
  List<CampusEvent> _events = [];
  bool _isLoading = true;
  String _selectedCategory = 'All';
  final Set<String> _rsvpdEventIds = {};

  final List<String> _categories = [
    'All',
    'Academic',
    'Hackathon',
    'Workshop',
    'Competition',
    'Conference',
    'Sports',
    'Cultural',
  ];

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

  CampusLocation _resolveEventVenueLocation(CampusEvent evt) {
    final v = evt.venue.toLowerCase();
    if (v.contains('d block') || v.contains('robotics')) {
      return CampusLocation(
        id: 'bld_d_block',
        name: evt.venue,
        shortCode: 'PU-D-BLOCK',
        category: 'Academic',
        description: evt.title,
        latitude: 13.170550,
        longitude: 77.535610,
        imageX: 0.204,
        imageY: 0.645,
      );
    }
    if (v.contains('e block') || v.contains('seminar')) {
      return CampusLocation(
        id: 'bld_e_block',
        name: evt.venue,
        shortCode: 'PU-E-BLOCK',
        category: 'Academic',
        description: evt.title,
        latitude: 13.170880,
        longitude: 77.535850,
        imageX: 0.248,
        imageY: 0.605,
      );
    }
    if (v.contains('n block') || v.contains('moot')) {
      return CampusLocation(
        id: 'bld_n_block',
        name: evt.venue,
        shortCode: 'PU-N-BLOCK',
        category: 'Academic',
        description: evt.title,
        latitude: 13.169520,
        longitude: 77.536100,
        imageX: 0.315,
        imageY: 0.796,
      );
    }
    if (v.contains('m block') || v.contains('som') || v.contains('amphitheater')) {
      return CampusLocation(
        id: 'bld_som_block',
        name: evt.venue,
        shortCode: 'PU-M-BLOCK',
        category: 'Academic',
        description: evt.title,
        latitude: 13.170150,
        longitude: 77.536800,
        imageX: 0.520,
        imageY: 0.700,
      );
    }
    // Default: Auditorium
    return CampusLocation(
      id: 'bld_auditorium',
      name: evt.venue,
      shortCode: 'PU-AUDITORIUM',
      category: 'Academic',
      description: evt.title,
      latitude: 13.170950,
      longitude: 77.537200,
      imageX: 0.732,
      imageY: 0.678,
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredEvents = _selectedCategory == 'All'
        ? _events
        : _events.where((e) => e.category.toLowerCase() == _selectedCategory.toLowerCase()).toList();

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
      body: Column(
        children: [
          // Category Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              children: _categories.map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(cat),
                    selected: isSelected,
                    selectedColor: const Color(0xFF2563EB),
                    backgroundColor: const Color(0xFF1E293B),
                    labelStyle: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : Colors.white70,
                    ),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    onSelected: (val) {
                      if (val) setState(() => _selectedCategory = cat);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Events List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF38BDF8)))
                : filteredEvents.isEmpty
                    ? Center(
                        child: Text(
                          'No events listed under $_selectedCategory.',
                          style: const TextStyle(color: Colors.white54, fontSize: 13),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: filteredEvents.length,
                        itemBuilder: (context, idx) {
                          final evt = filteredEvents[idx];
                          final isRsvpd = _rsvpdEventIds.contains(evt.eventId);

                          return Card(
                            color: const Color(0xFF131D31),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18),
                              side: BorderSide(
                                color: isRsvpd ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                                width: isRsvpd ? 1.5 : 1.0,
                              ),
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

                                  // Date & Time
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
                                  const SizedBox(height: 8),

                                  // Venue
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on, size: 14, color: Color(0xFFF59E0B)),
                                      const SizedBox(width: 5),
                                      Expanded(
                                        child: Text(
                                          evt.venue,
                                          style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: Color(0xFFFDE68A)),
                                        ),
                                      ),
                                    ],
                                  ),

                                  const SizedBox(height: 14),

                                  // Action Buttons: RSVP & Navigate
                                  Row(
                                    children: [
                                      Expanded(
                                        child: OutlinedButton.icon(
                                          style: OutlinedButton.styleFrom(
                                            foregroundColor: isRsvpd ? const Color(0xFF10B981) : Colors.white70,
                                            side: BorderSide(
                                              color: isRsvpd ? const Color(0xFF10B981) : const Color(0xFF334155),
                                            ),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                            padding: const EdgeInsets.symmetric(vertical: 8),
                                          ),
                                          icon: Icon(
                                            isRsvpd ? Icons.check_circle : Icons.bookmark_border,
                                            size: 15,
                                            color: isRsvpd ? const Color(0xFF10B981) : Colors.white70,
                                          ),
                                          label: Text(
                                            isRsvpd ? 'REGISTERED' : 'RSVP',
                                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                          ),
                                          onPressed: () {
                                            setState(() {
                                              if (isRsvpd) {
                                                _rsvpdEventIds.remove(evt.eventId);
                                              } else {
                                                _rsvpdEventIds.add(evt.eventId);
                                              }
                                            });
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(
                                                backgroundColor: isRsvpd ? const Color(0xFF334155) : const Color(0xFF10B981),
                                                content: Text(
                                                  isRsvpd
                                                      ? 'Registration removed.'
                                                      : 'Successfully registered for ${evt.title}!',
                                                ),
                                                duration: const Duration(seconds: 2),
                                              ),
                                            );
                                          },
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: ElevatedButton.icon(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFF2563EB),
                                            foregroundColor: Colors.white,
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                            padding: const EdgeInsets.symmetric(vertical: 8),
                                          ),
                                          icon: const Icon(Icons.navigation, size: 14),
                                          label: const Text(
                                            'NAVIGATE',
                                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                          ),
                                          onPressed: () {
                                            if (widget.onNavigateTo != null) {
                                              final loc = _resolveEventVenueLocation(evt);
                                              widget.onNavigateTo!(loc);
                                            }
                                          },
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
          ),
        ],
      ),
    );
  }
}
