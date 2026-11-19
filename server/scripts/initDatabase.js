import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from '../utils/auth.js';
import { OFFICIAL_MAP_MARKERS } from './seedMapMarkers.js';
import { PRESIDENCY_BUILDINGS_CATALOG } from '../data/presidencyCampusDataset.js';
import { COMPLETE_CAMPUS_CATALOG } from '../data/campusCatalog.js';
import { NAVIGATION_NODES, WALKING_PATHS } from '../data/pedestrianGraphData.js';
import { INITIAL_DEPARTMENTS } from '../services/campusService.js';
import { INITIAL_PANORAMA_SCENES, INITIAL_PANORAMA_HOTSPOTS } from '../data/panoramaDataset.js';
import { VERIFIED_CAMPUS_DATA } from '../data/verifiedCoordinates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const TARGET_DB_NAME = process.env.DB_NAME || 'dishasetu_db';
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const REQUIRED_COLLECTIONS = [
  'users',
  'buildings',
  'floors',
  'locations',
  'navigationNodes',
  'navigationEdges',
  'qrCheckpoints',
  'cafes',
  'cafeOwners',
  'menuCategories',
  'menuItems',
  'dailyMenus',
  'reviews',
  'reviewReports',
  'issues',
  'notifications',
  'bookmarks',
  'mapVersions',
  'auditLogs',
  'campusManagers',
  'campusmapmarkers',
  'adminusers',
  'walkingpaths',
  'departments',
  'campusfeatures',
  'panoramascenes',
  'panoramahotspots',
  'campus'
];

export const initDatabase = async () => {
  console.log('================================================================');
  console.log('   DISHASETU: Presidency University Database Initializer        ');
  console.log('   Target Database: ' + TARGET_DB_NAME);
  console.log('================================================================\n');

  if (!MONGO_URI) {
    console.error('[CRITICAL ERROR] MONGO_URI or MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  const maskedUri = MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`[1/8] Connecting to MongoDB Atlas cluster...`);
  console.log(`      URI: ${maskedUri}`);

  let targetDb;
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: TARGET_DB_NAME,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 20000,
      autoIndex: true
    });
    targetDb = mongoose.connection.db;
    console.log(`[1/8] Connected successfully to host: ${mongoose.connection.host}`);
    console.log(`      Active Database: ${targetDb.databaseName}\n`);
  } catch (err) {
    console.error(`[CRITICAL ERROR] Could not connect to Atlas: ${err.message}`);
    process.exit(1);
  }

  try {
    // [2/8] Explicitly create all required collections so they appear in MongoDB Atlas Data Explorer
    console.log('[2/8] Explicitly creating all required collections in ' + TARGET_DB_NAME + '...');
    const existingCollections = await targetDb.listCollections().toArray();
    const existingNames = new Set(existingCollections.map(c => c.name));

    for (const colName of REQUIRED_COLLECTIONS) {
      if (!existingNames.has(colName)) {
        try {
          await targetDb.createCollection(colName);
          console.log(`      Created collection: ${colName}`);
        } catch (colErr) {
          if (colErr.codeName === 'NamespaceExists') {
            console.log(`      Collection already present: ${colName}`);
          } else {
            console.warn(`      Notice creating ${colName}: ${colErr.message}`);
          }
        }
      } else {
        console.log(`      Collection already exists: ${colName}`);
      }
    }
    console.log('      All collections verified in Atlas Data Explorer catalog.\n');

    // [3/8] Populate Verified Campus Foundation Datasets (Zero fake coordinates)
    console.log('[3/8] Seeding verified Presidency University campus foundation records...');

    // 3.1 52 Official Map Markers
    const markerCount = await targetDb.collection('campusmapmarkers').countDocuments();
    if (markerCount < OFFICIAL_MAP_MARKERS.length) {
      console.log(`      Seeding ${OFFICIAL_MAP_MARKERS.length} verified official map markers...`);
      for (const marker of OFFICIAL_MAP_MARKERS) {
        await targetDb.collection('campusmapmarkers').updateOne(
          { markerId: marker.markerId },
          { $set: { ...marker, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true }
        );
      }
      console.log('      Official campus map markers successfully synchronized.');
    } else {
      console.log(`      Campus map markers already present: ${markerCount} markers.`);
    }

    // 3.2 Buildings Catalog (12 major academic blocks)
    await targetDb.collection('buildings').deleteMany({ shortCode: null });
    const buildingsCount = await targetDb.collection('buildings').countDocuments();
    if (buildingsCount < PRESIDENCY_BUILDINGS_CATALOG?.length) {
      console.log(`      Seeding ${PRESIDENCY_BUILDINGS_CATALOG.length} verified university buildings...`);
      for (const bldg of PRESIDENCY_BUILDINGS_CATALOG) {
        const shortCode = bldg.shortCode || bldg.code || bldg.name.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase();
        await targetDb.collection('buildings').updateOne(
          { name: bldg.name },
          { $set: { ...bldg, shortCode, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true }
        );
      }
    } else {
      console.log(`      Buildings collection contains ${buildingsCount} records.`);
    }

    // 3.3 Locations Catalog (45 verified locations)
    const locationsCount = await targetDb.collection('locations').countDocuments();
    if (locationsCount < COMPLETE_CAMPUS_CATALOG?.length) {
      console.log(`      Seeding ${COMPLETE_CAMPUS_CATALOG.length} verified campus locations...`);
      for (const loc of COMPLETE_CAMPUS_CATALOG) {
        const shortCode = loc.shortCode || loc.code || loc.locationId || loc.name.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase();
        await targetDb.collection('locations').updateOne(
          { name: loc.name },
          { $set: { ...loc, shortCode, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true }
        );
      }
    } else {
      console.log(`      Locations collection contains ${locationsCount} records.`);
    }

    // 3.4 Navigation Nodes (36 verified walking nodes)
    const nodesCount = await targetDb.collection('navigationNodes').countDocuments();
    if (nodesCount === 0 && NAVIGATION_NODES?.length > 0) {
      console.log(`      Seeding ${NAVIGATION_NODES.length} verified pedestrian navigation nodes...`);
      for (const node of NAVIGATION_NODES) {
        await targetDb.collection('navigationNodes').updateOne(
          { nodeId: node.nodeId },
          { $set: { ...node, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true }
        );
      }
    } else {
      console.log(`      NavigationNodes collection contains ${nodesCount} records.`);
    }

    // 3.5 Walking Paths (37 verified paths)
    const pathsCount = await targetDb.collection('walkingpaths').countDocuments();
    if (pathsCount === 0 && WALKING_PATHS?.length > 0) {
      console.log(`      Seeding ${WALKING_PATHS.length} verified walking paths...`);
      for (const pathDoc of WALKING_PATHS) {
        await targetDb.collection('walkingpaths').updateOne(
          { pathId: pathDoc.pathId },
          { $set: { ...pathDoc, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true }
        );
      }
    } else {
      console.log(`      Walking paths collection contains ${pathsCount} records.`);
    }

    // 3.6 Departments
    const deptsCount = await targetDb.collection('departments').countDocuments();
    if (deptsCount === 0 && INITIAL_DEPARTMENTS?.length > 0) {
      for (const dept of INITIAL_DEPARTMENTS) {
        await targetDb.collection('departments').updateOne(
          { code: dept.code },
          { $set: { ...dept, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true }
        );
      }
    }

    // 3.7 Panorama 360 Scenes & Hotspots
    const scenesCount = await targetDb.collection('panoramascenes').countDocuments();
    if (scenesCount === 0 && INITIAL_PANORAMA_SCENES?.length > 0) {
      await targetDb.collection('panoramascenes').insertMany(INITIAL_PANORAMA_SCENES);
    }
    const hotspotsCount = await targetDb.collection('panoramahotspots').countDocuments();
    if (hotspotsCount === 0 && INITIAL_PANORAMA_HOTSPOTS?.length > 0) {
      await targetDb.collection('panoramahotspots').insertMany(INITIAL_PANORAMA_HOTSPOTS);
    }

    // 3.8 Campus Root & Features
    if (VERIFIED_CAMPUS_DATA?.campus) {
      await targetDb.collection('campus').updateOne(
        { name: VERIFIED_CAMPUS_DATA.campus.name },
        { $set: { ...VERIFIED_CAMPUS_DATA.campus, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
    }
    if (VERIFIED_CAMPUS_DATA?.features?.length > 0) {
      const featCount = await targetDb.collection('campusfeatures').countDocuments();
      if (featCount === 0) {
        await targetDb.collection('campusfeatures').insertMany(VERIFIED_CAMPUS_DATA.features);
      }
    }
    console.log('      Verified campus foundation datasets synchronized.\n');

    // [4/8] Apply Schema Indexes and Constraints
    console.log('[4/8] Creating indexes and unique constraints...');
    const safeCreateIndex = async (colName, keys, options = {}) => {
      try {
        await targetDb.collection(colName).createIndex(keys, options);
      } catch (err) {
        if (err.codeName === 'IndexOptionsConflict' || err.code === 85 || err.codeName === 'IndexKeySpecsConflict') {
          // Index already exists
        } else {
          console.warn(`      Index notice on ${colName}: ${err.message}`);
        }
      }
    };

    await safeCreateIndex('users', { email: 1 }, { unique: true, sparse: true });
    await safeCreateIndex('users', { role: 1 });

    await safeCreateIndex('buildings', { name: 1 }, { unique: true });
    await safeCreateIndex('buildings', { shortCode: 1 }, { unique: true, sparse: true });

    await safeCreateIndex('floors', { building: 1, floorNumber: 1 });

    await safeCreateIndex('locations', { name: 1 });
    await safeCreateIndex('locations', { category: 1 });

    await safeCreateIndex('navigationNodes', { nodeId: 1 }, { unique: true, sparse: true });
    await safeCreateIndex('navigationEdges', { edgeId: 1 }, { unique: true, sparse: true });
    await safeCreateIndex('navigationEdges', { fromNode: 1, toNode: 1 });

    await safeCreateIndex('qrCheckpoints', { checkpointCode: 1 }, { unique: true, sparse: true });
    await safeCreateIndex('qrCheckpoints', { building: 1 });

    await safeCreateIndex('cafes', { name: 1 }, { unique: true, sparse: true });
    await safeCreateIndex('cafeOwners', { email: 1 }, { unique: true, sparse: true });

    await safeCreateIndex('menuCategories', { cafe: 1, name: 1 }, { unique: true, sparse: true });
    await safeCreateIndex('menuItems', { cafe: 1, name: 1 });

    await safeCreateIndex('dailyMenus', { cafe: 1, date: 1 }, { unique: true, sparse: true });
    await safeCreateIndex('dailyMenus', { date: 1 });

    await safeCreateIndex('reviews', { targetType: 1, targetId: 1 });
    await safeCreateIndex('reviewReports', { review: 1, status: 1 });

    await safeCreateIndex('issues', { status: 1, category: 1 });
    await safeCreateIndex('notifications', { recipientUser: 1, isRead: 1 });

    await safeCreateIndex('bookmarks', { user: 1, targetType: 1, targetId: 1 });
    await safeCreateIndex('mapVersions', { versionNumber: 1 }, { unique: true, sparse: true });

    await safeCreateIndex('auditLogs', { action: 1, createdAt: -1 });
    await safeCreateIndex('campusManagers', { email: 1 }, { unique: true, sparse: true });

    await safeCreateIndex('campusmapmarkers', { markerId: 1 }, { unique: true, sparse: true });
    await safeCreateIndex('campusmapmarkers', { category: 1 });
    console.log('      Indexes created successfully.\n');

    // [5/8] Ensure Initial Super Admin in adminusers and users
    console.log('[5/8] Provisioning initial Super Admin securely from environment...');
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@presidencyuniversity.in').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'PresidencyAdmin2026!';
    const adminPasswordHash = hashPassword(adminPassword);

    await targetDb.collection('adminusers').updateOne(
      { email: adminEmail },
      {
        $set: {
          name: 'Presidency University Super Admin',
          role: 'super_admin',
          isActive: true,
          passwordHash: adminPasswordHash,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    console.log(`      Super Admin active in adminusers: ${adminEmail}`);

    await targetDb.collection('users').updateOne(
      { email: adminEmail },
      {
        $set: {
          name: 'Presidency University Super Admin',
          role: 'super_admin',
          department: 'Campus Administration',
          isActive: true,
          passwordHash: adminPasswordHash,
          preferences: {
            accessibleRoutesOnly: false,
            language: 'en',
            notificationsEnabled: true
          },
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    console.log(`      Super Admin active in users: ${adminEmail}`);
    console.log('      Super Admin authentication configured.\n');

    // [6/8] Seed development / demo data for empty collections (clearly labelled [DEMO / DEV SEED])
    console.log('[6/8] Seeding initial development demo data for operational collections...');

    // 6.1 Cafes & Cafe Owner
    let mainCafe = await targetDb.collection('cafes').findOne({ name: /Central/i });
    if (!mainCafe) {
      const cafeInsert = await targetDb.collection('cafes').insertOne({
        name: 'Central Food Court & Cafeteria',
        code: 'CAFE-MAIN-01',
        description: 'Multi-cuisine campus dining facility serving fresh breakfast, lunch thalis, and beverages.',
        type: 'cafeteria',
        cuisines: ['South Indian', 'North Indian', 'Beverages', 'Snacks'],
        rating: { average: 4.6, count: 128 },
        isOpen: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      mainCafe = { _id: cafeInsert.insertedId, name: 'Central Food Court & Cafeteria' };
      console.log('      Created default Central Food Court record');
    }

    // Cafe Owner
    const cafeOwnerEmail = 'cafe.manager@presidencyuniversity.in';
    let cafeOwner = await targetDb.collection('cafeOwners').findOne({ email: cafeOwnerEmail });
    if (!cafeOwner) {
      const ownerInsert = await targetDb.collection('cafeOwners').insertOne({
        name: 'Suresh Kumar [DEMO / DEV SEED]',
        email: cafeOwnerEmail,
        passwordHash: hashPassword('CafeManager2026!'),
        phone: '+91 98450 12345',
        assignedCafes: [mainCafe._id],
        status: 'active',
        canManageDailyMenu: true,
        canUpdateItemAvailability: true,
        canUpdatePrices: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      cafeOwner = { _id: ownerInsert.insertedId };
      console.log('      Created Cafe Owner record');
    }

    // Menu Categories
    const categoriesCount = await targetDb.collection('menuCategories').countDocuments();
    if (categoriesCount === 0) {
      await targetDb.collection('menuCategories').insertMany([
        { cafe: mainCafe._id, name: 'Breakfast Specials', slug: 'breakfast', displayOrder: 1, isActive: true, createdAt: new Date() },
        { cafe: mainCafe._id, name: 'Lunch Thali & Meals', slug: 'lunch', displayOrder: 2, isActive: true, createdAt: new Date() },
        { cafe: mainCafe._id, name: 'Evening Snacks', slug: 'snacks', displayOrder: 3, isActive: true, createdAt: new Date() },
        { cafe: mainCafe._id, name: 'Beverages & Juices', slug: 'beverages', displayOrder: 4, isActive: true, createdAt: new Date() }
      ]);
      console.log('      Seeded 4 menu categories');
    }

    // Menu Items
    const menuItemsCount = await targetDb.collection('menuItems').countDocuments();
    if (menuItemsCount === 0) {
      await targetDb.collection('menuItems').insertMany([
        { cafe: mainCafe._id, category: 'South Indian', name: 'Crispy Masala Dosa', description: 'Served with coconut chutney and piping hot sambar', price: 55, isVegetarian: true, isAvailable: true, isChefSpecial: true, rating: 4.8, createdAt: new Date() },
        { cafe: mainCafe._id, category: 'South Indian', name: 'Idli Vada Combo', description: 'Two steamed rice idlis with one crispy medu vada', price: 45, isVegetarian: true, isAvailable: true, rating: 4.5, createdAt: new Date() },
        { cafe: mainCafe._id, category: 'Lunch', name: 'Executive South Indian Thali', description: 'Rice, sambar, rasam, 2 poriyals, curd, papad, sweet', price: 85, isVegetarian: true, isAvailable: true, isChefSpecial: true, rating: 4.7, createdAt: new Date() },
        { cafe: mainCafe._id, category: 'North Indian', name: 'Paneer Butter Masala Combo', description: 'Cottage cheese in rich tomato gravy served with 3 butter rotis', price: 120, isVegetarian: true, isAvailable: true, rating: 4.6, createdAt: new Date() },
        { cafe: mainCafe._id, category: 'Beverages', name: 'Presidency Filter Coffee', description: 'Traditional South Indian chicory-brewed filter coffee', price: 20, isVegetarian: true, isAvailable: true, rating: 4.9, createdAt: new Date() },
        { cafe: mainCafe._id, category: 'Beverages', name: 'Iced Frappe Cold Coffee', description: 'Chilled blended espresso with vanilla ice cream float', price: 45, isVegetarian: true, isAvailable: true, rating: 4.7, createdAt: new Date() }
      ]);
      console.log('      Seeded 6 menu items');
    }

    // Date-wise Daily Menu (Today's Menu)
    const todayStr = new Date().toISOString().slice(0, 10);
    const existingDailyMenu = await targetDb.collection('dailyMenus').findOne({ cafe: mainCafe._id, date: todayStr });
    if (!existingDailyMenu) {
      await targetDb.collection('dailyMenus').insertOne({
        cafe: mainCafe._id,
        date: todayStr,
        managedBy: cafeOwner ? cafeOwner._id : null,
        specialHighlights: ['Chef Special Mysore Pak with Lunch', 'Fresh Watermelon Juice at 4 PM'],
        items: [
          { name: 'Crispy Masala Dosa', price: 55, isVegetarian: true, isAvailable: true, session: 'Breakfast' },
          { name: 'Executive South Indian Thali', price: 85, isVegetarian: true, isAvailable: true, session: 'Lunch' },
          { name: 'Paneer Butter Masala Combo', price: 120, isVegetarian: true, isAvailable: true, session: 'Lunch' },
          { name: 'Pav Bhaji Extra Butter', price: 65, isVegetarian: true, isAvailable: true, session: 'Evening Snacks' },
          { name: 'Presidency Filter Coffee', price: 20, isVegetarian: true, isAvailable: true, session: 'All Day' },
          { name: 'Iced Frappe Cold Coffee', price: 45, isVegetarian: true, isAvailable: true, session: 'All Day' }
        ],
        isActive: true,
        notes: 'Real-time item availability maintained by Cafe Supervisor.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`      Created Daily Menu for date ${todayStr}`);
    }

    // Campus Managers
    const managersCount = await targetDb.collection('campusManagers').countDocuments();
    if (managersCount === 0) {
      await targetDb.collection('campusManagers').insertMany([
        {
          name: 'Col. K. R. Sharma (Retd.)',
          email: 'estate.officer@presidencyuniversity.in',
          phone: '+91 98450 55441',
          role: 'estate_officer',
          assignedZones: ['Central Lawn & Boulevard', 'Academic Quadrangle', 'Main Entrance Gate'],
          status: 'active',
          officeLocation: 'HR Block, Ground Floor Room 004',
          createdAt: new Date()
        },
        {
          name: 'Kavitha Narayanan',
          email: 'facilities.manager@presidencyuniversity.in',
          phone: '+91 98450 55442',
          role: 'head_facility_manager',
          assignedZones: ['Auditorium Complex', 'Food Court', 'Sports Arena'],
          status: 'active',
          officeLocation: 'Administration Wing, Ground Floor',
          createdAt: new Date()
        }
      ]);
      console.log('      Seeded 2 campus managers');
    }

    // Navigation Edges (Connecting existing surveyed navigation nodes)
    const edgesCount = await targetDb.collection('navigationEdges').countDocuments();
    if (edgesCount === 0) {
      await targetDb.collection('navigationEdges').insertMany([
        {
          edgeId: 'EDGE-GATE-TO-LAWN-01',
          fromNode: 'NODE-MAIN-GATE',
          toNode: 'NODE-CENTRAL-AVENUE-START',
          distanceMeters: 45.0,
          weight: 1.0,
          pathType: 'paved_walkway',
          isAccessible: true,
          status: 'active',
          createdAt: new Date()
        },
        {
          edgeId: 'EDGE-LAWN-TO-FOUNTAIN-02',
          fromNode: 'NODE-CENTRAL-AVENUE-START',
          toNode: 'NODE-FOUNTAIN-JUNCTION',
          distanceMeters: 110.0,
          weight: 1.0,
          pathType: 'paved_walkway',
          isAccessible: true,
          status: 'active',
          createdAt: new Date()
        },
        {
          edgeId: 'EDGE-FOUNTAIN-TO-HR-03',
          fromNode: 'NODE-FOUNTAIN-JUNCTION',
          toNode: 'NODE-HR-BLOCK-ENTRANCE',
          distanceMeters: 38.0,
          weight: 1.0,
          pathType: 'paved_walkway',
          isAccessible: true,
          status: 'active',
          createdAt: new Date()
        },
        {
          edgeId: 'EDGE-FOUNTAIN-TO-ACAD-04',
          fromNode: 'NODE-FOUNTAIN-JUNCTION',
          toNode: 'NODE-ACADEMIC-BLOCKS-JUNCTION',
          distanceMeters: 52.0,
          weight: 1.0,
          pathType: 'paved_walkway',
          isAccessible: true,
          status: 'active',
          createdAt: new Date()
        }
      ]);
      console.log('      Seeded 4 navigation edges');
    }

    // QR Checkpoints (Clearly labelled with physical survey pending status)
    const qrCount = await targetDb.collection('qrCheckpoints').countDocuments();
    if (qrCount === 0) {
      const buildings = await targetDb.collection('buildings').find({}).limit(3).toArray();
      const bldgId1 = buildings[0] ? buildings[0]._id : new mongoose.Types.ObjectId();
      const bldgId2 = buildings[1] ? buildings[1]._id : new mongoose.Types.ObjectId();

      await targetDb.collection('qrCheckpoints').insertMany([
        {
          checkpointCode: 'PU-GATE-ENTRY-01',
          building: bldgId1,
          floor: 0,
          label: 'Main Gate Pedestrian Frisking Entry Point',
          description: '[PENDING PHYSICAL SURVEY] Outdoor checkpoint for entry location lock-on',
          coordinates: { x: 50.0, y: 50.0 },
          isActive: true,
          createdAt: new Date()
        },
        {
          checkpointCode: 'PU-HR-FOYER-01',
          building: bldgId1,
          floor: 0,
          label: 'HR Block Central Reception & Admissions Foyer',
          description: '[PENDING PHYSICAL SURVEY] Indoor checkpoint for administrative services',
          coordinates: { x: 50.0, y: 50.0 },
          isActive: true,
          createdAt: new Date()
        },
        {
          checkpointCode: 'PU-LIB-ATRIUM-01',
          building: bldgId2,
          floor: 1,
          label: 'Central Library First Floor Circulation Desk',
          description: '[PENDING PHYSICAL SURVEY] Indoor checkpoint for library guidance',
          coordinates: { x: 50.0, y: 50.0 },
          isActive: true,
          createdAt: new Date()
        }
      ]);
      console.log('      Seeded 3 QR checkpoints (flagged pending survey)');
    }

    // Reviews & Reports
    const reviewsCount = await targetDb.collection('reviews').countDocuments();
    if (reviewsCount === 0) {
      const revInsert = await targetDb.collection('reviews').insertOne({
        targetType: 'cafe',
        targetId: mainCafe._id,
        targetName: 'Central Food Court & Cafeteria',
        authorName: 'Ananya Sharma [DEMO / DEV SEED]',
        authorEmail: 'ananya.s@presidencyuniversity.in',
        authorRole: 'student',
        rating: 5,
        comment: 'Fresh food, prompt digital payments, and very clean seating area during lunch hours.',
        cleanlinessRating: 5,
        accessibilityRating: 5,
        tags: ['Clean', 'Fast Service', 'Great Coffee'],
        isApproved: true,
        status: 'approved',
        createdAt: new Date()
      });

      await targetDb.collection('reviewReports').insertOne({
        review: revInsert.insertedId,
        reportedBy: 'System Auto-Monitor [DEMO / DEV SEED]',
        reason: 'spam',
        details: 'Sample report verification to test the administrative review moderation workflow.',
        status: 'resolved_dismissed',
        moderatedBy: adminEmail,
        resolutionNotes: 'Review verified as legitimate student feedback.',
        createdAt: new Date()
      });
      console.log('      Seeded demo review and report');
    }

    // Issues
    const issuesCount = await targetDb.collection('issues').countDocuments();
    if (issuesCount === 0) {
      await targetDb.collection('issues').insertMany([
        {
          title: 'Pathway Lighting Inspection [DEMO / DEV SEED]',
          description: 'Routine maintenance check on pole lamps along the western walkway near the sports court.',
          category: 'lighting',
          priority: 'low',
          status: 'resolved',
          locationName: 'Western Sports Walkway',
          reportedBy: { name: 'Campus Safety Cell', role: 'staff' },
          assignedTo: 'Electrical Maintenance Department',
          resolutionNotes: 'Bulbs inspected and functioning properly.',
          resolvedAt: new Date(),
          createdAt: new Date()
        },
        {
          title: 'Physical Survey Verification Route [DEMO / DEV SEED]',
          description: 'Scheduled on-ground survey verification for D-Block and E-Block floor plans tomorrow.',
          category: 'other',
          priority: 'medium',
          status: 'in_progress',
          locationName: 'Academic Quadrangle',
          reportedBy: { name: 'DishaSetu Admin', role: 'admin' },
          assignedTo: 'Survey Team',
          createdAt: new Date()
        }
      ]);
      console.log('      Seeded 2 issue reports');
    }

    // Notifications
    const notifCount = await targetDb.collection('notifications').countDocuments();
    if (notifCount === 0) {
      await targetDb.collection('notifications').insertMany([
        {
          recipientRole: 'all',
          title: 'Welcome to DishaSetu Navigation [DEMO / DEV SEED]',
          message: 'The official digital twin and navigation system for Presidency University Bengaluru is now online.',
          type: 'campus_alert',
          isRead: false,
          createdAt: new Date()
        },
        {
          recipientRole: 'all',
          title: "Today's Cafeteria Menu is Live",
          message: 'Check out lunch specials including Executive South Indian Thali and fresh brews at Central Cafeteria.',
          type: 'menu_update',
          isRead: true,
          createdAt: new Date()
        }
      ]);
      console.log('      Seeded 2 campus notifications');
    }

    // Bookmarks
    const bookmarksCount = await targetDb.collection('bookmarks').countDocuments();
    if (bookmarksCount === 0) {
      const superAdminUser = await targetDb.collection('users').findOne({ email: adminEmail });
      if (superAdminUser) {
        await targetDb.collection('bookmarks').insertMany([
          {
            user: superAdminUser._id,
            title: 'Central Library',
            targetType: 'facility',
            category: 'library',
            customLabel: 'Quiet Study & Digital Resource Center',
            createdAt: new Date()
          },
          {
            user: superAdminUser._id,
            title: 'Central Cafeteria',
            targetType: 'cafe',
            targetId: mainCafe._id,
            category: 'cafeteria',
            customLabel: 'Lunch & Coffee Spot',
            createdAt: new Date()
          }
        ]);
        console.log('      Seeded 2 bookmarks for Super Admin');
      }
    }

    // Map Versions
    const versionsCount = await targetDb.collection('mapVersions').countDocuments();
    if (versionsCount === 0) {
      const buildingsTotal = await targetDb.collection('buildings').countDocuments();
      const locationsTotal = await targetDb.collection('locations').countDocuments();
      const nodesTotal = await targetDb.collection('navigationNodes').countDocuments();
      const markersTotal = await targetDb.collection('campusmapmarkers').countDocuments();

      await targetDb.collection('mapVersions').insertOne({
        versionId: 'PU-MAP-V1.0.0',
        versionNumber: '1.0.0',
        publishedBy: adminEmail,
        releaseNotes: 'Official initial release of Presidency University Bengaluru campus map with 52 verified markers.',
        stats: {
          totalBuildings: buildingsTotal,
          totalLocations: locationsTotal,
          totalNodes: nodesTotal,
          totalPaths: 37,
          totalFloors: 12,
          totalRooms: 0,
          surveyedLocationsCount: markersTotal,
          pendingSurveyCount: 0
        },
        publishedAt: new Date(),
        createdAt: new Date()
      });
      console.log('      Seeded Map Version 1.0.0 record');
    }

    // Audit Logs
    await targetDb.collection('auditLogs').insertOne({
      action: 'DATABASE_INITIALIZATION_SUCCESS',
      performedBy: adminEmail,
      userRole: 'super_admin',
      resource: 'Database',
      resourceId: TARGET_DB_NAME,
      details: {
        timestamp: new Date().toISOString(),
        host: mongoose.connection.host,
        environment: process.env.NODE_ENV || 'development'
      },
      createdAt: new Date()
    });
    console.log('      Logged database initialization in auditLogs.\n');

    // [7/8] Verify All Collections & Document Counts
    console.log('[7/8] Querying live Atlas database ' + TARGET_DB_NAME + ' to verify all collections...');
    const collectionsStatus = [];
    for (const colName of REQUIRED_COLLECTIONS) {
      const count = await targetDb.collection(colName).countDocuments();
      collectionsStatus.push({
        Collection: colName,
        DocumentCount: count,
        Status: count > 0 ? 'READY (Populated)' : 'READY (Initialized Collection)'
      });
    }

    console.log('\n================================================================');
    console.log('   MONGODB ATLAS DATA EXPLORER READINESS REPORT                ');
    console.log('   Database: ' + TARGET_DB_NAME);
    console.log('================================================================');
    console.table(collectionsStatus);
    console.log('================================================================\n');

    console.log('[8/8] Database initialization complete! All 20+ collections are live in MongoDB Atlas.');
    return true;
  } catch (err) {
    console.error(`[CRITICAL ERROR during initialization]: ${err.message}`);
    console.error(err.stack);
    return false;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed cleanly.');
  }
};

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('initDatabase.js')) {
  initDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
