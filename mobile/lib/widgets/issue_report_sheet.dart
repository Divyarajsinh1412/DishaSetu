import 'package:flutter/material.dart';
import '../models/campus_issue.dart';
import '../models/building.dart';
import '../services/api_service.dart';

class IssueReportSheet extends StatefulWidget {
  final List<Building> buildings;

  const IssueReportSheet({
    super.key,
    this.buildings = const [],
  });

  static Future<void> show(BuildContext context, {List<Building> buildings = const []}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => IssueReportSheet(buildings: buildings),
    );
  }

  @override
  State<IssueReportSheet> createState() => _IssueReportSheetState();
}

class _IssueReportSheetState extends State<IssueReportSheet> {
  final _apiService = ApiService();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _nameController = TextEditingController();
  final _contactController = TextEditingController();

  String _selectedCategory = 'navigation_error';
  String? _selectedBuilding;
  bool _isSubmitting = false;
  CampusIssue? _submittedIssue;
  String? _errorMessage;

  final List<Map<String, dynamic>> _categories = [
    {
      'id': 'navigation_error',
      'label': 'Navigation Route Inaccuracy',
      'icon': Icons.navigation,
      'desc': 'Path blocked, wrong turn, or pedestrian path mismatch',
    },
    {
      'id': 'accessibility_block',
      'label': 'Broken Lift / Ramp / Accessibility',
      'icon': Icons.accessible,
      'desc': 'Elevator under maintenance or ramp obstacle',
    },
    {
      'id': 'signage_missing',
      'label': 'Signage or Room Label Missing',
      'icon': Icons.apartment,
      'desc': 'Unmarked classroom, laboratory, or entrance',
    },
    {
      'id': 'cafe_feedback',
      'label': 'Dining / Food Court Feedback',
      'icon': Icons.restaurant,
      'desc': 'Menu question, hygiene, or dining facility feedback',
    },
    {
      'id': 'safety_concern',
      'label': 'Campus Safety / Maintenance Hazard',
      'icon': Icons.warning_amber_rounded,
      'desc': 'Pothole, dark pathway, or broken fixture',
    },
    {
      'id': 'general_query',
      'label': 'General Campus Query',
      'icon': Icons.help_outline,
      'desc': 'General help finding a department or event',
    },
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _nameController.dispose();
    _contactController.dispose();
    super.dispose();
  }

  Future<void> _submitReport() async {
    if (_titleController.text.trim().isEmpty || _descController.text.trim().isEmpty) {
      setState(() => _errorMessage = 'Please provide a subject title and brief description.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final issue = CampusIssue(
      issueCode: '',
      category: _selectedCategory,
      title: _titleController.text.trim(),
      description: _descController.text.trim(),
      reporterName: _nameController.text.trim().isEmpty
          ? 'Anonymous Campus Explorer'
          : _nameController.text.trim(),
      reporterContact: _contactController.text.trim(),
      building: _selectedBuilding,
    );

    final result = await _apiService.submitIssueReport(issue);

    setState(() {
      _isSubmitting = false;
      _submittedIssue = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: _submittedIssue != null
          ? _buildSuccessView()
          : SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF59E0B).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.support_agent,
                                color: Color(0xFFFBBF24), size: 24),
                          ),
                          const SizedBox(width: 12),
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Campus Helpdesk & Issues',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                'Report campus hurdles & feedback',
                                style: TextStyle(color: Colors.white60, fontSize: 12),
                              ),
                            ],
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white60),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),

                  if (_errorMessage != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: Color(0xFFF87171), size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(color: Color(0xFFF87171), fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 16),

                  // Category Selector
                  const Text(
                    'ISSUE CATEGORY',
                    style: TextStyle(
                      color: Color(0xFF38BDF8),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 8),

                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _categories.map((cat) {
                      final isSelected = _selectedCategory == cat['id'];
                      return ChoiceChip(
                        label: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(cat['icon'] as IconData,
                                size: 14,
                                color: isSelected ? Colors.white : Colors.white70),
                            const SizedBox(width: 6),
                            Text(cat['label'] as String),
                          ],
                        ),
                        selected: isSelected,
                        selectedColor: const Color(0xFF0284C7),
                        backgroundColor: const Color(0xFF1E293B),
                        labelStyle: TextStyle(
                          fontSize: 11,
                          color: isSelected ? Colors.white : Colors.white70,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                        side: BorderSide(
                          color: isSelected ? const Color(0xFF38BDF8) : Colors.white12,
                        ),
                        onSelected: (_) {
                          setState(() => _selectedCategory = cat['id'] as String);
                        },
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 16),

                  // Title Field
                  TextField(
                    controller: _titleController,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: 'Subject / Short Summary *',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                      hintText: 'e.g. Lift in D Block not moving to 2nd Floor',
                      hintStyle: const TextStyle(color: Colors.white30, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Description Field
                  TextField(
                    controller: _descController,
                    maxLines: 3,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: 'Detailed Description *',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                      hintText: 'Provide specific location or details to help team resolve quickly...',
                      hintStyle: const TextStyle(color: Colors.white30, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Optional Building Picker
                  if (widget.buildings.isNotEmpty) ...[
                    DropdownButtonFormField<String>(
                      value: _selectedBuilding,
                      dropdownColor: const Color(0xFF1E293B),
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: 'Associated Building / Block (Optional)',
                        labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      items: widget.buildings.map((b) {
                        return DropdownMenuItem<String>(
                          value: b.code,
                          child: Text('${b.code} — ${b.name}', overflow: TextOverflow.ellipsis),
                        );
                      }).toList(),
                      onChanged: (val) => setState(() => _selectedBuilding = val),
                    ),
                    const SizedBox(height: 12),
                  ],

                  // Reporter Details
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _nameController,
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          decoration: InputDecoration(
                            labelText: 'Your Name (Optional)',
                            labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
                            filled: true,
                            fillColor: const Color(0xFF1E293B),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _contactController,
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          decoration: InputDecoration(
                            labelText: 'Phone / Email (Optional)',
                            labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
                            filled: true,
                            fillColor: const Color(0xFF1E293B),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Submit Button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      icon: _isSubmitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Icon(Icons.send, color: Colors.white, size: 18),
                      label: Text(
                        _isSubmitting ? 'SUBMITTING REPORT...' : 'SUBMIT ISSUE TICKET',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0284C7),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 4,
                      ),
                      onPressed: _isSubmitting ? null : _submitReport,
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSuccessView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: const Color(0xFF10B981).withOpacity(0.2),
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
          ),
          child: const Icon(Icons.check, color: Color(0xFF34D399), size: 36),
        ),
        const SizedBox(height: 16),
        const Text(
          'Issue Ticket Submitted!',
          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        const Text(
          'Campus maintenance and navigation team has been notified.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.white70, fontSize: 13),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.3)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.confirmation_number, color: Color(0xFF38BDF8), size: 18),
              const SizedBox(width: 8),
              Text(
                _submittedIssue!.issueCode,
                style: const TextStyle(
                  color: Color(0xFF38BDF8),
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          height: 44,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0284C7),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(context),
            child: const Text('DONE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }
}
