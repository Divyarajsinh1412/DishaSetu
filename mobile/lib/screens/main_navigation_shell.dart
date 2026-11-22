import 'package:flutter/material.dart';
import 'map_screen.dart';
import 'directory_screen.dart';
import 'cafes_screen.dart';
import 'events_screen.dart';
import 'ai_guide_screen.dart';
import 'panorama_tour_screen.dart';
import 'digital_twin_screen.dart';
import 'admin_dashboard_screen.dart';
import '../widgets/emergency_sos_sheet.dart';
import '../widgets/issue_report_sheet.dart';
import '../widgets/server_config_dialog.dart';
import '../services/localization_service.dart';
import '../config/app_config.dart';

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;
  final _localization = LocalizationService.instance;

  final List<Widget> _screens = const [
    CampusMapScreen(),
    DirectoryScreen(),
    CafesScreen(),
    EventsScreen(),
    AIGuideScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: _localization.currentLocale,
      builder: (context, locale, _) {
        return Scaffold(
          appBar: AppBar(
            backgroundColor: const Color(0xFF0F172A),
            elevation: 2,
            titleSpacing: 0,
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
                    Text(
                      _localization.tr('appName'),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                    Text(
                      _localization.tr('universityName'),
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
              // Language Switcher (EN / KN)
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.4)),
                  ),
                  child: Text(
                    locale == 'en' ? 'ಕನ್ನಡ' : 'EN',
                    style: const TextStyle(
                      color: Color(0xFF38BDF8),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                tooltip: 'Switch Language (English / ಕನ್ನಡ)',
                onPressed: () {
                  _localization.toggleLanguage();
                },
              ),

              // Emergency SOS Quick Trigger
              Container(
                margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.emergency, color: Colors.white, size: 14),
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
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 0),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    elevation: 4,
                  ),
                  onPressed: () => EmergencySOSSheet.show(context),
                ),
              ),

              // Backend API Server Connection Settings
              IconButton(
                icon: const Icon(Icons.settings_ethernet, color: Color(0xFF38BDF8), size: 21),
                tooltip: 'Server Connection (${AppConfig.baseUrl})',
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

          // Side Navigation Drawer with Access to All DishaSetu Features
          drawer: Drawer(
            backgroundColor: const Color(0xFF0F172A),
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                DrawerHeader(
                  decoration: const BoxDecoration(
                    color: Color(0xFF0B132B),
                    border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0284C7).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: const Color(0xFF0284C7).withOpacity(0.4)),
                            ),
                            child: const Icon(Icons.explore, color: Color(0xFF38BDF8), size: 26),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _localization.tr('appName'),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const Text(
                                'A to Z Smart Campus',
                                style: TextStyle(color: Color(0xFF38BDF8), fontSize: 11),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _localization.tr('tagline'),
                        style: const TextStyle(color: Colors.white60, fontSize: 11),
                      ),
                    ],
                  ),
                ),

                // 1. Primary Maps & Spatial Views
                _buildDrawerSectionHeader('CAMPUS VIEWS & EXPLORATION'),

                ListTile(
                  leading: const Icon(Icons.map, color: Color(0xFF38BDF8), size: 22),
                  title: Text(_localization.tr('masterMap'), style: const TextStyle(color: Colors.white, fontSize: 13)),
                  subtitle: const Text('Vector Master Map & KML Layouts', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  onTap: () {
                    Navigator.pop(context);
                    setState(() => _currentIndex = 0);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.panorama_photosphere, color: Color(0xFFF59E0B), size: 22),
                  title: Text(_localization.tr('viewAerial'), style: const TextStyle(color: Colors.white, fontSize: 13)),
                  subtitle: const Text('Calibrated 360° Spherical Scenes', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const PanoramaTourScreen()));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.view_in_ar, color: Color(0xFFA855F7), size: 22),
                  title: Text(_localization.tr('view3D'), style: const TextStyle(color: Colors.white, fontSize: 13)),
                  subtitle: const Text('Interactive Isometric Campus Twin', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const DigitalTwinScreen()));
                  },
                ),

                const Divider(color: Colors.white12, height: 16),

                // 2. Academic & Campus Directories
                _buildDrawerSectionHeader('CAMPUS DIRECTORIES & SERVICES'),

                ListTile(
                  leading: const Icon(Icons.apartment, color: Color(0xFF10B981), size: 22),
                  title: Text(_localization.tr('buildings'), style: const TextStyle(color: Colors.white, fontSize: 13)),
                  subtitle: const Text('D, E, F, L, N, M Blocks & Floors', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  onTap: () {
                    Navigator.pop(context);
                    setState(() => _currentIndex = 1);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.restaurant, color: Color(0xFFFB923C), size: 22),
                  title: Text(_localization.tr('foodDining'), style: const TextStyle(color: Colors.white, fontSize: 13)),
                  subtitle: const Text('Food Court, Hatti Kaapi & Menus', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  onTap: () {
                    Navigator.pop(context);
                    setState(() => _currentIndex = 2);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.event, color: Color(0xFFEC4899), size: 22),
                  title: const Text('Campus Events & Calendar', style: TextStyle(color: Colors.white, fontSize: 13)),
                  subtitle: const Text('Tech Fests, Seminars & Sports', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  onTap: () {
                    Navigator.pop(context);
                    setState(() => _currentIndex = 3);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.psychology, color: Color(0xFF06B6D4), size: 22),
                  title: const Text('AI Campus Assistant', style: TextStyle(color: Colors.white, fontSize: 13)),
                  subtitle: const Text('Ask directions, labs, timings', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  onTap: () {
                    Navigator.pop(context);
                    setState(() => _currentIndex = 4);
                  },
                ),

                const Divider(color: Colors.white12, height: 16),

                // 3. User Voice & Helpdesk
                _buildDrawerSectionHeader('HELPDESK & UTILITIES'),

                ListTile(
                  leading: const Icon(Icons.support_agent, color: Color(0xFFEAB308), size: 22),
                  title: Text(_localization.tr('reportIssue'), style: const TextStyle(color: Colors.white, fontSize: 13)),
                  subtitle: const Text('Obstacles, Broken Lifts, Feedback', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  onTap: () {
                    Navigator.pop(context);
                    IssueReportSheet.show(context);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.admin_panel_settings, color: Color(0xFF38BDF8), size: 22),
                  title: Text(_localization.tr('adminPortal'), style: const TextStyle(color: Colors.white, fontSize: 13)),
                  subtitle: const Text('Manage Floors, Rooms & Atlas Sync', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminDashboardScreen()));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.emergency, color: Color(0xFFEF4444), size: 22),
                  title: Text(_localization.tr('emergencySOS'), style: const TextStyle(color: Colors.white, fontSize: 13)),
                  subtitle: const Text('Security, Health Centre, Ambulance', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  onTap: () {
                    Navigator.pop(context);
                    EmergencySOSSheet.show(context);
                  },
                ),

                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    'Connected API: ${AppConfig.baseUrl}',
                    style: const TextStyle(color: Colors.white30, fontSize: 10),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
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
            destinations: [
              NavigationDestination(
                icon: const Icon(Icons.map_outlined, color: Colors.grey, size: 22),
                selectedIcon: const Icon(Icons.map, color: Color(0xFF38BDF8), size: 22),
                label: _localization.tr('buildings') == 'ಕಟ್ಟಡಗಳು' ? 'ನಕ್ಷೆ' : 'Map',
              ),
              NavigationDestination(
                icon: const Icon(Icons.apartment_outlined, color: Colors.grey, size: 22),
                selectedIcon: const Icon(Icons.apartment, color: Color(0xFF38BDF8), size: 22),
                label: _localization.tr('buildings'),
              ),
              NavigationDestination(
                icon: const Icon(Icons.restaurant_outlined, color: Colors.grey, size: 22),
                selectedIcon: const Icon(Icons.restaurant, color: Color(0xFF38BDF8), size: 22),
                label: _localization.tr('buildings') == 'ಕಟ್ಟಡಗಳು' ? 'ಆಹಾರ' : 'Dining',
              ),
              NavigationDestination(
                icon: const Icon(Icons.event_outlined, color: Colors.grey, size: 22),
                selectedIcon: const Icon(Icons.event, color: Color(0xFF38BDF8), size: 22),
                label: _localization.tr('buildings') == 'ಕಟ್ಟಡಗಳು' ? 'ಕಾರ್ಯಕ್ರಮ' : 'Events',
              ),
              NavigationDestination(
                icon: const Icon(Icons.psychology_outlined, color: Colors.grey, size: 22),
                selectedIcon: const Icon(Icons.psychology, color: Color(0xFF38BDF8), size: 22),
                label: _localization.tr('buildings') == 'ಕಟ್ಟಡಗಳು' ? 'AI ಮಾರ್ಗದರ್ಶಿ' : 'AI Guide',
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDrawerSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 16, top: 12, bottom: 6),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF38BDF8),
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.0,
        ),
      ),
    );
  }
}
