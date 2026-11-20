import mongoose from 'mongoose';

/**
 * IndoorLocation Schema for Presidency University Bengaluru
 * Sourced according to DishaSetu Admin GPS Coordinate Capture & Indoor Navigation Specification
 */
const IndoorLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: [
      'classroom',
      'laboratory',
      'faculty_office',
      'department_office',
      'corridor',
      'staircase',
      'lift',
      'entrance',
      'exit',
      'washroom',
      'library',
      'reception',
      'conference_room',
      'seminar_hall',
      'cafeteria',
      'medical_room',
      'other'
    ],
    default: 'classroom',
    lowercase: true
  },
  building: {
    type: String,
    required: true,
    default: 'D Block',
    trim: true
  },
  buildingId: {
    type: String,
    default: 'bld_d_block',
    trim: true
  },
  floor: {
    type: String,
    required: true,
    default: 'Ground Floor',
    trim: true
  },
  floorNumber: {
    type: Number,
    default: 0
  },
  roomNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  department: {
    type: String,
    trim: true,
    default: 'School of Engineering'
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  gpsAccuracy: {
    type: Number,
    default: null
  },
  capturedAt: {
    type: Date,
    default: Date.now
  },
  capturedBy: {
    type: String,
    default: 'admin'
  },
  verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'captured', 'needs_verification', 'verified', 'published'],
    default: 'captured',
    lowercase: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  accessibility: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    default: '',
    trim: true
  },
  mapCoordinates: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  nearestEntranceNode: {
    type: String,
    default: 'node_d_block_entrance'
  }
}, {
  timestamps: true
});

IndoorLocationSchema.index({ building: 1, floor: 1, roomNumber: 1 });
IndoorLocationSchema.index({ code: 1 });

export default mongoose.models.IndoorLocation || mongoose.model('IndoorLocation', IndoorLocationSchema);
