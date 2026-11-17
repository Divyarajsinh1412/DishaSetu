import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import connectDB from '../config/db.js';
import Campus from '../models/Campus.js';
import CampusFeature from '../models/CampusFeature.js';
import Location from '../models/Location.js';
import Building from '../models/Building.js';
import Route from '../models/Route.js';
import AdminUser from '../models/AdminUser.js';
import { hashPassword } from '../utils/auth.js';
import {
  VERIFIED_CAMPUS_DATA,
  getValidatedParkingPolygon,
  getWalkingAvenueCorridorPolygon
} from '../data/verifiedCoordinates.js';
import { PRESIDENCY_BUILDINGS_CATALOG } from '../data/presidencyCampusDataset.js';

export const seedDatabase = async () => {
  console.log('========================================================');
  console.log('   DISHASETU: Presidency University Database Seeder     ');
  console.log('========================================================\n');

  const conn = await connectDB();
  if (!conn) {
    console.error('[Error] Could not connect to database. Seeder aborted.');
    return false;
  }

  try {
    // 1. Seed or Update Campus document
    console.log('[1/6] Seeding Campus root record...');
    await Campus.findOneAndUpdate(
      { name: VERIFIED_CAMPUS_DATA.campus.name },
      {
        university: VERIFIED_CAMPUS_DATA.campus.university,
        tagline: VERIFIED_CAMPUS_DATA.campus.tagline,
        address: VERIFIED_CAMPUS_DATA.campus.address,
        defaultLocation: {
          name: VERIFIED_CAMPUS_DATA.campus.defaultLocation.name,
          coordinates: {
            lat: VERIFIED_CAMPUS_DATA.campus.defaultLocation.lat,
            lng: VERIFIED_CAMPUS_DATA.campus.defaultLocation.lng
          },
          zoom: VERIFIED_CAMPUS_DATA.campus.defaultLocation.zoom
        },
        mapSettings: {
          minZoom: 15,
          maxZoom: 22,
          bounds: VERIFIED_CAMPUS_DATA.campus.bounds
        },
        boundary: {
          type: 'Polygon',
          coordinates: [],
          status: VERIFIED_CAMPUS_DATA.campus.boundaryStatus
        }
      },
      { upsert: true, new: true }
    );
    console.log('  -> Campus root record configured.');

    // 2. Seed Verified Geographic Features
    console.log('[2/6] Seeding verified campus geographic features...');
    const features = [
      // Main Gate Span
      {
        featureId: 'feature_main_gate_span',
        name: 'Main Gate Entrance Span',
        category: 'gate_span',
        geometryType: 'LineString',
        coordinates: VERIFIED_CAMPUS_DATA.mainGate.spanEndpoints.map(p => [p.lat, p.lng]),
        style: {
          color: '#10b981',
          weight: 6,
          opacity: 1.0
        },
        metadata: {
          description: 'Official entrance span connecting West and East gate pillars.',
          spanPoints: VERIFIED_CAMPUS_DATA.mainGate.spanEndpoints
        },
        verified: true
      },

      // Walking Avenue Corridor Polygon
      {
        featureId: 'feature_walking_avenue_corridor',
        name: 'Main Walking Avenue Corridor',
        category: 'corridor',
        geometryType: 'Polygon',
        coordinates: getWalkingAvenueCorridorPolygon(),
        style: {
          color: '#3b82f6',
          fillColor: '#60a5fa',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.35
        },
        metadata: {
          description: 'Combined pedestrian avenue corridor extending from Main Gate into central campus.'
        },
        verified: true
      },

      // Walking Avenue Right Side LineString
      {
        featureId: 'feature_walking_avenue_right_side',
        name: 'Walking Avenue – Right Boundary',
        category: 'walkway',
        geometryType: 'LineString',
        coordinates: VERIFIED_CAMPUS_DATA.walkingAvenueRightSide.map(p => [p.lat, p.lng]),
        style: {
          color: '#2563eb',
          weight: 4,
          opacity: 0.9
        },
        metadata: {
          description: 'Surveyed right-side paved avenue border (10 ordered points).'
        },
        verified: true
      },

      // Walking Avenue Left Side LineString
      {
        featureId: 'feature_walking_avenue_left_side',
        name: 'Walking Avenue – Left Boundary',
        category: 'walkway',
        geometryType: 'LineString',
        coordinates: VERIFIED_CAMPUS_DATA.walkingAvenueLeftSide.map(p => [p.lat, p.lng]),
        style: {
          color: '#2563eb',
          weight: 4,
          opacity: 0.9
        },
        metadata: {
          description: 'Surveyed left-side paved avenue border (10 ordered points).'
        },
        verified: true
      },

      // Central Tree Divider LineString
      {
        featureId: 'feature_central_tree_divider',
        name: 'Central Landscaped Tree Divider',
        category: 'divider',
        geometryType: 'LineString',
        coordinates: [
          [VERIFIED_CAMPUS_DATA.centralTreeDivider.start.lat, VERIFIED_CAMPUS_DATA.centralTreeDivider.start.lng],
          [VERIFIED_CAMPUS_DATA.centralTreeDivider.end.lat,   VERIFIED_CAMPUS_DATA.centralTreeDivider.end.lng]
        ],
        style: {
          color: '#059669',
          weight: 5,
          opacity: 0.95,
          dashArray: '8, 6'
        },
        metadata: {
          description: 'Central landscaped tree median separating pedestrian traffic lanes.'
        },
        verified: true
      },

      // Campus Garden Area Polygon
      {
        featureId: 'feature_campus_garden_area',
        name: 'Presidency Campus Central Garden',
        category: 'garden',
        geometryType: 'Polygon',
        coordinates: VERIFIED_CAMPUS_DATA.campusGardenArea.map(p => [p.lat, p.lng]),
        style: {
          color: '#15803d',
          fillColor: '#22c55e',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.4
        },
        metadata: {
          description: 'Campus garden polygon preserved with 19 ordered boundary points without simplification.'
        },
        verified: true
      },

      // Garden Interior Ending Boundary LineString
      {
        featureId: 'feature_garden_interior_boundary',
        name: 'Garden Interior Ending Boundary',
        category: 'garden',
        geometryType: 'LineString',
        coordinates: VERIFIED_CAMPUS_DATA.gardenInteriorBoundary.map(p => [p.lat, p.lng]),
        style: {
          color: '#166534',
          weight: 3,
          opacity: 0.85,
          dashArray: '4, 4'
        },
        metadata: {
          description: 'Interior boundary line inside the south-west garden zone (8 ordered points).'
        },
        verified: true
      },

      // Two-Wheeler Parking Entry Span
      {
        featureId: 'feature_parking_entry_span',
        name: 'Two-Wheeler Parking Entry Span',
        category: 'gate_span',
        geometryType: 'LineString',
        coordinates: VERIFIED_CAMPUS_DATA.parkingEntry.spanEndpoints.map(p => [p.lat, p.lng]),
        style: {
          color: '#ea580c',
          weight: 6,
          opacity: 1.0
        },
        metadata: {
          description: 'Two-Wheeler parking entrance vehicular access span.'
        },
        verified: true
      },

      // Two-Wheeler Parking Area Polygon
      {
        featureId: 'feature_two_wheeler_parking_area',
        name: 'Two-Wheeler Student & Staff Parking',
        category: 'parking',
        geometryType: 'Polygon',
        coordinates: getValidatedParkingPolygon(),
        style: {
          color: '#c2410c',
          fillColor: '#f97316',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.35
        },
        metadata: {
          description: 'Paved two-wheeler parking lot with validated non-self-intersecting perimeter geometry.'
        },
        verified: true
      }
    ];

    for (const f of features) {
      // Map to GeoJSON coordinates [lng, lat]
      const geoCoordinates = f.geometryType === 'Polygon'
        ? [f.coordinates.map(([lat, lng]) => [lng, lat])]
        : f.coordinates.map(([lat, lng]) => [lng, lat]);

      await CampusFeature.findOneAndUpdate(
        { featureId: f.featureId },
        {
          ...f,
          geoJSON: {
            type: f.geometryType,
            coordinates: geoCoordinates
          }
        },
        { upsert: true, new: true }
      );
    }
    console.log(`  -> ${features.length} verified geographic features seeded.`);

    // 3. Seed Verified Locations / Points of Interest
    console.log('[3/6] Seeding verified campus locations (POIs)...');
    const locations = [
      {
        name: VERIFIED_CAMPUS_DATA.mainGate.name,
        shortCode: 'PU-GATE-MAIN',
        category: 'Gate',
        description: VERIFIED_CAMPUS_DATA.mainGate.description,
        coordinates: VERIFIED_CAMPUS_DATA.mainGate.center,
        geometry: {
          type: 'Point',
          coordinates: [VERIFIED_CAMPUS_DATA.mainGate.center.lng, VERIFIED_CAMPUS_DATA.mainGate.center.lat]
        },
        verified: true,
        status: 'published'
      },
      {
        name: VERIFIED_CAMPUS_DATA.fountain.name,
        shortCode: 'PU-FOUNTAIN-01',
        category: 'Landmark',
        description: VERIFIED_CAMPUS_DATA.fountain.description,
        coordinates: VERIFIED_CAMPUS_DATA.fountain.coordinates,
        geometry: {
          type: 'Point',
          coordinates: [VERIFIED_CAMPUS_DATA.fountain.coordinates.lng, VERIFIED_CAMPUS_DATA.fountain.coordinates.lat]
        },
        verified: true,
        status: 'published'
      },
      {
        name: VERIFIED_CAMPUS_DATA.parkingEntry.name,
        shortCode: 'PU-PARK-2W',
        category: 'Parking',
        description: VERIFIED_CAMPUS_DATA.parkingEntry.description,
        coordinates: VERIFIED_CAMPUS_DATA.parkingEntry.center,
        geometry: {
          type: 'Point',
          coordinates: [VERIFIED_CAMPUS_DATA.parkingEntry.center.lng, VERIFIED_CAMPUS_DATA.parkingEntry.center.lat]
        },
        verified: true,
        status: 'published'
      },
      {
        name: 'Presidency Campus Central Garden',
        shortCode: 'PU-GARDEN-01',
        category: 'Garden',
        description: 'Lush landscaped green garden along the avenue corridor.',
        coordinates: { lat: 13.17049286550813, lng: 77.53578670581075 },
        geometry: {
          type: 'Point',
          coordinates: [77.53578670581075, 13.17049286550813]
        },
        verified: true,
        status: 'published'
      }
    ];

    for (const loc of locations) {
      await Location.findOneAndUpdate(
        { shortCode: loc.shortCode },
        loc,
        { upsert: true, new: true }
      );
    }
    console.log(`  -> ${locations.length} verified locations seeded.`);

    // 4. Seed Verified Walking Route (Main Gate -> Central Fountain)
    console.log('[4/6] Seeding verified pedestrian walking route...');
    const mainAvenueRoute = {
      name: 'Main Gate to Central Fountain Walkway',
      routeId: 'route_main_gate_to_fountain',
      startLocation: {
        name: 'Presidency University – Main Gate',
        lat: VERIFIED_CAMPUS_DATA.mainGate.center.lat,
        lng: VERIFIED_CAMPUS_DATA.mainGate.center.lng
      },
      endLocation: {
        name: 'Campus Central Fountain',
        lat: VERIFIED_CAMPUS_DATA.fountain.coordinates.lat,
        lng: VERIFIED_CAMPUS_DATA.fountain.coordinates.lng
      },
      waypoints: [
        {
          order: 0,
          lat: 13.1717995,
          lng: 77.5361915,
          instruction: 'Start at Presidency University Main Gate.',
          landmark: 'Main Gate'
        },
        {
          order: 1,
          lat: 13.171686129333589,
          lng: 77.53619216327907,
          instruction: 'Proceed south along the main paved walking avenue.',
          landmark: 'Avenue Origin'
        },
        {
          order: 2,
          lat: 13.170820998276696,
          lng: 77.53596183842467,
          instruction: 'Continue straight past the central tree divider on your right.',
          landmark: 'Central Tree Divider'
        },
        {
          order: 3,
          lat: 13.169806615823875,
          lng: 77.53513129092394,
          instruction: 'Reach the end of the walking avenue near the garden pavilion.',
          landmark: 'Garden Pavilion'
        },
        {
          order: 4,
          lat: 13.169277162668132,
          lng: 77.53496327115832,
          instruction: 'Arrive at Campus Central Fountain on your right.',
          landmark: 'Central Fountain'
        }
      ],
      geometry: [
        [13.1717995, 77.5361915],
        [13.171686129333589, 77.53619216327907],
        [13.171407336133866, 77.53601916079396],
        [13.171064287934131, 77.53583336109162],
        [13.170563006125553, 77.53557296192078],
        [13.170114090822393, 77.53530991424002],
        [13.169806615823875, 77.53513129092394],
        [13.169461356647048, 77.53505],
        [13.169277162668132, 77.53496327115832]
      ],
      distanceMeters: 345,
      estimatedWalkingMinutes: 4.5,
      routeType: 'pedestrian',
      accessible: true,
      verified: true,
      status: 'published'
    };

    await Route.findOneAndUpdate(
      { routeId: mainAvenueRoute.routeId },
      mainAvenueRoute,
      { upsert: true, new: true }
    );
    console.log('  -> Verified walking route seeded.');

    // 5. Seed Presidency University Buildings Catalog
    console.log('[5/6] Seeding Presidency University buildings catalog...');
    for (const b of PRESIDENCY_BUILDINGS_CATALOG) {
      await Building.findOneAndUpdate(
        { shortCode: b.code },
        {
          name: b.name,
          shortCode: b.code,
          category: b.category,
          description: b.description,
          totalFloors: b.totalFloors,
          departments: b.departments,
          isVerified: b.isVerified,
          status: b.status
        },
        { upsert: true, new: true }
      );
    }
    console.log(`  -> ${PRESIDENCY_BUILDINGS_CATALOG.length} official buildings registered.`);

    // 6. Seed Super Admin User
    console.log('[6/6] Seeding Super Admin account...');
    const adminEmail = 'admin@presidency.ac.in';
    const existingAdmin = await AdminUser.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await AdminUser.create({
        name: 'Presidency Super Admin',
        email: adminEmail,
        passwordHash: hashPassword('Admin@Presidency2026'),
        role: 'super_admin',
        isActive: true
      });
      console.log(`  -> Super Admin created: ${adminEmail} (password: Admin@Presidency2026)`);
    } else {
      console.log(`  -> Super Admin already exists: ${adminEmail}`);
    }

    console.log('\n========================================================');
    console.log('   DATABASE SEEDING COMPLETED SUCCESSFULLY!             ');
    console.log('========================================================\n');
    return true;
  } catch (err) {
    console.error(`[Seeder Error] ${err.message}`, err);
    return false;
  }
};

// If run directly via CLI
if (process.argv[1] && process.argv[1].endsWith('seedDatabase.js')) {
  seedDatabase().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}
