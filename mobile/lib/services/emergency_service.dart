class EmergencyContact {
  final String title;
  final String number;
  final String department;
  final String availableHours;
  final String location;

  const EmergencyContact({
    required this.title,
    required this.number,
    required this.department,
    required this.availableHours,
    required this.location,
  });
}

class EmergencyService {
  static const List<EmergencyContact> contacts = [
    EmergencyContact(
      title: 'Campus Security Main Gate',
      number: '+91 80 4925 5555',
      department: 'Security & Safety Office',
      availableHours: '24/7 (Always Open)',
      location: 'Main Security Gate & Entry Portal',
    ),
    EmergencyContact(
      title: 'University Health Centre & Ambulance',
      number: '+91 80 4925 5566',
      department: 'Medical Services',
      availableHours: '24/7 On-Duty Doctors',
      location: 'Ground Floor, Health Centre Building',
    ),
    EmergencyContact(
      title: "Women's Safety & Anti-Harassment Cell",
      number: '+91 80 4925 5577',
      department: 'Student Affairs Council',
      availableHours: '24/7 Helpline',
      location: 'Administrative Block, Level 1',
    ),
    EmergencyContact(
      title: 'Chief Proctor Office',
      number: '+91 80 4925 5588',
      department: 'Disciplinary & Safety Control',
      availableHours: '8:30 AM – 6:30 PM',
      location: 'HR Block, Level 2',
    ),
    EmergencyContact(
      title: 'Fire Safety & Disaster Response',
      number: '112 / +91 80 4925 5599',
      department: 'Campus Disaster Management',
      availableHours: '24/7 Rapid Emergency',
      location: 'Central Control Station',
    ),
  ];
}
