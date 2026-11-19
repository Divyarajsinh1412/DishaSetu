import mongoose from 'mongoose';

const EntranceSchema = new mongoose.Schema({
  entranceId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Main Entrance'
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  isAccessible: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  hasRamp: {
    type: Boolean,
    default: false
  },
  hasElevatorNearby: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['verified', 'pending_survey', 'closed'],
    default: 'verified'
  },
  notes: String
}, { _id: false });

const BuildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['Academic', 'Administrative', 'Facility', 'Hostel', 'Sports', 'Other'],
    default: 'Academic'
  },
  // Multiple entrances per building
  entrances: [EntranceSchema],
  // Legacy / primary single entrance accessor
  entranceCoordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  boundary: {
    type: [[Number]], // [[lat, lng], ...]
    default: []
  },
  totalFloors: {
    type: Number,
    default: 1
  },
  departments: [{
    type: String
  }],
  photos: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  assignedManagers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['published', 'pending_gps_survey', 'draft', 'pending_approval'],
    default: 'pending_gps_survey'
  }
}, { timestamps: true });

export default mongoose.models.Building || mongoose.model('Building', BuildingSchema, 'buildings');
