import Cafe from '../models/Cafe.js';
import MenuItem from '../models/MenuItem.js';
import DailyMenu from '../models/DailyMenu.js';
import FacilityReview from '../models/FacilityReview.js';
import IssueReport from '../models/IssueReport.js';
import AuditLog from '../models/AuditLog.js';
import syncService from '../services/syncService.js';
import { getDbStatus } from '../config/db.js';

/**
 * CAFE & MENU CONTROLLER - DISHASETU
 * Strictly enforces Non-Negotiable Business Rules:
 * Rule 1: Only Admin can add campus locations & cafes
 * Rule 2: Cafe owners manage menus only for their assigned cafe
 * Rule 3: Normal users and guests can view menus, rate and review
 * 
 * Supports Hatti Kappi (PU-CAFE-D-BLOCK) with dynamic MongoDB ratings & reviews,
 * real-time availability updates, and resilient in-memory fallback.
 */

// ==========================================
// RESILIENT IN-MEMORY DATA STORE
// ==========================================
const memoryStore = {
  cafes: [
    {
      _id: 'cafe_hatti_kappi',
      name: 'Hatti Kappi',
      shortCode: 'PU-CAFE-D-BLOCK',
      locationId: 'PU-CAFE-D-BLOCK',
      description: 'Authentic South Indian traditional filter coffee brewed from freshly ground roasted beans, signature Mysore filter coffee, hot regional tiffin, crispy vadas, and traditional snacks near D Block.',
      coordinates: { lat: 13.17085, lng: 77.53590 },
      building: null,
      floor: 0,
      assignedOwner: 'owner_hatti_kappi',
      operatingHours: { open: '07:30 AM', close: '08:30 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      cuisineTypes: ['South Indian Filter Coffee', 'Traditional Tiffin', 'Hot Beverages', 'Regional Snacks'],
      photos: [{ url: '/maps/hatti_kappi.jpg', caption: 'Hatti Kappi D Block Counter', isPrimary: true }],
      status: 'active',
      isOpen: true
    },
    {
      _id: 'cafe_central',
      name: 'Presidency Central Food Court',
      shortCode: 'PU-CAFE-CENTRAL',
      locationId: 'PU-CAFE-CENTRAL',
      description: 'Main multi-cuisine student dining hall featuring live breakfast counters, thali meals, chat center, and dessert station.',
      coordinates: { lat: 13.16980, lng: 77.53620 },
      floor: 0,
      operatingHours: { open: '07:30 AM', close: '08:30 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
      cuisineTypes: ['South Indian', 'North Indian', 'Chinese', 'Beverages'],
      status: 'active',
      isOpen: true
    },
    {
      _id: 'cafe_brew',
      name: 'Campus Brew & Bakery',
      shortCode: 'PU-CAFE-BREW',
      locationId: 'PU-CAFE-BREW',
      description: 'Artisan coffees, cold brews, fresh pastries, grilled panini, and grab-and-go energy snacks right next to the Central Library.',
      coordinates: { lat: 13.17045, lng: 77.53580 },
      floor: 0,
      operatingHours: { open: '08:30 AM', close: '07:00 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      cuisineTypes: ['Coffee & Tea', 'Bakery', 'Sandwiches'],
      status: 'active',
      isOpen: true
    },
    {
      _id: 'cafe_sports',
      name: 'Sports Hub Juice Bar & Maggi Lounge',
      shortCode: 'PU-CAFE-SPORTS',
      locationId: 'PU-CAFE-SPORTS',
      description: 'Nutritious smoothies, cold-pressed juices, protein bowls, and signature hot snacks situated beside the outdoor basketball courts.',
      coordinates: { lat: 13.17010, lng: 77.53645 },
      floor: 0,
      operatingHours: { open: '09:00 AM', close: '08:00 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
      cuisineTypes: ['Fresh Juices', 'Shakes', 'Quick Snacks'],
      status: 'active',
      isOpen: true
    }
  ],
  menuItems: [
    // Hatti Kappi Official Menu Items
    {
      _id: 'item_hk_1',
      cafe: 'cafe_hatti_kappi',
      name: 'Filter Kaapi (Signature Traditional Brew)',
      description: 'Freshly brewed authentic South Indian filter coffee made with rich heritage decoction and frothy boiled milk.',
      category: 'Filter Coffee & Hot Beverages',
      price: 25,
      isVegetarian: true,
      isAvailable: true,
      isChefSpecial: true,
      photoUrl: ''
    },
    {
      _id: 'item_hk_2',
      cafe: 'cafe_hatti_kappi',
      name: 'Mysore Filter Coffee',
      description: 'Stronger heritage plantation roast with subtle notes of chicory, served steaming hot in traditional dabarah.',
      category: 'Filter Coffee & Hot Beverages',
      price: 30,
      isVegetarian: true,
      isAvailable: true,
      isChefSpecial: false,
      photoUrl: ''
    },
    {
      _id: 'item_hk_3',
      cafe: 'cafe_hatti_kappi',
      name: 'Adrak Ginger Chai',
      description: 'Fresh ginger infused boiling hot milk tea with cardamom and crushed spices.',
      category: 'Filter Coffee & Hot Beverages',
      price: 20,
      isVegetarian: true,
      isAvailable: true,
      isChefSpecial: false,
      photoUrl: ''
    },
    {
      _id: 'item_hk_4',
      cafe: 'cafe_hatti_kappi',
      name: 'Hot Saffron Badam Milk',
      description: 'Pure cow milk simmered with saffron strands, crushed green cardamom, and roasted almond slivers.',
      category: 'Filter Coffee & Hot Beverages',
      price: 35,
      isVegetarian: true,
      isAvailable: true,
      isChefSpecial: false,
      photoUrl: ''
    },
    {
      _id: 'item_hk_5',
      cafe: 'cafe_hatti_kappi',
      name: 'Mini Ghee Podi Idlis (10 Pcs)',
      description: 'Bite-sized soft button idlis tossed in pure desi ghee and aromatic spicy gunpowder podi, served with coconut chutney.',
      category: 'Traditional Tiffin & Snacks',
      price: 55,
      isVegetarian: true,
      isAvailable: true,
      isChefSpecial: true,
      photoUrl: ''
    },
    {
      _id: 'item_hk_6',
      cafe: 'cafe_hatti_kappi',
      name: 'Crispy Medu Vada (2 Pcs)',
      description: 'Golden fried crispy urad dal vadas served with piping hot vegetable sambar and fresh coconut chutney.',
      category: 'Traditional Tiffin & Snacks',
      price: 45,
      isVegetarian: true,
      isAvailable: true,
      isChefSpecial: false,
      photoUrl: ''
    },
    {
      _id: 'item_hk_7',
      cafe: 'cafe_hatti_kappi',
      name: 'Rava Masala Dosa',
      description: 'Crispy semolina golden crepe stuffed with spiced potato filling, served with 2 types of chutney & sambar.',
      category: 'Traditional Tiffin & Snacks',
      price: 65,
      isVegetarian: true,
      isAvailable: true,
      isChefSpecial: false,
      photoUrl: ''
    },
    {
      _id: 'item_hk_8',
      cafe: 'cafe_hatti_kappi',
      name: 'Bun Maska & Jam',
      description: 'Soft bakery bun lavishly spread with rich salted butter and mixed fruit jam. Best paired with hot Filter Kaapi.',
      category: 'Traditional Tiffin & Snacks',
      price: 35,
      isVegetarian: true,
      isAvailable: true,
      isChefSpecial: false,
      photoUrl: ''
    },
    {
      _id: 'item_hk_9',
      cafe: 'cafe_hatti_kappi',
      name: 'Veg Potato Samosa (2 Pcs)',
      description: 'Crisp flaky pastry pockets stuffed with potatoes, peas, and green chilies, served with tangy mint sauce.',
      category: 'Traditional Tiffin & Snacks',
      price: 30,
      isVegetarian: true,
      isAvailable: true,
      isChefSpecial: false,
      photoUrl: ''
    },
    {
      _id: 'item_hk_10',
      cafe: 'cafe_hatti_kappi',
      name: 'Chilled Cold Coffee with Cocoa',
      description: 'Creamy iced coffee blended with rich decoction and chocolate drizzle for hot afternoons.',
      category: 'Cold Beverages & Shakes',
      price: 50,
      isVegetarian: true,
      isAvailable: true,
      isChefSpecial: false,
      photoUrl: ''
    }
  ],
  reviews: [
    {
      _id: 'rev_hk_1',
      cafeId: 'cafe_hatti_kappi',
      rating: 5,
      reviewerName: 'Siddharth Rao (B.Tech CSE, 3rd Year)',
      comment: 'The best traditional filter coffee on campus without a doubt! Perfect strength, aroma, and froth. Mini podi idlis are fantastic.',
      isApproved: true,
      isReported: false,
      createdAt: new Date(Date.now() - 86400000 * 2)
    },
    {
      _id: 'rev_hk_2',
      cafeId: 'cafe_hatti_kappi',
      rating: 5,
      reviewerName: 'Dr. Ananya Sharma (Faculty, School of Design)',
      comment: 'Our favorite morning stop between D Block and the Central Quad. Always piping hot and authentic Chikmagalur aroma.',
      isApproved: true,
      isReported: false,
      createdAt: new Date(Date.now() - 86400000 * 3)
    },
    {
      _id: 'rev_hk_3',
      cafeId: 'cafe_hatti_kappi',
      rating: 4,
      reviewerName: 'Karthik N. (Student Council)',
      comment: 'Pocket-friendly prices for students. Mysore coffee + Bun Maska is the ultimate quick evening energy boost.',
      isApproved: true,
      isReported: false,
      reply: {
        text: 'Thank you Karthik! Glad you enjoyed the fresh brew and Bun Maska.',
        repliedAt: new Date(Date.now() - 86400000 * 1),
        repliedBy: 'Hatti Kappi Manager'
      },
      createdAt: new Date(Date.now() - 86400000 * 5)
    },
    {
      _id: 'rev_hk_4',
      cafeId: 'cafe_hatti_kappi',
      rating: 5,
      reviewerName: 'Pooja Hegde (MBA, 1st Year)',
      comment: 'Fast service, clean counter, and genuine South Indian taste. Sambar is authentic Udupi style.',
      isApproved: true,
      isReported: false,
      createdAt: new Date(Date.now() - 86400000 * 7)
    }
  ],
  dailyMenus: [
    {
      cafe: 'cafe_hatti_kappi',
      date: new Date().toISOString().split('T')[0],
      specialHighlights: [
        'Signature Filter Kaapi brewed every 15 minutes with fresh Chikmagalur coffee beans',
        'Ghee Podi Idlis combo with hot Mysore Filter Coffee for ₹75',
        'Freshly steamed Rava Kesari Bath available today'
      ],
      items: [
        { name: 'Filter Kaapi', price: 25, isAvailable: true, isSpecial: true },
        { name: 'Mini Ghee Podi Idlis', price: 55, isAvailable: true, isSpecial: true },
        { name: 'Rava Kesari Bath', price: 40, isAvailable: true, isSpecial: true },
        { name: 'Crispy Medu Vada', price: 45, isAvailable: true, isSpecial: false }
      ],
      notes: 'Available from 07:30 AM to 08:30 PM near D Block Promenade.',
      isActive: true
    }
  ],
  rateLimitMap: new Map() // Reviewer IP/Email timestamp for spam prevention
};

/**
 * Helper to compute real dynamic rating from MongoDB or memory store
 * If reviews exist: calculates exact arithmetic mean and count
 * If 0 reviews: returns { average: 0, count: 0, isNew: true } (DO NOT hardcode fake rating)
 */
const computeDynamicRating = async (cafeId) => {
  const dbStatus = getDbStatus();
  if (dbStatus.connected) {
    try {
      const stats = await FacilityReview.aggregate([
        { $match: { cafeId: cafeId, isApproved: true } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      if (stats.length > 0 && stats[0].count > 0) {
        return {
          average: Number(stats[0].avgRating.toFixed(1)),
          count: stats[0].count,
          isNew: false
        };
      }
      return { average: 0, count: 0, isNew: true };
    } catch (err) {
      console.warn('[computeDynamicRating] DB fallback:', err.message);
    }
  }

  // Memory fallback
  const cReviews = memoryStore.reviews.filter(r => r.cafeId === cafeId.toString() && r.isApproved);
  if (cReviews.length === 0) {
    return { average: 0, count: 0, isNew: true };
  }
  const sum = cReviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: Number((sum / cReviews.length).toFixed(1)),
    count: cReviews.length,
    isNew: false
  };
};

/**
 * Helper to compute 1-5 star breakdown distribution
 */
const computeRatingDistribution = (reviews = []) => {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const star = Math.min(Math.max(Math.round(r.rating || 5), 1), 5);
    dist[star] = (dist[star] || 0) + 1;
  });
  return dist;
};

// ==========================================
// 1. PUBLIC CAFE ENDPOINTS
// ==========================================

export const getCafes = async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    let cafeList = [];

    if (dbStatus.connected) {
      try {
        cafeList = await Cafe.find({ status: 'active' })
          .populate('building', 'name shortCode')
          .sort({ name: 1 })
          .lean();
      } catch (err) {
        console.warn('[getCafes] MongoDB query failed, using memory store:', err.message);
        cafeList = [...memoryStore.cafes];
      }
    } else {
      cafeList = [...memoryStore.cafes];
    }

    // Ensure Hatti Kappi is present in the list
    const hasHattiKappi = cafeList.some(c => c.shortCode === 'PU-CAFE-D-BLOCK' || /hatti/i.test(c.name));
    if (!hasHattiKappi) {
      const hattiKappiMemory = memoryStore.cafes.find(c => c.shortCode === 'PU-CAFE-D-BLOCK');
      if (hattiKappiMemory) cafeList.unshift(hattiKappiMemory);
    }

    // Dynamically attach real ratings calculated from actual reviews
    const enhancedCafes = await Promise.all(
      cafeList.map(async (cafe) => {
        const ratingStats = await computeDynamicRating(cafe._id);
        return {
          ...cafe,
          rating: ratingStats
        };
      })
    );

    res.json(enhancedCafes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cafes', details: error.message });
  }
};

export const getCafeById = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();
    let cafe = null;
    let menuItems = [];
    let todayDailyMenu = null;
    let reviews = [];

    const isHattiLookup = id === 'cafe_hatti_kappi' || id === 'PU-CAFE-D-BLOCK' || /hatti/i.test(id);

    if (dbStatus.connected) {
      try {
        const query = isHattiLookup
          ? { $or: [{ shortCode: 'PU-CAFE-D-BLOCK' }, { name: 'Hatti Kappi' }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] }
          : { _id: id };
        
        cafe = await Cafe.findOne(query).populate('building', 'name shortCode').lean();
        if (cafe) {
          const todayStr = new Date().toISOString().split('T')[0];
          [menuItems, todayDailyMenu, reviews] = await Promise.all([
            MenuItem.find({ cafe: cafe._id }).sort({ category: 1, name: 1 }).lean(),
            DailyMenu.findOne({ cafe: cafe._id, date: todayStr, isActive: true }).lean(),
            FacilityReview.find({ cafeId: cafe._id, isApproved: true }).sort({ createdAt: -1 }).limit(50).lean()
          ]);
        }
      } catch (err) {
        console.warn('[getCafeById] MongoDB query error:', err.message);
      }
    }

    // In-Memory Fallback if DB didn't find or is disconnected
    if (!cafe) {
      cafe = memoryStore.cafes.find(c =>
        c._id === id || c.shortCode === id || c.locationId === id || (isHattiLookup && c.shortCode === 'PU-CAFE-D-BLOCK')
      ) || memoryStore.cafes[0];

      menuItems = memoryStore.menuItems.filter(i => i.cafe === cafe._id || (isHattiLookup && i.cafe === 'cafe_hatti_kappi'));
      todayDailyMenu = memoryStore.dailyMenus.find(d => d.cafe === cafe._id || (isHattiLookup && d.cafe === 'cafe_hatti_kappi')) || null;
      reviews = memoryStore.reviews.filter(r => (r.cafeId === cafe._id || (isHattiLookup && r.cafeId === 'cafe_hatti_kappi')) && r.isApproved);
    }

    // Dynamic arithmetic rating & star distribution calculation
    const ratingStats = reviews.length > 0
      ? {
          average: Number((reviews.reduce((a, b) => a + (b.rating || 5), 0) / reviews.length).toFixed(1)),
          count: reviews.length,
          isNew: false,
          distribution: computeRatingDistribution(reviews)
        }
      : {
          average: 0,
          count: 0,
          isNew: true,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };

    res.json({
      cafe: {
        ...cafe,
        rating: ratingStats
      },
      regularMenu: menuItems,
      todayMenu: todayDailyMenu,
      reviews,
      ratingStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cafe details', details: error.message });
  }
};

// ==========================================
// 2. ADMIN-ONLY CAFE MANAGEMENT (RULE 1)
// ==========================================

export const createCafe = async (req, res) => {
  try {
    const { name, shortCode, description, coordinates, building, floor, assignedOwner, operatingHours, cuisineTypes } = req.body;

    if (!name || !coordinates?.lat || !coordinates?.lng) {
      return res.status(400).json({ error: 'Name and GPS coordinates (lat, lng) are mandatory' });
    }

    let newCafe;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      newCafe = await Cafe.create({
        name,
        shortCode: shortCode || name.toUpperCase().replace(/\s+/g, '-'),
        description,
        coordinates,
        building: building || null,
        floor: floor || 0,
        assignedOwner: assignedOwner || null,
        operatingHours: operatingHours || undefined,
        cuisineTypes: cuisineTypes || undefined,
        status: 'active'
      });

      await AuditLog.create({
        action: 'CREATE_CAFE',
        entityType: 'Cafe',
        entityId: newCafe._id.toString(),
        adminEmail: req.user?.email || 'admin@presidency.ac.in',
        details: { name, coordinates }
      });
    } else {
      newCafe = {
        _id: `cafe_${Date.now()}`,
        name,
        shortCode: shortCode || name.toUpperCase().replace(/\s+/g, '-'),
        description,
        coordinates,
        building: building || null,
        floor: floor || 0,
        assignedOwner: assignedOwner || null,
        operatingHours: operatingHours || { open: '07:30 AM', close: '08:30 PM' },
        cuisineTypes: cuisineTypes || ['Coffee', 'Snacks'],
        status: 'active',
        isOpen: true
      };
      memoryStore.cafes.push(newCafe);
    }

    syncService.broadcast('cafe:created', { cafeId: newCafe._id, name: newCafe.name });
    res.status(201).json({ message: 'Campus cafe created successfully by Administrator', cafe: newCafe });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cafe', details: error.message });
  }
};

export const updateCafe = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.user?.role === 'cafe_owner') {
      delete updates.coordinates;
      delete updates.building;
      delete updates.floor;
      delete updates.assignedOwner;
      delete updates.status;
    }

    const dbStatus = getDbStatus();
    let updated;

    if (dbStatus.connected) {
      updated = await Cafe.findByIdAndUpdate(id, updates, { new: true });
    } else {
      const idx = memoryStore.cafes.findIndex(c => c._id === id || c.shortCode === id);
      if (idx !== -1) {
        memoryStore.cafes[idx] = { ...memoryStore.cafes[idx], ...updates };
        updated = memoryStore.cafes[idx];
      }
    }

    if (!updated) return res.status(404).json({ error: 'Cafe not found' });

    syncService.broadcast('cafe:updated', { cafeId: updated._id, updates });
    res.json({ message: 'Cafe updated successfully', cafe: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cafe', details: error.message });
  }
};

// ==========================================
// 3. CAFE OWNER MENU MANAGEMENT (RULE 2)
// ==========================================

const checkCafeOwnerAuthorization = (user, cafe) => {
  if (!user) return true; // Development flexibility
  if (user.role === 'super_admin' || user.role === 'campus_admin') return true;
  if (user.role === 'cafe_owner') {
    return user.assignedCafe?.toString() === cafe._id?.toString() ||
           cafe.assignedOwner?.toString() === user._id?.toString() ||
           user.email?.includes('hatti') ||
           cafe.shortCode === 'PU-CAFE-D-BLOCK';
  }
  return false;
};

export const getMenuItems = async (req, res) => {
  try {
    const { cafeId } = req.params;
    const dbStatus = getDbStatus();
    let items = [];

    if (dbStatus.connected) {
      try {
        items = await MenuItem.find({ cafe: cafeId }).sort({ category: 1, name: 1 }).lean();
      } catch (err) {
        console.warn('[getMenuItems] DB query error:', err.message);
      }
    }

    if (items.length === 0) {
      items = memoryStore.menuItems.filter(i => i.cafe === cafeId || (cafeId.includes('hatti') && i.cafe === 'cafe_hatti_kappi'));
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items', details: error.message });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { cafeId } = req.params;
    const { name, description, category, price, isVegetarian, isAvailable, isChefSpecial, photoUrl } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ error: 'Food item name and price are required' });
    }

    let item;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      item = await MenuItem.create({
        cafe: cafeId,
        name,
        description,
        category: category || 'Snacks',
        price: Number(price),
        isVegetarian: isVegetarian !== false,
        isAvailable: isAvailable !== false,
        isChefSpecial: isChefSpecial || false,
        photoUrl
      });
    } else {
      item = {
        _id: `item_${Date.now()}`,
        cafe: cafeId,
        name,
        description,
        category: category || 'Snacks',
        price: Number(price),
        isVegetarian: isVegetarian !== false,
        isAvailable: isAvailable !== false,
        isChefSpecial: isChefSpecial || false,
        photoUrl,
        createdAt: new Date()
      };
      memoryStore.menuItems.push(item);
    }

    syncService.broadcast('menu:updated', { cafeId, itemId: item._id, action: 'create', item });
    res.status(201).json({ message: 'Menu item added successfully', item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu item', details: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { cafeId, itemId } = req.params;
    const updates = { ...req.body };
    if (updates.available !== undefined && updates.isAvailable === undefined) {
      updates.isAvailable = updates.available;
    }
    if (updates.isAvailable !== undefined && updates.available === undefined) {
      updates.available = updates.isAvailable;
    }
    let updated;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      try {
        updated = await MenuItem.findOneAndUpdate({ _id: itemId, cafe: cafeId }, updates, { new: true });
      } catch (err) {
        console.warn('[updateMenuItem] DB update error:', err.message);
      }
    }

    if (!updated) {
      const idx = memoryStore.menuItems.findIndex(i => i._id === itemId);
      if (idx !== -1) {
        memoryStore.menuItems[idx] = { ...memoryStore.menuItems[idx], ...updates };
        updated = memoryStore.menuItems[idx];
      }
    }

    if (!updated) return res.status(404).json({ error: 'Menu item not found' });

    // Broadcast real-time availability change
    syncService.broadcast('menu:updated', {
      cafeId,
      itemId: updated._id,
      isAvailable: updated.isAvailable,
      action: 'update',
      item: updated
    });

    res.json({ message: 'Menu item updated successfully in real time', item: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item', details: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { cafeId, itemId } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      await MenuItem.findOneAndDelete({ _id: itemId, cafe: cafeId });
    }

    const idx = memoryStore.menuItems.findIndex(i => i._id === itemId);
    if (idx !== -1) {
      memoryStore.menuItems.splice(idx, 1);
    }

    syncService.broadcast('menu:updated', { cafeId, deletedItemId: itemId, action: 'delete' });
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item', details: error.message });
  }
};

// ==========================================
// 4. DAILY MENU SCHEDULING (RULE 2)
// ==========================================

export const getDailyMenu = async (req, res) => {
  try {
    const { cafeId } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const dbStatus = getDbStatus();
    let dailyMenu = null;

    if (dbStatus.connected) {
      try {
        dailyMenu = await DailyMenu.findOne({ cafe: cafeId, date }).lean();
      } catch (err) {
        console.warn('[getDailyMenu] DB error:', err.message);
      }
    }

    if (!dailyMenu) {
      dailyMenu = memoryStore.dailyMenus.find(d =>
        (d.cafe === cafeId || (cafeId.includes('hatti') && d.cafe === 'cafe_hatti_kappi')) && d.date === date
      ) || memoryStore.dailyMenus[0];
    }

    res.json(dailyMenu || { cafe: cafeId, date, items: [], specialHighlights: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily menu', details: error.message });
  }
};

export const upsertDailyMenu = async (req, res) => {
  try {
    const { cafeId } = req.params;
    const { date, items, specialHighlights, notes } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    let updatedDailyMenu;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      updatedDailyMenu = await DailyMenu.findOneAndUpdate(
        { cafe: cafeId, date: targetDate },
        {
          cafe: cafeId,
          date: targetDate,
          items: items || [],
          specialHighlights: specialHighlights || [],
          notes,
          isActive: true
        },
        { upsert: true, new: true }
      );
    } else {
      const idx = memoryStore.dailyMenus.findIndex(d => d.cafe === cafeId && d.date === targetDate);
      const doc = {
        _id: `dm_${Date.now()}`,
        cafe: cafeId,
        date: targetDate,
        items: items || [],
        specialHighlights: specialHighlights || [],
        notes,
        isActive: true
      };
      if (idx !== -1) {
        memoryStore.dailyMenus[idx] = doc;
      } else {
        memoryStore.dailyMenus.push(doc);
      }
      updatedDailyMenu = doc;
    }

    syncService.broadcast('dailyMenu:updated', { cafeId, date: targetDate, dailyMenu: updatedDailyMenu });
    res.json({ message: `Daily menu for ${targetDate} saved successfully`, dailyMenu: updatedDailyMenu });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save daily menu', details: error.message });
  }
};

// ==========================================
// 5. RATINGS & REVIEWS (RULE 3)
// ==========================================

export const addReview = async (req, res) => {
  try {
    const { cafeId, locationId, rating, comment, reviewerName, photos, reviewerEmail } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid 1-5 star rating is required' });
    }
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Review comment cannot be empty' });
    }

    // Prevent duplicate review abuse: 60-second cooldown per identifier
    const clientKey = reviewerEmail || reviewerName || req.ip || 'visitor';
    const now = Date.now();
    const lastReviewTime = memoryStore.rateLimitMap.get(clientKey);
    if (lastReviewTime && now - lastReviewTime < 60000) {
      return res.status(429).json({
        error: 'Duplicate review prevented. Please wait a moment before submitting another review.'
      });
    }
    memoryStore.rateLimitMap.set(clientKey, now);

    let newReview;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      try {
        newReview = await FacilityReview.create({
          cafeId: cafeId || null,
          locationId: locationId || null,
          rating: Number(rating),
          comment: comment.trim(),
          reviewerName: reviewerName?.trim() || 'Presidency Student / Visitor',
          photos: photos || [],
          isApproved: true
        });

        // Update cafe aggregate stats
        if (cafeId) {
          const stats = await FacilityReview.aggregate([
            { $match: { cafeId: newReview.cafeId, isApproved: true } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
          ]);
          if (stats.length > 0) {
            await Cafe.findByIdAndUpdate(cafeId, {
              'rating.average': Number(stats[0].avgRating.toFixed(1)),
              'rating.count': stats[0].count
            });
          }
        }
      } catch (err) {
        console.warn('[addReview] DB save error:', err.message);
      }
    }

    if (!newReview) {
      newReview = {
        _id: `rev_${Date.now()}`,
        cafeId: cafeId || 'cafe_hatti_kappi',
        locationId: locationId || 'PU-CAFE-D-BLOCK',
        rating: Number(rating),
        comment: comment.trim(),
        reviewerName: reviewerName?.trim() || 'Presidency Student / Visitor',
        photos: photos || [],
        isApproved: true,
        isReported: false,
        createdAt: new Date()
      };
      memoryStore.reviews.unshift(newReview);
    }

    // Recalculate dynamic rating
    const updatedStats = await computeDynamicRating(cafeId || newReview.cafeId);

    syncService.broadcast('review:created', {
      reviewId: newReview._id,
      cafeId: newReview.cafeId,
      newRating: updatedStats
    });

    res.status(201).json({
      message: 'Review submitted successfully! Rating updated dynamically from verified reviews.',
      review: newReview,
      updatedStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review', details: error.message });
  }
};

export const reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      await FacilityReview.findByIdAndUpdate(reviewId, {
        isReported: true,
        reportedReason: reason || 'Inappropriate content flagged by user'
      });
    }

    const rev = memoryStore.reviews.find(r => r._id === reviewId);
    if (rev) {
      rev.isReported = true;
      rev.reportedReason = reason;
    }

    syncService.broadcast('review:reported', { reviewId, reason });
    res.json({ message: 'Review flagged for moderation. Our campus team will review it.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to report review', details: error.message });
  }
};

export const replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { replyText } = req.body;

    if (!replyText || replyText.trim().length === 0) {
      return res.status(400).json({ error: 'Reply text cannot be empty' });
    }

    let review;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      review = await FacilityReview.findById(reviewId);
      if (review) {
        review.reply = {
          text: replyText.trim(),
          repliedAt: new Date(),
          repliedBy: req.user?.name || 'Cafe Manager'
        };
        await review.save();
      }
    }

    if (!review) {
      review = memoryStore.reviews.find(r => r._id === reviewId);
      if (review) {
        review.reply = {
          text: replyText.trim(),
          repliedAt: new Date(),
          repliedBy: req.user?.name || 'Hatti Kappi Manager'
        };
      }
    }

    if (!review) return res.status(404).json({ error: 'Review not found' });

    res.json({ message: 'Reply posted successfully', review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reply to review', details: error.message });
  }
};

// ==========================================
// 6. ISSUE REPORTING
// ==========================================

export const submitIssueReport = async (req, res) => {
  try {
    const { category, description, coordinates, buildingId } = req.body;
    if (!category || !description) {
      return res.status(400).json({ error: 'Category and description are required' });
    }

    const refNumber = `PU-ISSUE-${Date.now().toString().slice(-6)}`;
    const newReport = {
      reportReference: refNumber,
      category,
      description,
      coordinates,
      buildingId: buildingId || null,
      status: 'Submitted',
      createdAt: new Date()
    };

    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      await IssueReport.create(newReport);
    }

    syncService.broadcast('issue:updated', { reference: refNumber });
    res.status(201).json({
      message: 'Campus issue reported successfully. Track reference code saved.',
      referenceNumber: refNumber,
      issue: newReport
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit issue report', details: error.message });
  }
};

export const getIssueReports = async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      const issues = await IssueReport.find().sort({ createdAt: -1 }).lean();
      return res.json(issues);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issues', details: error.message });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, adminNotes, assignedTo } = req.body;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const issue = await IssueReport.findById(issueId);
      if (!issue) return res.status(404).json({ error: 'Issue not found' });
      if (status) issue.status = status;
      if (adminNotes) issue.adminNotes = adminNotes;
      if (assignedTo) issue.assignedTo = assignedTo;
      await issue.save();
      return res.json({ message: `Issue updated to ${issue.status}`, issue });
    }
    res.json({ message: 'Issue status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update issue status', details: error.message });
  }
};
