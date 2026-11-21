import mongoose from 'mongoose';

const WalkingPathSchema = new mongoose.Schema({
  pathId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  geometry: {
    type: [[Number]], // Array of [lat, lng] coordinates
    required: true
  },
  startNode: {
    type: String,
    required: true,
    trim: true
  },
  endNode: {
    type: String,
    required: true,
    trim: true
  },
  distanceMeters: {
    type: Number,
    required: true
  },
  accessibility: {
    type: Boolean,
    default: true
  },
  hasStairs: {
    type: Boolean,
    default: false
  },
  hasRamp: {
    type: Boolean,
    default: true
  },
  pathType: {
    type: String,
    enum: [
      'main_avenue',
      'secondary_walkway',
      'building_access',
      'parking_access',
      'sports_access',
      'gate_access'
    ],
    default: 'secondary_walkway'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'restricted', 'maintenance'],
    default: 'active'
  },
  verificationStatus: {
    type: String,
    enum: ['Draft', 'Pending Verification', 'Verified', 'Published'],
    default: 'Verified'
  },
  surfaceType: {
    type: String,
    default: 'Paved Tiles'
  },
  sourceFileName: {
    type: String,
    default: 'manual'
  },
  source: {
    type: String,
    default: 'Manual Entry'
  },
  sourceType: {
    type: String,
    enum: ['kml_import', 'survey', 'manual', 'gis_catalog'],
    default: 'kml_import'
  },
  routeType: {
    type: String,
    default: 'Walking'
  },
  campus: {
    type: String,
    default: 'Presidency University Bengaluru'
  },
  startLocation: {
    name: String,
    lat: Number,
    lng: Number
  },
  endLocation: {
    name: String,
    lat: Number,
    lng: Number
  },
  estimatedWalkingMinutes: {
    type: Number,
    default: 1
  },
  pointCount: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  notes: String
}, { timestamps: true });

export default mongoose.models.WalkingPath || mongoose.model('WalkingPath', WalkingPathSchema);
