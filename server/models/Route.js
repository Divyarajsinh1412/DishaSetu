import mongoose from 'mongoose';

const RouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  routeId: {
    type: String,
    unique: true,
    required: true
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
  waypoints: [{
    order: Number,
    lat: Number,
    lng: Number,
    instruction: String,
    landmark: String
  }],
  // Array of [lat, lng]
  geometry: {
    type: [[Number]],
    required: true
  },
  distanceMeters: {
    type: Number,
    required: true
  },
  estimatedWalkingMinutes: {
    type: Number,
    required: true
  },
  routeType: {
    type: String,
    enum: ['pedestrian', 'accessible', 'service'],
    default: 'pedestrian'
  },
  accessible: {
    type: Boolean,
    default: true
  },
  verified: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'pending'],
    default: 'published'
  }
}, { timestamps: true });

export default mongoose.models.Route || mongoose.model('Route', RouteSchema);
