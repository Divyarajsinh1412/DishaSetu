import 'package:flutter/material.dart';
import 'map_screen.dart';
import 'directory_screen.dart';
import 'cafes_screen.dart';
import 'events_screen.dart';
import 'ai_guide_screen.dart';
import '../widgets/emergency_sos_sheet.dart';
import '../widgets/server_config_dialog.dart';
import '../config/app_config.dart';

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    CampusMapScreen(),
    DirectoryScreen(),
    CafesScreen(),
    EventsScreen(),
    AIGuideScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        titleSpacing: 16,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF0284C7).withOpacity(0.4)),
              ),
              child: const Icon(Icons.navigation, color: Color(0xFF38BDF8), size: 18),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'DishaSetu',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
                Text(
                  'Presidency University Bengaluru',
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.white.withOpacity(0.65),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Emergency SOS Quick Trigger
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
            child: ElevatedButton.icon(
              icon: const Icon(Icons.emergency, color: Colors.white, size: 15),
              label: const Text(
                'SOS',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 11,
                  letterSpacing: 1.0,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFDC2626),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                elevation: 4,
                shadowColor: const Color(0xFFDC2626).withOpacity(0.5),
              ),
              onPressed: () => EmergencySOSSheet.show(context),
            ),
          ),

          // Backend API Server Connection Settings
          IconButton(
            icon: const Icon(Icons.settings_ethernet, color: Color(0xFF38BDF8), size: 21),
            tooltip: 'Configure Backend API URL (${AppConfig.baseUrl})',
            onPressed: () async {
              await ServerConfigDialog.show(
                context,
                onSaved: () {
                  if (mounted) setState(() {});
                },
              );
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        backgroundColor: const Color(0xFF0F172A),
        indicatorColor: const Color(0xFF0284C7).withOpacity(0.35),
        selectedIndex: _currentIndex,
        elevation: 10,
        height: 65,
        onDestinationSelected: (index) {
          setState(() => _currentIndex = index);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.map_outlined, color: Colors.grey, size: 22),
            selectedIcon: Icon(Icons.map, color: Color(0xFF38BDF8), size: 22),
            label: 'Campus Map',
          ),
          NavigationDestination(
            icon: Icon(Icons.apartment_outlined, color: Colors.grey, size: 22),
            selectedIcon: Icon(Icons.apartment, color: Color(0xFF38BDF8), size: 22),
            label: 'Directory',
          ),
          NavigationDestination(
            icon: Icon(Icons.restaurant_outlined, color: Colors.grey, size: 22),
            selectedIcon: Icon(Icons.restaurant, color: Color(0xFF38BDF8), size: 22),
            label: 'Dining',
          ),
          NavigationDestination(
            icon: Icon(Icons.event_outlined, color: Colors.grey, size: 22),
            selectedIcon: Icon(Icons.event, color: Color(0xFF38BDF8), size: 22),
            label: 'Events',
          ),
          NavigationDestination(
            icon: Icon(Icons.psychology_outlined, color: Colors.grey, size: 22),
            selectedIcon: Icon(Icons.psychology, color: Color(0xFF38BDF8), size: 22),
            label: 'AI Guide',
          ),
        ],
      ),
    );
  }
}
