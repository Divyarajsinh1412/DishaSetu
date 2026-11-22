import 'package:flutter/material.dart';
import 'config/app_config.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppConfig.init();
  runApp(const DishaSetuApp());
}

class DishaSetuApp extends StatelessWidget {
  const DishaSetuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DishaSetu — Presidency University',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF071B32),
        primaryColor: const Color(0xFF00A878),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF0284C7),
          secondary: Color(0xFF10B981),
          surface: Color(0xFF0F172A),
        ),
        useMaterial3: true,
      ),
      home: const SplashScreen(),
    );
  }
}
