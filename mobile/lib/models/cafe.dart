class MenuItem {
  final String itemId;
  final String name;
  final String category;
  final double price;
  final bool isAvailable;
  final bool isVeg;
  final String description;

  MenuItem({
    required this.itemId,
    required this.name,
    required this.category,
    required this.price,
    this.isAvailable = true,
    this.isVeg = true,
    this.description = '',
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      itemId: json['itemId'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? 'Beverage',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      isAvailable: json['isAvailable'] ?? true,
      isVeg: json['isVeg'] ?? true,
      description: json['description'] ?? '',
    );
  }
}

class Cafe {
  final String cafeId;
  final String name;
  final String code;
  final String locationName;
  final String category;
  final double ratingAverage;
  final int ratingCount;
  final bool isOpen;
  final String openingHours;
  final List<MenuItem> menuItems;

  Cafe({
    required this.cafeId,
    required this.name,
    required this.code,
    required this.locationName,
    this.category = 'Cafeteria',
    this.ratingAverage = 4.8,
    this.ratingCount = 120,
    this.isOpen = true,
    this.openingHours = '8:00 AM – 7:30 PM',
    this.menuItems = const [],
  });

  factory Cafe.fromJson(Map<String, dynamic> json) {
    final rating = json['rating'] as Map<String, dynamic>? ?? {};
    final rawMenu = json['menuItems'] as List? ?? json['menu'] as List? ?? [];
    final menuList = rawMenu
        .map((m) => MenuItem.fromJson(m as Map<String, dynamic>))
        .toList();

    return Cafe(
      cafeId: json['cafeId'] ?? json['_id'] ?? json['id'] ?? 'PU-CAFE-D-BLOCK',
      name: json['name'] ?? 'Campus Cafe',
      code: json['code'] ?? 'PU-CAFE',
      locationName: json['locationName'] ?? 'D Block Quadrangle',
      category: json['category'] ?? 'Cafeteria',
      ratingAverage: (rating['average'] as num?)?.toDouble() ??
          (json['ratingAverage'] as num?)?.toDouble() ??
          4.8,
      ratingCount: (rating['count'] as num?)?.toInt() ??
          (json['ratingCount'] as num?)?.toInt() ??
          120,
      isOpen: json['isOpen'] ?? true,
      openingHours: json['openingHours'] ?? '8:00 AM – 7:30 PM',
      menuItems: menuList,
    );
  }
}
