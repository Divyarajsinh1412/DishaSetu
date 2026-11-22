class AIMessage {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final List<String> suggestions;
  final String? relatedLocationId;

  AIMessage({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.suggestions = const [],
    this.relatedLocationId,
  });
}
