import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { connectDB } from '../config/db.js';
import Cafe from '../models/Cafe.js';
import MenuItem from '../models/MenuItem.js';
import DailyMenu from '../models/DailyMenu.js';
import AdminUser from '../models/AdminUser.js';
import FacilityReview from '../models/FacilityReview.js';
import { hashPassword } from '../utils/auth.js';

async function seedCafes() {
  console.log('--- Seeding Presidency University Cafes & Menus ---');
  const conn = await connectDB();
  if (!conn || mongoose.connection.readyState !== 1) {
    console.error('[Seed Error] Could not establish connection to MongoDB Atlas. Ensure network access is available.');
    process.exit(1);
  }

  // 1. Create or Find Cafe Owner Accounts
  const cafeOwnerPasswordHash = await hashPassword('CafeOwner@2026');
  const centralOwner = await AdminUser.findOneAndUpdate(
    { email: 'cafe.central@presidency.ac.in' },
    {
      name: 'Ramesh Gowda (Central Cafeteria Manager)',
      email: 'cafe.central@presidency.ac.in',
      passwordHash: cafeOwnerPasswordHash,
      role: 'cafe_owner',
      isActive: true
    },
    { upsert: true, new: true }
  );

  const hattiKappiPasswordHash = await hashPassword('HattiKappi@2026');
  const hattiOwner = await AdminUser.findOneAndUpdate(
    { email: 'hattikappi.owner@presidency.ac.in' },
    {
      name: 'Venkatesh Rao (Hatti Kappi Franchise Manager)',
      email: 'hattikappi.owner@presidency.ac.in',
      passwordHash: hattiKappiPasswordHash,
      role: 'cafe_owner',
      isActive: true
    },
    { upsert: true, new: true }
  );
  console.log('  -> Cafe Owner Accounts:', centralOwner.email, '|', hattiOwner.email);

  // 2. Seed Official Campus Cafes (Including Hatti Kappi PU-CAFE-D-BLOCK)
  const cafesData = [
    {
      name: 'Hatti Kappi',
      shortCode: 'PU-CAFE-D-BLOCK',
      description: 'Authentic traditional South Indian filter kaapi brewed with pure Mysore decoction, piping hot thatte idlis, crispy medu vadas, and fresh evening snacks located right adjacent to D Block pathway.',
      coordinates: { lat: 13.16912, lng: 77.53540 },
      floor: 0,
      assignedOwner: hattiOwner._id,
      operatingHours: { open: '07:30 AM', close: '08:00 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
      cuisineTypes: ['Filter Coffee & Decoction', 'South Indian Tiffin', 'Traditional Snacks', 'Beverages'],
      rating: { average: 0, count: 0 }, // Dynamically calculated from MongoDB reviews
      isOpen: true
    },
    {
      name: 'Presidency Central Food Court',
      shortCode: 'PU-CAFE-CENTRAL',
      description: 'Main multi-cuisine student dining hall featuring live breakfast counters, thali meals, chat center, and dessert station.',
      coordinates: { lat: 13.16980, lng: 77.53620 },
      floor: 0,
      assignedOwner: centralOwner._id,
      operatingHours: { open: '07:30 AM', close: '08:30 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
      cuisineTypes: ['South Indian', 'North Indian', 'Chinese', 'Beverages'],
      rating: { average: 4.6, count: 84 },
      isOpen: true
    },
    {
      name: 'Campus Brew & Bakery (Nescafe Kiosk)',
      shortCode: 'PU-CAFE-BREW',
      description: 'Artisan coffees, cold brews, fresh pastries, grilled panini, and grab-and-go energy snacks right next to the Central Library.',
      coordinates: { lat: 13.17045, lng: 77.53580 },
      floor: 0,
      operatingHours: { open: '08:30 AM', close: '07:00 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      cuisineTypes: ['Coffee & Tea', 'Bakery', 'Sandwiches'],
      rating: { average: 4.8, count: 52 },
      isOpen: true
    },
    {
      name: 'Sports Hub Juice Bar & Maggi Lounge',
      shortCode: 'PU-CAFE-SPORTS',
      description: 'Nutritious smoothies, cold-pressed juices, protein bowls, and signature hot snacks situated beside the outdoor basketball courts.',
      coordinates: { lat: 13.17010, lng: 77.53645 },
      floor: 0,
      operatingHours: { open: '09:00 AM', close: '08:00 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
      cuisineTypes: ['Fresh Juices', 'Shakes', 'Quick Snacks'],
      rating: { average: 4.5, count: 38 },
      isOpen: true
    }
  ];

  const createdCafes = [];
  for (const cData of cafesData) {
    const cafe = await Cafe.findOneAndUpdate(
      { shortCode: cData.shortCode },
      cData,
      { upsert: true, new: true }
    );
    createdCafes.push(cafe);
    console.log(`  -> Cafe Seeded: ${cafe.name} (${cafe.shortCode})`);
  }

  const hattiKappiCafe = createdCafes.find(c => c.shortCode === 'PU-CAFE-D-BLOCK');
  const centralCafe = createdCafes.find(c => c.shortCode === 'PU-CAFE-CENTRAL');

  // Link owners to their respective cafes
  hattiOwner.assignedCafe = hattiKappiCafe._id;
  await hattiOwner.save();
  centralOwner.assignedCafe = centralCafe._id;
  await centralOwner.save();

  // 3. Seed Regular Menu Items for Hatti Kappi (PU-CAFE-D-BLOCK)
  const hattiItems = [
    { name: 'Filter Kaapi (Degree Decoction Brew)', category: 'Filter Coffee & Hot Beverages', price: 25, isVegetarian: true, isChefSpecial: true, description: 'Authentic South Indian filter coffee brewed with pure Mysore chicory decoction in traditional brass dabarah.' },
    { name: 'Heritage Mysore Strong Coffee', category: 'Filter Coffee & Hot Beverages', price: 30, isVegetarian: true, description: 'Dark roast plantation coffee decoction served piping hot with rich milk foam.' },
    { name: 'Jaggery Filter Coffee (Bella Kaapi)', category: 'Filter Coffee & Hot Beverages', price: 30, isVegetarian: true, isChefSpecial: true, description: 'Naturally sweetened organic jaggery kaapi, aromatic and soothing.' },
    { name: 'Ghee Podi Thatte Idli (2 Pcs)', category: 'South Indian Tiffin', price: 50, isVegetarian: true, isChefSpecial: true, description: 'Steaming hot soft thatte idlis generously drenched in pure desi ghee and spicy gunpowder podi.' },
    { name: 'Crispy Medu Vada (2 Pcs with Chutney)', category: 'South Indian Tiffin', price: 40, isVegetarian: true, description: 'Golden crunchy lentil vadas freshly fried, served with fresh coconut chutney and spiced sambar.' },
    { name: 'Maddur Vada (Traditional Karnataka Snack)', category: 'Regional Snacks', price: 25, isVegetarian: true, description: 'Crispy onion-semolina heritage tea snack from Maddur.' },
    { name: 'Masala Bun Maska with Jam', category: 'Regional Snacks', price: 35, isVegetarian: true, description: 'Warm toasted sweet bun layered with creamy butter and mixed fruit jam.' },
    { name: 'Chow Chow Bath (Khara Bath & Kesari Bath)', category: 'South Indian Tiffin', price: 60, isVegetarian: true, description: 'Classic combo of spiced vegetable upma and melt-in-mouth saffron pineapple kesari.' },
    { name: 'Cardamom & Ginger Masala Chai', category: 'Filter Coffee & Hot Beverages', price: 20, isVegetarian: true, description: 'Strong Assam CTC tea brewed with crushed fresh ginger and fragrant green cardamom.' },
    { name: 'Cold Badam Milk (Chilled Glass)', category: 'Cold Beverages', price: 35, isVegetarian: true, description: 'Rich chilled saffron almond milk garnished with roasted pistachio slivers.' }
  ];

  for (const item of hattiItems) {
    await MenuItem.findOneAndUpdate(
      { cafe: hattiKappiCafe._id, name: item.name },
      { ...item, cafe: hattiKappiCafe._id, isAvailable: true },
      { upsert: true, new: true }
    );
  }
  console.log(`  -> ${hattiItems.length} menu items registered for Hatti Kappi (PU-CAFE-D-BLOCK).`);

  // 4. Seed Today's Daily Menu for Hatti Kappi
  const todayStr = new Date().toISOString().split('T')[0];
  await DailyMenu.findOneAndUpdate(
    { cafe: hattiKappiCafe._id, date: todayStr },
    {
      cafe: hattiKappiCafe._id,
      date: todayStr,
      specialHighlights: [
        '☕ Signature Degree Kaapi with Double Mysore Decoction',
        '🔥 Morning Special: Ghee Podi Thatte Idli with Fresh Coconut Chutney',
        '⭐ Evening Special: Crunchy Maddur Vada & Hot Ginger Chai'
      ],
      items: [
        { name: 'Filter Kaapi (Degree Decoction Brew)', price: 25, session: 'Breakfast', isVegetarian: true, isAvailable: true },
        { name: 'Ghee Podi Thatte Idli (2 Pcs)', price: 50, session: 'Breakfast', isVegetarian: true, isAvailable: true },
        { name: 'Crispy Medu Vada (2 Pcs with Chutney)', price: 40, session: 'Breakfast', isVegetarian: true, isAvailable: true },
        { name: 'Heritage Mysore Strong Coffee', price: 30, session: 'Evening Snacks', isVegetarian: true, isAvailable: true },
        { name: 'Maddur Vada (Traditional Karnataka Snack)', price: 25, session: 'Evening Snacks', isVegetarian: true, isAvailable: true },
        { name: 'Cold Badam Milk (Chilled Glass)', price: 35, session: 'Cold Beverages', isVegetarian: true, isAvailable: true }
      ],
      isActive: true,
      notes: 'Freshly decocted batch every 15 minutes. Pure Karnataka heritage flavors.'
    },
    { upsert: true, new: true }
  );
  console.log(`  -> Today's Daily Menu (${todayStr}) seeded for Hatti Kappi.`);

  // 5. Seed Reviews for Hatti Kappi in MongoDB (Dynamically Calculated)
  const hattiReviews = [
    {
      cafeId: hattiKappiCafe._id,
      rating: 5,
      reviewerName: 'Darshan K. (B.Tech ECE, 3rd Yr)',
      comment: 'Best authentic filter kaapi in the whole campus! The brass davara tumbler aroma is incredible right before 9 AM lectures.',
      isApproved: true,
      reply: {
        text: 'Dhanyavadagalu Darshan! We take pride in authentic freshly roasted Mysore beans.',
        repliedAt: new Date(),
        repliedBy: 'Venkatesh Rao (Manager)'
      }
    },
    {
      cafeId: hattiKappiCafe._id,
      rating: 5,
      reviewerName: 'Prof. Meghana R. (SoE Faculty)',
      comment: 'Steaming hot ghee podi thatte idlis with red chutney are perfection. A staple for faculty morning breaks.',
      isApproved: true
    },
    {
      cafeId: hattiKappiCafe._id,
      rating: 4,
      reviewerName: 'Akash Nair (BBA, 2nd Yr)',
      comment: 'Great Mysore coffee decoction and crunchy medu vadas. Counter queue moves fast even during break rush.',
      isApproved: true
    },
    {
      cafeId: hattiKappiCafe._id,
      rating: 5,
      reviewerName: 'Sneha Patil (Research Scholar)',
      comment: 'Their jaggery coffee (bella kaapi) and bun maska combo is a must-try. Clean counter and polite staff.',
      isApproved: true
    }
  ];

  for (const r of hattiReviews) {
    const existing = await FacilityReview.findOne({ cafeId: hattiKappiCafe._id, reviewerName: r.reviewerName });
    if (!existing) {
      await FacilityReview.create(r);
    }
  }
  console.log(`  -> ${hattiReviews.length} verified reviews seeded for Hatti Kappi.`);

  // 6. Seed Regular Menu Items for Central Cafeteria
  const regularItems = [
    { name: 'Masala Dosa with Sambar & Chutney', category: 'Breakfast', price: 55, isVegetarian: true, isChefSpecial: true },
    { name: 'Idli Vada Combo (2 Idli, 1 Vada)', category: 'Breakfast', price: 45, isVegetarian: true },
    { name: 'Poori Bhaji (3 Pcs)', category: 'Breakfast', price: 50, isVegetarian: true },
    { name: 'South Indian Executive Thali Meals', category: 'Lunch', price: 90, isVegetarian: true, isChefSpecial: true },
    { name: 'North Indian Roti Sabzi Thali (Paneer Butter Masala)', category: 'Lunch', price: 110, isVegetarian: true },
    { name: 'Veg Hakka Noodles with Manchurian', category: 'Lunch', price: 85, isVegetarian: true },
    { name: 'Paneer Frankie Roll', category: 'Evening Snacks', price: 60, isVegetarian: true },
    { name: 'Samosa Chat (2 Pcs)', category: 'Evening Snacks', price: 40, isVegetarian: true },
    { name: 'Filter Coffee (Degree Coffee)', category: 'Beverages', price: 20, isVegetarian: true },
    { name: 'Masala Chai / Lemon Tea', category: 'Beverages', price: 15, isVegetarian: true },
    { name: 'Gulab Jamun (2 Pcs)', category: 'Desserts', price: 35, isVegetarian: true }
  ];

  for (const item of regularItems) {
    await MenuItem.findOneAndUpdate(
      { cafe: centralCafe._id, name: item.name },
      { ...item, cafe: centralCafe._id, isAvailable: true },
      { upsert: true, new: true }
    );
  }
  console.log(`  -> ${regularItems.length} regular menu items registered for Central Food Court.`);

  // 7. Seed Today's Daily Menu for Central Cafe
  await DailyMenu.findOneAndUpdate(
    { cafe: centralCafe._id, date: todayStr },
    {
      cafe: centralCafe._id,
      date: todayStr,
      specialHighlights: [
        '🔥 Chef Special: Mysore Masala Dosa with Ghee Roast',
        '⭐ Special Lunch: Hyderabadi Paneer Dum Biryani with Raita'
      ],
      items: [
        { name: 'Ghee Roast Mysore Masala Dosa', price: 65, session: 'Breakfast', isVegetarian: true, isAvailable: true },
        { name: 'Medu Vada Crispy (2 Pcs)', price: 40, session: 'Breakfast', isVegetarian: true, isAvailable: true },
        { name: 'Hyderabadi Paneer Dum Biryani Thali', price: 120, session: 'Lunch', isVegetarian: true, isAvailable: true },
        { name: 'Curd Rice with Pomegranate & Pickle', price: 50, session: 'Lunch', isVegetarian: true, isAvailable: true },
        { name: 'Crispy Corn Salt & Pepper', price: 60, session: 'Evening Snacks', isVegetarian: true, isAvailable: true },
        { name: 'Fresh Cold Badam Milk', price: 30, session: 'Beverages', isVegetarian: true, isAvailable: true }
      ],
      isActive: true,
      notes: 'Freshly prepared daily specials from 7:30 AM to 8:30 PM.'
    },
    { upsert: true, new: true }
  );
  console.log(`  -> Today's Daily Menu (${todayStr}) seeded for Central Food Court.`);

  // 8. Seed Central Cafe Reviews
  const centralReviews = [
    {
      cafeId: centralCafe._id,
      rating: 5,
      reviewerName: 'Ananya Sharma (B.Tech CSE, 3rd Yr)',
      comment: 'The Masala Dosa and filter coffee are unbeatable before 9 AM lectures! Quick service and clean seating.',
      isApproved: true,
      reply: {
        text: 'Thank you Ananya! We are proud to serve our students fresh breakfast every morning.',
        repliedAt: new Date(),
        repliedBy: 'Ramesh Gowda (Manager)'
      }
    },
    {
      cafeId: centralCafe._id,
      rating: 4,
      reviewerName: 'Kiran Kumar (Faculty, Civil Dept)',
      comment: 'Good executive thali meal options during peak lunch hours. The South Indian thali is consistent and healthy.',
      isApproved: true
    }
  ];

  for (const r of centralReviews) {
    const existing = await FacilityReview.findOne({ cafeId: centralCafe._id, reviewerName: r.reviewerName });
    if (!existing) {
      await FacilityReview.create(r);
    }
  }
  console.log(`  -> Verified user reviews and manager replies seeded.`);

  await mongoose.connection.close();
  console.log('--- Cafe Seeding Completed Successfully! ---');
}

seedCafes().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
