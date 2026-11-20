import IndoorLocation from '../models/IndoorLocation.js';
import Location from '../models/Location.js';
import Room from '../models/Room.js';
import { getDbStatus } from '../config/db.js';
import syncService from '../services/syncService.js';

// Base D Block Entrance coordinates: 13.171880, 77.536120
const D_BLOCK_BASE_LAT = 13.171880;
const D_BLOCK_BASE_LNG = 77.536120;

// Standard D Block seed classrooms & labs (Ground to 5th Floor)
const SEED_INDOOR_LOCATIONS = [
  // Ground Floor
  {
    name: 'Engineering Mechanics Lab',
    code: 'DG01',
    type: 'laboratory',
    building: 'D Block',
    buildingId: 'bld_d_block',
    floor: 'Ground Floor',
    floorNumber: 0,
    roomNumber: 'DG01',
    department: 'Mechanical Engineering',
    latitude: D_BLOCK_BASE_LAT + 0.00004,
    longitude: D_BLOCK_BASE_LNG - 0.00005,
    gpsAccuracy: 3.8,
    capturedAt: new Date(),
    capturedBy: 'System Administrator',
    verified: true,
    status: 'published',
    description: 'Applied mechanics test benches, universal testing machines, stress-strain analysis rigs.',
    accessibility: ['Wheelchair Accessible', 'Wide Entrance Doors', 'Ground Level Entry'],
    notes: 'Ground floor west quadrangle next to main entrance foyer.',
    mapCoordinates: { x: 140, y: 155 },
    nearestEntranceNode: 'node_d_block_entrance'
  },
  {
    name: 'Robotics & Automation Studio',
    code: 'DG02',
    type: 'laboratory',
    building: 'D Block',
    buildingId: 'bld_d_block',
    floor: 'Ground Floor',
    floorNumber: 0,
    roomNumber: 'DG02',
    department: 'Robotics & Automation',
    latitude: D_BLOCK_BASE_LAT + 0.00005,
    longitude: D_BLOCK_BASE_LNG + 0.00001,
    gpsAccuracy: 4.2,
    capturedAt: new Date(),
    capturedBy: 'System Administrator',
    verified: true,
    status: 'published',
    description: 'Autonomous articulated robotic arms, PLC test tracks, ROS simulation stations.',
    accessibility: ['Wheelchair Accessible', 'Tactile Paving'],
    notes: 'Adjacent to Engineering Mechanics Lab along north corridor.',
    mapCoordinates: { x: 440, y: 155 },
    nearestEntranceNode: 'node_d_block_entrance'
  },
  {
    name: 'Materials Testing Lab',
    code: 'DG03',
    type: 'laboratory',
    building: 'D Block',
    buildingId: 'bld_d_block',
    floor: 'Ground Floor',
    floorNumber: 0,
    roomNumber: 'DG03',
    department: 'Civil & Mechanical Engineering',
    latitude: D_BLOCK_BASE_LAT + 0.00006,
    longitude: D_BLOCK_BASE_LNG + 0.00007,
    gpsAccuracy: 4.5,
    capturedAt: new Date(),
    capturedBy: 'System Administrator',
    verified: true,
    status: 'published',
    description: 'Metallurgy microscopes, Brinell/Rockwell hardness testers, tensile fracture analyzers.',
    accessibility: ['Wheelchair Accessible'],
    notes: 'Northeast wing ground floor.',
    mapCoordinates: { x: 740, y: 155 },
    nearestEntranceNode: 'node_d_block_entrance'
  },
  {
    name: 'Fluid Mechanics Lab',
    code: 'DG04',
    type: 'laboratory',
    building: 'D Block',
    buildingId: 'bld_d_block',
    floor: 'Ground Floor',
    floorNumber: 0,
    roomNumber: 'DG04',
    department: 'Mechanical Engineering',
    latitude: D_BLOCK_BASE_LAT - 0.00003,
    longitude: D_BLOCK_BASE_LNG - 0.00005,
    gpsAccuracy: 3.5,
    capturedAt: new Date(),
    capturedBy: 'System Administrator',
    verified: true,
    status: 'published',
    description: 'Hydraulic flumes, Bernoulli test benches, pipe friction apparatus, Pelton turbine setup.',
    accessibility: ['Wheelchair Accessible', 'Emergency Eye Wash Station'],
    notes: 'Southwest corridor ground floor.',
    mapCoordinates: { x: 140, y: 385 },
    nearestEntranceNode: 'node_d_block_entrance'
  },
  {
    name: 'Faculty Consultation Room',
    code: 'DG05',
    type: 'faculty_office',
    building: 'D Block',
    buildingId: 'bld_d_block',
    floor: 'Ground Floor',
    floorNumber: 0,
    roomNumber: 'DG05',
    department: 'School of Engineering',
    latitude: D_BLOCK_BASE_LAT - 0.00004,
    longitude: D_BLOCK_BASE_LNG + 0.00001,
    gpsAccuracy: 4.8,
    capturedAt: new Date(),
    capturedBy: 'System Administrator',
    verified: true,
    status: 'published',
    description: 'Faculty advisory and academic counseling offices for engineering students.',
    accessibility: ['Wheelchair Accessible'],
    notes: 'South corridor center chamber.',
    mapCoordinates: { x: 440, y: 385 },
    nearestEntranceNode: 'node_d_block_entrance'
  },
  {
    name: 'Computer-Aided Design Studio',
    code: 'DG06',
    type: 'laboratory',
    building: 'D Block',
    buildingId: 'bld_d_block',
    floor: 'Ground Floor',
    floorNumber: 0,
    roomNumber: 'DG06',
    department: 'Design & Automation',
    latitude: D_BLOCK_BASE_LAT - 0.00005,
    longitude: D_BLOCK_BASE_LNG + 0.00007,
    gpsAccuracy: 4.0,
    capturedAt: new Date(),
    capturedBy: 'System Administrator',
    verified: true,
    status: 'published',
    description: 'High-performance GPU CAD workstations running SolidWorks, CATIA, and ANSYS.',
    accessibility: ['Wheelchair Accessible', 'Braille Signage'],
    notes: 'Southeast wing ground floor.',
    mapCoordinates: { x: 740, y: 385 },
    nearestEntranceNode: 'node_d_block_entrance'
  },
  // First Floor
  {
    name: 'Thermodynamics & Heat Transfer Lab',
    code: 'D101',
    type: 'laboratory',
    building: 'D Block',
    buildingId: 'bld_d_block',
    floor: 'First Floor',
    floorNumber: 1,
    roomNumber: 'D101',
    department: 'Mechanical Engineering',
    latitude: D_BLOCK_BASE_LAT + 0.00004,
    longitude: D_BLOCK_BASE_LNG - 0.00005,
    gpsAccuracy: 5.5,
    capturedAt: new Date(),
    capturedBy: 'System Administrator',
    verified: true,
    status: 'published',
    description: 'Thermal conductometry, refrigeration and air conditioning test rigs.',
    accessibility: ['Elevator Access from Ground Floor'],
    notes: 'First floor northwest wing.',
    mapCoordinates: { x: 140, y: 155 },
    nearestEntranceNode: 'node_d_block_elevator_1'
  },
  {
    name: 'Mechatronics Systems Lab',
    code: 'D102',
    type: 'laboratory',
    building: 'D Block',
    buildingId: 'bld_d_block',
    floor: 'First Floor',
    floorNumber: 1,
    roomNumber: 'D102',
    department: 'Robotics & Automation',
    latitude: D_BLOCK_BASE_LAT + 0.00005,
    longitude: D_BLOCK_BASE_LNG + 0.00001,
    gpsAccuracy: 5.1,
    capturedAt: new Date(),
    capturedBy: 'System Administrator',
    verified: true,
    status: 'published',
    description: 'Pneumatics, electro-hydraulics, sensor interfacing, and actuator rigs.',
    accessibility: ['Elevator Access'],
    notes: 'First floor north corridor center.',
    mapCoordinates: { x: 440, y: 155 },
    nearestEntranceNode: 'node_d_block_elevator_1'
  },
  {
    name: 'Smart Lecture Hall 106',
    code: 'D106',
    type: 'classroom',
    building: 'D Block',
    buildingId: 'bld_d_block',
    floor: 'First Floor',
    floorNumber: 1,
    roomNumber: 'D106',
    department: 'School of Engineering',
    latitude: D_BLOCK_BASE_LAT - 0.00005,
    longitude: D_BLOCK_BASE_LNG + 0.00007,
    gpsAccuracy: 6.2,
    capturedAt: new Date(),
    capturedBy: 'System Administrator',
    verified: true,
    status: 'published',
    description: 'Tiered interactive acoustic lecture hall with digital podium and lecture capture.',
    accessibility: ['Ramp Access', 'Elevator Access', 'Assistive Listening'],
    notes: 'First floor southeast hall.',
    mapCoordinates: { x: 740, y: 385 },
    nearestEntranceNode: 'node_d_block_stairs_1'
  },
  // Third Floor (Example for multi-floor navigation testing)
  {
    name: 'Advanced Manufacturing Center',
    code: 'D304',
    type: 'laboratory',
    building: 'D Block',
    buildingId: 'bld_d_block',
    floor: 'Third Floor',
    floorNumber: 3,
    roomNumber: 'D304',
    department: 'Mechanical Engineering',
    latitude: D_BLOCK_BASE_LAT - 0.00003,
    longitude: D_BLOCK_BASE_LNG - 0.00005,
    gpsAccuracy: 7.5,
    capturedAt: new Date(),
    capturedBy: 'System Administrator',
    verified: true,
    status: 'published',
    description: 'CNC milling machines, wire EDM, laser cutting, and additive manufacturing.',
    accessibility: ['Elevator Access', 'Accessible Restrooms Nearby'],
    notes: 'Third floor southwest wing.',
    mapCoordinates: { x: 140, y: 385 },
    nearestEntranceNode: 'node_d_block_elevator_3'
  }
];

// In-memory cache synced with MongoDB
let memoryIndoorLocations = [...SEED_INDOOR_LOCATIONS];

/**
 * Seed MongoDB collection on first boot if empty
 */
export const initIndoorLocationStore = async () => {
  try {
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) return;

    const count = await IndoorLocation.countDocuments();
    if (count === 0) {
      console.log('[IndoorLocationStore] Seeding verified indoor locations into MongoDB Atlas...');
      await IndoorLocation.insertMany(SEED_INDOOR_LOCATIONS);
      console.log(`[IndoorLocationStore] Seeded ${SEED_INDOOR_LOCATIONS.length} classrooms/labs successfully.`);
    }
  } catch (err) {
    console.warn('[IndoorLocationStore] MongoDB initialization notice:', err.message);
  }
};

/**
 * GET /api/indoor-locations
 * Public: Students & Visitors can list/search indoor classrooms & labs
 */
export const getIndoorLocations = async (req, res) => {
  try {
    const {
      building,
      floor,
      floorNumber,
      type,
      department,
      status,
      verified,
      search
    } = req.query;

    const dbStatus = getDbStatus();
    let locations = [];

    if (dbStatus.connected) {
      const filter = {};
      if (building) filter.building = new RegExp(`^${building}$`, 'i');
      if (floor) filter.floor = new RegExp(`^${floor}$`, 'i');
      if (floorNumber !== undefined) filter.floorNumber = parseInt(floorNumber, 10);
      if (type && type !== 'all') filter.type = type.toLowerCase();
      if (department && department !== 'all') filter.department = new RegExp(department, 'i');
      if (status && status !== 'all') filter.status = status.toLowerCase();
      if (verified !== undefined) filter.verified = verified === 'true';

      if (search && search.trim()) {
        const q = search.trim();
        filter.$or = [
          { name: new RegExp(q, 'i') },
          { code: new RegExp(q, 'i') },
          { roomNumber: new RegExp(q, 'i') },
          { department: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') }
        ];
      }

      locations = await IndoorLocation.find(filter).sort({ floorNumber: 1, roomNumber: 1 }).lean();
    }

    // Fallback to memory store if database returns empty or is disconnected
    if (!locations || locations.length === 0) {
      locations = [...memoryIndoorLocations];
      if (building) {
        locations = locations.filter(l => l.building.toLowerCase() === building.toLowerCase());
      }
      if (floor) {
        locations = locations.filter(l => l.floor.toLowerCase() === floor.toLowerCase());
      }
      if (floorNumber !== undefined) {
        locations = locations.filter(l => l.floorNumber === parseInt(floorNumber, 10));
      }
      if (type && type !== 'all') {
        locations = locations.filter(l => l.type === type.toLowerCase());
      }
      if (department && department !== 'all') {
        locations = locations.filter(l => l.department.toLowerCase().includes(department.toLowerCase()));
      }
      if (status && status !== 'all') {
        locations = locations.filter(l => l.status === status.toLowerCase());
      }
      if (verified !== undefined) {
        locations = locations.filter(l => l.verified === (verified === 'true'));
      }
      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        locations = locations.filter(l =>
          l.name.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q) ||
          l.roomNumber.toLowerCase().includes(q) ||
          l.department.toLowerCase().includes(q)
        );
      }
    }

    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('[IndoorLocationController] getIndoorLocations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve indoor locations',
      error: error.message
    });
  }
};

/**
 * GET /api/indoor-locations/:id
 */
export const getIndoorLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();
    let location = null;

    if (dbStatus.connected) {
      location = await IndoorLocation.findOne({
        $or: [
          { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
          { code: id.toUpperCase() },
          { roomNumber: id.toUpperCase() }
        ]
      }).lean();
    }

    if (!location) {
      location = memoryIndoorLocations.find(
        l => l._id === id || l.code === id.toUpperCase() || l.roomNumber === id.toUpperCase()
      );
    }

    if (!location) {
      return res.status(404).json({
        success: false,
        message: `Indoor location ${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/indoor-locations
 * Admin Protected: Create new classroom / lab location
 */
export const createIndoorLocation = async (req, res) => {
  try {
    const {
      name,
      code,
      type = 'classroom',
      building = 'D Block',
      buildingId = 'bld_d_block',
      floor = 'Ground Floor',
      floorNumber = 0,
      roomNumber,
      department = 'General',
      latitude,
      longitude,
      gpsAccuracy = null,
      description = '',
      accessibility = [],
      notes = '',
      status = 'captured',
      verified = false
    } = req.body;

    if (!name || !code || !roomNumber || latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: 'Name, code, roomNumber, latitude, and longitude are required.'
      });
    }

    const newLocationData = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type: type.toLowerCase(),
      building: building.trim(),
      buildingId: buildingId.trim(),
      floor: floor.trim(),
      floorNumber: Number(floorNumber) || 0,
      roomNumber: roomNumber.trim().toUpperCase(),
      department: department.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      gpsAccuracy: gpsAccuracy != null ? Number(gpsAccuracy) : null,
      capturedAt: new Date(),
      capturedBy: req.user?.username || 'admin',
      verified: Boolean(verified),
      status: status.toLowerCase(),
      description: description.trim(),
      accessibility: Array.isArray(accessibility) ? accessibility : [],
      notes: notes.trim(),
      mapCoordinates: req.body.mapCoordinates || { x: 0, y: 0 },
      nearestEntranceNode: req.body.nearestEntranceNode || 'node_d_block_entrance'
    };

    let saved = null;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      // Upsert by building + floor + roomNumber
      saved = await IndoorLocation.findOneAndUpdate(
        { building: newLocationData.building, floor: newLocationData.floor, roomNumber: newLocationData.roomNumber },
        { $set: newLocationData },
        { upsert: true, new: true }
      );

      // Also sync into general Location catalog for unified search
      await Location.findOneAndUpdate(
        { shortCode: newLocationData.code },
        {
          $set: {
            name: `${newLocationData.roomNumber} - ${newLocationData.name}`,
            shortCode: newLocationData.code,
            category: 'Classroom',
            description: `${newLocationData.building} · ${newLocationData.floor} · ${newLocationData.department}`,
            locationId: `loc_${newLocationData.code.toLowerCase()}`,
            coordinates: { lat: newLocationData.latitude, lng: newLocationData.longitude },
            entranceCoordinates: { lat: newLocationData.latitude, lng: newLocationData.longitude },
            gpsAccuracy: newLocationData.gpsAccuracy,
            verificationStatus: newLocationData.verified ? 'Verified' : 'GPS Captured'
          }
        },
        { upsert: true }
      );
    } else {
      newLocationData._id = `temp_${Date.now()}`;
      saved = newLocationData;
    }

    // Sync memory store
    const existingIdx = memoryIndoorLocations.findIndex(l => l.code === newLocationData.code);
    if (existingIdx !== -1) {
      memoryIndoorLocations[existingIdx] = saved || newLocationData;
    } else {
      memoryIndoorLocations.push(saved || newLocationData);
    }

    // Real-time synchronization broadcast
    syncService.broadcast('indoor_location:created', saved || newLocationData);

    return res.status(201).json({
      success: true,
      message: `Successfully created indoor location ${newLocationData.code}.`,
      data: saved || newLocationData
    });
  } catch (error) {
    console.error('[IndoorLocationController] createIndoorLocation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create indoor location',
      error: error.message
    });
  }
};

/**
 * POST /api/indoor-locations/capture
 * Direct Admin GPS Coordinate Capture Workflow
 */
export const captureIndoorGpsCoordinates = async (req, res) => {
  try {
    const {
      code,
      roomNumber,
      name,
      building = 'D Block',
      buildingId = 'bld_d_block',
      floor = 'Ground Floor',
      floorNumber = 0,
      department = 'General',
      type = 'classroom',
      latitude,
      longitude,
      gpsAccuracy,
      notes = '',
      accessibility = [],
      verified = false
    } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude GPS coordinates are required.'
      });
    }

    const finalCode = (code || roomNumber || `LOC_${Date.now()}`).trim().toUpperCase();
    const finalRoomNumber = (roomNumber || code || 'ROOM').trim().toUpperCase();
    const finalName = (name || `${finalRoomNumber} Room`).trim();

    const record = {
      name: finalName,
      code: finalCode,
      roomNumber: finalRoomNumber,
      type: type.toLowerCase(),
      building: building.trim(),
      buildingId: buildingId.trim(),
      floor: floor.trim(),
      floorNumber: Number(floorNumber) || 0,
      department: department.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      gpsAccuracy: gpsAccuracy != null ? Number(gpsAccuracy) : null,
      capturedAt: new Date(),
      capturedBy: req.user?.username || 'admin',
      status: verified ? 'verified' : 'captured',
      verified: Boolean(verified),
      notes: notes.trim(),
      accessibility: Array.isArray(accessibility) ? accessibility : []
    };

    let result = null;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      result = await IndoorLocation.findOneAndUpdate(
        { code: finalCode },
        { $set: record },
        { upsert: true, new: true }
      );
    } else {
      record._id = `temp_${Date.now()}`;
      result = record;
    }

    const idx = memoryIndoorLocations.findIndex(l => l.code === finalCode);
    if (idx !== -1) {
      memoryIndoorLocations[idx] = result || record;
    } else {
      memoryIndoorLocations.push(result || record);
    }

    syncService.broadcast('indoor_location:captured', result || record);

    return res.status(200).json({
      success: true,
      message: `Captured GPS coordinates for ${finalCode} with accuracy ±${gpsAccuracy || 'N/A'}m.`,
      data: result || record
    });
  } catch (error) {
    console.error('[IndoorLocationController] captureIndoorGpsCoordinates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to capture indoor GPS coordinates',
      error: error.message
    });
  }
};

/**
 * PUT /api/indoor-locations/:id
 * Admin Protected: Update coordinates, status, or details
 */
export const updateIndoorLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates._id;

    if (updates.latitude != null) updates.latitude = Number(updates.latitude);
    if (updates.longitude != null) updates.longitude = Number(updates.longitude);
    if (updates.gpsAccuracy != null) updates.gpsAccuracy = Number(updates.gpsAccuracy);
    if (updates.code) updates.code = updates.code.trim().toUpperCase();

    let updated = null;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      updated = await IndoorLocation.findOneAndUpdate(
        { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { code: id.toUpperCase() }] },
        { $set: updates },
        { new: true }
      );
    }

    const idx = memoryIndoorLocations.findIndex(l => l._id === id || l.code === id.toUpperCase());
    if (idx !== -1) {
      memoryIndoorLocations[idx] = { ...memoryIndoorLocations[idx], ...updates };
      if (!updated) updated = memoryIndoorLocations[idx];
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Indoor location not found'
      });
    }

    syncService.broadcast('indoor_location:updated', updated);

    return res.status(200).json({
      success: true,
      message: 'Indoor location updated successfully',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * DELETE /api/indoor-locations/:id
 * Admin Protected
 */
export const deleteIndoorLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      await IndoorLocation.findOneAndDelete({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { code: id.toUpperCase() }]
      });
    }

    const idx = memoryIndoorLocations.findIndex(l => l._id === id || l.code === id.toUpperCase());
    if (idx !== -1) {
      memoryIndoorLocations.splice(idx, 1);
    }

    syncService.broadcast('indoor_location:deleted', { id });

    return res.status(200).json({
      success: true,
      message: `Deleted indoor location ${id}.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
