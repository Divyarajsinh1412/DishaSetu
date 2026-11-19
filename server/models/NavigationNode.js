import mongoose from 'mongoose';

const NavigationNodeSchema = new mongoose.Schema({
  nodeId: {
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
  // Coordinate format throughout the application: Latitude, Longitude
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat] for GeoJSON 2dsphere
      required: true
    }
  },
  nodeType: {
    type: String,
    enum: [
      'gate',
      'junction',
      'building_entrance',
      'facility_entrance',
      'parking_access',
      'sports_access',
      'landmark'
    ],
    default: 'junction'
  },
  connectedPaths: [{
    type: String // pathId array
  }],
  associatedLocationId: {
    type: String
  },
  isAccessible: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

NavigationNodeSchema.index({ geometry: '2dsphere' });

export default mongoose.models.NavigationNode || mongoose.model('NavigationNode', NavigationNodeSchema, 'navigationNodes');
