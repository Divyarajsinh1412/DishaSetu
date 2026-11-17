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
  notes: String
}, { timestamps: true });

export default mongoose.models.WalkingPath || mongoose.model('WalkingPath', WalkingPathSchema);
