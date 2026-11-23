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

class CafeReview {
  final String reviewId;
  final String reviewerName;
  final double rating;
  final String comment;
  final DateTime createdAt;

  CafeReview({
    required this.reviewId,
    required this.reviewerName,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });

  factory CafeReview.fromJson(Map<String, dynamic> json) {
    return CafeReview(
      reviewId: json['_id'] ?? json['reviewId'] ?? 'rev_${DateTime.now().millisecondsSinceEpoch}',
      reviewerName: json['reviewerName'] ?? json['userName'] ?? 'Presidency Student',
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      comment: json['comment'] ?? 'Great food and quick service!',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
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
  final List<CafeReview> reviews;

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
    this.reviews = const [],
  });

  factory Cafe.fromJson(Map<String, dynamic> json) {
    final rating = json['rating'] as Map<String, dynamic>? ?? {};
    final rawMenu = json['menuItems'] as List? ?? json['menu'] as List? ?? [];
    final menuList = rawMenu
        .map((m) => MenuItem.fromJson(m as Map<String, dynamic>))
        .toList();

    final rawReviews = json['reviews'] as List? ?? [];
    final reviewList = rawReviews
        .map((r) => CafeReview.fromJson(r as Map<String, dynamic>))
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
      reviews: reviewList.isNotEmpty
          ? reviewList
          : [
              CafeReview(
                reviewId: 'rev_1',
                reviewerName: 'Faizan K. (CSE)',
                rating: 5.0,
                comment: 'The Filter Coffee and Ghee Podi Idli are unmatched! Quick service during break.',
                createdAt: DateTime.now().subtract(const Duration(days: 1)),
              ),
              CafeReview(
                reviewId: 'rev_2',
                reviewerName: 'Ananya Sharma (ECE)',
                rating: 4.5,
                comment: 'Great atmosphere, clean tables, and good snacks between morning lectures.',
                createdAt: DateTime.now().subtract(const Duration(days: 3)),
              ),
            ],
    );
  }
}
