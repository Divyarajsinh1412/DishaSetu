class CampusEvent {
  final String eventId;
  final String title;
  final String category;
  final String date;
  final String time;
  final String venue;
  final String organizer;
  final String description;
  final bool isRegistrationOpen;

  CampusEvent({
    required this.eventId,
    required this.title,
    required this.category,
    required this.date,
    required this.time,
    required this.venue,
    required this.organizer,
    required this.description,
    this.isRegistrationOpen = true,
  });

  factory CampusEvent.fromJson(Map<String, dynamic> json) {
    return CampusEvent(
      eventId: json['eventId'] ?? json['_id'] ?? '',
      title: json['title'] ?? 'Campus Event',
      category: json['category'] ?? 'Academic',
      date: json['date'] ?? 'Upcoming',
      time: json['time'] ?? '10:00 AM',
      venue: json['venue'] ?? 'Auditorium',
      organizer: json['organizer'] ?? 'Presidency University',
      description: json['description'] ?? '',
      isRegistrationOpen: json['isRegistrationOpen'] ?? true,
    );
  }
}
