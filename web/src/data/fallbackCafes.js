/**
 * Comprehensive Fallback & Demo Dataset for Campus Cafes & Concessionaires
 * Guarantees zero-latency, error-free presentation experience even if backend is sleeping.
 */

export const DEMO_CONCESSIONAIRES = [
  {
    email: 'hattikappi.owner@presidency.ac.in',
    password: 'HattiKappi@2026',
    name: 'Venkatesh Rao (Hatti Kappi Manager)',
    role: 'cafe_owner',
    assignedCafe: 'PU-CAFE-D-BLOCK',
    outletName: 'Hatti Kappi (D Block)'
  },
  {
    email: 'cafe.central@presidency.ac.in',
    password: 'CafeOwner@2026',
    name: 'Ramesh Gowda (Central Cafeteria Manager)',
    role: 'cafe_owner',
    assignedCafe: 'PU-CAFE-CENTRAL',
    outletName: 'Presidency Central Food Court'
  },
  {
    email: 'admin@presidency.ac.in',
    password: 'Admin@Presidency2026',
    name: 'Presidency Super Admin',
    role: 'super_admin',
    assignedCafe: null,
    outletName: 'All Campus Facilities'
  }
];

export const FALLBACK_CAFES = [
  {
    _id: 'cafe_hatti_kappi',
    id: 'cafe_hatti_kappi',
    name: 'Hatti Kappi',
    shortCode: 'PU-CAFE-D-BLOCK',
    code: 'PU-CAFE-D-BLOCK',
    description: 'Authentic traditional South Indian filter kaapi brewed with pure Mysore decoction, piping hot thatte idlis, crispy medu vadas, and fresh evening snacks located right adjacent to D Block pathway.',
    coordinates: { lat: 13.16912, lng: 77.53540 },
    floor: 0,
    operatingHours: '07:30 AM - 08:00 PM',
    cuisineTypes: ['Filter Coffee & Decoction', 'South Indian Tiffin', 'Traditional Snacks', 'Beverages'],
    rating: { average: 4.8, count: 124 },
    isOpen: true
  },
  {
    _id: 'cafe_central',
    id: 'cafe_central',
    name: 'Presidency Central Food Court',
    shortCode: 'PU-CAFE-CENTRAL',
    code: 'PU-CAFE-CENTRAL',
    description: 'Main multi-cuisine student dining hall featuring live breakfast counters, thali meals, chat center, and dessert station.',
    coordinates: { lat: 13.16980, lng: 77.53620 },
    floor: 0,
    operatingHours: '07:30 AM - 08:30 PM',
    cuisineTypes: ['South Indian', 'North Indian', 'Chinese', 'Beverages'],
    rating: { average: 4.6, count: 84 },
    isOpen: true
  },
  {
    _id: 'cafe_brew',
    id: 'cafe_brew',
    name: 'Campus Brew & Bakery (Nescafe Kiosk)',
    shortCode: 'PU-CAFE-BREW',
    code: 'PU-CAFE-BREW',
    description: 'Artisan coffees, cold brews, fresh pastries, grilled panini, and grab-and-go energy snacks right next to the Central Library.',
    coordinates: { lat: 13.17045, lng: 77.53580 },
    floor: 0,
    operatingHours: '08:30 AM - 07:00 PM',
    cuisineTypes: ['Coffee & Tea', 'Bakery', 'Sandwiches'],
    rating: { average: 4.8, count: 52 },
    isOpen: true
  },
  {
    _id: 'cafe_sports',
    id: 'cafe_sports',
    name: 'Sports Hub Juice Bar & Maggi Lounge',
    shortCode: 'PU-CAFE-SPORTS',
    code: 'PU-CAFE-SPORTS',
    description: 'Nutritious smoothies, cold-pressed juices, protein bowls, and signature hot snacks situated beside the outdoor basketball courts.',
    coordinates: { lat: 13.17010, lng: 77.53645 },
    floor: 0,
    operatingHours: '09:00 AM - 08:00 PM',
    cuisineTypes: ['Fresh Juices', 'Shakes', 'Quick Snacks'],
    rating: { average: 4.5, count: 38 },
    isOpen: true
  }
];

export const FALLBACK_HATTI_DETAILS = {
  cafe: FALLBACK_CAFES[0],
  menuItems: [
    { _id: 'item_hk_1', id: 'item_hk_1', name: 'Filter Kaapi (Degree Decoction Brew)', category: 'Filter Coffee & Hot Beverages', price: 25, isVegetarian: true, isChefSpecial: true, isAvailable: true, available: true, description: 'Authentic South Indian filter coffee brewed with pure Mysore chicory decoction in traditional brass dabarah.' },
    { _id: 'item_hk_2', id: 'item_hk_2', name: 'Heritage Mysore Strong Coffee', category: 'Filter Coffee & Hot Beverages', price: 30, isVegetarian: true, isChefSpecial: false, isAvailable: true, available: true, description: 'Dark roast plantation coffee decoction served piping hot with rich milk foam.' },
    { _id: 'item_hk_3', id: 'item_hk_3', name: 'Jaggery Filter Coffee (Bella Kaapi)', category: 'Filter Coffee & Hot Beverages', price: 30, isVegetarian: true, isChefSpecial: true, isAvailable: true, available: true, description: 'Naturally sweetened organic jaggery kaapi, aromatic and soothing.' },
    { _id: 'item_hk_4', id: 'item_hk_4', name: 'Ghee Podi Thatte Idli (2 Pcs)', category: 'South Indian Tiffin', price: 50, isVegetarian: true, isChefSpecial: true, isAvailable: true, available: true, description: 'Steaming hot soft thatte idlis generously drenched in pure desi ghee and spicy gunpowder podi.' },
    { _id: 'item_hk_5', id: 'item_hk_5', name: 'Crispy Medu Vada (2 Pcs with Chutney)', category: 'South Indian Tiffin', price: 40, isVegetarian: true, isChefSpecial: false, isAvailable: true, available: true, description: 'Golden crunchy lentil vadas freshly fried, served with fresh coconut chutney and spiced sambar.' },
    { _id: 'item_hk_6', id: 'item_hk_6', name: 'Maddur Vada (Traditional Karnataka Snack)', category: 'Regional Snacks', price: 25, isVegetarian: true, isChefSpecial: false, isAvailable: true, available: true, description: 'Crispy onion-semolina heritage tea snack from Maddur.' },
    { _id: 'item_hk_7', id: 'item_hk_7', name: 'Masala Bun Maska with Jam', category: 'Regional Snacks', price: 35, isVegetarian: true, isChefSpecial: false, isAvailable: true, available: true, description: 'Warm toasted sweet bun layered with creamy butter and mixed fruit jam.' },
    { _id: 'item_hk_8', id: 'item_hk_8', name: 'Chow Chow Bath (Khara & Kesari Bath)', category: 'South Indian Tiffin', price: 60, isVegetarian: true, isChefSpecial: false, isAvailable: true, available: true, description: 'Classic combo of spiced vegetable upma and melt-in-mouth saffron pineapple kesari.' },
    { _id: 'item_hk_9', id: 'item_hk_9', name: 'Cardamom & Ginger Masala Chai', category: 'Filter Coffee & Hot Beverages', price: 20, isVegetarian: true, isChefSpecial: false, isAvailable: true, available: true, description: 'Strong Assam CTC tea brewed with crushed fresh ginger and fragrant green cardamom.' },
    { _id: 'item_hk_10', id: 'item_hk_10', name: 'Cold Badam Milk (Chilled Glass)', category: 'Cold Beverages', price: 35, isVegetarian: true, isChefSpecial: false, isAvailable: true, available: true, description: 'Rich chilled saffron almond milk garnished with roasted pistachio slivers.' }
  ],
  regularMenu: [], // Populated below
  todayMenu: {
    breakfast: {
      available: true,
      items: [
        { name: 'Filter Kaapi (Degree Decoction Brew)', price: 25, isVegetarian: true },
        { name: 'Ghee Podi Thatte Idli (2 Pcs)', price: 50, isVegetarian: true },
        { name: 'Crispy Medu Vada (2 Pcs with Chutney)', price: 40, isVegetarian: true }
      ]
    },
    lunch: {
      available: true,
      items: [
        { name: 'Bisi Bele Bath with Boondi', price: 65, isVegetarian: true },
        { name: 'Curd Rice with Pomegranate & Tadka', price: 45, isVegetarian: true },
        { name: 'Special South Indian Mini Meal', price: 80, isVegetarian: true }
      ]
    },
    snacks: {
      available: true,
      items: [
        { name: 'Maddur Vada & Filter Coffee Combo', price: 45, isVegetarian: true },
        { name: 'Masala Bun Maska with Ginger Chai', price: 50, isVegetarian: true }
      ]
    },
    dinner: {
      available: false,
      items: []
    }
  },
  reviews: [
    {
      _id: 'rev_1',
      reviewerName: 'Priya Sharma (CSE 3rd Year)',
      rating: 5,
      comment: 'Best filter coffee on campus! The ghee podi thatte idli is soft, piping hot, and always fresh. Great place to recharge between lectures at D & E blocks.',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      verifiedDiner: true,
      ownerReply: 'Thank you Priya! We prepare fresh Mysore decoction every 30 minutes. Glad you enjoyed the thatte idlis.'
    },
    {
      _id: 'rev_2',
      reviewerName: 'Dr. Anand K. (Faculty of Engineering)',
      rating: 5,
      comment: 'Authentic South Indian flavor right next to D Block laboratories. Very quick service.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      verifiedDiner: true
    }
  ]
};
FALLBACK_HATTI_DETAILS.regularMenu = FALLBACK_HATTI_DETAILS.menuItems;

export const FALLBACK_CENTRAL_DETAILS = {
  cafe: FALLBACK_CAFES[1],
  menuItems: [
    { _id: 'item_cc_1', id: 'item_cc_1', name: 'South Indian Full Meals Thali', category: 'Lunch & Thali', price: 80, isVegetarian: true, isChefSpecial: true, isAvailable: true, available: true, description: 'Unlimited rice, sambar, rasam, kootu, palya, curd, papad, and payasam.' },
    { _id: 'item_cc_2', id: 'item_cc_2', name: 'Paneer Butter Masala with 3 Rotis', category: 'North Indian', price: 95, isVegetarian: true, isChefSpecial: false, isAvailable: true, available: true, description: 'Rich tomato cashew gravy served with fresh tawa rotis.' },
    { _id: 'item_cc_3', id: 'item_cc_3', name: 'Schezwan Veg Fried Rice', category: 'Chinese', price: 75, isVegetarian: true, isChefSpecial: false, isAvailable: true, available: true, description: 'Wok-tossed basmati rice with crunchy vegetables in spicy schezwan sauce.' },
    { _id: 'item_cc_4', id: 'item_cc_4', name: 'Masala Dosa with Chutney & Sambar', category: 'South Indian Tiffin', price: 50, isVegetarian: true, isChefSpecial: false, isAvailable: true, available: true, description: 'Crisp golden dosa folded with spiced potato masala.' }
  ],
  regularMenu: [],
  todayMenu: {
    lunch: {
      available: true,
      items: [
        { name: 'Special Executive Veg Thali', price: 90, isVegetarian: true },
        { name: 'Chole Bhature (2 Pcs)', price: 75, isVegetarian: true }
      ]
    }
  },
  reviews: []
};
FALLBACK_CENTRAL_DETAILS.regularMenu = FALLBACK_CENTRAL_DETAILS.menuItems;
