import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppConfig {
  static const String _prefKeyBaseUrl = 'dishasetu_api_base_url';

  // Default IP for Android emulator to talk to host PC backend: http://10.0.2.2:5000/api
  // For Windows desktop or iOS simulator: http://localhost:5000/api
  static const String defaultAndroidEmulatorUrl = 'http://10.0.2.2:5000/api';
  static const String defaultLocalhostUrl = 'http://localhost:5000/api';
  static const String defaultProductionUrl = 'https://dishasetu-backend.onrender.com/api';

  static String _currentBaseUrl = defaultAndroidEmulatorUrl;

  static String get baseUrl => _currentBaseUrl;
  static String get apiBaseUrl => _currentBaseUrl;

  /// Initialize and load saved Base URL from SharedPreferences
  static Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(_prefKeyBaseUrl);
      if (saved != null && saved.isNotEmpty) {
        _currentBaseUrl = saved;
      } else {
        // Detect platform defaults
        if (kIsWeb || defaultTargetPlatform == TargetPlatform.windows || defaultTargetPlatform == TargetPlatform.macOS) {
          _currentBaseUrl = defaultLocalhostUrl;
        } else {
          _currentBaseUrl = defaultAndroidEmulatorUrl;
        }
      }
    } catch (_) {
      _currentBaseUrl = defaultAndroidEmulatorUrl;
    }
  }

  /// Change base URL at runtime (e.g. for physical devices using laptop's WiFi IP)
  static Future<void> setBaseUrl(String newUrl) async {
    final cleaned = newUrl.trim().replaceAll(RegExp(r'/+$'), '');
    _currentBaseUrl = cleaned;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKeyBaseUrl, cleaned);
    } catch (_) {}
  }

  /// Reset to default
  static Future<void> resetToDefault() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_prefKeyBaseUrl);
    } catch (_) {}
    if (kIsWeb || defaultTargetPlatform == TargetPlatform.windows) {
      _currentBaseUrl = defaultLocalhostUrl;
    } else {
      _currentBaseUrl = defaultAndroidEmulatorUrl;
    }
  }
}
