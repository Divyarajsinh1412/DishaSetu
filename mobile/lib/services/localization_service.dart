import 'package:flutter/foundation.dart';

class LocalizationService {
  static final LocalizationService instance = LocalizationService._internal();
  LocalizationService._internal();

  final ValueNotifier<String> currentLocale = ValueNotifier<String>('en');

  void setLocale(String langCode) {
    if (langCode == 'en' || langCode == 'kn' || langCode == 'hi') {
      currentLocale.value = langCode;
    }
  }

  void toggleLanguage() {
    if (currentLocale.value == 'en') {
      currentLocale.value = 'kn';
    } else {
      currentLocale.value = 'en';
    }
  }

  static const Map<String, Map<String, String>> _strings = {
    'en': {
      'appName': 'DishaSetu',
      'tagline': 'Your Campus. Your Direction. Your Way.',
      'universityName': 'Presidency University Bengaluru',
      'searchPlaceholder': 'Search building, lab, classroom, cafe, gate...',
      'view3D': '3D Campus',
      'viewAerial': '360° Aerial',
      'view2D': '2D GPS Map',
      'masterMap': 'Campus Master Map',
      'liveGpsMap': 'Live GPS Map',
      'overview': 'Campus Overview',
      'buildings': 'Buildings',
      'departments': 'Departments',
      'laboratories': 'Laboratories',
      'library': 'Library',
      'foodDining': 'Food & Dining',
      'medicalCare': 'Medical Care',
      'sportsArena': 'Sports Arena',
      'gardens': 'Gardens & Quads',
      'parking': 'Parking Zones',
      'landmarks': 'Landmarks',
      'navigate': 'Navigate',
      'navigateHere': 'Navigate Here',
      'floors': 'Floors',
      'reviews': 'Reviews',
      'reportIssue': 'Report Campus Issue',
      'adminPortal': 'Admin Portal',
      'emergencySOS': 'Emergency SOS',
      'stepByStep': 'Turn-by-Turn Directions',
      'close': 'Close',
      'all': 'All',
    },
    'kn': {
      'appName': 'ದಿಶಾ ಸೇತು',
      'tagline': 'ನಿಮ್ಮ ಕ್ಯಾಂಪಸ್. ನಿಮ್ಮ ದಿಕ್ಕು. ನಿಮ್ಮ ದಾರಿ.',
      'universityName': 'ಪ್ರೆಸಿಡೆನ್ಸಿ ವಿಶ್ವವಿದ್ಯಾಲಯ ಬೆಂಗಳೂರು',
      'searchPlaceholder': 'ಕಟ್ಟಡ, ಲ್ಯಾಬ್, ತರಗತಿ, ಕೆಫೆ, ಗೇಟ್ ಹುಡುಕಿ...',
      'view3D': '3D ಕ್ಯಾಂಪಸ್',
      'viewAerial': '360° ವೈಮಾನಿಕ ನೋಟ',
      'view2D': '2D ಜಿಪಿಎಸ್ ನಕ್ಷೆ',
      'masterMap': 'ಕ್ಯಾಂಪಸ್ ಮಾಸ್ಟರ್ ನಕ್ಷೆ',
      'liveGpsMap': 'ಲೈವ್ ಜಿಪಿಎಸ್ ನಕ್ಷೆ',
      'overview': 'ಕ್ಯಾಂಪಸ್ ಅವಲೋಕನ',
      'buildings': 'ಕಟ್ಟಡಗಳು',
      'departments': 'ವಿಭಾಗಗಳು',
      'laboratories': 'ಪ್ರಯೋಗಾಲಯಗಳು',
      'library': 'ಗ್ರಂಥಾಲಯ',
      'foodDining': 'ಆಹಾರ & ಕೆಫೆಗಳು',
      'medicalCare': 'ವೈದ್ಯಕೀಯ ಕೇಂದ್ರ',
      'sportsArena': 'ಕ್ರೀಡಾಂಗಣ',
      'gardens': 'ಉದ್ಯಾನವನಗಳು',
      'parking': 'ಪಾರ್ಕಿಂಗ್ ವಲಯಗಳು',
      'landmarks': 'ಹೆಗ್ಗುರುತುಗಳು',
      'navigate': 'ಮಾರ್ಗದರ್ಶನ',
      'navigateHere': 'ಇಲ್ಲಿಗೆ ದಾರಿ',
      'floors': 'ಮಹಡಿಗಳು',
      'reviews': 'ವಿಮರ್ಶೆಗಳು',
      'reportIssue': 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
      'adminPortal': 'ನಿರ್ವಾಹಕ ಪೋರ್ಟಲ್',
      'emergencySOS': 'ತುರ್ತು SOS',
      'stepByStep': 'ಹಂತ-ಹಂತದ ನಿರ್ದೇಶನಗಳು',
      'close': 'ಮುಚ್ಚು',
      'all': 'ಎಲ್ಲವೂ',
    },
  };

  String tr(String key) {
    final lang = currentLocale.value;
    return _strings[lang]?[key] ?? _strings['en']?[key] ?? key;
  }
}
