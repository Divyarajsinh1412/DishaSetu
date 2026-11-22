import 'package:flutter/material.dart';
import '../services/emergency_service.dart';
import '../services/api_service.dart';

class EmergencySOSSheet extends StatefulWidget {
  const EmergencySOSSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const EmergencySOSSheet(),
    );
  }

  @override
  State<EmergencySOSSheet> createState() => _EmergencySOSSheetState();
}

class _EmergencySOSSheetState extends State<EmergencySOSSheet> {
  final ApiService _apiService = ApiService();
  bool _isDispatching = false;
  bool _dispatched = false;

  Future<void> _triggerSOS() async {
    setState(() => _isDispatching = true);
    await _apiService.triggerEmergencySOS(
      emergencyType: 'Medical & Security Assistance',
      latitude: 13.1717995,
      longitude: 77.5361915,
      note: 'Mobile SOS button tapped',
    );
    setState(() {
      _isDispatching = false;
      _dispatched = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF111827),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(top: BorderSide(color: Color(0xFFEF4444), width: 2.0)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 44,
              height: 5,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.5)),
                  ),
                  child: const Icon(Icons.emergency, color: Color(0xFFEF4444), size: 26),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'CAMPUS EMERGENCY SOS',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.8,
                          color: Color(0xFFFCA5A5),
                        ),
                      ),
                      Text(
                        'Presidency University Rapid Safety Desk',
                        style: TextStyle(fontSize: 11, color: Colors.white60),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          // Big Red SOS Button
          Padding(
            padding: const EdgeInsets.all(16),
            child: GestureDetector(
              onTap: _isDispatching ? null : _triggerSOS,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFDC2626), Color(0xFF991B1B)],
                  ),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFDC2626).withOpacity(0.4),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _isDispatching
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                          )
                        : Icon(
                            _dispatched ? Icons.check_circle : Icons.warning_rounded,
                            color: Colors.white,
                            size: 26,
                          ),
                    const SizedBox(width: 12),
                    Text(
                      _dispatched
                          ? 'ALERT DISPATCHED TO CONTROL ROOM'
                          : 'DISPATCH RAPID SOS ALERT',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.6,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Emergency Hotlines List
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
            child: Row(
              children: const [
                Icon(Icons.phone_in_talk, color: Colors.white70, size: 16),
                SizedBox(width: 8),
                Text(
                  'DIRECT CAMPUS HOTLINES (TAP TO CALL)',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: EmergencyService.contacts.length,
              itemBuilder: (context, idx) {
                final c = EmergencyService.contacts[idx];
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.call, color: Color(0xFFF87171), size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              c.title,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${c.department} · ${c.availableHours}',
                              style: const TextStyle(fontSize: 11, color: Colors.white54),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              c.number,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                fontFamily: 'monospace',
                                color: Color(0xFF38BDF8),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
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
