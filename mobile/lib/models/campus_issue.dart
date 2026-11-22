class CampusIssue {
  final String? id;
  final String issueCode;
  final String category;
  final String title;
  final String description;
  final String reporterName;
  final String reporterContact;
  final String? building;
  final String status;
  final DateTime createdAt;

  CampusIssue({
    this.id,
    required this.issueCode,
    required this.category,
    required this.title,
    required this.description,
    required this.reporterName,
    required this.reporterContact,
    this.building,
    this.status = 'received',
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toJson() {
    return {
      'category': category,
      'title': title,
      'description': description,
      'reporterName': reporterName,
      'reporterContact': reporterContact,
      if (building != null) 'building': building,
      'status': status,
    };
  }

  factory CampusIssue.fromJson(Map<String, dynamic> json) {
    return CampusIssue(
      id: json['_id'] ?? json['id'],
      issueCode: json['issueCode'] ?? 'PU-ISSUE-${DateTime.now().millisecondsSinceEpoch % 1000000}',
      category: json['category'] ?? 'navigation_error',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      reporterName: json['reporterName'] ?? 'Anonymous Explorer',
      reporterContact: json['reporterContact'] ?? '',
      building: json['building'],
      status: json['status'] ?? 'received',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
